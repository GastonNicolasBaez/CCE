'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { useAppStore } from '../../lib/store'
import { getActivityLabel, getStatusBadge, formatCurrency } from '../../lib/utils'

export default function PaymentsManagement() {
  const { 
    members, 
    selectedMembers, 
    toggleMemberSelection, 
    clearSelectedMembers
  } = useAppStore()
  


  // Filtrar miembros con pagos pendientes o vencidos
  const pendingMembers = useMemo(() => {
    try {
      return members.filter(member => 
        member.paymentStatus === 'pending' || member.paymentStatus === 'overdue'
      )
    } catch (error) {
      console.error('Error filtering members:', error)
      return []
    }
  }, [members])

  const handleSelectMember = (memberId: string) => {
    try {
      toggleMemberSelection(memberId)
    } catch (error) {
      console.error('Error selecting member:', error)
    }
  }

  const handleSelectAll = () => {
    try {
      if (selectedMembers.length === pendingMembers.length) {
        clearSelectedMembers()
      } else {
        // Select all pending members
        pendingMembers.forEach(member => {
          if (!selectedMembers.includes(member.id)) {
            toggleMemberSelection(member.id)
          }
        })
      }
    } catch (error) {
      console.error('Error selecting all members:', error)
    }
  }



  const getTotalAmount = () => {
    try {
      return selectedMembers.reduce((total, memberId) => {
        const member = members.find(m => m.id === memberId)
        return total + (member ? 5000 : 0) // Valor de cuota fijo por ahora
      }, 0)
    } catch (error) {
      console.error('Error calculating total amount:', error)
      return 0
    }
  }



  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Header compacto */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Estado de Pagos</h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">Gestiona las cuotas pendientes y vencidas</p>
        </div>
        
        {/* Placeholder for future features */}
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-accent" />
          <span className="text-xs text-gray-600 dark:text-gray-400">Gestión de Pagos</span>
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
            {pendingMembers.filter(m => m.paymentStatus === 'pending').length}
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
            {pendingMembers.filter(m => m.paymentStatus === 'overdue').length}
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
            <CheckCircle size={16} className="text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            {formatCurrency(getTotalAmount())}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">Total Seleccionado</p>
        </motion.div>
      </div>





      {/* Members Table */}
      <div className="neumorphism-card overflow-hidden flex-1 min-h-0">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Socios con Pagos Pendientes
            </h3>
            <button
              onClick={handleSelectAll}
              className="text-xs text-primary hover:text-primary-dark transition-colors"
            >
              {selectedMembers.length === pendingMembers.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
            </button>
          </div>
        </div>

        <div className="overflow-auto h-full">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={selectedMembers.length === pendingMembers.length && pendingMembers.length > 0}
                    onChange={handleSelectAll}
                    className="w-3 h-3 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2"
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Socio
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Actividad
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
            <tbody className="divide-y divide-gray-200">
              {pendingMembers.map((member) => (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.id)}
                      onChange={() => handleSelectMember(member.id)}
                      className="w-3 h-3 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{member.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{member.email}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                      {getActivityLabel(member.activity)}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={getStatusBadge(member.paymentStatus)}>
                      {member.paymentStatus === 'pending' ? 'Pendiente' : 'Vencido'}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {formatCurrency(5000)}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                    {member.paymentStatus === 'overdue' ? 'Vencido' : '15 días'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {pendingMembers.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle size={32} className="mx-auto text-green-400 mb-2" />
            <h3 className="text-base font-medium text-gray-900 mb-1">
              ¡Excelente!
            </h3>
            <p className="text-sm text-gray-500">
              No hay pagos pendientes o vencidos
            </p>
          </div>
        )}
      </div>


    </div>
  )
}
