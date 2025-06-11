import { spawn, ChildProcess } from 'child_process'
import path from 'path'

export interface FoundryTestConfig {
  testType: 'erc20' | 'nft' | 'defi' | 'multi'
  parameters: {
    txCount?: number
    batchSize?: number
    gasLimit?: number
    iterations?: number
  }
  rpcUrl: string
  privateKey?: string
}

export interface FoundryTestResult {
  success: boolean
  gasUsed: number
  duration: number
  txHash?: string
  blockNumber?: number
  error?: string
  logs: string[]
}

export class FoundryRunner {
  private contractsPath: string
  private foundryPath: string

  constructor() {
    // Assuming we're in frontend/ and contracts are in ../contracts/
    this.contractsPath = path.resolve(__dirname, '../../../contracts')
    this.foundryPath = 'forge' // Assumes forge is in PATH
  }

  async runBenchmark(config: FoundryTestConfig): Promise<FoundryTestResult> {
    console.log(`🔨 Starting Foundry benchmark: ${config.testType}`)
    
    try {
      const scriptName = this.getScriptName(config.testType)
      const args = this.buildFoundryArgs(config, scriptName)
      
      console.log(`Running: ${this.foundryPath} ${args.join(' ')}`)
      
      const result = await this.executeFoundryScript(args, config.rpcUrl)
      
      if (result.success) {
        console.log(`✅ Foundry benchmark completed: ${config.testType}`)
      } else {
        console.error(`❌ Foundry benchmark failed: ${config.testType}`, result.error)
      }
      
      return result
    } catch (error) {
      console.error('Foundry execution error:', error)
      return {
        success: false,
        gasUsed: 0,
        duration: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        logs: [`Error: ${error}`]
      }
    }
  }

  private getScriptName(testType: string): string {
    switch (testType) {
      case 'erc20':
        return 'ERC20Benchmark'
      case 'nft':
        return 'NFTBenchmark'
      case 'defi':
        return 'DeFiBenchmark'
      case 'multi':
        return 'MultiBenchmark'
      default:
        throw new Error(`Unknown test type: ${testType}`)
    }
  }

  private buildFoundryArgs(config: FoundryTestConfig, scriptName: string): string[] {
    const args = [
      'script',
      `script/Benchmark.s.sol:${scriptName}`,
      '--rpc-url', config.rpcUrl,
      '--broadcast',
      '--legacy' // Use legacy transactions for better compatibility
    ]

    // Add private key if provided
    if (config.privateKey) {
      args.push('--private-key', config.privateKey)
    }

    // Add gas limit if specified
    if (config.parameters.gasLimit) {
      args.push('--gas-limit', config.parameters.gasLimit.toString())
    }

    return args
  }

  private executeFoundryScript(args: string[], rpcUrl: string): Promise<FoundryTestResult> {
    return new Promise((resolve) => {
      const startTime = Date.now()
      const logs: string[] = []
      let gasUsed = 0
      let txHash: string | undefined
      let blockNumber: number | undefined

      const childProcess = spawn(this.foundryPath, args, {
        cwd: this.contractsPath,
        env: {
          ...process.env,
          RPC_URL: rpcUrl
        }
      })

      childProcess.stdout.on('data', (data) => {
        const output = data.toString()
        logs.push(output)
        console.log('Foundry stdout:', output)

        // Parse gas usage from output
        const gasMatch = output.match(/gas used: (\d+)/i)
        if (gasMatch) {
          gasUsed += parseInt(gasMatch[1])
        }

        // Parse transaction hash
        const txHashMatch = output.match(/hash: (0x[a-fA-F0-9]{64})/i)
        if (txHashMatch) {
          txHash = txHashMatch[1]
        }

        // Parse block number
        const blockMatch = output.match(/block: (\d+)/i)
        if (blockMatch) {
          blockNumber = parseInt(blockMatch[1])
        }
      })

      childProcess.stderr.on('data', (data) => {
        const error = data.toString()
        logs.push(`ERROR: ${error}`)
        console.error('Foundry stderr:', error)
      })

      childProcess.on('close', (code) => {
        const duration = (Date.now() - startTime) / 1000

        if (code === 0) {
          resolve({
            success: true,
            gasUsed,
            duration,
            txHash,
            blockNumber,
            logs
          })
        } else {
          resolve({
            success: false,
            gasUsed,
            duration,
            error: `Process exited with code ${code}`,
            logs
          })
        }
      })

      childProcess.on('error', (error) => {
        resolve({
          success: false,
          gasUsed: 0,
          duration: (Date.now() - startTime) / 1000,
          error: error.message,
          logs: [...logs, `Process error: ${error.message}`]
        })
      })

      // Timeout after 5 minutes
      setTimeout(() => {
        childProcess.kill('SIGTERM')
        resolve({
          success: false,
          gasUsed,
          duration: (Date.now() - startTime) / 1000,
          error: 'Timeout: Process killed after 5 minutes',
          logs: [...logs, 'Timeout: Process killed after 5 minutes']
        })
      }, 5 * 60 * 1000)
    })
  }

  // Check if Foundry is available
  async checkFoundryAvailability(): Promise<boolean> {
    return new Promise((resolve) => {
      const foundryProcess = spawn(this.foundryPath, ['--version'])
      
      foundryProcess.on('close', (code) => {
        resolve(code === 0)
      })
      
      foundryProcess.on('error', () => {
        resolve(false)
      })

      // Timeout after 5 seconds
      setTimeout(() => {
        foundryProcess.kill()
        resolve(false)
      }, 5000)
    })
  }

  // Get available test types
  getAvailableTests(): string[] {
    return ['erc20', 'nft', 'defi', 'multi']
  }

  // Validate test configuration
  validateConfig(config: FoundryTestConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!config.testType) {
      errors.push('Test type is required')
    }

    if (!this.getAvailableTests().includes(config.testType)) {
      errors.push(`Invalid test type: ${config.testType}`)
    }

    if (!config.rpcUrl) {
      errors.push('RPC URL is required')
    }

    if (config.parameters.txCount && config.parameters.txCount < 1) {
      errors.push('Transaction count must be greater than 0')
    }

    if (config.parameters.batchSize && config.parameters.batchSize < 1) {
      errors.push('Batch size must be greater than 0')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Singleton instance
export const foundryRunner = new FoundryRunner()

// Environment setup helper
export async function setupFoundryEnvironment(): Promise<boolean> {
  try {
    const isAvailable = await foundryRunner.checkFoundryAvailability()
    
    if (!isAvailable) {
      console.warn('⚠️ Foundry not available. Real benchmark execution disabled.')
      return false
    }

    console.log('✅ Foundry environment ready')
    return true
  } catch (error) {
    console.error('Failed to setup Foundry environment:', error)
    return false
  }
} 