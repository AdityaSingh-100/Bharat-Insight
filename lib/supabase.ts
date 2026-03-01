import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL is not set. Add it to your .env file and restart the dev server.",
  );
}
if (!supabaseAnonKey) {
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

// Use the stable app URL from env so the port never mismatches what Supabase allows.
// Falls back to window.location.origin only if the env var is missing.
function appOrigin() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    window.location.origin
  );
}

// ── OAuth ──────────────────────────────────────────────────────────────────────
export async function signInWithGoogle(next = "/dashboard") {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${appOrigin()}/auth/callback?next=${encodeURIComponent(next)}`,
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
  const redirectTo = `${appOrigin()}/auth/callback?next=/dashboard`;

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
    redirectTo: `${appOrigin()}/auth/callback?type=recovery`,
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
