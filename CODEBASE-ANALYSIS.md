# Node Clinic — Complete Codebase Analysis

**Generated:** 2026-04-02
**Total source files:** 83 (.tsx, .ts, .css)
**Stack:** React 19 + Vite 6 + TypeScript + Tailwind v4 + Supabase + Framer Motion

---

## 1. FILE TREE (83 files)

```
src/
├── App.tsx                          # Root router
├── main.tsx                         # Entry point (providers)
├── index.css                        # Global styles
│
├── types/
│   └── database.ts                  # All TypeScript types
│
├── context/
│   ├── AuthContext.tsx               # Auth state (Supabase + demo fallback)
│   └── ToastContext.tsx              # Toast notification system
│
├── services/
│   ├── store.ts                     # localStorage CRUD + seed data
│   └── api.ts                       # Supabase-first API with store fallback
│
├── lib/
│   ├── supabase.ts                  # Supabase client init
│   ├── chatbot-engine.ts            # Chatbot state machine
│   ├── chatbot-flows.ts             # Chatbot conversation flows
│   ├── utils.ts                     # cn() utility (clsx + twMerge)
│   └── images.ts                    # Image asset map
│
├── hooks/
│   ├── useBookingRecovery.ts        # Booking progress persistence
│   └── useAnimations.ts             # Motion variants + hooks
│
├── utils/
│   ├── utm.ts                       # UTM parameter capture
│   └── analytics.ts                 # Funnel event tracking
│
├── components/
│   ├── ErrorBoundary.tsx            # React error boundary
│   ├── ProtectedRoute.tsx           # Auth + role guard
│   ├── LeadForm.tsx                 # Reusable lead capture form
│   ├── layout/
│   │   ├── Header.tsx               # Main site header
│   │   ├── Footer.tsx               # Main site footer
│   │   ├── AdminLayout.tsx          # Admin sidebar layout
│   │   └── LandingLayout.tsx        # Landing page layout wrapper
│   ├── admin/
│   │   ├── AdminModal.tsx           # Reusable admin modal
│   │   ├── ConfirmDialog.tsx        # Confirmation dialog
│   │   ├── EmptyState.tsx           # Empty state component
│   │   ├── Pagination.tsx           # Table pagination
│   │   └── Toast.tsx                # Toast container
│   └── ui/
│       ├── ChatBot.tsx              # Main chatbot widget
│       ├── ClinicMap.tsx            # Leaflet map component
│       ├── MultiStepForm.tsx        # Multi-step form wizard
│       ├── TestimonialSlider.tsx    # Review carousel
│       ├── ImageCarousel.tsx        # Image slideshow
│       ├── SocialProofToast.tsx     # "X just booked" toasts
│       ├── NPSModal.tsx            # Net Promoter Score popup
│       ├── ParallaxHero.tsx         # Parallax hero section
│       ├── UrgencyBadge.tsx         # Scarcity badge
│       ├── ScrollReveal.tsx         # Scroll-triggered reveal
│       ├── AnimatedCard.tsx         # Hover-animated card
│       ├── AnimatedCounter.tsx      # Counting animation
│       ├── ExitIntentPopup.tsx      # Exit-intent popup
│       ├── TreatmentComparison.tsx  # Treatment compare bar
│       ├── SkeletonLoader.tsx       # Loading skeleton
│       └── chatbot/
│           ├── TypingIndicator.tsx  # Typing dots
│           ├── ChatBubble.tsx       # Message bubble
│           ├── QuickReplies.tsx     # Quick reply buttons
│           ├── LeadCaptureForm.tsx  # Chatbot lead form
│           ├── CardCarousel.tsx     # Chatbot card slider
│           ├── ChatTreatmentCard.tsx # Treatment card
│           └── ChatClinicCard.tsx   # Clinic card
│
├── pages/
│   ├── Home.tsx                     # Homepage
│   ├── Search.tsx                   # Search/browse clinics
│   ├── ClinicDetail.tsx             # Single clinic page
│   ├── Booking.tsx                  # 4-step booking wizard
│   ├── UserArea.tsx                 # Patient dashboard
│   ├── PartnerApplication.tsx       # Partner signup form
│   ├── ClinicPortal.tsx             # Clinic staff portal
│   ├── Legal.tsx                    # Terms/Privacy/Cookies
│   ├── About.tsx                    # About page
│   ├── Journal.tsx                  # Blog/journal
│   ├── Contact.tsx                  # Contact form
│   ├── NotFound.tsx                 # 404 page
│   ├── auth/
│   │   ├── Login.tsx                # Login (Supabase + demo)
│   │   └── Register.tsx             # Registration (Supabase)
│   ├── admin/
│   │   ├── AdminDashboard.tsx       # Admin overview
│   │   ├── AdminClinics.tsx         # Clinic CRUD + approval
│   │   ├── AdminBookings.tsx        # All bookings management
│   │   ├── AdminUsers.tsx           # User CRUD
│   │   ├── AdminTreatments.tsx      # Treatment CRUD
│   │   ├── AdminPayments.tsx        # Payment management
│   │   ├── AdminAnalytics.tsx       # Funnel + analytics
│   │   ├── AdminLandingPages.tsx    # Lead sources + leads
│   │   ├── AdminSettings.tsx        # Platform configuration
│   │   └── AdminPlaceholder.tsx     # Placeholder component
│   ├── clinic-portal/
│   │   ├── PortalBookings.tsx       # Clinic's bookings
│   │   ├── PortalCalendar.tsx       # Weekly calendar view
│   │   ├── PortalProfile.tsx        # Clinic profile editor
│   │   └── PortalReport.tsx         # Revenue & analytics
│   └── landing/
│       ├── PrenotaVisita.tsx        # "Book a Visit" LP
│       ├── DiventaPartner.tsx       # "Become a Partner" LP
│       ├── Trattamenti.tsx          # Treatments showcase LP
│       └── LinkInBio.tsx            # Linktree-style bio page
```

