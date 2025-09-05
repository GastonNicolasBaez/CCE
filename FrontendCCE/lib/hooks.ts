import { useEffect, useCallback } from 'react'
import { useAppStore } from './store'
import { api, transformApiMemberToFrontend, transformFrontendMemberToApi } from './api'

export function useLoadMembers() {
  const { setMembers, setLoading, setError, isLoading, error } = useAppStore()

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const apiMembers = await api.socios.getAll()
      
      // Validar que la respuesta sea un array
      if (!Array.isArray(apiMembers)) {
        console.warn('API response is not an array:', apiMembers)
        setMembers([])
        return
      }
      
      const frontendMembers = apiMembers.map(transformApiMemberToFrontend)
      setMembers(frontendMembers)
    } catch (err) {
      let errorMessage = 'Error al cargar los miembros'
      
      if (err instanceof Error) {
        if (err.message.includes('Network error') || err.message.includes('fetch')) {
          errorMessage = 'No se puede conectar con el servidor. Verifica que el backend esté ejecutándose.'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      console.error('Error loading members:', err)
      // En caso de error, establecer array vacío en lugar de dejar undefined
      setMembers([])
    } finally {
      setLoading(false)
    }
  }, [setMembers, setLoading, setError])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  return { loadMembers, isLoading, error }
}

export function useCreateMember() {
  const { addMember, setError } = useAppStore()

  const createMember = async (memberData: Parameters<typeof addMember>[0]) => {
    try {
      setError(null)
      // Make API call to create the member
      const apiMemberData = transformFrontendMemberToApi(memberData)
      const apiResponse = await api.socios.create(apiMemberData)
      
      if (apiResponse && apiResponse.success && apiResponse.data) {
        const frontendMember = transformApiMemberToFrontend(apiResponse.data)
        addMember(frontendMember)
        return true
      } else {
        // Fallback to local state if API fails
        addMember(memberData)
        return true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el miembro'
      setError(errorMessage)
      console.error('Error creating member:', err)
      // Fallback to local state
      addMember(memberData)
      return false
    }
  }

  return { createMember }
}

export function useUpdateMember() {
  const { updateMember, setError } = useAppStore()

  const updateMemberData = async (id: string, updates: Parameters<typeof updateMember>[1]) => {
    try {
      setError(null)
      
      // Make API call to update the member - send only changed fields
      const updateFields: Record<string, unknown> = {}
      
      if (updates.name !== undefined) {
        const nameParts = updates.name.split(' ')
        updateFields.nombre = nameParts[0] || ''
        updateFields.apellido = nameParts.slice(1).join(' ') || ''
      }
      
      if (updates.email !== undefined) {
        updateFields.email = updates.email
      }
      
      if (updates.phone !== undefined) {
        updateFields.telefono = updates.phone
      }
      
      if (updates.status !== undefined) {
        updateFields.estado = updates.status === 'active' ? 'Activo' : 'Inactivo'
      }

      const apiResponse = await api.socios.update(parseInt(id), updateFields)
      
      if (apiResponse && apiResponse.success) {
        // Update local state with API response
        updateMember(id, updates)
        return { success: true, message: apiResponse.message || 'Miembro actualizado exitosamente' }
      } else {
        const errorMessage = apiResponse?.message || 'Error al actualizar el miembro'
        setError(errorMessage)
        return { success: false, message: errorMessage }
      }
    } catch (err: unknown) {
      // Extract error message - could be from ApiError or other sources
      const errorMessage = (err instanceof Error ? err.message : String(err)) || 'Error al actualizar el miembro'
      
      setError(errorMessage)
      console.error('Error updating member:', err)
      return { success: false, message: errorMessage }
    }
  }

  return { updateMemberData }
}

export function useDeleteMember() {
  const { removeMember, setError } = useAppStore()

  const deleteMemberData = async (id: string, force: boolean = false) => {
    try {
      setError(null)
      
      // Make API call to delete the member
      const apiResponse = await api.socios.delete(parseInt(id), force)
      
      if (apiResponse && apiResponse.success) {
        // Delete from local state only if API call succeeded
        removeMember(id)
        return { success: true, message: apiResponse.message }
      } else {
        // Return error information for modal handling
        return { 
          success: false, 
          message: apiResponse?.message || 'Error al eliminar el miembro'
        }
      }
    } catch (err: unknown) {
      // Extract error message - could be from ApiError or other sources
      const errorMessage = (err instanceof Error ? err.message : String(err)) || 'Error al eliminar el miembro'
      
      setError(errorMessage)
      console.error('Error deleting member:', err)
      return { success: false, message: errorMessage }
    }
  }

  return { deleteMemberData }
}