'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { tenantsAPI, type Tenant, type TenantFilters } from '@/lib/api/tenants'
import TenantStatusBadge from '@/components/admin/TenantStatusBadge'

/**
 * Tenants List Page
 * Shows all tenants with filters, search, and pagination
 */

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [planFilter, setPlanFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    loadTenants()
  }, [search, statusFilter, planFilter, currentPage])

  const loadTenants = async () => {
    try {
      setLoading(true)
      setError('')

      const filters: TenantFilters = {
        page: currentPage,
        limit: 10,
        sortBy: 'created_at',
        sortOrder: 'DESC'
      }

      if (search) filters.search = search
      if (statusFilter !== 'all') filters.status = statusFilter as any
      if (planFilter !== 'all') filters.plan = planFilter as any

      const response = await tenantsAPI.getTenants(filters)

      if (response.success) {
        setTenants(response.data.tenants)
        setTotalPages(response.data.pagination.totalPages)
        setTotalItems(response.data.pagination.totalItems)
      } else {
        setError(response.message || 'Error al cargar tenants')
      }
    } catch (err) {
      console.error('Load tenants error:', err)
      setError('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1) // Reset to first page on new search
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handlePlanFilterChange = (value: string) => {
    setPlanFilter(value)
    setCurrentPage(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Tenants</h1>
          <p className="text-gray-600 mt-1">
            {totalItems} {totalItems === 1 ? 'tenant registrado' : 'tenants registrados'}
          </p>
        </div>

        <Link
          href="/admin/tenants/new"
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          + Crear Tenant
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <input
              id="search"
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Nombre o slug..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="trial">En Prueba</option>
              <option value="suspended">Suspendidos</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>

          {/* Plan Filter */}
          <div>
            <label htmlFor="plan" className="block text-sm font-medium text-gray-700 mb-2">
              Plan
            </label>
            <select
              id="plan"
              value={planFilter}
              onChange={(e) => handlePlanFilterChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadTenants}
            className="mt-2 text-red-600 hover:text-red-700 font-medium"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tenants...</p>
        </div>
      )}

      {/* Tenants Table */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Miembros
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tenants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No se encontraron tenants
                    </td>
                  </tr>
                ) : (
                  tenants.map((tenant) => {
                    const usagePercent = parseFloat(tenant.usagePercentage || '0')
                    return (
                      <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <Link
                              href={`/admin/tenants/${tenant.id}`}
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                            >
                              {tenant.name}
                            </Link>
                            <p className="text-xs text-gray-500 mt-1">{tenant.adminEmail}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-900">
                            {tenant.slug}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <TenantStatusBadge status={tenant.status} />
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900">
                              {tenant.memberCount} / {tenant.maxMembers}
                            </div>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
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
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(tenant.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/admin/tenants/${tenant.id}`}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            Ver detalles →
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>

                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-indigo-600 text-white'
                            : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
