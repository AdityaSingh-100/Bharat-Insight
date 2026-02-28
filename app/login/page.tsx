"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { LogIn, Loader2, Shield } from "lucide-react";
import { signInWithGoogle, getSession } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  // If already logged in, redirect
  useEffect(() => {
    getSession().then((session) => {
      if (session) router.replace(redirect);
    });
  }, [redirect, router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle(redirect);
      // OAuth redirect handled by Supabase
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--color-background)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
            style={{
              background: "var(--color-org-muted)",
              border: "1px solid var(--color-org-border)",
            }}
          >
            <Shield size={22} style={{ color: "var(--color-org-primary)" }} />
          </div>
          <h1 className="text-xl font-semibold text-white">Bharat-Insight</h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Sign in to access the analytics platform
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "hsl(224 71% 6%)",
            border: "1px solid var(--color-border)",
          }}
        >
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl text-sm font-medium text-white transition-all"
            style={{
              background: isLoading
                ? "rgb(255 255 255 / 0.05)"
                : "rgb(255 255 255 / 0.08)",
              border: "1px solid var(--color-border)",
            }}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            {isLoading ? "Signing in..." : "Continue with Google"}
          </button>

          {error && (
            <p className="mt-3 text-xs text-center text-red-400">{error}</p>
          )}

          <p
            className="mt-4 text-center text-xs"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Accessing this platform requires authentication.
            <br />
            Your data is processed locally and securely.
          </p>
        </div>

        <p
          className="mt-4 text-center text-xs"
          style={{ color: "rgb(255 255 255 / 0.2)" }}
        >
          Bharat-Insight · Powered by Gemini AI
        </p>
      </motion.div>
    </div>
  );
}
