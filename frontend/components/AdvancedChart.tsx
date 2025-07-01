'use client'
import { motion } from 'framer-motion'
import { useState, useMemo, useCallback } from 'react'
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
  Legend,
  ReferenceLine,
  Brush
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity,
  Zap,
  DollarSign,
  Clock,
  Wifi
} from 'lucide-react'

interface ChartDataPoint {
  timestamp: string
  tps: number
  gasPrice: number
  blockTime: number
  networkHealth: number
  blockNumber: number
  activeNodes?: number
  memPoolSize?: number
  avgLatency?: number
}

interface AdvancedChartProps {
  data: ChartDataPoint[]
  title?: string
  type?: 'line' | 'area' | 'bar'
  metrics?: string[]
  showBrush?: boolean
  showLegend?: boolean
  height?: number
  timeRange?: '1h' | '6h' | '24h' | '7d'
  onTimeRangeChange?: (range: string) => void
}

const metricConfig = {
  tps: {
    color: '#00d4ff',
    icon: Zap,
    label: 'TPS',
    unit: '',
    yAxisId: 'left'
  },
  gasPrice: {
    color: '#8b5cf6', 
    icon: DollarSign,
    label: 'Gas Price',
    unit: 'MON',
    yAxisId: 'right'
  },
  blockTime: {
    color: '#10b981',
    icon: Clock,
    label: 'Block Time',
    unit: 's',
    yAxisId: 'left'
  },
  networkHealth: {
    color: '#f59e0b',
    icon: Wifi,
    label: 'Network Health',
    unit: '%',
    yAxisId: 'left'
  },
  activeNodes: {
    color: '#ef4444',
    icon: Activity,
    label: 'Active Nodes',
    unit: '',
    yAxisId: 'right'
  },
  memPoolSize: {
    color: '#ec4899',
    icon: BarChart3,
    label: 'MemPool Size',
    unit: '',
    yAxisId: 'right'
  },
  avgLatency: {
    color: '#6366f1',
    icon: TrendingUp,
    label: 'Avg Latency',
    unit: 'ms',
    yAxisId: 'left'
  }
}

