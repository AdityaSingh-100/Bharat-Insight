// lib/csv-engine.ts
// Data-agnostic CSV parsing, type inference, and schema generation

import Papa from "papaparse";
import type { ColumnDef } from "@tanstack/react-table";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ColumnType = "number" | "year" | "percentage" | "currency" | "string" | "boolean";

export interface InferredColumn {
  key: string;
  label: string;          // human-readable header
  type: ColumnType;
  nullable: boolean;
  uniqueCount: number;
  sampleValues: unknown[];
  isFilterable: boolean;  // low-cardinality strings → filter dropdown
  isSortable: boolean;
  width: number;
  numericStats?: {
    min: number;
    max: number;
    mean: number;
    sum: number;
  };
}

export interface ParsedDataset {
  filename: string;
  rows: Record<string, unknown>[];
  columns: InferredColumn[];
  rowCount: number;
  parsedAt: Date;
}

export interface DatasetSummary {
  rowCount: number;
  columnCount: number;
  numericColumns: string[];
  categoricalColumns: string[];
  statistics: Record<string, {
    min?: number;
    max?: number;
    mean?: number;
    sum?: number;
    uniqueCount?: number;
    topValues?: string[];
  }>;
}

// ─── Type Inference ───────────────────────────────────────────────────────────

function isYear(value: string): boolean {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1900 && n <= 2100;
}

function isPercentage(header: string, value: string): boolean {
  const h = header.toLowerCase();
  return (
    h.includes("percent") ||
    h.includes("rate") ||
    h.includes("share") ||
    h.includes("ratio") ||
    h.endsWith("_pct") ||
    h.endsWith("_%") ||
    (value.endsWith("%") && !isNaN(parseFloat(value)))
  );
}

function isCurrency(header: string): boolean {
  const h = header.toLowerCase();
  return (
    h.includes("revenue") ||
    h.includes("budget") ||
    h.includes("cost") ||
    h.includes("price") ||
    h.includes("amount") ||
    h.includes("salary") ||
    h.includes("income") ||
    h.includes("arpu") ||
    h.includes("expenditure") ||
    h.includes("allocated") ||
    h.includes("utilized")
  );
}

function inferColumnType(
  header: string,
  values: string[]
): ColumnType {
  const nonEmpty = values.filter((v) => v !== "" && v !== null && v !== undefined);
  if (nonEmpty.length === 0) return "string";

  const sample = nonEmpty.slice(0, 100);
  const numericSample = sample.map((v) => parseFloat(v.replace(/[,₹$%]/g, "")));
  const allNumeric = numericSample.every((n) => !isNaN(n));

  if (allNumeric) {
    // Check if it's years
    if (sample.every((v) => isYear(v.trim()))) return "year";
    // Check percentage
    if (isPercentage(header, sample[0])) return "percentage";
    // Check currency
    if (isCurrency(header)) return "currency";
    return "number";
  }

  // Boolean check
  const boolSet = new Set(sample.map((v) => v.toLowerCase().trim()));
  if (boolSet.size <= 3 && [...boolSet].every((v) => ["true", "false", "yes", "no", "1", "0"].includes(v))) {
    return "boolean";
  }

  return "string";
}

// ─── Value Parser ─────────────────────────────────────────────────────────────

function parseValue(raw: string, type: ColumnType): unknown {
  if (raw === "" || raw === null || raw === undefined) return null;
  const cleaned = raw.toString().trim();

  switch (type) {
    case "number":
    case "currency": {
      const n = parseFloat(cleaned.replace(/[,₹$]/g, ""));
      return isNaN(n) ? null : n;
    }
    case "percentage": {
      const n = parseFloat(cleaned.replace(/[%,]/g, ""));
      return isNaN(n) ? null : n;
    }
    case "year": {
      const n = parseInt(cleaned, 10);
      return isNaN(n) ? null : n;
    }
    case "boolean":
      return ["true", "yes", "1"].includes(cleaned.toLowerCase());
    default:
      return cleaned;
  }
}

// ─── Header Formatter ─────────────────────────────────────────────────────────

function formatHeader(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

// ─── Column Width Estimator ───────────────────────────────────────────────────

function estimateWidth(type: ColumnType, label: string, maxLength: number): number {
  const base = Math.max(label.length * 8 + 32, 80);
  const typeBonus: Record<ColumnType, number> = {
    string: Math.min(maxLength * 7, 200),
    number: 100,
    year: 72,
    percentage: 90,
    currency: 110,
    boolean: 80,
  };
  return Math.min(Math.max(base, typeBonus[type]), 220);
}

// ─── Numeric Stats ────────────────────────────────────────────────────────────

function computeNumericStats(values: number[]): InferredColumn["numericStats"] {
  if (values.length === 0) return undefined;
  const sum = values.reduce((a, b) => a + b, 0);
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    mean: sum / values.length,
    sum,
  };
}

// ─── Main Parse Function ──────────────────────────────────────────────────────

