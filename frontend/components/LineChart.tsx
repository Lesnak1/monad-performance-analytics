'use client'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface ChartDataPoint {
  timestamp: string
  tps: number
  gasPrice: number
  blockNumber: number
}

interface LineChartProps {
  data: ChartDataPoint[]
  dataKey: 'tps' | 'gasPrice'
  title?: string
  color?: string
}

export default function CustomLineChart({ 
  data, 
  dataKey, 
  title,
  color = '#8b5cf6' 
}: LineChartProps) {
  // Auto-generate title if not provided
  const chartTitle = title || (dataKey === 'tps' ? 'TPS Performance' : 'Gas Price Trends')
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-xl p-4 border border-white/20"
        >
          <p className="text-white/80 text-sm mb-2">{`Time: ${label}`}</p>
          <p className="text-cyber-blue font-medium">
            {`${dataKey === 'tps' ? 'TPS' : 'Gas Price'}: ${dataKey === 'gasPrice' ? `${payload[0].value.toFixed(1)} Gwei` : Math.round(payload[0].value)}`}
          </p>
          {payload[0].payload.blockNumber && (
            <p className="text-white/60 text-xs mt-1">
              Block: #{payload[0].payload.blockNumber}
            </p>
          )}
          <p className="text-white/40 text-xs">
            Live Monad Testnet data
          </p>
        </motion.div>
      )
    }
    return null
  }

  const formatValue = (value: number) => {
    if (dataKey === 'gasPrice') return `${value.toFixed(1)}`
    return Math.round(value).toString()
  }

  // Auto-select color based on dataKey
  const chartColor = color || (dataKey === 'tps' ? '#0ea5e9' : '#a855f7')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
          <div className="w-3 h-3 bg-cyber-green rounded-full animate-pulse"></div>
          <span>{chartTitle}</span>
        </h3>
        <div className="text-sm text-white/60">
          Last 60 minutes • Live
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="timestamp" 
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
              tickFormatter={(value) => value.length > 5 ? value.substring(0, 5) : value}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
              tickFormatter={formatValue}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={chartColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ 
                r: 4, 
                stroke: chartColor, 
                strokeWidth: 2, 
                fill: chartColor,
                className: "animate-pulse"
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Current value display */}
      <div className="mt-4 text-center">
        <div className="text-white/60 text-sm">Current value</div>
        <div className="text-2xl font-bold text-white">
          {data.length > 0 ? formatValue(data[data.length - 1][dataKey]) : '...'} 
          {dataKey === 'gasPrice' ? ' Gwei' : ' TPS'}
        </div>
      </div>
    </motion.div>
  )
} 