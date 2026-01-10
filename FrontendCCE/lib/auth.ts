/**
 * Authentication utilities for multi-tenant system
 *
 * Handles JWT tokens, login/register/logout, and tenant resolution from subdomain
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// ==================== TYPES ====================

export interface User {
  id: number
  nombre: string
  apellido: string
  email: string
  rol: 'super_admin' | 'admin' | 'operador'
  tenantId: number | null // null for super_admin
  status: 'active' | 'inactive' | 'suspended'
  lastLoginAt?: string
}

export interface Tenant {
  id: number
  slug: string
  name: string
  status: 'active' | 'suspended' | 'trial' | 'cancelled'
  plan: 'free' | 'pro' | 'enterprise'
  maxMembers: number
  trialEndsAt?: string
}

export interface AuthResponse {
  success: boolean
  data?: {
    user: User
    tenant: Tenant
    token: string
  }
  message?: string
  errors?: Array<{ field: string; message: string }>
}

export interface RegisterData {
  clubName: string
  slug: string
  phone?: string
  adminName: string
  adminLastName: string
  adminEmail: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

// ==================== TOKEN MANAGEMENT ====================

const TOKEN_KEY = 'cce_auth_token'
const USER_KEY = 'cce_user'
const TENANT_KEY = 'cce_tenant'

/**
 * Save JWT token to localStorage and cookie
 * Cookie is needed for Next.js middleware authentication
 */
export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    // Save to localStorage for client-side access
    localStorage.setItem(TOKEN_KEY, token)

    // Save to cookie for middleware access (24 hours)
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`
  }
}

/**
 * Get JWT token from localStorage
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY)
  }
  return null
}

/**
 * Remove JWT token from localStorage and cookie
 */
export function removeToken(): void {
  if (typeof window !== 'undefined') {
    // Remove from localStorage
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(TENANT_KEY)

    // Remove cookie by setting it to expire immediately
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`
  }
}

/**
 * Save user data to localStorage
 */
export function saveUser(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

/**
 * Get user data from localStorage
 */
export function getUser(): User | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem(USER_KEY)
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch {
        return null
      }
    }
  }
  return null
}

/**
 * Save tenant data to localStorage
 */
export function saveTenant(tenant: Tenant): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TENANT_KEY, JSON.stringify(tenant))
  }
}

/**
 * Get tenant data from localStorage
 */
export function getTenant(): Tenant | null {
  if (typeof window !== 'undefined') {
    const tenantStr = localStorage.getItem(TENANT_KEY)
    if (tenantStr) {
      try {
        return JSON.parse(tenantStr)
      } catch {
        return null
      }
    }
  }
  return null
}

/**
 * Check if user is authenticated (has valid token)
 */
export function isAuthenticated(): boolean {
  return !!getToken()
}

/**
 * Check if user is super admin (global administrator)
 */
export function isSuperAdmin(): boolean {
  const user = getUser()
  return user?.rol === 'super_admin'
}

/**
 * Check if user is admin (club administrator)
 * Note: Super admin is also considered admin
 */
export function isAdmin(): boolean {
  const user = getUser()
  return user?.rol === 'admin' || user?.rol === 'super_admin'
}

/**
 * Check if user is operador (staff member)
 */
export function isOperador(): boolean {
  const user = getUser()
  return user?.rol === 'operador'
}

/**
 * Check if user has specific role(s)
 */
export function hasRole(roles: string | string[]): boolean {
  const user = getUser()
  if (!user) return false

  const roleArray = Array.isArray(roles) ? roles : [roles]
  return roleArray.includes(user.rol)
}

/**
 * Check if user has permission to access a resource
 */
export function hasPermission(permission: string): boolean {
  const user = getUser()
  if (!user) return false

  // Super admin has all permissions
  if (user.rol === 'super_admin') return true

  // Define permissions by role
  const permissions: Record<string, string[]> = {
    admin: ['configuracion', 'reportes', 'socios', 'cuotas', 'actividades', 'usuarios'],
    operador: ['socios', 'cuotas', 'actividades']
  }

  const userPermissions = permissions[user.rol] || []
  return userPermissions.includes(permission)
}

// ==================== TENANT RESOLUTION ====================

