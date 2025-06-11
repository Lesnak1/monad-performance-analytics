"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
dotenv_1.default.config();
const api_1 = __importDefault(require("./routes/api"));
const metrics_1 = __importDefault(require("./routes/metrics"));
const auth_1 = __importDefault(require("./routes/auth"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const rateLimiter_1 = __importDefault(require("./middleware/rateLimiter"));
const logger_1 = __importDefault(require("./utils/logger"));
const MonadRPCService_1 = require("./services/MonadRPCService");
const MetricsCollector_1 = require("./services/MetricsCollector");
const DatabaseService_1 = require("./services/DatabaseService");
const WebSocketService_1 = require("./services/WebSocketService");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 8000;
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        process.env.FRONTEND_URL || 'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/', rateLimiter_1.default);
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
    });
});
app.use('/api', api_1.default);
app.use('/api/metrics', metrics_1.default);
app.use('/api/auth', auth_1.default);
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        timestamp: new Date().toISOString()
    });
});
app.use(errorHandler_1.default);
const initializeServices = async () => {
    try {
        const dbService = DatabaseService_1.DatabaseService.getInstance();
        await dbService.connect();
        logger_1.default.info('✅ Database connected successfully');
        const rpcService = MonadRPCService_1.MonadRPCService.getInstance();
        await rpcService.initialize();
        logger_1.default.info('✅ Monad RPC service initialized');
        const metricsCollector = new MetricsCollector_1.MetricsCollector(rpcService, dbService);
        await metricsCollector.start();
        logger_1.default.info('✅ Metrics collector started');
        const wsService = new WebSocketService_1.WebSocketService(io, metricsCollector);
        wsService.initialize();
        logger_1.default.info('✅ WebSocket service initialized');
        process.on('SIGTERM', async () => {
            logger_1.default.info('🔄 Received SIGTERM, shutting down gracefully');
            await metricsCollector.stop();
            await dbService.disconnect();
            server.close(() => {
                logger_1.default.info('✅ Server closed successfully');
                process.exit(0);
            });
        });
        process.on('SIGINT', async () => {
            logger_1.default.info('🔄 Received SIGINT, shutting down gracefully');
            await metricsCollector.stop();
            await dbService.disconnect();
            server.close(() => {
                logger_1.default.info('✅ Server closed successfully');
                process.exit(0);
            });
        });
    }
    catch (error) {
        logger_1.default.error('❌ Failed to initialize services:', error);
        process.exit(1);
    }
};
server.listen(PORT, async () => {
    logger_1.default.info(`🚀 Monad Analytics Backend running on port ${PORT}`);
    logger_1.default.info(`📊 API Documentation: http://localhost:${PORT}/api`);
    logger_1.default.info(`💻 Environment: ${process.env.NODE_ENV || 'development'}`);
    await initializeServices();
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.default.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
process.on('uncaughtException', (error) => {
    logger_1.default.error('Uncaught Exception:', error);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=index.js.map