import type { ReactNode } from "react";
import { MMIcon } from "./AppLayout";

export function Card({
  children,
  className = "",
  padding = true,
}: {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}) {
  return (
    <div
      className={`rounded-mm-md border border-mm-border bg-mm-surface ${
        padding ? "p-5" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  trend,
  trendType = "success",
  icon,
}: {
  label: string;
  value: string;
  trend?: string;
  trendType?: "success" | "danger" | "neutral";
  icon?: string;
}) {
  const trendColor =
    trendType === "danger"
      ? "text-mm-danger"
      : trendType === "success"
      ? "text-mm-success"
      : "text-mm-on-surface-variant";
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-mm-label-md uppercase text-mm-on-surface-variant">{label}</div>
          <div className="mt-2 text-mm-headline-lg font-semibold text-mm-on-surface">{value}</div>
          {trend && <div className={`mt-1 text-mm-body-sm ${trendColor}`}>{trend}</div>}
        </div>
        {icon && (
          <div className="grid size-10 place-items-center rounded-mm-md bg-mm-primary-container text-mm-on-surface">
            <MMIcon name={icon} className="text-[20px]" />
          </div>
        )}
      </div>
    </Card>
  );
}

type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";
const toneMap: Record<StatusTone, string> = {
  success: "bg-mm-success-container text-mm-success",
  warning: "bg-[#FFDF9F] text-[#5D4200]",
  danger: "bg-mm-error-container text-mm-on-error-container",
  info: "bg-mm-secondary-container text-mm-secondary",
  neutral: "bg-mm-surface-container text-mm-body",
};

export function StatusPill({ label, tone = "neutral" }: { label: string; tone?: StatusTone }) {
  return (
    <span
      className={`inline-flex items-center rounded-mm-pill px-2.5 py-1 text-mm-label-md ${toneMap[tone]}`}
    >
      {label}
    </span>
  );
}

export function Button({
  children,
  variant = "primary",
  icon,
  className = "",
  ...props
}: {
  children?: ReactNode;
  variant?: "primary" | "outline" | "ghost";
  icon?: string;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles: Record<string, string> = {
    primary: "bg-mm-primary text-mm-on-primary hover:bg-mm-primary-hover",
    outline: "border border-mm-border bg-mm-surface text-mm-body hover:bg-mm-surface-container",
    ghost: "text-mm-body hover:bg-mm-surface-container",
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 rounded-mm-pill px-4 h-10 text-mm-body-md font-medium transition-colors ${styles[variant]} ${className}`}
    >
      {icon && <MMIcon name={icon} className="text-[18px]" />}
      {children}
    </button>
  );
}

export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <h2 className="text-mm-headline-sm text-mm-on-surface">{title}</h2>
      {action}
    </div>
  );
}
