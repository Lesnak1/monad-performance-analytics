import { ethers } from 'ethers'
import WebSocket from 'ws'
import logger from '../utils/logger'

export interface NetworkMetrics {
  blockNumber: number
  gasPrice: string
  tps: number
  blockTime: number
  networkHealth: number
  totalTransactions: number
  timestamp: Date
}

export interface Transaction {
  hash: string
  from: string
  to: string | null
  value: string
  gasPrice: string
  gasUsed: string
  gasLimit: string
  blockNumber: number
  blockHash: string
  timestamp: Date
  status: 'success' | 'failed' | 'pending'
  type: 'transfer' | 'contract' | 'swap' | 'mint' | 'burn' | 'bridge'
}

export interface Block {
  number: number
  hash: string
  parentHash: string
  timestamp: Date
  gasUsed: string
  gasLimit: string
  transactionCount: number
  transactions: string[]
  difficulty: string
  totalDifficulty: string
}

export class MonadRPCService {
  private static instance: MonadRPCService
  private provider: ethers.JsonRpcProvider
  private fallbackProvider: ethers.JsonRpcProvider
  private wsProvider: WebSocket | null = null
  private isConnected: boolean = false
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private currentBlockNumber: number = 0
  private transactionPool: Transaction[] = []
  private metricsHistory: NetworkMetrics[] = []

  private constructor() {
    const rpcUrl = process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'
    const fallbackUrl = process.env.MONAD_RPC_FALLBACK || 'https://monad-testnet.rpc.caldera.xyz/http'
    
    this.provider = new ethers.JsonRpcProvider(rpcUrl)
    this.fallbackProvider = new ethers.JsonRpcProvider(fallbackUrl)
  }

  public static getInstance(): MonadRPCService {
    if (!MonadRPCService.instance) {
      MonadRPCService.instance = new MonadRPCService()
    }
    return MonadRPCService.instance
  }

  public async initialize(): Promise<void> {
    try {
      // Test connection
      await this.testConnection()
      
      // Set up WebSocket connection for real-time data
      await this.initializeWebSocket()
      
      // Start listening to new blocks
      this.setupBlockListener()
      
      this.isConnected = true
      logger.info('✅ Monad RPC Service initialized successfully')
    } catch (error) {
      logger.error('❌ Failed to initialize Monad RPC Service:', error)
      throw error
    }
  }

  private async testConnection(): Promise<void> {
    try {
      const network = await this.provider.getNetwork()
      const blockNumber = await this.provider.getBlockNumber()
      
      logger.info('🔗 Connected to Monad network:', {
        chainId: network.chainId.toString(),
        name: network.name,
        currentBlock: blockNumber
      })
      
      this.currentBlockNumber = blockNumber
    } catch (error) {
      logger.warn('Primary RPC failed, trying fallback...')
      
      try {
        const network = await this.fallbackProvider.getNetwork()
        const blockNumber = await this.fallbackProvider.getBlockNumber()
        
        // Switch to fallback provider
        this.provider = this.fallbackProvider
        this.currentBlockNumber = blockNumber
        
        logger.info('✅ Connected to Monad network via fallback:', {
          chainId: network.chainId.toString(),
          currentBlock: blockNumber
        })
      } catch (fallbackError) {
        throw new Error('Both primary and fallback RPC endpoints failed')
      }
    }
  }

