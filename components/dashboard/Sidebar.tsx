"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  BarChart3,
  Settings,
  HelpCircle,
  Activity,
} from "lucide-react";
import { useOrgStore, ORG_CONFIGS } from "@/store/useOrgStore";
import { cn } from "@/lib/utils";

// Scroll-based items shown only on the main dashboard page
const SCROLL_NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", id: "overview" },
  { icon: Database, label: "Data Grid", id: "grid" },
  { icon: BarChart3, label: "Analytics", id: "charts" },
  { icon: HelpCircle, label: "Help", id: "help" },
];

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [ids]);

  return active;
}

export function Sidebar() {
  const { currentOrg } = useOrgStore();
  const orgConfig = ORG_CONFIGS[currentOrg] ?? ORG_CONFIGS["health"];
  const pathname = usePathname();
  const isSettingsPage = pathname === "/dashboard/settings";

  const sectionIds = SCROLL_NAV_ITEMS.map((n) => n.id);
  const activeSection = useActiveSection(isSettingsPage ? [] : sectionIds);

  const scrollTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="fixed left-0 top-0 h-full w-16 lg:w-60 z-20 flex flex-col border-r border-white/[0.05] bg-black/50 backdrop-blur-2xl transition-theme"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform"
            style={{
              background: "hsl(var(--org-primary) / 0.2)",
              border: "1px solid hsl(var(--org-primary) / 0.3)",
            }}
          >
            {orgConfig.icon}
          </div>
          <div className="hidden lg:block overflow-hidden">
            <div className="text-white font-semibold text-sm leading-none">
              Bharat-Insight
            </div>
            <div className="text-white/40 text-xs mt-0.5 truncate">
              {orgConfig.shortName}
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {/* Scroll-based items — only on main dashboard */}
        {!isSettingsPage &&
          SCROLL_NAV_ITEMS.map((item) => {
            const active = activeSection === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
                  active
                    ? "bg-[hsl(var(--org-primary)/0.15)] text-white border border-[hsl(var(--org-primary)/0.2)]"
                    : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent",
                )}
              >
                <Icon
                  size={18}
                  className={cn(
                    "shrink-0 transition-colors",
                    active
                      ? "text-[hsl(var(--org-primary))]"
                      : "group-hover:text-white/80",
                  )}
                />
                <span className="hidden lg:block">{item.label}</span>
              </button>
            );
          })}

        {/* On settings page show a "← Dashboard" back link */}
        {isSettingsPage && (
          <Link
            href="/dashboard"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
          >
            <LayoutDashboard
              size={18}
              className="shrink-0 group-hover:text-white/80 transition-colors"
            />
            <span className="hidden lg:block">Dashboard</span>
          </Link>
        )}

        {/* Settings — always a route link */}
        <Link
          href="/dashboard/settings"
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
            isSettingsPage
              ? "bg-[hsl(var(--org-primary)/0.15)] text-white border border-[hsl(var(--org-primary)/0.2)]"
              : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent",
          )}
        >
          <Settings
            size={18}
            className={cn(
              "shrink-0 transition-colors",
              isSettingsPage
                ? "text-[hsl(var(--org-primary))]"
                : "group-hover:text-white/80",
            )}
          />
          <span className="hidden lg:block">Settings</span>
        </Link>
      </nav>

      {/* Status */}
      <div className="p-4 border-t border-white/5">
        <div className="hidden lg:flex items-center gap-2 text-xs text-white/30">
          <Activity size={12} className="text-emerald-400" />
          <span>System online</span>
        </div>
      </div>
    </motion.aside>
  );
}
