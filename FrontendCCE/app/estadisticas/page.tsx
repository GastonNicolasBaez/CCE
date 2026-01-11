'use client'

import { useEffect, useState } from 'react'
import { estadisticasAPI, type DashboardData, type ActividadesData, type CrecimientoData, type CuotasData } from '@/lib/api/estadisticas'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, Button } from '@/components/ui'
import { Users, Activity, CreditCard, DollarSign, TrendingUp, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * Estadisticas Page - Tenant Statistics Dashboard
 * Shows comprehensive analytics for club administrators
 *
 * Actualizado para usar el Sistema de Diseño Unificado CCE
 */

export default function EstadisticasPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [actividadesData, setActividadesData] = useState<ActividadesData | null>(null)
  const [crecimientoData, setCrecimientoData] = useState<CrecimientoData | null>(null)
  const [cuotasData, setCuotasData] = useState<CuotasData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      setError('')

      // Load all statistics in parallel
      const [dashboardRes, actividadesRes, crecimientoRes, cuotasRes] = await Promise.all([
        estadisticasAPI.getEstadisticasDashboard(),
        estadisticasAPI.getEstadisticasPorActividad(),
        estadisticasAPI.getCrecimiento(),
        estadisticasAPI.getEstadisticasCuotas(),
      ])

      if (dashboardRes.success) setDashboardData(dashboardRes.data)
      if (actividadesRes.success) setActividadesData(actividadesRes.data)
      if (crecimientoRes.success) setCrecimientoData(crecimientoRes.data)
      if (cuotasRes.success) setCuotasData(cuotasRes.data)
    } catch (err) {
      console.error('Load statistics error:', err)
      setError('Error al cargar las estadísticas')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card variant="form" padding="default">
          <div className="text-center">
            <h3 className="text-red-600 dark:text-red-400 font-semibold text-lg mb-2">Error</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
            <Button variant="danger" onClick={loadAllData}>
              Reintentar
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!dashboardData) return null

  const { socios, actividades, cuotas, ingresos } = dashboardData

  // Prepare chart colors
  const COLORS = {
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    indigo: '#6366F1',
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Prepare socios pie chart data
  const sociosPorTipoData = Object.entries(socios.porTipo).map(([tipo, cantidad]) => ({
    name: tipo,
    value: cantidad,
  }))

  const PIE_COLORS = [COLORS.primary, COLORS.success, COLORS.warning, COLORS.purple, COLORS.indigo]

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-orange-500 mb-2">Estadísticas del Club</h1>
          <p className="text-gray-600 dark:text-gray-300">Vista completa de métricas y análisis</p>
        </motion.div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Socios */}
          <Card variant="metric" padding="compact" animation animationDelay={0.1}>
            <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600
                          flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
              <Users className="text-white" size={16} />
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
              {socios.total}
            </p>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              Total Socios
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              {socios.activos} activos
            </p>
          </Card>

          {/* Total Actividades */}
          <Card variant="metric" padding="compact" animation animationDelay={0.2}>
            <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600
                          flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
              <Activity className="text-white" size={16} />
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
              {actividades.total}
            </p>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Actividades
            </p>
          </Card>

          {/* Total Cuotas */}
          <Card variant="metric" padding="compact" animation animationDelay={0.3}>
            <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600
                          flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
              <CreditCard className="text-white" size={16} />
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
              {cuotas.pagadas}
            </p>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              Cuotas Pagadas
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {cuotas.tasaPago}% tasa
            </p>
          </Card>

          {/* Ingresos Totales */}
          <Card variant="metric" padding="compact" animation animationDelay={0.4}>
            <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600
                          flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
              <DollarSign className="text-white" size={16} />
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
              {formatCurrency(ingresos.total)}
            </p>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              Ingresos Totales
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              {formatCurrency(ingresos.pendiente)} pend.
            </p>
          </Card>
        </div>

        {/* Charts Row 1: Socios Distribution & Cuotas Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Socios por Tipo */}
          <Card padding="default">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Socios por Tipo</h2>
            {sociosPorTipoData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sociosPorTipoData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sociosPorTipoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-12">No hay datos disponibles</p>
            )}
          </Card>

          {/* Cuotas por Estado */}
          <Card padding="default">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Estado de Cuotas</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200/50 dark:border-green-700/50">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pagadas</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{cuotas.pagadas}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tasa de Cobro</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">{cuotas.tasaPago}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200/50 dark:border-yellow-700/50">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{cuotas.pendientes}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200/50 dark:border-red-700/50">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Vencidas</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{cuotas.vencidas}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Actividades Table */}
        {actividadesData && actividadesData.actividades.length > 0 && (
          <Card variant="table" padding="none">
            <div className="px-6 py-4 border-b border-white/20 dark:border-gray-600/20">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Actividades - Ingresos Estimados</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-b border-white/30 dark:border-gray-600/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Actividad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Socios
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Ingreso Mensual
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20 dark:divide-gray-600/20">
                  {actividadesData.actividades.map((actividad) => (
                    <tr key={actividad.id} className="hover:bg-white/30 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{actividad.nombre}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{formatCurrency(actividad.monto)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{actividad.cantidadSocios}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(actividad.ingresoMensualEstimado)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Growth Charts */}
        {crecimientoData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Crecimiento de Socios */}
            {crecimientoData.crecimientoSocios.length > 0 && (
              <Card padding="default">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Crecimiento de Socios (6 meses)</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={crecimientoData.crecimientoSocios}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cantidad" fill={COLORS.primary} name="Nuevos Socios" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Ingresos Mensuales */}
            {crecimientoData.ingresosMensuales.length > 0 && (
              <Card padding="default">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Ingresos Mensuales (6 meses)</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={crecimientoData.ingresosMensuales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line type="monotone" dataKey="ingresos" stroke={COLORS.success} name="Ingresos" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>
        )}

        {/* Current Month Details */}
        {cuotasData && (
          <Card padding="default">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Mes Actual: {cuotasData.mesActual.mes}/{cuotasData.mesActual.anio}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Cuotas</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{cuotasData.mesActual.total}</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200/50 dark:border-green-700/50">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pagadas</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{cuotasData.mesActual.pagadas}</p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200/50 dark:border-yellow-700/50">
                <p className="text-sm text-gray-600 dark:text-gray-400">Tasa de Cobro</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{cuotasData.mesActual.tasaCobro}%</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200/50 dark:border-purple-700/50">
                <p className="text-sm text-gray-600 dark:text-gray-400">Ingresos</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(cuotasData.mesActual.ingresos)}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
