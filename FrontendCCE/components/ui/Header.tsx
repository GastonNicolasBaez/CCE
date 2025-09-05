'use client'

import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '../../lib/store'
import { Menu, Bell, User, Search, X, Moon, Sun, Users, LayoutDashboard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header() {
  const { 
    sidebarCollapsed, 
    setSidebarCollapsed,
    darkMode, 
    toggleDarkMode,
    setCurrentPage
  } = useAppStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [globalSearchQuery, setGlobalSearchQuery] = useState('')
  const [globalSearchResults, setGlobalSearchResults] = useState<any[]>([])
  const searchRef = useRef<HTMLDivElement>(null)

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed)
  
  const performGlobalSearch = (query: string) => {
    // TODO: Implement actual search functionality
    console.log('Searching for:', query)
    setGlobalSearchResults([])
  }
  
  const clearSearch = () => {
    setGlobalSearchQuery('')
    setGlobalSearchResults([])
    setShowSearchResults(false)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchChange = (value: string) => {
    setGlobalSearchQuery(value)
    if (value.trim()) {
      performGlobalSearch(value.trim())
      setShowSearchResults(true)
    } else {
      clearSearch()
      setShowSearchResults(false)
    }
  }

  const handleResultClick = (result: { type: string; id: string }) => {
    if (result.type === 'section') {
      setCurrentPage(result.id)
    } else if (result.type === 'member') {
      setCurrentPage('members')
    }
    setShowSearchResults(false)
    clearSearch()
  }

  const getResultIcon = (result: { type: string }) => {
    if (result.type === 'section') {
      return <LayoutDashboard size={16} className="text-blue-500" />
    } else {
      return <Users size={16} className="text-green-500" />
    }
  }

  return (
    <header className={`fixed top-0 right-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-white/30 dark:border-gray-700/30 shadow-glass transition-all duration-300 ${
      sidebarCollapsed ? 'left-16 sm:left-20' : 'left-64'
    }`}>
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
        {/* Left side - Mobile menu button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleSidebar}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-white/50 transition-colors lg:hidden"
          >
            <Menu size={18} className="sm:w-5 sm:h-5" />
          </button>
          
          {/* Search bar */}
          <div ref={searchRef} className="hidden sm:flex relative">
            <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 rounded-xl px-2 sm:px-3 py-1.5 sm:py-2">
              <Search size={14} className="sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Buscar socios, secciones..."
                value={globalSearchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="bg-transparent outline-none text-xs sm:text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 w-48 sm:w-64"
                suppressHydrationWarning
              />
              {globalSearchQuery && (
                <button
                  onClick={() => {
                    clearSearch()
                    setShowSearchResults(false)
                  }}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            
            {/* Search Results */}
            <AnimatePresence>
              {showSearchResults && globalSearchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-xl shadow-glass max-h-64 overflow-y-auto"
                >
                  <div className="p-2">
                    {globalSearchResults.map((result, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleResultClick(result)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors text-left"
                      >
                        {getResultIcon(result)}
                        <div className="flex-1">
                          <div className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                            {result.type === 'section' ? result.name : result.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {result.type === 'section' ? result.description : result.email}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {result.type === 'section' ? 'Sección' : 'Socio'}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right side - User menu and notifications */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            {darkMode ? (
              <Sun size={20} className="text-yellow-500" />
            ) : (
              <Moon size={20} className="text-gray-600" />
            )}
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors">
            <Bell size={20} className="text-gray-600 dark:text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                Administrador
              </span>
            </button>

            {/* Dropdown menu */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-md border border-white/30 rounded-xl shadow-glass py-2"
                >
                  <div className="px-4 py-2 border-b border-white/30">
                    <p className="text-sm font-medium text-gray-700">Administrador</p>
                    <p className="text-xs text-gray-500">admin@clubespora.com</p>
                  </div>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-white/50 transition-colors">
                    Configuración
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-white/50 transition-colors">
                    Cerrar Sesión
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Buscar socios, secciones..."
              value={globalSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 flex-1"
              suppressHydrationWarning
            />
            {globalSearchQuery && (
              <button
                onClick={() => {
                  clearSearch()
                  setShowSearchResults(false)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          {/* Mobile Search Results */}
          <AnimatePresence>
            {showSearchResults && globalSearchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-2 w-full bg-white/95 backdrop-blur-md border border-white/30 rounded-xl shadow-glass max-h-64 overflow-y-auto z-50"
              >
                <div className="p-2">
                  {globalSearchResults.map((result, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleResultClick(result)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white/50 rounded-lg transition-colors text-left"
                    >
                      {getResultIcon(result)}
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 text-sm">
                          {result.type === 'section' ? result.name : result.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {result.type === 'section' ? result.description : result.email}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        {result.type === 'section' ? 'Sección' : 'Socio'}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
