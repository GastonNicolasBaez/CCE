'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  AlertCircle,
  CheckCircle,
  Clock,
  Send,
  Mail,
  Loader2,
  DollarSign,
  TrendingUp,
  X
} from 'lucide-react'
import { api, ApiCuota, SendPaymentLinksResponse, SendRemindersResponse } from '../../lib/api'
import { getActivityLabel, formatCurrency } from '../../lib/utils'

export default function PaymentsManagement() {
  const [cuotas, setCuotas] = useState<ApiCuota[]>([])
  const [selectedCuotas, setSelectedCuotas] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'Pendiente' | 'Vencida'>('all')
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
    details?: string[]
  } | null>(null)



  // Fetch cuotas on mount
  useEffect(() => {
    fetchCuotas()
  }, [filter])

  const fetchCuotas = async () => {
    try {
      setLoading(true)
      const response = await api.pagos.getAll({
        estado: filter === 'all' ? undefined : filter,
        page: 1,
        limit: 100
      })

      if (response.success) {
        setCuotas(response.data)
      }
    } catch (error) {
      console.error('Error fetching cuotas:', error)
      showNotification('error', 'Error al cargar los pagos')
    } finally {
      setLoading(false)
    }
  }

  // Filter pending and overdue cuotas
  const pendingCuotas = useMemo(() => {
    return cuotas.filter(cuota =>
      cuota.estado === 'Pendiente' || cuota.estado === 'Vencida'
    )
  }, [cuotas])

  const handleSelectCuota = (socioId: number) => {
    setSelectedCuotas(prev =>
      prev.includes(socioId)
        ? prev.filter(id => id !== socioId)
        : [...prev, socioId]
    )
  }

  const handleSelectAll = () => {
    if (selectedCuotas.length === getUniqueSocioIds().length) {
      setSelectedCuotas([])
    } else {
      setSelectedCuotas(getUniqueSocioIds())
    }
  }

  // Get unique socio IDs from pending cuotas
  const getUniqueSocioIds = () => {
    const socioIds = new Set<number>()
    pendingCuotas.forEach(cuota => {
      if (cuota.socio) {
        socioIds.add(cuota.socio.id)
      }
    })
    return Array.from(socioIds)
  }

  const getTotalAmount = () => {
    return selectedCuotas.reduce((total, socioId) => {
      const cuota = pendingCuotas.find(c => c.socio?.id === socioId)
      return total + (cuota?.monto || 0)
    }, 0)
  }

  const showNotification = (type: 'success' | 'error' | 'info', message: string, details?: string[]) => {
    setNotification({ type, message, details })
    setTimeout(() => setNotification(null), 8000)
  }

  const handleSendPaymentLinks = async () => {
    if (selectedCuotas.length === 0) {
      showNotification('info', 'Por favor selecciona al menos un socio')
      return
    }

    try {
      setActionLoading(true)
      const response: SendPaymentLinksResponse = await api.pagos.sendPaymentLinks(selectedCuotas, true)

      if (response.success) {
        const { resumen, errores } = response.data
        const details = [
          `✓ Links enviados: ${resumen.exitosos}`,
          `✓ Emails enviados: ${resumen.emailsEnviados}`,
          errores.length > 0 ? `⚠ Errores: ${resumen.conErrores}` : ''
        ].filter(Boolean)

        showNotification(
          errores.length > 0 ? 'info' : 'success',
          response.message,
          details
        )

        // Refresh data and clear selection
        await fetchCuotas()
        setSelectedCuotas([])
      }
    } catch (error) {
      console.error('Error sending payment links:', error)
      showNotification('error', 'Error al enviar links de pago', [(error as Error).message])
    } finally {
      setActionLoading(false)
    }
  }

  const handleSendReminders = async () => {
    try {
      setActionLoading(true)
      const response: SendRemindersResponse = await api.pagos.sendReminders()

      if (response.success) {
        const { resumen, errores } = response.data
        const details = [
          `✓ Recordatorios enviados: ${resumen.recordatoriosEnviados}`,
          `✓ Emails enviados: ${resumen.emailsEnviados}`,
          errores.length > 0 ? `⚠ Errores: ${resumen.errores}` : ''
        ].filter(Boolean)

        showNotification(
          errores.length > 0 ? 'info' : 'success',
          response.message,
          details
        )

        // Refresh data
        await fetchCuotas()
      }
    } catch (error) {
      console.error('Error sending reminders:', error)
      showNotification('error', 'Error al enviar recordatorios', [(error as Error).message])
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (estado: string) => {
    const badges: Record<string, string> = {
      'Pendiente': 'px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-xs font-medium',
      'Vencida': 'px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-xs font-medium',
      'Pagada': 'px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium',
      'Cancelada': 'px-2 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 rounded-full text-xs font-medium'
    }
    return badges[estado] || badges['Pendiente']
  }

  // Group cuotas by socio
  const groupedCuotas = useMemo(() => {
    const groups = new Map<number, ApiCuota[]>()
    pendingCuotas.forEach(cuota => {
      if (cuota.socio) {
        const existing = groups.get(cuota.socio.id) || []
        groups.set(cuota.socio.id, [...existing, cuota])
      }
    })
    return groups
  }, [pendingCuotas])



  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Notification Banner */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl border ${
              notification.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : notification.type === 'error'
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`font-medium text-sm ${
                  notification.type === 'success'
                    ? 'text-green-800 dark:text-green-300'
                    : notification.type === 'error'
                    ? 'text-red-800 dark:text-red-300'
                    : 'text-blue-800 dark:text-blue-300'
                }`}>
                  {notification.message}
                </p>
                {notification.details && (
                  <ul className="mt-2 text-xs space-y-1">
                    {notification.details.map((detail, idx) => (
                      <li key={idx} className={
                        notification.type === 'success'
                          ? 'text-green-700 dark:text-green-400'
                          : notification.type === 'error'
                          ? 'text-red-700 dark:text-red-400'
                          : 'text-blue-700 dark:text-blue-400'
                      }>
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header compacto */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Estado de Pagos</h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">Gestiona las cuotas pendientes y vencidas</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSendReminders}
            disabled={actionLoading || loading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-xs rounded-lg transition-colors"
          >
            {actionLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Bell size={14} />
            )}
            <span className="hidden sm:inline">Enviar Recordatorios</span>
          </button>
          <button
            onClick={handleSendPaymentLinks}
            disabled={selectedCuotas.length === 0 || actionLoading || loading}
            className="flex items-center gap-2 px-3 py-2 bg-accent hover:bg-accent/90 disabled:bg-gray-400 text-white text-xs rounded-lg transition-colors"
          >
            {actionLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            <span className="hidden sm:inline">
              Enviar Links ({selectedCuotas.length})
            </span>
          </button>
        </div>
      </div>

      {/* Summary Cards compactas */}
      <div className="grid grid-cols-3 gap-3 flex-shrink-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="neumorphism-card p-3 text-center"
        >
          <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mx-auto mb-1">
            <Clock size={16} className="text-yellow-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            {loading ? '...' : pendingCuotas.filter(c => c.estado === 'Pendiente').length}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">Pendientes</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="neumorphism-card p-3 text-center"
        >
          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mx-auto mb-1">
            <AlertCircle size={16} className="text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            {loading ? '...' : pendingCuotas.filter(c => c.estado === 'Vencida').length}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">Vencidas</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="neumorphism-card p-3 text-center"
        >
          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-1">
            <DollarSign size={16} className="text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            {loading ? '...' : formatCurrency(getTotalAmount())}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">Total Seleccionado</p>
        </motion.div>
      </div>

      {/* Payments Table */}
      <div className="neumorphism-card overflow-hidden flex-1 min-h-0">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Socios con Pagos Pendientes
            </h3>
            <button
              onClick={handleSelectAll}
              disabled={loading}
              className="text-xs text-primary hover:text-primary-dark dark:text-blue-400 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
            >
              {selectedCuotas.length === getUniqueSocioIds().length && getUniqueSocioIds().length > 0
                ? 'Deseleccionar Todo'
                : 'Seleccionar Todo'}
            </button>
          </div>
        </div>

        <div className="overflow-auto h-full">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando pagos...</span>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedCuotas.length === getUniqueSocioIds().length &&
                        getUniqueSocioIds().length > 0
                      }
                      onChange={handleSelectAll}
                      className="w-3 h-3 text-primary bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary focus:ring-2"
                    />
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Socio
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Actividad
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Periodo
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Estado
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Monto
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Vencimiento
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {Array.from(groupedCuotas.entries()).map(([socioId, cuotasList]) => {
                  const firstCuota = cuotasList[0]
                  const socio = firstCuota.socio
                  if (!socio) return null

                  return (
                    <motion.tr
                      key={socioId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedCuotas.includes(socioId)}
                          onChange={() => handleSelectCuota(socioId)}
                          className="w-3 h-3 text-primary bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary focus:ring-2"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                            {socio.nombreCompleto || `${socio.nombre} ${socio.apellido}`}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{socio.email}</div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                          {getActivityLabel(socio.actividad)}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {cuotasList.map(c => c.periodo).join(', ')}
                        </div>
                        {cuotasList.length > 1 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {cuotasList.length} cuotas
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span className={getStatusBadge(firstCuota.estado)}>
                          {firstCuota.estado}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {formatCurrency(cuotasList.reduce((sum, c) => sum + c.monto, 0))}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(firstCuota.fechaVencimiento).toLocaleDateString('es-AR')}
                        {firstCuota.estaVencida && firstCuota.diasVencimiento && (
                          <div className="text-red-600 dark:text-red-400 font-medium">
                            {firstCuota.diasVencimiento} días vencido
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {!loading && pendingCuotas.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle size={32} className="mx-auto text-green-400 mb-2" />
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
              ¡Excelente!
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No hay pagos pendientes o vencidos
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
