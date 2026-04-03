import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search as SearchIcon, MapPin, Star, Filter, Calendar, CheckCircle2, GitCompareArrows } from 'lucide-react';
import { ClinicMap } from '../components/ui/ClinicMap';
import { TreatmentComparison } from '../components/ui/TreatmentComparison';
import { store } from '../services/store';
import { api } from '../services/api';
import { IMAGES } from '../lib/images';
import type { Treatment, Clinic } from '../types/database';

type SortOption = 'recommended' | 'rating' | 'price' | 'name';

export function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialLoc = searchParams.get('loc') || '';

  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLoc);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [treatmentFilter, setTreatmentFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [compareList, setCompareList] = useState<Treatment[]>([]);

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClinics() {
      setLoading(true);
      try {
        const data = await api.clinics.search(initialQuery, initialLoc || undefined);
        setClinics(data);
      } catch {
        // Fallback to store
        setClinics(store.clinics.getAll());
      } finally {
        setLoading(false);
      }
    }
    fetchClinics();
  }, [initialQuery, initialLoc]);

  // Get all treatments from store for filter dropdown
  const allTreatments = useMemo(() => store.treatments.getAll(), []);

  // All unique cities
  const allCities = useMemo(() => {
    const cities = new Set<string>();
    clinics.forEach((c) => cities.add(c.city));
    return Array.from(cities).sort();
  }, [clinics]);

  const filteredResults = useMemo(() => {
    let results = clinics.filter((clinic) => {
      const matchesQuery =
        query === '' ||
        clinic.name.toLowerCase().includes(query.toLowerCase());
      const matchesLoc =
        location === '' ||
        clinic.city.toLowerCase().includes(location.toLowerCase()) ||
        clinic.address.toLowerCase().includes(location.toLowerCase());
      const matchesCity =
        cityFilter === '' ||
        clinic.city.toLowerCase() === cityFilter.toLowerCase();
      return matchesQuery && matchesLoc && matchesCity;
    });

    // Sort
    switch (sortBy) {
      case 'rating':
        results = [...results].sort((a, b) => b.rating - a.rating);
        break;
      case 'price':
        results = [...results].sort((a, b) => (a.id > b.id ? 1 : -1));
        break;
      case 'name':
        results = [...results].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return results;
  }, [query, location, sortBy, cityFilter, clinics]);

  function toggleCompare(treatmentName: string) {
    const existing = compareList.find(
      (t) => t.name.toLowerCase() === treatmentName.toLowerCase()
    );
    if (existing) {
      setCompareList(compareList.filter((t) => t.id !== existing.id));
    } else if (compareList.length < 3) {
      const fromStore = allTreatments.find(
        (t) => t.name.toLowerCase() === treatmentName.toLowerCase()
      );
      if (fromStore) {
        setCompareList([...compareList, fromStore]);
      }
    }
  }

  function isInCompare(treatmentName: string): boolean {
    return compareList.some(
      (t) => t.name.toLowerCase() === treatmentName.toLowerCase()
    );
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      {/* Search Header */}
      <div className="bg-white border-b border-silver/20 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full flex bg-ivory-dark sharp-edge p-1">
              <div className="flex-1 relative flex items-center">
                <SearchIcon className="absolute left-3 w-4 h-4 text-silver" />
                <input
                  type="text"
                  placeholder="Trattamento o Clinica"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-transparent border-none focus:ring-0 text-sm text-graphite placeholder:text-silver outline-none"
                />
              </div>
              <div className="w-px bg-silver/30 my-2" />
              <div className="flex-1 relative flex items-center">
                <MapPin className="absolute left-3 w-4 h-4 text-silver" />
                <input
                  type="text"
                  placeholder="Citt\u00E0 o Regione"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-transparent border-none focus:ring-0 text-sm text-graphite placeholder:text-silver outline-none"
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-full md:w-auto px-6 py-3 text-sm font-medium uppercase tracking-widest transition-colors sharp-edge flex items-center justify-center gap-2 ${
                showFilters
                  ? 'bg-warm text-ivory'
                  : 'bg-graphite text-ivory hover:bg-graphite-light'
              }`}
            >
              <Filter className="w-4 h-4" /> Filtri
            </button>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-silver/20 flex flex-wrap gap-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-1">
                  Trattamento
                </label>
                <select
                  value={treatmentFilter}
                  onChange={(e) => setTreatmentFilter(e.target.value)}
                  className="bg-ivory-dark border border-silver/30 p-2 sharp-edge focus:border-graphite focus:ring-0 outline-none text-sm text-graphite min-w-[180px]"
                >
                  <option value="">Tutti</option>
                  {allTreatments.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-1">
                  Citt&agrave;
                </label>
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="bg-ivory-dark border border-silver/30 p-2 sharp-edge focus:border-graphite focus:ring-0 outline-none text-sm text-graphite min-w-[180px]"
                >
                  <option value="">Tutte</option>
                  {allCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              {(treatmentFilter || cityFilter) && (
                <button
                  onClick={() => {
                    setTreatmentFilter('');
                    setCityFilter('');
                  }}
                  className="self-end text-xs font-medium uppercase tracking-widest text-silver hover:text-graphite transition-colors underline decoration-silver/50 underline-offset-4 pb-2"
                >
                  Rimuovi filtri
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results Area */}
      <div className={`flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full grid grid-cols-1 lg:grid-cols-3 gap-8 ${compareList.length > 0 ? 'pb-28' : ''}`}>

        {/* List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-end mb-8">
            <h1 className="text-2xl font-display font-light text-graphite">
              Cliniche disponibili vicino a te
            </h1>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent border-none text-sm font-medium uppercase tracking-widest text-graphite-light focus:ring-0 cursor-pointer outline-none"
            >
              <option value="recommended">Consigliati</option>
              <option value="rating">Valutazione</option>
              <option value="price">Prezzo</option>
              <option value="name">Nome</option>
            </select>
          </div>

          <p className="text-sm text-silver -mt-4 mb-8">{filteredResults.length} strutture trovate</p>

          {filteredResults.map((clinic, i) => (
            <motion.div
              key={clinic.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group bg-white border border-silver/20 sharp-edge overflow-hidden flex flex-col sm:flex-row cursor-pointer hover:border-graphite/30 transition-colors"
              onClick={() => navigate(`/clinic/${clinic.id}`)}
            >
              <div className="image-zoom w-full sm:w-64 h-48 sm:h-auto relative bg-silver-light shrink-0 overflow-hidden">
                <img
                  src={clinic.image_url || IMAGES.clinicsThumbs[0]}
                  alt={clinic.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 flex items-center gap-1 sharp-edge">
                  <Star className="w-3 h-3 fill-warm text-warm" />
                  <span className="text-xs font-medium">{clinic.rating}</span>
                  <span className="text-xs text-silver">({clinic.reviews_count})</span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-display font-medium group-hover:text-silver transition-colors">{clinic.name}</h3>
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-warm-soft text-warm sharp-edge">
                      <CheckCircle2 className="w-3 h-3" />
                      Verificata
                    </span>
                  </div>
                </div>

                <p className="text-sm text-graphite-light/70 mb-4 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {clinic.city}, {clinic.address}
                </p>

                <div className="mt-auto pt-4 border-t border-silver/20 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-graphite">
                      <Calendar className="w-4 h-4 text-silver" />
                      Prossimamente
                    </div>
                  </div>
                  <span className="text-xs font-medium uppercase tracking-widest text-silver group-hover:text-graphite transition-colors">
                    Vedi disponibilit&agrave; &rarr;
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Interactive Map */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-48 h-[calc(100vh-14rem)] sharp-edge border border-silver/20 overflow-hidden">
            <ClinicMap
              clinics={filteredResults.map(c => ({
                id: c.id,
                name: c.name,
                lat: c.lat ?? 44.0,
                lng: c.lng ?? 11.0,
                rating: c.rating,
                address: c.address
              }))}
              center={[44.0, 11.0]}
              zoom={6}
              className="h-full w-full"
            />
          </div>
        </div>
      </div>

      {/* Comparison bar */}
      {compareList.length > 0 && (
        <TreatmentComparison
          treatments={compareList}
          onRemove={(id) =>
            setCompareList(compareList.filter((t) => t.id !== id))
          }
          onClose={() => setCompareList([])}
        />
      )}
    </div>
  );
}
