import { useMemo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Users, Building2, CalendarCheck } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { store } from '../../services/store';
import { cn } from '../../lib/utils';

function timeAgo(isoDate: string): string {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return 'ora';
  if (diffMin < 60) return `${diffMin} min fa`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'ora' : 'ore'} fa`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'giorno' : 'giorni'} fa`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks} ${diffWeeks === 1 ? 'settimana' : 'settimane'} fa`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} ${diffMonths === 1 ? 'mese' : 'mesi'} fa`;
}

export function AdminDashboard() {
  const bookings = store.bookings.getAll();
  const clinics = store.clinics.getAll();
  const users = store.users.getAll();
  const payments = store.payments.getAll();
  const leads = store.leads.getAll();

  const kpis = useMemo(() => {
    const totalBookings = bookings.length;
    const activeClinics = clinics.filter(c => c.status === 'active').length;
    const totalUsers = users.length;
    const pendingPartners = clinics.filter(c => c.status === 'pending').length;
    const monthRevenue = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    return { totalBookings, activeClinics, totalUsers, pendingPartners, monthRevenue };
  }, [bookings, clinics, users, payments, leads]);

  const recentActivity = useMemo(() => {
    return [...bookings]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [bookings]);

  const stats = [
    {
      label: 'Prenotazioni',
      value: kpis.totalBookings,
      icon: CalendarCheck,
      iconColor: 'text-graphite',
      trend: `${bookings.filter(b => b.status === 'confirmed').length} confermate`,
      trendColor: 'text-emerald-600',
      borderClass: '',
    },
    {
      label: 'Cliniche Attive',
      value: kpis.activeClinics,
      icon: Building2,
      iconColor: 'text-graphite',
      trend: `${clinics.length} totali in piattaforma`,
      trendColor: 'text-emerald-600',
      borderClass: '',
    },
    {
      label: 'Utenti Registrati',
      value: kpis.totalUsers,
      icon: Users,
      iconColor: 'text-graphite',
      trend: `${users.filter(u => u.role === 'user').length} pazienti`,
      trendColor: 'text-emerald-600',
      borderClass: '',
    },
    {
      label: 'Richieste Partner',
      value: kpis.pendingPartners,
      icon: Building2,
      iconColor: 'text-yellow-500',
      trend: 'Da revisionare e approvare',
      trendColor: 'text-yellow-600',
      borderClass: 'border-l-4 border-l-yellow-500',
    },
  ];

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-display font-light text-graphite mb-2">Panoramica Piattaforma</h1>
            <p className="text-graphite-light/70">Statistiche e metriche chiave di Node Clinic.</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium uppercase tracking-widest text-silver mb-1">Fatturato Totale (Mese)</div>
            <AnimatedCounter
              value={kpis.monthRevenue}
              prefix="€"
              className="text-3xl font-display font-light text-graphite"
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn('bg-white border border-silver/20 p-6 sharp-edge', stat.borderClass)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="text-sm font-medium uppercase tracking-widest text-silver">{stat.label}</div>
                  <Icon className={cn('w-5 h-5', stat.iconColor)} />
                </div>
                <AnimatedCounter
                  value={stat.value}
                  className="text-4xl font-display font-light text-graphite mb-2"
                />
                <div className={cn('text-xs flex items-center gap-1', stat.trendColor)}>
                  {stat.trendColor === 'text-emerald-600' && <TrendingUp className="w-3 h-3" />}
                  {stat.trend}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-silver/20 sharp-edge overflow-hidden">
          <div className="p-6 border-b border-silver/20">
            <h2 className="font-display text-xl text-graphite">Attività Recenti</h2>
          </div>
          <div className="divide-y divide-silver/20">
            {recentActivity.length === 0 ? (
              <div className="p-6 text-center text-silver text-sm">Nessuna prenotazione registrata.</div>
            ) : (
              recentActivity.map((booking, i) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="p-6 flex items-center justify-between hover:bg-ivory-dark/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-ivory border border-silver/30 flex items-center justify-center sharp-edge">
                      <CalendarCheck className="w-4 h-4 text-graphite" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-graphite">
                        Nuova prenotazione: {booking.treatment_name ?? '—'}
                      </p>
                      <p className="text-xs text-silver mt-1">
                        Presso {booking.clinic_name ?? '—'} • Paziente: {booking.user_name ?? '—'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-graphite">€{booking.deposit_amount} Deposito</p>
                    <p className="text-xs text-silver mt-1">{timeAgo(booking.created_at)}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