---

## 2. COMPLETE ROUTING STRUCTURE

### Auth Routes (no Header/Footer)
| Path | Component | Protection |
|------|-----------|------------|
| `/auth/login` | Login | Public |
| `/auth/register` | Register | Public |

### Landing Pages (standalone LandingLayout, no MainLayout)
| Path | Component | Protection |
|------|-----------|------------|
| `/lp/prenota-visita` | PrenotaVisita | Public |
| `/lp/diventa-partner` | DiventaPartner | Public |
| `/lp/trattamenti` | Trattamenti | Public |
| `/lp/bio` | LinkInBio | Public |

### Admin Routes (AdminLayout, protected role=admin)
| Path | Component | Protection |
|------|-----------|------------|
| `/admin` | AdminDashboard | admin |
| `/admin/clinics` | AdminClinics | admin |
| `/admin/bookings` | AdminBookings | admin |
| `/admin/landing-pages` | AdminLandingPages | admin |
| `/admin/analytics` | AdminAnalytics | admin |
| `/admin/users` | AdminUsers | admin |
| `/admin/treatments` | AdminTreatments | admin |
| `/admin/payments` | AdminPayments | admin |
| `/admin/settings` | AdminSettings | admin |

### Main App Routes (Header + Footer + ChatBot)
| Path | Component | Protection |
|------|-----------|------------|
| `/` | Home | Public |
| `/search` | Search | Public |
| `/clinic/:id` | ClinicDetail | Public |
| `/book/:clinicId/:treatmentId` | Booking | Public |
| `/user` | UserArea | Authenticated (any role) |
| `/partner` | PartnerApplication | Public |
| `/portal` | ClinicPortal | clinic role |
| `/terms` | Legal | Public |
| `/privacy` | Legal | Public |
| `/cookies` | Legal | Public |
| `/about` | About | Public |
| `/journal` | Journal | Public |
| `/contact` | Contact | Public |
| `*` | NotFound | Public |

