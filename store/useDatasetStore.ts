// store/useDatasetStore.ts
import { create } from "zustand";
import {
  parseCSV,
  buildFilterOptions,
  computeDatasetSummary,
} from "@/lib/csv-engine";
import type {
  ParsedDataset,
  InferredColumn,
  DatasetSummary,
} from "@/lib/csv-engine";

interface DatasetState {
  // Available files
  availableFiles: string[];
  activeFile: string | null;

  // Loaded data
  dataset: ParsedDataset | null;
  filterOptions: Record<string, string[]>;
  summary: DatasetSummary | null;

  // Loading/error state
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAvailableFiles: () => Promise<void>;
  loadFile: (filename: string) => Promise<void>;
  clearDataset: () => void;
  loadForOrg: (orgDefaultDataset: string) => Promise<void>;
}

export const useDatasetStore = create<DatasetState>((set, get) => ({
  availableFiles: [],
  activeFile: null,
  dataset: null,
  filterOptions: {},
  summary: null,
  isLoading: false,
  error: null,

  fetchAvailableFiles: async () => {
    try {
      const res = await fetch("/api/dataset");
      const data = await res.json();
      set({ availableFiles: data.files ?? [] });

      // Auto-load first file if none loaded
      if (data.files?.length > 0 && !get().dataset) {
        await get().loadFile(data.files[0]);
      }
    } catch {
      set({ error: "Failed to list dataset files" });
    }
  },

  loadFile: async (filename: string) => {
    set({ isLoading: true, error: null, activeFile: filename });
    try {
      const res = await fetch(
        `/api/dataset?file=${encodeURIComponent(filename)}`,
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to load file");
      }
      const csvText = await res.text();

      // Parse in a microtask to avoid blocking UI
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          try {
            const dataset = parseCSV(csvText, filename);
            const filterOptions = buildFilterOptions(
              dataset.rows,
              dataset.columns,
            );
            const summary = computeDatasetSummary(
              dataset.rows,
              dataset.columns,
            );
            set({ dataset, filterOptions, summary, isLoading: false });
          } catch (e) {
            set({ error: String(e), isLoading: false });
          }
          resolve();
        }, 0);
      });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  clearDataset: () =>
    set({
      dataset: null,
      filterOptions: {},
      summary: null,
      activeFile: null,
      error: null,
    }),

  loadForOrg: async (orgDefaultDataset: string) => {
    const { availableFiles, activeFile, loadFile, fetchAvailableFiles } = get();
    // Already on this file — skip
    if (activeFile === orgDefaultDataset) return;
    // If files not fetched yet, fetch first
    const files = availableFiles.length
      ? availableFiles
      : await (async () => {
          await fetchAvailableFiles();
          return get().availableFiles;
        })();
    if (files.includes(orgDefaultDataset)) {
      await loadFile(orgDefaultDataset);
    } else if (files.length > 0 && !activeFile) {
      await loadFile(files[0]);
    }
  },
}));
