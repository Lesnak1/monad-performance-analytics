import { MonadRPCService, NetworkMetrics, Transaction } from './MonadRPCService'
import { DatabaseService } from './DatabaseService'
import logger from '../utils/logger'

export interface ProcessedMetrics {
  current: NetworkMetrics
  historical: {
    hourly: NetworkMetrics[]
    daily: NetworkMetrics[]
    weekly: NetworkMetrics[]
  }
  statistics: {
    avgTps: number
    avgBlockTime: number
    avgGasPrice: string
    totalTransactions: number
    healthScore: number
  }
  alerts: Alert[]
}

export interface Alert {
  id: string
  type: 'tps' | 'gas_price' | 'block_time' | 'network_health'
  condition: 'above' | 'below'
  threshold: number
  triggered: boolean
  message: string
  timestamp: Date
}

export class MetricsCollector {
  private rpcService: MonadRPCService
  private dbService: DatabaseService
  private isRunning: boolean = false
  private collectionInterval: NodeJS.Timeout | null = null
  private metricsBuffer: NetworkMetrics[] = []
  private alerts: Alert[] = []
  private collectors: Map<string, any> = new Map()

  constructor(rpcService: MonadRPCService, dbService: DatabaseService) {
    this.rpcService = rpcService
    this.dbService = dbService
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Metrics collector is already running')
      return
    }

