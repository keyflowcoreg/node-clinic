import { motion } from 'motion/react'
import { ChatClinicCard } from './ChatClinicCard'
import { ChatTreatmentCard } from './ChatTreatmentCard'
import type { CardData } from '../../../lib/chatbot-engine'

interface CardCarouselProps {
  cards: CardData[]
  onCardClick: (url: string) => void
}

export function CardCarousel({ cards, onCardClick }: CardCarouselProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 pl-9 pr-4 mb-3"
    >
      {cards.map((card) =>
        card.type === 'clinic' ? (
          <ChatClinicCard key={card.id} card={card} onClick={onCardClick} />
        ) : (
          <ChatTreatmentCard key={card.id} card={card} onClick={onCardClick} />
        )
      )}
    </motion.div>
  )
}
