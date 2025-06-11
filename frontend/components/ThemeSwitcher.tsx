'use client'
import { motion } from 'framer-motion'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../lib/theme'

export default function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' }
  ]

  return (
    <div className="flex items-center space-x-1 bg-white/5 dark:bg-white/5 backdrop-blur-lg rounded-lg p-1">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value as any)}
          className={`relative p-2 rounded-lg transition-all duration-200 ${
            theme === value
              ? 'bg-cyber-blue text-white shadow-lg'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
          title={label}
        >
          <Icon className="w-4 h-4" />
          {theme === value && (
            <motion.div
              layoutId="theme-indicator"
              className="absolute inset-0 bg-cyber-blue rounded-lg -z-10"
              initial={false}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      ))}
      
      {/* Current Theme Indicator */}
      <div className="ml-2 text-xs text-white/60">
        {resolvedTheme === 'dark' ? '🌙' : '☀️'}
      </div>
    </div>
  )
} 