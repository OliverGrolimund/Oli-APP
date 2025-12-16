import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Player {
  id: string
  email: string
  nickname: string
  is_active: boolean
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  location: string
  event_date: string
  time_from: string
  time_to: string
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Utensil {
  id: string
  name: string
  icon: string | null
  created_at: string
}

export interface EventResponse {
  id: string
  event_id: string
  player_id: string
  response_type: 'zusage' | 'absage'
  comment: string | null
  guest_count: number
  created_at: string
  updated_at: string
  player?: Player
  response_utensils?: ResponseUtensil[]
}

export interface ResponseUtensil {
  id: string
  response_id: string
  utensil_id: string
  utensil?: Utensil
  created_at: string
}