import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, ArrowRight, Star, CheckCircle2, Sparkles, Clock, ChevronDown } from 'lucide-react';
import { ParallaxHero } from '../components/ui/ParallaxHero';
import { AnimatedCard } from '../components/ui/AnimatedCard';
import { TestimonialSlider } from '../components/ui/TestimonialSlider';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { SocialProofToast } from '../components/ui/SocialProofToast';
import { IMAGES } from '../lib/images';

const FEATURED_CLINICS = [
  {
    id: 'c1',
    name: 'Aesthetic Milano',
    location: 'Milano, Brera',
    rating: 4.9,
    reviews: 128,
    image: IMAGES.clinics[0],
    tags: ['Dermatologia', 'Chirurgia Plastica'],
    nextAvailable: 'Mar 14 Mar, 10:30',
    priceFrom: 179
  },
  {
    id: 'c2',
    name: 'Roma Medical Center',
    location: 'Roma, Parioli',
    rating: 4.8,
    reviews: 94,
    image: IMAGES.clinics[1],
    tags: ['Medicina Estetica', 'Laserterapia'],
    nextAvailable: 'Mer 15 Mar, 09:00',
    priceFrom: 200
  },
  {
    id: 'c3',
    name: 'Torino Health & Beauty',
    location: 'Torino, Centro',
    rating: 5.0,
    reviews: 45,
    image: IMAGES.clinics[2],
    tags: ['Anti-aging', 'Nutrizione'],
    nextAvailable: 'Gio 16 Mar, 11:00',
    priceFrom: 150
  }
];

const TREATMENTS = [
  { name: 'Filler Labbra', price: 179, duration: '30-45 min' },
  { name: 'Botox', price: 200, duration: '20-30 min' },
  { name: 'Rinomodellamento', price: 200, duration: '45-60 min' },
  { name: 'Zigomi', price: 200, duration: '30-45 min' },
  { name: 'Biostimolazione', price: 250, duration: '45 min' },
  { name: 'Peeling', price: 120, duration: '30 min' }
];

const REVIEWS = [
  {
    name: 'Giulia R.',
    quote: 'Esperienza impeccabile, dalla prenotazione al trattamento.',
    stars: 5,
    treatment: 'Filler Labbra',
    clinic: 'Aesthetic Milano'
  },
  {
    name: 'Marco S.',
    quote: 'Finalmente un servizio che mette la trasparenza al primo posto.',
    stars: 5,
    treatment: 'Botox',
    clinic: 'MedEstetica Roma'
  },
  {
    name: 'Alessia P.',
    quote: 'Prenotazione semplicissima, clinica di altissimo livello.',
    stars: 4,
    treatment: 'Biostimolazione',
    clinic: 'Beauty Lab Firenze'
  }
];

const FAQ_ITEMS = [
  {
    question: 'È necessario prenotare online?',
    answer: 'Sì, tutte le visite vengono gestite tramite prenotazione online per garantire disponibilità e ridurre i tempi di attesa.'
  },
  {
    question: 'È richiesta una caparra?',
    answer: 'Per alcuni trattamenti è previsto un deposito cauzionale, generalmente tra il 20% e il 30% del costo, rimborsabile in caso di cancellazione entro 48 ore.'
  },
  {
    question: 'Posso spostare l\'appuntamento?',
    answer: 'Sì, puoi riprogrammare gratuitamente fino a 48 ore prima dell\'appuntamento dalla tua area personale.'
  },
  {
    question: 'Cosa succede se il medico non ritiene indicato il trattamento?',
    answer: 'La caparra viene interamente rimborsata. La valutazione del medico è sempre prioritaria rispetto alla prenotazione.'
  }
];

