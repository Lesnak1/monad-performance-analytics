import type { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'

// Monad Testnet Configuration with Optimized RPC Endpoints
const MONAD_TESTNET_CONFIG = {
  chainId: 10143,
  chainName: 'Monad Testnet',
  nativeToken: 'MON',
  rpcEndpoints: [
    'https://testnet-rpc.monad.xyz',           // Official RPC (Most Reliable)
    'https://monad-testnet.rpc.hypersync.xyz', // Envio HyperRPC 
    'https://10143.rpc.hypersync.xyz',         // Envio Alternative
    'https://10143.rpc.thirdweb.com',          // Thirdweb fallback
    'https://monad-testnet.drpc.org'           // DRPC (Limited to 3 batch - use as fallback)
  ]
}

// Cache for performance
let cachedMetrics: any = null
let lastFetch = 0
const CACHE_DURATION = 3000 // 3 seconds cache for real-time feel

async function getWorkingProvider(): Promise<ethers.JsonRpcProvider> {
  for (let i = 0; i < MONAD_TESTNET_CONFIG.rpcEndpoints.length; i++) {
    try {
      const endpoint = MONAD_TESTNET_CONFIG.rpcEndpoints[i]
      const provider = new ethers.JsonRpcProvider(endpoint, MONAD_TESTNET_CONFIG.chainId)
      
      // Test connection with shorter timeout for faster failover
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      await Promise.race([
        provider.getBlockNumber(),
        new Promise((_, reject) => {
          controller.signal.addEventListener('abort', () => 
            reject(new Error('Connection timeout'))
          )
        })
      ])
      
      clearTimeout(timeoutId)
      console.log(`✅ Connected to ${endpoint}`)
      return provider
      
    } catch (error) {
      console.warn(`⚠️ RPC ${i + 1} (${MONAD_TESTNET_CONFIG.rpcEndpoints[i]}) failed, trying next...`)
      continue
    }
  }
  
  throw new Error('All RPC endpoints failed')
}

async function fetchMonadMetrics() {
  const now = Date.now()
  
  if (cachedMetrics && (now - lastFetch < CACHE_DURATION)) {
    return cachedMetrics
  }

  try {
    console.log('🔄 Fetching real Monad testnet data...')
    
    const provider = await getWorkingProvider()
    
    // First get current block number to ensure we're working with fresh data
    const latestBlockNumber = await provider.getBlockNumber()
    
    // CRITICAL: Limit to MAX 3 parallel requests to avoid DRPC batch limit
    // Split into two sequential batches
    const [blockNumber, feeData, latestBlock] = await Promise.all([
      Promise.resolve(latestBlockNumber),
      provider.getFeeData(),
      provider.getBlock(latestBlockNumber, true) // Get current block with transactions
    ])

    // Second batch - get previous block for TPS calculation
    const previousBlock = await provider.getBlock(latestBlockNumber - 1, true)

    if (latestBlock) {
      // Calculate real TPS from recent blocks with better logic
      let realTPS = 0
      let blockTime = 0.6 // Default Monad block time
      
      if (previousBlock && latestBlock.timestamp > previousBlock.timestamp) {
        const timeDiff = latestBlock.timestamp - previousBlock.timestamp
        const txCount = latestBlock.transactions?.length || 0
        blockTime = timeDiff
        
        if (timeDiff > 0) {
          realTPS = Math.round(txCount / timeDiff)
          
          // Handle edge cases for accurate TPS
          if (realTPS === 0 && txCount > 0) {
            realTPS = Math.round(txCount / 0.6) // Use standard block time
          }
          
          // Cap unrealistic TPS values
          if (realTPS > 10000) {
            realTPS = Math.round(txCount / Math.max(timeDiff, 0.3))
          }
        }
      }

      // Calculate network health based on recent activity
      const networkHealth = latestBlock.transactions?.length > 0 ? 
        Math.min(99, 95 + Math.floor((latestBlock.transactions.length / 100) * 4)) : 95

      // Real network data with current timestamp
      const realData = {
        success: true,
        data: {
          tps: Math.max(realTPS, 0),
          gasPrice: feeData.gasPrice ? parseFloat(ethers.formatUnits(feeData.gasPrice, 'gwei')) : 0,
          blockTime,
          networkHealth,
          blockNumber: latestBlockNumber, // Use the fresh block number
          timestamp: now, // Current timestamp for real-time feel
          chainId: MONAD_TESTNET_CONFIG.chainId,
          chainName: MONAD_TESTNET_CONFIG.chainName,
          transactionCount: latestBlock.transactions?.length || 0,
          gasUsed: latestBlock.gasUsed?.toString() || '0',
          gasLimit: latestBlock.gasLimit?.toString() || '0',
          blockHash: latestBlock.hash,
          lastBlockTime: latestBlock.timestamp,
          avgBlockTime: blockTime
        },
        timestamp: new Date().toISOString()
      }
      
      cachedMetrics = realData
      lastFetch = now
      
      console.log(`✅ Real data fetched: Block ${latestBlockNumber}, TPS ${realTPS}, Txs ${latestBlock.transactions?.length || 0}`)
      return realData
    }
  } catch (error) {
    console.error('❌ Failed to fetch real data:', error)
    
    // Return cached data if available on error
    if (cachedMetrics) {
      console.log('📦 Returning cached data due to fetch error')
      return cachedMetrics
    }
    
    return {
      success: false,
      error: 'Failed to fetch real-time data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      data: {
        tps: 0,
        gasPrice: 0,
        blockTime: 0.6,
        networkHealth: 50,
        blockNumber: 0,
        timestamp: now,
        chainId: MONAD_TESTNET_CONFIG.chainId,
        chainName: MONAD_TESTNET_CONFIG.chainName,
        transactionCount: 0
      }
    }
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Cache-Control', 'no-store, max-age=0')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    })
  }

  try {
    const metrics = await fetchMonadMetrics()
    res.status(200).json(metrics)
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
} 