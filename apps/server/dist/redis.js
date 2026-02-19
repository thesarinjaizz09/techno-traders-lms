"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisSub = exports.redisPub = void 0;
// redis.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = __importDefault(require("./logger"));
// ────────────────────────────────────────────────
// Central configuration
// ────────────────────────────────────────────────
const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) {
    throw new Error('REDIS_URL environment variable is required');
}
const baseOptions = {
    connectionName: 'chat-backend',
    retryStrategy: (times) => {
        // After ~10 attempts (~1 min total), give up and let the app crash/restart
        if (times > 10) {
            logger_1.default.error(`Redis reconnection failed after ${times} attempts`);
            return null;
        }
        const delay = Math.min(times * 50, 2000); // 50ms → 2s max
        logger_1.default.warn(`Redis reconnect attempt ${times} in ${delay}ms`);
        return delay;
    },
    // Keep commands during reconnect (very useful for pub/sub)
    enableOfflineQueue: true,
    // Max 1000 commands queued while offline → prevent memory explosion
    maxRetriesPerRequest: 5,
    // Lazy connect = true is default, but explicit for clarity
    lazyConnect: true,
    // Show friendly errors in stack traces (production: false to hide internals)
    showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
};
// ────────────────────────────────────────────────
// Pub & Sub clients — MUST be separate instances
// ────────────────────────────────────────────────
exports.redisPub = new ioredis_1.default(REDIS_URL, {
    ...baseOptions,
    connectionName: 'chat-pub',
    enableOfflineQueue: false,
    maxRetriesPerRequest: null
});
exports.redisSub = new ioredis_1.default(REDIS_URL, {
    ...baseOptions,
    connectionName: 'chat-sub',
    enableOfflineQueue: true,
});
// ────────────────────────────────────────────────
// Global error & status handling (very important in prod)
// ────────────────────────────────────────────────
function setupRedisEvents(client, name) {
    client.on('connect', () => {
        logger_1.default.info(`${name} Redis connected`);
    });
    client.on('ready', () => {
        logger_1.default.info(`${name} Redis ready (can accept commands)`);
    });
    client.on('error', (err) => {
        logger_1.default.error(`${name} Redis error: ${err.message}`);
    });
    client.on('close', () => {
        logger_1.default.warn(`${name} Redis connection closed`);
    });
    client.on('reconnecting', (delay) => {
        logger_1.default.warn(`${name} Redis reconnecting in ${delay}ms`);
    });
    client.on('end', () => {
        logger_1.default.error(`${name} Redis connection ended permanently`);
    });
}
setupRedisEvents(exports.redisPub, 'Pub');
setupRedisEvents(exports.redisSub, 'Sub');
// ────────────────────────────────────────────────
// Graceful shutdown hook
// ────────────────────────────────────────────────
async function shutdownRedis() {
    logger_1.default.info('Shutting down Redis clients...');
    const pubPromise = exports.redisPub.quit().catch((err) => {
        logger_1.default.warn('Pub quit failed, forcing disconnect', err);
        exports.redisPub.disconnect();
    });
    const subPromise = exports.redisSub.quit().catch((err) => {
        logger_1.default.warn('Sub quit failed, forcing disconnect', err);
        exports.redisSub.disconnect();
    });
    await Promise.allSettled([pubPromise, subPromise]);
    logger_1.default.info('Redis clients closed');
}
process.on('SIGTERM', async () => {
    await shutdownRedis();
    process.exit(0);
});
process.on('SIGINT', async () => {
    await shutdownRedis();
    process.exit(0);
});
logger_1.default.info('Redis clients initialized (lazy connect mode)');
//# sourceMappingURL=redis.js.map