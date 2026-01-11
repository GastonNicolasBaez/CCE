'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Activity,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  DollarSign,
  Users,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useLoadActividades } from '../../lib/hooks'
import { api, type ApiActividad } from '../../lib/api'
import { Card, Button, Badge, IconButton, InfoCard, EmptyState, Skeleton, Confetti } from '@/components/ui'

export default function ActividadesPage() {
  const { actividades, isLoading, error, loadActividades } = useLoadActividades()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    monto: '',
    descripcion: '',
    activa: true,
    orden: 0
  })
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const handleCreate = () => {
    setCreating(true)
    setEditingId(null)
    setFormData({
      nombre: '',
      monto: '',
      descripcion: '',
      activa: true,
      orden: actividades.length
    })
    setSubmitError(null)
  }

  const handleEdit = (actividad: ApiActividad) => {
    setEditingId(actividad.id)
    setCreating(false)
    setFormData({
      nombre: actividad.nombre,
      monto: String(actividad.monto),
      descripcion: actividad.descripcion || '',
      activa: actividad.activa,
      orden: actividad.orden
    })
    setSubmitError(null)
  }

  const handleCancel = () => {
    setCreating(false)
    setEditingId(null)
    setFormData({
      nombre: '',
      monto: '',
      descripcion: '',
      activa: true,
      orden: 0
    })
    setSubmitError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const data = {
        nombre: formData.nombre.trim(),
        monto: parseFloat(formData.monto),
        descripcion: formData.descripcion.trim() || undefined,
        activa: formData.activa,
        orden: formData.orden
      }

      if (creating) {
        // Create new activity
        const response = await fetch('/api/actividades', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(data)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Error al crear actividad')
        }

        // Show success toast and confetti
        toast.success('¡Actividad creada exitosamente!', {
          icon: '🎉',
          duration: 4000,
        })
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      } else if (editingId) {
        // Update existing activity
        const response = await fetch(`/api/actividades/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(data)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Error al actualizar actividad')
        }

        // Show success toast
        toast.success('Actividad actualizada correctamente', {
          icon: '✅',
          duration: 3000,
        })
      }

      // Reload activities and reset form
      await loadActividades()
      handleCancel()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar actividad'
      setSubmitError(errorMessage)
      toast.error(errorMessage, {
        icon: '❌',
        duration: 4000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/actividades/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ activa: !currentActive })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al cambiar estado')
      }

      await loadActividades()
      toast.success(
        currentActive ? 'Actividad desactivada' : 'Actividad activada',
        { icon: currentActive ? '⏸️' : '▶️', duration: 2000 }
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cambiar estado de actividad'
      toast.error(errorMessage, { icon: '❌', duration: 4000 })
    }
  }

  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro que deseas desactivar "${nombre}"? Los socios con esta actividad no se verán afectados.`)) {
      return
    }

    try {
      const response = await fetch(`/api/actividades/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al eliminar actividad')
      }

      await loadActividades()
      toast.success(`"${nombre}" eliminada correctamente`, {
        icon: '🗑️',
        duration: 3000,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar actividad'
      toast.error(errorMessage, { icon: '❌', duration: 4000 })
    }
  }

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          {/* Header Skeleton */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <Skeleton variant="text" width={250} height={32} animation="shimmer" />
                <div className="mt-2">
                  <Skeleton variant="text" width={350} height={16} animation="shimmer" />
                </div>
              </div>
              <Skeleton variant="rectangular" width={150} height={40} animation="shimmer" />
            </div>
          </motion.div>

          {/* Activities List Skeleton */}
          <Card padding="default">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Skeleton variant="text" width={180} height={24} animation="shimmer" />
                        <Skeleton variant="rectangular" width={60} height={24} animation="shimmer" />
                      </div>
                      <div className="flex items-center gap-4">
                        <Skeleton variant="text" width={120} height={16} animation="shimmer" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton variant="circular" width={36} height={36} animation="shimmer" />
                      <Skeleton variant="circular" width={36} height={36} animation="shimmer" />
                      <Skeleton variant="circular" width={36} height={36} animation="shimmer" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-orange-500 dark:text-orange-400 mb-2">
                Gestión de Actividades
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Administra las actividades deportivas y sus precios mensuales
              </p>
            </div>
            {!creating && !editingId && (
              <Button variant="accent" icon={Plus} onClick={handleCreate}>
                Nueva Actividad
              </Button>
            )}
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Create/Edit Form */}
        <AnimatePresence>
          {(creating || editingId) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card variant="form" padding="default">
                <form onSubmit={handleSubmit}>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    {creating ? 'Nueva Actividad' : 'Editar Actividad'}
                  </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="Ej: Básquet, Yoga, Natación"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Monto Mensual <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.monto}
                        onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                        required
                        className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Descripción (Opcional)
                    </label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                      placeholder="Describe la actividad..."
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.activa}
                      onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Actividad activa (disponible para seleccionar)
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Orden de visualización
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.orden}
                      onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                {submitError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
                  </div>
                )}

                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      icon={X}
                      onClick={handleCancel}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      icon={isSubmitting ? Loader2 : Save}
                      disabled={isSubmitting}
                      loading={isSubmitting}
                    >
                      {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Activities List */}
        <Card padding="default">
          {actividades.length === 0 ? (
            <EmptyState
              illustration="inbox"
              title="No hay actividades registradas"
              description="Comienza creando tu primera actividad deportiva. Las actividades te permiten organizar diferentes deportes y definir sus precios mensuales."
              actionLabel="Nueva Actividad"
              onAction={handleCreate}
            />
          ) : (
            <div className="space-y-4">
              {actividades.map((actividad) => (
                <motion.div
                  key={actividad.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 border rounded-lg transition-all ${
                    actividad.activa
                      ? 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800/50'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          {actividad.nombre}
                        </h4>
                        <Badge variant={actividad.activa ? 'success' : 'default'}>
                          {actividad.activa ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <DollarSign size={14} />
                          <span className="font-medium">
                            ${typeof actividad.monto === 'number' ? actividad.monto.toFixed(2) : actividad.monto}
                          </span>
                          <span>/ mes</span>
                        </div>
                      </div>

                      {actividad.descripcion && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {actividad.descripcion}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <IconButton
                        icon={actividad.activa ? ToggleRight : ToggleLeft}
                        variant={actividad.activa ? 'success' : 'ghost'}
                        ariaLabel={actividad.activa ? 'Desactivar' : 'Activar'}
                        onClick={() => handleToggleActive(actividad.id, actividad.activa)}
                        size={20}
                      />
                      <IconButton
                        icon={Edit}
                        variant="primary"
                        ariaLabel="Editar actividad"
                        onClick={() => handleEdit(actividad)}
                        size={20}
                      />
                      <IconButton
                        icon={Trash2}
                        variant="danger"
                        ariaLabel="Eliminar actividad"
                        onClick={() => handleDelete(actividad.id, actividad.nombre)}
                        size={20}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Info Card */}
        <InfoCard variant="info" className="mt-6">
          <div>
            <p className="font-medium mb-2">Información importante:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Los cambios de precio solo afectan a cuotas futuras</li>
              <li>Desactivar una actividad no afecta a socios que ya la tienen</li>
              <li>Las actividades inactivas no aparecen en el formulario de registro</li>
              <li>El orden determina cómo se muestran en el formulario</li>
            </ul>
          </div>
        </InfoCard>
      </div>

      {/* Confetti */}
      {showConfetti && <Confetti />}
    </div>
  )
}
