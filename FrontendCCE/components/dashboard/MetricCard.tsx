'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface MetricCardProps {
  title: string
  value: number
  icon: LucideIcon
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
      whileHover={{ y: -8, scale: 1.03 }}
      className="glass-card glass-card-hover p-6 text-center group cursor-pointer"
    >
      {/* Icon */}
      <div className={cn(
        "w-12 h-12 rounded-2xl bg-gradient-to-br mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg",
        color
      )}>
        <Icon size={20} className="text-white" />
      </div>

      {/* Value */}
      <motion.div
        key={displayValue}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        className="text-3xl font-bold text-gray-800 mb-2"
      >
        {displayValue.toLocaleString()}
      </motion.div>

      {/* Title */}
      <h3 className="text-sm font-medium text-gray-600 mb-3">
        {title}
      </h3>

      {/* Change indicator */}
      <div className={cn(
        "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm",
        changeType === 'positive' 
          ? 'bg-green-100/80 text-green-700 border border-green-200/50' 
          : 'bg-red-100/80 text-red-700 border border-red-200/50'
      )}>
        <span className={cn(
          "w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent",
          changeType === 'positive' 
            ? 'border-b-green-700' 
            : 'border-t-red-700'
        )}></span>
        {change}
      </div>
    </motion.div>
  )
}
