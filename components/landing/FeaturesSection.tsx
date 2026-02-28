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

const FEATURES = [
  {
    icon: Brain,
    title: "AI Insights",
    description: "Google Gemini streams real-time analysis of filtered data — context-aware, token-by-token.",
    gradient: "from-blue-600/20 to-indigo-600/10",
    border: "border-blue-500/20",
    iconColor: "text-blue-400",
    size: "col-span-2 row-span-1",
  },
  {
    icon: Layers3,
    title: "100K+ Virtualization",
    description: "TanStack Virtual renders 100,000 rows at 60fps with zero jank.",
    gradient: "from-violet-600/20 to-purple-600/10",
    border: "border-violet-500/20",
    iconColor: "text-violet-400",
    size: "col-span-1 row-span-1",
  },
  {
    icon: Building2,
    title: "Multi-Tenant Architecture",
    description: "Switch between ministries. Theme, data, and context update instantly — no reload.",
    gradient: "from-emerald-600/20 to-teal-600/10",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-400",
    size: "col-span-1 row-span-2",
  },
  {
    icon: Radio,
    title: "Real-time Streaming",
    description: "Gemini AI tokens stream progressively. Watch insights form live.",
    gradient: "from-orange-600/20 to-red-600/10",
    border: "border-orange-500/20",
    iconColor: "text-orange-400",
    size: "col-span-1 row-span-1",
  },
  {
    icon: Terminal,
    title: "Command Palette",
    description: "⌘K to switch orgs, clear filters, open AI panel, navigate — all from keyboard.",
    gradient: "from-cyan-600/20 to-sky-600/10",
    border: "border-cyan-500/20",
    iconColor: "text-cyan-400",
    size: "col-span-1 row-span-1",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    description: "Admin can edit & export. Viewer gets read-only. Managed via Supabase Auth.",
    gradient: "from-pink-600/20 to-rose-600/10",
    border: "border-pink-500/20",
    iconColor: "text-pink-400",
    size: "col-span-1 row-span-1",
  },
  {
    icon: Database,
    title: "TRAI-Style Dataset",
    description: "Simulated 100K telecom performance rows — states, operators, technologies, ARPU.",
    gradient: "from-yellow-600/20 to-amber-600/10",
    border: "border-yellow-500/20",
    iconColor: "text-yellow-400",
    size: "col-span-1 row-span-1",
  },
  {
    icon: TrendingUp,
    title: "Advanced Analytics",
    description: "Multi-column filtering, fuzzy search, sticky headers, column sorting.",
    gradient: "from-lime-600/20 to-green-600/10",
    border: "border-lime-500/20",
    iconColor: "text-lime-400",
    size: "col-span-1 row-span-1",
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[0];
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className={`
        relative group rounded-2xl p-6 border overflow-hidden
        bg-gradient-to-br ${feature.gradient} ${feature.border}
        hover:border-opacity-60 transition-all duration-300
        glow-border cursor-default
        ${feature.size}
      `}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      </div>

      <div className={`inline-flex p-2.5 rounded-xl bg-white/5 mb-4 ${feature.iconColor}`}>
        <Icon size={20} />
      </div>

      <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
    </motion.div>
  );
}

export function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-50" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/60 text-sm mb-6">
            Everything you need
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Built for{" "}
            <span className="text-gradient">production scale</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Every feature engineered for India's data needs — from ministries to analytics teams.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[160px]">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
