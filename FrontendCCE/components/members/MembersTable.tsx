'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../lib/store'
import { 
  Users, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  CreditCard, 
  Activity, 
  ChevronDown, 
  ChevronUp,
  UserCheck,
  UserX,
  Edit,
  Trash2
} from 'lucide-react'
import { getActivityLabel, formatDate } from '../../lib/utils'
import { useUpdateMember, useDeleteMember } from '../../lib/hooks'
import ConfirmationModal from '../ui/ConfirmationModal'
import NotificationModal from '../ui/NotificationModal'

export default function MembersTable() {
  const { members } = useAppStore()
  const { updateMemberData } = useUpdateMember()
  const { deleteMemberData } = useDeleteMember()
  const [expandedMember, setExpandedMember] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [filterType, setFilterType] = useState<'all' | 'socio' | 'jugador'>('all')
  const [editingMember, setEditingMember] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active' as 'active' | 'inactive'
  })
  
  // Modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'danger' | 'warning' | 'info',
    onConfirm: () => {},
    showForceOption: false,
    onForceConfirm: () => {},
    memberToDelete: null as string | null
  })
  
  const [notification, setNotification] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info'
  })

  // Filtrar miembros - validar que members sea un array
  const membersArray = Array.isArray(members) ? members : []
  const filteredMembers = membersArray.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus
    const matchesType = filterType === 'all' || member.membershipType === filterType
    
    return matchesSearch && matchesStatus && matchesType
  })

  const toggleExpanded = (memberId: string) => {
    setExpandedMember(expandedMember === memberId ? null : memberId)
  }

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado'
      case 'pending': return 'Pendiente'
      case 'overdue': return 'Vencido'
      default: return 'Desconocido'
    }
  }

  const handleEditClick = (member: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingMember(member.id)
    setEditForm({
      name: member.name,
      email: member.email,
      phone: member.phone,
      status: member.status
    })
  }

  const handleDeleteClick = (memberId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const member = membersArray.find(m => m.id === memberId)
    
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Miembro',
      message: `¿Estás seguro de que deseas eliminar a ${member?.name}? Esta acción no se puede deshacer.`,
      type: 'danger',
      onConfirm: () => performDelete(memberId, false),
      showForceOption: false,
      onForceConfirm: () => {},
      memberToDelete: memberId
    })
  }

  const performDelete = async (memberId: string, force: boolean) => {
    const result = await deleteMemberData(memberId, force)
    
    setConfirmModal(prev => ({ ...prev, isOpen: false }))
    
    if (result.success) {
      setNotification({
        isOpen: true,
        title: 'Éxito',
        message: result.message || 'Miembro eliminado exitosamente',
        type: 'success'
      })
    } else {
      // Check if it's a "pending payments" error
      if (result.message?.includes('cuotas pendientes') && !force) {
        const member = membersArray.find(m => m.id === memberId)
        setConfirmModal({
          isOpen: true,
          title: 'Miembro con Cuotas Pendientes',
          message: `${member?.name} tiene cuotas pendientes. ${result.message}`,
          type: 'warning',
          onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false })),
          showForceOption: true,
          onForceConfirm: () => performDelete(memberId, true),
          memberToDelete: memberId
        })
      } else {
        setNotification({
          isOpen: true,
          title: 'Error',
          message: result.message || 'Error al eliminar el miembro',
          type: 'error'
        })
      }
    }
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingMember) {
      const result = await updateMemberData(editingMember, editForm)
      
      if (result.success) {
        setEditingMember(null)
        setEditForm({ name: '', email: '', phone: '', status: 'active' })
        setNotification({
          isOpen: true,
          title: 'Éxito',
          message: result.message || 'Miembro actualizado exitosamente',
          type: 'success'
        })
      } else {
        setNotification({
          isOpen: true,
          title: 'Error',
          message: result.message || 'Error al actualizar el miembro',
          type: 'error'
        })
      }
    }
  }

  const handleCancelEdit = () => {
    setEditingMember(null)
    setEditForm({ name: '', email: '', phone: '', status: 'active' })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header con filtros compacto */}
      <div className="glass-card glass-card-hover p-4 mb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            Socios y Jugadores
          </h2>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Total: {filteredMembers.length} de {membersArray.length}
          </div>
        </div>

        {/* Filtros compactos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input w-full"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="form-input w-full"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'socio' | 'jugador')}
              className="form-input w-full"
            >
              <option value="all">Todos los tipos</option>
              <option value="socio">Solo Socios</option>
              <option value="jugador">Solo Jugadores</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterStatus('all')
                setFilterType('all')
              }}
              className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabla con scroll interno */}
      <div className="glass-card glass-card-hover flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Miembro
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pago
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Registro
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-gray-200/50">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Users size={48} className="mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {membersArray.length === 0 ? 'No hay miembros registrados' : 'No se encontraron resultados'}
                      </h3>
                      <p className="text-sm text-gray-500 max-w-sm">
                        {membersArray.length === 0 
                          ? 'Comienza registrando tu primer socio o jugador del club.'
                          : 'Intenta modificar los filtros de búsqueda para encontrar lo que buscas.'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                <>
                  <tr 
                    key={member.id}
                    className="hover:bg-white/30 transition-colors cursor-pointer"
                    onClick={() => toggleExpanded(member.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
                            <User size={20} className="text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {member.membershipType === 'socio' ? (
                          <UserCheck size={16} className="text-blue-600" />
                        ) : (
                          <Activity size={16} className="text-green-600" />
                        )}
                        <span className="text-sm text-gray-900">
                          {member.membershipType === 'socio' ? 'Socio' : 'Jugador'}
                        </span>
                        {member.activity && member.membershipType === 'jugador' && (
                          <span className="text-xs text-gray-500">
                            ({getActivityLabel(member.activity)})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                        {member.status === 'active' ? (
                          <>
                            <UserCheck size={12} className="mr-1" />
                            Activo
                          </>
                        ) : (
                          <>
                            <UserX size={12} className="mr-1" />
                            Inactivo
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(member.paymentStatus)}`}>
                        <CreditCard size={12} className="mr-1" />
                        {getPaymentStatusText(member.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(member.registrationDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleEditClick(member, e)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Editar miembro"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(member.id, e)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Eliminar miembro"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 p-1 rounded">
                          {expandedMember === member.id ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Fila expandida con detalles */}
                  <AnimatePresence>
                    {expandedMember === member.id && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-blue-50/50"
                      >
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Información personal */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <User size={16} className="text-blue-600" />
                                Información Personal
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Mail size={14} className="text-gray-500" />
                                  <span className="text-gray-700">{member.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone size={14} className="text-gray-500" />
                                  <span className="text-gray-700">{member.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar size={14} className="text-gray-500" />
                                  <span className="text-gray-700">
                                    Registro: {formatDate(member.registrationDate)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Información de membresía */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <CreditCard size={16} className="text-green-600" />
                                Información de Membresía
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500">Tipo:</span>
                                  <span className="text-gray-700 font-medium">
                                    {member.membershipType === 'socio' ? 'Socio' : 'Jugador'}
                                  </span>
                                </div>
                                {member.activity && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500">Actividad:</span>
                                    <span className="text-gray-700 font-medium">
                                      {getActivityLabel(member.activity)}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500">Estado:</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                                    {member.status === 'active' ? 'Activo' : 'Inactivo'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500">Pago:</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(member.paymentStatus)}`}>
                                    {getPaymentStatusText(member.paymentStatus)}
                                  </span>
                                </div>
                                {member.lastPaymentDate && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500">Último pago:</span>
                                    <span className="text-gray-700">
                                      {formatDate(member.lastPaymentDate)}
                                    </span>
                                  </div>
                                )}
                                {member.nextPaymentDate && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500">Próximo pago:</span>
                                    <span className="text-gray-700">
                                      {formatDate(member.nextPaymentDate)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de edición */}
      <AnimatePresence>
        {editingMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleCancelEdit}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Editar Miembro
              </h3>
              
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estado
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value as 'active' | 'inactive'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Guardar Cambios
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modales */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.showForceOption ? "Cancelar" : "Eliminar"}
        showForceOption={confirmModal.showForceOption}
        onForceConfirm={confirmModal.onForceConfirm}
        forceText="Eliminar con Cuotas"
      />

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  )
}
