'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'dark' | 'light'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    // Load theme from localStorage
    const stored = localStorage.getItem('mpas-theme') as Theme
    if (stored) {
      setTheme(stored)
    }
  }, [])

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('mpas-theme', theme)

    // Resolve system theme
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      setResolvedTheme(systemTheme)
    } else {
      setResolvedTheme(theme)
    }
  }, [theme])

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(resolvedTheme)
  }, [resolvedTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
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