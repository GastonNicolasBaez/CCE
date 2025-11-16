/**
 * Form validation utilities and schemas
 */

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

/**
 * Email validation
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!email || email.trim() === '') {
    return { isValid: false, error: 'El email es requerido' }
  }

  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'El email no es válido' }
  }

  if (email.length > 255) {
    return { isValid: false, error: 'El email es demasiado largo' }
  }

  return { isValid: true }
}

/**
 * Password validation
 */
export function validatePassword(password: string, options: {
  minLength?: number
  requireUppercase?: boolean
  requireLowercase?: boolean
  requireNumbers?: boolean
  requireSpecialChars?: boolean
} = {}): { isValid: boolean; error?: string } {
  const {
    minLength = 6,
    requireUppercase = false,
    requireLowercase = false,
    requireNumbers = false,
    requireSpecialChars = false
  } = options

  if (!password || password.trim() === '') {
    return { isValid: false, error: 'La contraseña es requerida' }
  }

  if (password.length < minLength) {
    return { isValid: false, error: `La contraseña debe tener al menos ${minLength} caracteres` }
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { isValid: false, error: 'La contraseña debe contener al menos una mayúscula' }
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return { isValid: false, error: 'La contraseña debe contener al menos una minúscula' }
  }

  if (requireNumbers && !/\d/.test(password)) {
    return { isValid: false, error: 'La contraseña debe contener al menos un número' }
  }

  if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, error: 'La contraseña debe contener al menos un carácter especial' }
  }

  return { isValid: true }
}

/**
 * Phone validation (Argentina format)
 */
export function validatePhone(phone: string): { isValid: boolean; error?: string } {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'El teléfono es requerido' }
  }

  // Remove spaces, dashes, and parentheses
  const cleanPhone = phone.replace(/[\s\-()]/g, '')

  // Argentina phone format: +54 9 11 xxxx-xxxx or similar
  const phoneRegex = /^(\+54)?[0-9]{8,13}$/

  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, error: 'El teléfono no es válido' }
  }

  return { isValid: true }
}

/**
 * Name validation
 */
export function validateName(name: string, fieldName: string = 'nombre'): { isValid: boolean; error?: string } {
  if (!name || name.trim() === '') {
    return { isValid: false, error: `El ${fieldName} es requerido` }
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: `El ${fieldName} debe tener al menos 2 caracteres` }
  }

  if (name.length > 100) {
    return { isValid: false, error: `El ${fieldName} es demasiado largo` }
  }

  // Only letters, spaces, accents, and hyphens
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-']+$/

  if (!nameRegex.test(name)) {
    return { isValid: false, error: `El ${fieldName} solo puede contener letras` }
  }

  return { isValid: true }
}

/**
 * DNI/Document validation (Argentina)
 */
export function validateDNI(dni: string): { isValid: boolean; error?: string } {
  if (!dni || dni.trim() === '') {
    return { isValid: false, error: 'El DNI es requerido' }
  }

  // Remove dots and spaces
  const cleanDNI = dni.replace(/[\s.]/g, '')

  // DNI should be 7-8 digits
  const dniRegex = /^[0-9]{7,8}$/

  if (!dniRegex.test(cleanDNI)) {
    return { isValid: false, error: 'El DNI debe tener 7 u 8 dígitos' }
  }

  return { isValid: true }
}

/**
 * Amount/Currency validation
 */
export function validateAmount(amount: string | number, options: {
  min?: number
  max?: number
  allowZero?: boolean
} = {}): { isValid: boolean; error?: string } {
  const { min = 0, max = Number.MAX_SAFE_INTEGER, allowZero = false } = options

  if (amount === '' || amount === null || amount === undefined) {
    return { isValid: false, error: 'El monto es requerido' }
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(numAmount)) {
    return { isValid: false, error: 'El monto debe ser un número válido' }
  }

  if (!allowZero && numAmount === 0) {
    return { isValid: false, error: 'El monto debe ser mayor a 0' }
  }

  if (numAmount < min) {
    return { isValid: false, error: `El monto debe ser mayor o igual a ${min}` }
  }

  if (numAmount > max) {
    return { isValid: false, error: `El monto debe ser menor o igual a ${max}` }
  }

  return { isValid: true }
}

/**
 * Date validation
 */
export function validateDate(date: string | Date, options: {
  allowPast?: boolean
  allowFuture?: boolean
  minDate?: Date
  maxDate?: Date
} = {}): { isValid: boolean; error?: string } {
  const { allowPast = true, allowFuture = true, minDate, maxDate } = options

  if (!date) {
    return { isValid: false, error: 'La fecha es requerida' }
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: 'La fecha no es válida' }
  }

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const checkDate = new Date(dateObj)
  checkDate.setHours(0, 0, 0, 0)

  if (!allowPast && checkDate < now) {
    return { isValid: false, error: 'La fecha no puede ser en el pasado' }
  }

  if (!allowFuture && checkDate > now) {
    return { isValid: false, error: 'La fecha no puede ser en el futuro' }
  }

  if (minDate && checkDate < minDate) {
    return { isValid: false, error: 'La fecha es demasiado antigua' }
  }

  if (maxDate && checkDate > maxDate) {
    return { isValid: false, error: 'La fecha es demasiado reciente' }
  }

  return { isValid: true }
}

/**
 * Required field validation
 */
export function validateRequired(value: unknown, fieldName: string = 'campo'): { isValid: boolean; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: `El ${fieldName} es requerido` }
  }

  if (typeof value === 'string' && value.trim() === '') {
    return { isValid: false, error: `El ${fieldName} es requerido` }
  }

  return { isValid: true }
}

/**
 * Multi-field form validation
 */
export function validateForm<T extends Record<string, unknown>>(
  data: T,
  rules: Record<keyof T, (value: unknown) => { isValid: boolean; error?: string }>
): ValidationResult {
  const errors: Record<string, string> = {}
  let isValid = true

  for (const field in rules) {
    const result = rules[field](data[field])
    if (!result.isValid) {
      errors[field] = result.error || 'Campo inválido'
      isValid = false
    }
  }

  return { isValid, errors }
}

/**
 * Sanitize input (remove potentially dangerous characters)
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent XSS
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Validate address
 */
export function validateAddress(address: string): { isValid: boolean; error?: string } {
  if (!address || address.trim() === '') {
    return { isValid: false, error: 'La dirección es requerida' }
  }

  if (address.trim().length < 5) {
    return { isValid: false, error: 'La dirección es demasiado corta' }
  }

  if (address.length > 200) {
    return { isValid: false, error: 'La dirección es demasiado larga' }
  }

  return { isValid: true }
}

/**
 * Password match validation
 */
export function validatePasswordMatch(password: string, confirmPassword: string): { isValid: boolean; error?: string } {
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Las contraseñas no coinciden' }
  }

  return { isValid: true }
}
