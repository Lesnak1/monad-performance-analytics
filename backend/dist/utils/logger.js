"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const logsDir = path_1.default.join(__dirname, '../../logs');
const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
const logColors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
winston_1.default.addColors(logColors);
const customFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json(), winston_1.default.format.prettyPrint());
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
}));
const transports = [];
if (process.env.NODE_ENV !== 'production') {
    transports.push(new winston_1.default.transports.Console({
        level: 'debug',
        format: consoleFormat
    }));
}
transports.push(new winston_1.default.transports.File({
    filename: path_1.default.join(logsDir, 'error.log'),
    level: 'error',
    format: customFormat,
    maxsize: 5242880,
    maxFiles: 5,
}), new winston_1.default.transports.File({
    filename: path_1.default.join(logsDir, 'combined.log'),
    format: customFormat,
    maxsize: 5242880,
    maxFiles: 5,
}), new winston_1.default.transports.File({
    filename: path_1.default.join(logsDir, 'app.log'),
    level: 'info',
    format: customFormat,
    maxsize: 5242880,
    maxFiles: 10,
}));
const baseLogger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels: logLevels,
    format: customFormat,
    transports,
    exitOnError: false,
});
baseLogger.logRequest = (req, res, responseTime) => {
    const logData = {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        responseTime: `${responseTime}ms`,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    };
    if (res.statusCode >= 400) {
        baseLogger.error('HTTP Request Error', logData);
    }
    else {
        baseLogger.http('HTTP Request', logData);
    }
};
baseLogger.logPerformance = (operation, duration, metadata) => {
    baseLogger.info('Performance Metric', {
        operation,
        duration: `${duration}ms`,
        ...metadata,
        timestamp: new Date().toISOString()
    });
};
baseLogger.logBlockchainEvent = (event, data) => {
    baseLogger.info('Blockchain Event', {
        event,
        data,
        timestamp: new Date().toISOString()
    });
};
baseLogger.logMetrics = (metrics) => {
    baseLogger.info('Metrics Collection', {
        metrics,
        timestamp: new Date().toISOString()
    });
};
baseLogger.logError = (error, context) => {
    baseLogger.error('Application Error', {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString()
    });
};
baseLogger.exceptions.handle(new winston_1.default.transports.File({
    filename: path_1.default.join(logsDir, 'exceptions.log'),
    format: customFormat
}));
baseLogger.rejections.handle(new winston_1.default.transports.File({
    filename: path_1.default.join(logsDir, 'rejections.log'),
    format: customFormat
}));
exports.default = baseLogger;
//# sourceMappingURL=logger.js.map