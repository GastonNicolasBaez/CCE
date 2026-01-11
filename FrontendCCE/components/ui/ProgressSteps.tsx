import React from 'react'
import { motion } from 'framer-motion'
import { Check, LucideIcon } from 'lucide-react'

export interface Step {
  id: string
  label: string
  description?: string
  icon?: LucideIcon
}

export interface ProgressStepsProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (stepIndex: number) => void
  allowSkip?: boolean
  variant?: 'horizontal' | 'vertical'
}

/**
 * ProgressSteps Component - Sistema de Diseño Unificado CCE
 *
 * Indicador de progreso para wizards multi-step con diseño único.
 * Mucho más visual y guiado que un simple contador.
 *
 * @example
 * ```tsx
 * const steps = [
 *   { id: 'personal', label: 'Datos Personales', icon: User },
 *   { id: 'activity', label: 'Actividad', icon: Activity },
 *   { id: 'payment', label: 'Pago', icon: CreditCard }
 * ]
 *
 * <ProgressSteps
 *   steps={steps}
 *   currentStep={1}
 *   onStepClick={(index) => setCurrentStep(index)}
 *   allowSkip={false}
 * />
 * ```
 */
export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  steps,
  currentStep,
  onStepClick,
  allowSkip = false,
  variant = 'horizontal'
}) => {
  const isStepComplete = (index: number) => index < currentStep
  const isStepCurrent = (index: number) => index === currentStep
  const isStepAccessible = (index: number) => allowSkip || index <= currentStep

  if (variant === 'vertical') {
    return (
      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon
          const complete = isStepComplete(index)
          const current = isStepCurrent(index)
          const accessible = isStepAccessible(index)

          return (
            <div key={step.id} className="flex gap-4">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <motion.button
                  onClick={() => accessible && onStepClick?.(index)}
                  disabled={!accessible}
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    complete
                      ? 'bg-green-500 text-white'
                      : current
                      ? 'bg-orange-500 text-white'
                      : accessible
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                  whileHover={accessible ? { scale: 1.1 } : {}}
                  whileTap={accessible ? { scale: 0.95 } : {}}
                >
                  {complete ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <Check size={20} />
                    </motion.div>
                  ) : Icon ? (
                    <Icon size={20} />
                  ) : (
                    index + 1
                  )}

                  {/* Pulse animation for current step */}
                  {current && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-orange-500"
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.button>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 my-2 transition-colors ${
                      isStepComplete(index + 1)
                        ? 'bg-green-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 pb-8">
                <h4
                  className={`font-semibold ${
                    current
                      ? 'text-orange-500'
                      : complete
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {step.label}
                </h4>
                {step.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Horizontal variant
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const Icon = step.icon
        const complete = isStepComplete(index)
        const current = isStepCurrent(index)
        const accessible = isStepAccessible(index)

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center flex-1">
              {/* Step indicator */}
              <motion.button
                onClick={() => accessible && onStepClick?.(index)}
                disabled={!accessible}
                className={`relative w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all mb-2 ${
                  complete
                    ? 'bg-green-500 text-white'
                    : current
                    ? 'bg-orange-500 text-white'
                    : accessible
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
                whileHover={accessible ? { scale: 1.1 } : {}}
                whileTap={accessible ? { scale: 0.95 } : {}}
              >
                {complete ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <Check size={24} />
                  </motion.div>
                ) : Icon ? (
                  <Icon size={24} />
                ) : (
                  index + 1
                )}

                {/* Pulse animation for current step */}
                {current && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-orange-500"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.button>

              {/* Step label */}
              <div className="text-center">
                <p
                  className={`text-sm font-medium ${
                    current
                      ? 'text-orange-500'
                      : complete
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 -mt-6 relative">
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700" />
                <motion.div
                  className="absolute inset-0 bg-green-500 origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{
                    scaleX: isStepComplete(index + 1) ? 1 : current ? 0.5 : 0
                  }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
