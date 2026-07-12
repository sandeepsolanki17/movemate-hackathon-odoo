import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, MMIcon } from "@/components/mm/AppLayout";
import { Card, KpiCard, Button, SectionTitle } from "@/components/mm/ui";
import { useDrivers, useAlerts } from "@/hooks/useFleetData";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Executive Reports · MoveMate" }] }),
  component: ReportsPage,
});

const trend = [42, 48, 55, 52, 61, 68, 72, 70, 75, 78, 82, 78];

function ReportsPage() {
  const { data: drivers = [] } = useDrivers();
  const { data: alerts = [] } = useAlerts();
  const max = Math.max(...trend);
  const top = [...drivers].sort((a, b) => b.score - a.score).slice(0, 5);

  function downloadReport() {
    const lines = [
      "MoveMate Executive Report",
      "Utilization: 78%",
      "On-Time: 94.2%",
      "Cost / Km: ₹11.20",
      `Incidents: ${alerts.filter((a) => a.severity === "danger").length}`,
      "",
      "Top Drivers",
      ...top.map((d, i) => `${i + 1}. ${d.name} — Safety ${d.score}, ${d.trips} trips`),
    ];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "movemate-executive-report.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppLayout
      title="Executive Reports"
      subtitle="Fleet KPIs, smart alerts, and cost intelligence."
      actions={<Button icon="download" onClick={downloadReport}>Download PDF</Button>}
    >
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Utilization" value="78%" trend="+3.1%" trendType="success" />
        <KpiCard label="On-Time %" value="94.2%" trend="+0.6%" trendType="success" />
        <KpiCard label="Cost / Km" value="₹11.20" trend="-2.1%" trendType="success" />
        <KpiCard label="Incidents" value={String(alerts.filter((a) => a.severity === "danger").length)} trend="Live" trendType="danger" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="Utilization Trend" />
          <div className="flex h-56 items-end gap-2">
            {trend.map((v, i) => (
              <div key={i} className="flex-1 rounded-mm-sm bg-mm-primary/70 hover:bg-mm-primary transition-colors" style={{ height: `${(v / max) * 100}%` }} />
            ))}
          </div>
          <div className="mt-3 flex justify-between text-mm-label-sm text-mm-on-surface-variant">
            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m) => <span key={m}>{m}</span>)}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Smart Alerts" />
          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.id} className="flex gap-3">
                <MMIcon name="auto_awesome" className="text-mm-primary text-[20px]" />
                <div>
                  <div className="text-mm-body-md text-mm-on-surface font-medium">{a.title}</div>
                  <div className="text-mm-body-sm text-mm-on-surface-variant">{a.vehicle} · {a.time}</div>
                </div>
              </div>
            ))}
            {alerts.length === 0 && <div className="text-mm-body-sm text-mm-on-surface-variant">No alerts.</div>}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle title="Cost Breakdown" />
          <div className="space-y-3">
            {[
              { label: "Fuel", pct: 46, color: "bg-mm-primary" },
              { label: "Maintenance", pct: 22, color: "bg-mm-secondary" },
              { label: "Insurance", pct: 18, color: "bg-mm-success" },
              { label: "Tolls & Misc", pct: 14, color: "bg-mm-danger" },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-mm-body-sm"><span>{row.label}</span><span className="font-medium">{row.pct}%</span></div>
                <div className="mt-1 h-2 rounded-mm-pill bg-mm-surface-container"><div className={`h-full rounded-mm-pill ${row.color}`} style={{ width: `${row.pct}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>

        <Card padding={false}>
          <div className="px-5 pt-5"><SectionTitle title="Top Drivers" /></div>
          <div className="divide-y divide-mm-border">
            {top.map((d, i) => (
              <div key={d.uuid} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-7 place-items-center rounded-mm-pill bg-mm-primary-container text-mm-on-surface text-mm-label-md font-semibold">{i + 1}</div>
                  <div>
                    <div className="font-medium text-mm-on-surface">{d.name}</div>
                    <div className="text-mm-body-sm text-mm-on-surface-variant">{d.trips} trips</div>
                  </div>
                </div>
                <div className="text-mm-headline-sm text-mm-primary">{d.score}</div>
              </div>
            ))}
            {top.length === 0 && <div className="px-5 py-6 text-center text-mm-on-surface-variant">No drivers yet.</div>}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
