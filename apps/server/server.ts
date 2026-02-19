import dotenv from "dotenv";
dotenv.config();

import fastify from "fastify";
import cors from "@fastify/cors";
import { setupSocket } from "./socket";
import logger from "./logger";
import { prisma } from "./prisma";
import { redisPub, redisSub } from "./redis";
import { ensurePrismaConnected } from "./prisma";

// ────────────────────────────────────────────────
// Configuration (pull from env for prod)
// ────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || "4000", 10);
const HOST = process.env.HOST || "0.0.0.0";

// ────────────────────────────────────────────────
// Fastify instance with production defaults
// ────────────────────────────────────────────────
const app = fastify({
    logger: false,
    disableRequestLogging: true
});

// ────────────────────────────────────────────────
// Register plugins & routes
// ────────────────────────────────────────────────
async function registerPlugins() {
    await app.register(cors, {
        origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000", "*", "https://techno-traders-lms.vercel.app"],
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
        logger.info("Starting server bootstrap...");

        // 1. Warm up dependencies (DB, Redis) — fail fast if unavailable
        await ensurePrismaConnected();

        // 2. Register plugins & routes
        await registerPlugins();

        // 3. Setup Socket.IO (must be after HTTP server creation, before listen)
        const httpServer = app.server; // Fastify's underlying HTTP server
        await setupSocket(httpServer);

        app.get('/health', async (req, res) => {
            return { status: 'ok', uptime: process.uptime() };
        });

        // 4. Start listening
        await app.listen({ port: PORT, host: HOST });
        const address = app.server.address();
        const bind = typeof address === "string" ? `pipe ${address}` : `port ${address?.port}`;
        logger.info(`Server listening on ${HOST}:${PORT} (${bind})`);

    } catch (err) {
        logger.fatal({ err }, "Failed to start server");
        process.exit(1);
    }
}

// ────────────────────────────────────────────────
// Graceful shutdown coordinator
// ────────────────────────────────────────────────
async function shutdown(signal: string) {
    logger.info(`[${signal}] Shutting down gracefully...`);

    const shutdownTasks = [
        // Close Fastify (closes HTTP server, triggers socket close if integrated)
        app.close().catch((err) => logger.error({ err }, "Error closing Fastify")),

        // Prisma disconnect (from its setup)
        prisma.$disconnect().catch((err) => logger.error({ err }, "Error disconnecting Prisma")),

        // Redis quit (from its setup — already has handlers, but explicit)
        redisPub.quit().catch((err) => logger.error({ err }, "Error quitting Redis Pub")),
        redisSub.quit().catch((err) => logger.error({ err }, "Error quitting Redis Sub")),
    ];

    await Promise.allSettled(shutdownTasks);
    logger.info("All shutdown tasks completed");
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
    logger.fatal({ err }, "Uncaught Exception");
    shutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
    logger.fatal({ reason, promise }, "Unhandled Rejection");
    shutdown("unhandledRejection");
});

// ────────────────────────────────────────────────
// Start the server
// ────────────────────────────────────────────────
startServer().catch((err) => {
    logger.fatal({ err }, "Bootstrap failed");
    process.exit(1);
});