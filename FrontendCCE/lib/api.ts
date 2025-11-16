const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface ApiMember {
  id: number
  nombre: string
  apellido: string
  dni: string
  fechaNacimiento: string
  telefono: string
  email: string
  actividad: 'Basquet' | 'Voley' | 'Karate' | 'Gimnasio' | 'Solo socio' // ✅ Actualizado con criterios unificados
  esJugador: boolean
  estado: 'Activo' | 'Inactivo' | 'Suspendido' // ✅ Estados unificados
  fechaIngreso: string
  nombreCompleto?: string
  edad?: number
}

export interface CreateMemberData {
  nombre: string
  apellido: string
  dni: string
  fechaNacimiento: string
  telefono: string
  email: string
  actividad: 'Basquet' | 'Voley' | 'Karate' | 'Gimnasio' | 'Solo socio' // ✅ Actualizado
  esJugador?: boolean
  estado?: 'Activo' | 'Inactivo' | 'Suspendido' // ✅ Estados unificados
}

export interface ApiCuota {
  id: number
  socioId: number
  periodo: string
  monto: number
  fechaVencimiento: string
  fechaPago: string | null
  estado: 'Pendiente' | 'Pagada' | 'Vencida' | 'Cancelada'
  metodoPago: 'Efectivo' | 'Transferencia' | 'MercadoPago' | 'Tarjeta' | null
  numeroRecibo: string | null
  observaciones: string | null
  linkPago: string | null
  mercadoPagoId: string | null
  cantidadRecordatorios: number
  fechaEnvioRecordatorio: string | null
  socio?: ApiMember
  estaVencida?: boolean
  diasVencimiento?: number
}

export interface PaymentStatistics {
  mesActual: {
    periodo: string
    estadisticas: Array<{
      estado: string
      cantidad: number
      total: number
    }>
  }
  general: {
    estadisticas: Array<{
      estado: string
      cantidad: number
      total: number
    }>
  }
  metodosPago: Array<{
    metodo: string
    cantidad: number
    total: number
  }>
  tendenciaMensual: Array<{
    periodo: string
    totalCuotas: number
    cuotasPagadas: number
    tasaCobranza: string
    ingresoReal: number
    ingresoEsperado: number
  }>
}

export interface SendPaymentLinksResponse {
  success: boolean
  data: {
    resultados: Array<{
      socioId: number
      cuotaId: number
      nombreSocio: string
      periodo: string
      linkPago: string
      email: {
        success: boolean
        messageId?: string
        error?: string
      } | null
    }>
    errores: Array<{
      socioId: number
      cuotaId?: number
      error: string
    }>
    resumen: {
      totalSocios: number
      exitosos: number
      conErrores: number
      emailsEnviados: number
    }
  }
  message: string
}

export interface SendRemindersResponse {
  success: boolean
  data: {
    resultados: Array<{
      cuotaId: number
      socioId: number
      nombreSocio: string
      periodo: string
      diasVencimiento: number
      email: {
        success: boolean
        messageId?: string
        error?: string
      } | null
    }>
    errores: Array<{
      cuotaId: number
      error: string
    }>
    resumen: {
      totalCuotasProcesadas: number
      recordatoriosEnviados: number
      errores: number
      emailsEnviados: number
    }
  }
  message: string
}

export interface ApiUser {
  id: number
  email: string
  nombre: string
  apellido: string
  rol: 'admin' | 'staff'
  activo: boolean
  nombreCompleto: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserData {
  email: string
  password: string
  nombre: string
  apellido: string
  rol: 'admin' | 'staff'
  activo?: boolean
}

export interface UpdateUserData {
  email?: string
  nombre?: string
  apellido?: string
  rol?: 'admin' | 'staff'
  activo?: boolean
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  // Get auth token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()
    console.log('API Response for', endpoint, ':', data)

    if (!response.ok) {
      // If unauthorized, clear auth data
      if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        // Redirect to login
        window.location.href = '/login'
      }

