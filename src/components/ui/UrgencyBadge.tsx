import { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

type UrgencyVariant = 'slots' | 'watching' | 'countdown';

type UrgencyBadgeProps = {
  variant: UrgencyVariant;
  targetTime?: string;
  className?: string;
};

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return [hours, minutes, seconds]
    .map(n => String(n).padStart(2, '0'))
    .join(':');
}

export function UrgencyBadge({ variant, targetTime, className }: UrgencyBadgeProps) {
  const [slotsCount] = useState(() => randomBetween(1, 4));
  const [watchingCount] = useState(() => randomBetween(2, 8));
  const [remaining, setRemaining] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (variant !== 'countdown' || !targetTime) return;

    function update() {
      const target = new Date(targetTime!).getTime();
      const diff = target - Date.now();
      setRemaining(formatCountdown(Math.max(0, diff)));
    }

    update();
    intervalRef.current = setInterval(update, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [variant, targetTime]);

  const baseClasses = cn(
    'inline-flex items-center gap-1.5 px-3 py-1.5 sharp-edge text-xs font-medium uppercase tracking-wider',
    className
  );

  if (variant === 'slots') {
    return (
      <span className={cn(baseClasses, 'bg-warm/15 text-warm')}>
        <span className="w-1.5 h-1.5 bg-warm sharp-edge pulse-soft" aria-hidden="true" />
        Solo {slotsCount} slot oggi
      </span>
    );
  }

  if (variant === 'watching') {
    return (
      <span className={cn(baseClasses, 'bg-ivory-dark text-graphite')}>
        <span className="w-1.5 h-1.5 bg-graphite sharp-edge pulse-soft" aria-hidden="true" />
        {watchingCount} persone stanno guardando
      </span>
    );
  }

  if (variant === 'countdown') {
    return (
      <span className={cn(baseClasses, 'bg-red-50 text-red-700')}>
        <span className="w-1.5 h-1.5 bg-red-500 sharp-edge pulse-soft" aria-hidden="true" />
        {remaining || '00:00:00'}
      </span>
    );
  }

  return null;
}
