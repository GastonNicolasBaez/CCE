'use client'

import { useEffect } from 'react'
import { useAppStore } from '../../lib/store'
import { useRouter } from 'next/navigation'

export default function RegistrationPage() {
  const { setCurrentPage } = useAppStore()
  const router = useRouter()

  useEffect(() => {
    // Cambiar la página actual a registration para mostrar el componente correcto
    setCurrentPage('registration')
    // Redirigir de vuelta a la página principal
    router.replace('/')
  }, [setCurrentPage, router])

  // Mostrar un loading mientras redirige
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando formulario de inscripción...</p>
      </div>
    </div>
  )
}