### Broken/Missing Links Found
| Link Location | Target | Issue |
|---------------|--------|-------|
| Login page | `/auth/forgot-password` | **Route does not exist** — 404 |
| Journal articles | Click on article | **No article detail page** — articles are not clickable links |
| UserArea "Riprogramma" button | N/A | **No handler** — button has no onClick |
| UserArea "Cancella" button | N/A | **No handler** — button has no onClick |
| Header "Trattamenti" | `/search` | Links to Search, not a treatments page |
| Header "Cliniche" | `/search` | Same link as Trattamenti |

---

## 3. USER ROLES & ACCESS CONTROL

### Current Roles (3)
| Role | ID Prefix | Access | Redirect |
|------|-----------|--------|----------|
| `user` (patient) | `usr_` | `/user`, `/book/*`, public pages | `/user` |
| `clinic` (staff) | `cli_` | `/portal`, public pages | `/portal` |
| `admin` | `adm_` | `/admin/*`, all pages | `/admin` |

### Demo Accounts
| Email | Password | Role |
|-------|----------|------|
| demo@nodeclinic.com | demo2026 | user |
| clinica@nodeclinic.com | clinica2026 | clinic |
| admin@nodeclinic.com | admin2026 | admin |

### ProtectedRoute Behavior
- Unauthenticated → redirect to `/auth/login?redirect=<current_path>`
- Wrong role → redirect to `/`
- Supports single role or array of roles
- Shows loading spinner during auth check

### Where 'doctor' Role Needs to Be Added

1. **`src/types/database.ts`** line 4:
   - `UserRole = 'user' | 'clinic' | 'admin'` → add `'doctor'`

2. **`src/context/AuthContext.tsx`** line 6:
   - `UserRole = 'user' | 'clinic' | 'admin'` → add `'doctor'`
   - Add demo account for doctor
   - Add `ROLE_REDIRECTS.doctor = '/doctor'` (or `/portal`)

3. **`src/context/AuthContext.tsx`** line 58:
   - `ROLE_REDIRECTS` needs doctor entry

4. **`src/components/ProtectedRoute.tsx`**:
   - Already supports array of roles — no change needed

5. **`src/components/layout/Header.tsx`** line 40-44:
   - `roleLink` switch only handles admin/clinic/user — needs doctor case

6. **`src/pages/admin/AdminUsers.tsx`**:
   - `ROLE_LABELS` and `ROLE_BADGE_CLASS` need doctor entry
   - Role select dropdown needs doctor option

7. **`src/services/store.ts`** seed data:
   - Add a demo doctor user

8. **`src/App.tsx`**:
   - Add doctor routes (e.g., `/doctor/*`)
   - Or extend `/portal` to accept `['clinic', 'doctor']`

9. **New pages/components needed**:
   - Doctor dashboard/portal (schedule, patients, notes)
   - Doctor profile management
   - Doctor-specific booking view

10. **`src/pages/ClinicDetail.tsx`**:
    - Practitioners are hardcoded mock data — should link to doctor profiles

11. **Booking type** in `database.ts`:
    - Missing `doctor_id` field — bookings are only linked to clinic, not specific doctor

---

## 4. COMPLETE DATA FLOW

### Types (src/types/database.ts)
```
ClinicStatus: 'active' | 'pending' | 'rejected'
TreatmentCategory: 'iniettivi' | 'laser' | 'corpo' | 'viso' | 'chirurgia'
BookingStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled'
UserRole: 'user' | 'clinic' | 'admin'
UserStatus: 'active' | 'suspended'
LeadSource: 'prenota-visita' | 'diventa-partner' | 'trattamenti' | 'contact' | 'exit-intent' | 'whatsapp' | 'chatbot' | 'bio'
PaymentStatus: 'paid' | 'pending' | 'refunded'

Entities: Clinic, Treatment, Booking, User, Review, Lead, Payment, Notification, FunnelEvent, PlatformSettings
```

