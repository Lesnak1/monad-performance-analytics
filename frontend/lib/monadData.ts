import { ethers } from 'ethers'

// Monad RPC Endpoints - Hardcoded to remove environment variable dependency
const MONAD_RPC_ENDPOINTS = [
  'https://monad-testnet.rpc.hypersync.xyz',
  'https://10143.rpc.hypersync.xyz',
  'https://testnet-rpc.monad.xyz',
  'https://10143.rpc.thirdweb.com',
  'https://monad-testnet.drpc.org'
]
const CHAIN_ID = 10143
const CHAIN_NAME = 'Monad Testnet'

// Types
export interface MonadMetrics {
  tps: number
  gasPrice: number
  blockTime: number
  networkHealth: number
  blockNumber: number
  timestamp: number
  chainId?: number
  chainName?: string
}

export interface ChartDataPoint {
  timestamp: string
  tps: number
  gasPrice: number
  blockTime: number
  networkHealth: number
  blockNumber: number
}

export interface Transaction {
  id: string
  type: 'transfer' | 'contract' | 'mint' | 'swap'
  from: string
  to: string
  amount: string
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: number
  gasUsed: number
  gasPrice: number
  blockNumber: number
}

// Cache for client-side with shorter duration for real-time feel
let cachedMetrics: MonadMetrics | null = null
let cachedChartData: ChartDataPoint[] = []
let lastFetch = 0
const CACHE_DURATION = 2000 // 2 seconds cache for real-time updates
const MAX_CHART_POINTS = 20 // Maximum number of points to keep for charts

// Harici endpointten gerçek veriyi çek
export async function getMonadMetrics(): Promise<MonadMetrics | null> {
  const now = Date.now()
  
  if (cachedMetrics && (now - lastFetch < CACHE_DURATION)) {
    return cachedMetrics
  }

  let lastError = null
  for (const endpoint of MONAD_RPC_ENDPOINTS) {
    try {
      const provider = new ethers.JsonRpcProvider(endpoint, CHAIN_ID)
      const latestBlockNumber = await provider.getBlockNumber()
      const feeData = await provider.getFeeData()
      const latestBlock = await provider.getBlock(latestBlockNumber, true)
      const previousBlock = await provider.getBlock(latestBlockNumber - 1, true)
      
      let tps = 0
      let blockTime = 0.6
      let txCount = latestBlock?.transactions?.length || 0
      
      if (previousBlock && latestBlock && latestBlock.timestamp > previousBlock.timestamp) {
        const timeDiff = latestBlock.timestamp - previousBlock.timestamp
        blockTime = timeDiff
        if (timeDiff > 0) {
          tps = Math.round(txCount / timeDiff)
        }
      } else if (txCount > 0) {
        tps = Math.round(txCount / 0.6)
      }
      
      let networkHealth = 95
      if (txCount > 0) {
        networkHealth = Math.min(99, 90 + Math.floor((tps / 100) * 9))
      }
      if (tps > 50) networkHealth = Math.min(99, networkHealth + 2)
      if (tps > 100) networkHealth = 99
      
      cachedMetrics = {
        tps: Math.max(tps, 0),
        gasPrice: feeData.gasPrice ? parseFloat(ethers.formatUnits(feeData.gasPrice, 'gwei')) : 0,
        blockTime,
        networkHealth,
        blockNumber: latestBlockNumber,
        timestamp: now,
        chainId: CHAIN_ID,
        chainName: CHAIN_NAME
      }
      lastFetch = now
      
      console.log('✅ Fresh metrics fetched:', cachedMetrics)
      return cachedMetrics
      
    } catch (err) {
      lastError = err
      console.warn(`⚠️ RPC endpoint ${endpoint} failed:`, err)
      continue
    }
  }
  
  console.error('❌ Tüm RPC endpointleri başarısız oldu:', lastError)
  return cachedMetrics // Return cached data on error
}

export async function getNetworkStatus() {
  let lastError = null
  for (const endpoint of MONAD_RPC_ENDPOINTS) {
    try {
      const provider = new ethers.JsonRpcProvider(endpoint, CHAIN_ID)
      const blockNumber = await provider.getBlockNumber()
      const feeData = await provider.getFeeData()
      
      return {
        connected: true,
        chainId: CHAIN_ID,
        blockNumber,
        rpcUrl: endpoint,
        explorerUrl: 'https://monad-testnet.socialscan.io',
        gasPrice: feeData.gasPrice ? parseFloat(ethers.formatUnits(feeData.gasPrice, 'gwei')) : 0,
        lastUpdate: new Date()
      }
      
    } catch (err) {
      lastError = err
      continue
    }
  }
  
  console.error('❌ Tüm RPC endpointleri başarısız oldu:', lastError)
  return {
    connected: false,
    chainId: CHAIN_ID,
    blockNumber: 0,
    rpcUrl: 'Monad Testnet',
    explorerUrl: 'https://monad-testnet.socialscan.io',
    gasPrice: 0,
    lastUpdate: new Date()
  }
}

