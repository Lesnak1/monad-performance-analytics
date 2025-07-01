'use client'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../lib/theme'

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex items-center space-x-1 bg-white/5 backdrop-blur-lg rounded-lg p-1">
      <button
        onClick={toggleTheme}
        className={`relative p-2 rounded-lg transition-all duration-200 ${
          theme === 'light'
            ? 'bg-cyber-blue text-white shadow-lg'
            : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
        title="Light Mode"
      >
        <Sun className="w-4 h-4" />
        {theme === 'light' && (
          <motion.div
            layoutId="theme-indicator"
            className="absolute inset-0 bg-cyber-blue rounded-lg -z-10"
            initial={false}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
      </button>

      <button
        onClick={toggleTheme}
        className={`relative p-2 rounded-lg transition-all duration-200 ${
          theme === 'dark'
            ? 'bg-cyber-blue text-white shadow-lg'
            : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
        title="Dark Mode"
      >
        <Moon className="w-4 h-4" />
        {theme === 'dark' && (
          <motion.div
            layoutId="theme-indicator"
            className="absolute inset-0 bg-cyber-blue rounded-lg -z-10"
            initial={false}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
      </button>
      
      {/* Current Theme Indicator */}
      <div className="ml-2 text-xs text-white/60">
        {theme === 'dark' ? '🌙' : '☀️'}
      </div>
    </div>
  )
} 