import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, LucideIcon } from 'lucide-react'

export interface FloatingAction {
  id: string
  label: string
  icon: LucideIcon
  onClick: () => void
  color?: string
}

export interface FloatingButtonProps {
  actions: FloatingAction[]
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  mainColor?: string
}

/**
 * FloatingButton Component - Sistema de Diseño Unificado CCE
 *
 * Floating Action Button con menú radial expansible.
 * Perfecto para acciones principales accesibles desde cualquier lugar.
 *
 * @example
 * ```tsx
 * <FloatingButton
 *   position="bottom-right"
 *   actions={[
 *     {
 *       id: 'new-member',
 *       label: 'Nuevo Socio',
 *       icon: UserPlus,
 *       onClick: () => navigate('/members/new')
 *     },
 *     {
 *       id: 'new-payment',
 *       label: 'Registrar Pago',
 *       icon: DollarSign,
 *       onClick: () => navigate('/payments/new')
 *     }
 *   ]}
 * />
 * ```
 */
export const FloatingButton: React.FC<FloatingButtonProps> = ({
  actions,
  position = 'bottom-right',
  mainColor = 'bg-orange-500 hover:bg-orange-600'
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  }

  const getActionPosition = (index: number, total: number) => {
    const angle = (index * 360) / total - 90 // Start from top
    const radius = 80
    const x = Math.cos((angle * Math.PI) / 180) * radius
    const y = Math.sin((angle * Math.PI) / 180) * radius
    return { x, y }
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-40`}>
      {/* Action Buttons */}
      <AnimatePresence>
        {isOpen &&
          actions.map((action, index) => {
            const Icon = action.icon
            const { x, y } = getActionPosition(index, actions.length)

            return (
              <motion.button
                key={action.id}
                initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                animate={{ scale: 1, x, y, opacity: 1 }}
                exit={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                  delay: index * 0.05
                }}
                onClick={() => {
                  action.onClick()
                  setIsOpen(false)
                }}
                className={`absolute bottom-0 right-0 w-12 h-12 ${
                  action.color || 'bg-blue-500 hover:bg-blue-600'
                } text-white rounded-full shadow-lg flex items-center justify-center transition-colors group`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={20} />

                {/* Label tooltip */}
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                >
                  {action.label}
                  <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                </motion.div>
              </motion.button>
            )
          })}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 ${mainColor} text-white rounded-full shadow-xl flex items-center justify-center relative z-10`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X size={24} /> : <Plus size={24} />}
        </motion.div>
      </motion.button>

      {/* Backdrop blur when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 -z-10"
            style={{ backdropFilter: 'blur(2px)' }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