export async function getChartData(): Promise<ChartDataPoint[]> {
  try {
    const metrics = await getMonadMetrics()
    
    if (!metrics) {
      return cachedChartData.length > 0 ? cachedChartData : []
    }
    
    // Create new data point with current timestamp
    const timestamp = new Date()
    const newDataPoint: ChartDataPoint = {
      timestamp: timestamp.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }),
      tps: metrics.tps,
      gasPrice: metrics.gasPrice,
      blockTime: metrics.blockTime,
      networkHealth: metrics.networkHealth,
      blockNumber: metrics.blockNumber
    }
    
    // Add new point to beginning of array and keep only the latest points
    cachedChartData = [newDataPoint, ...cachedChartData.slice(0, MAX_CHART_POINTS - 1)]
    
    console.log(`📊 Chart data updated: ${cachedChartData.length} points, TPS: ${metrics.tps}`)
    return cachedChartData
    
  } catch (error) {
    console.error('❌ Failed to generate chart data:', error)
    return cachedChartData.length > 0 ? cachedChartData : []
  }
}

function generateFallbackChartData(): ChartDataPoint[] {
  // Return empty array if no real data available
  console.warn('⚠️ No real data available for chart')
  return []
}

export async function getRecentTransactions(): Promise<Transaction[]> {
  let lastError = null
  for (const endpoint of MONAD_RPC_ENDPOINTS) {
    try {
      const provider = new ethers.JsonRpcProvider(endpoint, CHAIN_ID)
      const latestBlockNumber = await provider.getBlockNumber()
      
      // Get multiple recent blocks to have more transactions
      const blocks = []
      for (let i = 0; i < 3; i++) {
        const blockNum = latestBlockNumber - i
        if (blockNum > 0) {
          const block = await provider.getBlock(blockNum, true)
          if (block && block.transactions) {
            blocks.push(block)
          }
        }
      }
      
      // Collect all transactions from recent blocks
      const allTransactions: Transaction[] = []
      
      for (const block of blocks) {
        if (block.transactions && block.transactions.length > 0) {
          for (const txHash of block.transactions.slice(0, 5)) {
            try {
              const txReceipt = await provider.getTransaction(txHash)
              if (txReceipt) {
                // Determine transaction type based on data and to address
                let txType: 'transfer' | 'contract' | 'mint' | 'swap' = 'transfer'
                if (txReceipt.data && txReceipt.data !== '0x') {
                  txType = 'contract'
                  // Simple heuristics for transaction types
                  if (txReceipt.data.includes('a9059cbb')) txType = 'transfer' // ERC20 transfer
                  if (txReceipt.data.includes('7ff36ab5')) txType = 'swap' // Uniswap swap
                  if (txReceipt.data.includes('40c10f19')) txType = 'mint' // Mint function
                }
                
                allTransactions.push({
                  id: txReceipt.hash,
                  type: txType,
                  from: txReceipt.from,
                  to: txReceipt.to || '0x0000000000000000000000000000000000000000',
                  amount: txReceipt.value ? parseFloat(ethers.formatEther(txReceipt.value)).toFixed(4) + ' MON' : '0 MON',
                  status: 'confirmed',
                  timestamp: block.timestamp * 1000,
                  gasUsed: txReceipt.gasLimit ? parseInt(txReceipt.gasLimit.toString()) : 21000,
                  gasPrice: txReceipt.gasPrice ? parseFloat(ethers.formatUnits(txReceipt.gasPrice, 'gwei')) : 0,
                  blockNumber: block.number
                })
              }
            } catch (txError) {
              console.warn(`⚠️ Failed to fetch transaction ${txHash}:`, txError)
              continue
            }
          }
        }
      }
      
      // Return up to 10 most recent transactions
      return allTransactions.slice(0, 10)
      
    } catch (err) {
      lastError = err
      console.warn(`⚠️ RPC endpoint ${endpoint} failed for transactions:`, err)
      continue
    }
  }
  
  console.error('❌ All RPC endpoints failed for transactions:', lastError)
  return []
}

export function generateLiveTransaction(): Transaction | null {
  // Completely remove mock data generation
  console.warn('⚠️ generateLiveTransaction called - returning null (no mock data)')
  return null
}

export function getCurrentRpcIndex(): number {
  return 0 // Default to first RPC
}

export function tryNextRpc(): void {
  console.log('🔄 Trying next RPC endpoint...')
}

export function getAllRpcUrls(): string[] {
  return MONAD_RPC_ENDPOINTS
}

export async function getValidators() {
  // NO MOCK DATA - Return empty array, real validator data should come from RPC
  console.warn('⚠️ No real validator data available from Monad testnet RPC')
  return []
}

export async function getChainInfo() {
  return {
    chainId: CHAIN_ID,
    chainName: CHAIN_NAME,
    nativeToken: 'MON'
  }
}

export function getExplorerUrl(type: 'tx' | 'block' | 'address', hash: string): string
export function getExplorerUrl(hash: string): string
export function getExplorerUrl(typeOrHash: string | 'tx' | 'block' | 'address', hash?: string): string {
  const baseUrl = 'https://monad-testnet.socialscan.io'
  
  if (hash === undefined) {
    // Single parameter, assume it's a transaction hash
    return `${baseUrl}/tx/${typeOrHash}`
  }
  
  switch (typeOrHash) {
    case 'tx':
      return `${baseUrl}/tx/${hash}`
    case 'block':
      return `${baseUrl}/block/${hash}`
    case 'address':
      return `${baseUrl}/address/${hash}`
    default:
      return `${baseUrl}/tx/${hash}`
  }
} 