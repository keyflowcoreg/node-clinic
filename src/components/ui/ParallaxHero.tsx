import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { cn } from '../../lib/utils'

interface ParallaxHeroProps {
  imageUrl: string
  overlayOpacity?: number
  children: React.ReactNode
  height?: string
  className?: string
  gradientClass?: string
}

export function ParallaxHero({
  imageUrl,
  overlayOpacity = 0.7,
  children,
  height = 'min-h-[70vh]',
  className,
  gradientClass,
}: ParallaxHeroProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  return (
    <div ref={ref} className={cn('relative overflow-hidden', height, className)}>
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{ y: prefersReduced ? 0 : y }}
      >
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover scale-110"
          loading="eager"
        />
      </motion.div>
      <div
        className={cn('absolute inset-0', gradientClass || 'bg-gradient-to-b from-ivory/90 via-ivory/75 to-ivory/85')}
        style={{ opacity: overlayOpacity }}
      />
      <div className="relative z-10 h-full flex flex-col justify-center">
        {children}
      </div>
    </div>
  )
}
