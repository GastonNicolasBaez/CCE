'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'

/**
 * AuthInitializer
 *
 * Client component that initializes authentication state from localStorage
 * on app mount. This ensures that auth state is synced across page reloads.
 */
export function AuthInitializer() {
  const initAuth = useAppStore(state => state.initAuth)

  useEffect(() => {
    // Initialize auth state from localStorage
    initAuth()
  }, [initAuth])

  return null
}
