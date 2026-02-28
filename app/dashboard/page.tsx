"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useOrgStore, ORG_CONFIGS } from "@/store/useOrgStore";
import { useDatasetStore } from "@/store/useDatasetStore";
import { buildTableColumns, computeDatasetSummary } from "@/lib/csv-engine";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DataGrid } from "@/components/dashboard/DataGrid";
import { AIPanel } from "@/components/dashboard/AIPanel";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { motion } from "motion/react";
import { FileSpreadsheet, Database, BarChart3, Layers3 } from "lucide-react";
import type { DatasetSummary } from "@/lib/csv-engine";

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] py-20 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{
          background: "var(--color-org-muted)",
          border: "1px solid var(--color-org-border)",
        }}
      >
        <FileSpreadsheet
          size={28}
          style={{ color: "var(--color-org-primary)" }}
        />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">
        No dataset loaded
      </h2>
      <p
        className="text-sm max-w-sm mb-6"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        Drop a CSV file into the{" "}
        <code
          className="px-1 py-0.5 rounded text-xs"
          style={{ background: "rgb(255 255 255 / 0.08)" }}
        >
          /dataset
        </code>{" "}
        folder, then click the refresh button in the header.
      </p>
      <div
        className="rounded-xl p-5 text-left font-mono text-xs max-w-xs"
        style={{
          background: "rgb(255 255 255 / 0.03)",
          border: "1px solid var(--color-border)",
          color: "var(--color-muted-foreground)",
        }}
      >
        <div className="text-white/60 mb-2"># Quick start</div>
        <div>mkdir dataset</div>
        <div>cp your-data.csv dataset/</div>
        <div className="mt-2 text-white/60"># Reload the page</div>
      </div>
    </div>
  );
}

