import { PrismaClient } from '@prisma/client'
import { NetworkMetrics, Transaction } from './MonadRPCService'
import logger from '../utils/logger'

export class DatabaseService {
  private static instance: DatabaseService
  private prisma: PrismaClient
  private isConnected: boolean = false

  private constructor() {
    this.prisma = new PrismaClient({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'info', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
    })

    // Log database queries in development
    if (process.env.NODE_ENV === 'development') {
      this.prisma.$on('query', (e) => {
        logger.debug('Database Query:', {
          query: e.query,
          params: e.params,
          duration: `${e.duration}ms`
        })
      })
    }
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect()
      
      // Test the connection
      await this.prisma.$queryRaw`SELECT 1`
      
      this.isConnected = true
      logger.info('✅ Database connected successfully')
    } catch (error) {
      logger.error('❌ Failed to connect to database:', error)
      throw error
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect()
      this.isConnected = false
      logger.info('✅ Database disconnected successfully')
    } catch (error) {
      logger.error('❌ Error disconnecting from database:', error)
      throw error
    }
  }

  public isServiceConnected(): boolean {
    return this.isConnected
  }

  // Metrics operations
  public async saveMetrics(metrics: NetworkMetrics[]): Promise<void> {
    try {
      const data = metrics.map(metric => ({
        blockNumber: metric.blockNumber,
        gasPrice: metric.gasPrice,
        tps: metric.tps,
        blockTime: metric.blockTime,
        networkHealth: metric.networkHealth,
        totalTransactions: metric.totalTransactions,
        timestamp: metric.timestamp,
        createdAt: new Date()
      }))

      await this.prisma.metrics.createMany({
        data,
        skipDuplicates: true
      })

      logger.debug(`Saved ${metrics.length} metrics to database`)
    } catch (error) {
      logger.error('Error saving metrics:', error)
      throw error
    }
  }

  public async getMetricsByTimeRange(startTime: Date, endTime: Date): Promise<NetworkMetrics[]> {
    try {
      const metrics = await this.prisma.metrics.findMany({
        where: {
          timestamp: {
            gte: startTime,
            lte: endTime
          }
        },
        orderBy: {
          timestamp: 'asc'
        }
      })

      return metrics.map(this.formatMetricsFromDB)
    } catch (error) {
      logger.error('Error fetching metrics by time range:', error)
      throw error
    }
  }

  public async getLatestMetrics(limit: number = 100): Promise<NetworkMetrics[]> {
    try {
      const metrics = await this.prisma.metrics.findMany({
        take: limit,
        orderBy: {
          timestamp: 'desc'
        }
      })

      return metrics.map(this.formatMetricsFromDB)
    } catch (error) {
      logger.error('Error fetching latest metrics:', error)
      throw error
    }
  }

  // Hourly aggregates
  public async saveHourlyAggregate(metrics: NetworkMetrics, timestamp: Date): Promise<void> {
    try {
      await this.prisma.hourlyAggregates.upsert({
        where: { timestamp },
        update: {
          blockNumber: metrics.blockNumber,
          gasPrice: metrics.gasPrice,
          tps: metrics.tps,
          blockTime: metrics.blockTime,
          networkHealth: metrics.networkHealth,
          totalTransactions: metrics.totalTransactions,
          updatedAt: new Date()
        },
        create: {
          timestamp,
          blockNumber: metrics.blockNumber,
          gasPrice: metrics.gasPrice,
          tps: metrics.tps,
          blockTime: metrics.blockTime,
          networkHealth: metrics.networkHealth,
          totalTransactions: metrics.totalTransactions,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      logger.debug('Saved hourly aggregate to database')
    } catch (error) {
      logger.error('Error saving hourly aggregate:', error)
      throw error
    }
  }

  public async getHourlyAggregatesByTimeRange(startTime: Date, endTime: Date): Promise<NetworkMetrics[]> {
    try {
      const aggregates = await this.prisma.hourlyAggregates.findMany({
        where: {
          timestamp: {
            gte: startTime,
            lte: endTime
          }
        },
        orderBy: {
          timestamp: 'asc'
        }
      })

      return aggregates.map(this.formatMetricsFromDB)
    } catch (error) {
      logger.error('Error fetching hourly aggregates:', error)
      throw error
    }
  }

  // Daily aggregates
  public async saveDailyAggregate(metrics: NetworkMetrics, timestamp: Date): Promise<void> {
    try {
      await this.prisma.dailyAggregates.upsert({
        where: { timestamp },
        update: {
          blockNumber: metrics.blockNumber,
          gasPrice: metrics.gasPrice,
          tps: metrics.tps,
          blockTime: metrics.blockTime,
          networkHealth: metrics.networkHealth,
          totalTransactions: metrics.totalTransactions,
          updatedAt: new Date()
        },
        create: {
          timestamp,
          blockNumber: metrics.blockNumber,
          gasPrice: metrics.gasPrice,
          tps: metrics.tps,
          blockTime: metrics.blockTime,
          networkHealth: metrics.networkHealth,
          totalTransactions: metrics.totalTransactions,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      logger.debug('Saved daily aggregate to database')
    } catch (error) {
      logger.error('Error saving daily aggregate:', error)
      throw error
    }
  }

  public async getDailyAggregatesByTimeRange(startTime: Date, endTime: Date): Promise<NetworkMetrics[]> {
    try {
      const aggregates = await this.prisma.dailyAggregates.findMany({
        where: {
          timestamp: {
            gte: startTime,
            lte: endTime
          }
        },
        orderBy: {
          timestamp: 'asc'
        }
      })

      return aggregates.map(this.formatMetricsFromDB)
    } catch (error) {
      logger.error('Error fetching daily aggregates:', error)
      throw error
    }
  }

  // Transactions operations
  public async saveTransaction(transaction: Transaction): Promise<void> {
    try {
      await this.prisma.transactions.upsert({
        where: { hash: transaction.hash },
        update: {
          from: transaction.from,
          to: transaction.to,
          value: transaction.value,
          gasPrice: transaction.gasPrice,
          gasUsed: transaction.gasUsed,
          gasLimit: transaction.gasLimit,
          blockNumber: transaction.blockNumber,
          blockHash: transaction.blockHash,
          timestamp: transaction.timestamp,
          status: transaction.status,
          type: transaction.type,
          updatedAt: new Date()
        },
        create: {
          hash: transaction.hash,
          from: transaction.from,
          to: transaction.to,
          value: transaction.value,
          gasPrice: transaction.gasPrice,
          gasUsed: transaction.gasUsed,
          gasLimit: transaction.gasLimit,
          blockNumber: transaction.blockNumber,
          blockHash: transaction.blockHash,
          timestamp: transaction.timestamp,
          status: transaction.status,
          type: transaction.type,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    } catch (error) {
      logger.error('Error saving transaction:', error)
      throw error
    }
  }

  public async saveTransactions(transactions: Transaction[]): Promise<void> {
    try {
      for (const transaction of transactions) {
        await this.saveTransaction(transaction)
      }
      logger.debug(`Saved ${transactions.length} transactions to database`)
    } catch (error) {
      logger.error('Error saving transactions:', error)
      throw error
    }
  }

  public async getTransactionsByTimeRange(startTime: Date, endTime: Date, limit: number = 1000): Promise<Transaction[]> {
    try {
      const transactions = await this.prisma.transactions.findMany({
        where: {
          timestamp: {
            gte: startTime,
            lte: endTime
          }
        },
        take: limit,
        orderBy: {
          timestamp: 'desc'
        }
      })

      return transactions.map(this.formatTransactionFromDB)
    } catch (error) {
      logger.error('Error fetching transactions by time range:', error)
      throw error
    }
  }

  public async getTransactionByHash(hash: string): Promise<Transaction | null> {
    try {
      const transaction = await this.prisma.transactions.findUnique({
        where: { hash }
      })

      return transaction ? this.formatTransactionFromDB(transaction) : null
    } catch (error) {
      logger.error('Error fetching transaction by hash:', error)
      throw error
    }
  }

  public async getLatestTransactions(limit: number = 20): Promise<Transaction[]> {
    try {
      const transactions = await this.prisma.transactions.findMany({
        take: limit,
        orderBy: {
          timestamp: 'desc'
        }
      })

      return transactions.map(this.formatTransactionFromDB)
    } catch (error) {
      logger.error('Error fetching latest transactions:', error)
      throw error
    }
  }

  // Alerts operations
  public async saveAlert(alert: any): Promise<string> {
    try {
      const savedAlert = await this.prisma.alerts.create({
        data: {
          type: alert.type,
          condition: alert.condition,
          threshold: alert.threshold,
          message: alert.message,
          triggered: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      return savedAlert.id
    } catch (error) {
      logger.error('Error saving alert:', error)
      throw error
    }
  }

  public async updateAlertStatus(id: string, triggered: boolean): Promise<void> {
    try {
      await this.prisma.alerts.update({
        where: { id },
        data: {
          triggered,
          updatedAt: new Date()
        }
      })
    } catch (error) {
      logger.error('Error updating alert status:', error)
      throw error
    }
  }

  public async deleteAlert(id: string): Promise<void> {
    try {
      await this.prisma.alerts.delete({
        where: { id }
      })
    } catch (error) {
      logger.error('Error deleting alert:', error)
      throw error
    }
  }

  public async getAlerts(): Promise<any[]> {
    try {
      return await this.prisma.alerts.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      })
    } catch (error) {
      logger.error('Error fetching alerts:', error)
      throw error
    }
  }

  // User operations (for future authentication)
  public async createUser(userData: { email: string, passwordHash: string, name?: string }): Promise<string> {
    try {
      const user = await this.prisma.users.create({
        data: {
          email: userData.email,
          passwordHash: userData.passwordHash,
          name: userData.name,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      return user.id
    } catch (error) {
      logger.error('Error creating user:', error)
      throw error
    }
  }

  public async getUserByEmail(email: string): Promise<any | null> {
    try {
      return await this.prisma.users.findUnique({
        where: { email }
      })
    } catch (error) {
      logger.error('Error fetching user by email:', error)
      throw error
    }
  }

  public async getUserById(id: string): Promise<any | null> {
    try {
      return await this.prisma.users.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true
        }
      })
    } catch (error) {
      logger.error('Error fetching user by ID:', error)
      throw error
    }
  }

  // Analytics operations
  public async getAnalytics(timeRange: { start: Date, end: Date }) {
    try {
      const [
        totalTransactions,
        avgTps,
        avgBlockTime,
        avgNetworkHealth,
        peakTps,
        transactionsByType,
        hourlyActivity
      ] = await Promise.all([
        this.prisma.transactions.count({
          where: {
            timestamp: {
              gte: timeRange.start,
              lte: timeRange.end
            }
          }
        }),
        this.prisma.metrics.aggregate({
          where: {
            timestamp: {
              gte: timeRange.start,
              lte: timeRange.end
            }
          },
          _avg: { tps: true }
        }),
        this.prisma.metrics.aggregate({
          where: {
            timestamp: {
              gte: timeRange.start,
              lte: timeRange.end
            }
          },
          _avg: { blockTime: true }
        }),
        this.prisma.metrics.aggregate({
          where: {
            timestamp: {
              gte: timeRange.start,
              lte: timeRange.end
            }
          },
          _avg: { networkHealth: true }
        }),
        this.prisma.metrics.aggregate({
          where: {
            timestamp: {
              gte: timeRange.start,
              lte: timeRange.end
            }
          },
          _max: { tps: true }
        }),
        this.prisma.transactions.groupBy({
          by: ['type'],
          where: {
            timestamp: {
              gte: timeRange.start,
              lte: timeRange.end
            }
          },
          _count: { _all: true }
        }),
        this.prisma.$queryRaw`
          SELECT 
            DATE_TRUNC('hour', timestamp) as hour,
            COUNT(*) as transaction_count,
            AVG(tps) as avg_tps
          FROM metrics 
          WHERE timestamp >= ${timeRange.start} AND timestamp <= ${timeRange.end}
          GROUP BY hour
          ORDER BY hour
        `
      ])

      return {
        totalTransactions,
        avgTps: avgTps._avg.tps || 0,
        avgBlockTime: avgBlockTime._avg.blockTime || 0,
        avgNetworkHealth: avgNetworkHealth._avg.networkHealth || 0,
        peakTps: peakTps._max.tps || 0,
        transactionsByType,
        hourlyActivity
      }
    } catch (error) {
      logger.error('Error fetching analytics:', error)
      throw error
    }
  }

  // Cleanup operations
  public async cleanupOldMetrics(cutoffDate: Date): Promise<void> {
    try {
      const deletedMetrics = await this.prisma.metrics.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate
          }
        }
      })

      const deletedTransactions = await this.prisma.transactions.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate
          }
        }
      })

      logger.info(`Cleaned up ${deletedMetrics.count} metrics and ${deletedTransactions.count} transactions`)
    } catch (error) {
      logger.error('Error cleaning up old data:', error)
      throw error
    }
  }

  // Health check
  public async healthCheck(): Promise<{ status: string, details: any }> {
    try {
      const start = Date.now()
      await this.prisma.$queryRaw`SELECT 1`
      const queryTime = Date.now() - start

      const [metricsCount, transactionsCount] = await Promise.all([
        this.prisma.metrics.count(),
        this.prisma.transactions.count()
      ])

      return {
        status: 'healthy',
        details: {
          connected: this.isConnected,
          queryTime: `${queryTime}ms`,
          totalMetrics: metricsCount,
          totalTransactions: transactionsCount,
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          connected: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }
    }
  }

  // Utility methods
  private formatMetricsFromDB(dbMetrics: any): NetworkMetrics {
    return {
      blockNumber: dbMetrics.blockNumber,
      gasPrice: dbMetrics.gasPrice,
      tps: dbMetrics.tps,
      blockTime: dbMetrics.blockTime,
      networkHealth: dbMetrics.networkHealth,
      totalTransactions: dbMetrics.totalTransactions,
      timestamp: dbMetrics.timestamp
    }
  }

  private formatTransactionFromDB(dbTransaction: any): Transaction {
    return {
      hash: dbTransaction.hash,
      from: dbTransaction.from,
      to: dbTransaction.to,
      value: dbTransaction.value,
      gasPrice: dbTransaction.gasPrice,
      gasUsed: dbTransaction.gasUsed,
      gasLimit: dbTransaction.gasLimit,
      blockNumber: dbTransaction.blockNumber,
      blockHash: dbTransaction.blockHash,
      timestamp: dbTransaction.timestamp,
      status: dbTransaction.status as 'success' | 'failed' | 'pending',
      type: dbTransaction.type as 'transfer' | 'contract' | 'swap' | 'mint' | 'burn' | 'bridge'
    }
  }
} 