# Node Clinic — Development Roadmap & Fix Plan

**Created:** 2026-04-02
**Stack:** React 19 + Vite 6 + TypeScript + Tailwind v4 + Supabase
**Current State:** Frontend-only MVP demo, 83 source files, 927KB single bundle
**Overall Readiness:** 15/100

---

## TABLE OF CONTENTS

1. [Week 1 — Critical Bug Fixes & Core Functionality](#week-1--critical-bug-fixes--core-functionality)
2. [Week 2 — Important Features & Integration](#week-2--important-features--integration)
3. [Week 3 — Polish, Performance & New Features](#week-3--polish-performance--new-features)
4. [Doctor Dashboard Design](#doctor-dashboard-design)
5. [Stripe Integration Plan](#stripe-integration-plan)
6. [Email Notification System](#email-notification-system)
7. [PWA Improvements](#pwa-improvements)

---

## WEEK 1 — Critical Bug Fixes & Core Functionality

### 1.1 FIX: Search Page Uses Hardcoded Mock Data

**File:** `src/pages/Search.tsx`
**Problem:** Lines 11-51 define `MOCK_RESULTS` array. Lines 87, 73-84 all reference it. The page never calls `api.clinics.search()`.
**Impact:** Search is completely non-functional — always shows same 3 clinics.

**Fix — Replace the entire component's data layer:**

```tsx
// src/pages/Search.tsx — REPLACE lines 1-9 with:
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
```

```tsx
// DELETE lines 11-51 (the entire MOCK_RESULTS constant)

// REPLACE inside Search() function, after state declarations (after line 67),
// ADD new state and data fetching:

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
```

```tsx
// REPLACE lines 73-84 (allTreatmentNames, allCities) — change MOCK_RESULTS to clinics:

const allCities = useMemo(() => {
  const cities = new Set<string>();
  clinics.forEach((c) => cities.add(c.city));
  return Array.from(cities).sort();
}, [clinics]);
```

```tsx
// REPLACE line 87 — change filteredResults to use clinics instead of MOCK_RESULTS:
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
```

```tsx
// REPLACE lines 357-364 (map clinics) — use real lat/lng from Clinic type:
clinics={filteredResults.map(c => ({
  id: c.id,
  name: c.name,
  lat: c.lat ?? 44.0,
  lng: c.lng ?? 11.0,
  rating: c.rating,
  address: c.address
}))}
```

```tsx
// UPDATE the clinic card rendering (lines 265-349) to use Clinic type fields:
// Replace: clinic.location → clinic.address (or `${clinic.city}, ${clinic.address}`)
// Replace: clinic.distance → remove or calculate
// Replace: clinic.image → clinic.image_url
// Replace: clinic.reviews → clinic.reviews_count
// Replace: clinic.priceFrom → remove (not in Clinic type, or derive from treatments)
// Replace: clinic.nextAvailable → 'Prossimamente' (until availability API exists)
// Replace: clinic.treatments array → remove or fetch per-clinic treatments
```

---

### 1.2 FIX: ClinicDetail Ignores URL Params

**File:** `src/pages/ClinicDetail.tsx`
**Problem:** Line 71 captures `const { id } = useParams()` but line 9-60 `MOCK_CLINIC` is used everywhere. The `id` parameter is completely ignored.
**Impact:** Every clinic page shows identical "Aesthetic Milano" data.

**Fix:**

```tsx
// src/pages/ClinicDetail.tsx — REPLACE lines 1-8 with:
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
```

```tsx
// DELETE lines 9-68 (MOCK_CLINIC and MOCK_SLOTS constants entirely)

// REPLACE lines 70-81 of the ClinicDetail function body with:
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
        // Fetch clinic
        const clinicData = id ? await api.clinics.getById(id) : undefined;
        if (clinicData) {
          setClinic(clinicData);
        } else {
          // Fallback to store
          const fallback = id ? store.clinics.getById(id) : undefined;
          setClinic(fallback ?? null);
        }
        // Fetch treatments
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
```

```tsx
// Then REPLACE all MOCK_CLINIC references in the template:
// MOCK_CLINIC.rating → clinic.rating
// MOCK_CLINIC.reviews → clinic.reviews_count
// MOCK_CLINIC.name → clinic.name
// MOCK_CLINIC.location → clinic.address
// MOCK_CLINIC.description → clinic.description
// MOCK_CLINIC.id → clinic.id
// MOCK_CLINIC.treatments → treatments (from state)
// MOCK_CLINIC.practitioners → (empty for now, or derive from store)
// MOCK_CLINIC.images → [clinic.image_url] or IMAGES.clinics fallback

// For treatments in the template, map Treatment type fields:
// treatment.price → `€${treatment.price_from} - €${treatment.price_to}`
// treatment.deposit → `€50` (keep as default until pricing model defined)
// treatment.duration → `${treatment.duration_min} min`
// treatment.category → treatment.category
// Navigate: /book/${clinic.id}/${treatment.id}
```

---

### 1.3 FIX: Booking Wizard Hardcoded Values

**File:** `src/pages/Booking.tsx`
**Problem:** Lines 14-18 define `MOCK_SLOTS`. Lines 162-163 hardcode "Tossina Botulinica" / "Aesthetic Milano". Lines 173-177 hardcode €350/€50. Line 387 hardcodes "Tossina Botulinica". Line 391 hardcodes "€300". Lines 409-421 hardcode all booking data.
**Impact:** Every booking shows same treatment/clinic/price regardless of selection.

**Fix:**

```tsx
// src/pages/Booking.tsx — ADD imports at top (line 5):
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Clinic, Treatment } from '../types/database';
```

```tsx
// ADD state for clinic and treatment data AFTER line 31:
const { user } = useAuth();
const [clinic, setClinic] = useState<Clinic | null>(null);
const [treatment, setTreatment] = useState<Treatment | null>(null);
const [loadingData, setLoadingData] = useState(true);

// Fetch real clinic and treatment data
useEffect(() => {
  async function fetchBookingData() {
    setLoadingData(true);
    try {
      if (clinicId) {
        const c = await api.clinics.getById(clinicId);
        if (c) setClinic(c);
      }
      if (treatmentId) {
        const t = await api.treatments.getById(treatmentId);
        if (t) setTreatment(t);
      }
    } catch {
      // Fallback to store
      if (clinicId) {
        const c = store.clinics.getById(clinicId);
        if (c) setClinic(c);
      }
      if (treatmentId) {
        const t = store.treatments.getById(treatmentId);
        if (t) setTreatment(t);
      }
    } finally {
      setLoadingData(false);
    }
  }
  fetchBookingData();
}, [clinicId, treatmentId]);

// Computed pricing
const totalPrice = treatment?.price_from ?? 350;
const depositAmount = Math.min(50, totalPrice);
const remainingBalance = totalPrice - depositAmount;
const treatmentName = treatment?.name ?? 'Trattamento';
const clinicName = clinic?.name ?? 'Clinica';
```

```tsx
// REPLACE line 162 sidebar summary:
// OLD: <span className="font-medium text-right">Tossina Botulinica<br/>...Aesthetic Milano</span>
// NEW:
<span className="font-medium text-right">
  {treatmentName}<br/>
  <span className="text-xs text-silver font-normal">{clinicName}</span>
</span>
```

```tsx
// REPLACE lines 173-177 pricing:
// OLD: €350 and €50
// NEW:
<div className="flex justify-between pt-2">
  <span className="text-graphite-light">Prezzo Totale</span>
  <span className="font-medium">€{totalPrice}</span>
</div>
<div className="flex justify-between">
  <span className="text-graphite-light">Deposito Richiesto Ora</span>
  <span className="font-medium text-lg">€{depositAmount}</span>
</div>
```

```tsx
// REPLACE line 321 deposit display:
// OLD: <div className="text-3xl font-display font-light">€50</div>
// NEW:
<div className="text-3xl font-display font-light">€{depositAmount}</div>
```

```tsx
// REPLACE line 334 remaining balance:
// OLD: Il saldo rimanente di €300
// NEW:
Il saldo rimanente di €{remainingBalance}
```

```tsx
// REPLACE line 348 button:
// OLD: Paga €50
// NEW:
Paga €{depositAmount}
```

```tsx
// REPLACE line 371 confirmation text:
// OLD: presso Aesthetic Milano
// NEW:
presso {clinicName}
```

```tsx
// REPLACE line 387 treatment name:
// OLD: <span className="font-medium">Tossina Botulinica</span>
// NEW:
<span className="font-medium">{treatmentName}</span>
```

```tsx
// REPLACE line 391 remaining balance:
// OLD: €300 (in clinica)
// NEW:
€{remainingBalance} (in clinica)
```

```tsx
// REPLACE handlePayment function (lines 408-424):
const handlePayment = () => {
  store.bookings.create({
    user_id: user?.id || 'guest',
    user_name: `${formData.firstName} ${formData.lastName}`,
    clinic_id: clinicId || 'c1',
    clinic_name: clinicName,
    treatment_id: treatmentId || 't1',
    treatment_name: treatmentName,
    date: selectedDate || '',
    time: selectedTime || '',
    status: 'confirmed',
    deposit_amount: depositAmount,
    total_amount: totalPrice,
  });
  localStorage.removeItem('nc_booking_progress');
  handleNext();
};
```

```tsx
// FIX booking recovery logic (line 40):
// OLD: if (elapsed > 5 * 60 * 1000 && ...) — shows recovery for OLD bookings (inverted)
// NEW: if (elapsed < 30 * 60 * 1000 && ...) — shows recovery for bookings less than 30 min old
```

---

### 1.4 FIX: Forgot Password 404

**File:** `src/pages/auth/Login.tsx` line 137
**Problem:** Links to `/auth/forgot-password` which has no route — results in 404.
**Impact:** Users who forget password hit dead end.

**Fix Option A — Create the page:**

```tsx
// NEW FILE: src/pages/auth/ForgotPassword.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (supabase) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (resetError) throw resetError;
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante l\'invio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/auth/login" className="flex items-center gap-2 text-sm text-silver hover:text-graphite mb-8">
          <ArrowLeft className="w-4 h-4" /> Torna al login
        </Link>

        {sent ? (
          <div className="bg-white border border-silver/20 p-8 sharp-edge text-center">
            <CheckCircle2 className="w-12 h-12 text-warm mx-auto mb-4" />
            <h2 className="text-2xl font-display font-light text-graphite mb-4">Email Inviata</h2>
            <p className="text-sm text-graphite-light/70">
              Se un account esiste con {email}, riceverai un link per reimpostare la password.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-silver/20 p-8 sharp-edge">
            <h2 className="text-2xl font-display font-light text-graphite mb-2">Password Dimenticata</h2>
            <p className="text-sm text-graphite-light/70 mb-8">
              Inserisci la tua email e ti invieremo un link per reimpostare la password.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 mb-6 sharp-edge">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-silver mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-silver" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-ivory-dark border border-silver/30 sharp-edge focus:border-graphite focus:ring-0 outline-none text-sm"
                    placeholder="email@esempio.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-graphite text-ivory py-4 text-sm font-medium uppercase tracking-widest hover:bg-graphite-light transition-colors sharp-edge disabled:opacity-50"
              >
                {loading ? 'Invio in corso...' : 'Invia Link di Reset'}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
```

```tsx
// src/App.tsx — ADD import at line 21:
import { ForgotPassword } from './pages/auth/ForgotPassword';

// ADD route after line 59:
<Route path="/auth/forgot-password" element={<ForgotPassword />} />
```

---

### 1.5 FIX: Reschedule/Cancel Buttons Have No Handlers

**File:** `src/pages/UserArea.tsx`
**Problem:** Lines 273-278 — "Riprogramma" and "Cancella" buttons have no `onClick` handlers.
**Impact:** Buttons are completely non-functional; patients cannot manage bookings.

**Fix:**

```tsx
// src/pages/UserArea.tsx — First, replace MOCK_APPOINTMENTS usage with real data.

// REPLACE lines 13-36 (MOCK_APPOINTMENTS) and replace appointments tab to use real bookings:

// ADD after line 80 (where userBookings state is declared):
const [appointments, setAppointments] = useState<Booking[]>([]);
const [cancellingId, setCancellingId] = useState<string | null>(null);

useEffect(() => {
  if (user) {
    const bookings = store.bookings.getAll().filter(
      (b: Booking) => b.user_id === user.id
    );
    setAppointments(bookings);
  }
}, [user]);

function handleReschedule(booking: Booking) {
  // Navigate to booking page with pre-filled clinic/treatment
  navigate(`/book/${booking.clinic_id}/${booking.treatment_id}`);
}

function handleCancel(bookingId: string) {
  setCancellingId(bookingId);
}

function confirmCancel() {
  if (!cancellingId) return;
  store.bookings.update(cancellingId, { status: 'cancelled' });
  setAppointments(prev =>
    prev.map(a => a.id === cancellingId ? { ...a, status: 'cancelled' } : a)
  );
  setCancellingId(null);
}
```

```tsx
// REPLACE lines 271-279 buttons:
// OLD:
// <button className="...">Riprogramma</button>
// <button className="...">Cancella</button>
// NEW:
{apt.status === 'pending' || apt.status === 'confirmed' ? (
  <div className="flex gap-3 mt-6">
    <button
      onClick={() => handleReschedule(apt)}
      className="text-xs font-medium uppercase tracking-widest text-silver hover:text-graphite transition-colors underline decoration-silver/50 underline-offset-4"
    >
      Riprogramma
    </button>
    <button
      onClick={() => handleCancel(apt.id)}
      className="text-xs font-medium uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors underline decoration-red-500/50 underline-offset-4"
    >
      Cancella
    </button>
  </div>
) : null}
```

```tsx
// ADD cancel confirmation modal before the closing </div> of the component:
{cancellingId && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/50 backdrop-blur-sm">
    <div className="bg-white p-8 sharp-edge max-w-md mx-4 shadow-xl">
      <h3 className="font-display text-xl mb-3 text-graphite">Conferma Cancellazione</h3>
      <p className="text-sm text-graphite-light/70 mb-6">
        Sei sicuro di voler cancellare questo appuntamento? Il deposito potrebbe essere rimborsato secondo i termini di servizio.
      </p>
      <div className="flex gap-3">
        <button
          onClick={confirmCancel}
          className="flex-1 bg-red-500 text-white py-3 text-sm font-medium uppercase tracking-widest sharp-edge hover:bg-red-600 transition-colors"
        >
          Conferma Cancellazione
        </button>
        <button
          onClick={() => setCancellingId(null)}
          className="flex-1 border border-silver/30 text-graphite py-3 text-sm font-medium uppercase tracking-widest sharp-edge hover:border-graphite transition-colors"
        >
          Annulla
        </button>
      </div>
    </div>
  </div>
)}
```

---

### 1.6 FIX: Portal Hardcoded to clinic_id 'c1'

**Files:**
- `src/pages/clinic-portal/PortalBookings.tsx` line 8: `const CLINIC_ID = 'c1'`
- `src/pages/clinic-portal/PortalCalendar.tsx` (same pattern)
- `src/pages/clinic-portal/PortalProfile.tsx` (same pattern)
- `src/pages/clinic-portal/PortalReport.tsx` (same pattern)

**Problem:** All portal pages hardcode `CLINIC_ID = 'c1'`, ignoring the authenticated clinic user.
**Impact:** All clinic users see data for clinic c1, not their own clinic.

**Fix — Create a shared hook:**

```tsx
// NEW FILE: src/hooks/useClinicId.ts
import { useAuth } from '../context/AuthContext';
import { store } from '../services/store';

/**
 * Returns the clinic_id for the currently authenticated clinic user.
 * Falls back to 'c1' for demo purposes.
 */
export function useClinicId(): string {
  const { user } = useAuth();

  if (!user) return 'c1';

  // If the user has a clinicName, find the matching clinic
  if (user.clinicName) {
    const allClinics = store.clinics.getAll();
    const match = allClinics.find(c => c.name === user.clinicName);
    if (match) return match.id;
  }

  // For clinic role users, use their ID prefix to derive clinic association
  // In production, this would come from a user-clinic junction table
  if (user.role === 'clinic' && user.id.startsWith('cli_')) {
    // Map cli_001 -> c1, cli_002 -> c2, etc.
    const num = user.id.replace('cli_', '');
    const clinicId = `c${parseInt(num, 10)}`;
    const clinic = store.clinics.getById(clinicId);
    if (clinic) return clinicId;
  }

  return 'c1'; // fallback for demo
}
```

```tsx
// src/pages/clinic-portal/PortalBookings.tsx — REPLACE line 8:
// OLD: const CLINIC_ID = 'c1';
// NEW:
import { useClinicId } from '../../hooks/useClinicId';
// Then inside the component function:
const CLINIC_ID = useClinicId();

// Apply the same pattern to:
// - PortalCalendar.tsx
// - PortalProfile.tsx
// - PortalReport.tsx
```

---

### 1.7 FIX: UserArea Uses Mock Appointments Instead of Store

**File:** `src/pages/UserArea.tsx`
**Problem:** Line 242 uses `MOCK_APPOINTMENTS.map(...)` instead of fetching from store.
**Impact:** Patient dashboard always shows same fake appointments.

**Fix:** (covered in 1.5 above — replace `MOCK_APPOINTMENTS` references with `appointments` state)

```tsx
// REPLACE line 242:
// OLD: {MOCK_APPOINTMENTS.map((apt, i) => (
// NEW: {appointments.map((apt, i) => (

// UPDATE the rendering to use Booking type fields:
// apt.clinic → apt.clinic_name
// apt.treatment → apt.treatment_name
// apt.status === 'in arrivo' → apt.status === 'confirmed' || apt.status === 'pending'
// apt.balance → `€${(apt.total_amount ?? 0) - apt.deposit_amount}`
// apt.deposit → `€${apt.deposit_amount} (Pagato)`
// apt.location → apt.clinic_name (no address in Booking type)
```

---

## WEEK 2 — Important Features & Integration

### 2.1 Code Splitting & Bundle Optimization

**File:** `src/App.tsx`
**Problem:** All 40+ pages imported eagerly on lines 10-38. Bundle is 927KB single chunk.
**Impact:** Slow initial page load for all users.

**Fix:**

```tsx
// src/App.tsx — REPLACE lines 6-38 with lazy imports:
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Search = lazy(() => import('./pages/Search').then(m => ({ default: m.Search })));
const ClinicDetail = lazy(() => import('./pages/ClinicDetail').then(m => ({ default: m.ClinicDetail })));
const Booking = lazy(() => import('./pages/Booking').then(m => ({ default: m.Booking })));
const UserArea = lazy(() => import('./pages/UserArea').then(m => ({ default: m.UserArea })));
const PartnerApplication = lazy(() => import('./pages/PartnerApplication').then(m => ({ default: m.PartnerApplication })));
const ClinicPortal = lazy(() => import('./pages/ClinicPortal').then(m => ({ default: m.ClinicPortal })));
const Legal = lazy(() => import('./pages/Legal').then(m => ({ default: m.Legal })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Journal = lazy(() => import('./pages/Journal').then(m => ({ default: m.Journal })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const Login = lazy(() => import('./pages/auth/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/auth/Register').then(m => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

// Admin pages — separate chunk
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminClinics = lazy(() => import('./pages/admin/AdminClinics').then(m => ({ default: m.AdminClinics })));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings').then(m => ({ default: m.AdminBookings })));
const AdminLandingPages = lazy(() => import('./pages/admin/AdminLandingPages').then(m => ({ default: m.AdminLandingPages })));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics').then(m => ({ default: m.AdminAnalytics })));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers').then(m => ({ default: m.AdminUsers })));
const AdminTreatments = lazy(() => import('./pages/admin/AdminTreatments').then(m => ({ default: m.AdminTreatments })));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments').then(m => ({ default: m.AdminPayments })));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings').then(m => ({ default: m.AdminSettings })));

// Landing pages — separate chunk
const PrenotaVisita = lazy(() => import('./pages/landing/PrenotaVisita').then(m => ({ default: m.PrenotaVisita })));
const DiventaPartner = lazy(() => import('./pages/landing/DiventaPartner').then(m => ({ default: m.DiventaPartner })));
const Trattamenti = lazy(() => import('./pages/landing/Trattamenti').then(m => ({ default: m.Trattamenti })));
const LinkInBio = lazy(() => import('./pages/landing/LinkInBio').then(m => ({ default: m.LinkInBio })));

// Lazy ChatBot (heavy component ~120KB with framer-motion)
const ChatBot = lazy(() => import('./components/ui/ChatBot').then(m => ({ default: m.ChatBot })));
```

```tsx
// ADD loading fallback component:
function PageLoader() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-silver/30 border-t-graphite animate-spin mx-auto mb-4" />
        <p className="text-xs text-silver uppercase tracking-widest">Caricamento...</p>
      </div>
    </div>
  );
}
```

```tsx
// WRAP all routes in Suspense:
function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          {children}
        </Suspense>
      </main>
      <Footer />
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
    </div>
  );
}
```

```tsx
// vite.config.ts — ADD manual chunks for better splitting:
// ADD inside the return object, after plugins:
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-motion': ['motion/react'],
        'vendor-leaflet': ['leaflet', 'react-leaflet'],
        'admin': [
          './src/pages/admin/AdminDashboard',
          './src/pages/admin/AdminClinics',
          './src/pages/admin/AdminBookings',
          './src/pages/admin/AdminUsers',
          './src/pages/admin/AdminTreatments',
          './src/pages/admin/AdminPayments',
          './src/pages/admin/AdminAnalytics',
          './src/pages/admin/AdminSettings',
          './src/pages/admin/AdminLandingPages',
        ],
      },
    },
  },
},
```

**Expected result:** Initial bundle drops from 927KB to ~200KB. Admin panel loads separately (~300KB). Landing pages are separate chunks.

---

### 2.2 Vite Bundle Configuration

**File:** `vite.config.ts`

```tsx
// REPLACE entire file:
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      // REMOVE GEMINI_API_KEY from client bundle — move to Edge Function
      // 'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-motion': ['motion'],
          },
        },
      },
      chunkSizeWarningLimit: 300,
      sourcemap: mode === 'development',
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
```

---

### 2.3 Fix HTML lang attribute

**File:** `index.html`

```html
<!-- REPLACE: <html lang="en"> -->
<!-- WITH:    <html lang="it"> -->
```

---

### 2.4 Add Security Headers

**File:** `vercel.json`

```json
// ADD to headers array:
{
  "key": "Strict-Transport-Security",
  "value": "max-age=31536000; includeSubDomains; preload"
},
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; img-src 'self' images.unsplash.com *.unsplash.com data: blob:; font-src fonts.gstatic.com; connect-src 'self' *.supabase.co"
},
{
  "key": "Permissions-Policy",
  "value": "camera=(), microphone=(), geolocation=()"
},
{
  "key": "X-XSS-Protection",
  "value": "1; mode=block"
}
```

---

### 2.5 Add Input Validation with Zod

```bash
# Install
npm install zod
```

```tsx
// NEW FILE: src/lib/validation.ts
import { z } from 'zod';

export const emailSchema = z.string().email('Email non valida');

export const phoneSchema = z.string()
  .regex(/^\+?[0-9]{8,15}$/, 'Numero di telefono non valido');

export const bookingFormSchema = z.object({
  firstName: z.string().min(2, 'Nome richiesto (min 2 caratteri)'),
  lastName: z.string().min(2, 'Cognome richiesto (min 2 caratteri)'),
  email: emailSchema,
  phone: phoneSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'Password troppo corta (min 6 caratteri)'),
});

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Nome richiesto'),
  surname: z.string().min(2, 'Cognome richiesto'),
  email: emailSchema,
  subject: z.string().min(3, 'Oggetto richiesto'),
  message: z.string().min(10, 'Messaggio troppo corto (min 10 caratteri)'),
});

export const otpSchema = z.string()
  .length(6, 'Il codice deve essere di 6 cifre')
  .regex(/^[0-9]+$/, 'Solo numeri');

export function validateField<T>(schema: z.ZodType<T>, value: unknown): { valid: boolean; error?: string } {
  const result = schema.safeParse(value);
  if (result.success) return { valid: true };
  return { valid: false, error: result.error.errors[0]?.message };
}
```

---

## WEEK 3 — Polish, Performance & New Features

### 3.1 Add SEO Meta Tags

```bash
npm install react-helmet-async
```

```tsx
// NEW FILE: src/components/SEO.tsx
import { Helmet } from 'react-helmet-async';

type SEOProps = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
};

export function SEO({
  title = 'Node Clinic',
  description = 'Prenota trattamenti estetici nelle migliori cliniche italiane.',
  image = '/og-image.jpg',
  url,
  type = 'website',
}: SEOProps) {
  const fullTitle = title === 'Node Clinic' ? title : `${title} | Node Clinic`;
  const fullUrl = url || window.location.href;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="it_IT" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
```

```tsx
// src/main.tsx — WRAP App with HelmetProvider:
import { HelmetProvider } from 'react-helmet-async';

// Wrap: <HelmetProvider><ErrorBoundary>...<App /></ErrorBoundary></HelmetProvider>
```

---

### 3.2 Add Image Lazy Loading

**All image components throughout the codebase — add `loading="lazy"`:**

```tsx
// In every <img> tag across the codebase, add:
// loading="lazy" (for below-fold images)
// width and height attributes to prevent CLS

// Example in Search.tsx line 276-279:
<img
  src={clinic.image_url}
  alt={clinic.name}
  loading="lazy"
  width={256}
  height={192}
  className="w-full h-full object-cover"
/>
```

---

### 3.3 Add Accessibility Improvements

```tsx
// src/App.tsx MainLayout — ADD skip to content link:
function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-graphite focus:text-ivory">
        Vai al contenuto principale
      </a>
      <Header />
      <main id="main-content" className="flex-grow" tabIndex={-1}>
        <Suspense fallback={<PageLoader />}>
          {children}
        </Suspense>
      </main>
      <Footer />
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
    </div>
  );
}
```

```tsx
// Booking.tsx OTP input — ADD accessibility attributes:
// REPLACE line 270-276 OTP input:
<input
  type="text"
  maxLength={6}
  placeholder="000000"
  value={otp}
  onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
  inputMode="numeric"
  autoComplete="one-time-code"
  aria-label="Codice OTP a 6 cifre"
  className="w-full max-w-xs mx-auto text-center text-2xl tracking-[0.5em] bg-white border border-silver/30 p-4 sharp-edge focus:border-graphite focus:ring-0 outline-none transition-colors"
/>
```

---

## DOCTOR DASHBOARD DESIGN

### Doctor vs Clinic Owner — Key Differences

| Feature | Clinic Owner (Portal) | Doctor Dashboard |
|---------|----------------------|------------------|
| **Scope** | Entire clinic operations | Personal schedule only |
| **Bookings** | All clinic bookings | Only their assigned bookings |
| **Revenue** | Clinic-wide revenue | Personal earnings/commission |
| **Staff** | Manage all doctors | View own profile |
| **Profile** | Clinic profile (photos, hours) | Doctor profile (bio, specializations) |
| **Calendar** | All staff calendars | Personal calendar only |
| **Patients** | All clinic patients | Only their patients |
| **Reports** | Clinic P&L, all metrics | Personal performance metrics |
| **Settings** | Clinic settings, hours, treatments | Availability, notification preferences |

### Doctor Dashboard Pages

#### Page 1: Dashboard (`/doctor`)
```
Data needed:
- Today's appointments (filtered by doctor_id)
- This week's appointment count
- Patient count (unique patients seen)
- Average rating (doctor-specific reviews)
- Upcoming appointment (next one)
- Recent patient notes

API calls:
- api.bookings.getByDoctorId(doctorId, { date: today })
- api.reviews.getByDoctorId(doctorId)
```

#### Page 2: Schedule (`/doctor/schedule`)
```
Data needed:
- Weekly calendar view (same as PortalCalendar but filtered by doctor)
- Availability slots management
- Ability to block time off

API calls:
- api.bookings.getByDoctorId(doctorId, { startDate, endDate })
- api.availability.getByDoctorId(doctorId)
- api.availability.update(doctorId, slots)

Features:
- View week by week
- Set recurring availability (e.g., Mon-Fri 9-17)
- Block specific dates (vacations, conferences)
- See booking details on click
```

#### Page 3: Patients (`/doctor/patients`)
```
Data needed:
- List of patients seen (from bookings history)
- Patient visit history
- Treatment notes per visit

API calls:
- api.bookings.getByDoctorId(doctorId) → extract unique patients
- api.patients.getNotes(patientId, doctorId)

Features:
- Search patients by name
- View patient history (past visits, treatments)
- Add clinical notes (encrypted, doctor-only access)
- No access to other doctors' notes
```

#### Page 4: Profile (`/doctor/profile`)
```
Data needed:
- Doctor profile info (name, bio, specializations)
- Photo
- Medical license (Albo Medici number)
- Clinics associated with

Fields:
- Full name, title (Dr., Dr.ssa)
- Specializations (multi-select)
- Bio (markdown/rich text)
- Profile photo
- License number (read-only, verified by admin)
- Languages spoken
- Education & certifications
```

#### Page 5: Earnings (`/doctor/earnings`)
```
Data needed:
- Bookings completed by this doctor
- Commission percentage (from clinic agreement)
- Monthly/weekly breakdown
- Payment history

API calls:
- api.payments.getByDoctorId(doctorId)
- api.earnings.getSummary(doctorId, period)

Features:
- Monthly earnings chart
- Per-treatment breakdown
- Export to CSV
- View pending payments
```

### Type Changes Needed

```tsx
// src/types/database.ts — ADD Doctor type:
export type Doctor = {
  id: string;
  user_id: string;         // links to User
  clinic_ids: string[];     // clinics they work at
  name: string;
  title: string;            // 'Dr.' | 'Dr.ssa' | 'Prof.'
  specializations: string[];
  bio: string;
  photo_url: string;
  license_number: string;   // Albo Medici
  languages: string[];
  education: string[];
  status: 'active' | 'inactive' | 'pending_verification';
  created_at: string;
};

// ADD to Booking type:
export type Booking = {
  // ... existing fields ...
  doctor_id?: string;       // NEW: assigned doctor
  doctor_name?: string;     // NEW: for display
};
```

### Doctor Route Setup

```tsx
// src/App.tsx — ADD doctor routes:

// Import doctor pages (lazy)
const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'));
const DoctorSchedule = lazy(() => import('./pages/doctor/DoctorSchedule'));
const DoctorPatients = lazy(() => import('./pages/doctor/DoctorPatients'));
const DoctorProfile = lazy(() => import('./pages/doctor/DoctorProfile'));
const DoctorEarnings = lazy(() => import('./pages/doctor/DoctorEarnings'));

// ADD routes (replace current /doctor route, line 89):
<Route path="/doctor" element={<ProtectedRoute requiredRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
<Route path="/doctor/schedule" element={<ProtectedRoute requiredRole="doctor"><DoctorSchedule /></ProtectedRoute>} />
<Route path="/doctor/patients" element={<ProtectedRoute requiredRole="doctor"><DoctorPatients /></ProtectedRoute>} />
<Route path="/doctor/profile" element={<ProtectedRoute requiredRole="doctor"><DoctorProfile /></ProtectedRoute>} />
<Route path="/doctor/earnings" element={<ProtectedRoute requiredRole="doctor"><DoctorEarnings /></ProtectedRoute>} />
```

---

## STRIPE INTEGRATION PLAN

### Phase 1: Dependencies & Setup

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

```env
# .env (client-side — public key only)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Server-side ONLY (Supabase Edge Function env)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Phase 2: Supabase Edge Function — Create Payment Intent

```tsx
// supabase/functions/create-payment-intent/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.0.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-12-18.acacia',
});

serve(async (req: Request) => {
  const { booking_id, amount, currency = 'eur', customer_email } = await req.json();

  // Validate amount server-side
  if (!amount || amount < 100) { // minimum 1 EUR in cents
    return new Response(JSON.stringify({ error: 'Invalid amount' }), { status: 400 });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // in cents (5000 = €50.00)
      currency,
      receipt_email: customer_email,
      metadata: {
        booking_id,
      },
      // Enable SCA (Strong Customer Authentication) — required in EU/PSD2
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

### Phase 3: Stripe Webhook Handler

```tsx
// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.0.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-12-18.acacia',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req: Request) => {
  const signature = req.headers.get('stripe-signature')!;
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object as Stripe.PaymentIntent;
      const bookingId = intent.metadata.booking_id;

      // Update booking status
      await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);

      // Create payment record
      await supabase.from('payments').insert({
        booking_id: bookingId,
        stripe_payment_intent_id: intent.id,
        amount: intent.amount / 100,
        currency: intent.currency,
        status: 'paid',
      });

      // Trigger confirmation email (via another Edge Function or queue)
      await supabase.functions.invoke('send-booking-confirmation', {
        body: { booking_id: bookingId },
      });

      break;
    }

    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent;
      const bookingId = intent.metadata.booking_id;
      await supabase
        .from('bookings')
        .update({ status: 'pending' })
        .eq('id', bookingId);
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      const intentId = charge.payment_intent as string;
      await supabase
        .from('payments')
        .update({ status: 'refunded' })
        .eq('stripe_payment_intent_id', intentId);
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
```

### Phase 4: Client-Side Stripe Integration

```tsx
// NEW FILE: src/components/StripePayment.tsx
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

type PaymentFormProps = {
  amount: number;    // in EUR (e.g., 50)
  bookingId: string;
  onSuccess: () => void;
  onError: (message: string) => void;
};

function CheckoutForm({ amount, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/user`,
      },
      redirect: 'if_required',
    });

    if (error) {
      onError(error.message ?? 'Pagamento fallito');
      setProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-graphite text-ivory py-4 text-sm font-medium uppercase tracking-widest hover:bg-graphite-light transition-colors sharp-edge disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {processing ? 'Elaborazione...' : `Paga €${amount}`}
      </button>
    </form>
  );
}

export function StripePayment({ amount, bookingId, onSuccess, onError }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Create payment intent on mount
  useState(() => {
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_id: bookingId,
        amount: amount * 100, // Convert to cents
      }),
    })
      .then(res => res.json())
      .then(data => setClientSecret(data.clientSecret))
      .catch(err => onError(err.message));
  });

  if (!clientSecret) {
    return <div className="text-center py-8 text-silver text-sm">Preparazione pagamento...</div>;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'flat',
          variables: {
            colorPrimary: '#2D2D2D',
            fontFamily: 'Inter, sans-serif',
          },
        },
        locale: 'it',
      }}
    >
      <CheckoutForm
        amount={amount}
        bookingId={bookingId}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}
