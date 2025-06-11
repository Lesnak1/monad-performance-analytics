'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  X, 
  Calendar,
  Hash,
  DollarSign,
  Zap,
  Clock,
  ArrowUpDown,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  Tag,
  User,
  Globe,
  Activity
} from 'lucide-react'

interface FilterConfig {
  timeRange: {
    start: string
    end: string
    preset: '1h' | '6h' | '24h' | '7d' | '30d' | 'custom'
  }
  transactionType: string[]
  gasRange: {
    min: number
    max: number
  }
  amountRange: {
    min: number
    max: number
  }
  addressType: 'all' | 'contracts' | 'eoa'
  status: 'all' | 'success' | 'failed' | 'pending'
  sortBy: 'timestamp' | 'amount' | 'gas' | 'gasPrice'
  sortOrder: 'asc' | 'desc'
  searchTerms: string[]
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterConfig) => void
  totalResults: number
  isLoading?: boolean
}

export default function AdvancedFilters({ onFiltersChange, totalResults, isLoading }: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterConfig>({
    timeRange: {
      start: '',
      end: '',
      preset: '24h'
    },
    transactionType: [],
    gasRange: { min: 0, max: 100 },
    amountRange: { min: 0, max: 1000 },
    addressType: 'all',
    status: 'all',
    sortBy: 'timestamp',
    sortOrder: 'desc',
    searchTerms: []
  })

  const [savedFilters, setSavedFilters] = useState<{ name: string; config: FilterConfig }[]>([])
  const [isFilterVisible, setIsFilterVisible] = useState(true)

  const transactionTypes = [
    { id: 'transfer', label: 'Transfer', icon: '💸', color: '#00d4ff' },
    { id: 'swap', label: 'Swap', icon: '🔄', color: '#8b5cf6' },
    { id: 'mint', label: 'Mint', icon: '🏭', color: '#10b981' },
    { id: 'burn', label: 'Burn', icon: '🔥', color: '#ef4444' },
    { id: 'contract', label: 'Contract', icon: '📋', color: '#f59e0b' },
    { id: 'bridge', label: 'Bridge', icon: '🌉', color: '#06b6d4' }
  ]

  const timePresets = [
    { id: '1h', label: '1 Hour' },
    { id: '6h', label: '6 Hours' },
    { id: '24h', label: '24 Hours' },
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: 'custom', label: 'Custom' }
  ]

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const updateFilter = (key: keyof FilterConfig, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const toggleTransactionType = (type: string) => {
    setFilters(prev => ({
      ...prev,
      transactionType: prev.transactionType.includes(type)
        ? prev.transactionType.filter(t => t !== type)
        : [...prev.transactionType, type]
    }))
  }

  const resetFilters = () => {
    setFilters({
      timeRange: { start: '', end: '', preset: '24h' },
      transactionType: [],
      gasRange: { min: 0, max: 100 },
      amountRange: { min: 0, max: 1000 },
      addressType: 'all',
      status: 'all',
      sortBy: 'timestamp',
      sortOrder: 'desc',
      searchTerms: []
    })
    setSearchQuery('')
  }

  const saveCurrentFilter = () => {
    const name = prompt('Filter set ismini girin:')
    if (name) {
      setSavedFilters(prev => [...prev, { name, config: filters }])
    }
  }

  const applySavedFilter = (config: FilterConfig) => {
    setFilters(config)
  }

  const exportFilters = () => {
    const data = {
      filters,
      timestamp: new Date().toISOString(),
      totalResults
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `monad_filters_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.transactionType.length > 0) count++
    if (filters.addressType !== 'all') count++
    if (filters.status !== 'all') count++
    if (filters.gasRange.min > 0 || filters.gasRange.max < 100) count++
    if (filters.amountRange.min > 0 || filters.amountRange.max < 1000) count++
    if (searchQuery) count++
    return count
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Main Search Bar */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center space-x-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by hash, address, token..."
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/50 focus:border-cyber-blue focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              whileHover={{ scale: 1.05 }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                isExpanded ? 'bg-cyber-blue text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {getActiveFiltersCount() > 0 && (
                <span className="bg-cyber-green text-black text-xs px-2 py-1 rounded-full font-bold">
                  {getActiveFiltersCount()}
                </span>
              )}
            </motion.button>

            <motion.button
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              whileHover={{ scale: 1.05 }}
              className="p-2 bg-white/10 text-white/70 hover:bg-white/20 rounded-lg transition-all"
            >
              {isFilterVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </motion.button>

            <motion.button
              onClick={resetFilters}
              whileHover={{ scale: 1.05 }}
              className="p-2 bg-white/10 text-white/70 hover:bg-white/20 rounded-lg transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center space-x-4 text-sm text-white/60">
            <span>
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-cyber-blue border-t-transparent rounded-full"></div>
                  <span>Searching...</span>
                </span>
              ) : (
                `${totalResults.toLocaleString()} results found`
              )}
            </span>
            <span>•</span>
            <span>Updated {new Date().toLocaleTimeString()}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={saveCurrentFilter}
              className="text-cyber-blue hover:text-cyber-blue/80 text-sm"
            >
              Save Filter
            </button>
            <button
              onClick={exportFilters}
              className="text-cyber-green hover:text-cyber-green/80 text-sm"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {isExpanded && isFilterVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-2xl p-6 space-y-6"
          >
            {/* Time Range */}
            <div>
              <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-cyber-blue" />
                <span>Time Range</span>
              </h4>
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
                {timePresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => updateFilter('timeRange', { 
                      ...filters.timeRange, 
                      preset: preset.id as any 
                    })}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      filters.timeRange.preset === preset.id
                        ? 'bg-cyber-blue text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              
              {filters.timeRange.preset === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="datetime-local"
                    value={filters.timeRange.start}
                    onChange={(e) => updateFilter('timeRange', {
                      ...filters.timeRange,
                      start: e.target.value
                    })}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  />
                  <input
                    type="datetime-local"
                    value={filters.timeRange.end}
                    onChange={(e) => updateFilter('timeRange', {
                      ...filters.timeRange,
                      end: e.target.value
                    })}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              )}
            </div>

            {/* Transaction Types */}
            <div>
              <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                <Tag className="w-4 h-4 text-cyber-blue" />
                <span>Transaction Types</span>
              </h4>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {transactionTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    onClick={() => toggleTransactionType(type.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                      filters.transactionType.includes(type.id)
                        ? 'bg-cyber-blue/20 border-cyber-blue text-white border'
                        : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20 border'
                    }`}
                  >
                    <span className="text-lg">{type.icon}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Range Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gas Range */}
              <div>
                <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-cyber-blue" />
                  <span>Gas Price Range (Gwei)</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      value={filters.gasRange.min}
                      onChange={(e) => updateFilter('gasRange', {
                        ...filters.gasRange,
                        min: parseFloat(e.target.value) || 0
                      })}
                      placeholder="Min"
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    />
                    <span className="text-white/40">to</span>
                    <input
                      type="number"
                      value={filters.gasRange.max}
                      onChange={(e) => updateFilter('gasRange', {
                        ...filters.gasRange,
                        max: parseFloat(e.target.value) || 100
                      })}
                      placeholder="Max"
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white/60">
                    <span>{filters.gasRange.min} Gwei</span>
                    <span>{filters.gasRange.max} Gwei</span>
                  </div>
                </div>
              </div>

              {/* Amount Range */}
              <div>
                <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-cyber-blue" />
                  <span>Amount Range (MON)</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      value={filters.amountRange.min}
                      onChange={(e) => updateFilter('amountRange', {
                        ...filters.amountRange,
                        min: parseFloat(e.target.value) || 0
                      })}
                      placeholder="Min"
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    />
                    <span className="text-white/40">to</span>
                    <input
                      type="number"
                      value={filters.amountRange.max}
                      onChange={(e) => updateFilter('amountRange', {
                        ...filters.amountRange,
                        max: parseFloat(e.target.value) || 1000
                      })}
                      placeholder="Max"
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status & Address Type */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-cyber-blue" />
                  <span>Status</span>
                </h4>
                <select
                  value={filters.status}
                  onChange={(e) => updateFilter('status', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                  <User className="w-4 h-4 text-cyber-blue" />
                  <span>Address Type</span>
                </h4>
                <select
                  value={filters.addressType}
                  onChange={(e) => updateFilter('addressType', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                >
                  <option value="all">All Addresses</option>
                  <option value="contracts">Contracts Only</option>
                  <option value="eoa">EOA Only</option>
                </select>
              </div>

              <div>
                <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                  <ArrowUpDown className="w-4 h-4 text-cyber-blue" />
                  <span>Sort By</span>
                </h4>
                <div className="flex space-x-2">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => updateFilter('sortBy', e.target.value)}
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="timestamp">Time</option>
                    <option value="amount">Amount</option>
                    <option value="gas">Gas</option>
                    <option value="gasPrice">Gas Price</option>
                  </select>
                  <button
                    onClick={() => updateFilter('sortOrder', filters.sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
                  >
                    {filters.sortOrder === 'desc' ? '↓' : '↑'}
                  </button>
                </div>
              </div>
            </div>

            {/* Saved Filters */}
            {savedFilters.length > 0 && (
              <div>
                <h4 className="text-white font-medium mb-3">Saved Filters</h4>
                <div className="flex flex-wrap gap-2">
                  {savedFilters.map((saved, index) => (
                    <button
                      key={index}
                      onClick={() => applySavedFilter(saved.config)}
                      className="px-3 py-1 bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30 rounded-lg text-sm hover:bg-cyber-purple/30 transition-all"
                    >
                      {saved.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 