import { create } from "zustand";
import { me } from "@/utilities/api/api";

interface User {
  id: string;
  name: string;
  email: string;
  type: string;
}

interface UserStore {
  user: User | null;
  loading: boolean;

  fetchUser: () => Promise<void>;
  clearUser: () => void;

  setUser: (user: User | null) => void;
}

export const useUser = create<UserStore>((set, get) => ({
  user: null,
  loading: false,

  fetchUser: async () => {
    if (get().loading) return;

    set({ loading: true });

    try {
      const res = await me();

      set({
        user: res.data?.user,
      });
    } catch {
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },

  clearUser: () => set({ user: null }),

  setUser: (user) => set({ user }),
}));