import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { CalendarCheck, Search, CheckCircle2, XCircle, Check } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { Pagination } from '../../components/admin/Pagination';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { cn } from '../../lib/utils';
import { store } from '../../services/store';
import { useToast } from '../../context/ToastContext';
import type { Booking, BookingStatus } from '../../types/database';

const PER_PAGE = 15;

const STATUS_BADGE: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-warm-soft text-warm',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'In Attesa',
  confirmed: 'Confermata',
  completed: 'Completata',
  cancelled: 'Cancellata',
};

type PendingAction = {
  id: string;
  newStatus: BookingStatus;
  label: string;
};

export function AdminBookings() {
  const { addToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>(() =>
    store.bookings.getAll().sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  );
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        (b.user_name ?? '').toLowerCase().includes(q) ||
        (b.clinic_name ?? '').toLowerCase().includes(q) ||
        (b.treatment_name ?? '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, currentPage]);

  const totalBookings = bookings.length;
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const revenue = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (b.total_amount ?? 0), 0);

  function refresh() {
    setBookings(
      store.bookings.getAll().sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    );
  }

  function handleFilterChange(value: 'all' | BookingStatus) {
    setStatusFilter(value);
    setCurrentPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  function requestAction(booking: Booking, newStatus: BookingStatus) {
    const actionLabel =
      newStatus === 'confirmed'
        ? 'Conferma Prenotazione'
        : newStatus === 'completed'
        ? 'Completa Prenotazione'
        : 'Cancella Prenotazione';
    setPendingAction({ id: booking.id, newStatus, label: actionLabel });
  }

  function handleConfirmAction() {
    if (!pendingAction) return;
    store.bookings.update(pendingAction.id, { status: pendingAction.newStatus });
    refresh();

    const toastMessages: Record<BookingStatus, string> = {
      confirmed: 'Prenotazione confermata',
      completed: 'Prenotazione completata',
      cancelled: 'Prenotazione cancellata',
      pending: 'Prenotazione aggiornata',
    };
    const toastTypes: Record<BookingStatus, 'success' | 'info' | 'error'> = {
      confirmed: 'success',
      completed: 'info',
      cancelled: 'error',
      pending: 'info',
    };

    addToast(toastMessages[pendingAction.newStatus], toastTypes[pendingAction.newStatus]);
    setPendingAction(null);
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-light text-graphite mb-2">Tutte le Prenotazioni</h1>
            <p className="text-graphite-light/70">Monitora e gestisci le prenotazioni su tutta la piattaforma.</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Totali', value: totalBookings, icon: CalendarCheck },
            { label: 'Confermate', value: confirmedCount, icon: CheckCircle2 },
            { label: 'In Attesa', value: pendingCount, icon: XCircle },
            { label: 'Revenue (€)', value: revenue, icon: Check },
          ].map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-silver/20 p-6 sharp-edge"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="text-sm font-medium uppercase tracking-widest text-silver">{kpi.label}</div>
                  <Icon className="w-5 h-5 text-graphite" />
                </div>
                <AnimatedCounter value={kpi.value} className="text-4xl font-display font-light text-graphite" />
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver" />
            <input
              type="text"
              placeholder="Cerca per utente, clinica o trattamento..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite placeholder:text-silver focus:outline-none focus:border-graphite transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value as 'all' | BookingStatus)}
            className="px-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite focus:outline-none focus:border-graphite transition-colors"
          >
            <option value="all">Tutti gli stati</option>
            <option value="pending">In Attesa</option>
            <option value="confirmed">Confermate</option>
            <option value="completed">Completate</option>
            <option value="cancelled">Cancellate</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-silver/20 sharp-edge overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-silver/20">
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Utente</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Clinica</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Trattamento</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Data & Ora</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Stato</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Importo</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((booking, i) => (
                <motion.tr
                  key={booking.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  className="border-b border-silver/10 hover:bg-ivory/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-ivory border border-silver/30 flex items-center justify-center sharp-edge shrink-0">
                        <CalendarCheck className="w-4 h-4 text-graphite" />
                      </div>
                      <span className="font-medium text-graphite">{booking.user_name ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-graphite-light/70">{booking.clinic_name ?? '—'}</td>
                  <td className="px-6 py-4 text-graphite-light/70">{booking.treatment_name ?? '—'}</td>
                  <td className="px-6 py-4 text-graphite-light/70">
                    {formatDate(booking.date)}
                    <br />
                    <span className="text-xs text-silver">{booking.time}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-block px-3 py-1 text-xs font-medium uppercase tracking-wider sharp-edge',
                        STATUS_BADGE[booking.status]
                      )}
                    >
                      {STATUS_LABELS[booking.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-graphite-light/70">
                    {booking.total_amount != null
                      ? `€${booking.total_amount.toLocaleString('it-IT')}`
                      : '—'}
                    <br />
                    <span className="text-xs text-silver">
                      dep. €{booking.deposit_amount.toLocaleString('it-IT')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => requestAction(booking, 'confirmed')}
                            className="p-2 border border-emerald-300 sharp-edge text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Conferma"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => requestAction(booking, 'cancelled')}
                            className="p-2 border border-red-300 sharp-edge text-red-600 hover:bg-red-50 transition-colors"
                            title="Cancella"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => requestAction(booking, 'completed')}
                            className="p-2 border border-blue-300 sharp-edge text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Completa"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => requestAction(booking, 'cancelled')}
                            className="p-2 border border-red-300 sharp-edge text-red-600 hover:bg-red-50 transition-colors"
                            title="Cancella"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {(booking.status === 'completed' || booking.status === 'cancelled') && (
                        <span className="text-xs text-silver px-2">—</span>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-silver">
                    Nessuna prenotazione trovata.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          total={filtered.length}
          perPage={PER_PAGE}
          currentPage={currentPage}
          onChange={setCurrentPage}
        />

        {filtered.length > 0 && (
          <div className="mt-3 text-xs text-silver">
            {filtered.length} di {bookings.length} prenotazioni
          </div>
        )}
      </motion.div>

      {/* Confirm Action Dialog */}
      <ConfirmDialog
        open={pendingAction !== null}
        title={pendingAction?.label ?? ''}
        message={
          pendingAction?.newStatus === 'cancelled'
            ? 'Sei sicuro di voler cancellare questa prenotazione?'
            : pendingAction?.newStatus === 'completed'
            ? 'Segna questa prenotazione come completata?'
            : 'Confermi la prenotazione?'
        }
        confirmLabel={
          pendingAction?.newStatus === 'cancelled'
            ? 'Cancella'
            : pendingAction?.newStatus === 'completed'
            ? 'Completa'
            : 'Conferma'
        }
        variant={pendingAction?.newStatus === 'cancelled' ? 'danger' : 'warning'}
        onConfirm={handleConfirmAction}
        onCancel={() => setPendingAction(null)}
      />
    </AdminLayout>
  );
}
