'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Only access localStorage after component is mounted
    try {
      const savedTheme = localStorage.getItem('theme') as Theme | null
      if (savedTheme) {
        setTheme(savedTheme)
      }
    } catch (error) {
      console.warn('localStorage not available')
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    try {
      localStorage.setItem('theme', theme)
      document.documentElement.classList.toggle('dark', theme === 'dark')
    } catch (error) {
      console.warn('localStorage not available')
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div className="dark">{children}</div>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Theme configurations
export const themes = {
  dark: {
    name: 'Dark',
    background: 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900',
    glass: 'backdrop-blur-lg bg-white/10 border border-white/20',
    glassStrong: 'backdrop-blur-xl bg-white/20 border border-white/30',
    text: {
      primary: 'text-white',
      secondary: 'text-white/70',
      muted: 'text-white/50'
    },
    colors: {
      primary: '#00d4ff',
      secondary: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      accent: '#ec4899'
    }
  },
  light: {
    name: 'Light',
    background: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
    glass: 'backdrop-blur-lg bg-black/5 border border-black/10',
    glassStrong: 'backdrop-blur-xl bg-black/10 border border-black/20',
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-700',
      muted: 'text-gray-500'
    },
    colors: {
      primary: '#0ea5e9',
      secondary: '#8b5cf6',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      accent: '#db2777'
    }
  }
}

export function getThemeClasses(resolvedTheme: 'dark' | 'light') {
  return themes[resolvedTheme]
} 