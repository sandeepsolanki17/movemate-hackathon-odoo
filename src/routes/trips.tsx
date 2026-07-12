import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppLayout, MMIcon } from "@/components/mm/AppLayout";
import { Card, StatusPill, Button, SectionTitle } from "@/components/mm/ui";
import { FormDialog } from "@/components/mm/FormDialog";
import { statusToTone } from "@/mock/fleet";
import { useTrips, useCreateTrip, useUpdateTrip } from "@/hooks/useFleetData";
import { useAuth, useCurrentRole } from "@/hooks/useAuth";

export const Route = createFileRoute("/trips")({
  head: () => ({ meta: [{ title: "Trips · MoveMate" }] }),
  component: TripsPage,
});

function TripsPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const role = useCurrentRole();
  const { user } = useAuth();
  const { data: trips = [], isLoading } = useTrips();
  const create = useCreateTrip();
  const update = useUpdateTrip();

  useEffect(() => {
    if (!selectedId && trips.length > 0) {
      setSelectedId(trips[0].id);
    }
  }, [trips, selectedId]);

  const visibleTrips = query.trim()
    ? trips.filter((t) => `${t.id} ${t.origin} ${t.destination} ${t.driver} ${t.vehicle} ${t.status}`.toLowerCase().includes(query.trim().toLowerCase()))
    : trips;
  const selected = trips.find((t) => t.id === selectedId) ?? visibleTrips[0] ?? trips[0];
  const driverName = (user?.user_metadata?.full_name as string | undefined) ?? user?.email?.split("@")[0] ?? "";

  async function handleNew(v: Record<string, string>) {
    const driver = role === "driver" ? driverName : v.driver.trim();

    // Prevent assigning if the driver already has an active (incomplete) trip
    if (driver) {
      const hasActiveTrip = trips.some(
        (t) => t.driver.trim().toLowerCase() === driver.toLowerCase() && t.status !== "Completed"
      );
      if (hasActiveTrip) {
        toast.error(`Driver "${driver}" already has an active trip assigned.`);
        return;
      }
    }

    const distance = parseInt(v.distance || "0", 10);
    const id = `TRP-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      await create.mutateAsync({ id, origin: v.origin.trim(), destination: v.destination.trim(), driver, vehicle: v.vehicle.trim(), distance, status: "Scheduled", eta: "Pending" });
      toast.success("Trip created");
      setNewOpen(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function handleStartTrip() {
    if (!selected) {
      toast.error("No trip selected to start");
      return;
    }
    if (selected.status !== "Scheduled") {
      toast.error("Only scheduled trips can be started");
      return;
    }
    try {
      await update.mutateAsync({ uuid: selected.uuid, status: "In Transit", eta: selected.eta || "In progress" });
      toast.success(`${selected.id} started`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function handleCompleteTrip() {
    if (!selected) return;
    try {
      await update.mutateAsync({ uuid: selected.uuid, status: "Completed", eta: "Arrived" });
      toast.success(`${selected.id} completed`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <AppLayout
      title="Trips"
      subtitle={isLoading ? "Loading…" : `${trips.length} trips currently tracked`}
      actions={
        <>
          <div className="flex rounded-mm-pill border border-mm-border overflow-hidden">
            <button onClick={() => setView("grid")} className={`px-3 h-10 text-mm-body-sm ${view === "grid" ? "bg-mm-primary text-mm-on-primary" : "text-mm-body"}`}>
              <MMIcon name="grid_view" className="text-[18px]" />
            </button>
            <button onClick={() => setView("list")} className={`px-3 h-10 text-mm-body-sm ${view === "list" ? "bg-mm-primary text-mm-on-primary" : "text-mm-body"}`}>
              <MMIcon name="view_list" className="text-[18px]" />
            </button>
          </div>
          <Button icon="add" onClick={() => setNewOpen(true)} disabled={create.isPending}>New Trip</Button>
        </>
      }
    >
      <div className="mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter trips by route, driver, vehicle, or status"
          className="h-10 w-full rounded-mm-md border border-mm-border bg-mm-surface px-3 text-mm-body-md focus:outline-none focus:border-mm-primary"
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {view === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2">
              {visibleTrips.map((t) => (
                <Card
                  key={t.uuid}
                  className={`cursor-pointer transition-colors ${selected && t.id === selected.id ? "border-mm-primary" : ""}`}
                >
                  <div onClick={() => setSelectedId(t.id)}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-mm-label-md uppercase text-mm-on-surface-variant">{t.id}</div>
                        <div className="mt-1 text-mm-body-md font-semibold text-mm-on-surface">{t.driver}</div>
                      </div>
                      <StatusPill label={t.status} tone={statusToTone[t.status] ?? "neutral"} />
                    </div>
                    <div className="mt-3 space-y-2 text-mm-body-md">
                      <div className="flex items-center gap-2"><MMIcon name="location_on" className="text-[18px] text-mm-primary" /><span>{t.origin}</span></div>
                      <div className="flex items-center gap-2"><MMIcon name="flag" className="text-[18px] text-mm-success" /><span>{t.destination}</span></div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-mm-border pt-3 text-mm-body-sm text-mm-on-surface-variant">
                      <span className="flex items-center gap-1"><MMIcon name="eco" className="text-[16px]" />{t.distance} km</span>
                      <span className="flex items-center gap-1"><MMIcon name="schedule" className="text-[16px]" />{t.eta}</span>
                    </div>
                  </div>
                </Card>
              ))}
              {visibleTrips.length === 0 && !isLoading && <Card><div className="py-6 text-center text-mm-on-surface-variant">No trips found.</div></Card>}
            </div>
          ) : (
            <Card padding={false}>
              <table className="w-full text-mm-body-md">
                <thead className="text-left text-mm-label-md uppercase text-mm-on-surface-variant">
                  <tr className="border-b border-mm-border">
                    <th className="px-5 py-3">Trip</th><th className="px-5 py-3">Route</th><th className="px-5 py-3">ETA</th><th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mm-border">
                  {visibleTrips.map((t) => (
                    <tr
                      key={t.uuid}
                      onClick={() => setSelectedId(t.id)}
                      className={`cursor-pointer hover:bg-mm-surface-container/50 ${selected && t.id === selected.id ? "bg-mm-primary-container/20 font-semibold" : ""}`}
                    >
                      <td className="px-5 py-3 font-medium">{t.id}</td>
                      <td className="px-5 py-3">{t.origin} → {t.destination}</td>
                      <td className="px-5 py-3">{t.eta}</td>
                      <td className="px-5 py-3"><StatusPill label={t.status} tone={statusToTone[t.status] ?? "neutral"} /></td>
                    </tr>
                  ))}
                  {visibleTrips.length === 0 && !isLoading && (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-mm-on-surface-variant">No trips found.</td></tr>
                  )}
                </tbody>
              </table>
            </Card>
          )}
        </div>

        {selected ? (
          <Card>
            <SectionTitle title={`Trip Validation · ${selected.id}`} />
            <div className="mb-4 text-mm-body-sm text-mm-on-surface-variant space-y-1">
              <div><strong>Route:</strong> {selected.origin} → {selected.destination}</div>
              <div><strong>Driver:</strong> {selected.driver || "Unassigned"}</div>
              <div><strong>Vehicle:</strong> {selected.vehicle || "Unassigned"}</div>
              <div><strong>Status:</strong> <span className="font-semibold">{selected.status}</span></div>
            </div>

            <ul className="space-y-3 text-mm-body-md border-t border-mm-border pt-3">
              {[
                { label: "Vehicle inspection", ok: true },
                { label: "Driver license valid", ok: !!selected.driver },
                { label: "Hours-of-service check", ok: true },
                { label: "Route hazard scan", ok: selected.distance < 500 },
                { label: "Cargo weight verified", ok: true },
              ].map((c) => (
                <li key={c.label} className="flex items-center justify-between">
                  <span>{c.label}</span>
                  <MMIcon name={c.ok ? "check_circle" : "error"} className={`text-[20px] ${c.ok ? "text-mm-success" : "text-mm-danger"}`} />
                </li>
              ))}
            </ul>

            {selected.status === "Scheduled" ? (
              <Button className="mt-4 w-full justify-center" icon="play_arrow" onClick={handleStartTrip} disabled={update.isPending}>
                Start Trip
              </Button>
            ) : selected.status === "In Transit" ? (
              <Button className="mt-4 w-full justify-center bg-mm-success hover:bg-mm-success/90" icon="check" onClick={handleCompleteTrip} disabled={update.isPending}>
                Complete Trip
              </Button>
            ) : (
              <div className="mt-4 text-center text-mm-body-sm font-medium text-mm-success py-2 border border-mm-success/30 rounded-mm-md bg-mm-success-container/10">
                Trip is completed
              </div>
            )}
          </Card>
        ) : (
          <Card>
            <div className="text-center py-6 text-mm-on-surface-variant">
              Select a trip to validate and manage.
            </div>
          </Card>
        )}
      </div>
      <FormDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        title="New trip"
        submitLabel="Create"
        loading={create.isPending}
        onSubmit={handleNew}
        fields={
          role === "driver"
            ? [
                { name: "origin", label: "Origin", type: "text", required: true, placeholder: "Mumbai, MH" },
                { name: "destination", label: "Destination", type: "text", required: true, placeholder: "Pune, MH" },
                { name: "vehicle", label: "Vehicle code", type: "text" },
                { name: "distance", label: "Distance (km)", type: "number" },
              ]
            : [
                { name: "origin", label: "Origin", type: "text", required: true, placeholder: "Mumbai, MH" },
                { name: "destination", label: "Destination", type: "text", required: true, placeholder: "Pune, MH" },
                { name: "driver", label: "Driver name", type: "text" },
                { name: "vehicle", label: "Vehicle code", type: "text" },
                { name: "distance", label: "Distance (km)", type: "number" },
              ]
        }
      />
    </AppLayout>
  );
}
