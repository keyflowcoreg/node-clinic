import { store } from '../services/store'
import type { Flow, CardData, FlowStep } from './chatbot-engine'

function clinicToCard(c: { id: string; name: string; city: string; image_url: string; rating: number; reviews_count: number }): CardData {
  return {
    type: 'clinic',
    id: c.id,
    title: c.name,
    subtitle: c.city,
    image: c.image_url,
    rating: c.rating,
    reviewCount: c.reviews_count,
    ctaLabel: 'Scopri',
    ctaUrl: '/clinic/' + c.id,
  }
}

function treatmentToCard(t: { id: string; name: string; category: string; price_from: number; price_to: number; duration_min: number; image_url: string }): CardData {
  return {
    type: 'treatment',
    id: t.id,
    title: t.name,
    subtitle: t.category,
    image: t.image_url,
    priceFrom: t.price_from,
    priceTo: t.price_to,
    duration: t.duration_min + ' min',
    ctaLabel: 'Cerca cliniche',
    ctaUrl: '/search?q=' + encodeURIComponent(t.name),
  }
}

const CATEGORIES = [
  { key: 'iniettivi', label: 'Iniettivi', icon: 'Syringe' },
  { key: 'laser', label: 'Laser', icon: 'Zap' },
  { key: 'corpo', label: 'Corpo', icon: 'Activity' },
  { key: 'viso', label: 'Viso', icon: 'Smile' },
  { key: 'chirurgia', label: 'Chirurgia', icon: 'Scissors' },
] as const

function buildWelcomeFlow(): Flow {
  return {
    id: 'welcome',
    entryStep: 'greeting',
    steps: {
      greeting: {
        id: 'greeting',
        messages: [
          {
            type: 'text',
            text: 'Ciao! Sono l\'assistente di Node Clinic. Come posso aiutarti?',
          },
          {
            type: 'quick-replies',
            options: [
              { label: 'Cerco un trattamento', value: 'flow:treatments', icon: 'Search' },
              { label: 'Voglio prenotare', value: 'flow:booking', icon: 'Calendar' },
              { label: 'Info cliniche', value: 'flow:clinics', icon: 'Building2' },
              { label: 'Prezzi', value: 'flow:prices', icon: 'Tag' },
              { label: 'Contattaci', value: 'flow:contacts', icon: 'Phone' },
              { label: 'Ho una prenotazione', value: 'flow:existing-booking', icon: 'ClipboardList' },
              { label: 'Diventa partner', value: 'flow:partnership', icon: 'Handshake' },
              { label: 'FAQ', value: 'flow:faq', icon: 'HelpCircle' },
            ],
          },
        ],
      },
    },
  }
}

function buildTreatmentsFlow(): Flow {
  const steps: Record<string, FlowStep> = {}

  const categoryOnSelect: Record<string, string> = {}
  for (const cat of CATEGORIES) {
    categoryOnSelect[cat.key] = 'list-' + cat.key
  }

  steps.categories = {
    id: 'categories',
    messages: [
      {
        type: 'text',
        text: 'Che tipo di trattamento ti interessa?',
      },
      {
        type: 'quick-replies',
        options: [
          ...CATEGORIES.map((cat) => ({
            label: cat.label,
            value: cat.key,
            icon: cat.icon,
          })),
          { label: 'Torna al menu', value: 'flow:welcome', icon: 'ArrowLeft' },
        ],
      },
    ],
    onSelect: categoryOnSelect,
  }

  for (const cat of CATEGORIES) {
    const treatments = store.treatments.getByCategory(cat.key)
    const cards = treatments.map(treatmentToCard)

    steps['list-' + cat.key] = {
      id: 'list-' + cat.key,
      messages: [
        {
          type: 'text',
          text: 'Ecco i trattamenti ' + cat.label.toLowerCase() + ' disponibili:',
        },
        ...(cards.length > 0
          ? [{ type: 'carousel' as const, cards }]
          : [{ type: 'text' as const, text: 'Nessun trattamento disponibile per questa categoria al momento.' }]
        ),
        {
          type: 'quick-replies',
          options: [
            { label: 'Altra categoria', value: 'flow:treatments', icon: 'ArrowLeft' },
            { label: 'Prenota ora', value: 'flow:booking', icon: 'Calendar' },
            { label: 'Menu principale', value: 'flow:welcome', icon: 'Home' },
          ],
        },
      ],
    }
  }

  return {
    id: 'treatments',
    entryStep: 'categories',
    steps,
  }
}