```

```tsx
// INTEGRATION INTO Booking.tsx — Replace the simulated payment (step 2, case 2):
// REPLACE the "Simulated Stripe Element" div (lines 325-331) with:
import { StripePayment } from '../components/StripePayment';

// In case 2 of renderStepContent:
<StripePayment
  amount={depositAmount}
  bookingId={`temp_${Date.now()}`}
  onSuccess={() => {
    handlePayment();
  }}
  onError={(msg) => {
    // Show error toast
    console.error('Payment failed:', msg);
  }}
/>
```

### Phase 5: Stripe Connect for Clinic Payouts

```
// Future implementation:
// 1. Each clinic onboards via Stripe Connect Express
// 2. Platform takes commission (e.g., 15%)
// 3. On booking payment:
//    - €50 deposit → platform captures
//    - €7.50 commission → platform keeps
//    - €42.50 → transferred to clinic's Stripe account
// 4. Remaining €300 paid directly at clinic (not through platform)
```

---

## EMAIL NOTIFICATION SYSTEM

### Architecture: Supabase Edge Functions + Resend (or SendGrid)

```bash
# Recommended: Resend (modern, React email templates, good DX)
# Alternative: SendGrid, Mailgun, AWS SES
```

### Edge Function: Send Booking Confirmation

```tsx
// supabase/functions/send-booking-confirmation/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const FROM_EMAIL = 'Node Clinic <noreply@nodeclinic.com>';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req: Request) => {
  const { booking_id } = await req.json();

  // Fetch booking with relations
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, clinics(*), treatments(*), users(*)')
    .eq('id', booking_id)
    .single();

  if (!booking) {
    return new Response('Booking not found', { status: 404 });
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="it">
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Inter', sans-serif; background: #FAF8F5; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border: 1px solid #E8E4DF; padding: 40px;">
        <h1 style="font-family: 'Cormorant Garamond', serif; font-size: 28px; color: #2D2D2D; margin-bottom: 8px;">
          Prenotazione Confermata
        </h1>
        <p style="color: #6B6B6B; font-size: 14px; margin-bottom: 32px;">
          Ciao ${booking.user_name}, la tua prenotazione è stata confermata.
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #E8E4DF; color: #9A9590; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Trattamento</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #E8E4DF; text-align: right; font-weight: 500;">${booking.treatment_name}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #E8E4DF; color: #9A9590; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Clinica</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #E8E4DF; text-align: right; font-weight: 500;">${booking.clinic_name}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #E8E4DF; color: #9A9590; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Data</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #E8E4DF; text-align: right; font-weight: 500;">${new Date(booking.date).toLocaleDateString('it-IT')}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #E8E4DF; color: #9A9590; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Ora</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #E8E4DF; text-align: right; font-weight: 500;">${booking.time}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #9A9590; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Deposito Pagato</td>
            <td style="padding: 12px 0; text-align: right; font-weight: 500;">€${booking.deposit_amount}</td>
          </tr>
        </table>

        <a href="https://nodeclinic.com/user" style="display: block; background: #2D2D2D; color: white; text-align: center; padding: 16px; text-decoration: none; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">
          Vai all'Area Utente
        </a>

        <p style="color: #9A9590; font-size: 11px; margin-top: 32px; line-height: 1.6;">
          Puoi cancellare gratuitamente fino a 48 ore prima dell'appuntamento.
          Per assistenza: concierge@nodeclinic.com | +39 02 1234 5678
        </p>
      </div>
    </body>
    </html>
  `;

  // Send via Resend
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: booking.email || booking.users?.email,
      subject: `Prenotazione confermata — ${booking.treatment_name}`,
      html: emailHtml,
    }),
  });

  const result = await res.json();
  return new Response(JSON.stringify(result), {
    status: res.ok ? 200 : 500,
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### Email Types to Implement

| Email | Trigger | Priority |
|-------|---------|----------|
| Booking confirmation | After payment succeeds | Week 2 |
| Booking cancellation | After user/clinic cancels | Week 2 |
| 24h reminder | Cron job, 24h before appointment | Week 3 |
| 1h reminder | Cron job, 1h before appointment | Week 3 |
| Welcome email | After registration | Week 3 |
| Password reset | Handled by Supabase Auth | Week 1 (free) |
| Review request | 24h after completed appointment | Week 3 |
| Clinic: new booking | When patient books | Week 2 |
| Clinic: cancellation | When patient cancels | Week 2 |

### Cron Job for Reminders (Supabase pg_cron)

```sql
-- Enable pg_cron in Supabase Dashboard > Database > Extensions

-- 24-hour reminder: runs every hour
SELECT cron.schedule(
  'booking-reminders-24h',
  '0 * * * *',  -- every hour
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/send-reminders',
    body := '{"type": "24h"}'::jsonb,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    )
  );
  $$
);
```

---

## PWA IMPROVEMENTS

### Current State
- `manifest.json` exists with basic config
- `sw.js` exists with basic cache-first strategy
- No push notification support
- No offline page
- No install prompt

### Phase 1: Enhanced Service Worker with Workbox

```bash
npm install -D vite-plugin-pwa workbox-precaching workbox-routing workbox-strategies
```

```tsx
// vite.config.ts — ADD PWA plugin:
import { VitePWA } from 'vite-plugin-pwa';

