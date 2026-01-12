'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import React from 'react'
import { cn } from '../../lib/utils'

interface MetricCardProps {
  title: string
  value: number
  icon: React.ComponentType<{ size?: number | string; className?: string }>
  color: string
  change: string
  changeType: 'positive' | 'negative'
  delay?: number
}

export default function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  change,
  changeType,
  delay = 0
}: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0
      const increment = value / 50
      const counter = setInterval(() => {
        start += increment
        if (start >= value) {
          setDisplayValue(value)
          clearInterval(counter)
        } else {
          setDisplayValue(Math.floor(start))
        }
      }, 20)
    }, delay * 1000)

    return () => clearTimeout(timer)
  }, [value, delay])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      className="metric-card-fintech"
    >
      {/* Label (moved to top for fintech hierarchy) */}
      <h3 className="metric-label-fintech">
        {title}
      </h3>

      {/* Value */}
      <motion.div
        key={displayValue}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        className="metric-value-fintech"
      >
        {displayValue.toLocaleString()}
      </motion.div>

      {/* Change indicator */}
      <div className={cn(
        "flex items-center gap-1",
        changeType === 'positive'
          ? 'metric-change-positive'
          : 'metric-change-negative'
      )}>
        <span>{changeType === 'positive' ? '▲' : '▼'}</span>
        <span>{change} vs mes anterior</span>
      </div>
    </motion.div>
  )
}
