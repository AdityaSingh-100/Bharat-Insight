"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2,
  Shield,
  Eye,
  Filter,
  Brain,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { useOrgStore, ORG_CONFIGS } from "@/store/useOrgStore";
import { useDatasetStore } from "@/store/useDatasetStore";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  category: string;
  action: () => void;
  shortcut?: string;
  isActive?: boolean;
}

export function CommandPalette() {
  const {
    isCommandPaletteOpen,
    setCommandPalette,
    setOrg,
    setRole,
    clearFilters,
    setAIPanelOpen,
    currentOrg,
    role,
  } = useOrgStore();
  const { availableFiles, activeFile, loadFile } = useDatasetStore();

  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPalette(true);
      }
      if (e.key === "Escape") setCommandPalette(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCommandPalette]);

  const COMMANDS: Command[] = [
    // Org switcher
    ...Object.values(ORG_CONFIGS).map((org) => ({
      id: `org-${org.id}`,
      label: `Switch to ${org.name}`,
      description: org.description,
      icon: Building2,
      category: "Department",
      isActive: currentOrg === org.id,
      action: () => {
        setOrg(org.id);
        setCommandPalette(false);
      },
    })),

    // Dataset files
    ...availableFiles.map((f) => ({
      id: `file-${f}`,
      label: `Load: ${f}`,
      description: "Switch to this CSV dataset",
      icon: FileSpreadsheet,
      category: "Dataset",
      isActive: activeFile === f,
      action: () => {
        loadFile(f);
        setCommandPalette(false);
      },
    })),

    // Role
    {
      id: "role-admin",
      label: "Set Role: Admin",
      description: "Enable edit and delete controls",
      icon: Shield,
      category: "Access",
      isActive: role === "admin",
      action: () => {
        setRole("admin");
        setCommandPalette(false);
      },
    },
    {
      id: "role-viewer",
      label: "Set Role: Viewer",
      description: "Read-only mode",
      icon: Eye,
      category: "Access",
      isActive: role === "viewer",
      action: () => {
        setRole("viewer");
        setCommandPalette(false);
      },
    },

    // Data
    {
      id: "clear-filters",
      label: "Clear All Filters",
      description: "Reset all column filters and search",
      icon: Filter,
      category: "Data",
      shortcut: "⌘⌫",
      action: () => {
        clearFilters();
        setCommandPalette(false);
      },
    },
    {
      id: "open-ai",
      label: "Open AI Insights",
      description: "Ask Gemini about your filtered data",
      icon: Brain,
      category: "AI",
      action: () => {
        setAIPanelOpen(true);
        setCommandPalette(false);
      },
    },
  ];

  const filtered = COMMANDS.filter(
    (c) =>
      !search ||
      c.label.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()),
  );

  // Reset selection when search or list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Keyboard navigation
  useEffect(() => {
    if (!isCommandPaletteOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        filtered[selectedIndex]?.action();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isCommandPaletteOpen, filtered, selectedIndex]);

  const grouped = filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  const close = () => {
    setCommandPalette(false);
    setSearch("");
    setSelectedIndex(0);
  };

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(6px)",
            }}
            onClick={close}
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.14 }}
              className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
              style={{
                border: "1px solid var(--color-border)",
                background: "hsl(224 71% 4%)",
              }}
            >
              {/* Search input */}
              <div
                className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <span
                  className="text-lg"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  ⌘
                </span>
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search commands..."
                  className="flex-1 bg-transparent text-white text-sm placeholder-white/25 focus:outline-none"
                />
                <button
                  onClick={close}
                  className="p-1 rounded transition-colors"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  <X size={13} />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto py-1.5">
                {filtered.length === 0 ? (
                  <div
                    className="text-center py-8 text-sm"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    No commands found
                  </div>
                ) : (
                  Object.entries(grouped).map(([cat, cmds]) => (
                    <div key={cat}>
                      <div
                        className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        {cat}
                      </div>
                      {cmds.map((cmd) => {
                        const Icon = cmd.icon;
                        const flatIndex = filtered.indexOf(cmd);
                        const isKeySelected = flatIndex === selectedIndex;
                        return (
                          <button
                            key={cmd.id}
                            onClick={cmd.action}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                            style={{
                              background: isKeySelected
                                ? "rgb(255 255 255 / 0.06)"
                                : cmd.isActive
                                  ? "var(--color-org-muted)"
                                  : "transparent",
                              outline: isKeySelected
                                ? "1px solid var(--color-org-border)"
                                : "none",
                            }}
                            onMouseEnter={(e) => {
                              setSelectedIndex(flatIndex);
                              if (!cmd.isActive)
                                (
                                  e.currentTarget as HTMLElement
                                ).style.background = "rgb(255 255 255 / 0.04)";
                            }}
                            onMouseLeave={(e) => {
                              if (!cmd.isActive)
                                (
                                  e.currentTarget as HTMLElement
                                ).style.background = isKeySelected
                                  ? "rgb(255 255 255 / 0.06)"
                                  : "transparent";
                            }}
                          >
                            <Icon
                              size={14}
                              style={{
                                color: cmd.isActive
                                  ? "var(--color-org-primary)"
                                  : "var(--color-muted-foreground)",
                                flexShrink: 0,
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div
                                className="text-sm truncate"
                                style={{
                                  color: cmd.isActive
                                    ? "white"
                                    : "color-mix(in srgb, var(--color-foreground) 80%, transparent)",
                                }}
                              >
                                {cmd.label}
                              </div>
                              {cmd.description && (
                                <div
                                  className="text-xs truncate"
                                  style={{
                                    color: "var(--color-muted-foreground)",
                                  }}
                                >
                                  {cmd.description}
                                </div>
                              )}
                            </div>
                            {cmd.shortcut && (
                              <kbd
                                className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                                style={{
                                  background: "rgb(255 255 255 / 0.07)",
                                  color: "var(--color-muted-foreground)",
                                }}
                              >
                                {cmd.shortcut}
                              </kbd>
                            )}
                            {cmd.isActive && (
                              <div
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{
                                  background: "var(--color-org-primary)",
                                }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              <div
                className="px-4 py-2 flex justify-between text-[10px]"
                style={{
                  borderTop: "1px solid var(--color-border)",
                  color: "rgb(255 255 255 / 0.2)",
                }}
              >
                <span>↑↓ navigate · ↵ select</span>
                <span>Esc to close</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
