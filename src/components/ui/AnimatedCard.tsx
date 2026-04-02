import type { ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'motion/react'
import { cn } from '../../lib/utils'

interface AnimatedCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  className?: string
  hover?: boolean
  delay?: number
}

export function AnimatedCard({
  children,
  className,
  hover = true,
  delay = 0,
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ 
        duration: 0.8, 
        delay, 
        type: "spring",
        stiffness: 100,
        damping: 20
      }}
      className={cn(
        'card-premium relative overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
