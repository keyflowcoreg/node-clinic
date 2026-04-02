import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Eye,
  Settings,
  Banknote,
  UserCheck,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Quote,
  ArrowRight,
} from 'lucide-react';
import { LandingLayout } from '../../components/layout/LandingLayout';
import { IMAGES } from '../../lib/images';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { AnimatedCard } from '../../components/ui/AnimatedCard';
import { MultiStepForm } from '../../components/ui/MultiStepForm';
import { ParallaxHero } from '../../components/ui/ParallaxHero';
import { fadeInUp } from '../../hooks/useAnimations';
import { store } from '../../services/store';
import type { LeadSource } from '../../types/database';

const KPI_ITEMS = [
  { value: 1200, suffix: '+', label: 'Pazienti Attivi' },
  { value: 24, suffix: '', label: 'Cliniche Partner' },
  { value: 142, suffix: '', label: 'Prenotazioni/Mese' },
  { value: 98, suffix: '%', label: 'Tasso Soddisfazione' },
];

const VANTAGGI = [
  {
    icon: Eye,
    title: 'Visibilita Premium',
    description: 'Il tuo profilo visibile a migliaia di pazienti in cerca di medicina estetica.',
  },
  {
    icon: Settings,
    title: 'Gestione Automatizzata',
    description: 'Calendario, prenotazioni e pagamenti gestiti in un\u2019unica piattaforma.',
  },
  {
    icon: Banknote,
    title: 'Depositi Garantiti',
    description: 'Riduci i no-show con il sistema di deposito cauzionale integrato.',
  },
];

const PARTNER_STEPS = [
  { label: 'Registrazione', description: 'Compila il form con i dati della tua clinica' },
  { label: 'Verifica', description: 'Il nostro team valuta i requisiti e le certificazioni' },
  { label: 'Pubblicazione', description: 'Il tuo profilo va online con disponibilita e trattamenti' },
  { label: 'Primo Paziente', description: 'Inizia a ricevere prenotazioni dalla piattaforma' },
];

const REQUISITI = [
  {
    icon: UserCheck,
    title: 'Medici Abilitati',
    description: 'Tutti i professionisti devono essere iscritti all\u2019Ordine dei Medici.',
  },
  {
    icon: Building2,
    title: 'Struttura Verificata',
    description: 'La clinica deve rispettare gli standard sanitari e di sicurezza vigenti.',
  },
  {
    icon: CalendarCheck,
    title: 'Disponibilita Settimanale',
    description: 'Almeno 3 giorni di disponibilita settimanale sulla piattaforma.',
  },
];

const SPECIALITA = [
  'Medicina Estetica',
  'Dermatologia',
  'Chirurgia Plastica',
  'Odontoiatria Estetica',
  'Altro',
];


