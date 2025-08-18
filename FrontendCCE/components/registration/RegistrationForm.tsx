'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Activity, 
  CheckCircle,
  ArrowLeft
} from 'lucide-react'
import { useAppStore } from '../../lib/store'
import { useCreateMember } from '../../lib/hooks'
import { api } from '../../lib/api'
import toast from 'react-hot-toast'

// Schema base para información personal
const baseSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  address: z.string().min(10, 'La dirección debe tener al menos 10 caracteres'),
  birthDate: z.string().min(1, 'La fecha de nacimiento es requerida'),
  membershipType: z.enum(['socio', 'jugador']),
  trialMonth: z.boolean().optional(),
  terms: z.boolean().refine(val => val === true, 'Debes aceptar los términos y condiciones')
})

// Schema para jugadores (incluye actividad, contacto emergencia y datos médicos)
const jugadorSchema = baseSchema.extend({
  activity: z.enum(['basketball', 'volleyball', 'karate', 'gym']),
  emergencyContact: z.object({
    name: z.string().min(2, 'El nombre del contacto de emergencia es requerido'),
    phone: z.string().min(10, 'El teléfono del contacto de emergencia es requerido'),
    relationship: z.string().min(2, 'La relación es requerida')
  }),
  medicalInfo: z.object({
    hasConditions: z.boolean(),
    conditions: z.string().optional(),
    allergies: z.string().optional(),
    medications: z.string().optional()
  })
})

// Schema dinámico basado en el tipo de membresía
const getRegistrationSchema = (membershipType: string) => {
  return membershipType === 'jugador' ? jugadorSchema : baseSchema
}

type BaseFormData = z.infer<typeof baseSchema>
type JugadorFormData = z.infer<typeof jugadorSchema>
type RegistrationFormData = BaseFormData | JugadorFormData

