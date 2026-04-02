import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, User, CreditCard, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { store } from '../services/store';

const STEPS = [
  { id: 'slot', label: 'Data & Ora', icon: Calendar },
  { id: 'details', label: 'I Tuoi Dati', icon: User },
  { id: 'payment', label: 'Deposito', icon: CreditCard },
  { id: 'confirm', label: 'Conferma', icon: CheckCircle2 }
];

const MOCK_SLOTS = [
  { date: '2026-03-12', times: ['09:00', '10:30', '14:00', '16:15'] },
  { date: '2026-03-13', times: ['11:00', '15:30'] },
  { date: '2026-03-14', times: ['09:30', '10:00', '11:45', '14:30', '17:00'] }
];

export function Booking() {
  const { clinicId, treatmentId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '', email: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);

  // Booking recovery
  useEffect(() => {
    const saved = localStorage.getItem('nc_booking_progress');
    if (saved) {
      try {
        const data = JSON.parse(saved) as { clinicId: string; treatmentId: string; step: number; date?: string; time?: string; savedAt: number };
        const elapsed = Date.now() - data.savedAt;
        if (elapsed > 5 * 60 * 1000 && data.clinicId === clinicId && data.treatmentId === treatmentId) {
          setShowRecovery(true);
          if (data.date) setSelectedDate(data.date);
          if (data.time) setSelectedTime(data.time);
        }
      } catch { /* ignore */ }
    }
  }, [clinicId, treatmentId]);

  // Save progress on step change
  useEffect(() => {
    if (currentStep < 3) {
      localStorage.setItem('nc_booking_progress', JSON.stringify({
        clinicId, treatmentId, step: currentStep,
        date: selectedDate, time: selectedTime, savedAt: Date.now(),
      }));
    }
  }, [currentStep, selectedDate, selectedTime, clinicId, treatmentId]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep(s => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(s => s - 1);
    } else {
      navigate(-1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Slot Selection
        return (
          <motion.div
            key="step-0"
            initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-display font-light text-graphite mb-8">Seleziona il tuo appuntamento</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                <div>
                  <h3 className="text-sm font-medium uppercase tracking-widest text-silver mb-4">Date Disponibili</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {MOCK_SLOTS.map(slot => (
                      <motion.button
                        key={slot.date}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => { setSelectedDate(slot.date); setSelectedTime(null); }}
                        className={`flex-shrink-0 w-24 h-24 flex flex-col items-center justify-center border transition-colors sharp-edge ${
                          selectedDate === slot.date
                            ? 'border-graphite bg-graphite text-ivory'
                            : 'border-silver/30 bg-white hover:border-graphite/50 text-graphite'
                        }`}
                      >
                        <span className="text-xs uppercase tracking-widest mb-1">
                          {new Date(slot.date).toLocaleDateString('it-IT', { weekday: 'short' })}
                        </span>
                        <span className="text-2xl font-display font-light">
                          {new Date(slot.date).getDate()}
                        </span>
                        <span className="text-xs text-silver mt-1">
                          {new Date(slot.date).toLocaleDateString('it-IT', { month: 'short' })}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {selectedDate && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <h3 className="text-sm font-medium uppercase tracking-widest text-silver mb-4">Orari Disponibili</h3>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-3 sm:grid-cols-4 gap-4"
                      >
                        {MOCK_SLOTS.find(s => s.date === selectedDate)?.times.map((time, idx) => (
                          <motion.button
                            key={time}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: idx * 0.06 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setSelectedTime(time)}
                            className={`py-3 text-sm font-medium transition-colors sharp-edge border ${
                              selectedTime === time
                                ? 'border-graphite bg-graphite text-ivory'
                                : 'border-silver/30 bg-white hover:border-graphite/50 text-graphite'
                            }`}
                          >
                            {time}
                          </motion.button>
                        ))}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Booking Summary Sidebar */}
              <div className="md:col-span-1">
                <div className="bg-ivory-dark p-6 sharp-edge border border-silver/20 sticky top-28">
                  <h3 className="font-display text-xl mb-6">Riepilogo Prenotazione</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between border-b border-silver/20 pb-4">
                      <span className="text-graphite-light">Trattamento</span>
                      <span className="font-medium text-right">Tossina Botulinica<br/><span className="text-xs text-silver font-normal">Aesthetic Milano</span></span>
                    </div>
                    <div className="flex justify-between border-b border-silver/20 pb-4">
                      <span className="text-graphite-light">Data & Ora</span>
                      <span className="font-medium text-right">
                        {selectedDate ? new Date(selectedDate).toLocaleDateString('it-IT') : 'Seleziona data'}<br/>
                        <span className="text-xs text-silver font-normal">{selectedTime || 'Seleziona ora'}</span>
                      </span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-graphite-light">Prezzo Totale</span>
                      <span className="font-medium">€350</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-graphite-light">Deposito Richiesto Ora</span>
                      <span className="font-medium text-lg">€50</span>
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={!selectedDate || !selectedTime}
                    className="w-full mt-8 bg-graphite text-ivory py-4 text-sm font-medium uppercase tracking-widest hover:bg-graphite-light transition-colors sharp-edge disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Continua <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 1: // User Details & OTP
        return (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
            className="max-w-2xl mx-auto space-y-8"
          >
            <h2 className="text-3xl font-display font-light text-graphite mb-8">I Tuoi Dati</h2>

            {!otpSent ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Nome</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                      className="w-full bg-white border border-silver/30 p-4 sharp-edge focus:border-graphite focus:ring-0 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Cognome</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                      className="w-full bg-white border border-silver/30 p-4 sharp-edge focus:border-graphite focus:ring-0 outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white border border-silver/30 p-4 sharp-edge focus:border-graphite focus:ring-0 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Numero di Telefono (per OTP)</label>
                  <div className="flex gap-2">
                    <select className="bg-white border border-silver/30 p-4 sharp-edge focus:border-graphite focus:ring-0 outline-none transition-colors w-24">
                      <option>+39</option>
                      <option>+44</option>
                      <option>+1</option>
                    </select>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="flex-1 bg-white border border-silver/30 p-4 sharp-edge focus:border-graphite focus:ring-0 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => setOtpSent(true)}
                    disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone}
                    className="w-full bg-graphite text-ivory py-4 text-sm font-medium uppercase tracking-widest hover:bg-graphite-light transition-colors sharp-edge disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Invia Codice di Verifica
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-ivory-dark p-6 border border-silver/20 sharp-edge text-center">
                  <ShieldCheck className="w-8 h-8 text-graphite mx-auto mb-4" />
                  <h3 className="font-display text-xl mb-2">Verifica il tuo numero</h3>
                  <p className="text-sm text-graphite-light/70 mb-6">Abbiamo inviato un codice a 6 cifre al {formData.phone}</p>

                  <input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    className="w-full max-w-xs mx-auto text-center text-2xl tracking-[0.5em] bg-white border border-silver/30 p-4 sharp-edge focus:border-graphite focus:ring-0 outline-none transition-colors"
                  />

                  <button className="text-xs font-medium uppercase tracking-widest text-silver hover:text-graphite transition-colors mt-6 underline decoration-silver/50 underline-offset-4">
                    Invia di nuovo
                  </button>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    onClick={() => setOtpSent(false)}
                    className="flex-1 bg-white border border-silver/30 text-graphite py-4 text-sm font-medium uppercase tracking-widest hover:border-graphite transition-colors sharp-edge"
                  >
                    Indietro
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={otp.length !== 6}
                    className="flex-1 bg-graphite text-ivory py-4 text-sm font-medium uppercase tracking-widest hover:bg-graphite-light transition-colors sharp-edge disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Verifica & Continua
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        );

      case 2: // Payment
        return (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
            className="max-w-2xl mx-auto space-y-8"
          >
            <h2 className="text-3xl font-display font-light text-graphite mb-8">Deposito Sicuro</h2>

            <div className="bg-ivory-dark p-8 border border-silver/20 sharp-edge">
              <div className="flex justify-between items-center mb-8 pb-8 border-b border-silver/20">
                <div>
                  <h3 className="font-display text-xl mb-1">Importo Deposito</h3>
                  <p className="text-sm text-graphite-light/70">Addebitato ora per confermare lo slot.</p>
                </div>
                <div className="text-3xl font-display font-light">€50</div>
              </div>

              <div className="space-y-6">
                {/* Simulated Stripe Element */}
                <div className="bg-white border border-silver/30 p-4 sharp-edge flex items-center gap-4">
                  <CreditCard className="w-5 h-5 text-silver" />
                  <div className="flex-1 text-sm text-silver">Numero Carta</div>
                  <div className="text-sm text-silver">MM/AA</div>
                  <div className="text-sm text-silver">CVC</div>
                </div>

                <p className="text-xs text-silver leading-relaxed">
                  Confermando la prenotazione, accetti i nostri Termini di Servizio. Il deposito è rimborsabile fino a 48 ore prima dell'appuntamento. Il saldo rimanente di €300 sarà pagato direttamente in clinica.
                </p>

                <div className="flex gap-4 pt-6">
                  <button
                    onClick={handleBack}
                    className="flex-1 bg-white border border-silver/30 text-graphite py-4 text-sm font-medium uppercase tracking-widest hover:border-graphite transition-colors sharp-edge"
                  >
                    Indietro
                  </button>
                  <button
                    onClick={handlePayment}
                    className="flex-1 bg-graphite text-ivory py-4 text-sm font-medium uppercase tracking-widest hover:bg-graphite-light transition-colors sharp-edge flex items-center justify-center gap-2"
                  >
                    Paga €50 <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3: // Confirmation
        return (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl mx-auto text-center py-12"
          >
            <div className="w-20 h-20 bg-warm text-ivory flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-4xl font-display font-light text-graphite mb-4">Prenotazione Confermata</h2>
            <p className="text-lg text-graphite-light/70 mb-12 font-light">
              Il tuo appuntamento presso Aesthetic Milano è confermato. Abbiamo inviato i dettagli a {formData.email}.
            </p>

            <div className="bg-white border border-silver/20 p-8 sharp-edge text-left mb-12">
              <h3 className="font-display text-xl mb-6 border-b border-silver/20 pb-4">Dettagli Appuntamento</h3>
              <div className="grid grid-cols-2 gap-y-6 text-sm">
                <div>
                  <span className="block text-xs font-medium uppercase tracking-widest text-silver mb-1">Data</span>
                  <span className="font-medium">{selectedDate ? new Date(selectedDate).toLocaleDateString('it-IT') : ''}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium uppercase tracking-widest text-silver mb-1">Ora</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium uppercase tracking-widest text-silver mb-1">Trattamento</span>
                  <span className="font-medium">Tossina Botulinica</span>
                </div>
                <div>
                  <span className="block text-xs font-medium uppercase tracking-widest text-silver mb-1">Saldo Rimanente</span>
                  <span className="font-medium">€300 (in clinica)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/user')}
              className="bg-graphite text-ivory px-8 py-4 text-sm font-medium uppercase tracking-widest hover:bg-graphite-light transition-colors sharp-edge"
            >
              Vai all'Area Utente
            </button>
          </motion.div>
        );
    }
  };

  // Save booking to store on payment step
  const handlePayment = () => {
    store.bookings.create({
      user_id: 'usr_001',
      user_name: `${formData.firstName} ${formData.lastName}`,
      clinic_id: clinicId || 'c1',
      clinic_name: 'Aesthetic Milano',
      treatment_id: treatmentId || 't1',
      treatment_name: 'Tossina Botulinica',
      date: selectedDate || '',
      time: selectedTime || '',
      status: 'confirmed',
      deposit_amount: 50,
      total_amount: 350,
    });
    localStorage.removeItem('nc_booking_progress');
    handleNext();
  };

  return (
    <div className="min-h-screen bg-ivory py-12 md:py-20">
      {/* Recovery Modal */}
      {showRecovery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 sharp-edge max-w-md mx-4 shadow-xl"
          >
            <h3 className="font-display text-xl mb-3 text-graphite">Prenotazione in sospeso</h3>
            <p className="text-sm text-graphite-light/70 mb-6">
              Hai una prenotazione in sospeso. Vuoi continuare da dove avevi lasciato?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowRecovery(false); }}
                className="flex-1 bg-graphite text-ivory py-3 text-sm font-medium uppercase tracking-widest sharp-edge hover:bg-graphite-light transition-colors"
              >
                Continua
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('nc_booking_progress');
                  setShowRecovery(false);
                  setSelectedDate(null);
                  setSelectedTime(null);
                  setCurrentStep(0);
                }}
                className="flex-1 border border-silver/30 text-graphite py-3 text-sm font-medium uppercase tracking-widest sharp-edge hover:border-graphite transition-colors"
              >
                Nuova
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Progress Bar */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="flex justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-silver/30 -z-10" />
            <div className="absolute top-1/2 left-0 h-px bg-warm -z-10 transition-all duration-500" style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }} />
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isPast = index < currentStep;

              return (
                <div key={step.id} className="flex flex-col items-center gap-3 bg-ivory px-4">
                  <div className={`w-10 h-10 flex items-center justify-center transition-colors duration-500 sharp-edge ${
                    isActive ? 'bg-graphite text-ivory' :
                    isPast ? 'bg-warm text-ivory' : 'bg-white border border-silver/30 text-silver'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-medium uppercase tracking-widest hidden md:block ${
                    isActive ? 'text-graphite' : 'text-silver'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="relative">
          {currentStep > 0 && currentStep < 3 && (
            <button
              onClick={handleBack}
              className="absolute -left-4 md:-left-16 top-0 p-2 text-silver hover:text-graphite transition-colors z-10"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
