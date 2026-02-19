"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
exports.createChildLogger = createChildLogger;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pino_1 = __importDefault(require("pino"));
const pino_pretty_1 = __importDefault(require("pino-pretty"));
// ────────────────────────────────────────────────
// Configuration
// ────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production';
const pinoOptions = {
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
            };
        },
    },
    timestamp: pino_1.default.stdTimeFunctions.isoTime,
    redact: [
        'req.headers.authorization',
        'req.headers.cookie',
        'password',
        'token',
        'accessToken',
        'refreshToken',
        'email',
        'phone',
    ],
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
            return pino_1.default.stdSerializers.err(err);
        },
    },
};
// ────────────────────────────────────────────────
// Create the root logger
// ────────────────────────────────────────────────
const logger = (0, pino_1.default)(pinoOptions, isProduction
    ? undefined
    : (0, pino_pretty_1.default)({
        colorize: true,
        ignore: 'pid,hostname',
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l o',
        messageFormat: '{msg} {context}',
    }));
function createChildLogger(context) {
    return logger.child(context);
}
// ────────────────────────────────────────────────
// Export common convenience methods
// ────────────────────────────────────────────────
exports.log = {
    fatal: logger.fatal.bind(logger),
    error: logger.error.bind(logger),
    warn: logger.warn.bind(logger),
    info: logger.info.bind(logger),
    debug: logger.debug.bind(logger),
    trace: logger.trace.bind(logger),
    withContext: createChildLogger,
};
exports.default = logger;
//# sourceMappingURL=logger.js.map