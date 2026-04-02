import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import type { BotMessage } from '../../../lib/chatbot-engine'

interface ChatBubbleProps {
  message: BotMessage
  onLinkClick?: (url: string) => void
}

export function ChatBubble({ message, onLinkClick }: ChatBubbleProps) {
  const isBot = message.sender === 'bot'

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-3`}
    >
      {isBot && (
        <div className="w-7 h-7 bg-graphite text-ivory flex items-center justify-center shrink-0 mr-2 mt-1 sharp-edge">
          <span className="text-xs font-display font-semibold">N</span>
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed sharp-edge ${
          isBot
            ? 'bg-ivory-dark text-graphite'
            : 'bg-warm-soft text-graphite'
        }`}
      >
        {message.text && <p className="whitespace-pre-line">{message.text}</p>}
        {message.link && (
          <button
            onClick={() => onLinkClick?.(message.link!.url)}
            className="flex items-center gap-1.5 mt-2 text-sm font-medium text-warm hover:text-graphite transition-colors"
          >
            {message.link.label}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  )
}
