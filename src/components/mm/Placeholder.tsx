import { Link } from "@tanstack/react-router";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/vehicles", label: "Vehicles" },
  { to: "/drivers", label: "Drivers" },
  { to: "/trips", label: "Trips" },
  { to: "/maintenance", label: "Maintenance" },
  { to: "/fuel-expenses", label: "Fuel & Expenses" },
  { to: "/reports", label: "Reports" },
  { to: "/settings", label: "Settings" },
  { to: "/login", label: "Login" },
] as const;

export function MMPlaceholder({ title }: { title: string }) {
  return (
    <div className="mm-app">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-lg px-lg py-xl">
        <header className="flex items-baseline justify-between border-b border-mm-border pb-md">
          <div>
            <p className="text-mm-label-md uppercase tracking-wide text-mm-on-surface-variant">
              MoveMate
            </p>
            <h1 className="text-mm-headline-lg text-mm-on-surface">{title}</h1>
          </div>
          <Link
            to="/"
            className="text-mm-label-md uppercase text-mm-primary hover:text-mm-primary-hover"
          >
            ← Landing
          </Link>
        </header>

        <section className="rounded-mm-md border border-mm-border bg-mm-surface p-lg">
          <p className="text-mm-body-md text-mm-body">
            This page is a routing placeholder. Design system is wired up — Inter,
            MoveMate tokens (<code className="text-mm-primary">bg-mm-primary</code>,{" "}
            <code className="text-mm-primary">text-mm-on-surface</code>,{" "}
            <code className="text-mm-primary">border-mm-border</code>), the type scale
            (<code className="text-mm-primary">text-mm-headline-lg</code>,{" "}
            <code className="text-mm-primary">text-mm-body-md</code>,{" "}
            <code className="text-mm-primary">text-mm-label-md</code>), and radii
            (<code className="text-mm-primary">rounded-mm-sm</code>,{" "}
            <code className="text-mm-primary">rounded-mm-md</code>) all resolve.
          </p>
        </section>

        <section className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-mm-md border border-mm-border bg-mm-surface px-md py-sm text-mm-body-md text-mm-on-surface transition hover:border-mm-primary hover:text-mm-primary"
            >
              {item.label}
            </Link>
          ))}
        </section>

        {/* Theme smoke test */}
        <section className="rounded-mm-md border border-mm-border bg-mm-surface p-lg">
          <h2 className="mb-md text-mm-headline-sm text-mm-on-surface">Theme smoke test</h2>
          <div className="flex flex-wrap gap-sm">
            <button className="rounded-mm-sm bg-mm-primary px-md py-sm text-mm-body-md font-medium text-mm-on-primary hover:bg-mm-primary-hover">
              Primary
            </button>
            <button className="rounded-mm-sm border border-mm-border bg-mm-surface px-md py-sm text-mm-body-md text-mm-body">
              Secondary
            </button>
            <button className="rounded-mm-sm px-md py-sm text-mm-body-md font-medium text-mm-primary hover:text-mm-primary-hover">
              Ghost
            </button>
            <button className="rounded-mm-sm bg-mm-danger px-md py-sm text-mm-body-md font-medium text-white">
              Danger
            </button>
            <span className="rounded-mm-pill bg-mm-success-container px-md py-xs text-mm-label-sm uppercase text-mm-success">
              Active
            </span>
            <span className="rounded-mm-pill bg-mm-error-container px-md py-xs text-mm-label-sm uppercase text-mm-on-error-container">
              Overdue
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
