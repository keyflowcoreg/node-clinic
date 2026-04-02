export type ClinicStatus = 'active' | 'pending' | 'rejected'
export type TreatmentCategory = 'iniettivi' | 'laser' | 'corpo' | 'viso' | 'chirurgia'
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type UserRole = 'user' | 'clinic' | 'admin'
export type UserStatus = 'active' | 'suspended'
export type LeadSource = 'prenota-visita' | 'diventa-partner' | 'trattamenti' | 'contact' | 'exit-intent' | 'whatsapp' | 'chatbot' | 'bio'
export type PaymentStatus = 'paid' | 'pending' | 'refunded'

export type Clinic = {
  id: string
  name: string
  slug: string
  city: string
  address: string
  lat: number
  lng: number
  rating: number
  reviews_count: number
  status: ClinicStatus
  image_url: string
  description: string
  phone?: string
  email?: string
  website?: string
  opening_hours?: Record<string, { open: string; close: string }>
  created_at: string
}

export type Treatment = {
  id: string
  name: string
  slug: string
  category: TreatmentCategory
  description: string
  price_from: number
  price_to: number
  duration_min: number
  image_url: string
  status?: 'active' | 'inactive'
  created_at: string
}

export type Booking = {
  id: string
  user_id: string
  user_name?: string
  clinic_id: string
  clinic_name?: string
  treatment_id: string
  treatment_name?: string
  date: string
  time: string
  status: BookingStatus
  deposit_amount: number
  total_amount?: number
  notes?: string
  created_at: string
}

export type User = {
  id: string
  email: string
  name: string
  phone?: string
  role: UserRole
  status: UserStatus
  avatar_url?: string
  date_of_birth?: string
  created_at: string
}

export type Review = {
  id: string
  clinic_id: string
  user_id: string
  user_name: string
  booking_id?: string
  rating: number
  text: string
  treatment?: string
  created_at: string
}

export type Lead = {
  id: string
  source: LeadSource
  name: string
  email: string
  phone?: string
  city?: string
  treatment?: string
  message?: string
  company?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  created_at: string
}

export type Payment = {
  id: string
  booking_id: string
  user_id: string
  user_name: string
  clinic_id: string
  clinic_name: string
  treatment_name: string
  amount: number
  deposit: number
  status: PaymentStatus
  created_at: string
}

export type Notification = {
  id: string
  type: 'booking' | 'lead' | 'review' | 'system'
  title: string
  message: string
  read: boolean
  created_at: string
}

export type FunnelEvent = {
  id: string
  funnel: string
  step: string
  page?: string
  form_id?: string
  conversion_type?: string
  conversion_value?: number
  timestamp: string
}

export type PlatformSettings = {
  platform_name: string
  support_email: string
  support_phone: string
  whatsapp_number: string
  commission_rate: number
  notifications_email: boolean
  notifications_whatsapp: boolean
  notifications_sms: boolean
}
