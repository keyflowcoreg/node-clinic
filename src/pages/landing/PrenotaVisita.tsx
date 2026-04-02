import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  ShieldAlert,
  Phone,
  Search,
  Calendar,
  CheckCircle2,
  Star,
  MapPin,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { LandingLayout } from '../../components/layout/LandingLayout';
import { cn } from '../../lib/utils';
import { IMAGES } from '../../lib/images';
import { AnimatedCard } from '../../components/ui/AnimatedCard';
import { TestimonialSlider } from '../../components/ui/TestimonialSlider';
import { MultiStepForm } from '../../components/ui/MultiStepForm';
import { ParallaxHero } from '../../components/ui/ParallaxHero';
import { ScrollReveal } from '../../components/ui/ScrollReveal';
import { fadeInUp } from '../../hooks/useAnimations';
import { store } from '../../services/store';
import type { LeadSource } from '../../types/database';

const PAIN_POINTS = [
  {
    icon: Clock,
    title: 'Tempi di Attesa Infiniti',
    description: 'Dimentica le code telefoniche. Prenota in 2 minuti, conferma immediata.',
  },
  {
    icon: ShieldAlert,
    title: 'Cliniche Non Verificate',
    description: 'Ogni clinica e selezionata e verificata dal nostro team medico.',
  },
  {
    icon: Phone,
    title: 'Prenotazioni Solo Telefoniche',
    description: 'Prenota online 24/7, gestisci tutto dalla tua area personale.',
  },
];

const STEPS = [
  { icon: Search, label: 'Cerca', description: 'Trova il trattamento e la clinica ideale' },
  { icon: Calendar, label: 'Scegli', description: 'Seleziona data, ora e conferma lo slot' },
  { icon: CheckCircle2, label: 'Conferma', description: 'Versa il deposito e ricevi la conferma' },
];

const TESTIMONIALS = [
  {
    quote: 'Prenotato un filler in 3 minuti, servizio impeccabile.',
    name: 'Valentina M.',
    city: 'Milano',
    rating: 5,
  },
  {
    quote: 'Finalmente trasparenza sui prezzi e disponibilita reale.',
    name: 'Andrea L.',
    city: 'Roma',
    rating: 5,
  },
  {
    quote: 'Ho trovato una clinica eccellente vicino a casa.',
    name: 'Sara G.',
    city: 'Firenze',
    rating: 4,
  },
];

const FEATURED_CLINICS = [
  {
    id: '1',
    name: 'Aesthetic Milano',
    rating: 4.9,
    availability: 'Prima disponibilita: Oggi, 15:30',
    price: 179,
    link: '/clinic/1',
  },
  {
    id: '2',
    name: 'MedEstetica Roma',
    rating: 4.8,
    availability: 'Prima disponibilita: Dom 16 Mar, 10:00',
    price: 200,
    link: '/clinic/2',
  },
  {
    id: '3',
    name: 'Beauty Lab Firenze',
    rating: 4.7,
    availability: 'Prima disponibilita: Lun 17 Mar, 14:00',
    price: 150,
    link: '/clinic/3',
  },
];

const TREATMENTS = [
  'Filler Labbra',
  'Botox',
  'Rinomodellamento',
  'Zigomi',
  'Biostimolazione',
  'Peeling',
  'Altro',
];

const FAQ_ITEMS = [
  {
    question: 'Quanto costa una visita?',
    answer:
      'I prezzi variano in base al trattamento e alla clinica. Su Node Clinic trovi sempre il prezzo trasparente prima di prenotare, a partire da \u20AC120.',
  },
  {
    question: 'Posso cancellare la prenotazione?',
    answer:
      'Si, puoi cancellare gratuitamente fino a 48 ore prima. Il deposito viene rimborsato integralmente.',
  },
  {
    question: 'I miei dati sono al sicuro?',
    answer:
      'Assolutamente. Utilizziamo crittografia end-to-end e non condividiamo i tuoi dati con terze parti.',
  },
  {
    question: 'In quanto tempo ricevo la conferma?',
    answer:
      'La conferma e immediata per le prenotazioni online. Per le richieste tramite form, il nostro team ti contatta entro 24 ore.',
  },
];

