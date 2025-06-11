import { Router, Request, Response } from 'express'
import { MonadRPCService } from '../services/MonadRPCService'
import { MetricsCollector } from '../services/MetricsCollector'
import { DatabaseService } from '../services/DatabaseService'
import logger from '../utils/logger'

const router = Router()

// Get current real-time metrics
router.get('/current', async (req: Request, res: Response): Promise<void> => {
  try {
    const rpcService = MonadRPCService.getInstance()
    const currentMetrics = rpcService.getCurrentMetrics()
    
    if (!currentMetrics) {
      res.status(503).json({
        success: false,
        error: 'RPC service not connected',
        message: 'Unable to fetch current metrics'
      })
      return
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
    })
  } catch (error) {
    logger.error('Error fetching current metrics:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch metrics'
    })
  }
})

// Get metrics history
router.get('/history', async (req: Request, res: Response): Promise<void> => {
  try {
    const { timeRange = '24h', interval = '5m' } = req.query
    const dbService = DatabaseService.getInstance()
    
    // Calculate time range
    const now = new Date()
    let startTime: Date
    
    switch (timeRange) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case '6h':
        startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000)
        break
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }

    const metrics = await dbService.getMetricsInRange(startTime, now)
    
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
    })
  } catch (error) {
    logger.error('Error fetching metrics history:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch metrics history'
    })
  }
})

// Get network status
router.get('/network', async (req: Request, res: Response): Promise<void> => {
  try {
    const rpcService = MonadRPCService.getInstance()
    const isConnected = rpcService.isServiceConnected()
    const currentMetrics = rpcService.getCurrentMetrics()
    
    res.json({
      success: true,
      data: {
        connected: isConnected,
        chainId: 41454, // Monad Testnet
        networkName: 'Monad Testnet',
        blockNumber: currentMetrics?.blockNumber || 0,
        lastUpdate: currentMetrics?.timestamp || new Date(),
        rpcEndpoints: ['https://testnet-rpc.monad.xyz'],
        healthScore: currentMetrics?.networkHealth || 0
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Error fetching network status:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch network status'
    })
  }
})

// Get recent transactions
router.get('/transactions', async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = '50', type, status } = req.query
    const rpcService = MonadRPCService.getInstance()
    const limitNum = Math.min(parseInt(limit as string) || 50, 100) // Max 100
    
    let transactions = rpcService.getRecentTransactions(limitNum)
    
    // Filter by type if specified
    if (type && typeof type === 'string') {
      transactions = transactions.filter(tx => tx.type === type)
    }
    
    // Filter by status if specified  
    if (status && typeof status === 'string') {
      transactions = transactions.filter(tx => tx.status === status)
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
    })
  } catch (error) {
    logger.error('Error fetching transactions:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch transactions'
    })
  }
})

// Get alerts
router.get('/alerts', async (req: Request, res: Response): Promise<void> => {
  try {
    // Bu endpoint MetricsCollector'den alert'leri çekecek
    // Şimdilik mock data döndürelim
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
    ]
    
    res.json({
      success: true,
      data: alerts,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Error fetching alerts:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch alerts'
    })
  }
})

// Health check for metrics service
router.get('/health', async (req: Request, res: Response): Promise<void> => {
  try {
    const rpcService = MonadRPCService.getInstance()
    const dbService = DatabaseService.getInstance()
    
    const rpcConnected = rpcService.isServiceConnected()
    const dbHealth = await dbService.healthCheck()
    
    const overall = rpcConnected && dbHealth.status === 'healthy'
    
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
    })
  } catch (error) {
    logger.error('Error checking metrics health:', error)
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: 'Health check failed'
    })
  }
})

export default router 