// server.ts (or index.ts — your main entrypoint)
import dotenv from "dotenv";

// Load environment variables from .env file (if present)
dotenv.config();

import fastify from "fastify";
import cors from "@fastify/cors";
import { setupSocket } from "./socket";
import logger from "./logger"; // Your Pino logger from previous setup
import { prisma } from "./prisma"; // Your Prisma client
import { redisPub, redisSub } from "./redis"; // Your Redis clients
import { ensurePrismaConnected } from "./prisma"; // Optional warm-up from Prisma setup

// ────────────────────────────────────────────────
// Configuration (pull from env for prod)
const PORT = parseInt(process.env.PORT || "4000", 10);
const HOST = process.env.HOST || "localhost";

// ────────────────────────────────────────────────
// Fastify instance with production defaults
const app = fastify({
    logger: false, // We'll use our custom logger instead of Fastify's built-in
    disableRequestLogging: true, // Disable if using pino-http or custom middleware later
});

// ────────────────────────────────────────────────
// Register plugins & routes
async function registerPlugins() {
    await app.register(cors, {
        origin: process.env.CORS_ORIGIN?.split(",") || true, // More secure than "*"
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    });

    // await app.register(messagesRoutes, { prefix: "/api" }); // Assuming API prefix — adjust if needed
}

// ────────────────────────────────────────────────
// Startup sequence
async function startServer() {
    try {
        logger.info("Starting server bootstrap...");

        // 1. Warm up dependencies (DB, Redis) — fail fast if unavailable
        await ensurePrismaConnected(); // From Prisma setup (optional but recommended)
        // Redis connects lazily, but you could add ping checks here if desired

        // 2. Register plugins & routes
        await registerPlugins();

        // 3. Setup Socket.IO (must be after HTTP server creation, before listen)
        const httpServer = app.server; // Fastify's underlying HTTP server
        await setupSocket(httpServer);

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
async function shutdown(signal: string) {
    logger.info(`[${signal}] Shutting down gracefully...`);

    const shutdownTasks = [
        // Close Fastify (closes HTTP server, triggers socket close if integrated)
        app.close().catch((err) => logger.error({ err }, "Error closing Fastify")),

        // Prisma disconnect (from its setup)
        // Already handled in Prisma's process.on, but we can await here for sequencing
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
startServer().catch((err) => {
    logger.fatal({ err }, "Bootstrap failed");
    process.exit(1);
});