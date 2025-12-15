// src/shared/store/useAppStore.js
import { create } from "zustand";

export const useAppStore = create((set, get) => ({
  // GLOBAL UI STATE
  isLoading: false,
  loadingText: "Loading...",

  // GLOBAL AUTH (example)
  token: null,
  user: null,

  // ACTIONS
  setLoading: (value, text) =>
    set({
      isLoading: value,
      loadingText: text ?? get().loadingText,
    }),

  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),

  logout: () => set({ token: null, user: null }),
}));
