'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAppStore } from '../../lib/store'
import { useLoadMembers } from '../../lib/hooks'
import { Users, CreditCard, TrendingUp, UserPlus, DollarSign, Activity, BarChart3 } from 'lucide-react'
import MetricCard from './MetricCard'
import PaymentChart from './PaymentChart'
import RecentRegistrations from './RecentRegistrations'
import { FloatingButton, Skeleton } from '@/components/ui'

export default function Dashboard() {
  const router = useRouter()
  const { members, setCurrentPage } = useAppStore()
  const { isLoading, error } = useLoadMembers()

  // Calcular métricas - validar que members sea un array
  const membersArray = Array.isArray(members) ? members : []
  const totalMembers = membersArray.length
  const activeMembers = membersArray.filter(m => m.status === 'active').length
  const pendingPayments = membersArray.filter(m => m.paymentStatus === 'pending').length
  const overduePayments = membersArray.filter(m => m.paymentStatus === 'overdue').length

  const metrics: Array<{
    title: string
    value: number
    icon: React.ComponentType<{ size?: number | string; className?: string }>
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

  // Quick actions for floating button
  const quickActions = [
    {
      id: 'new-member',
      label: 'Nuevo Socio',
      icon: UserPlus,
      onClick: () => router.push('/members/new'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'new-payment',
      label: 'Registrar Pago',
      icon: DollarSign,
      onClick: () => router.push('/payments/new'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'new-activity',
      label: 'Nueva Actividad',
      icon: Activity,
      onClick: () => router.push('/actividades'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'stats',
      label: 'Ver Estadísticas',
      icon: BarChart3,
      onClick: () => router.push('/estadisticas'),
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ]

  if (isLoading) {
    return (
      <div className="h-full flex flex-col space-y-3">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="space-y-2">
            <Skeleton variant="text" width={300} height={32} animation="shimmer" />
            <Skeleton variant="text" width={250} height={16} animation="shimmer" />
          </div>
          <Skeleton variant="rectangular" width={150} height={40} animation="shimmer" />
        </div>

        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/30 dark:border-gray-600/30 shadow-2xl rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <Skeleton variant="circular" width={48} height={48} animation="shimmer" />
              </div>
              <Skeleton variant="text" width="80%" height={24} animation="shimmer" />
              <div className="mt-2">
                <Skeleton variant="text" width="60%" height={16} animation="shimmer" />
              </div>
              <div className="mt-3">
                <Skeleton variant="rectangular" width={80} height={24} animation="shimmer" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 flex-1 min-h-0">
          <div className="xl:col-span-2">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/30 dark:border-gray-600/30 shadow-2xl rounded-2xl p-6 h-full">
              <Skeleton variant="text" width={200} height={24} animation="shimmer" />
              <div className="mt-4">
                <Skeleton variant="rectangular" height={300} animation="shimmer" />
              </div>
            </div>
          </div>
          <div className="hidden xl:block">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/30 dark:border-gray-600/30 shadow-2xl rounded-2xl p-6 h-full">
              <Skeleton variant="text" width={180} height={24} animation="shimmer" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton variant="circular" width={40} height={40} animation="shimmer" />
                    <div className="flex-1">
                      <Skeleton variant="text" width="80%" height={16} animation="shimmer" />
                      <div className="mt-1">
                        <Skeleton variant="text" width="60%" height={12} animation="shimmer" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error al cargar los datos: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Header compacto */}
      <div className="flex items-center justify-between flex-shrink-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-orange-500 dark:text-orange-400">
            Club Comandante Espora
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Panel de Control - Vista general del club
          </p>
        </motion.div>

        {/* Botón de nueva inscripción */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-shrink-0"
        >
          <button 
            onClick={() => setCurrentPage('registration')}
            className="accent-button flex items-center gap-2 px-4 py-2 text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <UserPlus size={16} />
            <span className="hidden sm:block">Nueva Inscripción</span>
          </button>
        </motion.div>
      </div>

      {/* Metrics Grid - más compacto */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0"
      >
        {metrics.map((metric, index) => (
          <MetricCard
            key={metric.title}
            {...metric}
            delay={index * 0.1}
          />
        ))}
      </motion.div>

      {/* Charts and Recent Activity - optimizado para altura */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Payment Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2 min-h-0"
        >
          <PaymentChart />
        </motion.div>

        {/* Recent Registrations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="hidden xl:block min-h-0"
        >
          <RecentRegistrations />
        </motion.div>
      </div>

      {/* Floating Action Button */}
      <FloatingButton
        position="bottom-right"
        actions={quickActions}
        mainColor="bg-orange-500 hover:bg-orange-600"
      />
    </div>
  )
}
