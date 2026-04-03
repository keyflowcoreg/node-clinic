import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar, Clock, MapPin, FileText, Settings, LogOut,
  Download, CreditCard, Shield, User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AnimatedCard } from '../components/ui/AnimatedCard';
import { store } from '../services/store';
import type { Booking } from '../types/database';


type ToggleProps = {
  checked: boolean;
  onChange: (val: boolean) => void;
};

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-10 items-center transition-colors duration-200 sharp-edge ${
        checked ? 'bg-warm' : 'bg-silver/40'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 bg-white sharp-edge transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

type UserProfile = {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
};

type PrivacyPrefs = {
  marketingEmail: boolean;
  whatsapp: boolean;
  smsPromotional: boolean;
};

export function UserArea() {
  const [activeTab, setActiveTab] = useState('appointments');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Documents state
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [appointments, setAppointments] = useState<Booking[]>([]);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Settings state
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: '',
    dateOfBirth: '',
  });
  const [profileSaved, setProfileSaved] = useState(false);

  const [privacy, setPrivacy] = useState<PrivacyPrefs>({
    marketingEmail: false,
    whatsapp: false,
    smsPromotional: false,
  });
  const [privacySaved, setPrivacySaved] = useState(false);

  // Load bookings and saved preferences
  useEffect(() => {
    if (!user) return;

    const bookings = store.bookings.getByUserId(user.id);
    setUserBookings(bookings);
    setAppointments(bookings);

    // Load profile from localStorage
    try {
      const savedProfile = localStorage.getItem(`nc_user_profile_${user.id}`);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile) as UserProfile);
      }
    } catch { /* ignore */ }

    // Load privacy from localStorage
    try {
      const savedPrivacy = localStorage.getItem(`nc_user_privacy_${user.id}`);
      if (savedPrivacy) {
        setPrivacy(JSON.parse(savedPrivacy) as PrivacyPrefs);
      }
    } catch { /* ignore */ }
  }, [user]);

  function handleLogout() {
    logout();
    navigate('/');
  }

  function downloadConfirmation(booking: Booking) {
    const content = [
      '========================================',
      '       NODE CLINIC - CONFERMA PRENOTAZIONE',
      '========================================',
      '',
      `Riferimento:    ${booking.id.toUpperCase()}`,
      `Data:           ${new Date(booking.date).toLocaleDateString('it-IT')}`,
      `Ora:            ${booking.time}`,
      `Trattamento:    ${booking.treatment_name ?? '-'}`,
      `Clinica:        ${booking.clinic_name ?? '-'}`,
      `Deposito:       \u20AC${booking.deposit_amount}`,
      `Totale:         \u20AC${booking.total_amount ?? '-'}`,
      `Stato:          ${booking.status === 'confirmed' ? 'Confermato' : 'Completato'}`,
      '',
      '========================================',
      'Questo documento serve come conferma della tua prenotazione.',
      'Per modifiche o cancellazioni, contatta il nostro team concierge.',
      'concierge@nodeclinic.com | +39 02 1234 5678',
      '========================================',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conferma-${booking.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function saveProfile() {
    if (!user) return;
    localStorage.setItem(`nc_user_profile_${user.id}`, JSON.stringify(profile));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }

  function savePrivacy() {
    if (!user) return;
    localStorage.setItem(`nc_user_privacy_${user.id}`, JSON.stringify(privacy));
    setPrivacySaved(true);
    setTimeout(() => setPrivacySaved(false), 2000);
  }

  function handleReschedule(booking: Booking) {
    navigate(`/book/${booking.clinic_id}/${booking.treatment_id}`);
  }

  function handleCancel(bookingId: string) {
    setCancellingId(bookingId);
  }

  function confirmCancel() {
    if (!cancellingId) return;
    store.bookings.update(cancellingId, { status: 'cancelled' });
    setAppointments(prev =>
      prev.map(a => a.id === cancellingId ? { ...a, status: 'cancelled' } : a)
    );
    setCancellingId(null);
  }

  const documentBookings = userBookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'completed'
  );

  return (
    <div className="min-h-screen bg-ivory flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-r border-silver/20 shrink-0">
        <div className="p-8 border-b border-silver/20">
          <div className="w-16 h-16 bg-graphite text-ivory rounded-full flex items-center justify-center text-2xl font-display mb-4">
            {user?.avatar ?? '??'}
          </div>
          <h2 className="font-display text-xl text-graphite">{user?.name ?? 'Utente'}</h2>
          <p className="text-sm text-silver">{user?.email ?? ''}</p>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium uppercase tracking-widest transition-colors sharp-edge ${
              activeTab === 'appointments' ? 'bg-ivory-dark text-graphite border-l-2 border-l-warm' : 'text-silver hover:bg-silver-light/20 hover:text-graphite'
            }`}
          >
            <Calendar className="w-4 h-4" /> Appuntamenti
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium uppercase tracking-widest transition-colors sharp-edge ${
              activeTab === 'documents' ? 'bg-ivory-dark text-graphite border-l-2 border-l-warm' : 'text-silver hover:bg-silver-light/20 hover:text-graphite'
            }`}
          >
            <FileText className="w-4 h-4" /> Documenti
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium uppercase tracking-widest transition-colors sharp-edge ${
              activeTab === 'settings' ? 'bg-ivory-dark text-graphite border-l-2 border-l-warm' : 'text-silver hover:bg-silver-light/20 hover:text-graphite'
            }`}
          >
            <Settings className="w-4 h-4" /> Impostazioni
          </button>
        </nav>

        <div className="p-4 mt-auto border-t border-silver/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors sharp-edge"
          >
            <LogOut className="w-4 h-4" /> Esci
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 md:p-12">
        <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
        >
          {activeTab === 'appointments' && (
            <div>
              <h1 className="text-3xl font-display font-light text-graphite mb-8">I Tuoi Appuntamenti</h1>

              <div className="space-y-6">
                {appointments.map((apt, i) => (
                  <AnimatedCard key={apt.id} delay={i * 0.1} className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`text-xs font-medium uppercase tracking-widest px-2 py-1 ${
                            apt.status === 'confirmed' || apt.status === 'pending' ? 'bg-warm text-ivory' : apt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-silver-light text-graphite-light'
                          }`}>
                            {apt.status}
                          </span>
                          <span className="text-sm text-silver font-medium">{new Date(apt.date).toLocaleDateString('it-IT')} alle {apt.time}</span>
                        </div>

                        <h3 className="text-2xl font-display font-medium text-graphite mb-1">{apt.treatment_name}</h3>
                        <p className="text-graphite-light/70 mb-4">{apt.clinic_name}</p>

                        <p className="text-sm text-silver flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> {apt.clinic_name}
                        </p>
                      </div>

                      <div className="md:text-right flex flex-col justify-between border-t md:border-t-0 md:border-l border-silver/20 pt-4 md:pt-0 md:pl-6">
                        <div>
                          <div className="text-sm text-silver mb-1">Saldo in Clinica</div>
                          <div className="text-2xl font-display font-light text-graphite">€{(apt.total_amount ?? 0) - apt.deposit_amount}</div>
                          <div className="text-xs text-silver mt-1">Deposito: €{apt.deposit_amount} (Pagato)</div>
                        </div>

                        {(apt.status === 'pending' || apt.status === 'confirmed') && (
                          <div className="flex gap-3 mt-6">
                            <button
                              onClick={() => handleReschedule(apt)}
                              className="text-xs font-medium uppercase tracking-widest text-silver hover:text-graphite transition-colors underline decoration-silver/50 underline-offset-4">
                              Riprogramma
                            </button>
                            <button
                              onClick={() => handleCancel(apt.id)}
                              className="text-xs font-medium uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors underline decoration-red-500/50 underline-offset-4">
                              Cancella
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  </AnimatedCard>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <h1 className="text-3xl font-display font-light text-graphite mb-8">Documenti e Conferme</h1>

              {documentBookings.length === 0 ? (
                <div className="bg-white border border-silver/20 p-12 text-center sharp-edge">
                  <FileText className="w-12 h-12 text-silver mx-auto mb-4" />
                  <h3 className="font-display text-xl text-graphite mb-2">Nessun documento</h3>
                  <p className="text-graphite-light/70">Fatture e referti medici appariranno qui dopo i tuoi appuntamenti.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {documentBookings.map((booking, i) => (
                    <AnimatedCard key={booking.id} delay={i * 0.08} className="p-6">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-xs font-mono text-silver uppercase">
                              Rif. {booking.id.toUpperCase()}
                            </span>
                            <span
                              className={`text-xs font-medium uppercase tracking-widest px-2 py-0.5 ${
                                booking.status === 'confirmed'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-silver-light text-graphite-light'
                              }`}
                            >
                              {booking.status === 'confirmed' ? 'Confermato' : 'Completato'}
                            </span>
                          </div>

                          <h3 className="text-lg font-display font-medium text-graphite mb-1">
                            {booking.treatment_name ?? 'Trattamento'}
                          </h3>
                          <p className="text-sm text-graphite-light/70 mb-2">
                            {booking.clinic_name ?? 'Clinica'}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-silver">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(booking.date).toLocaleDateString('it-IT')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {booking.time}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-between gap-3">
                          <div className="text-right">
                            <div className="text-xs text-silver">Importo</div>
                            <div className="text-lg font-display text-graphite">
                              {'\u20AC'}{booking.total_amount ?? booking.deposit_amount}
                            </div>
                          </div>

                          <button
                            onClick={() => downloadConfirmation(booking)}
                            className="flex items-center gap-2 bg-graphite text-ivory px-4 py-2 text-xs font-medium uppercase tracking-widest hover:bg-graphite-light transition-colors sharp-edge"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Scarica Conferma
                          </button>
                        </div>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h1 className="text-3xl font-display font-light text-graphite mb-8">Impostazioni Account</h1>
              <div className="space-y-8 max-w-2xl">

                {/* Personal Information */}
                <div className="bg-white border border-silver/20 p-6 md:p-8 sharp-edge">
                  <div className="flex items-center gap-3 mb-6">
                    <User className="w-5 h-5 text-warm" />
                    <h4 className="font-display text-lg text-graphite">Informazioni Personali</h4>
                  </div>

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Nome</label>
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          className="w-full bg-ivory-dark border border-silver/30 p-3 sharp-edge focus:border-graphite focus:ring-0 outline-none transition-colors text-sm text-graphite"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Email</label>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="w-full bg-ivory-dark border border-silver/30 p-3 sharp-edge focus:border-graphite focus:ring-0 outline-none transition-colors text-sm text-graphite"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Telefono</label>
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          placeholder="+39 333 1234567"
                          className="w-full bg-ivory-dark border border-silver/30 p-3 sharp-edge focus:border-graphite focus:ring-0 outline-none transition-colors text-sm text-graphite placeholder:text-silver"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Data di Nascita</label>
                        <input
                          type="date"
                          value={profile.dateOfBirth}
                          onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                          className="w-full bg-ivory-dark border border-silver/30 p-3 sharp-edge focus:border-graphite focus:ring-0 outline-none transition-colors text-sm text-graphite"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-4">
                    <button
                      onClick={saveProfile}
                      className="bg-graphite text-ivory px-6 py-3 text-xs font-medium uppercase tracking-widest hover:bg-graphite-light transition-colors sharp-edge"
                    >
                      Salva Modifiche
                    </button>
                    {profileSaved && (
                      <span className="text-xs text-green-600 font-medium">Salvato con successo</span>
                    )}
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white border border-silver/20 p-6 md:p-8 sharp-edge">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-5 h-5 text-warm" />
                    <h4 className="font-display text-lg text-graphite">Metodi di Pagamento</h4>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-ivory-dark border border-silver/30 p-4 sharp-edge">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-7 bg-blue-900 sharp-edge flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">VISA</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-graphite">Visa terminante in 4242</p>
                          <p className="text-xs text-silver">Scade 12/28</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium uppercase tracking-widest text-warm">Principale</span>
                    </div>

                    <div className="flex items-center justify-between bg-ivory-dark border border-silver/30 p-4 sharp-edge">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-7 bg-orange-600 sharp-edge flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">MC</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-graphite">Mastercard terminante in 8888</p>
                          <p className="text-xs text-silver">Scade 06/27</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => alert('Funzionalit\u00E0 in arrivo: aggiunta metodo di pagamento')}
                    className="mt-4 border border-silver/30 text-graphite px-6 py-3 text-xs font-medium uppercase tracking-widest hover:border-graphite transition-colors sharp-edge"
                  >
                    Aggiungi Metodo
                  </button>
                </div>

                {/* Privacy & Consent */}
                <div className="bg-white border border-silver/20 p-6 md:p-8 sharp-edge">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-5 h-5 text-warm" />
                    <h4 className="font-display text-lg text-graphite">Privacy e Consensi</h4>
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-graphite">Marketing Email</p>
                        <p className="text-xs text-silver mt-0.5">Ricevi offerte e novit&agrave; via email</p>
                      </div>
                      <Toggle
                        checked={privacy.marketingEmail}
                        onChange={(val) => setPrivacy({ ...privacy, marketingEmail: val })}
                      />
                    </div>

                    <div className="border-t border-silver/10" />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-graphite">Notifiche WhatsApp</p>
                        <p className="text-xs text-silver mt-0.5">Aggiornamenti su appuntamenti e promozioni</p>
                      </div>
                      <Toggle
                        checked={privacy.whatsapp}
                        onChange={(val) => setPrivacy({ ...privacy, whatsapp: val })}
                      />
                    </div>

                    <div className="border-t border-silver/10" />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-graphite">SMS Promozionali</p>
                        <p className="text-xs text-silver mt-0.5">Ricevi promozioni esclusive via SMS</p>
                      </div>
                      <Toggle
                        checked={privacy.smsPromotional}
                        onChange={(val) => setPrivacy({ ...privacy, smsPromotional: val })}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-4">
                    <button
                      onClick={savePrivacy}
                      className="bg-graphite text-ivory px-6 py-3 text-xs font-medium uppercase tracking-widest hover:bg-graphite-light transition-colors sharp-edge"
                    >
                      Salva Preferenze
                    </button>
                    {privacySaved && (
                      <span className="text-xs text-green-600 font-medium">Preferenze salvate</span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
        </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
