"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Activity,
  TrendingUp,
  Globe,
  Zap,
  BarChart3,
  Database,
  Shield,
  Play,
} from "lucide-react";

/* ─── Streaming text effect ───────────────────────────────────────────────── */
const STREAMING_TEXTS = [
  "Analyzing 2.8M telecom records across 28 states...",
  "Detected anomaly: Call drop rate ↑ 12% in Maharashtra Q3 2024",
  "AI Insight: BharatNet coverage correlates with 23% ARPU growth",
  "Streaming real-time insights from Gemini AI...",
  "Multi-tenant switch: Ministry of Electronics & IT activated",
];

function StreamingTerminal() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const target = STREAMING_TEXTS[currentIndex];
    if (charIndex < target.length) {
      const timer = setTimeout(() => {
        setDisplayText(target.slice(0, charIndex + 1));
        setCharIndex((c) => c + 1);
      }, 22);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setCurrentIndex((i) => (i + 1) % STREAMING_TEXTS.length);
        setDisplayText("");
        setCharIndex(0);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [charIndex, currentIndex]);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/50 backdrop-blur-xl p-4 font-mono text-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 rounded-full bg-red-500/70" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <div className="w-3 h-3 rounded-full bg-green-500/70" />
        <span className="ml-auto text-white/30 text-[10px] tracking-wider uppercase">
          Gemini AI Stream
        </span>
      </div>
      <div className="text-emerald-400/90 h-[3.5rem] flex items-start gap-2 overflow-hidden">
        <span className="text-white/30 shrink-0 mt-0.5">▶</span>
        <span className="leading-relaxed">
          {displayText}
          <span className="inline-block w-[2px] h-4 bg-emerald-400 ml-0.5 animate-pulse align-middle" />
        </span>
      </div>
    </div>
  );
}

/* ─── Mini dashboard preview ──────────────────────────────────────────────── */
const CHART_DATA = [
  { label: "Jan", value: 420 },
  { label: "Feb", value: 445 },
  { label: "Mar", value: 468 },
  { label: "Apr", value: 492 },
  { label: "May", value: 510 },
  { label: "Jun", value: 535 },
  { label: "Jul", value: 558 },
  { label: "Aug", value: 580 },
];

