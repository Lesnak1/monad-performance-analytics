import { motion } from 'framer-motion'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import StatCard from '../components/StatCard'
import LineChart from '../components/LineChart'
import AdvancedChart from '../components/AdvancedChart'
import LiveTransactions from '../components/LiveTransactions'
import Footer from '../components/Footer'
import { 
  Activity, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Zap,
  Globe,
  Shield,
  BarChart3
} from 'lucide-react'
import { getMonadMetrics, getChartData, getNetworkStatus, getCurrentRpcIndex, MonadMetrics, ChartDataPoint } from '../lib/monadData'

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<MonadMetrics | null>(null)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [networkStatus, setNetworkStatus] = useState({ 
    connected: false, 
    blockNumber: 0,
    chainId: 10143,
    rpcUrl: 'Monad Testnet'
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log('🔄 Fetching real-time Monad data...')
        
        const [metricsData, chartPoints, status] = await Promise.all([
          getMonadMetrics(),
          getChartData(),
          getNetworkStatus()
        ])
        
        setNetworkStatus(status)
        
        if (metricsData) {
          setMetrics(metricsData)
          console.log('✅ Real metrics updated:', {
            tps: metricsData.tps,
            gasPrice: metricsData.gasPrice,
            blockNumber: metricsData.blockNumber
          })
        } else {
          console.warn('⚠️ No real metrics data available - connection issue')
        }
        
        if (chartPoints && chartPoints.length > 0) {
          setChartData(chartPoints)
          console.log(`✅ Chart data updated with ${chartPoints.length} real data points`)
        } else {
          console.warn('⚠️ No real chart data available')
        }
        
      } catch (error) {
        console.error('❌ Error fetching real data:', error)
        setNetworkStatus(prev => ({
          ...prev,
          connected: false,
          error: error instanceof Error ? error.message : 'Connection failed'
        }))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 6000) // Increased to 6 seconds to reduce load
    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen relative overflow-hidden noise-overlay">
      <Head>
        <title>MPAS - Monad Performance Analytics Suite</title>
        <meta name="description" content="Real-time performance analytics for Monad blockchain - the world's fastest EVM" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Clean animated background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-burst opacity-10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyber-gradient opacity-8 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      <Header 
        networkStatus={networkStatus} 
        currentRpcIndex={getCurrentRpcIndex()}
        metrics={metrics}
      />

      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10 space-y-12 sm:space-y-16 max-w-7xl">
        
        {/* Hero Section - Responsive */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6 sm:space-y-8"
        >
          {/* Status Indicator */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center space-x-3 glass rounded-full px-4 sm:px-6 py-2 sm:py-3"
          >
            <div className={`w-2 sm:w-3 h-2 sm:h-3 rounded-full animate-pulse ${networkStatus.connected ? 'bg-cyber-green' : 'bg-red-500'}`}></div>
            <span className="text-white/80 text-xs sm:text-sm font-medium">
              {loading ? 'Connecting...' : networkStatus.connected ? 'Live Monad Testnet' : 'Connection Failed'}
            </span>
            {networkStatus.connected && (
              <span className="text-cyber-blue text-xs">Block #{networkStatus.blockNumber}</span>
            )}
          </motion.div>
          
          {/* Main Title - Responsive */}
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-glow leading-tight">
            <span className="bg-gradient-to-r from-white via-monad-300 to-cyber-blue bg-clip-text text-transparent">
              Monad Analytics
            </span>
          </h1>
          
          {/* Subtitle - Responsive */}
          <p className="text-base sm:text-xl text-white/70 max-w-4xl mx-auto leading-relaxed px-4">
            Real-time performance insights from the world's fastest EVM blockchain.
            <br className="hidden sm:block" />
            Experience <span className="text-cyber-blue font-semibold">{loading ? '...' : Math.round(metrics?.tps || 0)} TPS</span> with 
            <span className="text-cyber-green font-semibold"> {loading ? '...' : metrics?.blockTime || 0}s</span> block times.
          </p>
        </motion.section>

        {/* Key Metrics - Responsive Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          <StatCard
            title="TPS Performance"
            value={loading ? '...' : Math.round(metrics?.tps || 0).toString()}
            trend="up"
            trendValue="+12.3%"
            icon={Zap}
            subtitle="Transactions/sec"
          />
          <StatCard
            title="Gas Price"
            value={loading ? '...' : `${(metrics?.gasPrice || 0).toFixed(1)} Gwei`}
            trend="down"
            trendValue="-5.2%"
            icon={DollarSign}
            subtitle="Average fee"
          />
          <StatCard
            title="Block Time"
            value={loading ? '...' : `${(metrics?.blockTime || 0).toFixed(1)}s`}
            trend="stable"
            trendValue="Stable"
            icon={Clock}
            subtitle="Latest block"
          />
          <StatCard
            title="Network Health"
            value={loading ? '...' : `${Math.round(metrics?.networkHealth || 0)}%`}
            trend="up"
            trendValue="+2.1%"
            icon={Activity}
            subtitle="Overall status"
          />
        </motion.section>

        {/* Charts Section - Responsive Layout */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8"
        >
          {/* TPS Chart */}
          <div className="glass rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyber-blue" />
                TPS Performance
              </h3>
              <div className="text-cyber-green text-xs sm:text-sm font-medium">
                Live Data
              </div>
            </div>
            <LineChart data={chartData} dataKey="tps" />
          </div>

          {/* Gas Price Chart */}
          <div className="glass rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-cyber-purple" />
                Gas Price Trends
              </h3>
              <div className="text-cyber-purple text-xs sm:text-sm font-medium">
                Real-time
              </div>
            </div>
            <LineChart data={chartData} dataKey="gasPrice" />
          </div>
        </motion.section>

        {/* Advanced Analytics Section - Full Width */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Section Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Advanced Analytics
            </h2>
            <p className="text-white/60 text-sm sm:text-base">
              Deep insights into Monad testnet performance and activity
            </p>
          </div>

          {/* Advanced Chart */}
          <div className="glass rounded-2xl p-4 sm:p-6">
            <AdvancedChart data={chartData} />
          </div>
        </motion.section>

        {/* Live Transactions Section - Responsive */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-cyber-green" />
              Live Transaction Feed
            </h2>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-white/60">
              <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
              <span>Real-time Monad Testnet</span>
            </div>
          </div>
          
          {/* Live Transactions Component */}
          <div className="glass rounded-2xl overflow-hidden">
            <LiveTransactions />
          </div>
        </motion.section>

        {/* Network Statistics Grid - Responsive */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {/* Network Health */}
          <div className="glass rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyber-green" />
                Network Status
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Chain ID</span>
                <span className="text-white font-medium">{networkStatus.chainId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Latest Block</span>
                <span className="text-cyber-blue font-medium">#{networkStatus.blockNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Connection</span>
                <span className={`font-medium ${networkStatus.connected ? 'text-cyber-green' : 'text-red-400'}`}>
                  {networkStatus.connected ? 'Active' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="glass rounded-2xl p-4 sm:p-6 space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyber-purple" />
              Performance
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Current TPS</span>
                <span className="text-cyber-blue font-medium">{Math.round(metrics?.tps || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Block Time</span>
                <span className="text-cyber-green font-medium">{(metrics?.blockTime || 0).toFixed(1)}s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Gas Price</span>
                <span className="text-cyber-purple font-medium">{(metrics?.gasPrice || 0).toFixed(1)} Gwei</span>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="glass rounded-2xl p-4 sm:p-6 space-y-4 sm:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyber-blue" />
              System Info
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Network</span>
                <span className="text-white font-medium">Monad Testnet</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Version</span>
                <span className="text-cyber-blue font-medium">v1.0.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Status</span>
                <span className="text-cyber-green font-medium">Operational</span>
              </div>
            </div>
          </div>
        </motion.section>

      </main>

      <Footer />
    </div>
  )
} 