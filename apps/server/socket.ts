import dotenv from "dotenv";
dotenv.config();

import { parse as parseCookie } from "cookie";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { redisPub, redisSub } from "./redis";
import { prisma } from "./prisma";
import { z } from "zod";
import { addUser, removeUser, getAllUsers, OnlineUser } from "./presence";

type AuthenticatedUser = {
    id: string;
    name: string;
    isMember: boolean;
    role?: string;
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
    try {
        await Promise.all([
            redisPub.ping().catch(() => null), // Quick health check
            redisSub.ping().catch(() => null),
        ]);
        console.log("Redis clients ready");
    } catch (err) {
        console.error("Redis health check failed:", err);
    }

    const io = new Server<any, any, any, SocketData>(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000", "*", "https://techno-traders-lms.vercel.app"],
            methods: ["GET", "POST"],
            credentials: true,
        },
        // Important for scaling behind nginx / load balancer
        connectionStateRecovery: {
            maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
        },
        adapter: createAdapter(redisPub, redisSub),
    });

    // ────────────────────────────────────────────────
    // Global middleware – authentication
    // ────────────────────────────────────────────────
    io.use(async (socket, next) => {
        try {
            const rawCookie = socket.handshake.auth?.token || socket.handshake.headers.cookie || "";

            if (!rawCookie) {
                return next(new Error("No cookies"));
            }

            const sessionToken = rawCookie

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
                isMember: session.user.isMember,
            };

            console.log("Socket authenticated:", socket.data.user.name || socket.data.user.id);
            next();
        } catch (err) {
            console.error("Socket auth failed:", err);
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

        socket.join(GLOBAL_ROOM);

        const payload: OnlineUser = {
            userId: user.id,
            name: user.name,
            isMember: user.isMember,
        };

        addUser(payload);

        socket.emit("presence:sync", getAllUsers());

        if (user.isMember) {
            socket.broadcast.to(GLOBAL_ROOM).emit("private:user:online", {
                userId: user.id,
                name: user.name,
            });
        } else {
            socket.broadcast.to(GLOBAL_ROOM).emit("user:online", {
                userId: user.id,
                name: user.name,
            });
        }

        socket.on("typing:start", () => {
            // console.log(`User typing:start → ${userId}`);
            socket.broadcast.to(GLOBAL_ROOM).emit("typing:start", {
                userId: user.id,
                name: user.name,
            });
        });

        socket.on("typing:stop", () => {
            // console.log(`User typing:stop → ${userId}`);
            socket.broadcast.to(GLOBAL_ROOM).emit("typing:stop", {
                userId: user.id,
                name: user.name,
            });
        });

        socket.on("private:typing:start", () => {
            // console.log(`User private:typing:start → ${userId}`);
            socket.broadcast.to(GLOBAL_ROOM).emit("private:typing:start", {
                userId: user.id,
                name: user.name,
            });
        });

        socket.on("private:typing:stop", () => {
            // console.log(`User private:typing:stop → ${userId}`);
            socket.broadcast.to(GLOBAL_ROOM).emit("private:typing:stop", {
                userId: user.id,
                name: user.name,
            });
        });

        socket.on("user:new", (event: any) => {
            const sys = event.message; // 👈 THIS IS THE FIX

            if (!sys) {
                console.error("SYSTEM message missing payload");
                return;
            }

            const payload = {
                id: sys.id,
                type: "SYSTEM",
                message: sys.content,
                createdAt: sys.createdAt,
                user: user?.name || "System",
                role: "system",
                time: new Date(sys.createdAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                }),
                userId: sys.userId,
            };

            // console.log("Broadcasting system message:", payload);
            socket.broadcast.to(GLOBAL_ROOM).emit("message:system", payload);
        });

        socket.on("private:user:new", (event: any) => {
            const sys = event.message; // 👈 THIS IS THE FIX

            if (!sys) {
                console.error("SYSTEM message missing payload");
                return;
            }

            const payload = {
                id: sys.id,
                type: "SYSTEM",
                message: sys.content,
                createdAt: sys.createdAt,
                user: user?.name || "System",
                role: "system",
                time: new Date(sys.createdAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                }),
                userId: sys.userId,
            };

            // console.log("Broadcasting system message:", payload);
            socket.broadcast.to(GLOBAL_ROOM).emit("private:message:system", payload);
        });

        // ─── Rate limiting key per user ───
        const rateKey = `chat:rate:${userId}`;
        const privateRateKey = `chat:private:rate:${userId}`;

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

            // 2. Basic rate limit (using redisPub)
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
                    createdAt: message.createdAt.toISOString(),
                    time: message.createdAt.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                    }),
                };

                // 4. Broadcast via Socket.IO → Redis adapter handles propagation
                socket.broadcast.to(GLOBAL_ROOM).emit("typing:stop", {
                    userId: user.id,
                    name: user.name,
                });
                io.to(GLOBAL_ROOM).emit("message:new", payload);
            } catch (err) {
                console.error("Failed to process message:", err);
                socket.emit("message:error", { message: "Failed to send message" });
            }
        });

        socket.on("private:message:send", async (payload: unknown) => {
            console.log("Received private:message:send event with payload:", payload);
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

            // 2. Basic rate limit (using redisPub)
            try {
                const current = await redisPub.incr(privateRateKey);
                if (current === 1) {
                    await redisPub.expire(privateRateKey, RATE_LIMIT_WINDOW_SEC);
                }
                if (current > MESSAGE_RATE_LIMIT) {
                    socket.emit("private:message:error", { message: "Rate limit exceeded. Slow down." });
                    return;
                }

                // 3. Persist message **first**
                const message = await prisma.privateMessage.create({
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
                    createdAt: message.createdAt.toISOString(),
                    time: message.createdAt.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                    }),
                };

                // 4. Broadcast via Socket.IO → Redis adapter handles propagation
                socket.broadcast.to(GLOBAL_ROOM).emit("private:typing:stop", {
                    userId: user.id,
                    name: user.name,
                });
                io.to(GLOBAL_ROOM).emit("private:message:new", payload);
            } catch (err) {
                console.error("Failed to process private message:", err);
                socket.emit("private:message:error", { message: "Failed to send message" });
            }
        });

        // ─── Handle disconnect ───
        socket.on("disconnect", (reason) => {
            socket.broadcast.to(GLOBAL_ROOM).emit("user:offline", {
                userId,
            });
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
