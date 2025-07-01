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
  
  // Production fallback
  return 'https://monad-analytics.vercel.app'
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
        gasPrice: Math.max(0, parseFloat((metrics.gasPrice + gasPriceVariance).toFixed(4))),
        blockTime: metrics.blockTime + (0.1 * (Math.random() - 0.5)), // Small variance in block time
        networkHealth: Math.min(100, Math.max(90, metrics.networkHealth + healthVariance)),
        blockNumber: Math.max(0, metrics.blockNumber - i * 2) // More realistic block progression
      })
    }
    
    cachedChartData = chartPoints
    return chartPoints
    
  } catch (error) {
    console.error('❌ Failed to generate chart data:', error)
    return cachedChartData.length > 0 ? cachedChartData : generateFallbackChartData()
  }
}

// Generate fallback chart data when real data is unavailable
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
      tps: Math.floor(Math.random() * 50) + 20,
      gasPrice: parseFloat((Math.random() * 0.01 + 0.001).toFixed(4)),
      blockTime: 0.6 + (Math.random() * 0.2 - 0.1),
      networkHealth: Math.floor(Math.random() * 10) + 90,
      blockNumber: 24000000 + i * 2
    })
  }
  
  return fallbackData
}

// Generate live transactions for display with more realistic data
export function generateLiveTransaction(): Transaction {
  const types: Transaction['type'][] = ['transfer', 'contract', 'mint', 'swap']
  const statuses: Transaction['status'][] = ['pending', 'confirmed', 'failed']
  
  const addresses = [
    '0x742d35Cc6634C0532925a3b8D400b7C1234567890',
    '0x8ba1f109551bD432803012645Hac136c22c501234',
    '0x3f5CE5FBFe3E9af3971dd833D26bA9b5C936f123',
    '0x95A4949f09415ffccB8F0F33A5a4e2A4c9B367890',
    '0x742d35Cc663C0532925a3b8D400b7C16F484c789'
  ]
  
  const fromAddress = addresses[Math.floor(Math.random() * addresses.length)]
  const toAddress = addresses[Math.floor(Math.random() * addresses.length)]
  
  return {
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: types[Math.floor(Math.random() * types.length)],
    from: fromAddress,
    to: toAddress,
    amount: (Math.random() * 10 + 0.01).toFixed(4),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    timestamp: Date.now(),
    gasUsed: Math.floor(Math.random() * 50000) + 21000,
    gasPrice: parseFloat((Math.random() * 0.01 + 0.001).toFixed(6)),
    blockNumber: 24070000 + Math.floor(Math.random() * 1000)
  }
}

// RPC Management (simplified for client-side use)
export function getCurrentRpcIndex(): number {
  return 0 // Always use the first working RPC
}

export function tryNextRpc(): void {
  // This is handled server-side in the API routes
  console.log('RPC switching handled by server-side API')
}

export function getAllRpcUrls(): string[] {
  return [
    'https://testnet-rpc.monad.xyz',
    'https://monad-testnet.rpc.hypersync.xyz',
    'https://10143.rpc.hypersync.xyz',
    'https://10143.rpc.thirdweb.com'
  ]
}

// Simplified validator info for display
export async function getValidators() {
  return {
    active: 150,
    total: 200,
    stakingRatio: 75.5,
    averageUptime: 99.2
  }
}

// Chain info
export async function getChainInfo() {
  return {
    chainId: 10143,
    chainName: 'Monad Testnet',
    nativeToken: 'MON',
    blockTime: 0.6,
    finalityTime: 2.4,
    consensusAlgorithm: 'MonadBFT'
  }
}

// Explorer URLs - Overloaded for backward compatibility
export function getExplorerUrl(hash: string): string
export function getExplorerUrl(type: 'tx' | 'block' | 'address', hash: string): string
export function getExplorerUrl(typeOrHash: string | 'tx' | 'block' | 'address', hash?: string): string {
  const baseUrl = 'https://monad-testnet.socialscan.io'
  
  // If only one parameter is provided, assume it's a transaction hash
  if (hash === undefined) {
    return `${baseUrl}/tx/${typeOrHash}`
  }
  
  // If two parameters are provided, use the type
  switch (typeOrHash) {
    case 'tx':
      return `${baseUrl}/tx/${hash}`
    case 'block':
      return `${baseUrl}/block/${hash}`
    case 'address':
      return `${baseUrl}/address/${hash}`
    default:
      return baseUrl
  }
}

// Get recent transactions from API
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
        timestamp: tx.timestamp * 1000, // Convert to milliseconds
        gasUsed: tx.gasUsed || 21000,
        gasPrice: parseFloat(tx.gasPrice || '0'),
        blockNumber: tx.blockNumber
      }))
    }
    
    // Return empty array if no data
    return []
    
  } catch (error) {
    console.error('❌ Failed to fetch recent transactions:', error)
    return []
  }
} 