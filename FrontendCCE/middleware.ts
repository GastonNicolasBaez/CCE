/**
 * Next.js Middleware for Multi-Tenant Authentication
 *
 * This middleware runs on every request and handles:
 * 1. Tenant resolution from subdomain
 * 2. Authentication checks for protected routes
 * 3. Redirects based on auth state
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ==================== TENANT RESOLUTION ====================

/**
 * Extract tenant slug from hostname
 */
function getTenantSlug(hostname: string): string | null {
  const parts = hostname.split(':')[0].split('.')

  // Development: espora.localhost → 'espora'
  if (parts.length === 2 && parts[1] === 'localhost') {
    return parts[0]
  }

  // Production: espora.zeclogic.net.ar → 'espora'
  if (parts.length >= 3) {
    return parts[0]
  }

  // No subdomain: localhost or zeclogic.net.ar
  return null
}

// ==================== ROUTE CONFIGURATION ====================

/**
 * Routes that don't require a tenant
 * These are accessible from the main domain (without subdomain)
 */
const PUBLIC_ROUTES_NO_TENANT = [
  '/register',  // New club registration
  '/',          // Landing page
  '/about',
  '/pricing',
  '/contact',
]

/**
 * Routes that require tenant but NOT authentication
 * These are accessible from subdomain without login
 */
const PUBLIC_ROUTES_WITH_TENANT = [
  '/login',
]

/**
 * Routes that require both tenant AND authentication
 * All other routes by default
 */
const PROTECTED_ROUTES = [
  '/dashboard',
  '/socios',
  '/pagos',
  '/estadisticas',
  '/configuracion',
  '/perfil',
]

// ==================== MIDDLEWARE LOGIC ====================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Extract tenant slug from subdomain
  const tenantSlug = getTenantSlug(hostname)

  // Check if user has auth token (client-side check)
  const token = request.cookies.get('cce_auth_token')?.value

  console.log('🔍 Middleware:', {
    hostname,
    pathname,
    tenantSlug,
    hasToken: !!token
  })

  // ============================================================
  // CASE 1: Public routes without tenant (main domain)
  // ============================================================
  if (!tenantSlug && PUBLIC_ROUTES_NO_TENANT.some(route => pathname.startsWith(route))) {
    // Allow access to landing page, register, etc. on main domain
    return NextResponse.next()
  }

  // ============================================================
  // CASE 2: Public routes requiring tenant (subdomain)
  // ============================================================
  if (tenantSlug && PUBLIC_ROUTES_WITH_TENANT.some(route => pathname.startsWith(route))) {
    // If already authenticated, redirect to dashboard
    if (token) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // Allow access to login page
    return NextResponse.next()
  }

  // ============================================================
  // CASE 3: Protected routes (require tenant + auth)
  // ============================================================
  if (tenantSlug && (pathname === '/' || PROTECTED_ROUTES.some(route => pathname.startsWith(route)))) {
    // Not authenticated - redirect to login
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    // Authenticated - allow access
    // Add tenant slug to request headers for API calls
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-tenant-slug', tenantSlug)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    })
  }

  // ============================================================
  // CASE 4: No tenant but trying to access protected route
  // ============================================================
  if (!tenantSlug && !PUBLIC_ROUTES_NO_TENANT.some(route => pathname.startsWith(route))) {
    // Redirect to landing page
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // ============================================================
  // CASE 5: Static files and Next.js internals
  // ============================================================
  // Allow all other requests (static files, _next, etc.)
  return NextResponse.next()
}

// ==================== CONFIGURATION ====================

/**
 * Configure which paths the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled by Next.js API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
