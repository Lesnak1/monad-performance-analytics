import type { NextApiRequest, NextApiResponse } from 'next'
import { getMonadMetrics } from '../../lib/monadData'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get current metrics from Monad testnet
    const metrics = await getMonadMetrics()
    
    // Add timestamp
    const response = {
      ...metrics,
      timestamp: Date.now(),
      status: 'success'
    }

    // Set cache headers for real-time data
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    res.setHeader('Access-Control-Allow-Origin', '*')

    res.status(200).json(response)
  } catch (error) {
    console.error('API Error:', error)
    
    res.status(500).json({
      error: 'Failed to fetch metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
      status: 'error'
    })
  }
} 