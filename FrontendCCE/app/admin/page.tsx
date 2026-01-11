'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { tenantsAPI, type GlobalStatistics } from '@/lib/api/tenants'
import { Card, Button, Badge } from '@/components/ui'
import {
  Building2,
  CheckCircle,
  RefreshCw,
  Users,
  AlertTriangle,
  TrendingUp,
  Plus,
  BarChart3,
  Loader2
} from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * Super Admin Dashboard
 * Shows global system statistics and overview
 *
 * Actualizado para usar el Sistema de Diseño Unificado CCE
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
            <Button variant="danger" onClick={loadStats}>
              Reintentar
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const { overview, recent, topTenants } = stats

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-orange-500 mb-2">Dashboard Global</h1>
            <p className="text-gray-600 dark:text-gray-300">Vista general del sistema multi-tenant</p>
          </div>

          <Link href="/admin/tenants/new">
            <Button variant="accent" icon={Plus}>
              Crear Tenant
            </Button>
          </Link>
        </motion.div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Tenants */}
          <Card variant="metric" padding="compact" animation animationDelay={0.1}>
            <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600
                          flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
              <Building2 className="text-white" size={16} />
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
              {overview.totalTenants}
            </p>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Total Tenants
            </p>
          </Card>

          {/* Active Tenants */}
          <Card variant="metric" padding="compact" animation animationDelay={0.2}>
            <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600
                          flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
              <CheckCircle className="text-white" size={16} />
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
              {overview.tenantsByStatus?.active || 0}
            </p>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Tenants Activos
            </p>
          </Card>

          {/* Trial Tenants */}
          <Card variant="metric" padding="compact" animation animationDelay={0.3}>
            <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600
                          flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
              <RefreshCw className="text-white" size={16} />
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
              {overview.tenantsByStatus?.trial || 0}
            </p>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              En Prueba
            </p>
          </Card>

          {/* Total Members */}
          <Card variant="metric" padding="compact" animation animationDelay={0.4}>
            <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600
                          flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
              <Users className="text-white" size={16} />
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
              {overview.totalMembers}
            </p>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Total Miembros
            </p>
          </Card>
        </div>

        {/* Alerts Section */}
        {(recent.expiringTrialsNext7Days > 0 || recent.tenantsLast30Days > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Expiring Trials */}
            {recent.expiringTrialsNext7Days > 0 && (
              <Card padding="default">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600
                                flex items-center justify-center shadow-lg flex-shrink-0">
                    <AlertTriangle className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-yellow-700 dark:text-yellow-400 font-semibold text-base mb-1">
                      Trials Expirando
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                      {recent.expiringTrialsNext7Days} {recent.expiringTrialsNext7Days === 1 ? 'tenant expira' : 'tenants expiran'} en los próximos 7 días
                    </p>
                    <Link
                      href="/admin/tenants?status=trial"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm inline-flex items-center gap-1"
                    >
                      Ver tenants en prueba
                      <TrendingUp size={14} />
                    </Link>
                  </div>
                </div>
              </Card>
            )}

            {/* Recent Growth */}
            {recent.tenantsLast30Days > 0 && (
              <Card padding="default">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600
                                flex items-center justify-center shadow-lg flex-shrink-0">
                    <TrendingUp className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-green-700 dark:text-green-400 font-semibold text-base mb-1">
                      Crecimiento Reciente
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {recent.tenantsLast30Days} {recent.tenantsLast30Days === 1 ? 'nuevo tenant' : 'nuevos tenants'} en los últimos 30 días
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Top Tenants Table */}
        <Card variant="table" padding="none">
          <div className="px-6 py-4 border-b border-white/20 dark:border-gray-600/20 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Top 5 Tenants por Miembros
            </h2>
            <Link
              href="/admin/tenants"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm inline-flex items-center gap-1"
            >
              Ver todos
              <TrendingUp size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-b border-white/30 dark:border-gray-600/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Miembros
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Uso
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20 dark:divide-gray-600/20">
                {topTenants.map((tenant) => {
                  const usagePercent = (tenant.memberCount / tenant.maxMembers) * 100
                  return (
                    <tr key={tenant.id} className="hover:bg-white/30 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/admin/tenants/${tenant.id}`}
                          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          {tenant.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{tenant.slug}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            tenant.plan === 'enterprise'
                              ? 'success'
                              : tenant.plan === 'pro'
                              ? 'info'
                              : 'default'
                          }
                        >
                          {tenant.plan.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {tenant.memberCount} / {tenant.maxMembers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
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
                          <span className="text-sm text-gray-600 dark:text-gray-400">{usagePercent.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/tenants">
            <Card padding="default" hover className="h-full cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600
                              flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                  <Building2 className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                    Ver Todos los Tenants
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Gestionar clubs registrados
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/tenants/new">
            <Card padding="default" hover className="h-full cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600
                              flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                  <Plus className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                    Crear Nuevo Tenant
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Registrar un nuevo club
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/stats">
            <Card padding="default" hover className="h-full cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600
                              flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                  <BarChart3 className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                    Estadísticas Detalladas
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Ver análisis completo
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
