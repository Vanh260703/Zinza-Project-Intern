import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserWallet } from "@/types/user";

type AuthStore = {
  user: User | null;
  token: string | null;
  wallet: UserWallet | null;
  setUser: (user: User, token: string) => void;
  setWallet: (wallet: UserWallet) => void;
  updateBalance: (delta: number) => void; // trừ/cộng kẹo cục bộ
  logout: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      wallet: null,

      setUser: (user, token) => set({ user, token }),

      setWallet: (wallet) => set({ wallet }),

      updateBalance: (delta) => {
        const { wallet } = get();
        if (!wallet) return;
        set({ wallet: { ...wallet, balance: Math.max(0, wallet.balance + delta) } });
      },

      logout: () => {
        set({ user: null, token: null, wallet: null });
        localStorage.removeItem("auth");
        localStorage.removeItem("reader-settings");
      },
    }),
    {
      name: "auth",
      skipHydration: true,
      onRehydrateStorage: () => () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      },
    }
  )
);
