import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

// Load environment variables
dotenv.config()

// Import routes
import apiRoutes from './routes/api'
import metricsRoutes from './routes/metrics'
import authRoutes from './routes/auth'

// Import middleware
import errorHandler from './middleware/errorHandler'
import rateLimiter from './middleware/rateLimiter'
import logger from './utils/logger'

// Import services
import { MonadRPCService } from './services/MonadRPCService'
import { MetricsCollector } from './services/MetricsCollector'
import { DatabaseService } from './services/DatabaseService'
import { WebSocketService } from './services/WebSocketService'

const app = express()
const server = createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

const PORT = process.env.PORT || 8000

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}))

// Basic middleware
app.use(compression())
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate limiting
app.use('/api/', rateLimiter)

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  })
})

// API routes
app.use('/api', apiRoutes)
app.use('/api/metrics', metricsRoutes)
app.use('/api/auth', authRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    timestamp: new Date().toISOString()
  })
})

// Error handling middleware
app.use(errorHandler)

// Initialize services
const initializeServices = async () => {
  try {
    // Initialize database
    const dbService = DatabaseService.getInstance()
    await dbService.connect()
    logger.info('✅ Database connected successfully')

    // Initialize Monad RPC Service
    logger.info('🔗 Connecting to Monad Testnet...')
    const rpcService = MonadRPCService.getInstance()
    await rpcService.connect()
    logger.info('✅ Monad RPC service initialized')

    // Initialize metrics collector
    const metricsCollector = new MetricsCollector(rpcService, dbService)
    await metricsCollector.start()
    logger.info('✅ Metrics collector started')

    // Initialize WebSocket service
    const wsService = new WebSocketService(io, metricsCollector)
    wsService.initialize()
    logger.info('✅ WebSocket service initialized')

    // Graceful shutdown handling
    process.on('SIGTERM', async () => {
      logger.info('🔄 Received SIGTERM, shutting down gracefully')
      await metricsCollector.stop()
      await dbService.disconnect()
      server.close(() => {
        logger.info('✅ Server closed successfully')
        process.exit(0)
      })
    })

    process.on('SIGINT', async () => {
      logger.info('🔄 Received SIGINT, shutting down gracefully')
      await metricsCollector.stop()
      await dbService.disconnect()
      server.close(() => {
        logger.info('✅ Server closed successfully')
        process.exit(0)
      })
    })

  } catch (error) {
    logger.error('❌ Failed to initialize services:', error)
    process.exit(1)
  }
}

// Start server
server.listen(PORT, async () => {
  logger.info(`🚀 Monad Analytics Backend running on port ${PORT}`)
  logger.info(`📊 API Documentation: http://localhost:${PORT}/api`)
  logger.info(`💻 Environment: ${process.env.NODE_ENV || 'development'}`)
  
  // Initialize services after server starts
  await initializeServices()
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  process.exit(1)
})

export default app 