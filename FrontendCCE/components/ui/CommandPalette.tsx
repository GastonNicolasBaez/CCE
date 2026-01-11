import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Command, ArrowRight, LucideIcon } from 'lucide-react'
import { Card } from './Card'

export interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: LucideIcon
  keywords?: string[]
  onSelect: () => void
  shortcut?: string
}

export interface CommandPaletteProps {
  items: CommandItem[]
  isOpen: boolean
  onClose: () => void
  placeholder?: string
}

/**
 * CommandPalette Component - Sistema de Diseño Unificado CCE
 *
 * Command Palette estilo Cmd+K para búsqueda rápida y navegación.
 * Mucho más moderno y eficiente que menús tradicionales.
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false)
 *
 * // Listen for Cmd+K
 * useEffect(() => {
 *   const down = (e: KeyboardEvent) => {
 *     if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
 *       e.preventDefault()
 *       setIsOpen(true)
 *     }
 *   }
 *   document.addEventListener('keydown', down)
 *   return () => document.removeEventListener('keydown', down)
 * }, [])
 *
 * <CommandPalette
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   items={commands}
 * />
 * ```
 */
export const CommandPalette: React.FC<CommandPaletteProps> = ({
  items,
  isOpen,
  onClose,
  placeholder = 'Buscar acciones...'
}) => {
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const filteredItems = items.filter((item) => {
    const searchLower = search.toLowerCase()
    return (
      item.label.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.keywords?.some((k) => k.toLowerCase().includes(searchLower))
    )
  })

  // Reset search when opened
  useEffect(() => {
    if (isOpen) {
      setSearch('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((i) => (i + 1) % filteredItems.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((i) => (i - 1 + filteredItems.length) % filteredItems.length)
          break
        case 'Enter':
          e.preventDefault()
          if (filteredItems[selectedIndex]) {
            filteredItems[selectedIndex].onSelect()
            onClose()
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredItems, selectedIndex, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh]"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl mx-4"
        >
          <Card variant="glass" padding="none" className="overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center gap-3 p-4 border-b border-white/20 dark:border-gray-600/20">
              <Search size={20} className="text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setSelectedIndex(0)
                }}
                placeholder={placeholder}
                className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
                autoFocus
              />
              <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">
                <Command size={12} />K
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[400px] overflow-y-auto">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <p>No se encontraron resultados</p>
                </div>
              ) : (
                <div className="p-2">
                  {filteredItems.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => {
                          item.onSelect()
                          onClose()
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          selectedIndex === index
                            ? 'bg-orange-500 text-white'
                            : 'hover:bg-white/30 dark:hover:bg-gray-700/30 text-gray-900 dark:text-gray-100'
                        }`}
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.15 }}
                      >
                        {Icon && (
                          <Icon
                            size={20}
                            className={selectedIndex === index ? 'text-white' : 'text-gray-400'}
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{item.label}</p>
                          {item.description && (
                            <p
                              className={`text-sm ${
                                selectedIndex === index
                                  ? 'text-white/80'
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              {item.description}
                            </p>
                          )}
                        </div>
                        {item.shortcut && (
                          <kbd
                            className={`px-2 py-1 text-xs rounded ${
                              selectedIndex === index
                                ? 'bg-white/20 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {item.shortcut}
                          </kbd>
                        )}
                        {selectedIndex === index && (
                          <ArrowRight size={16} className="text-white" />
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/20 dark:border-gray-600/20 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">↑↓</kbd>
                  Navegar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">↵</kbd>
                  Seleccionar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">Esc</kbd>
                  Cerrar
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * useCommandPalette Hook
 * Easy way to setup command palette with Cmd+K shortcut
 */
export const useCommandPalette = (items: CommandItem[]) => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((o) => !o),
    CommandPaletteComponent: (
      <CommandPalette
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={items}
      />
    )
  }
}
