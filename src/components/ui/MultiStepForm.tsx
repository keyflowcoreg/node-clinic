import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '../../lib/utils'

interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'checkbox'
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
}

interface FormStep {
  title: string
  description?: string
  fields: FormField[]
}

interface MultiStepFormProps {
  steps: FormStep[]
  onSubmit: (data: Record<string, string | boolean>) => void
  submitLabel?: string
  className?: string
}

export function MultiStepForm({
  steps,
  onSubmit,
  submitLabel = 'Invia Richiesta',
  className,
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, string | boolean>>({})
  const [direction, setDirection] = useState<1 | -1>(1)
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  const totalSteps = steps.length + 1
  const isReview = currentStep === steps.length

  const updateField = useCallback((name: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: false }))
  }, [])

  const validateCurrentStep = useCallback((): boolean => {
    if (isReview) return true
    const step = steps[currentStep]
    const newErrors: Record<string, boolean> = {}
    let valid = true
    for (const field of step.fields) {
      if (field.required) {
        const val = formData[field.name]
        if (val === undefined || val === '' || val === false) {
          newErrors[field.name] = true
          valid = false
        }
      }
    }
    setErrors(newErrors)
    return valid
  }, [currentStep, formData, isReview, steps])

  const goNext = () => {
    if (!validateCurrentStep()) return
    setDirection(1)
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1))
  }

  const goBack = () => {
    setDirection(-1)
    setErrors({})
    setCurrentStep((s) => Math.max(s - 1, 0))
  }

  const handleSubmit = () => {
    onSubmit(formData)
  }

  const allFields = steps.flatMap((s) => s.fields)

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  }

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      {/* Progress bar */}
      <div className="flex items-center justify-center mb-10">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const isCompleted = i < currentStep
          const isCurrent = i === currentStep
          return (
            <div key={i} className="flex items-center">
              <div
                className={cn(
                  'w-9 h-9 flex items-center justify-center text-sm font-medium transition-colors duration-200',
                  isCompleted && 'bg-warm text-ivory',
                  isCurrent && 'bg-graphite text-ivory',
                  !isCompleted && !isCurrent && 'bg-silver-light text-silver'
                )}
              >
                {i < steps.length ? i + 1 : '\u2713'}
              </div>
              {i < totalSteps - 1 && (
                <div
                  className={cn(
                    'w-10 h-0.5 sm:w-16 transition-colors duration-200',
                    i < currentStep ? 'bg-warm' : 'bg-silver-light'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <div className="relative overflow-hidden min-h-[320px]">
        <AnimatePresence mode="wait" custom={direction}>
          {!isReview ? (
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="font-display text-xl font-semibold text-graphite mb-1">
                {steps[currentStep].title}
              </h3>
              {steps[currentStep].description && (
                <p className="text-silver text-sm mb-6">
                  {steps[currentStep].description}
                </p>
              )}

              <div className="space-y-5">
                {steps[currentStep].fields.map((field) => (
                  <FieldRenderer
                    key={field.name}
                    field={field}
                    value={formData[field.name]}
                    error={errors[field.name]}
                    onChange={updateField}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="review"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="font-display text-xl font-semibold text-graphite mb-1">
                Riepilogo
              </h3>
              <p className="text-silver text-sm mb-6">
                Verifica i dati prima di inviare la richiesta.
              </p>

              <div className="border border-silver-light divide-y divide-silver-light">
                {allFields.map((field) => {
                  const val = formData[field.name]
                  let displayVal: string
                  if (typeof val === 'boolean') {
                    displayVal = val ? 'S\u00ec' : 'No'
                  } else if (field.type === 'select' && field.options) {
                    displayVal =
                      field.options.find((o) => o.value === val)?.label ??
                      (val as string) ??
                      '\u2014'
                  } else {
                    displayVal = (val as string) || '\u2014'
                  }
                  return (
                    <div
                      key={field.name}
                      className="flex flex-col sm:flex-row sm:items-center px-4 py-3 gap-1"
                    >
                      <span className="text-sm text-silver sm:w-1/3 shrink-0">
                        {field.label}
                      </span>
                      <span className="text-sm text-graphite font-medium">
                        {displayVal}
                      </span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        {currentStep > 0 ? (
          <button
            type="button"
            onClick={goBack}
            className="px-6 py-2.5 text-sm font-medium border border-silver-light text-graphite hover:bg-ivory-dark transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-warm"
          >
            Indietro
          </button>
        ) : (
          <div />
        )}

        {isReview ? (
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 text-sm font-medium bg-graphite text-ivory hover:bg-graphite-light transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-warm"
          >
            {submitLabel}
          </button>
        ) : (
          <button
            type="button"
            onClick={goNext}
            className="px-6 py-2.5 text-sm font-medium bg-graphite text-ivory hover:bg-graphite-light transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-warm"
          >
            {currentStep === steps.length - 1 ? 'Verifica Dati' : 'Avanti'}
          </button>
        )}
      </div>
    </div>
  )
}

/* --- Field Renderer --- */

function FieldRenderer({
  field,
  value,
  error,
  onChange,
}: {
  field: FormField
  value: string | boolean | undefined
  error?: boolean
  onChange: (name: string, value: string | boolean) => void
}) {
  const inputClass = cn(
    'w-full px-3 py-2.5 text-sm bg-ivory border transition-colors duration-200',
    error ? 'border-red-400' : 'border-silver-light',
    'focus:border-warm placeholder:text-silver'
  )

  if (field.type === 'checkbox') {
    return (
      <label className="flex items-center gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={(value as boolean) ?? false}
          onChange={(e) => onChange(field.name, e.target.checked)}
          className="w-4 h-4 accent-graphite cursor-pointer"
        />
        <span className="text-sm text-graphite group-hover:text-warm transition-colors duration-200">
          {field.label}
          {field.required && <span className="text-red-400 ml-0.5">*</span>}
        </span>
        {error && (
          <span className="text-red-500 text-xs" role="alert">
            Campo obbligatorio
          </span>
        )}
      </label>
    )
  }

  return (
    <div>
      <label className="block text-sm font-medium text-graphite mb-1.5">
        {field.label}
        {field.required && <span className="text-red-400 ml-0.5">*</span>}
      </label>

      {field.type === 'select' ? (
        <select
          value={(value as string) ?? ''}
          onChange={(e) => onChange(field.name, e.target.value)}
          className={inputClass}
        >
          <option value="">{field.placeholder ?? 'Seleziona...'}</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea
          rows={4}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          className={inputClass}
          style={{ resize: 'vertical' }}
        />
      ) : (
        <input
          type={field.type}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          className={inputClass}
        />
      )}

      {error && (
        <p className="text-red-500 text-xs mt-1" role="alert">
          Campo obbligatorio
        </p>
      )}
    </div>
  )
}
