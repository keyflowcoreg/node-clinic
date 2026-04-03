import { Star } from 'lucide-react'
import type { CardData } from '../../../lib/chatbot-engine'

interface ChatClinicCardProps {
  card: CardData
  onClick: (url: string) => void
}

export function ChatClinicCard({ card, onClick }: ChatClinicCardProps) {
  return (
    <div className="w-52 shrink-0 snap-start border border-silver-light/30 bg-white sharp-edge overflow-hidden">
      {card.image && (
        <div className="aspect-[16/9] bg-silver-light overflow-hidden">
          <img
            src={card.image}
            alt={card.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-3">
        <h4 className="font-display font-medium text-sm text-graphite mb-1 leading-tight">
          {card.title}
        </h4>
        {card.subtitle && (
          <p className="text-xs text-silver mb-2">{card.subtitle}</p>
        )}
        {card.rating && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3 h-3 fill-warm text-warm" />
            <span className="text-xs font-medium">{card.rating}</span>
            {card.reviewCount && (
              <span className="text-xs text-silver">({card.reviewCount})</span>
            )}
          </div>
        )}
        <button
          onClick={() => onClick(card.ctaUrl)}
          className="w-full bg-graphite text-ivory text-xs font-medium py-2 sharp-edge hover:bg-graphite-light transition-colors"
        >
          {card.ctaLabel}
        </button>
      </div>
    </div>
  )
}
