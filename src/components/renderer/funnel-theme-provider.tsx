'use client'

import React, { useEffect } from 'react'

interface ThemeConfig {
  primaryColor?: string
  backgroundColor?: string
  textColor?: string
  fontFamily?: string
  borderRadius?: number
  mode?: 'light' | 'dark'
}

export function FunnelThemeProvider({ 
  theme, 
  children 
}: { 
  theme: ThemeConfig | null
  children: React.ReactNode 
}) {
  useEffect(() => {
    if (!theme) return

    const root = document.documentElement

    if (theme.primaryColor) {
      root.style.setProperty('--color-primary', theme.primaryColor)
      // Calculate a slightly darker/lighter version for hover states could be done here
    }

    if (theme.backgroundColor) {
      root.style.setProperty('background-color', theme.backgroundColor)
    }

    if (theme.textColor) {
      root.style.setProperty('color', theme.textColor)
    }

    if (theme.fontFamily) {
      // Use standard fonts from CSS or Google Fonts
      root.style.setProperty('font-family', `"${theme.fontFamily}", system-ui, sans-serif`)
    }

    if (theme.borderRadius !== undefined) {
      root.style.setProperty('--radius-base', `${theme.borderRadius}px`)
    }

  }, [theme])

  return (
    <div className={`min-h-screen ${theme?.mode === 'dark' ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {children}
    </div>
  )
}
