"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Eye,
  ChevronDown,
  Pencil,
  Trash2,
  Search,
  X,
  Filter,
} from "lucide-react";
import type { InferredColumn } from "@/lib/csv-engine";
import { useOrgStore } from "@/store/useOrgStore";
import { matchSorter } from "match-sorter";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EditRowModal } from "@/components/ui/edit-row-modal";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRows({ cols = 8 }: { cols?: number }) {
  return (
    <div>
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-3 px-4 py-3 border-b border-white/[0.04]"
        >
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className="h-3 rounded shimmer-bg"
              style={{
                width: `${55 + Math.abs(Math.sin(i * 3 + j) * 90)}px`,
                opacity: 0.6 - i * 0.03,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Dynamic filter bar ───────────────────────────────────────────────────────
function DynamicFilterBar({
  columns,
  filterOptions,
  activeFilters,
  globalSearch,
  onColumnFilter,
  onSearch,
  onClear,
  hasActiveFilters,
}: {
  columns: InferredColumn[];
  filterOptions: Record<string, string[]>;
  activeFilters: Record<string, string>;
  globalSearch: string;
  onColumnFilter: (key: string, value: string) => void;
  onSearch: (q: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}) {
  const filterableCols = columns.filter(
    (c) => c.isFilterable && filterOptions[c.key]?.length > 0,
  );

  return (
    <div className="flex flex-wrap gap-2 p-3 border-b border-white/[0.06] bg-white/[0.01]">
      {/* Global search */}
      <div className="relative flex-1 min-w-48">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Fuzzy search all columns..."
          value={globalSearch}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 rounded-lg text-sm placeholder-white/25 text-white/80 focus:outline-none focus:ring-1 transition-all"
          style={{
            background: "rgb(255 255 255 / 0.04)",
            border: "1px solid var(--color-border)",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--color-org-primary)";
            e.target.style.boxShadow = "0 0 0 1px var(--color-org-primary)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--color-border)";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      {/* Dynamic column filters - scrollable, all columns shown */}
      <div
        className="flex items-center gap-2 overflow-x-auto flex-nowrap pb-0.5"
        style={{ scrollbarWidth: "none" }}
      >
        {filterableCols.map((col) => (
          <select
            key={col.key}
            value={activeFilters[col.key] ?? ""}
            onChange={(e) => onColumnFilter(col.key, e.target.value)}
            className="px-2.5 py-1.5 rounded-lg text-sm text-white/75 focus:outline-none transition-all cursor-pointer shrink-0"
            style={{
              background: activeFilters[col.key]
                ? "color-mix(in srgb, var(--color-org-primary) 15%, transparent)"
                : "rgb(255 255 255 / 0.04)",
              border: activeFilters[col.key]
                ? "1px solid var(--color-org-border)"
                : "1px solid var(--color-border)",
            }}
          >
            <option value="">All {col.label}</option>
            {filterOptions[col.key]?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ))}

        {/* Clear button */}
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-white/50 hover:text-white transition-colors shrink-0"
            style={{
              border: "1px solid var(--color-border)",
              background: "transparent",
            }}
          >
            <X size={11} />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main DataGrid ────────────────────────────────────────────────────────────
interface DataGridProps {
  data: Record<string, unknown>[];
  columns: ColumnDef<Record<string, unknown>>[];
  inferredColumns: InferredColumn[];
  filterOptions: Record<string, string[]>;
  isLoading: boolean;
  onFilteredCountChange?: (
    count: number,
    filtered: Record<string, unknown>[],
  ) => void;
}

export function DataGrid({
  data,
  columns,
  inferredColumns,
  filterOptions,
  isLoading,
  onFilteredCountChange,
}: DataGridProps) {
  const {
    role,
    activeFilters,
    globalSearch,
    setColumnFilter,
    setGlobalSearch,
    clearFilters,
  } = useOrgStore();
  const isAdmin = role === "admin";

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  const [showColumnToggle, setShowColumnToggle] = useState(false);

  // Local data copy for edit/delete without mutating the store
  const [localData, setLocalData] = useState<Record<string, unknown>[]>(data);
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  // Edit / delete state
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(
    null,
  );
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [deletingRowIndex, setDeletingRowIndex] = useState<number | null>(null);

  // Keyboard selected row
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Apply filters on localData (not the raw prop)
  const filteredData = useMemo(() => {
    let result = localData;

    // Apply column filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((row) => String(row[key] ?? "") === value);
      }
    });

    // Apply global fuzzy search
    if (globalSearch.trim()) {
      const keys = inferredColumns.map((c) => c.key);
      result = matchSorter(result, globalSearch, {
        keys: keys as string[],
        threshold: matchSorter.rankings.CONTAINS,
      });
    }

    return result;
  }, [localData, activeFilters, globalSearch, inferredColumns]);

  // Notify parent of filtered state — must be in useEffect, never during render
  useEffect(() => {
    onFilteredCountChange?.(filteredData.length, filteredData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredData]);

  // Apply sorting
  const sortedData = useMemo(() => {
    if (sorting.length === 0) return filteredData;
    const { id, desc } = sorting[0];
    return [...filteredData].sort((a, b) => {
      const av = a[id];
      const bv = b[id];
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return desc ? bv - av : av - bv;
      }
      return desc
        ? String(bv).localeCompare(String(av))
        : String(av).localeCompare(String(bv));
    });
  }, [filteredData, sorting]);

  const table = useReactTable({
    data: sortedData,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualFiltering: true,
  });

  const { rows } = table.getRowModel();
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 42,
    overscan: 25,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const paddingTop = virtualRows[0]?.start ?? 0;
  const paddingBottom =
    totalSize - (virtualRows[virtualRows.length - 1]?.end ?? 0);

  // Keyboard navigation
  const handleGridKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (rows.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedRowIndex((prev) => {
          const next = prev === null ? 0 : Math.min(prev + 1, rows.length - 1);
          virtualizer.scrollToIndex(next, { align: "auto" });
          return next;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedRowIndex((prev) => {
          const next = prev === null ? 0 : Math.max(prev - 1, 0);
          virtualizer.scrollToIndex(next, { align: "auto" });
          return next;
        });
      } else if (e.key === "Escape") {
        setSelectedRowIndex(null);
      }
    },
    [rows.length, virtualizer],
  );

  // Edit / delete handlers
  const handleEdit = useCallback(
    (rowIndex: number) => {
      const row = sortedData[rowIndex];
      setEditingRow(row);
      setEditingRowIndex(rowIndex);
    },
    [sortedData],
  );

  const handleSaveEdit = useCallback(
    (updated: Record<string, unknown>) => {
      if (editingRowIndex === null) return;
      const targetRow = sortedData[editingRowIndex];
      setLocalData((prev) => prev.map((r) => (r === targetRow ? updated : r)));
    },
    [editingRowIndex, sortedData],
  );

  const handleDelete = useCallback(() => {
    if (deletingRowIndex === null) return;
    const targetRow = sortedData[deletingRowIndex];
    setLocalData((prev) => prev.filter((r) => r !== targetRow));
    setSelectedRowIndex(null);
  }, [deletingRowIndex, sortedData]);

  // Export CSV
  const exportCSV = useCallback(() => {
    if (!isAdmin) return;
    const visibleCols = table.getVisibleLeafColumns();
    const headers = visibleCols.map((c) => c.id).join(",");
    const rowsCSV = sortedData.slice(0, 50000).map((row) =>
      visibleCols
        .map((c) => {
          const val = row[c.id];
          const s = val === null || val === undefined ? "" : String(val);
          return s.includes(",") ? `"${s}"` : s;
        })
        .join(","),
    );
    const csv = [headers, ...rowsCSV].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bharat-insight-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sortedData, isAdmin, table]);

  const hasActiveFilters =
    Object.values(activeFilters).some(Boolean) || !!globalSearch;

  if (isLoading) {
    return <SkeletonRows cols={inferredColumns.length || 8} />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Modals */}
      <ConfirmDialog
        open={deletingRowIndex !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingRowIndex(null);
        }}
        onConfirm={handleDelete}
      />
      <EditRowModal
        open={editingRow !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingRow(null);
            setEditingRowIndex(null);
          }
        }}
        row={editingRow}
        onSave={handleSaveEdit}
      />
      {/* Dynamic Filter Bar */}
      <DynamicFilterBar
        columns={inferredColumns}
        filterOptions={filterOptions}
        activeFilters={activeFilters}
        globalSearch={globalSearch}
        onColumnFilter={setColumnFilter}
        onSearch={setGlobalSearch}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{
          borderColor: "var(--color-border)",
          background: "rgb(255 255 255 / 0.01)",
        }}
      >
        <span
          className="text-sm"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          Showing{" "}
          <span style={{ color: "var(--color-foreground)", fontWeight: 600 }}>
            {filteredData.length.toLocaleString("en-IN")}
          </span>{" "}
          of{" "}
          <span style={{ color: "var(--color-foreground)", fontWeight: 600 }}>
            {data.length.toLocaleString("en-IN")}
          </span>{" "}
          rows
          {filteredData.length < data.length && (
            <span
              className="ml-2 text-xs px-1.5 py-0.5 rounded"
              style={{
                background: "var(--color-org-muted)",
                color: "var(--color-org-primary)",
              }}
            >
              filtered
            </span>
          )}
        </span>

        <div className="flex items-center gap-2">
          {/* Column toggle */}
          <div className="relative">
            <button
              onClick={() => setShowColumnToggle(!showColumnToggle)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all"
              style={{
                border: "1px solid var(--color-border)",
                background: "rgb(255 255 255 / 0.04)",
                color: "var(--color-muted-foreground)",
              }}
            >
              <Eye size={11} />
              Columns
              <ChevronDown
                size={10}
                style={{
                  transform: showColumnToggle ? "rotate(180deg)" : "rotate(0)",
                  transition: "transform 200ms ease",
                }}
              />
            </button>
            {showColumnToggle && (
              <div
                className="absolute right-0 top-full mt-1 w-52 rounded-xl z-20 p-2 space-y-0.5 max-h-80 overflow-y-auto shadow-2xl"
                style={{
                  border: "1px solid var(--color-border)",
                  background: "hsl(224 71% 5%)",
                }}
              >
                {table.getAllLeafColumns().map((col) => (
                  <label
                    key={col.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-xs transition-colors"
                    style={{ color: "var(--color-muted-foreground)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgb(255 255 255 / 0.04)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <input
                      type="checkbox"
                      checked={col.getIsVisible()}
                      onChange={col.getToggleVisibilityHandler()}
                      style={{ accentColor: "var(--color-org-primary)" }}
                    />
                    <span className="truncate">{col.id}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Export (admin only) */}
          {isAdmin && (
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all"
              style={{
                border: "1px solid var(--color-border)",
                background: "rgb(255 255 255 / 0.04)",
                color: "var(--color-muted-foreground)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-org-border)";
                e.currentTarget.style.color = "var(--color-org-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.color = "var(--color-muted-foreground)";
              }}
            >
              <Download size={11} />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Virtual Table */}
      <div ref={parentRef} className="virtual-table-container flex-1">
        <table
          className="w-full border-collapse text-sm"
          style={{ minWidth: "600px" }}
        >
          {/* Sticky header */}
          <thead className="virtual-thead">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="flex">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      width: header.getSize(),
                      minWidth: header.getSize(),
                      color: header.column.getIsSorted()
                        ? "var(--color-org-primary)"
                        : "var(--color-muted-foreground)",
                    }}
                    className="flex items-center gap-1 px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none shrink-0 transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="truncate">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </span>
                    {header.column.getCanSort() && (
                      <span className="ml-auto shrink-0">
                        {header.column.getIsSorted() === "asc" ? (
                          <ArrowUp size={11} />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <ArrowDown size={11} />
                        ) : (
                          <ArrowUpDown size={10} style={{ opacity: 0.3 }} />
                        )}
                      </span>
                    )}
                  </th>
                ))}
                {isAdmin && <th className="w-16 shrink-0" />}
              </tr>
            ))}
          </thead>

          <tbody>
            {paddingTop > 0 && (
              <tr style={{ height: paddingTop }}>
                <td />
              </tr>
            )}

            {virtualRows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="text-center py-16 text-sm"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  No rows match your filters
                </td>
              </tr>
            )}

            {virtualRows.map((vr) => {
              const row = rows[vr.index];
              const isSelected = selectedRowIndex === vr.index;
              return (
                <tr
                  key={row.id}
                  data-index={vr.index}
                  ref={virtualizer.measureElement}
                  tabIndex={-1}
                  className="flex border-b group transition-colors cursor-default"
                  style={{
                    borderColor: "rgb(255 255 255 / 0.03)",
                    background: isSelected
                      ? "var(--color-org-muted)"
                      : "transparent",
                    outline: isSelected
                      ? "1px solid var(--color-org-border)"
                      : "none",
                  }}
                  onClick={() => setSelectedRowIndex(vr.index)}
                  onMouseEnter={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.background =
                        "rgb(255 255 255 / 0.025)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.getSize(),
                        color:
                          "color-mix(in srgb, var(--color-foreground) 65%, transparent)",
                      }}
                      className="px-3 py-2.5 text-xs shrink-0 overflow-hidden"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}

                  {isAdmin && (
                    <td className="px-2 py-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity w-16 shrink-0">
                      <button
                        className="p-1 rounded transition-colors"
                        style={{ color: "var(--color-org-primary)" }}
                        title="Edit row"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(vr.index);
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "var(--color-org-muted)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        className="p-1 rounded transition-colors"
                        style={{ color: "var(--color-danger)" }}
                        title="Delete row"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingRowIndex(vr.index);
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "color-mix(in srgb, var(--color-danger) 15%, transparent)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <Trash2 size={11} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}

            {paddingBottom > 0 && (
              <tr style={{ height: paddingBottom }}>
                <td />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
