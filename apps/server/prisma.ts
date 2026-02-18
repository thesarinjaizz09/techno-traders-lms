import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "../client/lib/generated/prisma/client"

// ────────────────────────────────────────────────
// Singleton pattern to prevent multiple instances 
// ────────────────────────────────────────────────
const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined;
};

let prisma: PrismaClient;

if (!globalForPrisma.prisma) {
    prisma = new PrismaClient({
        // Recommended production logging levels
        log: process.env.NODE_ENV === "production"
            ? ["warn", "error"]
            : ["query", "info", "warn", "error"],

        // Optional: enable in production only if you use tracing/observability
        // errorFormat: "pretty", // or "colorless" / "minimal"

        // Optional: datasource override
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
// ────────────────────────────────────────────────
async function shutdownPrisma(signal: string) {
    console.log(`[${signal}] Received. Disconnecting Prisma...`);

    try {
        await prisma.$disconnect();
        console.log("Prisma disconnected successfully");
    } catch (err) {
        console.error("Error during Prisma disconnect:", err);
    }
}

["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal) => {
    process.on(signal, () => shutdownPrisma(signal));
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    shutdownPrisma("uncaughtException").finally(() => process.exit(1));
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// ────────────────────────────────────────────────
// Optional: Connection health check / warm-up (useful in cold-start environments)
// ────────────────────────────────────────────────
export async function ensurePrismaConnected() {
    try {
        await prisma.$connect(); // Explicit connect (normally lazy)
        console.log("Prisma connection established");
    } catch (err) {
        console.error("Failed to connect to database:", err);
        throw err; // Let your app fail fast at startup
    }
}

export { prisma };