import { create } from 'zustand'
import { supabase, Player } from '@/lib/supabase'

interface AuthState {
  user: Player | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  signIn: async (email: string, password: string) => {
    try {
      // Da wir keine Supabase Auth verwenden (keine Registrierung),
      // müssen wir eine Custom-Authentifizierung implementieren
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        throw new Error('Login fehlgeschlagen')
      }

      // In Production würde hier ein echter Password-Check stattfinden
      // Für dieses Beispiel setzen wir den User direkt
      set({ user: data })
      
      // Speichere User-ID im localStorage für Session-Management
      if (typeof window !== 'undefined') {
        localStorage.setItem('userId', data.id)
      }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  },

  signOut: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userId')
    }
    set({ user: null })
  },

  checkAuth: async () => {
    try {
      if (typeof window === 'undefined') {
        set({ loading: false })
        return
      }

      const userId = localStorage.getItem('userId')
      
      if (!userId) {
        set({ user: null, loading: false })
        return
      }

      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', userId)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        localStorage.removeItem('userId')
        set({ user: null, loading: false })
        return
      }

      set({ user: data, loading: false })
    } catch (error) {
      console.error('Check auth error:', error)
      set({ user: null, loading: false })
    }
  },
}))