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
import { FileSpreadsheet, Database, BarChart3, Layers3, Settings, HelpCircle, Shield, Eye, Keyboard, Zap, Brain, Filter } from "lucide-react";
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
const DynamicStatCards = memo(function DynamicStatCards({ summary }: { summary: DatasetSummary }) {
  const numericEntries = Object.entries(summary.statistics)
    .filter(([, s]) => s.mean !== undefined)
    .slice(0, 4);

  if (numericEntries.length === 0) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {numericEntries.map(([label, stats], i) => (
        <div
          key={label}
          className="rounded-xl p-4 transition-all duration-200 hover:bg-white/5"
          style={{
            background: "rgb(255 255 255 / 0.03)",
            border: "1px solid var(--color-border)",
          }}
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
        </div>
      ))}
    </div>
  );
});

// ─── Help items ───────────────────────────────────────────────────────────────
const HELP_ITEMS = [
  { icon: Keyboard, title: "Keyboard Navigation", kbd: "↑↓", desc: "Use arrow keys to navigate rows in the data grid. Press Escape to deselect." },
  { icon: Brain, title: "AI Insights", kbd: "Alt+A", desc: "Click 'AI Insights' in the header or use the button to ask Gemini questions about your filtered data." },
  { icon: Filter, title: "Column Filters", desc: "Use the filter bar above the data grid to filter any column. All columns are searchable." },
  { icon: Zap, title: "Command Palette", kbd: "⌘K", desc: "Press Cmd+K (or Ctrl+K) to open the command palette and quickly jump to any action." },
  { icon: Database, title: "Virtualized Grid", desc: "The data grid uses TanStack Virtual — it renders only visible rows, supporting 100k+ rows without lag." },
  { icon: Shield, title: "Role-Based Access", desc: "Toggle between Admin and Viewer roles in the header. Admins can edit and delete rows; Viewers are read-only." },
];

// ─── Settings: Role card ─────────────────────────────────────────────────────
function RoleCard() {
  const { role, setRole } = useOrgStore();
  const isAdmin = role === "admin";
  return (
    <div className="rounded-xl p-5" style={{ background: "rgb(255 255 255 / 0.03)", border: "1px solid var(--color-border)" }}>
      <div className="flex items-center gap-2 mb-3">
        {isAdmin ? <Shield size={14} style={{ color: "var(--color-org-primary)" }} /> : <Eye size={14} style={{ color: "var(--color-muted-foreground)" }} />}
        <span className="text-sm font-semibold text-white">Access Role</span>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: isAdmin ? "var(--color-org-muted)" : "rgb(255 255 255 / 0.06)", color: isAdmin ? "var(--color-org-primary)" : "var(--color-muted-foreground)" }}>
          {isAdmin ? "Admin" : "Viewer"}
        </span>
      </div>
      <p className="text-xs mb-4" style={{ color: "var(--color-muted-foreground)" }}>
        {isAdmin ? "You can edit and delete rows in the data grid." : "Read-only access. Switch to Admin to edit data."}
      </p>
      <button
        onClick={() => setRole(isAdmin ? "viewer" : "admin")}
        className="w-full py-2 rounded-lg text-sm font-medium transition-all"
        style={{ background: "var(--color-org-muted)", border: "1px solid var(--color-org-border)", color: "var(--color-org-primary)" }}
      >
        Switch to {isAdmin ? "Viewer" : "Admin"}
      </button>
    </div>
  );
}

// ─── Settings: Org info card ─────────────────────────────────────────────────
function OrgInfoCard() {
  const { currentOrg, setOrg } = useOrgStore();
  const orgConfig = ORG_CONFIGS[currentOrg] ?? ORG_CONFIGS["health"];
  const otherOrg = Object.values(ORG_CONFIGS).find((o) => o.id !== currentOrg)!;
  return (
    <div className="rounded-xl p-5" style={{ background: "rgb(255 255 255 / 0.03)", border: "1px solid var(--color-border)" }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{orgConfig.icon}</span>
        <span className="text-sm font-semibold text-white">{orgConfig.name}</span>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--color-org-muted)", color: "var(--color-org-primary)" }}>{orgConfig.shortName}</span>
      </div>
      <p className="text-xs mb-4" style={{ color: "var(--color-muted-foreground)" }}>{orgConfig.description} · Default dataset: <code className="text-white/60">{orgConfig.defaultDataset}</code></p>
      <button
        onClick={() => setOrg(otherOrg.id)}
        className="w-full py-2 rounded-lg text-sm font-medium transition-all"
        style={{ background: "rgb(255 255 255 / 0.04)", border: "1px solid var(--color-border)", color: "var(--color-muted-foreground)" }}
      >
        Switch to {otherOrg.icon} {otherOrg.shortName}
      </button>
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

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFilteredChange = useCallback(
    (count: number, rows: Record<string, unknown>[]) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setFilteredCount(count);
        setFilteredRows(rows);
      }, 120);
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
            {/* Overview section */}
            <div id="overview" className="flex items-start justify-between flex-wrap gap-2 scroll-mt-16">
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

            {/* Main Data Grid */}
            <div
              id="grid"
              className="rounded-xl overflow-hidden scroll-mt-16"
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

            {/* ─── Settings Section ──────────────────────── */}
            <div id="settings" className="scroll-mt-16 space-y-4 pt-2">
              <div className="flex items-center gap-2 mb-1">
                <Settings size={15} style={{ color: "var(--color-org-primary)" }} />
                <h2 className="text-sm font-semibold text-white">Settings</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Role switcher */}
                <RoleCard />
                {/* Org info */}
                <OrgInfoCard />
              </div>
            </div>

            {/* ─── Help Section ──────────────────────────── */}
            <div id="help" className="scroll-mt-16 space-y-4 pt-2 pb-10">
              <div className="flex items-center gap-2 mb-1">
                <HelpCircle size={15} style={{ color: "var(--color-org-primary)" }} />
                <h2 className="text-sm font-semibold text-white">Help &amp; Shortcuts</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {HELP_ITEMS.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl p-4"
                    style={{ background: "rgb(255 255 255 / 0.03)", border: "1px solid var(--color-border)" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--color-org-muted)" }}>
                        <item.icon size={13} style={{ color: "var(--color-org-primary)" }} />
                      </div>
                      <span className="text-sm font-medium text-white">{item.title}</span>
                      {item.kbd && (
                        <kbd className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: "rgb(255 255 255 / 0.08)", color: "var(--color-muted-foreground)" }}>{item.kbd}</kbd>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>{item.desc}</p>
                  </div>
                ))}
              </div>
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
