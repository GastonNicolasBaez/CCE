import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { Button } from './Button'

export interface EmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  illustration?: 'inbox' | 'search' | 'folder' | 'data' | 'custom'
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  customIllustration?: React.ReactNode
}

/**
 * EmptyState Component - Sistema de Diseño Unificado CCE
 *
 * Estados vacíos con ilustraciones SVG inline más amigables que solo íconos.
 * Crea una mejor primera impresión y guía al usuario.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   illustration="inbox"
 *   title="No hay actividades"
 *   description="Comienza creando tu primera actividad deportiva"
 *   actionLabel="Nueva Actividad"
 *   onAction={handleCreate}
 * />
 * ```
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon,
  illustration = 'inbox',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  customIllustration
}) => {
  const illustrations = {
    inbox: (
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto mb-6"
      >
        <motion.rect
          x="40"
          y="60"
          width="120"
          height="80"
          rx="8"
          className="fill-orange-100 dark:fill-orange-900/20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.path
          d="M40 85 L100 115 L160 85"
          className="stroke-orange-500 dark:stroke-orange-400"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
        <motion.circle
          cx="100"
          cy="40"
          r="6"
          className="fill-blue-500"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.4, delay: 0.8 }}
        />
      </svg>
    ),
    search: (
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto mb-6"
      >
        <motion.circle
          cx="85"
          cy="85"
          r="40"
          className="stroke-gray-300 dark:stroke-gray-600"
          strokeWidth="6"
          fill="none"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.line
          x1="115"
          y1="115"
          x2="145"
          y2="145"
          className="stroke-gray-300 dark:stroke-gray-600"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        />
        <motion.text
          x="85"
          y="95"
          textAnchor="middle"
          className="fill-gray-400 dark:fill-gray-500 text-4xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          ?
        </motion.text>
      </svg>
    ),
    folder: (
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto mb-6"
      >
        <motion.path
          d="M40 70 L80 70 L90 60 L160 60 L160 140 L40 140 Z"
          className="fill-blue-100 dark:fill-blue-900/20 stroke-blue-500 dark:stroke-blue-400"
          strokeWidth="2"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.line
          x1="70"
          y1="95"
          x2="130"
          y2="95"
          className="stroke-blue-300 dark:stroke-blue-600"
          strokeWidth="2"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        />
        <motion.line
          x1="70"
          y1="110"
          x2="110"
          y2="110"
          className="stroke-blue-300 dark:stroke-blue-600"
          strokeWidth="2"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        />
      </svg>
    ),
    data: (
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto mb-6"
      >
        <motion.rect
          x="50"
          y="120"
          width="20"
          height="40"
          rx="4"
          className="fill-orange-200 dark:fill-orange-900/30"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ transformOrigin: 'bottom' }}
        />
        <motion.rect
          x="90"
          y="90"
          width="20"
          height="70"
          rx="4"
          className="fill-orange-400 dark:fill-orange-700/50"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{ transformOrigin: 'bottom' }}
        />
        <motion.rect
          x="130"
          y="70"
          width="20"
          height="90"
          rx="4"
          className="fill-orange-500 dark:fill-orange-600"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          style={{ transformOrigin: 'bottom' }}
        />
      </svg>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-12 px-4"
    >
      {customIllustration || illustrations[illustration]}

      {Icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="flex justify-center mb-4"
        >
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Icon size={32} className="text-gray-400 dark:text-gray-600" />
          </div>
        </motion.div>
      )}

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2"
      >
        {title}
      </motion.h3>

      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6"
        >
          {description}
        </motion.p>
      )}

      {(actionLabel || secondaryActionLabel) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-3"
        >
          {actionLabel && onAction && (
            <Button variant="accent" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="secondary" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
