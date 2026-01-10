'use client'

import React, { useEffect, useState } from 'react'
import { useAppStore } from '../lib/store'
import { getTenantSlugFromSubdomain } from '../lib/auth'
import Sidebar from '../components/ui/Sidebar'
import Header from '../components/ui/Header'
import Dashboard from '../components/dashboard/Dashboard'
import MembersTable from '../components/members/MembersTable'
import PaymentsManagement from '../components/payments/PaymentsManagement'
import RegistrationForm from '../components/registration/RegistrationForm'
import ActividadesPage from './actividades/page'
import ConfiguracionPage from './configuracion/page'
import DarkModeProvider from '../components/DarkModeProvider'
import LandingPage from '../components/LandingPage'

export default function Home() {
  const { currentPage, sidebarCollapsed } = useAppStore()
  const [tenantSlug, setTenantSlug] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Detect if we're on a subdomain
    const slug = getTenantSlugFromSubdomain()
    setTenantSlug(slug)
    setIsLoading(false)
  }, [])

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'members':
        return <MembersTable />
      case 'activities':
        return <ActividadesPage />
      case 'payments':
        return <PaymentsManagement />
      case 'registration':
        return <RegistrationForm />
      case 'configuracion':
        return <ConfiguracionPage />
      default:
        return <Dashboard />
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#002C6F] to-[#001840]">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  // Show landing page if no tenant (main domain)
  if (!tenantSlug) {
    return <LandingPage />
  }

  // Show dashboard for tenant subdomain
  return (
    <DarkModeProvider>
      <div className="h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden transition-colors duration-300">
        <Sidebar />
        <Header />

        <main
          className={`h-full pt-16 sm:pt-20 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-16 sm:ml-20' : 'ml-64'
          }`}
        >
          <div className="h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] p-3 sm:p-6 overflow-hidden">
            {renderContent()}
          </div>
        </main>
      </div>
    </DarkModeProvider>
  )
}
