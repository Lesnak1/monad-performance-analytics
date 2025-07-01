'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Download, Eye, Clock, Zap, TrendingUp, Info } from 'lucide-react'
import { getExplorerUrl } from '../lib/monadData'
import { useState } from 'react'
import { safeToLocaleString, formatGasPrice, formatBlockNumber } from '../lib/utils'

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
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null)
  
  const sortedResults = [...results].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const handleViewExplorer = (blockNumber: number, txHash?: string) => {
    const url = txHash 
      ? getExplorerUrl('tx', txHash)
      : getExplorerUrl('block', blockNumber.toString())
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleViewDetails = (result: TestResult) => {
    setSelectedResult(result)
  }

  const handleDownload = () => {
    const csvContent = [
      'Test Name,Timestamp,TPS,Duration,Gas Used,Success Rate,Block Number,TX Hash',
      ...sortedResults.map(r => 
        `"${r.testName}","${r.timestamp}",${r.tps},${r.duration},${r.gasUsed},${r.successRate},${r.blockNumber},"${r.txHash || ''}"`
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `monad_test_results_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

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
    <>
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
              <button 
                onClick={handleDownload}
                className="p-2 glass rounded-lg hover:bg-white/10 transition-colors"
                title="Download CSV"
              >
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
                  className="border-b border-white/5 hover:bg-white/5 transition-colors group"
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
                      <span className="font-bold text-cyber-green">{safeToLocaleString(result.tps)}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-cyber-blue" />
                      <span className="text-cyber-blue">{safeToLocaleString(result.duration)}s</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-purple-400 font-medium">
                      {safeToLocaleString(result.gasUsed)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-pink-400" />
                      <span className="text-pink-400 font-medium">
                        {safeToLocaleString(result.successRate)}%
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleViewExplorer(result.blockNumber)}
                      className="text-cyber-blue hover:text-white transition-colors"
                      title="View block on explorer"
                    >
                      {formatBlockNumber(result.blockNumber)}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewExplorer(result.blockNumber, result.txHash)}
                        className="p-1 hover:bg-white/10 rounded transition-colors group-hover:bg-cyber-blue/20"
                        title="View on Monad Explorer"
                      >
                        <ExternalLink className="w-4 h-4 text-white/60 group-hover:text-cyber-blue" />
                      </button>
                      <button 
                        onClick={() => handleViewDetails(result)}
                        className="p-1 hover:bg-white/10 rounded transition-colors group-hover:bg-cyber-green/20"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-white/60 group-hover:text-cyber-green" />
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
            <button
              onClick={() => window.open(getExplorerUrl('block', ''), '_blank')}
              className="text-cyber-blue hover:text-white transition-colors"
            >
              View All Blocks on Explorer →
            </button>
          </div>
        </div>
      </motion.div>

      {/* Details Modal */}
      {selectedResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedResult(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-strong rounded-2xl p-6 max-w-2xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Test Details</h3>
              <button
                onClick={() => setSelectedResult(null)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-white/60 text-sm">Test Name</div>
                  <div className="text-white font-medium">{selectedResult.testName}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-white/60 text-sm">Timestamp</div>
                  <div className="text-white font-medium">
                    {new Date(selectedResult.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="bg-cyber-green/10 rounded-lg p-4">
                  <div className="text-white/60 text-sm">TPS Achieved</div>
                  <div className="text-cyber-green font-bold text-xl">
                    {safeToLocaleString(selectedResult.tps)}
                  </div>
                </div>
                <div className="bg-cyber-blue/10 rounded-lg p-4">
                  <div className="text-white/60 text-sm">Duration</div>
                  <div className="text-cyber-blue font-bold text-xl">
                    {safeToLocaleString(selectedResult.duration)}s
                  </div>
                </div>
                <div className="bg-purple-500/10 rounded-lg p-4">
                  <div className="text-white/60 text-sm">Gas Used</div>
                  <div className="text-purple-400 font-bold">
                    {safeToLocaleString(selectedResult.gasUsed)}
                  </div>
                </div>
                <div className="bg-pink-500/10 rounded-lg p-4">
                  <div className="text-white/60 text-sm">Success Rate</div>
                  <div className="text-pink-400 font-bold">
                    {safeToLocaleString(selectedResult.successRate)}%
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => handleViewExplorer(selectedResult.blockNumber, selectedResult.txHash)}
                  className="flex-1 bg-cyber-blue hover:bg-cyber-blue/90 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  View on Explorer
                </button>
                <button
                  onClick={() => {
                    const data = `Test: ${selectedResult.testName}\nTPS: ${selectedResult.tps}\nDuration: ${selectedResult.duration}s\nGas: ${selectedResult.gasUsed}\nSuccess: ${selectedResult.successRate}%\nBlock: ${selectedResult.blockNumber}`
                    navigator.clipboard.writeText(data)
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Copy Details
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
} 