import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { CreditCard, TrendingUp, RotateCcw, BarChart3, CheckCircle2 } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { cn } from '../../lib/utils';
import { store } from '../../services/store';
import { useToast } from '../../context/ToastContext';
import type { Payment, PaymentStatus } from '../../types/database';

const STATUS_BADGE_CLASS: Record<PaymentStatus, string> = {
  paid: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-yellow-100 text-yellow-700',
  refunded: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: 'Pagato',
  pending: 'In Attesa',
  refunded: 'Rimborsato',
};

type DateRange = 'week' | 'month' | 'all';

type PendingAction =
  | { type: 'refund'; payment: Payment }
  | { type: 'markPaid'; payment: Payment }
  | null;

function formatCurrency(value: number): string {
  return value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getDateNDaysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getLast7DaysRevenue(payments: Payment[]): { label: string; value: number }[] {
  const days: { label: string; value: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = getDateNDaysAgo(i);
    const dayStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' });
    const dayTotal = payments
      .filter((p) => p.status === 'paid' && p.created_at.startsWith(dayStr))
      .reduce((sum, p) => sum + p.amount, 0);
    days.push({ label, value: dayTotal });
  }
  return days;
}

export function AdminPayments() {
  const { addToast } = useToast();
  const [payments, setPayments] = useState<Payment[]>(() => store.payments.getAll());
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const filtered = useMemo(() => {
    let result = payments;

    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (dateRange === 'week') {
      const weekAgo = getDateNDaysAgo(7);
      result = result.filter((p) => new Date(p.created_at) >= weekAgo);
    } else if (dateRange === 'month') {
      const monthAgo = getDateNDaysAgo(30);
      result = result.filter((p) => new Date(p.created_at) >= monthAgo);
    }

    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [payments, statusFilter, dateRange]);

  const paidPayments = payments.filter((p) => p.status === 'paid');
  const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalDeposits = payments.reduce((sum, p) => sum + p.deposit, 0);
  const refundedCount = payments.filter((p) => p.status === 'refunded').length;
  const avgTransaction = payments.length > 0 ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length : 0;

  const chartData = getLast7DaysRevenue(payments);
  const maxChartValue = Math.max(...chartData.map((d) => d.value), 1);

  function handleRefund(payment: Payment) {
    store.payments.update(payment.id, { status: 'refunded' });
    setPayments(store.payments.getAll());
    setPendingAction(null);
    addToast('Pagamento rimborsato', 'info');
  }

  function handleMarkPaid(payment: Payment) {
    store.payments.update(payment.id, { status: 'paid' });
    setPayments(store.payments.getAll());
    setPendingAction(null);
    addToast('Pagamento confermato');
  }

  function handleConfirm() {
    if (!pendingAction) return;
    if (pendingAction.type === 'refund') handleRefund(pendingAction.payment);
    else handleMarkPaid(pendingAction.payment);
  }

  const dialogVariant = pendingAction?.type === 'refund' ? 'danger' : 'warning';
  const dialogTitle = pendingAction?.type === 'refund' ? 'Conferma Rimborso' : 'Conferma Pagamento';
  const dialogMessage =
    pendingAction?.type === 'refund'
      ? `Vuoi rimborsare il pagamento di €${formatCurrency(pendingAction.payment.amount)} di ${pendingAction.payment.user_name}? Questa azione non può essere annullata.`
      : `Vuoi segnare come pagato l'importo di €${formatCurrency(pendingAction?.payment.amount ?? 0)} di ${pendingAction?.payment.user_name}?`;
  const dialogConfirmLabel = pendingAction?.type === 'refund' ? 'Rimborsa' : 'Segna Pagato';

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-light text-graphite mb-2">Gestione Pagamenti</h1>
          <p className="text-graphite-light/70">Transazioni, depositi e report finanziari.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Revenue Totale', value: totalRevenue, icon: TrendingUp, prefix: '\u20AC', decimals: 2 },
            { label: 'Depositi Raccolti', value: totalDeposits, icon: CreditCard, prefix: '\u20AC', decimals: 2 },
            { label: 'Rimborsi', value: refundedCount, icon: RotateCcw },
            { label: 'Media Transazione', value: avgTransaction, icon: BarChart3, prefix: '\u20AC', decimals: 2 },
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
                <AnimatedCounter
                  value={kpi.value}
                  prefix={kpi.prefix}
                  decimals={kpi.decimals ?? 0}
                  className="text-4xl font-display font-light text-graphite"
                />
              </motion.div>
            );
          })}
        </div>

        {/* Revenue Chart (Last 7 Days) */}
        <div className="bg-white border border-silver/20 sharp-edge p-6 mb-10">
          <h2 className="text-sm font-medium uppercase tracking-widest text-silver mb-6">Revenue Ultimi 7 Giorni</h2>
          <div className="flex items-end gap-3 h-40">
            {chartData.map((day, i) => (
              <motion.div
                key={i}
                className="flex-1 flex flex-col items-center gap-2"
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                style={{ transformOrigin: 'bottom' }}
              >
                <span className="text-xs text-graphite-light/70 font-medium">
                  {day.value > 0 ? `\u20AC${formatCurrency(day.value)}` : ''}
                </span>
                <div
                  className="w-full bg-warm/80 sharp-edge min-h-[4px] transition-all"
                  style={{ height: `${Math.max((day.value / maxChartValue) * 100, 3)}%` }}
                />
                <span className="text-xs text-silver uppercase tracking-wider">{day.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | PaymentStatus)}
            className="px-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite focus:outline-none focus:border-graphite transition-colors"
          >
            <option value="all">Tutti gli stati</option>
            <option value="paid">Pagato</option>
            <option value="pending">In Attesa</option>
            <option value="refunded">Rimborsato</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="px-4 py-3 bg-white border border-silver/30 sharp-edge text-sm text-graphite focus:outline-none focus:border-graphite transition-colors"
          >
            <option value="all">Tutte le date</option>
            <option value="week">Questa settimana</option>
            <option value="month">Questo mese</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-silver/20 sharp-edge overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-silver/20">
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Data</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Paziente</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Clinica</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Trattamento</th>
                <th className="text-right px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Importo</th>
                <th className="text-right px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Deposito</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Stato</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  className="border-b border-silver/10 hover:bg-ivory/50 transition-colors"
                >
                  <td className="px-6 py-4 text-graphite-light/70">{formatDate(p.created_at)}</td>
                  <td className="px-6 py-4 font-medium text-graphite">{p.user_name}</td>
                  <td className="px-6 py-4 text-graphite-light/70">{p.clinic_name}</td>
                  <td className="px-6 py-4 text-graphite-light/70">{p.treatment_name}</td>
                  <td className="px-6 py-4 text-right font-medium text-graphite">{'\u20AC'}{formatCurrency(p.amount)}</td>
                  <td className="px-6 py-4 text-right text-graphite-light/70">{'\u20AC'}{formatCurrency(p.deposit)}</td>
                  <td className="px-6 py-4">
                    <span className={cn('inline-block px-3 py-1 text-xs font-medium uppercase tracking-wider sharp-edge', STATUS_BADGE_CLASS[p.status])}>
                      {STATUS_LABELS[p.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {p.status === 'paid' && (
                        <button
                          onClick={() => setPendingAction({ type: 'refund', payment: p })}
                          title="Rimborsa"
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-red-300 sharp-edge text-red-600 text-xs font-medium uppercase tracking-wider hover:bg-red-50 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" /> Rimborsa
                        </button>
                      )}
                      {p.status === 'pending' && (
                        <button
                          onClick={() => setPendingAction({ type: 'markPaid', payment: p })}
                          title="Segna Pagato"
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-300 sharp-edge text-emerald-600 text-xs font-medium uppercase tracking-wider hover:bg-emerald-50 transition-colors"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Segna Pagato
                        </button>
                      )}
                      {p.status === 'refunded' && (
                        <span className="text-xs text-silver italic">—</span>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-silver">
                    Nessun pagamento trovato con i filtri selezionati.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-xs text-silver">
          {filtered.length} di {payments.length} pagamenti
        </div>
      </motion.div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={pendingAction !== null}
        title={dialogTitle}
        message={dialogMessage}
        confirmLabel={dialogConfirmLabel}
        variant={dialogVariant}
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
      />
    </AdminLayout>
  );
}
