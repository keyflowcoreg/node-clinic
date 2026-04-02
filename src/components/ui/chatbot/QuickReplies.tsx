import { motion } from 'motion/react'
import {
  Search,
  Calendar,
  Building2,
  Tag,
  Phone,
  ClipboardList,
  Handshake,
  HelpCircle,
  ArrowLeft,
  Sparkles,
  Syringe,
  Zap,
  Activity,
  Smile,
  Scissors,
  Home,
  MapPin,
  Globe,
  Mail,
  FileText,
  MessageCircle,
  List,
  CreditCard,
  Clock,
  Share2,
} from 'lucide-react'
import type { QuickReply } from '../../../lib/chatbot-engine'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Search,
  Calendar,
  Building2,
  Tag,
  Phone,
  ClipboardList,
  Handshake,
  HelpCircle,
  ArrowLeft,
  Sparkles,
  Syringe,
  Zap,
  Activity,
  Smile,
  Scissors,
  Home,
  MapPin,
  Globe,
  Mail,
  FileText,
  MessageCircle,
  List,
  CreditCard,
  Clock,
  Share2,
}

interface QuickRepliesProps {
  options: QuickReply[]
  onSelect: (value: string) => void
  disabled?: boolean
}

export function QuickReplies({ options, onSelect, disabled = false }: QuickRepliesProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-3 pl-9">
      {options.map((opt, i) => {
        const Icon = opt.icon ? ICON_MAP[opt.icon] : null
        return (
          <motion.button
            key={opt.value}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
            onClick={() => !disabled && onSelect(opt.value)}
            disabled={disabled}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 sharp-edge border transition-colors ${
              disabled
                ? 'border-silver-light/20 text-silver/40 cursor-default'
                : 'border-silver-light/40 text-graphite hover:border-warm hover:text-warm cursor-pointer'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {opt.label}
          </motion.button>
        )
      })}
    </div>
  )
}
