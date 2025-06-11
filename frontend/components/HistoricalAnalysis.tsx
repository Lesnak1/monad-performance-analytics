'use client'
import { motion } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import { 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Download,
  Filter,
  Clock,
  Zap,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Equal
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart
} from 'recharts'

interface HistoricalData {
  timestamp: number
  date: string
  tps: number
  gasPrice: number
  blockTime: number
  networkHealth: number
  totalTxs: number
  activeUsers: number
  peakTps: number
  avgResponseTime: number
}

export default function HistoricalAnalysis() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [selectedMetric, setSelectedMetric] = useState<'tps' | 'gasPrice' | 'networkHealth' | 'totalTxs'>('tps')
  const [comparisonMode, setComparisonMode] = useState(false)
  const [data, setData] = useState<HistoricalData[]>([])

  // Generate historical data
  useEffect(() => {
    const generateHistoricalData = (): HistoricalData[] => {
      const now = Date.now()
      const intervals = {
        '7d': { days: 7, step: 86400000 },     // 1 day
        '30d': { days: 30, step: 86400000 },   // 1 day  
        '90d': { days: 90, step: 86400000 },   // 1 day
        '1y': { days: 365, step: 86400000 }    // 1 day
      }
      
      const { days, step } = intervals[timeRange]
      const result: HistoricalData[] = []
      
      for (let i = 0; i < days; i++) {
        const timestamp = now - (days - 1 - i) * step
        const date = new Date(timestamp)
        
        // Simulate seasonal patterns and trends
        const dayOfYear = Math.floor((timestamp - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)
        const weeklyPattern = Math.sin((dayOfYear % 7) * Math.PI / 3.5) * 0.1
        const seasonalPattern = Math.sin(dayOfYear * 2 * Math.PI / 365) * 0.15
        const trend = (dayOfYear / 365) * 0.2 // Slight upward trend
        
        const baseMultiplier = 1 + weeklyPattern + seasonalPattern + trend
        
        result.push({
          timestamp,
          date: date.toLocaleDateString('tr-TR', { 
            month: 'short', 
            day: 'numeric',
            ...(timeRange === '1y' && { year: '2-digit' })
          }),
          tps: Math.round((160 + Math.random() * 40) * baseMultiplier),
          gasPrice: Number(((52 + Math.random() * 4) * (1 + weeklyPattern * 0.1)).toFixed(1)),
          blockTime: Number(((0.6 + Math.random() * 0.1) * (1 - weeklyPattern * 0.05)).toFixed(2)),
          networkHealth: Math.round((96 + Math.random() * 4) * (1 + weeklyPattern * 0.02)),
          totalTxs: Math.round((50000 + Math.random() * 20000) * baseMultiplier),
          activeUsers: Math.round((8000 + Math.random() * 4000) * baseMultiplier),
          peakTps: Math.round((200 + Math.random() * 50) * baseMultiplier),
          avgResponseTime: Number(((45 + Math.random() * 15) * (1 - weeklyPattern * 0.1)).toFixed(1))
        })
      }
      
      return result
    }
    
    setData(generateHistoricalData())
  }, [timeRange])

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data.length) return null

    const currentValue = data[data.length - 1]?.[selectedMetric] || 0
    const previousValue = data[data.length - 2]?.[selectedMetric] || 0
    const change = ((currentValue - previousValue) / previousValue) * 100
    
    const values = data.map(d => d[selectedMetric])
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)
    
    return {
      current: currentValue,
      change,
      average: avg,
      maximum: max,
      minimum: min,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    }
  }, [data, selectedMetric])

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'tps': return 'TPS'
      case 'gasPrice': return 'Gas Price (Gwei)'
      case 'networkHealth': return 'Network Health (%)'
      case 'totalTxs': return 'Daily Transactions'
      default: return metric
    }
  }

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'tps': return '#00d4ff'
      case 'gasPrice': return '#8b5cf6'
      case 'networkHealth': return '#10b981'
      case 'totalTxs': return '#f59e0b'
      default: return '#00d4ff'
    }
  }

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'tps': return <Zap className="w-5 h-5" />
      case 'gasPrice': return <DollarSign className="w-5 h-5" />
      case 'networkHealth': return <Activity className="w-5 h-5" />
      case 'totalTxs': return <BarChart3 className="w-5 h-5" />
      default: return <TrendingUp className="w-5 h-5" />
    }
  }

  const exportData = () => {
    const csvContent = [
      ['Date', 'TPS', 'Gas Price', 'Block Time', 'Network Health', 'Total TXs', 'Active Users'].join(','),
      ...data.map(row => [
        row.date,
        row.tps,
        row.gasPrice,
        row.blockTime,
        row.networkHealth,
        row.totalTxs,
        row.activeUsers
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `monad_historical_${timeRange}_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white text-glow">Historical Analysis</h2>
          <p className="text-white/60 mt-1">Explore Monad network performance over time</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Time Range */}
          <div className="flex items-center space-x-2 glass-subtle rounded-lg p-1">
            {['7d', '30d', '90d', '1y'].map((range) => (
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

          {/* Export */}
          <motion.button
            onClick={exportData}
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
        </div>
      </div>

      {/* Metrics Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(['tps', 'gasPrice', 'networkHealth', 'totalTxs'] as const).map((metric) => (
          <motion.button
            key={metric}
            onClick={() => setSelectedMetric(metric)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`glass rounded-xl p-4 transition-all ${
              selectedMetric === metric
                ? 'border-cyber-blue bg-cyber-blue/10'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div 
                className="p-2 rounded-lg" 
                style={{ 
                  backgroundColor: selectedMetric === metric ? getMetricColor(metric) + '20' : 'rgba(255,255,255,0.1)',
                  color: getMetricColor(metric)
                }}
              >
                {getMetricIcon(metric)}
              </div>
              <span className="text-white font-medium text-sm">{getMetricLabel(metric)}</span>
            </div>
            
            {stats && (
              <div className="flex items-center justify-between">
                <span className="text-white text-lg font-bold">
                  {metric === 'totalTxs' ? (stats.current / 1000).toFixed(1) + 'K' : 
                   metric === 'gasPrice' ? stats.current.toFixed(1) :
                   Math.round(stats.current).toLocaleString()}
                </span>
                <div className={`flex items-center space-x-1 text-sm ${
                  stats.trend === 'up' ? 'text-cyber-green' :
                  stats.trend === 'down' ? 'text-red-400' : 'text-white/60'
                }`}>
                  {stats.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> :
                   stats.trend === 'down' ? <ArrowDownRight className="w-4 h-4" /> :
                   <Equal className="w-4 h-4" />}
                  <span>{Math.abs(stats.change).toFixed(1)}%</span>
                </div>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Main Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">
            {getMetricLabel(selectedMetric)} Trend ({timeRange})
          </h3>
          <div className="flex items-center space-x-4">
            {stats && (
              <div className="text-sm text-white/60">
                Avg: <span className="text-white font-medium">
                  {selectedMetric === 'totalTxs' ? (stats.average / 1000).toFixed(1) + 'K' :
                   selectedMetric === 'gasPrice' ? stats.average.toFixed(1) :
                   Math.round(stats.average).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getMetricColor(selectedMetric)} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={getMetricColor(selectedMetric)} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.6)' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.6)' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }}
                labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
              />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke={getMetricColor(selectedMetric)}
                strokeWidth={2}
                fill="url(#metricGradient)"
                dot={{ 
                  fill: getMetricColor(selectedMetric), 
                  strokeWidth: 2, 
                  r: 3,
                  style: { opacity: 0 }
                }}
                activeDot={{ 
                  r: 6, 
                  fill: getMetricColor(selectedMetric),
                  stroke: '#fff',
                  strokeWidth: 2
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Statistics Summary */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-4 text-center"
          >
            <div className="text-white/60 text-sm mb-1">Current</div>
            <div className="text-white text-xl font-bold">
              {selectedMetric === 'totalTxs' ? (stats.current / 1000).toFixed(1) + 'K' :
               selectedMetric === 'gasPrice' ? stats.current.toFixed(1) :
               Math.round(stats.current).toLocaleString()}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-xl p-4 text-center"
          >
            <div className="text-white/60 text-sm mb-1">Average</div>
            <div className="text-cyber-blue text-xl font-bold">
              {selectedMetric === 'totalTxs' ? (stats.average / 1000).toFixed(1) + 'K' :
               selectedMetric === 'gasPrice' ? stats.average.toFixed(1) :
               Math.round(stats.average).toLocaleString()}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl p-4 text-center"
          >
            <div className="text-white/60 text-sm mb-1">Maximum</div>
            <div className="text-cyber-green text-xl font-bold">
              {selectedMetric === 'totalTxs' ? (stats.maximum / 1000).toFixed(1) + 'K' :
               selectedMetric === 'gasPrice' ? stats.maximum.toFixed(1) :
               Math.round(stats.maximum).toLocaleString()}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-4 text-center"
          >
            <div className="text-white/60 text-sm mb-1">Minimum</div>
            <div className="text-cyber-purple text-xl font-bold">
              {selectedMetric === 'totalTxs' ? (stats.minimum / 1000).toFixed(1) + 'K' :
               selectedMetric === 'gasPrice' ? stats.minimum.toFixed(1) :
               Math.round(stats.minimum).toLocaleString()}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-xl p-4 text-center"
          >
            <div className="text-white/60 text-sm mb-1">Change</div>
            <div className={`text-xl font-bold flex items-center justify-center space-x-1 ${
              stats.trend === 'up' ? 'text-cyber-green' :
              stats.trend === 'down' ? 'text-red-400' : 'text-white'
            }`}>
              {stats.trend === 'up' ? <ArrowUpRight className="w-5 h-5" /> :
               stats.trend === 'down' ? <ArrowDownRight className="w-5 h-5" /> :
               <Equal className="w-5 h-5" />}
              <span>{Math.abs(stats.change).toFixed(1)}%</span>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
} 