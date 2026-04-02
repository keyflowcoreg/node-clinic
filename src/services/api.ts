import type { Clinic, Treatment, Booking, Lead, Review } from '../types/database'
import { store } from './store'

export const api = {
  clinics: {
    list: async (): Promise<Clinic[]> => store.clinics.getAll(),
    getById: async (id: string): Promise<Clinic | undefined> => store.clinics.getById(id),
    getBySlug: async (slug: string): Promise<Clinic | undefined> => store.clinics.getBySlug(slug),
    search: async (query: string, city?: string): Promise<Clinic[]> => store.clinics.search(query, city),
  },
  treatments: {
    list: async (): Promise<Treatment[]> => store.treatments.getAll(),
    getById: async (id: string): Promise<Treatment | undefined> => store.treatments.getById(id),
  },
  bookings: {
    create: async (data: Omit<Booking, 'id' | 'created_at'>): Promise<Booking> => store.bookings.create(data),
    getByUserId: async (userId: string): Promise<Booking[]> => store.bookings.getByUserId(userId),
    update: async (id: string, data: Partial<Booking>): Promise<Booking | undefined> => store.bookings.update(id, data),
  },
  leads: {
    submit: async (data: Omit<Lead, 'id' | 'created_at'>): Promise<Lead> => store.leads.create(data),
  },
  reviews: {
    getByClinicId: async (clinicId: string): Promise<Review[]> => store.reviews.getByClinicId(clinicId),
    create: async (data: Omit<Review, 'id' | 'created_at'>): Promise<Review> => store.reviews.create(data),
  },
}