function DashboardPreview() {
  const maxVal = 620;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl overflow-hidden">
      {/* Fake header bar */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-3">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ background: "var(--color-org-muted)" }}
        >
          <BarChart3 size={12} style={{ color: "var(--color-org-primary)" }} />
        </div>
        <span className="text-white/60 text-xs font-medium">
          Analytics Overview
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400/80" />
          <span className="text-emerald-400/70 text-[10px]">Live</span>
        </div>
      </div>

      {/* Mini KPI cards */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              label: "Total Users",
              value: "2.8M",
              change: "+12%",
              color: "text-emerald-400",
            },
            {
              label: "Avg ARPU",
              value: "₹185",
              change: "+8.2%",
              color: "text-emerald-400",
            },
            {
              label: "States",
              value: "28",
              change: "Active",
              color: "text-blue-400",
            },
          ].map((kpi) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2.5"
            >
              <div className="text-white/40 text-[9px] uppercase tracking-wider mb-1">
                {kpi.label}
              </div>
              <div className="text-white text-sm font-bold">{kpi.value}</div>
              <div className={`${kpi.color} text-[9px] mt-0.5`}>
                {kpi.change}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/40 text-[9px] uppercase tracking-wider">
              Subscriber Growth
            </span>
            <span className="text-emerald-400 text-[9px] flex items-center gap-0.5">
              <TrendingUp size={8} /> +8.2%
            </span>
          </div>
          <div className="flex items-end gap-1 h-16">
            {CHART_DATA.map((d, i) => (
              <div
                key={d.label}
                className="flex-1 flex flex-col items-center gap-0.5"
              >
                <motion.div
                  className="w-full rounded-t-sm"
                  style={{
                    background: "var(--color-org-primary)",
                    opacity: 0.7,
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.value / maxVal) * 100}%` }}
                  transition={{
                    delay: 0.6 + i * 0.08,
                    duration: 0.5,
                    ease: "easeOut",
                  }}
                />
                <span className="text-white/20 text-[7px]">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fake data rows */}
        <div className="space-y-1">
          {[
            { state: "Maharashtra", operator: "Jio", subs: "128M" },
            { state: "Tamil Nadu", operator: "Airtel", subs: "94M" },
            { state: "Karnataka", operator: "Vi", subs: "67M" },
          ].map((row, i) => (
            <motion.div
              key={row.state}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + i * 0.1, duration: 0.3 }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/[0.02] border border-white/[0.03] text-[10px]"
            >
              <span className="text-white/60 flex-1">{row.state}</span>
              <span className="text-white/40">{row.operator}</span>
              <span
                className="font-medium"
                style={{ color: "var(--color-org-primary)" }}
              >
                {row.subs}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Animated counter ────────────────────────────────────────────────────── */
function AnimatedStat({
  value,
  label,
  delay,
}: {
  value: string;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="text-center lg:text-left"
    >
      <div className="text-3xl font-bold text-white font-inter tracking-tight">
        {value}
      </div>
      <div className="text-xs text-white/40 mt-1 uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  );
}

/* ─── Hero Section ────────────────────────────────────────────────────────── */
export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 dot-bg" />

      {/* Ambient glow — follows department theme */}
      <div
        className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full opacity-[0.07] pointer-events-none"
        style={{
          background: "var(--color-org-primary)",
          filter: "blur(120px)",
        }}
      />
      <div
        className="absolute bottom-[15%] right-[10%] w-[400px] h-[400px] rounded-full opacity-[0.04] pointer-events-none"
        style={{
          background: "var(--color-org-primary)",
          filter: "blur(100px)",
        }}
      />

      {/* Fade to background at bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12 items-center">
          {/* ─── Left: Copy ─── */}
          <div className="lg:col-span-3 text-center lg:text-left lg:pt-4">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-8"
              style={{
                border: "1px solid var(--color-org-border)",
                background: "var(--color-org-muted)",
                color: "var(--color-org-primary)",
              }}
            >
              <Sparkles size={13} className="animate-pulse" />
              <span className="font-medium">Powered by Google Gemini AI</span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.9] mb-6 font-inter"
            >
              <span className="text-white">Bharat</span>
              <span className="text-gradient">-Insight</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-white/40 font-light mb-4 leading-relaxed"
            >
              AI-Driven Data Intelligence Platform
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-base text-white/30 max-w-lg mb-10 leading-relaxed mx-auto lg:mx-0"
            >
              India's most advanced multi-tenant analytics platform. Analyze
              100,000+ government data points with real-time AI insights — built
              for speed, clarity, and decision-making.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link
                href="/dashboard"
                className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-300 hover:scale-[1.02] hover:opacity-90"
                style={{ background: "var(--color-org-primary)" }}
              >
                Launch Dashboard
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform duration-200"
                />
              </Link>
              {/* <button className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 text-lg">
                <Play size={16} className="text-blue-400" />
                Watch Demo
              </button> */}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex gap-8 lg:gap-12 mt-14 justify-center lg:justify-start"
            >
              <AnimatedStat value="100K+" label="Data Points" delay={0.7} />
              <div className="w-px h-12 bg-white/[0.08] self-center" />
              <AnimatedStat value="28+" label="States" delay={0.8} />
              <div className="w-px h-12 bg-white/[0.08] self-center hidden sm:block" />
              <AnimatedStat value="95+" label="Lighthouse" delay={0.9} />
            </motion.div>
          </div>

          {/* ─── Right: Dashboard Preview ─── */}
          {mounted && (
            <motion.div
              initial={{ opacity: 0, x: 50, rotateY: -5 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="lg:col-span-2 space-y-3"
              style={{ perspective: "1200px" }}
            >
              <DashboardPreview />
              <StreamingTerminal />

              {/* Floating badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="flex flex-wrap gap-2 justify-center lg:justify-start"
              >
                {[
                  { icon: Globe, text: "28 States", color: "text-blue-400" },
                  { icon: Zap, text: "Real-time AI", color: "text-amber-400" },
                  {
                    icon: Shield,
                    text: "RBAC Auth",
                    color: "text-emerald-400",
                  },
                  {
                    icon: Database,
                    text: "100K+ Rows",
                    color: "text-violet-400",
                  },
                ].map(({ icon: Icon, text, color }) => (
                  <div
                    key={text}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card text-white/50 text-xs hover:text-white/70 transition-colors cursor-default"
                  >
                    <Icon size={11} className={color} />
                    {text}
                  </div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-white/20 text-[10px] uppercase tracking-[0.2em]">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent"
        />
      </motion.div>
    </section>
  );
}