/**
 * Extract tenant slug from current subdomain
 * Examples:
 * - espora.localhost:3000 → 'espora'
 * - demo.zeclogic.net.ar → 'demo'
 * - localhost:3000 → null (no subdomain)
 */
export function getTenantSlugFromSubdomain(): string | null {
  if (typeof window === 'undefined') return null

  const hostname = window.location.hostname
  const parts = hostname.split('.')

  // Check for localhost subdomain (espora.localhost)
  if (parts.length === 2 && parts[1] === 'localhost') {
    return parts[0]
  }

  // Check for production subdomain (espora.zeclogic.net.ar)
  if (parts.length >= 3) {
    return parts[0]
  }

  // No subdomain found
  return null
}

/**
 * Get full tenant URL for current tenant
 */
export function getTenantUrl(slug: string): string {
  if (typeof window === 'undefined') return ''

  const protocol = window.location.protocol
  const port = window.location.port

  // Development (localhost)
  if (window.location.hostname.includes('localhost')) {
    return `${protocol}//${slug}.localhost${port ? ':' + port : ''}`
  }

  // Production (zeclogic.net.ar or custom domain)
  const baseDomain = window.location.hostname.split('.').slice(-2).join('.')
  return `${protocol}//${slug}.${baseDomain}`
}

// ==================== API CALLS ====================

/**
 * Authenticated fetch wrapper
 * Automatically adds JWT token to requests
 */
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getToken()
  const tenantSlug = getTenantSlugFromSubdomain()

  const url = `${API_BASE_URL}${endpoint}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  }

  // Add JWT token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Add tenant slug if available (for API routes that need it)
  if (tenantSlug) {
    headers['X-Tenant-Slug'] = tenantSlug
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        removeToken()
        // Optionally redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }

      throw new Error(data.message || `API Error: ${response.statusText}`)
    }

    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

/**
 * Register new club (tenant) with admin user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (result.success && result.data) {
      // Save auth data
      saveToken(result.data.token)
      saveUser(result.data.user)
      saveTenant(result.data.tenant)
    }

    return result
  } catch (error) {
    console.error('Register error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error al registrar'
    }
  }
}

/**
 * Login user within tenant context
 * Also supports super admin login without tenant
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  try {
    const tenantSlug = getTenantSlugFromSubdomain()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Only add tenant slug header if it exists (not required for super admin)
    if (tenantSlug) {
      headers['X-Tenant-Slug'] = tenantSlug
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (result.success && result.data) {
      // Save auth data
      saveToken(result.data.token)
      saveUser(result.data.user)

      // Tenant is optional (null for super admin)
      if (result.data.tenant) {
        saveTenant(result.data.tenant)
      }
    }

    return result
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error al iniciar sesión'
    }
  }
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  try {
    // Optional: Call backend logout endpoint
    const token = getToken()
    if (token) {
      await fetchWithAuth('/api/auth/logout', {
        method: 'POST',
      })
    }
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    // Always remove local auth data
    removeToken()
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }
}

/**
 * Get current user info from backend
 */
export async function getCurrentUser(): Promise<{ user: User; tenant: Tenant } | null> {
  try {
    const response = await fetchWithAuth('/api/auth/me')

    if (response.success && response.data) {
      // Update local storage
      saveUser(response.data.user)
      saveTenant(response.data.tenant)

      return {
        user: response.data.user,
        tenant: response.data.tenant
      }
    }

    return null
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

/**
 * Verify if token is still valid
 */
export async function verifyToken(): Promise<boolean> {
  const token = getToken()
  if (!token) return false

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })

    const result = await response.json()
    return result.success && result.data?.valid === true
  } catch (error) {
    console.error('Token verification error:', error)
    return false
  }
}

// ==================== EXPORTS ====================

export const auth = {
  // Token management
  saveToken,
  getToken,
  removeToken,

  // User management
  saveUser,
  getUser,
  saveTenant,
  getTenant,

  // Auth status
  isAuthenticated,
  isSuperAdmin,
  isAdmin,
  isOperador,
  hasRole,
  hasPermission,

  // Tenant resolution
  getTenantSlugFromSubdomain,
  getTenantUrl,

  // API calls
  register,
  login,
  logout,
  getCurrentUser,
  verifyToken,

  // Authenticated fetch
  fetch: fetchWithAuth,
}

export default auth