    try {
      this.isRunning = true
      
      // Start real-time metrics collection
      this.startRealTimeCollection()
      
      // Start periodic database saves
      this.startPeriodicSave()
      
      // Start alert checking
      this.startAlertChecking()
      
      // Initialize data aggregators
      this.initializeAggregators()
      
      logger.info('✅ Metrics collector started successfully')
    } catch (error) {
      logger.error('❌ Failed to start metrics collector:', error)
      throw error
    }
  }

  public async stop(): Promise<void> {
    if (!this.isRunning) return

    this.isRunning = false
    
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval)
      this.collectionInterval = null
    }

    // Clear all collectors
    this.collectors.forEach((collector, key) => {
      if (collector && typeof collector.stop === 'function') {
        collector.stop()
      }
    })
    this.collectors.clear()

    // Save remaining buffered data
    if (this.metricsBuffer.length > 0) {
      await this.saveMetricsToDatabase()
    }

    logger.info('✅ Metrics collector stopped')
  }

  private startRealTimeCollection(): void {
    const interval = parseInt(process.env.METRICS_COLLECTION_INTERVAL || '5000')
    
    this.collectionInterval = setInterval(async () => {
      try {
        const currentMetrics = this.rpcService.getCurrentMetrics()
        
        if (currentMetrics) {
          this.metricsBuffer.push(currentMetrics)
          
          // Log metrics periodically
          if (this.metricsBuffer.length % 10 === 0) {
            logger.logMetrics({
              bufferSize: this.metricsBuffer.length,
              latestTps: currentMetrics.tps,
              latestBlockNumber: currentMetrics.blockNumber,
              networkHealth: currentMetrics.networkHealth
            })
          }
        }
      } catch (error) {
        logger.error('Error in real-time collection:', error)
      }
    }, interval)
  }

  private startPeriodicSave(): void {
    // Save metrics to database every minute
    setInterval(async () => {
      try {
        await this.saveMetricsToDatabase()
      } catch (error) {
        logger.error('Error saving metrics to database:', error)
      }
    }, 60000) // Every minute
  }

  private startAlertChecking(): void {
    // Check alerts every 30 seconds
    setInterval(() => {
      try {
        this.checkAlerts()
      } catch (error) {
        logger.error('Error checking alerts:', error)
      }
    }, 30000)
  }

  private initializeAggregators(): void {
    // Hourly aggregator
    this.collectors.set('hourly', setInterval(async () => {
      await this.aggregateHourlyData()
    }, 3600000)) // Every hour

    // Daily aggregator
    this.collectors.set('daily', setInterval(async () => {
      await this.aggregateDailyData()
    }, 86400000)) // Every day

    // Cleanup old data
    this.collectors.set('cleanup', setInterval(async () => {
      await this.cleanupOldData()
    }, 86400000)) // Every day
  }

  private async saveMetricsToDatabase(): Promise<void> {
    if (this.metricsBuffer.length === 0) return

    try {
      const metricsToSave = [...this.metricsBuffer]
      this.metricsBuffer = []

      // Save to database (assuming we have the database tables set up)
      await this.dbService.saveMetrics(metricsToSave)
      
      logger.debug(`Saved ${metricsToSave.length} metrics to database`)
    } catch (error) {
      logger.error('Failed to save metrics to database:', error)
      // Re-add metrics to buffer if save failed
      this.metricsBuffer.unshift(...this.metricsBuffer)
    }
  }

  private checkAlerts(): void {
    const currentMetrics = this.rpcService.getCurrentMetrics()
    if (!currentMetrics) return

    for (const alert of this.alerts) {
      if (!alert.triggered) {
        const shouldTrigger = this.evaluateAlertCondition(alert, currentMetrics)
        
        if (shouldTrigger) {
          alert.triggered = true
          alert.timestamp = new Date()
          
          logger.warn('Alert triggered:', {
            type: alert.type,
            condition: alert.condition,
            threshold: alert.threshold,
            currentValue: this.getMetricValue(alert.type, currentMetrics),
            message: alert.message
          })
          
          // Emit alert event (for WebSocket broadcasting)
          this.emitAlertEvent(alert)
        }
      }
    }
  }

  private evaluateAlertCondition(alert: Alert, metrics: NetworkMetrics): boolean {
    const value = this.getMetricValue(alert.type, metrics)
    
    switch (alert.condition) {
      case 'above':
        return value > alert.threshold
      case 'below':
        return value < alert.threshold
      default:
        return false
    }
  }

  private getMetricValue(type: Alert['type'], metrics: NetworkMetrics): number {
    switch (type) {
      case 'tps':
        return metrics.tps
      case 'gas_price':
        return parseFloat(metrics.gasPrice) / 1e9 // Convert to Gwei
      case 'block_time':
        return metrics.blockTime
      case 'network_health':
        return metrics.networkHealth
      default:
        return 0
    }
  }

  private emitAlertEvent(alert: Alert): void {
    // Emit alert event to other parts of the application
    // Could integrate with notification systems, webhooks, etc.
    logger.warn('Alert Event Emitted:', alert)
  }

  private async aggregateHourlyData(): Promise<void> {
    try {
      const endTime = new Date()
      const startTime = new Date(endTime.getTime() - 3600000) // 1 hour ago

      const hourlyData = await this.dbService.getMetricsByTimeRange(startTime, endTime)
      if (hourlyData.length === 0) return

      const aggregated = this.aggregateMetrics(hourlyData)
      await this.dbService.saveHourlyAggregate(aggregated, startTime)
      
      logger.debug('Hourly data aggregated and saved')
    } catch (error) {
      logger.error('Error aggregating hourly data:', error)
    }
  }

  private async aggregateDailyData(): Promise<void> {
    try {
      const endTime = new Date()
      const startTime = new Date(endTime.getTime() - 86400000) // 24 hours ago

      const dailyData = await this.dbService.getHourlyAggregatesByTimeRange(startTime, endTime)
      if (dailyData.length === 0) return

      const aggregated = this.aggregateMetrics(dailyData)
      await this.dbService.saveDailyAggregate(aggregated, startTime)
      
      logger.debug('Daily data aggregated and saved')
    } catch (error) {
      logger.error('Error aggregating daily data:', error)
    }
  }

  private aggregateMetrics(metrics: NetworkMetrics[]): NetworkMetrics {
    if (metrics.length === 0) {
      throw new Error('Cannot aggregate empty metrics array')
    }

    const avgTps = metrics.reduce((sum, m) => sum + m.tps, 0) / metrics.length
    const avgBlockTime = metrics.reduce((sum, m) => sum + m.blockTime, 0) / metrics.length
    const avgNetworkHealth = metrics.reduce((sum, m) => sum + m.networkHealth, 0) / metrics.length
    const totalTransactions = metrics.reduce((sum, m) => sum + m.totalTransactions, 0)
    
    // Use the latest values for some fields
    const latest = metrics[metrics.length - 1]

    return {
      blockNumber: latest.blockNumber,
      gasPrice: latest.gasPrice,
      tps: Math.round(avgTps * 100) / 100,
      blockTime: Math.round(avgBlockTime * 100) / 100,
      networkHealth: Math.round(avgNetworkHealth * 100) / 100,
      totalTransactions,
      timestamp: latest.timestamp
    }
  }

  private async cleanupOldData(): Promise<void> {
    try {
      const retentionDays = parseInt(process.env.HISTORICAL_DATA_RETENTION_DAYS || '30')
      const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000)
      
      await this.dbService.cleanupOldMetrics(cutoffDate)
      
      logger.info(`Cleaned up metrics data older than ${retentionDays} days`)
    } catch (error) {
      logger.error('Error cleaning up old data:', error)
    }
  }

  // Public methods for external access
  public async getCurrentProcessedMetrics(): Promise<ProcessedMetrics> {
    try {
      const current = this.rpcService.getCurrentMetrics()
      
      if (!current) {
        throw new Error('No current metrics available')
      }

      // Get historical data
      const historical = await this.getHistoricalData()
      
      // Calculate statistics
      const statistics = await this.calculateStatistics()
      
      return {
        current,
        historical,
        statistics,
        alerts: this.alerts.filter(a => a.triggered)
      }
    } catch (error) {
      logger.error('Error getting processed metrics:', error)
      throw error
    }
  }

  private async getHistoricalData() {
    const now = new Date()
    
    // Get hourly data for last 24 hours
    const hourlyStart = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const hourly = await this.dbService.getHourlyAggregatesByTimeRange(hourlyStart, now)
    
    // Get daily data for last 30 days
    const dailyStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const daily = await this.dbService.getDailyAggregatesByTimeRange(dailyStart, now)
    
    // Get weekly data (derived from daily)
    const weekly = this.aggregateToWeekly(daily)
    
    return { hourly, daily, weekly }
  }

  private aggregateToWeekly(dailyData: NetworkMetrics[]): NetworkMetrics[] {
    const weekly: NetworkMetrics[] = []
    
    for (let i = 0; i < dailyData.length; i += 7) {
      const weekData = dailyData.slice(i, i + 7)
      if (weekData.length > 0) {
        weekly.push(this.aggregateMetrics(weekData))
      }
    }
    
    return weekly
  }

  private async calculateStatistics() {
    const metricsHistory = this.rpcService.getMetricsHistory(100)
    
    if (metricsHistory.length === 0) {
      return {
        avgTps: 0,
        avgBlockTime: 0,
        avgGasPrice: '0',
        totalTransactions: 0,
        healthScore: 0
      }
    }

    const avgTps = metricsHistory.reduce((sum, m) => sum + m.tps, 0) / metricsHistory.length
    const avgBlockTime = metricsHistory.reduce((sum, m) => sum + m.blockTime, 0) / metricsHistory.length
    const avgGasPrice = metricsHistory.reduce((sum, m) => sum + parseFloat(m.gasPrice), 0) / metricsHistory.length
    const totalTransactions = metricsHistory.reduce((sum, m) => sum + m.totalTransactions, 0)
    const healthScore = metricsHistory.reduce((sum, m) => sum + m.networkHealth, 0) / metricsHistory.length

    return {
      avgTps: Math.round(avgTps * 100) / 100,
      avgBlockTime: Math.round(avgBlockTime * 100) / 100,
      avgGasPrice: avgGasPrice.toString(),
      totalTransactions,
      healthScore: Math.round(healthScore * 100) / 100
    }
  }

  // Alert management methods
  public addAlert(alert: Omit<Alert, 'id' | 'triggered' | 'timestamp'>): string {
    const id = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const newAlert: Alert = {
      ...alert,
      id,
      triggered: false,
      timestamp: new Date()
    }
    
    this.alerts.push(newAlert)
    logger.info('Alert added:', newAlert)
    
    return id
  }

  public removeAlert(id: string): boolean {
    const index = this.alerts.findIndex(a => a.id === id)
    if (index !== -1) {
      this.alerts.splice(index, 1)
      logger.info(`Alert removed: ${id}`)
      return true
    }
    return false
  }

  public getAlerts(): Alert[] {
    return [...this.alerts]
  }

  public resetAlert(id: string): boolean {
    const alert = this.alerts.find(a => a.id === id)
    if (alert) {
      alert.triggered = false
      logger.info(`Alert reset: ${id}`)
      return true
    }
    return false
  }

  // Export functionality
  public async exportMetrics(format: 'csv' | 'json', timeRange: { start: Date, end: Date }) {
    try {
      const metrics = await this.dbService.getMetricsByTimeRange(timeRange.start, timeRange.end)
      
      if (format === 'csv') {
        return this.convertToCSV(metrics)
      } else {
        return JSON.stringify(metrics, null, 2)
      }
    } catch (error) {
      logger.error('Error exporting metrics:', error)
      throw error
    }
  }

  private convertToCSV(metrics: NetworkMetrics[]): string {
    if (metrics.length === 0) return ''
    
    const headers = Object.keys(metrics[0]).join(',')
    const rows = metrics.map(metric => Object.values(metric).join(','))
    
    return [headers, ...rows].join('\n')
  }
} 