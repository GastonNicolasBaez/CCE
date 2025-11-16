'use client'

import { useState, useEffect, useMemo } from 'react'
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
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts'
import { api, PaymentStatistics } from '../../lib/api'
import { formatCurrency } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

const COLORS = ['#10B981', '#F59E0B', '#EF4444']
const STATE_COLORS = {
  'Pagada': '#10B981',
  'Pendiente': '#F59E0B',
  'Vencida': '#EF4444',
  'Cancelada': '#6B7280'
}

export default function PaymentChart() {
  const [paymentStats, setPaymentStats] = useState<PaymentStatistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const response = await api.pagos.getStatistics()
        if (response.success) {
          setPaymentStats(response.data)
        }
      } catch (error) {
        console.error('Error fetching payment statistics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Pie chart data from general statistics
  const pieData = useMemo(() => {
    if (!paymentStats) return []

    return paymentStats.general.estadisticas.map(stat => ({
      name: stat.estado,
      value: stat.cantidad,
      color: STATE_COLORS[stat.estado as keyof typeof STATE_COLORS] || '#6B7280'
    })).filter(item => item.value > 0)
  }, [paymentStats])

  // Monthly trend data for line chart
  const trendData = useMemo(() => {
    if (!paymentStats) return []

    return paymentStats.tendenciaMensual
      .slice()
      .reverse() // Show chronologically
      .map(month => ({
        periodo: month.periodo,
        ingresoReal: month.ingresoReal,
        ingresoEsperado: month.ingresoEsperado,
        tasaCobranza: parseFloat(month.tasaCobranza)
      }))
  }, [paymentStats])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {typeof entry.value === 'number' && entry.value > 1000
                ? formatCurrency(entry.value)
                : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card h-full flex items-center justify-center"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando estadísticas...</span>
      </motion.div>
    )
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
          Tendencia Mensual de Ingresos
        </h3>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Line Chart - Monthly Trend */}
        <div className="xl:col-span-2 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
              <XAxis
                dataKey="periodo"
                stroke="#6B7280"
                fontSize={11}
                fontWeight={500}
              />
              <YAxis
                stroke="#6B7280"
                fontSize={11}
                fontWeight={500}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="ingresoReal"
                stroke="#10B981"
                strokeWidth={2}
                name="Ingreso Real"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="ingresoEsperado"
                stroke="#3B82F6"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Ingreso Esperado"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Payment Status Distribution */}
        <div className="flex flex-col items-center min-h-0">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4 text-center flex-shrink-0">
            Distribución de Cuotas
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
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  {entry.name}: {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
