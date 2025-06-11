import { Request, Response, NextFunction } from 'express';
declare const rateLimiter: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authRateLimiter: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const heavyRateLimiter: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const initializeRateLimiter: () => Promise<void>;
export declare const closeRateLimiter: () => Promise<void>;
export default rateLimiter;
//# sourceMappingURL=rateLimiter.d.ts.map