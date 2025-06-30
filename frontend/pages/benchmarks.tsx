import { motion } from 'framer-motion'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { 
  Play, 
  Square, 
  BarChart3,
  Clock,
  Zap,
  Target,
  Layers,
  Database,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Coins
} from 'lucide-react'

interface BenchmarkTest {
  id: string
  name: string
  description: string
  icon: any
  category: 'erc20' | 'nft' | 'defi'
  status: 'idle' | 'running' | 'completed' | 'failed'
  results?: {
    tps: number
    gasUsed: number
    duration: number
    blocks: number
    successRate: number
  }
  config: {
    txCount: number
    batchSize: number
    estimatedDuration: number
  }
}

const benchmarkTests: BenchmarkTest[] = [
  {
    id: 'erc20-airdrop',
    name: 'ERC20 Mass Airdrop',
    description: 'Test bulk token transfers to multiple recipients simultaneously',
    icon: Coins,
    category: 'erc20',
    status: 'idle',
    config: { txCount: 1000, batchSize: 50, estimatedDuration: 120 }
  },
  {
    id: 'nft-batch-mint',
    name: 'NFT Batch Minting',
    description: 'Large-scale NFT creation to test state growth performance',
    icon: Layers,
    category: 'nft', 
    status: 'idle',
    config: { txCount: 500, batchSize: 25, estimatedDuration: 180 }
  },
  {
    id: 'defi-swap-stress',
    name: 'DeFi Swap Stress Test',
    description: 'Complex DeFi operations with multiple contract interactions',
    icon: Database,
    category: 'defi',
    status: 'idle',
    config: { txCount: 200, batchSize: 10, estimatedDuration: 240 }
  },
  {
    id: 'multi-contract',
    name: 'Multi-Contract Interaction',
    description: 'Cross-contract calls to test complex transaction processing',
    icon: Target,
    category: 'defi',
    status: 'idle', 
    config: { txCount: 300, batchSize: 15, estimatedDuration: 200 }
  }
]

