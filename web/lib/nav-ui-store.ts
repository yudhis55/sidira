"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NavUiState {
  collapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (v: boolean) => void;
}

export const useNavUi = create<NavUiState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
      setCollapsed: (v: boolean) => set({ collapsed: v }),
    }),
    { name: "sidira:nav-ui" }
  )
);
