import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfettiPiece {
  id: string
  x: number
  y: number
  rotation: number
  color: string
  size: number
  velocity: { x: number; y: number }
  rotationSpeed: number
}

export interface ConfettiProps {
  active: boolean
  duration?: number
  particleCount?: number
  onComplete?: () => void
}

/**
 * Confetti Component - Sistema de Diseño Unificado CCE
 *
 * Efecto de confetti para celebrar acciones exitosas.
 * Mucho más memorable que un simple toast de "éxito".
 *
 * @example
 * ```tsx
 * const [showConfetti, setShowConfetti] = useState(false)
 *
 * const handleSuccess = () => {
 *   setShowConfetti(true)
 *   // Confetti se auto-limpia después de duration
 * }
 *
 * <Confetti
 *   active={showConfetti}
 *   duration={3000}
 *   particleCount={50}
 *   onComplete={() => setShowConfetti(false)}
 * />
 * ```
 */
export const Confetti: React.FC<ConfettiProps> = ({
  active,
  duration = 3000,
  particleCount = 50,
  onComplete
}) => {
  const [particles, setParticles] = useState<ConfettiPiece[]>([])

  const colors = [
    '#FFA500', // Orange (brand)
    '#002C6F', // Blue (brand)
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#3B82F6', // Blue
  ]

  useEffect(() => {
    if (active) {
      // Generate confetti particles
      const newParticles: ConfettiPiece[] = []
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: `confetti-${i}-${Date.now()}`,
          x: Math.random() * window.innerWidth,
          y: -20,
          rotation: Math.random() * 360,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 10 + 5,
          velocity: {
            x: (Math.random() - 0.5) * 4,
            y: Math.random() * 2 + 3
          },
          rotationSpeed: (Math.random() - 0.5) * 10
        })
      }
      setParticles(newParticles)

      // Clear after duration
      const timer = setTimeout(() => {
        setParticles([])
        onComplete?.()
      }, duration)

      return () => clearTimeout(timer)
    } else {
      setParticles([])
    }
  }, [active, duration, particleCount, onComplete])

  if (!active) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              x: particle.x,
              y: particle.y,
              rotate: particle.rotation,
              opacity: 1,
              scale: 1
            }}
            animate={{
              y: window.innerHeight + 100,
              x: particle.x + particle.velocity.x * 100,
              rotate: particle.rotation + particle.rotationSpeed * 100,
              opacity: [1, 1, 0.8, 0],
              scale: [1, 1, 0.8, 0.6]
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: duration / 1000,
              ease: [0.25, 0.1, 0.25, 1]
            }}
            style={{
              position: 'absolute',
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              boxShadow: `0 2px 4px rgba(0,0,0,0.2)`
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

/**
 * useConfetti Hook
 * Easy way to trigger confetti from any component
 */
export const useConfetti = () => {
  const [isActive, setIsActive] = useState(false)

  const fire = () => {
    setIsActive(true)
  }

  const stop = () => {
    setIsActive(false)
  }

  return {
    fire,
    stop,
    isActive,
    ConfettiComponent: (
      <Confetti
        active={isActive}
        onComplete={() => setIsActive(false)}
      />
    )
  }
}
