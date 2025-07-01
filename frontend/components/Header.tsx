'use client'
import { motion } from 'framer-motion'
import { BarChart3, Zap, Activity } from 'lucide-react'
import NetworkIndicator from './NetworkIndicator'
// import ThemeSwitcher from './ThemeSwitcher' // Temporarily disabled for SSR
import { QuickExportButtons } from './ExportButton'

interface HeaderProps {
  networkStatus?: {
    connected: boolean
    chainId: number
    blockNumber: number
    rpcUrl: string
  }
  currentRpcIndex?: number
  metrics?: any
}

export default function Header({ networkStatus, currentRpcIndex, metrics }: HeaderProps = {}) {
  // Prepare export data
  const exportData = metrics ? [{
    timestamp: new Date().toISOString(),
    tps: metrics.tps || 0,
    gasPrice: metrics.gasPrice || 0,
    blockTime: metrics.blockTime || 0,
    networkHealth: metrics.networkHealth || 0,
    blockNumber: metrics.blockNumber || 0
  }] : []

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="sticky top-0 z-50 glass-strong border-b border-white/10"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-cyber-gradient rounded-xl flex items-center justify-center animate-pulse-glow">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyber-blue rounded-full animate-ping"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-glow">MPAS</h1>
              <p className="text-xs text-monad-300">Performance Analytics</p>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <motion.a
              href="/"
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
              whileHover={{ y: -2 }}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </motion.a>
            <motion.a
              href="/benchmarks"
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
              whileHover={{ y: -2 }}
            >
              <Activity className="w-4 h-4" />
              <span>Benchmarks</span>
            </motion.a>
          </nav>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            <QuickExportButtons 
              data={exportData}
              filename="monad_realtime_metrics"
              title="Monad Real-time Metrics"
            />
            {/* {/* <ThemeSwitcher /> Temporarily disabled for SSR */} Temporarily disabled for SSR */}
            {networkStatus && (
              <NetworkIndicator 
                networkStatus={networkStatus} 
                currentRpcIndex={currentRpcIndex}
              />
            )}
            <motion.button
              className="hidden sm:flex items-center space-x-2 bg-cyber-gradient text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-lg hover:shadow-monad-500/25 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Live on Monad</span>
              <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  )
} 
