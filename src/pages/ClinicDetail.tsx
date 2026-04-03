import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, Star, Clock, CheckCircle2, ArrowRight, Info, Users } from 'lucide-react';
import { ImageCarousel } from '../components/ui/ImageCarousel';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { IMAGES } from '../lib/images';
import { api } from '../services/api';
import { store } from '../services/store';
import type { Clinic, Treatment } from '../types/database';

export function ClinicDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Tutti');
  const [availabilityFilter, setAvailabilityFilter] = useState<'oggi' | 'domani' | 'settimana'>('oggi');
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const clinicData = id ? await api.clinics.getById(id) : undefined;
        if (clinicData) {
          setClinic(clinicData);
        } else {
          const fallback = id ? store.clinics.getById(id) : undefined;
          setClinic(fallback ?? null);
        }
        const allTreatments = await api.treatments.list();
        setTreatments(allTreatments);
      } catch {
        if (id) {
          const fallback = store.clinics.getById(id);
          setClinic(fallback ?? null);
        }
        setTreatments(store.treatments.getAll());
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const categories = ['Tutti', ...new Set(treatments.map(t => t.category))];
  const filteredTreatments = selectedCategory === 'Tutti'
    ? treatments
    : treatments.filter(t => t.category === selectedCategory);

  const watchingCount = useMemo(() => Math.floor(Math.random() * 6) + 2, []);

  if (loading) {
    return <div className="min-h-screen bg-ivory flex items-center justify-center">
      <div className="text-silver text-sm uppercase tracking-widest">Caricamento...</div>
    </div>;
  }

  if (!clinic) {
    return <div className="min-h-screen bg-ivory flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-display text-graphite mb-4">Clinica non trovata</h2>
        <button onClick={() => navigate('/search')} className="text-sm text-silver hover:text-graphite underline">
          Torna alla ricerca
        </button>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-ivory">
      {/* Hero Gallery */}
      <div className="h-[50vh] md:h-[60vh] p-1 bg-ivory-dark">
        <ImageCarousel
          images={[IMAGES.clinics[0], IMAGES.clinics[1], IMAGES.clinics[2]]}
          alt="Galleria clinica"
          aspectRatio="aspect-auto"
          className="h-full w-full"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="bg-graphite text-ivory px-3 py-1 flex items-center gap-1 sharp-edge">
                  <Star className="w-4 h-4 fill-ivory text-ivory" />
                  <span className="text-sm font-medium">{clinic.rating}</span>
                </div>
                <span className="text-sm text-silver underline decoration-silver/50 underline-offset-4 cursor-pointer hover:text-graphite transition-colors">
                  {clinic.reviews_count} Recensioni Verificate
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 bg-warm-soft text-warm sharp-edge font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Clinica partner verificata
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-display font-light text-graphite mb-4">
                {clinic.name}
              </h1>

              <p className="text-graphite-light/70 flex items-center gap-2 mb-8">
                <MapPin className="w-5 h-5 text-silver" /> {clinic.address}
              </p>

              {/* Watching indicator */}
              <div className="flex items-center gap-2 mb-6 text-sm text-graphite-light/70">
                <Users className="w-4 h-4 text-warm" />
                <span>{watchingCount} persone stanno guardando questa clinica</span>
              </div>

              {/* Availability Pills */}
              <div className="flex gap-3 mb-12">
                {([
                  { key: 'oggi' as const, label: 'Oggi' },
                  { key: 'domani' as const, label: 'Domani' },
                  { key: 'settimana' as const, label: 'Questa settimana' }
                ]).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setAvailabilityFilter(key)}
                    className={`px-5 py-2 text-sm font-medium uppercase tracking-widest sharp-edge transition-colors ${
                      availabilityFilter === key
                        ? 'bg-graphite text-ivory'
                        : 'border border-silver text-graphite hover:bg-ivory-dark'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="text-lg text-graphite-light/80 font-light leading-relaxed mb-16">
                <p>{clinic.description}</p>
              </div>

              {/* Treatments Section */}
              <div className="mb-16">
                <h2 className="text-2xl font-display font-light text-graphite mb-8">Trattamenti</h2>

                <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-6 py-2 text-sm font-medium uppercase tracking-widest whitespace-nowrap transition-colors sharp-edge ${
                        selectedCategory === cat
                          ? 'bg-graphite text-ivory'
                          : 'bg-ivory-dark text-graphite-light hover:bg-silver-light/50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {filteredTreatments.map((treatment, i) => (
                    <ScrollReveal key={treatment.id} delay={i * 0.1}>
                      <div className="border border-silver/20 p-6 sharp-edge bg-white hover:border-graphite/30 transition-colors group card-premium">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-display font-medium group-hover:text-silver transition-colors">{treatment.name}</h3>
                            </div>
                            <p className="text-sm text-graphite-light/70 mb-3 font-light leading-relaxed">{treatment.description}</p>
                            <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-widest text-silver">
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {treatment.duration_min} min</span>
                              <span className="flex items-center gap-1"><Info className="w-3.5 h-3.5" /> Valutazione Medica Inclusa</span>
                            </div>
                          </div>
                          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 shrink-0">
                            <div className="text-right">
                              <div className="text-2xl font-display font-light text-graphite">€{treatment.price_from} - €{treatment.price_to}</div>
                              <div className="text-xs text-silver mt-1">Deposito: €50</div>
                            </div>
                            <button
                              onClick={() => navigate(`/book/${clinic.id}/${treatment.id}`)}
                              className="bg-ivory-dark text-graphite px-6 py-3 text-sm font-medium uppercase tracking-widest hover:bg-graphite hover:text-ivory transition-colors sharp-edge flex items-center gap-2"
                            >
                              Seleziona <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>

              {/* Team Medico */}
              <div>
                <h2 className="text-2xl font-display font-light text-graphite mb-8">Team Medico</h2>
                <p className="text-sm text-graphite-light/70">Informazioni sul team medico disponibili a breve.</p>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white border border-silver/20 p-8 sharp-edge shadow-[var(--shadow-md)]">
              <h3 className="font-display text-xl mb-6">Informazioni Clinica</h3>

              <div className="space-y-6 text-sm">
                <div>
                  <h4 className="font-medium uppercase tracking-widest text-silver mb-2 text-xs">Indirizzo</h4>
                  <p className="text-graphite-light">{clinic.address}</p>
                </div>

                <div>
                  <h4 className="font-medium uppercase tracking-widest text-silver mb-2 text-xs">Orari di Apertura</h4>
                  <ul className="space-y-2 text-graphite-light">
                    <li className="flex justify-between"><span>Lun - Ven</span> <span>09:00 - 19:00</span></li>
                    <li className="flex justify-between"><span>Sabato</span> <span>09:00 - 14:00</span></li>
                    <li className="flex justify-between text-silver"><span>Domenica</span> <span>Chiuso</span></li>
                  </ul>
                </div>

                <div className="pt-6 border-t border-silver/20">
                  <h4 className="font-medium uppercase tracking-widest text-silver mb-4 text-xs">Garanzie Node Clinic</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-graphite-light">
                      <CheckCircle2 className="w-4 h-4 text-graphite shrink-0 mt-0.5" />
                      <span>Professionisti medici verificati</span>
                    </li>
                    <li className="flex items-start gap-2 text-graphite-light">
                      <CheckCircle2 className="w-4 h-4 text-graphite shrink-0 mt-0.5" />
                      <span>Disponibilità in tempo reale</span>
                    </li>
                    <li className="flex items-start gap-2 text-graphite-light">
                      <CheckCircle2 className="w-4 h-4 text-graphite shrink-0 mt-0.5" />
                      <span>Pagamento deposito sicuro</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Sticky CTA - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-silver/20 p-4 lg:hidden z-50">
        <button
          onClick={() => {
            const treatmentsSection = document.querySelector('#treatments');
            if (treatmentsSection) {
              treatmentsSection.scrollIntoView({ behavior: 'smooth' });
            } else {
              window.scrollTo({ top: 600, behavior: 'smooth' });
            }
          }}
          className="w-full bg-graphite text-ivory py-4 font-medium uppercase tracking-widest text-sm sharp-edge hover:bg-graphite-light transition-colors"
        >
          Vedi slot disponibili
        </button>
      </div>
    </div>
  );
}
