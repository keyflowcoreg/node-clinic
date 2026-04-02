import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

const NAMES = [
  'Sofia', 'Giulia', 'Marco', 'Alessia', 'Laura',
  'Francesco', 'Chiara', 'Andrea', 'Elena', 'Valentina',
  'Luca', 'Federica', 'Giovanni', 'Marta', 'Davide',
];

const TREATMENTS = [
  'Filler Labbra', 'Botox', 'Laser Resurfacing', 'Peeling Chimico',
  'Biostimolazione', 'Mesoterapia', 'Rinomodellamento',
];

const CITIES = ['Milano', 'Roma', 'Bologna', 'Torino', 'Firenze'];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomMinutesAgo(): number {
  return Math.floor(Math.random() * 25) + 3;
}

function randomInterval(): number {
  return Math.floor(Math.random() * 30000) + 30000; // 30-60s
}

function generateMessage(): string {
  return `${pickRandom(NAMES)} ha prenotato ${pickRandom(TREATMENTS)} a ${pickRandom(CITIES)} - ${randomMinutesAgo()} min fa`;
}

const VISIBLE_PATHS = ['/', '/search'];

export function SocialProofToast() {
  const location = useLocation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [message, setMessage] = useState('');
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const isAllowedPath = VISIBLE_PATHS.includes(location.pathname);

  const dismiss = useCallback(() => {
    if (prefersReducedMotion.current) {
      setVisible(false);
      setExiting(false);
      return;
    }
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
    }, 350);
  }, []);

  const showToast = useCallback(() => {
    setMessage(generateMessage());
    setExiting(false);
    setVisible(true);

    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(dismiss, 4000);
  }, [dismiss]);

  useEffect(() => {
    if (!isAllowedPath) {
      setVisible(false);
      return;
    }

    // Initial delay before first toast
    const initialDelay = setTimeout(() => {
      showToast();
      scheduleNext();
    }, randomInterval());

    function scheduleNext() {
      intervalTimer.current = setTimeout(() => {
        showToast();
        scheduleNext();
      }, randomInterval());
    }

    return () => {
      clearTimeout(initialDelay);
      if (intervalTimer.current) clearTimeout(intervalTimer.current);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [isAllowedPath, showToast]);

  if (!visible || !isAllowedPath) return null;

  const handleClick = () => {
    dismiss();
    navigate('/search');
  };

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      tabIndex={0}
      className={cn(
        'fixed bottom-6 left-6 z-40 max-w-sm cursor-pointer',
        'bg-white sharp-edge shadow-lg border-l-4 border-warm',
        'px-5 py-4',
        'hover:shadow-xl transition-shadow duration-200',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warm',
        exiting ? 'toast-exit' : 'toast-enter'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-2 h-2 mt-2 bg-[#25D366] sharp-edge" />
        <div>
          <p className="text-sm text-graphite font-medium leading-snug">
            {message}
          </p>
          <p className="text-xs text-silver mt-1">
            Clicca per cercare
          </p>
        </div>
      </div>
    </div>
  );
}