// ─── Dynamic stat cards from inferred schema ──────────────────────────────────
function DynamicStatCards({ summary }: { summary: DatasetSummary }) {
  const numericEntries = Object.entries(summary.statistics)
    .filter(([, s]) => s.mean !== undefined)
    .slice(0, 4);

  if (numericEntries.length === 0) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {numericEntries.map(([label, stats], i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.35 }}
          className="rounded-xl p-4 transition-colors"
          style={{
            background: "rgb(255 255 255 / 0.03)",
            border: "1px solid var(--color-border)",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background =
              "rgb(255 255 255 / 0.05)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background =
              "rgb(255 255 255 / 0.03)")
          }
        >
          <div
            className="text-xs font-medium mb-2 uppercase tracking-wide truncate"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {label}
          </div>
          <div className="text-xl font-bold text-white truncate">
            {stats.mean && stats.mean > 1_000_000
              ? (stats.mean / 1_000_000).toFixed(1) + "M"
              : stats.mean && stats.mean > 1_000
                ? (stats.mean / 1_000).toFixed(1) + "K"
                : (stats.mean?.toFixed(2) ?? "—")}
          </div>
          <div
            className="text-xs mt-1"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            avg · max{" "}
            {stats.max && stats.max > 1_000_000
              ? (stats.max / 1_000_000).toFixed(1) + "M"
              : stats.max && stats.max > 1_000
                ? (stats.max / 1_000).toFixed(1) + "K"
                : (stats.max?.toFixed(2) ?? "—")}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Dashboard page ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { currentOrg } = useOrgStore();
  const { dataset, filterOptions, isLoading, activeFile } = useDatasetStore();

  const [filteredCount, setFilteredCount] = useState(0);
  const [filteredRows, setFilteredRows] = useState<Record<string, unknown>[]>(
    [],
  );

  // Apply org theme
  useEffect(() => {
    const orgConfig = ORG_CONFIGS[currentOrg];
    document.documentElement.classList.remove("org-meity");
    if (orgConfig.themeClass)
      document.documentElement.classList.add(orgConfig.themeClass);
  }, [currentOrg]);

  // Build TanStack columns from inferred schema
  const tableColumns = useMemo(() => {
    if (!dataset) return [];
    return buildTableColumns(dataset.columns);
  }, [dataset]);

  // Compute dynamic summary of FILTERED rows
  const dynamicSummary = useMemo<DatasetSummary | null>(() => {
    if (!dataset || filteredRows.length === 0)
      return dataset
        ? {
            rowCount: 0,
            columnCount: dataset.columns.length,
            numericColumns: [],
            categoricalColumns: [],
            statistics: {},
          }
        : null;
    return computeDatasetSummary(filteredRows, dataset.columns);
  }, [dataset, filteredRows]);

  const handleFilteredChange = useCallback(
    (count: number, rows: Record<string, unknown>[]) => {
      setFilteredCount(count);
      setFilteredRows(rows);
    },
    [],
  );

  const orgConfig = ORG_CONFIGS[currentOrg] ?? ORG_CONFIGS["health"];

  return (
    <div
      className="min-h-screen transition-theme"
      style={{ background: "var(--color-background)" }}
    >
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full"
          style={{
            background: "var(--color-org-primary)",
            opacity: 0.03,
            filter: "blur(120px)",
          }}
        />
        <div
          className="absolute bottom-0 left-60 w-[350px] h-[350px] rounded-full"
          style={{
            background: "var(--color-org-primary)",
            opacity: 0.02,
            filter: "blur(100px)",
          }}
        />
      </div>

      <Sidebar />

      <div className="lg:pl-60 pl-16">
        <DashboardHeader />

        <main className="pt-14">
          <div className="p-5 space-y-5">
            {/* Page title */}
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h1 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{orgConfig.icon}</span>
                  {orgConfig.name}
                </h1>
                <p
                  className="text-sm mt-0.5"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  {activeFile
                    ? `📄 ${activeFile} · ${dataset?.rowCount.toLocaleString("en-IN") ?? 0} rows · ${dataset?.columns.length ?? 0} columns`
                    : "No dataset loaded — drop a CSV into /dataset"}
                </p>
              </div>

              {/* Dataset metadata badges */}
              {dataset && (
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    {
                      icon: Database,
                      label: `${dataset.rowCount.toLocaleString()} rows`,
                    },
                    {
                      icon: Layers3,
                      label: `${dataset.columns.length} columns`,
                    },
                    {
                      icon: BarChart3,
                      label: `${dataset.columns.filter((c) => ["number", "currency", "percentage"].includes(c.type)).length} numeric`,
                    },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                      style={{
                        background: "rgb(255 255 255 / 0.04)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-muted-foreground)",
                      }}
                    >
                      <Icon
                        size={11}
                        style={{ color: "var(--color-org-primary)" }}
                      />
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dynamic stat cards */}
            {dataset && dynamicSummary && (
              <DynamicStatCards summary={dynamicSummary} />
            )}

            {/* Charts (only when numeric columns present) */}
            {dataset &&
              dataset.columns.some((c) =>
                ["number", "currency", "percentage"].includes(c.type),
              ) && (
                <DashboardCharts
                  dataset={dataset}
                  filteredRows={filteredRows}
                />
              )}

            {/* Main Data Grid */}
            <div
              className="rounded-xl overflow-hidden"
              style={{
                border: "1px solid var(--color-border)",
                background: "rgb(255 255 255 / 0.01)",
              }}
            >
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <h2 className="text-sm font-semibold text-white">
                  {activeFile ? `Data: ${activeFile}` : "Data Grid"}
                </h2>
                <div
                  className="flex items-center gap-2 text-xs"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  {dataset && (
                    <>
                      <span
                        className="px-1.5 py-0.5 rounded"
                        style={{
                          background: "var(--color-org-muted)",
                          color: "var(--color-org-primary)",
                        }}
                      >
                        TanStack Virtual
                      </span>
                      <span>
                        {dataset.rowCount.toLocaleString()} rows · schema
                        auto-detected
                      </span>
                    </>
                  )}
                </div>
              </div>

              {!dataset && !isLoading ? (
                <EmptyState />
              ) : (
                <DataGrid
                  data={dataset?.rows ?? []}
                  columns={tableColumns}
                  inferredColumns={dataset?.columns ?? []}
                  filterOptions={filterOptions}
                  isLoading={isLoading}
                  onFilteredCountChange={handleFilteredChange}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      <AIPanel
        filteredCount={filteredCount}
        filteredRows={filteredRows}
        dynamicSummary={dynamicSummary}
      />

      <CommandPalette />
    </div>
  );
}
