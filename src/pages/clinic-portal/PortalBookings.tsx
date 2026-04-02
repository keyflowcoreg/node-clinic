import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { CalendarDays, Clock, AlertCircle, Check, X, CheckCircle2 } from 'lucide-react';
import { store } from '../../services/store';
import { cn } from '../../lib/utils';
import type { BookingStatus } from '../../types/database';

const CLINIC_ID = 'c1';

type DateFilter = 'oggi' | 'settimana' | 'mese' | 'tutti';

function getStatusBadge(status: BookingStatus): { label: string; className: string } {
  switch (status) {
    case 'pending':
      return { label: 'In Attesa', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    case 'confirmed':
      return { label: 'Confermato', className: 'bg-green-100 text-green-800 border-green-300' };
    case 'completed':
      return { label: 'Completato', className: 'bg-silver/20 text-graphite border-silver/30' };
    case 'cancelled':
      return { label: 'Annullato', className: 'bg-red-100 text-red-800 border-red-300' };
  }
}

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function PortalBookings() {
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('tutti');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const allBookings = useMemo(() => {
    return store.bookings.getByClinicId(CLINIC_ID);
  }, [successMessage]); // re-read after updates

  const today = startOfDay(new Date());
  const todayStr = today.toISOString().slice(0, 10);

  const counters = useMemo(() => {
    const todayCount = allBookings.filter(b => b.date === todayStr).length;
    const monday = getMonday(new Date());
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    const mondayStr = monday.toISOString().slice(0, 10);
    const sundayStr = sunday.toISOString().slice(0, 10);
    const weekCount = allBookings.filter(b => b.date >= mondayStr && b.date <= sundayStr).length;
    const pendingCount = allBookings.filter(b => b.status === 'pending').length;
    return { todayCount, weekCount, pendingCount };
  }, [allBookings, todayStr]);

  const filteredBookings = useMemo(() => {
    let filtered = allBookings;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    if (dateFilter === 'oggi') {
      filtered = filtered.filter(b => b.date === todayStr);
    } else if (dateFilter === 'settimana') {
      const monday = getMonday(new Date());
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);
      const mondayStr = monday.toISOString().slice(0, 10);
      const sundayStr = sunday.toISOString().slice(0, 10);
      filtered = filtered.filter(b => b.date >= mondayStr && b.date <= sundayStr);
    } else if (dateFilter === 'mese') {
      const ms = startOfMonth(new Date()).toISOString().slice(0, 10);
      const me = endOfMonth(new Date()).toISOString().slice(0, 10);
      filtered = filtered.filter(b => b.date >= ms && b.date <= me);
    }

    return filtered.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });
  }, [allBookings, statusFilter, dateFilter, todayStr]);

  function handleAction(id: string, newStatus: BookingStatus) {
    store.bookings.update(id, { status: newStatus });
    const labels: Record<BookingStatus, string> = {
      confirmed: 'Prenotazione confermata',
      cancelled: 'Prenotazione annullata',
      completed: 'Prenotazione completata',
      pending: 'Stato aggiornato',
    };
    setSuccessMessage(labels[newStatus]);
    setTimeout(() => setSuccessMessage(null), 3000);
  }

  const counterCards = [
    { label: 'Oggi', value: counters.todayCount, icon: CalendarDays },
    { label: 'Questa Settimana', value: counters.weekCount, icon: Clock },
    { label: 'In Attesa di Conferma', value: counters.pendingCount, icon: AlertCircle },
  ];

  return (
    <div>
      <h1 className="text-3xl font-display font-light text-graphite mb-8">Prenotazioni</h1>

      {/* Success message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-6 bg-green-50 border border-green-200 text-green-800 px-6 py-3 sharp-edge text-sm font-medium flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          {successMessage}
        </motion.div>
      )}

      {/* Counter cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {counterCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-silver/20 p-6 sharp-edge"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium uppercase tracking-widest text-silver mb-2">
                  {card.label}
                </div>
                <div className="text-4xl font-display font-light text-graphite">
                  {card.value}
                </div>
              </div>
              <card.icon className="w-8 h-8 text-silver/40" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as BookingStatus | 'all')}
          className="bg-white border border-silver/30 px-4 py-2 text-sm text-graphite sharp-edge"
        >
          <option value="all">Tutti gli stati</option>
          <option value="pending">In Attesa</option>
          <option value="confirmed">Confermati</option>
          <option value="completed">Completati</option>
          <option value="cancelled">Annullati</option>
        </select>

        <div className="flex gap-2">
          {([
            ['oggi', 'Oggi'],
            ['settimana', 'Settimana'],
            ['mese', 'Mese'],
            ['tutti', 'Tutti'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setDateFilter(key)}
              className={cn(
                'px-4 py-2 text-xs font-medium uppercase tracking-widest border transition-colors sharp-edge',
                dateFilter === key
                  ? 'bg-graphite text-ivory border-graphite'
                  : 'bg-white text-graphite border-silver/30 hover:border-graphite/30'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-silver/20 sharp-edge overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-silver/20">
              {['Data', 'Ora', 'Paziente', 'Trattamento', 'Stato', 'Deposito', 'Azioni'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-medium uppercase tracking-widest text-silver">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-silver">
                  Nessuna prenotazione trovata
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking, i) => {
                const badge = getStatusBadge(booking.status);
                return (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-silver/10 hover:bg-ivory-dark/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-graphite whitespace-nowrap">
                      {new Date(booking.date + 'T00:00:00').toLocaleDateString('it-IT', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-graphite whitespace-nowrap">{booking.time}</td>
                    <td className="px-4 py-3 text-graphite">{booking.user_name ?? 'N/A'}</td>
                    <td className="px-4 py-3 text-graphite">{booking.treatment_name ?? 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-block text-[10px] font-medium uppercase tracking-widest px-3 py-1 border sharp-edge',
                        badge.className
                      )}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-graphite font-medium whitespace-nowrap">
                      &euro;{booking.deposit_amount}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleAction(booking.id, 'confirmed')}
                            className="p-2 bg-graphite text-ivory hover:bg-graphite-light transition-colors sharp-edge"
                            title="Conferma"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <button
                            onClick={() => handleAction(booking.id, 'cancelled')}
                            className="p-2 bg-white border border-red-300 text-red-600 hover:bg-red-50 transition-colors sharp-edge"
                            title="Annulla"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleAction(booking.id, 'completed')}
                            className="p-2 bg-white border border-silver/30 text-graphite hover:border-graphite/30 transition-colors sharp-edge"
                            title="Segna Completato"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
