import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { store } from '../../services/store';
import { cn } from '../../lib/utils';

const SESSION_KEY = 'nc_exit_shown';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(\+39\s?)?[0-9]{6,12}$/;

type FieldState = {
  value: string;
  touched: boolean;
  error: string | null;
  shaking: boolean;
};

function createField(): FieldState {
  return { value: '', touched: false, error: null, shaking: false };
}

export function ExitIntentPopup() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fields, setFields] = useState({
    nome: createField(),
    email: createField(),
    telefono: createField(),
  });

  const alreadyShown = useCallback(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      return false;
    }
  }, []);

  const markShown = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // sessionStorage not available
    }
  }, []);

  useEffect(() => {
    if (alreadyShown()) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !alreadyShown()) {
        setOpen(true);
        markShown();
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [alreadyShown, markShown]);

  const close = () => setOpen(false);

  const validateField = (name: string, value: string): string | null => {
    const v = value.trim();
    if (!v) return 'Campo obbligatorio';
    if (name === 'email' && !EMAIL_REGEX.test(v)) return 'Email non valida';
    if (name === 'telefono' && !PHONE_REGEX.test(v.replace(/\s/g, ''))) return 'Numero non valido';
    return null;
  };

  const isValid = (name: string, value: string): boolean => {
    return value.trim().length > 0 && validateField(name, value) === null;
  };

  const handleChange = (name: keyof typeof fields, value: string) => {
    setFields(prev => {
      const field = prev[name];
      const error = field.touched ? validateField(name, value) : null;
      return { ...prev, [name]: { ...field, value, error } };
    });
  };

  const handleBlur = (name: keyof typeof fields) => {
    setFields(prev => {
      const field = prev[name];
      const error = validateField(name, field.value);
      const shaking = !!error;
      if (shaking) {
        setTimeout(() => {
          setFields(p => ({
            ...p,
            [name]: { ...p[name], shaking: false },
          }));
        }, 400);
      }
      return { ...prev, [name]: { ...field, touched: true, error, shaking } };
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const updated = { ...fields };
    let hasErrors = false;

    for (const key of Object.keys(updated) as Array<keyof typeof updated>) {
      const error = validateField(key, updated[key].value);
      updated[key] = { ...updated[key], touched: true, error, shaking: !!error };
      if (error) hasErrors = true;
    }

    setFields(updated);

    if (hasErrors) {
      setTimeout(() => {
        setFields(prev => {
          const reset = { ...prev };
          for (const key of Object.keys(reset) as Array<keyof typeof reset>) {
            reset[key] = { ...reset[key], shaking: false };
          }
          return reset;
        });
      }, 400);
      return;
    }

    store.leads.create({
      source: 'exit-intent',
      name: fields.nome.value.trim(),
      email: fields.email.value.trim(),
      phone: fields.telefono.value.trim(),
    });

    setSubmitted(true);
    setTimeout(close, 2500);
  };

  const renderField = (
    name: keyof typeof fields,
    label: string,
    type: string,
    placeholder: string
  ) => {
    const field = fields[name];
    const valid = field.touched && isValid(name, field.value);
    const hasError = field.touched && !!field.error;

    return (
      <div>
        <label
          htmlFor={`exit-${name}`}
          className="text-sm uppercase tracking-wider text-silver mb-2 block"
        >
          {label} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id={`exit-${name}`}
            type={type}
            value={field.value}
            onChange={(e) => handleChange(name, e.target.value)}
            onBlur={() => handleBlur(name)}
            placeholder={placeholder}
            className={cn(
              'w-full py-3 px-4 pr-10 border sharp-edge transition-all duration-200',
              'bg-ivory text-graphite border-silver-light placeholder:text-silver',
              'focus:outline-none focus:border-graphite',
              valid && 'field-valid',
              hasError && 'field-error',
              field.shaking && 'field-shake'
            )}
          />
          {field.touched && (
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
          <p className="text-red-500 text-sm mt-1.5" role="alert">
            {field.error}
          </p>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-panel-dark"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-intent-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="bg-ivory sharp-edge shadow-xl w-full max-w-md p-8 relative"
          >
            {/* Close button */}
            <button
              onClick={close}
              aria-label="Chiudi"
              className={cn(
                'absolute top-4 right-4 w-8 h-8 flex items-center justify-center',
                'text-silver hover:text-graphite transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-graphite'
              )}
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="check-pop">
                  <CheckCircle2 className="w-16 h-16 text-green-600 mb-6" />
                </div>
                <h3 className="text-2xl font-display font-medium text-graphite mb-3">
                  Grazie!
                </h3>
                <p className="text-graphite-light/70 font-light">
                  Ti contatteremo con le migliori offerte
                </p>
              </div>
            ) : (
              <>
                <h2
                  id="exit-intent-title"
                  className="text-3xl font-display font-light text-graphite mb-3"
                >
                  Non andare via!
                </h2>
                <p className="text-graphite-light/70 font-light mb-8">
                  Lascia il tuo contatto per ricevere le migliori offerte
                </p>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {renderField('nome', 'Nome', 'text', 'Il tuo nome')}
                  {renderField('email', 'Email', 'email', 'nome@email.com')}
                  {renderField('telefono', 'Telefono', 'tel', '+39 333 1234567')}

                  <button
                    type="submit"
                    className={cn(
                      'w-full py-4 px-8 sharp-edge uppercase tracking-widest font-display text-sm',
                      'bg-graphite text-ivory hover:bg-graphite-light transition-colors',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-graphite'
                    )}
                  >
                    Ricevi le offerte
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
