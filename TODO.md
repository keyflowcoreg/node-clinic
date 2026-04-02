# Node Clinic - Recovery Status

**Recovered from:** `~/Documents/Fairy/Archives/backup-main/projects/node-clinic/`
**Recovery date:** 2026-04-01
**Status:** ✅ RUNNING LOCALLY

## What Works
- [x] `npm install` - clean install, 305 packages, no errors
- [x] `npm run dev` - Vite dev server starts (port 3000, or next available)
- [x] `npm run build` - Production build succeeds (dist/ ~927KB JS, ~86KB CSS)
- [x] App serves HTML with React 19 SPA correctly
- [x] Hot Module Replacement (HMR) enabled
- [x] All 83 source files present and intact

## What's Broken / Needs Attention
- [ ] **TypeScript errors (14)** - `npm run lint` shows errors:
  - `React` namespace not found in 4 files (QuickReplies, ParallaxHero, ScrollReveal, AdminAnalytics, AdminSettings)
  - `key` prop type errors in CardCarousel and MultiStepForm
  - Type narrowing issues in ExitIntentPopup (string | number | symbol → string)
  - None of these block dev or build, but should be fixed before CI
- [ ] **Supabase not configured** - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` empty in .env
- [ ] **Gemini API key placeholder** - `GEMINI_API_KEY="***"` needs real key for AI chatbot
- [ ] **No Supabase backend yet** - using in-memory store (`src/services/store.ts`)
- [ ] **Bundle too large** - 927KB JS chunk, needs code-splitting
- [ ] **Package name** - still "react-example", should be "node-clinic"
- [ ] **No git repo initialized** - needs `git init` and first commit

## Environment Variables (.env)
```
GEMINI_API_KEY=      # Required for AI chatbot
VITE_SUPABASE_URL=   # Supabase project URL
VITE_SUPABASE_ANON_KEY= # Supabase anon key
VITE_MAPS_TILE_URL=  # ✅ Set (CartoDB tiles)
```

## Stack
- React 19 + Vite 6.4.1 + TypeScript 5.8
- Tailwind CSS v4 + Motion v12
- React Router v7 + Leaflet maps
- Lucide icons + clsx + tailwind-merge
- Express (backend, not yet wired)
- better-sqlite3 (local DB, not yet wired)

## Pages (found in src/pages/)
- Home, Search, ClinicDetail, Booking, Contact, About, Legal
- Auth: Login, Register
- User: UserArea, Journal
- Clinic Portal: Bookings, Calendar, Profile, Report
- Admin: Dashboard, Clinics, Bookings, Treatments, Users, Payments, Analytics, Settings, LandingPages
- Landing: PrenotaVisita, LinkInBio, Trattamenti, DiventaPartner
- PartnerApplication

## Priority Next Steps
1. Fix TypeScript errors (quick wins)
2. Set up Supabase project and configure .env
3. Initialize git repo with .gitignore
4. Rename package to "node-clinic"
5. Add code-splitting for route-based chunks
6. Connect Express backend + better-sqlite3 for local dev
