import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'nc_booking_progress';
const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export type BookingProgress = {
  clinicId: string;
  treatmentId: string;
  step: number;
  date?: string;
  time?: string;
  savedAt: number;
};

type UseBookingRecoveryReturn = {
  hasPendingBooking: boolean;
  pendingData: BookingProgress | null;
  restore: () => BookingProgress | null;
  dismiss: () => void;
  save: (data: Omit<BookingProgress, 'savedAt'>) => void;
};

function readSaved(): BookingProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BookingProgress;
  } catch {
    return null;
  }
}

function isStale(saved: BookingProgress): boolean {
  return Date.now() - saved.savedAt > STALE_THRESHOLD_MS;
}

export function useBookingRecovery(): UseBookingRecoveryReturn {
  const [pendingData, setPendingData] = useState<BookingProgress | null>(null);

  useEffect(() => {
    const saved = readSaved();
    if (saved && isStale(saved)) {
      setPendingData(saved);
    }
  }, []);

  const hasPendingBooking = pendingData !== null;

  const save = useCallback((data: Omit<BookingProgress, 'savedAt'>) => {
    const progress: BookingProgress = {
      ...data,
      savedAt: Date.now(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // localStorage full or unavailable
    }
  }, []);

  const restore = useCallback((): BookingProgress | null => {
    return pendingData;
  }, [pendingData]);

  const dismiss = useCallback(() => {
    setPendingData(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage unavailable
    }
  }, []);

  return {
    hasPendingBooking,
    pendingData,
    restore,
    dismiss,
    save,
  };
}
