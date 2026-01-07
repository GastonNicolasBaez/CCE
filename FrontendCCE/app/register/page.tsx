'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth, getTenantSlugFromSubdomain, getTenantUrl } from '@/lib/auth'
import type { RegisterData } from '@/lib/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<RegisterData>({
    clubName: '',
    slug: '',
    phone: '',
    adminName: '',
    adminLastName: '',
    adminEmail: '',
    password: '',
  })

  const [passwordConfirm, setPasswordConfirm] = useState('')

  useEffect(() => {
    // If already authenticated, redirect
    if (auth.isAuthenticated()) {
      router.push('/dashboard')
      return
    }

    // If on subdomain, redirect to main domain register
    const tenantSlug = getTenantSlugFromSubdomain()
    if (tenantSlug) {
      // Redirect to main domain register page
      if (typeof window !== 'undefined') {
        const baseDomain = window.location.hostname.split('.').slice(-2).join('.')
        window.location.href = `${window.location.protocol}//${baseDomain}/register`
      }
    }
  }, [router])

  // Auto-generate slug from club name
  const handleClubNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      clubName: value,
      // Auto-generate slug: "Club Espora" → "club-espora"
      slug: value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50)
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Club Name
    if (formData.clubName.length < 3) {
      newErrors.clubName = 'El nombre del club debe tener al menos 3 caracteres'
    }

    // Slug
    if (formData.slug.length < 3) {
      newErrors.slug = 'El slug debe tener al menos 3 caracteres'
    }
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'El slug solo puede contener letras minúsculas, números y guiones'
    }

    // Admin Name
    if (formData.adminName.length < 2) {
      newErrors.adminName = 'El nombre debe tener al menos 2 caracteres'
    }

    // Admin Last Name
    if (formData.adminLastName.length < 2) {
      newErrors.adminLastName = 'El apellido debe tener al menos 2 caracteres'
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.adminEmail)) {
      newErrors.adminEmail = 'Email inválido'
    }

    // Password
    if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'La contraseña debe contener mayúsculas, minúsculas y números'
    }

    // Password Confirm
    if (formData.password !== passwordConfirm) {
      newErrors.passwordConfirm = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setErrors({})

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const result = await auth.register(formData)

      if (result.success && result.data) {
        // Redirect to tenant subdomain
        const tenantUrl = getTenantUrl(result.data.tenant.slug)
        window.location.href = `${tenantUrl}/dashboard`
      } else {
        // Handle validation errors from backend
        if (result.errors && Array.isArray(result.errors)) {
          const newErrors: Record<string, string> = {}
          result.errors.forEach((err: { field: string; message: string }) => {
            newErrors[err.field] = err.message
          })
          setErrors(newErrors)
        } else {
          setError(result.message || 'Error al registrar el club. Intenta nuevamente.')
        }
      }
    } catch (err) {
      setError('Error al conectar con el servidor. Intenta nuevamente.')
      console.error('Register error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002C6F] to-[#001840] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Glassmorphism Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Registrar Nuevo Club
            </h1>
            <p className="text-white/70 text-sm">
              Crea tu club y comienza a gestionar tus miembros en minutos
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-100 text-sm">{error}</p>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section: Datos del Club */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white/90 border-b border-white/20 pb-2">
                Datos del Club
              </h2>

              {/* Club Name */}
              <div>
                <label htmlFor="clubName" className="block text-white/90 text-sm font-medium mb-2">
                  Nombre del Club *
                </label>
                <input
                  id="clubName"
                  type="text"
                  value={formData.clubName}
                  onChange={(e) => handleClubNameChange(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:border-transparent transition-all"
                  placeholder="Ej: Club Comandante Espora"
                  disabled={loading}
                />
                {errors.clubName && <p className="text-red-300 text-sm mt-1">{errors.clubName}</p>}
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-white/90 text-sm font-medium mb-2">
                  Subdominio (URL del club) *
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    id="slug"
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                    required
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:border-transparent transition-all"
                    placeholder="mi-club"
                    disabled={loading}
                  />
                  <span className="text-white/70 text-sm whitespace-nowrap">.tudominio.com</span>
                </div>
                {errors.slug && <p className="text-red-300 text-sm mt-1">{errors.slug}</p>}
                <p className="text-white/50 text-xs mt-1">
                  Este será tu enlace: {formData.slug || 'mi-club'}.tudominio.com
                </p>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-white/90 text-sm font-medium mb-2">
                  Teléfono del Club (opcional)
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:border-transparent transition-all"
                  placeholder="+54 11 1234-5678"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Section: Datos del Administrador */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white/90 border-b border-white/20 pb-2">
                Datos del Administrador
              </h2>

              {/* Admin Name and Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="adminName" className="block text-white/90 text-sm font-medium mb-2">
                    Nombre *
                  </label>
                  <input
                    id="adminName"
                    type="text"
                    value={formData.adminName}
                    onChange={(e) => setFormData(prev => ({ ...prev, adminName: e.target.value }))}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:border-transparent transition-all"
                    placeholder="Juan"
                    disabled={loading}
                  />
                  {errors.adminName && <p className="text-red-300 text-sm mt-1">{errors.adminName}</p>}
                </div>

                <div>
                  <label htmlFor="adminLastName" className="block text-white/90 text-sm font-medium mb-2">
                    Apellido *
                  </label>
                  <input
                    id="adminLastName"
                    type="text"
                    value={formData.adminLastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, adminLastName: e.target.value }))}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:border-transparent transition-all"
                    placeholder="Pérez"
                    disabled={loading}
                  />
                  {errors.adminLastName && <p className="text-red-300 text-sm mt-1">{errors.adminLastName}</p>}
                </div>
              </div>

              {/* Admin Email */}
              <div>
                <label htmlFor="adminEmail" className="block text-white/90 text-sm font-medium mb-2">
                  Email *
                </label>
                <input
                  id="adminEmail"
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:border-transparent transition-all"
                  placeholder="admin@miclub.com"
                  disabled={loading}
                />
                {errors.adminEmail && <p className="text-red-300 text-sm mt-1">{errors.adminEmail}</p>}
              </div>

              {/* Password and Confirm */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-white/90 text-sm font-medium mb-2">
                    Contraseña *
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:border-transparent transition-all"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  {errors.password && <p className="text-red-300 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label htmlFor="passwordConfirm" className="block text-white/90 text-sm font-medium mb-2">
                    Confirmar Contraseña *
                  </label>
                  <input
                    id="passwordConfirm"
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:border-transparent transition-all"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  {errors.passwordConfirm && <p className="text-red-300 text-sm mt-1">{errors.passwordConfirm}</p>}
                </div>
              </div>

              <p className="text-white/50 text-xs">
                Mínimo 8 caracteres, debe contener mayúsculas, minúsculas y números
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#FFA500] to-[#FF8C00] text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registrando club...
                </span>
              ) : (
                'Registrar Club'
              )}
            </button>
          </form>

          {/* Trial Info */}
          <div className="mt-6 p-4 bg-[#FFA500]/10 border border-[#FFA500]/30 rounded-lg">
            <p className="text-white/80 text-sm text-center">
              🎉 <strong>Prueba gratis por 14 días</strong> - Plan gratuito con hasta 50 miembros
            </p>
          </div>
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-white/70 text-sm">
            ¿Ya tienes un club?{' '}
            <a href="/" className="text-[#FFA500] hover:text-[#FF8C00] font-medium">
              Inicia sesión en tu club
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
