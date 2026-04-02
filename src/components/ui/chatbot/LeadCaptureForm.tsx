import { useState } from 'react'
import { motion } from 'motion/react'
import { CheckCircle2, AlertCircle } from 'lucide-react'

interface LeadCaptureFormProps {
  onSubmit: (data: { name: string; email: string; phone: string }) => void
  onSkip: () => void
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[\d\s]{8,}$/

function FieldIcon({ valid, touched }: { valid: boolean; touched: boolean }) {
  if (!touched) return null
  return valid ? (
    <CheckCircle2 className="w-4 h-4 text-green-500 check-pop absolute right-3 top-1/2 -translate-y-1/2" />
  ) : (
    <AlertCircle className="w-4 h-4 text-red-400 absolute right-3 top-1/2 -translate-y-1/2" />
  )
}

export function LeadCaptureForm({ onSubmit, onSkip }: LeadCaptureFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
  })

  const valid = {
    name: name.trim().length >= 2,
    email: EMAIL_RE.test(email),
    phone: phone === '' || PHONE_RE.test(phone),
  }

  const canSubmit = valid.name && valid.email

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="ml-9 mr-4 mb-3 p-4 bg-ivory-dark sharp-edge border border-silver-light/30"
    >
      <p className="text-sm font-medium text-graphite mb-3">
        Lasciaci i tuoi contatti
      </p>
      <div className="space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setTouched((t) => ({ ...t, name: true }))
            }}
            className={`w-full text-sm px-3 py-2.5 pr-10 bg-white border sharp-edge outline-none transition-colors ${
              touched.name
                ? valid.name
                  ? 'field-valid'
                  : 'field-error'
                : 'border-silver-light/30'
            }`}
          />
          <FieldIcon valid={valid.name} touched={touched.name} />
        </div>
        <div className="relative">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setTouched((t) => ({ ...t, email: true }))
            }}
            className={`w-full text-sm px-3 py-2.5 pr-10 bg-white border sharp-edge outline-none transition-colors ${
              touched.email
                ? valid.email
                  ? 'field-valid'
                  : 'field-error'
                : 'border-silver-light/30'
            }`}
          />
          <FieldIcon valid={valid.email} touched={touched.email} />
        </div>
        <div className="relative">
          <input
            type="tel"
            placeholder="Telefono (opzionale)"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              setTouched((t) => ({ ...t, phone: true }))
            }}
            className={`w-full text-sm px-3 py-2.5 pr-10 bg-white border sharp-edge outline-none transition-colors ${
              touched.phone && phone
                ? valid.phone
                  ? 'field-valid'
                  : 'field-error'
                : 'border-silver-light/30'
            }`}
          />
          {phone && <FieldIcon valid={valid.phone} touched={touched.phone} />}
        </div>
      </div>
      <button
        disabled={!canSubmit}
        onClick={() =>
          canSubmit &&
          onSubmit({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
          })
        }
        className="w-full mt-3 bg-warm text-ivory text-sm font-medium py-2.5 sharp-edge hover:bg-warm-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Invia
      </button>
      <button
        onClick={onSkip}
        className="w-full mt-2 text-xs text-silver hover:text-graphite transition-colors"
      >
        No grazie
      </button>
    </motion.div>
  )
}
