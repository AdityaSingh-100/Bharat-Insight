"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  resetPassword,
  getSession,
} from "@/lib/supabase";

/* ─── tiny input wrapper ────────────────────────────────────────────────────── */
function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  autoComplete,
  rightSlot,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon: React.ElementType;
  autoComplete?: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        className="text-xs font-medium"
        style={{ color: "rgb(255 255 255 / 0.5)" }}
      >
        {label}
      </label>
      <div className="relative">
        <Icon
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "rgb(255 255 255 / 0.3)" }}
        />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none transition-all"
          style={{
            background: "rgb(255 255 255 / 0.05)",
            border: "1px solid rgb(255 255 255 / 0.1)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "hsl(217 91% 60%)")}
          onBlur={(e) =>
            (e.target.style.borderColor = "rgb(255 255 255 / 0.1)")
          }
        />
        {rightSlot && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            {rightSlot}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Google button ─────────────────────────────────────────────────────────── */
function GoogleButton({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-60"
      style={{
        background: "rgb(255 255 255 / 0.07)",
        border: "1px solid rgb(255 255 255 / 0.12)",
      }}
      onMouseEnter={(e) =>
        !loading &&
        (e.currentTarget.style.background = "rgb(255 255 255 / 0.11)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = "rgb(255 255 255 / 0.07)")
      }
    >
      {loading ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24">
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
      {loading ? "Redirecting…" : "Continue with Google"}
    </button>
  );
}

/* ─── divider ───────────────────────────────────────────────────────────────── */
function Divider() {
  return (
    <div className="flex items-center gap-3 my-4">
      <div
        className="flex-1 h-px"
        style={{ background: "rgb(255 255 255 / 0.08)" }}
      />
      <span className="text-xs" style={{ color: "rgb(255 255 255 / 0.3)" }}>
        or
      </span>
      <div
        className="flex-1 h-px"
        style={{ background: "rgb(255 255 255 / 0.08)" }}
      />
    </div>
  );
}

/* ─── status banner ─────────────────────────────────────────────────────────── */
function StatusBanner({
  type,
  message,
}: {
  type: "error" | "success";
  message: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2 p-3 rounded-xl text-xs"
      style={{
        background:
          type === "error" ? "rgb(239 68 68 / 0.1)" : "rgb(52 211 153 / 0.1)",
        border: `1px solid ${type === "error" ? "rgb(239 68 68 / 0.25)" : "rgb(52 211 153 / 0.25)"}`,
        color: type === "error" ? "#f87171" : "#6ee7b7",
      }}
    >
      {type === "error" ? (
        <AlertCircle size={13} className="mt-0.5 shrink-0" />
      ) : (
        <CheckCircle2 size={13} className="mt-0.5 shrink-0" />
      )}
      {message}
    </motion.div>
  );
}

/* ─── main page ─────────────────────────────────────────────────────────────── */
type Tab = "signin" | "signup" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const urlError = searchParams.get("error");

  const [tab, setTab] = useState<Tab>("signin");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "error" | "success";
    msg: string;
  } | null>(
    urlError
      ? { type: "error", msg: "Authentication failed. Please try again." }
      : null,
  );

  // Sign-in fields
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [siShowPw, setSiShowPw] = useState(false);

  // Sign-up fields
  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suShowPw, setSuShowPw] = useState(false);
  const [suRole, setSuRole] = useState<"admin" | "viewer">("viewer");

  // Forgot password
  const [fpEmail, setFpEmail] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    getSession().then((s) => {
      if (s) router.replace(redirect);
    });
  }, [redirect, router]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setStatus(null);
    try {
      await signInWithGoogle(redirect);
    } catch (e) {
      setStatus({
        type: "error",
        msg: e instanceof Error ? e.message : "Google sign-in failed",
      });
      setGoogleLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siEmail || !siPassword) return;
    setLoading(true);
    setStatus(null);
    try {
      await signInWithEmail(siEmail, siPassword);
      router.replace(redirect);
    } catch (err) {
      setStatus({
        type: "error",
        msg: err instanceof Error ? err.message : "Sign-in failed",
      });
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suEmail || !suPassword) return;
    setLoading(true);
    setStatus(null);
    try {
      const result = await signUpWithEmail(suEmail, suPassword, {
        fullName: suName,
        role: suRole,
      });
      if (result.user && !result.session) {
        setStatus({
          type: "success",
          msg: "Check your inbox — we sent a confirmation link.",
        });
      } else {
        router.replace(redirect);
      }
    } catch (err) {
      setStatus({
        type: "error",
        msg: err instanceof Error ? err.message : "Sign-up failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fpEmail) return;
    setLoading(true);
    setStatus(null);
    try {
      await resetPassword(fpEmail);
      setStatus({
        type: "success",
        msg: "Password reset email sent — check your inbox.",
      });
    } catch (err) {
      setStatus({
        type: "error",
        msg: err instanceof Error ? err.message : "Reset failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "hsl(224 71% 4%)" }}
    >
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-[0.06]"
          style={{ background: "hsl(217 91% 60%)", filter: "blur(120px)" }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-[0.04]"
          style={{ background: "hsl(280 65% 60%)", filter: "blur(100px)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-7">
          <Link
            href="/"
            className="inline-flex flex-col items-center gap-3 group"
          >
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
              style={{
                background: "hsl(217 91% 60% / 0.12)",
                border: "1px solid hsl(217 91% 60% / 0.25)",
              }}
            >
              <Shield size={20} style={{ color: "hsl(217 91% 60%)" }} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Bharat
                <span style={{ color: "hsl(217 91% 60%)" }}>-Insight</span>
              </h1>
              <p
                className="text-xs mt-0.5"
                style={{ color: "rgb(255 255 255 / 0.4)" }}
              >
                AI-Driven Data Intelligence Platform
              </p>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "hsl(224 71% 6%)",
            border: "1px solid rgb(255 255 255 / 0.08)",
            boxShadow: "0 24px 80px rgb(0 0 0 / 0.5)",
          }}
        >
          {/* Tabs */}
          {tab !== "forgot" && (
            <div
              className="flex"
              style={{ borderBottom: "1px solid rgb(255 255 255 / 0.07)" }}
            >
              {(["signin", "signup"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setStatus(null);
                  }}
                  className="flex-1 py-3 text-xs font-medium tracking-wide uppercase transition-all"
                  style={{
                    color: tab === t ? "white" : "rgb(255 255 255 / 0.35)",
                    borderBottom:
                      tab === t
                        ? "2px solid hsl(217 91% 60%)"
                        : "2px solid transparent",
                    background:
                      tab === t ? "rgb(255 255 255 / 0.02)" : "transparent",
                  }}
                >
                  {t === "signin" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>
          )}

          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* ── Sign In ── */}
              {tab === "signin" && (
                <motion.form
                  key="signin"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleEmailSignIn}
                  className="space-y-4"
                >
                  {status && (
                    <StatusBanner type={status.type} message={status.msg} />
                  )}

                  <Field
                    label="Email address"
                    type="email"
                    value={siEmail}
                    onChange={setSiEmail}
                    placeholder="you@example.com"
                    icon={Mail}
                    autoComplete="email"
                  />
                  <Field
                    label="Password"
                    type={siShowPw ? "text" : "password"}
                    value={siPassword}
                    onChange={setSiPassword}
                    placeholder="••••••••"
                    icon={Lock}
                    autoComplete="current-password"
                    rightSlot={
                      <button
                        type="button"
                        onClick={() => setSiShowPw((v) => !v)}
                        style={{ color: "rgb(255 255 255 / 0.35)" }}
                      >
                        {siShowPw ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    }
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setFpEmail(siEmail);
                        setTab("forgot");
                        setStatus(null);
                      }}
                      className="text-xs transition-colors"
                      style={{ color: "rgb(255 255 255 / 0.35)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "hsl(217 91% 60%)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color =
                          "rgb(255 255 255 / 0.35)")
                      }
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !siEmail || !siPassword}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                    style={{ background: "hsl(217 91% 55%)" }}
                    onMouseEnter={(e) =>
                      !loading &&
                      (e.currentTarget.style.background = "hsl(217 91% 60%)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "hsl(217 91% 55%)")
                    }
                  >
                    {loading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <ArrowRight size={14} />
                    )}
                    {loading ? "Signing in…" : "Sign In"}
                  </button>

                  <Divider />
                  <GoogleButton
                    onClick={handleGoogleSignIn}
                    loading={googleLoading}
                  />
                </motion.form>
              )}

              {/* ── Sign Up ── */}
              {tab === "signup" && (
                <motion.form
                  key="signup"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSignUp}
                  className="space-y-4"
                >
                  {status && (
                    <StatusBanner type={status.type} message={status.msg} />
                  )}

                  <Field
                    label="Full name"
                    value={suName}
                    onChange={setSuName}
                    placeholder="Sanjay Mehta"
                    icon={User}
                    autoComplete="name"
                  />
                  <Field
                    label="Email address"
                    type="email"
                    value={suEmail}
                    onChange={setSuEmail}
                    placeholder="you@example.com"
                    icon={Mail}
                    autoComplete="email"
                  />
                  <Field
                    label="Password"
                    type={suShowPw ? "text" : "password"}
                    value={suPassword}
                    onChange={setSuPassword}
                    placeholder="Min. 6 characters"
                    icon={Lock}
                    autoComplete="new-password"
                    rightSlot={
                      <button
                        type="button"
                        onClick={() => setSuShowPw((v) => !v)}
                        style={{ color: "rgb(255 255 255 / 0.35)" }}
                      >
                        {suShowPw ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    }
                  />

                  {/* Role selector */}
                  <div className="space-y-1.5">
                    <span
                      className="text-xs font-medium"
                      style={{ color: "rgb(255 255 255 / 0.5)" }}
                    >
                      Access level
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {(["admin", "viewer"] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setSuRole(r)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
                          style={{
                            background:
                              suRole === r
                                ? "hsl(217 91% 60% / 0.12)"
                                : "rgb(255 255 255 / 0.04)",
                            border:
                              suRole === r
                                ? "1px solid hsl(217 91% 60% / 0.35)"
                                : "1px solid rgb(255 255 255 / 0.08)",
                            color:
                              suRole === r
                                ? "hsl(217 91% 70%)"
                                : "rgb(255 255 255 / 0.45)",
                          }}
                        >
                          {r === "admin" ? (
                            <Shield size={12} />
                          ) : (
                            <Eye size={12} />
                          )}
                          <div className="text-left">
                            <div className="font-semibold capitalize">{r}</div>
                            <div className="text-[10px] opacity-70 mt-0.5">
                              {r === "admin" ? "Edit & delete" : "Read-only"}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !suEmail || !suPassword}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                    style={{ background: "hsl(217 91% 55%)" }}
                    onMouseEnter={(e) =>
                      !loading &&
                      (e.currentTarget.style.background = "hsl(217 91% 60%)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "hsl(217 91% 55%)")
                    }
                  >
                    {loading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <ArrowRight size={14} />
                    )}
                    {loading ? "Creating account…" : "Create Account"}
                  </button>

                  <Divider />
                  <GoogleButton
                    onClick={handleGoogleSignIn}
                    loading={googleLoading}
                  />
                </motion.form>
              )}

              {/* ── Forgot Password ── */}
              {tab === "forgot" && (
                <motion.form
                  key="forgot"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleForgotPassword}
                  className="space-y-4"
                >
                  <div className="text-center mb-2">
                    <div
                      className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3"
                      style={{
                        background: "rgb(255 255 255 / 0.05)",
                        border: "1px solid rgb(255 255 255 / 0.1)",
                      }}
                    >
                      <RotateCcw
                        size={16}
                        style={{ color: "rgb(255 255 255 / 0.6)" }}
                      />
                    </div>
                    <h2 className="text-sm font-semibold text-white">
                      Reset your password
                    </h2>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "rgb(255 255 255 / 0.4)" }}
                    >
                      Enter your email and we'll send a reset link
                    </p>
                  </div>

                  {status && (
                    <StatusBanner type={status.type} message={status.msg} />
                  )}

                  <Field
                    label="Email address"
                    type="email"
                    value={fpEmail}
                    onChange={setFpEmail}
                    placeholder="you@example.com"
                    icon={Mail}
                    autoComplete="email"
                  />

                  <button
                    type="submit"
                    disabled={loading || !fpEmail}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                    style={{ background: "hsl(217 91% 55%)" }}
                    onMouseEnter={(e) =>
                      !loading &&
                      (e.currentTarget.style.background = "hsl(217 91% 60%)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "hsl(217 91% 55%)")
                    }
                  >
                    {loading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <ArrowRight size={14} />
                    )}
                    {loading ? "Sending…" : "Send Reset Link"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTab("signin");
                      setStatus(null);
                    }}
                    className="w-full text-xs py-1.5 transition-colors"
                    style={{ color: "rgb(255 255 255 / 0.35)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "white")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgb(255 255 255 / 0.35)")
                    }
                  >
                    ← Back to sign in
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RBAC info callout */}
        <div
          className="mt-4 rounded-xl p-3.5 text-xs space-y-2"
          style={{
            background: "rgb(255 255 255 / 0.03)",
            border: "1px solid rgb(255 255 255 / 0.07)",
          }}
        >
          <p
            className="font-medium uppercase tracking-wider text-[10px]"
            style={{ color: "rgb(255 255 255 / 0.4)" }}
          >
            How roles work
          </p>
          <div className="flex items-start gap-2">
            <Shield
              size={11}
              className="mt-0.5 shrink-0"
              style={{ color: "hsl(217 91% 60%)" }}
            />
            <span style={{ color: "rgb(255 255 255 / 0.45)" }}>
              <span className="text-white/70 font-medium">Admin</span> — full
              access: view, edit, delete rows and export CSV
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Eye
              size={11}
              className="mt-0.5 shrink-0"
              style={{ color: "rgb(255 255 255 / 0.4)" }}
            />
            <span style={{ color: "rgb(255 255 255 / 0.45)" }}>
              <span className="text-white/70 font-medium">Viewer</span> —
              read-only: browse, search, export CSV and AI insights (no
              edit/delete)
            </span>
          </div>
          <p
            className="text-[10px] pt-1"
            style={{ color: "rgb(255 255 255 / 0.25)" }}
          >
            Role is stored in your Supabase auth metadata and synced on every
            sign-in.
          </p>
        </div>

        <p
          className="mt-4 text-center text-[11px]"
          style={{ color: "rgb(255 255 255 / 0.2)" }}
        >
          Bharat-Insight · Powered by Gemini AI
        </p>
      </motion.div>
    </div>
  );
}
