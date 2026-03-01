// store/useOrgStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { HeartPulse, Wheat } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type OrgId = "health" | "agriculture";
export type Role = "admin" | "viewer";

export interface OrgConfig {
  id: OrgId;
  name: string;
  shortName: string;
  description: string;
  themeClass: string;
  icon: LucideIcon;
  defaultDataset: string;
}

export const ORG_CONFIGS: Record<OrgId, OrgConfig> = {
  health: {
    id: "health",
    name: "Ministry of Health",
    shortName: "MoHFW",
    description: "Health & Family Welfare",
    themeClass: "",
    icon: HeartPulse,
    defaultDataset: "health_data.csv",
  },
  agriculture: {
    id: "agriculture",
    name: "Ministry of Agriculture",
    shortName: "MoA",
    description: "Farming & Rural Economy",
    themeClass: "org-agriculture",
    icon: Wheat,
    defaultDataset: "agriculture_data.csv",
  },
};

interface ActiveFilters {
  [columnKey: string]: string;
}

interface OrgState {
  currentOrg: OrgId;
  role: Role;
  /** The immutable role from Supabase user_metadata — source of truth */
  authRole: Role;
  isAIPanelOpen: boolean;
  isCommandPaletteOpen: boolean;
  isMobileSidebarOpen: boolean;
  // Generic column-keyed filters
  activeFilters: ActiveFilters;
  globalSearch: string;

  setOrg: (org: OrgId) => void;
  /** Only admins can override their active role (e.g. to preview viewer mode) */
  setRole: (role: Role) => void;
  syncRoleFromAuth: (role?: string | null) => void;
  toggleAIPanel: () => void;
  setAIPanelOpen: (open: boolean) => void;
  setCommandPalette: (open: boolean) => void;
  setMobileSidebar: (open: boolean) => void;
  setColumnFilter: (key: string, value: string) => void;
  setGlobalSearch: (q: string) => void;
  clearFilters: () => void;
  getOrgConfig: () => OrgConfig;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set, get) => ({
      currentOrg: "health",
      role: "viewer",
      authRole: "viewer",
      isAIPanelOpen: false,
      isCommandPaletteOpen: false,
      isMobileSidebarOpen: false,
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
        // Notify components to reset state (AI messages, grid selection)
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("org-switch", { detail: { org } }),
          );
        }
        // Trigger per-org dataset load
        import("@/store/useDatasetStore").then(({ useDatasetStore }) => {
          useDatasetStore
            .getState()
            .loadForOrg(ORG_CONFIGS[org].defaultDataset);
        });
      },

      setRole: (role) => {
        // Only admins can override the active role (e.g. to preview viewer mode)
        if (get().authRole === "admin") {
          set({ role });
        }
      },

      // Sync role from Supabase user_metadata — sets both authRole and active role
      syncRoleFromAuth: (roleFromMeta) => {
        if (roleFromMeta === "admin" || roleFromMeta === "viewer") {
          set({ authRole: roleFromMeta, role: roleFromMeta });
        } else {
          // No role in metadata → default to viewer
          set({ authRole: "viewer", role: "viewer" });
        }
      },
      toggleAIPanel: () => set((s) => ({ isAIPanelOpen: !s.isAIPanelOpen })),
      setAIPanelOpen: (open) => set({ isAIPanelOpen: open }),
      setCommandPalette: (open) => set({ isCommandPaletteOpen: open }),
      setMobileSidebar: (open) => set({ isMobileSidebarOpen: open }),

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
      partialize: (s) => ({
        currentOrg: s.currentOrg,
        role: s.role,
        authRole: s.authRole,
      }),
      migrate: (persisted: unknown) => {
        const s = persisted as {
          currentOrg?: string;
          role?: string;
          authRole?: string;
        };
        const validOrg =
          s.currentOrg && s.currentOrg in ORG_CONFIGS
            ? (s.currentOrg as OrgId)
            : "health";
        const validRole =
          s.role === "admin" || s.role === "viewer" ? s.role : "viewer";
        const validAuthRole =
          s.authRole === "admin" || s.authRole === "viewer"
            ? s.authRole
            : "viewer";
        return {
          currentOrg: validOrg,
          role: validRole,
          authRole: validAuthRole,
        };
      },
    },
  ),
);