// In plugins array, add:
VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'robots.txt', 'og-image.jpg'],
  manifest: {
    name: 'Node Clinic',
    short_name: 'NodeClinic',
    description: 'Prenota trattamenti estetici nelle migliori cliniche italiane',
    theme_color: '#2D2D2D',
    background_color: '#FAF8F5',
    display: 'standalone',
    scope: '/',
    start_url: '/',
    lang: 'it',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'unsplash-images',
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'google-fonts-stylesheets',
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-webfonts',
          expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
        },
      },
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-api',
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
          networkTimeoutSeconds: 5,
        },
      },
    ],
  },
}),
```

### Phase 2: Offline Page

```tsx
// NEW FILE: src/pages/Offline.tsx
export function Offline() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-silver/20 flex items-center justify-center mx-auto mb-8 sharp-edge">
          <svg className="w-10 h-10 text-silver" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M18.364 5.636a9 9 0 010 12.728M5.636 18.364a9 9 0 010-12.728M12 12h.01" />
          </svg>
        </div>
        <h1 className="text-3xl font-display font-light text-graphite mb-4">Sei Offline</h1>
        <p className="text-graphite-light/70 mb-8">
          Sembra che tu sia disconnesso da internet. Alcune funzionalità potrebbero non essere disponibili.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-graphite text-ivory px-8 py-4 text-sm font-medium uppercase tracking-widest hover:bg-graphite-light transition-colors sharp-edge"
        >
          Riprova
        </button>
      </div>
    </div>
  );
}
```

### Phase 3: Push Notifications

```tsx
// supabase/functions/send-push-notification/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;

