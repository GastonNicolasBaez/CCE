'use client'

import { useState } from 'react'
import { useAppStore } from '../../lib/store'
import { Menu, Bell, User, Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className={`fixed top-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-white/30 shadow-glass transition-all duration-300 ${
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
          <div className="hidden sm:flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl px-2 sm:px-3 py-1.5 sm:py-2">
            <Search size={14} className="sm:w-4 sm:h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar socios, actividades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-xs sm:text-sm text-gray-700 placeholder-gray-400 w-48 sm:w-64"
            />
          </div>
        </div>

        {/* Right side - User menu and notifications */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-white/50 transition-colors">
            <Bell size={20} className="text-gray-600" />
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
        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Buscar socios, actividades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 flex-1"
          />
        </div>
      </div>
    </header>
  )
}
