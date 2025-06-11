import type { NextApiRequest, NextApiResponse } from 'next'
import { saveTestResult, getTestResults, db, TestResult } from '../../lib/database'
import { getNetworkStatus } from '../../lib/monadData'

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

// In-memory storage (should be replaced with database)
const runningTests = new Map<string, BenchmarkResult>()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get all benchmark results from database
        const results = await getTestResults(50) // Get last 50 results
        return res.status(200).json({ results, status: 'success' })

      case 'POST':
        // Start new benchmark test
        const benchmarkReq: BenchmarkRequest = req.body
        
        if (!benchmarkReq.testType) {
          return res.status(400).json({ error: 'Test type is required' })
        }

        const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const networkStatus = await getNetworkStatus()
        
        // Create initial test record in database
        const newTest: TestResult = {
          id: testId,
          testName: getTestName(benchmarkReq.testType),
          testType: benchmarkReq.testType,
          status: 'running',
          timestamp: new Date().toISOString(),
          tps: 0,
          gasUsed: 0,
          duration: 0,
          successRate: 0,
          parameters: benchmarkReq.parameters,
          networkData: {
            chainId: networkStatus.chainId,
            rpcUrl: networkStatus.rpcUrl,
            blockTime: 1, // Will be updated during execution
            gasPrice: '0.001' // Will be updated during execution
          }
        }

        await saveTestResult(newTest)
        
        // Also store in memory for real-time updates
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

        // Simulate benchmark execution (replace with real Foundry integration)
        simulateBenchmark(testId, benchmarkReq)

        return res.status(201).json({ 
          testId,
          message: 'Benchmark started successfully',
          status: 'success'
        })

      case 'GET':
        // Get specific test result
        const { id } = req.query
        if (typeof id === 'string' && runningTests.has(id)) {
          return res.status(200).json({ 
            result: runningTests.get(id),
            status: 'success'
          })
        }
        return res.status(404).json({ error: 'Test not found' })

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Benchmark API Error:', error)
    
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    })
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

// Simulate benchmark execution (replace with real Foundry script execution)
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
      
      // Update final result in database
      try {
        await db.updateTestResult(testId, {
          status: test.status,
          tps: test.tps,
          gasUsed: test.gasUsed,
          duration: test.duration,
          successRate: test.successRate,
          blockNumber: test.blockNumber,
          txHash: test.txHash
        })
        console.log(`✅ Test ${testId} completed and saved to database`)
      } catch (error) {
        console.error(`❌ Failed to save test result ${testId}:`, error)
      }
    }

    runningTests.set(testId, test)
  }
} 