function buildBookingFlow(): Flow {
  const cities = ['Milano', 'Roma', 'Bologna']
  const steps: Record<string, FlowStep> = {}

  const treatmentOnSelect: Record<string, string> = {}
  for (const cat of CATEGORIES) {
    treatmentOnSelect[cat.key] = 'ask-city'
  }
  treatmentOnSelect['generic'] = 'generic-search'

  steps['ask-treatment'] = {
    id: 'ask-treatment',
    messages: [
      {
        type: 'text',
        text: 'Perfetto! Che tipo di trattamento vorresti prenotare?',
      },
      {
        type: 'quick-replies',
        options: [
          ...CATEGORIES.map((cat) => ({
            label: cat.label,
            value: cat.key,
            icon: cat.icon,
          })),
          { label: 'Non sono sicuro/a', value: 'generic', icon: 'HelpCircle' },
        ],
      },
    ],
    onSelect: treatmentOnSelect,
  }

  const cityOnSelect: Record<string, string> = {}
  for (const city of cities) {
    cityOnSelect['city:' + city] = 'show-clinics'
  }
  cityOnSelect['city:altra'] = 'generic-search'

  steps['ask-city'] = {
    id: 'ask-city',
    messages: [
      {
        type: 'text',
        text: 'In quale citta cerchi?',
      },
      {
        type: 'quick-replies',
        options: [
          ...cities.map((city) => ({
            label: city,
            value: 'city:' + city,
            icon: 'MapPin',
          })),
          { label: 'Altra citta', value: 'city:altra', icon: 'Globe' },
        ],
      },
    ],
    onSelect: cityOnSelect,
  }

  const allClinics = store.clinics.getAll()
  const clinicCards = allClinics.map(clinicToCard)

  steps['show-clinics'] = {
    id: 'show-clinics',
    messages: [
      {
        type: 'text',
        text: 'Ecco le cliniche disponibili:',
      },
      ...(clinicCards.length > 0
        ? [{ type: 'carousel' as const, cards: clinicCards }]
        : [{ type: 'text' as const, text: 'Nessuna clinica disponibile al momento.' }]
      ),
      {
        type: 'quick-replies',
        options: [
          { label: 'Cambia citta', value: 'flow:booking', icon: 'ArrowLeft' },
          { label: 'Menu principale', value: 'flow:welcome', icon: 'Home' },
        ],
      },
    ],
  }

  steps['generic-search'] = {
    id: 'generic-search',
    messages: [
      {
        type: 'text',
        text: 'Puoi cercare tra tutte le nostre cliniche e trattamenti.',
      },
      {
        type: 'link',
        link: { label: 'Vai alla ricerca', url: '/search' },
      },
      {
        type: 'quick-replies',
        options: [
          { label: 'Menu principale', value: 'flow:welcome', icon: 'Home' },
        ],
      },
    ],
  }

  return {
    id: 'booking',
    entryStep: 'ask-treatment',
    steps,
  }
}

function buildClinicsFlow(): Flow {
  const allClinics = store.clinics.getAll()
  const clinicCards = allClinics.map(clinicToCard)

  return {
    id: 'clinics',
    entryStep: 'list',
    steps: {
      list: {
        id: 'list',
        messages: [
          {
            type: 'text',
            text: 'Le nostre cliniche partner:',
          },
          ...(clinicCards.length > 0
            ? [{ type: 'carousel' as const, cards: clinicCards }]
            : [{ type: 'text' as const, text: 'Nessuna clinica disponibile al momento.' }]
          ),
          {
            type: 'quick-replies',
            options: [
              { label: 'Prenota', value: 'flow:booking', icon: 'Calendar' },
              { label: 'Menu principale', value: 'flow:welcome', icon: 'Home' },
            ],
          },
        ],
      },
    },
  }
}

