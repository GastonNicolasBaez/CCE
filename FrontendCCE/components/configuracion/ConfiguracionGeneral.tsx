'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Building,
  Mail,
  Phone,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useAppStore } from '../../lib/store'
import { Card, Button, InfoCard } from '@/components/ui'

export default function ConfiguracionGeneral() {
  const { tenant, user } = useAppStore()
  const [formData, setFormData] = useState({
    nombreClub: tenant?.nombre || 'Club Comandante Espora',
    emailContacto: user?.email || '',
    telefono: '',
    direccion: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSaveSuccess(false)

    try {
      // TODO: Implement API call to save general configuration
      // await api.configuracion.updateGeneral(formData)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la configuración')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card variant="form" padding="default">
      <div className="flex items-center gap-2 mb-6">
        <Building size={20} className="text-blue-600 dark:text-blue-400" />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Información del Club
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre del Club */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre del Club <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formData.nombreClub}
                onChange={(e) => setFormData({ ...formData, nombreClub: e.target.value })}
                required
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Nombre del club"
              />
            </div>
          </div>

          {/* Email de Contacto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email de Contacto <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={formData.emailContacto}
                onChange={(e) => setFormData({ ...formData, emailContacto: e.target.value })}
                required
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="contacto@club.com"
              />
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Teléfono
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="+54 9 11 1234-5678"
              />
            </div>
          </div>

          {/* Dirección */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dirección
            </label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Calle, número, ciudad, provincia"
            />
          </div>
        </div>

        {/* Info Card */}
        <InfoCard variant="info">
          <div>
            <p className="font-medium mb-2">Información importante:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Esta información se usará en emails y documentos oficiales</li>
              <li>El email de contacto recibirá notificaciones importantes</li>
              <li>Los cambios se aplicarán inmediatamente</li>
            </ul>
          </div>
        </InfoCard>

        {/* Error Message */}
        {error && (
          <InfoCard variant="error">
            <p>{error}</p>
          </InfoCard>
        )}

        {/* Success Message */}
        {saveSuccess && (
          <InfoCard variant="success" icon={CheckCircle}>
            <p>Configuración guardada correctamente</p>
          </InfoCard>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            icon={isSaving ? Loader2 : Save}
            disabled={isSaving}
            loading={isSaving}
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
