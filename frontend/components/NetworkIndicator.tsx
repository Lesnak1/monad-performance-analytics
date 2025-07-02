'use client'
import { motion } from 'framer-motion'
import { Wifi, WifiOff, Globe, AlertTriangle } from 'lucide-react'
import { formatBlockNumber } from '../lib/utils'

interface NetworkIndicatorProps {
  networkStatus: {
    connected: boolean
    chainId: number
    blockNumber: number
    rpcUrl: string
  }
  currentRpcIndex?: number
}

export default function NetworkIndicator({ networkStatus, currentRpcIndex = 0 }: NetworkIndicatorProps) {
  const getNetworkInfo = () => {
    switch (networkStatus.chainId) {
      case 10143:
        return {
          name: 'Monad Testnet',
          color: 'bg-cyber-blue',
          textColor: 'text-cyber-blue',
          type: 'TESTNET'
        }
      case 41454:
        return {
          name: 'Monad Devnet (Old)',
          color: 'bg-cyber-purple',
          textColor: 'text-cyber-purple',
          type: 'DEVNET'
        }
      case 1:
        return {
          name: 'Monad Mainnet',
          color: 'bg-cyber-green',
          textColor: 'text-cyber-green',
          type: 'MAINNET'
        }
      case 31337:
        return {
          name: 'Local Testnet',
          color: 'bg-cyber-purple',
          textColor: 'text-cyber-purple',
          type: 'LOCAL'
        }
      default:
        return {
          name: 'Unknown Network',
          color: 'bg-red-500',
          textColor: 'text-red-500',
          type: 'UNKNOWN'
        }
    }
  }

  const getRpcInfo = () => {
    const rpcNames = [
      'Monad Official Testnet RPC',
      'ThirdWeb RPC',
      'Backup RPC'
    ]
    return rpcNames[currentRpcIndex] || 'Unknown RPC'
  }

  const networkInfo = getNetworkInfo()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-xl p-3 flex items-center space-x-3 relative group"
    >
      {/* Network Status Indicator */}
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          networkStatus.connected ? networkInfo.color : 'bg-red-500'
        } ${networkStatus.connected ? 'animate-pulse' : ''}`}></div>
        
        {networkStatus.connected ? (
          <Wifi className="w-4 h-4 text-white/70" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
      </div>

      {/* Network Info */}
      <div className="text-right">
        <div className="flex items-center gap-2">
          <div className={`
            px-2 py-1 rounded text-xs font-medium
            ${networkStatus.connected ? 'bg-cyber-green/20 text-cyber-green' : 'bg-red-500/20 text-red-400'}
          `}>
            {networkStatus.connected ? 'CONNECTED' : 'DISCONNECTED'}
          </div>
          
          <div className={`
            px-2 py-1 rounded text-xs font-medium
            ${networkInfo.type === 'TESTNET' ? 'bg-cyber-blue/20 text-cyber-blue' : 
              networkInfo.type === 'MAINNET' ? 'bg-cyber-green/20 text-cyber-green' : 
              'bg-cyber-purple/20 text-cyber-purple'}
          `}>
            {networkInfo.type}
          </div>
        </div>
        <div className="text-white/60 text-xs">
          Block #{formatBlockNumber(networkStatus.blockNumber)}
        </div>
      </div>

      {/* Detailed Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileHover={{ opacity: 1, y: 0 }}
        className="absolute top-full right-0 mt-2 glass-strong rounded-lg p-4 min-w-64 z-50 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Network:</span>
            <span className={`font-medium ${networkInfo.textColor}`}>
              {networkInfo.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Chain ID:</span>
            <span className="text-white font-mono">{networkStatus.chainId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">RPC Provider:</span>
            <span className="text-cyber-blue">{getRpcInfo()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Status:</span>
            <span className={`font-medium ${
              networkStatus.connected ? 'text-cyber-green' : 'text-red-500'
            }`}>
              {networkStatus.connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Latest Block:</span>
            <span className="text-white font-mono">#{formatBlockNumber(networkStatus.blockNumber)}</span>
          </div>
          
          {/* RPC URL (shortened) */}
          <div className="pt-2 border-t border-white/10">
            <span className="text-white/60 text-xs">RPC Endpoint:</span>
            <div className="text-white/80 text-xs font-mono break-all">
              {networkStatus.rpcUrl ? 
                `${networkStatus.rpcUrl.replace('https://', '').substring(0, 30)}...` :
                'Not connected'
              }
            </div>
          </div>

          {/* Explorer Links */}
          <div className="pt-2 border-t border-white/10">
            <span className="text-white/60 text-xs">Block Explorers:</span>
            <div className="text-xs space-y-1 mt-1">
              <div>
                <a 
                  href="https://monad-testnet.socialscan.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyber-blue hover:text-cyber-blue/80"
                >
                  📊 SocialScan (Live Data)
                </a>
              </div>
              <div>
                <a 
                  href="https://testnet.monadexplorer.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyber-purple hover:text-cyber-purple/80"
                >
                  🔍 MonadExplorer
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
} 