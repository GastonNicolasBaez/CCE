'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Mail, 
  Activity, 
  Heart, 
  CheckCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import { registrationSchema, type RegistrationFormData } from '../../lib/validations'
import { useCreateMember } from '../../lib/hooks'

export default function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [membershipType, setMembershipType] = useState<'socio' | 'jugador' | ''>('')
  const [trialMonth, setTrialMonth] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { createMember } = useCreateMember()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    trigger,
    watch
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange'
  })

  const getMaxSteps = () => {
    return membershipType === 'jugador' ? 4 : 3
  }

  const nextStep = async () => {
    let fieldsToValidate: (keyof RegistrationFormData)[] = []
    
    if (currentStep === 1) {
      fieldsToValidate = ['name', 'email', 'phone', 'birthDate', 'address']
    } else if (currentStep === 2 && membershipType === 'jugador') {
      fieldsToValidate = ['activity', 'emergencyContact']
    } else if (currentStep === 3 && membershipType === 'jugador') {
      fieldsToValidate = ['medicalInfo']
    }

    const isValid = await trigger(fieldsToValidate)
    if (isValid && currentStep < getMaxSteps()) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true)
    try {
      // Transformar los datos del formulario al formato esperado por el store
      const memberData = {
        id: Date.now().toString(), // Temporal, se generará en el backend
        name: data.name,
        email: data.email,
        phone: data.phone,
        activity: membershipType === 'jugador' ? (data.activity as 'basketball' | 'volleyball' | 'karate' | 'gym' | 'solo-socio') : undefined,
        status: 'active' as const,
        paymentStatus: trialMonth ? ('paid' as const) : ('pending' as const),
        membershipType: membershipType as 'socio' | 'jugador',
        registrationDate: new Date().toISOString().split('T')[0],
        lastPaymentDate: trialMonth ? new Date().toISOString().split('T')[0] : undefined,
        nextPaymentDate: trialMonth ? 
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0]
      }

      const success = await createMember(memberData)
      if (success) {
        console.log('Member created successfully:', { ...data, membershipType, trialMonth })
        setSubmitted(true)
      } else {
        throw new Error('Failed to create member')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Error al registrar el miembro. Por favor intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-full flex items-center justify-center"
      >
        <div className="neumorphism-card p-8 max-w-md text-center">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            ¡Inscripción Enviada!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {trialMonth 
              ? 'Tu período de prueba de 30 días ha comenzado. Te contactaremos pronto.'
              : 'Recibirás un email con los datos de pago en los próximos minutos.'
            }
          </p>
          <button
            onClick={() => {
              setSubmitted(false)
              setCurrentStep(1)
              setMembershipType('')
              setTrialMonth(false)
              reset()
            }}
            className="primary-button"
          >
            Nueva Inscripción
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto">
      {/* Header compacto */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4 flex-shrink-0"
      >
        <h1 className="text-xl font-bold text-orange-500 dark:text-orange-400 mb-1">
          Inscripción al Club Comandante Espora
        </h1>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Complete el formulario para unirse a nuestra comunidad deportiva
        </p>
      </motion.div>

      {/* Layout usando grid más compacto */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Sidebar con progreso - más estrecho */}
        <div className="lg:col-span-3 xl:col-span-2">
          <div className="neumorphism-card p-3 h-fit">
            <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Progreso
            </h3>
            
            {/* Steps compactos verticales */}
            <div className="space-y-3">
              {Array.from({ length: getMaxSteps() }, (_, i) => i + 1).map((step) => {
                const stepLabels = [
                  'Datos Personales',
                  membershipType === 'jugador' ? 'Actividad/Emergencia' : 'Confirmación',
                  membershipType === 'jugador' ? 'Info. Médica' : '',
                  membershipType === 'jugador' ? 'Confirmación' : ''
                ].filter(Boolean)

                return (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                      step <= currentStep 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                    }`}>
                      {step < currentStep ? '✓' : step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${
                        step <= currentStep 
                          ? 'text-primary dark:text-blue-400' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {stepLabels[step - 1]}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Área principal del formulario */}
        <div className="lg:col-span-9 xl:col-span-10 flex flex-col min-h-0">
          <div className="neumorphism-card p-4 flex-1 min-h-0 overflow-hidden">
            <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
              {/* Contenido del formulario con scroll interno */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                
                {/* Step 1: Personal Information */}
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <User size={16} className="text-primary" />
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          Información Personal
                        </h3>
                      </div>
                      
                      {/* Membership Type Selection */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Membresía *</label>
                        <div className="grid grid-cols-2 gap-2">
                          <div 
                            className={`border rounded-lg p-2 cursor-pointer transition-all ${
                              membershipType === 'socio' 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                            onClick={() => setMembershipType('socio')}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="membershipType"
                                value="socio"
                                checked={membershipType === 'socio'}
                                onChange={() => setMembershipType('socio')}
                                className="text-blue-600"
                              />
                              <div>
                                <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200">Socio</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Instalaciones</p>
                              </div>
                            </div>
                          </div>
                          
                          <div 
                            className={`border rounded-lg p-2 cursor-pointer transition-all ${
                              membershipType === 'jugador' 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                            onClick={() => setMembershipType('jugador')}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="membershipType"
                                value="jugador"
                                checked={membershipType === 'jugador'}
                                onChange={() => setMembershipType('jugador')}
                                className="text-blue-600"
                              />
                              <div>
                                <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200">Jugador</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Deportes</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Trial Month Option */}
                      <div className="p-2 border border-yellow-200 dark:border-yellow-700 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={trialMonth}
                            onChange={(e) => setTrialMonth(e.target.checked)}
                            className="w-3 h-3 text-yellow-600"
                          />
                          <div>
                            <span className="text-xs font-semibold text-yellow-800 dark:text-yellow-200">Mes de Prueba</span>
                            <span className="text-xs text-yellow-700 dark:text-yellow-300 ml-1">- 30 días sin pago</span>
                          </div>
                        </label>
                      </div>
                      
                      {/* Personal Info Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Completo *</label>
                          <input
                            {...register('name')}
                            className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${errors.name ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'}`}
                            placeholder="Tu nombre completo"
                          />
                          {errors.name && (
                            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                          <input
                            {...register('email')}
                            type="email"
                            className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${errors.email ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'}`}
                            placeholder="tu@email.com"
                          />
                          {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono *</label>
                          <input
                            {...register('phone')}
                            type="tel"
                            className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${errors.phone ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'}`}
                            placeholder="+54 9 11 1234-5678"
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Nacimiento *</label>
                          <input
                            {...register('birthDate')}
                            type="date"
                            className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${errors.birthDate ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'}`}
                          />
                          {errors.birthDate && (
                            <p className="text-red-500 text-xs mt-1">{errors.birthDate.message}</p>
                          )}
                        </div>

                        <div className="md:col-span-2 lg:col-span-3">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección *</label>
                          <input
                            {...register('address')}
                            className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${errors.address ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'}`}
                            placeholder="Calle, número, ciudad, provincia"
                          />
                          {errors.address && (
                            <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Activity and Emergency Contact (Only for players) */}
                  {currentStep === 2 && membershipType === 'jugador' && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Activity size={16} className="text-accent" />
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          Actividad y Contacto de Emergencia
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Actividad Principal *</label>
                          <select
                            {...register('activity')}
                            className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${errors.activity ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'}`}
                          >
                            <option value="">Selecciona una actividad</option>
                            <option value="basketball">Básquet</option>
                            <option value="volleyball">Vóley</option>
                            <option value="karate">Karate</option>
                            <option value="gym">Gimnasio</option>
                            <option value="solo-socio">Solo Socio</option>
                          </select>
                          {errors.activity && (
                            <p className="text-red-500 text-xs mt-1">{errors.activity.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Contacto de Emergencia *</label>
                          <input
                            {...register('emergencyContact.name')}
                            className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${errors.emergencyContact?.name ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'}`}
                            placeholder="Nombre del contacto"
                          />
                          {errors.emergencyContact?.name && (
                            <p className="text-red-500 text-xs mt-1">{errors.emergencyContact.name.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono Emergencia *</label>
                          <input
                            {...register('emergencyContact.phone')}
                            type="tel"
                            className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${errors.emergencyContact?.phone ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'}`}
                            placeholder="+54 9 11 1234-5678"
                          />
                          {errors.emergencyContact?.phone && (
                            <p className="text-red-500 text-xs mt-1">{errors.emergencyContact.phone.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Relación</label>
                          <input
                            {...register('emergencyContact.relationship')}
                            className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${errors.emergencyContact?.relationship ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'}`}
                            placeholder="Ej: Padre, Madre, Hermano"
                          />
                          {errors.emergencyContact?.relationship && (
                            <p className="text-red-500 text-xs mt-1">{errors.emergencyContact.relationship.message}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Medical Info (Only for players) */}
                  {currentStep === 3 && membershipType === 'jugador' && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Heart size={16} className="text-red-500" />
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          Información Médica
                        </h3>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">¿Tienes alguna condición médica?</label>
                          <textarea
                            {...register('medicalInfo.conditions')}
                            rows={3}
                            className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none ${errors.medicalInfo?.conditions ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'}`}
                            placeholder="Describe cualquier condición médica relevante o escribe 'Ninguna'"
                          />
                          {errors.medicalInfo?.conditions && (
                            <p className="text-red-500 text-xs mt-1">{errors.medicalInfo.conditions.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">¿Tomas algún medicamento?</label>
                          <textarea
                            {...register('medicalInfo.medications')}
                            rows={2}
                            className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none ${errors.medicalInfo?.medications ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'}`}
                            placeholder="Lista medicamentos actuales o escribe 'Ninguno'"
                          />
                          {errors.medicalInfo?.medications && (
                            <p className="text-red-500 text-xs mt-1">{errors.medicalInfo.medications.message}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Final Step: Confirmation */}
                  {((currentStep === 2 && membershipType === 'socio') || 
                    (currentStep === 4 && membershipType === 'jugador')) && (
                    <motion.div
                      key="final"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle size={16} className="text-green-500" />
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          Confirmación
                        </h3>
                      </div>
                      
                      <div className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input
                            {...register('terms')}
                            type="checkbox"
                            className="mt-0.5 w-3 h-3 text-blue-600"
                          />
                          <span className="text-xs text-gray-700 dark:text-gray-300">
                            Acepto los <span className="text-blue-600 underline">términos y condiciones</span> del club
                          </span>
                        </label>
                        {errors.terms && (
                          <p className="text-red-500 text-xs mt-1">{errors.terms.message}</p>
                        )}
                      </div>

                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-2">Resumen de Inscripción</h4>
                        <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                          <p><strong>Tipo:</strong> {membershipType === 'socio' ? 'Socio' : 'Jugador'}</p>
                          <p><strong>Modalidad:</strong> {trialMonth ? 'Mes de prueba (30 días)' : 'Inscripción completa'}</p>
                          {membershipType === 'jugador' && watch('activity') && (
                            <p><strong>Actividad:</strong> {watch('activity')}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Botones de navegación compactos */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-600 flex-shrink-0">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center gap-1 px-3 py-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    <ArrowLeft size={12} />
                    Anterior
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < getMaxSteps() ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={currentStep === 1 && !membershipType}
                    className={`flex items-center gap-1 px-4 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                      currentStep === 1 && !membershipType ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Siguiente
                    <ArrowRight size={12} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-1 px-4 py-2 text-xs bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Mail size={12} />
                        {trialMonth ? 'Completar' : 'Enviar'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}