'use client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Users, 
  Zap, 
  DollarSign,
  Activity,
  Gamepad2,
  Brain,
  Shield,
  Coins,
  Network,
  ArrowUpRight,
  Sparkles
} from 'lucide-react'

// Monad testnet protokolleri (monad-developers/protocols repo'sundan)
const PROTOCOL_CATEGORIES = {
  DeFi: {
    icon: Coins,
    color: '#00d4ff',
    protocols: [
      { name: 'Bean Exchange', description: 'Gamified spot & perpetual exchange', tvl: '$2.4M', users: '12.3K', change: '+45%' },
      { name: 'Ambient Finance', description: 'Spot AMM with modular hooks', tvl: '$1.8M', users: '8.9K', change: '+32%' },
      { name: 'Apriori', description: 'MEV infrastructure & liquid staking', tvl: '$980K', users: '5.2K', change: '+78%' },
      { name: 'Caddy Finance', description: 'LSD Perpetual Options Protocol', tvl: '$650K', users: '3.4K', change: '+23%' },
      { name: 'Bima', description: 'Bitcoin-backed stablecoin platform', tvl: '$420K', users: '2.1K', change: '+67%' }
    ]
  },
  Gaming: {
    icon: Gamepad2,
    color: '#8b5cf6',
    protocols: [
      { name: 'Fantasy Top', description: 'Bet on X Influencers', tvl: '$340K', users: '15.7K', change: '+89%' },
      { name: 'Golden Goose', description: 'Yield-bearing game with blind boxes', tvl: '$280K', users: '11.2K', change: '+56%' },
      { name: 'Chaquen', description: 'Fantasy gaming & sports predictions', tvl: '$190K', users: '7.8K', change: '+34%' },
      { name: 'DRKVRS', description: 'Web3 Multiplayer Action RPG', tvl: '$150K', users: '4.9K', change: '+121%' }
    ]
  },
  AI: {
    icon: Brain,
    color: '#10b981',
    protocols: [
      { name: 'Catton AI', description: 'AI NPC gaming on Telegram', tvl: '$520K', users: '300K', change: '+156%' },
      { name: 'Fortytwo', description: 'Decentralized AI network', tvl: '$380K', users: '25.3K', change: '+67%' },
      { name: 'Codatta', description: 'AI data marketplace', tvl: '$250K', users: '8.7K', change: '+43%' },
      { name: 'Atlantis', description: 'Modular V4 DEX with DeFAI', tvl: '$180K', users: '6.1K', change: '+78%' }
    ]
  },
  Social: {
    icon: Users,
    color: '#f59e0b',
    protocols: [
      { name: 'Dusted', description: 'Token community chat rooms', tvl: '$120K', users: '45.2K', change: '+234%' },
      { name: 'Blocklive', description: 'Onchain event management', tvl: '$85K', users: '12.8K', change: '+89%' },
      { name: 'Cult Markets', description: 'Gamified NFT marketplace', tvl: '$67K', users: '9.3K', change: '+112%' }
    ]
  }
}

const ECOSYSTEM_STATS = {
  totalProtocols: 150,
  totalTVL: '$8.7M',
  activeUsers: '420K',
  transactions24h: '2.3M',
  newProtocols7d: 12
}