### Store (src/services/store.ts) — localStorage-based
- Generic CRUD: getAll, getById, create, update, remove
- Collections: clinics, treatments, bookings, users, reviews, leads, payments, notifications, funnel_events
- Seeds 3 clinics, 8 treatments, 10 users, 12 bookings, 5 reviews, 5 leads, 12 payments, 23 funnel events
- Emits `store-update` CustomEvent on writes
- Settings stored separately as singleton

### API Layer (src/services/api.ts) — Supabase-first with store fallback
- `api.clinics.list()`, `getById()`, `getBySlug()`, `search()`
- `api.treatments.list()`, `getById()`
- `api.bookings.create()`, `getByUserId()`, `update()`
- `api.leads.submit()`
- `api.reviews.getByClinicId()`, `create()`
- Pattern: try Supabase → catch → fallback to store

### Auth (src/context/AuthContext.tsx)
- Supabase session check on mount
- Falls back to demo localStorage
- Demo accounts for 3 roles
- Listens for Supabase auth state changes + localStorage cross-tab sync

---

## 5. ALL FORMS AND WHAT THEY SUBMIT

| Form | Location | Fields | Submits To |
|------|----------|--------|------------|
| Home Search | Home.tsx | query text | Navigates to `/search?q=` |
| Search Filters | Search.tsx | query, location, treatmentFilter, cityFilter, sortBy | Local state filtering |
| Login | Login.tsx | email, password | `auth.login()` → Supabase or demo |
| Register | Register.tsx | firstName, lastName, email, password | `auth.register()` → Supabase |
| Booking Wizard | Booking.tsx | date, time, firstName, lastName, phone, email, OTP, payment | `store.bookings.create()` |
| Partner Application | PartnerApplication.tsx | nomeClinica, citta, indirizzo, nomeCompleto, iscrizioneAlbo, emailProfessionale, telefono, specializzazioni, note | Local state (sets submitted=true) |
| Contact Form | Contact.tsx | name, surname, email, subject, message | `store.leads.create()` source='contact' |
| User Profile | UserArea.tsx (settings) | name, email, phone, dateOfBirth | `localStorage` per user |
| User Privacy | UserArea.tsx (settings) | marketingEmail, whatsapp, smsPromotional | `localStorage` per user |
| Clinic Profile | PortalProfile.tsx | name, description, address, phone, email, website, imageUrl, opening hours, treatments | `store.clinics.update()` |
| Admin Clinic CRUD | AdminClinics.tsx | name, slug, city, address, description, phone, email, website, image_url, status | `store.clinics.create/update()` |
| Admin User CRUD | AdminUsers.tsx | name, email, phone, role, status | `store.users.create/update()` |
| Admin Treatment CRUD | AdminTreatments.tsx | name, slug, category, description, price_from, price_to, duration_min, image_url, status | `store.treatments.create/update()` |
| Admin Settings | AdminSettings.tsx | platform_name, support_email, support_phone, whatsapp_number, commission_rate, notification toggles | `store.settings.save()` |
| Landing: Prenota Visita | PrenotaVisita.tsx | Via MultiStepForm → LeadForm | `store.leads.create()` source='prenota-visita' |
| Landing: Diventa Partner | DiventaPartner.tsx | Via MultiStepForm → LeadForm | `store.leads.create()` source='diventa-partner' |
| Landing: Trattamenti | Trattamenti.tsx | search input | Local navigation |
| Chatbot Lead | chatbot/LeadCaptureForm.tsx | name, email, phone | `store.leads.create()` source='chatbot' |
| Exit Intent Popup | ExitIntentPopup.tsx | Via LeadForm | `store.leads.create()` source='exit-intent' |

---

## 6. ADMIN PANEL — COMPLETE MAP

### Dashboard (`/admin`)
- KPI cards: Total Bookings, Active Clinics, Registered Users, Pending Partners
- Monthly revenue counter
- Recent activity list (last 5 bookings)

### Clinics (`/admin/clinics`)
- KPI: Total, Active, Pending
- Search + status filter
- Table: Name, City, Status, Rating, Booking count
- Actions: Approve, Reject, Edit, Delete
- Full CRUD modal with all clinic fields
- Pagination (15/page)

