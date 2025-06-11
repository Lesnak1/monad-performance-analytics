"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("../utils/logger"));
class DatabaseService {
    constructor() {
        this.isConnected = false;
        this.prisma = new client_1.PrismaClient({
            log: [
                { level: 'query', emit: 'event' },
                { level: 'error', emit: 'stdout' },
                { level: 'info', emit: 'stdout' },
                { level: 'warn', emit: 'stdout' },
            ],
        });
        if (process.env.NODE_ENV === 'development') {
            this.prisma.$on('query', (e) => {
                logger_1.default.debug('Database Query:', {
                    query: e.query,
                    params: e.params,
                    duration: `${e.duration}ms`
                });
            });
        }
    }
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    async connect() {
        try {
            await this.prisma.$connect();
            await this.prisma.$queryRaw `SELECT 1`;
            this.isConnected = true;
            logger_1.default.info('✅ Database connected successfully');
        }
        catch (error) {
            logger_1.default.error('❌ Failed to connect to database:', error);
            throw error;
        }
    }
    async disconnect() {
        try {
            await this.prisma.$disconnect();
            this.isConnected = false;
            logger_1.default.info('✅ Database disconnected successfully');
        }
        catch (error) {
            logger_1.default.error('❌ Error disconnecting from database:', error);
            throw error;
        }
    }
    isServiceConnected() {
        return this.isConnected;
    }
    async saveMetrics(metrics) {
        try {
            const data = metrics.map(metric => ({
                blockNumber: metric.blockNumber,
                gasPrice: metric.gasPrice,
                tps: metric.tps,
                blockTime: metric.blockTime,
                networkHealth: metric.networkHealth,
                totalTransactions: metric.totalTransactions,
                timestamp: metric.timestamp,
                createdAt: new Date()
            }));
            await this.prisma.metrics.createMany({
                data,
                skipDuplicates: true
            });
            logger_1.default.debug(`Saved ${metrics.length} metrics to database`);
        }
        catch (error) {
            logger_1.default.error('Error saving metrics:', error);
            throw error;
        }
    }
    async getMetricsByTimeRange(startTime, endTime) {
        try {
            const metrics = await this.prisma.metrics.findMany({
                where: {
                    timestamp: {
                        gte: startTime,
                        lte: endTime
                    }
                },
                orderBy: {
                    timestamp: 'asc'
                }
            });
            return metrics.map(this.formatMetricsFromDB);
        }
        catch (error) {
            logger_1.default.error('Error fetching metrics by time range:', error);
            throw error;
        }
    }
    async getLatestMetrics(limit = 100) {
        try {
            const metrics = await this.prisma.metrics.findMany({
                take: limit,
                orderBy: {
                    timestamp: 'desc'
                }
            });
            return metrics.map(this.formatMetricsFromDB);
        }
        catch (error) {
            logger_1.default.error('Error fetching latest metrics:', error);
            throw error;
        }
    }
    async saveHourlyAggregate(metrics, timestamp) {
        try {
            await this.prisma.hourlyAggregates.upsert({
                where: { timestamp },
                update: {
                    blockNumber: metrics.blockNumber,
                    gasPrice: metrics.gasPrice,
                    tps: metrics.tps,
                    blockTime: metrics.blockTime,
                    networkHealth: metrics.networkHealth,
                    totalTransactions: metrics.totalTransactions,
                    updatedAt: new Date()
                },
                create: {
                    timestamp,
                    blockNumber: metrics.blockNumber,
                    gasPrice: metrics.gasPrice,
                    tps: metrics.tps,
                    blockTime: metrics.blockTime,
                    networkHealth: metrics.networkHealth,
                    totalTransactions: metrics.totalTransactions,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });
            logger_1.default.debug('Saved hourly aggregate to database');
        }
        catch (error) {
            logger_1.default.error('Error saving hourly aggregate:', error);
            throw error;
        }
    }
    async getHourlyAggregatesByTimeRange(startTime, endTime) {
        try {
            const aggregates = await this.prisma.hourlyAggregates.findMany({
                where: {
                    timestamp: {
                        gte: startTime,
                        lte: endTime
                    }
                },
                orderBy: {
                    timestamp: 'asc'
                }
            });
            return aggregates.map(this.formatMetricsFromDB);
        }
        catch (error) {
            logger_1.default.error('Error fetching hourly aggregates:', error);
            throw error;
        }
    }
    async saveDailyAggregate(metrics, timestamp) {
        try {
            await this.prisma.dailyAggregates.upsert({
                where: { timestamp },
                update: {
                    blockNumber: metrics.blockNumber,
                    gasPrice: metrics.gasPrice,
                    tps: metrics.tps,
                    blockTime: metrics.blockTime,
                    networkHealth: metrics.networkHealth,
                    totalTransactions: metrics.totalTransactions,
                    updatedAt: new Date()
                },
                create: {
                    timestamp,
                    blockNumber: metrics.blockNumber,
                    gasPrice: metrics.gasPrice,
                    tps: metrics.tps,
                    blockTime: metrics.blockTime,
                    networkHealth: metrics.networkHealth,
                    totalTransactions: metrics.totalTransactions,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });
            logger_1.default.debug('Saved daily aggregate to database');
        }
        catch (error) {
            logger_1.default.error('Error saving daily aggregate:', error);
            throw error;
        }
    }
    async getDailyAggregatesByTimeRange(startTime, endTime) {
        try {
            const aggregates = await this.prisma.dailyAggregates.findMany({
                where: {
                    timestamp: {
                        gte: startTime,
                        lte: endTime
                    }
                },
                orderBy: {
                    timestamp: 'asc'
                }
            });
            return aggregates.map(this.formatMetricsFromDB);
        }
        catch (error) {
            logger_1.default.error('Error fetching daily aggregates:', error);
            throw error;
        }
    }
    async saveTransaction(transaction) {
        try {
            await this.prisma.transactions.create({
                data: {
                    hash: transaction.hash,
                    from: transaction.from,
                    to: transaction.to,
                    value: transaction.value,
                    gasPrice: transaction.gasPrice,
                    gasUsed: transaction.gasUsed.toString(),
                    gasLimit: '0',
                    blockNumber: transaction.blockNumber,
                    blockHash: '',
                    timestamp: new Date(transaction.timestamp * 1000),
                    status: transaction.status,
                    type: transaction.type,
                    createdAt: new Date()
                }
            });
            logger_1.default.debug('Saved transaction to database:', transaction.hash);
        }
        catch (error) {
            logger_1.default.error('Error saving transaction:', error);
            throw error;
        }
    }
    async saveTransactions(transactions) {
        try {
            const data = transactions.map(transaction => ({
                hash: transaction.hash,
                from: transaction.from,
                to: transaction.to,
                value: transaction.value,
                gasPrice: transaction.gasPrice,
                gasUsed: transaction.gasUsed.toString(),
                gasLimit: '0',
                blockNumber: transaction.blockNumber,
                blockHash: '',
                timestamp: new Date(transaction.timestamp * 1000),
                status: transaction.status,
                type: transaction.type,
                createdAt: new Date()
            }));
            await this.prisma.transactions.createMany({
                data,
                skipDuplicates: true
            });
            logger_1.default.debug(`Saved ${transactions.length} transactions to database`);
        }
        catch (error) {
            logger_1.default.error('Error saving transactions:', error);
            throw error;
        }
    }
    async getTransactionsByTimeRange(startTime, endTime, limit = 1000) {
        try {
            const transactions = await this.prisma.transactions.findMany({
                where: {
                    timestamp: {
                        gte: startTime,
                        lte: endTime
                    }
                },
                take: limit,
                orderBy: {
                    timestamp: 'desc'
                }
            });
            return transactions.map(this.formatTransactionFromDB);
        }
        catch (error) {
            logger_1.default.error('Error fetching transactions by time range:', error);
            throw error;
        }
    }
    async getTransactionByHash(hash) {
        try {
            const transaction = await this.prisma.transactions.findUnique({
                where: { hash }
            });
            return transaction ? this.formatTransactionFromDB(transaction) : null;
        }
        catch (error) {
            logger_1.default.error('Error fetching transaction by hash:', error);
            throw error;
        }
    }
    async getLatestTransactions(limit = 20) {
        try {
            const transactions = await this.prisma.transactions.findMany({
                take: limit,
                orderBy: {
                    timestamp: 'desc'
                }
            });
            return transactions.map(this.formatTransactionFromDB);
        }
        catch (error) {
            logger_1.default.error('Error fetching latest transactions:', error);
            throw error;
        }
    }
    async saveAlert(alert) {
        try {
            const savedAlert = await this.prisma.alerts.create({
                data: {
                    type: alert.type,
                    condition: alert.condition,
                    threshold: alert.threshold,
                    message: alert.message,
                    triggered: false,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });
            return savedAlert.id;
        }
        catch (error) {
            logger_1.default.error('Error saving alert:', error);
            throw error;
        }
    }
    async updateAlertStatus(id, triggered) {
        try {
            await this.prisma.alerts.update({
                where: { id },
                data: {
                    triggered,
                    updatedAt: new Date()
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error updating alert status:', error);
            throw error;
        }
    }
    async deleteAlert(id) {
        try {
            await this.prisma.alerts.delete({
                where: { id }
            });
        }
        catch (error) {
            logger_1.default.error('Error deleting alert:', error);
            throw error;
        }
    }
    async getAlerts() {
        try {
            return await this.prisma.alerts.findMany({
                orderBy: {
                    createdAt: 'desc'
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching alerts:', error);
            throw error;
        }
    }
    async createUser(userData) {
        try {
            const user = await this.prisma.users.create({
                data: {
                    email: userData.email,
                    passwordHash: userData.passwordHash,
                    name: userData.name,
                    createdAt: userData.createdAt || new Date(),
                    lastLogin: userData.lastLogin || null,
                    updatedAt: new Date()
                }
            });
            return {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            };
        }
        catch (error) {
            logger_1.default.error('Error creating user:', error);
            throw error;
        }
    }
    async getUserByEmail(email) {
        try {
            return await this.prisma.users.findUnique({
                where: { email }
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching user by email:', error);
            throw error;
        }
    }
    async getUserById(id) {
        try {
            return await this.prisma.users.findUnique({
                where: { id },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    createdAt: true,
                    lastLogin: true
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching user by ID:', error);
            throw error;
        }
    }
    async updateUserLastLogin(userId) {
        try {
            await this.prisma.users.update({
                where: { id: userId },
                data: {
                    lastLogin: new Date(),
                    updatedAt: new Date()
                }
            });
            logger_1.default.debug(`Updated last login for user: ${userId}`);
        }
        catch (error) {
            logger_1.default.error('Error updating user last login:', error);
            throw error;
        }
    }
    async getMetricsInRange(startTime, endTime) {
        return this.getMetricsByTimeRange(startTime, endTime);
    }
    async getAnalytics(timeRange) {
        try {
            const [totalTransactions, avgTps, avgBlockTime, avgNetworkHealth, peakTps, transactionsByType, hourlyActivity] = await Promise.all([
                this.prisma.transactions.count({
                    where: {
                        timestamp: {
                            gte: timeRange.start,
                            lte: timeRange.end
                        }
                    }
                }),
                this.prisma.metrics.aggregate({
                    where: {
                        timestamp: {
                            gte: timeRange.start,
                            lte: timeRange.end
                        }
                    },
                    _avg: { tps: true }
                }),
                this.prisma.metrics.aggregate({
                    where: {
                        timestamp: {
                            gte: timeRange.start,
                            lte: timeRange.end
                        }
                    },
                    _avg: { blockTime: true }
                }),
                this.prisma.metrics.aggregate({
                    where: {
                        timestamp: {
                            gte: timeRange.start,
                            lte: timeRange.end
                        }
                    },
                    _avg: { networkHealth: true }
                }),
                this.prisma.metrics.aggregate({
                    where: {
                        timestamp: {
                            gte: timeRange.start,
                            lte: timeRange.end
                        }
                    },
                    _max: { tps: true }
                }),
                this.prisma.transactions.groupBy({
                    by: ['type'],
                    where: {
                        timestamp: {
                            gte: timeRange.start,
                            lte: timeRange.end
                        }
                    },
                    _count: { _all: true }
                }),
                this.prisma.$queryRaw `
          SELECT 
            DATE_TRUNC('hour', timestamp) as hour,
            COUNT(*) as transaction_count,
            AVG(tps) as avg_tps
          FROM metrics 
          WHERE timestamp >= ${timeRange.start} AND timestamp <= ${timeRange.end}
          GROUP BY hour
          ORDER BY hour
        `
            ]);
            return {
                totalTransactions,
                avgTps: avgTps._avg.tps || 0,
                avgBlockTime: avgBlockTime._avg.blockTime || 0,
                avgNetworkHealth: avgNetworkHealth._avg.networkHealth || 0,
                peakTps: peakTps._max.tps || 0,
                transactionsByType,
                hourlyActivity
            };
        }
        catch (error) {
            logger_1.default.error('Error fetching analytics:', error);
            throw error;
        }
    }
    async cleanupOldMetrics(cutoffDate) {
        try {
            const deletedMetrics = await this.prisma.metrics.deleteMany({
                where: {
                    timestamp: {
                        lt: cutoffDate
                    }
                }
            });
            const deletedTransactions = await this.prisma.transactions.deleteMany({
                where: {
                    timestamp: {
                        lt: cutoffDate
                    }
                }
            });
            logger_1.default.info(`Cleaned up ${deletedMetrics.count} metrics and ${deletedTransactions.count} transactions`);
        }
        catch (error) {
            logger_1.default.error('Error cleaning up old data:', error);
            throw error;
        }
    }
    async healthCheck() {
        try {
            const start = Date.now();
            await this.prisma.$queryRaw `SELECT 1`;
            const queryTime = Date.now() - start;
            const [metricsCount, transactionsCount] = await Promise.all([
                this.prisma.metrics.count(),
                this.prisma.transactions.count()
            ]);
            return {
                status: 'healthy',
                details: {
                    connected: this.isConnected,
                    queryTime: `${queryTime}ms`,
                    totalMetrics: metricsCount,
                    totalTransactions: transactionsCount,
                    timestamp: new Date().toISOString()
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                details: {
                    connected: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }
    formatMetricsFromDB(dbMetrics) {
        return {
            blockNumber: dbMetrics.blockNumber,
            gasPrice: dbMetrics.gasPrice,
            tps: dbMetrics.tps,
            blockTime: dbMetrics.blockTime,
            networkHealth: dbMetrics.networkHealth,
            totalTransactions: dbMetrics.totalTransactions,
            timestamp: dbMetrics.timestamp
        };
    }
    formatTransactionFromDB(dbTransaction) {
        return {
            hash: dbTransaction.hash,
            from: dbTransaction.from,
            to: dbTransaction.to,
            value: dbTransaction.value,
            gasPrice: dbTransaction.gasPrice,
            gasUsed: parseInt(dbTransaction.gasUsed),
            status: dbTransaction.status === 'success' ? 'confirmed' : dbTransaction.status,
            timestamp: Math.floor(dbTransaction.timestamp.getTime() / 1000),
            blockNumber: dbTransaction.blockNumber,
            type: ['burn', 'bridge'].includes(dbTransaction.type) ? 'contract' : dbTransaction.type
        };
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=DatabaseService.js.map