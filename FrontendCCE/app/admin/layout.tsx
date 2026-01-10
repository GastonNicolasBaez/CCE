'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth, type User } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'

/**
 * Admin Layout
 * Protected layout for super admin panel
 * Verifies authentication and super admin role
 */

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verify authentication
    if (!auth.isAuthenticated()) {
      router.push('/login')
      return
    }

    // Verify super admin role
    if (!auth.isSuperAdmin()) {
      // Regular users can't access admin panel
      router.push('/')
      return
    }

    // Load user data
    const userData = auth.getUser()
    setUser(userData)
    setLoading(false)
  }, [router])

  const handleLogout = async () => {
    await auth.logout()
  }

  // Show loading while verifying
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if redirecting
  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Page Title - will be overridden by page content */}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Panel Super Admin
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Gestión de todos los tenants
              </p>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {/* User Info */}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">
                  {user.nombre} {user.apellido}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                {user.nombre.charAt(0).toUpperCase()}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
              >
                Salir
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