### Bookings (`/admin/bookings`)
- KPI: Total, Confirmed, Pending, Revenue
- Search + status filter
- Table: User, Clinic, Treatment, Date/Time, Status, Amount
- Actions: Confirm, Cancel, Complete
- Confirmation dialog
- Pagination (15/page)

### Landing Pages (`/admin/landing-pages`)
- KPI: Total Leads, Active Sources, Leads This Month
- Sources table with lead counts per source
- 7-day lead chart
- Recent leads table with pagination

### Analytics (`/admin/analytics`)
- Booking funnel visualization (Visite → Ricerca → Avvio → Pagamento → Conferma)
- Lead sources breakdown with progress bars
- Top clinics by bookings table
- Top treatments by revenue table
- No-show rate metric

### Users (`/admin/users`)
- KPI: Total, New This Month, Active
- Search + role filter + status filter
- Table: Name, Email, Role, Status, Registration date
- Actions: Toggle status, Edit, Delete (not admin)
- Full CRUD modal
- Pagination (15/page)

### Treatments (`/admin/treatments`)
- KPI: Total, Active, Categories
- Search + category filter
- Table: Name, Category, Price Range, Duration, Status toggle
- Full CRUD modal with all fields
- Delete confirmation

### Payments (`/admin/payments`)
- KPI: Total Revenue, Deposits Collected, Refunds, Avg Transaction
- 7-day revenue chart
- Status filter + date range filter
- Table: Date, Patient, Clinic, Treatment, Amount, Deposit, Status
- Actions: Refund (paid), Mark Paid (pending)
- Confirmation dialog

### Settings (`/admin/settings`)
- Collapsible sections:
  - Platform: name, support email, support phone
  - WhatsApp: number, commission rate
  - Notifications: email/whatsapp/sms toggles
  - Security: backup info, API status, version

---

## 7. CLINIC PORTAL — COMPLETE MAP

### Dashboard (default tab)
- Clinic name + current date
- Expected revenue today
- KPI: Weekly bookings, No-shows, Rating, Monthly revenue
- Today's appointments with Confirm/Reject/Details actions
- Recent reviews

### Calendar tab
- Weekly calendar view (08:00-20:00)
- Navigate weeks (prev/next/current)
- Booking blocks positioned by time
- Color-coded by status
- Click booking → detail popup
- Click empty slot → highlight as available

### Bookings tab
- Counter cards: Today, This Week, Pending
- Status filter + date filter (today/week/month/all)
- Table: Date, Time, Patient, Treatment, Status, Deposit, Actions
- Actions: Confirm, Cancel, Mark Complete
- Hardcoded to CLINIC_ID = 'c1'

### Profile tab
- Clinic info: name, description, address, phone, email, website
- Opening hours editor (7 days, open/close times, closed toggle)
- Image URL with preview
- Treatment toggles (enable/disable from catalog)
- Save to store

### Report tab
- KPIs: Revenue, Bookings, Avg Rating, No-Show Rate
- 30-day revenue bar chart
- Top treatments by revenue + volume
- CSV export

---

## 8. PATIENT DASHBOARD — COMPLETE MAP

### Appointments tab
- Shows MOCK_APPOINTMENTS (hardcoded, not from store)
- Status badges
- Reschedule/Cancel buttons (NO functionality)
- Balance and deposit info

### Documents tab
- Shows confirmed/completed bookings from store
- Download confirmation as .txt file

### Settings tab
- Personal information form (name, email, phone, DOB)
- Payment methods (mock VISA + Mastercard display)
- Add payment method → shows alert "coming soon"
- Privacy toggles (marketing email, WhatsApp, SMS)
- Save to localStorage per user

---

## 9. BOOKING FLOW — END TO END

**Route:** `/book/:clinicId/:treatmentId`

