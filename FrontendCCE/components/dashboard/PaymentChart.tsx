'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { useAppStore } from '../../lib/store'
import { getActivityLabel } from '../../lib/utils'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

export default function PaymentChart() {
  const { members } = useAppStore()

  const chartData = useMemo(() => {
    const activities = ['basketball', 'volleyball', 'karate', 'gym', 'solo-socio']
    
    return activities.map((activity, index) => {
      const activityMembers = members.filter(m => m.activity === activity)
      const paid = activityMembers.filter(m => m.paymentStatus === 'paid').length
      const pending = activityMembers.filter(m => m.paymentStatus === 'pending').length
      const overdue = activityMembers.filter(m => m.paymentStatus === 'overdue').length
      
      return {
        name: getActivityLabel(activity),
        pagado: paid,
        pendiente: pending,
        vencido: overdue,
        total: activityMembers.length,
        color: COLORS[index]
      }
    })
  }, [members])

  const pieData = useMemo(() => {
    const totalPaid = members.filter(m => m.paymentStatus === 'paid').length
    const totalPending = members.filter(m => m.paymentStatus === 'pending').length
    const totalOverdue = members.filter(m => m.paymentStatus === 'overdue').length
    
    return [
      { name: 'Pagado', value: totalPaid, color: '#10B981' },
      { name: 'Pendiente', value: totalPending, color: '#F59E0B' },
      { name: 'Vencido', value: totalOverdue, color: '#EF4444' }
    ]
  }, [members])

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-md border border-white/30 rounded-lg p-3 shadow-glass">
          <p className="font-medium text-gray-800">{label}</p>
          {payload.map((entry: { name: string; value: number; color: string }, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="glass-card glass-card-hover h-full flex flex-col"
    >
      <div className="text-center mb-3 flex-shrink-0">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
          Estado de Pagos por Actividad
        </h3>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Bar Chart */}
        <div className="xl:col-span-2 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
              <XAxis 
                dataKey="name" 
                stroke="#6B7280"
                fontSize={11}
                fontWeight={500}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={11}
                fontWeight={500}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="pagado" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pendiente" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="vencido" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="flex flex-col items-center min-h-0">
          <h4 className="text-sm font-medium text-gray-600 mb-4 text-center flex-shrink-0">
            Distribución General de Pagos
          </h4>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={60}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <div className="mt-4 space-y-2 flex-shrink-0">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-gray-600 font-medium">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
