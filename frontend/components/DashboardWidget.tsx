'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  MoreHorizontal, 
  Maximize2, 
  Minimize2, 
  Settings, 
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'

interface WidgetProps {
  id: string
  title: string
  children: React.ReactNode
  size?: 'small' | 'medium' | 'large'
  refreshable?: boolean
  downloadable?: boolean
  configurable?: boolean
  className?: string
  onRefresh?: () => void
  onDownload?: () => void
  onConfigure?: () => void
  onResize?: (size: 'small' | 'medium' | 'large') => void
}

export default function DashboardWidget({
  id,
  title,
  children,
  size = 'medium',
  refreshable = true,
  downloadable = true,
  configurable = true,
  className = '',
  onRefresh,
  onDownload,
  onConfigure,
  onResize
}: WidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const handleRefresh = async () => {
    if (!onRefresh) return
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-2 row-span-1', 
    large: 'col-span-3 row-span-2'
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`glass rounded-2xl overflow-hidden relative group ${sizeClasses[size]} ${className}`}
      style={{ minHeight: isExpanded ? '400px' : '200px' }}
    >
      {/* Widget Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center space-x-3">
          <h3 className="text-white font-semibold text-sm">{title}</h3>
          <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
        </div>

        {/* Widget Controls */}
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {refreshable && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-white/70 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}

          {downloadable && (
            <button
              onClick={onDownload}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title="Download Data"
            >
              <Download className="w-4 h-4 text-white/70" />
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title={isExpanded ? 'Minimize' : 'Maximize'}
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4 text-white/70" />
            ) : (
              <Maximize2 className="w-4 h-4 text-white/70" />
            )}
          </button>

          {/* More Options Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title="More Options"
            >
              <MoreHorizontal className="w-4 h-4 text-white/70" />
            </button>

            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full mt-2 glass-strong rounded-lg p-2 min-w-40 z-50"
              >
                {configurable && (
                  <button
                    onClick={() => {
                      onConfigure?.()
                      setShowMenu(false)
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-white/70 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Configure</span>
                  </button>
                )}
                
                {onResize && (
                  <>
                    <button
                      onClick={() => {
                        onResize('small')
                        setShowMenu(false)
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-white/70 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                      <span>Small Size</span>
                    </button>
                    <button
                      onClick={() => {
                        onResize('medium')
                        setShowMenu(false)
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-white/70 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Medium Size</span>
                    </button>
                    <button
                      onClick={() => {
                        onResize('large')
                        setShowMenu(false)
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-white/70 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <TrendingDown className="w-4 h-4" />
                      <span>Large Size</span>
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Widget Content */}
      <motion.div
        layout
        className="p-4 h-full overflow-auto"
        animate={{ height: isExpanded ? '350px' : 'auto' }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>

      {/* Resize Indicator */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-50 transition-opacity">
        <div className="w-3 h-3 border-r-2 border-b-2 border-white/30"></div>
      </div>

      {/* Loading Overlay */}
      {isRefreshing && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-cyber-blue animate-spin" />
        </div>
      )}
    </motion.div>
  )
}

// Widget Container for Grid Layout
export function WidgetGrid({ children, className = '' }: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={`grid grid-cols-4 gap-6 auto-rows-min ${className}`}>
      {children}
    </div>
  )
} 