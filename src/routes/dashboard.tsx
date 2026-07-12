import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout, MMIcon } from "@/components/mm/AppLayout";
import { Card, KpiCard, StatusPill, Button, SectionTitle } from "@/components/mm/ui";
import { FormDialog } from "@/components/mm/FormDialog";
import { statusToTone } from "@/mock/fleet";
import { useAuth, ROLE_LABELS, type AppRole } from "@/hooks/useAuth";
import { useVehicles, useAlerts, useCreateVehicle, useCreateWorkOrder } from "@/hooks/useFleetData";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · MoveMate" }] }),
  component: DashboardPage,
});

type Kpi = { label: string; value: string; trend: string; trendType: "success" | "danger" | "neutral"; icon: string };
type Action = { label: string; icon: string };

// Driver has no dashboard access — route guard redirects them. Use Partial to skip driver entries.
const ROLE_KPIS: Partial<Record<AppRole, Kpi[]>> = {
  fleet_manager: [
    { label: "Fleet Health Score", value: "92%", trend: "+1.4% this week", trendType: "success", icon: "monitor_heart" },
    { label: "Available Vehicles", value: "84", trend: "58 on trip · 12 in shop", trendType: "neutral", icon: "local_shipping" },
    { label: "Fleet Utilization", value: "78%", trend: "Above target 72%", trendType: "success", icon: "insights" },
    { label: "Maintenance Due", value: "9", trend: "3 overdue", trendType: "danger", icon: "build" },
  ],
  safety_officer: [
    { label: "Driver Compliance", value: "94%", trend: "+2% this month", trendType: "success", icon: "verified_user" },
    { label: "Expiring Licenses", value: "5", trend: "Next 30 days", trendType: "danger", icon: "badge" },
    { label: "High Risk Drivers", value: "3", trend: "Score below 70", trendType: "danger", icon: "warning" },
    { label: "Suspended Drivers", value: "1", trend: "Under review", trendType: "neutral", icon: "block" },
  ],
  financial_analyst: [
    { label: "Operational Cost", value: "₹1.07 Cr", trend: "-2.1% vs last month", trendType: "success", icon: "payments" },
    { label: "Fuel Cost", value: "₹40.2 L", trend: "37% of total", trendType: "neutral", icon: "local_gas_station" },
    { label: "Maintenance Cost", value: "₹18.0 L", trend: "17% of total", trendType: "neutral", icon: "build" },
    { label: "Cost per Trip", value: "₹2,675", trend: "Under budget", trendType: "success", icon: "receipt_long" },
  ],
};

const ROLE_ACTIONS: Partial<Record<AppRole, Action[]>> = {
  fleet_manager: [
    { label: "Add Vehicle", icon: "add" },
    { label: "Schedule Maintenance", icon: "build" },
    { label: "View Fleet", icon: "local_shipping" },
    { label: "Generate Report", icon: "analytics" },
  ],
  safety_officer: [
    { label: "Compliance Report", icon: "assignment" },
  ],
  financial_analyst: [
    { label: "Export Report", icon: "download" },
    { label: "Download CSV", icon: "file_download" },
    { label: "Cost Breakdown", icon: "pie_chart" },
  ],
};

const ROLE_SUBTITLES: Partial<Record<AppRole, string>> = {
  fleet_manager: "Fleet health, utilization, and maintenance at a glance.",
  safety_officer: "Driver compliance, licenses, and safety scores.",
  financial_analyst: "Operational spend, fuel efficiency, and profitability.",
};

function CommonBar() {
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-mm-body-md text-mm-on-surface">
          <MMIcon name="calendar_today" className="text-[18px] text-mm-primary" />
          <span>{today}</span>
        </div>
        <div className="flex items-center gap-4 text-mm-body-sm text-mm-on-surface-variant">
          <span className="inline-flex items-center gap-1"><MMIcon name="notifications" className="text-[16px]" /> 3 notifications</span>
          <span className="inline-flex items-center gap-1 text-mm-success"><MMIcon name="check_circle" className="text-[16px]" /> All systems operational</span>
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <MMIcon name={icon} className="text-[36px] text-mm-on-surface-variant" />
      <div className="text-mm-body-md font-medium text-mm-on-surface">{title}</div>
      <div className="text-mm-body-sm text-mm-on-surface-variant">{desc}</div>
    </div>
  );
}

