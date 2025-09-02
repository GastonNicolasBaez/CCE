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
      
      if (apiResponse && apiResponse.success) {
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
      // Here we would make the API call to update the member
      // const apiMember = await api.socios.update(parseInt(id), updates)
      // const frontendMember = transformApiMemberToFrontend(apiMember)
      updateMember(id, updates)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el miembro'
      setError(errorMessage)
      console.error('Error updating member:', err)
      return false
    }
  }

  return { updateMemberData }
}

export function useDeleteMember() {
  const { deleteMember, setError } = useAppStore()

  const deleteMemberData = async (id: string) => {
    try {
      setError(null)
      // Here we would make the API call to delete the member
      // await api.socios.delete(parseInt(id))
      deleteMember(id)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar el miembro'
      setError(errorMessage)
      console.error('Error deleting member:', err)
      return false
    }
  }

  return { deleteMemberData }
}