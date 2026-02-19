"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = setupSocket;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cookie_1 = require("cookie");
const socket_io_1 = require("socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const redis_1 = require("./redis");
const prisma_1 = require("./prisma");
const zod_1 = require("zod");
// ────────────────────────────────────────────────
// Configuration – move to env / config file later
// ────────────────────────────────────────────────
const GLOBAL_ROOM = "global";
const MESSAGE_RATE_LIMIT = 5; // messages per 10 seconds per user
const RATE_LIMIT_WINDOW_SEC = 10;
// ────────────────────────────────────────────────
// Redis error handling (add this to your redis.ts or here)
// ────────────────────────────────────────────────
redis_1.redisPub.on("error", (err) => console.error("[Redis Pub] Error:", err));
redis_1.redisSub.on("error", (err) => console.error("[Redis Sub] Error:", err));
// Optional: Connection logging
redis_1.redisPub.on("connect", () => console.log("[Redis] Pub connected"));
redis_1.redisSub.on("connect", () => console.log("[Redis] Sub connected"));
async function setupSocket(httpServer) {
    try {
        await Promise.all([
            redis_1.redisPub.ping().catch(() => null), // Quick health check
            redis_1.redisSub.ping().catch(() => null),
        ]);
        console.log("Redis clients ready");
    }
    catch (err) {
        console.error("Redis health check failed:", err);
    }
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN?.split(",") || "*",
            methods: ["GET", "POST"],
        },
        // Important for scaling behind nginx / load balancer
        connectionStateRecovery: {
            maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
        },
        adapter: (0, redis_adapter_1.createAdapter)(redis_1.redisPub, redis_1.redisSub),
    });
    // ────────────────────────────────────────────────
    // Global middleware – authentication
    // ────────────────────────────────────────────────
    io.use(async (socket, next) => {
        try {
            const rawCookie = socket.handshake.headers.cookie;
            if (!rawCookie) {
                return next(new Error("No cookies"));
            }
            const cookies = (0, cookie_1.parse)(rawCookie);
            const sessionToken = cookies["better-auth.session_token"]?.substring(0, cookies["better-auth.session_token"].indexOf(".")) || null;
            if (!sessionToken) {
                return next(new Error("Not authenticated"));
            }
            const session = await prisma_1.prisma.session.findUnique({
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
            console.log("Socket authenticated:", socket.data.user.name || socket.data.user.id);
            next();
        }
        catch (err) {
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
        // Optional: broadcast user joined event
        // io.to(GLOBAL_ROOM).emit("user:joined", { id: userId, username: user.username });
        // ─── Rate limiting key per user ───
        const rateKey = `chat:rate:${userId}`;
        socket.on("message:send", async (payload) => {
            // 1. Validate input
            const schema = zod_1.z.object({
                content: zod_1.z.string().min(1).max(2000).trim(),
                clientMessageId: zod_1.z.string().optional(), // for optimistic updates
            });
            const result = schema.safeParse(payload);
            if (!result.success) {
                socket.emit("message:error", { message: "Invalid message", errors: result.error });
                return;
            }
            const { content, clientMessageId } = result.data;
            // 2. Basic rate limit (using redisPub)
            try {
                const current = await redis_1.redisPub.incr(rateKey);
                if (current === 1) {
                    await redis_1.redisPub.expire(rateKey, RATE_LIMIT_WINDOW_SEC);
                }
                if (current > MESSAGE_RATE_LIMIT) {
                    socket.emit("message:error", { message: "Rate limit exceeded. Slow down." });
                    return;
                }
                // 3. Persist message **first**
                const message = await prisma_1.prisma.message.create({
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
                io.to(GLOBAL_ROOM).emit("message:new", payload);
            }
            catch (err) {
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
            redis_1.redisPub.quit(),
            redis_1.redisSub.quit(),
        ]);
        process.exit(0);
    });
    console.log("Socket.IO server initialized with Redis (ioredis) adapter");
}
//# sourceMappingURL=socket.js.map