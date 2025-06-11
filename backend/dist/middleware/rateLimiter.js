"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeRateLimiter = exports.initializeRateLimiter = exports.heavyRateLimiter = exports.authRateLimiter = void 0;
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const redis_1 = __importDefault(require("redis"));
const logger_1 = __importDefault(require("../utils/logger"));
const redisClient = redis_1.default.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD
});
redisClient.on('error', (err) => {
    logger_1.default.error('Redis Client Error:', err);
});
redisClient.on('connect', () => {
    logger_1.default.info('✅ Redis connected for rate limiting');
});
const createRateLimiter = (points, duration) => {
    return new rate_limiter_flexible_1.RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: 'monad_api_rl',
        points,
        duration,
        blockDuration: duration,
    });
};
const rateLimiters = {
    general: createRateLimiter(100, 60),
    auth: createRateLimiter(5, 60),
    heavy: createRateLimiter(10, 60),
    realtime: createRateLimiter(200, 60)
};
const rateLimiter = async (req, res, next) => {
    try {
        const key = req.ip || 'unknown';
        let limiter = rateLimiters.general;
        if (req.path.includes('/auth/')) {
            limiter = rateLimiters.auth;
        }
        else if (req.path.includes('/metrics/heavy/') || req.path.includes('/export/')) {
            limiter = rateLimiters.heavy;
        }
        else if (req.path.includes('/live/') || req.path.includes('/realtime/')) {
            limiter = rateLimiters.realtime;
        }
        await limiter.consume(key);
        next();
    }
    catch (rejRes) {
        const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
        logger_1.default.warn('Rate limit exceeded:', {
            ip: req.ip,
            path: req.path,
            method: req.method,
            userAgent: req.get('User-Agent'),
            retryAfter: secs
        });
        res.set('Retry-After', String(secs));
        res.status(429).json({
            success: false,
            error: {
                message: 'Too many requests',
                retryAfter: secs,
                limit: rejRes.totalHits,
                remaining: rejRes.remainingPoints || 0,
                resetTime: new Date(Date.now() + rejRes.msBeforeNext)
            }
        });
    }
};
const authRateLimiter = async (req, res, next) => {
    try {
        const key = req.ip || 'unknown';
        await rateLimiters.auth.consume(key);
        next();
    }
    catch (rejRes) {
        const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
        res.set('Retry-After', String(secs));
        res.status(429).json({
            success: false,
            error: {
                message: 'Too many authentication attempts',
                retryAfter: secs
            }
        });
    }
};
exports.authRateLimiter = authRateLimiter;
const heavyRateLimiter = async (req, res, next) => {
    try {
        const key = req.ip || 'unknown';
        await rateLimiters.heavy.consume(key);
        next();
    }
    catch (rejRes) {
        const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
        res.set('Retry-After', String(secs));
        res.status(429).json({
            success: false,
            error: {
                message: 'Too many heavy requests',
                retryAfter: secs
            }
        });
    }
};
exports.heavyRateLimiter = heavyRateLimiter;
const initializeRateLimiter = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
        logger_1.default.info('✅ Rate limiter initialized with Redis');
    }
    catch (error) {
        logger_1.default.error('❌ Failed to initialize rate limiter:', error);
        throw error;
    }
};
exports.initializeRateLimiter = initializeRateLimiter;
const closeRateLimiter = async () => {
    try {
        await redisClient.quit();
        logger_1.default.info('✅ Rate limiter Redis connection closed');
    }
    catch (error) {
        logger_1.default.error('❌ Error closing rate limiter:', error);
    }
};
exports.closeRateLimiter = closeRateLimiter;
exports.default = rateLimiter;
//# sourceMappingURL=rateLimiter.js.map