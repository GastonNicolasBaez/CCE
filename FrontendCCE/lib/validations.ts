import { z } from 'zod'

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

// Main registration schema
export const registrationSchema = z.object({
  // Personal Information
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Ingresa un email válido'),
  phone: z.string().min(8, 'El teléfono debe tener al menos 8 dígitos'),
  birthDate: z.string().min(1, 'La fecha de nacimiento es requerida'),
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  
  // Optional fields for players
  activity: z.string().optional(),
  emergencyContact: emergencyContactSchema.optional(),
  medicalInfo: medicalInfoSchema.optional(),
  
  // Terms and conditions
  terms: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los términos y condiciones'
  })
})

// Type inference from schema
export type RegistrationFormData = z.infer<typeof registrationSchema>

// Schema for member data (used in store)
export const memberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  activity: z.string().optional(),
  status: z.enum(['activo', 'inactivo', 'pendiente']).default('activo'),
  membershipType: z.enum(['socio', 'jugador']).default('socio'),
  paymentStatus: z.enum(['al-dia', 'pendiente', 'vencido']).default('al-dia'),
  joinDate: z.string(),
  lastPayment: z.string().optional()
})

export type Member = z.infer<typeof memberSchema>

// Schema for payment reminders
export const paymentReminderSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  amount: z.number(),
  dueDate: z.string(),
  status: z.enum(['pending', 'sent', 'paid']).default('pending'),
  createdAt: z.string()
})

export type PaymentReminder = z.infer<typeof paymentReminderSchema>
