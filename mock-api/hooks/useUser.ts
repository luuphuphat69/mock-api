"use client"

import { create } from "zustand"
import { me } from "@/utilities/api/api"

interface User {
  id: string
  name: string
  email: string
  type: string
}

interface UserStore {
  user: User | null
  loading: boolean
  fetchUser: () => Promise<void>
  clearUser: () => void
}

export const useUser = create<UserStore>((set, get) => ({
  user: null,
  loading: false,

  fetchUser: async () => {
    // Prevent duplicate fetches
    if (get().user !== null || get().loading) return

    set({ loading: true })

    try {
      const res = await me()
      set({ user: res.data?.user})
    } catch {
      set({ user: null })
    } finally {
      set({ loading: false })
    }
  },

  clearUser: () => set({ user: null }),
}))