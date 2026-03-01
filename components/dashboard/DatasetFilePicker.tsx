"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  FileSpreadsheet,
  RefreshCw,
  AlertCircle,
  Loader2,
  Upload,
} from "lucide-react";
import { useDatasetStore } from "@/store/useDatasetStore";

export function DatasetFilePicker() {
  const {
    availableFiles,
    activeFile,
    isLoading,
    error,
    fetchAvailableFiles,
    loadFile,
    loadFromUpload,
  } = useDatasetStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAvailableFiles();
  }, [fetchAvailableFiles]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await loadFromUpload(file);
    // Reset input so the same file can be re-uploaded if needed
    e.target.value = "";
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        aria-label="Upload CSV file"
        onChange={handleFileChange}
      />

      {/* Server-side file selector */}
      {availableFiles.length > 0 && (
        <div className="relative">
          <select
            value={activeFile ?? ""}
            onChange={(e) => e.target.value && loadFile(e.target.value)}
            disabled={isLoading}
            aria-label="Select dataset file"
            className="appearance-none pl-7 pr-8 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer max-w-[140px] sm:max-w-none truncate"
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

      {/* Upload CSV button */}
      <button
        onClick={handleUploadClick}
        disabled={isLoading}
        aria-label="Upload CSV file"
        title="Upload a local CSV file (max 50 MB)"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
        style={{
          background: "var(--color-org-muted)",
          border: "1px solid var(--color-org-border)",
          color: "var(--color-org-primary)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = "0.8";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = "1";
        }}
      >
        <Upload size={12} />
        <span>Upload CSV</span>
      </button>

      {/* Loading indicator */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5 text-xs"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          <Loader2
            size={12}
            className="animate-spin"
            style={{ color: "var(--color-org-primary)" }}
          />
          <span className="hidden sm:inline">Parsing...</span>
        </motion.div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg"
          style={{
            color: "var(--color-danger)",
            background:
              "color-mix(in srgb, var(--color-danger) 10%, transparent)",
            border:
              "1px solid color-mix(in srgb, var(--color-danger) 25%, transparent)",
          }}
          title={error}
        >
          <AlertCircle size={11} />
          <span className="hidden sm:inline max-w-[160px] truncate">
            {error}
          </span>
          <span className="sm:hidden">Error</span>
        </motion.div>
      )}

      {/* Refresh server files */}
      <button
        onClick={() => fetchAvailableFiles()}
        disabled={isLoading}
        aria-label="Refresh dataset files"
        title="Refresh server datasets"
        className="p-1.5 rounded-lg transition-colors"
        style={{ color: "var(--color-muted-foreground)" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background =
            "rgb(255 255 255 / 0.05)";
          (e.currentTarget as HTMLElement).style.color =
            "var(--color-foreground)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "transparent";
          (e.currentTarget as HTMLElement).style.color =
            "var(--color-muted-foreground)";
        }}
      >
        <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
      </button>
    </div>
  );
}
