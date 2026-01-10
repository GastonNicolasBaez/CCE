'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { tenantsAPI, type GlobalStatistics } from '@/lib/api/tenants'

/**
 * Global Statistics Page
 * Detailed analytics and reports for the entire system
 */

export default function StatsPage() {
  const [stats, setStats] = useState<GlobalStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await tenantsAPI.getGlobalStats()

      if (response.success) {
        setStats(response.data)
      } else {
        setError(response.message || 'Error al cargar estadísticas')
      }
    } catch (err) {
      console.error('Load stats error:', err)
      setError('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando estadísticas...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadStats}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const { overview, recent, topTenants, growth } = stats

  // Calculate percentages for status
  const totalTenants = overview.totalTenants
  const statusPercentages = {
    active: ((overview.tenantsByStatus?.active || 0) / totalTenants) * 100,
    trial: ((overview.tenantsByStatus?.trial || 0) / totalTenants) * 100,
    suspended: ((overview.tenantsByStatus?.suspended || 0) / totalTenants) * 100,
    cancelled: ((overview.tenantsByStatus?.cancelled || 0) / totalTenants) * 100
  }

  // Calculate percentages for plans
  const planPercentages = {
    free: ((overview.tenantsByPlan?.free || 0) / totalTenants) * 100,
    pro: ((overview.tenantsByPlan?.pro || 0) / totalTenants) * 100,
    enterprise: ((overview.tenantsByPlan?.enterprise || 0) / totalTenants) * 100
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estadísticas Globales</h1>
          <p className="text-gray-600 mt-1">Análisis detallado del sistema multi-tenant</p>
        </div>

        <Link
          href="/admin"
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Volver al Dashboard
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-blue-100 text-sm font-medium mb-2">Total Tenants</p>
          <p className="text-4xl font-bold">{overview.totalTenants}</p>
          <p className="text-blue-100 text-sm mt-2">Clubs registrados</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-green-100 text-sm font-medium mb-2">Total Miembros</p>
          <p className="text-4xl font-bold">{overview.totalMembers.toLocaleString()}</p>
          <p className="text-green-100 text-sm mt-2">
            {overview.activeMembers.toLocaleString()} activos
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-purple-100 text-sm font-medium mb-2">Total Usuarios</p>
          <p className="text-4xl font-bold">{overview.totalUsers}</p>
          <p className="text-purple-100 text-sm mt-2">Cuentas del sistema</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-orange-100 text-sm font-medium mb-2">Nuevos (30 días)</p>
          <p className="text-4xl font-bold">{recent.tenantsLast30Days}</p>
          <p className="text-orange-100 text-sm mt-2">Crecimiento reciente</p>
        </div>
      </div>

      {/* Status and Plan Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Distribución por Estado</h2>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Activos</span>
                <span className="text-sm font-semibold text-green-600">
                  {overview.tenantsByStatus?.active || 0} ({statusPercentages.active.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${statusPercentages.active}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">En Prueba</span>
                <span className="text-sm font-semibold text-blue-600">
                  {overview.tenantsByStatus?.trial || 0} ({statusPercentages.trial.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${statusPercentages.trial}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Suspendidos</span>
                <span className="text-sm font-semibold text-yellow-600">
                  {overview.tenantsByStatus?.suspended || 0} ({statusPercentages.suspended.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-yellow-500 h-3 rounded-full transition-all"
                  style={{ width: `${statusPercentages.suspended}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Cancelados</span>
                <span className="text-sm font-semibold text-red-600">
                  {overview.tenantsByStatus?.cancelled || 0} ({statusPercentages.cancelled.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-red-500 h-3 rounded-full transition-all"
                  style={{ width: `${statusPercentages.cancelled}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Distribución por Plan</h2>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Enterprise</span>
                <span className="text-sm font-semibold text-purple-600">
                  {overview.tenantsByPlan?.enterprise || 0} ({planPercentages.enterprise.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-500 h-3 rounded-full transition-all"
                  style={{ width: `${planPercentages.enterprise}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Pro</span>
                <span className="text-sm font-semibold text-blue-600">
                  {overview.tenantsByPlan?.pro || 0} ({planPercentages.pro.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${planPercentages.pro}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Free</span>
                <span className="text-sm font-semibold text-gray-600">
                  {overview.tenantsByPlan?.free || 0} ({planPercentages.free.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gray-500 h-3 rounded-full transition-all"
                  style={{ width: `${planPercentages.free}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total</span>
              <span className="text-lg font-bold text-gray-900">{totalTenants} tenants</span>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Chart - Simple bar chart */}
      {growth && growth.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Crecimiento Mensual (Últimos 6 meses)</h2>

          <div className="space-y-3">
            {growth.map((item, index) => {
              const maxCount = Math.max(...growth.map(g => g.count))
              const percentage = (item.count / maxCount) * 100

              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.month}</span>
                    <span className="text-sm font-semibold text-indigo-600">
                      {item.count} {item.count === 1 ? 'tenant' : 'tenants'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-6 rounded-full transition-all flex items-center justify-end pr-2"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    >
                      <span className="text-xs font-semibold text-white">{item.count}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Top Tenants */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Top Tenants por Miembros</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ranking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Miembros
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uso
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topTenants.map((tenant, index) => {
                const usagePercent = (tenant.memberCount / tenant.maxMembers) * 100
                return (
                  <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-sm">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/tenants/${tenant.id}`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                      >
                        {tenant.name}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">{tenant.slug}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          tenant.plan === 'enterprise'
                            ? 'bg-purple-100 text-purple-800'
                            : tenant.plan === 'pro'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {tenant.plan.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {tenant.memberCount.toLocaleString()} / {tenant.maxMembers.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              usagePercent >= 90
                                ? 'bg-red-500'
                                : usagePercent >= 70
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          {usagePercent.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts Section */}
      {recent.expiringTrialsNext7Days > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <h3 className="text-yellow-800 font-semibold text-lg">
                Atención: Trials Expirando
              </h3>
              <p className="text-yellow-700 mt-1">
                {recent.expiringTrialsNext7Days}{' '}
                {recent.expiringTrialsNext7Days === 1 ? 'tenant expira' : 'tenants expiran'} en los
                próximos 7 días. Considera contactarlos para renovar.
              </p>
              <Link
                href="/admin/tenants?status=trial"
                className="text-yellow-800 font-medium hover:underline mt-2 inline-block"
              >
                Ver tenants en prueba →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
