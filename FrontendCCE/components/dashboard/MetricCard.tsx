'use client'

import { motion } from 'framer-motion'
import React from 'react'
import { cn } from '../../lib/utils'
import { AnimatedCounter } from '@/components/ui'

interface MetricCardProps {
  title: string
  value: number
  icon: React.ComponentType<{ size?: number | string; className?: string }>
  color: string
  change: string
  changeType: 'positive' | 'negative'
  delay?: number
}

/**
 * MetricCard Component - Sistema de Diseño Unificado CCE
 *
 * Card de métricas mejorada con AnimatedCounter premium.
 * Usa Framer Motion spring para animaciones más suaves.
 */
export default function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  change,
  changeType,
  delay = 0
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -8, scale: 1.03 }}
      className="glass-card glass-card-hover p-4 text-center group cursor-pointer"
    >
      {/* Icon */}
      <div className={cn(
        "w-10 h-10 rounded-xl bg-gradient-to-br mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg",
        color
      )}>
        <Icon size={16} className="text-white" />
      </div>

      {/* Value with AnimatedCounter */}
      <AnimatedCounter
        value={value}
        duration={2}
        delay={delay}
        formatValue={(v) => Math.floor(v).toLocaleString()}
        className="text-2xl font-bold text-gray-800 dark:text-gray-200 block mb-2"
      />

      {/* Title */}
      <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
        {title}
      </h3>

      {/* Change indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay + 0.5 }}
        className={cn(
          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm",
          changeType === 'positive'
            ? 'bg-green-100/80 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200/50 dark:border-green-800/50'
            : 'bg-red-100/80 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-800/50'
        )}
      >
        <span>{changeType === 'positive' ? '↑' : '↓'}</span>
        {change}
      </motion.div>
    </motion.div>
  )
}
