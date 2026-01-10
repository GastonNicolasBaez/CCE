'use client'

import { useEffect, useState } from 'react'
import { estadisticasAPI, type DashboardData, type ActividadesData, type CrecimientoData, type CuotasData } from '@/lib/api/estadisticas'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

/**
 * Estadisticas Page - Tenant Statistics Dashboard
 * Shows comprehensive analytics for club administrators
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">Error</h3>
          <p className="text-red-600 dark:text-red-300">{error}</p>
          <button
            onClick={loadAllData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Estadísticas del Club</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Vista completa de métricas y análisis</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Socios */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Socios</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {socios.total}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {socios.activos} activos
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          {/* Total Actividades */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Actividades</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {actividades.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏀</span>
              </div>
            </div>
          </div>

          {/* Total Cuotas */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Cuotas Pagadas</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {cuotas.pagadas}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {cuotas.tasaPago}% tasa de cobro
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          {/* Ingresos Totales */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Ingresos Totales</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {formatCurrency(ingresos.total)}
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                  {formatCurrency(ingresos.pendiente)} pendiente
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💵</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1: Socios Distribution & Cuotas Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Socios por Tipo */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Socios por Tipo</h2>
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
          </div>

          {/* Cuotas por Estado */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Estado de Cuotas</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pagadas</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{cuotas.pagadas}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tasa de Cobro</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">{cuotas.tasaPago}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{cuotas.pendientes}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Vencidas</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{cuotas.vencidas}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actividades Table */}
        {actividadesData && actividadesData.actividades.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Actividades - Ingresos Estimados</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actividad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Socios
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ingreso Mensual
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {actividadesData.actividades.map((actividad) => (
                    <tr key={actividad.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{actividad.nombre}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-gray-300">{formatCurrency(actividad.monto)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-gray-300">{actividad.cantidadSocios}</span>
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
          </div>
        )}

        {/* Growth Charts */}
        {crecimientoData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Crecimiento de Socios */}
            {crecimientoData.crecimientoSocios.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Crecimiento de Socios (6 meses)</h2>
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
              </div>
            )}

            {/* Ingresos Mensuales */}
            {crecimientoData.ingresosMensuales.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ingresos Mensuales (6 meses)</h2>
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
              </div>
            )}
          </div>
        )}

        {/* Current Month Details */}
        {cuotasData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Mes Actual: {cuotasData.mesActual.mes}/{cuotasData.mesActual.anio}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Cuotas</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{cuotasData.mesActual.total}</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pagadas</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{cuotasData.mesActual.pagadas}</p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Tasa de Cobro</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{cuotasData.mesActual.tasaCobro}%</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Ingresos</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(cuotasData.mesActual.ingresos)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
