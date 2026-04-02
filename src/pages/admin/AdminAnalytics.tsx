import { useMemo } from 'react';
import { motion } from 'motion/react';
import { TrendingDown, Star, Users, FileText, MessageCircle, Globe, Briefcase, BarChart3 } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { store } from '../../services/store';
import { cn } from '../../lib/utils';
import type { LeadSource } from '../../types/database';

const SOURCE_META: Record<LeadSource, { label: string; icon: React.ElementType }> = {
  'prenota-visita': { label: 'Modulo Prenotazione', icon: FileText },
  'diventa-partner': { label: 'Diventa Partner', icon: Briefcase },
  'trattamenti': { label: 'Pagina Trattamenti', icon: BarChart3 },
  'contact': { label: 'Contatto Diretto', icon: Globe },
  'exit-intent': { label: 'Exit Intent', icon: Users },
  'whatsapp': { label: 'WhatsApp', icon: MessageCircle },
  'chatbot': { label: 'Chatbot', icon: MessageCircle },
  'bio': { label: 'Linktree Bio', icon: Globe },
};

export function AdminAnalytics() {
  const bookings = store.bookings.getAll();
  const clinics = store.clinics.getAll();
  const payments = store.payments.getAll();
  const leads = store.leads.getAll();
  const funnelEvents = store.funnel.getAll();

  // --- Funnel ---
  const funnelStages = useMemo(() => {
    const bookingEvents = funnelEvents.filter(e => e.funnel === 'booking');
    const counts = {
      page_view: bookingEvents.filter(e => e.step === 'page_view').length,
      clinic_view: bookingEvents.filter(e => e.step === 'clinic_view').length,
      booking_start: bookingEvents.filter(e => e.step === 'booking_start').length,
      payment: bookingEvents.filter(e => e.step === 'payment').length,
      confirmed: bookingEvents.filter(e => e.step === 'confirmed').length,
    };

    const max = Math.max(counts.page_view, 1);
    const pct = (n: number) => Math.max((n / max) * 100, 4);
    const opac = (n: number) => 0.35 + ((n / max) * 0.65);

    return [
      { label: 'Visite', value: counts.page_view, width: 100, opacity: 1 },
      { label: 'Ricerca Clinica', value: counts.clinic_view, width: pct(counts.clinic_view), opacity: opac(counts.clinic_view) },
      { label: 'Avvio Booking', value: counts.booking_start, width: pct(counts.booking_start), opacity: opac(counts.booking_start) },
      { label: 'Pagamento', value: counts.payment, width: pct(counts.payment), opacity: opac(counts.payment) },
      { label: 'Conferma', value: counts.confirmed, width: pct(counts.confirmed), opacity: opac(counts.confirmed) },
    ];
  }, [funnelEvents]);

  // --- Lead Sources ---
  const leadSources = useMemo(() => {
    const grouped: Partial<Record<LeadSource, number>> = {};
    for (const lead of leads) {
      grouped[lead.source] = (grouped[lead.source] ?? 0) + 1;
    }
    const total = leads.length || 1;
    return Object.entries(grouped)
      .map(([source, count]) => ({
        source: source as LeadSource,
        count: count as number,
        percentage: Math.round(((count as number) / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [leads]);

  // --- Top Clinics by Bookings ---
  const topClinics = useMemo(() => {
    const clinicMap = new Map(clinics.map(c => [c.id, c]));
    const countMap = new Map<string, number>();
    for (const b of bookings) {
      countMap.set(b.clinic_id, (countMap.get(b.clinic_id) ?? 0) + 1);
    }
    return Array.from(countMap.entries())
      .map(([clinicId, count]) => {
        const clinic = clinicMap.get(clinicId);
        return { clinicId, name: clinic?.name ?? clinicId, bookings: count, rating: clinic?.rating ?? 0 };
      })
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, [bookings, clinics]);

  // --- Top Treatments by Revenue ---
  const topTreatments = useMemo(() => {
    const revenueMap = new Map<string, { revenue: number; count: number }>();
    for (const p of payments) {
      if (p.status !== 'paid') continue;
      const existing = revenueMap.get(p.treatment_name) ?? { revenue: 0, count: 0 };
      revenueMap.set(p.treatment_name, {
        revenue: existing.revenue + p.amount,
        count: existing.count + 1,
      });
    }
    return Array.from(revenueMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, [payments]);

  // --- No-Show Rate ---
  const noShowRate = useMemo(() => {
    if (bookings.length === 0) return 0;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    return Math.round((cancelled / bookings.length) * 100);
  }, [bookings]);

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-display font-light text-graphite mb-2">Analytics</h1>
            <p className="text-graphite-light/70">Funnel di conversione, canali e performance.</p>
          </div>
        </div>

        {/* Funnel Chart */}
        <div className="bg-white border border-silver/20 sharp-edge overflow-hidden mb-12">
          <div className="p-6 border-b border-silver/20">
            <h2 className="font-display text-xl text-graphite">Funnel di Conversione</h2>
          </div>
          <div className="p-6 space-y-3">
            {funnelStages.map((stage, i) => (
              <motion.div
                key={stage.label}
                className="mx-auto flex items-center justify-center text-ivory sharp-edge"
                style={{
                  backgroundColor: `rgba(26, 26, 26, ${stage.opacity})`,
                  height: 48,
                }}
                initial={{ width: 0, opacity: 0 }}
                whileInView={{ width: `${stage.width}%`, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <span className="text-sm font-medium tracking-wide whitespace-nowrap px-4">
                  {stage.label}: {stage.value.toLocaleString('it-IT')}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Lead Sources */}
        <div className="bg-white border border-silver/20 sharp-edge overflow-hidden mb-12">
          <div className="p-6 border-b border-silver/20">
            <h2 className="font-display text-xl text-graphite">Fonti Lead</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {leadSources.length === 0 ? (
              <p className="text-sm text-silver col-span-2">Nessun lead registrato.</p>
            ) : (
              leadSources.map(({ source, count, percentage }) => {
                const meta = SOURCE_META[source] ?? { label: source, icon: Globe };
                const Icon = meta.icon;
                return (
                  <div key={source} className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-ivory border border-silver/30 flex items-center justify-center sharp-edge flex-shrink-0">
                        <Icon className="w-4 h-4 text-graphite" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-medium text-graphite text-sm truncate">{meta.label}</span>
                          <span className="text-xs text-silver ml-2 flex-shrink-0">{count} lead · {percentage}%</span>
                        </div>
                        <div className="w-full bg-ivory-dark sharp-edge h-2.5">
                          <motion.div
                            className="h-full bg-graphite sharp-edge"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Two columns: Top Cliniche + Top Trattamenti */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-12">
          {/* Top Cliniche per Prenotazioni */}
          <div className="bg-white border border-silver/20 sharp-edge overflow-hidden">
            <div className="p-6 border-b border-silver/20">
              <h2 className="font-display text-xl text-graphite">Top Cliniche per Prenotazioni</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-graphite text-ivory">
                    <th className="p-4 text-xs font-medium uppercase tracking-widest">#</th>
                    <th className="p-4 text-xs font-medium uppercase tracking-widest">Clinica</th>
                    <th className="p-4 text-xs font-medium uppercase tracking-widest">Prenotazioni</th>
                    <th className="p-4 text-xs font-medium uppercase tracking-widest">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-silver/20">
                  {topClinics.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-silver text-sm">Nessun dato disponibile.</td>
                    </tr>
                  ) : (
                    topClinics.map(clinic => (
                      <tr key={clinic.clinicId} className="bg-ivory hover:bg-ivory-dark/30 transition-colors">
                        <td className="p-4 text-graphite-light font-display">{clinic.rank}</td>
                        <td className="p-4 font-medium text-graphite">{clinic.name}</td>
                        <td className="p-4 text-graphite-light">{clinic.bookings}</td>
                        <td className="p-4 text-graphite-light">
                          {clinic.rating > 0 ? (
                            <span className="inline-flex items-center gap-1">
                              <Star className="w-3 h-3 text-warm fill-warm" />
                              {clinic.rating.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-silver">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Trattamenti per Revenue */}
          <div className="bg-white border border-silver/20 sharp-edge overflow-hidden">
            <div className="p-6 border-b border-silver/20">
              <h2 className="font-display text-xl text-graphite">Top Trattamenti per Revenue</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-graphite text-ivory">
                    <th className="p-4 text-xs font-medium uppercase tracking-widest">#</th>
                    <th className="p-4 text-xs font-medium uppercase tracking-widest">Trattamento</th>
                    <th className="p-4 text-xs font-medium uppercase tracking-widest">Prenotazioni</th>
                    <th className="p-4 text-xs font-medium uppercase tracking-widest">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-silver/20">
                  {topTreatments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-silver text-sm">Nessun pagamento registrato.</td>
                    </tr>
                  ) : (
                    topTreatments.map(treatment => (
                      <tr key={treatment.name} className="bg-ivory hover:bg-ivory-dark/30 transition-colors">
                        <td className="p-4 text-graphite-light font-display">{treatment.rank}</td>
                        <td className="p-4 font-medium text-graphite">{treatment.name}</td>
                        <td className="p-4 text-graphite-light">{treatment.count}</td>
                        <td className="p-4 text-graphite-light">
                          €{treatment.revenue.toLocaleString('it-IT')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* No-Show Rate */}
        <div className="bg-ivory-dark p-6 sharp-edge">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-sm uppercase tracking-widest text-silver mb-2">No-Show Rate</div>
              <div className="flex items-center gap-3">
                <AnimatedCounter
                  value={noShowRate}
                  suffix="%"
                  className="text-5xl font-display font-light text-graphite"
                />
                <TrendingDown className={cn('w-6 h-6', noShowRate <= 10 ? 'text-emerald-600' : 'text-red-500')} />
              </div>
              <p className="text-sm text-graphite-light/70 mt-2">
                {bookings.filter(b => b.status === 'cancelled').length} prenotazioni cancellate su {bookings.length} totali
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
