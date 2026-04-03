import type { Clinic, Treatment, Booking, Lead, Review } from '../types/database'
import { store } from './store'
import { supabase } from '../lib/supabase'

export const api = {
  clinics: {
    list: async (): Promise<Clinic[]> => {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('clinics')
            .select('*')
            .eq('status', 'active')
            .order('rating', { ascending: false })
          if (data && !error) return data as Clinic[]
        } catch (err) {
          console.warn('Supabase clinics.list failed, using demo data:', err)
        }
      }
      return store.clinics.getAll()
    },

    getById: async (id: string): Promise<Clinic | undefined> => {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('clinics')
            .select('*')
            .eq('id', id)
            .single()
          if (data && !error) return data as Clinic
        } catch (err) {
          console.warn('Supabase clinics.getById failed, using demo data:', err)
        }
      }
      return store.clinics.getById(id)
    },

    getBySlug: async (slug: string): Promise<Clinic | undefined> => {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('clinics')
            .select('*')
            .eq('slug', slug)
            .single()
          if (data && !error) return data as Clinic
        } catch (err) {
          console.warn('Supabase clinics.getBySlug failed, using demo data:', err)
        }
      }
      return store.clinics.getBySlug(slug)
    },

    search: async (query: string, city?: string): Promise<Clinic[]> => {
      if (supabase) {
        try {
          let q = supabase
            .from('clinics')
            .select('*')
            .eq('status', 'active')

          if (query) {
            q = q.or(`name.ilike.%${query}%,city.ilike.%${query}%`)
          }
          if (city) {
            q = q.ilike('city', city)
          }

          const { data, error } = await q.order('rating', { ascending: false })
          if (data && !error) return data as Clinic[]
        } catch (err) {
          console.warn('Supabase clinics.search failed, using demo data:', err)
        }
      }
      return store.clinics.search(query, city)
    },
  },

  treatments: {
    list: async (): Promise<Treatment[]> => {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('treatments')
            .select('*')
            .eq('status', 'active')
            .order('name')
          if (data && !error) return data as Treatment[]
        } catch (err) {
          console.warn('Supabase treatments.list failed, using demo data:', err)
        }
      }
      return store.treatments.getAll()
    },

    getById: async (id: string): Promise<Treatment | undefined> => {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('treatments')
            .select('*')
            .eq('id', id)
            .single()
          if (data && !error) return data as Treatment
        } catch (err) {
          console.warn('Supabase treatments.getById failed, using demo data:', err)
        }
      }
      return store.treatments.getById(id)
    },
  },

  bookings: {
    create: async (data: Omit<Booking, 'id' | 'created_at'>): Promise<Booking> => {
      if (supabase) {
        try {
          const { data: result, error } = await supabase
            .from('bookings')
            .insert(data)
            .select()
            .single()
          if (result && !error) return result as Booking
        } catch (err) {
          console.warn('Supabase bookings.create failed, using demo data:', err)
        }
      }
      return store.bookings.create(data)
    },

    getByUserId: async (userId: string): Promise<Booking[]> => {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
          if (data && !error) return data as Booking[]
        } catch (err) {
          console.warn('Supabase bookings.getByUserId failed, using demo data:', err)
        }
      }
      return store.bookings.getByUserId(userId)
    },

    update: async (id: string, data: Partial<Booking>): Promise<Booking | undefined> => {
      if (supabase) {
        try {
          const { data: result, error } = await supabase
            .from('bookings')
            .update(data)
            .eq('id', id)
            .select()
            .single()
          if (result && !error) return result as Booking
        } catch (err) {
          console.warn('Supabase bookings.update failed, using demo data:', err)
        }
      }
      return store.bookings.update(id, data)
    },
  },

  leads: {
    submit: async (data: Omit<Lead, 'id' | 'created_at'>): Promise<Lead> => {
      if (supabase) {
        try {
          const { data: result, error } = await supabase
            .from('leads')
            .insert(data)
            .select()
            .single()
          if (result && !error) return result as Lead
        } catch (err) {
          console.warn('Supabase leads.submit failed, using demo data:', err)
        }
      }
      return store.leads.create(data)
    },
  },

  reviews: {
    getByClinicId: async (clinicId: string): Promise<Review[]> => {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('clinic_id', clinicId)
            .order('created_at', { ascending: false })
          if (data && !error) return data as Review[]
        } catch (err) {
          console.warn('Supabase reviews.getByClinicId failed, using demo data:', err)
        }
      }
      return store.reviews.getByClinicId(clinicId)
    },

    create: async (data: Omit<Review, 'id' | 'created_at'>): Promise<Review> => {
      if (supabase) {
        try {
          const { data: result, error } = await supabase
            .from('reviews')
            .insert(data)
            .select()
            .single()
          if (result && !error) return result as Review
        } catch (err) {
          console.warn('Supabase reviews.create failed, using demo data:', err)
        }
      }
      return store.reviews.create(data)
    },
  },
}