export function PrenotaVisita() {
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const scrollToForm = useCallback(() => {
    document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <LandingLayout stickyCta={{ text: 'Prenota Ora', onClick: scrollToForm }}>
      {/* Hero */}
      <ParallaxHero imageUrl={IMAGES.heroes.prenota} overlayOpacity={0.75}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-light leading-tight tracking-tighter mb-6 text-graphite">
              Prenota la Tua Visita <br />
              <span className="font-semibold">di Medicina Estetica</span>
            </h1>
            <p className="text-lg md:text-xl text-graphite-light/70 font-light leading-relaxed mb-10 max-w-xl">
              Cliniche selezionate, medici abilitati, conferma immediata.
            </p>
            <button
              onClick={scrollToForm}
              className="bg-graphite text-ivory px-10 py-4 font-medium text-sm uppercase tracking-widest sharp-edge hover:bg-graphite-light transition-colors inline-flex items-center gap-2"
            >
              Prenota Ora <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Trust Strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 flex flex-col sm:flex-row gap-6 sm:gap-12 text-sm text-graphite-light/50 uppercase tracking-widest"
          >
            <span>300+ cliniche partner</span>
            <span className="hidden sm:block">|</span>
            <span>Medici abilitati</span>
            <span className="hidden sm:block">|</span>
            <span>Prenotazione in 2 minuti</span>
          </motion.div>
        </div>
      </ParallaxHero>

      {/* Pain Points */}
      <section className="py-20 lg:py-28 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PAIN_POINTS.map((item, i) => (
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

      {/* Come Funziona */}
      <section className="py-20 lg:py-28 bg-ivory-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            {...fadeInUp}
            className="text-3xl font-display font-light tracking-tight text-graphite mb-16 text-center"
          >
            Come Funziona
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-px bg-silver/30" />

            {STEPS.map((step, i) => (
              <motion.div
                key={step.label}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: i * 0.15 }}
                className="flex flex-col items-center text-center relative"
              >
                <div className="w-20 h-20 bg-graphite text-ivory flex items-center justify-center sharp-edge mb-6 relative z-10">
                  <span className="font-display text-2xl font-light">{i + 1}</span>
                </div>
                <step.icon className="w-5 h-5 text-silver mb-3" />
                <h3 className="font-display text-lg font-medium text-graphite mb-2 uppercase tracking-widest text-sm">
                  {step.label}
                </h3>
                <p className="text-sm text-graphite-light/70 font-light max-w-xs">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 lg:py-28 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            {...fadeInUp}
            className="text-3xl font-display font-light tracking-tight text-graphite mb-16 text-center"
          >
            Cosa Dicono i Pazienti
          </motion.h2>

          <TestimonialSlider
            testimonials={TESTIMONIALS.map(t => ({
              name: `${t.name}, ${t.city}`,
              rating: t.rating,
              text: t.quote,
            }))}
          />
        </div>
      </section>

      {/* Cliniche in Evidenza */}
      <section className="py-20 lg:py-28 bg-ivory-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            {...fadeInUp}
            className="text-3xl font-display font-light tracking-tight text-graphite mb-16 text-center"
          >
            Cliniche in Evidenza
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURED_CLINICS.map((clinic, i) => (
              <AnimatedCard
                key={clinic.id}
                hover
                delay={i * 0.1}
                className="p-8 bg-white"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-medium text-graphite">
                    {clinic.name}
                  </h3>
                  <div className="flex items-center gap-1 bg-graphite text-ivory px-2 py-1 sharp-edge">
                    <Star className="w-3 h-3 fill-ivory text-ivory" />
                    <span className="text-xs font-medium">{clinic.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-silver mb-4 uppercase tracking-wider">
                  {clinic.availability}
                </p>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-xs text-silver uppercase tracking-widest">da</span>
                    <span className="text-2xl font-display font-light text-graphite ml-2">
                      &euro;{clinic.price}
                    </span>
                  </div>
                  <Link
                    to={clinic.link}
                    className="text-xs font-medium uppercase tracking-widest text-graphite hover:text-silver transition-colors inline-flex items-center gap-1"
                  >
                    Vedi disponibilita <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Form */}
      <section id="form" className="py-20 lg:py-28 bg-ivory scroll-mt-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl font-display font-light tracking-tight text-graphite mb-4 text-center">
              Richiedi il Tuo Appuntamento
            </h2>
            <p className="text-sm text-silver text-center mb-12">
              Compila il form e verrai contattato entro 24 ore.
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
                  Il nostro team ti contattera entro 24 ore per confermare l&apos;appuntamento.
                </p>
              </motion.div>
            ) : (
              <MultiStepForm
                steps={[
                  {
                    title: 'Informazioni Personali',
                    description: 'I tuoi dati di contatto',
                    fields: [
                      { name: 'nome', label: 'Nome', type: 'text', placeholder: 'Il tuo nome', required: true },
                      { name: 'email', label: 'Email', type: 'email', placeholder: 'email@esempio.it', required: true },
                      { name: 'telefono', label: 'Telefono', type: 'tel', placeholder: '+39 333 123 4567', required: true },
                    ],
                  },
                  {
                    title: 'Dettagli Trattamento',
                    description: 'Cosa stai cercando',
                    fields: [
                      { name: 'trattamento', label: 'Trattamento', type: 'select', required: true, options: TREATMENTS.map(t => ({ value: t, label: t })) },
                      { name: 'citta', label: 'Citta', type: 'text', placeholder: 'La tua citta', required: true },
                      { name: 'note', label: 'Note (opzionale)', type: 'textarea', placeholder: 'Informazioni aggiuntive...' },
                    ],
                  },
                ]}
                onSubmit={(data) => {
                  store.leads.create({
                    source: 'prenota-visita' as LeadSource,
                    name: String(data.nome || ''),
                    email: String(data.email || ''),
                    phone: String(data.telefono || ''),
                    city: String(data.citta || ''),
                    treatment: String(data.trattamento || ''),
                    message: String(data.note || ''),
                  });
                  setSubmitted(true);
                }}
                submitLabel="Richiedi Appuntamento"
              />
            )}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28 bg-ivory-dark mb-0 lg:mb-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            {...fadeInUp}
            className="text-3xl font-display font-light tracking-tight text-graphite mb-12 text-center"
          >
            Domande Frequenti
          </motion.h2>

          <div className="space-y-0 border-t border-silver/20">
            {FAQ_ITEMS.map((item, i) => (
              <motion.div
                key={i}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: i * 0.05 }}
                className="border-b border-silver/20"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-6 text-left group"
                >
                  <span className="font-display text-base font-medium text-graphite group-hover:text-silver transition-colors pr-4">
                    {item.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <ChevronDown className="w-5 h-5 text-silver shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-graphite-light/70 font-light leading-relaxed pb-6">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom spacer for sticky CTA on mobile */}
      <div className="h-20 lg:hidden" />
    </LandingLayout>
  );
}