      const errorMessage = data?.message || `API Error: ${response.statusText}`
      throw new ApiError(response.status, errorMessage)
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    console.error('Network or parsing error:', error)
    throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const api = {
  socios: {
    getAll: async (): Promise<ApiMember[]> => {
      try {
        const response = await fetchApi('/api/socios')
        if (response && response.success && Array.isArray(response.data)) {
          return response.data
        }
        console.warn('Unexpected API response format:', response)
        return []
      } catch (error) {
        console.warn('Backend not available, returning empty array:', error)
        return []
      }
    },
    
    getById: async (id: number): Promise<ApiMember> => {
      const response = await fetchApi(`/api/socios/${id}`)
      return response.success ? response.data : response
    },
    
    create: async (data: CreateMemberData): Promise<{ success: boolean; data?: ApiMember; message?: string }> => {
      return await fetchApi('/api/socios', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    
    update: async (id: number, data: Partial<CreateMemberData>): Promise<{ success: boolean; data?: ApiMember; message?: string }> => {
      return await fetchApi(`/api/socios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },
    
    delete: async (id: number, force: boolean = false): Promise<{ success: boolean; message?: string }> => {
      const url = `/api/socios/${id}${force ? '?force=true' : ''}`
      return await fetchApi(url, {
        method: 'DELETE',
      })
    },
    
    getByActivity: async (actividad: string): Promise<ApiMember[]> => {
      const response = await fetchApi(`/api/socios?actividad=${actividad}`)
      return response.success && Array.isArray(response.data) ? response.data : []
    },

    sendPaymentEmail: async (memberData: { id: string; name: string; email: string; phone: string }): Promise<{ success: boolean; message?: string }> => {
      return await fetchApi('/api/socios/send-payment-email', {
        method: 'POST',
        body: JSON.stringify({ memberData }),
      })
    },
  },

  pagos: {
    // Get all payments with optional filters
    getAll: async (filters?: {
      estado?: 'Pendiente' | 'Pagada' | 'Vencida' | 'Cancelada'
      actividad?: string
      fechaDesde?: string
      fechaHasta?: string
      page?: number
      limit?: number
    }): Promise<{ success: boolean; data: ApiCuota[]; pagination?: any }> => {
      const params = new URLSearchParams()
      if (filters?.estado) params.append('estado', filters.estado)
      if (filters?.actividad) params.append('actividad', filters.actividad)
      if (filters?.fechaDesde) params.append('fechaDesde', filters.fechaDesde)
      if (filters?.fechaHasta) params.append('fechaHasta', filters.fechaHasta)
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const queryString = params.toString()
      return await fetchApi(`/api/pagos${queryString ? `?${queryString}` : ''}`)
    },

    // Get payment statistics
    getStatistics: async (): Promise<{ success: boolean; data: PaymentStatistics }> => {
      return await fetchApi('/api/pagos/estadisticas')
    },

    // Send payment links to selected members
    sendPaymentLinks: async (sociosIds: number[], incluirEmail: boolean = true): Promise<SendPaymentLinksResponse> => {
      return await fetchApi('/api/pagos/enviar-link', {
        method: 'POST',
        body: JSON.stringify({ sociosIds, incluirEmail }),
      })
    },

    // Send payment reminders for overdue payments
    sendReminders: async (): Promise<SendRemindersResponse> => {
      return await fetchApi('/api/pagos/programar-recordatorios', {
        method: 'POST',
      })
    },
  },

  usuarios: {
    // Get all users (admin only)
    getAll: async (): Promise<{ success: boolean; data: ApiUser[] }> => {
      return await fetchApi('/api/usuarios')
    },

    // Get user by ID
    getById: async (id: number): Promise<{ success: boolean; data: ApiUser }> => {
      return await fetchApi(`/api/usuarios/${id}`)
    },

    // Create new user (admin only)
    create: async (data: CreateUserData): Promise<{ success: boolean; data: ApiUser; message?: string }> => {
      return await fetchApi('/api/usuarios', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    // Update user (admin only)
    update: async (id: number, data: UpdateUserData): Promise<{ success: boolean; data: ApiUser; message?: string }> => {
      return await fetchApi(`/api/usuarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },

    // Delete user (admin only)
    delete: async (id: number): Promise<{ success: boolean; message?: string }> => {
      return await fetchApi(`/api/usuarios/${id}`, {
        method: 'DELETE',
      })
    },

    // Toggle user active status (admin only)
    toggleActive: async (id: number, activo: boolean): Promise<{ success: boolean; data: ApiUser }> => {
      return await fetchApi(`/api/usuarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ activo }),
      })
    },
  },
}

// ✅ MAPEO CORREGIDO: Backend → Frontend
export function transformApiMemberToFrontend(apiMember: ApiMember & { resumenPagos?: { vencidas: number; pendientes: number; pagadas: number; ultimaCuota?: { fechaPago: string; fechaVencimiento: string } } }): import('./store').Member {
  // ✅ Mapeo correcto de actividades (Backend → Frontend)
  const activityMap: Record<string, string> = {
    'Basquet': 'basketball',
    'Voley': 'volleyball', 
    'Karate': 'karate',
    'Gimnasio': 'gym',
    'Solo socio': 'solo-socio' // ✅ CORREGIDO: "Solo socio" → "solo-socio"
  }

  // ✅ Mapeo correcto de estados (Backend → Frontend)  
  const statusMap: Record<string, 'active' | 'inactive' | 'suspended'> = {
    'Activo': 'active',
    'Inactivo': 'inactive', 
    'Suspendido': 'suspended'
  }

  // Determine payment status from resumenPagos
  let paymentStatus: 'paid' | 'pending' | 'overdue' | 'cancelled' = 'pending'
  if (apiMember.resumenPagos) {
    if (apiMember.resumenPagos.vencidas > 0) {
      paymentStatus = 'overdue'
    } else if (apiMember.resumenPagos.pendientes > 0) {
      paymentStatus = 'pending'
    } else if (apiMember.resumenPagos.pagadas > 0) {
      paymentStatus = 'paid'
    }
  }

  return {
    id: apiMember.id.toString(),
    name: apiMember.nombreCompleto || `${apiMember.nombre} ${apiMember.apellido}`,
    email: apiMember.email,
    phone: apiMember.telefono,
    activity: activityMap[apiMember.actividad] as 'basketball' | 'volleyball' | 'karate' | 'gym' | 'solo-socio',
    status: statusMap[apiMember.estado] || 'inactive',
    paymentStatus,
    registrationDate: apiMember.fechaIngreso,
    membershipType: apiMember.esJugador ? 'jugador' : 'socio',
    lastPaymentDate: apiMember.resumenPagos?.ultimaCuota?.fechaPago || undefined,
    nextPaymentDate: apiMember.resumenPagos?.ultimaCuota ? 
      new Date(new Date(apiMember.resumenPagos.ultimaCuota.fechaVencimiento).getTime() + 30*24*60*60*1000).toISOString().split('T')[0] : 
      undefined
  }
}

// ✅ MAPEO CORREGIDO: Frontend → Backend
export function transformFrontendMemberToApi(member: Omit<import('./store').Member, 'id'> & { dni?: string; birthDate?: string }): CreateMemberData {
  // ✅ Mapeo correcto de actividades (Frontend → Backend)
  const activityMap: Record<string, string> = {
    'basketball': 'Basquet',
    'volleyball': 'Voley',
    'karate': 'Karate',
    'gym': 'Gimnasio',
    'solo-socio': 'Solo socio' // ✅ CORREGIDO: "solo-socio" → "Solo socio"
  }

  // ✅ Mapeo correcto de estados (Frontend → Backend)
  const statusMap: Record<string, 'Activo' | 'Inactivo' | 'Suspendido'> = {
    'active': 'Activo',
    'inactive': 'Inactivo',
    'suspended': 'Suspendido'
  }

  // Extract first and last name
  const nameParts = member.name.trim().split(' ')
  const nombre = nameParts[0] || ''
  const apellido = nameParts.slice(1).join(' ') || 'Sin apellido'

  return {
    nombre,
    apellido,
    dni: member.dni || '00000000', // Use real DNI from form or fallback
    fechaNacimiento: member.birthDate || '1990-01-01', // Use real birth date from form or fallback
    telefono: member.phone,
    email: member.email,
    actividad: (activityMap[member.activity || 'solo-socio'] || 'Solo socio') as CreateMemberData['actividad'],
    esJugador: member.membershipType === 'jugador',
    estado: statusMap[member.status] || 'Activo'
  }
}