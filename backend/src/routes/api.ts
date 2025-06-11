import { Router } from 'express'

const router = Router()

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  })
})

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Monad Analytics API',
    version: '1.0.0',
    endpoints: [
      'GET /api/health',
      'GET /api/metrics',
      'POST /api/auth/login',
      'GET /api/transactions'
    ],
    timestamp: new Date().toISOString()
  })
})

export default router 