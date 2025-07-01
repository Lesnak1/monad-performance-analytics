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

// SSR-SAFE useTheme hook - returns default values if no provider
export function useTheme() {
  const context = useContext(ThemeContext)
  
  // SSR-safe: Return default values if no ThemeProvider (during SSR)
  if (context === undefined) {
    if (typeof window === 'undefined') {
      // Server-side: return safe defaults
      return {
        theme: 'dark' as Theme,
        toggleTheme: () => {}
      }
    }
    // Client-side: still throw error for development
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  
  return context
} 