  private async initializeWebSocket(): Promise<void> {
    try {
      const wsUrl = process.env.MONAD_WSS_URL || 'wss://testnet-rpc.monad.xyz'
      this.wsProvider = new WebSocket(wsUrl)

      this.wsProvider.on('open', () => {
        logger.info('✅ WebSocket connection established')
        this.reconnectAttempts = 0
        
        // Subscribe to new block headers
        this.wsProvider?.send(JSON.stringify({
          id: 1,
          method: 'eth_subscribe',
          params: ['newHeads']
        }))
      })

      this.wsProvider.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString())
          if (message.method === 'eth_subscription') {
            this.handleNewBlock(message.params.result)
          }
        } catch (error) {
          logger.error('Error parsing WebSocket message:', error)
        }
      })

      this.wsProvider.on('close', () => {
        logger.warn('WebSocket connection closed')
        this.reconnectWebSocket()
      })

      this.wsProvider.on('error', (error) => {
        logger.error('WebSocket error:', error)
        this.reconnectWebSocket()
      })

    } catch (error) {
      logger.warn('WebSocket initialization failed, continuing with polling:', error)
    }
  }

  private reconnectWebSocket(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max WebSocket reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
    
    logger.info(`Attempting WebSocket reconnection in ${delay}ms (attempt ${this.reconnectAttempts})`)
    
    setTimeout(() => {
      this.initializeWebSocket()
    }, delay)
  }

  private setupBlockListener(): void {
    // Fallback polling in case WebSocket fails
    setInterval(async () => {
      try {
        const latestBlock = await this.provider.getBlockNumber()
        if (latestBlock > this.currentBlockNumber) {
          const block = await this.provider.getBlock(latestBlock, true)
          if (block) {
            this.handleNewBlock({
              number: `0x${block.number.toString(16)}`,
              hash: block.hash,
              timestamp: `0x${block.timestamp.toString(16)}`
            })
          }
        }
      } catch (error) {
        logger.error('Error in block polling:', error)
      }
    }, 5000) // Poll every 5 seconds
  }

  private async handleNewBlock(blockHeader: any): Promise<void> {
    try {
      const blockNumber = parseInt(blockHeader.number, 16)
      
      if (blockNumber <= this.currentBlockNumber) return
      
      const block = await this.provider.getBlock(blockNumber, true)
      if (!block) return

      this.currentBlockNumber = blockNumber
      
      // Calculate metrics
      const metrics = await this.calculateNetworkMetrics(block)
      this.metricsHistory.push(metrics)
      
      // Keep only last 1000 metrics entries
      if (this.metricsHistory.length > 1000) {
        this.metricsHistory = this.metricsHistory.slice(-1000)
      }

      // Process transactions
      if (block.transactions) {
        for (const txHash of block.transactions.slice(0, 10)) { // Limit to 10 recent transactions
          try {
            const tx = await this.provider.getTransaction(txHash as string)
            const receipt = await this.provider.getTransactionReceipt(txHash as string)
            
            if (tx && receipt) {
              const transaction = this.formatTransaction(tx, receipt, block)
              this.transactionPool.unshift(transaction)
              
              // Keep only last 100 transactions in memory
              if (this.transactionPool.length > 100) {
                this.transactionPool = this.transactionPool.slice(0, 100)
              }
            }
          } catch (error) {
            logger.error(`Error processing transaction ${txHash}:`, error)
          }
        }
      }

      logger.logBlockchainEvent('NewBlock', {
        blockNumber,
        transactionCount: block.transactions?.length || 0,
        gasUsed: block.gasUsed.toString(),
        timestamp: new Date(block.timestamp * 1000)
      })

    } catch (error) {
      logger.error('Error handling new block:', error)
    }
  }

  private async calculateNetworkMetrics(block: any): Promise<NetworkMetrics> {
    try {
      const gasPrice = await this.provider.getFeeData()
      
      // Calculate TPS from recent blocks
      const tps = await this.calculateTPS()
      
      // Calculate block time
      const blockTime = await this.calculateBlockTime()
      
      // Calculate network health (simplified metric)
      const networkHealth = this.calculateNetworkHealth(block, tps, blockTime)

      return {
        blockNumber: block.number,
        gasPrice: gasPrice.gasPrice?.toString() || '0',
        tps,
        blockTime,
        networkHealth,
        totalTransactions: this.transactionPool.length,
        timestamp: new Date()
      }
    } catch (error) {
      logger.error('Error calculating network metrics:', error)
      return {
        blockNumber: block.number,
        gasPrice: '0',
        tps: 0,
        blockTime: 0,
        networkHealth: 0,
        totalTransactions: 0,
        timestamp: new Date()
      }
    }
  }

  private async calculateTPS(): Promise<number> {
    try {
      if (this.metricsHistory.length < 2) return 0
      
      const recent = this.metricsHistory.slice(-10) // Last 10 blocks
      const totalTransactions = recent.reduce((sum, metric) => sum + metric.totalTransactions, 0)
      const timeSpan = (recent[recent.length - 1].timestamp.getTime() - recent[0].timestamp.getTime()) / 1000
      
      return timeSpan > 0 ? totalTransactions / timeSpan : 0
    } catch (error) {
      return 0
    }
  }

  private async calculateBlockTime(): Promise<number> {
    try {
      if (this.metricsHistory.length < 2) return 0
      
      const recent = this.metricsHistory.slice(-5) // Last 5 blocks
      if (recent.length < 2) return 0
      
      const totalTime = recent[recent.length - 1].timestamp.getTime() - recent[0].timestamp.getTime()
      const averageBlockTime = totalTime / (recent.length - 1) / 1000 // in seconds
      
      return averageBlockTime
    } catch (error) {
      return 0
    }
  }

  private calculateNetworkHealth(block: any, tps: number, blockTime: number): number {
    // Simplified network health calculation (0-100)
    let health = 100
    
    // Penalize slow TPS
    if (tps < 10) health -= 20
    else if (tps < 50) health -= 10
    
    // Penalize slow block times
    if (blockTime > 10) health -= 20
    else if (blockTime > 5) health -= 10
    
    // Penalize high gas usage
    const gasUsagePercent = Number(block.gasUsed) / Number(block.gasLimit) * 100
    if (gasUsagePercent > 90) health -= 15
    else if (gasUsagePercent > 70) health -= 10
    
    return Math.max(0, health)
  }

  private formatTransaction(tx: any, receipt: any, block: any): Transaction {
    return {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value.toString(),
      gasPrice: tx.gasPrice?.toString() || '0',
      gasUsed: receipt.gasUsed.toString(),
      gasLimit: tx.gasLimit.toString(),
      blockNumber: block.number,
      blockHash: block.hash,
      timestamp: new Date(block.timestamp * 1000),
      status: receipt.status === 1 ? 'success' : 'failed',
      type: this.determineTransactionType(tx, receipt)
    }
  }

  private determineTransactionType(tx: any, receipt: any): Transaction['type'] {
    if (tx.to === null) return 'contract' // Contract deployment
    if (tx.data && tx.data !== '0x') return 'contract' // Contract interaction
    if (tx.value && tx.value.toString() !== '0') return 'transfer'
    return 'transfer'
  }

  // Public methods for accessing data
  public getCurrentMetrics(): NetworkMetrics | null {
    return this.metricsHistory.length > 0 ? this.metricsHistory[this.metricsHistory.length - 1] : null
  }

  public getRecentTransactions(limit: number = 20): Transaction[] {
    return this.transactionPool.slice(0, limit)
  }

  public getMetricsHistory(limit: number = 100): NetworkMetrics[] {
    return this.metricsHistory.slice(-limit)
  }

  public async getBlockByNumber(blockNumber: number): Promise<Block | null> {
    try {
      const block = await this.provider.getBlock(blockNumber, true)
      if (!block) return null

      return {
        number: block.number,
        hash: block.hash,
        parentHash: block.parentHash,
        timestamp: new Date(block.timestamp * 1000),
        gasUsed: block.gasUsed.toString(),
        gasLimit: block.gasLimit.toString(),
        transactionCount: block.transactions?.length || 0,
        transactions: block.transactions || [],
        difficulty: block.difficulty?.toString() || '0',
        totalDifficulty: '0' // This might not be available in all networks
      }
    } catch (error) {
      logger.error(`Error fetching block ${blockNumber}:`, error)
      return null
    }
  }

  public async getTransactionByHash(hash: string): Promise<Transaction | null> {
    try {
      const tx = await this.provider.getTransaction(hash)
      const receipt = await this.provider.getTransactionReceipt(hash)
      
      if (!tx || !receipt) return null

      const block = await this.provider.getBlock(tx.blockNumber!)
      if (!block) return null

      return this.formatTransaction(tx, receipt, block)
    } catch (error) {
      logger.error(`Error fetching transaction ${hash}:`, error)
      return null
    }
  }

  public isServiceConnected(): boolean {
    return this.isConnected
  }
} 