'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  Play, 
  Pause, 
  ExternalLink, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  RefreshCw,
  TrendingUp,
  Clock,
  Users,
  Zap
} from 'lucide-react'
import { generateLiveTransaction, getExplorerUrl, type Transaction } from '../lib/monadData'

interface LiveTransactionsProps {
  isPlaying?: boolean
  onToggle?: () => void
}

export default function LiveTransactions({ isPlaying = true, onToggle }: LiveTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isRunning, setIsRunning] = useState(isPlaying)
  const [filter, setFilter] = useState<'all' | 'transfer' | 'contract' | 'swap' | 'mint'>('all')
  const [stats, setStats] = useState({
    totalTxs: 1692109232,
    txsLast24h: 14256789,
    avgGasPrice: 0.25,
    successRate: 97.8,
    topGasUser: '0x2f1e...8a4d'
  })

  // Enhanced transaction generation
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      const newTx = generateLiveTransaction()
      
      setTransactions(prev => {
        const updated = [newTx, ...prev]
        return updated.slice(0, 20) // Keep last 20 transactions
      })

      // Update stats occasionally
      if (Math.random() < 0.1) {
        setStats(prev => ({
          ...prev,
          totalTxs: prev.totalTxs + Math.floor(Math.random() * 10) + 1,
          txsLast24h: prev.txsLast24h + Math.floor(Math.random() * 5) + 1,
          avgGasPrice: 0.1 + Math.random() * 0.3,
          successRate: 96 + Math.random() * 4
        }))
      }
    }, 1500 + Math.random() * 1000) // 1.5-2.5 second intervals

    return () => clearInterval(interval)
  }, [isRunning])

  const handleToggle = () => {
    setIsRunning(!isRunning)
    onToggle?.()
  }

  const filteredTransactions = transactions.filter(tx => 
    filter === 'all' || tx.type === filter
  )

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transfer': return <ArrowUpRight className="w-3 h-3" />
      case 'contract': return <Zap className="w-3 h-3" />
      case 'swap': return <RefreshCw className="w-3 h-3" />
      case 'mint': return <TrendingUp className="w-3 h-3" />
      default: return <ArrowUpRight className="w-3 h-3" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'transfer': return 'text-cyber-blue'
      case 'contract': return 'text-cyber-purple'
      case 'swap': return 'text-cyber-green'
      case 'mint': return 'text-cyber-yellow'
      default: return 'text-white'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-cyber-green'
      case 'pending': return 'bg-cyber-yellow'
      case 'failed': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 space-y-6"
    >
      {/* Header with Stats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white text-glow">Live Transaction Feed</h3>
          
          <div className="flex items-center space-x-3">
            {/* Filter */}
            <div className="flex items-center space-x-2 glass-subtle rounded-lg p-2">
              <Filter className="w-4 h-4 text-white/60" />
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="bg-transparent text-white text-sm border-none outline-none"
              >
                <option value="all">All</option>
                <option value="transfer">Transfers</option>
                <option value="contract">Contracts</option>
                <option value="swap">Swaps</option>
                <option value="mint">Mints</option>
              </select>
            </div>

            {/* Play/Pause */}
            <motion.button
              onClick={handleToggle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-lg ${
                isRunning 
                  ? 'bg-cyber-green text-white' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="glass-subtle rounded-lg p-3 text-center">
            <div className="text-white/60 text-xs">Total TXs</div>
            <div className="text-cyber-blue font-bold">{stats.totalTxs.toLocaleString()}</div>
          </div>
          <div className="glass-subtle rounded-lg p-3 text-center">
            <div className="text-white/60 text-xs">24h Volume</div>
            <div className="text-cyber-green font-bold">{(stats.txsLast24h / 1000000).toFixed(1)}M</div>
          </div>
          <div className="glass-subtle rounded-lg p-3 text-center">
            <div className="text-white/60 text-xs">Avg Gas</div>
            <div className="text-cyber-purple font-bold">{stats.avgGasPrice.toFixed(2)} Gwei</div>
          </div>
          <div className="glass-subtle rounded-lg p-3 text-center">
            <div className="text-white/60 text-xs">Success Rate</div>
            <div className="text-cyber-yellow font-bold">{stats.successRate.toFixed(1)}%</div>
          </div>
          <div className="glass-subtle rounded-lg p-3 text-center">
            <div className="text-white/60 text-xs">Live Count</div>
            <div className="text-white font-bold">{filteredTransactions.length}</div>
          </div>
        </div>
      </div>

      {/* Transaction Feed */}
      <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredTransactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="glass-subtle rounded-lg p-4 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center justify-between">
                {/* Left: TX Info */}
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-white/10 ${getTypeColor(tx.type)}`}>
                    {getTypeIcon(tx.type)}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white/80 text-sm font-medium capitalize">
                        {tx.type}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(tx.status)}`}></div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-white/60">
                      <span>{tx.from.substring(0, 8)}...{tx.from.substring(tx.from.length - 4)}</span>
                      <ArrowUpRight className="w-3 h-3" />
                      <span>{tx.to.substring(0, 8)}...{tx.to.substring(tx.to.length - 4)}</span>
                    </div>
                  </div>
                </div>

                {/* Center: Amount */}
                <div className="text-right">
                  <div className="text-white font-medium">{tx.amount}</div>
                  <div className="text-white/50 text-xs">{tx.gasUsed.toLocaleString()} gas</div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-2">
                  <div className="text-right text-xs">
                    <div className="text-white/60">#{tx.blockNumber}</div>
                    <div className="text-white/40">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <motion.a
                    href={getExplorerUrl('tx', tx.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    className="p-1 rounded text-white/40 hover:text-cyber-blue opacity-0 group-hover:opacity-100 transition-all"
                    title={`View on Explorer: ${tx.id}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </motion.a>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center space-x-2 text-sm text-white/60">
          <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-cyber-green animate-pulse' : 'bg-white/30'}`}></div>
          <span>{isRunning ? 'Live streaming' : 'Paused'}</span>
          <span>•</span>
          <span>Updated every 2s</span>
        </div>
        
        <motion.button
          onClick={() => setTransactions([])}
          whileHover={{ scale: 1.05 }}
          className="text-white/60 hover:text-white text-sm flex items-center space-x-1"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Clear</span>
        </motion.button>
      </div>
    </motion.div>
  )
} 