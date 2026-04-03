# Node Clinic — Production Readiness Checklist

> **Audit Date:** April 2, 2026
> **Platform:** Healthcare booking platform for Italian private clinics
> **Stack:** React 19 + Vite 6 + TypeScript + Tailwind v4 + Supabase (stubbed)
> **Regulations:** GDPR, Italian healthcare data laws (D.Lgs. 196/2003, D.Lgs. 101/2018)
> **Current State:** MVP / Demo — NOT production-ready

---

## EXECUTIVE SUMMARY

The application is currently a **frontend-only demo** with hardcoded data in localStorage. It has **no real backend, no real authentication, no real payment processing, and no real database**. Every section below reflects critical gaps that MUST be addressed before any real patient data or real payments flow through the system.

**Overall Readiness: 15/100** — Significant work required across all dimensions.

---

## 1. AUTHENTICATION & AUTHORIZATION

### Current State: CRITICAL ❌
- Auth is **entirely fake** — hardcoded demo accounts with plaintext passwords in source code (`AuthContext.tsx`)
- Passwords visible in client bundle: `demo2026`, `clinica2026`, `admin2026`
- Session stored in localStorage as plain JSON (no encryption, no expiry)
- No JWT tokens, no session management, no refresh tokens
- No CSRF protection
- No brute-force protection on login
- Registration (`Register.tsx`) has a TODO: "Implement actual registration" — just navigates away
- ProtectedRoute checks role from localStorage (trivially spoofable via devtools)

### Required Actions:
- [ ] Implement Supabase Auth (email/password + magic link)
- [ ] Enable Supabase Row Level Security (RLS) on all tables
- [ ] Add proper JWT-based session management with refresh tokens
- [ ] Add multi-factor authentication (MFA) — especially for clinic/admin roles
- [ ] Implement password strength requirements (min 12 chars, complexity)
- [ ] Add account lockout after failed attempts (5 attempts → 15 min coolout)
- [ ] Add CSRF tokens for all state-changing operations
- [ ] Remove all hardcoded demo credentials from source code before production
- [ ] Implement proper password hashing (bcrypt/argon2) server-side
- [ ] Add session timeout (30 min inactivity for healthcare compliance)
- [ ] Add audit logging for all auth events

---

## 2. GDPR & PRIVACY COMPLIANCE

### Current State: CRITICAL ❌
- Legal pages exist (Terms, Privacy, Cookies) at `/terms`, `/privacy`, `/cookies` — content is good starting point
- Privacy policy mentions GDPR Art. 9 (health data) — good awareness
- **NO cookie consent banner/modal** — GDPR violation (immediate fine risk)
- **NO mechanism for data deletion** (Right to Erasure, Art. 17)
- **NO mechanism for data export** (Right to Portability, Art. 20)
- **NO explicit consent collection** before processing health data
- **NO Data Processing Agreement (DPA)** framework for clinic partners
- **NO DPO (Data Protection Officer)** contact implemented
- No consent logging/audit trail
- All data stored in localStorage (client-side) — no proper data governance

### Required Actions:
- [ ] **URGENT:** Implement cookie consent banner (before ANY analytics/tracking)
  - Must support: Accept All, Reject All, Customize
  - Must block GA/Ads scripts until consent given
  - Must persist consent choice and be revokable
  - Recommended: Use a library like `react-cookie-consent` or `cookieyes`
