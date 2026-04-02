/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { ClinicDetail } from './pages/ClinicDetail';
import { Booking } from './pages/Booking';
import { UserArea } from './pages/UserArea';
import { PartnerApplication } from './pages/PartnerApplication';
import { ClinicPortal } from './pages/ClinicPortal';
import { Legal } from './pages/Legal';
import { About } from './pages/About';
import { Journal } from './pages/Journal';
import { Contact } from './pages/Contact';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminClinics } from './pages/admin/AdminClinics';
import { AdminBookings } from './pages/admin/AdminBookings';
import { AdminLandingPages } from './pages/admin/AdminLandingPages';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminTreatments } from './pages/admin/AdminTreatments';
import { AdminPayments } from './pages/admin/AdminPayments';
import { AdminSettings } from './pages/admin/AdminSettings';
import { PrenotaVisita } from './pages/landing/PrenotaVisita';
import { DiventaPartner } from './pages/landing/DiventaPartner';
import { Trattamenti } from './pages/landing/Trattamenti';
import { LinkInBio } from './pages/landing/LinkInBio';
import { NotFound } from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ChatBot } from './components/ui/ChatBot';

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
      <Routes>
        {/* Auth Routes (No Header/Footer) */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />

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
    </Router>
  );
}