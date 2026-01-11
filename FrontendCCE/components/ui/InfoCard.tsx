import React from 'react';
import { LucideIcon, Info, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export interface InfoCardProps {
  children: React.ReactNode;
  variant?: 'info' | 'warning' | 'success' | 'error';
  icon?: LucideIcon;
  iconSize?: number;
  className?: string;
}

/**
 * InfoCard Component - Sistema de Diseño Unificado CCE
 *
 * Componente para mostrar mensajes informativos, alertas, y notificaciones.
 *
 * @param variant - Tipo de mensaje:
 *   - 'info': Azul (información general)
 *   - 'warning': Amarillo (advertencias)
 *   - 'success': Verde (confirmaciones, éxito)
 *   - 'error': Rojo (errores, crítico)
 *
 * @param icon - Icono personalizado (usa icono default según variant si no se especifica)
 * @param iconSize - Tamaño del icono en px (default: 20)
 *
 * @example
 * ```tsx
 * // Información general
 * <InfoCard variant="info">
 *   <p>Los cambios se guardan automáticamente.</p>
 * </InfoCard>
 *
 * // Advertencia
 * <InfoCard variant="warning">
 *   <p>Esta acción no se puede deshacer.</p>
 * </InfoCard>
 *
 * // Éxito
 * <InfoCard variant="success">
 *   <p>Configuración guardada correctamente.</p>
 * </InfoCard>
 *
 * // Error
 * <InfoCard variant="error">
 *   <p>No se pudo guardar la configuración.</p>
 * </InfoCard>
 * ```
 */
export const InfoCard: React.FC<InfoCardProps> = ({
  children,
  variant = 'info',
  icon,
  iconSize = 20,
  className = '',
}) => {
  // Default icons por variant
  const defaultIcons = {
    info: Info,
    warning: AlertCircle,
    success: CheckCircle,
    error: XCircle,
  };

  const Icon = icon || defaultIcons[variant];

  // Variant styles
  const variantStyles = {
    info: `
      bg-blue-50 dark:bg-blue-900/20
      border-blue-200 dark:border-blue-700
      text-blue-800 dark:text-blue-200
    `,
    warning: `
      bg-yellow-50 dark:bg-yellow-900/20
      border-yellow-200 dark:border-yellow-700
      text-yellow-800 dark:text-yellow-200
    `,
    success: `
      bg-green-50 dark:bg-green-900/20
      border-green-200 dark:border-green-700
      text-green-800 dark:text-green-200
    `,
    error: `
      bg-red-50 dark:bg-red-900/20
      border-red-200 dark:border-red-700
      text-red-800 dark:text-red-200
    `,
  };

  // Icon colors
  const iconColors = {
    info: 'text-blue-600 dark:text-blue-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
  };

  const combinedStyles = `
    flex items-start gap-3
    p-4
    rounded-lg
    border
    ${variantStyles[variant]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className={combinedStyles}>
      <Icon
        size={iconSize}
        className={`flex-shrink-0 ${iconColors[variant]}`}
      />
      <div className="text-sm flex-1">
        {children}
      </div>
    </div>
  );
};

// Export variant type
export type InfoCardVariant = InfoCardProps['variant'];
