'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth, getTenantSlugFromSubdomain } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [tenantSlug, setTenantSlug] = useState<string | null>(null)

  useEffect(() => {
    // Get tenant slug from subdomain first
    const slug = getTenantSlugFromSubdomain()
    setTenantSlug(slug)

    // If no tenant, redirect to main page (highest priority)
    if (!slug) {
      router.push('/')
      return
    }

    // Check if already authenticated (only if tenant exists)
    if (auth.isAuthenticated()) {
      router.push('/')
      return
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await auth.login({ email, password })

      if (result.success) {
        // Get redirect URL from query params or default to home
        const redirect = searchParams.get('redirect') || '/'
        router.push(redirect)
      } else {
        setError(result.message || 'Error al iniciar sesión. Verifica tus credenciales.')
      }
    } catch (err) {
      setError('Error al conectar con el servidor. Intenta nuevamente.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!tenantSlug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#002C6F] to-[#001840]">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#002C6F] to-[#001840] p-4">
      <div className="w-full max-w-md">
        {/* Glassmorphism Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Iniciar Sesión
            </h1>
            <p className="text-white/70 text-sm">
              {tenantSlug && (
                <span className="capitalize">{tenantSlug}</span>
              )}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-100 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-white/90 text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:border-transparent transition-all"
                placeholder="tu@email.com"
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-white/90 text-sm font-medium mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:border-transparent transition-all"
                placeholder="••••••••"
                disabled={loading}
              />
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
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              ¿Olvidaste tu contraseña?{' '}
              <a href="/recuperar" className="text-[#FFA500] hover:text-[#FF8C00] font-medium">
                Recuperar
              </a>
            </p>
          </div>
        </div>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-white/70 text-sm">
            ¿No tienes un club registrado?{' '}
            <a
              href={`${window.location.protocol}//${window.location.hostname.split('.').slice(-2).join('.')}/register`}
              className="text-[#FFA500] hover:text-[#FF8C00] font-medium"
            >
              Registrar nuevo club
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
