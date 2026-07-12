import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppLayout, MMIcon } from "@/components/mm/AppLayout";
import { Card, Button, SectionTitle } from "@/components/mm/ui";
import { useAuth, useCurrentRole, ROLE_LABELS, type AppRole } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · MoveMate" }] }),
  component: SettingsPage,
});

const sections = [
  { id: "user", label: "User Profile", icon: "account_circle" },
  { id: "role", label: "Role & Access", icon: "shield" },
  { id: "account", label: "Account Actions", icon: "logout" },
];

function getInitials(name?: string | null, email?: string | null) {
  const base = (name && name.trim()) || (email && email.split("@")[0]) || "U";
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "U") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function SettingsPage() {
  const [active, setActive] = useState("user");
  const { user, signOut } = useAuth();
  const role = useCurrentRole();
  const navigate = useNavigate();
  const visibleSections = role === "driver" ? sections.filter((s) => s.id !== "role") : sections;

  const [fullName, setFullName] = useState<string>(
    (user?.user_metadata?.full_name as string | undefined) ?? "",
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName((user?.user_metadata?.full_name as string | undefined) ?? "");
  }, [user]);

  const email = user?.email ?? "";
  const initials = getInitials(fullName, email);

  async function handleSaveName() {
    if (!user) return;
    setSaving(true);
    try {
      const trimmed = fullName.trim();
      const { error: authErr } = await supabase.auth.updateUser({
        data: { full_name: trimmed },
      });
      if (authErr) throw authErr;
      const { error: profErr } = await supabase
        .from("profiles")
        .update({ full_name: trimmed })
        .eq("id", user.id);
      if (profErr) throw profErr;
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/login", replace: true });
  }

  async function handleChangePassword() {
    if (!email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset email sent");
  }

  return (
    <AppLayout title={role === "driver" ? "My Profile" : "Settings"} subtitle="Manage your profile and account.">
      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <Card padding={false} className="h-fit">
          <nav className="p-2">
            {visibleSections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`w-full flex items-center gap-3 rounded-mm-md px-3 py-2.5 text-mm-body-md text-left ${
                  active === s.id ? "bg-mm-primary-container text-mm-on-surface font-semibold" : "hover:bg-mm-surface-container"
                }`}
              >
                <MMIcon name={s.icon} className="text-[18px]" />
                {s.label}
              </button>
            ))}
          </nav>
        </Card>

        <div className="space-y-4">
          {active === "user" && (
            <Card>
              <SectionTitle title="User Profile" />
              <div className="flex items-center gap-4">
                <div className="grid size-16 place-items-center rounded-mm-pill bg-mm-primary-container text-mm-on-surface text-mm-headline-sm font-semibold">
                  {initials}
                </div>
                <div>
                  <div className="text-mm-headline-sm text-mm-on-surface">
                    {fullName || email || "Member"}
                  </div>
                  <div className="text-mm-body-sm text-mm-on-surface-variant">
                    {role ? ROLE_LABELS[role] : "No role assigned"}
                  </div>
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <div className="text-mm-label-md uppercase text-mm-on-surface-variant mb-1">Full name</div>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-10 w-full rounded-mm-md border border-mm-border bg-mm-surface px-3 text-mm-body-md focus:outline-none focus:border-mm-primary"
                  />
                </label>
                <label className="block">
                  <div className="text-mm-label-md uppercase text-mm-on-surface-variant mb-1">Email</div>
                  <input
                    value={email}
                    readOnly
                    className="h-10 w-full rounded-mm-md border border-mm-border bg-mm-surface-container px-3 text-mm-body-md text-mm-on-surface-variant"
                  />
                </label>
              </div>
              <div className="mt-4">
                <Button icon="save" onClick={handleSaveName} disabled={saving || !fullName.trim()}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </Card>
          )}

          {active === "role" && (
            <Card>
              <SectionTitle title="Role & Access" />
              <p className="text-mm-body-sm text-mm-on-surface-variant mb-3">
                Your role determines the dashboards, modules, and actions available to you.
              </p>
              <div className="grid gap-3">
                {(Object.keys(ROLE_LABELS) as AppRole[]).map((r) => {
                  const isMine = role === r;
                  return (
                    <div
                      key={r}
                      className={`flex items-center justify-between rounded-mm-md border p-3 ${
                        isMine ? "border-mm-primary bg-mm-primary/5" : "border-mm-border"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MMIcon name="shield" className="text-mm-primary text-[18px]" />
                        <span className="font-medium">{ROLE_LABELS[r]}</span>
                      </div>
                      <span className="text-mm-body-sm text-mm-on-surface-variant">
                        {isMine ? "Your role" : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {active === "account" && (
            <Card>
              <SectionTitle title="Account Actions" />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" icon="key" onClick={handleChangePassword}>
                  Reset password
                </Button>
                <Button variant="outline" icon="logout" onClick={handleSignOut}>
                  Sign out
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
