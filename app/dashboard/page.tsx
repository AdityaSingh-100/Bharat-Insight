"use client";

import { useState, useMemo, useCallback, useEffect, useRef, memo } from "react";
import { useOrgStore, ORG_CONFIGS } from "@/store/useOrgStore";
import { useDatasetStore } from "@/store/useDatasetStore";
import { buildTableColumns, computeDatasetSummary } from "@/lib/csv-engine";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DataGrid } from "@/components/dashboard/DataGrid";
import { AIPanel } from "@/components/dashboard/AIPanel";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { supabase } from "@/lib/supabase";
import {
  FileSpreadsheet,
  Database,
  BarChart3,
  Layers3,
  Eye,
} from "lucide-react";
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
const DynamicStatCards = memo(function DynamicStatCards({
  summary,
}: {
  summary: DatasetSummary;
}) {
  const numericEntries = Object.entries(summary.statistics)
    .filter(([, s]) => s.mean !== undefined)
    .slice(0, 4);

  if (numericEntries.length === 0) return null;

  function fmt(n: number | undefined): string {
    if (n === undefined || n === null) return "—";
    if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return n % 1 === 0 ? String(n) : n.toFixed(2);
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
      {numericEntries.map(([label, stats]) => {
        const spread =
          stats.mean && stats.max && stats.mean !== 0
            ? (((stats.max - stats.mean) / Math.abs(stats.mean)) * 100).toFixed(
                0,
              )
            : null;
        return (
          <div
            key={label}
            className="rounded-lg p-3.5 transition-all duration-300 hover:bg-white/[0.04]"
            style={{
              background:
                "linear-gradient(135deg, rgb(255 255 255 / 0.04) 0%, rgb(255 255 255 / 0.015) 100%)",
              border: "1px solid rgb(255 255 255 / 0.06)",
              borderLeft: "3px solid var(--color-org-primary)",
            }}
          >
            {/* Label */}
            <div
              className="text-[10px] font-medium mb-2 uppercase tracking-widest truncate"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              {label.replace(/_/g, " ")}
            </div>

            {/* Main KPI value */}
            <div className="flex items-end gap-1.5 mb-1.5">
              <div className="text-xl font-bold text-white leading-none">
                {fmt(stats.mean)}
              </div>
              {spread && Number(spread) > 0 && (
                <span
                  className="text-[10px] pb-0.5 font-medium"
                  style={{ color: "var(--color-success)" }}
                >
                  ▲{spread}%
                </span>
              )}
            </div>

            {/* Sub-row: min / max / rows */}
            <div
              className="flex items-center gap-2 text-[10px] mt-1.5 pt-1.5"
              style={{
                borderTop: "1px solid var(--color-border)",
                color: "var(--color-muted-foreground)",
              }}
            >
              <span>
                <span className="text-white/40">min</span> {fmt(stats.min)}
              </span>
              <span>
                <span className="text-white/40">max</span> {fmt(stats.max)}
              </span>
              <span className="ml-auto">
                {summary.rowCount.toLocaleString("en-IN")} rows
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
});

// ─── Help items ───────────────────────────────────────────────────────────────
const HELP_ITEMS = [
  {
    title: "Keyboard Navigation",
    kbd: "↑↓",
    desc: "Arrow keys navigate rows. Escape to deselect.",
  },
  {
    title: "AI Insights",
    kbd: "Alt+A",
    desc: "Ask Gemini questions about your filtered data.",
  },
  {
    title: "Column Filters",
    desc: "Filter bar above the grid — every column is searchable.",
  },
  {
    title: "Command Palette",
    kbd: "⌘K",
    desc: "Quickly jump to any action across the dashboard.",
  },
  {
    title: "Paginated Grid",
    desc: "25 / 50 / 100 / 200 rows per page — use the footer to navigate.",
  },
  {
    title: "Role-Based Access",
    desc: "Admins can edit and delete rows; Viewers are read-only.",
  },
];

// ─── Dashboard page ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { currentOrg, syncRoleFromAuth, role } = useOrgStore();
  const { dataset, filterOptions, isLoading, activeFile } = useDatasetStore();

  const [filteredCount, setFilteredCount] = useState(0);
  const [filteredRows, setFilteredRows] = useState<Record<string, unknown>[]>(
    [],
  );

  // Sync role from Supabase auth metadata on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncRoleFromAuth(
          session.user.user_metadata?.role as string | undefined,
        );
      }
    });
  }, [syncRoleFromAuth]);

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
    // Always cap to 5 000 rows so stats computation stays under ~5 ms
    const sample =
      filteredRows.length > 5_000 ? filteredRows.slice(0, 5_000) : filteredRows;
    return computeDatasetSummary(sample, dataset.columns);
  }, [dataset, filteredRows]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFilteredChange = useCallback(
    (count: number, rows: Record<string, unknown>[]) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setFilteredCount(count);
        // Cap stored rows to avoid heavy summary computation on huge datasets
        setFilteredRows(rows.length > 10_000 ? rows.slice(0, 10_000) : rows);
      }, 250);
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
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full"
          style={{
            background: "var(--color-org-primary)",
            opacity: 0.04,
            filter: "blur(140px)",
          }}
        />
        <div
          className="absolute bottom-0 left-60 w-[400px] h-[400px] rounded-full"
          style={{
            background: "var(--color-org-primary)",
            opacity: 0.025,
            filter: "blur(120px)",
          }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-[200px] h-[200px] rounded-full"
          style={{
            background: "hsl(280 65% 60%)",
            opacity: 0.02,
            filter: "blur(80px)",
          }}
        />
      </div>

      <Sidebar />

      <div className="lg:pl-60 md:pl-16 pl-12">
        <DashboardHeader />

        <main className="pt-14">
          {/* Viewer-mode read-only banner */}
          {role === "viewer" && (
            <div
              className="flex items-center gap-2.5 px-5 py-2.5 text-xs"
              style={{
                background: "rgb(251 191 36 / 0.07)",
                borderBottom: "1px solid rgb(251 191 36 / 0.15)",
                color: "rgb(251 191 36 / 0.85)",
              }}
            >
              <Eye size={13} className="shrink-0" />
              <span>
                <strong>Read-only mode</strong> — editing and deletion are
                disabled for Viewer accounts. Switch to Admin in the role badge
                above to enable data modifications.
              </span>
            </div>
          )}

          <div className="p-5 space-y-5 ">
            {/* Overview section */}
            <div
              id="overview"
              className="flex items-start justify-between flex-wrap gap-3 scroll-mt-16"
            >
              <div>
                <h1 className="text-xl font-bold text-white">
                  {orgConfig.name}
                </h1>
                <p
                  className="text-sm mt-1"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  {activeFile
                    ? `📄 ${activeFile} · ${dataset?.rowCount.toLocaleString("en-IN") ?? 0} rows · ${dataset?.columns.length ?? 0} columns`
                    : "No dataset loaded — drop a CSV into /dataset"}
                </p>
              </div>

              {/* Dataset metadata badges */}
              {dataset && (
                <div className="flex items-center gap-2  flex-wrap">
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

            {/* ─── Help & Shortcuts ──────────────────────── */}
            <div
              id="help"
              className="rounded-xl scroll-mt-16"
              style={{
                background: "rgb(255 255 255 / 0.02)",
                border: "1px solid rgb(255 255 255 / 0.06)",
              }}
            >
              <div
                className="px-4 py-2.5 flex items-center gap-2"
                style={{ borderBottom: "1px solid rgb(255 255 255 / 0.05)" }}
              >
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Quick Reference
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-white/[0.04]">
                {HELP_ITEMS.map((item) => (
                  <div key={item.title} className="px-4 py-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white/75">
                        {item.title}
                      </span>
                      {item.kbd && (
                        <kbd
                          className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0"
                          style={{
                            background: "rgb(255 255 255 / 0.07)",
                            color: "var(--color-muted-foreground)",
                            border: "1px solid rgb(255 255 255 / 0.08)",
                          }}
                        >
                          {item.kbd}
                        </kbd>
                      )}
                    </div>
                    <p
                      className="text-[11px] leading-relaxed"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts (only when numeric columns present) */}
            <div id="charts" className="scroll-mt-16">
              {dataset &&
                dataset.columns.some((c) =>
                  ["number", "currency", "percentage"].includes(c.type),
                ) && (
                  <DashboardCharts
                    dataset={dataset}
                    filteredRows={filteredRows}
                  />
                )}
            </div>

            {/* Divider between Analytics and Data Grid */}
            <div
              className="h-px"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgb(255 255 255 / 0.06), transparent)",
              }}
            />

            {/* Main Data Grid */}
            <div
              id="grid"
              className="rounded-xl overflow-hidden scroll-mt-16"
              style={{
                border: "1px solid rgb(255 255 255 / 0.06)",
                background:
                  "linear-gradient(135deg, rgb(255 255 255 / 0.02) 0%, rgb(255 255 255 / 0.005) 100%)",
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

            <div className="pb-10" />
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