export function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <ParallaxHero
        imageUrl={IMAGES.heroes.home}
        overlayOpacity={0.65}
        height="min-h-[85vh]"
        gradientClass="bg-gradient-to-b from-ivory/85 via-ivory/60 to-ivory/80"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36">
          <div className="max-w-3xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 border border-warm/40 px-4 py-1.5 mb-6 sharp-edge"
            >
              <span className="w-1.5 h-1.5 bg-warm sharp-edge" />
              <span className="text-xs uppercase tracking-widest font-medium text-graphite-light/80">
                La piattaforma di medicina estetica
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl md:text-7xl font-display font-light leading-tight tracking-tighter mb-4 text-graphite"
            >
              Medicina Estetica
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg md:text-xl text-graphite-light/80 mb-12 max-w-xl font-light leading-relaxed"
            >
              Trova la clinica più vicina a te
            </motion.p>

            {/* Search Box */}
            <motion.form
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={handleSearch}
              className="bg-ivory p-2 flex flex-col sm:flex-row gap-2 shadow-xl sharp-edge max-w-2xl border border-silver-light/30"
            >
              <div className="flex-1 relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-graphite-light/70" />
                <input
                  type="text"
                  placeholder="Città, CAP o trattamento"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 text-graphite placeholder:text-graphite-light/60 outline-none text-lg"
                />
              </div>
              <button
                type="submit"
                className="bg-graphite text-ivory px-8 py-4 font-medium tracking-wide uppercase text-sm hover:bg-graphite-light transition-colors sharp-edge flex items-center justify-center gap-2"
              >
                Trova disponibilità <ArrowRight className="w-4 h-4" />
              </button>
            </motion.form>

            {/* Trust Pills */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-3 mt-8"
            >
              {['Medici abilitati', 'Cliniche selezionate', 'Prenotazione rapida'].map((pill) => (
                <div key={pill} className="flex items-center gap-2 bg-ivory/80 border border-warm/20 px-3 py-2 sharp-edge">
                  <CheckCircle2 className="w-4 h-4 text-warm" />
                  <span className="text-sm font-medium text-graphite/80">{pill}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-6 h-6 text-graphite/40" />
          </motion.div>
        </motion.div>
      </ParallaxHero>

      {/* Featured Clinics */}
      <section className="py-24 bg-ivory-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-3xl font-display font-light tracking-tight text-graphite mb-4">Strutture Selezionate</h2>
              <p className="text-graphite-light/70 max-w-2xl">Partner esclusivi che garantiscono i più alti standard di cura e design architettonico.</p>
            </div>
            <Link to="/search" className="hidden md:flex items-center gap-2 text-sm font-medium uppercase tracking-widest hover:text-silver transition-colors">
              Vedi Tutte <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURED_CLINICS.map((clinic, i) => (
              <AnimatedCard
                key={clinic.id}
                hover
                delay={i * 0.1}
                className="group cursor-pointer"
                onClick={() => navigate(`/clinic/${clinic.id}`)}
              >
                <div className="image-zoom relative aspect-[4/5] overflow-hidden mb-6 sharp-edge bg-silver-light">
                  <img
                    src={clinic.image}
                    alt={clinic.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 flex items-center gap-1 sharp-edge">
                    <Star className="w-3.5 h-3.5 fill-warm text-warm" />
                    <span className="text-xs font-medium">{clinic.rating}</span>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <h3 className="text-xl font-display font-medium mb-2 group-hover:text-silver transition-colors">{clinic.name}</h3>
                  <p className="text-sm text-graphite-light/70 mb-3">{clinic.location}</p>

                  {/* Next Availability Badge */}
                  <div className="bg-warm-soft px-3 py-1.5 inline-block mb-3 sharp-edge">
                    <span className="text-xs text-graphite-light/80">Prima disponibilità: {clinic.nextAvailable}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-graphite">da €{clinic.priceFrom}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {clinic.tags.map(tag => (
                      <span key={tag} className="text-xs uppercase tracking-wider border border-silver/30 px-2 py-1 text-graphite-light/80">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <span className="text-xs font-medium uppercase tracking-widest text-silver group-hover:text-graphite transition-colors flex items-center gap-1">
                    Vedi disponibilità <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </AnimatedCard>
            ))}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Link to="/search" className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest hover:text-silver transition-colors border-b border-graphite pb-1">
              Vedi Tutte Le Cliniche <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Treatments Section */}
      <section className="py-24 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xs font-medium uppercase tracking-widest text-silver mb-8">Trattamenti Più Richiesti</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {TREATMENTS.map((treatment, i) => (
              <ScrollReveal key={treatment.name} delay={i * 0.06}>
                <div
                  onClick={() => navigate(`/search?q=${encodeURIComponent(treatment.name)}`)}
                  className="card-premium sharp-edge p-6 cursor-pointer group"
                >
                  <Sparkles className="w-6 h-6 text-warm mb-5 group-hover:scale-110 transition-transform duration-500" />
                  <h3 className="font-display font-medium text-graphite text-base mb-2">{treatment.name}</h3>
                  <p className="text-sm font-medium text-graphite mb-2">da €{treatment.price}</p>
                  <div className="flex items-center gap-1.5 text-xs text-silver">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{treatment.duration}</span>
                  </div>
                  <span className="flex items-center gap-1 mt-5 text-xs font-semibold uppercase tracking-widest text-silver group-hover:text-warm transition-colors">
                    Trova cliniche <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-32 bg-graphite text-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-32 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-light leading-tight mb-8">
                Il nuovo standard per le prenotazioni mediche.
              </h2>
              <div className="space-y-8">
                <div>
                  <h4 className="font-display text-xl mb-2">Eccellenza Verificata</h4>
                  <p className="text-silver-light/70 font-light leading-relaxed">Ogni clinica è valutata per standard medici, qualità architettonica ed esperienza del paziente. Nessun compromesso.</p>
                </div>
                <div>
                  <h4 className="font-display text-xl mb-2">Disponibilità in Tempo Reale</h4>
                  <p className="text-silver-light/70 font-light leading-relaxed">Integrazione diretta con i calendari delle cliniche. Lo slot che vedi è garantito. Conferma istantanea.</p>
                </div>
                <div>
                  <h4 className="font-display text-xl mb-2">Deposito Sicuro</h4>
                  <p className="text-silver-light/70 font-light leading-relaxed">Blocca il tuo appuntamento con un deposito online sicuro. Salda la differenza direttamente in clinica.</p>
                </div>
              </div>
            </div>
            <div className="relative aspect-square sharp-edge overflow-hidden">
              <img
                src={IMAGES.valueProp}
                alt="Minimalist interior"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 border border-ivory/20 m-8 sharp-edge" />
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-24 bg-ivory-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-light tracking-tight text-graphite mb-16">Esperienze dei Nostri Pazienti</h2>

          <TestimonialSlider
            testimonials={REVIEWS.map(r => ({ name: r.name, rating: r.stars, text: r.quote, treatment: `${r.treatment} - ${r.clinic}` }))}
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-ivory">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-light tracking-tight text-graphite mb-16">Domande Frequenti</h2>

          <div className="divide-y divide-silver-light">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-6 text-left group"
                >
                  <span className="font-display font-medium text-graphite text-lg pr-8 group-hover:text-graphite-light transition-colors">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-silver shrink-0 transition-transform duration-300 ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                    style={{ transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: openFaq === i ? 'auto' : 0,
                    opacity: openFaq === i ? 1 : 0
                  }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-6 text-graphite-light/80 font-light leading-relaxed">
                    {item.answer}
                  </p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SocialProofToast />
    </div>
  );
}
