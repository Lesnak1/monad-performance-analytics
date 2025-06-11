"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeRateLimiter = exports.initializeRateLimiter = exports.heavyRateLimiter = exports.apiRateLimiter = exports.authRateLimiter = exports.generalRateLimiter = void 0;
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const redis_1 = __importDefault(require("redis"));
const logger_1 = __importDefault(require("../utils/logger"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
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
exports.generalRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Rate limit exceeded',
            message: 'Too many requests from this IP, please try again later.',
            retryAfter: '15 minutes'
        });
    }
});
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        error: 'Too many authentication attempts from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Authentication rate limit exceeded',
            message: 'Too many login/register attempts from this IP, please try again later.',
            retryAfter: '15 minutes'
        });
    }
});
exports.apiRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 1000,
    message: {
        error: 'API rate limit exceeded',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'API rate limit exceeded',
            message: 'Too many API requests from this IP, please try again later.',
            retryAfter: '1 hour'
        });
    }
});
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
exports.default = exports.generalRateLimiter;
//# sourceMappingURL=rateLimiter.js.map