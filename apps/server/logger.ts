// logger.ts
import dotenv from "dotenv";

// Load environment variables from .env file (if present)
dotenv.config();

import pino, { LoggerOptions } from 'pino';
import pretty from 'pino-pretty';

// ────────────────────────────────────────────────
// Configuration
// ────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production';

const pinoOptions: LoggerOptions = {
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),

    // In production we want JSON logs (good for log aggregators: Datadog, ELK, CloudWatch, Loki...)
    formatters: {
        level(label) {
            return { level: label };
        },
        bindings(bindings) {
            return {
                pid: bindings.pid,
                host: bindings.hostname,
                // You can add more context here (app version, instance id, etc.)
            };
        },
    },

    // Add timestamp in ISO format (most log systems expect this)
    timestamp: pino.stdTimeFunctions.isoTime,

    // Redact sensitive fields automatically
    redact: [
        'req.headers.authorization',
        'req.headers.cookie',
        'password',
        'token',
        'accessToken',
        'refreshToken',
        'email',          // optional - depends on your privacy rules
        'phone',
    ],

    // Optional: custom serializers for common objects
    serializers: {
        req(req) {
            return {
                method: req.method,
                url: req.url,
                remoteAddress: req.remoteAddress,
                userAgent: req.headers?.['user-agent'],
            };
        },
        err(err) {
            return pino.stdSerializers.err(err);
        },
    },
};

// ────────────────────────────────────────────────
// Create the root logger
// ────────────────────────────────────────────────
const logger = pino(
    pinoOptions,
    // In development → pretty print with colors
    isProduction
        ? undefined
        : pretty({
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l o',
            messageFormat: '{msg} {context}',
        })
);

// Optional: Child loggers with context (very useful)
// Example usage: const reqLogger = logger.child({ reqId: 'abc123' });
export function createChildLogger(context: Record<string, unknown>) {
    return logger.child(context);
}

// ────────────────────────────────────────────────
// Export common convenience methods
// ────────────────────────────────────────────────
export const log = {
    fatal: logger.fatal.bind(logger),
    error: logger.error.bind(logger),
    warn: logger.warn.bind(logger),
    info: logger.info.bind(logger),
    debug: logger.debug.bind(logger),
    trace: logger.trace.bind(logger),

    // With context
    withContext: createChildLogger,
};

export default logger;

// For HTTP request logging (if using express/fastify)
// You can later do: app.use(pinoHttp({ logger }));