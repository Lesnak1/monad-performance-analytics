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
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h')
  const [activeTab, setActiveTab] = useState<'performance' | 'distribution' | 'comparison'>('performance')
  const [data, setData] = useState<AnalyticsData | null>(null)

  // Generate comprehensive analytics data
  useEffect(() => {
    const generateAnalyticsData = (): AnalyticsData => {
      const now = Date.now()
      const intervals = {
        '1h': { count: 60, step: 60000 },
        '6h': { count: 72, step: 300000 },
        '24h': { count: 96, step: 900000 },
        '7d': { count: 168, step: 3600000 },
        '30d': { count: 120, step: 21600000 }
      }
      
      const { count, step } = intervals[timeRange]
      
      // Performance metrics
      const performance = {
        tps: [],
        gasPrice: [],
        blockTime: [],
        networkHealth: [],
        timestamps: []
      }
      
      for (let i = 0; i < count; i++) {
        const timestamp = now - (count - 1 - i) * step
        const date = new Date(timestamp)
        
        // Daily activity pattern (higher during day hours)
        const hour = date.getHours()
        const activityMultiplier = 0.7 + 0.3 * Math.sin((hour - 6) * Math.PI / 12)
        
        performance.tps.push(Math.round((150 + Math.random() * 50) * activityMultiplier))
        performance.gasPrice.push(Number((52 + Math.random() * 2).toFixed(1)))
        performance.blockTime.push(Number((0.6 + Math.random() * 0.1).toFixed(2)))
        performance.networkHealth.push(Math.round(95 + Math.random() * 5))
        performance.timestamps.push(timeRange === '1h' || timeRange === '6h' 
          ? date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
          : date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })
        )
      }
      
      // Distribution data
      const distribution = {
        txTypes: [
          { name: 'Transfer', value: 45, color: '#00d4ff' },
          { name: 'Contract', value: 28, color: '#8b5cf6' },
          { name: 'Swap', value: 18, color: '#10b981' },
          { name: 'Mint', value: 9, color: '#f59e0b' }
        ],
        gasUsage: [
          { range: '0-50K', count: 8500 },
          { range: '50-100K', count: 12300 },
          { range: '100-200K', count: 15600 },
          { range: '200-500K', count: 9200 },
          { range: '500K+', count: 3400 }
        ],
        timeOfDay: Array.from({ length: 24 }, (_, hour) => ({
          hour,
          activity: Math.round(50 + 30 * Math.sin((hour - 6) * Math.PI / 12) + Math.random() * 20)
        }))
      }
      
      // Comparison data
      const comparison = {
        chains: [
          { name: 'Monad', tps: 175, gasPrice: 52.8, blockTime: 0.6 },
          { name: 'Ethereum', tps: 15, gasPrice: 25.50, blockTime: 12.0 },
          { name: 'BSC', tps: 35, gasPrice: 5.20, blockTime: 3.0 },
          { name: 'Polygon', tps: 42, gasPrice: 30.15, blockTime: 2.1 },
          { name: 'Arbitrum', tps: 28, gasPrice: 0.85, blockTime: 0.8 }
        ],
        historical: [
          { period: 'Last Hour', avgTps: 58, change: 12.5 },
          { period: 'Last 6H', avgTps: 62, change: 8.2 },
          { period: 'Last 24H', avgTps: 55, change: -3.1 },
          { period: 'Last 7D', avgTps: 59, change: 15.7 },
          { period: 'Last 30D', avgTps: 52, change: -2.8 }
        ]
      }
      
      return { performance, distribution, comparison }
    }
    
    setData(generateAnalyticsData())
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
            {(['1h', '6h', '24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
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
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === key
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
        {activeTab === 'performance' && (
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
        {activeTab === 'distribution' && (
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
        {activeTab === 'comparison' && (
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