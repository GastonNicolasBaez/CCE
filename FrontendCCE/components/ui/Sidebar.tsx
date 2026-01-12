'use client'

import React, { useMemo } from 'react'
import { useAppStore } from '../../lib/store'
import { useRole } from '../../lib/hooks'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  UserPlus,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3
} from 'lucide-react'
import { motion } from 'framer-motion'

interface NavigationItem {
  id: string
  label: string
  icon: React.ElementType
  description: string
  requiredPermission?: string // Permission required to see this item
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Panel de Control',
    icon: LayoutDashboard,
    description: 'Vista general del club'
  },
  {
    id: 'members',
    label: 'Socios y Jugadores',
    icon: Users,
    description: 'Gestión de miembros',
    requiredPermission: 'socios'
  },
  {
    id: 'activities',
    label: 'Actividades',
    icon: Activity,
    description: 'Deportes y precios',
    requiredPermission: 'actividades'
  },
  {
    id: 'payments',
    label: 'Estado de Pagos',
    icon: CreditCard,
    description: 'Control de cuotas',
    requiredPermission: 'cuotas'
  },
  {
    id: 'estadisticas',
    label: 'Estadísticas',
    icon: BarChart3,
    description: 'Análisis y métricas',
    requiredPermission: 'estadisticas'
  },
  {
    id: 'registration',
    label: 'Inscripción',
    icon: UserPlus,
    description: 'Nuevos registros',
    requiredPermission: 'socios'
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    icon: Settings,
    description: 'Ajustes del club',
    requiredPermission: 'configuracion' // Only admin
  }
]

export default function Sidebar() {
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    currentPage,
    setCurrentPage
  } = useAppStore()

  const { hasPermission, getRoleDisplayName } = useRole()

  // Filter navigation items based on user permissions
  const visibleNavigationItems = useMemo(() => {
    return navigationItems.filter((item) => {
      // If no permission required, show to everyone
      if (!item.requiredPermission) return true

      // Check if user has the required permission
      return hasPermission(item.requiredPermission)
    })
  }, [hasPermission])

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed)

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className={`fixed left-0 top-0 h-full bg-bg-secondary border-r border-border z-50 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16 sm:w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border">
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-accent-primary rounded-sharp flex items-center justify-center shadow-glow-primary">
              <span className="text-black font-bold text-xs">CCE</span>
            </div>
            <div>
              <h1 className="font-bold text-text-primary text-sm">Club Espora</h1>
              <p className="text-xs text-text-tertiary uppercase tracking-wide">Dashboard</p>
            </div>
          </motion.div>
        )}

        <button
          onClick={toggleSidebar}
          className="p-1.5 sm:p-2 rounded-sharp hover:bg-surface-hover transition-colors text-text-secondary hover:text-text-primary"
        >
          {sidebarCollapsed ? <ChevronRight size={16} className="sm:w-5 sm:h-5" /> : <ChevronLeft size={16} className="sm:w-5 sm:h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 sm:p-4 space-y-2">
        {visibleNavigationItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id

          return (
            <motion.button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full sidebar-item-fintech ${isActive ? '!bg-accent-primary !text-black !font-semibold !shadow-glow-primary' : ''}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon size={20} />
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-left flex-1"
                >
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className={`text-xs ${isActive ? 'text-black/70' : 'text-text-tertiary'}`}>
                    {item.description}
                  </div>
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* Footer */}
      {!sidebarCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 p-3 sm:p-4 bg-surface border border-border rounded-sharp"
        >
          <div className="text-center">
            <p className="text-xs text-text-secondary font-medium">Club Comandante Espora</p>
            <p className="text-xs text-text-tertiary">Sistema de Gestión</p>
            <div className="mt-2 pt-2 border-t border-border">
              <p className="text-xs text-accent-primary font-semibold">{getRoleDisplayName()}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
