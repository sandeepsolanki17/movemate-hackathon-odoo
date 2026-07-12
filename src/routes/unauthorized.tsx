import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth, ROLE_LABELS } from "@/hooks/useAuth";

export const Route = createFileRoute("/unauthorized")({
  head: () => ({ meta: [{ title: "403 · Access Denied — MoveMate" }] }),
  component: UnauthorizedPage,
});

function UnauthorizedPage() {
  const { role, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="mm-app flex min-h-screen items-center justify-center bg-mm-bg px-6">
      <div className="max-w-md w-full rounded-mm-lg border border-mm-border bg-mm-surface p-2xl text-center mm-shadow-float">
        <div className="mx-auto mb-md grid size-20 place-items-center rounded-mm-pill bg-mm-error-container">
          <span className="material-symbols-outlined text-mm-danger" style={{ fontSize: 40 }}>lock</span>
        </div>
        <div className="text-mm-display-md font-bold text-mm-primary">403</div>
        <h1 className="mt-1 text-mm-headline-md text-mm-on-surface">Access Denied</h1>
        <p className="mt-2 text-mm-body-md text-mm-on-surface-variant">
          {role
            ? `Your role (${ROLE_LABELS[role]}) doesn't have permission to view this page.`
            : "You don't have a role assigned yet. Please contact your administrator."}
        </p>
        <div className="mt-lg flex justify-center gap-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-mm-md bg-mm-primary px-4 py-2 text-mm-on-primary hover:bg-mm-primary-hover"
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            Go to Dashboard
          </Link>
          <button
            onClick={async () => { await signOut(); navigate({ to: "/login", replace: true }); }}
            className="inline-flex items-center gap-2 rounded-mm-md border border-mm-border px-4 py-2 text-mm-on-surface hover:bg-mm-surface-container"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
