-- =============================================================================
-- Node Clinic - Complete Supabase Schema
-- =============================================================================
-- Generated from codebase audit of src/types/database.ts, src/services/store.ts,
-- src/services/api.ts, admin pages, clinic portal, booking flow, and auth context.
--
-- This schema covers:
--   1. profiles (extends Supabase auth.users)
--   2. clinics
--   3. treatments (platform-wide catalog)
--   4. clinic_treatments (which clinics offer which treatments, with pricing)
--   5. bookings
--   6. payments
--   7. reviews
--   8. leads
--   9. notifications
--  10. funnel_events (analytics)
--  11. platform_settings (singleton config)
--  12. Row Level Security (RLS) policies
--  13. Indexes for performance
--  14. Seed data matching current mock data
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- CUSTOM TYPES (enums)
-- =============================================================================

CREATE TYPE user_role AS ENUM ('user', 'clinic', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended');
CREATE TYPE clinic_status AS ENUM ('active', 'pending', 'rejected');
CREATE TYPE treatment_category AS ENUM ('iniettivi', 'laser', 'corpo', 'viso', 'chirurgia');
CREATE TYPE treatment_status AS ENUM ('active', 'inactive');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('paid', 'pending', 'refunded');
CREATE TYPE lead_source AS ENUM (
  'prenota-visita', 'diventa-partner', 'trattamenti',
  'contact', 'exit-intent', 'whatsapp', 'chatbot', 'bio'
);
CREATE TYPE notification_type AS ENUM ('booking', 'lead', 'review', 'system');

-- =============================================================================
-- 1. PROFILES
-- =============================================================================
-- Extends Supabase auth.users. Created automatically via trigger on signup.
-- Roles: 'user' (patient), 'clinic' (clinic staff/owner), 'admin' (platform admin)

CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  name          TEXT NOT NULL,
  phone         TEXT,
  role          user_role NOT NULL DEFAULT 'user',
  status        user_status NOT NULL DEFAULT 'active',
  avatar_url    TEXT,
  date_of_birth DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_status ON profiles(status);

-- Auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user'),
    'active'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 2. CLINICS
-- =============================================================================

CREATE TABLE clinics (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  city            TEXT NOT NULL,
  address         TEXT NOT NULL,
  lat             DOUBLE PRECISION,
  lng             DOUBLE PRECISION,
  rating          NUMERIC(2,1) NOT NULL DEFAULT 0.0,
  reviews_count   INTEGER NOT NULL DEFAULT 0,
  status          clinic_status NOT NULL DEFAULT 'pending',
  image_url       TEXT,
  description     TEXT,
  phone           TEXT,
  email           TEXT,
  website         TEXT,
  opening_hours   JSONB,  -- {"lunedi": {"open":"09:00","close":"18:00"}, ...}
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clinics_slug ON clinics(slug);
CREATE INDEX idx_clinics_city ON clinics(city);
CREATE INDEX idx_clinics_status ON clinics(status);
CREATE INDEX idx_clinics_rating ON clinics(rating DESC);
CREATE INDEX idx_clinics_owner ON clinics(owner_id);

CREATE TRIGGER clinics_updated_at
  BEFORE UPDATE ON clinics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 3. TREATMENTS (platform-wide catalog)
-- =============================================================================

CREATE TABLE treatments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  category        treatment_category NOT NULL,
  description     TEXT,
  price_from      INTEGER NOT NULL,  -- cents or whole euros as in current code
  price_to        INTEGER NOT NULL,
  duration_min    INTEGER NOT NULL,
  image_url       TEXT,
  status          treatment_status NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_treatments_slug ON treatments(slug);
CREATE INDEX idx_treatments_category ON treatments(category);
CREATE INDEX idx_treatments_status ON treatments(status);

CREATE TRIGGER treatments_updated_at
  BEFORE UPDATE ON treatments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 4. CLINIC_TREATMENTS (many-to-many: which clinics offer which treatments)
-- =============================================================================
-- Allows per-clinic pricing overrides. If price columns are NULL, use the
-- platform default from treatments table.

CREATE TABLE clinic_treatments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  treatment_id    UUID NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
  price_from      INTEGER,  -- clinic-specific override, nullable
  price_to        INTEGER,  -- clinic-specific override, nullable
  duration_min    INTEGER,  -- clinic-specific override, nullable
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(clinic_id, treatment_id)
);

CREATE INDEX idx_clinic_treatments_clinic ON clinic_treatments(clinic_id);
CREATE INDEX idx_clinic_treatments_treatment ON clinic_treatments(treatment_id);

-- =============================================================================
-- 5. BOOKINGS
-- =============================================================================

CREATE TABLE bookings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  treatment_id    UUID NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  time            TIME NOT NULL,
  status          booking_status NOT NULL DEFAULT 'pending',
  deposit_amount  INTEGER NOT NULL DEFAULT 0,
  total_amount    INTEGER,
  notes           TEXT,
  -- Denormalized names for quick display (populated at creation via trigger/app)
  user_name       TEXT,
  clinic_name     TEXT,
  treatment_name  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_clinic ON bookings(clinic_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_clinic_date ON bookings(clinic_id, date);

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 6. PAYMENTS
-- =============================================================================

CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  amount          INTEGER NOT NULL,  -- total amount in euros
  deposit         INTEGER NOT NULL DEFAULT 0,
  status          payment_status NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,  -- for future Stripe integration
  -- Denormalized for admin dashboard display
  user_name       TEXT,
  clinic_name     TEXT,
  treatment_name  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_clinic ON payments(clinic_id);
CREATE INDEX idx_payments_status ON payments(status);

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 7. REVIEWS
-- =============================================================================

CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id      UUID REFERENCES bookings(id) ON DELETE SET NULL,
  user_name       TEXT NOT NULL,
  rating          SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text            TEXT NOT NULL,
  treatment       TEXT,  -- treatment name at time of review
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_clinic ON reviews(clinic_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Automatically update clinic rating & reviews_count
CREATE OR REPLACE FUNCTION public.update_clinic_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE clinics SET
    rating = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM reviews WHERE clinic_id = COALESCE(NEW.clinic_id, OLD.clinic_id)
    ), 0),
    reviews_count = (
      SELECT COUNT(*)
      FROM reviews WHERE clinic_id = COALESCE(NEW.clinic_id, OLD.clinic_id)
    )
  WHERE id = COALESCE(NEW.clinic_id, OLD.clinic_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER reviews_update_clinic_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_clinic_rating();

-- =============================================================================
-- 8. LEADS
-- =============================================================================

CREATE TABLE leads (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source          lead_source NOT NULL,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  city            TEXT,
  treatment       TEXT,
  message         TEXT,
  company         TEXT,
  utm_source      TEXT,
  utm_medium      TEXT,
  utm_campaign    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
CREATE INDEX idx_leads_email ON leads(email);

-- =============================================================================
-- 9. NOTIFICATIONS
-- =============================================================================

CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type            notification_type NOT NULL DEFAULT 'system',
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  read            BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- =============================================================================
-- 10. FUNNEL EVENTS (analytics / tracking)
-- =============================================================================

CREATE TABLE funnel_events (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel            TEXT NOT NULL,       -- 'booking', 'lead', 'bio'
  step              TEXT NOT NULL,       -- 'page_view', 'clinic_view', 'booking_start', 'payment', 'confirmed', 'form_start', 'form_submit', 'link_click'
  page              TEXT,
  form_id           TEXT,
  conversion_type   TEXT,                -- 'booking', 'lead'
  conversion_value  INTEGER,             -- value in euros
  user_id           UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id        TEXT,                -- anonymous session tracking
  timestamp         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_funnel_funnel ON funnel_events(funnel);
CREATE INDEX idx_funnel_step ON funnel_events(funnel, step);
CREATE INDEX idx_funnel_timestamp ON funnel_events(timestamp DESC);
CREATE INDEX idx_funnel_user ON funnel_events(user_id);

-- =============================================================================
-- 11. PLATFORM SETTINGS (singleton)
-- =============================================================================

CREATE TABLE platform_settings (
  id                      INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- singleton
  platform_name           TEXT NOT NULL DEFAULT 'Node Clinic',
  support_email           TEXT NOT NULL DEFAULT 'supporto@nodeclinic.com',
  support_phone           TEXT NOT NULL DEFAULT '+39 02 1234567',
  whatsapp_number         TEXT NOT NULL DEFAULT '+393****4567',
  commission_rate         NUMERIC(5,2) NOT NULL DEFAULT 15.00,
  notifications_email     BOOLEAN NOT NULL DEFAULT true,
  notifications_whatsapp  BOOLEAN NOT NULL DEFAULT true,
  notifications_sms       BOOLEAN NOT NULL DEFAULT false,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER platform_settings_updated_at
  BEFORE UPDATE ON platform_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert default settings
INSERT INTO platform_settings (id) VALUES (1);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if current user is clinic owner
CREATE OR REPLACE FUNCTION public.is_clinic_owner(clinic_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM clinics WHERE id = clinic_uuid AND owner_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ----- PROFILES -----
-- Everyone can read profiles (names for reviews etc)
CREATE POLICY "Profiles: public read" ON profiles
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Profiles: self update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can do everything
CREATE POLICY "Profiles: admin all" ON profiles
  FOR ALL USING (public.is_admin());

-- ----- CLINICS -----
-- Public read for active clinics
CREATE POLICY "Clinics: public read active" ON clinics
  FOR SELECT USING (status = 'active' OR public.is_admin() OR owner_id = auth.uid());

-- Clinic owners can update their own clinic
CREATE POLICY "Clinics: owner update" ON clinics
  FOR UPDATE USING (owner_id = auth.uid());

-- Admins can do everything
CREATE POLICY "Clinics: admin all" ON clinics
  FOR ALL USING (public.is_admin());

-- ----- TREATMENTS -----
-- Public read for active treatments
CREATE POLICY "Treatments: public read" ON treatments
  FOR SELECT USING (status = 'active' OR public.is_admin());

-- Only admins can modify treatments
CREATE POLICY "Treatments: admin all" ON treatments
  FOR ALL USING (public.is_admin());

-- ----- CLINIC_TREATMENTS -----
-- Public read
CREATE POLICY "Clinic treatments: public read" ON clinic_treatments
  FOR SELECT USING (true);

-- Clinic owners and admins can manage
CREATE POLICY "Clinic treatments: owner manage" ON clinic_treatments
  FOR ALL USING (public.is_clinic_owner(clinic_id) OR public.is_admin());

-- ----- BOOKINGS -----
-- Users see their own bookings
CREATE POLICY "Bookings: user read own" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

-- Clinic owners see their clinic's bookings
CREATE POLICY "Bookings: clinic read own" ON bookings
  FOR SELECT USING (public.is_clinic_owner(clinic_id));

-- Users can create bookings
CREATE POLICY "Bookings: user create" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Clinic owners can update booking status
CREATE POLICY "Bookings: clinic update" ON bookings
  FOR UPDATE USING (public.is_clinic_owner(clinic_id));

-- Admins can do everything
CREATE POLICY "Bookings: admin all" ON bookings
  FOR ALL USING (public.is_admin());

-- ----- PAYMENTS -----
-- Users see their own payments
CREATE POLICY "Payments: user read own" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- Clinic owners see their clinic's payments
CREATE POLICY "Payments: clinic read own" ON payments
  FOR SELECT USING (public.is_clinic_owner(clinic_id));

-- Admins can do everything
CREATE POLICY "Payments: admin all" ON payments
  FOR ALL USING (public.is_admin());

-- ----- REVIEWS -----
-- Public read
CREATE POLICY "Reviews: public read" ON reviews
  FOR SELECT USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Reviews: user create" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can manage
CREATE POLICY "Reviews: admin all" ON reviews
  FOR ALL USING (public.is_admin());

-- ----- LEADS -----
-- Anyone can submit a lead (insert)
CREATE POLICY "Leads: public insert" ON leads
  FOR INSERT WITH CHECK (true);

-- Only admins can read leads
CREATE POLICY "Leads: admin read" ON leads
  FOR SELECT USING (public.is_admin());

-- Admins can manage
CREATE POLICY "Leads: admin all" ON leads
  FOR ALL USING (public.is_admin());

-- ----- NOTIFICATIONS -----
-- Users see their own notifications
CREATE POLICY "Notifications: user read own" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update (mark read) their own
CREATE POLICY "Notifications: user update own" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY "Notifications: admin all" ON notifications
  FOR ALL USING (public.is_admin());

-- ----- FUNNEL EVENTS -----
-- Anyone can insert (tracking is anonymous-friendly)
CREATE POLICY "Funnel: public insert" ON funnel_events
  FOR INSERT WITH CHECK (true);

-- Only admins can read analytics
CREATE POLICY "Funnel: admin read" ON funnel_events
  FOR SELECT USING (public.is_admin());

-- ----- PLATFORM SETTINGS -----
-- Public read (needed for support info, platform name)
CREATE POLICY "Settings: public read" ON platform_settings
  FOR SELECT USING (true);

-- Only admins can update
CREATE POLICY "Settings: admin update" ON platform_settings
  FOR UPDATE USING (public.is_admin());

-- =============================================================================
-- VIEWS (convenience for the app)
-- =============================================================================

-- Booking detail view with joined names (avoids N+1 in listing)
CREATE OR REPLACE VIEW booking_details AS
SELECT
  b.*,
  p.name AS resolved_user_name,
  p.email AS user_email,
  p.phone AS user_phone,
  c.name AS resolved_clinic_name,
  c.city AS clinic_city,
  t.name AS resolved_treatment_name,
  t.category AS treatment_category
FROM bookings b
LEFT JOIN profiles p ON p.id = b.user_id
LEFT JOIN clinics c ON c.id = b.clinic_id
LEFT JOIN treatments t ON t.id = b.treatment_id;

-- Payment detail view
CREATE OR REPLACE VIEW payment_details AS
SELECT
  pay.*,
  p.name AS resolved_user_name,
  p.email AS user_email,
  c.name AS resolved_clinic_name,
  t.name AS resolved_treatment_name,
  b.date AS booking_date,
  b.time AS booking_time,
  b.status AS booking_status
FROM payments pay
LEFT JOIN bookings b ON b.id = pay.booking_id
LEFT JOIN profiles p ON p.id = pay.user_id
LEFT JOIN clinics c ON c.id = pay.clinic_id
LEFT JOIN treatments t ON t.id = b.treatment_id;

-- =============================================================================
-- REALTIME SUBSCRIPTIONS
-- =============================================================================
-- Enable realtime for key tables (configure in Supabase dashboard too)

ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;

-- =============================================================================
-- SEED DATA (matches current mock data in store.ts)
-- =============================================================================
-- NOTE: In production, user IDs come from auth.users. These are placeholder UUIDs
-- for development. Run this AFTER creating auth users or adjust IDs accordingly.

-- Deterministic UUIDs for seed data (based on original IDs)
-- Users
-- usr_001 -> 00000000-0000-4000-a000-000000000001
-- usr_002 -> 00000000-0000-4000-a000-000000000002
-- ...etc

DO $$
DECLARE
  usr1 UUID := '00000000-0000-4000-a000-000000000001';
  usr2 UUID := '00000000-0000-4000-a000-000000000002';
  usr3 UUID := '00000000-0000-4000-a000-000000000003';
  usr4 UUID := '00000000-0000-4000-a000-000000000004';
  usr5 UUID := '00000000-0000-4000-a000-000000000005';
  usr6 UUID := '00000000-0000-4000-a000-000000000006';
  usr7 UUID := '00000000-0000-4000-a000-000000000007';
  cli1 UUID := '00000000-0000-4000-b000-000000000001';
  cli2 UUID := '00000000-0000-4000-b000-000000000002';
  adm1 UUID := '00000000-0000-4000-c000-000000000001';

  c1 UUID := '00000000-0000-4000-d000-000000000001';
  c2 UUID := '00000000-0000-4000-d000-000000000002';
  c3 UUID := '00000000-0000-4000-d000-000000000003';

  t1 UUID := '00000000-0000-4000-e000-000000000001';
  t2 UUID := '00000000-0000-4000-e000-000000000002';
  t3 UUID := '00000000-0000-4000-e000-000000000003';
  t4 UUID := '00000000-0000-4000-e000-000000000004';
  t5 UUID := '00000000-0000-4000-e000-000000000005';
  t6 UUID := '00000000-0000-4000-e000-000000000006';
  t7 UUID := '00000000-0000-4000-e000-000000000007';
  t8 UUID := '00000000-0000-4000-e000-000000000008';

  b1 UUID := '00000000-0000-4000-f000-000000000001';
  b2 UUID := '00000000-0000-4000-f000-000000000002';
  b3 UUID := '00000000-0000-4000-f000-000000000003';
  b4 UUID := '00000000-0000-4000-f000-000000000004';
  b5 UUID := '00000000-0000-4000-f000-000000000005';
  b6 UUID := '00000000-0000-4000-f000-000000000006';
  b7 UUID := '00000000-0000-4000-f000-000000000007';
  b8 UUID := '00000000-0000-4000-f000-000000000008';
  b9 UUID := '00000000-0000-4000-f000-000000000009';
  b10 UUID := '00000000-0000-4000-f000-000000000010';
  b11 UUID := '00000000-0000-4000-f000-000000000011';
  b12 UUID := '00000000-0000-4000-f000-000000000012';
BEGIN
  -- ---- Create auth.users entries first (required by profiles FK) ----
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
  VALUES
    (usr1, '00000000-0000-0000-0000-000000000000', 'demo@nodeclinic.com', crypt('demo123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Sofia Marchetti"}', '2025-09-01T10:00:00Z', now(), 'authenticated', 'authenticated', ''),
    (usr2, '00000000-0000-0000-0000-000000000000', 'giulia.rossi@email.com', crypt('demo123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Giulia Rossi"}', '2025-10-15T10:00:00Z', now(), 'authenticated', 'authenticated', ''),
    (usr3, '00000000-0000-0000-0000-000000000000', 'marco.s@email.com', crypt('demo123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Marco Santini"}', '2025-11-01T10:00:00Z', now(), 'authenticated', 'authenticated', ''),
    (usr4, '00000000-0000-0000-0000-000000000000', 'alessia.p@email.com', crypt('demo123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Alessia Peroni"}', '2025-11-20T10:00:00Z', now(), 'authenticated', 'authenticated', ''),
    (usr5, '00000000-0000-0000-0000-000000000000', 'laura.m@email.com', crypt('demo123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Laura Martini"}', '2026-01-10T10:00:00Z', now(), 'authenticated', 'authenticated', ''),
    (usr6, '00000000-0000-0000-0000-000000000000', 'chiara.v@email.com', crypt('demo123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Chiara Verdi"}', '2026-02-05T10:00:00Z', now(), 'authenticated', 'authenticated', ''),
    (usr7, '00000000-0000-0000-0000-000000000000', 'andrea.f@email.com', crypt('demo123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Andrea Fontana"}', '2026-03-01T10:00:00Z', now(), 'authenticated', 'authenticated', ''),
    (cli1, '00000000-0000-0000-0000-000000000000', 'clinica@nodeclinic.com', crypt('demo123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Dr. Laura Conti","role":"clinic"}', '2025-06-15T10:00:00Z', now(), 'authenticated', 'authenticated', ''),
    (cli2, '00000000-0000-0000-0000-000000000000', 'dermaroma@email.com', crypt('demo123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Dr. Giovanni Bianchi","role":"clinic"}', '2025-07-20T10:00:00Z', now(), 'authenticated', 'authenticated', ''),
    (adm1, '00000000-0000-0000-0000-000000000000', 'admin@nodeclinic.com', crypt('demo123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Marco Ferretti","role":"admin"}', '2025-01-01T10:00:00Z', now(), 'authenticated', 'authenticated', '')
  ON CONFLICT (id) DO NOTHING;

  -- ---- PROFILES ----
  INSERT INTO profiles (id, email, name, role, status, phone, created_at) VALUES
    (usr1, 'demo@nodeclinic.com', 'Sofia Marchetti', 'user', 'active', '+39 333 1234567', '2025-09-01T10:00:00Z'),
    (usr2, 'giulia.rossi@email.com', 'Giulia Rossi', 'user', 'active', '+39 340 5678901', '2025-10-15T10:00:00Z'),
    (usr3, 'marco.s@email.com', 'Marco Santini', 'user', 'active', NULL, '2025-11-01T10:00:00Z'),
    (usr4, 'alessia.p@email.com', 'Alessia Peroni', 'user', 'suspended', '+39 347 2345678', '2025-11-20T10:00:00Z'),
    (usr5, 'laura.m@email.com', 'Laura Martini', 'user', 'active', '+39 320 8765432', '2026-01-10T10:00:00Z'),
    (usr6, 'chiara.v@email.com', 'Chiara Verdi', 'user', 'active', NULL, '2026-02-05T10:00:00Z'),
    (usr7, 'andrea.f@email.com', 'Andrea Fontana', 'user', 'active', '+39 335 9876543', '2026-03-01T10:00:00Z'),
    (cli1, 'clinica@nodeclinic.com', 'Dr. Laura Conti', 'clinic', 'active', '+39 02 1234567', '2025-06-15T10:00:00Z'),
    (cli2, 'dermaroma@email.com', 'Dr. Giovanni Bianchi', 'clinic', 'active', NULL, '2025-07-20T10:00:00Z'),
    (adm1, 'admin@nodeclinic.com', 'Marco Ferretti', 'admin', 'active', NULL, '2025-01-01T10:00:00Z')
  ON CONFLICT (id) DO NOTHING;

  -- ---- CLINICS ----
  INSERT INTO clinics (id, owner_id, name, slug, city, address, lat, lng, rating, reviews_count, status, image_url, description, phone, email, created_at) VALUES
    (c1, cli1, 'Clinica Estetica Milano', 'clinica-estetica-milano', 'Milano', 'Via Monte Napoleone 8', 45.4685, 9.1954, 4.8, 142, 'active',
     'https://images.unsplash.com/photo-1629909615184-74f495363b67?w=800&h=600&fit=crop&q=80',
     'Centro di eccellenza per la medicina estetica nel cuore di Milano.',
     '+39 02 1234567', 'info@clinicamilano.it', '2025-06-15T10:00:00Z'),
    (c2, cli2, 'Derma Clinic Roma', 'derma-clinic-roma', 'Roma', 'Via del Corso 120', 41.9028, 12.4964, 4.9, 98, 'active',
     'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=600&fit=crop&q=80',
     'Specialisti in dermatologia estetica e trattamenti laser.',
     '+39 06 7654321', 'info@dermaroma.it', '2025-07-20T10:00:00Z'),
    (c3, NULL, 'Beauty Lab Bologna', 'beauty-lab-bologna', 'Bologna', 'Via Indipendenza 32', 44.4949, 11.3426, 4.7, 76, 'active',
     'https://images.unsplash.com/photo-1598300056393-4aac492f4344?w=800&h=600&fit=crop&q=80',
     'Trattamenti personalizzati con tecnologie di ultima generazione.',
     '+39 051 9876543', 'info@beautylabbologna.it', '2025-08-10T10:00:00Z')
  ON CONFLICT (id) DO NOTHING;

  -- ---- TREATMENTS ----
  INSERT INTO treatments (id, name, slug, category, description, price_from, price_to, duration_min, image_url, status, created_at) VALUES
    (t1, 'Filler Labbra', 'filler-labbra', 'iniettivi', 'Aumento e definizione delle labbra con acido ialuronico.', 250, 500, 30,
     'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=600&fit=crop&q=80', 'active', '2025-01-01T10:00:00Z'),
    (t2, 'Botox', 'botox', 'iniettivi', 'Trattamento delle rughe di espressione con tossina botulinica.', 200, 450, 20,
     'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&h=600&fit=crop&q=80', 'active', '2025-01-01T10:00:00Z'),
    (t3, 'Laser Resurfacing', 'laser-resurfacing', 'laser', 'Rinnovamento cutaneo tramite tecnologia laser frazionata.', 300, 800, 45,
     'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&h=600&fit=crop&q=80', 'active', '2025-01-01T10:00:00Z'),
    (t4, 'Peeling Chimico', 'peeling-chimico', 'viso', 'Esfoliazione chimica per rinnovare e illuminare la pelle.', 120, 300, 30,
     'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&h=600&fit=crop&q=80', 'active', '2025-01-01T10:00:00Z'),
    (t5, 'Mesoterapia', 'mesoterapia', 'corpo', 'Microiniezioni di principi attivi per combattere cellulite e adiposità.', 150, 350, 40,
     'https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=800&h=600&fit=crop&q=80', 'active', '2025-01-01T10:00:00Z'),
    (t6, 'Biostimolazione', 'biostimolazione', 'viso', 'Stimolazione del collagene per un effetto anti-aging naturale.', 200, 450, 35,
     'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&q=80', 'active', '2025-01-01T10:00:00Z'),
    (t7, 'Rinomodellamento', 'rinomodellamento', 'iniettivi', 'Correzione del profilo nasale senza chirurgia con filler.', 350, 700, 30,
     'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop&q=80', 'active', '2025-01-01T10:00:00Z'),
    (t8, 'Lipolaser', 'lipolaser', 'corpo', 'Riduzione delle adiposità localizzate tramite laser a bassa intensità.', 300, 600, 60,
     'https://images.unsplash.com/photo-1540555700478-4be289fbec6b?w=800&h=600&fit=crop&q=80', 'active', '2025-01-01T10:00:00Z')
  ON CONFLICT (id) DO NOTHING;

  -- ---- CLINIC_TREATMENTS (all clinics offer all treatments for seed) ----
  INSERT INTO clinic_treatments (clinic_id, treatment_id) VALUES
    (c1, t1), (c1, t2), (c1, t3), (c1, t4), (c1, t5), (c1, t6), (c1, t7), (c1, t8),
    (c2, t1), (c2, t2), (c2, t3), (c2, t4), (c2, t5), (c2, t6), (c2, t7), (c2, t8),
    (c3, t1), (c3, t2), (c3, t3), (c3, t4), (c3, t5), (c3, t6), (c3, t7), (c3, t8)
  ON CONFLICT (clinic_id, treatment_id) DO NOTHING;

  -- ---- BOOKINGS ----
  INSERT INTO bookings (id, user_id, clinic_id, treatment_id, date, time, status, deposit_amount, total_amount, user_name, clinic_name, treatment_name, created_at) VALUES
    (b1,  usr1, c1, t2, '2026-03-14', '14:30', 'confirmed', 50, 350, 'Sofia Marchetti', 'Clinica Estetica Milano', 'Botox', '2026-03-01T10:00:00Z'),
    (b2,  usr2, c1, t1, '2026-03-14', '10:30', 'pending', 50, 400, 'Giulia Rossi', 'Clinica Estetica Milano', 'Filler Labbra', '2026-03-02T10:00:00Z'),
    (b3,  usr3, c2, t3, '2026-03-15', '09:00', 'confirmed', 80, 500, 'Marco Santini', 'Derma Clinic Roma', 'Laser Resurfacing', '2026-03-03T10:00:00Z'),
    (b4,  usr5, c3, t6, '2026-03-16', '11:00', 'confirmed', 50, 300, 'Laura Martini', 'Beauty Lab Bologna', 'Biostimolazione', '2026-03-04T10:00:00Z'),
    (b5,  usr4, c1, t7, '2026-03-13', '16:00', 'completed', 70, 500, 'Alessia Peroni', 'Clinica Estetica Milano', 'Rinomodellamento', '2026-02-28T10:00:00Z'),
    (b6,  usr6, c2, t4, '2026-03-17', '14:00', 'pending', 30, 200, 'Chiara Verdi', 'Derma Clinic Roma', 'Peeling Chimico', '2026-03-05T10:00:00Z'),
    (b7,  usr7, c3, t5, '2026-03-12', '10:00', 'completed', 40, 250, 'Andrea Fontana', 'Beauty Lab Bologna', 'Mesoterapia', '2026-02-25T10:00:00Z'),
    (b8,  usr1, c2, t8, '2026-03-18', '15:30', 'confirmed', 60, 450, 'Sofia Marchetti', 'Derma Clinic Roma', 'Lipolaser', '2026-03-06T10:00:00Z'),
    (b9,  usr2, c3, t2, '2026-03-11', '09:30', 'cancelled', 50, 300, 'Giulia Rossi', 'Beauty Lab Bologna', 'Botox', '2026-02-20T10:00:00Z'),
    (b10, usr5, c1, t1, '2026-03-19', '11:30', 'pending', 50, 380, 'Laura Martini', 'Clinica Estetica Milano', 'Filler Labbra', '2026-03-07T10:00:00Z'),
    (b11, usr3, c1, t4, '2026-03-14', '09:00', 'confirmed', 30, 180, 'Marco Santini', 'Clinica Estetica Milano', 'Peeling Chimico', '2026-03-05T10:00:00Z'),
    (b12, usr7, c2, t6, '2026-03-20', '16:30', 'confirmed', 50, 350, 'Andrea Fontana', 'Derma Clinic Roma', 'Biostimolazione', '2026-03-08T10:00:00Z')
  ON CONFLICT (id) DO NOTHING;

  -- ---- PAYMENTS ----
  INSERT INTO payments (id, booking_id, user_id, clinic_id, amount, deposit, status, user_name, clinic_name, treatment_name, created_at) VALUES
    (uuid_generate_v4(), b1,  usr1, c1, 350, 50, 'paid', 'Sofia Marchetti', 'Clinica Estetica Milano', 'Botox', '2026-03-01T10:00:00Z'),
    (uuid_generate_v4(), b2,  usr2, c1, 400, 50, 'pending', 'Giulia Rossi', 'Clinica Estetica Milano', 'Filler Labbra', '2026-03-02T10:00:00Z'),
    (uuid_generate_v4(), b3,  usr3, c2, 500, 80, 'paid', 'Marco Santini', 'Derma Clinic Roma', 'Laser Resurfacing', '2026-03-03T10:00:00Z'),
    (uuid_generate_v4(), b4,  usr5, c3, 300, 50, 'paid', 'Laura Martini', 'Beauty Lab Bologna', 'Biostimolazione', '2026-03-04T10:00:00Z'),
    (uuid_generate_v4(), b5,  usr4, c1, 500, 70, 'paid', 'Alessia Peroni', 'Clinica Estetica Milano', 'Rinomodellamento', '2026-02-28T10:00:00Z'),
    (uuid_generate_v4(), b6,  usr6, c2, 200, 30, 'pending', 'Chiara Verdi', 'Derma Clinic Roma', 'Peeling Chimico', '2026-03-05T10:00:00Z'),
    (uuid_generate_v4(), b7,  usr7, c3, 250, 40, 'paid', 'Andrea Fontana', 'Beauty Lab Bologna', 'Mesoterapia', '2026-02-25T10:00:00Z'),
    (uuid_generate_v4(), b8,  usr1, c2, 450, 60, 'paid', 'Sofia Marchetti', 'Derma Clinic Roma', 'Lipolaser', '2026-03-06T10:00:00Z'),
    (uuid_generate_v4(), b9,  usr2, c3, 300, 50, 'refunded', 'Giulia Rossi', 'Beauty Lab Bologna', 'Botox', '2026-02-20T10:00:00Z'),
    (uuid_generate_v4(), b10, usr5, c1, 380, 50, 'pending', 'Laura Martini', 'Clinica Estetica Milano', 'Filler Labbra', '2026-03-07T10:00:00Z'),
    (uuid_generate_v4(), b11, usr3, c1, 180, 30, 'paid', 'Marco Santini', 'Clinica Estetica Milano', 'Peeling Chimico', '2026-03-05T10:00:00Z'),
    (uuid_generate_v4(), b12, usr7, c2, 350, 50, 'paid', 'Andrea Fontana', 'Derma Clinic Roma', 'Biostimolazione', '2026-03-08T10:00:00Z')
  ON CONFLICT (id) DO NOTHING;

  -- ---- REVIEWS ----
  INSERT INTO reviews (id, clinic_id, user_id, user_name, rating, text, treatment, created_at) VALUES
    (uuid_generate_v4(), c1, usr1, 'Sofia M.', 5, 'Esperienza impeccabile. Staff professionale e ambiente curato.', 'Filler Labbra', '2026-02-15T10:00:00Z'),
    (uuid_generate_v4(), c1, usr4, 'Alessia P.', 4, 'Molto soddisfatta del risultato. Consigliato.', 'Botox', '2026-02-20T10:00:00Z'),
    (uuid_generate_v4(), c2, usr3, 'Marco S.', 5, 'Finalmente un servizio che mette la trasparenza al primo posto.', 'Laser Resurfacing', '2026-02-25T10:00:00Z'),
    (uuid_generate_v4(), c3, usr5, 'Laura M.', 4, 'Buon trattamento, tempi di attesa ridotti.', 'Biostimolazione', '2026-03-01T10:00:00Z'),
    (uuid_generate_v4(), c2, usr6, 'Chiara V.', 5, 'Eccellente, risultato naturale e personale gentilissimo.', 'Peeling Chimico', '2026-03-03T10:00:00Z')
  ON CONFLICT (id) DO NOTHING;

  -- ---- LEADS ----
  INSERT INTO leads (source, name, email, phone, city, treatment, message, company, created_at) VALUES
    ('prenota-visita', 'Maria Colombo', 'maria.c@email.com', '+39 333 1111111', 'Milano', 'Filler Labbra', NULL, NULL, '2026-03-01T10:00:00Z'),
    ('diventa-partner', 'Dr. Paolo Neri', 'paolo.n@clinica.it', '+39 02 9999999', NULL, NULL, NULL, 'Studio Neri', '2026-03-02T10:00:00Z'),
    ('trattamenti', 'Federica Gallo', 'federica.g@email.com', NULL, NULL, 'Botox', NULL, NULL, '2026-03-03T10:00:00Z'),
    ('contact', 'Roberto Esposito', 'roberto.e@email.com', NULL, NULL, NULL, 'Vorrei informazioni sui prezzi.', NULL, '2026-03-04T10:00:00Z'),
    ('exit-intent', 'Anna Moretti', 'anna.m@email.com', '+39 340 5555555', NULL, NULL, NULL, NULL, '2026-03-05T10:00:00Z');

  -- ---- FUNNEL EVENTS ----
  INSERT INTO funnel_events (funnel, step, page, form_id, conversion_type, conversion_value, timestamp) VALUES
    ('booking', 'page_view', '/search', NULL, NULL, NULL, '2026-03-05T10:00:00Z'),
    ('booking', 'clinic_view', '/clinic/c1', NULL, NULL, NULL, '2026-03-05T10:05:00Z'),
    ('booking', 'booking_start', '/book/c1/t2', NULL, NULL, NULL, '2026-03-05T10:10:00Z'),
    ('booking', 'payment', '/book/c1/t2', NULL, NULL, 350, '2026-03-05T10:15:00Z'),
    ('booking', 'confirmed', '/book/c1/t2', NULL, 'booking', 350, '2026-03-05T10:16:00Z'),
    ('booking', 'page_view', '/search', NULL, NULL, NULL, '2026-03-06T11:00:00Z'),
    ('booking', 'clinic_view', '/clinic/c2', NULL, NULL, NULL, '2026-03-06T11:05:00Z'),
    ('booking', 'booking_start', '/book/c2/t3', NULL, NULL, NULL, '2026-03-06T11:10:00Z'),
    ('booking', 'payment', '/book/c2/t3', NULL, NULL, 500, '2026-03-06T11:15:00Z'),
    ('booking', 'confirmed', '/book/c2/t3', NULL, 'booking', 500, '2026-03-06T11:16:00Z'),
    ('lead', 'page_view', '/lp/prenota-visita', NULL, NULL, NULL, '2026-03-07T09:00:00Z'),
    ('lead', 'form_start', NULL, 'prenota-visita', NULL, NULL, '2026-03-07T09:02:00Z'),
    ('lead', 'form_submit', NULL, 'prenota-visita', 'lead', NULL, '2026-03-07T09:05:00Z'),
    ('lead', 'page_view', '/lp/diventa-partner', NULL, NULL, NULL, '2026-03-08T14:00:00Z'),
    ('lead', 'form_start', NULL, 'diventa-partner', NULL, NULL, '2026-03-08T14:03:00Z'),
    ('lead', 'form_submit', NULL, 'diventa-partner', 'lead', NULL, '2026-03-08T14:06:00Z'),
    ('booking', 'page_view', '/search', NULL, NULL, NULL, '2026-03-09T16:00:00Z'),
    ('booking', 'clinic_view', '/clinic/c3', NULL, NULL, NULL, '2026-03-09T16:05:00Z'),
    ('lead', 'page_view', '/lp/trattamenti', NULL, NULL, NULL, '2026-03-10T10:30:00Z'),
    ('lead', 'form_start', NULL, 'trattamenti', NULL, NULL, '2026-03-10T10:33:00Z'),
    ('lead', 'form_submit', NULL, 'trattamenti', 'lead', NULL, '2026-03-10T10:35:00Z'),
    ('bio', 'page_view', '/lp/bio', NULL, NULL, NULL, '2026-03-11T08:00:00Z'),
    ('bio', 'link_click', '/lp/prenota-visita', NULL, NULL, NULL, '2026-03-11T08:01:00Z');

END $$;