export default function ProtocolEcosystem() {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof PROTOCOL_CATEGORIES>('DeFi')
  const [animatedStats, setAnimatedStats] = useState({
    totalProtocols: 0,
    totalTVL: 0,
    activeUsers: 0,
    transactions24h: 0
  })

  // Animasyonlu sayı artışı
  useEffect(() => {
    const duration = 2000
    const steps = 60
    const stepDuration = duration / steps

    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / steps

      setAnimatedStats({
        totalProtocols: Math.floor(ECOSYSTEM_STATS.totalProtocols * progress),
        totalTVL: Math.floor(8.7 * progress * 10) / 10,
        activeUsers: Math.floor(420 * progress),
        transactions24h: Math.floor(2.3 * progress * 10) / 10
      })

      if (step >= steps) {
        clearInterval(timer)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [])

  const formatNumber = (num: number, suffix: string = '') => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K${suffix}`
    }
    return `${num}${suffix}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white text-glow">Protocol Ecosystem</h2>
          <p className="text-white/60 mt-1">Discover the thriving Monad protocol landscape</p>
        </div>
        
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
        >
          <Network className="w-6 h-6 text-white" />
        </motion.div>
      </div>

      {/* Ecosystem Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass rounded-xl p-4 text-center"
        >
          <div className="text-2xl font-bold text-white mb-1">
            {animatedStats.totalProtocols}
          </div>
          <div className="text-sm text-white/60">Total Protocols</div>
          <div className="text-xs text-green-400 mt-1">+{ECOSYSTEM_STATS.newProtocols7d} this week</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass rounded-xl p-4 text-center"
        >
          <div className="text-2xl font-bold text-white mb-1">
            ${animatedStats.totalTVL}M
          </div>
          <div className="text-sm text-white/60">Total TVL</div>
          <div className="text-xs text-green-400 mt-1">+23% from last week</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass rounded-xl p-4 text-center"
        >
          <div className="text-2xl font-bold text-white mb-1">
            {formatNumber(animatedStats.activeUsers)}
          </div>
          <div className="text-sm text-white/60">Active Users</div>
          <div className="text-xs text-green-400 mt-1">+45% growth</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass rounded-xl p-4 text-center"
        >
          <div className="text-2xl font-bold text-white mb-1">
            {animatedStats.transactions24h}M
          </div>
          <div className="text-sm text-white/60">24h Transactions</div>
          <div className="text-xs text-green-400 mt-1">+67% increase</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass rounded-xl p-4 text-center relative overflow-hidden"
        >
          <div className="text-2xl font-bold text-white mb-1">🔥</div>
          <div className="text-sm text-white/60">Ecosystem Health</div>
          <div className="text-xs text-green-400 mt-1">Excellent</div>
          
          {/* Sparkle effect */}
          <motion.div
            animate={{ 
              x: [0, 100, 0],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            className="absolute top-2 left-2"
          >
            <Sparkles className="w-3 h-3 text-yellow-400" />
          </motion.div>
        </motion.div>
      </div>

      {/* Category Selector */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {Object.entries(PROTOCOL_CATEGORIES).map(([key, category]) => {
          const IconComponent = category.icon
          return (
            <motion.button
              key={key}
              onClick={() => setSelectedCategory(key as keyof typeof PROTOCOL_CATEGORIES)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === key
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'glass-subtle text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <IconComponent 
                className="w-4 h-4" 
                style={{ color: selectedCategory === key ? category.color : undefined }}
              />
              <span className="font-medium">{key}</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                {category.protocols.length}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Protocol List */}
      <motion.div
        key={selectedCategory}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {PROTOCOL_CATEGORIES[selectedCategory].protocols.map((protocol, index) => (
          <motion.div
            key={protocol.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="glass rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: PROTOCOL_CATEGORIES[selectedCategory].color + '20' }}
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PROTOCOL_CATEGORIES[selectedCategory].color }}
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">{protocol.name}</h4>
                  <span 
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ 
                      backgroundColor: PROTOCOL_CATEGORIES[selectedCategory].color + '20',
                      color: PROTOCOL_CATEGORIES[selectedCategory].color
                    }}
                  >
                    {selectedCategory}
                  </span>
                </div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ArrowUpRight className="w-4 h-4 text-white/60" />
              </motion.div>
            </div>

            <p className="text-white/70 text-sm mb-4 line-clamp-2">
              {protocol.description}
            </p>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-white font-semibold text-sm">{protocol.tvl}</div>
                <div className="text-white/50 text-xs">TVL</div>
              </div>
              <div>
                <div className="text-white font-semibold text-sm">{protocol.users}</div>
                <div className="text-white/50 text-xs">Users</div>
              </div>
              <div>
                <div 
                  className="font-semibold text-sm"
                  style={{ color: PROTOCOL_CATEGORIES[selectedCategory].color }}
                >
                  {protocol.change}
                </div>
                <div className="text-white/50 text-xs">7d</div>
              </div>
            </div>

            {/* Hover glow effect */}
            <div 
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity blur-xl"
              style={{ backgroundColor: PROTOCOL_CATEGORIES[selectedCategory].color }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Community Insights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-xl p-6 border border-purple-500/20"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Community Insights</h3>
          <div className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
            Live
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">🏆</div>
            <div className="text-white font-semibold">Most Popular</div>
            <div className="text-purple-300">Bean Exchange</div>
            <div className="text-white/60 text-sm">Leading trading volume</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl mb-2">🚀</div>
            <div className="text-white font-semibold">Fastest Growing</div>
            <div className="text-purple-300">Catton AI</div>
            <div className="text-white/60 text-sm">+156% user growth</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl mb-2">💎</div>
            <div className="text-white font-semibold">Hidden Gem</div>
            <div className="text-purple-300">DRKVRS</div>
            <div className="text-white/60 text-sm">Emerging gamefi leader</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
} 