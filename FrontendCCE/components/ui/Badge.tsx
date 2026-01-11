import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  icon?: LucideIcon;
  iconSize?: number;
  dot?: boolean;
  className?: string;
}

/**
 * Badge Component - Sistema de Diseño Unificado CCE
 *
 * Componente de badge para estados, etiquetas, y categorías.
 * Usado principalmente para estados de pago, actividad, etc.
 *
 * @param variant - Variante de color:
 *   - 'success': Verde (Pagado, Activo)
 *   - 'warning': Amarillo (Pendiente, En proceso)
 *   - 'danger': Rojo (Vencido, Inactivo, Error)
 *   - 'info': Azul (Información)
 *   - 'default': Gris (Neutral)
 *
 * @param icon - Icono opcional de lucide-react
 * @param iconSize - Tamaño del icono en px (default: 12)
 * @param dot - Muestra un punto de color antes del texto
 *
 * @example
 * ```tsx
 * import { CheckCircle, Clock, XCircle } from 'lucide-react';
 *
 * // Badge de pago
 * <Badge variant="success" icon={CheckCircle}>
 *   Pagado
 * </Badge>
 *
 * // Badge con dot
 * <Badge variant="warning" dot>
 *   Pendiente
 * </Badge>
 *
 * // Badge de estado
 * <Badge variant="danger">
 *   Vencido
 * </Badge>
 * ```
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  icon: Icon,
  iconSize = 12,
  dot = false,
  className = '',
}) => {
  // Variant styles
  const variantStyles = {
    success: `
      bg-green-100/80 dark:bg-green-900/30
      text-green-700 dark:text-green-300
      border border-green-200/50 dark:border-green-700/50
    `,
    warning: `
      bg-yellow-100/80 dark:bg-yellow-900/30
      text-yellow-700 dark:text-yellow-300
      border border-yellow-200/50 dark:border-yellow-700/50
    `,
    danger: `
      bg-red-100/80 dark:bg-red-900/30
      text-red-700 dark:text-red-300
      border border-red-200/50 dark:border-red-700/50
    `,
    info: `
      bg-blue-100/80 dark:bg-blue-900/30
      text-blue-700 dark:text-blue-300
      border border-blue-200/50 dark:border-blue-700/50
    `,
    default: `
      bg-gray-100/80 dark:bg-gray-700/30
      text-gray-700 dark:text-gray-300
      border border-gray-200/50 dark:border-gray-600/50
    `,
  };

  // Dot colors
  const dotColors = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    default: 'bg-gray-500',
  };

  const combinedStyles = `
    inline-flex items-center gap-1.5
    px-2 py-1
    rounded-full
    text-xs font-medium
    ${variantStyles[variant]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <span className={combinedStyles}>
      {dot && (
        <span className={`w-2 h-2 rounded-full ${dotColors[variant]}`} />
      )}
      {Icon && <Icon size={iconSize} />}
      {children}
    </span>
  );
};

// Export variant type
export type BadgeVariant = BadgeProps['variant'];
