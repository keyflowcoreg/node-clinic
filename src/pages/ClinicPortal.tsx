import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  LayoutDashboard, Calendar, ClipboardList, Building2, BarChart3,
  LogOut, Check, X, Clock, AlertCircle, FileText, Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { PortalCalendar } from './clinic-portal/PortalCalendar';
import { PortalBookings } from './clinic-portal/PortalBookings';
import { PortalProfile } from './clinic-portal/PortalProfile';
import { PortalReport } from './clinic-portal/PortalReport';

type TabId = 'dashboard' | 'calendario' | 'prenotazioni' | 'profilo' | 'report';

const MOCK_TODAY = [
  {
    id: 'b1',
    patient: 'John Doe',
    treatment: 'Tossina Botulinica',
    time: '09:00',
    status: 'confirmed' as const,
    deposit: '€50',
    balance: '€300'
  },
  {
    id: 'b2',
    patient: 'Alice Smith',
    treatment: 'Filler Dermici',
    time: '10:30',
    status: 'pending_confirmation' as const,
    deposit: '€50',
    balance: '€400'
  },
  {
    id: 'b3',
    patient: 'Marco Rossi',
    treatment: 'Bioremodellamento Profhilo',
    time: '14:00',
    status: 'confirmed' as const,
    deposit: '€50',
    balance: '€250'
  }
];

const MOCK_REVIEWS = [
  {
    id: 'r1',
    patient: 'Laura B.',
    initial: 'LB',
    rating: 5,
    text: 'Esperienza eccellente. Staff professionale e ambiente curato nei minimi dettagli. Il trattamento ha superato le mie aspettative.',
    date: '3 giorni fa'
  },
  {
    id: 'r2',
    patient: 'Giuseppe M.',
    initial: 'GM',
    rating: 4,
    text: 'Molto soddisfatto del risultato. Unica nota: i tempi di attesa potrebbero essere ridotti. Consigliato.',
    date: '1 settimana fa'
  }
];

const NAV_ITEMS: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calendario', label: 'Calendario', icon: Calendar },
  { id: 'prenotazioni', label: 'Prenotazioni', icon: ClipboardList },
  { id: 'profilo', label: 'Profilo Clinica', icon: Building2 },
  { id: 'report', label: 'Report', icon: BarChart3 },
];

