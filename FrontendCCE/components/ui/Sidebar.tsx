'use client'

import { useState } from 'react'
import { useAppStore } from '../../lib/store'
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  UserPlus, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navigationItems = [
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
    description: 'Gestión de miembros'
  },
  {
    id: 'payments',
    label: 'Estado de Pagos',
    icon: CreditCard,
    description: 'Control de cuotas'
  },
  {
    id: 'registration',
    label: 'Inscripción',
    icon: UserPlus,
    description: 'Nuevos registros'
  }
]

export default function Sidebar() {
  const { 
    sidebarCollapsed, 
    toggleSidebar, 
    currentPage, 
    setCurrentPage 
  } = useAppStore()

  return (
         <motion.div
       initial={{ x: -300 }}
       animate={{ x: 0 }}
       className={`fixed left-0 top-0 h-full bg-white/90 backdrop-blur-md border-r border-white/30 shadow-glass z-50 transition-all duration-300 ${
         sidebarCollapsed ? 'w-16 sm:w-20' : 'w-64'
       }`}
     >
             {/* Header */}
       <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/30">
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
                         <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
               <span className="text-white font-bold text-xs">CCE</span>
             </div>
             <div>
               <h1 className="font-bold text-primary text-sm">Club Espora</h1>
               <p className="text-xs text-gray-500">Dashboard</p>
             </div>
          </motion.div>
        )}
        
                 <button
           onClick={toggleSidebar}
           className="p-1.5 sm:p-2 rounded-lg hover:bg-white/50 transition-colors"
         >
           {sidebarCollapsed ? <ChevronRight size={16} className="sm:w-5 sm:h-5" /> : <ChevronLeft size={16} className="sm:w-5 sm:h-5" />}
         </button>
      </div>

             {/* Navigation */}
       <nav className="p-3 sm:p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-gray-700 hover:bg-white/50 hover:text-primary'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon size={20} />
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-left"
                >
                  <div className="font-medium">{item.label}</div>
                  <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
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
           className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 p-3 sm:p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-white/30"
         >
          <div className="text-center">
            <p className="text-xs text-gray-600 font-medium">Club Comandante Espora</p>
            <p className="text-xs text-gray-500">Sistema de Gestión</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
