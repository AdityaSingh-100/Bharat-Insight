"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface BentoItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  status?: string;
  tags?: string[];
  meta?: string;
  cta?: string;
  /** Spans 2 columns on lg+ screens */
  colSpan?: number;
  /** Spans 2 rows on lg+ screens */
  rowSpan?: number;
  /** Keep the mouse-tracking glow visible even without hover */
  hasPersistentHover?: boolean;
  accentColor?: string;
}

interface CyberneticBentoGridProps {
  items: BentoItem[];
  className?: string;
}

// ── Individual card with mouse-tracking glow ─────────────────────────────
function BentoCard({ item }: { item: BentoItem }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Seed glow position for always-active cards
    if (item.hasPersistentHover) {
      el.style.setProperty("--mouse-x", `${el.offsetWidth * 0.5}px`);
      el.style.setProperty("--mouse-y", `${el.offsetHeight * 0.3}px`);
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    };

    el.addEventListener("mousemove", onMouseMove);
    return () => el.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "bento-item flex flex-col gap-4 min-h-40",
        item.colSpan === 2 && "sm:col-span-2",
        item.rowSpan === 2 && "row-span-2",
        item.hasPersistentHover && "bento-item--active",
      )}
    >
      {/* Per-card accent tint (static, not mouse-tracking) */}
      {item.accentColor && (
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
          style={{
            background: `radial-gradient(ellipse 70% 55% at 50% 0%, ${item.accentColor}, transparent)`,
          }}
        />
      )}

      {/* Top row: icon + status */}
      <div className="flex items-start justify-between gap-3">
        {/* Icon box */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "var(--color-org-muted)",
            border: "1px solid var(--color-org-border)",
          }}
        >
          {item.icon}
        </div>

        {item.status && (
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-lg shrink-0"
            style={{
              background: "rgb(255 255 255 / 0.06)",
              color: "rgb(255 255 255 / 0.45)",
              border: "1px solid rgb(255 255 255 / 0.06)",
            }}
          >
            {item.status}
          </span>
        )}
      </div>

      {/* Text content */}
      <div className="flex flex-col gap-1.5 flex-1">
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

      {/* Tags + CTA */}
      {(item.tags?.length || item.cta) && (
        <div className="flex items-center justify-between gap-2 flex-wrap mt-auto pt-2">
          {item.tags && (
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2 py-0.5 rounded-md font-medium"
                  style={{
                    background: "rgb(255 255 255 / 0.05)",
                    color: "rgb(255 255 255 / 0.35)",
                    border: "1px solid rgb(255 255 255 / 0.06)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {item.cta && (
            <span
              className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
              style={{ color: "var(--color-org-primary)" }}
            >
              {item.cta}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Grid wrapper ─────────────────────────────────────────────────────────
export function CyberneticBentoGrid({
  items,
  className,
}: CyberneticBentoGridProps) {
  return (
    <div className={cn("bento-grid", className)}>
      {items.map((item, i) => (
        <BentoCard key={i} item={item} />
      ))}
    </div>
  );
}
