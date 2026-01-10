/**
 * Tenants API Client
 *
 * Handles all API calls related to tenant management for super admin
 */

import { auth } from '../auth'

// ==================== TYPES ====================

export interface TenantFilters {
  page?: number
  limit?: number
  status?: 'active' | 'suspended' | 'trial' | 'cancelled'
  plan?: 'free' | 'pro' | 'enterprise'
  search?: string
  sortBy?: 'created_at' | 'name' | 'slug' | 'status' | 'plan'
  sortOrder?: 'ASC' | 'DESC'
}

export interface TenantListResponse {
  success: boolean
  data: {
    tenants: Tenant[]
    pagination: {
      currentPage: number
      totalPages: number
      totalItems: number
      itemsPerPage: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
  }
  message?: string
}

export interface TenantDetailResponse {
  success: boolean
  data: {
    tenant: Tenant
    statistics: TenantStatistics
  }
  message?: string
}

export interface CreateTenantData {
  clubName: string
  slug: string
  phone?: string
  plan?: 'free' | 'pro' | 'enterprise'
  maxMembers?: number
  adminName: string
  adminLastName: string
  adminEmail: string
  password: string
  configuracion?: Partial<TenantConfiguration>
}

export interface UpdateTenantData {
  name?: string
  phone?: string
  plan?: 'free' | 'pro' | 'enterprise'
  maxMembers?: number
  settings?: Record<string, any>
  adminEmail?: string
  adminName?: string
}

export interface Tenant {
  id: number
  slug: string
  name: string
  status: 'active' | 'suspended' | 'trial' | 'cancelled'
  plan: 'free' | 'pro' | 'enterprise'
  maxMembers: number
  adminEmail: string
  adminName: string
  phone?: string
  settings: Record<string, any>
  metadata: Record<string, any>
  trialEndsAt?: string
  createdAt: string
  updatedAt: string
  memberCount?: number
  activeMemberCount?: number
  usagePercentage?: string
}

export interface TenantStatistics {
  totalMembers: number
  activeMembers: number
  memberLimit: number
  usagePercentage: string
  totalCuotas: number
  cuotasPagadas: number
  paymentRate: string
  userCount?: number
  recentMembers?: number
}

export interface TenantConfiguration {
  tenantId: number
  tipoCuota: 'por_actividad' | 'fija'
  montoBase: number
  multipleActividadesStrategy: 'sumar' | 'mas_cara' | 'fija'
  descuentoActividades: number
  diaVencimiento: number
  recordatorioDiasAntes: number
  descuentoMenores: number
  generarAutomaticamente: boolean
  enviarRecordatorios: boolean
}

export interface GlobalStatistics {
  overview: {
    totalTenants: number
    tenantsByStatus: Record<string, number>
    tenantsByPlan: Record<string, number>
    totalMembers: number
    activeMembers: number
    totalUsers: number
  }
  recent: {
    tenantsLast30Days: number
    expiringTrialsNext7Days: number
  }
  topTenants: Array<{
    id: number
    name: string
    slug: string
    plan: string
    memberCount: number
    maxMembers: number
  }>
  growth: Array<{
    month: string
    count: number
  }>
}

export interface TenantUsersResponse {
  success: boolean
  data: {
    tenant: {
      id: number
      name: string
      slug: string
    }
    users: Array<{
      id: number
      nombre: string
      apellido: string
      email: string
      rol: string
      status: string
      lastLoginAt?: string
      createdAt: string
    }>
  }
  message?: string
}

// ==================== API FUNCTIONS ====================

/**
 * Get all tenants with filters and pagination
 */
export async function getTenants(filters?: TenantFilters): Promise<TenantListResponse> {
  try {
    const params = new URLSearchParams()

    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.status) params.append('status', filters.status)
    if (filters?.plan) params.append('plan', filters.plan)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

    const queryString = params.toString()
    const endpoint = `/api/admin/tenants${queryString ? `?${queryString}` : ''}`

    return await auth.fetch(endpoint)
  } catch (error) {
    console.error('getTenants error:', error)
    throw error
  }
}

/**
 * Get tenant by ID with detailed statistics
 */
export async function getTenantById(id: number): Promise<TenantDetailResponse> {
  try {
    return await auth.fetch(`/api/admin/tenants/${id}`)
  } catch (error) {
    console.error('getTenantById error:', error)
    throw error
  }
}

/**
 * Create new tenant with admin user and configuration
 */
export async function createTenant(data: CreateTenantData): Promise<TenantDetailResponse> {
  try {
    return await auth.fetch('/api/admin/tenants', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  } catch (error) {
    console.error('createTenant error:', error)
    throw error
  }
}

/**
 * Update tenant information
 */
export async function updateTenant(id: number, data: UpdateTenantData): Promise<TenantDetailResponse> {
  try {
    return await auth.fetch(`/api/admin/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  } catch (error) {
    console.error('updateTenant error:', error)
    throw error
  }
}

/**
 * Change tenant status
 */
export async function changeTenantStatus(
  id: number,
  status: 'active' | 'suspended' | 'trial' | 'cancelled',
  reason?: string
): Promise<TenantDetailResponse> {
  try {
    return await auth.fetch(`/api/admin/tenants/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason })
    })
  } catch (error) {
    console.error('changeTenantStatus error:', error)
    throw error
  }
}

/**
 * Get all users of a tenant
 */
export async function getTenantUsers(id: number): Promise<TenantUsersResponse> {
  try {
    return await auth.fetch(`/api/admin/tenants/${id}/users`)
  } catch (error) {
    console.error('getTenantUsers error:', error)
    throw error
  }
}

/**
 * Get global system statistics
 */
export async function getGlobalStats(): Promise<{
  success: boolean
  data: GlobalStatistics
  message?: string
}> {
  try {
    return await auth.fetch('/api/admin/stats')
  } catch (error) {
    console.error('getGlobalStats error:', error)
    throw error
  }
}

// ==================== EXPORTS ====================

export const tenantsAPI = {
  getTenants,
  getTenantById,
  createTenant,
  updateTenant,
  changeTenantStatus,
  getTenantUsers,
  getGlobalStats
}

export default tenantsAPI