- [ ] Implement "Right to Erasure" — user account deletion with cascade to all related data
- [ ] Implement "Right to Data Portability" — JSON/PDF export of user data
- [ ] Implement "Right to Access" — user can view all data held about them
- [ ] Add explicit health data consent checkbox during booking (separate from ToS)
- [ ] Create and implement Data Processing Agreement for clinic partners
- [ ] Implement consent audit trail (timestamp, IP, version of policy accepted)
- [ ] Add DPO contact information to Privacy Policy
- [ ] Implement data retention policy (auto-delete after purpose fulfilled)
- [ ] Add privacy-by-design: data minimization in forms (only collect what's needed)
- [ ] Implement lawful basis documentation for each data processing activity
- [ ] Create DPIA (Data Protection Impact Assessment) — mandatory for health data

---

## 3. HEALTHCARE-SPECIFIC COMPLIANCE (Italian Law)

### Current State: CRITICAL ❌
- Platform facilitates medical bookings but has no healthcare compliance infrastructure
- No integration with Italian healthcare systems (Tessera Sanitaria, SSN)
- No medical disclaimer requiring user acknowledgment before booking
- No informed consent workflow for medical procedures
- Footer disclaimer is good: "La prestazione è della clinica partner, la piattaforma facilita informazione e prenotazione"

### Required Actions:
- [ ] Implement informed consent workflow (digital signature before booking)
- [ ] Add medical disclaimer acknowledgment (interactive, not just text)
- [ ] Verify clinic partner credentials (Albo Medici integration or manual verification)
- [ ] Implement Codice Fiscale collection (required for Italian healthcare)
- [ ] Add age verification (minors require parental consent for aesthetic procedures)
- [ ] Implement cooling-off period logic (diritto di recesso — 14 days for remote contracts)
- [ ] Add fatturazione elettronica support for tax compliance
- [ ] Document compliance with D.Lgs. 196/2003 (Codice Privacy) as amended by D.Lgs. 101/2018
- [ ] Ensure compliance with Garante per la protezione dei dati personali guidelines on health data
- [ ] Add disclaimer that platform is NOT a medical device (avoids MDR complications)
- [ ] Implement proper medical advertising compliance (no misleading before/after claims)

---

## 4. PAYMENT PROCESSING

### Current State: CRITICAL ❌
- Payment UI exists (Booking.tsx, step 2) but is **completely simulated**
- "Simulated Stripe Element" — just static HTML that looks like a card form
- No actual Stripe integration (not in dependencies, no API calls)
- Deposit concept is well-designed (€50 deposit, remainder in clinic)
- No PCI DSS compliance
- No payment validation, no error handling for failed payments
- No refund mechanism implemented
- No invoice generation
- Payment records are just localStorage entries

### Required Actions:
- [ ] **Integrate Stripe** (recommended for EU healthcare):
  - Install `@stripe/stripe-js` and `@stripe/react-stripe-js`
  - Implement Stripe Elements for PCI-compliant card collection
  - Create server-side Payment Intents (Supabase Edge Functions)
  - NEVER handle raw card data in your code
- [ ] Implement Stripe Connect for clinic payouts (split payments)
- [ ] Implement deposit capture + hold pattern:
  - Authorize full amount, capture deposit immediately
  - Release hold after appointment
- [ ] Implement refund logic (48h cancellation policy as per Terms)
- [ ] Add SCA (Strong Customer Authentication) — required in EU (PSD2)
- [ ] Generate electronic invoices (fattura elettronica for Italian law)
- [ ] Implement payment failure handling with retry logic
- [ ] Add payment confirmation emails
- [ ] Implement webhook handlers for async payment events
- [ ] Add idempotency keys to prevent double charges
- [ ] Store payment records in Supabase (not localStorage)

---

## 5. INPUT VALIDATION & SANITIZATION

### Current State: HIGH RISK ❌
- **Zero input sanitization** found in entire codebase
- No DOMPurify, no sanitize-html, no validation library
- Form inputs use basic HTML `required` attribute only — no pattern/format validation
- Booking form: no email format validation beyond `type="email"`
- Phone number: no format validation
- OTP: only checks `length === 6`, doesn't verify it's numeric
- Search query passed directly to URL without sanitization
- No server-side validation (no server exists)
- localStorage data parsed with `JSON.parse` without schema validation

### Required Actions:
- [ ] Install and implement `zod` for runtime schema validation on ALL forms
- [ ] Add email validation (regex + format check)
- [ ] Add Italian phone number validation (`+39` prefix, correct length)
- [ ] Add Codice Fiscale validation (checksum algorithm)
- [ ] Sanitize all user inputs before storage (install `DOMPurify`)
- [ ] Validate OTP as numeric-only
- [ ] Add server-side validation for all API endpoints (Supabase Edge Functions)
- [ ] Implement input length limits on all text fields
- [ ] Add schema validation for localStorage data (handle corruption gracefully)
- [ ] Validate URL parameters (`clinicId`, `treatmentId`) against allowlists

---

## 6. XSS PROTECTION

### Current State: MODERATE ⚠️
- React's JSX auto-escaping provides baseline protection
- **No `dangerouslySetInnerHTML` found** — good
- No DOMPurify or sanitization library
- User input rendered directly in confirmation pages (e.g., `formData.email`)
- Search query rendered in UI without explicit sanitization
- vercel.json has `X-Content-Type-Options: nosniff` — good
- No Content-Security-Policy header

### Required Actions:
- [ ] Add Content-Security-Policy (CSP) header to vercel.json:
  ```
  default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; img-src 'self' images.unsplash.com data:; font-src fonts.gstatic.com; connect-src 'self' *.supabase.co
  ```
- [ ] Add `X-XSS-Protection: 1; mode=block` header
- [ ] Install DOMPurify for any future user-generated content
- [ ] Sanitize search query before rendering
- [ ] Add `Permissions-Policy` header (disable camera, microphone, geolocation)

---

## 7. SECURITY HEADERS

### Current State: PARTIAL ⚠️
- vercel.json includes:
  - ✅ `X-Frame-Options: DENY` (clickjacking protection)
  - ✅ `X-Content-Type-Options: nosniff`
  - ✅ `Referrer-Policy: strict-origin-when-cross-origin`
- Missing critical headers

### Required Actions:
- [ ] Add `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- [ ] Add `Content-Security-Policy` (see XSS section)
- [ ] Add `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- [ ] Add `X-XSS-Protection: 1; mode=block`
- [ ] Add `Cross-Origin-Opener-Policy: same-origin`
- [ ] Add `Cross-Origin-Resource-Policy: same-origin`

---

## 8. RATE LIMITING & ABUSE PREVENTION

### Current State: CRITICAL ❌
- **Zero rate limiting** anywhere
- No CAPTCHA on any form
- No bot detection
- Lead forms can be spammed infinitely
- Booking system has no abuse prevention
- Login has no brute-force protection

### Required Actions:
- [ ] Implement rate limiting on Supabase Edge Functions (or use Vercel Edge Middleware)
- [ ] Add reCAPTCHA v3 or hCaptcha to:
  - Login form
  - Registration form
  - Lead capture forms
  - Contact form
  - Booking form
- [ ] Implement IP-based rate limiting for API calls
- [ ] Add honeypot fields to forms (invisible bot trap)
- [ ] Implement request throttling for search endpoint
- [ ] Add abuse detection for booking spam (same user, rapid bookings)

---

## 9. ERROR HANDLING

### Current State: PARTIAL ⚠️
- ✅ ErrorBoundary component exists and wraps entire app
- ✅ Login has try/catch with user-friendly error messages
- ⚠️ Most async operations have no error handling
- ⚠️ API calls (store.ts) use generic try/catch that silently returns empty arrays
- ⚠️ localStorage parse failures silently handled
- ❌ No error reporting service (Sentry, LogRocket, etc.)
- ❌ No network error handling
- ❌ No loading states for data fetching in many components

### Required Actions:
- [ ] Install and configure Sentry for error tracking
- [ ] Add error boundaries at route level (not just global)
- [ ] Implement proper loading/error/empty states for all data-fetching components
- [ ] Add network connectivity detection (offline banner)
- [ ] Implement retry logic for failed API calls
- [ ] Add user-friendly error messages in Italian for all failure modes
- [ ] Log errors server-side with correlation IDs
- [ ] Add health check endpoint for monitoring

---

## 10. SEO

### Current State: POOR ❌
- `index.html` has only a generic description: "Architectural medical luxury booking platform."
- HTML lang is `en` but content is Italian — **incorrect**
- No Open Graph (og:) meta tags
- No Twitter Card meta tags
- No structured data (JSON-LD / Schema.org)
- No sitemap.xml
- No robots.txt
- No canonical URLs
- No per-page meta tags (SPA limitation without SSR)
- Page title is just "Node Clinic" — no dynamic titles

### Required Actions:
- [ ] Change `<html lang="en">` to `<html lang="it">`
- [ ] Install `react-helmet-async` for per-page meta tags
- [ ] Add Open Graph meta tags per page:
  - og:title, og:description, og:image, og:url, og:type, og:locale
- [ ] Add Twitter Card meta tags
- [ ] Add JSON-LD structured data:
  - `MedicalBusiness` for clinic pages
  - `MedicalProcedure` for treatment pages
  - `FAQPage` for home page FAQ
  - `BreadcrumbList` for navigation
- [ ] Generate sitemap.xml (static or dynamic)
- [ ] Add robots.txt
- [ ] Implement canonical URLs
- [ ] Add dynamic page titles per route
- [ ] Consider SSR/SSG with Vite SSR or migrate to Next.js for SEO-critical pages
- [ ] Implement hreflang if multi-language support is planned

---

## 11. ACCESSIBILITY (a11y)

### Current State: POOR ❌
- Only ~51 a11y-related attributes found across entire codebase
- ✅ `alt` attributes on most images
- ✅ `prefers-reduced-motion` media query respected in CSS — excellent
- ❌ No ARIA labels on interactive elements (buttons, modals, dropdowns)
- ❌ No skip-to-content link
- ❌ No focus management for modals and route changes
- ❌ No keyboard navigation support for custom components
- ❌ Dropdown menus not accessible (no `aria-expanded`, `aria-haspopup`)
- ❌ Mobile menu has no focus trap
- ❌ Color contrast not verified (warm gold on ivory could be problematic)
- ❌ No `aria-live` regions for dynamic content updates
- ❌ OTP input missing `inputmode="numeric"` and `autocomplete="one-time-code"`
- ❌ No screen reader announcements for step progress in booking flow

### Required Actions:
- [ ] Add skip-to-content link
- [ ] Add `aria-label` to all icon-only buttons
- [ ] Implement focus trap for modals (booking recovery, mobile menu, dropdowns)
- [ ] Add `aria-expanded`, `aria-haspopup` to dropdown menus
- [ ] Add `role="alert"` or `aria-live="polite"` for error messages and notifications
- [ ] Add keyboard navigation for booking date/time selection
- [ ] Add `inputmode="numeric"` to OTP and phone inputs
- [ ] Run axe-core audit and fix all violations
- [ ] Verify WCAG 2.1 AA color contrast ratios
- [ ] Add focus visible styles for keyboard navigation
- [ ] Announce route changes to screen readers
- [ ] Test with VoiceOver (macOS) and NVDA (Windows)
- [ ] Add `aria-current="page"` to active navigation items

---

## 12. MOBILE RESPONSIVENESS

### Current State: GOOD ✅
- ✅ Viewport meta tag present: `width=device-width, initial-scale=1.0`
- ✅ `maximum-scale=1.0, user-scalable=no` — debatable (prevents pinch-zoom, a11y concern)
- ✅ Tailwind responsive classes used throughout (sm:, md:, lg:)
- ✅ Mobile navigation menu implemented with AnimatePresence
- ✅ Grid layouts adapt (grid-cols-1 to grid-cols-3)
- ✅ Touch-friendly button sizes
- ⚠️ Some elements may be too small on mobile (date picker buttons)

### Required Actions:
- [ ] Remove `maximum-scale=1.0, user-scalable=no` — prevents accessibility zoom
- [ ] Test all booking flow steps on mobile devices (especially payment step)
- [ ] Ensure touch targets are minimum 44x44px (WCAG requirement)
- [ ] Test on actual devices: iPhone SE (small), iPhone 15, iPad, Android
- [ ] Verify horizontal scrolling doesn't break on mobile
- [ ] Add PWA install prompt for mobile users

---

## 13. ENVIRONMENT VARIABLES & SECRETS

### Current State: MODERATE ⚠️
- ✅ `.env` is in `.gitignore` (via `.env*` pattern)
- ✅ `.env.example` exists with placeholder values
- ⚠️ `GEMINI_API_KEY` is exposed to client bundle via `vite.config.ts` `define` block
  - This embeds the key in the JavaScript bundle — **anyone can extract it**
- ⚠️ Supabase env vars are `VITE_` prefixed (correct for public anon key, but be careful)
- ❌ No validation that required env vars are set at build time
- ❌ `.env` file has `GEMINI_API_KEY="***"` which is a placeholder but pattern is risky

### Required Actions:
- [ ] **CRITICAL:** Move `GEMINI_API_KEY` to server-side only (Supabase Edge Function)
  - NEVER expose API keys in client bundle
  - Remove `process.env.GEMINI_API_KEY` from `vite.config.ts` define block
- [ ] Add build-time env var validation (fail build if required vars missing)
- [ ] Document all env vars in `.env.example` with descriptions
- [ ] Use Vercel Environment Variables UI for production secrets
- [ ] Audit: ensure no secrets in git history (`git log --all -p | grep -i "key\|secret\|password"`)
- [ ] Add Stripe keys as server-side only env vars (never `VITE_` prefixed)
- [ ] Implement env var schema validation with `zod` at app startup

---

## 14. DATA STORAGE & DATABASE

### Current State: CRITICAL ❌
- **ALL data is in localStorage** — this is a demo, not production
- Supabase client is stubbed (`export const supabase = null`)
- No actual database
- No data persistence across devices
- No data backup
- No encryption at rest
- Patient health data in plaintext localStorage — **GDPR/healthcare violation**

### Required Actions:
- [ ] **Set up Supabase project** with proper PostgreSQL schema
- [ ] Design and implement database schema:
  - users, clinics, treatments, bookings, payments, reviews, leads
  - Proper foreign keys, indexes, constraints
- [ ] Enable Row Level Security (RLS) on ALL tables
- [ ] Implement encryption at rest for health-related data
- [ ] Set up automated backups (Supabase provides this)
- [ ] Implement data migration from localStorage to Supabase
- [ ] Add database connection pooling
- [ ] Implement proper data access patterns (no over-fetching)
- [ ] Add audit logging table for all data changes
- [ ] Implement soft deletes for data retention compliance

---

## 15. SSL/HTTPS

### Current State: GOOD ✅ (with gaps)
- ✅ Vercel provides automatic SSL/TLS
- ✅ HTTPS enforced by default on Vercel
- ❌ No HSTS header configured
- ❌ No HSTS preload list submission
- ⚠️ External resources loaded over HTTPS (Unsplash images, Google Fonts)

### Required Actions:
- [ ] Add `Strict-Transport-Security` header to vercel.json
- [ ] Submit domain to HSTS preload list (hstspreload.org)
- [ ] Verify all external resources use HTTPS
- [ ] Configure Supabase with SSL-only connections
- [ ] Add certificate monitoring/alerting

---

## 16. IMAGE OPTIMIZATION

### Current State: POOR ❌
- Local images are PNG files in `/public/assets/images/` — not optimized
- External images from Unsplash use URL params for sizing (good)
- No WebP/AVIF format usage
- No `<picture>` element with responsive srcsets
- No `loading="lazy"` on images
- No image CDN (besides Unsplash)
- No width/height attributes (causes layout shift / CLS)

### Required Actions:
- [ ] Convert local PNG images to WebP (with PNG fallback via `<picture>`)
- [ ] Add `loading="lazy"` to all below-fold images
- [ ] Add explicit `width` and `height` to all `<img>` tags (prevent CLS)
- [ ] Implement responsive images with `srcset` and `sizes`
- [ ] Set up image CDN (Cloudinary, imgix, or Vercel Image Optimization)
- [ ] Compress all images (target <100KB for hero, <50KB for cards)
- [ ] Add blur placeholder for images (progressive loading)
- [ ] Replace picsum.photos placeholder for apple-touch-icon with real icon

---

## 17. PERFORMANCE & BUNDLE

### Current State: MODERATE ⚠️
- ✅ Vite 6 with tree-shaking
- ✅ Tailwind v4 with purging
- ❌ **Zero code splitting** — entire app loads as single bundle
- ❌ No `React.lazy()` or `Suspense` anywhere
- ❌ No route-based code splitting
- ❌ All 40+ page/component files loaded upfront
- ❌ Google Fonts loaded synchronously (render-blocking)
- ❌ Motion (framer-motion) loaded on every page (heavy library ~120KB)
- ⚠️ Service worker caches static files but strategy is basic (cache-first, no revalidation)

### Required Actions:
- [ ] Implement route-based code splitting with `React.lazy()` + `Suspense`:
  ```tsx
  const Home = lazy(() => import('./pages/Home'));
  const Booking = lazy(() => import('./pages/Booking'));
  // etc.
  ```
- [ ] Add `Suspense` fallback with SkeletonLoader
- [ ] Lazy load heavy components:
  - ChatBot (only load when opened)
  - Leaflet map (only on clinic detail page)
  - Motion/Framer Motion (consider lighter alternative or lazy import)
- [ ] Optimize Google Fonts loading:
  - Add `font-display: swap` (already in URL `display=swap` ✅)
  - Preload critical font weights
  - Consider self-hosting fonts
- [ ] Implement proper service worker with workbox:
  - Stale-while-revalidate for API calls
  - Cache-first for static assets
  - Network-first for HTML
- [ ] Add `rel="preconnect"` for external origins (Unsplash, Google Fonts, Supabase)
- [ ] Analyze bundle with `npx vite-bundle-visualizer`
- [ ] Set performance budget (< 200KB initial JS, < 3s LCP)
- [ ] Implement virtual scrolling for long lists (clinics, bookings)

---

## 18. MONITORING & OBSERVABILITY

### Current State: NONE ❌
- No error tracking (Sentry)
- No performance monitoring (Web Vitals)
- No uptime monitoring
- No user analytics beyond localStorage funnel events
- GA4 configured in env but not implemented

### Required Actions:
- [ ] Set up Sentry for error tracking (with PII scrubbing for GDPR)
- [ ] Implement Web Vitals reporting (LCP, FID, CLS, INP)
- [ ] Set up uptime monitoring (Vercel Analytics, UptimeRobot, or Checkly)
- [ ] Implement Google Analytics 4 (with cookie consent gate)
- [ ] Add custom event tracking for funnel analysis
- [ ] Set up alerting for error spikes, downtime, slow responses
- [ ] Implement health check endpoint
- [ ] Add structured logging for server-side functions

---

## 19. TESTING

### Current State: NONE ❌
- Zero test files found
- No testing framework configured
- No unit tests, integration tests, or e2e tests
- No CI/CD pipeline

### Required Actions:
- [ ] Set up Vitest for unit testing
- [ ] Set up React Testing Library for component testing
- [ ] Set up Playwright or Cypress for e2e testing
- [ ] Write tests for:
  - Authentication flow
  - Booking flow (all 4 steps)
  - Payment flow
  - Protected route access control
  - Form validation
  - API/store operations
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Add pre-commit hooks (lint, type-check)
- [ ] Aim for >80% coverage on critical paths
- [ ] Add visual regression testing for UI components

---

## 20. DEPLOYMENT & INFRASTRUCTURE

### Current State: BASIC ⚠️
- ✅ Vercel deployment configured (vercel.json, .vercel/)
- ✅ SPA routing via rewrite rule
- ⚠️ No staging environment
- ⚠️ No environment separation (dev/staging/prod)
- ⚠️ No deployment preview for PRs
- ❌ No database infrastructure (Supabase not set up)
- ❌ No CDN configuration beyond Vercel defaults

### Required Actions:
- [ ] Set up Supabase project (production + staging)
- [ ] Configure Vercel preview deployments for PRs
- [ ] Set up staging environment with separate Supabase instance
- [ ] Implement feature flags for gradual rollout
- [ ] Configure custom domain with proper DNS
- [ ] Set up Vercel Edge Config for runtime configuration
- [ ] Implement blue-green or canary deployments
- [ ] Add rollback procedure documentation

---

## PRIORITY MATRIX

### 🔴 P0 — Must fix BEFORE any real user data (Legal/Compliance blockers)
1. Implement real authentication (Supabase Auth)
2. Set up real database (Supabase PostgreSQL with RLS)
3. Add cookie consent banner
4. Implement Stripe payment integration
5. Remove hardcoded credentials from source
6. Move GEMINI_API_KEY to server-side
7. Fix HTML lang attribute (`en` → `it`)
8. Add GDPR data deletion/export mechanisms
9. Add healthcare consent workflows

### 🟠 P1 — Must fix before public launch
10. Add input validation (zod)
11. Add rate limiting and CAPTCHA
12. Add security headers (CSP, HSTS)
13. Implement code splitting
14. Add error tracking (Sentry)
15. Set up basic test suite
16. Add SEO meta tags and structured data
17. Optimize images (WebP, lazy loading)

### 🟡 P2 — Should fix for production quality
18. Implement proper accessibility (WCAG 2.1 AA)
19. Add monitoring and Web Vitals
20. Set up CI/CD pipeline
21. Add staging environment
22. Implement PWA properly (service worker upgrade)
23. Performance optimization (bundle analysis, fonts)

### 🟢 P3 — Nice to have for launch
24. Visual regression testing
25. Feature flags
26. Multi-language support
27. Advanced analytics dashboard
28. A/B testing infrastructure

---

## ESTIMATED EFFORT

| Category | Effort | Priority |
|----------|--------|----------|
| Authentication (Supabase Auth) | 3-5 days | P0 |
| Database setup + migration | 5-7 days | P0 |
| Stripe integration | 5-7 days | P0 |
| GDPR compliance (consent, deletion, export) | 3-5 days | P0 |
| Healthcare compliance | 3-5 days | P0 |
| Input validation | 2-3 days | P1 |
| Security headers + hardening | 1-2 days | P1 |
| SEO + meta tags | 2-3 days | P1 |
| Code splitting + performance | 2-3 days | P1 |
| Accessibility | 3-5 days | P2 |
| Testing setup + critical tests | 5-7 days | P2 |
| Monitoring + observability | 2-3 days | P2 |
| **Total estimated** | **36-55 days** | — |

---

## LEGAL DISCLAIMER

This checklist is a technical assessment only. For Italian healthcare compliance, GDPR compliance, and PCI DSS compliance, engage qualified legal counsel and certified auditors before going live with real patient data and real payments.

**Key contacts needed:**
- Italian healthcare lawyer (avvocato specializzato in diritto sanitario)
- GDPR/Privacy consultant (DPO candidate)
- PCI DSS Qualified Security Assessor (for Stripe Self-Assessment Questionnaire)
- Garante per la protezione dei dati personali registration (if required)
