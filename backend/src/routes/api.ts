import { Router, Request, Response } from 'express'
import { MonadRPCService } from '../services/MonadRPCService'
import { DatabaseService } from '../services/DatabaseService'
import logger from '../utils/logger'

const router = Router()

// Health check endpoint
router.get('/health', async (req: Request, res: Response): Promise<void> => {
  try {
    const rpcService = MonadRPCService.getInstance()
    const dbService = DatabaseService.getInstance()
    
    const rpcConnected = rpcService.isServiceConnected()
    const dbHealth = await dbService.healthCheck()
    
    res.json({
      success: true,
      message: 'API is healthy',
      services: {
        rpc: rpcConnected ? 'connected' : 'disconnected',
        database: dbHealth.status,
        uptime: process.uptime()
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Health check failed:', error)
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: (error as Error).message
    })
  }
})

// API info endpoint
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Monad Analytics API',
    version: '1.0.0',
    documentation: {
      endpoints: [
        'GET /api/health - API health status',
        'GET /api/metrics/current - Current network metrics',
        'GET /api/metrics/history - Historical metrics data',
        'GET /api/metrics/network - Network status',
        'GET /api/metrics/transactions - Recent transactions',
        'GET /api/metrics/alerts - Active alerts',
        'POST /api/auth/login - User authentication',
        'POST /api/auth/register - User registration'
      ],
      websocket: 'ws://localhost:3001 - Real-time updates',
      rateLimit: '100 requests per minute (general)'
    },
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  })
})

// Get live blockchain data (quick endpoint)
router.get('/live', async (req: Request, res: Response): Promise<void> => {
  try {
    const rpcService = MonadRPCService.getInstance()
    const currentMetrics = rpcService.getCurrentMetrics()
    const recentTx = rpcService.getRecentTransactions(10)
    
    res.json({
      success: true,
      data: {
        metrics: currentMetrics,
        recentTransactions: recentTx,
        lastUpdate: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Error fetching live data:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch live data'
    })
  }
})

// Get blockchain statistics
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const rpcService = MonadRPCService.getInstance()
    const dbService = DatabaseService.getInstance()
    
    const currentMetrics = rpcService.getCurrentMetrics()
    const metricsHistory = rpcService.getMetricsHistory(100)
    
    // Calculate 24h stats
    const last24h = metricsHistory.filter(m => 
      new Date(m.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
    )
    
    const avgTps = last24h.length > 0 
      ? last24h.reduce((sum, m) => sum + m.tps, 0) / last24h.length 
      : 0
    
    const peakTps = last24h.length > 0 
      ? Math.max(...last24h.map(m => m.tps)) 
      : 0
    
    res.json({
      success: true,
      data: {
        current: currentMetrics,
        statistics: {
          avgTps24h: Math.round(avgTps),
          peakTps24h: Math.round(peakTps),
          totalBlocks: currentMetrics?.blockNumber || 0,
          totalTransactions: last24h.reduce((sum, m) => sum + m.totalTransactions, 0),
          avgBlockTime: 0.6, // Monad's target block time
          networkUptime: 99.9 // Mock uptime percentage
        },
        period: '24h'
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Error fetching stats:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    })
  }
})

export default router 