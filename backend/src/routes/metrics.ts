import { Router } from 'express'

const router = Router()

// Get current metrics
router.get('/current', (req, res) => {
  res.json({
    success: true,
    data: {
      tps: 150,
      gasPrice: 52.4,
      blockTime: 0.6,
      networkHealth: 96,
      blockNumber: 21111778,
      timestamp: Date.now()
    },
    timestamp: new Date().toISOString()
  })
})

// Get metrics history
router.get('/history', (req, res) => {
  res.json({
    success: true,
    data: [],
    timestamp: new Date().toISOString()
  })
})

export default router 