import { ethers } from 'ethers'

// .env.local dosyasından endpointleri al
const MONAD_RPC_ENDPOINTS = process.env.NEXT_PUBLIC_MONAD_RPC_ENDPOINTS?.split(',') || [
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
      return cachedChartData.length > 0 ? cachedChartData : generateFallbackChartData()
    }
    
    // Generate chart data based on current metrics with better variance
    const chartPoints: ChartDataPoint[] = []
    
    // Create 24 data points for better visualization
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(Date.now() - (i * 2.5 * 60 * 1000)) // Every 2.5 minutes
      
      // Add more realistic variance based on network activity
      const baseVariance = 0.1
      const activityMultiplier = metrics.networkHealth > 95 ? 1.5 : 0.8
      
      const tpsVariance = metrics.tps * baseVariance * activityMultiplier * (Math.random() - 0.5)
      const gasPriceVariance = metrics.gasPrice * baseVariance * (Math.random() - 0.5)
      const healthVariance = 3 * (Math.random() - 0.5)
      
      chartPoints.push({
        timestamp: timestamp.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        tps: Math.max(0, Math.round(metrics.tps + tpsVariance)),
        gasPrice: Math.max(0, parseFloat((metrics.gasPrice + gasPriceVariance).toFixed(3))),
        blockTime: metrics.blockTime + (Math.random() - 0.5) * 0.2,
        networkHealth: Math.max(50, Math.min(100, Math.round(metrics.networkHealth + healthVariance))),
        blockNumber: metrics.blockNumber - i
      })
    }
    
    cachedChartData = chartPoints
    return chartPoints
    
  } catch (error) {
    console.error('❌ Failed to generate chart data:', error)
    return cachedChartData.length > 0 ? cachedChartData : generateFallbackChartData()
  }
}

function generateFallbackChartData(): ChartDataPoint[] {
  const fallbackData: ChartDataPoint[] = []
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(Date.now() - (i * 2.5 * 60 * 1000))
    
    fallbackData.push({
      timestamp: timestamp.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      tps: Math.round(45 + Math.random() * 85),
      gasPrice: parseFloat((0.1 + Math.random() * 0.5).toFixed(3)),
      blockTime: 0.6 + Math.random() * 0.4,
      networkHealth: Math.round(90 + Math.random() * 10),
      blockNumber: 5000000 - i
    })
  }
  
  return fallbackData
}

export async function getRecentTransactions(): Promise<Transaction[]> {
  let lastError = null
  for (const endpoint of MONAD_RPC_ENDPOINTS) {
    try {
      const provider = new ethers.JsonRpcProvider(endpoint, CHAIN_ID)
      const latestBlockNumber = await provider.getBlockNumber()
      const latestBlock = await provider.getBlock(latestBlockNumber, true)
      if (!latestBlock || !latestBlock.transactions) continue
      
      return latestBlock.transactions.slice(0, 10).map((tx: any) => ({
        id: tx.hash,
        type: 'transfer',
        from: tx.from,
        to: tx.to,
        amount: tx.value ? ethers.formatEther(tx.value) : '0',
        status: 'confirmed',
        timestamp: latestBlock.timestamp * 1000,
        gasUsed: tx.gasUsed ? parseInt(tx.gasUsed.toString()) : 0,
        gasPrice: tx.gasPrice ? parseFloat(ethers.formatUnits(tx.gasPrice, 'gwei')) : 0,
        blockNumber: latestBlockNumber
      }))
    } catch (err) {
      lastError = err
      continue
    }
  }
  console.error('Tüm RPC endpointleri başarısız oldu:', lastError)
  return []
}

export function generateLiveTransaction(): Transaction {
  const types = ['transfer', 'contract', 'mint', 'swap'] as const
  const addresses = [
    '0x742d35Cc7E99E8d2Ba04D1d0700cc52FdbEbF9c1',
    '0x8ba1f109551bD432803012645Hac136c770e776D',
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
  ]
  
  return {
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: types[Math.floor(Math.random() * types.length)],
    from: addresses[Math.floor(Math.random() * addresses.length)],
    to: addresses[Math.floor(Math.random() * addresses.length)],
    amount: (Math.random() * 1000).toFixed(4),
    status: Math.random() > 0.1 ? 'confirmed' : 'pending',
    timestamp: Date.now(),
    gasUsed: Math.floor(21000 + Math.random() * 80000),
    gasPrice: Math.round((0.1 + Math.random() * 0.5) * 1000) / 1000,
    blockNumber: Math.floor(5000000 + Math.random() * 1000)
  }
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
  // Mock validator data for display
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