export function parseCSV(csvText: string, filename: string): ParsedDataset {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false, // we handle typing ourselves
    transformHeader: (h) => h.trim(),
  });

  if (result.errors.length > 0) {
    const fatal = result.errors.filter((e) => e.type === "FieldMismatch");
    if (fatal.length > 5) {
      throw new Error(`CSV parse failed: ${fatal[0]?.message}`);
    }
  }

  const rawRows = result.data;
  if (rawRows.length === 0) throw new Error("CSV file is empty");

  const headers = Object.keys(rawRows[0]);

  // Sample up to 500 rows for type inference (performance)
  const sampleSize = Math.min(rawRows.length, 500);
  const sample = rawRows.slice(0, sampleSize);

  // Infer columns
  const columns: InferredColumn[] = headers.map((key) => {
    const values = sample.map((r) => r[key] ?? "");
    const type = inferColumnType(key, values);
    const label = formatHeader(key);

    // Unique values for filterability
    const uniqueValues = [...new Set(rawRows.slice(0, 2000).map((r) => r[key] ?? ""))];
    const isFilterable = type === "string" && uniqueValues.length <= 80;
    const maxLength = Math.max(...values.map((v) => (v ?? "").length));

    // Numeric stats
    let numericStats: InferredColumn["numericStats"];
    if (type !== "string" && type !== "boolean") {
      const nums = rawRows
        .map((r) => parseFloat((r[key] ?? "").replace(/[,₹$%]/g, "")))
        .filter((n) => !isNaN(n));
      numericStats = computeNumericStats(nums);
    }

    return {
      key,
      label,
      type,
      nullable: values.some((v) => !v),
      uniqueCount: uniqueValues.length,
      sampleValues: values.slice(0, 5),
      isFilterable,
      isSortable: true,
      width: estimateWidth(type, label, maxLength),
      numericStats,
    };
  });

  // Parse all rows with proper types
  const rows: Record<string, unknown>[] = rawRows.map((raw) => {
    const parsed: Record<string, unknown> = {};
    columns.forEach((col) => {
      parsed[col.key] = parseValue(raw[col.key] ?? "", col.type);
    });
    return parsed;
  });

  return {
    filename,
    rows,
    columns,
    rowCount: rows.length,
    parsedAt: new Date(),
  };
}

// ─── TanStack Column Builder ──────────────────────────────────────────────────

export function buildTableColumns(
  inferredColumns: InferredColumn[]
): ColumnDef<Record<string, unknown>>[] {
  return inferredColumns.map((col) => ({
    id: col.key,
    accessorKey: col.key,
    header: col.label,
    size: col.width,
    enableSorting: col.isSortable,
    cell: ({ getValue }) => {
      const raw = getValue<unknown>();
      if (raw === null || raw === undefined) {
        return <span className="text-white/20 italic text-xs">—</span>;
      }

      switch (col.type) {
        case "number": {
          const n = raw as number;
          if (n >= 1_000_000) return <span>{(n / 1_000_000).toFixed(2)}M</span>;
          if (n >= 1_000) return <span>{(n / 1_000).toFixed(1)}K</span>;
          return <span>{n.toLocaleString("en-IN")}</span>;
        }
        case "currency": {
          const n = raw as number;
          if (n >= 1_00_00_000) return <span>₹{(n / 1_00_00_000).toFixed(2)}Cr</span>;
          if (n >= 1_00_000) return <span>₹{(n / 1_00_000).toFixed(2)}L</span>;
          return <span>₹{(n as number).toLocaleString("en-IN")}</span>;
        }
        case "percentage": {
          const n = raw as number;
          const color = n >= 80 ? "var(--color-success)" : n >= 50 ? "var(--color-warning)" : n >= 0 ? "#f87171" : "var(--color-muted-foreground)";
          return <span style={{ color }}>{n.toFixed(2)}%</span>;
        }
        case "year":
          return <span className="font-mono text-xs opacity-70">{String(raw)}</span>;
        case "boolean":
          return (
            <span
              className="px-1.5 py-0.5 rounded text-xs font-medium"
              style={{
                background: raw ? "color-mix(in srgb, var(--color-success) 15%, transparent)" : "color-mix(in srgb, var(--color-danger) 15%, transparent)",
                color: raw ? "var(--color-success)" : "var(--color-danger)",
              }}
            >
              {raw ? "Yes" : "No"}
            </span>
          );
        default:
          return (
            <span className="truncate block max-w-[200px]" title={String(raw)}>
              {String(raw)}
            </span>
          );
      }
    },
  }));
}

// ─── Summary Stats Builder ────────────────────────────────────────────────────

export function computeDatasetSummary(
  rows: Record<string, unknown>[],
  columns: InferredColumn[]
): DatasetSummary {
  const numericCols = columns.filter((c) =>
    ["number", "currency", "percentage", "year"].includes(c.type)
  );
  const stringCols = columns.filter((c) => c.type === "string");

  const statistics: DatasetSummary["statistics"] = {};

  numericCols.forEach((col) => {
    const values = rows
      .map((r) => r[col.key] as number)
      .filter((v) => v !== null && !isNaN(v));
    if (values.length === 0) return;
    const sum = values.reduce((a, b) => a + b, 0);
    statistics[col.label] = {
      min: Math.min(...values),
      max: Math.max(...values),
      mean: sum / values.length,
      sum,
    };
  });

  stringCols.forEach((col) => {
    const freq = new Map<string, number>();
    rows.forEach((r) => {
      const v = String(r[col.key] ?? "");
      if (v) freq.set(v, (freq.get(v) ?? 0) + 1);
    });
    const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]);
    statistics[col.label] = {
      uniqueCount: freq.size,
      topValues: sorted.slice(0, 5).map(([v]) => v),
    };
  });

  return {
    rowCount: rows.length,
    columnCount: columns.length,
    numericColumns: numericCols.map((c) => c.label),
    categoricalColumns: stringCols.map((c) => c.label),
    statistics,
  };
}

// ─── Filter options builder ───────────────────────────────────────────────────

export function buildFilterOptions(
  rows: Record<string, unknown>[],
  columns: InferredColumn[]
): Record<string, string[]> {
  const opts: Record<string, string[]> = {};
  columns
    .filter((c) => c.isFilterable)
    .forEach((col) => {
      const vals = [...new Set(rows.map((r) => String(r[col.key] ?? "")).filter(Boolean))].sort();
      opts[col.key] = vals;
    });
  return opts;
}