function buildPricesFlow(): Flow {
  const allTreatments = store.treatments.getAll()

  const grouped: Record<string, { min: number; max: number; names: string[] }> = {}
  for (const t of allTreatments) {
    if (!grouped[t.category]) {
      grouped[t.category] = { min: t.price_from, max: t.price_to, names: [] }
    }
    grouped[t.category].min = Math.min(grouped[t.category].min, t.price_from)
    grouped[t.category].max = Math.max(grouped[t.category].max, t.price_to)
    grouped[t.category].names.push(t.name)
  }

  const categoryLabels: Record<string, string> = {
    iniettivi: 'Iniettivi',
    laser: 'Laser',
    corpo: 'Corpo',
    viso: 'Viso',
    chirurgia: 'Chirurgia',
  }

  const priceMessages = Object.entries(grouped).map(([cat, data]) => ({
    type: 'text' as const,
    text: `${categoryLabels[cat] ?? cat}: da ${data.min}\u20AC a ${data.max}\u20AC\n${data.names.join(', ')}`,
  }))

  return {
    id: 'prices',
    entryStep: 'overview',
    steps: {
      overview: {
        id: 'overview',
        messages: [
          {
            type: 'text',
            text: 'Ecco una panoramica dei prezzi per categoria:',
          },
          ...priceMessages,
          {
            type: 'link',
            link: { label: 'Confronta trattamenti', url: '/lp/trattamenti' },
          },
          {
            type: 'quick-replies',
            options: [
              { label: 'Vedi trattamenti', value: 'flow:treatments', icon: 'List' },
              { label: 'Menu principale', value: 'flow:welcome', icon: 'Home' },
            ],
          },
        ],
      },
    },
  }
}

function buildContactsFlow(): Flow {
  return {
    id: 'contacts',
    entryStep: 'options',
    steps: {
      options: {
        id: 'options',
        messages: [
          {
            type: 'text',
            text: 'Come preferisci contattarci?',
          },
          {
            type: 'quick-replies',
            options: [
              { label: 'Telefono', value: 'phone', icon: 'Phone' },
              { label: 'Email', value: 'email', icon: 'Mail' },
              { label: 'Form contatto', value: 'nav:/contact', action: 'navigate', url: '/contact', icon: 'FileText' },
              { label: 'WhatsApp', value: 'nav:wa', action: 'navigate', url: 'https://wa.me/393401234567?text=Ciao,%20vorrei%20informazioni', icon: 'MessageCircle' },
              { label: 'I nostri social', value: 'social', icon: 'Share2' },
              { label: 'Menu principale', value: 'flow:welcome', icon: 'Home' },
            ],
          },
        ],
        onSelect: {
          phone: 'show-phone',
          email: 'show-email',
          social: 'social',
        },
      },
      'show-phone': {
        id: 'show-phone',
        messages: [
          {
            type: 'text',
            text: 'Puoi chiamarci al +39 02 1234567\nLun-Ven, 09:00 - 18:00 CET',
          },
          {
            type: 'quick-replies',
            options: [
              { label: 'Altro modo', value: 'flow:contacts', icon: 'ArrowLeft' },
              { label: 'Menu principale', value: 'flow:welcome', icon: 'Home' },
            ],
          },
        ],
      },
      'show-email': {
        id: 'show-email',
        messages: [
          {
            type: 'text',
            text: 'Scrivici a concierge@nodeclinic.com\nRispondiamo entro 24 ore.',
          },
          {
            type: 'quick-replies',
            options: [
              { label: 'Altro modo', value: 'flow:contacts', icon: 'ArrowLeft' },
              { label: 'Menu principale', value: 'flow:welcome', icon: 'Home' },
            ],
          },
        ],
      },
      'social': {
        id: 'social',
        messages: [
          {
            type: 'text',
            text: 'Seguici sui social o visita la nostra pagina link per tutti i canali:',
          },
          {
            type: 'link',
            link: { label: 'I nostri link', url: '/lp/bio' },
          },
          {
            type: 'quick-replies',
            options: [
              { label: 'Altro modo', value: 'flow:contacts', icon: 'ArrowLeft' },
              { label: 'Menu principale', value: 'flow:welcome', icon: 'Home' },
            ],
          },
        ],
      },
    },
  }
}

function buildExistingBookingFlow(): Flow {
  return {
    id: 'existing-booking',
    entryStep: 'info',
    steps: {
      info: {
        id: 'info',
        messages: [
          {
            type: 'text',
            text: 'Puoi controllare lo stato delle tue prenotazioni nella tua area personale.',
          },
          {
            type: 'link',
            link: { label: 'Vai alla tua area', url: '/user' },
          },
          {
            type: 'quick-replies',
            options: [
              { label: 'Contattaci', value: 'flow:contacts', icon: 'Phone' },
              { label: 'Menu principale', value: 'flow:welcome', icon: 'Home' },
            ],
          },
        ],
      },
    },
  }
}

