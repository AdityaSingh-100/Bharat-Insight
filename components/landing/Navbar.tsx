"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Github, Menu, X } from "lucide-react";
import { useOrgStore, ORG_CONFIGS } from "@/store/useOrgStore";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Dashboard", href: "/dashboard" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentOrg } = useOrgStore();

  // Sync org theme class onto <html>
  useEffect(() => {
    const allClasses = Object.values(ORG_CONFIGS)
      .map((o) => o.themeClass)
      .filter(Boolean);
    document.documentElement.classList.remove(...allClasses);
    const themeClass = ORG_CONFIGS[currentOrg]?.themeClass;
    if (themeClass) document.documentElement.classList.add(themeClass);
  }, [currentOrg]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/60 backdrop-blur-2xl border-b border-white/5 shadow-2xl shadow-black/20"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo2.png"
            alt="Bharat-Insight"
            width={44}
            height={44}
            className="rounded-xl group-hover:opacity-90 transition-opacity drop-shadow-[0_0_10px_rgba(56,189,248,0.35)]"
          />
          <span className="text-white font-bold text-lg tracking-tight">
            Bharat
            <span style={{ color: "var(--color-org-primary)" }}>-Insight</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="px-4 py-2 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200 flex items-center gap-1.5"
          >
            <Github size={14} />
            GitHub
          </a>
        </div>

        {/* CTA + Mobile */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden md:inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-300 shadow-lg hover:opacity-90 hover:scale-[1.02]"
            style={{ background: "var(--color-org-primary)" }}
          >
            Launch App
            <ArrowRight size={14} />
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-white/5 bg-black/80 backdrop-blur-2xl"
        >
          <div className="px-6 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-sm font-semibold text-blue-400 rounded-lg hover:bg-blue-500/10 transition-colors"
            >
              Launch Dashboard →
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
