"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileSpreadsheet, RefreshCw, Check, AlertCircle, Loader2 } from "lucide-react";
import { useDatasetStore } from "@/store/useDatasetStore";

export function DatasetFilePicker() {
  const { availableFiles, activeFile, isLoading, error, fetchAvailableFiles, loadFile } =
    useDatasetStore();

  useEffect(() => {
    fetchAvailableFiles();
  }, [fetchAvailableFiles]);

  if (availableFiles.length === 0 && !isLoading && !error) return null;

  return (
    <div className="flex items-center gap-2">
      {/* File selector */}
      {availableFiles.length > 0 && (
        <div className="relative">
          <select
            value={activeFile ?? ""}
            onChange={(e) => e.target.value && loadFile(e.target.value)}
            disabled={isLoading}
            className="appearance-none pl-7 pr-8 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer"
            style={{
              background: "rgb(255 255 255 / 0.05)",
              border: "1px solid var(--color-border)",
              color: "var(--color-foreground)",
            }}
          >
            {availableFiles.map((f) => (
              <option key={f} value={f} className="bg-gray-900">
                {f}
              </option>
            ))}
          </select>
          <FileSpreadsheet
            size={13}
            className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--color-org-primary)" }}
          />
        </div>
      )}

      {/* Loading spinner */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5 text-xs"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          <Loader2 size={12} className="animate-spin" style={{ color: "var(--color-org-primary)" }} />
          Parsing CSV...
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg"
          style={{
            color: "var(--color-danger)",
            background: "color-mix(in srgb, var(--color-danger) 10%, transparent)",
            border: "1px solid color-mix(in srgb, var(--color-danger) 25%, transparent)",
          }}
          title={error}
        >
          <AlertCircle size={11} />
          CSV error
        </motion.div>
      )}

      {/* Refresh */}
      <button
        onClick={() => fetchAvailableFiles()}
        disabled={isLoading}
        className="p-1.5 rounded-lg transition-colors"
        title="Refresh dataset files"
        style={{ color: "var(--color-muted-foreground)" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "rgb(255 255 255 / 0.05)";
          (e.currentTarget as HTMLElement).style.color = "var(--color-foreground)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "transparent";
          (e.currentTarget as HTMLElement).style.color = "var(--color-muted-foreground)";
        }}
      >
        <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
      </button>
    </div>
  );
}