export default function Benchmarks() {
  const [tests, setTests] = useState<BenchmarkTest[]>(benchmarkTests)
  const [activeTest, setActiveTest] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const runBenchmark = async (testId: string) => {
    setActiveTest(testId)
    setTests(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, status: 'running' as const }
        : test
    ))

    // Simulate benchmark execution
    const test = tests.find(t => t.id === testId)
    if (!test) return

    try {
      // Simulate the test duration
      await new Promise(resolve => setTimeout(resolve, test.config.estimatedDuration * 10)) // 10x faster for demo
      
      // Generate realistic results
      const baselineMultiplier = Math.random() * 0.4 + 0.8 // 0.8-1.2x variance
      const tps = Math.floor((test.config.txCount / test.config.estimatedDuration) * baselineMultiplier)
      
      setTests(prev => prev.map(t => 
        t.id === testId 
          ? { 
              ...t, 
              status: 'completed' as const,
              results: {
                tps,
                gasUsed: Math.floor(21000 * test.config.txCount * (1 + Math.random() * 0.3)),
                duration: test.config.estimatedDuration + Math.floor(Math.random() * 30 - 15),
                blocks: Math.floor(test.config.estimatedDuration / 2) + Math.floor(Math.random() * 5),
                successRate: 95 + Math.random() * 5
              }
            }
          : t
      ))
    } catch (error) {
      setTests(prev => prev.map(t => 
        t.id === testId 
          ? { ...t, status: 'failed' as const }
          : t
      ))
    }
    
    setActiveTest(null)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <AlertCircle className="w-5 h-5 text-cyber-blue animate-spin" />
      case 'completed': return <CheckCircle className="w-5 h-5 text-cyber-green" />
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />
      default: return <Play className="w-5 h-5 text-white/60" />
    }
  }

  const filteredTests = selectedCategory === 'all' 
    ? tests 
    : tests.filter(test => test.category === selectedCategory)

  const completedTests = tests.filter(t => t.status === 'completed')
  const averageTps = completedTests.length > 0 
    ? Math.round(completedTests.reduce((sum, t) => sum + (t.results?.tps || 0), 0) / completedTests.length)
    : 0

  return (
    <>
      <Head>
        <title>Benchmarks - MPAS</title>
        <meta name="description" content="Run and analyze Monad blockchain performance benchmarks" />
      </Head>

      <div className="min-h-screen relative overflow-hidden noise-overlay">
        {/* Background effects */}
        <div className="fixed inset-0 z-0">
          <div className="absolute top-20 right-10 w-96 h-96 bg-purple-burst opacity-20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-cyber-gradient opacity-15 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
        </div>

        <Header />

        <main className="relative z-10 container mx-auto px-6 py-12 space-y-12">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6"
          >
            <h1 className="text-5xl font-bold text-glow">
              <span className="bg-gradient-to-r from-white via-monad-300 to-cyber-blue bg-clip-text text-transparent">
                Performance Benchmarks
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Comprehensive stress testing suite for Monad blockchain. 
              Execute real-world scenarios and measure performance metrics.
            </p>
          </motion.section>

          {/* Stats Overview */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            <div className="glass rounded-xl p-4 text-center">
              <BarChart3 className="w-8 h-8 text-cyber-blue mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{completedTests.length}</div>
              <div className="text-white/60 text-sm">Tests Completed</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <Zap className="w-8 h-8 text-cyber-green mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{averageTps}</div>
              <div className="text-white/60 text-sm">Average TPS</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <Clock className="w-8 h-8 text-cyber-purple mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {completedTests.reduce((sum, t) => sum + (t.results?.duration || 0), 0)}s
              </div>
              <div className="text-white/60 text-sm">Total Runtime</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <TrendingUp className="w-8 h-8 text-cyber-pink mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {completedTests.length > 0 
                  ? Math.round(completedTests.reduce((sum, t) => sum + (t.results?.successRate || 0), 0) / completedTests.length)
                  : 0}%
              </div>
              <div className="text-white/60 text-sm">Success Rate</div>
            </div>
          </motion.section>

          {/* Category Filter */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-center"
          >
            <div className="glass rounded-xl p-2 flex space-x-2">
              {[
                { id: 'all', name: 'All Tests' },
                { id: 'erc20', name: 'ERC20' },
                { id: 'nft', name: 'NFT' },
                { id: 'defi', name: 'DeFi' }
              ].map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedCategory === category.id
                      ? 'bg-cyber-gradient text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </motion.section>

          {/* Benchmark Tests Grid */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {filteredTests.map((test, index) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                className="glass rounded-2xl p-6 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-monad-500/5 via-transparent to-cyber-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-monad-gradient rounded-xl flex items-center justify-center">
                        <test.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{test.name}</h3>
                        <p className="text-white/60 text-sm">{test.description}</p>
                      </div>
                    </div>
                    {getStatusIcon(test.status)}
                  </div>

                  {/* Configuration */}
                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-white/60">Transactions</span>
                      <div className="text-cyber-blue font-medium">{test.config.txCount}</div>
                    </div>
                    <div>
                      <span className="text-white/60">Batch Size</span>
                      <div className="text-cyber-purple font-medium">{test.config.batchSize}</div>
                    </div>
                    <div>
                      <span className="text-white/60">Est. Duration</span>
                      <div className="text-cyber-green font-medium">{test.config.estimatedDuration}s</div>
                    </div>
                  </div>

                  {/* Results */}
                  {test.results && (
                    <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-white/5 rounded-lg">
                      <div>
                        <span className="text-white/60 text-xs">TPS Achieved</span>
                        <div className="text-cyber-green font-bold">{test.results.tps}</div>
                      </div>
                      <div>
                        <span className="text-white/60 text-xs">Duration</span>
                        <div className="text-cyber-blue font-bold">{test.results.duration}s</div>
                      </div>
                      <div>
                        <span className="text-white/60 text-xs">Gas Used</span>
                        <div className="text-cyber-purple font-bold">{test.results.gasUsed.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-white/60 text-xs">Success Rate</span>
                        <div className="text-cyber-pink font-bold">{test.results.successRate.toFixed(1)}%</div>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => runBenchmark(test.id)}
                    disabled={test.status === 'running' || activeTest !== null}
                    className={`w-full py-3 rounded-xl font-medium transition-all ${
                      test.status === 'running' || activeTest !== null
                        ? 'bg-white/10 text-white/50 cursor-not-allowed'
                        : test.status === 'completed'
                        ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/30 hover:bg-cyber-green/30'
                        : 'bg-cyber-gradient text-white hover:shadow-lg hover:shadow-monad-500/25'
                    }`}
                  >
                    {test.status === 'running' ? 'Running...' : 
                     test.status === 'completed' ? 'Run Again' : 
                     test.status === 'failed' ? 'Retry' : 'Start Test'}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.section>

          {/* Run All Button */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="text-center"
          >
            <button
              onClick={() => filteredTests.forEach(test => {
                if (test.status === 'idle') {
                  setTimeout(() => runBenchmark(test.id), Math.random() * 2000)
                }
              })}
              disabled={activeTest !== null}
              className="bg-cyber-gradient text-white px-12 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-monad-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Run All Available Tests
            </button>
          </motion.section>
        </main>

        <Footer />
      </div>
    </>
  )
} 