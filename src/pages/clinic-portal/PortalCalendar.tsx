import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';
import { store } from '../../services/store';
import { cn } from '../../lib/utils';
import type { Booking, BookingStatus } from '../../types/database';

const CLINIC_ID = 'c1';
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 08:00 - 20:00
const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const HOUR_HEIGHT = 60;

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getStatusColor(status: BookingStatus): string {
  switch (status) {
    case 'confirmed':
      return 'bg-warm/20 border-warm/40 text-graphite';
    case 'pending':
      return 'bg-yellow-100 border-yellow-400/40 text-yellow-900';
    case 'completed':
      return 'bg-silver/20 border-silver/40 text-graphite';
    case 'cancelled':
      return 'bg-red-100 border-red-300/40 text-red-800';
  }
}

function getStatusLabel(status: BookingStatus): string {
  switch (status) {
    case 'confirmed': return 'Confermato';
    case 'pending': return 'In Attesa';
    case 'completed': return 'Completato';
    case 'cancelled': return 'Annullato';
  }
}

export function PortalCalendar() {
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [highlightedSlot, setHighlightedSlot] = useState<string | null>(null);

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const bookings = useMemo(() => {
    const all = store.bookings.getByClinicId(CLINIC_ID);
    const start = formatDate(weekDates[0]);
    const end = formatDate(weekDates[6]);
    return all.filter(b => b.date >= start && b.date <= end);
  }, [weekDates]);

  const bookingsByDayTime = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      const key = `${b.date}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    }
    return map;
  }, [bookings]);

  function prevWeek() {
    setWeekStart(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }

  function nextWeek() {
    setWeekStart(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  }

  function goCurrentWeek() {
    setWeekStart(getMonday(new Date()));
  }

  function getBookingTop(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return (h - 8) * HOUR_HEIGHT + (m / 60) * HOUR_HEIGHT;
  }

  function handleEmptyClick(dateStr: string, hour: number) {
    const slotKey = `${dateStr}-${hour}`;
    setHighlightedSlot(prev => prev === slotKey ? null : slotKey);
  }

  const weekLabel = `${weekDates[0].toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} - ${weekDates[6].toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-display font-light text-graphite">Calendario</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={prevWeek}
            className="p-2 border border-silver/30 hover:border-graphite/30 transition-colors sharp-edge"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goCurrentWeek}
            className="px-4 py-2 text-xs font-medium uppercase tracking-widest border border-silver/30 hover:border-graphite/30 transition-colors sharp-edge"
          >
            {weekLabel}
          </button>
          <button
            onClick={nextWeek}
            className="p-2 border border-silver/30 hover:border-graphite/30 transition-colors sharp-edge"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white border border-silver/20 sharp-edge overflow-x-auto"
      >
        {/* Header */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-silver/20">
          <div className="p-3 border-r border-silver/20" />
          {weekDates.map((date, i) => {
            const isToday = formatDate(date) === formatDate(new Date());
            return (
              <div
                key={i}
                className={cn(
                  'p-3 text-center border-r border-silver/20 last:border-r-0',
                  isToday && 'bg-warm/5'
                )}
              >
                <div className="text-xs font-medium uppercase tracking-widest text-silver">
                  {DAY_LABELS[i]}
                </div>
                <div className={cn(
                  'text-lg font-display font-medium',
                  isToday ? 'text-warm' : 'text-graphite'
                )}>
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)]">
          {/* Time labels column */}
          <div>
            {HOURS.map(hour => (
              <div
                key={hour}
                className="border-b border-r border-silver/10 flex items-start justify-end pr-2 pt-1"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="text-[10px] font-medium text-silver">
                  {String(hour).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDates.map((date, dayIdx) => {
            const dateStr = formatDate(date);
            const dayBookings = bookingsByDayTime.get(dateStr) ?? [];
            const isToday = dateStr === formatDate(new Date());

            return (
              <div
                key={dayIdx}
                className={cn(
                  'relative border-r border-silver/10 last:border-r-0',
                  isToday && 'bg-warm/[0.02]'
                )}
              >
                {/* Hour grid lines */}
                {HOURS.map(hour => {
                  const slotKey = `${dateStr}-${hour}`;
                  const isHighlighted = highlightedSlot === slotKey;
                  return (
                    <div
                      key={hour}
                      onClick={() => handleEmptyClick(dateStr, hour)}
                      className={cn(
                        'border-b border-silver/10 cursor-pointer transition-colors',
                        isHighlighted ? 'bg-warm/10' : 'hover:bg-ivory-dark/50'
                      )}
                      style={{ height: HOUR_HEIGHT }}
                    >
                      {isHighlighted && (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-[10px] font-medium uppercase tracking-widest text-warm">
                            Slot disponibile
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Booking blocks */}
                {dayBookings.map(booking => (
                  <button
                    key={booking.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBooking(booking);
                    }}
                    className={cn(
                      'absolute left-1 right-1 border px-2 py-1 sharp-edge cursor-pointer overflow-hidden transition-shadow hover:shadow-md z-10',
                      getStatusColor(booking.status)
                    )}
                    style={{
                      top: getBookingTop(booking.time),
                      height: Math.max(HOUR_HEIGHT * 0.8, 44),
                    }}
                  >
                    <div className="text-[10px] font-medium truncate">
                      {booking.time} - {booking.user_name ?? 'Paziente'}
                    </div>
                    <div className="text-[9px] truncate opacity-70">
                      {booking.treatment_name ?? 'Trattamento'}
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Booking detail popup */}
      {selectedBooking && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/40"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white border border-silver/20 p-8 sharp-edge w-full max-w-md shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-display font-medium text-graphite">
                Dettaglio Prenotazione
              </h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 hover:bg-ivory-dark transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-silver" />
                <span className="text-sm text-graphite">
                  {new Date(selectedBooking.date).toLocaleDateString('it-IT', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}{' '}
                  ore {selectedBooking.time}
                </span>
              </div>

              <div className="border-t border-silver/10 pt-4 space-y-3">
                <div>
                  <div className="text-[10px] font-medium uppercase tracking-widest text-silver mb-1">
                    Paziente
                  </div>
                  <div className="text-sm font-medium text-graphite">
                    {selectedBooking.user_name ?? 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-medium uppercase tracking-widest text-silver mb-1">
                    Trattamento
                  </div>
                  <div className="text-sm font-medium text-graphite">
                    {selectedBooking.treatment_name ?? 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-medium uppercase tracking-widest text-silver mb-1">
                    Stato
                  </div>
                  <span className={cn(
                    'inline-block text-[10px] font-medium uppercase tracking-widest px-3 py-1 sharp-edge',
                    getStatusColor(selectedBooking.status)
                  )}>
                    {getStatusLabel(selectedBooking.status)}
                  </span>
                </div>
                <div className="flex gap-6">
                  <div>
                    <div className="text-[10px] font-medium uppercase tracking-widest text-silver mb-1">
                      Deposito
                    </div>
                    <div className="text-sm font-medium text-graphite">
                      {selectedBooking.deposit_amount}
                    </div>
                  </div>
                  {selectedBooking.total_amount != null && (
                    <div>
                      <div className="text-[10px] font-medium uppercase tracking-widest text-silver mb-1">
                        Totale
                      </div>
                      <div className="text-sm font-medium text-graphite">
                        {selectedBooking.total_amount}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="mt-6 w-full bg-graphite text-ivory py-3 text-xs font-medium uppercase tracking-widest hover:bg-graphite-light transition-colors sharp-edge"
            >
              Chiudi
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
