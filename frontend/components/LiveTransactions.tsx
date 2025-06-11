'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  Activity, 
  ArrowRight, 
  ExternalLink, 
  Clock,
  Zap,
  DollarSign,
  Hash,
  Eye,
  TrendingUp,
  RefreshCw
} from 'lucide-react'

interface Transaction {
  id: string
  hash: string
  from: string
  to: string
  value: string
  gasUsed: number
  gasPrice: string
  timestamp: number
  blockNumber: number
  type: 'transfer' | 'contract' | 'mint' | 'swap'
  status: 'pending' | 'confirmed' | 'failed'
}

interface LiveTransactionsProps {
  networkConnected: boolean
}

export default function LiveTransactions({ networkConnected }: LiveTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLive, setIsLive] = useState(true)

  // Simulate live transactions
  useEffect(() => {
    if (!networkConnected || !isLive) return

    const generateTransaction = (): Transaction => {
      const types = ['transfer', 'contract', 'mint', 'swap'] as const
      const type = types[Math.floor(Math.random() * types.length)]
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        hash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
        from: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
        to: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
        value: (Math.random() * 10).toFixed(4),
        gasUsed: Math.floor(Math.random() * 100000) + 21000,
        gasPrice: (Math.random() * 0.01 + 0.001).toFixed(6),
        timestamp: Date.now(),
        blockNumber: Math.floor(Math.random() * 1000) + 1240000,
        type,
        status: Math.random() > 0.95 ? 'failed' : 'confirmed'
      }
    }

    const interval = setInterval(() => {
      const newTx = generateTransaction()
      setTransactions(prev => [newTx, ...prev.slice(0, 19)]) // Keep last 20 transactions
    }, Math.random() * 3000 + 1000) // Random interval 1-4 seconds

    return () => clearInterval(interval)
  }, [networkConnected, isLive])

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'transfer': return <ArrowRight className="w-4 h-4 text-cyber-blue" />
      case 'contract': return <Activity className="w-4 h-4 text-cyber-purple" />
      case 'mint': return <Zap className="w-4 h-4 text-cyber-green" />
      case 'swap': return <TrendingUp className="w-4 h-4 text-cyber-pink" />
    }
  }

  const getTypeColor = (type: Transaction['type']) => {
    switch (type) {
      case 'transfer': return 'bg-cyber-blue/20 text-cyber-blue'
      case 'contract': return 'bg-cyber-purple/20 text-cyber-purple'
      case 'mint': return 'bg-cyber-green/20 text-cyber-green'
      case 'swap': return 'bg-cyber-pink/20 text-cyber-pink'
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ago`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-cyber-gradient rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white text-glow">Live Transactions</h3>
              <p className="text-white/60 text-sm">Real-time transaction feed from Monad testnet</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`p-2 rounded-lg transition-all ${
                isLive ? 'bg-cyber-green/20 text-cyber-green' : 'bg-white/10 text-white/60'
              }`}
              title={isLive ? 'Pause live feed' : 'Resume live feed'}
            >
              {isLive ? (
                <div className="w-3 h-3 bg-cyber-green rounded-full animate-pulse"></div>
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </button>
            
            <div className="text-right">
              <div className="text-white font-medium">{transactions.length}</div>
              <div className="text-white/60 text-xs">Recent TXs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {transactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.02 }}
              className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center justify-between">
                {/* Left side - Transaction info */}
                <div className="flex items-center space-x-3">
                  {getTypeIcon(tx.type)}
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${getTypeColor(tx.type)}`}>
                        {tx.type.toUpperCase()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        tx.status === 'confirmed' ? 'bg-cyber-green/20 text-cyber-green' :
                        tx.status === 'failed' ? 'bg-red-500/20 text-red-500' :
                        'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                    
                    <div className="text-white/60 text-sm font-mono">
                      {tx.hash}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-white/50">
                      <span>Block #{tx.blockNumber}</span>
                      <span>{formatTimeAgo(tx.timestamp)}</span>
                    </div>
                  </div>
                </div>

                {/* Right side - Value and actions */}
                <div className="text-right space-y-1">
                  <div className="text-white font-medium">
                    {tx.value} MON
                  </div>
                  <div className="text-white/60 text-xs">
                    Gas: {tx.gasUsed.toLocaleString()}
                  </div>
                  <div className="text-cyber-blue text-xs">
                    {tx.gasPrice} MON
                  </div>
                  
                  <button 
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="View on Explorer"
                  >
                    <ExternalLink className="w-3 h-3 text-white/60" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {transactions.length === 0 && (
          <div className="p-12 text-center">
            <Activity className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-white/60 font-medium mb-2">
              {networkConnected ? 'Waiting for transactions...' : 'Network not connected'}
            </h3>
            <p className="text-white/40 text-sm">
              {networkConnected 
                ? 'Live transaction feed will appear here when network activity is detected.' 
                : 'Connect to Monad testnet to see live transactions.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 bg-white/2 border-t border-white/10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-cyber-green font-bold">
              {transactions.filter(tx => tx.status === 'confirmed').length}
            </div>
            <div className="text-white/60 text-xs">Confirmed</div>
          </div>
          <div>
            <div className="text-yellow-500 font-bold">
              {transactions.filter(tx => tx.status === 'pending').length}
            </div>
            <div className="text-white/60 text-xs">Pending</div>
          </div>
          <div>
            <div className="text-red-500 font-bold">
              {transactions.filter(tx => tx.status === 'failed').length}
            </div>
            <div className="text-white/60 text-xs">Failed</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 