import { useRef, useState, useEffect, type RefObject } from 'react'
import { useScroll, useTransform, type MotionValue } from 'motion/react'

// === Shared Motion Variants ===

export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
}

export const fadeInLeft = {
  initial: { opacity: 0, x: -30 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
}

export const fadeInRight = {
  initial: { opacity: 0, x: 30 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
}

export const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.08 } },
  viewport: { once: true, margin: '-50px' },
}

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
}

export const scaleOnHover = {
  whileHover: { scale: 1.02, y: -4 },
  transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
}

// === Hooks ===

export function useAnimatedCounter(end: number, duration: number = 2000): { ref: RefObject<HTMLElement | null>; value: number } {
  const ref = useRef<HTMLElement | null>(null)
  const [value, setValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) { setValue(end); return }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        setHasAnimated(true)
        const startTime = performance.now()
        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime
          const progress = Math.min(elapsed / duration, 1)
          const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
          setValue(Math.round(eased * end))
          if (progress < 1) requestAnimationFrame(animate)
        }
        requestAnimationFrame(animate)
      }
    }, { threshold: 0.3 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [end, duration, hasAnimated])

  return { ref, value }
}

export function useParallax(speed: number = 0.5): { ref: RefObject<HTMLDivElement | null>; y: MotionValue<number> } {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [-50 * speed, 50 * speed])
  return { ref, y }
}
