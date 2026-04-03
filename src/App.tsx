/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ChatBot } from './components/ui/ChatBot';
import { CookieConsent } from './components/CookieConsent';

// Lazy-loaded page components
const Home = React.lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Search = React.lazy(() => import('./pages/Search').then(m => ({ default: m.Search })));
const ClinicDetail = React.lazy(() => import('./pages/ClinicDetail').then(m => ({ default: m.ClinicDetail })));
const Booking = React.lazy(() => import('./pages/Booking').then(m => ({ default: m.Booking })));
const UserArea = React.lazy(() => import('./pages/UserArea').then(m => ({ default: m.UserArea })));
const PartnerApplication = React.lazy(() => import('./pages/PartnerApplication').then(m => ({ default: m.PartnerApplication })));
const ClinicPortal = React.lazy(() => import('./pages/ClinicPortal').then(m => ({ default: m.ClinicPortal })));
const Legal = React.lazy(() => import('./pages/Legal').then(m => ({ default: m.Legal })));
const About = React.lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Journal = React.lazy(() => import('./pages/Journal').then(m => ({ default: m.Journal })));
const Contact = React.lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const NotFound = React.lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

// Auth pages
const Login = React.lazy(() => import('./pages/auth/Login').then(m => ({ default: m.Login })));
const Register = React.lazy(() => import('./pages/auth/Register').then(m => ({ default: m.Register })));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })));

// Admin pages
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminClinics = React.lazy(() => import('./pages/admin/AdminClinics').then(m => ({ default: m.AdminClinics })));
const AdminBookings = React.lazy(() => import('./pages/admin/AdminBookings').then(m => ({ default: m.AdminBookings })));
const AdminLandingPages = React.lazy(() => import('./pages/admin/AdminLandingPages').then(m => ({ default: m.AdminLandingPages })));
const AdminAnalytics = React.lazy(() => import('./pages/admin/AdminAnalytics').then(m => ({ default: m.AdminAnalytics })));
const AdminUsers = React.lazy(() => import('./pages/admin/AdminUsers').then(m => ({ default: m.AdminUsers })));
const AdminTreatments = React.lazy(() => import('./pages/admin/AdminTreatments').then(m => ({ default: m.AdminTreatments })));
const AdminPayments = React.lazy(() => import('./pages/admin/AdminPayments').then(m => ({ default: m.AdminPayments })));
const AdminSettings = React.lazy(() => import('./pages/admin/AdminSettings').then(m => ({ default: m.AdminSettings })));

// Landing pages
const PrenotaVisita = React.lazy(() => import('./pages/landing/PrenotaVisita').then(m => ({ default: m.PrenotaVisita })));
const DiventaPartner = React.lazy(() => import('./pages/landing/DiventaPartner').then(m => ({ default: m.DiventaPartner })));
const Trattamenti = React.lazy(() => import('./pages/landing/Trattamenti').then(m => ({ default: m.Trattamenti })));
const LinkInBio = React.lazy(() => import('./pages/landing/LinkInBio').then(m => ({ default: m.LinkInBio })));

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Auth Routes (No Header/Footer) */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />

          {/* Landing Page Routes (Standalone, no MainLayout) */}
          <Route path="/lp/prenota-visita" element={<PrenotaVisita />} />
          <Route path="/lp/diventa-partner" element={<DiventaPartner />} />
          <Route path="/lp/trattamenti" element={<Trattamenti />} />
          <Route path="/lp/bio" element={<LinkInBio />} />

          {/* Admin Routes (Custom Layout, Protected) */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/clinics" element={<ProtectedRoute requiredRole="admin"><AdminClinics /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute requiredRole="admin"><AdminBookings /></ProtectedRoute>} />
          <Route path="/admin/landing-pages" element={<ProtectedRoute requiredRole="admin"><AdminLandingPages /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AdminAnalytics /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/treatments" element={<ProtectedRoute requiredRole="admin"><AdminTreatments /></ProtectedRoute>} />
          <Route path="/admin/payments" element={<ProtectedRoute requiredRole="admin"><AdminPayments /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>} />

          {/* Main App Routes (With Header/Footer) */}
          <Route path="/*" element={
            <MainLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/clinic/:id" element={<ClinicDetail />} />
                <Route path="/book/:clinicId/:treatmentId" element={<Booking />} />
                <Route path="/user" element={<ProtectedRoute><UserArea /></ProtectedRoute>} />
                <Route path="/partner" element={<PartnerApplication />} />
                <Route path="/portal" element={<ProtectedRoute requiredRole="clinic"><ClinicPortal /></ProtectedRoute>} />
                <Route path="/doctor" element={<ProtectedRoute requiredRole="doctor"><ClinicPortal /></ProtectedRoute>} />
                <Route path="/terms" element={<Legal />} />
                <Route path="/privacy" element={<Legal />} />
                <Route path="/cookies" element={<Legal />} />
                <Route path="/about" element={<About />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayout>
          } />
        </Routes>
      </Suspense>
      <CookieConsent />
    </Router>
  );
}
