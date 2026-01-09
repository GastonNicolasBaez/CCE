import { z } from 'zod'

// ✅ ACTIVIDADES UNIFICADAS CON EL BACKEND
const ACTIVITIES = ['Basquet', 'Voley', 'Karate', 'Gimnasio', 'Solo socio'] as const
const FRONTEND_ACTIVITIES = ['basketball', 'volleyball', 'karate', 'gym', 'solo-socio'] as const

// ✅ ESTADOS UNIFICADOS CON EL BACKEND  
const MEMBER_STATES = ['active', 'inactive', 'suspended'] as const
const PAYMENT_STATES = ['paid', 'pending', 'overdue', 'cancelled'] as const

// Schema for emergency contact
const emergencyContactSchema = z.object({
  name: z.string().min(1, 'El nombre del contacto es requerido'),
  phone: z.string().min(1, 'El teléfono del contacto es requerido'),
  relationship: z.string().optional()
})

// Schema for medical information
const medicalInfoSchema = z.object({
  conditions: z.string().min(1, 'La información médica es requerida'),
  medications: z.string().min(1, 'La información sobre medicamentos es requerida')
})

// ✅ SCHEMA DE REGISTRO ACTUALIZADO PARA BACKEND MULTI-TENANT
export const registrationSchema = z.object({
  // Personal Information - Backend expects nombre/apellido separate
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  dni: z.string()
    .min(7, 'El DNI debe tener al menos 7 dígitos')
    .max(20, 'El DNI no puede tener más de 20 dígitos')
    .regex(/^\d+$/, 'El DNI debe contener solo números'),
  email: z.string().email('Ingresa un email válido'),
  telefono: z.string().min(8, 'El teléfono debe tener al menos 8 dígitos'),
  fechaNacimiento: z.string().min(1, 'La fecha de nacimiento es requerida'),

  // Actividades - array of activity IDs (multiple selection)
  actividades: z.array(z.number()).min(0, 'Selecciona al menos una actividad').optional(),

  // Tutor fields (required if age < 18, validated conditionally in form)
  tutorNombre: z.string().optional(),
  tutorTelefono: z.string().optional(),

  // Exemption fields
  exentoCuota: z.boolean().default(false),
  mesGraciaHasta: z.string().optional(), // Date string or undefined

  // For backward compatibility (optional)
  esJugador: z.boolean().default(false)
})
.superRefine((data, ctx) => {
  // Calculate age from fechaNacimiento
  const birthDate = new Date(data.fechaNacimiento)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  // If minor, tutor fields are required
  if (age < 18) {
    if (!data.tutorNombre || data.tutorNombre.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El nombre del tutor es obligatorio para menores de 18 años',
        path: ['tutorNombre']
      })
    }
    if (!data.tutorTelefono || data.tutorTelefono.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El teléfono del tutor es obligatorio para menores de 18 años',
        path: ['tutorTelefono']
      })
    }
  }
})

// Type inference from schema
export type RegistrationFormData = z.infer<typeof registrationSchema>

// ✅ SCHEMA DE MIEMBRO CORREGIDO CON CRITERIOS UNIFICADOS
export const memberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  activity: z.enum(FRONTEND_ACTIVITIES).optional(),
  status: z.enum(MEMBER_STATES).default('active'), // ✅ Estados corregidos
  membershipType: z.enum(['socio', 'jugador']).default('socio'),
  paymentStatus: z.enum(PAYMENT_STATES).default('pending'), // ✅ Estados de pago corregidos
  registrationDate: z.string(), // ✅ Renombrado de joinDate
  lastPaymentDate: z.string().optional(), // ✅ Renombrado de lastPayment
  nextPaymentDate: z.string().optional() // ✅ Nuevo campo
})

export type Member = z.infer<typeof memberSchema>

// ✅ SCHEMA DE RECORDATORIO DE PAGO CORREGIDO
export const paymentReminderSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  memberName: z.string(),
  activity: z.string(),
  amount: z.number(),
  dueDate: z.string(),
  sent: z.boolean().default(false), // ✅ Corregido de status a sent
  sentDate: z.string().optional() // ✅ Nuevo campo
})

export type PaymentReminder = z.infer<typeof paymentReminderSchema>

// ✅ CONSTANTES EXPORTADAS PARA USO EN COMPONENTES
export const CLUB_ACTIVITIES = {
  // Para mostrar en la UI (español)
  BACKEND: ACTIVITIES,
  // Para usar en el código (inglés/kebab-case)
  FRONTEND: FRONTEND_ACTIVITIES,
  // Mapeo de backend a frontend
  BACKEND_TO_FRONTEND: {
    'Basquet': 'basketball',
    'Voley': 'volleyball',
    'Karate': 'karate', 
    'Gimnasio': 'gym',
    'Solo socio': 'solo-socio'
  } as const,
  // Mapeo de frontend a backend
  FRONTEND_TO_BACKEND: {
    'basketball': 'Basquet',
    'volleyball': 'Voley',
    'karate': 'Karate',
    'gym': 'Gimnasio', 
    'solo-socio': 'Solo socio'
  } as const,
  // Labels para mostrar en la UI
  LABELS: {
    'basketball': 'Básquet',
    'volleyball': 'Vóley',
    'karate': 'Karate',
    'gym': 'Gimnasio',
    'solo-socio': 'Solo Socio'
  } as const
} as const

export const MEMBER_STATUS = {
  FRONTEND: MEMBER_STATES,
  BACKEND: ['Activo', 'Inactivo', 'Suspendido'] as const,
  LABELS: {
    'active': 'Activo',
    'inactive': 'Inactivo', 
    'suspended': 'Suspendido'
  } as const
} as const

export const PAYMENT_STATUS = {
  FRONTEND: PAYMENT_STATES,
  BACKEND: ['Pendiente', 'Pagada', 'Vencida', 'Cancelada'] as const,
  LABELS: {
    'pending': 'Pendiente',
    'paid': 'Pagada',
    'overdue': 'Vencida',
    'cancelled': 'Cancelada'
  } as const
} as const