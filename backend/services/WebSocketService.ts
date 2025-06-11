import { Server as SocketIOServer } from 'socket.io'
import { MetricsCollector, Alert } from './MetricsCollector'
import { MonadRPCService } from './MonadRPCService'
import logger from '../utils/logger'

export interface SocketUser {
  id: string
  socket: any
  subscriptions: string[]
  joinedAt: Date
}

export class WebSocketService {
  private io: SocketIOServer
  private metricsCollector: MetricsCollector
  private connectedUsers: Map<string, SocketUser> = new Map()
  private broadcastIntervals: Map<string, NodeJS.Timeout> = new Map()
  private roomStats: Map<string, number> = new Map()

  constructor(io: SocketIOServer, metricsCollector: MetricsCollector) {
    this.io = io
    this.metricsCollector = metricsCollector
  }

  public initialize(): void {
    this.setupSocketHandlers()
    this.setupBroadcastIntervals()
    this.setupAlertListeners()
    
    logger.info('✅ WebSocket service initialized')
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      const userId = socket.id
      
      // Register new user
      const user: SocketUser = {
        id: userId,
        socket,
        subscriptions: [],
        joinedAt: new Date()
      }
      
      this.connectedUsers.set(userId, user)
      
      logger.info(`🔗 New WebSocket connection: ${userId}`)
      
      // Send initial data
      this.sendInitialData(socket)
      
      // Handle subscription requests
      socket.on('subscribe', (data: { type: string, params?: any }) => {
        this.handleSubscription(userId, data)
      })
      
      // Handle unsubscription requests
      socket.on('unsubscribe', (data: { type: string }) => {
        this.handleUnsubscription(userId, data)
      })
      
      // Handle custom requests
      socket.on('request', async (data: { type: string, params?: any }, callback) => {
        await this.handleRequest(userId, data, callback)
      })
      
      // Handle ping/pong for heartbeat
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: Date.now() })
      })
      
      // Handle disconnection
      socket.on('disconnect', (reason) => {
        this.handleDisconnection(userId, reason)
      })
      
      // Handle errors
      socket.on('error', (error) => {
        logger.error(`WebSocket error for user ${userId}:`, error)
      })
    })
  }

  private async sendInitialData(socket: any): Promise<void> {
    try {
      // Get current metrics
      const rpcService = MonadRPCService.getInstance()
      const currentMetrics = rpcService.getCurrentMetrics()
      const recentTransactions = rpcService.getRecentTransactions(10)
      
      // Send initial data
      socket.emit('initial_data', {
        metrics: currentMetrics,
        transactions: recentTransactions,
        timestamp: new Date().toISOString(),
        server_time: Date.now()
      })
      
      // Send connection status
      socket.emit('connection_status', {
        connected: true,
        userId: socket.id,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      logger.error('Error sending initial data:', error)
      socket.emit('error', {
        message: 'Failed to send initial data',
        timestamp: new Date().toISOString()
      })
    }
  }

  private handleSubscription(userId: string, data: { type: string, params?: any }): void {
    const user = this.connectedUsers.get(userId)
    if (!user) return

    const { type, params } = data
    
    // Add subscription if not already subscribed
    if (!user.subscriptions.includes(type)) {
      user.subscriptions.push(type)
    }
    
    // Join specific room for this subscription type
    user.socket.join(`subscription_${type}`)
    
    // Update room stats
    const roomName = `subscription_${type}`
    const currentCount = this.roomStats.get(roomName) || 0
    this.roomStats.set(roomName, currentCount + 1)
    
    logger.debug(`User ${userId} subscribed to ${type}`, params)
    
    // Send confirmation
    user.socket.emit('subscription_confirmed', {
      type,
      params,
      timestamp: new Date().toISOString()
    })
    
    // Send immediate data for this subscription
    this.sendSubscriptionData(user.socket, type, params)
  }

  private handleUnsubscription(userId: string, data: { type: string }): void {
    const user = this.connectedUsers.get(userId)
    if (!user) return

    const { type } = data
    
    // Remove subscription
    user.subscriptions = user.subscriptions.filter(sub => sub !== type)
    
    // Leave room
    user.socket.leave(`subscription_${type}`)
    
    // Update room stats
    const roomName = `subscription_${type}`
    const currentCount = this.roomStats.get(roomName) || 0
    this.roomStats.set(roomName, Math.max(0, currentCount - 1))
    
    logger.debug(`User ${userId} unsubscribed from ${type}`)
    
    // Send confirmation
    user.socket.emit('unsubscription_confirmed', {
      type,
      timestamp: new Date().toISOString()
    })
  }

  private async handleRequest(userId: string, data: { type: string, params?: any }, callback: Function): Promise<void> {
    const user = this.connectedUsers.get(userId)
    if (!user) return

    try {
      const { type, params } = data
      let response: any = null

      switch (type) {
        case 'get_metrics_history':
          const limit = params?.limit || 100
          response = MonadRPCService.getInstance().getMetricsHistory(limit)
          break

        case 'get_recent_transactions':
          const txLimit = params?.limit || 20
          response = MonadRPCService.getInstance().getRecentTransactions(txLimit)
          break

        case 'get_processed_metrics':
          response = await this.metricsCollector.getCurrentProcessedMetrics()
          break

        case 'get_alerts':
          response = this.metricsCollector.getAlerts()
          break

        case 'export_metrics':
          const format = params?.format || 'json'
          const timeRange = params?.timeRange || {
            start: new Date(Date.now() - 24 * 60 * 60 * 1000),
            end: new Date()
          }
          response = await this.metricsCollector.exportMetrics(format, timeRange)
          break

        case 'get_connection_stats':
          response = this.getConnectionStats()
          break

        default:
          throw new Error(`Unknown request type: ${type}`)
      }

      // Send response back
      if (callback && typeof callback === 'function') {
        callback({
          success: true,
          data: response,
          timestamp: new Date().toISOString()
        })
      }

    } catch (error) {
      logger.error(`Error handling request ${data.type} for user ${userId}:`, error)
      
      if (callback && typeof callback === 'function') {
        callback({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        })
      }
    }
  }

  private async sendSubscriptionData(socket: any, type: string, params?: any): Promise<void> {
    try {
      let data: any = null

      switch (type) {
        case 'live_metrics':
          data = MonadRPCService.getInstance().getCurrentMetrics()
          break

        case 'live_transactions':
          const limit = params?.limit || 10
          data = MonadRPCService.getInstance().getRecentTransactions(limit)
          break

        case 'alerts':
          data = this.metricsCollector.getAlerts().filter(alert => alert.triggered)
          break

        case 'network_health':
          const metrics = MonadRPCService.getInstance().getCurrentMetrics()
          data = metrics ? { health: metrics.networkHealth, timestamp: metrics.timestamp } : null
          break
      }

      if (data) {
        socket.emit('subscription_data', {
          type,
          data,
          timestamp: new Date().toISOString()
        })
      }

    } catch (error) {
      logger.error(`Error sending subscription data for ${type}:`, error)
    }
  }

  private handleDisconnection(userId: string, reason: string): void {
    const user = this.connectedUsers.get(userId)
    if (user) {
      // Update room stats for all subscriptions
      user.subscriptions.forEach(subscription => {
        const roomName = `subscription_${subscription}`
        const currentCount = this.roomStats.get(roomName) || 0
        this.roomStats.set(roomName, Math.max(0, currentCount - 1))
      })
    }
    
    this.connectedUsers.delete(userId)
    
    logger.info(`🔌 WebSocket disconnection: ${userId} (${reason})`)
  }

  private setupBroadcastIntervals(): void {
    // Broadcast live metrics every 5 seconds
    const metricsInterval = setInterval(() => {
      this.broadcastToSubscribers('live_metrics')
    }, 5000)
    this.broadcastIntervals.set('metrics', metricsInterval)

    // Broadcast live transactions every 3 seconds
    const transactionsInterval = setInterval(() => {
      this.broadcastToSubscribers('live_transactions')
    }, 3000)
    this.broadcastIntervals.set('transactions', transactionsInterval)

    // Broadcast network health every 10 seconds
    const healthInterval = setInterval(() => {
      this.broadcastToSubscribers('network_health')
    }, 10000)
    this.broadcastIntervals.set('health', healthInterval)

    // Send connection stats every minute
    const statsInterval = setInterval(() => {
      this.broadcastConnectionStats()
    }, 60000)
    this.broadcastIntervals.set('stats', statsInterval)
  }

  private async broadcastToSubscribers(subscriptionType: string): Promise<void> {
    try {
      const roomName = `subscription_${subscriptionType}`
      const subscriberCount = this.roomStats.get(roomName) || 0
      
      if (subscriberCount === 0) return

      let data: any = null

      switch (subscriptionType) {
        case 'live_metrics':
          data = MonadRPCService.getInstance().getCurrentMetrics()
          break

        case 'live_transactions':
          data = MonadRPCService.getInstance().getRecentTransactions(10)
          break

        case 'network_health':
          const metrics = MonadRPCService.getInstance().getCurrentMetrics()
          data = metrics ? { health: metrics.networkHealth, timestamp: metrics.timestamp } : null
          break
      }

      if (data) {
        this.io.to(roomName).emit('subscription_data', {
          type: subscriptionType,
          data,
          timestamp: new Date().toISOString()
        })
      }

    } catch (error) {
      logger.error(`Error broadcasting to ${subscriptionType} subscribers:`, error)
    }
  }

  private setupAlertListeners(): void {
    // Listen for alert events from MetricsCollector
    process.on('alert', (alert: Alert) => {
      this.broadcastAlert(alert)
    })
  }

  private broadcastAlert(alert: Alert): void {
    try {
      // Broadcast to all connected clients
      this.io.emit('alert', {
        alert,
        timestamp: new Date().toISOString()
      })

      // Also broadcast to alert subscribers specifically
      this.io.to('subscription_alerts').emit('subscription_data', {
        type: 'alerts',
        data: alert,
        timestamp: new Date().toISOString()
      })

      logger.info(`📢 Alert broadcasted to ${this.connectedUsers.size} clients:`, alert.message)

    } catch (error) {
      logger.error('Error broadcasting alert:', error)
    }
  }

  private broadcastConnectionStats(): void {
    const stats = this.getConnectionStats()
    
    this.io.emit('connection_stats', {
      stats,
      timestamp: new Date().toISOString()
    })
  }

  private getConnectionStats() {
    const subscriptionCounts: Record<string, number> = {}
    
    this.roomStats.forEach((count, roomName) => {
      if (roomName.startsWith('subscription_')) {
        const subscriptionType = roomName.replace('subscription_', '')
        subscriptionCounts[subscriptionType] = count
      }
    })

    return {
      totalConnections: this.connectedUsers.size,
      subscriptionCounts,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  }

  // Public methods for external use
  public broadcastMessage(event: string, data: any): void {
    this.io.emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    })
  }

  public broadcastToRoom(room: string, event: string, data: any): void {
    this.io.to(room).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    })
  }

  public getConnectedUsersCount(): number {
    return this.connectedUsers.size
  }

  public getSubscriptionStats(): Record<string, number> {
    const stats: Record<string, number> = {}
    
    this.roomStats.forEach((count, roomName) => {
      if (roomName.startsWith('subscription_')) {
        const subscriptionType = roomName.replace('subscription_', '')
        stats[subscriptionType] = count
      }
    })

    return stats
  }

  public cleanup(): void {
    // Clear all broadcast intervals
    this.broadcastIntervals.forEach((interval) => {
      clearInterval(interval)
    })
    this.broadcastIntervals.clear()

    // Disconnect all users
    this.connectedUsers.forEach((user) => {
      user.socket.disconnect(true)
    })
    this.connectedUsers.clear()
    
    // Clear room stats
    this.roomStats.clear()

    logger.info('✅ WebSocket service cleaned up')
  }
} 