### Step 0: Slot Selection
- 3 hardcoded dates with time slots
- Date buttons → time grid appears
- Booking summary sidebar (hardcoded "Tossina Botulinica" at "Aesthetic Milano")
- Continue button (requires date + time)

### Step 1: User Details & OTP
- First name, last name, email, phone
- Send OTP button → shows OTP input (6 digits)
- OTP is NOT actually verified (any 6 digits work)

### Step 2: Payment
- Simulated Stripe card form (static UI, no real payment)
- Shows €50 deposit, €300 remaining
- "Pay €50" button

### Step 3: Confirmation
- Creates booking in store with hardcoded data
- Shows confirmation with appointment details
- "Go to User Area" button
- Removes booking progress from localStorage

### Issues in Booking Flow
1. **Treatment/clinic names are hardcoded** — always "Tossina Botulinica" at "Aesthetic Milano"
2. **Prices are hardcoded** — €350 total, €50 deposit regardless of params
3. **OTP verification is fake** — any 6 digits pass
4. **Payment is simulated** — no Stripe integration
5. **user_id hardcoded** to 'usr_001' — doesn't use authenticated user
6. **Booking recovery** checks but only shows if elapsed > 5 minutes (inverted logic — should show if NOT stale)
7. **clinicId/treatmentId params** are captured but not used to fetch real data

---

## 10. LANDING PAGES

### PrenotaVisita (`/lp/prenota-visita`)
- Pain points section, 3-step process explanation
- Featured clinics (mock data, same as Home)
- MultiStepForm lead capture
- Testimonials, FAQ, urgency badges
- Submits lead with source='prenota-visita'

### DiventaPartner (`/lp/diventa-partner`)
- Platform KPIs (1200+ patients, 24 clinics, etc.)
- Partner benefits section
- 4-step onboarding process
- MultiStepForm for clinic registration
- Partner testimonials
- Submits lead with source='diventa-partner'

### Trattamenti (`/lp/trattamenti`)
- 8 treatment cards with prices
- Search input for treatment filtering
- Category badges
- Trust badges (verified doctors, selected clinics, secure deposit)
- Links to search with treatment filter

### LinkInBio (`/lp/bio`)
- Mobile-first Linktree-style page
- 9 links (internal + external)
- Tracks link clicks in funnel
- Social icons (Instagram, TikTok, WhatsApp)

---

## 11. CHATBOT IMPLEMENTATION

### Architecture
- State machine in `chatbot-engine.ts`
- Flow definitions in `chatbot-flows.ts`
- Main widget: `ChatBot.tsx`
- Sub-components: TypingIndicator, ChatBubble, QuickReplies, LeadCaptureForm, CardCarousel, ChatTreatmentCard, ChatClinicCard

### Flows
1. **welcome** — greeting + 8 quick reply options
2. **treatments** — category selection → treatment carousels
3. **booking** — treatment type → city selection → clinic carousel
4. **clinics** — all clinic cards
5. **prices** — price ranges by category
6. **contacts** — phone, email, contact form, WhatsApp, social
7. **existing-booking** — link to user area
8. **partnership** — link to partner landing page
9. **faq** — 4 questions with answers + lead form capture
10. **lead-capture** — lead form in chatbot

### Features
- Typing indicator with delay
- Quick reply buttons with icons
- Card carousels (clinics and treatments)
- Navigation actions (redirect to pages)
- Lead capture form within chat
- Flow-to-flow transitions
- Back to menu from any flow

---

## 12. HARDCODED DATA THAT SHOULD BE DYNAMIC

