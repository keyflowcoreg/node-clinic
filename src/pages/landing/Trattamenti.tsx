import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Sparkles,
  Zap,
  CircleDot,
  Diamond,
  Droplets,
  Layers,
  ShieldCheck,
  Eye,
  Lock,
  CheckCircle2,
  Star,
  Shield,
  Search,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { LandingLayout } from '../../components/layout/LandingLayout';
import { cn } from '../../lib/utils';
import { IMAGES } from '../../lib/images';
import { AnimatedCard } from '../../components/ui/AnimatedCard';
import { ScrollReveal } from '../../components/ui/ScrollReveal';
import { ParallaxHero } from '../../components/ui/ParallaxHero';
import { fadeInUp } from '../../hooks/useAnimations';

const TREATMENTS = [
  {
    icon: Sparkles,
    name: 'Filler Labbra',
    price: 179,
    duration: '30-45 min',
    description: 'Aumento e definizione delle labbra con acido ialuronico.',
    link: '/search?treatment=filler-labbra',
  },
  {
    icon: Zap,
    name: 'Botox',
    price: 200,
    duration: '20-30 min',
    description: 'Riduzione delle rughe di espressione per un aspetto naturale.',
    link: '/search?treatment=botox',
  },
  {
    icon: CircleDot,
    name: 'Rinomodellamento',
    price: 200,
    duration: '45-60 min',
    description: 'Correzione non chirurgica del profilo nasale.',
    link: '/search?treatment=rinomodellamento',
  },
  {
    icon: Diamond,
    name: 'Zigomi',
    price: 200,
    duration: '30-45 min',
    description: 'Valorizzazione degli zigomi con filler a base di acido ialuronico.',
    link: '/search?treatment=zigomi',
  },
  {
    icon: Droplets,
    name: 'Biostimolazione',
    price: 250,
    duration: '45 min',
    description: 'Rigenerazione cutanea profonda per una pelle luminosa.',
    link: '/search?treatment=biostimolazione',
  },
  {
    icon: Layers,
    name: 'Peeling',
    price: 120,
    duration: '30 min',
    description: 'Esfoliazione professionale per rinnovare la texture della pelle.',
    link: '/search?treatment=peeling',
  },
];

const VALUE_PROPS = [
  {
    icon: ShieldCheck,
    title: 'Verificato',
    description: 'Ogni clinica e selezionata e verificata dal nostro team.',
  },
  {
    icon: Eye,
    title: 'Trasparente',
    description: 'Prezzi chiari, nessun costo nascosto.',
  },
  {
    icon: Lock,
    title: 'Sicuro',
    description: 'Pagamenti protetti e deposito rimborsabile.',
  },
];

const PRICE_TABLE = [
  { treatment: 'Filler Labbra', range: '\u20AC179 - \u20AC350', clinics: 18 },
  { treatment: 'Botox', range: '\u20AC200 - \u20AC400', clinics: 22 },
  { treatment: 'Rinomodellamento', range: '\u20AC200 - \u20AC500', clinics: 12 },
  { treatment: 'Zigomi', range: '\u20AC200 - \u20AC450', clinics: 15 },
  { treatment: 'Biostimolazione', range: '\u20AC250 - \u20AC500', clinics: 10 },
  { treatment: 'Peeling', range: '\u20AC120 - \u20AC280', clinics: 20 },
];

const TRUST_BADGES = [
  { icon: CheckCircle2, label: '300+ Cliniche Partner' },
  { icon: Shield, label: 'Prezzo Trasparente' },
  { icon: Star, label: '4.8 Valutazione Media' },
];


