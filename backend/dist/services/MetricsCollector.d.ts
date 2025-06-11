import { MonadRPCService, NetworkMetrics } from './MonadRPCService';
import { DatabaseService } from './DatabaseService';
export interface ProcessedMetrics {
    current: NetworkMetrics;
    historical: {
        hourly: NetworkMetrics[];
        daily: NetworkMetrics[];
        weekly: NetworkMetrics[];
    };
    statistics: {
        avgTps: number;
        avgBlockTime: number;
        avgGasPrice: string;
        totalTransactions: number;
        healthScore: number;
    };
    alerts: Alert[];
}
export interface Alert {
    id: string;
    type: 'tps' | 'gas_price' | 'block_time' | 'network_health';
    condition: 'above' | 'below';
    threshold: number;
    triggered: boolean;
    message: string;
    timestamp: Date;
}
export declare class MetricsCollector {
    private rpcService;
    private dbService;
    private isRunning;
    private collectionInterval;
    private metricsBuffer;
    private alerts;
    private collectors;
    constructor(rpcService: MonadRPCService, dbService: DatabaseService);
    start(): Promise<void>;
    stop(): Promise<void>;
    private startRealTimeCollection;
    private startPeriodicSave;
    private startAlertChecking;
    private initializeAggregators;
    private saveMetricsToDatabase;
    private checkAlerts;
    private evaluateAlertCondition;
    private getMetricValue;
    private emitAlertEvent;
    private aggregateHourlyData;
    private aggregateDailyData;
    private aggregateMetrics;
    private cleanupOldData;
    getCurrentProcessedMetrics(): Promise<ProcessedMetrics>;
    private getHistoricalData;
    private aggregateToWeekly;
    private calculateStatistics;
    addAlert(alert: Omit<Alert, 'id' | 'triggered' | 'timestamp'>): string;
    removeAlert(id: string): boolean;
    getAlerts(): Alert[];
    resetAlert(id: string): boolean;
    exportMetrics(format: 'csv' | 'json', timeRange: {
        start: Date;
        end: Date;
    }): Promise<string>;
    private convertToCSV;
}
//# sourceMappingURL=MetricsCollector.d.ts.map