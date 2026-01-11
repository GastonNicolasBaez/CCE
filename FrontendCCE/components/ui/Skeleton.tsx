import React from 'react'
import { motion } from 'framer-motion'

export interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  animation?: 'pulse' | 'wave' | 'shimmer'
  lines?: number
  height?: string | number
  width?: string | number
}

/**
 * Skeleton Loader Component - Sistema de Diseño Unificado CCE
 *
 * Skeleton loaders con efectos de shimmer más elegantes que spinners genéricos.
 * Mejora la percepción de velocidad de carga.
 *
 * @example
 * ```tsx
 * // Loading card con shimmer
 * <Skeleton variant="card" animation="shimmer" />
 *
 * // Loading text lines
 * <Skeleton variant="text" lines={3} animation="wave" />
 * ```
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  animation = 'shimmer',
  lines = 1,
  height,
  width
}) => {
  const baseStyles = 'bg-gray-200 dark:bg-gray-700 rounded overflow-hidden relative'

  const variantStyles = {
    text: 'h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'h-48 w-full rounded-2xl'
  }

  const renderSkeleton = (index?: number) => {
    const styles = `${baseStyles} ${variantStyles[variant]} ${className}`
    const style: React.CSSProperties = {}

    if (height) style.height = typeof height === 'number' ? `${height}px` : height
    if (width) style.width = typeof width === 'number' ? `${width}px` : width

    // Shimmer effect (lo más premium)
    if (animation === 'shimmer') {
      return (
        <div key={index} className={styles} style={style}>
          <motion.div
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent"
            animate={{
              translateX: ['100%', '100%', '-100%', '-100%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
              times: [0, 0.1, 0.9, 1]
            }}
          />
        </div>
      )
    }

    // Wave effect
    if (animation === 'wave') {
      return (
        <motion.div
          key={index}
          className={styles}
          style={style}
          animate={{
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index ? index * 0.1 : 0
          }}
        />
      )
    }

    // Pulse effect
    return (
      <motion.div
        key={index}
        className={styles}
        style={style}
        animate={{
          scale: [1, 1.02, 1]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    )
  }

  // Multiple lines for text variant
  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === lines - 1 ? '70%' : '100%'
            }}
          >
            {renderSkeleton(i)}
          </div>
        ))}
      </div>
    )
  }

  return renderSkeleton()
}

/**
 * SkeletonCard Component
 * Pre-built skeleton for card layouts
 */
export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/30 dark:border-gray-600/30 shadow-2xl rounded-2xl p-6">
      <div className="flex items-start gap-4 mb-4">
        <Skeleton variant="circular" width={48} height={48} animation="shimmer" />
        <div className="flex-1">
          <Skeleton variant="text" width="60%" height={20} animation="shimmer" />
          <div className="mt-2">
            <Skeleton variant="text" width="40%" height={16} animation="shimmer" />
          </div>
        </div>
      </div>
      <Skeleton variant="text" lines={3} animation="shimmer" />
      <div className="mt-4 flex gap-2">
        <Skeleton variant="rectangular" width={100} height={36} animation="shimmer" />
        <Skeleton variant="rectangular" width={100} height={36} animation="shimmer" />
      </div>
    </div>
  )
}

/**
 * SkeletonTable Component
 * Pre-built skeleton for table layouts
 */
export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 4
}) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant="text" height={16} animation="shimmer" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              variant="text"
              height={20}
              animation="shimmer"
            />
          ))}
        </div>
      ))}
    </div>
  )
}
