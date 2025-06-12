'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  Zap, 
  Heart, 
  Star, 
  Sparkles,
  Volume2,
  VolumeX,
  Trophy,
  Fish,
  Cat,
  Dog
} from 'lucide-react'

// Monanimal karakterleri ve özellikleri
const MONANIMALS = {
  Salmonad: {
    name: 'Salmonad 🐟', 
    personality: 'wise', 
    color: '#ff6b6b',
    catchphrase: 'Swimming upstream to the moon!',
    specialPower: 'TPS Boost',
    mood: 'confident',
    icon: Fish,
    soundUrl: '/sounds/splash.mp3'
  },
  Molandak: {
    name: 'Molandak 🦆', 
    personality: 'curious', 
    color: '#4ecdc4',
    catchphrase: 'Quack! Network health is perfect!',
    specialPower: 'Gas Optimizer',
    mood: 'excited',
    icon: Dog,
    soundUrl: '/sounds/quack.mp3'
  },
  Chog: {
    name: 'Chog 🐷', 
    personality: 'jolly', 
    color: '#ffe66d',
    catchphrase: 'Oink oink! Blocks are flying!',
    specialPower: 'Block Accelerator',
    mood: 'happy',
    icon: Cat,
    soundUrl: '/sounds/oink.mp3'
  },
  Mouch: {
    name: 'Mouch 🐭', 
    personality: 'sneaky', 
    color: '#a8e6cf',
    catchphrase: 'Squeak! Finding the best routes!',
    specialPower: 'MEV Protector',
    mood: 'mischievous',
    icon: Star,
    soundUrl: '/sounds/squeak.mp3'
  }
}

const SILLY_REACTIONS = [
  'Much wow! 🚀',
  'To the moon! 🌙', 
  'Wen lambo? 🚗',
  'Diamond hands! 💎🙌',
  'This is the way! 🛣️',
  'Number go up! 📈',
  'Bullish! 🐂',
  'WAGMI! 🤝'
]

interface MonadLoreProps {
  currentTPS?: number
  gasPrice?: number
  networkHealth?: number
}

