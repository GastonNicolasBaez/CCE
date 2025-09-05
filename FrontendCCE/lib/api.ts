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

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()
    console.log('API Response for', endpoint, ':', data)

    if (!response.ok) {
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
    getOverdue: (): Promise<ApiMember[]> => 
      fetchApi('/api/pagos/vencidos'),
    
    processPayment: (socioId: number, monto: number): Promise<{ success: boolean; message?: string }> => 
      fetchApi('/api/pagos/procesar', {
        method: 'POST',
        body: JSON.stringify({ socioId, monto }),
      }),
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
export function transformFrontendMemberToApi(member: Omit<import('./store').Member, 'id'>): CreateMemberData {
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
    dni: '00000000', // Placeholder - should be collected from form
    fechaNacimiento: '1990-01-01', // Placeholder - should be collected from form
    telefono: member.phone,
    email: member.email,
    actividad: (activityMap[member.activity || 'solo-socio'] || 'Solo socio') as CreateMemberData['actividad'],
    esJugador: member.membershipType === 'jugador',
    estado: statusMap[member.status] || 'Activo'
  }
}