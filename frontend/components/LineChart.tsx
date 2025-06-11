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
  metric: 'tps' | 'gasPrice'
  title: string
  color?: string
}

export default function CustomLineChart({ 
  data, 
  metric, 
  title, 
  color = '#8b5cf6' 
}: LineChartProps) {
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
            {`${metric === 'tps' ? 'TPS' : 'Gas Price'}: ${metric === 'gasPrice' ? `${payload[0].value.toFixed(1)} Gwei` : Math.round(payload[0].value)}`}
          </p>
          {payload[0].payload.blockNumber && (
            <p className="text-white/60 text-xs mt-1">
              Block: #{payload[0].payload.blockNumber}
            </p>
          )}
        </motion.div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="glass rounded-2xl p-6 relative overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-monad-500/5 via-transparent to-cyber-purple/5"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white text-glow">{title}</h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-cyber-blue rounded-full animate-pulse"></div>
            <span className="text-white/60 text-sm">Live</span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255,255,255,0.1)" 
                vertical={false}
              />
              <XAxis 
                dataKey="timestamp" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.6)' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.6)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={metric}
                stroke={color}
                strokeWidth={2}
                fill="url(#colorGradient)"
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ 
                  r: 6, 
                  fill: color,
                  stroke: '#fff',
                  strokeWidth: 2,
                  filter: 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.8))'
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

                 {/* Bottom stats */}
         <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
           <div className="text-center">
             <p className="text-white/50 text-xs">Peak</p>
             <p className="text-cyber-green text-sm font-medium">
               {data.length > 0 ? Math.max(...data.map(d => d[metric] || 0)).toFixed(2) : '0'}
             </p>
           </div>
           <div className="text-center">
             <p className="text-white/50 text-xs">Average</p>
             <p className="text-cyber-blue text-sm font-medium">
               {data.length > 0 ? (data.reduce((sum, d) => sum + (d[metric] || 0), 0) / data.length).toFixed(2) : '0'}
             </p>
           </div>
           <div className="text-center">
             <p className="text-white/50 text-xs">Current</p>
             <p className="text-cyber-purple text-sm font-medium">
               {data.length > 0 ? (data[data.length - 1]?.[metric] || 0).toFixed(2) : '0'}
             </p>
           </div>
         </div>
      </div>
    </motion.div>
  )
} 