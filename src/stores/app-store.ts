'use client'

import { create } from 'zustand'

export type User = {
  id: string
  email: string
  name: string | null
  image: string | null
  provider: string
  theme: string
  enableMenstrual: boolean
  currency: string
}

export type View = 'dashboard' | 'task' | 'finance' | 'cycle' | 'stats' | 'settings'

interface AppState {
  user: User | null
  loading: boolean
  view: View
  setUser: (u: User | null) => void
  setLoading: (b: boolean) => void
  setView: (v: View) => void
  refresh: () => Promise<void>
}

export const useApp = create<AppState>((set) => ({
  user: null,
  loading: true,
  view: 'dashboard',
  setUser: (u) => set({ user: u }),
  setLoading: (b) => set({ loading: b }),
  setView: (v) => set({ view: v }),
  refresh: async () => {
    try {
      const res = await fetch('/api/auth/session', { credentials: 'include' })
      const data = await res.json()
      if (!data.user) {
        set({ user: null, loading: false, view: 'dashboard' })
      } else {
        set({ user: data.user, loading: false })
      }
    } catch {
      set({ user: null, loading: false, view: 'dashboard' })
    }
  },
}))
