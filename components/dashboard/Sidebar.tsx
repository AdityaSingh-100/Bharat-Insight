"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  BarChart3,
  Settings,
  HelpCircle,
  Activity,
  X,
  PanelLeftOpen,
} from "lucide-react";
import { useOrgStore, ORG_CONFIGS } from "@/store/useOrgStore";
import { DatasetFilePicker } from "./DatasetFilePicker";
import { cn } from "@/lib/utils";

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
  const { currentOrg, isMobileSidebarOpen, setMobileSidebar } = useOrgStore();
  const orgConfig = ORG_CONFIGS[currentOrg] ?? ORG_CONFIGS["health"];
  const pathname = usePathname();
  const isSettingsPage = pathname === "/dashboard/settings";

  const sectionIds = SCROLL_NAV_ITEMS.map((n) => n.id);
  const activeSection = useActiveSection(isSettingsPage ? [] : sectionIds);

  useEffect(() => {
    setMobileSidebar(false);
  }, [pathname, setMobileSidebar]);

  const scrollTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileSidebar(false);
  };

  // ── Full drawer content (mobile overlay) ─────────────────────────────────
  const DrawerContent = () => (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="h-14 flex items-center px-4 border-b border-white/5 shrink-0">
        <Link href="/" className="flex items-center gap-3 group flex-1 min-w-0">
          <Image
            src="/logo2.png"
            alt="Bharat-Insight"
            width={36}
            height={36}
            className="rounded-xl shrink-0 group-hover:opacity-90 transition-opacity drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]"
          />
          <div className="overflow-hidden">
            <div className="text-white font-semibold text-sm leading-none">
              Bharat-Insight
            </div>
            <div className="text-white/40 text-xs mt-0.5 truncate">
              {orgConfig.shortName}
            </div>
          </div>
        </Link>
        <button
          onClick={() => setMobileSidebar(false)}
          aria-label="Close navigation"
          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      {/* Dataset picker */}
      <div className="px-3 py-3 border-b border-white/5 shrink-0">
        <DatasetFilePicker />
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {!isSettingsPage &&
          SCROLL_NAV_ITEMS.map((item) => {
            const active = activeSection === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                aria-label={item.label}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                  active
                    ? "bg-[hsl(var(--org-primary)/0.15)] text-white border border-[hsl(var(--org-primary)/0.2)]"
                    : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent",
                )}
              >
                <Icon
                  size={17}
                  className={cn(
                    "shrink-0",
                    active ? "text-[hsl(var(--org-primary))]" : "",
                  )}
                />
                <span>{item.label}</span>
              </button>
            );
          })}

        {isSettingsPage && (
          <Link
            href="/dashboard"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-200"
          >
            <LayoutDashboard size={17} className="shrink-0" />
            <span>Dashboard</span>
          </Link>
        )}

        <Link
          href="/dashboard/settings"
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
            isSettingsPage
              ? "bg-[hsl(var(--org-primary)/0.15)] text-white border border-[hsl(var(--org-primary)/0.2)]"
              : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent",
          )}
        >
          <Settings
            size={17}
            className={cn(
              "shrink-0",
              isSettingsPage ? "text-[hsl(var(--org-primary))]" : "",
            )}
          />
          <span>Settings</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-white/5 shrink-0">
        <div className="flex items-center gap-2 text-xs text-white/30">
          <Activity size={11} className="text-emerald-400" />
          <span>System online</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Persistent sidebar ── always visible ──────────────────────────── */}
      {/* Mobile: w-12 icon strip  |  md: w-16 icon strip  |  lg: w-60 full   */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 h-full w-12 md:w-16 lg:w-60 z-20 flex flex-col border-r border-white/5 bg-black/60 backdrop-blur-2xl transition-theme overflow-hidden"
        aria-label="Sidebar"
      >
        {/* Logo row */}
        <div className="h-14 flex items-center justify-center lg:justify-start lg:px-4 border-b border-white/5 shrink-0">
          {/* Logo icon — always visible */}
          <Link
            href="/"
            aria-label="Home"
            className="shrink-0 hover:opacity-90 transition-opacity"
          >
            <Image
              src="/logo2.png"
              alt="Bharat-Insight"
              width={36}
              height={36}
              className="rounded-xl drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]"
            />
          </Link>
          {/* Text — only on lg */}
          <div className="hidden lg:block ml-3 overflow-hidden">
            <div className="text-white font-semibold text-sm leading-none">
              Bharat-Insight
            </div>
            <div className="text-white/40 text-xs mt-0.5 truncate">
              {orgConfig.shortName}
            </div>
          </div>
        </div>

        {/* Expand button — mobile only (opens full drawer) */}
        <button
          onClick={() => setMobileSidebar(true)}
          aria-label="Open full menu"
          className="md:hidden mx-auto mt-2 w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
        >
          <PanelLeftOpen size={16} />
        </button>

        {/* Nav icons */}
        <nav className="flex-1 py-3 px-1.5 md:px-2 flex flex-col gap-0.5">
          {!isSettingsPage &&
            SCROLL_NAV_ITEMS.map((item) => {
              const active = activeSection === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  aria-label={item.label}
                  title={item.label}
                  className={cn(
                    "w-full flex items-center gap-3 px-2 md:px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
                    active
                      ? "bg-[hsl(var(--org-primary)/0.15)] text-white border border-[hsl(var(--org-primary)/0.2)]"
                      : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent",
                  )}
                >
                  <Icon
                    size={17}
                    className={cn(
                      "shrink-0 mx-auto lg:mx-0 transition-colors",
                      active
                        ? "text-[hsl(var(--org-primary))]"
                        : "group-hover:text-white/80",
                    )}
                  />
                  <span className="hidden lg:block">{item.label}</span>
                </button>
              );
            })}

          {isSettingsPage && (
            <Link
              href="/dashboard"
              title="Dashboard"
              className="w-full flex items-center gap-3 px-2 md:px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-200 group"
            >
              <LayoutDashboard
                size={17}
                className="shrink-0 mx-auto lg:mx-0 group-hover:text-white/80 transition-colors"
              />
              <span className="hidden lg:block">Dashboard</span>
            </Link>
          )}

          <Link
            href="/dashboard/settings"
            title="Settings"
            className={cn(
              "w-full flex items-center gap-3 px-2 md:px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
              isSettingsPage
                ? "bg-[hsl(var(--org-primary)/0.15)] text-white border border-[hsl(var(--org-primary)/0.2)]"
                : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent",
            )}
          >
            <Settings
              size={17}
              className={cn(
                "shrink-0 mx-auto lg:mx-0 transition-colors",
                isSettingsPage
                  ? "text-[hsl(var(--org-primary))]"
                  : "group-hover:text-white/80",
              )}
            />
            <span className="hidden lg:block">Settings</span>
          </Link>
        </nav>

        {/* Status — lg only */}
        <div className="p-4 border-t border-white/5 hidden lg:flex items-center gap-2 text-xs text-white/30">
          <Activity size={11} className="text-emerald-400" />
          <span>System online</span>
        </div>
      </motion.aside>

      {/* ── Mobile full drawer overlay ─────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileSidebar(false)}
              aria-hidden="true"
            />
            <motion.aside
              key="drawer"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed left-0 top-0 h-full w-72 z-40 flex flex-col border-r border-white/[0.08]"
              style={{ background: "hsl(224 71% 4%)" }}
              aria-label="Mobile navigation"
            >
              <DrawerContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
