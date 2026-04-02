import type {
  Clinic, Treatment, Booking, User, Review, Lead, Payment,
  Notification, FunnelEvent, PlatformSettings
} from '../types/database'

type StoreCollection = 'clinics' | 'treatments' | 'bookings' | 'users' | 'reviews' | 'leads' | 'payments' | 'notifications' | 'funnel_events'

const STORE_PREFIX = 'nc_'
const SEED_VERSION = 2
const SEEDED_KEY = `${STORE_PREFIX}seeded_v${SEED_VERSION}`

function getKey(collection: StoreCollection): string {
  return `${STORE_PREFIX}${collection}`
}

function readCollection<T>(collection: StoreCollection): T[] {
  try {
    const raw = localStorage.getItem(getKey(collection))
    return raw ? JSON.parse(raw) as T[] : []
  } catch {
    return []
  }
}

function writeCollection<T>(collection: StoreCollection, data: T[]): void {
  localStorage.setItem(getKey(collection), JSON.stringify(data))
  window.dispatchEvent(new CustomEvent('store-update', { detail: { collection } }))
}

function generateId(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

// Generic CRUD
function getAll<T>(collection: StoreCollection): T[] {
  return readCollection<T>(collection)
}

function getById<T extends { id: string }>(collection: StoreCollection, id: string): T | undefined {
  return readCollection<T>(collection).find(item => item.id === id)
}

function create<T extends { id: string; created_at: string }>(
  collection: StoreCollection,
  data: Omit<T, 'id' | 'created_at'>
): T {
  const items = readCollection<T>(collection)
  const newItem = { ...data, id: generateId(), created_at: now() } as T
  items.push(newItem)
  writeCollection(collection, items)
  return newItem
}

function update<T extends { id: string }>(
  collection: StoreCollection,
  id: string,
  updates: Partial<T>
): T | undefined {
  const items = readCollection<T>(collection)
  const index = items.findIndex(item => item.id === id)
  if (index === -1) return undefined
  items[index] = { ...items[index], ...updates }
  writeCollection(collection, items)
  return items[index]
}

function remove(collection: StoreCollection, id: string): boolean {
  const items = readCollection<{ id: string }>(collection)
  const filtered = items.filter(item => item.id !== id)
  if (filtered.length === items.length) return false
  writeCollection(collection, filtered)
  return true
}

// Settings (singleton)
const SETTINGS_KEY = `${STORE_PREFIX}settings`

function getSettings(): PlatformSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return JSON.parse(raw) as PlatformSettings
  } catch { /* use defaults */ }
  return {
    platform_name: 'Node Clinic',
    support_email: 'supporto@nodeclinic.com',
    support_phone: '+39 02 1234567',
    whatsapp_number: '+393401234567',
    commission_rate: 15,
    notifications_email: true,
    notifications_whatsapp: true,
    notifications_sms: false,
  }
}