function RoleWidgets({ role }: { role: AppRole }) {
  const { data: vehicles = [] } = useVehicles({ enabled: role === "fleet_manager" });
  const { data: alerts = [] } = useAlerts();
  function downloadVehicleCsv() {
    const header = ["Vehicle", "Type", "Driver", "Status", "Fuel", "Location"];
    const rows = vehicles.map((v) => [v.id, v.type, v.driver, v.status, `${v.fuel}%`, v.location]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "movemate-vehicle-status.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  }

  if (role === "fleet_manager") {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card padding={false}>
            <div className="flex items-center justify-between px-5 pt-5">
              <SectionTitle title="Vehicle Status Distribution" />
              <Button variant="ghost" icon="download" onClick={downloadVehicleCsv}>CSV</Button>
            </div>
            <div className="divide-y divide-mm-border">
              {vehicles.map((v) => (
                <div key={v.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-mm-md bg-mm-surface-container">
                      <MMIcon name="local_shipping" className="text-[20px] text-mm-body" />
                    </div>
                    <div>
                      <div className="text-mm-body-md font-medium text-mm-on-surface">{v.id}</div>
                      <div className="text-mm-body-sm text-mm-on-surface-variant">{v.type} · {v.driver}</div>
                    </div>
                  </div>
                  <StatusPill label={v.status} tone={statusToTone[v.status] ?? "neutral"} />
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <SectionTitle title="Fleet Alerts" />
            <div className="space-y-3">
              {alerts.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <MMIcon name={a.severity === "danger" ? "error" : "warning"} className="text-[20px] text-mm-danger" />
                  <div>
                    <div className="text-mm-body-md text-mm-on-surface">{a.title}</div>
                    <div className="text-mm-body-sm text-mm-on-surface-variant">{a.vehicle} · {a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <SectionTitle title="Recent Maintenance" />
            <ul className="space-y-2 text-mm-body-sm text-mm-on-surface-variant">
              <li>• TRK-104 · Oil change · 2h ago</li>
              <li>• VAN-217 · Tire rotation · Yesterday</li>
              <li>• TRK-088 · Brake pads · 2d ago</li>
            </ul>
          </Card>
        </div>
      </div>
    );
  }


  if (role === "safety_officer") {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <SectionTitle title="Expiring Licenses (Next 30 days)" />
            <div className="divide-y divide-mm-border">
              {[
                { name: "A. Kumar", id: "DRV-018", expires: "in 6 days" },
                { name: "S. Patel", id: "DRV-022", expires: "in 14 days" },
                { name: "M. Rao", id: "DRV-031", expires: "in 27 days" },
              ].map((d) => (
                <div key={d.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-mm-body-md font-medium text-mm-on-surface">{d.name}</div>
                    <div className="text-mm-body-sm text-mm-on-surface-variant">{d.id}</div>
                  </div>
                  <StatusPill label={`Expires ${d.expires}`} tone="warning" />
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <SectionTitle title="Compliance Alerts" />
            <ul className="space-y-2 text-mm-body-sm text-mm-on-surface-variant">
              <li>• 2 drivers missed safety training</li>
              <li>• 1 vehicle inspection overdue</li>
              <li>• 3 violations logged this week</li>
            </ul>
          </Card>
          <Card>
            <SectionTitle title="Safety Score" />
            <div className="text-mm-display-lg text-mm-primary font-bold">94%</div>
            <p className="text-mm-body-sm text-mm-on-surface-variant">Above target of 90%.</p>
          </Card>
        </div>
      </div>
    );
  }

  // financial_analyst
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <SectionTitle title="Monthly Expense Trend" />
          <div className="divide-y divide-mm-border">
            {[
              { m: "May", spend: "₹1.01 Cr" },
              { m: "Jun", spend: "₹1.09 Cr" },
              { m: "Jul", spend: "₹1.07 Cr" },
            ].map((r) => (
              <div key={r.m} className="flex items-center justify-between py-3">
                <span className="text-mm-body-md text-mm-on-surface">{r.m}</span>
                <span className="text-mm-body-md font-semibold text-mm-primary">{r.spend}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="space-y-4">
        <Card>
          <SectionTitle title="Vehicle Cost Analysis" />
          <ul className="space-y-2 text-mm-body-sm text-mm-on-surface-variant">
            <li>• TRK-104 · ₹3.5 L · Highest</li>
            <li>• VAN-217 · ₹2.6 L</li>
            <li>• TRK-088 · ₹2.25 L</li>
          </ul>
        </Card>
        <Card>
          <SectionTitle title="Profitability" />
          <div className="text-mm-display-lg text-mm-primary font-bold">18.4%</div>
          <p className="text-mm-body-sm text-mm-on-surface-variant">Margin above target of 15%.</p>
        </Card>
      </div>
    </div>
  );
}

function DashboardPage() {
  const { role, loading } = useAuth();
  const navigate = useNavigate();
  const createVehicle = useCreateVehicle();
  const createWorkOrder = useCreateWorkOrder();
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  async function handleAddVehicle(v: Record<string, string>) {
    try {
      await createVehicle.mutateAsync({ id: v.code.trim(), type: v.type.trim() || "Unknown", status: "Idle", fuel: 100, mileage: 0, location: v.location.trim() || "Yard" });
      toast.success("Vehicle added");
      setAddVehicleOpen(false);
    } catch (e) { toast.error((e as Error).message); }
  }

  async function handleSchedule(v: Record<string, string>) {
    try {
      await createWorkOrder.mutateAsync({ id: `WO-${Math.floor(1000 + Math.random() * 9000)}`, title: v.title.trim(), vehicle: v.vehicle.trim(), priority: v.priority, assignee: "Service Bay", status: "Open", updated: "just now" });
      toast.success("Maintenance scheduled");
      setScheduleOpen(false);
    } catch (e) { toast.error((e as Error).message); }
  }

  function handleAction(label: string) {
    if (label === "Add Vehicle") { setAddVehicleOpen(true); return; }
    if (label === "Schedule Maintenance") { setScheduleOpen(true); return; }
    if (label === "View Fleet") navigate({ to: "/vehicles" });
    else if (label.includes("Report") || label.includes("Cost")) navigate({ to: "/reports" });
    else if (label.includes("CSV")) navigate({ to: "/fuel-expenses" });
    else if (label.includes("Driver") || label.includes("License")) navigate({ to: "/drivers" });
    else toast.success(`${label} opened`);
  }

  if (loading) {
    return (
      <AppLayout title="Dashboard">
        <Card><EmptyState icon="hourglass_top" title="Loading your dashboard…" desc="Personalizing for your role." /></Card>
      </AppLayout>
    );
  }

  if (!role) {
    return (
      <AppLayout title="Dashboard">
        <Card>
          <EmptyState
            icon="shield_person"
            title="No role assigned"
            desc="Please contact your administrator to assign you a role."
          />
        </Card>
      </AppLayout>
    );
  }

  const kpis = ROLE_KPIS[role] ?? [];
  const actions = ROLE_ACTIONS[role] ?? [];

  return (
    <AppLayout
      title={`${ROLE_LABELS[role]} Dashboard`}
      subtitle={ROLE_SUBTITLES[role]}
      actions={
        <>
          {actions.map((a, i) => (
            <Button key={a.label} variant={i === 0 ? "primary" : "outline"} icon={a.icon} onClick={() => handleAction(a.label)} disabled={createVehicle.isPending || createWorkOrder.isPending}>
              {a.label}
            </Button>
          ))}
        </>
      }
    >
      <div className="space-y-4">
        <CommonBar />

        <div className={`grid gap-4 ${kpis.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"}`}>
          {kpis.map((k) => (
            <KpiCard key={k.label} label={k.label} value={k.value} trend={k.trend} trendType={k.trendType} icon={k.icon} />
          ))}
        </div>

        <RoleWidgets role={role} />
      </div>
      <FormDialog
        open={addVehicleOpen}
        onOpenChange={setAddVehicleOpen}
        title="Add vehicle"
        submitLabel="Add"
        loading={createVehicle.isPending}
        onSubmit={handleAddVehicle}
        fields={[
          { name: "code", label: "Registration", type: "text", required: true, placeholder: "MH12-AB-9021" },
          { name: "type", label: "Type / model", type: "text", placeholder: "Tata Ace" },
          { name: "location", label: "Current location", type: "text", defaultValue: "Yard" },
        ]}
      />
      <FormDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        title="Schedule maintenance"
        submitLabel="Schedule"
        loading={createWorkOrder.isPending}
        onSubmit={handleSchedule}
        fields={[
          { name: "title", label: "Work order title", type: "text", required: true },
          { name: "vehicle", label: "Vehicle code", type: "text" },
          { name: "priority", label: "Priority", type: "select", options: ["Low", "Medium", "High"], defaultValue: "Medium" },
        ]}
      />
    </AppLayout>
  );
}