function buildPartnershipFlow(): Flow {
  return {
    id: 'partnership',
    entryStep: 'info',
    steps: {
      info: {
        id: 'info',
        messages: [
          {
            type: 'text',
            text: 'Vuoi far parte del network Node Clinic? Selezioniamo cliniche di eccellenza in tutta Italia.',
          },
          {
            type: 'text',
            text: 'Il processo e\' semplice: compila il form, il nostro team valutera\' la tua struttura, e in pochi giorni sarai online.',
          },
          {
            type: 'link',
            link: { label: 'Diventa partner', url: '/lp/diventa-partner' },
          },
          {
            type: 'quick-replies',
            options: [
              { label: 'Contattaci', value: 'flow:contacts', icon: 'Phone' },
              { label: 'Menu principale', value: 'flow:welcome', icon: 'Home' },
            ],
          },
        ],
      },
    },
  }
}

function buildFaqFlow(): Flow {
  return {
    id: 'faq',
    entryStep: 'list',
    steps: {
      list: {
        id: 'list',
        messages: [
          {
            type: 'text',
            text: 'Domande frequenti:',
          },
          {
            type: 'quick-replies',
            options: [
              { label: 'Serve prenotare online?', value: 'faq-1', icon: 'Calendar' },
              { label: 'E\' richiesta una caparra?', value: 'faq-2', icon: 'CreditCard' },
              { label: 'Posso spostare?', value: 'faq-3', icon: 'Clock' },
              { label: 'Menu principale', value: 'flow:welcome', icon: 'Home' },
            ],
          },
        ],
        onSelect: {
          'faq-1': 'faq-1',
          'faq-2': 'faq-2',
          'faq-3': 'faq-3',
        },
      },
      'faq-1': {
        id: 'faq-1',
        messages: [
          {
            type: 'text',
            text: 'Si, tutte le visite vengono gestite tramite prenotazione online per garantire disponibilita e ridurre i tempi di attesa.',
          },
          {
            type: 'quick-replies',
            options: [
              { label: 'Altra domanda', value: 'flow:faq', icon: 'HelpCircle' },
              { label: 'Menu principale', value: 'flow:welcome', icon: 'Home' },
            ],
          },
        ],
      },
      'faq-2': {
        id: 'faq-2',
        messages: [
          {
            type: 'text',
            text: 'Per alcuni trattamenti e\' previsto un deposito cauzionale, generalmente tra il 20% e il 30% del costo, rimborsabile in caso di cancellazione entro 48 ore.',
          },
          {
            type: 'quick-replies',
            options: [
              { label: 'Altra domanda', value: 'flow:faq', icon: 'HelpCircle' },
              { label: 'Menu principale', value: 'flow:welcome', icon: 'Home' },
            ],
          },
        ],
      },
      'faq-3': {
        id: 'faq-3',
        messages: [
          {
            type: 'text',
            text: 'Si, puoi riprogrammare gratuitamente fino a 48 ore prima dell\'appuntamento dalla tua area personale.',
          },
          {
            type: 'quick-replies',
            options: [
              { label: 'Altra domanda', value: 'flow:faq', icon: 'HelpCircle' },
              { label: 'Menu principale', value: 'flow:welcome', icon: 'Home' },
            ],
          },
        ],
      },
    },
  }
}

function buildLeadCaptureFlow(): Flow {
  return {
    id: 'lead-capture',
    entryStep: 'intro',
    steps: {
      intro: {
        id: 'intro',
        messages: [
          {
            type: 'text',
            text: 'Lasciaci i tuoi contatti e ti aiuteremo a trovare il trattamento perfetto per te.',
          },
          {
            type: 'lead-form',
          },
        ],
        onSelect: {
          submitted: 'thanks',
        },
      },
      thanks: {
        id: 'thanks',
        messages: [
          {
            type: 'text',
            text: 'Grazie! Ti contatteremo al piu\' presto.',
          },
          {
            type: 'quick-replies',
            options: [
              { label: 'Cerca trattamento', value: 'flow:treatments', icon: 'Search' },
              { label: 'Menu principale', value: 'flow:welcome', icon: 'Home' },
            ],
          },
        ],
      },
    },
  }
}

export function getFlows(): Record<string, Flow> {
  return {
    welcome: buildWelcomeFlow(),
    treatments: buildTreatmentsFlow(),
    booking: buildBookingFlow(),
    clinics: buildClinicsFlow(),
    prices: buildPricesFlow(),
    contacts: buildContactsFlow(),
    'existing-booking': buildExistingBookingFlow(),
    partnership: buildPartnershipFlow(),
    faq: buildFaqFlow(),
    'lead-capture': buildLeadCaptureFlow(),
  }
}
