/**
 * Accessibility utilities for WCAG 2.1 AA compliance
 */

/**
 * Generate unique ID for form elements
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Check if an element should be focusable
 */
export function shouldBeFocusable(element: HTMLElement): boolean {
  return !element.hasAttribute('disabled') && !element.hasAttribute('aria-disabled')
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Get ARIA label for activity
 */
export function getActivityAriaLabel(activity?: string): string {
  const labels: Record<string, string> = {
    'basketball': 'Basquet',
    'volleyball': 'Voley',
    'karate': 'Karate',
    'gym': 'Gimnasio',
    'solo-socio': 'Solo socio'
  }
  return labels[activity || 'solo-socio'] || 'Actividad desconocida'
}

/**
 * Get ARIA label for status
 */
export function getStatusAriaLabel(status: string): string {
  const labels: Record<string, string> = {
    'active': 'Activo',
    'inactive': 'Inactivo',
    'suspended': 'Suspendido',
    'paid': 'Pagado',
    'pending': 'Pendiente',
    'overdue': 'Vencido',
    'cancelled': 'Cancelado'
  }
  return labels[status] || status
}

/**
 * Get ARIA label for payment status
 */
export function getPaymentStatusAriaLabel(status: string): string {
  const labels: Record<string, string> = {
    'paid': 'Cuota pagada',
    'pending': 'Cuota pendiente de pago',
    'overdue': 'Cuota vencida',
    'cancelled': 'Cuota cancelada'
  }
  return labels[status] || 'Estado de pago desconocido'
}

/**
 * Trap focus within an element (for modals)
 */
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )

  const firstFocusable = focusableElements[0]
  const lastFocusable = focusableElements[focusableElements.length - 1]

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault()
        lastFocusable?.focus()
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault()
        firstFocusable?.focus()
      }
    }
  }

  element.addEventListener('keydown', handleTabKey)

  return () => {
    element.removeEventListener('keydown', handleTabKey)
  }
}

/**
 * Handle escape key for modals
 */
export function handleEscapeKey(callback: () => void) {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      callback()
    }
  }

  document.addEventListener('keydown', handler)

  return () => {
    document.removeEventListener('keydown', handler)
  }
}

/**
 * Get color contrast ratio
 */
export function getContrastRatio(foreground: string, background: string): number {
  const getLuminance = (color: string): number => {
    // Simplified luminance calculation
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16) / 255
    const g = parseInt(hex.substr(2, 2), 16) / 255
    const b = parseInt(hex.substr(4, 2), 16) / 255

    const [rs, gs, bs] = [r, g, b].map(c =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    )

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if color contrast meets WCAG AA standards
 */
export function meetsWCAGAA(foreground: string, background: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(foreground, background)
  return isLargeText ? ratio >= 3 : ratio >= 4.5
}
