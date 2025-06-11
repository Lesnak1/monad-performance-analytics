import { Request, Response, NextFunction } from 'express'
import { RateLimiterRedis } from 'rate-limiter-flexible'
import Redis from 'redis'
import logger from '../utils/logger'
import rateLimit from 'express-rate-limit'

// Redis client setup
const redisClient = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD
})

redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err)
})

redisClient.on('connect', () => {
  logger.info('✅ Redis connected for rate limiting')
})

// Rate limiter configurations
const createRateLimiter = (points: number, duration: number) => {
  return new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'monad_api_rl',
    points, // Number of requests
    duration, // Per duration in seconds
    blockDuration: duration, // Block for duration in seconds if limit exceeded
  })
}

// Different rate limiters for different endpoints
const rateLimiters = {
  // General API - 100 requests per minute
  general: createRateLimiter(100, 60),
  
  // Auth endpoints - 5 requests per minute
  auth: createRateLimiter(5, 60),
  
  // Heavy endpoints - 10 requests per minute
  heavy: createRateLimiter(10, 60),
  
  // Real-time data - 200 requests per minute
  realtime: createRateLimiter(200, 60)
}

// General rate limiter middleware
const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.ip || 'unknown'
    
    // Choose appropriate rate limiter based on path
    let limiter = rateLimiters.general
    
    if (req.path.includes('/auth/')) {
      limiter = rateLimiters.auth
    } else if (req.path.includes('/metrics/heavy/') || req.path.includes('/export/')) {
      limiter = rateLimiters.heavy
    } else if (req.path.includes('/live/') || req.path.includes('/realtime/')) {
      limiter = rateLimiters.realtime
    }

    await limiter.consume(key)
    next()
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1
    
    // Log rate limit violation
    logger.warn('Rate limit exceeded:', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent'),
      retryAfter: secs
    })

    res.set('Retry-After', String(secs))
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests',
        retryAfter: secs,
        limit: rejRes.totalHits,
        remaining: rejRes.remainingPoints || 0,
        resetTime: new Date(Date.now() + rejRes.msBeforeNext)
      }
    })
  }
}

// General rate limiter - 100 requests per 15 minutes
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    })
  }
})

// Authentication rate limiter - 5 requests per 15 minutes (more strict)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Authentication rate limit exceeded',
      message: 'Too many login/register attempts from this IP, please try again later.',
      retryAfter: '15 minutes'
    })
  }
})

// API rate limiter - 1000 requests per hour (for API endpoints)
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // limit each IP to 1000 requests per hour
  message: {
    error: 'API rate limit exceeded',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'API rate limit exceeded',
      message: 'Too many API requests from this IP, please try again later.',
      retryAfter: '1 hour'
    })
  }
})

// Specific rate limiters for different use cases
export const heavyRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.ip || 'unknown'
    await rateLimiters.heavy.consume(key)
    next()
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1
    res.set('Retry-After', String(secs))
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many heavy requests',
        retryAfter: secs
      }
    })
  }
}

// Initialize Redis connection
export const initializeRateLimiter = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect()
    }
    logger.info('✅ Rate limiter initialized with Redis')
  } catch (error) {
    logger.error('❌ Failed to initialize rate limiter:', error)
    throw error
  }
}

// Cleanup function
export const closeRateLimiter = async () => {
  try {
    await redisClient.quit()
    logger.info('✅ Rate limiter Redis connection closed')
  } catch (error) {
    logger.error('❌ Error closing rate limiter:', error)
  }
}

export default generalRateLimiter 