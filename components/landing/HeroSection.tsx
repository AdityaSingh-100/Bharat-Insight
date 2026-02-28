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
} from "lucide-react";

const STREAMING_TEXTS = [
  "Analyzing 2.8M telecom records across 28 states...",
  "Detected anomaly: Call drop rate ↑ 12% in Maharashtra Q3 2024",
  "AI Insight: BharatNet coverage correlates with 23% ARPU growth",
  "Streaming real-time insights from Gemini AI...",
  "Multi-tenant switch: Ministry of Electronics & IT activated",
];

const CHART_DATA = [
  { label: "Jan", jio: 420, airtel: 280, vi: 180 },
  { label: "Feb", jio: 445, airtel: 295, vi: 165 },
  { label: "Mar", jio: 468, airtel: 310, vi: 172 },
  { label: "Apr", jio: 492, airtel: 325, vi: 158 },
  { label: "May", jio: 510, airtel: 340, vi: 170 },
  { label: "Jun", jio: 535, airtel: 358, vi: 162 },
  { label: "Jul", jio: 558, airtel: 372, vi: 155 },
];

function StreamingText() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const target = STREAMING_TEXTS[currentIndex];
    if (charIndex < target.length) {
      const timer = setTimeout(() => {
        setDisplayText(target.slice(0, charIndex + 1));
        setCharIndex((c) => c + 1);
      }, 28);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setCurrentIndex((i) => (i + 1) % STREAMING_TEXTS.length);
        setDisplayText("");
        setCharIndex(0);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [charIndex, currentIndex]);

  return (
    <div className="relative rounded-xl border border-white/10 bg-black/40 backdrop-blur-md p-4 font-mono text-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <div className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-2 text-white/40 text-xs">gemini-insight.live</span>
      </div>
      <div className="text-emerald-400/90 min-h-[3rem] flex items-start gap-2">
        <span className="text-white/40 shrink-0">▶</span>
        <span>
          {displayText}
          <span className="inline-block w-0.5 h-4 bg-emerald-400 ml-0.5 animate-pulse align-middle" />
        </span>
      </div>
    </div>
  );
}

function MiniBarChart() {
  const maxVal = 600;
  return (
    <div className="relative rounded-xl border border-white/10 bg-black/40 backdrop-blur-md p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white/60 text-xs font-mono">
          Subscriber Growth (Millions)
        </span>
        <span className="text-emerald-400 text-xs flex items-center gap-1">
          <TrendingUp size={10} /> +8.2%
        </span>
      </div>
      <div className="flex items-end gap-1.5 h-20">
        {CHART_DATA.map((d, i) => (
          <div
            key={d.label}
            className="flex-1 flex flex-col items-center gap-0.5"
          >
            <motion.div
              className="w-full rounded-t-sm"
              style={{ background: "hsl(217, 91%, 60%)" }}
              initial={{ height: 0 }}
              animate={{ height: `${(d.jio / maxVal) * 100}%` }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
            />
            <span className="text-white/30 text-[8px]">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-[120px] animate-pulse-slow" />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-indigo-600/10 blur-[120px] animate-pulse-slow"
          style={{ animationDelay: "1.5s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-950/20 blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 flex flex-col lg:flex-row items-center gap-16">
        {/* Left: Copy */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm mb-6"
          >
            <Sparkles size={14} />
            <span>Powered by Google Gemini AI</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-none mb-6 font-inter"
          >
            <span className="text-white">Bharat</span>
            <span className="text-gradient">-Insight</span>
            <br />
            <span className="text-white/80 text-3xl md:text-4xl font-light mt-2 block">
              AI-Driven Data Platform
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-white/50 max-w-lg mb-8 leading-relaxed"
          >
            India's most advanced multi-tenant analytics platform. Analyze
            100,000+ government data points with streaming AI insights — built
            for speed, clarity, and decision-making.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all duration-200 hover:shadow-[0_0_30px_hsl(217,91%,60%,0.4)] animate-glow"
            >
              Launch Dashboard
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/15 text-white/70 hover:text-white hover:border-white/30 transition-all duration-200 glass">
              <Activity size={16} />
              View Demo
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex gap-8 mt-12 justify-center lg:justify-start"
          >
            {[
              { label: "Data Points", value: "100K+" },
              { label: "States", value: "28+" },
              { label: "Ministries", value: "2" },
              { label: "Lighthouse", value: "95+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center lg:text-left">
                <div className="text-2xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Interactive Preview */}
        {mounted && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex-1 w-full max-w-lg space-y-4"
          >
            <StreamingText />
            <MiniBarChart />

            {/* Floating badges */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: Globe, text: "28 States" },
                { icon: Zap, text: "Real-time" },
                { icon: Activity, text: "TRAI Data" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-white/10 text-white/60 text-xs"
                >
                  <Icon size={11} />
                  {text}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-white/30 text-xs">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent"
        />
      </motion.div>
    </section>
  );
}
