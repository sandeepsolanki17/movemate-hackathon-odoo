import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole =
  | "fleet_manager"
  | "safety_officer"
  | "financial_analyst"
  | "driver";

export const ROLE_LABELS: Record<AppRole, string> = {
  fleet_manager: "Fleet Manager",
  safety_officer: "Safety Officer",
  financial_analyst: "Financial Analyst",
  driver: "Driver",
};

export function normalizeRole(value: unknown): AppRole | null {
  if (
    value === "fleet_manager" ||
    value === "safety_officer" ||
    value === "financial_analyst" ||
    value === "driver"
  ) {
    return value;
  }
  return null;
}

// ── Role → allowed routes ────────────────────────────────────────────────
export const ROLE_ROUTES: Record<AppRole, string[]> = {
  // Fleet Manager: full operational visibility
  fleet_manager: [
    "/dashboard", "/vehicles", "/drivers", "/trips",
    "/maintenance", "/fuel-expenses", "/reports", "/settings",
  ],
  // Safety Officer: drivers, vehicles, maintenance & compliance reports
  safety_officer: [
    "/dashboard", "/drivers", "/vehicles", "/maintenance", "/reports", "/settings",
  ],
  // Financial Analyst: costs, fuel spend, reports
  financial_analyst: [
    "/dashboard", "/fuel-expenses", "/reports", "/settings",
  ],
  // Driver: assigned trips, vehicles, own driver record, own fuel logs, and profile
  driver: [
    "/trips", "/vehicles", "/drivers", "/fuel-expenses", "/settings",
  ],
};

// ── Landing route per role (where they go if they hit an unauthorized page) ─
export const ROLE_HOME: Record<AppRole, string> = {
  fleet_manager: "/dashboard",
  safety_officer: "/dashboard",
  financial_analyst: "/dashboard",
  driver: "/trips",
};

// ── Fine-grained permission keys ─────────────────────────────────────────
export type Permission =
  // Vehicles
  | "vehicle:create" | "vehicle:edit" | "vehicle:delete" | "vehicle:retire" | "vehicle:view"
  // Maintenance
  | "maintenance:manage" | "maintenance:view"
  // Trips
  | "trip:create" | "trip:dispatch" | "trip:complete" | "trip:cancel" | "trip:view"
  // Drivers
  | "driver:view" | "driver:edit" | "driver:suspend"
  // Reports / Financial
  | "report:view" | "report:financial" | "report:export"
  // Fuel & Expenses
  | "expense:view" | "expense:log_own" | "expense:view_all";

export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  fleet_manager: [
    "vehicle:create", "vehicle:edit", "vehicle:delete", "vehicle:retire", "vehicle:view",
    "maintenance:manage", "maintenance:view",
    "trip:create", "trip:dispatch", "trip:complete", "trip:cancel", "trip:view",
    "driver:view", "driver:edit", "driver:suspend",
    "report:view", "report:financial", "report:export",
    "expense:view", "expense:view_all",
  ],
  safety_officer: [
    "driver:view", "driver:edit", "driver:suspend",
    "vehicle:view",
    "maintenance:manage", "maintenance:view",
    "trip:view",
    "report:view", "report:export",
  ],
  financial_analyst: [
    "report:view", "report:financial", "report:export",
    "expense:view", "expense:view_all",
  ],
  driver: [
    "trip:create", "trip:complete", "trip:cancel", "trip:view",
    "vehicle:view",
    "expense:log_own",
  ],
};

export function canAccess(role: AppRole | null, path: string): boolean {
  if (!role) return false;
  return ROLE_ROUTES[role].includes(path);
}

export function hasPermission(role: AppRole | null, perm: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(perm);
}

type AuthState = {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<AppRole | null>;
  can: (perm: Permission) => boolean;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadRole(userId: string | undefined) {
    if (!userId) {
      setRole(null);
      return null;
    }
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) {
      setRole(null);
      return null;
    }
    const nextRole = normalizeRole(data?.role);
    setRole(nextRole);
    return nextRole;
  }

  async function refreshRole() {
    const { data } = await supabase.auth.getUser();
    return loadRole(data.user?.id);
  }

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setTimeout(() => loadRole(s?.user.id), 0);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      loadRole(data.session?.user.id).finally(() => setLoading(false));
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthState = {
    session,
    user: session?.user ?? null,
    role,
    loading,
    signOut: async () => {
      await supabase.auth.signOut();
      setRole(null);
    },
    refreshRole,
    can: (perm) => hasPermission(role, perm),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useCurrentRole() {
  return useAuth().role;
}
