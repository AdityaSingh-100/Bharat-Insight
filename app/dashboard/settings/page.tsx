"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrgStore, ORG_CONFIGS } from "@/store/useOrgStore";
import { useDatasetStore } from "@/store/useDatasetStore";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { supabase, signOut } from "@/lib/supabase";
import {
  Settings,
  User,
  Building2,
  Lock,
  Eye,
  Shield,
  LogOut,
  Database,
  Palette,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// ─── Section wrapper ───────────────────────────────────────────────────────────
function SettingsSection({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-6"
      style={{
        background:
          "linear-gradient(135deg, rgb(255 255 255 / 0.04) 0%, rgb(255 255 255 / 0.015) 100%)",
        border: "1px solid rgb(255 255 255 / 0.07)",
      }}
    >
      <div className="flex items-start gap-3 mb-5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "var(--color-org-muted)",
            border: "1px solid var(--color-org-border)",
          }}
        >
          <Icon size={16} style={{ color: "var(--color-org-primary)" }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {subtitle && (
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div
        className="border-t pt-5"
        style={{ borderColor: "rgb(255 255 255 / 0.05)" }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Settings Page ─────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter();
  const { currentOrg, role, setOrg, setRole, syncRoleFromAuth } = useOrgStore();
  const { availableFiles, activeFile, loadFile, fetchAvailableFiles } =
    useDatasetStore();

  const [authUser, setAuthUser] = useState<{
    email?: string;
    name?: string;
    avatar?: string;
  } | null>(null);
  const [orgSwitchMsg, setOrgSwitchMsg] = useState<string | null>(null);

  // Sync auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthUser({
          email: session.user.email ?? undefined,
          name: session.user.user_metadata?.full_name ?? undefined,
          avatar: session.user.user_metadata?.avatar_url ?? undefined,
        });
        syncRoleFromAuth(
          session.user.user_metadata?.role as string | undefined,
        );
      }
    });
  }, [syncRoleFromAuth]);

  // Apply org theme
  useEffect(() => {
    const orgConfig = ORG_CONFIGS[currentOrg];
    document.documentElement.classList.remove("org-meity", "org-agriculture");
    if (orgConfig.themeClass)
      document.documentElement.classList.add(orgConfig.themeClass);
  }, [currentOrg]);

  // Fetch available datasets on mount
  useEffect(() => {
    fetchAvailableFiles();
  }, [fetchAvailableFiles]);

  const orgConfig = ORG_CONFIGS[currentOrg];

  const handleOrgSwitch = (orgId: typeof currentOrg) => {
    setOrg(orgId);
    setOrgSwitchMsg(`Switched to ${ORG_CONFIGS[orgId].name}`);
    setTimeout(() => setOrgSwitchMsg(null), 2500);
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-background)" }}
    >
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full"
          style={{
            background: "var(--color-org-primary)",
            opacity: 0.04,
            filter: "blur(130px)",
          }}
        />
      </div>

      <Sidebar />

      <div className="lg:pl-60 md:pl-16 pl-12">
        <DashboardHeader />

        <main className="pt-14">
          <div className="p-5 max-w-4xl">
            {/* Page title */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "var(--color-org-muted)",
                  border: "1px solid var(--color-org-border)",
                }}
              >
                <Settings
                  size={18}
                  style={{ color: "var(--color-org-primary)" }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Settings</h1>
                <p
                  className="text-xs"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  Manage your account, organisation and security preferences
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* ── Account ── */}
              <SettingsSection
                icon={User}
                title="Account"
                subtitle="Your authentication and profile information"
              >
                {authUser ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      {authUser.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={authUser.avatar}
                          alt="avatar"
                          className="w-12 h-12 rounded-full ring-2 ring-white/10"
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                          style={{
                            background: "var(--color-org-muted)",
                            color: "var(--color-org-primary)",
                          }}
                        >
                          {(authUser.name ??
                            authUser.email ??
                            "?")[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        {authUser.name && (
                          <div className="text-base font-semibold text-white">
                            {authUser.name}
                          </div>
                        )}
                        <div
                          className="text-sm"
                          style={{ color: "var(--color-muted-foreground)" }}
                        >
                          {authUser.email}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <CheckCircle2
                            size={11}
                            className="text-emerald-400"
                          />
                          <span className="text-xs text-emerald-400">
                            Verified via Google OAuth
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className="rounded-lg px-4 py-3 text-xs space-y-1"
                      style={{
                        background: "rgb(255 255 255 / 0.03)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-muted-foreground)",
                      }}
                    >
                      <div className="flex justify-between">
                        <span>Provider</span>
                        <span className="text-white/60">
                          Supabase Google OAuth
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>MFA</span>
                        <span className="text-white/60">Not configured</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Session</span>
                        <span className="text-emerald-400">Active</span>
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        await signOut();
                        router.push("/");
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: "rgb(239 68 68 / 0.08)",
                        border: "1px solid rgb(239 68 68 / 0.2)",
                        color: "rgb(248 113 113)",
                      }}
                    >
                      <LogOut size={13} />
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      size={15}
                      className="text-amber-400 mt-0.5 shrink-0"
                    />
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      Running in demo mode. Sign in via the landing page to link
                      your Google account and unlock role-based access.
                    </p>
                  </div>
                )}
              </SettingsSection>

              {/* ── Organisation ── */}
              <SettingsSection
                icon={Building2}
                title="Organisation"
                subtitle="Switch the active ministry / department context"
              >
                <div className="space-y-3">
                  {/* Active org display */}
                  <div
                    className="flex items-center gap-3 rounded-lg px-4 py-3"
                    style={{
                      background: "var(--color-org-muted)",
                      border: "1px solid var(--color-org-border)",
                    }}
                  >
                    <orgConfig.icon
                      size={22}
                      style={{ color: "var(--color-org-primary)" }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white">
                        {orgConfig.name}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        {orgConfig.description} · Dataset:{" "}
                        <code className="text-white/50">
                          {orgConfig.defaultDataset}
                        </code>
                      </div>
                    </div>
                    <CheckCircle2
                      size={14}
                      style={{ color: "var(--color-org-primary)" }}
                    />
                  </div>

                  {/* Switch buttons for other orgs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.values(ORG_CONFIGS)
                      .filter((o) => o.id !== currentOrg)
                      .map((o) => (
                        <button
                          key={o.id}
                          onClick={() => handleOrgSwitch(o.id)}
                          className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-all"
                          style={{
                            background: "rgb(255 255 255 / 0.03)",
                            border: "1px solid var(--color-border)",
                            color: "var(--color-muted-foreground)",
                          }}
                          onMouseEnter={(e) => {
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.background = "rgb(255 255 255 / 0.06)";
                            (e.currentTarget as HTMLButtonElement).style.color =
                              "#fff";
                          }}
                          onMouseLeave={(e) => {
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.background = "rgb(255 255 255 / 0.03)";
                            (e.currentTarget as HTMLButtonElement).style.color =
                              "var(--color-muted-foreground)";
                          }}
                        >
                          <o.icon
                            size={18}
                            style={{ color: "var(--color-muted-foreground)" }}
                          />
                          <span>{o.name}</span>
                        </button>
                      ))}
                  </div>

                  {orgSwitchMsg && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400">
                      <CheckCircle2 size={12} />
                      {orgSwitchMsg}
                    </div>
                  )}
                </div>
              </SettingsSection>

              {/* ── Dataset ── */}
              <SettingsSection
                icon={Database}
                title="Dataset"
                subtitle="Switch or refresh the currently loaded CSV dataset"
              >
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableFiles.map((file) => (
                      <button
                        key={file}
                        onClick={() => loadFile(file)}
                        className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg text-sm transition-all"
                        style={{
                          background:
                            activeFile === file
                              ? "var(--color-org-muted)"
                              : "rgb(255 255 255 / 0.03)",
                          border:
                            activeFile === file
                              ? "1px solid var(--color-org-border)"
                              : "1px solid var(--color-border)",
                          color:
                            activeFile === file
                              ? "var(--color-org-primary)"
                              : "var(--color-muted-foreground)",
                        }}
                      >
                        <span className="truncate">{file}</span>
                        {activeFile === file && <CheckCircle2 size={13} />}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={fetchAvailableFiles}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all"
                    style={{
                      background: "rgb(255 255 255 / 0.03)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-muted-foreground)",
                    }}
                  >
                    <RefreshCw size={11} />
                    Refresh dataset list
                  </button>
                </div>
              </SettingsSection>

              {/* ── Security / Access ── */}
              <SettingsSection
                icon={Lock}
                title="Security & Access"
                subtitle="Role-based access control for the current session"
              >
                <div className="space-y-4">
                  {/* Current role */}
                  <div className="flex items-center gap-3">
                    {role === "admin" ? (
                      <Shield
                        size={18}
                        style={{ color: "var(--color-org-primary)" }}
                      />
                    ) : (
                      <Eye
                        size={18}
                        style={{ color: "var(--color-muted-foreground)" }}
                      />
                    )}
                    <div>
                      <div className="text-sm font-semibold text-white capitalize">
                        {role}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        {role === "admin"
                          ? "Full access — can edit and delete rows in the data grid"
                          : "Read-only access — contact your admin to request elevation"}
                      </div>
                    </div>
                    <span
                      className="ml-auto text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{
                        background:
                          role === "admin"
                            ? "var(--color-org-muted)"
                            : "rgb(255 255 255 / 0.06)",
                        color:
                          role === "admin"
                            ? "var(--color-org-primary)"
                            : "var(--color-muted-foreground)",
                      }}
                    >
                      {role === "admin" ? "Full access" : "Read-only"}
                    </span>
                  </div>

                  {/* Role toggle (dev/demo convenience) */}
                  <div
                    className="rounded-lg p-3 space-y-2"
                    style={{
                      background: "rgb(255 255 255 / 0.025)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                      Demo role override
                    </p>
                    <div className="flex gap-2">
                      {(["admin", "viewer"] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => setRole(r)}
                          className="px-4 py-2 rounded-lg text-xs font-medium capitalize transition-all"
                          style={{
                            background:
                              role === r
                                ? "var(--color-org-muted)"
                                : "rgb(255 255 255 / 0.03)",
                            border:
                              role === r
                                ? "1px solid var(--color-org-border)"
                                : "1px solid var(--color-border)",
                            color:
                              role === r
                                ? "var(--color-org-primary)"
                                : "var(--color-muted-foreground)",
                          }}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div
                    className="text-xs rounded-lg px-3 py-2"
                    style={{
                      background: "rgb(255 255 255 / 0.02)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-muted-foreground)",
                    }}
                  >
                    🔐 Auth: Supabase Google OAuth · MFA: not configured
                  </div>
                </div>
              </SettingsSection>

              {/* ── Appearance ── */}
              <SettingsSection
                icon={Palette}
                title="Appearance"
                subtitle="Theme is automatically derived from the active organisation"
              >
                <div className="flex flex-wrap gap-3">
                  {Object.values(ORG_CONFIGS).map((o) => (
                    <button
                      key={o.id}
                      onClick={() => handleOrgSwitch(o.id)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all"
                      style={{
                        background:
                          currentOrg === o.id
                            ? "var(--color-org-muted)"
                            : "rgb(255 255 255 / 0.03)",
                        border:
                          currentOrg === o.id
                            ? "1px solid var(--color-org-border)"
                            : "1px solid var(--color-border)",
                        color:
                          currentOrg === o.id
                            ? "var(--color-org-primary)"
                            : "var(--color-muted-foreground)",
                      }}
                    >
                      <o.icon size={16} />
                      <span>{o.shortName}</span>
                      {currentOrg === o.id && <CheckCircle2 size={12} />}
                    </button>
                  ))}
                </div>
                <p
                  className="text-xs mt-3"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  Dark mode only. Additional theme customisation coming soon.
                </p>
              </SettingsSection>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
