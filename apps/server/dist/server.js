"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const socket_1 = require("./socket");
const logger_1 = __importDefault(require("./logger"));
const prisma_1 = require("./prisma");
const redis_1 = require("./redis");
const prisma_2 = require("./prisma");
// ────────────────────────────────────────────────
// Configuration (pull from env for prod)
// ────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || "4000", 10);
const HOST = process.env.HOST || "0.0.0.0";
// ────────────────────────────────────────────────
// Fastify instance with production defaults
// ────────────────────────────────────────────────
const app = (0, fastify_1.default)({
    logger: false,
    disableRequestLogging: true
});
// ────────────────────────────────────────────────
// Register plugins & routes
// ────────────────────────────────────────────────
async function registerPlugins() {
    await app.register(cors_1.default, {
        origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:3000",
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    });
    // await app.register(messagesRoutes, { prefix: "/api" });
}
// ────────────────────────────────────────────────
// Startup sequence
// ────────────────────────────────────────────────
async function startServer() {
    try {
        logger_1.default.info("Starting server bootstrap...");
        // 1. Warm up dependencies (DB, Redis) — fail fast if unavailable
        await (0, prisma_2.ensurePrismaConnected)();
        // 2. Register plugins & routes
        await registerPlugins();
        // 3. Setup Socket.IO (must be after HTTP server creation, before listen)
        const httpServer = app.server; // Fastify's underlying HTTP server
        await (0, socket_1.setupSocket)(httpServer);
        app.get('/health', async (req, res) => {
            return { status: 'ok', uptime: process.uptime() };
        });
        // 4. Start listening
        await app.listen({ port: PORT, host: HOST });
        const address = app.server.address();
        const bind = typeof address === "string" ? `pipe ${address}` : `port ${address?.port}`;
        logger_1.default.info(`Server listening on ${HOST}:${PORT} (${bind})`);
    }
    catch (err) {
        logger_1.default.fatal({ err }, "Failed to start server");
        process.exit(1);
    }
}
// ────────────────────────────────────────────────
// Graceful shutdown coordinator
// ────────────────────────────────────────────────
async function shutdown(signal) {
    logger_1.default.info(`[${signal}] Shutting down gracefully...`);
    const shutdownTasks = [
        // Close Fastify (closes HTTP server, triggers socket close if integrated)
        app.close().catch((err) => logger_1.default.error({ err }, "Error closing Fastify")),
        // Prisma disconnect (from its setup)
        prisma_1.prisma.$disconnect().catch((err) => logger_1.default.error({ err }, "Error disconnecting Prisma")),
        // Redis quit (from its setup — already has handlers, but explicit)
        redis_1.redisPub.quit().catch((err) => logger_1.default.error({ err }, "Error quitting Redis Pub")),
        redis_1.redisSub.quit().catch((err) => logger_1.default.error({ err }, "Error quitting Redis Sub")),
    ];
    await Promise.allSettled(shutdownTasks);
    logger_1.default.info("All shutdown tasks completed");
    process.exit(0);
}
// ────────────────────────────────────────────────
// Attach shutdown handlers (coordinated — overrides/expands previous ones)
// ────────────────────────────────────────────────
["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal) => {
    process.on(signal, () => shutdown(signal));
});
// Handle startup errors (e.g., port in use)
process.on("uncaughtException", (err) => {
    logger_1.default.fatal({ err }, "Uncaught Exception");
    shutdown("uncaughtException");
});
process.on("unhandledRejection", (reason, promise) => {
    logger_1.default.fatal({ reason, promise }, "Unhandled Rejection");
    shutdown("unhandledRejection");
});
// ────────────────────────────────────────────────
// Start the server
// ────────────────────────────────────────────────
startServer().catch((err) => {
    logger_1.default.fatal({ err }, "Bootstrap failed");
    process.exit(1);
});
//# sourceMappingURL=server.js.map