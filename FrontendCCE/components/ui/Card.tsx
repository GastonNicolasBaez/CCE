import React from 'react';
import { motion } from 'framer-motion';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'form' | 'metric' | 'table';
  hover?: boolean;
  padding?: 'compact' | 'default' | 'spacious' | 'none';
  animation?: boolean;
  animationDelay?: number;
}

/**
 * Card Component - Sistema de Diseño Unificado CCE
 *
 * Componente base para todas las cards de la aplicación.
 * Implementa el estilo glassmorphism estándar del dashboard.
 *
 * @param variant - Variante de la card:
 *   - 'glass' (default): Card principal con glassmorphism completo
 *   - 'form': Variante para formularios (blur reducido)
 *   - 'metric': Variante para métricas del dashboard
 *   - 'table': Variante para contenedores de tablas
 *
 * @param hover - Añade efectos hover (default: true)
 * @param padding - Tamaño del padding:
 *   - 'compact': p-4 (16px)
 *   - 'default': p-6 (24px)
 *   - 'spacious': p-8 (32px)
 *   - 'none': sin padding
 *
 * @param animation - Añade animación de entrada con Framer Motion
 * @param animationDelay - Delay de la animación en segundos
 *
 * @example
 * ```tsx
 * // Card estándar con glassmorphism
 * <Card>
 *   <h3>Título</h3>
 *   <p>Contenido</p>
 * </Card>
 *
 * // Card de métrica
 * <Card variant="metric" animation animationDelay={0.1}>
 *   <MetricIcon />
 *   <MetricValue />
 * </Card>
 *
 * // Card de formulario sin hover
 * <Card variant="form" hover={false}>
 *   <Form />
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'glass',
  hover = true,
  padding = 'default',
  animation = false,
  animationDelay = 0,
}) => {
  // Base styles (siempre presentes)
  const baseStyles = 'rounded-2xl transition-all duration-300';

  // Variant styles
  const variantStyles = {
    glass: `
      bg-white/90 dark:bg-gray-800/90
      backdrop-blur-xl
      border border-white/30 dark:border-gray-600/30
      shadow-2xl
    `,
    form: `
      bg-white/95 dark:bg-gray-800/95
      backdrop-blur-sm
      border border-white/40 dark:border-gray-600/40
      shadow-lg
      rounded-xl
    `,
    metric: `
      bg-white/90 dark:bg-gray-800/90
      backdrop-blur-xl
      border border-white/30 dark:border-gray-600/30
      shadow-2xl
      text-center
    `,
    table: `
      bg-white/90 dark:bg-gray-800/90
      backdrop-blur-xl
      border border-white/30 dark:border-gray-600/30
      shadow-2xl
      overflow-hidden
    `,
  };

  // Hover styles (si está habilitado)
  const hoverStyles = hover
    ? `
      hover:bg-white/95 dark:hover:bg-gray-700/90
      hover:border-white/40 dark:hover:border-gray-500/40
      hover:-translate-y-1
    `
    : '';

  // Padding styles
  const paddingStyles = {
    compact: 'p-4',
    default: 'p-6',
    spacious: 'p-8',
    none: '',
  };

  // Combine all styles
  const combinedStyles = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${hoverStyles}
    ${paddingStyles[padding]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  // Si se requiere animación, usar motion.div
  if (animation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          delay: animationDelay,
          duration: 0.6,
          ease: 'easeOut',
        }}
        whileHover={hover ? { y: -8, scale: 1.03 } : undefined}
        className={combinedStyles}
      >
        {children}
      </motion.div>
    );
  }

  // Sin animación, usar div normal
  return (
    <div className={combinedStyles}>
      {children}
    </div>
  );
};

// Export variant type para usar en otros componentes
export type CardVariant = CardProps['variant'];
export type CardPadding = CardProps['padding'];
