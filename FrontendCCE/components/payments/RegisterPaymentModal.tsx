'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  DollarSign,
  Calendar,
  CreditCard,
  User,
  Receipt,
  Save,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { api, type ApiCuota } from '../../lib/api'

interface RegisterPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  cuota: ApiCuota
  onSuccess: () => void
}

export default function RegisterPaymentModal({
  isOpen,
  onClose,
  cuota,
  onSuccess
}: RegisterPaymentModalProps) {
  const [formData, setFormData] = useState({
    metodoPago: 'Efectivo' as 'Efectivo' | 'Transferencia' | 'MercadoPago' | 'Tarjeta',
    fechaPago: new Date().toISOString().split('T')[0],
    numeroRecibo: '',
    observaciones: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await api.cuotas.update(cuota.id, {
        estado: 'Pagada',
        ...formData
      })

      if (response.success) {
        onSuccess()
      } else {
        throw new Error(response.message || 'Error al registrar el pago')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar el pago')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatPeriodo = (periodo: string) => {
    const [year, month] = periodo.split('-')
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    return `${monthNames[parseInt(month) - 1]} ${year}`
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Registrar Pago
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {cuota.socio ? `${cuota.socio.nombre} ${cuota.socio.apellido}` : 'N/A'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Cuota Info */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Periodo:</span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {formatPeriodo(cuota.periodo)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Monto:</span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    ${cuota.monto.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Método de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Método de Pago <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Efectivo', 'Transferencia', 'MercadoPago', 'Tarjeta'] as const).map((metodo) => (
                  <button
                    key={metodo}
                    type="button"
                    onClick={() => setFormData({ ...formData, metodoPago: metodo })}
                    className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                      formData.metodoPago === metodo
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <CreditCard size={16} className="inline mr-1" />
                    {metodo}
                  </button>
                ))}
              </div>
            </div>

            {/* Fecha de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de Pago <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={formData.fechaPago}
                  onChange={(e) => setFormData({ ...formData, fechaPago: e.target.value })}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Número de Recibo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Número de Recibo (Opcional)
              </label>
              <div className="relative">
                <Receipt size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={formData.numeroRecibo}
                  onChange={(e) => setFormData({ ...formData, numeroRecibo: e.target.value })}
                  placeholder="Ej: CCE-001"
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Se generará automáticamente si se deja vacío
              </p>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Observaciones (Opcional)
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                rows={3}
                placeholder="Notas adicionales sobre el pago..."
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex items-start gap-2">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Registrar Pago
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
