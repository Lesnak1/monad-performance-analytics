'use client'
import { motion } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Activity,
  Zap,
  Clock,
  Users,
  Database,
  Network,
  Filter,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart
} from 'recharts'

interface AnalyticsData {
  performance: {
    tps: number[]
    gasPrice: number[]
    blockTime: number[]
    networkHealth: number[]
    timestamps: string[]
  }
  distribution: {
    txTypes: { name: string; value: number; color: string }[]
    gasUsage: { range: string; count: number }[]
    timeOfDay: { hour: number; activity: number }[]
  }
  comparison: {
    chains: { name: string; tps: number; gasPrice: number; blockTime: number }[]
    historical: { period: string; avgTps: number; change: number }[]
  }
}

export default function AdvancedAnalytics() {
  const [selectedMetric, setSelectedMetric] = useState<'tps' | 'gasPrice' | 'blockTime' | 'networkHealth'>('tps')
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h')
  const [viewType, setViewType] = useState<'overview' | 'performance' | 'distribution' | 'comparison'>('overview')
  const [data, setData] = useState<AnalyticsData>({
    performance: {
      tps: [],
      gasPrice: [],
      blockTime: [],
      networkHealth: [],
      timestamps: []
    },
    distribution: {
      txTypes: [],
      gasUsage: [],
      timeOfDay: []
    },
    comparison: {
      chains: [],
      historical: []
    }
  })

  // Fetch real data from backend with fallback
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      let currentMetrics = null
      
      try {
        const metricsResponse = await fetch('/api/metrics').catch(() => null)
        
        if (metricsResponse && metricsResponse.ok) {
          const result = await metricsResponse.json()
          if (result.success) {
            currentMetrics = result.data
          }
        }
      } catch (error) {
        console.log('Backend API not available for analytics, using mock data')
      }

      // Generate analytics data (with real or mock metrics)
      const newData: AnalyticsData = {
        performance: {
          tps: [],
          gasPrice: [],
          blockTime: [],
          networkHealth: [],
          timestamps: []
        },
        distribution: {
          txTypes: [
            { name: 'Transfer', value: 65, color: '#00d4ff' },
            { name: 'Contract', value: 20, color: '#8b5cf6' },
            { name: 'Swap', value: 10, color: '#10b981' },
            { name: 'Mint', value: 3, color: '#f59e0b' },
            { name: 'Other', value: 2, color: '#ef4444' }
          ],
          gasUsage: [
            { range: '0-50K', count: 2340 },
            { range: '50-100K', count: 1890 },
            { range: '100-200K', count: 1230 },
            { range: '200K+', count: 340 }
          ],
          timeOfDay: []
        },
        comparison: {
          chains: [
            { 
              name: 'Monad', 
              tps: currentMetrics ? currentMetrics.tps : 127, 
              gasPrice: currentMetrics ? parseFloat(currentMetrics.gasPrice) : 50, 
              blockTime: 0.6 
            },
            { name: 'Ethereum', tps: 15, gasPrice: 25, blockTime: 12 },
            { name: 'Polygon', tps: 65, gasPrice: 1.2, blockTime: 2.2 },
            { name: 'Binance Smart Chain', tps: 55, gasPrice: 5, blockTime: 3 },
            { name: 'Avalanche', tps: 45, gasPrice: 25, blockTime: 2 }
          ],
          historical: [
            { period: 'This week', avgTps: currentMetrics ? currentMetrics.tps : 127, change: 15.3 },
            { period: 'Last week', avgTps: 112, change: -8.2 },
            { period: 'This month', avgTps: 145, change: 22.1 },
            { period: 'Last month', avgTps: 98, change: -5.4 }
          ]
        }
      }

      // Generate historical performance data based on current metrics
      const now = Date.now()
      const intervals = {
        '1h': { count: 60, step: 60000 },     // 1 minute
        '6h': { count: 72, step: 300000 },    // 5 minutes  
        '24h': { count: 48, step: 1800000 },  // 30 minutes
        '7d': { count: 168, step: 3600000 }   // 1 hour
      }
      
      const { count, step } = intervals[timeRange]
      
      for (let i = 0; i < count; i++) {
        const timestamp = new Date(now - (count - 1 - i) * step).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
        
        const baseTps = currentMetrics ? currentMetrics.tps : 127
        const baseGasPrice = currentMetrics ? parseFloat(currentMetrics.gasPrice) : 50
        
        newData.performance.timestamps.push(timestamp)
        newData.performance.tps.push(Math.max(50, baseTps + Math.floor(Math.random() * 40 - 20)))
        newData.performance.gasPrice.push(Math.max(40, baseGasPrice + Math.random() * 10 - 5))
        newData.performance.blockTime.push(0.6 + Math.random() * 0.2)
        newData.performance.networkHealth.push(95 + Math.random() * 5)
      }

      // Time of day distribution
      for (let hour = 0; hour < 24; hour++) {
        newData.distribution.timeOfDay.push({
          hour,
          activity: 50 + Math.sin(hour * Math.PI / 12) * 30 + Math.random() * 20
        })
      }

      setData(newData)
    }

    fetchAnalyticsData()
    const interval = setInterval(fetchAnalyticsData, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [timeRange])

  const chartColors = ['#00d4ff', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']

  if (!data) return <div>Loading analytics...</div>

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white text-glow">Advanced Analytics</h2>
          <p className="text-white/60 mt-1">Deep insights into Monad network performance</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Time Range Selector */}
          <div className="flex items-center space-x-2 glass-subtle rounded-lg p-1">
            {(['1h', '6h', '24h', '7d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={`px-3 py-1 rounded text-sm transition-all ${
                  timeRange === range
                    ? 'bg-cyber-blue text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 glass-subtle rounded-lg p-1 w-fit">
        {[
          { key: 'performance', label: 'Performance', icon: TrendingUp },
          { key: 'distribution', label: 'Distribution', icon: PieChart },
          { key: 'comparison', label: 'Comparison', icon: BarChart3 }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setViewType(key as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              viewType === key
                ? 'bg-cyber-blue text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Performance Tab */}
        {viewType === 'performance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* TPS Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-cyber-blue" />
                TPS Performance
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.performance.timestamps.map((time, i) => ({
                    time,
                    tps: data.performance.tps[i]
                  }))}>
                    <defs>
                      <linearGradient id="tpsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="time" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.6)' }} />
                    <YAxis tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.6)' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="tps"
                      stroke="#00d4ff"
                      strokeWidth={2}
                      fill="url(#tpsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Gas Price Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2 text-cyber-purple" />
                Gas Price Trends
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.performance.timestamps.map((time, i) => ({
                    time,
                    gasPrice: data.performance.gasPrice[i]
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="time" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.6)' }} />
                    <YAxis tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.6)' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="gasPrice"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Network Health */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Network className="w-5 h-5 mr-2 text-cyber-green" />
                Network Health
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.performance.timestamps.map((time, i) => ({
                    time,
                    health: data.performance.networkHealth[i]
                  }))}>
                    <defs>
                      <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="time" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.6)' }} />
                    <YAxis domain={[90, 100]} tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.6)' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="health"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#healthGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Block Time Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-cyber-yellow" />
                Block Time Consistency
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.performance.timestamps.map((time, i) => ({
                    time,
                    blockTime: data.performance.blockTime[i]
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="time" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.6)' }} />
                    <YAxis tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.6)' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="blockTime" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        )}

        {/* Distribution Tab */}
        {viewType === 'distribution' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Transaction Types */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Transaction Types</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={data.distribution.txTypes}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.distribution.txTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Gas Usage Distribution */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Gas Usage Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.distribution.gasUsage}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="range" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.6)' }} />
                    <YAxis tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.6)' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="count" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Daily Activity Pattern */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Daily Activity Pattern</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.distribution.timeOfDay}>
                    <defs>
                      <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="hour" 
                      tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.6)' }}
                      tickFormatter={(hour) => `${hour}:00`}
                    />
                    <YAxis tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.6)' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }}
                      labelFormatter={(hour) => `${hour}:00`}
                    />
                    <Area
                      type="monotone"
                      dataKey="activity"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#activityGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        )}

        {/* Comparison Tab */}
        {viewType === 'comparison' && (
          <div className="space-y-6">
            {/* Blockchain Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-6">Blockchain Performance Comparison</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['tps', 'gasPrice', 'blockTime'].map((metric, index) => (
                  <div key={metric} className="space-y-4">
                    <h4 className="text-lg font-medium text-white capitalize">
                      {metric === 'tps' ? 'TPS' : metric === 'gasPrice' ? 'Gas Price (Gwei)' : 'Block Time (s)'}
                    </h4>
                    <div className="space-y-2">
                      {data.comparison.chains
                        .sort((a, b) => {
                          if (metric === 'tps') return b.tps - a.tps
                          if (metric === 'gasPrice') return a.gasPrice - b.gasPrice
                          return a.blockTime - b.blockTime
                        })
                        .map((chain, chainIndex) => {
                          const value = chain[metric as keyof typeof chain]
                          const isMonad = chain.name === 'Monad'
                          return (
                            <motion.div
                              key={chain.name}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 + chainIndex * 0.05 }}
                              className={`flex items-center justify-between p-3 rounded-lg ${
                                isMonad ? 'bg-cyber-blue/20 border border-cyber-blue/30' : 'bg-white/5'
                              }`}
                            >
                              <span className={`font-medium ${isMonad ? 'text-cyber-blue' : 'text-white/80'}`}>
                                {chain.name}
                              </span>
                              <span className={`font-bold ${isMonad ? 'text-white' : 'text-white/60'}`}>
                                {typeof value === 'number' ? value.toFixed(metric === 'blockTime' ? 1 : 0) : value}
                              </span>
                            </motion.div>
                          )
                        })
                      }
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Historical Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-6">Historical Performance Trends</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {data.comparison.historical.map((period, index) => (
                  <motion.div
                    key={period.period}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-subtle rounded-lg p-4 text-center"
                  >
                    <div className="text-white/60 text-sm mb-2">{period.period}</div>
                    <div className="text-2xl font-bold text-white mb-2">{period.avgTps}</div>
                    <div className={`flex items-center justify-center space-x-1 text-sm ${
                      period.change >= 0 ? 'text-cyber-green' : 'text-red-400'
                    }`}>
                      {period.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      <span>{Math.abs(period.change).toFixed(1)}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  )
} 