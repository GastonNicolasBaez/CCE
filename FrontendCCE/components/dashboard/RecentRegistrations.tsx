'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, User, Calendar, Activity } from 'lucide-react'
import { useAppStore } from '../../lib/store'
import { getActivityLabel, formatDate } from '../../lib/utils'

export default function RecentRegistrations() {
  const { members } = useAppStore()
  const [currentIndex, setCurrentIndex] = useState(0)

  // Obtener las 5 inscripciones más recientes
  const recentMembers = members
    .sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())
    .slice(0, 5)

  useEffect(() => {
    if (recentMembers.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % recentMembers.length)
      }, 4000)
      return () => clearInterval(timer)
    }
  }, [recentMembers.length])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % recentMembers.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + recentMembers.length) % recentMembers.length)
  }

  if (recentMembers.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="glass-card glass-card-hover p-6 text-center h-full flex flex-col justify-center"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Inscripciones Recientes
        </h3>
        <div className="text-gray-500">
          <User size={48} className="mx-auto mb-3 text-gray-300" />
          <p>No hay inscripciones recientes</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="glass-card glass-card-hover p-6 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Inscripciones Recientes
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            className="p-2 rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-110"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextSlide}
            className="p-2 rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-110"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative flex-1 overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {recentMembers[currentIndex] && (
              <div className="h-full bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <User size={24} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-base">
                      {recentMembers[currentIndex].name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {recentMembers[currentIndex].email}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Activity size={16} className="text-blue-600" />
                    <span className="text-gray-700 font-medium">
                      {getActivityLabel(recentMembers[currentIndex].activity)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar size={16} className="text-orange-500" />
                    <span className="text-gray-700 font-medium">
                      {formatDate(recentMembers[currentIndex].registrationDate)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm ${
                      recentMembers[currentIndex].paymentStatus === 'paid' 
                        ? 'bg-green-100/80 text-green-700 border border-green-200/50'
                        : recentMembers[currentIndex].paymentStatus === 'pending'
                        ? 'bg-yellow-100/80 text-yellow-700 border border-yellow-200/50'
                        : 'bg-red-100/80 text-red-700 border border-red-200/50'
                    }`}>
                      {recentMembers[currentIndex].paymentStatus === 'paid' ? 'Pagado' :
                       recentMembers[currentIndex].paymentStatus === 'pending' ? 'Pendiente' : 'Vencido'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {recentMembers.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-blue-600 w-6' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </motion.div>
  )
}
