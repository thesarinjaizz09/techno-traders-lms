// socket.ts
import dotenv from "dotenv";

// Load environment variables from .env file (if present)
dotenv.config();

import { parse as parseCookie } from "cookie";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { redisPub, redisSub } from "./redis"; // Your ioredis clients (already separate instances)
import { prisma } from "./prisma";
import { z } from "zod"; // For validation (npm i zod if not installed)

type AuthenticatedUser = {
    id: string;
    username?: string;
    role?: string;
    [key: string]: unknown;
};

type SocketData = {
    user?: AuthenticatedUser;
};

// ────────────────────────────────────────────────
// Configuration – move to env / config file later
// ────────────────────────────────────────────────
const GLOBAL_ROOM = "global";
const MESSAGE_RATE_LIMIT = 5;          // messages per 10 seconds per user
const RATE_LIMIT_WINDOW_SEC = 10;

// ────────────────────────────────────────────────
// Redis error handling (add this to your redis.ts or here)
// ────────────────────────────────────────────────
redisPub.on("error", (err) => console.error("[Redis Pub] Error:", err));
redisSub.on("error", (err) => console.error("[Redis Sub] Error:", err));

// Optional: Connection logging
redisPub.on("connect", () => console.log("[Redis] Pub connected"));
redisSub.on("connect", () => console.log("[Redis] Sub connected"));

export async function setupSocket(httpServer: any) {
    // ioredis connects lazily, but ensure they're ready (optional in most cases)
    try {
        await Promise.all([
            redisPub.ping().catch(() => null), // Quick health check
            redisSub.ping().catch(() => null),
        ]);
        console.log("Redis clients ready");
    } catch (err) {
        console.error("Redis health check failed:", err);
        // In production, you might want to exit or fallback
    }

    const io = new Server<any, any, any, SocketData>(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN?.split(",") || "*",
            methods: ["GET", "POST"],
        },
        // Important for scaling behind nginx / load balancer
        connectionStateRecovery: {
            maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
        },
        // Use your ioredis clients with the adapter (replaces manual pub/sub)
        adapter: createAdapter(redisPub, redisSub),
    });

    // ────────────────────────────────────────────────
    // Global middleware – authentication
    // ────────────────────────────────────────────────
    io.use(async (socket, next) => {
        console.log("🔐 Socket auth middleware start");

        try {
            const rawCookie = socket.handshake.headers.cookie;

            if (!rawCookie) {
                console.log("❌ No cookies");
                return next(new Error("No cookies"));
            }

            const cookies = parseCookie(rawCookie);

            const sessionToken = cookies["better-auth.session_token"]?.substring(0, cookies["better-auth.session_token"].indexOf(".")) || null;

            if (!sessionToken) {
                return next(new Error("Not authenticated"));
            }

            const session = await prisma.session.findUnique({
                where: { token: sessionToken },
                include: { user: true },
            });


            if (!session || session.expiresAt < new Date()) {
                return next(new Error("Session expired"));
            }

            socket.data.user = {
                id: session.user.id,
                name: session.user.name,
                role: session.user.role,
            };

            console.log("✅ Socket authenticated:", socket.data.user.name || socket.data.user.id);
            next();
        } catch (err) {
            console.error("🔥 Socket auth failed:", err);
            next(new Error("Authentication failed"));
        }
    });

    // ────────────────────────────────────────────────
    // Connection handler
    // ────────────────────────────────────────────────
    io.on("connection", (socket) => {
        const user = socket.data.user;
        if (!user) {
            socket.disconnect(true);
            return;
        }

        const userId = user.id;
        console.log(`User connected → ${userId} (${socket.id})`);

        // Join global room
        socket.join(GLOBAL_ROOM);

        // Optional: broadcast user joined (with spam control in prod)
        // io.to(GLOBAL_ROOM).emit("user:joined", { id: userId, username: user.username });

        // ─── Rate limiting key per user ───
        const rateKey = `chat:rate:${userId}`;

        socket.on("message:send", async (payload: unknown) => {
            // 1. Validate input
            const schema = z.object({
                content: z.string().min(1).max(2000).trim(),
                clientMessageId: z.string().optional(), // for optimistic updates
            });

            const result = schema.safeParse(payload);
            if (!result.success) {
                socket.emit("message:error", { message: "Invalid message", errors: result.error });
                return;
            }

            const { content, clientMessageId } = result.data;

            // 2. Basic rate limit (using your redisPub)
            try {
                const current = await redisPub.incr(rateKey);
                if (current === 1) {
                    await redisPub.expire(rateKey, RATE_LIMIT_WINDOW_SEC);
                }
                if (current > MESSAGE_RATE_LIMIT) {
                    socket.emit("message:error", { message: "Rate limit exceeded. Slow down." });
                    return;
                }

                // 3. Persist message **first**
                const message = await prisma.message.create({
                    data: {
                        content,
                        userId: user.id,
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                });

                const payload = {
                    id: message.id,
                    userId: message.user.id,
                    clientMessageId, // echo back for optimistic update correlation
                    user: message.user.name,
                    role: "member", // client decides "you"
                    message: message.content,
                    time: message.createdAt.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                    }),
                };

                // 4. Broadcast via Socket.IO → Redis adapter handles propagation
                io.to(GLOBAL_ROOM).emit("message:new", payload);
                console.log(`Message sent by ${userId}: ${content}`);

            } catch (err) {
                console.error("Failed to process message:", err);
                socket.emit("message:error", { message: "Failed to send message" });
            }
        });

        // ─── Handle disconnect ───
        socket.on("disconnect", (reason) => {
            console.log(`User disconnected → ${userId} (${reason})`);
        });
    });

    // Graceful shutdown (important in containers / PM2 / k8s)
    process.on("SIGTERM", async () => {
        console.log("SIGTERM received – closing socket & redis...");
        io.close();
        await Promise.allSettled([
            redisPub.quit(),
            redisSub.quit(),
        ]);
        process.exit(0);
    });

    console.log("Socket.IO server initialized with Redis (ioredis) adapter");
}
