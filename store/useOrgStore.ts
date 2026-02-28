// store/useOrgStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OrgId = "health" | "agriculture";
export type Role = "admin" | "viewer";

export interface OrgConfig {
  id: OrgId;
  name: string;
  shortName: string;
  description: string;
  themeClass: string;
  icon: string;
  defaultDataset: string;
}

export const ORG_CONFIGS: Record<OrgId, OrgConfig> = {
  health: {
    id: "health",
    name: "Ministry of Health",
    shortName: "MoHFW",
    description: "Health & Family Welfare",
    themeClass: "",
    icon: "🏥",
    defaultDataset: "health_data.csv",
  },
  agriculture: {
    id: "agriculture",
    name: "Ministry of Agriculture",
    shortName: "MoA",
    description: "Farming & Rural Economy",
    themeClass: "org-agriculture",
    icon: "🌾",
    defaultDataset: "agriculture_data.csv",
  },
};

interface ActiveFilters {
  [columnKey: string]: string;
}

interface OrgState {
  currentOrg: OrgId;
  role: Role;
  isAIPanelOpen: boolean;
  isCommandPaletteOpen: boolean;
  // Generic column-keyed filters
  activeFilters: ActiveFilters;
  globalSearch: string;

  setOrg: (org: OrgId) => void;
  setRole: (role: Role) => void;
  toggleAIPanel: () => void;
  setAIPanelOpen: (open: boolean) => void;
  setCommandPalette: (open: boolean) => void;
  setColumnFilter: (key: string, value: string) => void;
  setGlobalSearch: (q: string) => void;
  clearFilters: () => void;
  getOrgConfig: () => OrgConfig;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set, get) => ({
      currentOrg: "health",
      role: "admin",
      isAIPanelOpen: false,
      isCommandPaletteOpen: false,
      activeFilters: {},
      globalSearch: "",

      setOrg: (org) => {
        set({ currentOrg: org, activeFilters: {}, globalSearch: "" });
        if (typeof document !== "undefined") {
          document.documentElement.classList.remove(
            "org-meity",
            "org-agriculture",
          );
          if (ORG_CONFIGS[org].themeClass) {
            document.documentElement.classList.add(ORG_CONFIGS[org].themeClass);
          }
        }
        // Trigger per-org dataset load
        import("@/store/useDatasetStore").then(({ useDatasetStore }) => {
          useDatasetStore
            .getState()
            .loadForOrg(ORG_CONFIGS[org].defaultDataset);
        });
      },

      setRole: (role) => set({ role }),
      toggleAIPanel: () => set((s) => ({ isAIPanelOpen: !s.isAIPanelOpen })),
      setAIPanelOpen: (open) => set({ isAIPanelOpen: open }),
      setCommandPalette: (open) => set({ isCommandPaletteOpen: open }),

      setColumnFilter: (key, value) =>
        set((s) => ({
          activeFilters: { ...s.activeFilters, [key]: value },
        })),

      setGlobalSearch: (q) => set({ globalSearch: q }),

      clearFilters: () => set({ activeFilters: {}, globalSearch: "" }),

      getOrgConfig: () => ORG_CONFIGS[get().currentOrg],
    }),
    {
      name: "bharat-insight-org",
      version: 2,
      partialize: (s) => ({ currentOrg: s.currentOrg, role: s.role }),
      migrate: (persisted: unknown) => {
        const s = persisted as { currentOrg?: string; role?: string };
        const validOrg =
          s.currentOrg && s.currentOrg in ORG_CONFIGS
            ? (s.currentOrg as OrgId)
            : "health";
        return { currentOrg: validOrg, role: s.role ?? "admin" };
      },
    },
  ),
);
