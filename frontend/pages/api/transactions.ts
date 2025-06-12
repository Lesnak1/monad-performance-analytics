import { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'

// HyperRPC providers for Monad Testnet
const providers = [
  new ethers.JsonRpcProvider('https://monad-testnet.rpc.hypersync.xyz'),
  new ethers.JsonRpcProvider('https://10143.rpc.hypersync.xyz'),
  new ethers.JsonRpcProvider('https://testnet-rpc.monad.xyz'),
  new ethers.JsonRpcProvider('https://10143.rpc.thirdweb.com')
]

let currentProvider = 0

async function getProvider() {
  for (let i = 0; i < providers.length; i++) {
    try {
      const provider = providers[currentProvider]
      await provider.getBlockNumber() // Test connection
      return provider
    } catch (error) {
      console.log(`Provider ${currentProvider} failed, switching...`)
      currentProvider = (currentProvider + 1) % providers.length
    }
  }
  throw new Error('All providers failed')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('🔄 Fetching real transactions from Monad testnet...')
    
    const provider = await getProvider()
    const start = Date.now()
    
    // Get latest block with transactions
    const latestBlock = await provider.getBlock('latest', true)
    
    if (!latestBlock || !latestBlock.transactions || latestBlock.transactions.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No transactions in latest block',
        blockNumber: latestBlock?.number || 0,
        totalTransactions: 0
      })
    }
    
    // Get transaction details from multiple recent blocks for more data
    const transactions = []
    const blockPromises = []
    
    // Fetch last 3 blocks for more transactions
    for (let i = 0; i < 3; i++) {
      const blockNumber = latestBlock.number - i
      if (blockNumber > 0) {
        blockPromises.push(provider.getBlock(blockNumber, true))
      }
    }
    
    const blocks = await Promise.all(blockPromises)
    
    // Process transactions from all blocks
    for (const block of blocks) {
      if (block && block.transactions && block.transactions.length > 0) {
        // Limit to 5 transactions per block for performance
        const txHashes = block.transactions.slice(0, 5)
        
        for (const txHash of txHashes) {
          try {
            if (typeof txHash === 'string') {
              // Get transaction details
              const tx = await provider.getTransaction(txHash)
              
              if (tx) {
                // Determine transaction type based on data
                let txType = 'transfer'
                if (tx.to === null) {
                  txType = 'contract' // Contract creation
                } else if (tx.data && tx.data !== '0x') {
                  if (tx.data.length > 10) {
                    txType = 'contract' // Contract interaction
                  }
                }
                
                transactions.push({
                  hash: tx.hash,
                  from: tx.from,
                  to: tx.to || '0x0000000000000000000000000000000000000000',
                  value: ethers.formatEther(tx.value || 0),
                  gasPrice: ethers.formatUnits(tx.gasPrice || 0, 'gwei'),
                  gasUsed: tx.gasLimit ? Number(tx.gasLimit) : 21000,
                  blockNumber: tx.blockNumber || block.number,
                  timestamp: block.timestamp,
                  type: txType,
                  status: 'confirmed' // Assume confirmed since it's in a block
                })
              }
            }
          } catch (txError) {
            console.warn(`⚠️ Failed to get tx details for ${txHash}:`, txError)
            continue
          }
          
          // Break if we have enough transactions
          if (transactions.length >= 15) break
        }
      }
      
      if (transactions.length >= 15) break
    }
    
    const responseTime = Date.now() - start
    
    console.log(`✅ Fetched ${transactions.length} real transactions in ${responseTime}ms`)
    
    res.status(200).json({
      success: true,
      data: transactions,
      blockNumber: latestBlock.number,
      totalTransactions: latestBlock.transactions.length,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      provider: `HyperRPC ${currentProvider + 1}`
    })
    
  } catch (error) {
    console.error('❌ Error fetching transactions:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
} 