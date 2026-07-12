import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/components/mm/AppLayout";
import { Card, KpiCard, Button, SectionTitle } from "@/components/mm/ui";
import { formatINR } from "@/mock/fleet";
import { useAuth, useCurrentRole } from "@/hooks/useAuth";
import { useFuelEntries, useLogFuelEntry, useVehicles } from "@/hooks/useFleetData";

export const Route = createFileRoute("/fuel-expenses")({
  head: () => ({ meta: [{ title: "Fuel & Expenses · MoveMate" }] }),
  component: FuelPage,
});

function DriverFuelView({ driverName }: { driverName: string }) {
  const { data: vehicles = [] } = useVehicles();
  const { data: myEntries = [], isLoading } = useFuelEntries({ mine: true });
  const log = useLogFuelEntry();

  const [litres, setLitres] = useState("");
  const [cost, setCost] = useState("");
  const [station, setStation] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const vehicleCode = vehicle || vehicles[0]?.id || "";

  async function submit(e: FormEvent) {
    e.preventDefault();
    const l = parseFloat(litres);
    const c = parseFloat(cost);
    if (!vehicleCode || !station.trim() || !(l >= 0) || !(c > 0)) {
      toast.error("Fill vehicle, station, litres, and cost");
      return;
    }
    try {
      await log.mutateAsync({ date, vehicle: vehicleCode, station: station.trim(), litres: l, cost: c, driver: driverName });
      setLitres(""); setCost(""); setStation("");
      toast.success("Fuel entry logged");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
      <Card>
        <SectionTitle title="Log Fuel Entry" />
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="block">
            <div className="text-mm-label-md uppercase text-mm-on-surface-variant mb-1">Vehicle</div>
            <select value={vehicleCode} onChange={(e) => setVehicle(e.target.value)}
              className="h-10 w-full rounded-mm-md border border-mm-border bg-mm-surface px-3 text-mm-body-md focus:outline-none focus:border-mm-primary">
              {vehicles.map((v) => (<option key={v.uuid} value={v.id}>{v.id} · {v.type}</option>))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <div className="text-mm-label-md uppercase text-mm-on-surface-variant mb-1">Litres</div>
              <input type="number" step="0.1" min="0" value={litres} onChange={(e) => setLitres(e.target.value)}
                className="h-10 w-full rounded-mm-md border border-mm-border bg-mm-surface px-3 text-mm-body-md focus:outline-none focus:border-mm-primary" />
            </label>
            <label className="block">
              <div className="text-mm-label-md uppercase text-mm-on-surface-variant mb-1">Cost (₹)</div>
              <input type="number" step="0.01" min="0" value={cost} onChange={(e) => setCost(e.target.value)}
                className="h-10 w-full rounded-mm-md border border-mm-border bg-mm-surface px-3 text-mm-body-md focus:outline-none focus:border-mm-primary" />
            </label>
          </div>
          <label className="block">
            <div className="text-mm-label-md uppercase text-mm-on-surface-variant mb-1">Station</div>
            <input value={station} onChange={(e) => setStation(e.target.value)} placeholder="e.g. Indian Oil, MG Road"
              className="h-10 w-full rounded-mm-md border border-mm-border bg-mm-surface px-3 text-mm-body-md focus:outline-none focus:border-mm-primary" />
          </label>
          <label className="block">
            <div className="text-mm-label-md uppercase text-mm-on-surface-variant mb-1">Date</div>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="h-10 w-full rounded-mm-md border border-mm-border bg-mm-surface px-3 text-mm-body-md focus:outline-none focus:border-mm-primary" />
          </label>
          <Button icon="add" disabled={log.isPending}>{log.isPending ? "Logging…" : "Log entry"}</Button>
        </form>
      </Card>

      <Card padding={false}>
        <div className="px-5 pt-5 pb-3"><SectionTitle title="My Fuel Entries" /></div>
        {isLoading ? (
          <div className="px-5 pb-6 text-mm-body-sm text-mm-on-surface-variant">Loading…</div>
        ) : myEntries.length === 0 ? (
          <div className="px-5 pb-6 text-mm-body-sm text-mm-on-surface-variant">You haven't logged any fuel entries yet.</div>
        ) : (
          <table className="w-full text-mm-body-md">
            <thead className="text-left text-mm-label-md uppercase text-mm-on-surface-variant">
              <tr className="border-b border-mm-border">
                <th className="px-5 py-3">Date</th><th className="px-5 py-3">Vehicle</th><th className="px-5 py-3">Station</th>
                <th className="px-5 py-3 text-right">Litres</th><th className="px-5 py-3 text-right">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mm-border">
              {myEntries.map((e) => (
                <tr key={e.id}>
                  <td className="px-5 py-3">{e.date}</td>
                  <td className="px-5 py-3 font-medium">{e.vehicle}</td>
                  <td className="px-5 py-3 text-mm-on-surface-variant">{e.station}</td>
                  <td className="px-5 py-3 text-right">{e.litres.toFixed(1)} L</td>
                  <td className="px-5 py-3 text-right font-medium">{formatINR(e.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function FuelPage() {
  const { user } = useAuth();
  const role = useCurrentRole();
  const { data: fuelEntries = [], isLoading } = useFuelEntries();
  const [period, setPeriod] = useState("This week");
  const totalCost = useMemo(() => fuelEntries.reduce((s, e) => s + e.cost, 0), [fuelEntries]);
  const totalLitres = useMemo(() => fuelEntries.reduce((s, e) => s + e.litres, 0), [fuelEntries]);

  function exportCsv() {
    const header = ["Date", "Vehicle", "Driver", "Station", "Litres", "Cost"];
    const rows = fuelEntries.map((e) => [e.date, e.vehicle, e.driver, e.station, String(e.litres), String(e.cost)]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "movemate-fuel-expenses.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  }

  function changePeriod() {
    const next = period === "This week" ? "This month" : period === "This month" ? "This quarter" : "This week";
    setPeriod(next);
    toast.success(`Showing ${next.toLowerCase()}`);
  }

  if (role === "driver") {
    const displayName = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? "Me";
    return (
      <AppLayout title="Fuel & Expenses" subtitle="Log your fuel entries against assigned vehicles.">
        <DriverFuelView driverName={displayName} />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Fuel & Expenses"
      subtitle={isLoading ? "Loading…" : `${period} fuel consumption and reimbursable spend.`}
      actions={<><Button variant="outline" icon="calendar_today" onClick={changePeriod}>{period}</Button><Button icon="download" onClick={exportCsv}>Export CSV</Button></>}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Total Spend" value={formatINR(totalCost)} trend="Live" trendType="success" icon="payments" />
        <KpiCard label="Litres" value={`${totalLitres.toFixed(1)} L`} trend="Live" trendType="neutral" icon="local_gas_station" />
        <KpiCard label="Entries" value={String(fuelEntries.length)} trend="Total logged" trendType="neutral" icon="receipt_long" />
      </div>

      <Card className="mt-6" padding={false}>
        <div className="px-5 pt-5 pb-3 flex items-center justify-between"><SectionTitle title="Recent Transactions" /></div>
        <table className="w-full text-mm-body-md">
          <thead className="text-left text-mm-label-md uppercase text-mm-on-surface-variant">
            <tr className="border-b border-mm-border">
              <th className="px-5 py-3">Date</th><th className="px-5 py-3">Vehicle</th><th className="px-5 py-3">Driver</th>
              <th className="px-5 py-3">Station</th><th className="px-5 py-3 text-right">Litres</th><th className="px-5 py-3 text-right">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mm-border">
            {fuelEntries.map((e) => (
              <tr key={e.id}>
                <td className="px-5 py-3">{e.date}</td>
                <td className="px-5 py-3 font-medium">{e.vehicle}</td>
                <td className="px-5 py-3">{e.driver}</td>
                <td className="px-5 py-3 text-mm-on-surface-variant">{e.station}</td>
                <td className="px-5 py-3 text-right">{e.litres.toFixed(1)} L</td>
                <td className="px-5 py-3 text-right font-medium">{formatINR(e.cost)}</td>
              </tr>
            ))}
            {fuelEntries.length === 0 && !isLoading && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-mm-on-surface-variant">No fuel entries yet.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </AppLayout>
  );
}
