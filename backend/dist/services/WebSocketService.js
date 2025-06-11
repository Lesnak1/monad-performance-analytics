"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
const MonadRPCService_1 = require("./MonadRPCService");
const logger_1 = __importDefault(require("../utils/logger"));
class WebSocketService {
    constructor(io, metricsCollector) {
        this.connectedUsers = new Map();
        this.broadcastIntervals = new Map();
        this.roomStats = new Map();
        this.io = io;
        this.metricsCollector = metricsCollector;
    }
    initialize() {
        this.setupSocketHandlers();
        this.setupBroadcastIntervals();
        this.setupAlertListeners();
        logger_1.default.info('✅ WebSocket service initialized');
    }
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            const userId = socket.id;
            const user = {
                id: userId,
                socket,
                subscriptions: [],
                joinedAt: new Date()
            };
            this.connectedUsers.set(userId, user);
            logger_1.default.info(`🔗 New WebSocket connection: ${userId}`);
            this.sendInitialData(socket);
            socket.on('subscribe', (data) => {
                this.handleSubscription(userId, data);
            });
            socket.on('unsubscribe', (data) => {
                this.handleUnsubscription(userId, data);
            });
            socket.on('request', async (data, callback) => {
                await this.handleRequest(userId, data, callback);
            });
            socket.on('ping', () => {
                socket.emit('pong', { timestamp: Date.now() });
            });
            socket.on('disconnect', (reason) => {
                this.handleDisconnection(userId, reason);
            });
            socket.on('error', (error) => {
                logger_1.default.error(`WebSocket error for user ${userId}:`, error);
            });
        });
    }
    async sendInitialData(socket) {
        try {
            const rpcService = MonadRPCService_1.MonadRPCService.getInstance();
            const currentMetrics = rpcService.getCurrentMetrics();
            const recentTransactions = rpcService.getRecentTransactions(10);
            socket.emit('initial_data', {
                metrics: currentMetrics,
                transactions: recentTransactions,
                timestamp: new Date().toISOString(),
                server_time: Date.now()
            });
            socket.emit('connection_status', {
                connected: true,
                userId: socket.id,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            logger_1.default.error('Error sending initial data:', error);
            socket.emit('error', {
                message: 'Failed to send initial data',
                timestamp: new Date().toISOString()
            });
        }
    }
    handleSubscription(userId, data) {
        const user = this.connectedUsers.get(userId);
        if (!user)
            return;
        const { type, params } = data;
        if (!user.subscriptions.includes(type)) {
            user.subscriptions.push(type);
        }
        user.socket.join(`subscription_${type}`);
        const roomName = `subscription_${type}`;
        const currentCount = this.roomStats.get(roomName) || 0;
        this.roomStats.set(roomName, currentCount + 1);
        logger_1.default.debug(`User ${userId} subscribed to ${type}`, params);
        user.socket.emit('subscription_confirmed', {
            type,
            params,
            timestamp: new Date().toISOString()
        });
        this.sendSubscriptionData(user.socket, type, params);
    }
    handleUnsubscription(userId, data) {
        const user = this.connectedUsers.get(userId);
        if (!user)
            return;
        const { type } = data;
        user.subscriptions = user.subscriptions.filter(sub => sub !== type);
        user.socket.leave(`subscription_${type}`);
        const roomName = `subscription_${type}`;
        const currentCount = this.roomStats.get(roomName) || 0;
        this.roomStats.set(roomName, Math.max(0, currentCount - 1));
        logger_1.default.debug(`User ${userId} unsubscribed from ${type}`);
        user.socket.emit('unsubscription_confirmed', {
            type,
            timestamp: new Date().toISOString()
        });
    }
    async handleRequest(userId, data, callback) {
        const user = this.connectedUsers.get(userId);
        if (!user)
            return;
        try {
            const { type, params } = data;
            let response = null;
            switch (type) {
                case 'get_metrics_history':
                    const limit = params?.limit || 100;
                    response = MonadRPCService_1.MonadRPCService.getInstance().getMetricsHistory(limit);
                    break;
                case 'get_recent_transactions':
                    const txLimit = params?.limit || 20;
                    response = MonadRPCService_1.MonadRPCService.getInstance().getRecentTransactions(txLimit);
                    break;
                case 'get_processed_metrics':
                    response = await this.metricsCollector.getCurrentProcessedMetrics();
                    break;
                case 'get_alerts':
                    response = this.metricsCollector.getAlerts();
                    break;
                case 'export_metrics':
                    const format = params?.format || 'json';
                    const timeRange = params?.timeRange || {
                        start: new Date(Date.now() - 24 * 60 * 60 * 1000),
                        end: new Date()
                    };
                    response = await this.metricsCollector.exportMetrics(format, timeRange);
                    break;
                case 'get_connection_stats':
                    response = this.getConnectionStats();
                    break;
                default:
                    throw new Error(`Unknown request type: ${type}`);
            }
            if (callback && typeof callback === 'function') {
                callback({
                    success: true,
                    data: response,
                    timestamp: new Date().toISOString()
                });
            }
        }
        catch (error) {
            logger_1.default.error(`Error handling request ${data.type} for user ${userId}:`, error);
            if (callback && typeof callback === 'function') {
                callback({
                    success: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }
    }
    async sendSubscriptionData(socket, type, params) {
        try {
            let data = null;
            switch (type) {
                case 'live_metrics':
                    data = MonadRPCService_1.MonadRPCService.getInstance().getCurrentMetrics();
                    break;
                case 'live_transactions':
                    const limit = params?.limit || 10;
                    data = MonadRPCService_1.MonadRPCService.getInstance().getRecentTransactions(limit);
                    break;
                case 'alerts':
                    data = this.metricsCollector.getAlerts().filter(alert => alert.triggered);
                    break;
                case 'network_health':
                    const metrics = MonadRPCService_1.MonadRPCService.getInstance().getCurrentMetrics();
                    data = metrics ? { health: metrics.networkHealth, timestamp: metrics.timestamp } : null;
                    break;
            }
            if (data) {
                socket.emit('subscription_data', {
                    type,
                    data,
                    timestamp: new Date().toISOString()
                });
            }
        }
        catch (error) {
            logger_1.default.error(`Error sending subscription data for ${type}:`, error);
        }
    }
    handleDisconnection(userId, reason) {
        const user = this.connectedUsers.get(userId);
        if (user) {
            user.subscriptions.forEach(subscription => {
                const roomName = `subscription_${subscription}`;
                const currentCount = this.roomStats.get(roomName) || 0;
                this.roomStats.set(roomName, Math.max(0, currentCount - 1));
            });
        }
        this.connectedUsers.delete(userId);
        logger_1.default.info(`🔌 WebSocket disconnection: ${userId} (${reason})`);
    }
    setupBroadcastIntervals() {
        const metricsInterval = setInterval(() => {
            this.broadcastToSubscribers('live_metrics');
        }, 5000);
        this.broadcastIntervals.set('metrics', metricsInterval);
        const transactionsInterval = setInterval(() => {
            this.broadcastToSubscribers('live_transactions');
        }, 3000);
        this.broadcastIntervals.set('transactions', transactionsInterval);
        const healthInterval = setInterval(() => {
            this.broadcastToSubscribers('network_health');
        }, 10000);
        this.broadcastIntervals.set('health', healthInterval);
        const statsInterval = setInterval(() => {
            this.broadcastConnectionStats();
        }, 60000);
        this.broadcastIntervals.set('stats', statsInterval);
    }
    async broadcastToSubscribers(subscriptionType) {
        try {
            const roomName = `subscription_${subscriptionType}`;
            const subscriberCount = this.roomStats.get(roomName) || 0;
            if (subscriberCount === 0)
                return;
            let data = null;
            switch (subscriptionType) {
                case 'live_metrics':
                    data = MonadRPCService_1.MonadRPCService.getInstance().getCurrentMetrics();
                    break;
                case 'live_transactions':
                    data = MonadRPCService_1.MonadRPCService.getInstance().getRecentTransactions(10);
                    break;
                case 'network_health':
                    const metrics = MonadRPCService_1.MonadRPCService.getInstance().getCurrentMetrics();
                    data = metrics ? { health: metrics.networkHealth, timestamp: metrics.timestamp } : null;
                    break;
            }
            if (data) {
                this.io.to(roomName).emit('subscription_data', {
                    type: subscriptionType,
                    data,
                    timestamp: new Date().toISOString()
                });
            }
        }
        catch (error) {
            logger_1.default.error(`Error broadcasting to ${subscriptionType} subscribers:`, error);
        }
    }
    setupAlertListeners() {
        process.on('alert', (alert) => {
            this.broadcastAlert(alert);
        });
    }
    broadcastAlert(alert) {
        try {
            this.io.emit('alert', {
                alert,
                timestamp: new Date().toISOString()
            });
            this.io.to('subscription_alerts').emit('subscription_data', {
                type: 'alerts',
                data: alert,
                timestamp: new Date().toISOString()
            });
            logger_1.default.info(`📢 Alert broadcasted to ${this.connectedUsers.size} clients:`, alert.message);
        }
        catch (error) {
            logger_1.default.error('Error broadcasting alert:', error);
        }
    }
    broadcastConnectionStats() {
        const stats = this.getConnectionStats();
        this.io.emit('connection_stats', {
            stats,
            timestamp: new Date().toISOString()
        });
    }
    getConnectionStats() {
        const subscriptionCounts = {};
        this.roomStats.forEach((count, roomName) => {
            if (roomName.startsWith('subscription_')) {
                const subscriptionType = roomName.replace('subscription_', '');
                subscriptionCounts[subscriptionType] = count;
            }
        });
        return {
            totalConnections: this.connectedUsers.size,
            subscriptionCounts,
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        };
    }
    broadcastMessage(event, data) {
        this.io.emit(event, {
            ...data,
            timestamp: new Date().toISOString()
        });
    }
    broadcastToRoom(room, event, data) {
        try {
            this.io.to(room).emit(event, {
                ...data,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            logger_1.default.error('Failed to broadcast to room:', {
                room,
                error: error.message,
            });
        }
    }
    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }
    getSubscriptionStats() {
        const stats = {};
        this.roomStats.forEach((count, roomName) => {
            if (roomName.startsWith('subscription_')) {
                const subscriptionType = roomName.replace('subscription_', '');
                stats[subscriptionType] = count;
            }
        });
        return stats;
    }
    cleanup() {
        this.broadcastIntervals.forEach((interval) => {
            clearInterval(interval);
        });
        this.broadcastIntervals.clear();
        this.connectedUsers.forEach((user) => {
            user.socket.disconnect(true);
        });
        this.connectedUsers.clear();
        this.roomStats.clear();
        logger_1.default.info('✅ WebSocket service cleaned up');
    }
}
exports.WebSocketService = WebSocketService;
//# sourceMappingURL=WebSocketService.js.map