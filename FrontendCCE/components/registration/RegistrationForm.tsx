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
import toast from 'react-hot-toast'

const registrationSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  address: z.string().min(10, 'La dirección debe tener al menos 10 caracteres'),
  birthDate: z.string().min(1, 'La fecha de nacimiento es requerida'),
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
  }),
  terms: z.boolean().refine(val => val === true, 'Debes aceptar los términos y condiciones')
})

type RegistrationFormData = z.infer<typeof registrationSchema>

export default function RegistrationForm() {
  const { createMember } = useCreateMember()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
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
    setValue
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      medicalInfo: {
        hasConditions: false,
        conditions: '',
        allergies: '',
        medications: ''
      }
    }
  })

  const watchedValues = watch()

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      const newMember = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        activity: data.activity,
        status: 'active' as const,
        paymentStatus: 'pending' as const,
        registrationDate: new Date().toISOString().split('T')[0],
        membershipType: 'jugador' as const,
      }

      const success = await createMember(newMember)
      if (success) {
        setIsSubmitted(true)
        toast.success('¡Inscripción exitosa!')
      } else {
        toast.error('Error al procesar la inscripción')
      }
    } catch (error) {
      toast.error('Error al procesar la inscripción')
    }
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  if (isSubmitted) {
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
          ¡Inscripción Exitosa!
        </h2>
        <p className="text-gray-600 mb-6">
          Gracias por unirte al Club Comandante Espora. Te hemos enviado un email de confirmación.
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
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
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step <= currentStep 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              {step < currentStep ? '✓' : step}
            </div>
            {step < 3 && (
              <div className={`w-16 h-1 mx-2 ${
                step < currentStep ? 'bg-primary' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Personal Information */}
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

        {/* Step 3: Medical Information and Terms */}
        <AnimatePresence mode="wait">
          {currentStep === 3 && (
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

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="accent-button"
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
                  <CheckCircle size={20} />
                  Completar Inscripción
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
