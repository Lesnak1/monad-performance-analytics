import winston from 'winston';
interface ExtendedLogger extends winston.Logger {
    logRequest: (req: any, res: any, responseTime: number) => void;
    logPerformance: (operation: string, duration: number, metadata?: any) => void;
    logBlockchainEvent: (event: string, data: any) => void;
    logMetrics: (metrics: any) => void;
    logError: (error: Error, context?: any) => void;
}
declare const baseLogger: ExtendedLogger;
export default baseLogger;
//# sourceMappingURL=logger.d.ts.map