import { Request, Response, NextFunction } from 'express';
export declare const generalRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const authRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const apiRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const heavyRateLimiter: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const initializeRateLimiter: () => Promise<void>;
export declare const closeRateLimiter: () => Promise<void>;
export default generalRateLimiter;
//# sourceMappingURL=rateLimiter.d.ts.map