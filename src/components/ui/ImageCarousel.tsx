import { useState, useCallback, type KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ImageCarouselProps {
  images: string[]
  alt?: string
  aspectRatio?: string
  className?: string
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
}

const springTransition = {
  x: { type: 'spring' as const, stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 },
}

const SWIPE_THRESHOLD = 50

export function ImageCarousel({
  images,
  alt = 'Galleria',
  aspectRatio = 'aspect-[4/3]',
  className,
}: ImageCarouselProps) {
  const [[currentIndex, direction], setPage] = useState([0, 0])

  const paginate = useCallback(
    (newDirection: number) => {
      setPage(([prev]) => {
        const next = (prev + newDirection + images.length) % images.length
        return [next, newDirection]
      })
    },
    [images.length]
  )

  const handleDragEnd = useCallback(
    (_: unknown, info: { velocity: { x: number }; offset: { x: number } }) => {
      if (info.velocity.x < -SWIPE_THRESHOLD || info.offset.x < -SWIPE_THRESHOLD) {
        paginate(1)
      } else if (info.velocity.x > SWIPE_THRESHOLD || info.offset.x > SWIPE_THRESHOLD) {
        paginate(-1)
      }
    },
    [paginate]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') paginate(1)
      else if (e.key === 'ArrowLeft') paginate(-1)
    },
    [paginate]
  )

  if (images.length === 0) return null

  return (
    <div
      className={cn('group relative overflow-hidden', aspectRatio, className)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label={alt}
      aria-roledescription="carousel"
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`${alt} ${currentIndex + 1}`}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={springTransition}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 h-full w-full cursor-grab object-cover active:cursor-grabbing"
        />
      </AnimatePresence>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => paginate(-1)}
            className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center border border-silver-light/30 bg-ivory/90 text-graphite opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 hover:bg-ivory"
            aria-label="Immagine precedente"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => paginate(1)}
            className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center border border-silver-light/30 bg-ivory/90 text-graphite opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 hover:bg-ivory"
            aria-label="Immagine successiva"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setPage([idx, idx > currentIndex ? 1 : -1])}
              className={cn(
                'h-1.5 w-1.5 transition-colors duration-200',
                idx === currentIndex ? 'bg-graphite' : 'bg-silver-light/60'
              )}
              aria-label={`Vai all'immagine ${idx + 1}`}
              aria-current={idx === currentIndex ? 'true' : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
