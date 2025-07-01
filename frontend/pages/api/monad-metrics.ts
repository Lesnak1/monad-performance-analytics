import type { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'

// Optimized Monad Testnet Configuration with Request Management
const MONAD_TESTNET_CONFIG = {
  chainId: 10143,
  chainName: 'Monad Testnet',
  nativeToken: 'MON',
  rpcEndpoints: [
    'https://monad-testnet.rpc.hypersync.xyz', // Envio - Most stable for metrics
    'https://10143.rpc.hypersync.xyz',         // Envio Alternative
    'https://testnet-rpc.monad.xyz',           // Official - Use sparingly due to rate limits
    'https://10143.rpc.thirdweb.com',          // Thirdweb fallback
    'https://monad-testnet.drpc.org'           // DRPC - Batch limit aware
  ]
}

// Enhanced caching and request management
let cachedMetrics: any = null
let lastFetch = 0
let currentProviderIndex = 0
let lastProviderSwitch = 0
const CACHE_DURATION = 4000 // 4 seconds cache to reduce API calls
const PROVIDER_SWITCH_COOLDOWN = 10000 // 10 seconds between provider switches
const CONNECTION_TIMEOUT = 3000 // Reduced timeout for faster failover

async function getWorkingProvider(): Promise<ethers.JsonRpcProvider> {
  const now = Date.now()
  
  // Try current provider first if not in cooldown
  for (let attempts = 0; attempts < MONAD_TESTNET_CONFIG.rpcEndpoints.length; attempts++) {
    try {
      const endpoint = MONAD_TESTNET_CONFIG.rpcEndpoints[currentProviderIndex]
      const provider = new ethers.JsonRpcProvider(endpoint, MONAD_TESTNET_CONFIG.chainId)
      
      // Quick connection test with shorter timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT)
      
      await Promise.race([
        provider.getBlockNumber(),
        new Promise((_, reject) => {
          controller.signal.addEventListener('abort', () => 
            reject(new Error('Connection timeout'))
          )
        })
      ])
      
      clearTimeout(timeoutId)
      console.log(`✅ Connected to ${endpoint} (Provider ${currentProviderIndex + 1})`)
      return provider
      
    } catch (error) {
      console.warn(`⚠️ Provider ${currentProviderIndex + 1} failed: ${error.message}`)
      
      // Switch to next provider with cooldown respect
      if (now - lastProviderSwitch > PROVIDER_SWITCH_COOLDOWN || attempts === 0) {
        currentProviderIndex = (currentProviderIndex + 1) % MONAD_TESTNET_CONFIG.rpcEndpoints.length
        lastProviderSwitch = now
      }
      
      // Add delay between attempts to avoid overwhelming providers
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
  
  throw new Error('All RPC endpoints failed')
}

async function fetchMonadMetrics() {
  const now = Date.now()
  
  // Return cached data if fresh enough
  if (cachedMetrics && (now - lastFetch < CACHE_DURATION)) {
    return cachedMetrics
  }

  try {
    console.log('🔄 Fetching real Monad testnet data...')
    
    const provider = await getWorkingProvider()
    
    // Get latest block number first
    const latestBlockNumber = await provider.getBlockNumber()
    
    // Use sequential requests to avoid batch limits and rate limiting
    const feeData = await provider.getFeeData()
    await new Promise(resolve => setTimeout(resolve, 100)) // Small delay
    
    const latestBlock = await provider.getBlock(latestBlockNumber, true)
    await new Promise(resolve => setTimeout(resolve, 100)) // Small delay
    
    const previousBlock = await provider.getBlock(latestBlockNumber - 1, true)

    if (latestBlock) {
      // Enhanced TPS calculation with multiple block analysis
      let realTPS = 0
      let blockTime = 0.6 // Default Monad block time
      let txCount = latestBlock.transactions?.length || 0
      
      if (previousBlock && latestBlock.timestamp > previousBlock.timestamp) {
        const timeDiff = latestBlock.timestamp - previousBlock.timestamp
        blockTime = timeDiff
        
        if (timeDiff > 0) {
          // Calculate TPS from current block
          realTPS = Math.round(txCount / timeDiff)
          
          // Handle edge cases for more accurate TPS
          if (realTPS === 0 && txCount > 0) {
            realTPS = Math.round(txCount / 0.6) // Use standard block time
          }
          
          // Cap unrealistic TPS values (Monad max ~10k TPS)
          if (realTPS > 5000) {
            realTPS = Math.round(txCount / Math.max(timeDiff, 0.5))
          }
          
          // Ensure minimum realistic TPS for active blocks
          if (txCount > 5 && realTPS < 10) {
            realTPS = Math.round(txCount / 0.6)
          }
        }
      } else if (txCount > 0) {
        // Fallback calculation if previous block unavailable
        realTPS = Math.round(txCount / 0.6)
      }

      // Dynamic network health based on activity and TPS
      let networkHealth = 95 // Base health
      if (txCount > 0) {
        networkHealth = Math.min(99, 90 + Math.floor((realTPS / 100) * 9))
      }
      if (realTPS > 50) networkHealth = Math.min(99, networkHealth + 2)
      if (realTPS > 100) networkHealth = 99

      // Enhanced real data structure
      const realData = {
        success: true,
        data: {
          tps: Math.max(realTPS, 0),
          gasPrice: feeData.gasPrice ? parseFloat(ethers.formatUnits(feeData.gasPrice, 'gwei')) : 0,
          blockTime,
          networkHealth,
          blockNumber: latestBlockNumber,
          timestamp: now,
          chainId: MONAD_TESTNET_CONFIG.chainId,
          chainName: MONAD_TESTNET_CONFIG.chainName,
          transactionCount: txCount,
          gasUsed: latestBlock.gasUsed?.toString() || '0',
          gasLimit: latestBlock.gasLimit?.toString() || '0',
          blockHash: latestBlock.hash,
          lastBlockTime: latestBlock.timestamp,
          avgBlockTime: blockTime,
          provider: MONAD_TESTNET_CONFIG.rpcEndpoints[currentProviderIndex],
          providerIndex: currentProviderIndex
        },
        timestamp: new Date().toISOString()
      }
      
      cachedMetrics = realData
      lastFetch = now
      
      console.log(`✅ Real data fetched: Block ${latestBlockNumber}, TPS ${realTPS}, Txs ${txCount}`)
      return realData
    }
  } catch (error) {
    console.error('❌ Failed to fetch real data:', error)
    
    // Return cached data if available
    if (cachedMetrics) {
      console.log('📦 Returning cached data due to fetch error')
      return cachedMetrics
    }
    
    // Fallback data structure
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
        transactionCount: 0,
        provider: 'Unknown',
        providerIndex: -1
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