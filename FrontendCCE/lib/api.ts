const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface ApiMember {
  id: number
  nombre: string
  apellido: string
  dni: string
  fechaNacimiento: string
  telefono: string
  email: string
  actividad: 'Basquet' | 'Voley' | 'Karate' | 'Gimnasio' | 'Socio'
  esJugador: boolean
  estado: 'Activo' | 'Inactivo' | 'Suspendido'
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
  actividad: 'Basquet' | 'Voley' | 'Karate' | 'Gimnasio' | 'Socio'
  esJugador?: boolean
  estado?: 'Activo' | 'Inactivo' | 'Suspendido'
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

    if (!response.ok) {
      throw new ApiError(response.status, `API Error: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('API Response for', endpoint, ':', data)
    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    // Error de red o parsing
    console.error('Network or parsing error:', error)
    throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const api = {
  // Socios endpoints
  socios: {
    getAll: async (): Promise<ApiMember[]> => {
      try {
        const response = await fetchApi('/api/socios')
        // El backend devuelve { success: true, data: [...] }
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
    
    create: async (data: CreateMemberData): Promise<any> => {
      return await fetchApi('/api/socios', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    
    update: async (id: number, data: Partial<CreateMemberData>): Promise<any> => {
      return await fetchApi(`/api/socios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },
    
    delete: async (id: number): Promise<any> => {
      return await fetchApi(`/api/socios/${id}`, {
        method: 'DELETE',
      })
    },
    
    getByActivity: async (actividad: string): Promise<ApiMember[]> => {
      const response = await fetchApi(`/api/socios?actividad=${actividad}`)
      return response.success && Array.isArray(response.data) ? response.data : []
    },
  },

  // Pagos endpoints
  pagos: {
    getOverdue: (): Promise<any[]> => 
      fetchApi('/api/pagos/vencidos'),
    
    processPayment: (socioId: number, monto: number): Promise<any> => 
      fetchApi('/api/pagos/procesar', {
        method: 'POST',
        body: JSON.stringify({ socioId, monto }),
      }),
  },
}

// Utility functions to transform data between API and frontend formats
export function transformApiMemberToFrontend(apiMember: any): import('./store').Member {
  // Map backend activities to frontend activities
  const activityMap: Record<string, string> = {
    'Basquet': 'basketball',
    'Voley': 'volleyball', 
    'Karate': 'karate',
    'Gimnasio': 'gym',
    'Socio': 'socio'
  }

  // Determine payment status from resumenPagos
  let paymentStatus: 'paid' | 'pending' | 'overdue' = 'pending'
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
    activity: activityMap[apiMember.actividad] as any,
    status: apiMember.estado === 'Activo' ? 'active' : 'inactive',
    paymentStatus,
    registrationDate: apiMember.fechaIngreso,
    membershipType: apiMember.esJugador ? 'jugador' : 'socio',
    lastPaymentDate: apiMember.resumenPagos?.ultimaCuota?.fechaPago || undefined,
    nextPaymentDate: apiMember.resumenPagos?.ultimaCuota ? 
      new Date(new Date(apiMember.resumenPagos.ultimaCuota.fechaVencimiento).getTime() + 30*24*60*60*1000).toISOString().split('T')[0] : 
      undefined
  }
}

export function transformFrontendMemberToApi(member: Omit<import('./store').Member, 'id'>): CreateMemberData {
  // Map frontend activities to backend activities
  const activityMap: Record<string, string> = {
    'basketball': 'Basquet',
    'volleyball': 'Voley',
    'karate': 'Karate', 
    'gym': 'Gimnasio',
    'socio': 'Socio'
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
    actividad: (activityMap[member.activity || 'socio'] || 'Socio') as any,
    esJugador: member.membershipType === 'jugador',
    estado: member.status === 'active' ? 'Activo' : 'Inactivo'
  }
}