"use client";

import { motion, useInView } from "motion/react";
import { useRef, useState } from "react";
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

// define FEATURES array with updated sizing, border colors, and glow configs
const FEATURES = [
  {
    icon: Brain,
    title: "AI Insights",
    description:
      "Google Gemini streams real-time analysis of filtered data — context-aware, token-by-token.",
    hoverBorder: "group-hover:border-blue-500/50",
    iconColor: "text-blue-400",
    iconGlow: "bg-blue-500/10",
    mouseGlow: "rgba(59, 130, 246, 0.15)", // blue-500
    size: "col-span-1 md:col-span-2 lg:col-span-2",
  },
  {
    icon: Layers3,
    title: "100K+ Virtualization",
    description: "TanStack Virtual renders 100,000 rows at 60fps with zero jank.",
    hoverBorder: "group-hover:border-violet-500/50",
    iconColor: "text-violet-400",
    iconGlow: "bg-violet-500/10",
    mouseGlow: "rgba(139, 92, 246, 0.15)", // violet-500
    size: "col-span-1 md:col-span-2 lg:col-span-2",
  },
  {
    icon: Building2,
    title: "Multi-Tenant Architecture",
    description:
      "Switch between ministries. Theme, data, and context update instantly — no reload.",
    hoverBorder: "group-hover:border-emerald-500/50",
    iconColor: "text-emerald-400",
    iconGlow: "bg-emerald-500/10",
    mouseGlow: "rgba(16, 185, 129, 0.15)", // emerald-500
    size: "col-span-1",
  },
  {
    icon: Radio,
    title: "Real-time Streaming",
    description: "Gemini AI tokens stream progressively. Watch insights form live.",
    hoverBorder: "group-hover:border-orange-500/50",
    iconColor: "text-orange-400",
    iconGlow: "bg-orange-500/10",
    mouseGlow: "rgba(249, 115, 22, 0.15)", // orange-500
    size: "col-span-1",
  },
  {
    icon: Terminal,
    title: "Command Palette",
    description:
      "⌘K to switch orgs, clear filters, open AI panel, navigate — all from keyboard.",
    hoverBorder: "group-hover:border-cyan-500/50",
    iconColor: "text-cyan-400",
    iconGlow: "bg-cyan-500/10",
    mouseGlow: "rgba(6, 182, 212, 0.15)", // cyan-500
    size: "col-span-1",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    description:
      "Admin can edit & export. Viewer gets read-only. Managed via Supabase Auth.",
    hoverBorder: "group-hover:border-pink-500/50",
    iconColor: "text-pink-400",
    iconGlow: "bg-pink-500/10",
    mouseGlow: "rgba(236, 72, 153, 0.15)", // pink-500
    size: "col-span-1",
  },
  {
    icon: Database,
    title: "TRAI-Style Dataset",
    description:
      "Simulated 100K telecom performance rows — states, operators, technologies, ARPU.",
    hoverBorder: "group-hover:border-yellow-500/50",
    iconColor: "text-yellow-400",
    iconGlow: "bg-yellow-500/10",
    mouseGlow: "rgba(234, 179, 8, 0.15)", // yellow-500
    size: "col-span-1",
  },
  {
    icon: TrendingUp,
    title: "Advanced Analytics",
    description:
      "Multi-column filtering, fuzzy search, sticky headers, column sorting.",
    hoverBorder: "group-hover:border-lime-500/50",
    iconColor: "text-lime-400",
    iconGlow: "bg-lime-500/10",
    mouseGlow: "rgba(132, 204, 22, 0.15)", // lime-500
    size: "col-span-1",
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const Icon = feature.icon;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative group rounded-2xl p-6 overflow-hidden cursor-default
        bg-slate-900/50 backdrop-blur-md border border-slate-800
        transition-colors duration-300
        ${feature.hoverBorder}
        ${feature.size}
      `}
    >
      {/* Mouse-tracking radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${feature.mouseGlow}, transparent 40%)`,
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        {/* Icon */}
        <div
          className={`inline-flex p-3 rounded-xl ${feature.iconGlow} mb-5 w-fit`}
        >
          <Icon size={24} strokeWidth={1.8} className={feature.iconColor} />
        </div>

        <h3 className="text-white font-semibold text-lg mb-2">
          {feature.title}
        </h3>
        <p className="text-slate-400 text-sm leading-[1.6]">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="features" className="relative py-32 overflow-hidden">
      {/* Background stays the same */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-blue-600/[0.04] blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] text-white/50 text-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Everything you need
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 font-inter tracking-tight">
            Built for{" "}
            <span className="text-gradient">production scale</span>
          </h2>
          <p className="text-white/35 text-lg max-w-2xl mx-auto leading-relaxed">
            Every feature engineered for India's data needs — from ministries to analytics teams.
          </p>
        </motion.div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-min">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
