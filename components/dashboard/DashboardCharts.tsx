"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import type { ParsedDataset } from "@/lib/csv-engine";

const CHART_COLORS = [
  "var(--color-org-primary)",
  "var(--color-success)",
  "var(--color-warning)",
  "hsl(280 65% 60%)",
  "hsl(0 84% 60%)",
];

const TOOLTIP_STYLE = {
  contentStyle: {
    background: "hsl(224 71% 6%)",
    border: "1px solid var(--color-border)",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "12px",
  },
  labelStyle: { color: "var(--color-muted-foreground)" },
};

interface DashboardChartsProps {
  dataset: ParsedDataset;
  filteredRows: Record<string, unknown>[];
}

export function DashboardCharts({ dataset, filteredRows }: DashboardChartsProps) {
  const { columns } = dataset;
  const rows = filteredRows.length > 0 ? filteredRows : dataset.rows;
  const sample = rows.slice(0, 500);

  // Find first year/string column for X axis
  const xCol = useMemo(
    () => columns.find((c) => c.type === "year") ?? columns.find((c) => c.isFilterable),
    [columns]
  );

  // Find top numeric columns
  const numericCols = useMemo(
    () => columns.filter((c) => ["number", "currency", "percentage"].includes(c.type)).slice(0, 3),
    [columns]
  );

  // Find top categorical for pie
  const catCol = useMemo(
    () => columns.find((c) => c.isFilterable && c.uniqueCount >= 2 && c.uniqueCount <= 15),
    [columns]
  );

  // Build area chart data — aggregate by x-axis column
  const areaData = useMemo(() => {
    if (!xCol || numericCols.length === 0) return [];
    const groups = new Map<string, { count: number; sums: Record<string, number> }>();
    sample.forEach((row) => {
      const key = String(row[xCol.key] ?? "Unknown");
      if (!groups.has(key)) groups.set(key, { count: 0, sums: {} });
      const g = groups.get(key)!;
      g.count++;
      numericCols.forEach((nc) => {
        g.sums[nc.key] = (g.sums[nc.key] ?? 0) + ((row[nc.key] as number) ?? 0);
      });
    });
    return [...groups.entries()]
      .sort(([a], [b]) => String(a).localeCompare(String(b)))
      .slice(0, 12)
      .map(([key, { count, sums }]) => ({
        label: key,
        ...Object.fromEntries(numericCols.map((nc) => [nc.key, Math.round(sums[nc.key] / count)])),
      }));
  }, [sample, xCol, numericCols]);

  // Build pie data from categorical column
  const pieData = useMemo(() => {
    if (!catCol) return [];
    const freq = new Map<string, number>();
    sample.forEach((row) => {
      const v = String(row[catCol.key] ?? "Unknown");
      freq.set(v, (freq.get(v) ?? 0) + 1);
    });
    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [sample, catCol]);

  if (areaData.length === 0 && pieData.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-2">
      {/* Area / Bar chart */}
      {areaData.length > 0 && numericCols.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2 rounded-xl p-5"
          style={{ background: "rgb(255 255 255 / 0.02)", border: "1px solid var(--color-border)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">
              {numericCols[0]?.label} by {xCol?.label}
            </h3>
            <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
              top {areaData.length} {xCol?.label} values
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={areaData}>
              <defs>
                {numericCols.map((col, i) => (
                  <linearGradient key={col.key} id={`grad_${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(255 255 255 / 0.04)" />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v >= 1e6 ? (v / 1e6).toFixed(1) + "M" : v >= 1e3 ? (v / 1e3).toFixed(0) + "K" : v}
              />
              <Tooltip {...TOOLTIP_STYLE} />
              {numericCols.map((col, i) => (
                <Area
                  key={col.key}
                  type="monotone"
                  dataKey={col.key}
                  name={col.label}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  fill={`url(#grad_${i})`}
                  strokeWidth={1.5}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Pie chart */}
      {pieData.length > 0 && catCol && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-xl p-5"
          style={{ background: "rgb(255 255 255 / 0.02)", border: "1px solid var(--color-border)" }}
        >
          <h3 className="text-sm font-medium text-white mb-4">
            By {catCol.label}
          </h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={62}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                <span className="flex-1 truncate" style={{ color: "var(--color-muted-foreground)" }} title={d.name}>
                  {d.name}
                </span>
                <span className="font-medium text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
