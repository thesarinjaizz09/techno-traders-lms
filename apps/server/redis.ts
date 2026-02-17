// redis.ts
import dotenv from "dotenv";

// Load environment variables from .env file (if present)
dotenv.config();

import Redis, { Redis as RedisClient, RedisOptions } from 'ioredis';
import logger from './logger'; // ← Replace with your actual logger (pino, winston, etc.)

// ────────────────────────────────────────────────
// Central configuration (ideally move to env + config loader later)
// ────────────────────────────────────────────────
const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
    throw new Error('REDIS_URL environment variable is required');
}

// Common options for both pub & sub clients
const baseOptions: RedisOptions = {
    // Parse connection string automatically (redis://, rediss://, sentinel:// etc.)
    // ioredis supports it natively
    connectionName: 'chat-backend',

    // Recommended reconnection strategy (exponential backoff + cap)
    retryStrategy: (times: number) => {
        // After ~10 attempts (~1 min total), give up and let the app crash/restart
        if (times > 10) {
            logger.error(`Redis reconnection failed after ${times} attempts`);
            return null; // stop retrying → triggers 'error' event
        }
        const delay = Math.min(times * 50, 2000); // 50ms → 2s max
        logger.warn(`Redis reconnect attempt ${times} in ${delay}ms`);
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

    // TLS / auth settings are handled automatically if using rediss:// or password in URL
};

// ────────────────────────────────────────────────
// Pub & Sub clients — MUST be separate instances
// ────────────────────────────────────────────────
export const redisPub = new Redis(REDIS_URL, {
    ...baseOptions,
    connectionName: 'chat-pub',
    // Pub client usually doesn't need offline queue as aggressively
    enableOfflineQueue: false,
    maxRetriesPerRequest: null, // unlimited for publishes (critical)
});

export const redisSub = new Redis(REDIS_URL, {
    ...baseOptions,
    connectionName: 'chat-sub',
    // Sub client benefits from offline queue for missed messages during reconnect
    enableOfflineQueue: true,
});

// ────────────────────────────────────────────────
// Global error & status handling (very important in prod)
// ────────────────────────────────────────────────
function setupRedisEvents(client: RedisClient, name: string) {
    client.on('connect', () => {
        logger.info(`${name} Redis connected`);
    });

    client.on('ready', () => {
        logger.info(`${name} Redis ready (can accept commands)`);
    });

    client.on('error', (err) => {
        logger.error(`${name} Redis error: ${err.message}`);
        // In production you might want to send to Sentry/Datadog/etc.
    });

    client.on('close', () => {
        logger.warn(`${name} Redis connection closed`);
    });

    client.on('reconnecting', (delay: number) => {
        logger.warn(`${name} Redis reconnecting in ${delay}ms`);
    });

    client.on('end', () => {
        logger.error(`${name} Redis connection ended permanently`);
        // Here you might want to gracefully shutdown the app
        // or notify admin via alert
    });
}

setupRedisEvents(redisPub, 'Pub');
setupRedisEvents(redisSub, 'Sub');

// Optional: Lazy connect on first use (already default, but explicit)
// You can await redisPub.connect() in your app bootstrap if you want eager connection

// ────────────────────────────────────────────────
// Graceful shutdown hook
// ────────────────────────────────────────────────
async function shutdownRedis() {
    logger.info('Shutting down Redis clients...');

    const pubPromise = redisPub.quit().catch((err) => {
        logger.warn('Pub quit failed, forcing disconnect', err);
        redisPub.disconnect();
    });

    const subPromise = redisSub.quit().catch((err) => {
        logger.warn('Sub quit failed, forcing disconnect', err);
        redisSub.disconnect();
    });

    await Promise.allSettled([pubPromise, subPromise]);
    logger.info('Redis clients closed');
}

// Attach to process signals (use in your main server file or here)
process.on('SIGTERM', async () => {
    await shutdownRedis();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await shutdownRedis();
    process.exit(0);
});

logger.info('Redis clients initialized (lazy connect mode)');