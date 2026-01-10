'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  Calendar,
  Bell,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Info
} from 'lucide-react'

export default function ConfiguracionCuotas() {
  const [formData, setFormData] = useState({
    tipoCuota: 'por_actividad' as 'unica' | 'por_actividad',
    montoBase: 0,
    multipleActividadesStrategy: 'sumar' as 'sumar' | 'maximo' | 'descuento',
    descuentoActividades: 0,
    diaVencimiento: 10,
    recordatorioDiasAntes: 2,
    descuentoMenores: 0,
    generarAutomaticamente: true,
    enviarRecordatorios: true
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSaveSuccess(false)

    try {
      // TODO: Implement API call to save configuration
      // await api.configuracion.updateCuotas(formData)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la configuración')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="neumorphism-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <DollarSign size={20} className="text-green-600" />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Configuración de Cuotas
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de Cuota */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Tipo de Cuota <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            <div
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                formData.tipoCuota === 'unica'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setFormData({ ...formData, tipoCuota: 'unica' })}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="tipoCuota"
                  checked={formData.tipoCuota === 'unica'}
                  onChange={() => setFormData({ ...formData, tipoCuota: 'unica' })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    Cuota Única para Todos
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Todos los socios pagan el mismo monto mensual, independientemente de las actividades
                  </div>
                  {formData.tipoCuota === 'unica' && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Monto Mensual
                      </label>
                      <div className="relative w-48">
                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.montoBase}
                          onChange={(e) =>
                            setFormData({ ...formData, montoBase: parseFloat(e.target.value) })
                          }
                          className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                formData.tipoCuota === 'por_actividad'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setFormData({ ...formData, tipoCuota: 'por_actividad' })}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="tipoCuota"
                  checked={formData.tipoCuota === 'por_actividad'}
                  onChange={() => setFormData({ ...formData, tipoCuota: 'por_actividad' })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    Cuota Diferenciada por Actividad
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Cada actividad tiene su propio precio. Se calcula según las actividades del socio
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                    💡 Los precios de cada actividad se configuran en la sección "Actividades"
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estrategia para Múltiples Actividades */}
        {formData.tipoCuota === 'por_actividad' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              ¿Cómo calcular cuando un socio tiene múltiples actividades?
            </label>
            <div className="space-y-2">
              <div
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  formData.multipleActividadesStrategy === 'sumar'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
                onClick={() => setFormData({ ...formData, multipleActividadesStrategy: 'sumar' })}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="strategy"
                    checked={formData.multipleActividadesStrategy === 'sumar'}
                    onChange={() => setFormData({ ...formData, multipleActividadesStrategy: 'sumar' })}
                  />
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      Sumar todas las actividades
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      Ej: Básquet ($3000) + Gimnasio ($2000) = $5000/mes
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  formData.multipleActividadesStrategy === 'maximo'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
                onClick={() => setFormData({ ...formData, multipleActividadesStrategy: 'maximo' })}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="strategy"
                    checked={formData.multipleActividadesStrategy === 'maximo'}
                    onChange={() => setFormData({ ...formData, multipleActividadesStrategy: 'maximo' })}
                  />
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      Cobrar solo la más cara
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      Ej: Básquet ($3000) + Gimnasio ($2000) = $3000/mes
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  formData.multipleActividadesStrategy === 'descuento'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
                onClick={() =>
                  setFormData({ ...formData, multipleActividadesStrategy: 'descuento' })
                }
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="strategy"
                    checked={formData.multipleActividadesStrategy === 'descuento'}
                    onChange={() =>
                      setFormData({ ...formData, multipleActividadesStrategy: 'descuento' })
                    }
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      Aplicar descuento en actividades adicionales
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      La primera actividad precio completo, las demás con descuento
                    </div>
                    {formData.multipleActividadesStrategy === 'descuento' && (
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Descuento (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.descuentoActividades}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              descuentoActividades: parseFloat(e.target.value)
                            })
                          }
                          className="w-24 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          placeholder="20"
                        />
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Ej: Básquet $3000 + Gimnasio $2000 con 20% = $3000 + $1600 = $4600/mes
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Día de Vencimiento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Día de Vencimiento <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={formData.diaVencimiento}
                onChange={(e) =>
                  setFormData({ ...formData, diaVencimiento: parseInt(e.target.value) })
                }
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    Día {day} de cada mes
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Las cuotas vencerán este día de cada mes
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Enviar Recordatorios
            </label>
            <div className="relative">
              <Bell size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={formData.recordatorioDiasAntes}
                onChange={(e) =>
                  setFormData({ ...formData, recordatorioDiasAntes: parseInt(e.target.value) })
                }
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value={1}>1 día antes</option>
                <option value={2}>2 días antes</option>
                <option value={3}>3 días antes</option>
                <option value={5}>5 días antes</option>
                <option value={7}>7 días antes</option>
              </select>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Los socios recibirán un email recordatorio
            </p>
          </div>
        </div>

        {/* Descuento para Menores */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descuento para Menores de 18 años (%)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              max="100"
              value={formData.descuentoMenores}
              onChange={(e) =>
                setFormData({ ...formData, descuentoMenores: parseFloat(e.target.value) })
              }
              className="w-32 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="0"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formData.descuentoMenores > 0
                ? `Los menores pagarán ${100 - formData.descuentoMenores}% del monto`
                : 'Sin descuento'}
            </span>
          </div>
        </div>

        {/* Opciones Adicionales */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.generarAutomaticamente}
              onChange={(e) =>
                setFormData({ ...formData, generarAutomaticamente: e.target.checked })
              }
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Generar cuotas automáticamente
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                El sistema generará las cuotas el 1ro de cada mes a las 00:00
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.enviarRecordatorios}
              onChange={(e) =>
                setFormData({ ...formData, enviarRecordatorios: e.target.checked })
              }
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enviar recordatorios de pago automáticamente
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Los socios recibirán emails recordando el vencimiento de su cuota
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-1">Importante:</p>
              <ul className="list-disc list-inside space-y-1 text-yellow-700 dark:text-yellow-300">
                <li>Los cambios de precios solo afectarán cuotas futuras</li>
                <li>Las cuotas ya generadas mantendrán su monto original</li>
                <li>Los socios con "Exento de cuota" no generarán cuotas automáticas</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {saveSuccess && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            <p className="text-sm text-green-600 dark:text-green-400">
              Configuración guardada correctamente
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={16} />
                Guardar Configuración
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
