'use client'

import { useEffect } from 'react'
import { useAppStore } from '../lib/store'
import Sidebar from '../components/ui/Sidebar'
import Header from '../components/ui/Header'
import Dashboard from '../components/dashboard/Dashboard'
import MembersTable from '../components/members/MembersTable'
import PaymentsManagement from '../components/payments/PaymentsManagement'
import RegistrationForm from '../components/registration/RegistrationForm'
import DarkModeProvider from '../components/DarkModeProvider'

export default function Home() {
  const { currentPage, sidebarCollapsed } = useAppStore()

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'members':
        return <MembersTable />
      case 'payments':
        return <PaymentsManagement />
      case 'registration':
        return <RegistrationForm />
      default:
        return <Dashboard />
    }
  }

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
