import { motion, type HTMLMotionProps } from 'motion/react'

type Direction = 'up' | 'left' | 'right' | 'scale'

interface ScrollRevealProps
  extends Omit<HTMLMotionProps<'div'>, 'initial' | 'whileInView' | 'viewport'> {
  children: React.ReactNode
  direction?: Direction
  delay?: number
  className?: string
}

const variants: Record<
  Direction,
  { initial: Record<string, number>; whileInView: Record<string, number> }
> = {
  up: {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
  },
  left: {
    initial: { opacity: 0, x: -30 },
    whileInView: { opacity: 1, x: 0 },
  },
  right: {
    initial: { opacity: 0, x: 30 },
    whileInView: { opacity: 1, x: 0 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    whileInView: { opacity: 1, scale: 1 },
  },
}

export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  className,
  ...props
}: ScrollRevealProps) {
  const v = variants[direction]

  return (
    <motion.div
      initial={v.initial}
      whileInView={v.whileInView}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
