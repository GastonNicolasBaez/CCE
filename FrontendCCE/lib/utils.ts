import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatShortDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function getActivityLabel(activity?: string): string {
  if (!activity) return 'Sin actividad'
  
  const activities = {
    basketball: 'Básquet',
    volleyball: 'Vóley',
    karate: 'Karate',
    gym: 'Gimnasio',
    'solo-socio': 'Solo Socio', // ✅ CORREGIDO: agregado 'solo-socio'
    socio: 'Solo Socio' // ✅ Mantener compatibilidad con valores antiguos
  }
  return activities[activity as keyof typeof activities] || activity
}

export function getStatusColor(status: string): string {
  const colors = {
    active: 'text-green-600',
    inactive: 'text-red-600',
    suspended: 'text-orange-600', // ✅ AGREGADO: estado suspendido
    paid: 'text-green-600',
    pending: 'text-yellow-600',
    overdue: 'text-red-600',
    cancelled: 'text-gray-600', // ✅ AGREGADO: estado cancelada
  }
  return colors[status as keyof typeof colors] || 'text-gray-600'
}

export function getStatusBadge(status: string): string {
  const badges = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
    suspended: 'bg-orange-100 text-orange-800', // ✅ AGREGADO: estado suspendido
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800', // ✅ AGREGADO: estado cancelada
  }
  return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
