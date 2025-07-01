import { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'

// Optimized RPC providers for Monad Testnet with better rotation
const RPC_ENDPOINTS = [
  'https://monad-testnet.rpc.hypersync.xyz', // Envio - Most stable
  'https://10143.rpc.hypersync.xyz',         // Envio Alternative
  'https://testnet-rpc.monad.xyz',           // Official - Use carefully
  'https://10143.rpc.thirdweb.com'           // Thirdweb
]

let currentProviderIndex = 0
let cachedTransactions: any[] = []
let lastFetch = 0
let lastProviderSwitch = 0
const CACHE_DURATION = 5000 // 5 seconds cache to reduce load
const PROVIDER_SWITCH_COOLDOWN = 8000 // 8 seconds between switches
const CONNECTION_TIMEOUT = 3000 // Faster timeout

async function getWorkingProvider(): Promise<ethers.JsonRpcProvider> {
  const now = Date.now()
  
  for (let attempts = 0; attempts < RPC_ENDPOINTS.length; attempts++) {
    try {
      const endpoint = RPC_ENDPOINTS[currentProviderIndex]
      const provider = new ethers.JsonRpcProvider(endpoint, 10143)
      
      // Quick connection test
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
      console.log(`✅ Transaction provider connected to: ${endpoint}`)
      return provider
      
    } catch (error) {
      console.warn(`⚠️ Provider ${currentProviderIndex + 1} failed, switching...`)
      
      // Smart provider switching with cooldown
      if (now - lastProviderSwitch > PROVIDER_SWITCH_COOLDOWN || attempts === 0) {
        currentProviderIndex = (currentProviderIndex + 1) % RPC_ENDPOINTS.length
        lastProviderSwitch = now
      }
      
      // Brief delay to avoid overwhelming
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }
  
  throw new Error('All transaction providers failed')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Cache-Control', 'no-store, max-age=0')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const now = Date.now()
  
  // Return cached data if still fresh
  if (cachedTransactions.length > 0 && (now - lastFetch < CACHE_DURATION)) {
    return res.status(200).json({
      success: true,
      data: cachedTransactions,
      cached: true,
      timestamp: new Date().toISOString()
    })
  }

  try {
    console.log('🔄 Fetching real transactions from Monad testnet...')
    
    const provider = await getWorkingProvider()
    const start = Date.now()
    
    // Get current block number with better retry logic
    let currentBlockNumber = 0
    let attempts = 0
    const maxAttempts = 2 // Reduced attempts
    
    while (attempts < maxAttempts) {
      try {
        currentBlockNumber = await provider.getBlockNumber()
        console.log(`📊 Current block number: ${currentBlockNumber}`)
        break
      } catch (error) {
        attempts++
        if (attempts >= maxAttempts) {
          throw new Error(`Failed to get block number after ${maxAttempts} attempts`)
        }
        console.warn(`⚠️ Block number fetch attempt ${attempts} failed, retrying...`)
        await new Promise(resolve => setTimeout(resolve, 400))
      }
    }
    
    if (currentBlockNumber <= 0) {
      throw new Error('Invalid current block number')
    }
    
    // Use safer block number with larger buffer
    const safeBlockNumber = Math.max(1, currentBlockNumber - 3) // Go back 3 blocks for safety
    
    // Get latest safe block with transactions - sequential to avoid rate limits
    const latestBlock = await provider.getBlock(safeBlockNumber, true)
    
    if (!latestBlock) {
      throw new Error(`Failed to fetch block ${safeBlockNumber}`)
    }
    
    // Initialize transactions array
    const transactions: any[] = []
    
    // Reduce blocks to fetch for rate limit compliance
    const blocksToFetch = Math.min(3, safeBlockNumber) // Only 3 blocks max
    
    // Fetch blocks sequentially to avoid overwhelming the RPC
    for (let i = 0; i < blocksToFetch; i++) {
      const blockNumber = safeBlockNumber - i
      if (blockNumber > 0 && blockNumber <= currentBlockNumber) {
        try {
          // Add delay between block requests
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 200))
          }
          
          const block = await provider.getBlock(blockNumber, true)
          
          if (block && block.transactions && Array.isArray(block.transactions) && block.transactions.length > 0) {
            // Limit transactions per block for performance (max 3 per block)
            const txLimit = Math.min(3, block.transactions.length)
            
            for (let j = 0; j < txLimit; j++) {
              const txHash = block.transactions[j]
              
              try {
                if (typeof txHash === 'string') {
                  // Get transaction details with single attempt to reduce load
                  const tx = await provider.getTransaction(txHash)
                  
                  if (tx && tx.hash) {
                    // Determine transaction type
                    let txType = 'transfer'
                    if (tx.to === null) {
                      txType = 'contract'
                    } else if (tx.data && tx.data !== '0x' && tx.data.length > 10) {
                      const methodId = tx.data.slice(0, 10)
                      if (methodId === '0xa9059cbb' || methodId === '0x23b872dd') {
                        txType = 'transfer'
                      } else if (methodId === '0x40c10f19') {
                        txType = 'mint'
                      } else {
                        txType = 'contract'
                      }
                    }
                    
                    // Use gas limit as fallback - skip receipt fetch to reduce API calls
                    let gasUsed = Number(tx.gasLimit) || 21000
                    
                    try {
                      const receipt = await provider.getTransactionReceipt(tx.hash)
                      if (receipt && receipt.gasUsed) {
                        gasUsed = Number(receipt.gasUsed)
                      }
                    } catch (receiptError) {
                      console.warn(`⚠️ Failed to get receipt for ${tx.hash}, using gas limit`)
                    }
                    
                    transactions.push({
                      hash: tx.hash,
                      blockNumber: tx.blockNumber || blockNumber,
                      from: tx.from || 'Unknown',
                      to: tx.to || 'Contract Creation',
                      value: tx.value ? ethers.formatEther(tx.value) : '0',
                      gasPrice: tx.gasPrice ? ethers.formatUnits(tx.gasPrice, 'gwei') : '0',
                      gasUsed: gasUsed.toString(),
                      status: 'success', // Assume success if in block
                      timestamp: block.timestamp,
                      age: Math.floor((now / 1000) - block.timestamp),
                      type: txType,
                      fee: tx.gasPrice ? 
                        (parseFloat(ethers.formatUnits(tx.gasPrice, 'gwei')) * gasUsed / 1e9).toFixed(6) : '0'
                    })
                    
                    // Break early if we have enough transactions
                    if (transactions.length >= 15) break
                  }
                }
              } catch (txError) {
                console.warn(`⚠️ Failed to get tx ${txHash}: ${txError.message}`)
                continue
              }
            }
          }
          
          // Break early if we have enough transactions
          if (transactions.length >= 15) break
          
        } catch (blockError) {
          console.warn(`⚠️ Failed to fetch block ${blockNumber}: ${blockError.message}`)
          continue
        }
      }
    }
    
    // Sort by block number (newest first)
    transactions.sort((a, b) => (b.blockNumber || 0) - (a.blockNumber || 0))
    
    // Cache the results
    cachedTransactions = transactions.slice(0, 15) // Limit to 15 transactions
    lastFetch = now
    
    const fetchTime = Date.now() - start
    console.log(`✅ Fetched ${transactions.length} real transactions in ${fetchTime}ms`)
    
    res.status(200).json({
      success: true,
      data: cachedTransactions,
      count: cachedTransactions.length,
      fetchTime,
      cached: false,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Error fetching transactions:', error)
    
    // Return cached data if available
    if (cachedTransactions.length > 0) {
      return res.status(200).json({
        success: true,
        data: cachedTransactions,
        cached: true,
        error: 'Using cached data due to fetch error',
        timestamp: new Date().toISOString()
      })
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
} 