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
  UserX
} from 'lucide-react'
import { getActivityLabel, formatDate } from '../../lib/utils'

export default function MembersTable() {
  const { members, selectedMembers, selectMember, deselectMember } = useAppStore()
  const [expandedMember, setExpandedMember] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [filterType, setFilterType] = useState<'all' | 'socio' | 'jugador'>('all')

  // Filtrar miembros
  const filteredMembers = members.filter(member => {
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

  return (
    <div className="h-full flex flex-col">
      {/* Header con filtros */}
      <div className="glass-card glass-card-hover p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Users size={28} className="text-blue-600" />
            Socios y Jugadores
          </h2>
          <div className="text-sm text-gray-600">
            Total: {filteredMembers.length} de {members.length}
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              onChange={(e) => setFilterStatus(e.target.value as any)}
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
              onChange={(e) => setFilterType(e.target.value as any)}
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
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabla con scroll interno */}
      <div className="glass-card glass-card-hover flex-1 overflow-hidden">
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
              {filteredMembers.map((member) => (
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
                      <button className="text-blue-600 hover:text-blue-900">
                        {expandedMember === member.id ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
