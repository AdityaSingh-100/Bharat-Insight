"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Github, ExternalLink } from "lucide-react";

export function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-blue-600/8 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight font-inter">
            Ready to explore
            <br />
            <span className="text-gradient">India's data?</span>
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
            Launch the dashboard and start analyzing 100,000+ government data
            points with AI-powered insights — no setup required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg transition-all duration-200 hover:shadow-[0_0_40px_hsl(217,91%,60%,0.5)]"
            >
              Launch Dashboard
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl border border-white/15 text-white/70 hover:text-white hover:border-white/30 font-semibold text-lg transition-all duration-200 glass"
            >
              <Github size={18} />
              View Source
            </a>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mt-24 pt-8 border-t border-white/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white/30 text-sm">
            © 2024 Bharat-Insight — Built for Regrip India Pvt. Ltd.
          </div>
          <div className="flex items-center gap-6 text-white/30 text-sm">
            <span>Next.js 14 · TypeScript · Tailwind CSS</span>
            <span>·</span>
            <span>Gemini AI · Supabase</span>
          </div>
        </div>
      </div>
    </section>
  );
}
