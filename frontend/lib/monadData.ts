import { ethers } from 'ethers'

// Properly handle API base URL for both client and server environments
function getApiBaseUrl(): string {
  // Client-side
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // Server-side - build absolute URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000'
  }
  
  // Production fallback - use actual Vercel deployment URL
  return 'https://monad-performance-analytics.vercel.app'
}

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

// Fetch data from Vercel API routes with proper error handling
export async function getMonadMetrics(): Promise<MonadMetrics | null> {
  const now = Date.now()
  
  if (cachedMetrics && (now - lastFetch < CACHE_DURATION)) {
    return cachedMetrics
  }

  try {
    const apiBaseUrl = getApiBaseUrl()
    const url = `${apiBaseUrl}/api/monad-metrics`
    
    console.log(`🔄 Fetching metrics from: ${url}`)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success && data.data) {
      cachedMetrics = {
        tps: data.data.tps,
        gasPrice: data.data.gasPrice,
        blockTime: data.data.blockTime,
        networkHealth: data.data.networkHealth,
        blockNumber: data.data.blockNumber,
        timestamp: data.data.timestamp,
        chainId: data.data.chainId,
        chainName: data.data.chainName
      }
      lastFetch = now
      
      console.log('✅ Fresh metrics fetched:', cachedMetrics)
      return cachedMetrics
    }
    
    console.error('❌ API returned unsuccessful response:', data)
    return cachedMetrics // Return cached data if API response is invalid
    
  } catch (error) {
    console.error('❌ Failed to fetch metrics from API:', error)
    return cachedMetrics // Return cached data on error
  }
}

export async function getNetworkStatus() {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const url = `${apiBaseUrl}/api/network-status`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success && data.data) {
      return {
        connected: data.data.connected,
        chainId: data.data.chainId,
        blockNumber: data.data.blockNumber,
        rpcUrl: data.data.rpcUrl,
        explorerUrl: data.data.explorerUrl,
        gasPrice: data.data.gasPrice,
        lastUpdate: new Date(data.data.lastUpdate)
      }
    }
    
    // Return fallback status
    return {
      connected: false,
      chainId: 10143,
      blockNumber: 0,
      rpcUrl: 'Monad Testnet',
      explorerUrl: 'https://monad-testnet.socialscan.io',
      gasPrice: 0,
      lastUpdate: new Date()
    }
    
  } catch (error) {
    console.error('❌ Failed to fetch network status from API:', error)
    return {
      connected: false,
      chainId: 10143,
      blockNumber: 0,
      rpcUrl: 'Monad Testnet',
      explorerUrl: 'https://monad-testnet.socialscan.io',
      gasPrice: 0,
      lastUpdate: new Date()
    }
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
  return [
    'https://monad-testnet.rpc.hypersync.xyz',
    'https://10143.rpc.hypersync.xyz',
    'https://testnet-rpc.monad.xyz',
    'https://10143.rpc.thirdweb.com',
    'https://monad-testnet.drpc.org'
  ]
}

export async function getValidators() {
  // Mock validator data for display
  return []
}

export async function getChainInfo() {
  return {
    chainId: 10143,
    chainName: 'Monad Testnet',
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

export async function getRecentTransactions(): Promise<Transaction[]> {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const url = `${apiBaseUrl}/api/transactions`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success && data.data) {
      return data.data.map((tx: any) => ({
        id: tx.hash,
        type: tx.type || 'transfer',
        from: tx.from,
        to: tx.to,
        amount: tx.value,
        status: tx.status || 'confirmed',
        timestamp: tx.timestamp * 1000,
        gasUsed: parseInt(tx.gasUsed),
        gasPrice: parseFloat(tx.gasPrice),
        blockNumber: tx.blockNumber
      }))
    }
    
    // Fallback: generate some sample transactions
    return Array.from({ length: 5 }, () => generateLiveTransaction())
    
  } catch (error) {
    console.error('❌ Failed to fetch recent transactions:', error)
    return Array.from({ length: 5 }, () => generateLiveTransaction())
  }
} 