| File | What's Hardcoded | Should Be |
|------|------------------|-----------|
| Home.tsx | FEATURED_CLINICS (3 clinics) | Fetched from API/store |
| Home.tsx | TREATMENTS (6 treatments) | Fetched from store |
| Home.tsx | REVIEWS (3 reviews) | Fetched from store |
| Search.tsx | MOCK_RESULTS (3 clinics) | **Critical** — should use `api.clinics.search()` |
| Search.tsx | Clinic lat/lng mapping | Should come from clinic data |
| ClinicDetail.tsx | MOCK_CLINIC (entire clinic) | Should use `api.clinics.getById(id)` |
| ClinicDetail.tsx | MOCK_SLOTS (time slots) | Should come from availability API |
| ClinicDetail.tsx | Clinic `id` param is read but ignored | Should fetch real clinic |
| Booking.tsx | MOCK_SLOTS (3 dates) | Should be real availability |
| Booking.tsx | Treatment name "Tossina Botulinica" | Should use `treatmentId` param |
| Booking.tsx | Clinic name "Aesthetic Milano" | Should use `clinicId` param |
| Booking.tsx | Price €350 / deposit €50 | Should come from treatment data |
| Booking.tsx | user_id hardcoded 'usr_001' | Should use `useAuth().user.id` |
| UserArea.tsx | MOCK_APPOINTMENTS | Should fetch from `api.bookings.getByUserId()` |
| ClinicPortal.tsx | MOCK_TODAY, MOCK_REVIEWS | Dashboard should use store data |
| PortalBookings.tsx | CLINIC_ID = 'c1' | Should use authenticated clinic user's clinic |
| PortalCalendar.tsx | CLINIC_ID = 'c1' | Same |
| PortalProfile.tsx | CLINIC_ID = 'c1' | Same |
| PortalReport.tsx | CLINIC_ID = 'c1' | Same |
| chatbot-flows.ts | Cities ['Milano', 'Roma', 'Bologna'] | Should be dynamic from clinics |
| chatbot-flows.ts | WhatsApp number hardcoded | Should come from settings |
| chatbot-flows.ts | Email concierge@nodeclinic.com | Should come from settings |
| store.ts | Support phone/email in defaults | Should be configurable |

---

## 13. TODO / FIXME / HACK COMMENTS

**None found.** The codebase has zero TODO/FIXME/HACK comments.

---

## 14. MISSING FEATURES & INCOMPLETE PAGES

### Critical Missing
1. **Search page uses mock data** — `MOCK_RESULTS` instead of `api.clinics.search()`
2. **ClinicDetail uses mock data** — ignores the `id` URL parameter
3. **Booking wizard uses hardcoded values** — doesn't use URL params
4. **No forgot password page** — Login links to `/auth/forgot-password` (404)
5. **No article detail page** — Journal articles are not routable

### Functional Gaps
6. **UserArea appointment actions** — "Riprogramma" and "Cancella" buttons have no handlers
7. **UserArea uses mock appointments** — not connected to store
8. **Add payment method** — shows `alert()` placeholder
9. **Review submission** — no UI for patients to leave reviews
10. **Notification system** — types defined, store has CRUD, but no UI to display
11. **Partner application** — form submits but doesn't create a lead in store
12. **OTP verification** — completely simulated
13. **Payment processing** — no real Stripe/payment integration
14. **Email sending** — no actual emails sent (booking confirmations, etc.)
15. **Real-time availability** — no slot management system

### Portal Gaps
16. **Portal hardcoded to clinic c1** — authenticated clinic user's actual clinic is not resolved
17. **No doctor management** in portal — can't add/manage doctors
18. **No patient communication** — no messaging system
19. **No document/file upload** — clinic images are URL-only

### Admin Gaps
20. **No review moderation** — reviews can't be managed from admin
21. **No lead management** — leads are view-only, no status/follow-up tracking
22. **No audit log** — no record of admin actions
23. **AdminPlaceholder** exists but is never used in routes

---

## 15. COMPONENT RELATIONSHIPS

### Provider Hierarchy
```
StrictMode
  └── ErrorBoundary
        └── ToastProvider
              └── AuthProvider
                    └── App (Router)
                          ├── Routes...
                          └── ToastContainer
```

### Layout Patterns
- **MainLayout**: Header + main content + Footer + ChatBot (public pages)
- **AdminLayout**: Sidebar nav + content area (admin pages)
- **LandingLayout**: Minimal header/footer wrapper (landing pages)
- **No layout**: Auth pages (Login, Register)

