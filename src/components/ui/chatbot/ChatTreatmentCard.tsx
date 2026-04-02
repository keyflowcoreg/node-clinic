import type { CardData } from '../../../lib/chatbot-engine'

interface ChatTreatmentCardProps {
  card: CardData
  onClick: (url: string) => void
}

export function ChatTreatmentCard({ card, onClick }: ChatTreatmentCardProps) {
  return (
    <div className="w-52 shrink-0 snap-start border border-silver-light/30 bg-white sharp-edge overflow-hidden">
      <div className="p-3">
        <h4 className="font-display font-medium text-sm text-graphite mb-1 leading-tight">
          {card.title}
        </h4>
        {card.subtitle && (
          <span className="inline-block text-[10px] uppercase tracking-widest text-silver bg-ivory-dark px-1.5 py-0.5 mb-2 sharp-edge">
            {card.subtitle}
          </span>
        )}
        <div className="space-y-1 mb-3">
          {(card.priceFrom || card.priceTo) && (
            <p className="text-xs text-graphite">
              &euro;{card.priceFrom}
              {card.priceTo ? ` - \u20AC${card.priceTo}` : ''}
            </p>
          )}
          {card.duration && (
            <p className="text-xs text-silver">{card.duration}</p>
          )}
        </div>
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
