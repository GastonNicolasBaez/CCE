'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { tenantsAPI, type CreateTenantData } from '@/lib/api/tenants'

/**
 * Create Tenant Page
 * Form to create a new tenant with admin user
 */

export default function CreateTenantPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Form data
  const [formData, setFormData] = useState<CreateTenantData>({
    clubName: '',
    slug: '',
    phone: '',
    plan: 'free',
    maxMembers: 50,
    adminName: '',
    adminLastName: '',
    adminEmail: '',
    password: '',
    configuracion: {
      tipoCuota: 'por_actividad',
      montoBase: 0,
      multipleActividadesStrategy: 'sumar',
      descuentoActividades: 0,
      diaVencimiento: 10,
      recordatorioDiasAntes: 2,
      descuentoMenores: 0,
      generarAutomaticamente: true,
      enviarRecordatorios: true
    }
  })

  const [slugChecking, setSlugChecking] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)

  const updateFormData = (field: keyof CreateTenantData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateConfigData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      configuracion: {
        ...prev.configuracion,
        [field]: value
      }
    }))
  }

  const handleSlugChange = (value: string) => {
    // Sanitize slug: lowercase, remove spaces, special chars
    const sanitized = value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    updateFormData('slug', sanitized)
    setSlugAvailable(null)
  }

  const handlePlanChange = (plan: 'free' | 'pro' | 'enterprise') => {
    const limits = {
      free: 50,
      pro: 500,
      enterprise: 999999
    }

    updateFormData('plan', plan)
    updateFormData('maxMembers', limits[plan])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validations
    if (!formData.clubName || !formData.slug) {
      setError('Por favor completa los campos requeridos del club')
      return
    }

    if (!formData.adminName || !formData.adminLastName || !formData.adminEmail || !formData.password) {
      setError('Por favor completa todos los campos del administrador')
      return
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    try {
      setLoading(true)
      const response = await tenantsAPI.createTenant(formData)

      if (response.success) {
        setSuccess(true)
        // Redirect after a short delay
        setTimeout(() => {
          router.push(`/admin/tenants/${response.data.tenant.id}`)
        }, 2000)
      } else {
        setError(response.message || 'Error al crear el tenant')
      }
    } catch (err: any) {
      console.error('Create tenant error:', err)
      setError(err.message || 'Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">
            ¡Tenant Creado Exitosamente!
          </h2>
          <p className="text-green-700">
            Redirigiendo a los detalles del tenant...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Tenant</h1>
          <p className="text-gray-600 mt-1">Registrar un nuevo club en el sistema</p>
        </div>

        <Link
          href="/admin/tenants"
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Volver
        </Link>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Club Information */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Información del Club</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="clubName" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Club *
              </label>
              <input
                id="clubName"
                type="text"
                required
                value={formData.clubName}
                onChange={(e) => updateFormData('clubName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Ej: Club Comandante Espora"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                Slug (Subdominio) *
              </label>
              <input
                id="slug"
                type="text"
                required
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="ej: espora"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL: {formData.slug || 'slug'}.localhost:3000
              </p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="+54 9 11 1234-5678"
              />
            </div>

            <div>
              <label htmlFor="plan" className="block text-sm font-medium text-gray-700 mb-2">
                Plan *
              </label>
              <select
                id="plan"
                value={formData.plan}
                onChange={(e) => handlePlanChange(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="free">Free (50 miembros)</option>
                <option value="pro">Pro (500 miembros)</option>
                <option value="enterprise">Enterprise (ilimitado)</option>
              </select>
            </div>

            <div>
              <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 mb-2">
                Límite de Miembros
              </label>
              <input
                id="maxMembers"
                type="number"
                min="1"
                value={formData.maxMembers}
                onChange={(e) => updateFormData('maxMembers', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Admin User */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Usuario Administrador</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="adminName" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                id="adminName"
                type="text"
                required
                value={formData.adminName}
                onChange={(e) => updateFormData('adminName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Juan"
              />
            </div>

            <div>
              <label htmlFor="adminLastName" className="block text-sm font-medium text-gray-700 mb-2">
                Apellido *
              </label>
              <input
                id="adminLastName"
                type="text"
                required
                value={formData.adminLastName}
                onChange={(e) => updateFormData('adminLastName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Pérez"
              />
            </div>

            <div>
              <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                id="adminEmail"
                type="email"
                required
                value={formData.adminEmail}
                onChange={(e) => updateFormData('adminEmail', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="admin@club.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña *
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
          </div>
        </div>

        {/* Configuration (Optional) */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Configuración Inicial (Opcional)</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="tipoCuota" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Cuota
              </label>
              <select
                id="tipoCuota"
                value={formData.configuracion?.tipoCuota}
                onChange={(e) => updateConfigData('tipoCuota', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="por_actividad">Por Actividad</option>
                <option value="fija">Fija</option>
              </select>
            </div>

            <div>
              <label htmlFor="montoBase" className="block text-sm font-medium text-gray-700 mb-2">
                Monto Base ($)
              </label>
              <input
                id="montoBase"
                type="number"
                min="0"
                step="0.01"
                value={formData.configuracion?.montoBase}
                onChange={(e) => updateConfigData('montoBase', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="diaVencimiento" className="block text-sm font-medium text-gray-700 mb-2">
                Día de Vencimiento
              </label>
              <input
                id="diaVencimiento"
                type="number"
                min="1"
                max="31"
                value={formData.configuracion?.diaVencimiento}
                onChange={(e) => updateConfigData('diaVencimiento', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.configuracion?.generarAutomaticamente}
                  onChange={(e) => updateConfigData('generarAutomaticamente', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Generar cuotas automáticamente</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.configuracion?.enviarRecordatorios}
                  onChange={(e) => updateConfigData('enviarRecordatorios', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Enviar recordatorios de pago</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/admin/tenants"
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creando...
              </span>
            ) : (
              'Crear Tenant'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
