"use client";

import { cn } from "@/lib/utils";

export interface BentoItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  status?: string;
  tags?: string[];
  meta?: string;
  cta?: string;
  colSpan?: number;
  hasPersistentHover?: boolean;
  accentColor?: string; // e.g. "rgba(59,130,246,0.18)"
}

interface BentoGridProps {
  items: BentoItem[];
  className?: string;
  /** Tailwind grid-cols value for the outer grid, e.g. "grid-cols-1 md:grid-cols-4" */
  gridCols?: string;
}

export function BentoGrid({
  items,
  className,
  gridCols = "grid-cols-1 md:grid-cols-4",
}: BentoGridProps) {
  return (
    <div className={cn("grid gap-4 auto-rows-min", gridCols, className)}>
      {items.map((item, index) => (
        <BentoCard key={index} item={item} />
      ))}
    </div>
  );
}

function BentoCard({ item }: { item: BentoItem }) {
  return (
    <div
      className={cn(
        "group relative rounded-2xl overflow-hidden transition-all duration-300",
        "border border-white/[0.07] bg-slate-900/50 backdrop-blur-md",
        "hover:-translate-y-0.5 hover:border-white/[0.14]",
        "hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)] will-change-transform",
        "col-span-1",
        item.colSpan === 2 ? "md:col-span-2" : "",
        item.hasPersistentHover &&
          "-translate-y-0.5 border-white/[0.12] shadow-[0_4px_24px_rgba(0,0,0,0.4)]",
      )}
    >
      {/* Dot-grid texture on hover */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          item.hasPersistentHover
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100",
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:4px_4px]" />
      </div>

      {/* Per-card accent glow */}
      {item.accentColor && (
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-500 pointer-events-none",
            item.hasPersistentHover
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100",
          )}
          style={{
            background: `radial-gradient(ellipse 70% 60% at 50% 0%, ${item.accentColor}, transparent)`,
          }}
        />
      )}

      {/* Gradient border shimmer */}
      <div
        className={cn(
          "absolute inset-0 -z-10 rounded-2xl p-px",
          "bg-gradient-to-br from-transparent via-white/[0.06] to-transparent",
          item.hasPersistentHover
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100",
          "transition-opacity duration-300",
        )}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-6 space-y-4">
        {/* Top row: icon + status badge */}
        <div className="flex items-center justify-between">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
            style={{
              background: "var(--color-org-muted)",
              border: "1px solid var(--color-org-border)",
            }}
          >
            {item.icon}
          </div>
          {item.status && (
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-lg transition-colors duration-300"
              style={{
                background: "rgb(255 255 255 / 0.06)",
                color: "rgb(255 255 255 / 0.5)",
                border: "1px solid rgb(255 255 255 / 0.06)",
              }}
            >
              {item.status}
            </span>
          )}
        </div>

        {/* Title + meta + description */}
        <div className="space-y-2 flex-1">
          <h3 className="font-semibold text-white tracking-tight text-[15px] leading-snug">
            {item.title}
            {item.meta && (
              <span
                className="ml-2 text-xs font-normal"
                style={{ color: "rgb(255 255 255 / 0.28)" }}
              >
                {item.meta}
              </span>
            )}
          </h3>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "rgb(255 255 255 / 0.45)" }}
          >
            {item.description}
          </p>
        </div>

        {/* Bottom row: tags + cta */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-wrap gap-1.5">
            {item.tags?.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md text-xs transition-all duration-200"
                style={{
                  background: "rgb(255 255 255 / 0.05)",
                  color: "rgb(255 255 255 / 0.35)",
                  border: "1px solid rgb(255 255 255 / 0.06)",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
          <span
            className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-3 shrink-0"
            style={{ color: "var(--color-org-primary)" }}
          >
            {item.cta ?? "Explore →"}
          </span>
        </div>
      </div>
    </div>
  );
}
