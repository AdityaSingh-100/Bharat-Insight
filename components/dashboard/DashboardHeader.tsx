"use client";

import { motion } from "motion/react";
import { ChevronDown, Brain, Shield, Eye, Search } from "lucide-react";
import { useOrgStore, ORG_CONFIGS, type OrgId } from "@/store/useOrgStore";
import { DatasetFilePicker } from "./DatasetFilePicker";
import { useState, useRef, useEffect } from "react";

function OrgSwitcher() {
  const { currentOrg, setOrg } = useOrgStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const orgConfig = ORG_CONFIGS[currentOrg];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all"
        style={{
          background: "rgb(255 255 255 / 0.04)",
          border: "1px solid var(--color-border)",
          color: "color-mix(in srgb, var(--color-foreground) 75%, transparent)",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.background =
            "rgb(255 255 255 / 0.07)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.background =
            "rgb(255 255 255 / 0.04)")
        }
      >
        <span>{orgConfig.icon}</span>
        <span className="hidden sm:block">{orgConfig.shortName}</span>
        <ChevronDown
          size={13}
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 200ms ease",
          }}
        />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12 }}
          className="absolute top-full left-0 mt-1.5 w-72 rounded-xl z-50 overflow-hidden shadow-2xl"
          style={{
            border: "1px solid var(--color-border)",
            background: "hsl(224 71% 4.5%)",
          }}
        >
          <div
            className="px-3 py-2"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <span
              className="text-xs"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              Switch Department
            </span>
          </div>
          {Object.values(ORG_CONFIGS).map((org) => (
            <button
              key={org.id}
              onClick={() => {
                setOrg(org.id as OrgId);
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
              style={{ color: "var(--color-foreground)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "rgb(255 255 255 / 0.04)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "transparent")
              }
            >
              <span className="text-xl">{org.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-medium">{org.name}</div>
                <div
                  className="text-xs"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  {org.description}
                </div>
              </div>
              {currentOrg === org.id && (
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: "var(--color-success)" }}
                />
              )}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function RoleBadge() {
  const { role } = useOrgStore();
  const isAdmin = role === "admin";
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
      title={
        isAdmin ? "Admin — edit & delete enabled" : "Viewer — read-only access"
      }
      style={{
        background: isAdmin
          ? "var(--color-org-muted)"
          : "rgb(255 255 255 / 0.04)",
        border: isAdmin
          ? "1px solid var(--color-org-border)"
          : "1px solid var(--color-border)",
        color: isAdmin
          ? "var(--color-org-primary)"
          : "var(--color-muted-foreground)",
        cursor: "default",
      }}
    >
      {isAdmin ? <Shield size={11} /> : <Eye size={11} />}
      {isAdmin ? "Admin" : "Viewer"}
    </div>
  );
}

export function DashboardHeader() {
  const { setAIPanelOpen, setCommandPalette } = useOrgStore();

  return (
    <header
      className="fixed top-0 left-16 lg:left-60 right-0 h-14 z-10 flex items-center justify-between px-5 gap-3"
      style={{
        borderBottom: "1px solid rgb(255 255 255 / 0.06)",
        background: "hsl(224 71% 4% / 0.85)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <OrgSwitcher />
        <RoleBadge />
        <div
          className="h-4 w-px hidden sm:block"
          style={{ background: "var(--color-border)" }}
        />
        <DatasetFilePicker />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setCommandPalette(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all"
          style={{
            background: "rgb(255 255 255 / 0.04)",
            border: "1px solid var(--color-border)",
            color: "var(--color-muted-foreground)",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.color =
              "var(--color-foreground)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color =
              "var(--color-muted-foreground)")
          }
        >
          <Search size={12} />
          <span>Search...</span>
          <kbd
            className="flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono"
            style={{
              background: "rgb(255 255 255 / 0.06)",
              color: "var(--color-muted-foreground)",
              border: "1px solid rgb(255 255 255 / 0.05)",
            }}
          >
            ⌘K
          </kbd>
        </button>

        <button
          onClick={() => setAIPanelOpen(true)}
          className="ai-glow-btn relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
          title="AI Insights (Alt+A)"
          style={{
            background: "var(--color-org-muted)",
            border: "1px solid var(--color-org-border)",
            color: "var(--color-org-primary)",
            boxShadow:
              "0 0 12px var(--color-org-glow, transparent), 0 0 24px color-mix(in srgb, var(--color-org-primary) 15%, transparent)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 0 20px var(--color-org-glow), 0 0 40px color-mix(in srgb, var(--color-org-primary) 25%, transparent)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 0 12px var(--color-org-glow, transparent), 0 0 24px color-mix(in srgb, var(--color-org-primary) 15%, transparent)";
          }}
        >
          {/* Pulsing live indicator */}
          <span
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
            style={{
              background: "var(--color-success)",
              boxShadow: "0 0 6px var(--color-success)",
              animation: "pulse-slow 2s ease-in-out infinite",
            }}
          />
          <Brain size={13} />
          <span className="hidden sm:block">AI Insights</span>
        </button>
      </div>
    </header>
  );
}
