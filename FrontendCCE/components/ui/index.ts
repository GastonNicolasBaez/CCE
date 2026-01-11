/**
 * UI Components - Sistema de Diseño Unificado CCE
 *
 * Exporta todos los componentes de UI reutilizables.
 * Importar desde: import { Card, Button, Badge } from '@/components/ui'
 */

// ========== CORE COMPONENTS ==========

export { Card } from './Card';
export type { CardProps, CardVariant, CardPadding } from './Card';

export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

export { IconButton } from './IconButton';
export type { IconButtonProps, IconButtonVariant } from './IconButton';

export { Badge } from './Badge';
export type { BadgeProps, BadgeVariant } from './Badge';

export { InfoCard } from './InfoCard';
export type { InfoCardProps, InfoCardVariant } from './InfoCard';

// ========== ADVANCED COMPONENTS ==========

// Toast Notifications
export { Toast, ToastContainer, useToast } from './Toast';
export type { ToastProps, ToastContainerProps } from './Toast';

// Loading States
export { Skeleton, SkeletonCard, SkeletonTable } from './Skeleton';
export type { SkeletonProps } from './Skeleton';

// Celebrations
export { Confetti, useConfetti } from './Confetti';
export type { ConfettiProps } from './Confetti';

// Empty States
export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

// Command Palette
export { CommandPalette, useCommandPalette } from './CommandPalette';
export type { CommandPaletteProps, CommandItem } from './CommandPalette';

// Animated Counter
export { AnimatedCounter, CountUpCard } from './AnimatedCounter';
export type { AnimatedCounterProps, CountUpCardProps } from './AnimatedCounter';

// Floating Action Button
export { FloatingButton } from './FloatingButton';
export type { FloatingButtonProps, FloatingAction } from './FloatingButton';

// Progress Steps
export { ProgressSteps } from './ProgressSteps';
export type { ProgressStepsProps, Step } from './ProgressSteps';
