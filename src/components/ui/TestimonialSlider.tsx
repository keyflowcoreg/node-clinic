import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Star } from 'lucide-react'
import { cn } from '../../lib/utils'

interface Testimonial {
  name: string
  rating: number
  text: string
  treatment?: string
}

interface TestimonialSliderProps {
  testimonials: Testimonial[]
  autoAdvance?: boolean
  interval?: number
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

export function TestimonialSlider({
  testimonials,
  autoAdvance = true,
  interval = 5000,
  className,
}: TestimonialSliderProps) {
  const [[currentIndex, direction], setPage] = useState([0, 0])
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const paginate = useCallback(
    (newDirection: number) => {
      setPage(([prev]) => {
        const next =
          (prev + newDirection + testimonials.length) % testimonials.length
        return [next, newDirection]
      })
    },
    [testimonials.length]
  )

  useEffect(() => {
    if (!autoAdvance || isPaused || testimonials.length <= 1) return

    intervalRef.current = setInterval(() => paginate(1), interval)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [autoAdvance, isPaused, interval, paginate, testimonials.length])

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

  if (testimonials.length === 0) return null

  const current = testimonials[currentIndex]

  return (
    <div
      className={cn('max-w-2xl mx-auto', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Testimonianze pazienti"
      aria-roledescription="carousel"
    >
      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
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
            className="relative cursor-grab border border-silver-light/30 bg-ivory-dark p-6 md:p-8 active:cursor-grabbing"
          >
            {/* Decorative quote mark */}
            <span
              className="pointer-events-none absolute left-4 top-2 select-none font-display text-6xl leading-none text-warm/20"
              aria-hidden="true"
            >
              &ldquo;
            </span>

            {/* Star rating */}
            <div className="mb-4 flex gap-0.5" aria-label={`${current.rating} stelle su 5`}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={cn(
                    i < current.rating
                      ? 'fill-warm text-warm'
                      : 'text-silver-light'
                  )}
                />
              ))}
            </div>

            {/* Quote text */}
            <p className="mb-6 font-sans text-base leading-relaxed text-graphite/80 md:text-lg">
              {current.text}
            </p>

            {/* Author */}
            <div>
              <p className="font-display font-medium text-graphite">
                {current.name}
              </p>
              {current.treatment && (
                <p className="mt-0.5 text-sm text-silver">
                  {current.treatment}
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      {testimonials.length > 1 && (
        <div className="mt-6 flex justify-center gap-1.5">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setPage([idx, idx > currentIndex ? 1 : -1])}
              className={cn(
                'h-1.5 w-1.5 transition-colors duration-200',
                idx === currentIndex ? 'bg-graphite' : 'bg-silver-light/60'
              )}
              aria-label={`Vai alla testimonianza ${idx + 1}`}
              aria-current={idx === currentIndex ? 'true' : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
