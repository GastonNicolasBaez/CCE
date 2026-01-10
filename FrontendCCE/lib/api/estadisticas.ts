import { apiClient } from '../apiClient'

/**
 * Estadisticas API Client
 * API client for tenant statistics endpoints
 */

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
  const response = await apiClient.get('/estadisticas/dashboard')
  return response.data
}

/**
 * Get statistics by activity
 */
export async function getEstadisticasPorActividad(): Promise<APIResponse<ActividadesData>> {
  const response = await apiClient.get('/estadisticas/actividades')
  return response.data
}

/**
 * Get growth statistics (last 6 months)
 */
export async function getCrecimiento(): Promise<APIResponse<CrecimientoData>> {
  const response = await apiClient.get('/estadisticas/crecimiento')
  return response.data
}

/**
 * Get detailed payment statistics
 */
export async function getEstadisticasCuotas(): Promise<APIResponse<CuotasData>> {
  const response = await apiClient.get('/estadisticas/cuotas')
  return response.data
}

export const estadisticasAPI = {
  getEstadisticasDashboard,
  getEstadisticasPorActividad,
  getCrecimiento,
  getEstadisticasCuotas,
}