export function ClinicPortal() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const clinicName = user?.clinicName ?? 'La Tua Clinica';

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-graphite text-ivory border-r border-graphite-light shrink-0">
        <div className="p-8 border-b border-graphite-light">
          <div className="w-16 h-16 bg-ivory text-graphite rounded-full flex items-center justify-center text-2xl font-display mb-4">
            {user?.avatar ?? 'NC'}
          </div>
          <h2 className="font-display text-xl text-ivory">{clinicName}</h2>
          <p className="text-sm text-silver">Portale Partner</p>
        </div>

        <nav className="p-4 space-y-2">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium uppercase tracking-widest transition-colors sharp-edge ${
                activeTab === item.id ? 'bg-ivory/10 text-ivory' : 'text-silver hover:bg-graphite-light hover:text-ivory'
              }`}
            >
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-graphite-light">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium uppercase tracking-widest text-red-400 hover:bg-red-900/20 transition-colors sharp-edge"
          >
            <LogOut className="w-4 h-4" /> Esci
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          key={activeTab}
        >
          {activeTab === 'dashboard' && (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                  <h1 className="text-3xl font-display font-light text-graphite mb-2">{clinicName}</h1>
                  <p className="text-graphite-light/70">{new Date().toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium uppercase tracking-widest text-silver mb-1">Entrate Previste Oggi</div>
                  <div className="text-3xl font-display font-light text-graphite">€950</div>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
                <div className="bg-white border border-silver/20 p-6 sharp-edge">
                  <div className="text-sm font-medium uppercase tracking-widest text-silver mb-2">Prenotazioni Settimana</div>
                  <AnimatedCounter value={18} className="text-4xl font-display font-light text-graphite" />
                </div>
                <div className="bg-white border border-silver/20 p-6 sharp-edge">
                  <div className="text-sm font-medium uppercase tracking-widest text-silver mb-2">No-Show</div>
                  <AnimatedCounter value={2} className="text-4xl font-display font-light text-graphite" />
                </div>
                <div className="bg-white border border-silver/20 p-6 sharp-edge">
                  <div className="text-sm font-medium uppercase tracking-widest text-silver mb-2">Rating</div>
                  <div className="text-4xl font-display font-light text-graphite flex items-baseline gap-2">
                    <AnimatedCounter value={4.9} decimals={1} className="text-4xl font-display font-light text-graphite" />
                    <span className="text-sm text-silver font-normal">/5</span>
                  </div>
                </div>
                <div className="bg-white border border-silver/20 p-6 sharp-edge">
                  <div className="text-sm font-medium uppercase tracking-widest text-silver mb-2">Fatturato Mese</div>
                  <AnimatedCounter value={4200} prefix="€" className="text-4xl font-display font-light text-graphite" />
                </div>
              </div>

              {/* Appuntamenti di Oggi */}
              <h2 className="text-xl font-display font-medium text-graphite mb-6">Appuntamenti di Oggi</h2>
              <div className="space-y-4 mb-12">
                {MOCK_TODAY.map((apt, i) => (
                  <motion.div key={apt.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay: i*0.1}} className={`bg-white border p-6 sharp-edge flex flex-col md:flex-row justify-between gap-6 transition-colors ${
                    apt.status === 'pending_confirmation' ? 'border-yellow-500/50 bg-yellow-50/30' : 'border-silver/20 hover:border-graphite/30'
                  }`}>

                    <div className="flex items-start gap-6">
                      <div className="text-center shrink-0 w-20">
                        <div className="text-sm font-medium uppercase tracking-widest text-silver mb-1">Ora</div>
                        <div className="text-2xl font-display font-light text-graphite">{apt.time}</div>
                      </div>

                      <div className="border-l border-silver/20 pl-6">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-display font-medium text-graphite">{apt.patient}</h3>
                          {apt.status === 'pending_confirmation' && (
                            <span className="text-[10px] font-medium uppercase tracking-widest bg-yellow-100 text-yellow-800 px-2 py-1 sharp-edge">
                              Da Confermare
                            </span>
                          )}
                        </div>
                        <p className="text-graphite-light/70 mb-2">{apt.treatment}</p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-silver">Deposito: <span className="text-graphite font-medium">{apt.deposit} (Pagato)</span></span>
                          <span className="text-silver">Saldo: <span className="text-graphite font-medium">{apt.balance} (Da Pagare)</span></span>
                        </div>
                      </div>
                    </div>

                    <div className="md:text-right flex flex-row md:flex-col justify-end gap-3 border-t md:border-t-0 border-silver/20 pt-4 md:pt-0">
                      {apt.status === 'pending_confirmation' ? (
                        <>
                          <button className="bg-graphite text-ivory px-6 py-2 text-xs font-medium uppercase tracking-widest hover:bg-graphite-light transition-colors sharp-edge flex items-center justify-center gap-2">
                            <Check className="w-4 h-4" /> Conferma
                          </button>
                          <button className="bg-white border border-silver/30 text-graphite px-6 py-2 text-xs font-medium uppercase tracking-widest hover:border-graphite transition-colors sharp-edge flex items-center justify-center gap-2">
                            <X className="w-4 h-4" /> Rifiuta
                          </button>
                        </>
                      ) : (
                        <button className="bg-ivory-dark text-graphite px-6 py-2 text-xs font-medium uppercase tracking-widest hover:bg-silver-light transition-colors sharp-edge flex items-center justify-center gap-2">
                          <FileText className="w-4 h-4" /> Dettagli
                        </button>
                      )}
                    </div>

                  </motion.div>
                ))}
              </div>

              {/* Recensioni Recenti */}
              <h2 className="text-xl font-display font-medium text-graphite mb-6">Recensioni Recenti</h2>
              <div className="space-y-4">
                {MOCK_REVIEWS.map(review => (
                  <div key={review.id} className="bg-white border border-silver/20 p-6 sharp-edge">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-graphite text-ivory font-medium text-sm flex items-center justify-center sharp-edge shrink-0">
                        {review.initial}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-graphite">{review.patient}</h4>
                          <span className="text-xs text-silver">{review.date}</span>
                        </div>
                        <div className="flex items-center gap-0.5 mb-3">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'fill-warm text-warm' : 'text-silver/30'}`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-graphite-light/70 leading-relaxed">{review.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'calendario' && <PortalCalendar />}
          {activeTab === 'prenotazioni' && <PortalBookings />}
          {activeTab === 'profilo' && <PortalProfile />}
          {activeTab === 'report' && <PortalReport />}
        </motion.div>
      </div>
    </div>
  );
}
