'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../../lib/store'
import { Users, CreditCard, TrendingUp, UserPlus } from 'lucide-react'
import MetricCard from './MetricCard'
import PaymentChart from './PaymentChart'
import RecentRegistrations from './RecentRegistrations'
import Link from 'next/link'

export default function Dashboard() {
  const { members } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Calcular métricas
  const totalMembers = members.length
  const activeMembers = members.filter(m => m.status === 'active').length
  const pendingPayments = members.filter(m => m.paymentStatus === 'pending').length
  const overduePayments = members.filter(m => m.paymentStatus === 'overdue').length

  const metrics: Array<{
    title: string
    value: number
    icon: any
    color: string
    change: string
    changeType: 'positive' | 'negative'
  }> = [
    {
      title: 'Total de Socios',
      value: totalMembers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Socios Activos',
      value: activeMembers,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Cuotas Pendientes',
      value: pendingPayments,
      icon: CreditCard,
      color: 'from-yellow-500 to-yellow-600',
      change: '-5%',
      changeType: 'negative'
    },
    {
      title: 'Cuotas Vencidas',
      value: overduePayments,
      icon: CreditCard,
      color: 'from-red-500 to-red-600',
      change: '+2%',
      changeType: 'negative'
    }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header con título y botón */}
      <div className="flex items-start justify-between">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center flex-1"
        >
          <h1 className="text-4xl font-bold text-orange-500 mb-2">
            Club Comandante Espora
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Panel de Control
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Vista general del club
          </p>
        </motion.div>

        {/* Botón de nueva inscripción arriba a la derecha */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-shrink-0"
        >
          <Link href="/registration" className="accent-button flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <UserPlus size={20} />
            <span>Nueva Inscripción</span>
          </Link>
        </motion.div>
      </div>

      {/* Metrics Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0"
      >
        {metrics.map((metric, index) => (
          <MetricCard
            key={metric.title}
            {...metric}
            delay={index * 0.1}
          />
        ))}
      </motion.div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Payment Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2"
        >
          <PaymentChart />
        </motion.div>

        {/* Recent Registrations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="hidden xl:block"
        >
          <RecentRegistrations />
        </motion.div>
      </div>
    </div>
  )
}
