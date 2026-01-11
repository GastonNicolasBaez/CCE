import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost';
  size?: number;
  ariaLabel: string;
}

/**
 * IconButton Component - Sistema de Diseño Unificado CCE
 *
 * Botón solo con icono para acciones rápidas en tablas, cards, etc.
 *
 * @param icon - Icono de lucide-react (requerido)
 * @param variant - Color del botón basado en la acción
 * @param size - Tamaño del icono en px (default: 16)
 * @param ariaLabel - Label de accesibilidad (requerido)
 *
 * @example
 * ```tsx
 * import { Edit, Trash2 } from 'lucide-react';
 *
 * // Botón de editar
 * <IconButton
 *   icon={Edit}
 *   variant="primary"
 *   ariaLabel="Editar miembro"
 *   onClick={handleEdit}
 * />
 *
 * // Botón de eliminar
 * <IconButton
 *   icon={Trash2}
 *   variant="danger"
 *   ariaLabel="Eliminar miembro"
 *   onClick={handleDelete}
 * />
 * ```
 */
export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  variant = 'ghost',
  size = 16,
  ariaLabel,
  className = '',
  ...props
}) => {
  // Variant styles
  const variantStyles = {
    primary: `
      text-blue-600 dark:text-blue-400
      hover:bg-blue-50 dark:hover:bg-blue-900/20
    `,
    success: `
      text-green-600 dark:text-green-400
      hover:bg-green-50 dark:hover:bg-green-900/20
    `,
    danger: `
      text-red-600 dark:text-red-400
      hover:bg-red-50 dark:hover:bg-red-900/20
    `,
    warning: `
      text-yellow-600 dark:text-yellow-400
      hover:bg-yellow-50 dark:hover:bg-yellow-900/20
    `,
    info: `
      text-gray-600 dark:text-gray-400
      hover:bg-gray-50 dark:hover:bg-gray-700
    `,
    ghost: `
      text-gray-500 dark:text-gray-400
      hover:bg-white/10 dark:hover:bg-white/5
    `,
  };

  const combinedStyles = `
    p-2 rounded-lg
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-1
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variantStyles[variant]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <button
      className={combinedStyles}
      aria-label={ariaLabel}
      {...props}
    >
      <Icon size={size} />
    </button>
  );
};

// Export variant type
export type IconButtonVariant = IconButtonProps['variant'];
