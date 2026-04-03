import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Save, CheckCircle2, Image, Clock as ClockIcon, Building2, Stethoscope } from 'lucide-react';
import { store } from '../../services/store';
import { cn } from '../../lib/utils';

const CLINIC_ID = 'c1';
const DAYS = ['Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato', 'Domenica'] as const;
const DAY_KEYS = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica'] as const;

type DaySchedule = {
  open: string;
  close: string;
  closed: boolean;
};

type OpeningHours = Record<string, DaySchedule>;

function getDefaultHours(): OpeningHours {
  const hours: OpeningHours = {};
  for (const key of DAY_KEYS) {
    hours[key] = key === 'domenica'
      ? { open: '09:00', close: '18:00', closed: true }
      : { open: '09:00', close: '18:00', closed: false };
  }
  return hours;
}

export function PortalProfile() {
  const clinic = store.clinics.getById(CLINIC_ID);

  const [name, setName] = useState(clinic?.name ?? '');
  const [description, setDescription] = useState(clinic?.description ?? '');
  const [address, setAddress] = useState(clinic?.address ?? '');
  const [phone, setPhone] = useState(clinic?.phone ?? '');
  const [email, setEmail] = useState(clinic?.email ?? '');
  const [website, setWebsite] = useState(clinic?.website ?? '');
  const [imageUrl, setImageUrl] = useState(clinic?.image_url ?? '');
  const [saved, setSaved] = useState(false);

  const [hours, setHours] = useState<OpeningHours>(() => {
    if (clinic?.opening_hours) {
      const result: OpeningHours = {};
      for (const key of DAY_KEYS) {
        const existing = clinic.opening_hours[key];
        if (existing) {
          result[key] = { open: existing.open, close: existing.close, closed: false };
        } else {
          result[key] = { open: '09:00', close: '18:00', closed: true };
        }
      }
      return result;
    }
    return getDefaultHours();
  });

  const allTreatments = useMemo(() => store.treatments.getAll(), []);
  const [enabledTreatments, setEnabledTreatments] = useState<Set<string>>(
    () => new Set(allTreatments.map(t => t.id))
  );

  function updateHour(dayKey: string, field: 'open' | 'close', value: string) {
    setHours(prev => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], [field]: value },
    }));
  }

  function toggleDayClosed(dayKey: string) {
    setHours(prev => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], closed: !prev[dayKey].closed },
    }));
  }

  function toggleTreatment(id: string) {
    setEnabledTreatments(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleSave() {
    const openingHours: Record<string, { open: string; close: string }> = {};
    for (const key of DAY_KEYS) {
      if (!hours[key].closed) {
        openingHours[key] = { open: hours[key].open, close: hours[key].close };
      }
    }

    store.clinics.update(CLINIC_ID, {
      name,
      description,
      address,
      phone,
      email,
      website,
      image_url: imageUrl,
      opening_hours: openingHours,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const inputClassName = 'w-full bg-white border border-silver/30 px-4 py-3 text-sm text-graphite sharp-edge placeholder:text-silver/50';

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-display font-light text-graphite">Profilo Clinica</h1>
        <button
          onClick={handleSave}
          className={cn(
            'flex items-center gap-2 px-6 py-3 text-xs font-medium uppercase tracking-widest transition-colors sharp-edge',
            saved
              ? 'bg-green-600 text-white'
              : 'bg-graphite text-ivory hover:bg-graphite-light'
          )}
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Salvato
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Salva Modifiche
            </>
          )}
        </button>
      </div>

      {/* Success */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-green-50 border border-green-200 text-green-800 px-6 py-3 sharp-edge text-sm font-medium flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Profilo aggiornato con successo
        </motion.div>
      )}

      <div className="space-y-8">
        {/* Info Base */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-silver/20 p-8 sharp-edge"
        >
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-5 h-5 text-warm" />
            <h2 className="text-lg font-display font-medium text-graphite">Informazioni Base</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-medium uppercase tracking-widest text-silver mb-2">
                Nome Clinica
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className={inputClassName}
                placeholder="Nome della clinica"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-medium uppercase tracking-widest text-silver mb-2">
                Descrizione
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                className={cn(inputClassName, 'resize-none')}
                placeholder="Descrizione della clinica"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium uppercase tracking-widest text-silver mb-2">
                Indirizzo
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className={inputClassName}
                placeholder="Via, numero, citta"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium uppercase tracking-widest text-silver mb-2">
                Telefono
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className={inputClassName}
                placeholder="+39 02 1234567"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium uppercase tracking-widest text-silver mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputClassName}
                placeholder="info@clinica.it"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium uppercase tracking-widest text-silver mb-2">
                Sito Web
              </label>
              <input
                type="url"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                className={inputClassName}
                placeholder="https://www.clinica.it"
              />
            </div>
          </div>
        </motion.div>

        {/* Orari di Apertura */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-silver/20 p-8 sharp-edge"
        >
          <div className="flex items-center gap-3 mb-6">
            <ClockIcon className="w-5 h-5 text-warm" />
            <h2 className="text-lg font-display font-medium text-graphite">Orari di Apertura</h2>
          </div>

          <div className="space-y-3">
            {DAYS.map((day, i) => {
              const key = DAY_KEYS[i];
              const schedule = hours[key];
              return (
                <div
                  key={key}
                  className={cn(
                    'flex flex-col md:flex-row items-start md:items-center gap-4 p-4 border border-silver/10 sharp-edge',
                    schedule.closed && 'opacity-50'
                  )}
                >
                  <div className="w-28 text-sm font-medium text-graphite">{day}</div>

                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="time"
                      value={schedule.open}
                      onChange={e => updateHour(key, 'open', e.target.value)}
                      disabled={schedule.closed}
                      className="bg-white border border-silver/30 px-3 py-2 text-sm text-graphite sharp-edge disabled:opacity-40"
                    />
                    <span className="text-silver text-sm">-</span>
                    <input
                      type="time"
                      value={schedule.close}
                      onChange={e => updateHour(key, 'close', e.target.value)}
                      disabled={schedule.closed}
                      className="bg-white border border-silver/30 px-3 py-2 text-sm text-graphite sharp-edge disabled:opacity-40"
                    />
                  </div>

                  <button
                    onClick={() => toggleDayClosed(key)}
                    className={cn(
                      'px-4 py-2 text-[10px] font-medium uppercase tracking-widest border transition-colors sharp-edge',
                      schedule.closed
                        ? 'bg-red-50 text-red-600 border-red-200'
                        : 'bg-green-50 text-green-700 border-green-200'
                    )}
                  >
                    {schedule.closed ? 'Chiuso' : 'Aperto'}
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Immagine */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-silver/20 p-8 sharp-edge"
        >
          <div className="flex items-center gap-3 mb-6">
            <Image className="w-5 h-5 text-warm" />
            <h2 className="text-lg font-display font-medium text-graphite">Immagine</h2>
          </div>

          <div>
            <label className="block text-[10px] font-medium uppercase tracking-widest text-silver mb-2">
              URL Immagine
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              className={cn(inputClassName, 'mb-4')}
              placeholder="https://..."
            />
          </div>

          {imageUrl && (
            <div className="border border-silver/20 sharp-edge overflow-hidden">
              <img
                src={imageUrl}
                alt="Anteprima clinica"
                className="w-full h-48 object-cover"
                loading="lazy"
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </motion.div>

        {/* Trattamenti Offerti */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-silver/20 p-8 sharp-edge"
        >
          <div className="flex items-center gap-3 mb-6">
            <Stethoscope className="w-5 h-5 text-warm" />
            <h2 className="text-lg font-display font-medium text-graphite">Trattamenti Offerti</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allTreatments.map(treatment => {
              const isEnabled = enabledTreatments.has(treatment.id);
              return (
                <button
                  key={treatment.id}
                  onClick={() => toggleTreatment(treatment.id)}
                  className={cn(
                    'flex items-center gap-3 p-4 border transition-colors sharp-edge text-left',
                    isEnabled
                      ? 'border-warm/40 bg-warm/5'
                      : 'border-silver/20 bg-white hover:border-silver/40'
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 border flex items-center justify-center shrink-0 sharp-edge transition-colors',
                    isEnabled
                      ? 'bg-warm border-warm text-ivory'
                      : 'border-silver/40 bg-white'
                  )}>
                    {isEnabled && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-graphite">{treatment.name}</div>
                    <div className="text-xs text-silver">
                      {treatment.category} &middot; {treatment.duration_min}min &middot; da &euro;{treatment.price_from}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
