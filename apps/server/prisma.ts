import dotenv from "dotenv";

// Load environment variables from .env file (if present)
dotenv.config();

import { PrismaClient } from "../client/lib/generated/prisma/client"

// ────────────────────────────────────────────────
// Singleton pattern to prevent multiple instances (critical in Next.js / hot-reload / serverless)
const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined;
};

// In production we want one instance.
// In development we still want one instance per process (avoids hot-reload warnings).
let prisma: PrismaClient;

if (!globalForPrisma.prisma) {
    prisma = new PrismaClient({
        // Recommended production logging levels
        log: process.env.NODE_ENV === "production"
            ? ["warn", "error"]
            : ["query", "info", "warn", "error"],

        // Optional: enable in production only if you use tracing/observability
        // errorFormat: "pretty", // or "colorless" / "minimal"

        // Optional: datasource override (rarely needed)
        // datasources: { db: { url: process.env.DATABASE_URL } },
    });

    // Store in global only in non-production to survive hot-reload
    if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = prisma;
    }
} else {
    prisma = globalForPrisma.prisma;
}

// ────────────────────────────────────────────────
// Graceful shutdown — very important in containers / orchestrated environments
// Handles SIGINT (Ctrl+C), SIGTERM (docker stop, k8s termination), etc.
async function shutdownPrisma(signal: string) {
    console.log(`[${signal}] Received. Disconnecting Prisma...`);

    try {
        await prisma.$disconnect();
        console.log("Prisma disconnected successfully");
    } catch (err) {
        console.error("Error during Prisma disconnect:", err);
    }

    // Do NOT call process.exit() here unless you're sure no other cleanup is needed
    // Let the process handle it naturally after all handlers finish
}

["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal) => {
    process.on(signal, () => shutdownPrisma(signal));
});

// Optional: Handle uncaught exceptions / rejections (last line of defense)
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    shutdownPrisma("uncaughtException").finally(() => process.exit(1));
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    // Optionally shutdownPrisma("unhandledRejection") — but usually just log
});

// ────────────────────────────────────────────────
// Optional: Connection health check / warm-up (useful in cold-start environments)
// You can call this in your server bootstrap if desired
export async function ensurePrismaConnected() {
    try {
        await prisma.$connect(); // Explicit connect (normally lazy)
        console.log("Prisma connection established");
    } catch (err) {
        console.error("Failed to connect to database:", err);
        throw err; // Let your app fail fast at startup
    }
}

// Export the singleton
export { prisma };

// Optional: re-export common prisma methods for convenience (if you like this style)
// export const db = prisma;