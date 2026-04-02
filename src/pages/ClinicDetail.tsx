import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, Star, Clock, CheckCircle2, ArrowRight, Info, Users } from 'lucide-react';
import { ImageCarousel } from '../components/ui/ImageCarousel';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { IMAGES } from '../lib/images';

const MOCK_CLINIC = {
  id: 'c1',
  name: 'Aesthetic Milano',
  location: 'Via Brera 12, 20121 Milano',
  rating: 4.9,
  reviews: 128,
  description: 'Aesthetic Milano rappresenta l\'apice del lusso medico architettonico. Situata nel cuore di Brera, la nostra clinica combina tecnologie mediche all\'avanguardia con un ambiente sereno e minimalista progettato per elevare l\'esperienza del paziente. Ogni trattamento è preceduto da un\'accurata valutazione medica.',
  images: [IMAGES.clinics[0], IMAGES.clinics[1], IMAGES.clinics[2]],
  treatments: [
    {
      id: 't1',
      category: 'Iniettabili',
      name: 'Tossina Botulinica (Botox)',
      duration: '30 min',
      price: '€350',
      deposit: '€50',
      description: 'Trattamento mirato per le rughe d\'espressione. Valutazione medica richiesta prima della somministrazione.'
    },
    {
      id: 't2',
      category: 'Iniettabili',
      name: 'Filler Dermici (Acido Ialuronico)',
      duration: '45 min',
      price: '€400',
      deposit: '€50',
      description: 'Ripristino dei volumi e contouring. Selezione del prodotto in base alle esigenze anatomiche individuali.'
    },
    {
      id: 't3',
      category: 'Qualità della Pelle',
      name: 'Bioremodellamento Profhilo',
      duration: '30 min',
      price: '€300',
      deposit: '€50',
      description: 'Trattamento anti-aging iniettabile a base di acido ialuronico per pelli che perdono elasticità e compattezza.'
    }
  ],
  practitioners: [
    {
      id: 'p1',
      name: 'Dr.ssa Elena Rossi',
      role: 'Direttore Sanitario, Chirurgo Plastico',
      image: IMAGES.doctors[0]
    },
    {
      id: 'p2',
      name: 'Dr. Marco Bianchi',
      role: 'Medico Estetico',
      image: IMAGES.doctors[1]
    }
  ]
};

type AvailabilityFilter = 'oggi' | 'domani' | 'settimana';

const MOCK_SLOTS: Record<string, Record<AvailabilityFilter, string[]>> = {
  t1: { oggi: ['15:30', '17:00'], domani: ['09:00', '11:00', '14:30', '16:00'], settimana: ['09:00', '11:00', '14:30', '15:30', '16:00', '17:00'] },
  t2: { oggi: ['16:00'], domani: ['10:00', '14:00'], settimana: ['10:00', '14:00', '16:00', '17:30'] },
  t3: { oggi: [], domani: ['11:30'], settimana: ['11:30', '15:00', '16:30'] },
};

export function ClinicDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Tutti');
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('oggi');

  const categories = ['Tutti', ...new Set(MOCK_CLINIC.treatments.map(t => t.category))];
  const filteredTreatments = selectedCategory === 'Tutti'
    ? MOCK_CLINIC.treatments
    : MOCK_CLINIC.treatments.filter(t => t.category === selectedCategory);

  const watchingCount = useMemo(() => Math.floor(Math.random() * 6) + 2, []);

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
                  <span className="text-sm font-medium">{MOCK_CLINIC.rating}</span>
                </div>
                <span className="text-sm text-silver underline decoration-silver/50 underline-offset-4 cursor-pointer hover:text-graphite transition-colors">
                  {MOCK_CLINIC.reviews} Recensioni Verificate
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 bg-warm-soft text-warm sharp-edge font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Clinica partner verificata
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-display font-light text-graphite mb-4">
                {MOCK_CLINIC.name}
              </h1>

              <p className="text-graphite-light/70 flex items-center gap-2 mb-8">
                <MapPin className="w-5 h-5 text-silver" /> {MOCK_CLINIC.location}
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
                <p>{MOCK_CLINIC.description}</p>
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
                  {filteredTreatments.map((treatment, i) => {
                    const slots = MOCK_SLOTS[treatment.id]?.[availabilityFilter] ?? [];
                    return (
                    <ScrollReveal key={treatment.id} delay={i * 0.1}>
                      <div className="border border-silver/20 p-6 sharp-edge bg-white hover:border-graphite/30 transition-colors group card-premium">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-display font-medium group-hover:text-silver transition-colors">{treatment.name}</h3>
                              {slots.length > 0 && slots.length <= 3 && (
                                <span className="text-[10px] font-medium uppercase tracking-widest bg-warm/10 text-warm px-2 py-0.5 sharp-edge pulse-soft">
                                  Solo {slots.length} slot
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-graphite-light/70 mb-3 font-light leading-relaxed">{treatment.description}</p>
                            {slots.length > 0 ? (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {slots.map(slot => (
                                  <span key={slot} className="text-xs bg-ivory-dark px-2 py-1 sharp-edge text-graphite-light font-medium">{slot}</span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-silver mb-3 italic">Nessuno slot disponibile per il periodo selezionato</p>
                            )}
                            <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-widest text-silver">
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {treatment.duration}</span>
                              <span className="flex items-center gap-1"><Info className="w-3.5 h-3.5" /> Valutazione Medica Inclusa</span>
                            </div>
                          </div>
                          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 shrink-0">
                            <div className="text-right">
                              <div className="text-2xl font-display font-light text-graphite">{treatment.price}</div>
                              <div className="text-xs text-silver mt-1">Deposito: {treatment.deposit}</div>
                            </div>
                            <button
                              onClick={() => navigate(`/book/${MOCK_CLINIC.id}/${treatment.id}`)}
                              className="bg-ivory-dark text-graphite px-6 py-3 text-sm font-medium uppercase tracking-widest hover:bg-graphite hover:text-ivory transition-colors sharp-edge flex items-center gap-2"
                            >
                              Seleziona <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                  );
                  })}
                </div>
              </div>

              {/* Practitioners */}
              <div>
                <h2 className="text-2xl font-display font-light text-graphite mb-8">Team Medico</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {MOCK_CLINIC.practitioners.map(doc => (
                    <div key={doc.id} className="flex items-center gap-4">
                      <img
                        src={doc.image}
                        alt={doc.name}
                        className="w-16 h-16 object-cover sharp-edge bg-silver-light"
                      />
                      <div>
                        <h4 className="font-display font-medium text-graphite">{doc.name}</h4>
                        <p className="text-sm text-silver">{doc.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
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
                  <p className="text-graphite-light">{MOCK_CLINIC.location}</p>
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
