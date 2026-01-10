'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Building,
  DollarSign,
  CreditCard,
  Bell
} from 'lucide-react'
import ConfiguracionGeneral from '../../components/configuracion/ConfiguracionGeneral'
import ConfiguracionCuotas from '../../components/configuracion/ConfiguracionCuotas'

type TabType = 'general' | 'cuotas' | 'pagos' | 'notificaciones'

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<TabType>('general')

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Building, description: 'Datos del club' },
    { id: 'cuotas' as const, label: 'Cuotas', icon: DollarSign, description: 'Montos y vencimientos' },
    { id: 'pagos' as const, label: 'Pagos', icon: CreditCard, description: 'MercadoPago y métodos' },
    { id: 'notificaciones' as const, label: 'Notificaciones', icon: Bell, description: 'Emails y recordatorios' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <ConfiguracionGeneral />
      case 'cuotas':
        return <ConfiguracionCuotas />
      case 'pagos':
        return (
          <div className="p-8 text-center text-gray-500">
            <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Configuración de pagos disponible próximamente</p>
          </div>
        )
      case 'notificaciones':
        return (
          <div className="p-8 text-center text-gray-500">
            <Bell size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Configuración de notificaciones disponible próximamente</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <Settings size={24} className="text-orange-500" />
          <h1 className="text-2xl font-bold text-orange-500 dark:text-orange-400">
            Configuración
          </h1>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Administra la configuración general del club y las cuotas
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon size={18} />
              <div className="text-left">
                <div>{tab.label}</div>
                <div className={`text-xs ${activeTab === tab.id ? 'text-white/80' : 'text-gray-500'}`}>
                  {tab.description}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
