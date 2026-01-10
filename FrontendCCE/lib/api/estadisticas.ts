/**
 * Estadisticas API Client
 * API client for tenant statistics endpoints
 */

import { auth } from '../auth'

// Types
export interface EstadisticasSocios {
  total: number
  activos: number
  inactivos: number
  porTipo: Record<string, number>
}

export interface EstadisticasActividades {
  total: number
}

export interface EstadisticasCuotas {
  total: number
  pagadas: number
  pendientes: number
  vencidas: number
  tasaPago: string
}

export interface EstadisticasIngresos {
  total: number
  pendiente: number
}

export interface DashboardData {
  socios: EstadisticasSocios
  actividades: EstadisticasActividades
  cuotas: EstadisticasCuotas
  ingresos: EstadisticasIngresos
}

export interface ActividadStats {
  id: number
  nombre: string
  monto: number
  cantidadSocios: number
  ingresoMensualEstimado: number
}

export interface ActividadesData {
  actividades: ActividadStats[]
}

export interface CrecimientoSocios {
  mes: string
  cantidad: number
}

export interface IngresosMensuales {
  mes: string
  ingresos: number
  cantidadCuotas: number
}

export interface CrecimientoData {
  crecimientoSocios: CrecimientoSocios[]
  ingresosMensuales: IngresosMensuales[]
}

export interface MesActual {
  mes: number
  anio: number
  total: number
  pagadas: number
  ingresos: number
  tasaCobro: string
}

export interface CuotasEstado {
  estado: string
  cantidad: number
  montoTotal: number
}

export interface CuotasData {
  mesActual: MesActual
  porEstado: CuotasEstado[]
}

export interface APIResponse<T> {
  success: boolean
  data: T
  message?: string
}

/**
 * Get general dashboard statistics
 */
export async function getEstadisticasDashboard(): Promise<APIResponse<DashboardData>> {
  try {
    return await auth.fetch('/api/estadisticas/dashboard')
  } catch (error) {
    console.error('getEstadisticasDashboard error:', error)
    throw error
  }
}

/**
 * Get statistics by activity
 */
export async function getEstadisticasPorActividad(): Promise<APIResponse<ActividadesData>> {
  try {
    return await auth.fetch('/api/estadisticas/actividades')
  } catch (error) {
    console.error('getEstadisticasPorActividad error:', error)
    throw error
  }
}

/**
 * Get growth statistics (last 6 months)
 */
export async function getCrecimiento(): Promise<APIResponse<CrecimientoData>> {
  try {
    return await auth.fetch('/api/estadisticas/crecimiento')
  } catch (error) {
    console.error('getCrecimiento error:', error)
    throw error
  }
}

/**
 * Get detailed payment statistics
 */
export async function getEstadisticasCuotas(): Promise<APIResponse<CuotasData>> {
  try {
    return await auth.fetch('/api/estadisticas/cuotas')
  } catch (error) {
    console.error('getEstadisticasCuotas error:', error)
    throw error
  }
}

export const estadisticasAPI = {
  getEstadisticasDashboard,
  getEstadisticasPorActividad,
  getCrecimiento,
  getEstadisticasCuotas,
}
