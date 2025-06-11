'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, ChevronDown, FileText, FileSpreadsheet, File, Table } from 'lucide-react'
import { exportData, exportFormats, ExportFormat, ExportData } from '../lib/export'

interface ExportButtonProps {
  data: ExportData[]
  filename?: string
  title?: string
  chartElements?: HTMLElement[]
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary'
}

const iconMap = {
  json: File,
  csv: Table,
  xlsx: FileSpreadsheet,
  pdf: FileText
}

export default function ExportButton({
  data,
  filename = 'monad_data',
  title = 'Monad Performance Report',
  chartElements = [],
  disabled = false,
  size = 'md',
  variant = 'primary'
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null)

  const handleExport = async (format: ExportFormat) => {
    if (disabled || !data.length) return

    setIsExporting(format)
    setIsOpen(false)

    try {
      await exportData(data, format, filename, {
        chartElements,
        title
      })
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(null)
    }
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const variantClasses = {
    primary: 'bg-cyber-blue hover:bg-cyber-blue/90 text-white',
    secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
  }

  if (disabled || !data.length) {
    return (
      <button
        disabled
        className={`
          flex items-center space-x-2 rounded-lg transition-colors
          bg-gray-500/50 text-gray-400 cursor-not-allowed
          ${sizeClasses[size]}
        `}
      >
        <Download className="w-4 h-4" />
        <span>Export</span>
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={!!isExporting}
        className={`
          flex items-center space-x-2 rounded-lg transition-all duration-200
          ${variantClasses[variant]} ${sizeClasses[size]}
          ${isExporting ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-lg'}
        `}
      >
        {isExporting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Export</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-64 glass-strong rounded-lg p-2 z-50 border border-white/20"
          >
            <div className="space-y-1">
              {exportFormats.map((format) => {
                const Icon = iconMap[format.value]
                const isCurrentlyExporting = isExporting === format.value
                
                return (
                  <button
                    key={format.value}
                    onClick={() => handleExport(format.value)}
                    disabled={!!isExporting}
                    className={`
                      w-full flex items-center justify-between p-3 rounded-lg transition-colors
                      ${isCurrentlyExporting 
                        ? 'bg-cyber-blue/20 text-white' 
                        : 'hover:bg-white/10 text-white/90'
                      }
                      ${isExporting && !isCurrentlyExporting ? 'opacity-50' : ''}
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-white/10 rounded-lg">
                        {isCurrentlyExporting ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-sm">{format.label}</div>
                        <div className="text-xs text-white/60">{format.description}</div>
                      </div>
                    </div>
                    <div className="text-lg">{format.icon}</div>
                  </button>
                )
              })}
            </div>

            {/* Export Info */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="text-xs text-white/60 space-y-1">
                <div>📊 {data.length} data points</div>
                <div>📅 {filename.replace(/_/g, ' ')}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

// Quick export buttons for specific formats
export function QuickExportButtons({ data, filename, title, chartElements }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null)

  const handleQuickExport = async (format: ExportFormat) => {
    setIsExporting(format)
    try {
      await exportData(data || [], format, filename || 'monad_data', {
        chartElements,
        title
      })
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(null)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {exportFormats.slice(0, 3).map((format) => {
        const Icon = iconMap[format.value]
        const isCurrentlyExporting = isExporting === format.value
        
        return (
          <button
            key={format.value}
            onClick={() => handleQuickExport(format.value)}
            disabled={!!isExporting || !data?.length}
            className={`
              p-2 rounded-lg transition-all duration-200 group
              ${isCurrentlyExporting 
                ? 'bg-cyber-blue text-white' 
                : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
              }
              ${isExporting && !isCurrentlyExporting ? 'opacity-50' : ''}
              ${!data?.length ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            title={`Export as ${format.label}`}
          >
            {isCurrentlyExporting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Icon className="w-4 h-4" />
            )}
          </button>
        )
      })}
    </div>
  )
} 