### Shared Components Usage Map
| Component | Used By |
|-----------|---------|
| AnimatedCard | Home, UserArea, ClinicPortal |
| AnimatedCounter | AdminDashboard, AdminClinics, AdminBookings, AdminUsers, AdminTreatments, AdminPayments, AdminAnalytics, AdminLandingPages, AdminSettings, ClinicPortal, PortalReport |
| ScrollReveal | Home, ClinicDetail, Trattamenti |
| ParallaxHero | Home, PrenotaVisita, DiventaPartner, Trattamenti |
| TestimonialSlider | Home, PrenotaVisita |
| MultiStepForm | PartnerApplication, PrenotaVisita, DiventaPartner |
| LeadForm | PrenotaVisita, DiventaPartner, ExitIntentPopup |
| ClinicMap | Search |
| ImageCarousel | ClinicDetail |
| TreatmentComparison | Search |
| ChatBot | MainLayout (all public pages) |
| AdminModal | AdminClinics, AdminUsers |
| ConfirmDialog | AdminClinics, AdminBookings, AdminPayments, AdminUsers |
| Pagination | AdminClinics, AdminBookings, AdminUsers, AdminLandingPages |
| ProtectedRoute | App.tsx (7 uses) |

---

## 16. DATA RELATIONSHIPS

```
User (1) ──── (N) Booking
Clinic (1) ──── (N) Booking
Treatment (1) ──── (N) Booking
Booking (1) ──── (1) Payment
Clinic (1) ──── (N) Review
User (1) ──── (N) Review
Lead ──── standalone (source tracking)
FunnelEvent ──── standalone (analytics)
Notification ──── standalone (unused in UI)
PlatformSettings ──── singleton
```

### Missing Relationships for Doctor Role
```
Doctor (1) ──── (N) Booking       # Which doctor handles the booking
Doctor (N) ──── (N) Clinic        # Doctors work at clinics
Doctor (1) ──── (N) Treatment     # Doctors specialize in treatments
Doctor (1) ──── (N) Review        # Reviews may be doctor-specific
```

---

## 17. SUPABASE INTEGRATION STATUS

### Connected
- Auth: signInWithPassword, signUp, signOut, getSession, onAuthStateChange
- Clinics: list, getById, getBySlug, search
- Treatments: list, getById
- Bookings: create, getByUserId, update
- Leads: submit
- Reviews: getByClinicId, create

### Not Connected (localStorage only)
- Users CRUD (admin uses store directly)
- Payments (store only)
- Notifications (store only)
- Funnel events (store only)
- Platform settings (store only)
- All admin write operations

### Fallback Pattern
Every API call follows: try Supabase → catch → console.warn → return store data.
If `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` missing, `supabase` is `null` and all operations use store.

---

## 18. SUMMARY OF PRIORITIES FOR DOCTOR ROLE ADDITION

### Phase 1: Type System
1. Add `'doctor'` to `UserRole` in `types/database.ts` and `AuthContext.tsx`
2. Add `doctor_id?: string` to `Booking` type
3. Create `Doctor` type or extend `User` with doctor-specific fields (specialization, license, bio)

### Phase 2: Auth & Routing
4. Add doctor demo account
5. Add `ROLE_REDIRECTS.doctor`
6. Add doctor routes in `App.tsx`
7. Update `Header.tsx` role link mapping

### Phase 3: Pages
8. Create doctor dashboard (schedule, patients, earnings)
9. Create doctor profile page (public-facing)
10. Extend booking flow to select specific doctor
11. Update ClinicDetail to show real doctors with booking links

### Phase 4: Admin
12. Add doctor role option in AdminUsers
13. Create doctor assignment UI (assign doctors to clinics)
14. Update AdminBookings to show assigned doctor

### Phase 5: Portal
15. Update ClinicPortal to show doctor list
16. Allow doctor users to access a filtered view of portal
17. Doctor-specific reporting

---

*End of analysis. Every source file in the codebase has been read and mapped.*
