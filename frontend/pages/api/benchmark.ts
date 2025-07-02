import type { NextApiRequest, NextApiResponse } from 'next'

interface BenchmarkData {
  throughput: number
  latency: number
  memoryUsage: number
  cpuUsage: number
  networkLoad: number
  timestamp: number
}

interface BenchmarkRequest {
  testType: 'erc20' | 'nft' | 'defi' | 'multi'
  parameters: {
    txCount?: number
    batchSize?: number
    gasLimit?: number
    iterations?: number
  }
}

interface BenchmarkResult {
  id: string
  testType: string
  status: 'running' | 'completed' | 'failed'
  progress: number
  tps: number
  gasUsed: number
  duration: number
  successRate: number
  blockNumber?: number
  txHash?: string
  timestamp: number
}

// In-memory storage for running tests
const runningTests = new Map<string, BenchmarkResult>()

// Cache benchmark data to reduce API calls
let cachedBenchmark: BenchmarkData | null = null
let lastBenchmarkFetch = 0
const BENCHMARK_CACHE_DURATION = 5000 // 5 seconds

function generateRealisticBenchmark(): BenchmarkData {
  const now = Date.now()
  
  // Generate realistic benchmark data based on Monad's capabilities
  const baseThroughput = 45 + Math.random() * 85 // 45-130 TPS range
  const baseLatency = 300 + Math.random() * 200 // 300-500ms
  const baseMemory = 65 + Math.random() * 25 // 65-90% memory usage
  const baseCpu = 30 + Math.random() * 40 // 30-70% CPU usage
  const baseNetwork = 20 + Math.random() * 60 // 20-80% network load

  return {
    throughput: Math.round(baseThroughput),
    latency: Math.round(baseLatency),
    memoryUsage: Math.round(baseMemory),
    cpuUsage: Math.round(baseCpu),
    networkLoad: Math.round(baseNetwork),
    timestamp: now
  }
}

// Helper function to get test names
function getTestName(testType: string): string {
  switch (testType) {
    case 'erc20': return 'ERC20 Mass Transfer'
    case 'nft': return 'NFT Batch Minting'
    case 'defi': return 'DeFi Swap Stress Test'
    case 'multi': return 'Multi-Contract Interaction'
    default: return 'Unknown Test'
  }
}

// Simulate benchmark execution
async function simulateBenchmark(testId: string, request: BenchmarkRequest) {
  const test = runningTests.get(testId)
  if (!test) return

  const totalDuration = Math.random() * 30000 + 15000 // 15-45 seconds
  const updateInterval = 1000 // Update every second
  const totalUpdates = Math.floor(totalDuration / updateInterval)

  for (let i = 0; i <= totalUpdates; i++) {
    await new Promise(resolve => setTimeout(resolve, updateInterval))
    
    const progress = Math.min((i / totalUpdates) * 100, 100)
    const currentTps = Math.floor(Math.random() * 2000) + 500 // 500-2500 TPS
    const currentGas = Math.floor(Math.random() * 1000000) + 500000
    const currentSuccess = 95 + Math.random() * 5 // 95-100%

    test.progress = progress
    test.tps = currentTps
    test.gasUsed = currentGas
    test.duration = i * (updateInterval / 1000)
    test.successRate = currentSuccess

    if (progress >= 100) {
      test.status = Math.random() > 0.1 ? 'completed' : 'failed'
      test.blockNumber = Math.floor(Math.random() * 1000) + 1240000
      test.txHash = `0x${Math.random().toString(16).substr(2, 64)}`
    }

    runningTests.set(testId, test)
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

  const now = Date.now()

  try {
    switch (req.method) {
      case 'GET':
        // Check if requesting specific test or benchmark data
        const { id, type } = req.query

        if (id && typeof id === 'string') {
          // Get specific test result
          if (runningTests.has(id)) {
            return res.status(200).json({ 
              result: runningTests.get(id),
              status: 'success'
            })
          }
          return res.status(404).json({ error: 'Test not found' })
        }

        if (type === 'data') {
          // Return cached benchmark data if still fresh
          if (cachedBenchmark && (now - lastBenchmarkFetch < BENCHMARK_CACHE_DURATION)) {
            return res.status(200).json({
              success: true,
              data: cachedBenchmark,
              cached: true,
              timestamp: new Date().toISOString()
            })
          }

          // Generate new benchmark data
          const benchmarkData = generateRealisticBenchmark()
          cachedBenchmark = benchmarkData
          lastBenchmarkFetch = now
          
          return res.status(200).json({
            success: true,
            data: benchmarkData,
            cached: false,
            timestamp: new Date().toISOString()
          })
        }

        // Return all running tests
        return res.status(200).json({ 
          results: Array.from(runningTests.values()),
          status: 'success' 
        })

      case 'POST':
        // Start new benchmark test
        const benchmarkReq: BenchmarkRequest = req.body
        
        if (!benchmarkReq.testType) {
          return res.status(400).json({ error: 'Test type is required' })
        }

        const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        // Create initial test record
        const runtimeTest: BenchmarkResult = {
          id: testId,
          testType: benchmarkReq.testType,
          status: 'running',
          progress: 0,
          tps: 0,
          gasUsed: 0,
          duration: 0,
          successRate: 0,
          timestamp: Date.now()
        }
        runningTests.set(testId, runtimeTest)

        // Start benchmark simulation
        simulateBenchmark(testId, benchmarkReq)

        return res.status(201).json({ 
          testId,
          message: 'Benchmark started successfully',
          status: 'success'
        })

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Benchmark API Error:', error)
    
    res.status(500).json({
      success: false,
      error: 'Failed to process benchmark request',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
} 