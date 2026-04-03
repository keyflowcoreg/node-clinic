# Node Clinic — GDPR Compliance, Legal Framework & CRM/Automation Plan

**Version:** 1.0
**Date:** April 2, 2026
**Classification:** Internal — Confidential

---

## TABLE OF CONTENTS

1. [Current State Analysis](#1-current-state-analysis)
2. [GDPR Compliance Framework (Italian Healthcare)](#2-gdpr-compliance-framework)
3. [Legal Document Requirements](#3-legal-document-requirements)
4. [CRM System Design](#4-crm-system-design)
5. [Email Automation Flows](#5-email-automation-flows)
6. [Funnel Marketing System](#6-funnel-marketing-system)
7. [Implementation Roadmap](#7-implementation-roadmap)
8. [Technical Architecture](#8-technical-architecture)

---

## 1. CURRENT STATE ANALYSIS

### 1.1 What Exists

| Component                    | Status         | Location                        | Notes                                      |
|------------------------------|----------------|---------------------------------|--------------------------------------------|
| Terms of Service page        | ✅ Basic       | src/pages/Legal.tsx `/terms`    | Italian, covers platform role, deposits    |
| Privacy Policy page          | ✅ Basic       | src/pages/Legal.tsx `/privacy`  | Mentions Art. 9, but incomplete            |
| Cookie Policy page           | ✅ Basic       | src/pages/Legal.tsx `/cookies`  | Lists essential + analytics cookies        |
| Cookie Consent Banner        | ❌ MISSING     | —                               | CRITICAL: required by Garante Privacy      |
| Cookie Granular Controls     | ❌ MISSING     | —                               | Must allow per-category opt-in/out         |
| Supabase Integration         | ✅ Exists      | src/lib/supabase.ts             | Used for auth, data storage                |
| Lead Capture Forms           | ✅ Exists      | src/components/LeadForm.tsx     | Collects name, email, phone                |
| Booking System               | ✅ Exists      | src/pages/Booking.tsx           | Processes treatment + personal data        |
| User Area (data access)      | ✅ Basic       | src/pages/UserArea.tsx          | Some data visibility                       |
| Data Deletion Endpoint       | ❌ MISSING     | —                               | Right to erasure not implemented           |
| Data Export Endpoint          | ❌ MISSING     | —                               | Data portability not implemented           |
| DPA for Clinics              | ❌ MISSING     | —                               | Required: NC is data processor             |
| Explicit Health Data Consent | ❌ MISSING     | —                               | Art. 9 requires explicit consent           |
| Email Automation             | ❌ MISSING     | —                               | No Resend/email integration yet            |
| CRM System                   | ❌ MISSING     | —                               | No lead pipeline management                |
| Breach Notification Process  | ❌ MISSING     | —                               | Required: 72h to Garante                   |

### 1.2 Data Flow Mapping

```
Patient → [LeadForm / Booking / ChatBot / ExitIntentPopup / Register]
         → Supabase (profiles, bookings, leads)
         → Shared with: Clinic Partner (booking details only)
         → Payment: Stripe (deposit processing)
```

**Data categories processed:**
- Personal identifiers: name, email, phone
- Health data (Art. 9): treatment preferences, medical interests, booking history
- Financial data: payment info (via Stripe, not stored locally)
- Technical data: IP, browser, cookies (analytics)
- Behavioral data: chatbot interactions, page views

### 1.3 Risk Assessment

| Risk                                           | Severity | Probability |
|------------------------------------------------|----------|-------------|
| No cookie consent banner → Garante fine        | HIGH     | CERTAIN     |
| No explicit Art. 9 consent for health data     | CRITICAL | HIGH        |
| No DPA with clinic partners                    | HIGH     | HIGH        |
| No data deletion mechanism                     | MEDIUM   | MEDIUM      |
| No breach notification procedure               | HIGH     | LOW         |
| Privacy policy missing required GDPR sections  | MEDIUM   | CERTAIN     |

---

## 2. GDPR COMPLIANCE FRAMEWORK

### 2.1 Roles & Responsibilities

| Entity          | GDPR Role        | Responsibilities                                          |
|-----------------|------------------|-----------------------------------------------------------|
| Clinic Partner  | Data Controller  | Determines purposes of patient data processing            |
| Node Clinic     | Data Processor   | Processes data on behalf of clinics; also Joint Controller for lead data |
| Patient/User    | Data Subject     | Rights under GDPR Art. 15-22                              |
| Supabase        | Sub-processor    | Cloud infrastructure, data storage                        |
| Stripe          | Sub-processor    | Payment processing                                        |
| Resend (future) | Sub-processor    | Email delivery                                            |

### 2.2 Legal Bases for Processing

| Processing Activity          | Legal Basis                        | GDPR Article |
|------------------------------|-------------------------------------|-------------|
| Account creation             | Contract performance                | Art. 6(1)(b) |
| Booking facilitation         | Contract performance                | Art. 6(1)(b) |
| Health data (treatment type) | Explicit consent                    | Art. 9(2)(a) |
| Payment processing           | Contract performance                | Art. 6(1)(b) |
| Analytics cookies            | Consent                             | Art. 6(1)(a) |
| Marketing emails             | Consent                             | Art. 6(1)(a) |
| Lead capture                 | Legitimate interest + consent       | Art. 6(1)(f) |
| Legal compliance             | Legal obligation                    | Art. 6(1)(c) |
| Booking reminders            | Legitimate interest                 | Art. 6(1)(f) |

### 2.3 GDPR Compliance Checklist — Italian Healthcare

#### A. Cookie Consent (Garante per la Protezione dei Dati Personali)

- [ ] **Implement cookie consent banner** — must appear on first visit
  - Must block ALL non-essential cookies before consent
  - Must offer granular choices: Essential (always on), Analytics, Marketing, Functional
  - "Accept All" and "Reject All" buttons must be equally prominent (Garante guidelines 2021)
  - Must NOT use dark patterns (pre-checked boxes, confusing wording)
  - Must link to full Cookie Policy
  - Must record consent with timestamp, version, and choices
  - Consent must be withdrawable at any time (persistent settings icon)
  - Re-consent required every 6 months (Garante recommendation)
- [ ] **Cookie wall prohibition** — cannot block access if cookies are rejected
- [ ] **Analytics implementation** — if using Google Analytics, must anonymize IP (or use privacy-friendly alternative like Plausible/Matomo)
- [ ] **Technical implementation:** use `react-cookie-consent` or custom component
  - Store consent in localStorage + Supabase `cookie_consents` table
  - Conditionally load GA/tracking scripts only after consent

#### B. Privacy Policy (Informativa Privacy)

Current policy is incomplete. Must include ALL of the following per Art. 13/14 GDPR:

- [ ] Identity and contact details of the Data Controller (each clinic)
- [ ] Contact details of the Data Protection Officer (DPO)
- [ ] Purposes + legal basis for EACH processing activity (table format)
- [ ] Categories of personal data processed
- [ ] Recipients or categories of recipients (clinics, sub-processors)
- [ ] International data transfers (Supabase servers, Stripe, Resend — specify adequacy decisions or SCCs)
- [ ] Data retention periods (specific, not vague)
- [ ] Data subject rights: access, rectification, erasure, restriction, portability, objection
- [ ] Right to withdraw consent at any time
- [ ] Right to lodge complaint with Garante (include address: Piazza Venezia 11, 00187 Roma)
- [ ] Whether provision of data is statutory/contractual requirement
- [ ] Automated decision-making / profiling disclosure
- [ ] **Health data section (Art. 9):** explicit disclosure that treatment preferences constitute health data

#### C. Health Data — Special Categories (Art. 9 GDPR)

- [ ] **Explicit consent mechanism** — separate, specific, informed consent for health data
  - Cannot be bundled with general T&C acceptance
  - Must explain WHAT health data, WHY it's needed, WHO sees it
  - Must be freely given (service must work without it where possible)
  - Digital signature or explicit checkbox with clear text
- [ ] **Minimize health data collection** — only collect what's strictly necessary
- [ ] **Encryption at rest** — Supabase RLS + column-level encryption for health fields
- [ ] **Access controls** — only authorized clinic staff can view patient health data
- [ ] **Audit logging** — log all access to health data records
- [ ] **Data segregation** — health data in separate tables with stricter access policies

#### D. Data Processing Agreement (DPA) for Clinics

Required under Art. 28 GDPR. Must include:

- [ ] Subject matter and duration of processing
- [ ] Nature and purpose of processing
- [ ] Types of personal data and categories of data subjects
- [ ] Obligations and rights of the controller (clinic)
- [ ] Node Clinic obligations as processor:
  - Process only on documented instructions
  - Ensure confidentiality of personnel
  - Implement appropriate security measures (Art. 32)
  - Conditions for sub-processor engagement
  - Assist controller with data subject rights
  - Assist with breach notification
  - Delete or return all data at end of contract
  - Make available all information for audits
- [ ] List of approved sub-processors (Supabase, Stripe, Resend)
- [ ] International transfer mechanisms
- [ ] Template DPA to be signed by every clinic partner before onboarding

#### E. Patient Consent Forms for Health Data

- [ ] **Pre-booking consent form** — before any treatment data is submitted:
  ```
  ☐ Acconsento al trattamento dei miei dati sanitari (tipo di trattamento,
    preferenze mediche) da parte di Node Clinic S.r.l. per la finalità di
    facilitare la prenotazione presso la clinica selezionata. I miei dati
    sanitari saranno condivisi esclusivamente con [Nome Clinica].
    [Informativa completa] [Revoca consenso]
  ```
- [ ] **Marketing consent** (separate checkbox):
  ```
  ☐ Acconsento a ricevere comunicazioni commerciali e promozionali da
    Node Clinic via email. Posso revocare questo consenso in qualsiasi momento.
  ```
- [ ] **Consent versioning** — store which version of consent text was accepted
- [ ] **Consent withdrawal** — one-click mechanism in User Area

#### F. Right to Erasure (Art. 17)

Implementation plan:

- [ ] **User Area button:** "Cancella il mio account e tutti i miei dati"
- [ ] **API endpoint:** `DELETE /api/v1/users/:id/data`
- [ ] **Process:**
  1. User requests deletion in User Area
  2. Identity verification (re-authentication)
  3. 14-day cooling-off period with confirmation email
  4. Hard delete from: profiles, bookings, leads, cookie_consents
  5. Notify clinic partners to delete their copies
  6. Anonymize analytics data (retain aggregated stats)
  7. Retain: invoices/financial records (legal obligation, 10 years Italy)
  8. Send confirmation of deletion
- [ ] **Supabase implementation:**
  - Edge Function: `delete-user-data`
  - Cascade delete with RLS policies
  - Audit log of deletion request

#### G. Data Portability (Art. 20)

- [ ] **Export endpoint:** `GET /api/v1/users/:id/export`
- [ ] **Format:** JSON and CSV download
- [ ] **Data included:** profile, bookings, consent records, communications
- [ ] **User Area button:** "Scarica i miei dati"
- [ ] **Timeframe:** automated, instant download (or max 30 days per GDPR)
- [ ] **Machine-readable format** as required by Art. 20

#### H. Breach Notification Procedure (Art. 33/34)

- [ ] **Internal procedure document:**
  1. **Detection** — monitoring via Supabase logs, Sentry alerts
  2. **Assessment** — within 24 hours: scope, affected data, risk level
  3. **Notification to Garante** — within 72 hours of awareness
     - Via: https://servizi.gpdp.it/databreach/s/
     - Include: nature of breach, categories of data, approximate number of subjects, likely consequences, measures taken
  4. **Notification to affected users** — without undue delay if high risk
  5. **Notification to clinic partners** — as data controllers, must be informed immediately
  6. **Documentation** — maintain breach register regardless of notification
- [ ] **Breach response team:** CTO (lead), Legal, DPO, CEO
- [ ] **Annual breach simulation/drill**

#### I. DPO (Data Protection Officer)

Per Art. 37 GDPR, DPO is REQUIRED when:
- Core activities involve large-scale processing of special category data (health data)

- [ ] **Appoint DPO** — can be internal or external
- [ ] **Recommended:** external DPO service specializing in Italian healthcare
- [ ] **Publish DPO contact** on website and in privacy policy
- [ ] **Register DPO with Garante** via their online portal
- [ ] **DPO responsibilities:**
  - Advise on GDPR obligations
  - Monitor compliance
  - Cooperate with Garante
  - Point of contact for data subjects
- [ ] **Budget estimate:** €3,000-8,000/year for external DPO service

### 2.4 Italian-Specific Requirements

Beyond GDPR, Italian law adds:

- **D.Lgs. 196/2003** (Codice Privacy, as amended by D.Lgs. 101/2018)
- **Garante Guidelines on Cookies** (June 2021, updated) — strict opt-in required
- **Healthcare data retention:** medical records must be retained per D.M. 18/02/1982
- **Telemedicine regulations** (if applicable in future)
- **Electronic invoicing** (fatturazione elettronica) — retain for 10 years
- **Consent age:** 14 years in Italy (vs. 16 GDPR default)

---

## 3. LEGAL DOCUMENT REQUIREMENTS

### 3.1 Documents to Create

| Document                          | Priority | Status     | Audience       |
|-----------------------------------|----------|------------|----------------|
| Cookie Consent Banner Component   | P0       | TO BUILD   | All visitors   |
| Privacy Policy (full GDPR)        | P0       | TO REWRITE | All users      |
| Terms of Service (expanded)       | P1       | TO EXPAND  | All users      |
| Cookie Policy (expanded)          | P1       | TO EXPAND  | All visitors   |
| DPA Template (IT/EN)              | P0       | TO CREATE  | Clinic partners|
| Patient Health Data Consent Form  | P0       | TO CREATE  | Patients       |
| Marketing Consent Form            | P1       | TO CREATE  | Leads/patients |
| Data Breach Response Plan         | P1       | TO CREATE  | Internal       |
| Data Retention Policy             | P1       | TO CREATE  | Internal       |
| Sub-processor Register            | P1       | TO CREATE  | Internal/public|
| DPIA (Data Protection Impact Assessment) | P0 | TO CREATE | Internal     |
| Record of Processing Activities (ROPA) | P0  | TO CREATE  | Internal       |

### 3.2 Cookie Consent Banner — Technical Spec

```
Component: src/components/CookieConsentBanner.tsx

Behavior:
- Renders on every page if no consent recorded
- Blocks non-essential cookies until consent
- Three-tier UI:
  1. Banner (bottom of screen): brief message + Accept All / Reject All / Customize
  2. Preference modal: toggles for each category
  3. Persistent settings icon (bottom-left corner)

Cookie Categories:
- Essential (always on, non-toggleable): auth session, CSRF, cart
- Analytics: Plausible/GA (anonymized)
- Marketing: Meta Pixel, Google Ads
- Functional: language preference, UI settings

Storage:
- localStorage: `nc_cookie_consent` = { version, timestamp, categories: {...} }
- Supabase: `cookie_consents` table (user_id nullable, consent_data JSONB, created_at)

Consent string format:
{
  "version": "1.0",
  "timestamp": "2026-04-02T17:30:00Z",
  "essential": true,
  "analytics": false,
  "marketing": false,
  "functional": true
}
```

---

## 4. CRM SYSTEM DESIGN

### 4.1 Lead Pipeline

```
┌─────────┐   ┌───────────┐   ┌────────────────┐   ┌───────────┐
│   NEW    │──▸│ CONTACTED │──▸│ DEMO SCHEDULED │──▸│ DEMO DONE │
└─────────┘   └───────────┘   └────────────────┘   └───────────┘
                                                          │
                                                          ▼
                              ┌──────────┐   ┌──────────────────┐
                              │   LOST   │◂──│   NEGOTIATING    │
                              └──────────┘   └──────────────────┘
                                                    │         ▲
                              ┌──────────┐          ▼         │
                              │   WON    │◂──┌───────────────┐│
                              └──────────┘   │ PROPOSAL SENT ││
                                             └───────────────┘┘
```

**Lead Stages:**

| Stage          | Trigger                         | Auto-actions                          | SLA        |
|----------------|---------------------------------|---------------------------------------|------------|
| New            | Form submission / chatbot       | Welcome email, Slack notification     | Contact <2h|
| Contacted      | Sales rep marks contacted       | Log call/email in CRM                 | Demo <48h  |
| Demo Scheduled | Calendar booking confirmed      | Demo reminder email (24h before)      | —          |
| Demo Done      | Sales rep marks complete        | Follow-up email with recording        | Proposal <24h|
| Proposal Sent  | Proposal document sent          | Auto follow-up at day 3, 7            | Response <7d|
| Negotiating    | Clinic responds / counter-offer | Track changes, alert sales            | Close <14d |
| Won            | Contract signed                 | Onboarding sequence triggered         | —          |
| Lost           | Deal marked lost                | Lost reason logged, nurture sequence  | —          |

### 4.2 Supabase Schema — CRM Tables

```sql
-- Lead/CRM Tables
CREATE TABLE crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  specialties TEXT[],
  website TEXT,
  stage TEXT NOT NULL DEFAULT 'new'
    CHECK (stage IN ('new','contacted','demo_scheduled','demo_done',
                     'proposal_sent','negotiating','won','lost')),
  source TEXT, -- 'website', 'referral', 'ads', 'partner_form', 'chatbot'
  assigned_to UUID REFERENCES auth.users(id),
  expected_value DECIMAL(10,2),
  lost_reason TEXT,
  notes TEXT,
  lead_score INTEGER DEFAULT 0,
  consent_marketing BOOLEAN DEFAULT false,
  consent_timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES crm_leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email','call','meeting','note','stage_change','auto')),
  subject TEXT,
  body TEXT,
  performed_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE crm_email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('lead','patient','clinic')),
  steps JSONB NOT NULL, -- [{delay_hours, template_id, subject}]
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE crm_email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  template_id TEXT NOT NULL,
  sequence_id UUID REFERENCES crm_email_sequences(id),
  step_index INTEGER,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','cancelled')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_leads_stage ON crm_leads(stage);
CREATE INDEX idx_leads_assigned ON crm_leads(assigned_to);
CREATE INDEX idx_email_queue_scheduled ON crm_email_queue(scheduled_at) WHERE status = 'pending';
```

### 4.3 Tech Stack

| Component       | Tool              | Purpose                                    |
|-----------------|-------------------|--------------------------------------------|
| CRM Backend     | Supabase          | PostgreSQL database, RLS, Edge Functions   |
| CRM Frontend    | React (existing)  | Admin panel at `/admin/crm`                |
| Email Sending   | Resend            | Transactional + marketing emails           |
| Email Templates | React Email       | Type-safe, responsive email templates      |
| Automation      | n8n (self-hosted) | Workflow automation, triggers, scheduling  |
| Scheduling      | Cal.com or Calendly| Demo booking for sales pipeline           |
| Analytics       | Plausible         | Privacy-friendly website analytics         |
| Notifications   | Slack webhooks    | Internal alerts for new leads, stage changes|

### 4.4 n8n Automation Workflows

**Workflow 1: New Lead Processing**
```
Trigger: Supabase webhook (new row in crm_leads)
  → Enrich lead data (website scrape, social lookup)
  → Calculate lead score
  → Send welcome email via Resend
  → Create Slack notification in #sales
  → If lead_score > 70: auto-assign to senior sales
  → Schedule follow-up task at +2h
```

**Workflow 2: Demo Reminder**
```
Trigger: Cron (every hour)
  → Query crm_leads WHERE stage = 'demo_scheduled'
    AND demo_date BETWEEN now() AND now() + 24h
  → Send reminder email to lead
  → Send prep brief to sales rep
```

**Workflow 3: Stale Lead Alert**
```
Trigger: Cron (daily at 9am)
  → Query crm_leads WHERE stage NOT IN ('won','lost')
    AND updated_at < now() - interval '3 days'
  → Send Slack alert with stale leads list
  → Auto-escalate if stale > 7 days
```

**Workflow 4: Won → Onboarding**
```
Trigger: Supabase webhook (stage changed to 'won')
  → Generate DPA document (from template)
  → Send onboarding email sequence
  → Create clinic account in system
  → Assign onboarding manager
  → Schedule kickoff call
```

### 4.5 Lead Scoring Model

| Signal                              | Points |
|--------------------------------------|--------|
| Submitted partner application form   | +20    |
| Has website                          | +10    |
| Multiple specialties                 | +15    |
| Located in target city               | +10    |
| Opened welcome email                 | +5     |
| Clicked link in email                | +10    |
| Booked demo                          | +25    |
| Visited pricing page                 | +15    |
| Replied to email                     | +20    |
| Referral source                      | +15    |
| No response after 7 days             | -20    |

**Scoring tiers:** Hot (70+), Warm (40-69), Cold (0-39)

---

## 5. EMAIL AUTOMATION FLOWS

### 5.1 Email Infrastructure

```
Resend Account
├── Domain: nodeclinic.com (DKIM, SPF, DMARC configured)
├── Sending addresses:
│   ├── noreply@nodeclinic.com     (transactional)
│   ├── info@nodeclinic.com        (marketing)
│   ├── prenotazioni@nodeclinic.com (bookings)
│   └── team@nodeclinic.com        (sales/CRM)
└── Templates: React Email components in src/emails/
```

### 5.2 Patient Email Flows

#### Flow A: Booking Confirmation
```
Trigger: New booking created
Delay: Immediate
From: prenotazioni@nodeclinic.com
Subject: "Prenotazione confermata — {treatment} presso {clinic}"
Content:
  - Booking details (date, time, clinic, treatment)
  - Clinic address + Google Maps link
  - What to bring / preparation instructions
  - Deposit receipt
  - Cancel/reschedule link
  - Add to calendar (.ics attachment)
```

#### Flow B: 24h Reminder
```
Trigger: Booking date - 24 hours
From: prenotazioni@nodeclinic.com
Subject: "Promemoria: il tuo appuntamento è domani"
Content:
  - Appointment summary
  - Clinic address + directions
  - Preparation checklist
  - Contact info for questions
  - Reschedule option (if within policy)
```

#### Flow C: Post-Visit Review Request
```
Trigger: Booking date + 2 hours (after appointment time)
From: info@nodeclinic.com
Subject: "Com'è andato il tuo appuntamento?"
Content:
  - Thank you message
  - 1-5 star rating widget (links to review page)
  - "Scrivi una recensione" CTA
  - Brief satisfaction survey (3 questions)
```

#### Flow D: Re-booking Nudge
```
Trigger: Last booking + 30 days (if no new booking)
Condition: Patient has consent for marketing
From: info@nodeclinic.com
Subject: "È ora di prenotare il prossimo controllo?"
Content:
  - Personalized based on last treatment
  - Recommended follow-up treatments
  - Quick re-book CTA
  - Unsubscribe link
```

#### Flow E: Re-booking Nudge 2 (if no action)
```
Trigger: Flow D + 14 days (if no booking)
Subject: "{name}, la tua salute è importante"
Content:
  - Social proof (reviews from their clinic)
  - Limited-time offer (if applicable)
  - One-click booking CTA
  - Unsubscribe link
```

### 5.3 Clinic Email Flows

#### Flow F: New Booking Notification
```
Trigger: New booking for this clinic
Delay: Immediate
From: prenotazioni@nodeclinic.com
To: clinic's notification email
Subject: "Nuova prenotazione: {patient_name} — {treatment}"
Content:
  - Patient details (name, phone, email)
  - Treatment requested
  - Date/time
  - Patient notes (if any)
  - Confirm/manage in Clinic Portal CTA
```

#### Flow G: Daily Schedule
```
Trigger: Cron daily at 7:00 AM
From: prenotazioni@nodeclinic.com
Subject: "Agenda di oggi — {date} ({count} appuntamenti)"
Content:
  - Table: time | patient | treatment | status
  - Total bookings count
  - Any cancellations/changes flagged
  - Link to Clinic Portal
```

#### Flow H: Weekly Performance Report
```
Trigger: Cron Monday at 8:00 AM
From: info@nodeclinic.com
Subject: "Report settimanale — {clinic_name}"
Content:
  - Bookings this week vs. last week
  - Revenue summary
  - New patient count
  - Average rating
  - Top treatments booked
  - Upcoming week preview
  - Tips for improvement
```

#### Flow I: Payment Notification
```
Trigger: Deposit payment processed
From: noreply@nodeclinic.com
Subject: "Pagamento ricevuto — Deposito per {patient_name}"
Content:
  - Payment amount
  - Patient and booking details
  - Commission breakdown
  - Payout schedule
  - Invoice link
```

### 5.4 Lead (B2B Sales) Email Flows

#### Flow J: Welcome Sequence (5 Emails)

**Email 1 — Immediate (Welcome)**
```
Subject: "Benvenuto! Ecco come Node Clinic può far crescere la tua clinica"
Content:
  - Thank you for interest
  - What Node Clinic does (30-second pitch)
  - Key benefits (3 bullet points)
  - Social proof (1 testimonial)
  - CTA: "Scopri le nostre cliniche partner"
```

**Email 2 — Day 2 (Problem Awareness)**
```
Subject: "Il 73% delle cliniche perde pazienti per questo motivo"
Content:
  - Problem: poor online presence = lost patients
  - Statistics on medical tourism / online booking trends in Italy
  - How Node Clinic solves this
  - CTA: "Vedi i risultati dei nostri partner"
```

**Email 3 — Day 4 (Case Study)**
```
Subject: "Come Clinica XYZ ha aumentato le prenotazioni del 40%"
Content:
  - Real case study (anonymized if needed)
  - Before/after numbers
  - Implementation timeline
  - CTA: "Prenota una demo gratuita"
```

**Email 4 — Day 7 (ROI Focus)**
```
Subject: "{clinic_name}, ecco quanto potresti guadagnare"
Content:
  - Personalized ROI estimate based on city/specialty
  - Commission structure explanation
  - No upfront costs messaging
  - CTA: "Calcola il tuo ROI" → ROI calculator page
```

**Email 5 — Day 10 (Final Push)**
```
Subject: "Ultima opportunità: posti limitati nella tua zona"
Content:
  - Scarcity: limited clinic slots per zone
  - Summary of all benefits
  - FAQ section (3 common objections)
  - CTA: "Prenota la tua demo ora"
  - P.S. with personal note from sales
```

#### Flow K: Demo Follow-up

**Post-Demo Email 1 — Immediate**
```
Subject: "Grazie per la demo! Ecco il riepilogo"
Content: Recording link, key points discussed, custom proposal preview, next steps
```

**Post-Demo Email 2 — Day 3**
```
Subject: "Hai domande sulla proposta?"
Content: Address common concerns, ROI reminder, book follow-up call CTA
```

**Post-Demo Email 3 — Day 7 (if no response)**
```
Subject: "Ci siamo persi qualcosa?"
Content: Quick survey (why no decision?), revised offer if applicable, final CTA
```

#### Flow L: Onboarding Sequence (Post-Won)

```
Day 0: Welcome to Node Clinic — account setup instructions
Day 1: Complete your clinic profile — step-by-step guide
Day 3: Upload your first treatments — best practices
Day 5: How to manage bookings in the Clinic Portal
Day 7: Your clinic is live! — first week tips
Day 14: 2-week check-in — how's it going?
Day 30: First month report + optimization tips
```

---

## 6. FUNNEL MARKETING SYSTEM

### 6.1 Funnel Overview

```
                    ┌─────────────────────────────┐
                    │      AWARENESS (TOFU)        │
                    │  Blog SEO • Social • Ads     │
                    │  Target: 50,000 visitors/mo   │
                    └─────────────┬───────────────┘
                                  │ 5% CTR
                    ┌─────────────▼───────────────┐
                    │    CONSIDERATION (MOFU)       │
                    │  Audit Tool • Guides • Compare│
                    │  Target: 2,500 leads/mo       │
                    └─────────────┬───────────────┘
                                  │ 10% conversion
                    ┌─────────────▼───────────────┐
                    │      DECISION (BOFU)          │
                    │  Demo • Case Studies • ROI    │
                    │  Target: 250 qualified/mo     │
                    └─────────────┬───────────────┘
                                  │ 20% close rate
                    ┌─────────────▼───────────────┐
                    │        CUSTOMERS              │
                    │     Target: 50 clinics/mo     │
                    └─────────────────────────────┘
```

### 6.2 TOFU — Top of Funnel (Awareness)

**Goal:** Drive traffic from people searching for treatments or clinics.

#### Blog SEO Strategy
```
Content pillars:
1. Treatment guides ("Impianti dentali: costi, procedure e cosa aspettarsi")
2. City guides ("Migliori cliniche odontoiatriche a Milano")
3. Cost comparisons ("Quanto costa un impianto dentale in Italia nel 2026?")
4. Patient stories ("La mia esperienza con la chirurgia laser agli occhi")
5. Industry news ("Nuove tecnologie in odontoiatria 2026")

Publishing cadence: 3 articles/week
Target: 200+ articles in first year
SEO tool: Ahrefs or SEMrush for keyword research

URL structure: /blog/{category}/{slug}
Example: /blog/odontoiatria/costo-impianti-dentali-italia
```

#### Social Media
```
Platforms (priority order):
1. Instagram — before/after, clinic tours, patient stories
2. TikTok — short treatment explainers, clinic day-in-life
3. Facebook — community building, clinic promotions
4. LinkedIn — B2B (clinic acquisition), industry thought leadership

Posting cadence: 5x/week Instagram, 3x/week TikTok, 3x/week Facebook, 2x/week LinkedIn
```

#### Paid Advertising
```
Google Ads:
- Search: "dentista {città}", "impianti dentali costo", "clinica estetica {città}"
- Display: retargeting visitors who didn't convert
- Budget: start €2,000/mo, scale based on ROAS

Meta Ads (FB/IG):
- Lookalike audiences from existing patients
- Interest targeting: healthcare, dental, aesthetics
- Creative: video testimonials, before/after, offer-based
- Budget: start €1,500/mo

Landing pages for each ad campaign:
- /lp/impianti-dentali-{città}
- /lp/chirurgia-estetica-{città}
- /lp/clinica-partner (B2B)
```

### 6.3 MOFU — Middle of Funnel (Consideration)

**Goal:** Capture leads by providing high-value tools and content.

#### Free Clinic Audit Tool
```
URL: /strumenti/audit-clinica
Flow:
1. Enter clinic website URL
2. Auto-analyze: SEO score, online presence, Google reviews
3. Generate PDF report with recommendations
4. Gate the full report behind email capture
5. Auto-enroll in lead welcome sequence

Tech: Supabase Edge Function + Lighthouse API + Google Places API
```

#### Treatment Comparison Tool
```
URL: /confronta/{treatment}
Flow:
1. Select treatment type
2. Select city
3. View comparison table: clinics, prices, ratings, availability
4. "Get personalized recommendations" → email capture
5. CTA: Book consultation

This is a core product feature doubling as lead generation.
```

#### Treatment Guides (Gated)
```
Lead magnets (PDF downloads):
- "Guida completa agli impianti dentali 2026" (dental implants)
- "Tutto quello che devi sapere sulla chirurgia refrattiva" (LASIK)
- "Medicina estetica: trattamenti, costi e come scegliere" (aesthetics)

Gate: email + name required for download
Auto-enroll in relevant email nurture sequence
```

#### Email Capture Points
```
1. Blog sidebar: newsletter signup
2. Exit-intent popup: already exists (src/components/ui/ExitIntentPopup.tsx)
3. Chatbot: already captures leads (src/components/ui/ChatBot.tsx)
4. Audit tool: gated results
5. Treatment guides: gated PDFs
6. Footer: newsletter
7. Comparison tool: personalized results
```

### 6.4 BOFU — Bottom of Funnel (Decision)

**Goal:** Convert qualified leads into paying customers (clinic partners) or booked patients.

#### For Patients (B2C):
```
Conversion points:
1. Booking page — streamlined, mobile-first
2. Clinic profile pages — trust signals, reviews, pricing
3. Treatment pages — clear CTAs, deposit info
4. Chatbot — guided booking assistance

Trust builders:
- Verified clinic badges
- Patient reviews with photos
- Transparent pricing
- Money-back guarantee on deposits
- Secure payment badges
```

#### For Clinics (B2B):
```
1. Demo Booking Page (/demo)
   - Calendly/Cal.com embed
   - Social proof: "Join 200+ partner clinics"
   - Video testimonial from existing partner
   - No commitment messaging

2. Case Studies Page (/casi-studio)
   - 3-5 detailed clinic success stories
   - Revenue numbers (with permission)
   - Implementation timeline
   - Industry-specific (dental, aesthetic, etc.)

3. ROI Calculator (/calcola-roi)
   - Input: city, specialty, current monthly patients
   - Output: estimated additional bookings, revenue
   - Gate detailed report behind demo booking
   - Shareable results

4. Partner Landing Page (/diventa-partner)
   - Already exists (src/pages/landing/DiventaPartner.tsx)
   - Enhance with: video, testimonials, ROI preview
   - Simplify form to reduce friction
```

### 6.5 Conversion Tracking & Attribution

```
UTM Parameters:
- utm_source: google, meta, organic, referral, email
- utm_medium: cpc, social, blog, newsletter
- utm_campaign: {campaign_name}
- utm_content: {ad_variant}

Tracking Stack:
- Plausible Analytics (privacy-friendly, no cookies needed for basic)
- Supabase: store UTM params with leads and bookings
- Resend: email open/click tracking
- Google Ads: conversion tracking (with cookie consent)
- Meta Pixel: (with cookie consent)

Attribution Model: Last-touch with first-touch awareness
Store in: crm_leads.source + metadata JSONB field
```

### 6.6 Key Metrics & KPIs

| Metric                          | Target (Month 6) | Target (Month 12) |
|---------------------------------|-------------------|--------------------|
| Monthly unique visitors         | 20,000            | 50,000             |
| Blog articles published         | 100               | 250                |
| Email subscribers               | 3,000             | 10,000             |
| Leads captured (clinics)        | 100               | 300                |
| Demo bookings                   | 30                | 80                 |
| Clinics signed (Won)            | 10                | 30                 |
| Patient bookings/month          | 200               | 1,000              |
| Email open rate                 | 35%               | 40%                |
| Email click rate                | 5%                | 8%                 |
| Cost per clinic acquisition     | €200              | €150               |
| Patient acquisition cost        | €15               | €8                 |

---

## 7. IMPLEMENTATION ROADMAP

### Phase 1: GDPR Critical (Weeks 1-3) — MUST DO BEFORE LAUNCH

| Task                                  | Owner    | Days | Priority |
|---------------------------------------|----------|------|----------|
| Cookie consent banner component       | Frontend | 3    | P0       |
| Rewrite Privacy Policy (full GDPR)    | Legal    | 2    | P0       |
| Health data explicit consent form     | Frontend | 2    | P0       |
| DPA template creation                 | Legal    | 3    | P0       |
| ROPA (Record of Processing Activities)| Legal    | 2    | P0       |
| DPIA (Data Protection Impact Assess.) | Legal    | 3    | P0       |
| Appoint external DPO                  | CEO      | 5    | P0       |
| Supabase RLS audit for health data    | Backend  | 2    | P0       |

### Phase 2: CRM & Email Foundation (Weeks 3-6)

| Task                                  | Owner    | Days | Priority |
|---------------------------------------|----------|------|----------|
| CRM database schema (Supabase)        | Backend  | 2    | P1       |
| CRM admin UI (lead pipeline view)     | Frontend | 5    | P1       |
| Resend account setup + domain verify  | Backend  | 1    | P1       |
| React Email templates (booking conf.) | Frontend | 3    | P1       |
| n8n self-hosted setup                 | DevOps   | 2    | P1       |
| Booking confirmation email flow       | Backend  | 2    | P1       |
| 24h reminder email flow               | Backend  | 1    | P1       |
| New booking clinic notification       | Backend  | 1    | P1       |
| Data deletion API endpoint            | Backend  | 3    | P1       |
| Data export API endpoint              | Backend  | 2    | P1       |

### Phase 3: Sales Automation (Weeks 6-10)

| Task                                  | Owner    | Days | Priority |
|---------------------------------------|----------|------|----------|
| Lead welcome email sequence (5)       | Marketing| 3    | P2       |
| Demo follow-up sequence               | Marketing| 2    | P2       |
| Onboarding email sequence             | Marketing| 3    | P2       |
| n8n workflow: new lead processing     | Backend  | 2    | P2       |
| n8n workflow: demo reminder           | Backend  | 1    | P2       |
| n8n workflow: stale lead alert        | Backend  | 1    | P2       |
| Lead scoring implementation           | Backend  | 2    | P2       |
| Clinic daily schedule email           | Backend  | 2    | P2       |
| Clinic weekly report email            | Backend  | 3    | P2       |

### Phase 4: Marketing Funnel (Weeks 10-16)

| Task                                  | Owner    | Days | Priority |
|---------------------------------------|----------|------|----------|
| Blog system (MDX or headless CMS)     | Frontend | 5    | P2       |
| First 20 SEO articles                 | Content  | 20   | P2       |
| ROI calculator page                   | Frontend | 3    | P2       |
| Clinic audit tool                     | Fullstack| 5    | P2       |
| Case studies page                     | Content  | 3    | P2       |
| Google Ads setup + landing pages      | Marketing| 5    | P3       |
| Meta Ads setup                        | Marketing| 3    | P3       |
| Plausible Analytics integration       | Frontend | 1    | P2       |
| UTM tracking + attribution            | Backend  | 2    | P2       |
| Patient re-booking nudge flow         | Backend  | 2    | P3       |
| Post-visit review request flow        | Backend  | 2    | P3       |
| Breach notification procedure doc     | Legal    | 2    | P2       |

---

## 8. TECHNICAL ARCHITECTURE

### 8.1 System Architecture

```
                        ┌──────────────────────┐
                        │   React Frontend     │
                        │   (Vite + TailwindCSS)│
                        └──────────┬───────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │        Supabase              │
                    │  ┌─────────────────────┐     │
                    │  │   PostgreSQL DB      │     │
                    │  │   ├── profiles       │     │
                    │  │   ├── bookings       │     │
                    │  │   ├── clinics        │     │
                    │  │   ├── crm_leads      │     │
                    │  │   ├── crm_activities  │     │
                    │  │   ├── crm_email_queue│     │
                    │  │   ├── cookie_consents│     │
                    │  │   └── gdpr_audit_log │     │
                    │  └─────────────────────┘     │
                    │  ┌─────────────────────┐     │
                    │  │   Edge Functions     │     │
                    │  │   ├── send-email     │     │
                    │  │   ├── delete-user    │     │
                    │  │   ├── export-data    │     │
                    │  │   └── process-lead   │     │
                    │  └─────────────────────┘     │
                    │  ┌─────────────────────┐     │
                    │  │   Realtime           │     │
                    │  │   (webhook triggers) │     │
                    │  └─────────────────────┘     │
                    └──────────────┬──────────────┘
                                   │ webhooks
                    ┌──────────────▼──────────────┐
                    │      n8n (self-hosted)       │
                    │  ┌─────────────────────┐     │
                    │  │  Workflows:          │     │
                    │  │  • Lead processing   │     │
                    │  │  • Email scheduling  │     │
                    │  │  • Reminders         │     │
                    │  │  • Reports           │     │
                    │  │  • Stale alerts      │     │
                    │  └────────┬────────────┘     │
                    └───────────┼──────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                   │
    ┌─────────▼──────┐  ┌──────▼───────┐  ┌──────▼──────┐
    │    Resend       │  │    Slack     │  │   Stripe    │
    │  (email API)    │  │  (alerts)    │  │ (payments)  │
    └────────────────┘  └──────────────┘  └─────────────┘
```

### 8.2 GDPR Audit Log Table

```sql
CREATE TABLE gdpr_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL, -- 'consent_given', 'consent_withdrawn', 'data_accessed',
                        -- 'data_exported', 'data_deleted', 'breach_detected'
  user_id UUID REFERENCES auth.users(id),
  actor_id UUID REFERENCES auth.users(id), -- who performed the action
  resource_type TEXT, -- 'profile', 'booking', 'health_data'
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Immutable: no UPDATE or DELETE allowed
CREATE POLICY "audit_log_insert_only" ON gdpr_audit_log
  FOR INSERT TO authenticated WITH CHECK (true);

-- Separate read policy for DPO/admin only
CREATE POLICY "audit_log_read_admin" ON gdpr_audit_log
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
```

### 8.3 Data Retention Schedule

| Data Category             | Retention Period  | Legal Basis                    | Deletion Method    |
|---------------------------|-------------------|--------------------------------|--------------------|
| Patient profile           | Account lifetime + 30 days | Contract | Hard delete       |
| Booking records           | 2 years           | Legitimate interest            | Anonymize          |
| Health data (treatment)   | Booking + 1 year  | Consent (Art. 9)               | Hard delete        |
| Financial records         | 10 years          | Italian tax law (DPR 600/73)   | Archive + encrypt  |
| Cookie consents           | 2 years           | Accountability (Art. 5(2))     | Hard delete        |
| CRM lead data             | 2 years from last contact | Legitimate interest   | Anonymize          |
| Audit logs                | 5 years           | Legal obligation               | Archive            |
| Analytics (aggregated)    | Indefinite        | Legitimate interest            | N/A (anonymous)    |
| Email marketing data      | Until consent withdrawn | Consent               | Hard delete        |

---

## APPENDIX A: Cookie Consent Banner — Implementation Notes

File: `src/components/CookieConsentBanner.tsx`

Must comply with Garante Guidelines (Linee Guida Cookie e altri strumenti di tracciamento - 10 giugno 2021):

1. First layer (banner): clear information + Accept All / Reject All / Customize
2. Second layer (modal): granular per-category controls
3. No cookie wall (cannot block content)
4. No scroll-as-consent (explicitly prohibited by Garante)
5. Reject All must be as easy as Accept All
6. Must remember choice for max 6 months, then re-ask
7. Settings must be accessible at all times (floating icon)

## APPENDIX B: DPA Key Clauses (Art. 28 Summary)

The Data Processing Agreement between Node Clinic (processor) and each clinic (controller) must contain:

1. Processing only on documented instructions from controller
2. Confidentiality obligations for all personnel
3. Security measures per Art. 32 (encryption, pseudonymization, resilience, testing)
4. Sub-processor authorization and management
5. Assistance with data subject rights (access, deletion, portability)
6. Assistance with breach notification
7. Data deletion or return upon termination
8. Audit and inspection rights for controller
9. International transfer safeguards
10. Liability and indemnification

## APPENDIX C: Garante Contact Information

```
Garante per la Protezione dei Dati Personali
Piazza Venezia, 11 - 00187 Roma
Tel: (+39) 06.696771
Fax: (+39) 06.69677.3785
Email: garante@gpdp.it
PEC: protocollo@pec.gpdp.it
Web: https://www.garanteprivacy.it

Data Breach Notification Portal:
https://servizi.gpdp.it/databreach/s/
```

---

*This document should be reviewed by a qualified Italian data protection lawyer before implementation. It provides a technical and strategic framework but does not constitute legal advice.*

*Last updated: April 2, 2026*
