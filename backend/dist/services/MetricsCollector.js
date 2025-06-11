"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsCollector = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
class MetricsCollector {
    constructor(rpcService, dbService) {
        this.isRunning = false;
        this.collectionInterval = null;
        this.metricsBuffer = [];
        this.alerts = [];
        this.collectors = new Map();
        this.rpcService = rpcService;
        this.dbService = dbService;
    }
    async start() {
        if (this.isRunning) {
            logger_1.default.warn('Metrics collector is already running');
            return;
        }
        try {
            this.isRunning = true;
            this.startRealTimeCollection();
            this.startPeriodicSave();
            this.startAlertChecking();
            this.initializeAggregators();
            logger_1.default.info('✅ Metrics collector started successfully');
        }
        catch (error) {
            logger_1.default.error('❌ Failed to start metrics collector:', error);
            throw error;
        }
    }
    async stop() {
        if (!this.isRunning)
            return;
        this.isRunning = false;
        if (this.collectionInterval) {
            clearInterval(this.collectionInterval);
            this.collectionInterval = null;
        }
        this.collectors.forEach((collector, key) => {
            if (collector && typeof collector.stop === 'function') {
                collector.stop();
            }
        });
        this.collectors.clear();
        if (this.metricsBuffer.length > 0) {
            await this.saveMetricsToDatabase();
        }
        logger_1.default.info('✅ Metrics collector stopped');
    }
    startRealTimeCollection() {
        const interval = parseInt(process.env.METRICS_COLLECTION_INTERVAL || '5000');
        this.collectionInterval = setInterval(async () => {
            try {
                const currentMetrics = this.rpcService.getCurrentMetrics();
                if (currentMetrics) {
                    this.metricsBuffer.push(currentMetrics);
                    if (this.metricsBuffer.length % 10 === 0) {
                        logger_1.default.logMetrics({
                            bufferSize: this.metricsBuffer.length,
                            latestTps: currentMetrics.tps,
                            latestBlockNumber: currentMetrics.blockNumber,
                            networkHealth: currentMetrics.networkHealth
                        });
                    }
                }
            }
            catch (error) {
                logger_1.default.error('Error in real-time collection:', error);
            }
        }, interval);
    }
    startPeriodicSave() {
        setInterval(async () => {
            try {
                await this.saveMetricsToDatabase();
            }
            catch (error) {
                logger_1.default.error('Error saving metrics to database:', error);
            }
        }, 60000);
    }
    startAlertChecking() {
        setInterval(() => {
            try {
                this.checkAlerts();
            }
            catch (error) {
                logger_1.default.error('Error checking alerts:', error);
            }
        }, 30000);
    }
    initializeAggregators() {
        this.collectors.set('hourly', setInterval(async () => {
            await this.aggregateHourlyData();
        }, 3600000));
        this.collectors.set('daily', setInterval(async () => {
            await this.aggregateDailyData();
        }, 86400000));
        this.collectors.set('cleanup', setInterval(async () => {
            await this.cleanupOldData();
        }, 86400000));
    }
    async saveMetricsToDatabase() {
        if (this.metricsBuffer.length === 0)
            return;
        try {
            const metricsToSave = [...this.metricsBuffer];
            this.metricsBuffer = [];
            await this.dbService.saveMetrics(metricsToSave);
            logger_1.default.debug(`Saved ${metricsToSave.length} metrics to database`);
        }
        catch (error) {
            logger_1.default.error('Failed to save metrics to database:', error);
            this.metricsBuffer.unshift(...this.metricsBuffer);
        }
    }
    checkAlerts() {
        const currentMetrics = this.rpcService.getCurrentMetrics();
        if (!currentMetrics)
            return;
        for (const alert of this.alerts) {
            if (!alert.triggered) {
                const shouldTrigger = this.evaluateAlertCondition(alert, currentMetrics);
                if (shouldTrigger) {
                    alert.triggered = true;
                    alert.timestamp = new Date();
                    logger_1.default.warn('Alert triggered:', {
                        type: alert.type,
                        condition: alert.condition,
                        threshold: alert.threshold,
                        currentValue: this.getMetricValue(alert.type, currentMetrics),
                        message: alert.message
                    });
                    this.emitAlertEvent(alert);
                }
            }
        }
    }
    evaluateAlertCondition(alert, metrics) {
        const value = this.getMetricValue(alert.type, metrics);
        switch (alert.condition) {
            case 'above':
                return value > alert.threshold;
            case 'below':
                return value < alert.threshold;
            default:
                return false;
        }
    }
    getMetricValue(type, metrics) {
        switch (type) {
            case 'tps':
                return metrics.tps;
            case 'gas_price':
                return parseFloat(metrics.gasPrice) / 1e9;
            case 'block_time':
                return metrics.blockTime;
            case 'network_health':
                return metrics.networkHealth;
            default:
                return 0;
        }
    }
    emitAlertEvent(alert) {
        logger_1.default.warn('Alert Event Emitted:', alert);
    }
    async aggregateHourlyData() {
        try {
            const endTime = new Date();
            const startTime = new Date(endTime.getTime() - 3600000);
            const hourlyData = await this.dbService.getMetricsByTimeRange(startTime, endTime);
            if (hourlyData.length === 0)
                return;
            const aggregated = this.aggregateMetrics(hourlyData);
            await this.dbService.saveHourlyAggregate(aggregated, startTime);
            logger_1.default.debug('Hourly data aggregated and saved');
        }
        catch (error) {
            logger_1.default.error('Error aggregating hourly data:', error);
        }
    }
    async aggregateDailyData() {
        try {
            const endTime = new Date();
            const startTime = new Date(endTime.getTime() - 86400000);
            const dailyData = await this.dbService.getHourlyAggregatesByTimeRange(startTime, endTime);
            if (dailyData.length === 0)
                return;
            const aggregated = this.aggregateMetrics(dailyData);
            await this.dbService.saveDailyAggregate(aggregated, startTime);
            logger_1.default.debug('Daily data aggregated and saved');
        }
        catch (error) {
            logger_1.default.error('Error aggregating daily data:', error);
        }
    }
    aggregateMetrics(metrics) {
        if (metrics.length === 0) {
            throw new Error('Cannot aggregate empty metrics array');
        }
        const avgTps = metrics.reduce((sum, m) => sum + m.tps, 0) / metrics.length;
        const avgBlockTime = metrics.reduce((sum, m) => sum + m.blockTime, 0) / metrics.length;
        const avgNetworkHealth = metrics.reduce((sum, m) => sum + m.networkHealth, 0) / metrics.length;
        const totalTransactions = metrics.reduce((sum, m) => sum + m.totalTransactions, 0);
        const latest = metrics[metrics.length - 1];
        return {
            blockNumber: latest.blockNumber,
            gasPrice: latest.gasPrice,
            tps: Math.round(avgTps * 100) / 100,
            blockTime: Math.round(avgBlockTime * 100) / 100,
            networkHealth: Math.round(avgNetworkHealth * 100) / 100,
            totalTransactions,
            timestamp: latest.timestamp
        };
    }
    async cleanupOldData() {
        try {
            const retentionDays = parseInt(process.env.HISTORICAL_DATA_RETENTION_DAYS || '30');
            const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
            await this.dbService.cleanupOldMetrics(cutoffDate);
            logger_1.default.info(`Cleaned up metrics data older than ${retentionDays} days`);
        }
        catch (error) {
            logger_1.default.error('Error cleaning up old data:', error);
        }
    }
    async getCurrentProcessedMetrics() {
        try {
            const current = this.rpcService.getCurrentMetrics();
            if (!current) {
                throw new Error('No current metrics available');
            }
            const historical = await this.getHistoricalData();
            const statistics = await this.calculateStatistics();
            return {
                current,
                historical,
                statistics,
                alerts: this.alerts.filter(a => a.triggered)
            };
        }
        catch (error) {
            logger_1.default.error('Error getting processed metrics:', error);
            throw error;
        }
    }
    async getHistoricalData() {
        const now = new Date();
        const hourlyStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const hourly = await this.dbService.getHourlyAggregatesByTimeRange(hourlyStart, now);
        const dailyStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const daily = await this.dbService.getDailyAggregatesByTimeRange(dailyStart, now);
        const weekly = this.aggregateToWeekly(daily);
        return { hourly, daily, weekly };
    }
    aggregateToWeekly(dailyData) {
        const weekly = [];
        for (let i = 0; i < dailyData.length; i += 7) {
            const weekData = dailyData.slice(i, i + 7);
            if (weekData.length > 0) {
                weekly.push(this.aggregateMetrics(weekData));
            }
        }
        return weekly;
    }
    async calculateStatistics() {
        const metricsHistory = this.rpcService.getMetricsHistory(100);
        if (metricsHistory.length === 0) {
            return {
                avgTps: 0,
                avgBlockTime: 0,
                avgGasPrice: '0',
                totalTransactions: 0,
                healthScore: 0
            };
        }
        const avgTps = metricsHistory.reduce((sum, m) => sum + m.tps, 0) / metricsHistory.length;
        const avgBlockTime = metricsHistory.reduce((sum, m) => sum + m.blockTime, 0) / metricsHistory.length;
        const avgGasPrice = metricsHistory.reduce((sum, m) => sum + parseFloat(m.gasPrice), 0) / metricsHistory.length;
        const totalTransactions = metricsHistory.reduce((sum, m) => sum + m.totalTransactions, 0);
        const healthScore = metricsHistory.reduce((sum, m) => sum + m.networkHealth, 0) / metricsHistory.length;
        return {
            avgTps: Math.round(avgTps * 100) / 100,
            avgBlockTime: Math.round(avgBlockTime * 100) / 100,
            avgGasPrice: avgGasPrice.toString(),
            totalTransactions,
            healthScore: Math.round(healthScore * 100) / 100
        };
    }
    addAlert(alert) {
        const id = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newAlert = {
            ...alert,
            id,
            triggered: false,
            timestamp: new Date()
        };
        this.alerts.push(newAlert);
        logger_1.default.info('Alert added:', newAlert);
        return id;
    }
    removeAlert(id) {
        const index = this.alerts.findIndex(a => a.id === id);
        if (index !== -1) {
            this.alerts.splice(index, 1);
            logger_1.default.info(`Alert removed: ${id}`);
            return true;
        }
        return false;
    }
    getAlerts() {
        return [...this.alerts];
    }
    resetAlert(id) {
        const alert = this.alerts.find(a => a.id === id);
        if (alert) {
            alert.triggered = false;
            logger_1.default.info(`Alert reset: ${id}`);
            return true;
        }
        return false;
    }
    async exportMetrics(format, timeRange) {
        try {
            const metrics = await this.dbService.getMetricsByTimeRange(timeRange.start, timeRange.end);
            if (format === 'csv') {
                return this.convertToCSV(metrics);
            }
            else {
                return JSON.stringify(metrics, null, 2);
            }
        }
        catch (error) {
            logger_1.default.error('Error exporting metrics:', error);
            throw error;
        }
    }
    convertToCSV(metrics) {
        if (metrics.length === 0)
            return '';
        const headers = Object.keys(metrics[0]).join(',');
        const rows = metrics.map(metric => Object.values(metric).join(','));
        return [headers, ...rows].join('\n');
    }
}
exports.MetricsCollector = MetricsCollector;
//# sourceMappingURL=MetricsCollector.js.map