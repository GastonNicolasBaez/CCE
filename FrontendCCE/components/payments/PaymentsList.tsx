'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard,
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  AlertTriangle,
  Clock,
  XCircle,
  Search,
  Filter,
  Loader2,
  Receipt
} from 'lucide-react'
import { api, type ApiCuota } from '../../lib/api'
import RegisterPaymentModal from './RegisterPaymentModal'

type TabType = 'pendientes' | 'vencidas' | 'pagadas'

export default function PaymentsList() {
  const [activeTab, setActiveTab] = useState<TabType>('pendientes')
  const [cuotas, setCuotas] = useState<ApiCuota[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCuota, setSelectedCuota] = useState<ApiCuota | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadCuotas()
  }, [activeTab])

  const loadCuotas = async () => {
    setIsLoading(true)
    setError(null)

    try {
      let data: ApiCuota[] = []

      switch (activeTab) {
        case 'pendientes':
          data = await api.cuotas.getPendientes()
          break
        case 'vencidas':
          data = await api.cuotas.getVencidas()
          break
        case 'pagadas':
          data = await api.cuotas.getPagadas()
          break
      }

      setCuotas(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar cuotas')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterPayment = (cuota: ApiCuota) => {
    setSelectedCuota(cuota)
    setIsModalOpen(true)
  }

  const handlePaymentSuccess = () => {
    setIsModalOpen(false)
    setSelectedCuota(null)
    loadCuotas()
  }

  const filteredCuotas = cuotas.filter((cuota) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    const socioNombre = cuota.socio
      ? `${cuota.socio.nombre} ${cuota.socio.apellido}`.toLowerCase()
      : ''
    return (
      socioNombre.includes(searchLower) ||
      cuota.periodo.includes(searchLower) ||
      cuota.numeroRecibo?.toLowerCase().includes(searchLower)
    )
  })

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Pagada':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" />
            Pagada
          </span>
        )
      case 'Pendiente':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock size={12} className="mr-1" />
            Pendiente
          </span>
        )
      case 'Vencida':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle size={12} className="mr-1" />
            Vencida
          </span>
        )
      case 'Cancelada':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircle size={12} className="mr-1" />
            Cancelada
          </span>
        )
      default:
        return null
    }
  }

  const formatPeriodo = (periodo: string) => {
    const [year, month] = periodo.split('-')
    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre'
    ]
    return `${monthNames[parseInt(month) - 1]} ${year}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-orange-500 dark:text-orange-400 mb-2">
          Gestión de Cuotas
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Administra los pagos mensuales de los socios
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('pendientes')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'pendientes'
              ? 'bg-yellow-500 text-white shadow-md'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Clock size={16} className="inline mr-1" />
          Pendientes
        </button>
        <button
          onClick={() => setActiveTab('vencidas')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'vencidas'
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <AlertTriangle size={16} className="inline mr-1" />
          Vencidas
        </button>
        <button
          onClick={() => setActiveTab('pagadas')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'pagadas'
              ? 'bg-green-500 text-white shadow-md'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <CheckCircle size={16} className="inline mr-1" />
          Pagadas
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por socio, periodo o recibo..."
            className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 size={48} className="animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : filteredCuotas.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">
                No hay cuotas {activeTab}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? 'No se encontraron resultados para tu búsqueda'
                  : 'Las cuotas aparecerán aquí una vez generadas'}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <div className="neumorphism-card">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Socio
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Periodo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Monto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Vencimiento
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    {activeTab === 'pagadas' && (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Método
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Fecha Pago
                        </th>
                      </>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCuotas.map((cuota) => (
                    <tr
                      key={cuota.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                              {cuota.socio
                                ? `${cuota.socio.nombre} ${cuota.socio.apellido}`
                                : 'N/A'}
                            </div>
                            {cuota.numeroRecibo && (
                              <div className="text-xs text-gray-500">
                                {cuota.numeroRecibo}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                          <Calendar size={14} className="text-gray-400" />
                          {formatPeriodo(cuota.periodo)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-gray-200">
                          <DollarSign size={14} className="text-green-600" />
                          ${cuota.monto.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {formatDate(cuota.fechaVencimiento)}
                      </td>
                      <td className="px-4 py-3">{getEstadoBadge(cuota.estado)}</td>
                      {activeTab === 'pagadas' && (
                        <>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                            {cuota.metodoPago || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                            {cuota.fechaPago ? formatDate(cuota.fechaPago) : 'N/A'}
                          </td>
                        </>
                      )}
                      <td className="px-4 py-3">
                        {(activeTab === 'pendientes' || activeTab === 'vencidas') && (
                          <button
                            onClick={() => handleRegisterPayment(cuota)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <Receipt size={14} />
                            Registrar Pago
                          </button>
                        )}
                        {activeTab === 'pagadas' && cuota.numeroRecibo && (
                          <button className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                            <Receipt size={14} />
                            Ver Recibo
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Register Payment Modal */}
      {selectedCuota && (
        <RegisterPaymentModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedCuota(null)
          }}
          cuota={selectedCuota}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}
