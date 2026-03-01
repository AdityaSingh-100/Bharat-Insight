"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Github, Twitter, Linkedin, Mail, ExternalLink } from "lucide-react";

export function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* ─── CTA Block ──────────────────────────────────────────────── */}
      <div className="relative py-32">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] rounded-full bg-blue-600/[0.06] blur-[150px]" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-indigo-600/[0.04] blur-[100px]" />
        </div>
        <div className="absolute inset-0 dot-bg opacity-30" />

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/15 bg-blue-500/[0.06] text-blue-400 text-sm mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Open Source & Free
            </motion.div>

            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.05] font-inter tracking-tight">
              Ready to explore
              <br />
              <span className="text-gradient-animated">India&apos;s data?</span>
            </h2>
            <p className="text-white/35 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
              Launch the dashboard and start analyzing 100,000+ government data
              points with AI-powered insights — no setup required.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="group inline-flex items-center justify-center gap-2.5 px-10 py-4.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-lg transition-all duration-300 shadow-xl shadow-blue-600/20 hover:shadow-blue-500/30 hover:scale-[1.02]"
              >
                Launch Dashboard
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform duration-200"
                />
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-10 py-4.5 rounded-2xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 hover:bg-white/[0.04] font-semibold text-lg transition-all duration-300"
              >
                <Github size={18} />
                View Source
              </a>
            </div>

            {/* Tech stack badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-wrap gap-2 justify-center mt-12"
            >
              {[
                "Next.js 16",
                "TypeScript",
                "Tailwind v4",
                "Gemini AI",
                "Supabase",
                "TanStack",
                "Framer Motion",
              ].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 rounded-full text-xs text-white/30 border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] hover:text-white/40 transition-colors cursor-default"
                >
                  {tech}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ─── Footer ─────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Branding */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                  B
                </div>
                <span className="text-white font-bold text-lg tracking-tight">
                  Bharat<span className="text-blue-400">-Insight</span>
                </span>
              </div>
              <p className="text-white/30 text-sm leading-relaxed mb-5 max-w-xs">
                India's most advanced multi-tenant data intelligence platform,
                powered by Google Gemini AI.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { icon: Github, href: "https://github.com", label: "GitHub" },
                  { icon: Twitter, href: "#", label: "Twitter" },
                  { icon: Linkedin, href: "#", label: "LinkedIn" },
                  { icon: Mail, href: "mailto:contact@bharatinsight.dev", label: "Email" },
                ].map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] hover:border-white/10 transition-all duration-200"
                    aria-label={label}
                  >
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white/60 text-xs font-semibold uppercase tracking-[0.15em] mb-4">
                Product
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "AI Insights", href: "/dashboard" },
                  { label: "Data Grid", href: "/dashboard" },
                  { label: "Command Palette", href: "/dashboard" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/30 hover:text-white/60 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-white/60 text-xs font-semibold uppercase tracking-[0.15em] mb-4">
                Resources
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Documentation", href: "#" },
                  { label: "API Reference", href: "#" },
                  { label: "GitHub Repo", href: "https://github.com", external: true },
                  { label: "Release Notes", href: "#" },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-1 text-sm text-white/30 hover:text-white/60 transition-colors duration-200"
                    >
                      {link.label}
                      {link.external && <ExternalLink size={10} />}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white/60 text-xs font-semibold uppercase tracking-[0.15em] mb-4">
                Legal
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Privacy Policy", href: "#" },
                  { label: "Terms of Service", href: "#" },
                  { label: "Cookie Policy", href: "#" },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/30 hover:text-white/60 transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-white/20 text-sm">
              © 2026 Bharat-Insight — Built for Regrip India Pvt. Ltd.
            </div>
            <div className="flex items-center gap-3 text-white/20 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
                All systems operational
              </span>
              <span>·</span>
              <span>v0.2.0</span>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}
