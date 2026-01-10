'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { tenantsAPI, type GlobalStatistics } from '@/lib/api/tenants'

/**
 * Super Admin Dashboard
 * Shows global system statistics and overview
 */

export default function AdminDashboard() {
  const router = useRouter()
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
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando estadísticas...</p>
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

  const { overview, recent, topTenants } = stats

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Global</h1>
          <p className="text-gray-600 mt-1">Vista general del sistema multi-tenant</p>
        </div>

        <Link
          href="/admin/tenants/new"
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          + Crear Tenant
        </Link>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tenants */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Tenants</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {overview.totalTenants}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏢</span>
            </div>
          </div>
        </div>

        {/* Active Tenants */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Tenants Activos</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {overview.tenantsByStatus?.active || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        {/* Trial Tenants */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">En Prueba</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {overview.tenantsByStatus?.trial || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔄</span>
            </div>
          </div>
        </div>

        {/* Total Members */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Miembros</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {overview.totalMembers}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {(recent.expiringTrialsNext7Days > 0 || recent.tenantsLast30Days > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Expiring Trials */}
          {recent.expiringTrialsNext7Days > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">⚠️</span>
                </div>
                <div>
                  <h3 className="text-yellow-800 font-semibold text-lg">Trials Expirando</h3>
                  <p className="text-yellow-700 mt-1">
                    {recent.expiringTrialsNext7Days} {recent.expiringTrialsNext7Days === 1 ? 'tenant expira' : 'tenants expiran'} en los próximos 7 días
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

          {/* Recent Growth */}
          {recent.tenantsLast30Days > 0 && (
            <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📈</span>
                </div>
                <div>
                  <h3 className="text-green-800 font-semibold text-lg">Crecimiento Reciente</h3>
                  <p className="text-green-700 mt-1">
                    {recent.tenantsLast30Days} {recent.tenantsLast30Days === 1 ? 'nuevo tenant' : 'nuevos tenants'} en los últimos 30 días
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top Tenants Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Top 5 Tenants por Miembros</h2>
          <Link
            href="/admin/tenants"
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
          >
            Ver todos →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
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
              {topTenants.map((tenant) => {
                const usagePercent = (tenant.memberCount / tenant.maxMembers) * 100
                return (
                  <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/tenants/${tenant.id}`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                      >
                        {tenant.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{tenant.slug}</span>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tenant.memberCount} / {tenant.maxMembers}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
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
                        <span className="text-sm text-gray-600">{usagePercent.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin/tenants"
          className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
              <span className="text-2xl">🏢</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Ver Todos los Tenants</h3>
              <p className="text-sm text-gray-600 mt-1">Gestionar clubs registrados</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/tenants/new"
          className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <span className="text-2xl">➕</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Crear Nuevo Tenant</h3>
              <p className="text-sm text-gray-600 mt-1">Registrar un nuevo club</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
