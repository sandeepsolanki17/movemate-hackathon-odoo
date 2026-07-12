import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_LABELS, ROLE_HOME, type AppRole, useAuth } from "@/hooks/useAuth";

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(1, "Password is required").max(72),
});

const signUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[a-z]/, "Include at least one lowercase letter")
    .regex(/[0-9]/, "Include at least one number"),
  role: z.enum(["fleet_manager", "safety_officer", "financial_analyst", "driver"]),
});


export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — MoveMate" },
      {
        name: "description",
        content:
          "Sign in to MoveMate — the smart fleet companion for drivers, fleet managers, safety officers, and analysts.",
      },
    ],
  }),
  component: LoginPage,
});

const ROLE_ICONS: Record<AppRole, string> = {
  fleet_manager: "dashboard",
  safety_officer: "verified_user",
  financial_analyst: "analytics",
  driver: "local_shipping",
};

const ROLE_ORDER: AppRole[] = [
  "fleet_manager",
  "safety_officer",
  "financial_analyst",
  "driver",
];

function LoginPage() {
  const navigate = useNavigate();
  const { refreshRole } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<AppRole>("fleet_manager");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (mode === "signin") {
      const parsed = signInSchema.safeParse({ email, password });
      if (!parsed.success) {
        const msg = parsed.error.issues[0]?.message ?? "Invalid input";
        setError(msg);
        toast.error(msg);
        return;
      }
    } else {
      const parsed = signUpSchema.safeParse({ fullName, email, password, role });
      if (!parsed.success) {
        const msg = parsed.error.issues[0]?.message ?? "Invalid input";
        setError(msg);
        toast.error(msg);
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === "signin") {
        const { data: signInData, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        await refreshRole();
        // Look up role directly so we can route without waiting for provider effect
        let dest: string = "/dashboard";
        const userId = signInData.user?.id;
        if (userId) {
          const { data: roleRow } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", userId)
            .maybeSingle();
          const r = roleRow?.role as AppRole | undefined;
          if (r && ROLE_HOME[r]) dest = ROLE_HOME[r];
        }
        toast.success("Welcome back");
        navigate({ to: dest, replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
            data: { full_name: fullName.trim() },
          },
        });
        if (error) throw error;
        const userId = data.user?.id;
        if (userId) {
          // Insert role while session is active (RLS requires auth.uid())
          const { error: roleErr } = await supabase
            .from("user_roles")
            .insert({ user_id: userId, role });
          if (roleErr) throw roleErr;
        }
        // Sign out so user must explicitly sign in
        await supabase.auth.signOut();
        toast.success("Account created — please sign in");
        // Return to sign-in mode with email preserved
        setMode("signin");
        setPassword("");
        setFullName("");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }


  return (
    <div className="mm-app flex min-h-screen w-full">
      <aside
        className="relative hidden overflow-hidden border-r border-mm-border bg-mm-surface-low p-2xl lg:flex lg:w-1/2 lg:flex-col lg:justify-between"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 z-0 opacity-70 mix-blend-multiply"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1600&q=70')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-mm-bg via-mm-bg/60 to-transparent" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-center gap-sm">
            <span
              className="material-symbols-outlined filled text-mm-primary"
              style={{ fontSize: 28 }}
            >
              local_shipping
            </span>
            <span
              className="text-mm-headline-sm text-mm-on-surface"
              style={{ letterSpacing: "-0.01em" }}
            >
              MoveMate
            </span>
          </div>
          <div>
            <p
              className="mb-sm block text-mm-on-surface"
              style={{
                fontSize: "clamp(36px, 5vw, 56px)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                fontWeight: 700,
              }}
            >
              Fleet Operations.
            </p>
            <p className="text-mm-headline-lg text-mm-on-surface-variant">
              Elevated.
            </p>
            <p
              className="mt-md text-mm-body-md text-mm-on-surface-variant"
              style={{ maxWidth: 420 }}
            >
              Route planning, live tracking, and dispatch intelligence for
              modern delivery fleets.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex w-full items-center justify-center bg-mm-bg p-lg sm:p-2xl lg:w-1/2">
        <div className="mm-shadow-float w-full max-w-[440px] rounded-mm-md border border-mm-border bg-mm-surface p-xl">
          <div className="mb-xl text-center">
            <div className="mb-sm inline-flex items-center justify-center gap-sm">
              <span
                className="material-symbols-outlined filled text-mm-primary"
                style={{ fontSize: 32 }}
              >
                local_shipping
              </span>
              <h1 className="text-mm-headline-lg text-mm-primary">MoveMate</h1>
            </div>
            <p className="text-mm-body-md text-mm-on-surface-variant">
              {mode === "signin" ? "Sign in to your account" : "Create your account"}
            </p>
          </div>

          <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div>
                <label className="mb-xs block text-mm-label-md text-mm-on-surface">
                  Full name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full rounded-mm-sm border border-mm-border bg-mm-surface px-sm py-sm text-mm-body-md text-mm-on-surface outline-none focus:border-mm-primary focus:ring-2 focus:ring-mm-primary/30"
                />
              </div>
            )}

            <div>
              <label className="mb-xs block text-mm-label-md text-mm-on-surface">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-mm-sm border border-mm-border bg-mm-surface px-sm py-sm text-mm-body-md text-mm-on-surface outline-none focus:border-mm-primary focus:ring-2 focus:ring-mm-primary/30"
              />
            </div>

            <div>
              <label className="mb-xs block text-mm-label-md text-mm-on-surface">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-mm-sm border border-mm-border bg-mm-surface px-sm py-sm text-mm-body-md text-mm-on-surface outline-none focus:border-mm-primary focus:ring-2 focus:ring-mm-primary/30"
              />
            </div>

            {mode === "signup" && (
              <div>
                <label className="mb-xs block text-mm-label-md text-mm-on-surface">
                  Select your role
                </label>
                <div className="grid grid-cols-2 gap-sm">
                  {ROLE_ORDER.map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRole(r)}
                      className={`flex items-center gap-xs rounded-mm-sm border p-sm text-left transition-colors ${
                        role === r
                          ? "border-mm-primary bg-mm-primary/10"
                          : "border-mm-border bg-mm-surface-low/60 hover:border-mm-primary/50"
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-mm-on-surface-variant"
                        style={{ fontSize: 18 }}
                      >
                        {ROLE_ICONS[r]}
                      </span>
                      <span className="text-mm-label-sm text-mm-on-surface">
                        {ROLE_LABELS[r]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p className="text-mm-body-sm text-red-500" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-sm inline-flex w-full items-center justify-center gap-sm rounded-mm-sm bg-mm-primary py-sm text-mm-headline-sm text-mm-on-primary transition-colors hover:bg-mm-primary-hover disabled:opacity-60"
            >
              {submitting
                ? "Please wait…"
                : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
              }}
              className="text-mm-body-sm text-mm-primary hover:underline"
            >
              {mode === "signin"
                ? "Need an account? Create one"
                : "Already have an account? Sign in"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
