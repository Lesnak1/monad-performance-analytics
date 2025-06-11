'use client'
import { motion } from 'framer-motion'
import { ExternalLink, Download, Eye, Clock, Zap, TrendingUp } from 'lucide-react'

interface TestResult {
  id: string
  testName: string
  timestamp: string
  tps: number
  gasUsed: number
  duration: number
  successRate: number
  blockNumber: number
  txHash?: string
}

interface ResultsTableProps {
  results: TestResult[]
  loading?: boolean
}

export default function ResultsTable({ results, loading = false }: ResultsTableProps) {
  const sortedResults = [...results].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass rounded-2xl p-6"
      >
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex space-x-4">
              <div className="w-20 h-4 bg-white/10 rounded"></div>
              <div className="flex-1 h-4 bg-white/10 rounded"></div>
              <div className="w-16 h-4 bg-white/10 rounded"></div>
              <div className="w-16 h-4 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  if (results.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-12 text-center"
      >
        <Eye className="w-16 h-16 text-white/30 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Results Yet</h3>
        <p className="text-white/60">Run some benchmark tests to see detailed results here.</p>
      </motion.div>
    )
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
          <h3 className="text-xl font-semibold text-white text-glow">Test Results History</h3>
          <div className="flex items-center space-x-2">
            <button className="p-2 glass rounded-lg hover:bg-white/10 transition-colors">
              <Download className="w-4 h-4 text-white/70" />
            </button>
            <span className="text-white/60 text-sm">{results.length} results</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-white/70 font-medium">Test</th>
              <th className="text-left p-4 text-white/70 font-medium">Timestamp</th>
              <th className="text-left p-4 text-white/70 font-medium">TPS</th>
              <th className="text-left p-4 text-white/70 font-medium">Duration</th>
              <th className="text-left p-4 text-white/70 font-medium">Gas Used</th>
              <th className="text-left p-4 text-white/70 font-medium">Success Rate</th>
              <th className="text-left p-4 text-white/70 font-medium">Block</th>
              <th className="text-left p-4 text-white/70 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((result, index) => (
              <motion.tr
                key={result.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="p-4">
                  <div className="font-medium text-white">{result.testName}</div>
                </td>
                <td className="p-4">
                  <div className="text-white/70 text-sm">
                    {new Date(result.timestamp).toLocaleString()}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-cyber-green" />
                    <span className="font-bold text-cyber-green">{result.tps}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-cyber-blue" />
                    <span className="text-cyber-blue">{result.duration}s</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-cyber-purple font-medium">
                    {result.gasUsed.toLocaleString()}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-cyber-pink" />
                    <span className="text-cyber-pink font-medium">
                      {result.successRate.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-white/70">#{result.blockNumber}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    {result.txHash && (
                      <button 
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title="View on Explorer"
                      >
                        <ExternalLink className="w-4 h-4 text-white/60" />
                      </button>
                    )}
                    <button 
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 text-white/60" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 bg-white/2 border-t border-white/10">
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
          <span>Auto-refresh enabled</span>
        </div>
      </div>
    </motion.div>
  )
} 