export default function RegistrationForm() {
  const { createMember } = useCreateMember()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [membershipType, setMembershipType] = useState<'socio' | 'jugador' | ''>('')
  const [trialMonth, setTrialMonth] = useState(false)
  const [medicalInfo, setMedicalInfo] = useState({
    hasConditions: false,
    conditions: '',
    allergies: '',
    medications: ''
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset
  } = useForm<any>({
    resolver: zodResolver(membershipType ? getRegistrationSchema(membershipType) : baseSchema),
    defaultValues: {
      membershipType: '',
      trialMonth: false,
      medicalInfo: {
        hasConditions: false,
        conditions: '',
        allergies: '',
        medications: ''
      }
    }
  })

  const watchedValues = watch()

  const sendPaymentEmail = async (memberData: any) => {
    try {
      const response = await api.socios.sendPaymentEmail(memberData)
      if (response.success) {
        setEmailSent(true)
        toast.success('¡Email de pago enviado!')
      } else {
        toast.error('Error al enviar el email')
      }
    } catch (error) {
      console.error('Error enviando email:', error)
      toast.error('Error al enviar el email')
    }
  }

  const onSubmit = async (data: any) => {
    try {
      const newMember = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        activity: data.activity || undefined,
        status: 'active' as const,
        paymentStatus: trialMonth ? 'paid' : 'pending' as const,
        registrationDate: new Date().toISOString().split('T')[0],
        membershipType: membershipType as 'socio' | 'jugador',
        trialMonth
      }

      const success = await createMember(newMember)
      if (success) {
        if (trialMonth) {
          setIsSubmitted(true)
          toast.success('¡Inscripción exitosa! Mes de prueba activado.')
        } else {
          // Enviar email con información de pago
          await sendPaymentEmail(newMember)
        }
      } else {
        toast.error('Error al procesar la inscripción')
      }
    } catch (error) {
      toast.error('Error al procesar la inscripción')
    }
  }

  const getMaxSteps = () => {
    if (membershipType === 'socio') return 3 // Personal + Email + Confirmación
    if (membershipType === 'jugador') return 4 // Personal + Actividad/Emergencia + Médico + Email
    return 3
  }

  const nextStep = () => {
    if (membershipType === 'socio' && currentStep === 1) {
      setCurrentStep(3) // Skip step 2 for socios
    } else {
      setCurrentStep(prev => Math.min(prev + 1, getMaxSteps()))
    }
  }
  
  const prevStep = () => {
    if (membershipType === 'socio' && currentStep === 3) {
      setCurrentStep(1) // Go back to step 1 for socios
    } else {
      setCurrentStep(prev => Math.max(prev - 1, 1))
    }
  }

  if (isSubmitted || emailSent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="neumorphism-card p-8 text-center max-w-md mx-auto"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {isSubmitted ? '¡Inscripción Completada!' : '¡Email Enviado!'}
        </h2>
        <p className="text-gray-600 mb-6">
          {isSubmitted 
            ? 'Tu inscripción ha sido procesada exitosamente. ¡Bienvenido al Club Comandante Espora!'
            : 'Te hemos enviado un email con la información de pago. Revisa tu bandeja de entrada.'
          }
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false)
            setEmailSent(false)
            setCurrentStep(1)
            setMembershipType('')
            setTrialMonth(false)
            reset()
          }}
          className="primary-button"
        >
          Nueva Inscripción
        </button>
      </motion.div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gradient mb-2">
          Inscripción al Club
        </h1>
        <p className="text-gray-600">
          Únete al Club Comandante Espora y forma parte de nuestra comunidad deportiva
        </p>
      </motion.div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {Array.from({ length: getMaxSteps() }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step <= currentStep 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              {step < currentStep ? '✓' : step}
            </div>
            {step < getMaxSteps() && (
              <div className={`w-16 h-1 mx-2 ${
                step < currentStep ? 'bg-primary' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="flex justify-center mb-8">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {currentStep === 1 && 'Información Personal'}
            {currentStep === 2 && membershipType === 'jugador' && 'Actividad y Contacto de Emergencia'}
            {currentStep === 3 && membershipType === 'jugador' && 'Información Médica'}
            {currentStep === 3 && membershipType === 'socio' && 'Confirmación y Pago'}
            {currentStep === 4 && 'Confirmación y Pago'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Personal Information and Membership Type */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="neumorphism-card p-6"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <User size={24} className="text-primary" />
                Información Personal
              </h3>
              
              {/* Membership Type Selection */}
              <div className="mb-8">
                <label className="form-label">Tipo de Membresía *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div 
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      membershipType === 'socio' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setMembershipType('socio')}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="membershipType"
                        value="socio"
                        checked={membershipType === 'socio'}
                        onChange={(e) => setMembershipType('socio')}
                        className="text-blue-600"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-800">Socio</h4>
                        <p className="text-sm text-gray-600">Solo acceso a instalaciones del club</p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      membershipType === 'jugador' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setMembershipType('jugador')}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="membershipType"
                        value="jugador"
                        checked={membershipType === 'jugador'}
                        onChange={(e) => setMembershipType('jugador')}
                        className="text-blue-600"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-800">Jugador</h4>
                        <p className="text-sm text-gray-600">Participación en actividades deportivas</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trial Month Option */}
              <div className="mb-6 p-4 border border-yellow-200 rounded-xl bg-yellow-50">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={trialMonth}
                    onChange={(e) => setTrialMonth(e.target.checked)}
                    className="text-yellow-600 rounded"
                  />
                  <div>
                    <span className="font-semibold text-yellow-800">Mes de Prueba</span>
                    <p className="text-sm text-yellow-700">
                      Inscríbete sin pago inicial. Tendrás 30 días para decidir si continuar.
                    </p>
                  </div>
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Nombre Completo *</label>
                  <input
                    {...register('name')}
                    className={`form-input ${errors.name ? 'border-red-300' : ''}`}
                    placeholder="Ingresa tu nombre completo"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Email *</label>
                  <input
                    {...register('email')}
                    type="email"
                    className={`form-input ${errors.email ? 'border-red-300' : ''}`}
                    placeholder="tu@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Teléfono *</label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className={`form-input ${errors.phone ? 'border-red-300' : ''}`}
                    placeholder="+54 9 11 1234-5678"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Fecha de Nacimiento *</label>
                  <input
                    {...register('birthDate')}
                    type="date"
                    className={`form-input ${errors.birthDate ? 'border-red-300' : ''}`}
                  />
                  {errors.birthDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.birthDate.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="form-label">Dirección *</label>
                  <input
                    {...register('address')}
                    className={`form-input ${errors.address ? 'border-red-300' : ''}`}
                    placeholder="Calle, número, ciudad, provincia"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 2: Activity and Emergency Contact */}
        <AnimatePresence mode="wait">
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="neumorphism-card p-6"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <Activity size={24} className="text-accent" />
                Actividad y Contacto de Emergencia
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Actividad Principal *</label>
                  <select
                    {...register('activity')}
                    className="form-input"
                  >
                    <option value="">Selecciona una actividad</option>
                    <option value="basketball">Básquet</option>
                    <option value="volleyball">Vóley</option>
                    <option value="karate">Karate</option>
                    <option value="gym">Gimnasio</option>
                  </select>
                  {errors.activity && (
                    <p className="text-red-500 text-sm mt-1">{errors.activity.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Nombre del Contacto de Emergencia *</label>
                  <input
                    {...register('emergencyContact.name')}
                    className={`form-input ${errors.emergencyContact?.name ? 'border-red-300' : ''}`}
                    placeholder="Nombre completo"
                  />
                  {errors.emergencyContact?.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.emergencyContact.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Teléfono de Emergencia *</label>
                  <input
                    {...register('emergencyContact.phone')}
                    type="tel"
                    className={`form-input ${errors.emergencyContact?.phone ? 'border-red-300' : ''}`}
                    placeholder="+54 9 11 1234-5678"
                  />
                  {errors.emergencyContact?.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.emergencyContact.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Relación *</label>
                  <input
                    {...register('emergencyContact.relationship')}
                    className={`form-input ${errors.emergencyContact?.relationship ? 'border-red-300' : ''}`}
                    placeholder="Padre, madre, cónyuge, etc."
                  />
                  {errors.emergencyContact?.relationship && (
                    <p className="text-red-500 text-sm mt-1">{errors.emergencyContact.relationship.message}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 3: Medical Information and Terms (Solo Jugadores) */}
        <AnimatePresence mode="wait">
          {currentStep === 3 && membershipType === 'jugador' && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="neumorphism-card p-6"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <CheckCircle size={24} className="text-green-600" />
                Información Médica y Términos
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="form-label">¿Tienes alguna condición médica?</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={medicalInfo.hasConditions}
                        onChange={() => setMedicalInfo(prev => ({ ...prev, hasConditions: true }))}
                        className="text-primary"
                      />
                      Sí
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={!medicalInfo.hasConditions}
                        onChange={() => setMedicalInfo(prev => ({ ...prev, hasConditions: false }))}
                        className="text-primary"
                      />
                      No
                    </label>
                  </div>
                </div>

                {medicalInfo.hasConditions && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Condiciones Médicas</label>
                      <textarea
                        value={medicalInfo.conditions}
                        onChange={(e) => setMedicalInfo(prev => ({ ...prev, conditions: e.target.value }))}
                        className="form-input"
                        rows={3}
                        placeholder="Describe tus condiciones médicas"
                      />
                    </div>
                    <div>
                      <label className="form-label">Alergias</label>
                      <textarea
                        value={medicalInfo.allergies}
                        onChange={(e) => setMedicalInfo(prev => ({ ...prev, allergies: e.target.value }))}
                        className="form-input"
                        rows={3}
                        placeholder="Lista de alergias (si las hay)"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="form-label">Medicamentos</label>
                  <textarea
                    value={medicalInfo.medications}
                    onChange={(e) => setMedicalInfo(prev => ({ ...prev, medications: e.target.value }))}
                    className="form-input"
                    rows={3}
                    placeholder="Medicamentos que tomas regularmente (si los hay)"
                  />
                </div>

                <div className="border-t pt-6">
                  <label className="flex items-start gap-3">
                    <input
                      {...register('terms')}
                      type="checkbox"
                      className="mt-1 text-primary rounded"
                    />
                    <span className="text-sm text-gray-600">
                      Acepto los <a href="#" className="text-primary hover:underline">términos y condiciones</a> del club, 
                      incluyendo el uso de mi información personal para fines administrativos y de comunicación.
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="text-red-500 text-sm mt-1">{errors.terms.message}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 3: Confirmación y Pago (Solo Socios) / Step 4: Confirmación y Pago (Jugadores) */}
        <AnimatePresence mode="wait">
          {((currentStep === 3 && membershipType === 'socio') || 
            (currentStep === 4 && membershipType === 'jugador')) && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="neumorphism-card p-6"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <Mail size={24} className="text-blue-600" />
                Confirmación y Información de Pago
              </h3>

              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Resumen de tu inscripción</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><strong>Tipo:</strong> {membershipType === 'socio' ? 'Socio' : 'Jugador'}</p>
                    {membershipType === 'jugador' && watchedValues.activity && (
                      <p><strong>Actividad:</strong> {
                        watchedValues.activity === 'basketball' ? 'Básquet' :
                        watchedValues.activity === 'volleyball' ? 'Vóley' :
                        watchedValues.activity === 'karate' ? 'Karate' : 'Gimnasio'
                      }</p>
                    )}
                    <p><strong>Modalidad:</strong> {trialMonth ? 'Mes de Prueba' : 'Membresía Regular'}</p>
                  </div>
                </div>

                {trialMonth ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">✨ Mes de Prueba</h4>
                    <p className="text-sm text-yellow-700">
                      Te has registrado para el mes de prueba. No necesitas realizar ningún pago inicial.
                      Tendrás 30 días para probar nuestras instalaciones y decidir si continuar.
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h4 className="font-semibold text-green-800 mb-2">💳 Información de Pago</h4>
                    <p className="text-sm text-green-700 mb-3">
                      Te enviaremos un email con toda la información necesaria para completar tu pago:
                    </p>
                    <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                      <li>Datos bancarios para transferencia</li>
                      <li>Código QR para MercadoPago</li>
                      <li>Horarios de atención para pago en efectivo</li>
                      <li>Monto exacto de la cuota mensual</li>
                    </ul>
                  </div>
                )}

                <div className="border-t pt-6">
                  <div className="mb-4">
                    <label className="form-label">¿Confirmas que los datos ingresados son correctos?</label>
                  </div>
                  <label className="flex items-start gap-3">
                    <input
                      {...register('terms')}
                      type="checkbox"
                      className="mt-1 text-primary rounded"
                    />
                    <span className="text-sm text-gray-600">
                      Confirmo que los datos ingresados son correctos y acepto los{' '}
                      <a href="#" className="text-primary hover:underline">términos y condiciones</a>{' '}
                      del Club Comandante Espora, incluyendo el uso de mi información personal 
                      para fines administrativos y de comunicación.
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="text-red-500 text-sm mt-1">{errors.terms.message}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={20} />
            Anterior
          </button>

          {currentStep < getMaxSteps() ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={currentStep === 1 && !membershipType}
              className={`accent-button ${
                currentStep === 1 && !membershipType 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
            >
              Siguiente
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="primary-button flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <Mail size={20} />
                  {trialMonth ? 'Completar Inscripción' : 'Enviar Email de Pago'}
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
