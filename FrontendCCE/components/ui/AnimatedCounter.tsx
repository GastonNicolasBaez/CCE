import React, { useEffect, useRef, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

export interface AnimatedCounterProps {
  value: number
  duration?: number
  delay?: number
  formatValue?: (value: number) => string
  className?: string
  prefix?: string
  suffix?: string
  decimals?: number
}

/**
 * AnimatedCounter Component - Sistema de Diseño Unificado CCE
 *
 * Contador animado con efecto count-up para métricas y estadísticas.
 * Mucho más dinámico y atractivo que números estáticos.
 *
 * @example
 * ```tsx
 * // Simple counter
 * <AnimatedCounter value={1234} />
 *
 * // Currency with formatting
 * <AnimatedCounter
 *   value={45678.50}
 *   prefix="$"
 *   decimals={2}
 *   formatValue={(v) => v.toLocaleString('es-AR')}
 * />
 *
 * // Percentage
 * <AnimatedCounter value={87.5} suffix="%" decimals={1} />
 * ```
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2,
  delay = 0,
  formatValue,
  className = '',
  prefix = '',
  suffix = '',
  decimals = 0
}) => {
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  // Spring animation for smooth counting
  const spring = useSpring(0, {
    mass: 0.8,
    stiffness: 75,
    damping: 15
  })

  const display = useTransform(spring, (current) => {
    const formatted = current.toFixed(decimals)
    if (formatValue) {
      return `${prefix}${formatValue(parseFloat(formatted))}${suffix}`
    }
    return `${prefix}${formatted}${suffix}`
  })

  useEffect(() => {
    if (!hasAnimated && ref.current) {
      // Use Intersection Observer to animate when in viewport
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setHasAnimated(true)
            setTimeout(() => {
              spring.set(value)
            }, delay * 1000)
          }
        },
        { threshold: 0.1 }
      )

      observer.observe(ref.current)

      return () => observer.disconnect()
    }
  }, [hasAnimated, value, spring, delay])

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <motion.span>{display}</motion.span>
    </motion.span>
  )
}

/**
 * CountUpCard Component
 * Pre-built metric card with count-up animation
 */
export interface CountUpCardProps {
  value: number
  label: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  formatValue?: (value: number) => string
  prefix?: string
  suffix?: string
  decimals?: number
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange'
}

export const CountUpCard: React.FC<CountUpCardProps> = ({
  value,
  label,
  icon,
  trend,
  formatValue,
  prefix,
  suffix,
  decimals = 0,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      whileHover={{ y: -8, scale: 1.03 }}
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/30 dark:border-gray-600/30 shadow-2xl rounded-2xl p-6 text-center transition-all duration-300"
    >
      {icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}
        >
          {icon}
        </motion.div>
      )}

      <AnimatedCounter
        value={value}
        duration={2}
        delay={0.3}
        formatValue={formatValue}
        prefix={prefix}
        suffix={suffix}
        decimals={decimals}
        className="text-3xl font-bold text-gray-800 dark:text-gray-200 block mb-2"
      />

      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
        {label}
      </p>

      {trend && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend.isPositive
              ? 'bg-green-100/80 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-red-100/80 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          }`}
        >
          <span>{trend.isPositive ? '↑' : '↓'}</span>
          <span>{Math.abs(trend.value)}%</span>
        </motion.div>
      )}
    </motion.div>
  )
}
