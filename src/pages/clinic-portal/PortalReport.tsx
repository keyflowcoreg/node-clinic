import { useMemo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, CalendarDays, Star, UserX, Download } from 'lucide-react';
import { store } from '../../services/store';
import { cn } from '../../lib/utils';

const CLINIC_ID = 'c1';

function getDaysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function PortalReport() {
  const allPayments = useMemo(() => {
    return store.payments.getAll().filter(p => p.clinic_id === CLINIC_ID);
  }, []);

  const allBookings = useMemo(() => {
    return store.bookings.getByClinicId(CLINIC_ID);
  }, []);

  const reviews = useMemo(() => {
    return store.reviews.getByClinicId(CLINIC_ID);
  }, []);

  // Current month boundaries
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  // KPIs
  const kpis = useMemo(() => {
    const monthPayments = allPayments.filter(p => {
      const d = p.created_at.slice(0, 10);
      return d >= monthStart && d <= monthEnd && p.status === 'paid';
    });
    const revenue = monthPayments.reduce((sum, p) => sum + p.amount, 0);

    const monthBookings = allBookings.filter(b => b.date >= monthStart && b.date <= monthEnd);
    const bookingsCount = monthBookings.length;

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    const cancelledCount = monthBookings.filter(b => b.status === 'cancelled').length;
    const noShowRate = bookingsCount > 0 ? (cancelledCount / bookingsCount) * 100 : 0;

    return { revenue, bookingsCount, avgRating, noShowRate };
  }, [allPayments, allBookings, reviews, monthStart, monthEnd]);

  // Revenue chart: last 30 days
  const revenueChart = useMemo(() => {
    const days: { day: string; label: string; amount: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = getDaysAgo(i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayPayments = allPayments.filter(
        p => p.created_at.slice(0, 10) === dateStr && p.status === 'paid'
      );
      const amount = dayPayments.reduce((sum, p) => sum + p.amount, 0);
      days.push({
        day: dateStr,
        label: d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
        amount,
      });
    }
    return days;
  }, [allPayments]);

  const maxRevenue = Math.max(...revenueChart.map(d => d.amount), 1);

  // Top treatments by revenue and volume
  const treatmentStats = useMemo(() => {
    const map = new Map<string, { name: string; revenue: number; count: number }>();
    for (const p of allPayments.filter(p => p.status === 'paid')) {
      const existing = map.get(p.treatment_name) ?? { name: p.treatment_name, revenue: 0, count: 0 };
      existing.revenue += p.amount;
      existing.count += 1;
      map.set(p.treatment_name, existing);
    }
    return Array.from(map.values());
  }, [allPayments]);

  const topByRevenue = useMemo(
    () => [...treatmentStats].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    [treatmentStats]
  );
  const maxTreatmentRevenue = topByRevenue[0]?.revenue ?? 1;

  const topByVolume = useMemo(
    () => [...treatmentStats].sort((a, b) => b.count - a.count).slice(0, 5),
    [treatmentStats]
  );
  const maxTreatmentVolume = topByVolume[0]?.count ?? 1;

  // Export CSV
  function handleExportCSV() {
    const headers = ['ID', 'Data', 'Ora', 'Paziente', 'Trattamento', 'Stato', 'Deposito', 'Totale'];
    const rows = allBookings.map(b => [
      b.id,
      b.date,
      b.time,
      b.user_name ?? '',
      b.treatment_name ?? '',
      b.status,
      String(b.deposit_amount),
      String(b.total_amount ?? ''),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prenotazioni-${CLINIC_ID}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const kpiCards = [
    {
      label: 'Revenue Mese',
      value: `\u20AC${kpis.revenue.toLocaleString('it-IT')}`,
      icon: TrendingUp,
    },
    {
      label: 'Prenotazioni Mese',
      value: String(kpis.bookingsCount),
      icon: CalendarDays,
    },
    {
      label: 'Rating Medio',
      value: kpis.avgRating.toFixed(1),
      icon: Star,
    },
    {
      label: 'Tasso No-Show',
      value: `${kpis.noShowRate.toFixed(1)}%`,
      icon: UserX,
    },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-display font-light text-graphite">Report</h1>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-6 py-3 text-xs font-medium uppercase tracking-widest bg-graphite text-ivory hover:bg-graphite-light transition-colors sharp-edge"
        >
          <Download className="w-4 h-4" />
          Esporta CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-silver/20 p-6 sharp-edge"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-medium uppercase tracking-widest text-silver">
                {card.label}
              </div>
              <card.icon className="w-4 h-4 text-silver/40" />
            </div>
            <div className="text-3xl font-display font-light text-graphite">{card.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-silver/20 p-8 sharp-edge mb-10"
      >
        <h2 className="text-lg font-display font-medium text-graphite mb-6">
          Revenue Ultimi 30 Giorni
        </h2>

        <div className="flex items-end gap-[2px] h-48 overflow-x-auto">
          {revenueChart.map((day, i) => {
            const heightPct = day.amount > 0 ? (day.amount / maxRevenue) * 100 : 0;
            const showLabel = i % 5 === 0 || i === revenueChart.length - 1;
            return (
              <div
                key={day.day}
                className="flex flex-col items-center flex-1 min-w-[14px] group"
              >
                <div className="relative w-full flex items-end justify-center" style={{ height: '160px' }}>
                  <div
                    className={cn(
                      'w-full max-w-[20px] sharp-edge transition-colors',
                      day.amount > 0 ? 'bg-warm hover:bg-warm-light' : 'bg-silver/10'
                    )}
                    style={{ height: `${Math.max(heightPct, 2)}%` }}
                    title={`${day.label}: \u20AC${day.amount}`}
                  />
                  {day.amount > 0 && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] text-graphite font-medium whitespace-nowrap">
                      &euro;{day.amount}
                    </div>
                  )}
                </div>
                {showLabel && (
                  <div className="text-[8px] text-silver mt-1 whitespace-nowrap">{day.label}</div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Treatment Rankings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-silver/20 p-8 sharp-edge"
        >
          <h2 className="text-lg font-display font-medium text-graphite mb-6">
            Top Trattamenti per Revenue
          </h2>

          {topByRevenue.length === 0 ? (
            <p className="text-sm text-silver">Nessun dato disponibile</p>
          ) : (
            <div className="space-y-4">
              {topByRevenue.map((t, i) => {
                const widthPct = (t.revenue / maxTreatmentRevenue) * 100;
                return (
                  <div key={t.name}>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm font-medium text-graphite">
                        {i + 1}. {t.name}
                      </span>
                      <span className="text-sm text-silver">&euro;{t.revenue.toLocaleString('it-IT')}</span>
                    </div>
                    <div className="h-3 bg-ivory-dark sharp-edge overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPct}%` }}
                        transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
                        className="h-full bg-warm sharp-edge"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* By Volume */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white border border-silver/20 p-8 sharp-edge"
        >
          <h2 className="text-lg font-display font-medium text-graphite mb-6">
            Top Trattamenti per Volume
          </h2>

          {topByVolume.length === 0 ? (
            <p className="text-sm text-silver">Nessun dato disponibile</p>
          ) : (
            <div className="space-y-4">
              {topByVolume.map((t, i) => {
                const widthPct = (t.count / maxTreatmentVolume) * 100;
                return (
                  <div key={t.name}>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm font-medium text-graphite">
                        {i + 1}. {t.name}
                      </span>
                      <span className="text-sm text-silver">{t.count} prenotazioni</span>
                    </div>
                    <div className="h-3 bg-ivory-dark sharp-edge overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPct}%` }}
                        transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
                        className="h-full bg-graphite sharp-edge"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