function saveSettings(settings: PlatformSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

// Seed data
function seedIfNeeded(): void {
  if (localStorage.getItem(SEEDED_KEY)) return

  // Clear stale data from previous seed versions
  const collections: StoreCollection[] = ['clinics', 'treatments', 'bookings', 'users', 'reviews', 'leads', 'payments', 'notifications', 'funnel_events']
  for (const c of collections) localStorage.removeItem(getKey(c))
  localStorage.removeItem(`${STORE_PREFIX}settings`)
  // Remove old seed flags
  for (let v = 0; v < SEED_VERSION; v++) {
    localStorage.removeItem(`${STORE_PREFIX}seeded`)
    localStorage.removeItem(`${STORE_PREFIX}seeded_v${v}`)
  }

  const clinics: Clinic[] = [
    {
      id: 'c1', name: 'Clinica Estetica Milano', slug: 'clinica-estetica-milano',
      city: 'Milano', address: 'Via Monte Napoleone 8', lat: 45.4685, lng: 9.1954,
      rating: 4.8, reviews_count: 142, status: 'active',
      image_url: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?w=800&h=600&fit=crop&q=80',
      description: 'Centro di eccellenza per la medicina estetica nel cuore di Milano.',
      phone: '+39 02 1234567', email: 'info@clinicamilano.it',
      created_at: '2025-06-15T10:00:00Z',
    },
    {
      id: 'c2', name: 'Derma Clinic Roma', slug: 'derma-clinic-roma',
      city: 'Roma', address: 'Via del Corso 120', lat: 41.9028, lng: 12.4964,
      rating: 4.9, reviews_count: 98, status: 'active',
      image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=600&fit=crop&q=80',
      description: 'Specialisti in dermatologia estetica e trattamenti laser.',
      phone: '+39 06 7654321', email: 'info@dermaroma.it',
      created_at: '2025-07-20T10:00:00Z',
    },
    {
      id: 'c3', name: 'Beauty Lab Bologna', slug: 'beauty-lab-bologna',
      city: 'Bologna', address: 'Via Indipendenza 32', lat: 44.4949, lng: 11.3426,
      rating: 4.7, reviews_count: 76, status: 'active',
      image_url: 'https://images.unsplash.com/photo-1598300056393-4aac492f4344?w=800&h=600&fit=crop&q=80',
      description: 'Trattamenti personalizzati con tecnologie di ultima generazione.',
      phone: '+39 051 9876543', email: 'info@beautylabbologna.it',
      created_at: '2025-08-10T10:00:00Z',
    },
  ]

  const treatments: Treatment[] = [
    {
      id: 't1', name: 'Filler Labbra', slug: 'filler-labbra', category: 'iniettivi',
      description: 'Aumento e definizione delle labbra con acido ialuronico.',
      price_from: 250, price_to: 500, duration_min: 30, status: 'active',
      image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=600&fit=crop&q=80',
      created_at: '2025-01-01T10:00:00Z',
    },
    {
      id: 't2', name: 'Botox', slug: 'botox', category: 'iniettivi',
      description: 'Trattamento delle rughe di espressione con tossina botulinica.',
      price_from: 200, price_to: 450, duration_min: 20, status: 'active',
      image_url: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&h=600&fit=crop&q=80',
      created_at: '2025-01-01T10:00:00Z',
    },
    {
      id: 't3', name: 'Laser Resurfacing', slug: 'laser-resurfacing', category: 'laser',
      description: 'Rinnovamento cutaneo tramite tecnologia laser frazionata.',
      price_from: 300, price_to: 800, duration_min: 45, status: 'active',
      image_url: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&h=600&fit=crop&q=80',
      created_at: '2025-01-01T10:00:00Z',
    },
    {
      id: 't4', name: 'Peeling Chimico', slug: 'peeling-chimico', category: 'viso',
      description: 'Esfoliazione chimica per rinnovare e illuminare la pelle.',
      price_from: 120, price_to: 300, duration_min: 30, status: 'active',
      image_url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&h=600&fit=crop&q=80',
      created_at: '2025-01-01T10:00:00Z',
    },
    {
      id: 't5', name: 'Mesoterapia', slug: 'mesoterapia', category: 'corpo',
      description: 'Microiniezioni di principi attivi per combattere cellulite e adiposità.',
      price_from: 150, price_to: 350, duration_min: 40, status: 'active',
      image_url: 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=800&h=600&fit=crop&q=80',
      created_at: '2025-01-01T10:00:00Z',
    },
    {
      id: 't6', name: 'Biostimolazione', slug: 'biostimolazione', category: 'viso',
      description: 'Stimolazione del collagene per un effetto anti-aging naturale.',
      price_from: 200, price_to: 450, duration_min: 35, status: 'active',
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&q=80',
      created_at: '2025-01-01T10:00:00Z',
    },
    {
      id: 't7', name: 'Rinomodellamento', slug: 'rinomodellamento', category: 'iniettivi',
      description: 'Correzione del profilo nasale senza chirurgia con filler.',
      price_from: 350, price_to: 700, duration_min: 30, status: 'active',
      image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop&q=80',
      created_at: '2025-01-01T10:00:00Z',
    },
    {
      id: 't8', name: 'Lipolaser', slug: 'lipolaser', category: 'corpo',
      description: 'Riduzione delle adiposità localizzate tramite laser a bassa intensità.',
      price_from: 300, price_to: 600, duration_min: 60, status: 'active',
      image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6b?w=800&h=600&fit=crop&q=80',
      created_at: '2025-01-01T10:00:00Z',
    },
  ]

  const users: User[] = [
    { id: 'usr_001', email: 'demo@nodeclinic.com', name: 'Sofia Marchetti', role: 'user', status: 'active', phone: '+39 333 1234567', created_at: '2025-09-01T10:00:00Z' },
    { id: 'cli_001', email: 'clinica@nodeclinic.com', name: 'Dr. Laura Conti', role: 'clinic', status: 'active', phone: '+39 02 1234567', created_at: '2025-06-15T10:00:00Z' },
    { id: 'adm_001', email: 'admin@nodeclinic.com', name: 'Marco Ferretti', role: 'admin', status: 'active', created_at: '2025-01-01T10:00:00Z' },
    { id: 'usr_002', email: 'giulia.rossi@email.com', name: 'Giulia Rossi', role: 'user', status: 'active', phone: '+39 340 5678901', created_at: '2025-10-15T10:00:00Z' },
    { id: 'usr_003', email: 'marco.s@email.com', name: 'Marco Santini', role: 'user', status: 'active', created_at: '2025-11-01T10:00:00Z' },
    { id: 'usr_004', email: 'alessia.p@email.com', name: 'Alessia Peroni', role: 'user', status: 'suspended', phone: '+39 347 2345678', created_at: '2025-11-20T10:00:00Z' },
    { id: 'cli_002', email: 'dermaroma@email.com', name: 'Dr. Giovanni Bianchi', role: 'clinic', status: 'active', created_at: '2025-07-20T10:00:00Z' },
    { id: 'usr_005', email: 'laura.m@email.com', name: 'Laura Martini', role: 'user', status: 'active', phone: '+39 320 8765432', created_at: '2026-01-10T10:00:00Z' },
    { id: 'usr_006', email: 'chiara.v@email.com', name: 'Chiara Verdi', role: 'user', status: 'active', created_at: '2026-02-05T10:00:00Z' },
    { id: 'usr_007', email: 'andrea.f@email.com', name: 'Andrea Fontana', role: 'user', status: 'active', phone: '+39 335 9876543', created_at: '2026-03-01T10:00:00Z' },
  ]

  const bookings: Booking[] = [
    { id: 'b1', user_id: 'usr_001', user_name: 'Sofia Marchetti', clinic_id: 'c1', clinic_name: 'Clinica Estetica Milano', treatment_id: 't2', treatment_name: 'Botox', date: '2026-03-14', time: '14:30', status: 'confirmed', deposit_amount: 50, total_amount: 350, created_at: '2026-03-01T10:00:00Z' },
    { id: 'b2', user_id: 'usr_002', user_name: 'Giulia Rossi', clinic_id: 'c1', clinic_name: 'Clinica Estetica Milano', treatment_id: 't1', treatment_name: 'Filler Labbra', date: '2026-03-14', time: '10:30', status: 'pending', deposit_amount: 50, total_amount: 400, created_at: '2026-03-02T10:00:00Z' },
    { id: 'b3', user_id: 'usr_003', user_name: 'Marco Santini', clinic_id: 'c2', clinic_name: 'Derma Clinic Roma', treatment_id: 't3', treatment_name: 'Laser Resurfacing', date: '2026-03-15', time: '09:00', status: 'confirmed', deposit_amount: 80, total_amount: 500, created_at: '2026-03-03T10:00:00Z' },
    { id: 'b4', user_id: 'usr_005', user_name: 'Laura Martini', clinic_id: 'c3', clinic_name: 'Beauty Lab Bologna', treatment_id: 't6', treatment_name: 'Biostimolazione', date: '2026-03-16', time: '11:00', status: 'confirmed', deposit_amount: 50, total_amount: 300, created_at: '2026-03-04T10:00:00Z' },
    { id: 'b5', user_id: 'usr_004', user_name: 'Alessia Peroni', clinic_id: 'c1', clinic_name: 'Clinica Estetica Milano', treatment_id: 't7', treatment_name: 'Rinomodellamento', date: '2026-03-13', time: '16:00', status: 'completed', deposit_amount: 70, total_amount: 500, created_at: '2026-02-28T10:00:00Z' },
    { id: 'b6', user_id: 'usr_006', user_name: 'Chiara Verdi', clinic_id: 'c2', clinic_name: 'Derma Clinic Roma', treatment_id: 't4', treatment_name: 'Peeling Chimico', date: '2026-03-17', time: '14:00', status: 'pending', deposit_amount: 30, total_amount: 200, created_at: '2026-03-05T10:00:00Z' },
    { id: 'b7', user_id: 'usr_007', user_name: 'Andrea Fontana', clinic_id: 'c3', clinic_name: 'Beauty Lab Bologna', treatment_id: 't5', treatment_name: 'Mesoterapia', date: '2026-03-12', time: '10:00', status: 'completed', deposit_amount: 40, total_amount: 250, created_at: '2026-02-25T10:00:00Z' },
    { id: 'b8', user_id: 'usr_001', user_name: 'Sofia Marchetti', clinic_id: 'c2', clinic_name: 'Derma Clinic Roma', treatment_id: 't8', treatment_name: 'Lipolaser', date: '2026-03-18', time: '15:30', status: 'confirmed', deposit_amount: 60, total_amount: 450, created_at: '2026-03-06T10:00:00Z' },
    { id: 'b9', user_id: 'usr_002', user_name: 'Giulia Rossi', clinic_id: 'c3', clinic_name: 'Beauty Lab Bologna', treatment_id: 't2', treatment_name: 'Botox', date: '2026-03-11', time: '09:30', status: 'cancelled', deposit_amount: 50, total_amount: 300, created_at: '2026-02-20T10:00:00Z' },
    { id: 'b10', user_id: 'usr_005', user_name: 'Laura Martini', clinic_id: 'c1', clinic_name: 'Clinica Estetica Milano', treatment_id: 't1', treatment_name: 'Filler Labbra', date: '2026-03-19', time: '11:30', status: 'pending', deposit_amount: 50, total_amount: 380, created_at: '2026-03-07T10:00:00Z' },
    { id: 'b11', user_id: 'usr_003', user_name: 'Marco Santini', clinic_id: 'c1', clinic_name: 'Clinica Estetica Milano', treatment_id: 't4', treatment_name: 'Peeling Chimico', date: '2026-03-14', time: '09:00', status: 'confirmed', deposit_amount: 30, total_amount: 180, created_at: '2026-03-05T10:00:00Z' },
    { id: 'b12', user_id: 'usr_007', user_name: 'Andrea Fontana', clinic_id: 'c2', clinic_name: 'Derma Clinic Roma', treatment_id: 't6', treatment_name: 'Biostimolazione', date: '2026-03-20', time: '16:30', status: 'confirmed', deposit_amount: 50, total_amount: 350, created_at: '2026-03-08T10:00:00Z' },
  ]

  const reviews: Review[] = [
    { id: 'r1', clinic_id: 'c1', user_id: 'usr_001', user_name: 'Sofia M.', rating: 5, text: 'Esperienza impeccabile. Staff professionale e ambiente curato.', treatment: 'Filler Labbra', created_at: '2026-02-15T10:00:00Z' },
    { id: 'r2', clinic_id: 'c1', user_id: 'usr_004', user_name: 'Alessia P.', rating: 4, text: 'Molto soddisfatta del risultato. Consigliato.', treatment: 'Botox', created_at: '2026-02-20T10:00:00Z' },
    { id: 'r3', clinic_id: 'c2', user_id: 'usr_003', user_name: 'Marco S.', rating: 5, text: 'Finalmente un servizio che mette la trasparenza al primo posto.', treatment: 'Laser Resurfacing', created_at: '2026-02-25T10:00:00Z' },
    { id: 'r4', clinic_id: 'c3', user_id: 'usr_005', user_name: 'Laura M.', rating: 4, text: 'Buon trattamento, tempi di attesa ridotti.', treatment: 'Biostimolazione', created_at: '2026-03-01T10:00:00Z' },
    { id: 'r5', clinic_id: 'c2', user_id: 'usr_006', user_name: 'Chiara V.', rating: 5, text: 'Eccellente, risultato naturale e personale gentilissimo.', treatment: 'Peeling Chimico', created_at: '2026-03-03T10:00:00Z' },
  ]

  const leads: Lead[] = [
    { id: 'l1', source: 'prenota-visita', name: 'Maria Colombo', email: 'maria.c@email.com', phone: '+39 333 1111111', city: 'Milano', treatment: 'Filler Labbra', created_at: '2026-03-01T10:00:00Z' },
    { id: 'l2', source: 'diventa-partner', name: 'Dr. Paolo Neri', email: 'paolo.n@clinica.it', phone: '+39 02 9999999', company: 'Studio Neri', created_at: '2026-03-02T10:00:00Z' },
    { id: 'l3', source: 'trattamenti', name: 'Federica Gallo', email: 'federica.g@email.com', treatment: 'Botox', created_at: '2026-03-03T10:00:00Z' },
    { id: 'l4', source: 'contact', name: 'Roberto Esposito', email: 'roberto.e@email.com', message: 'Vorrei informazioni sui prezzi.', created_at: '2026-03-04T10:00:00Z' },
    { id: 'l5', source: 'exit-intent', name: 'Anna Moretti', email: 'anna.m@email.com', phone: '+39 340 5555555', created_at: '2026-03-05T10:00:00Z' },
  ]

  const payments: Payment[] = [
    { id: 'p1', booking_id: 'b1', user_id: 'usr_001', user_name: 'Sofia Marchetti', clinic_id: 'c1', clinic_name: 'Clinica Estetica Milano', treatment_name: 'Botox', amount: 350, deposit: 50, status: 'paid', created_at: '2026-03-01T10:00:00Z' },
    { id: 'p2', booking_id: 'b2', user_id: 'usr_002', user_name: 'Giulia Rossi', clinic_id: 'c1', clinic_name: 'Clinica Estetica Milano', treatment_name: 'Filler Labbra', amount: 400, deposit: 50, status: 'pending', created_at: '2026-03-02T10:00:00Z' },
    { id: 'p3', booking_id: 'b3', user_id: 'usr_003', user_name: 'Marco Santini', clinic_id: 'c2', clinic_name: 'Derma Clinic Roma', treatment_name: 'Laser Resurfacing', amount: 500, deposit: 80, status: 'paid', created_at: '2026-03-03T10:00:00Z' },
    { id: 'p4', booking_id: 'b4', user_id: 'usr_005', user_name: 'Laura Martini', clinic_id: 'c3', clinic_name: 'Beauty Lab Bologna', treatment_name: 'Biostimolazione', amount: 300, deposit: 50, status: 'paid', created_at: '2026-03-04T10:00:00Z' },
    { id: 'p5', booking_id: 'b5', user_id: 'usr_004', user_name: 'Alessia Peroni', clinic_id: 'c1', clinic_name: 'Clinica Estetica Milano', treatment_name: 'Rinomodellamento', amount: 500, deposit: 70, status: 'paid', created_at: '2026-02-28T10:00:00Z' },
    { id: 'p6', booking_id: 'b6', user_id: 'usr_006', user_name: 'Chiara Verdi', clinic_id: 'c2', clinic_name: 'Derma Clinic Roma', treatment_name: 'Peeling Chimico', amount: 200, deposit: 30, status: 'pending', created_at: '2026-03-05T10:00:00Z' },
    { id: 'p7', booking_id: 'b7', user_id: 'usr_007', user_name: 'Andrea Fontana', clinic_id: 'c3', clinic_name: 'Beauty Lab Bologna', treatment_name: 'Mesoterapia', amount: 250, deposit: 40, status: 'paid', created_at: '2026-02-25T10:00:00Z' },
    { id: 'p8', booking_id: 'b8', user_id: 'usr_001', user_name: 'Sofia Marchetti', clinic_id: 'c2', clinic_name: 'Derma Clinic Roma', treatment_name: 'Lipolaser', amount: 450, deposit: 60, status: 'paid', created_at: '2026-03-06T10:00:00Z' },
    { id: 'p9', booking_id: 'b9', user_id: 'usr_002', user_name: 'Giulia Rossi', clinic_id: 'c3', clinic_name: 'Beauty Lab Bologna', treatment_name: 'Botox', amount: 300, deposit: 50, status: 'refunded', created_at: '2026-02-20T10:00:00Z' },
    { id: 'p10', booking_id: 'b10', user_id: 'usr_005', user_name: 'Laura Martini', clinic_id: 'c1', clinic_name: 'Clinica Estetica Milano', treatment_name: 'Filler Labbra', amount: 380, deposit: 50, status: 'pending', created_at: '2026-03-07T10:00:00Z' },
    { id: 'p11', booking_id: 'b11', user_id: 'usr_003', user_name: 'Marco Santini', clinic_id: 'c1', clinic_name: 'Clinica Estetica Milano', treatment_name: 'Peeling Chimico', amount: 180, deposit: 30, status: 'paid', created_at: '2026-03-05T10:00:00Z' },
    { id: 'p12', booking_id: 'b12', user_id: 'usr_007', user_name: 'Andrea Fontana', clinic_id: 'c2', clinic_name: 'Derma Clinic Roma', treatment_name: 'Biostimolazione', amount: 350, deposit: 50, status: 'paid', created_at: '2026-03-08T10:00:00Z' },
  ]

  writeCollection('clinics', clinics)
  writeCollection('treatments', treatments)
  writeCollection('users', users)
  writeCollection('bookings', bookings)
  writeCollection('reviews', reviews)
  writeCollection('leads', leads)
  writeCollection('payments', payments)
  writeCollection('notifications', [])

  const funnelEvents: FunnelEvent[] = [
    { id: 'fe1', funnel: 'booking', step: 'page_view', page: '/search', timestamp: '2026-03-05T10:00:00Z' },
    { id: 'fe2', funnel: 'booking', step: 'clinic_view', page: '/clinic/c1', timestamp: '2026-03-05T10:05:00Z' },
    { id: 'fe3', funnel: 'booking', step: 'booking_start', page: '/book/c1/t2', timestamp: '2026-03-05T10:10:00Z' },
    { id: 'fe4', funnel: 'booking', step: 'payment', page: '/book/c1/t2', conversion_value: 350, timestamp: '2026-03-05T10:15:00Z' },
    { id: 'fe5', funnel: 'booking', step: 'confirmed', page: '/book/c1/t2', conversion_type: 'booking', conversion_value: 350, timestamp: '2026-03-05T10:16:00Z' },
    { id: 'fe6', funnel: 'booking', step: 'page_view', page: '/search', timestamp: '2026-03-06T11:00:00Z' },
    { id: 'fe7', funnel: 'booking', step: 'clinic_view', page: '/clinic/c2', timestamp: '2026-03-06T11:05:00Z' },
    { id: 'fe8', funnel: 'booking', step: 'booking_start', page: '/book/c2/t3', timestamp: '2026-03-06T11:10:00Z' },
    { id: 'fe9', funnel: 'booking', step: 'payment', page: '/book/c2/t3', conversion_value: 500, timestamp: '2026-03-06T11:15:00Z' },
    { id: 'fe10', funnel: 'booking', step: 'confirmed', page: '/book/c2/t3', conversion_type: 'booking', conversion_value: 500, timestamp: '2026-03-06T11:16:00Z' },
    { id: 'fe11', funnel: 'lead', step: 'page_view', page: '/lp/prenota-visita', timestamp: '2026-03-07T09:00:00Z' },
    { id: 'fe12', funnel: 'lead', step: 'form_start', form_id: 'prenota-visita', timestamp: '2026-03-07T09:02:00Z' },
    { id: 'fe13', funnel: 'lead', step: 'form_submit', form_id: 'prenota-visita', conversion_type: 'lead', timestamp: '2026-03-07T09:05:00Z' },
    { id: 'fe14', funnel: 'lead', step: 'page_view', page: '/lp/diventa-partner', timestamp: '2026-03-08T14:00:00Z' },
    { id: 'fe15', funnel: 'lead', step: 'form_start', form_id: 'diventa-partner', timestamp: '2026-03-08T14:03:00Z' },
    { id: 'fe16', funnel: 'lead', step: 'form_submit', form_id: 'diventa-partner', conversion_type: 'lead', timestamp: '2026-03-08T14:06:00Z' },
    { id: 'fe17', funnel: 'booking', step: 'page_view', page: '/search', timestamp: '2026-03-09T16:00:00Z' },
    { id: 'fe18', funnel: 'booking', step: 'clinic_view', page: '/clinic/c3', timestamp: '2026-03-09T16:05:00Z' },
    { id: 'fe19', funnel: 'lead', step: 'page_view', page: '/lp/trattamenti', timestamp: '2026-03-10T10:30:00Z' },
    { id: 'fe20', funnel: 'lead', step: 'form_start', form_id: 'trattamenti', timestamp: '2026-03-10T10:33:00Z' },
    { id: 'fe21', funnel: 'lead', step: 'form_submit', form_id: 'trattamenti', conversion_type: 'lead', timestamp: '2026-03-10T10:35:00Z' },
    { id: 'fe22', funnel: 'bio', step: 'page_view', page: '/lp/bio', timestamp: '2026-03-11T08:00:00Z' },
    { id: 'fe23', funnel: 'bio', step: 'link_click', page: '/lp/prenota-visita', timestamp: '2026-03-11T08:01:00Z' },
  ]
  writeCollection('funnel_events', funnelEvents)

  localStorage.setItem(SEEDED_KEY, '1')
}

// Initialize on import
seedIfNeeded()

// Public API
export const store = {
  clinics: {
    getAll: () => getAll<Clinic>('clinics'),
    getById: (id: string) => getById<Clinic>('clinics', id),
    getBySlug: (slug: string) => getAll<Clinic>('clinics').find(c => c.slug === slug),
    search: (query: string, city?: string) =>
      getAll<Clinic>('clinics').filter(c =>
        (!query || c.name.toLowerCase().includes(query.toLowerCase()) || c.city.toLowerCase().includes(query.toLowerCase())) &&
        (!city || c.city.toLowerCase() === city.toLowerCase())
      ),
    create: (data: Omit<Clinic, 'id' | 'created_at'>) => create<Clinic>('clinics', data),
    update: (id: string, data: Partial<Clinic>) => update<Clinic>('clinics', id, data),
    remove: (id: string) => remove('clinics', id),
  },
  treatments: {
    getAll: () => getAll<Treatment>('treatments'),
    getById: (id: string) => getById<Treatment>('treatments', id),
    getByCategory: (category: string) => getAll<Treatment>('treatments').filter(t => t.category === category),
    create: (data: Omit<Treatment, 'id' | 'created_at'>) => create<Treatment>('treatments', data),
    update: (id: string, data: Partial<Treatment>) => update<Treatment>('treatments', id, data),
    remove: (id: string) => remove('treatments', id),
  },
  bookings: {
    getAll: () => getAll<Booking>('bookings'),
    getById: (id: string) => getById<Booking>('bookings', id),
    getByUserId: (userId: string) => getAll<Booking>('bookings').filter(b => b.user_id === userId),
    getByClinicId: (clinicId: string) => getAll<Booking>('bookings').filter(b => b.clinic_id === clinicId),
    create: (data: Omit<Booking, 'id' | 'created_at'>) => create<Booking>('bookings', data),
    update: (id: string, data: Partial<Booking>) => update<Booking>('bookings', id, data),
    remove: (id: string) => remove('bookings', id),
  },
  users: {
    getAll: () => getAll<User>('users'),
    getById: (id: string) => getById<User>('users', id),
    getByRole: (role: string) => getAll<User>('users').filter(u => u.role === role),
    create: (data: Omit<User, 'id' | 'created_at'>) => create<User>('users', data),
    update: (id: string, data: Partial<User>) => update<User>('users', id, data),
    remove: (id: string) => remove('users', id),
  },
  reviews: {
    getAll: () => getAll<Review>('reviews'),
    getByClinicId: (clinicId: string) => getAll<Review>('reviews').filter(r => r.clinic_id === clinicId),
    create: (data: Omit<Review, 'id' | 'created_at'>) => create<Review>('reviews', data),
    update: (id: string, data: Partial<Review>) => update<Review>('reviews', id, data),
    remove: (id: string) => remove('reviews', id),
  },
  leads: {
    getAll: () => getAll<Lead>('leads'),
    getBySource: (source: string) => getAll<Lead>('leads').filter(l => l.source === source),
    create: (data: Omit<Lead, 'id' | 'created_at'>) => create<Lead>('leads', data),
    update: (id: string, data: Partial<Lead>) => update<Lead>('leads', id, data),
    remove: (id: string) => remove('leads', id),
  },
  payments: {
    getAll: () => getAll<Payment>('payments'),
    getByStatus: (status: string) => getAll<Payment>('payments').filter(p => p.status === status),
    create: (data: Omit<Payment, 'id' | 'created_at'>) => create<Payment>('payments', data),
    update: (id: string, data: Partial<Payment>) => update<Payment>('payments', id, data),
  },
  notifications: {
    getAll: () => getAll<Notification>('notifications'),
    getUnread: () => getAll<Notification>('notifications').filter(n => !n.read),
    create: (data: Omit<Notification, 'id' | 'created_at'>) => create<Notification>('notifications', data),
    markRead: (id: string) => update<Notification>('notifications', id, { read: true }),
    remove: (id: string) => remove('notifications', id),
    removeAll: () => writeCollection('notifications', []),
  },
  funnel: {
    track: (data: Omit<FunnelEvent, 'id' | 'timestamp'>) => {
      const events = readCollection<FunnelEvent>('funnel_events')
      events.push({ ...data, id: generateId(), timestamp: now() })
      writeCollection('funnel_events', events)
    },
    getAll: () => getAll<FunnelEvent>('funnel_events'),
    getByFunnel: (funnel: string) => getAll<FunnelEvent>('funnel_events').filter(e => e.funnel === funnel),
  },
  settings: {
    get: getSettings,
    save: saveSettings,
  },
  reset: () => {
    localStorage.removeItem(SEEDED_KEY)
    const collections: StoreCollection[] = ['clinics', 'treatments', 'bookings', 'users', 'reviews', 'leads', 'payments', 'notifications', 'funnel_events']
    for (const c of collections) localStorage.removeItem(getKey(c))
    localStorage.removeItem(SETTINGS_KEY)
    seedIfNeeded()
  },
}
