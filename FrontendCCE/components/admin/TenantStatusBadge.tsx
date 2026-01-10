/**
 * TenantStatusBadge Component
 * Displays tenant status with appropriate color coding
 */

interface TenantStatusBadgeProps {
  status: 'active' | 'suspended' | 'trial' | 'cancelled'
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig = {
  active: {
    label: 'Activo',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    dotColor: 'bg-green-500'
  },
  trial: {
    label: 'Prueba',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    dotColor: 'bg-blue-500'
  },
  suspended: {
    label: 'Suspendido',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    dotColor: 'bg-yellow-500'
  },
  cancelled: {
    label: 'Cancelado',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    dotColor: 'bg-red-500'
  }
}

const sizeConfig = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base'
}

export default function TenantStatusBadge({ status, size = 'md' }: TenantStatusBadgeProps) {
  const config = statusConfig[status]
  const sizeClass = sizeConfig[size]

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${config.bgColor} ${config.textColor} ${sizeClass} font-semibold rounded-full`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  )
}
