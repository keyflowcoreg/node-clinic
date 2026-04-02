import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { getUtmParams } from '../utils/utm';
import { trackFormSubmission, trackFormStart } from '../utils/analytics';
import { cn } from '../lib/utils';

type FormField = {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea';
  required?: boolean;
  options?: string[];
  placeholder?: string;
};

type LeadFormProps = {
  fields: FormField[];
  submitText: string;
  onSubmit: (data: Record<string, string>) => void;
  variant?: 'light' | 'dark';
  formId: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(\+39\s?)?[0-9]{6,12}$/;

function validateField(field: FormField, value: string): string | null {
  if (field.required && !value.trim()) {
    return 'Campo obbligatorio';
  }
  if (field.type === 'email' && value.trim() && !EMAIL_REGEX.test(value)) {
    return 'Inserisci un indirizzo email valido';
  }
  if (field.type === 'tel' && value.trim() && !PHONE_REGEX.test(value.replace(/\s/g, ''))) {
    return 'Inserisci un numero di telefono valido';
  }
  return null;
}

function isFieldValid(field: FormField, value: string): boolean {
  if (!value.trim()) return false;
  return validateField(field, value) === null;
}

export function LeadForm({ fields, submitText, onSubmit, variant = 'light', formId }: LeadFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of fields) {
      initial[field.name] = '';
    }
    return initial;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [shaking, setShaking] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [tracked, setTracked] = useState(false);

  const isDark = variant === 'dark';

  useEffect(() => {
    if (!tracked) {
      const hasValue = Object.values(values).some(v => v.trim());
      if (hasValue) {
        trackFormStart(formId);
        setTracked(true);
      }
    }
  }, [values, tracked, formId]);

  const handleChange = (name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
    const field = fields.find(f => f.name === name);
    if (field && touched[name]) {
      const error = validateField(field, value);
      setErrors(prev => {
        const next = { ...prev };
        if (error) next[name] = error;
        else delete next[name];
        return next;
      });
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const field = fields.find(f => f.name === name);
    if (field) {
      const error = validateField(field, values[name] || '');
      setErrors(prev => {
        const next = { ...prev };
        if (error) {
          next[name] = error;
          setShaking(prev => ({ ...prev, [name]: true }));
          setTimeout(() => setShaking(prev => ({ ...prev, [name]: false })), 400);
        } else {
          delete next[name];
        }
        return next;
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    const allTouched: Record<string, boolean> = {};
    const newShaking: Record<string, boolean> = {};

    for (const field of fields) {
      allTouched[field.name] = true;
      const error = validateField(field, values[field.name] || '');
      if (error) {
        newErrors[field.name] = error;
        newShaking[field.name] = true;
      }
    }

    setTouched(allTouched);
    setErrors(newErrors);
    if (Object.keys(newShaking).length) {
      setShaking(newShaking);
      setTimeout(() => setShaking({}), 400);
    }

    if (Object.keys(newErrors).length > 0) return;

    const utm = getUtmParams();
    const data: Record<string, string> = { ...values };
    for (const [key, value] of Object.entries(utm)) {
      if (value) data[key] = value;
    }

    trackFormSubmission(formId, data);
    onSubmit(data);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="check-pop">
          <CheckCircle2 className="w-16 h-16 text-green-600 mb-6" />
        </div>
        <h3 className={cn(
          'text-2xl font-display font-medium mb-3',
          isDark ? 'text-ivory' : 'text-graphite'
        )}>
          Richiesta inviata con successo
        </h3>
        <p className={cn(
          'text-base font-light',
          isDark ? 'text-silver-light/70' : 'text-graphite-light/70'
        )}>
          Ti contatteremo entro 24 ore
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {fields.map(field => {
        const value = values[field.name] || '';
        const valid = touched[field.name] && isFieldValid(field, value);
        const hasError = touched[field.name] && !!errors[field.name];
        const isShaking = shaking[field.name];

        const inputClasses = cn(
          'w-full py-3 px-4 pr-10 border sharp-edge transition-all duration-200',
          'focus:outline-none',
          isDark
            ? 'bg-graphite-light text-ivory border-silver/30 placeholder:text-silver/50 focus:border-ivory'
            : 'bg-ivory text-graphite border-silver-light placeholder:text-silver focus:border-graphite',
          valid && 'field-valid',
          hasError && 'field-error',
          isShaking && 'field-shake'
        );

        return (
          <div key={field.name}>
            <label
              htmlFor={`${formId}-${field.name}`}
              className={cn(
                'text-sm uppercase tracking-wider mb-2 block',
                isDark ? 'text-silver-light/70' : 'text-silver'
              )}
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>

            <div className="relative">
              {field.type === 'select' ? (
                <select
                  id={`${formId}-${field.name}`}
                  name={field.name}
                  value={value}
                  onChange={e => handleChange(field.name, e.target.value)}
                  onBlur={() => handleBlur(field.name)}
                  className={cn(inputClasses, 'appearance-none pr-10')}
                >
                  <option value="">{field.placeholder || 'Seleziona...'}</option>
                  {field.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  id={`${formId}-${field.name}`}
                  name={field.name}
                  value={value}
                  onChange={e => handleChange(field.name, e.target.value)}
                  onBlur={() => handleBlur(field.name)}
                  placeholder={field.placeholder}
                  rows={4}
                  className={inputClasses}
                />
              ) : (
                <input
                  id={`${formId}-${field.name}`}
                  type={field.type}
                  name={field.name}
                  value={value}
                  onChange={e => handleChange(field.name, e.target.value)}
                  onBlur={() => handleBlur(field.name)}
                  placeholder={field.type === 'tel' ? '+39 333 1234567' : field.placeholder}
                  className={inputClasses}
                />
              )}

              {/* Validation icon */}
              {touched[field.name] && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {valid ? (
                    <div className="check-pop">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                  ) : hasError ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : null}
                </div>
              )}
            </div>

            {hasError && (
              <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                {errors[field.name]}
              </p>
            )}
          </div>
        );
      })}

      <button
        type="submit"
        className={cn(
          'w-full py-4 px-8 sharp-edge uppercase tracking-widest font-display text-sm transition-colors',
          isDark
            ? 'bg-ivory text-graphite hover:bg-ivory-dark'
            : 'bg-graphite text-ivory hover:bg-graphite-light'
        )}
      >
        {submitText}
      </button>
    </form>
  );
}
