import { NetworkMetrics, Transaction } from './MonadRPCService';
export declare class DatabaseService {
    private static instance;
    private prisma;
    private isConnected;
    private constructor();
    static getInstance(): DatabaseService;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isServiceConnected(): boolean;
    saveMetrics(metrics: NetworkMetrics[]): Promise<void>;
    getMetricsByTimeRange(startTime: Date, endTime: Date): Promise<NetworkMetrics[]>;
    getLatestMetrics(limit?: number): Promise<NetworkMetrics[]>;
    saveHourlyAggregate(metrics: NetworkMetrics, timestamp: Date): Promise<void>;
    getHourlyAggregatesByTimeRange(startTime: Date, endTime: Date): Promise<NetworkMetrics[]>;
    saveDailyAggregate(metrics: NetworkMetrics, timestamp: Date): Promise<void>;
    getDailyAggregatesByTimeRange(startTime: Date, endTime: Date): Promise<NetworkMetrics[]>;
    saveTransaction(transaction: Transaction): Promise<void>;
    saveTransactions(transactions: Transaction[]): Promise<void>;
    getTransactionsByTimeRange(startTime: Date, endTime: Date, limit?: number): Promise<Transaction[]>;
    getTransactionByHash(hash: string): Promise<Transaction | null>;
    getLatestTransactions(limit?: number): Promise<Transaction[]>;
    saveAlert(alert: any): Promise<string>;
    updateAlertStatus(id: string, triggered: boolean): Promise<void>;
    deleteAlert(id: string): Promise<void>;
    getAlerts(): Promise<any[]>;
    createUser(userData: {
        email: string;
        passwordHash: string;
        name?: string;
    }): Promise<string>;
    getUserByEmail(email: string): Promise<any | null>;
    getUserById(id: string): Promise<any | null>;
    getAnalytics(timeRange: {
        start: Date;
        end: Date;
    }): Promise<{
        totalTransactions: any;
        avgTps: any;
        avgBlockTime: any;
        avgNetworkHealth: any;
        peakTps: any;
        transactionsByType: any;
        hourlyActivity: any;
    }>;
    cleanupOldMetrics(cutoffDate: Date): Promise<void>;
    healthCheck(): Promise<{
        status: string;
        details: any;
    }>;
    private formatMetricsFromDB;
    private formatTransactionFromDB;
}
//# sourceMappingURL=DatabaseService.d.ts.map