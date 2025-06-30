import type { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'

// Optimized RPC configuration matching metrics API
const MONAD_TESTNET_CONFIG = {
  chainId: 10143,
  chainName: 'Monad Testnet',
  nativeToken: 'MON',
  rpcEndpoints: [
    'https://testnet-rpc.monad.xyz',           // Official RPC (Most Reliable)
    'https://monad-testnet.rpc.hypersync.xyz', // Envio HyperRPC 
    'https://10143.rpc.hypersync.xyz',         // Envio Alternative
    'https://10143.rpc.thirdweb.com',          // Thirdweb fallback
    'https://monad-testnet.drpc.org'           // DRPC (Limited batch - use as fallback)
  ],
  blockExplorers: [
    'https://monad-testnet.socialscan.io',
    'https://testnet.monadexplorer.com'
  ]
}

let currentProviderIndex = 0
let cachedStatus: any = null
let lastStatusFetch = 0
const STATUS_CACHE_DURATION = 2000 // 2 seconds cache

async function getNetworkStatus() {
  const now = Date.now()
  
  // Return cached status if still fresh
  if (cachedStatus && (now - lastStatusFetch < STATUS_CACHE_DURATION)) {
    return cachedStatus
  }

  try {
    console.log('🔄 Fetching real Monad testnet data...')
    
    for (let i = 0; i < MONAD_TESTNET_CONFIG.rpcEndpoints.length; i++) {
      try {
        const endpoint = MONAD_TESTNET_CONFIG.rpcEndpoints[currentProviderIndex]
        const provider = new ethers.JsonRpcProvider(endpoint, MONAD_TESTNET_CONFIG.chainId)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 4000) // Shorter timeout
        
        // Single request instead of batch to avoid DRPC limit
        const blockNumber = await Promise.race([
          provider.getBlockNumber(),
          new Promise((_, reject) => {
            controller.signal.addEventListener('abort', () => 
              reject(new Error('Connection timeout'))
            )
          })
        ]) as number
        
        clearTimeout(timeoutId)
        
        // Get gas price in separate request to avoid batch limit
        let gasPrice = 0
        try {
          const feeData = await provider.getFeeData()
          gasPrice = feeData.gasPrice ? parseFloat(ethers.formatUnits(feeData.gasPrice, 'gwei')) : 0
        } catch (gasPriceError) {
          console.warn('⚠️ Failed to get gas price, using default')
          gasPrice = 0.001 // Default gas price
        }
        
        const statusData = {
          success: true,
          data: {
            connected: true,
            chainId: MONAD_TESTNET_CONFIG.chainId,
            chainName: MONAD_TESTNET_CONFIG.chainName,
            blockNumber,
            rpcUrl: endpoint,
            explorerUrl: MONAD_TESTNET_CONFIG.blockExplorers[0],
            gasPrice,
            lastUpdate: new Date(),
            currentRpcIndex: currentProviderIndex,
            availableRpcs: MONAD_TESTNET_CONFIG.rpcEndpoints.length,
            networkLatency: '< 200ms',
            networkStatus: 'healthy'
          },
          timestamp: new Date().toISOString()
        }
        
        // Cache the successful result
        cachedStatus = statusData
        lastStatusFetch = now
        
        console.log(`✅ Connected to ${endpoint}`)
        return statusData
        
      } catch (error) {
        console.warn(`⚠️ RPC ${currentProviderIndex + 1} (${MONAD_TESTNET_CONFIG.rpcEndpoints[currentProviderIndex]}) failed:`, error.message)
        currentProviderIndex = (currentProviderIndex + 1) % MONAD_TESTNET_CONFIG.rpcEndpoints.length
        continue
      }
    }
    
    throw new Error('All RPC endpoints failed')
    
  } catch (error) {
    console.error('❌ Network status check failed:', error)
    
    // Return cached data if available
    if (cachedStatus) {
      console.log('📦 Returning cached network status due to error')
      return cachedStatus
    }
    
    // Return fallback status
    return {
      success: false,
      data: {
        connected: false,
        chainId: MONAD_TESTNET_CONFIG.chainId,
        chainName: MONAD_TESTNET_CONFIG.chainName,
        blockNumber: 0,
        rpcUrl: 'Monad Testnet',
        explorerUrl: MONAD_TESTNET_CONFIG.blockExplorers[0],
        gasPrice: 0,
        lastUpdate: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
        networkStatus: 'disconnected'
      },
      error: 'Failed to connect to Monad Testnet',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
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
    const status = await getNetworkStatus()
    res.status(200).json(status)
  } catch (error) {
    console.error('Network Status API Error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      data: {
        connected: false,
        chainId: MONAD_TESTNET_CONFIG.chainId,
        chainName: MONAD_TESTNET_CONFIG.chainName,
        blockNumber: 0,
        rpcUrl: 'Monad Testnet',
        explorerUrl: MONAD_TESTNET_CONFIG.blockExplorers[0],
        gasPrice: 0,
        lastUpdate: new Date(),
        networkStatus: 'error'
      },
      timestamp: new Date().toISOString()
    })
  }
} 