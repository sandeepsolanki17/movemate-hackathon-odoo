import { Link, useRouterState, useNavigate, type LinkProps } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth, useCurrentRole, ROLE_LABELS, ROLE_HOME, canAccess } from "@/hooks/useAuth";
import { toast } from "sonner";

type NavItem = { to: LinkProps["to"]; label: string; icon: string };

const primaryNav: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/vehicles", label: "Vehicles", icon: "local_shipping" },
  { to: "/drivers", label: "Drivers", icon: "person" },
  { to: "/trips", label: "Trips", icon: "route" },
  { to: "/maintenance", label: "Maintenance", icon: "build" },
  { to: "/fuel-expenses", label: "Fuel & Expenses", icon: "payments" },
  { to: "/reports", label: "Reports", icon: "analytics" },
  { to: "/settings", label: "Settings", icon: "settings" },
];

const driverNav: NavItem[] = [
  { to: "/trips", label: "Trips", icon: "route" },
  { to: "/vehicles", label: "Vehicles", icon: "local_shipping" },
  { to: "/drivers", label: "Drivers", icon: "person" },
  { to: "/fuel-expenses", label: "Fuel & Expenses", icon: "payments" },
  { to: "/settings", label: "My Profile", icon: "account_circle" },
];


function Icon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

function SideNavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      to={item.to}
      className={`flex items-center gap-3 rounded-mm-md px-3 py-2.5 text-mm-body-md transition-colors ${
        active
          ? "bg-mm-primary-container text-mm-on-surface font-semibold"
          : "text-mm-body hover:bg-mm-surface-container"
      }`}
    >
      <Icon name={item.icon} className="text-[20px]" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function getInitials(name?: string | null, email?: string | null) {
  const base = (name && name.trim()) || (email && email.split("@")[0]) || "U";
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "U") + (parts[1]?.[0] ?? "");
  return letters.toUpperCase();
}

function ProfileMenu() {
  const { user, signOut } = useAuth();
  const role = useCurrentRole();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const displayName = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? "User";
  const initials = getInitials(user?.user_metadata?.full_name as string | undefined, user?.email);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="grid size-10 place-items-center rounded-mm-pill bg-mm-primary-container text-mm-on-surface font-semibold text-mm-body-sm hover:opacity-90"
        aria-label="Profile menu"
      >
        {initials}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-mm-md border border-mm-border bg-mm-surface shadow-lg z-20">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-mm-border">
            <div className="grid size-10 place-items-center rounded-mm-pill bg-mm-primary-container text-mm-on-surface font-semibold text-mm-body-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-mm-body-md font-semibold text-mm-on-surface">{displayName}</div>
              <div className="truncate text-mm-label-sm text-mm-on-surface-variant">
                {role ? ROLE_LABELS[role] : "Member"}
              </div>
            </div>
          </div>
          <div className="p-1">
            <button
              onClick={() => { setOpen(false); navigate({ to: "/settings" }); }}
              className="w-full flex items-center gap-2 rounded-mm-md px-3 py-2 text-left text-mm-body-md hover:bg-mm-surface-container"
            >
              <Icon name={role === "driver" ? "account_circle" : "settings"} className="text-[18px]" /> {role === "driver" ? "My Profile" : "Settings"}
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 rounded-mm-md px-3 py-2 text-left text-mm-body-md text-mm-danger hover:bg-mm-surface-container"
            >
              <Icon name="logout" className="text-[18px]" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AppLayout({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { loading, session } = useAuth();
  const role = useCurrentRole();
  const navigate = useNavigate();

  // Role-based route guard
  const alwaysAllowed = pathname === "/unauthorized";
  useEffect(() => {
    if (loading || alwaysAllowed || !session) return;
    if (!role) {
      navigate({ to: "/unauthorized", replace: true });
      return;
    }
    if (!canAccess(role, pathname)) {
      toast.error("Not authorized");
      // Send user to their role's home instead of a dead-end 403 for known-nav mistakes
      const home = ROLE_HOME[role] as "/trips" | "/dashboard";
      navigate({ to: home, replace: true });
    }
  }, [role, loading, pathname, navigate, alwaysAllowed, session]);

  const visibleNav: NavItem[] = role
    ? (role === "driver" ? driverNav : primaryNav)
        .filter((item) => canAccess(role, item.to as string))
    : [];

  return (
    <div className="mm-app flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-mm-border bg-mm-surface">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="grid size-9 place-items-center rounded-mm-md bg-mm-primary text-mm-on-primary">
            <Icon name="local_shipping" className="text-[20px]" />
          </div>
          <div className="leading-tight">
            <div className="text-mm-headline-sm font-semibold text-mm-on-surface">MoveMate</div>
            <div className="text-mm-label-sm text-mm-on-surface-variant">
              {role ? ROLE_LABELS[role] : "No role"}
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {visibleNav.map((item) => (
            <SideNavLink key={item.label} item={item} active={pathname === item.to} />
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex items-center justify-end gap-4 border-b border-mm-border bg-mm-surface/95 px-6 py-3 backdrop-blur">
          <button
            aria-label="Notifications"
            onClick={() => toast.info("No new notifications")}
            className="grid size-10 place-items-center rounded-mm-pill hover:bg-mm-surface-container"
          >
            <Icon name="notifications" className="text-[20px] text-mm-body" />
          </button>
          <ProfileMenu />
        </header>

        {/* Page header */}
        <div className="border-b border-mm-border bg-mm-background px-6 pt-6 pb-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-mm-headline-lg text-mm-on-surface">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-mm-body-md text-mm-on-surface-variant">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 bg-mm-background px-6 py-6">{children}</main>
      </div>
    </div>
  );
}

export { Icon as MMIcon };
