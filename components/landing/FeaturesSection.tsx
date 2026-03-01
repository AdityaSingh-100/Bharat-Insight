"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import {
  Brain,
  Layers3,
  Building2,
  Radio,
  Terminal,
  ShieldCheck,
  TrendingUp,
  Database,
} from "lucide-react";
import {
  CyberneticBentoGrid,
  type BentoItem,
} from "@/components/ui/cybernetic-bento-grid";

const BENTO_ITEMS: BentoItem[] = [
  {
    icon: (
      <Brain
        size={20}
        strokeWidth={1.8}
        style={{ color: "var(--color-org-primary)" }}
      />
    ),
    title: "AI Insights",
    meta: "Gemini 1.5",
    description:
      "Google Gemini streams real-time analysis of filtered data — context-aware, token-by-token.",
    status: "Live",
    tags: ["Gemini", "Streaming", "AI"],
    cta: "Try it →",
    colSpan: 2,
    hasPersistentHover: true,
    accentColor: "rgba(59,130,246,0.12)",
  },
  {
    icon: (
      <Layers3
        size={20}
        strokeWidth={1.8}
        style={{ color: "var(--color-org-primary)" }}
      />
    ),
    title: "100K+ Virtualization",
    meta: "TanStack",
    description:
      "TanStack Virtual renders 100,000 rows at 60fps with zero jank.",
    status: "60fps",
    tags: ["Virtual", "Performance"],
    cta: "See demo →",
    colSpan: 2,
    accentColor: "rgba(139,92,246,0.12)",
  },
  {
    icon: (
      <Building2
        size={20}
        strokeWidth={1.8}
        style={{ color: "var(--color-org-primary)" }}
      />
    ),
    title: "Multi-Tenant",
    meta: "2 ministries",
    description:
      "Switch between ministries. Theme, data, and context update instantly — no reload.",
    status: "Instant",
    tags: ["Theming", "Context"],
    accentColor: "rgba(16,185,129,0.12)",
  },
  {
    icon: (
      <Radio
        size={20}
        strokeWidth={1.8}
        style={{ color: "var(--color-org-primary)" }}
      />
    ),
    title: "Real-time Streaming",
    meta: "SSE",
    description:
      "Gemini AI tokens stream progressively. Watch insights form live.",
    status: "Live",
    tags: ["Streaming", "SSE"],
    accentColor: "rgba(249,115,22,0.12)",
  },
  {
    icon: (
      <Terminal
        size={20}
        strokeWidth={1.8}
        style={{ color: "var(--color-org-primary)" }}
      />
    ),
    title: "Command Palette",
    meta: "⌘K",
    description:
      "Switch orgs, clear filters, open AI panel, navigate — all from keyboard.",
    status: "⌘K",
    tags: ["Keyboard", "UX"],
    accentColor: "rgba(6,182,212,0.12)",
  },
  {
    icon: (
      <ShieldCheck
        size={20}
        strokeWidth={1.8}
        style={{ color: "var(--color-org-primary)" }}
      />
    ),
    title: "Role-Based Access",
    meta: "Supabase",
    description:
      "Admin can edit & export. Viewer gets read-only. Managed via Supabase Auth.",
    status: "Secure",
    tags: ["Auth", "RBAC"],
    accentColor: "rgba(236,72,153,0.12)",
  },
  {
    icon: (
      <Database
        size={20}
        strokeWidth={1.8}
        style={{ color: "var(--color-org-primary)" }}
      />
    ),
    title: "TRAI-Style Dataset",
    meta: "100K rows",
    description:
      "Simulated telecom performance rows — states, operators, technologies, ARPU.",
    status: "100K",
    tags: ["CSV", "Telecom"],
    accentColor: "rgba(234,179,8,0.12)",
  },
  {
    icon: (
      <TrendingUp
        size={20}
        strokeWidth={1.8}
        style={{ color: "var(--color-org-primary)" }}
      />
    ),
    title: "Advanced Analytics",
    meta: "Multi-column",
    description:
      "Multi-column filtering, fuzzy search, sticky headers, column sorting.",
    status: "Smart",
    tags: ["Filter", "Search"],
    accentColor: "rgba(132,204,22,0.12)",
  },
];

export function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="features" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-100 rounded-full opacity-[0.04] blur-[120px] pointer-events-none"
        style={{ background: "var(--color-org-primary)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm mb-6"
            style={{
              borderColor: "var(--color-org-border)",
              background: "var(--color-org-muted)",
              color: "var(--color-org-primary)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "var(--color-org-primary)" }}
            />
            Everything you need
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 font-inter tracking-tight">
            Built for <span className="text-gradient">production scale</span>
          </h2>
          <p className="text-white/35 text-lg max-w-2xl mx-auto leading-relaxed">
            Every feature engineered for India&apos;s data needs — from
            ministries to analytics teams.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <CyberneticBentoGrid items={BENTO_ITEMS} />
        </motion.div>
      </div>
    </section>
  );
}