serve(async (req: Request) => {
  const { subscription, title, body, url } = await req.json();

  // Use web-push library equivalent for Deno
  const payload = JSON.stringify({
    title,
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    data: { url },
  });

  // Send push via Web Push Protocol
  // Implementation depends on web-push library for Deno
  // Alternative: use Firebase Cloud Messaging (FCM)

  return new Response(JSON.stringify({ sent: true }), { status: 200 });
});
```

```tsx
// NEW FILE: src/hooks/usePushNotifications.ts
export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  async function requestPermission() {
    if (!('Notification' in window)) return false;

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
      });
      setSubscription(sub);

      // Save subscription to backend
      await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });

      return true;
    }
    return false;
  }

  return { permission, subscription, requestPermission };
}
```

### Phase 4: Install Prompt

```tsx
// NEW FILE: src/hooks/useInstallPrompt.ts
import { useState, useEffect } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  async function promptInstall() {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsInstallable(false);
    return outcome === 'accepted';
  }

  return { isInstallable, promptInstall };
}
```

---

## COMPLETE TIMELINE SUMMARY

### Week 1 — Critical (Blocking bugs)
| # | Fix | File(s) | Effort |
|---|-----|---------|--------|
| 1.1 | Search page → use real API data | Search.tsx | 3h |
| 1.2 | ClinicDetail → fetch by URL param | ClinicDetail.tsx | 3h |
| 1.3 | Booking → use real clinic/treatment/prices | Booking.tsx | 3h |
| 1.4 | Forgot password → create page + route | ForgotPassword.tsx, App.tsx | 2h |
| 1.5 | Reschedule/Cancel → add handlers | UserArea.tsx | 2h |
| 1.6 | Portal → derive clinic_id from auth | useClinicId.ts, Portal*.tsx | 2h |
| 1.7 | UserArea → use store bookings, not mocks | UserArea.tsx | 1h |
| **Total** | | | **16h** |

### Week 2 — Important (Performance + Security)
| # | Fix | File(s) | Effort |
|---|-----|---------|--------|
| 2.1 | Code splitting (React.lazy) | App.tsx | 3h |
| 2.2 | Bundle optimization (Vite config) | vite.config.ts | 1h |
| 2.3 | HTML lang="it" | index.html | 5m |
| 2.4 | Security headers | vercel.json | 30m |
| 2.5 | Input validation (Zod) | validation.ts, all forms | 4h |
| 2.6 | Stripe integration (Phase 1-3) | Edge functions, StripePayment.tsx | 8h |
| 2.7 | Email confirmations | Edge functions | 4h |
| **Total** | | | **20.5h** |

### Week 3 — Polish (UX + New Features)
| # | Fix | File(s) | Effort |
|---|-----|---------|--------|
| 3.1 | SEO meta tags | SEO.tsx, all pages | 3h |
| 3.2 | Image lazy loading | All image components | 2h |
| 3.3 | Accessibility (skip link, aria, focus) | Multiple files | 4h |
| 3.4 | Doctor Dashboard (5 pages) | doctor/*.tsx | 16h |
| 3.5 | PWA (Workbox, offline, install) | vite.config.ts, sw.ts | 4h |
| 3.6 | Push notifications | Edge function, hook | 4h |
| 3.7 | Email reminders (cron) | Edge function, pg_cron | 3h |
| **Total** | | | **36h** |

---

## FILES TO CREATE (New)

```
src/pages/auth/ForgotPassword.tsx          — Password reset page
src/hooks/useClinicId.ts                   — Derive clinic ID from auth
src/lib/validation.ts                      — Zod validation schemas
src/components/SEO.tsx                     — Per-page meta tags
src/components/StripePayment.tsx           — Stripe Elements wrapper
src/pages/Offline.tsx                      — Offline fallback page
src/hooks/usePushNotifications.ts          — Push notification hook
src/hooks/useInstallPrompt.ts             — PWA install prompt hook
src/pages/doctor/DoctorDashboard.tsx       — Doctor main dashboard
src/pages/doctor/DoctorSchedule.tsx        — Doctor calendar/schedule
src/pages/doctor/DoctorPatients.tsx        — Doctor patient list
src/pages/doctor/DoctorProfile.tsx         — Doctor profile editor
src/pages/doctor/DoctorEarnings.tsx        — Doctor earnings view
supabase/functions/create-payment-intent/  — Stripe payment intent
supabase/functions/stripe-webhook/         — Stripe webhook handler
supabase/functions/send-booking-confirmation/ — Email confirmation
supabase/functions/send-reminders/         — Cron reminder emails
supabase/functions/send-push-notification/ — Push notification sender
```

## FILES TO MODIFY (Existing)

```
src/pages/Search.tsx                       — Replace mock data with API
src/pages/ClinicDetail.tsx                 — Fetch clinic by URL param
src/pages/Booking.tsx                      — Use real data + Stripe
src/pages/UserArea.tsx                     — Real bookings + handlers
src/pages/clinic-portal/PortalBookings.tsx — Dynamic clinic_id
src/pages/clinic-portal/PortalCalendar.tsx — Dynamic clinic_id
src/pages/clinic-portal/PortalProfile.tsx  — Dynamic clinic_id
src/pages/clinic-portal/PortalReport.tsx   — Dynamic clinic_id
src/App.tsx                                — Code splitting + new routes
src/types/database.ts                      — Doctor type + doctor_id on Booking
vite.config.ts                             — Bundle config + PWA plugin
index.html                                 — lang="it"
vercel.json                                — Security headers
src/main.tsx                               — HelmetProvider wrapper
```

---

*End of roadmap. All code changes are specific to exact files and line numbers in the current codebase.*
