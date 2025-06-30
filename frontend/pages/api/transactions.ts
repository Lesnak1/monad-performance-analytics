import { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'

// Optimized RPC providers for Monad Testnet
const RPC_ENDPOINTS = [
  'https://testnet-rpc.monad.xyz',           // Official - Most reliable
  'https://monad-testnet.rpc.hypersync.xyz', // Envio HyperRPC
  'https://10143.rpc.hypersync.xyz',         // Envio Alternative
  'https://10143.rpc.thirdweb.com'           // Thirdweb
]

let currentProviderIndex = 0
let cachedTransactions: any[] = []
let lastFetch = 0
const CACHE_DURATION = 3000 // 3 seconds cache

async function getWorkingProvider(): Promise<ethers.JsonRpcProvider> {
  for (let i = 0; i < RPC_ENDPOINTS.length; i++) {
    try {
      const endpoint = RPC_ENDPOINTS[currentProviderIndex]
      const provider = new ethers.JsonRpcProvider(endpoint, 10143)
      
      // Test connection with timeout
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
      console.log(`✅ Transaction provider connected to: ${endpoint}`)
      return provider
      
    } catch (error) {
      console.warn(`⚠️ Provider ${currentProviderIndex + 1} failed, switching...`)
      currentProviderIndex = (currentProviderIndex + 1) % RPC_ENDPOINTS.length
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
    
    // Get current block number safely with retries
    let currentBlockNumber = 0
    let attempts = 0
    const maxAttempts = 3
    
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
        await new Promise(resolve => setTimeout(resolve, 500)) // Wait before retry
      }
    }
    
    if (currentBlockNumber <= 0) {
      throw new Error('Invalid current block number')
    }
    
    // Add safety buffer to prevent race conditions
    const safeBlockNumber = Math.max(1, currentBlockNumber - 2) // Go back 2 blocks for safety
    
    // Get latest safe block with transactions 
    const latestBlock = await provider.getBlock(safeBlockNumber, true)
    
    if (!latestBlock) {
      throw new Error(`Failed to fetch block ${safeBlockNumber}`)
    }
    
    // Initialize transactions array
    const transactions: any[] = []
    
    // Safely get recent blocks for transaction data with validation
    const blocksToFetch = Math.min(5, safeBlockNumber) // Don't go below block 0
    const blockPromises: Promise<any>[] = []
    
    for (let i = 0; i < blocksToFetch; i++) {
      const blockNumber = safeBlockNumber - i
      if (blockNumber > 0 && blockNumber <= currentBlockNumber) { // Double check validity
        blockPromises.push(
          provider.getBlock(blockNumber, true).catch(error => {
            console.warn(`⚠️ Failed to fetch block ${blockNumber}:`, error.message)
            return null // Return null for failed blocks
          })
        )
      }
    }
    
    const blocks = await Promise.all(blockPromises)
    
    // Process transactions from successfully fetched blocks
    for (const block of blocks) {
      if (block && block.transactions && Array.isArray(block.transactions) && block.transactions.length > 0) {
        
        // Limit transactions per block for performance (max 5 per block)
        const txLimit = Math.min(5, block.transactions.length)
        
        for (let j = 0; j < txLimit; j++) {
          const txHash = block.transactions[j]
          
          try {
            if (typeof txHash === 'string') {
              // Get transaction details with retry logic
              let tx = null
              let txAttempts = 0
              const maxTxAttempts = 2
              
              while (!tx && txAttempts < maxTxAttempts) {
                try {
                  tx = await provider.getTransaction(txHash)
                  break
                } catch (txError) {
                  txAttempts++
                  if (txAttempts >= maxTxAttempts) {
                    console.warn(`⚠️ Failed to get tx ${txHash} after ${maxTxAttempts} attempts`)
                    break
                  }
                  // Wait briefly before retry
                  await new Promise(resolve => setTimeout(resolve, 100))
                }
              }
              
              if (tx && tx.hash) {
                // Determine transaction type based on data and recipient
                let txType = 'transfer'
                if (tx.to === null) {
                  txType = 'contract' // Contract creation
                } else if (tx.data && tx.data !== '0x' && tx.data.length > 10) {
                  // Check for common function signatures
                  const methodId = tx.data.slice(0, 10)
                  if (methodId === '0xa9059cbb' || methodId === '0x23b872dd') {
                    txType = 'transfer' // ERC-20 transfer
                  } else if (methodId === '0x40c10f19') {
                    txType = 'mint'
                  } else {
                    txType = 'contract'
                  }
                }
                
                // Get transaction receipt for gas used (optional, with error handling)
                let gasUsed = Number(tx.gasLimit) || 21000
                try {
                  const receipt = await provider.getTransactionReceipt(tx.hash)
                  if (receipt && receipt.gasUsed) {
                    gasUsed = Number(receipt.gasUsed)
                  }
                } catch (receiptError) {
                  // Use gas limit as fallback
                  console.warn(`⚠️ Failed to get receipt for ${tx.hash}, using gas limit`)
                }
                
                transactions.push({
                  hash: tx.hash,
                  from: tx.from,
                  to: tx.to || '0x0000000000000000000000000000000000000000',
                  value: ethers.formatEther(tx.value || 0),
                  gasPrice: ethers.formatUnits(tx.gasPrice || 0, 'gwei'),
                  gasUsed,
                  blockNumber: tx.blockNumber || block.number,
                  timestamp: block.timestamp,
                  type: txType,
                  status: 'confirmed' // Assume confirmed since it's in a block
                })
              }
            }
          } catch (txError) {
            console.warn(`⚠️ Failed to process transaction ${txHash}:`, txError.message)
            continue // Skip failed transactions
          }
          
          // Break if we have enough transactions
          if (transactions.length >= 15) break
        }
      }
      
      if (transactions.length >= 15) break
    }
    
    const responseTime = Date.now() - start
    
    // Cache the results
    cachedTransactions = transactions
    lastFetch = now
    
    console.log(`✅ Fetched ${transactions.length} real transactions in ${responseTime}ms`)
    
    res.status(200).json({
      success: true,
      data: transactions,
      blockNumber: currentBlockNumber,
      safeBlockNumber,
      totalTransactions: latestBlock.transactions?.length || 0,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      provider: RPC_ENDPOINTS[currentProviderIndex],
      cached: false
    })
    
  } catch (error) {
    console.error('❌ Error fetching transactions:', error)
    
    // Return cached data if available on error
    if (cachedTransactions.length > 0) {
      console.log('📦 Returning cached transactions due to fetch error')
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
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      data: [] // Return empty array instead of null
    })
  }
} 