export function DiventaPartner() {
  const [submitted, setSubmitted] = useState(false);

  const scrollToForm = useCallback(() => {
    document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <LandingLayout>
      {/* Hero */}
      <ParallaxHero imageUrl={IMAGES.heroes.partner} overlayOpacity={0.75}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-light leading-tight tracking-tighter mb-6 text-graphite">
              Aumenta i Tuoi Pazienti <br />
              <span className="font-semibold">del 40%</span>
            </h1>
            <p className="text-lg md:text-xl text-graphite-light/70 font-light leading-relaxed mb-10 max-w-xl">
              Unisciti alla rete di cliniche partner di Node Clinic.
            </p>
            <button
              onClick={scrollToForm}
              className="bg-graphite text-ivory px-10 py-4 font-medium text-sm uppercase tracking-widest sharp-edge hover:bg-graphite-light transition-colors inline-flex items-center gap-2"
            >
              Diventa Partner <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </ParallaxHero>

      {/* KPI Strip */}
      <section className="py-16 bg-ivory-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {KPI_ITEMS.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: i * 0.1 }}
                className="text-center"
              >
                <AnimatedCounter
                  value={kpi.value}
                  suffix={kpi.suffix}
                  className="text-3xl md:text-4xl font-display font-light text-graphite"
                />
                <div className="text-xs uppercase tracking-widest text-silver mt-2">
                  {kpi.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vantaggi */}
      <section className="py-20 lg:py-28 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            {...fadeInUp}
            className="text-3xl font-display font-light tracking-tight text-graphite mb-16 text-center"
          >
            Perche Diventare Partner
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {VANTAGGI.map((item, i) => (
              <AnimatedCard
                key={item.title}
                hover
                delay={i * 0.1}
                className="p-8 bg-white"
              >
                <item.icon className="w-8 h-8 text-graphite mb-6" strokeWidth={1.5} />
                <h3 className="font-display text-xl font-medium mb-3 text-graphite">
                  {item.title}
                </h3>
                <p className="text-sm text-graphite-light/70 font-light leading-relaxed">
                  {item.description}
                </p>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Come Funziona - 4 Steps */}
      <section className="py-20 lg:py-28 bg-ivory-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            {...fadeInUp}
            className="text-3xl font-display font-light tracking-tight text-graphite mb-16 text-center"
          >
            Come Funziona
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden lg:block absolute top-10 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-px bg-silver/30" />

            {PARTNER_STEPS.map((step, i) => (
              <motion.div
                key={step.label}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: i * 0.12 }}
                className="flex flex-col items-center text-center relative"
              >
                <div className="w-20 h-20 bg-graphite text-ivory flex items-center justify-center sharp-edge mb-6 relative z-10">
                  <span className="font-display text-2xl font-light">{i + 1}</span>
                </div>
                <h3 className="font-display text-sm font-medium text-graphite mb-2 uppercase tracking-widest">
                  {step.label}
                </h3>
                <p className="text-sm text-graphite-light/70 font-light max-w-[200px]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonianza */}
      <section className="py-20 lg:py-28 bg-ivory">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeInUp}
            className="bg-ivory-dark border border-silver/20 border-l-4 border-l-warm p-10 md:p-16 sharp-edge relative"
          >
            <Quote className="w-12 h-12 text-silver/30 mb-8" strokeWidth={1} />
            <blockquote className="text-xl md:text-2xl font-display font-light text-graphite leading-relaxed mb-8 italic">
              &ldquo;Da quando siamo su Node Clinic, le prenotazioni sono aumentate del 35%.
              La gestione e semplice e il team di supporto e eccezionale.&rdquo;
            </blockquote>
            <div>
              <p className="font-display font-semibold text-graphite">
                Dr. Alessandro Ricci
              </p>
              <p className="text-xs uppercase tracking-widest text-silver mt-1">
                Direttore Clinica BeautyMed Milano
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Requisiti */}
      <section className="py-20 lg:py-28 bg-ivory-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            {...fadeInUp}
            className="text-3xl font-display font-light tracking-tight text-graphite mb-16 text-center"
          >
            Requisiti
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {REQUISITI.map((item, i) => (
              <AnimatedCard
                key={item.title}
                hover
                delay={i * 0.1}
                className="p-8 bg-white"
              >
                <item.icon className="w-8 h-8 text-graphite mb-6" strokeWidth={1.5} />
                <h3 className="font-display text-xl font-medium mb-3 text-graphite">
                  {item.title}
                </h3>
                <p className="text-sm text-graphite-light/70 font-light leading-relaxed">
                  {item.description}
                </p>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Form B2B */}
      <section id="form" className="py-20 lg:py-28 bg-ivory scroll-mt-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl font-display font-light tracking-tight text-graphite mb-4 text-center">
              Richiedi Informazioni
            </h2>
            <p className="text-sm text-silver text-center mb-12">
              Compila il form e il nostro team ti contattera entro 48 ore.
            </p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="border border-silver/20 p-12 sharp-edge bg-white text-center"
              >
                <CheckCircle2 className="w-12 h-12 text-graphite mx-auto mb-6" />
                <h3 className="font-display text-2xl font-light text-graphite mb-3">
                  Richiesta Inviata
                </h3>
                <p className="text-sm text-silver font-light">
                  Il nostro team ti contattera entro 48 ore per discutere i dettagli della partnership.
                </p>
              </motion.div>
            ) : (
              <MultiStepForm
                steps={[
                  {
                    title: 'Informazioni Clinica',
                    description: 'I dati della tua struttura',
                    fields: [
                      { name: 'nomeClinica', label: 'Nome Clinica', type: 'text', placeholder: 'Nome della clinica', required: true },
                      { name: 'responsabile', label: 'Responsabile', type: 'text', placeholder: 'Nome e cognome', required: true },
                    ],
                  },
                  {
                    title: 'Contatti e Specialita',
                    description: 'Come contattarti e cosa offri',
                    fields: [
                      { name: 'email', label: 'Email', type: 'email', placeholder: 'email@clinica.it', required: true },
                      { name: 'telefono', label: 'Telefono', type: 'tel', placeholder: '+39 02 123 4567', required: true },
                      { name: 'citta', label: 'Citta', type: 'text', placeholder: 'Citta della clinica', required: true },
                      { name: 'specialita', label: 'Specialita', type: 'select', required: true, options: SPECIALITA.map(s => ({ value: s, label: s })) },
                    ],
                  },
                ]}
                onSubmit={(data) => {
                  store.leads.create({
                    source: 'diventa-partner' as LeadSource,
                    name: String(data.responsabile || ''),
                    email: String(data.email || ''),
                    phone: String(data.telefono || ''),
                    city: String(data.citta || ''),
                    company: String(data.nomeClinica || ''),
                    treatment: String(data.specialita || ''),
                  });
                  setSubmitted(true);
                }}
                submitLabel="Richiedi Info Partnership"
              />
            )}
          </motion.div>
        </div>
      </section>
    </LandingLayout>
  );
}
