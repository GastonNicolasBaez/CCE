'use client'

import { useEffect } from 'react'
import { useAppStore } from '../lib/store'

export default function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const { darkMode } = useAppStore()

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('darkMode', 'true')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('darkMode', 'false')
    }
  }, [darkMode])

  useEffect(() => {
    // Load dark mode from localStorage on mount
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    if (savedDarkMode !== darkMode) {
      useAppStore.getState().toggleDarkMode()
    }
  }, [darkMode])

  return <>{children}</>
}
