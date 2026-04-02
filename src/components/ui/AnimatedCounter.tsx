import { useRef, useState, useEffect } from 'react'

interface AnimatedCounterProps {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  decimals?: number
  className?: string
}

export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 2000,
  decimals = 0,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [displayValue, setDisplayValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReduced) {
      setDisplayValue(value)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)

          const startTime = performance.now()

          const animate = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1)
            const eased =
              progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
            setDisplayValue(eased * value)
            if (progress < 1) requestAnimationFrame(animate)
          }

          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value, duration, hasAnimated])

  const formatted = displayValue.toLocaleString('it-IT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
