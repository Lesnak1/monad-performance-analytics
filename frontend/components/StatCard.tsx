'use client'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  delay?: number
}

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  delay = 0 
}: StatCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-cyber-green'
      case 'down': return 'text-cyber-pink'
      default: return 'text-cyber-blue'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ 
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
      className="glass rounded-2xl p-6 relative overflow-hidden group cursor-pointer"
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-monad-500/10 via-transparent to-cyber-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 shimmer animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-monad-gradient rounded-xl flex items-center justify-center group-hover:animate-pulse-glow transition-all">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white/80 text-sm font-medium">{title}</h3>
              {subtitle && (
                <p className="text-white/50 text-xs">{subtitle}</p>
              )}
            </div>
          </div>
          
          {trend && trendValue && (
            <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
              <span className="text-xs font-medium">{trendValue}</span>
              <div className={`w-2 h-2 rounded-full ${
                trend === 'up' ? 'bg-cyber-green animate-pulse' :
                trend === 'down' ? 'bg-cyber-pink animate-pulse' :
                'bg-cyber-blue animate-pulse'
              }`}></div>
            </div>
          )}
        </div>

        {/* Main Value */}
        <div className="mb-2">
          <motion.span 
            className="text-3xl font-bold text-white text-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: delay + 0.2 }}
          >
            {value}
          </motion.span>
        </div>

        {/* Bottom gradient line */}
        <div className="w-full h-1 bg-gradient-to-r from-monad-600 via-cyber-purple to-cyber-blue rounded-full opacity-60"></div>
      </div>
    </motion.div>
  )
} 