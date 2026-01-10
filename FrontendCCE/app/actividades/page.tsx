'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
      }

      // Reload activities and reset form
      await loadActividades()
      handleCancel()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al guardar actividad')
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
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al cambiar estado de actividad')
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
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar actividad')
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-gray-400" />
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
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus size={20} />
                Nueva Actividad
              </button>
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
              <form onSubmit={handleSubmit} className="neumorphism-card p-6">
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
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                  >
                    <X size={16} className="inline mr-1" />
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Guardar
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Activities List */}
        <div className="neumorphism-card p-6">
          {actividades.length === 0 ? (
            <div className="text-center py-12">
              <Activity size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">
                No hay actividades registradas
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Comienza creando tu primera actividad deportiva
              </p>
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus size={20} />
                Nueva Actividad
              </button>
            </div>
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
                        {actividad.activa ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Activa
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Inactiva
                          </span>
                        )}
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
                      <button
                        onClick={() => handleToggleActive(actividad.id, actividad.activa)}
                        className={`p-2 rounded-lg transition-colors ${
                          actividad.activa
                            ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        title={actividad.activa ? 'Desactivar' : 'Activar'}
                      >
                        {actividad.activa ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                      <button
                        onClick={() => handleEdit(actividad)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(actividad.id, actividad.nombre)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Información importante:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                <li>Los cambios de precio solo afectan a cuotas futuras</li>
                <li>Desactivar una actividad no afecta a socios que ya la tienen</li>
                <li>Las actividades inactivas no aparecen en el formulario de registro</li>
                <li>El orden determina cómo se muestran en el formulario</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
