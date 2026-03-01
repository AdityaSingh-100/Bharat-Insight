import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl ="https://gzeucfosclpdubaxxbmk.supabase.co";
const supabaseAnonKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZXVjZm9zY2xwZHViYXh4Ym1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTk5MDcsImV4cCI6MjA4Nzg3NTkwN30.2f3qRZuioOENp9DPFmL-TsL3iGPL1eKwxicgSR21En0";

if (!supabaseUrl || supabaseUrl === "https://placeholder.supabase.co") {
  throw new Error(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL is not set. Add it to your .env file and restart the dev server.",
  );
}
if (!supabaseAnonKey || supabaseAnonKey === "placeholder-key") {
  throw new Error(
    "[supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Add it to your .env file and restart the dev server.",
  );
}

// Browser client — safe to use in Client Components
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export type AuthUser = {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    role?: "admin" | "viewer";
  };
};

// ── OAuth ──────────────────────────────────────────────────────────────────────
export async function signInWithGoogle(next = "/dashboard") {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) throw error;
}

// ── Email / Password ───────────────────────────────────────────────────────────
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.session;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  options?: { fullName?: string; role?: "admin" | "viewer" },
) {
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=/dashboard`
      : undefined;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        full_name: options?.fullName ?? "",
        role: options?.role ?? "viewer",
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
  });
  if (error) throw error;
}

// ── Session / Sign-out ─────────────────────────────────────────────────────────
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}
