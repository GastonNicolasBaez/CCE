'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export interface User {
  id: number
  email: string
  nombre: string
  apellido: string
  rol: 'admin' | 'staff'
  nombreCompleto: string
  activo: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token')
        const storedRefreshToken = localStorage.getItem('refresh_token')
        const storedUser = localStorage.getItem('user')

        if (storedToken && storedUser) {
          setToken(storedToken)
          setRefreshTokenValue(storedRefreshToken)
          setUser(JSON.parse(storedUser))

          // Verify token is still valid
          try {
            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
              headers: {
                'Authorization': `Bearer ${storedToken}`,
                'Content-Type': 'application/json',
              },
            })

            if (!response.ok) {
              // Token invalid, try to refresh
              if (storedRefreshToken) {
                await refreshTokenInternal(storedRefreshToken)
              } else {
                throw new Error('Token invalid')
              }
            } else {
              const data = await response.json()
              if (data.success && data.data) {
                setUser(data.data)
              }
            }
          } catch (error) {
            // Clear invalid auth
            logoutInternal()
          }
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  // Refresh token function
  const refreshTokenInternal = async (refreshTok: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTok }),
      })

      const data = await response.json()

      if (data.success && data.data) {
        setToken(data.data.token)
        setRefreshTokenValue(data.data.refreshToken)
        localStorage.setItem('auth_token', data.data.token)
        localStorage.setItem('refresh_token', data.data.refreshToken)
      } else {
        throw new Error(data.message || 'Failed to refresh token')
      }
    } catch (error) {
      logoutInternal()
      throw error
    }
  }

  const refreshToken = async () => {
    if (refreshTokenValue) {
      await refreshTokenInternal(refreshTokenValue)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed')
      }

      // Save auth data
      setUser(data.data.user)
      setToken(data.data.token)
      setRefreshTokenValue(data.data.refreshToken)

      localStorage.setItem('user', JSON.stringify(data.data.user))
      localStorage.setItem('auth_token', data.data.token)
      localStorage.setItem('refresh_token', data.data.refreshToken)

      toast.success(`Bienvenido, ${data.data.user.nombre}!`)

      // Redirect to dashboard
      router.push('/')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión'
      toast.error(errorMessage)
      throw error
    }
  }

  const logoutInternal = () => {
    setUser(null)
    setToken(null)
    setRefreshTokenValue(null)
    localStorage.removeItem('user')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
  }

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      }
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      logoutInternal()
      toast.success('Sesión cerrada')
      router.push('/login')
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!token) throw new Error('No token available')

      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update profile')
      }

      setUser(result.data)
      localStorage.setItem('user', JSON.stringify(result.data))

      toast.success('Perfil actualizado exitosamente')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar perfil'
      toast.error(errorMessage)
      throw error
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!token) throw new Error('No token available')

      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to change password')
      }

      toast.success('Contraseña actualizada exitosamente')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cambiar contraseña'
      toast.error(errorMessage)
      throw error
    }
  }

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