export function Trattamenti() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <LandingLayout>
      {/* Hero */}
      <ParallaxHero imageUrl={IMAGES.heroes.treatments} overlayOpacity={0.75}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-light leading-tight tracking-tighter mb-6 text-graphite">
              I Migliori Trattamenti <br />
              <span className="font-semibold">di Medicina Estetica</span>
            </h1>
            <p className="text-lg md:text-xl text-graphite-light/70 font-light leading-relaxed mb-10 max-w-xl mx-auto">
              Prezzi trasparenti, cliniche verificate, prenotazione immediata.
            </p>

            {/* Inline Search */}
            <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-0">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-silver" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca trattamento..."
                  className="w-full pl-12 pr-4 py-4 bg-white text-graphite sharp-edge focus:outline-none placeholder:text-silver/50"
                />
              </div>
              <button
                type="submit"
                className="bg-graphite text-ivory px-8 py-4 font-medium text-sm uppercase tracking-widest sharp-edge hover:bg-graphite-light transition-colors shrink-0"
              >
                Cerca
              </button>
            </form>
          </motion.div>
        </div>
      </ParallaxHero>

      {/* Treatment Grid */}
      <section className="py-20 lg:py-28 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {TREATMENTS.map((item, i) => (
              <AnimatedCard
                key={item.name}
                hover
                delay={i * 0.08}
                className="p-8 bg-white"
              >
                <item.icon className="w-8 h-8 text-graphite mb-6" strokeWidth={1.5} />
                <h3 className="font-display text-xl font-medium mb-2 text-graphite">
                  {item.name}
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-xs uppercase tracking-widest text-silver flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.duration}
                  </span>
                </div>
                <p className="text-sm text-graphite-light/70 font-light leading-relaxed mb-6">
                  {item.description}
                </p>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-xs text-silver uppercase tracking-widest">da</span>
                    <span className="text-2xl font-display font-light text-graphite ml-2">
                      &euro;{item.price}
                    </span>
                  </div>
                  <Link
                    to={item.link}
                    className="text-xs font-medium uppercase tracking-widest text-graphite hover:text-silver transition-colors inline-flex items-center gap-1 border-b border-graphite pb-0.5"
                  >
                    Trova Cliniche <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Perche Node Clinic */}
      <section className="py-20 lg:py-28 bg-ivory-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            {...fadeInUp}
            className="text-3xl font-display font-light tracking-tight text-graphite mb-16 text-center"
          >
            Perche Node Clinic
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {VALUE_PROPS.map((item, i) => (
              <ScrollReveal
                key={item.title}
                delay={i * 0.1}
                className="text-center"
              >
                <div className="w-16 h-16 bg-graphite text-ivory flex items-center justify-center sharp-edge mx-auto mb-6">
                  <item.icon className="w-7 h-7" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-lg font-medium mb-2 text-graphite uppercase tracking-wider text-sm">
                  {item.title}
                </h3>
                <p className="text-sm text-graphite-light/70 font-light max-w-xs mx-auto">
                  {item.description}
                </p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Confronto Prezzi */}
      <section className="py-20 lg:py-28 bg-ivory">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            {...fadeInUp}
            className="text-3xl font-display font-light tracking-tight text-graphite mb-12 text-center"
          >
            Confronto Prezzi
          </motion.h2>

          <motion.div
            {...fadeInUp}
            className="border border-silver/20 sharp-edge bg-white overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-graphite text-ivory">
                    <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest">
                      Trattamento
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-widest">
                      Range Prezzo
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-medium uppercase tracking-widest">
                      Cliniche
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PRICE_TABLE.map((row, i) => (
                    <tr
                      key={row.treatment}
                      className={cn(
                        'border-b border-silver/10 last:border-b-0 hover:bg-warm-light/30 transition-colors',
                        i % 2 === 0 ? 'bg-white' : 'bg-ivory/50'
                      )}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-graphite">
                        {row.treatment}
                      </td>
                      <td className="px-6 py-4 text-sm text-graphite-light/80 font-light">
                        {row.range}
                      </td>
                      <td className="px-6 py-4 text-sm text-graphite-light/80 font-light text-right">
                        {row.clinics}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-ivory-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
            {TRUST_BADGES.map((badge, i) => (
              <ScrollReveal
                key={badge.label}
                delay={i * 0.1}
              >
                <div className="flex items-center gap-3">
                  <badge.icon className="w-5 h-5 text-graphite" />
                  <span className="text-xs uppercase tracking-widest text-graphite font-medium">
                    {badge.label}
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Finale */}
      <section className="bg-graphite text-ivory py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-display font-light tracking-tight mb-6">
              Trova il Trattamento Perfetto per Te
            </h2>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 bg-ivory text-graphite px-10 py-4 font-medium text-sm uppercase tracking-widest sharp-edge hover:bg-ivory-dark transition-colors mb-6"
            >
              Cerca Cliniche <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-xs text-silver uppercase tracking-widest mt-4">
              Valutazione clinica gratuita al primo appuntamento
            </p>
          </motion.div>
        </div>
      </section>
    </LandingLayout>
  );
}
