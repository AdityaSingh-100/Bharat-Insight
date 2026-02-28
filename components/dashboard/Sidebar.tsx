"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Database,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Activity,
} from "lucide-react";
import { useOrgStore, ORG_CONFIGS } from "@/store/useOrgStore";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Database, label: "Data Grid", href: "/dashboard#grid" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard#charts" },
  { icon: Settings, label: "Settings", href: "/dashboard#settings" },
  { icon: HelpCircle, label: "Help", href: "/dashboard#help" },
];

export function Sidebar() {
  const { currentOrg } = useOrgStore();
  const pathname = usePathname();
  const orgConfig = ORG_CONFIGS[currentOrg];

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed left-0 top-0 h-full w-16 lg:w-60 z-20 flex flex-col border-r border-white/5 bg-black/40 backdrop-blur-xl transition-theme"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0"
            style={{ background: `hsl(var(--org-primary) / 0.2)`, border: `1px solid hsl(var(--org-primary) / 0.3)` }}
          >
            {orgConfig.icon}
          </div>
          <div className="hidden lg:block overflow-hidden">
            <div className="text-white font-semibold text-sm leading-none">Bharat-Insight</div>
            <div className="text-white/40 text-xs mt-0.5 truncate">{orgConfig.shortName}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href.split("#")[0]));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
                active
                  ? "bg-[hsl(var(--org-primary)/0.15)] text-white border border-[hsl(var(--org-primary)/0.2)]"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon
                size={18}
                className={cn(
                  "shrink-0 transition-colors",
                  active ? "text-[hsl(var(--org-primary))]" : "group-hover:text-white/80"
                )}
              />
              <span className="hidden lg:block">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Status indicator */}
      <div className="p-4 border-t border-white/5">
        <div className="hidden lg:flex items-center gap-2 text-xs text-white/30">
          <Activity size={12} className="text-emerald-400" />
          <span>System online</span>
        </div>
      </div>
    </motion.aside>
  );
}
