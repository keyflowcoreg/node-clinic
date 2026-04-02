import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Users, Target, ExternalLink } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Pagination } from '../../components/admin/Pagination';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { cn } from '../../lib/utils';
import { store } from '../../services/store';
import type { Lead, LeadSource } from '../../types/database';

const SOURCES: { key: LeadSource; label: string; url: string }[] = [
  { key: 'prenota-visita', label: 'Prenota Visita', url: '/lp/prenota-visita' },
  { key: 'diventa-partner', label: 'Diventa Partner', url: '/lp/diventa-partner' },
  { key: 'trattamenti', label: 'Trattamenti', url: '/lp/trattamenti' },
  { key: 'contact', label: 'Contatto', url: '/contact' },
  { key: 'exit-intent', label: 'Exit Intent', url: '-' },
  { key: 'chatbot', label: 'Chatbot', url: '-' },
  { key: 'bio', label: 'Link in Bio', url: '/lp/bio' },
  { key: 'whatsapp', label: 'WhatsApp', url: '-' },
];

const SOURCE_LABEL: Record<LeadSource, string> = Object.fromEntries(
  SOURCES.map((s) => [s.key, s.label])
) as Record<LeadSource, string>;

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

function getLast7DaysLeads(leads: Lead[]): { label: string; value: number }[] {
  const days: { label: string; value: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = getDateNDaysAgo(i);
    const dayStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' });
    const count = leads.filter((l) => l.created_at.startsWith(dayStr)).length;
    days.push({ label, value: count });
  }
  return days;
}

const PER_PAGE = 15;

export function AdminLandingPages() {
  const allLeads = useMemo<Lead[]>(() => {
    return store.leads.getAll().sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, []);

  const [currentPage, setCurrentPage] = useState(1);

  // KPI calculations
  const totalLeads = allLeads.length;

  const leadCountBySource = useMemo(() => {
    const counts: Partial<Record<LeadSource, number>> = {};
    for (const lead of allLeads) {
      counts[lead.source] = (counts[lead.source] ?? 0) + 1;
    }
    return counts;
  }, [allLeads]);

  const activeSources = SOURCES.filter((s) => (leadCountBySource[s.key] ?? 0) > 0).length;

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const leadsThisMonth = allLeads.filter((l) => l.created_at.startsWith(thisMonth)).length;

  // Chart
  const chartData = useMemo(() => getLast7DaysLeads(allLeads), [allLeads]);
  const maxChartValue = Math.max(...chartData.map((d) => d.value), 1);

  // Pagination for recent leads (last 20 shown, paginated)
  const recentLeads = allLeads.slice(0, 20);
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * PER_PAGE;
    return recentLeads.slice(start, start + PER_PAGE);
  }, [recentLeads, currentPage]);

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-display font-light text-graphite mb-2">Landing Pages</h1>
            <p className="text-graphite-light/70">Sorgenti, lead acquisiti e performance per canale.</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Lead Totali', value: totalLeads, icon: Users },
            { label: 'Fonti Attive', value: activeSources, icon: Target },
            { label: 'Lead Questo Mese', value: leadsThisMonth, icon: Users },
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

        {/* Sources Table */}
        <div className="bg-white border border-silver/20 sharp-edge overflow-x-auto mb-10">
          <div className="p-6 border-b border-silver/20">
            <h2 className="text-sm font-medium uppercase tracking-widest text-silver">Sorgenti</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-silver/20">
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Sorgente</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">URL</th>
                <th className="text-right px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Lead</th>
              </tr>
            </thead>
            <tbody>
              {SOURCES.map((source, i) => {
                const count = leadCountBySource[source.key] ?? 0;
                return (
                  <motion.tr
                    key={source.key}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.2 }}
                    className={cn(
                      'border-b border-silver/10 hover:bg-ivory/50 transition-colors',
                      count === 0 && 'opacity-50'
                    )}
                  >
                    <td className="px-6 py-4 font-medium text-graphite">{source.label}</td>
                    <td className="px-6 py-4 text-graphite-light/70">
                      {source.url !== '-' ? (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-graphite hover:text-warm transition-colors font-mono text-xs"
                        >
                          {source.url}
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      ) : (
                        <span className="text-silver font-mono text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn(
                        'inline-block px-3 py-1 text-xs font-medium sharp-edge',
                        count > 0 ? 'bg-warm/20 text-warm' : 'bg-silver/10 text-silver'
                      )}>
                        {count}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Chart: Lead Ultimi 7 Giorni */}
        <div className="bg-white border border-silver/20 sharp-edge p-6 mb-10">
          <h2 className="text-sm font-medium uppercase tracking-widest text-silver mb-6">Lead Ultimi 7 Giorni</h2>
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
                  {day.value > 0 ? day.value : ''}
                </span>
                <div
                  className="w-full bg-graphite sharp-edge min-h-[4px] transition-all"
                  style={{ height: `${Math.max((day.value / maxChartValue) * 100, 3)}%` }}
                />
                <span className="text-xs text-silver uppercase tracking-wider">{day.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Leads Table */}
        <div className="bg-white border border-silver/20 sharp-edge overflow-x-auto">
          <div className="p-6 border-b border-silver/20">
            <h2 className="text-sm font-medium uppercase tracking-widest text-silver">Lead Recenti</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-silver/20">
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Nome</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Email</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Sorgente</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Trattamento</th>
                <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest text-silver">Data</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLeads.map((lead, i) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  className="border-b border-silver/10 hover:bg-ivory/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-graphite">{lead.name}</td>
                  <td className="px-6 py-4 text-graphite-light/70">{lead.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 text-xs font-medium uppercase tracking-wider sharp-edge bg-silver/10 text-graphite">
                      {SOURCE_LABEL[lead.source] ?? lead.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-graphite-light/70">{lead.treatment ?? '—'}</td>
                  <td className="px-6 py-4 text-graphite-light/70">{formatDate(lead.created_at)}</td>
                </motion.tr>
              ))}
              {recentLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-silver">
                    Nessun lead registrato.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="px-6 pb-6">
            <Pagination
              total={recentLeads.length}
              perPage={PER_PAGE}
              currentPage={currentPage}
              onChange={setCurrentPage}
            />
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
