"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MonadRPCService_1 = require("../services/MonadRPCService");
const DatabaseService_1 = require("../services/DatabaseService");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
router.get('/current', async (req, res) => {
    try {
        const rpcService = MonadRPCService_1.MonadRPCService.getInstance();
        const currentMetrics = rpcService.getCurrentMetrics();
        if (!currentMetrics) {
            res.status(503).json({
                success: false,
                error: 'RPC service not connected',
                message: 'Unable to fetch current metrics'
            });
            return;
        }
        res.json({
            success: true,
            data: {
                tps: currentMetrics.tps,
                gasPrice: currentMetrics.gasPrice,
                blockTime: currentMetrics.blockTime,
                networkHealth: currentMetrics.networkHealth,
                blockNumber: currentMetrics.blockNumber,
                timestamp: currentMetrics.timestamp,
                totalTransactions: currentMetrics.totalTransactions
            },
            source: 'live-rpc',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching current metrics:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to fetch metrics'
        });
    }
});
router.get('/history', async (req, res) => {
    try {
        const { timeRange = '24h', interval = '5m' } = req.query;
        const dbService = DatabaseService_1.DatabaseService.getInstance();
        const now = new Date();
        let startTime;
        switch (timeRange) {
            case '1h':
                startTime = new Date(now.getTime() - 60 * 60 * 1000);
                break;
            case '6h':
                startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
                break;
            case '24h':
                startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            default:
                startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }
        const metrics = await dbService.getMetricsInRange(startTime, now);
        res.json({
            success: true,
            data: metrics,
            meta: {
                timeRange,
                interval,
                startTime: startTime.toISOString(),
                endTime: now.toISOString(),
                count: metrics.length
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching metrics history:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to fetch metrics history'
        });
    }
});
router.get('/network', async (req, res) => {
    try {
        const rpcService = MonadRPCService_1.MonadRPCService.getInstance();
        const isConnected = rpcService.isServiceConnected();
        const currentMetrics = rpcService.getCurrentMetrics();
        res.json({
            success: true,
            data: {
                connected: isConnected,
                chainId: 41454,
                networkName: 'Monad Testnet',
                blockNumber: currentMetrics?.blockNumber || 0,
                lastUpdate: currentMetrics?.timestamp || new Date(),
                rpcEndpoints: ['https://testnet-rpc.monad.xyz'],
                healthScore: currentMetrics?.networkHealth || 0
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching network status:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to fetch network status'
        });
    }
});
router.get('/transactions', async (req, res) => {
    try {
        const { limit = '50', type, status } = req.query;
        const rpcService = MonadRPCService_1.MonadRPCService.getInstance();
        const limitNum = Math.min(parseInt(limit) || 50, 100);
        let transactions = rpcService.getRecentTransactions(limitNum);
        if (type && typeof type === 'string') {
            transactions = transactions.filter(tx => tx.type === type);
        }
        if (status && typeof status === 'string') {
            transactions = transactions.filter(tx => tx.status === status);
        }
        res.json({
            success: true,
            data: transactions,
            meta: {
                total: transactions.length,
                limit: limitNum,
                filters: { type, status }
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching transactions:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to fetch transactions'
        });
    }
});
router.get('/alerts', async (req, res) => {
    try {
        const alerts = [
            {
                id: 'alert-1',
                type: 'tps',
                condition: 'below',
                threshold: 100,
                triggered: false,
                message: 'TPS dropped below 100',
                timestamp: new Date()
            }
        ];
        res.json({
            success: true,
            data: alerts,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching alerts:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to fetch alerts'
        });
    }
});
router.get('/health', async (req, res) => {
    try {
        const rpcService = MonadRPCService_1.MonadRPCService.getInstance();
        const dbService = DatabaseService_1.DatabaseService.getInstance();
        const rpcConnected = rpcService.isServiceConnected();
        const dbHealth = await dbService.healthCheck();
        const overall = rpcConnected && dbHealth.status === 'healthy';
        res.json({
            success: true,
            status: overall ? 'healthy' : 'degraded',
            services: {
                rpc: {
                    status: rpcConnected ? 'healthy' : 'unhealthy',
                    connected: rpcConnected
                },
                database: dbHealth
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.default.error('Error checking metrics health:', error);
        res.status(500).json({
            success: false,
            status: 'unhealthy',
            error: 'Health check failed'
        });
    }
});
exports.default = router;
//# sourceMappingURL=metrics.js.map