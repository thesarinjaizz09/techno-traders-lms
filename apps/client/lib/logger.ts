// src/lib/logger.ts
import pino, { Logger, LoggerOptions } from 'pino';
import pinoPretty from 'pino-pretty';

// ────────────────────────────────────────────────
// Configuration
// ────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production';

const pinoConfig: LoggerOptions = {
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),

  // Formatters for better structured output
  formatters: {
    level(label, number) {
      return { level: label };
    },
    bindings(bindings) {
      return {
        pid: bindings.pid,
        hostname: bindings.hostname,
        // You can add appName, version, instanceId, etc. here later
      };
    },
  },

  // ISO timestamps → friendly with most log aggregators
  timestamp: pino.stdTimeFunctions.isoTime,

  // Automatically redact sensitive fields
  redact: [
    'req.headers.authorization',
    'req.headers.cookie',
    'req.headers["x-access-token"]',
    'password',
    'token',
    'accessToken',
    'refreshToken',
    'email',
    'phone',
    'creditCard',
    '*.password',
    '*.token',
  ],

  // Serializers for common objects (req, err, etc.)
  serializers: {
    req(req: any) {
      return {
        method: req.method,
        url: req.url,
        remoteAddress: req.remoteAddress || req.socket?.remoteAddress,
        userAgent: req.headers?.['user-agent'],
        // add userId if available: userId: req.user?.id
      };
    },
    err(err: any) {
      return pino.stdSerializers.err(err);
    },
  },
};

// ────────────────────────────────────────────────
// Create the root logger
// ────────────────────────────────────────────────
const rootLogger = pino(
  pinoConfig,
  // Pretty printing only in development (colored, human-readable)
  isProduction
    ? undefined
    : pinoPretty({
        colorize: true,
        ignore: 'pid,hostname',
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l o',
        messageFormat: '{msg} {context}',
        singleLine: true,
      })
);

// ────────────────────────────────────────────────
// Helper to create contextual child loggers (very useful)
// ────────────────────────────────────────────────
export function createLogger(context: Record<string, unknown> = {}): Logger {
  return rootLogger.child(context);
}

// ────────────────────────────────────────────────
// Convenience exports
// ────────────────────────────────────────────────
export const logger = rootLogger;

// Common named loggers (optional – helps with consistency)
export const dbLogger     = createLogger({ component: 'prisma' });
export const redisLogger  = createLogger({ component: 'redis' });
export const socketLogger = createLogger({ component: 'socket.io' });
export const trpcLogger   = createLogger({ component: 'trpc' });
export const httpLogger   = createLogger({ component: 'http' });

// ────────────────────────────────────────────────
// Export default (most common usage)
// ────────────────────────────────────────────────
export default logger;