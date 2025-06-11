// API Service for Backend Integration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Monad Testnet Configuration
const MONAD_TESTNET_CONFIG = {
  chainId: 10143,
  chainName: 'Monad Testnet',
  nativeToken: 'MON',
  rpcEndpoints: [
    'https://testnet-rpc.monad.xyz',
    'https://10143.rpc.thirdweb.com'
  ],
  blockExplorers: [
    'https://monad-testnet.socialscan.io',
    'https://testnet.monadexplorer.com'
  ]
}

// Types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

export interface MetricsData {
  tps: number
  gasPrice: string
  blockTime: number
  networkHealth: number
  blockNumber: number
  timestamp: Date
  totalTransactions: number
}

export interface NetworkStatus {
  connected: boolean
  chainId: number
  networkName: string
  blockNumber: number
  lastUpdate: Date
  rpcEndpoints: string[]
  healthScore: number
}

export interface TransactionData {
  id: string
  type: 'transfer' | 'contract' | 'mint' | 'swap'
  from: string
  to: string
  amount: string
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: number
  gasUsed: number
  gasPrice: string
  blockNumber: number
}

// API Client Class
class APIService {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    
    // Load token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  // Remove authentication token
  removeToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  // Generic fetch wrapper
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    // Add auth header if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
      
      // Return error response format
      return {
        success: false,
        error: (error as Error).message || 'Network error',
        timestamp: new Date().toISOString()
      }
    }
  }

  // Health check
  async healthCheck(): Promise<APIResponse> {
    return this.request('/api/health')
  }

  // Get current metrics
  async getCurrentMetrics(): Promise<APIResponse<MetricsData>> {
    return this.request<MetricsData>('/api/metrics/current')
  }

  // Get metrics history
  async getMetricsHistory(timeRange: string = '24h'): Promise<APIResponse<MetricsData[]>> {
    return this.request<MetricsData[]>(`/api/metrics/history?timeRange=${timeRange}`)
  }

  // Get network status
  async getNetworkStatus(): Promise<APIResponse<NetworkStatus>> {
    return this.request<NetworkStatus>('/api/metrics/network')
  }

  // Get recent transactions
  async getTransactions(limit: number = 50, type?: string): Promise<APIResponse<TransactionData[]>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(type && { type })
    })
    return this.request<TransactionData[]>(`/api/metrics/transactions?${params}`)
  }

  // Get live data (quick endpoint)
  async getLiveData(): Promise<APIResponse<{
    metrics: MetricsData
    recentTransactions: TransactionData[]
    lastUpdate: string
  }>> {
    return this.request('/api/live')
  }

  // Get statistics
  async getStatistics(): Promise<APIResponse<{
    current: MetricsData
    statistics: {
      avgTps24h: number
      peakTps24h: number
      totalBlocks: number
      totalTransactions: number
      avgBlockTime: number
      networkUptime: number
    }
    period: string
  }>> {
    return this.request('/api/stats')
  }

  // Authentication methods
  async login(email: string, password: string): Promise<APIResponse<{
    user: any
    token: string
  }>> {
    const response = await this.request<{ user: any, token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })

    // Auto-set token if login successful
    if (response.success && response.data?.token) {
      this.setToken(response.data.token)
    }

    return response
  }

  async register(email: string, password: string, name?: string): Promise<APIResponse<{
    user: any
    token: string
  }>> {
    const response = await this.request<{ user: any, token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    })

    // Auto-set token if registration successful
    if (response.success && response.data?.token) {
      this.setToken(response.data.token)
    }

    return response
  }

  async verifyToken(): Promise<APIResponse<{ user: any }>> {
    return this.request<{ user: any }>('/api/auth/verify')
  }

  async logout(): Promise<APIResponse> {
    const response = await this.request('/api/auth/logout', {
      method: 'POST'
    })

    // Remove token regardless of response
    this.removeToken()

    return response
  }

  // Utility method to check if backend is available
  async isBackendAvailable(): Promise<boolean> {
    try {
      const response = await this.healthCheck()
      return response.success
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const apiService = new APIService()

// Export fallback function that tries backend first, then falls back to mock data
export async function getMetricsWithFallback() {
  try {
    // Try backend first
    const backendResponse = await apiService.getCurrentMetrics()
    
    if (backendResponse.success && backendResponse.data) {
      console.log('✅ Using real backend data from Monad Testnet')
      return {
        tps: backendResponse.data.tps,
        gasPrice: parseFloat(backendResponse.data.gasPrice),
        blockTime: backendResponse.data.blockTime,
        networkHealth: backendResponse.data.networkHealth,
        blockNumber: backendResponse.data.blockNumber,
        timestamp: Date.now(),
        source: 'backend',
        chainId: MONAD_TESTNET_CONFIG.chainId,
        chainName: MONAD_TESTNET_CONFIG.chainName
      }
    }
  } catch (error) {
    console.warn('Backend unavailable, using direct Monad Testnet data:', error)
  }

  // Fallback to existing mock data logic
  const { getMonadMetrics } = await import('./monadData')
  const metrics = await getMonadMetrics()
  
  return {
    ...metrics,
    source: 'testnet-direct'
  }
}

export async function getNetworkStatusWithFallback() {
  try {
    // Try backend first
    const backendResponse = await apiService.getNetworkStatus()
    
    if (backendResponse.success && backendResponse.data) {
      console.log('✅ Using real backend network status')
      return {
        connected: backendResponse.data.connected,
        chainId: backendResponse.data.chainId,
        blockNumber: backendResponse.data.blockNumber,
        rpcUrl: MONAD_TESTNET_CONFIG.rpcEndpoints[0],
        explorerUrl: MONAD_TESTNET_CONFIG.blockExplorers[0],
        gasPrice: 0, // Will be filled by metrics
        lastUpdate: backendResponse.data.lastUpdate
      }
    }
  } catch (error) {
    console.warn('Backend network status unavailable, using Monad Testnet direct:', error)
  }

  // Fallback to existing mock data logic
  const { getNetworkStatus } = await import('./monadData')
  return getNetworkStatus()
}

// Export testnet configuration
export { MONAD_TESTNET_CONFIG }

export default apiService 