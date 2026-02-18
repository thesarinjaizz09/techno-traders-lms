// redis.ts
import dotenv from "dotenv";
dotenv.config();

import Redis, { Redis as RedisClient, RedisOptions } from 'ioredis';
import logger from './logger';

// ────────────────────────────────────────────────
// Central configuration
// ────────────────────────────────────────────────
const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
    throw new Error('REDIS_URL environment variable is required');
}

const baseOptions: RedisOptions = {
    connectionName: 'chat-backend',

    retryStrategy: (times: number) => {
        // After ~10 attempts (~1 min total), give up and let the app crash/restart
        if (times > 10) {
            logger.error(`Redis reconnection failed after ${times} attempts`);
            return null;
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
};

// ────────────────────────────────────────────────
// Pub & Sub clients — MUST be separate instances
// ────────────────────────────────────────────────
export const redisPub = new Redis(REDIS_URL, {
    ...baseOptions,
    connectionName: 'chat-pub',
    enableOfflineQueue: false,
    maxRetriesPerRequest: null
});

export const redisSub = new Redis(REDIS_URL, {
    ...baseOptions,
    connectionName: 'chat-sub',
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
    });

    client.on('close', () => {
        logger.warn(`${name} Redis connection closed`);
    });

    client.on('reconnecting', (delay: number) => {
        logger.warn(`${name} Redis reconnecting in ${delay}ms`);
    });

    client.on('end', () => {
        logger.error(`${name} Redis connection ended permanently`);
    });
}

setupRedisEvents(redisPub, 'Pub');
setupRedisEvents(redisSub, 'Sub');

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

process.on('SIGTERM', async () => {
    await shutdownRedis();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await shutdownRedis();
    process.exit(0);
});

logger.info('Redis clients initialized (lazy connect mode)');