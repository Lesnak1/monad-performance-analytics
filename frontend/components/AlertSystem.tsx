'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { 
  Bell, 
  BellRing, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Zap,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Volume2,
  VolumeX
} from 'lucide-react'

interface Alert {
  id: string
  name: string
  metric: 'tps' | 'gasPrice' | 'networkHealth' | 'blockTime'
  condition: 'above' | 'below'
  threshold: number
  isActive: boolean
  triggered: boolean
  lastTriggered?: number
  soundEnabled: boolean
  color: string
}

interface AlertSystemProps {
  currentMetrics: {
    tps: number
    gasPrice: number
    networkHealth: number
    blockTime: number
  }
}

export default function AlertSystem({ currentMetrics }: AlertSystemProps) {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      name: 'High TPS Alert',
      metric: 'tps',
      condition: 'above',
      threshold: 190,
      isActive: true,
      triggered: false,
      soundEnabled: true,
      color: '#00d4ff'
    },
    {
      id: '2', 
      name: 'High Gas Price',
      metric: 'gasPrice',
      condition: 'above',
      threshold: 55,
      isActive: true,
      triggered: false,
      soundEnabled: true,
      color: '#8b5cf6'
    },
    {
      id: '3',
      name: 'Network Health Low',
      metric: 'networkHealth',
      condition: 'below',
      threshold: 90,
      isActive: true,
      triggered: false,
      soundEnabled: false,
      color: '#ef4444'
    }
  ])

  const [isCreatingAlert, setIsCreatingAlert] = useState(false)
  const [newAlert, setNewAlert] = useState({
    name: '',
    metric: 'tps' as const,
    condition: 'above' as const,
    threshold: 0,
    soundEnabled: true
  })

  // Check alerts
  const checkAlerts = useCallback(() => {
    setAlerts(prev => prev.map(alert => {
      if (!alert.isActive) return alert

      const currentValue = currentMetrics[alert.metric]
      let shouldTrigger = false

      if (alert.condition === 'above') {
        shouldTrigger = currentValue > alert.threshold
      } else {
        shouldTrigger = currentValue < alert.threshold
      }

      if (shouldTrigger && !alert.triggered) {
        return {
          ...alert,
          triggered: true,
          lastTriggered: Date.now()
        }
      }

      if (!shouldTrigger && alert.triggered) {
        return {
          ...alert,
          triggered: false
        }
      }

      return alert
    }))
  }, [currentMetrics])

  useEffect(() => {
    checkAlerts()
  }, [checkAlerts])

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'tps': return <Zap className="w-4 h-4" />
      case 'gasPrice': return <DollarSign className="w-4 h-4" />
      case 'networkHealth': return <Activity className="w-4 h-4" />
      case 'blockTime': return <Clock className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'tps': return 'TPS'
      case 'gasPrice': return 'Gas Price'
      case 'networkHealth': return 'Network Health'
      case 'blockTime': return 'Block Time'
      default: return metric
    }
  }

  const getMetricUnit = (metric: string) => {
    switch (metric) {
      case 'tps': return ''
      case 'gasPrice': return ' Gwei'
      case 'networkHealth': return '%'
      case 'blockTime': return 's'
      default: return ''
    }
  }

  const createAlert = () => {
    if (!newAlert.name || !newAlert.threshold) return

    const alert: Alert = {
      id: Date.now().toString(),
      ...newAlert,
      isActive: true,
      triggered: false,
      color: '#00d4ff'
    }

    setAlerts(prev => [...prev, alert])
    setNewAlert({ name: '', metric: 'tps', condition: 'above', threshold: 0, soundEnabled: true })
    setIsCreatingAlert(false)
  }

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive, triggered: false } : alert
    ))
  }

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }

  const activeAlerts = alerts.filter(a => a.isActive).length
  const triggeredAlerts = alerts.filter(a => a.triggered).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bell className="w-8 h-8 text-cyber-blue" />
            {triggeredAlerts > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{triggeredAlerts}</span>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white text-glow">Smart Alerts</h3>
            <p className="text-white/60 text-sm">
              {activeAlerts} active • {triggeredAlerts} triggered
            </p>
          </div>
        </div>

        <motion.button
          onClick={() => setIsCreatingAlert(true)}
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-2 bg-cyber-blue text-white px-4 py-2 rounded-lg font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>New Alert</span>
        </motion.button>
      </div>

      {/* Create Alert Modal */}
      <AnimatePresence>
        {isCreatingAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setIsCreatingAlert(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-2xl p-6 w-full max-w-md mx-4"
            >
              <h4 className="text-xl font-semibold text-white mb-4">Create New Alert</h4>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={newAlert.name}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Alert name"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50"
                />

                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={newAlert.metric}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, metric: e.target.value as any }))}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="tps">TPS</option>
                    <option value="gasPrice">Gas Price</option>
                    <option value="networkHealth">Network Health</option>
                    <option value="blockTime">Block Time</option>
                  </select>

                  <select
                    value={newAlert.condition}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, condition: e.target.value as any }))}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="above">Above</option>
                    <option value="below">Below</option>
                  </select>
                </div>

                <input
                  type="number"
                  value={newAlert.threshold}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, threshold: parseFloat(e.target.value) }))}
                  placeholder="Threshold value"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50"
                />
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={createAlert}
                  className="flex-1 bg-cyber-blue text-white py-2 rounded-lg font-medium"
                >
                  Create
                </button>
                <button
                  onClick={() => setIsCreatingAlert(false)}
                  className="flex-1 bg-white/10 text-white py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerts List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`glass-subtle rounded-xl p-4 border-l-4 ${
              alert.triggered ? 'border-red-500 bg-red-500/10' : 
              alert.isActive ? 'border-cyber-blue' : 'border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-white/10" style={{ color: alert.color }}>
                  {getMetricIcon(alert.metric)}
                </div>
                <div>
                  <h4 className="text-white font-medium">{alert.name}</h4>
                  <p className="text-white/60 text-sm">
                    {getMetricLabel(alert.metric)} {alert.condition} {alert.threshold}{getMetricUnit(alert.metric)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleAlert(alert.id)}
                  className={`p-1 rounded ${alert.isActive ? 'text-cyber-green' : 'text-white/40'}`}
                >
                  {alert.triggered ? <BellRing className="w-4 h-4 text-red-400 animate-pulse" /> : 
                   alert.condition === 'above' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="p-1 rounded text-white/40 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className={`px-2 py-1 rounded ${
                alert.isActive ? 'bg-cyber-green/20 text-cyber-green' : 'bg-white/10 text-white/60'
              }`}>
                {alert.isActive ? 'Active' : 'Inactive'}
              </span>

              {alert.triggered && (
                <span className="text-red-400 font-medium animate-pulse">TRIGGERED</span>
              )}

              <span className="text-white font-medium">
                Current: {currentMetrics[alert.metric]?.toFixed(alert.metric === 'gasPrice' ? 1 : 0)}{getMetricUnit(alert.metric)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
