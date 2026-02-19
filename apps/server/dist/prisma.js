"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.ensurePrismaConnected = ensurePrismaConnected;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("./lib/generated/prisma/client");
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
// ────────────────────────────────────────────────
// Singleton pattern to prevent multiple instances 
// ────────────────────────────────────────────────
const globalForPrisma = global;
let prisma;
if (!globalForPrisma.prisma) {
    exports.prisma = prisma = new client_1.PrismaClient({
        adapter,
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
}
else {
    exports.prisma = prisma = globalForPrisma.prisma;
}
// ────────────────────────────────────────────────
// Graceful shutdown — very important in containers / orchestrated environments
// ────────────────────────────────────────────────
async function shutdownPrisma(signal) {
    console.log(`[${signal}] Received. Disconnecting Prisma...`);
    try {
        await prisma.$disconnect();
        console.log("Prisma disconnected successfully");
    }
    catch (err) {
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
async function ensurePrismaConnected() {
    try {
        await prisma.$connect(); // Explicit connect (normally lazy)
        console.log("Prisma connection established");
    }
    catch (err) {
        console.error("Failed to connect to database:", err);
        throw err; // Let your app fail fast at startup
    }
}
//# sourceMappingURL=prisma.js.map