export default function MonadLoreIntegration({ currentTPS = 127, gasPrice = 0.2, networkHealth = 98.5 }: MonadLoreProps) {
  const [activeMonanimal, setActiveMonanimal] = useState<keyof typeof MONANIMALS>('Salmonad')
  const [sillyReaction, setSillyReaction] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showEasterEgg, setShowEasterEgg] = useState(false)
  const [userClicks, setUserClicks] = useState(0)

  const currentMonanimal = MONANIMALS[activeMonanimal]

  // Monanimal seçimi metriğe göre
  useEffect(() => {
    // Fix activation logic based on actual performance metrics
    if (currentTPS > 50) {
      setActiveMonanimal('Salmonad') // High TPS for fish (50+ TPS is good for testnet)
    } else if (gasPrice < 60) { // Gas price in Gwei, so 60 Gwei threshold
      setActiveMonanimal('Chog') // Low gas for pig
    } else if (networkHealth > 95) {
      setActiveMonanimal('Molandak') // High health for duck
    } else {
      setActiveMonanimal('Mouch') // Default mouse for other cases
    }
    
    console.log(`🎮 Monanimal Logic: TPS=${currentTPS}, Gas=${gasPrice}, Health=${networkHealth} -> ${
      currentTPS > 50 ? 'Salmonad' : 
      gasPrice < 60 ? 'Chog' : 
      networkHealth > 95 ? 'Molandak' : 'Mouch'
    }`)
  }, [currentTPS, gasPrice, networkHealth])

  // Silly reaction generator
  const triggerSillyReaction = () => {
    const randomReaction = SILLY_REACTIONS[Math.floor(Math.random() * SILLY_REACTIONS.length)]
    setSillyReaction(randomReaction)
    
    // Disable sound for now to prevent errors
    // if (soundEnabled) {
    //   const audio = new Audio('/sounds/pop.mp3')
    //   audio.volume = 0.3
    //   audio.play().catch(() => {})
    // }
    
    setTimeout(() => setSillyReaction(''), 2000)
  }

  // Easter egg - 10 tıklama sonrası
  const handleMonanimalClick = () => {
    setUserClicks(prev => prev + 1)
    triggerSillyReaction()
    
    if (userClicks >= 9) {
      setShowEasterEgg(true)
      setUserClicks(0)
      setTimeout(() => setShowEasterEgg(false), 5000)
    }
  }

  // Performans seviyesine göre renk
  const getPerformanceColor = () => {
    if (currentTPS > 120 && gasPrice < 0.3 && networkHealth > 95) return '#00ff88' // Excellent
    if (currentTPS > 80 && gasPrice < 0.5 && networkHealth > 90) return '#ffff00' // Good
    return '#ff6b6b' // Needs improvement
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-2xl p-6 border border-white/20 relative overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiIC8+PC9zdmc+')] bg-repeat"></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-yellow-400" />
            Monad Crew Status
          </h3>
          <p className="text-white/60 text-sm">Meet your friendly blockchain companions!</p>
        </div>
        
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 glass-subtle rounded-lg hover:bg-white/10 transition-colors"
        >
          {soundEnabled ? 
            <Volume2 className="w-5 h-5 text-white/70" /> : 
            <VolumeX className="w-5 h-5 text-white/70" />
          }
        </button>
      </div>

      {/* Active Monanimal Display */}
      <motion.div
        key={activeMonanimal}
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center space-x-4 mb-6 relative z-10"
      >
        <motion.div
          onClick={handleMonanimalClick}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="relative cursor-pointer"
        >
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg border-4 border-white/20"
            style={{ backgroundColor: currentMonanimal.color + '40' }}
          >
            {currentMonanimal.name.split(' ')[1]}
          </div>
          
          {/* Glow effect */}
          <div 
            className="absolute inset-0 rounded-full blur-lg opacity-30 animate-pulse"
            style={{ backgroundColor: currentMonanimal.color }}
          />
          
          {/* Performance indicator */}
          <div 
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center"
            style={{ backgroundColor: getPerformanceColor() }}
          >
            <Heart className="w-3 h-3 text-white" />
          </div>
        </motion.div>

        <div className="flex-1">
          <h4 className="text-xl font-bold text-white mb-1">
            {currentMonanimal.name}
          </h4>
          <p className="text-white/80 italic mb-2">
            "{currentMonanimal.catchphrase}"
          </p>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 glass-subtle rounded-full text-xs text-white/70">
              {currentMonanimal.specialPower}
            </span>
            <span className="px-3 py-1 glass-subtle rounded-full text-xs text-white/70">
              Mood: {currentMonanimal.mood}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Performance Metrics with Monanimal Commentary */}
      <div className="grid grid-cols-3 gap-4 mb-6 relative z-10">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-subtle rounded-lg p-4 text-center"
        >
          <Zap className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
          <div className="text-2xl font-bold text-white">{currentTPS}</div>
          <div className="text-xs text-white/60">TPS Power</div>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-subtle rounded-lg p-4 text-center"
        >
          <Star className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
          <div className="text-2xl font-bold text-white">{gasPrice}</div>
          <div className="text-xs text-white/60">Gas Magic</div>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-subtle rounded-lg p-4 text-center"
        >
          <Heart className="w-6 h-6 mx-auto mb-2 text-green-400" />
          <div className="text-2xl font-bold text-white">{networkHealth}%</div>
          <div className="text-xs text-white/60">Health</div>
        </motion.div>
      </div>

      {/* Monanimal Selector */}
      <div className="flex space-x-2 mb-4 relative z-10">
        {Object.entries(MONANIMALS).map(([key, monanimal]) => (
          <motion.button
            key={key}
            onClick={() => setActiveMonanimal(key as keyof typeof MONANIMALS)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex-1 p-2 rounded-lg text-xs font-medium transition-all ${
              activeMonanimal === key
                ? 'bg-cyan-500/30 text-white border border-cyan-400/50'
                : 'glass-subtle text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {monanimal.name}
          </motion.button>
        ))}
      </div>

      {/* Silly Reaction Display */}
      <AnimatePresence>
        {sillyReaction && (
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: -20 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full text-lg font-bold shadow-2xl">
              {sillyReaction}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Easter Egg - Purple Pepe Tribute */}
      <AnimatePresence>
        {showEasterEgg && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-pink-600/90 flex items-center justify-center z-30 rounded-2xl"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🐸💜</div>
              <div className="text-2xl font-bold text-white mb-2">PURPLE PEPE ACTIVATED!</div>
              <div className="text-lg text-white/80">You found the legendary meme!</div>
              <div className="flex justify-center space-x-2 mt-4">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <Sparkles className="w-6 h-6 text-yellow-400" />
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Curve Indicator */}
      <div className="absolute bottom-4 right-4 z-10">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-xs text-white/40 transform -rotate-12"
        >
          left curve approved ✨
        </motion.div>
      </div>
    </motion.div>
  )
} 