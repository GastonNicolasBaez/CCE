import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'success' | 'danger' | 'secondary' | 'ghost';
  size?: 'small' | 'default' | 'large';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  iconSize?: number;
  fullWidth?: boolean;
  loading?: boolean;
}

/**
 * Button Component - Sistema de Diseño Unificado CCE
 *
 * Componente de botón estandarizado para toda la aplicación.
 *
 * @param variant - Variante del botón:
 *   - 'primary': Azul (acciones principales) - blue-600
 *   - 'accent': Naranja (CTAs destacados) - orange-500
 *   - 'success': Verde (guardar, confirmar) - green-500
 *   - 'danger': Rojo (eliminar, acciones críticas) - red-500
 *   - 'secondary': Gris (acciones secundarias)
 *   - 'ghost': Transparente con borde (cancelar)
 *
 * @param size - Tamaño del botón:
 *   - 'small': px-3 py-1.5, text-sm
 *   - 'default': px-4 py-2, text-base
 *   - 'large': px-6 py-3, text-lg
 *
 * @param icon - Icono de lucide-react
 * @param iconPosition - Posición del icono (default: 'left')
 * @param iconSize - Tamaño del icono en px (default: 16)
 * @param fullWidth - Si el botón debe ocupar todo el ancho
 * @param loading - Muestra estado de carga con spinner
 *
 * @example
 * ```tsx
 * import { UserPlus } from 'lucide-react';
 *
 * // Botón accent con icono
 * <Button variant="accent" icon={UserPlus}>
 *   Nueva Inscripción
 * </Button>
 *
 * // Botón de guardar
 * <Button variant="success" icon={Save} loading={isSaving}>
 *   Guardar
 * </Button>
 *
 * // Botón secundario ghost
 * <Button variant="ghost" icon={X}>
 *   Cancelar
 * </Button>
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'default',
  icon: Icon,
  iconPosition = 'left',
  iconSize = 16,
  fullWidth = false,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  // Base styles
  const baseStyles = `
    font-semibold rounded-lg
    transition-all duration-300
    flex items-center justify-center gap-2
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `;

  // Variant styles
  const variantStyles = {
    primary: `
      bg-blue-600 hover:bg-blue-700
      text-white
      shadow-md hover:shadow-lg
      focus:ring-blue-500
      transform hover:-translate-y-0.5
    `,
    accent: `
      bg-gradient-to-r from-orange-500 to-orange-600
      hover:from-orange-600 hover:to-orange-700
      text-white
      shadow-lg hover:shadow-xl
      focus:ring-orange-500
      transform hover:-translate-y-1
    `,
    success: `
      bg-green-500 hover:bg-green-600
      text-white
      shadow-md hover:shadow-lg
      focus:ring-green-500
      transform hover:-translate-y-0.5
    `,
    danger: `
      bg-red-500 hover:bg-red-600
      text-white
      shadow-md hover:shadow-lg
      focus:ring-red-500
      transform hover:-translate-y-0.5
    `,
    secondary: `
      bg-gray-500 hover:bg-gray-600
      text-white
      shadow-md hover:shadow-lg
      focus:ring-gray-500
      transform hover:-translate-y-0.5
    `,
    ghost: `
      bg-white/10 hover:bg-white/20
      border border-white/30 hover:border-white/40
      text-gray-700 dark:text-gray-200
      backdrop-blur-sm
      focus:ring-gray-400
    `,
  };

  // Size styles
  const sizeStyles = {
    small: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };

  // Width style
  const widthStyle = fullWidth ? 'w-full' : '';

  // Combine styles
  const combinedStyles = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${widthStyle}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <button
      className={combinedStyles}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Cargando...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={iconSize} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={iconSize} />}
        </>
      )}
    </button>
  );
};

// Export variant type
export type ButtonVariant = ButtonProps['variant'];
export type ButtonSize = ButtonProps['size'];
