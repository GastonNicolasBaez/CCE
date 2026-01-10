'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { tenantsAPI, type Tenant, type TenantStatistics } from '@/lib/api/tenants'
import TenantStatusBadge from '@/components/admin/TenantStatusBadge'

/**
 * Tenant Details Page
 * Shows detailed information about a specific tenant
 */

export default function TenantDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const tenantId = parseInt(params.id as string)

  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [statistics, setStatistics] = useState<TenantStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Status change modal
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState<'active' | 'suspended' | 'trial' | 'cancelled'>('active')
  const [statusReason, setStatusReason] = useState('')
  const [changingStatus, setChangingStatus] = useState(false)

  useEffect(() => {
    loadTenant()
  }, [tenantId])

  const loadTenant = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await tenantsAPI.getTenantById(tenantId)

      if (response.success) {
        setTenant(response.data.tenant)
        setStatistics(response.data.statistics)
      } else {
        setError(response.message || 'Error al cargar el tenant')
      }
    } catch (err) {
      console.error('Load tenant error:', err)
      setError('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeStatus = async () => {
    if (!tenant) return

    try {
      setChangingStatus(true)
      const response = await tenantsAPI.changeTenantStatus(tenant.id, newStatus, statusReason)

      if (response.success) {
        setShowStatusModal(false)
        setStatusReason('')
        await loadTenant() // Reload data
      } else {
        alert(response.message || 'Error al cambiar el status')
      }
    } catch (err) {
      console.error('Change status error:', err)
      alert('Error al conectar con el servidor')
    } finally {
      setChangingStatus(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tenant...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !tenant) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-600">{error || 'Tenant no encontrado'}</p>
          <Link
            href="/admin/tenants"
            className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Volver a la lista
          </Link>
        </div>
      </div>
    )
  }

  const usagePercent = parseFloat(tenant.usagePercentage || '0')

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/tenants"
            className="text-gray-500 hover:text-gray-700"
          >
            ← Volver
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{tenant.name}</h1>
            <p className="text-gray-600 mt-1">
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">{tenant.slug}</code>
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setNewStatus(tenant.status)
            setShowStatusModal(true)
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cambiar Status
        </button>
      </div>

      {/* Status and Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-2">Estado Actual</p>
          <TenantStatusBadge status={tenant.status} size="lg" />
          {tenant.status === 'trial' && tenant.trialEndsAt && (
            <p className="text-xs text-gray-500 mt-2">
              Expira: {formatDate(tenant.trialEndsAt)}
            </p>
          )}
        </div>

        {/* Plan Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-2">Plan</p>
          <span
            className={`inline-block px-4 py-2 text-lg font-bold rounded-lg ${
              tenant.plan === 'enterprise'
                ? 'bg-purple-100 text-purple-800'
                : tenant.plan === 'pro'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {tenant.plan.toUpperCase()}
          </span>
        </div>

        {/* Created Date */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-2">Fecha de Creación</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatDate(tenant.createdAt)}
          </p>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-sm font-medium">Miembros</p>
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{statistics.totalMembers}</p>
            <p className="text-sm text-gray-500 mt-1">
              {statistics.activeMembers} activos
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-sm font-medium">Uso</p>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{usagePercent.toFixed(0)}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
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
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-sm font-medium">Cuotas</p>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{statistics.totalCuotas}</p>
            <p className="text-sm text-gray-500 mt-1">
              {statistics.cuotasPagadas} pagadas
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-sm font-medium">Tasa de Pago</p>
              <span className="text-2xl">📈</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{statistics.paymentRate}%</p>
            <p className="text-sm text-gray-500 mt-1">Promedio de cobro</p>
          </div>
        </div>
      )}

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Información de Contacto</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Administrador</p>
            <p className="text-base font-medium text-gray-900">{tenant.adminName}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Email</p>
            <a
              href={`mailto:${tenant.adminEmail}`}
              className="text-base font-medium text-indigo-600 hover:text-indigo-700"
            >
              {tenant.adminEmail}
            </a>
          </div>

          {tenant.phone && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Teléfono</p>
              <a
                href={`tel:${tenant.phone}`}
                className="text-base font-medium text-indigo-600 hover:text-indigo-700"
              >
                {tenant.phone}
              </a>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-500 mb-1">URL del Tenant</p>
            <a
              href={`http://${tenant.slug}.localhost:3000`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-medium text-indigo-600 hover:text-indigo-700"
            >
              {tenant.slug}.localhost:3000 ↗
            </a>
          </div>
        </div>
      </div>

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Cambiar Status del Tenant</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nuevo Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="active">Activo</option>
                  <option value="trial">Prueba</option>
                  <option value="suspended">Suspendido</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razón del cambio (opcional)
                </label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ej: Pago atrasado, solicitud del cliente, etc."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowStatusModal(false)}
                disabled={changingStatus}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleChangeStatus}
                disabled={changingStatus}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {changingStatus ? 'Cambiando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
