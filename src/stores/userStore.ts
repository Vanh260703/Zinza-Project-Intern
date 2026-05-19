import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/user";

type UserStore = {
  user: User | null;
  token: string | null;
  setUser: (user: User, token: string) => void;
  logout: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: "auth" } // key trong localStorage
  )
);
