import { cn } from '../../lib/utils'

interface SkeletonLoaderProps {
  width?: string
  height?: string
  variant?: 'text' | 'card' | 'image' | 'circle'
  className?: string
}

export function SkeletonLoader({
  width,
  height,
  variant = 'text',
  className,
}: SkeletonLoaderProps) {
  const base: Record<string, string> = {
    text: 'h-4 w-full',
    card: 'h-48 w-full',
    image: 'aspect-video w-full',
    circle: 'w-12 h-12',
  }

  return (
    <div
      className={cn('skeleton-shimmer', base[variant], className)}
      style={{
        width,
        height,
        borderRadius: variant === 'circle' ? '50%' : 0,
      }}
      role="status"
      aria-label="Caricamento..."
    />
  )
}
