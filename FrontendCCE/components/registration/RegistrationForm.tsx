'use client'

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Activity,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { registrationSchema, type RegistrationFormData } from '../../lib/validations'
import { useCreateMember, useLoadActividades } from '../../lib/hooks'

export default function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { createMember } = useCreateMember()
  const { actividades, isLoading: loadingActividades, error: actividadesError } = useLoadActividades()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
    setValue
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
    defaultValues: {
      exentoCuota: false,
      esJugador: false,
      actividades: []
    }
  })

  // Watch fechaNacimiento to calculate age and show/hide tutor fields
  const fechaNacimiento = watch('fechaNacimiento')
  const [age, setAge] = useState<number | null>(null)
  const [isMinor, setIsMinor] = useState(false)

  useEffect(() => {
    if (fechaNacimiento) {
      const birthDate = new Date(fechaNacimiento)
      const today = new Date()
      let calculatedAge = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--
      }
      setAge(calculatedAge)
      setIsMinor(calculatedAge < 18)
    } else {
      setAge(null)
      setIsMinor(false)
    }
  }, [fechaNacimiento])

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      console.log('Submitting registration:', data)

      // Transform form data to API format
      const memberData = {
        id: Date.now().toString(), // Temporary ID
        name: `${data.nombre} ${data.apellido}`,
        email: data.email,
        phone: data.telefono,
        status: 'active' as const,
        paymentStatus: data.exentoCuota ? ('paid' as const) : ('pending' as const),
        membershipType: data.esJugador ? ('jugador' as const) : ('socio' as const),
        registrationDate: new Date().toISOString().split('T')[0],
        nextPaymentDate: data.exentoCuota ?
          undefined :
          new Date().toISOString().split('T')[0]
      }

      const success = await createMember(memberData)

      if (success) {
        console.log('Member created successfully')
        setSubmitted(true)
        reset()
      } else {
        throw new Error('Failed to create member')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitError(error instanceof Error ? error.message : 'Error al registrar el miembro')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success screen
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-full flex items-center justify-center p-4"
      >
        <div className="neumorphism-card p-8 max-w-md text-center">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            ¡Registro Exitoso!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            El socio ha sido registrado correctamente en el sistema.
          </p>
          <button
            onClick={() => {
              setSubmitted(false)
              reset()
            }}
            className="primary-button"
          >
            Nuevo Registro
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-orange-500 dark:text-orange-400 mb-2">
            Registro de Nuevo Socio
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Complete los datos del nuevo socio para registrarlo en el sistema
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information Section */}
          <div className="neumorphism-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <User size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Información Personal
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('nombre')}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    errors.nombre ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'
                  }`}
                  placeholder="Juan"
                />
                {errors.nombre && (
                  <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>
                )}
              </div>

              {/* Apellido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('apellido')}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    errors.apellido ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'
                  }`}
                  placeholder="Pérez"
                />
                {errors.apellido && (
                  <p className="text-red-500 text-xs mt-1">{errors.apellido.message}</p>
                )}
              </div>

              {/* DNI */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  DNI <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('dni')}
                    className={`w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                      errors.dni ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'
                    }`}
                    placeholder="12345678"
                  />
                </div>
                {errors.dni && (
                  <p className="text-red-500 text-xs mt-1">{errors.dni.message}</p>
                )}
              </div>

              {/* Fecha de Nacimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha de Nacimiento <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('fechaNacimiento')}
                    type="date"
                    className={`w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                      errors.fechaNacimiento ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'
                    }`}
                  />
                </div>
                {errors.fechaNacimiento && (
                  <p className="text-red-500 text-xs mt-1">{errors.fechaNacimiento.message}</p>
                )}
                {age !== null && (
                  <p className="text-xs text-gray-500 mt-1">Edad: {age} años</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('email')}
                    type="email"
                    className={`w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                      errors.email ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'
                    }`}
                    placeholder="juan.perez@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('telefono')}
                    type="tel"
                    className={`w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                      errors.telefono ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'
                    }`}
                    placeholder="+54 9 11 1234-5678"
                  />
                </div>
                {errors.telefono && (
                  <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tutor Information (conditional - only for minors) */}
          {isMinor && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="neumorphism-card p-6 border-2 border-yellow-200 dark:border-yellow-700"
            >
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={20} className="text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Información del Tutor (Menor de 18 años)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tutor Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre del Tutor <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('tutorNombre')}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                      errors.tutorNombre ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'
                    }`}
                    placeholder="Nombre completo del tutor"
                  />
                  {errors.tutorNombre && (
                    <p className="text-red-500 text-xs mt-1">{errors.tutorNombre.message}</p>
                  )}
                </div>

                {/* Tutor Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Teléfono del Tutor <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      {...register('tutorTelefono')}
                      type="tel"
                      className={`w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                        errors.tutorTelefono ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'
                      }`}
                      placeholder="+54 9 11 1234-5678"
                    />
                  </div>
                  {errors.tutorTelefono && (
                    <p className="text-red-500 text-xs mt-1">{errors.tutorTelefono.message}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Activities Section */}
          <div className="neumorphism-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={20} className="text-accent" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Actividades
              </h3>
            </div>

            {loadingActividades ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={32} className="animate-spin text-gray-400" />
              </div>
            ) : actividadesError ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{actividadesError}</p>
              </div>
            ) : actividades.length === 0 ? (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  No hay actividades disponibles. Por favor, configure actividades en el sistema.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Seleccione las actividades en las que participará el socio (puede seleccionar múltiples):
                </p>
                <Controller
                  name="actividades"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {actividades.map((actividad) => (
                        <label
                          key={actividad.id}
                          className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                            field.value?.includes(actividad.id)
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={field.value?.includes(actividad.id) || false}
                            onChange={(e) => {
                              const currentValue = field.value || []
                              if (e.target.checked) {
                                field.onChange([...currentValue, actividad.id])
                              } else {
                                field.onChange(currentValue.filter((id) => id !== actividad.id))
                              }
                            }}
                            className="mt-0.5 w-4 h-4 text-blue-600"
                          />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {actividad.nombre}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              ${typeof actividad.monto === 'number' ? actividad.monto.toFixed(2) : actividad.monto} / mes
                            </p>
                            {actividad.descripcion && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {actividad.descripcion}
                              </p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                />
                {errors.actividades && (
                  <p className="text-red-500 text-xs mt-1">{errors.actividades.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Exemption Section */}
          <div className="neumorphism-card p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Configuración de Cuotas
            </h3>

            <div className="space-y-4">
              {/* Exento de Cuota */}
              <div className="flex items-start gap-3">
                <input
                  {...register('exentoCuota')}
                  type="checkbox"
                  className="mt-1 w-4 h-4 text-blue-600"
                />
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Exento de Cuota (Permanente)
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    El socio no deberá pagar cuotas mensuales
                  </p>
                </div>
              </div>

              {/* Mes de Gracia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mes de Gracia Hasta (Opcional)
                </label>
                <input
                  {...register('mesGraciaHasta')}
                  type="date"
                  className="w-full md:w-64 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  El socio estará exento de pagar cuotas hasta esta fecha
                </p>
              </div>

              {/* Es Jugador */}
              <div className="flex items-start gap-3">
                <input
                  {...register('esJugador')}
                  type="checkbox"
                  className="mt-1 w-4 h-4 text-blue-600"
                />
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Es Jugador
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    El socio participa activamente en actividades deportivas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="px-6 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Limpiar Formulario
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Registrar Socio
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