export default function AdvancedChart({
  data,
  title = "Advanced Analytics",
  type = 'line',
  metrics = ['tps'],
  showBrush = false,
  showLegend = true,
  height = 300,
  timeRange = '24h',
  onTimeRangeChange
}: AdvancedChartProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(metrics)
  const [chartType, setChartType] = useState(type)

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data.length || !selectedMetrics.length) return {}
    
    return selectedMetrics.reduce((acc, metric) => {
      const values = data.map(d => d[metric as keyof ChartDataPoint] as number).filter(v => v !== undefined)
      const current = values[values.length - 1] || 0
      const previous = values[values.length - 2] || current
      const change = current - previous
      const changePercent = previous ? (change / previous) * 100 : 0
      
      acc[metric] = {
        current,
        change,
        changePercent,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((sum, v) => sum + v, 0) / values.length
      }
      return acc
    }, {} as Record<string, any>)
  }, [data, selectedMetrics])

  // Generate cleaner historical data
  const generateCleanData = useCallback((metric: string, timeRange: string) => {
    const now = Date.now()
    let interval = 60000 // 1 minute
    let points = 24

    switch (timeRange) {
      case '1h':
        interval = 60000 // 1 min
        points = 60
        break
      case '6h':
        interval = 360000 // 6 min
        points = 60
        break
      case '24h':
        interval = 1440000 // 24 min
        points = 60
        break
      case '7d':
        interval = 10080000 // 168 min (7 days / 60 points)
        points = 60
        break
    }

    return Array.from({ length: points }, (_, i) => {
      const timestamp = now - (points - 1 - i) * interval
      let value = 0

      switch (metric) {
        case 'tps':
          value = 150 + Math.sin(i * 0.1) * 25 + Math.random() * 25 // 125-200 TPS realistic range
          break
        case 'gasPrice':
          value = 52 + Math.sin(i * 0.05) * 1 + Math.random() * 1 // 51-54 Gwei real range
          break
        case 'blockTime':
          value = 0.6 + Math.random() * 0.1 // 0.6-0.7 range
          break
        case 'networkHealth':
          value = 95 + Math.random() * 5 // 95-100 range
          break
        default:
          value = Math.random() * 100
      }

      return {
        timestamp,
        value: Math.round(value * 100) / 100
      }
    })
  }, [])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    // Format timestamp properly
    const formatTimestamp = (timestamp: string | number) => {
      try {
        const date = new Date(timestamp)
        if (isNaN(date.getTime())) {
          return 'Invalid Date'
        }
        return date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      } catch (error) {
        return 'Invalid Date'
      }
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-lg p-4 border border-white/20 shadow-xl"
      >
        <p className="text-white/60 text-sm mb-2">
          {formatTimestamp(label)}
        </p>
        {payload.map((entry: any, index: number) => {
          const config = metricConfig[entry.dataKey as keyof typeof metricConfig]
          const Icon = config?.icon || Activity
          
          return (
            <div key={index} className="flex items-center space-x-2 mb-1">
              <Icon className="w-4 h-4" style={{ color: entry.color }} />
              <span className="text-white text-sm font-medium">
                {config?.label || entry.dataKey}: 
              </span>
              <span className="text-white font-bold">
                {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
                {config?.unit}
              </span>
            </div>
          )
        })}
      </motion.div>
    )
  }

  const renderChart = () => {
    const chartProps = {
      data,
      height,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    }

    const elements = selectedMetrics.map((metric) => {
      const config = metricConfig[metric as keyof typeof metricConfig]
      if (!config) return null

      if (chartType === 'area') {
        return (
          <Area
            key={metric}
            type="monotone"
            dataKey={metric}
            stroke={config.color}
            fill={config.color}
            fillOpacity={0.3}
            strokeWidth={2}
            yAxisId={config.yAxisId}
          />
        )
      } else if (chartType === 'bar') {
        return (
          <Bar
            key={metric}
            dataKey={metric}
            fill={config.color}
            fillOpacity={0.8}
            yAxisId={config.yAxisId}
          />
        )
      } else {
        return (
          <Line
            key={metric}
            type="monotone"
            dataKey={metric}
            stroke={config.color}
            strokeWidth={2}
            dot={false}
            yAxisId={config.yAxisId}
          />
        )
      }
    })

    const ChartComponent = chartType === 'area' ? AreaChart : 
                          chartType === 'bar' ? BarChart : LineChart

    return (
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent {...chartProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="timestamp" 
            stroke="rgba(255,255,255,0.5)"
            fontSize={12}
          />
          <YAxis 
            yAxisId="left"
            stroke="rgba(255,255,255,0.5)"
            fontSize={12}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="rgba(255,255,255,0.5)"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          {elements}
          {showBrush && (
            <Brush 
              dataKey="timestamp" 
              height={30}
              stroke="rgba(255,255,255,0.3)"
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    )
  }

  return (
    <div className="space-y-4">
      {/* Chart Header with Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">{title || 'Advanced Chart'}</h3>
        
        <div className="flex items-center space-x-4">
          {/* Time Range Selector */}
          {onTimeRangeChange && (
            <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1">
              {['1h', '6h', '24h', '7d'].map((range) => (
                <button
                  key={range}
                  onClick={() => onTimeRangeChange(range)}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    timeRange === range 
                      ? 'bg-cyber-blue text-white' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          )}

          {/* Chart Type Selector */}
          <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1">
            {[
              { type: 'line', icon: TrendingUp },
              { type: 'area', icon: Activity },
              { type: 'bar', icon: BarChart3 }
            ].map(({ type: t, icon: Icon }) => (
              <button
                key={t}
                onClick={() => setChartType(t as any)}
                className={`p-2 rounded transition-colors ${
                  chartType === t 
                    ? 'bg-cyber-blue text-white' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {selectedMetrics.map((metric) => {
          const config = metricConfig[metric as keyof typeof metricConfig]
          const stat = stats[metric]
          if (!config || !stat) return null

          const Icon = config.icon
          const isPositive = stat.change >= 0

          return (
            <motion.div
              key={metric}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-strong rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-4 h-4" style={{ color: config.color }} />
                <span className={`text-xs ${isPositive ? 'text-cyber-green' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{stat.changePercent.toFixed(1)}%
                </span>
              </div>
              <div className="text-white font-semibold">
                {(stat.current || 0).toLocaleString()} {config.unit}
              </div>
              <div className="text-white/60 text-xs">
                {config.label}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Chart */}
      <div className="bg-white/2 rounded-lg p-4">
        {renderChart()}
      </div>

      {/* Metric Selector */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(metricConfig).map(([metric, config]) => {
          const isSelected = selectedMetrics.includes(metric)
          const Icon = config.icon
          
          return (
            <button
              key={metric}
              onClick={() => {
                if (isSelected) {
                  setSelectedMetrics(prev => prev.filter(m => m !== metric))
                } else {
                  setSelectedMetrics(prev => [...prev, metric])
                }
              }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                isSelected
                  ? 'bg-white/20 text-white border-2'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
              style={{ borderColor: isSelected ? config.color : 'transparent' }}
            >
              <Icon className="w-4 h-4" style={{ color: config.color }} />
              <span>{config.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
} 