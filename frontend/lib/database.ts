// Simple in-memory database for demonstration
// In production, use PostgreSQL, MongoDB, or similar

export interface TestResult {
  id: string
  testName: string
  testType: 'erc20' | 'nft' | 'defi' | 'multi'
  status: 'running' | 'completed' | 'failed'
  timestamp: string
  tps: number
  gasUsed: number
  duration: number
  successRate: number
  blockNumber?: number
  txHash?: string
  parameters: {
    txCount?: number
    batchSize?: number
    gasLimit?: number
    iterations?: number
  }
  networkData: {
    chainId: number
    rpcUrl: string
    blockTime: number
    gasPrice: string
  }
}

export interface MetricsSnapshot {
  id: string
  timestamp: string
  tps: number
  blockTime: number
  gasPrice: string
  networkHealth: number
  blockNumber: number
  chainId: number
  rpcUrl: string
}

// In-memory storage (replace with actual database in production)
class InMemoryDatabase {
  private testResults: Map<string, TestResult> = new Map()
  private metricsSnapshots: Map<string, MetricsSnapshot> = new Map()

  // Test Results Operations
  async saveTestResult(result: TestResult): Promise<void> {
    this.testResults.set(result.id, result)
    console.log(`💾 Saved test result: ${result.id}`)
  }

  async getTestResult(id: string): Promise<TestResult | null> {
    return this.testResults.get(id) || null
  }

  async getAllTestResults(limit?: number): Promise<TestResult[]> {
    const results = Array.from(this.testResults.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    return limit ? results.slice(0, limit) : results
  }

  async getTestResultsByType(type: TestResult['testType'], limit?: number): Promise<TestResult[]> {
    const results = Array.from(this.testResults.values())
      .filter(result => result.testType === type)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    return limit ? results.slice(0, limit) : results
  }

  async updateTestResult(id: string, updates: Partial<TestResult>): Promise<boolean> {
    const existing = this.testResults.get(id)
    if (!existing) return false

    this.testResults.set(id, { ...existing, ...updates })
    return true
  }

  async deleteTestResult(id: string): Promise<boolean> {
    return this.testResults.delete(id)
  }

  // Metrics Snapshots Operations
  async saveMetricsSnapshot(snapshot: MetricsSnapshot): Promise<void> {
    this.metricsSnapshots.set(snapshot.id, snapshot)
    
    // Keep only last 1000 snapshots to prevent memory bloat
    if (this.metricsSnapshots.size > 1000) {
      const snapshots = Array.from(this.metricsSnapshots.entries())
        .sort((a, b) => new Date(a[1].timestamp).getTime() - new Date(b[1].timestamp).getTime())
      
      // Remove oldest 100 snapshots
      for (let i = 0; i < 100; i++) {
        this.metricsSnapshots.delete(snapshots[i][0])
      }
    }
  }

  async getRecentMetrics(hours: number = 24): Promise<MetricsSnapshot[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
    
    return Array.from(this.metricsSnapshots.values())
      .filter(snapshot => new Date(snapshot.timestamp) > cutoff)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  async getMetricsStats(hours: number = 24): Promise<{
    avgTps: number
    avgBlockTime: number
    avgGasPrice: number
    avgNetworkHealth: number
    totalSnapshots: number
  }> {
    const recentMetrics = await this.getRecentMetrics(hours)
    
    if (recentMetrics.length === 0) {
      return {
        avgTps: 0,
        avgBlockTime: 0,
        avgGasPrice: 0,
        avgNetworkHealth: 0,
        totalSnapshots: 0
      }
    }

    const totals = recentMetrics.reduce(
      (acc, metric) => ({
        tps: acc.tps + metric.tps,
        blockTime: acc.blockTime + metric.blockTime,
        gasPrice: acc.gasPrice + parseFloat(metric.gasPrice),
        networkHealth: acc.networkHealth + metric.networkHealth
      }),
      { tps: 0, blockTime: 0, gasPrice: 0, networkHealth: 0 }
    )

    const count = recentMetrics.length
    
    return {
      avgTps: Math.round(totals.tps / count),
      avgBlockTime: Math.round((totals.blockTime / count) * 100) / 100,
      avgGasPrice: Math.round((totals.gasPrice / count) * 1000000) / 1000000,
      avgNetworkHealth: Math.round((totals.networkHealth / count) * 10) / 10,
      totalSnapshots: count
    }
  }

  // Clear all data (for testing)
  async clearAll(): Promise<void> {
    this.testResults.clear()
    this.metricsSnapshots.clear()
    console.log('🗑️ Database cleared')
  }

  // Get database stats
  getStats(): { testResults: number; metricsSnapshots: number } {
    return {
      testResults: this.testResults.size,
      metricsSnapshots: this.metricsSnapshots.size
    }
  }
}

// Export singleton instance
export const db = new InMemoryDatabase()

// Helper functions
export async function saveTestResult(result: TestResult): Promise<void> {
  return db.saveTestResult(result)
}

export async function getTestResults(limit?: number): Promise<TestResult[]> {
  return db.getAllTestResults(limit)
}

export async function saveMetricsSnapshot(metrics: {
  tps: number
  blockTime: number
  gasPrice: string
  networkHealth: number
  blockNumber: number
  chainId: number
  rpcUrl: string
}): Promise<void> {
  const snapshot: MetricsSnapshot = {
    id: `metrics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...metrics
  }
  
  return db.saveMetricsSnapshot(snapshot)
}

export async function getRecentMetrics(hours: number = 24): Promise<MetricsSnapshot[]> {
  return db.getRecentMetrics(hours)
}

// Initialize with some sample data
export async function initializeSampleData(): Promise<void> {
  const sampleTests: TestResult[] = [
    {
      id: 'test_1',
      testName: 'ERC20 Mass Airdrop',
      testType: 'erc20',
      status: 'completed',
      timestamp: new Date(Date.now() - 60000 * 15).toISOString(),
      tps: 2340,
      gasUsed: 42000000,
      duration: 156,
      successRate: 98.7,
      blockNumber: 1240567,
      txHash: '0x123...abc',
      parameters: { txCount: 10000, batchSize: 100 },
      networkData: {
        chainId: 10143,
        rpcUrl: 'https://monad-testnet.rpc.hypersync.xyz',
        blockTime: 1.2,
        gasPrice: '0.001'
      }
    },
    {
      id: 'test_2',
      testName: 'NFT Batch Minting',
      testType: 'nft',
      status: 'completed',
      timestamp: new Date(Date.now() - 60000 * 45).toISOString(),
      tps: 1850,
      gasUsed: 68000000,
      duration: 203,
      successRate: 99.1,
      blockNumber: 1240234,
      txHash: '0x456...def',
      parameters: { txCount: 5000, batchSize: 50 },
      networkData: {
        chainId: 10143,
        rpcUrl: 'https://monad-testnet.rpc.hypersync.xyz',
        blockTime: 1.1,
        gasPrice: '0.002'
      }
    }
  ]

  for (const test of sampleTests) {
    await db.saveTestResult(test)
  }

  console.log('✅ Sample data initialized')
} 