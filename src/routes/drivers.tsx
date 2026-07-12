import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppLayout, MMIcon } from "@/components/mm/AppLayout";
import { Card, StatusPill, Button, SectionTitle } from "@/components/mm/ui";
import { StatusDialog } from "@/components/mm/StatusDialog";
import { FormDialog } from "@/components/mm/FormDialog";
import { statusToTone } from "@/mock/fleet";
import { useAuth } from "@/hooks/useAuth";
import { useDrivers, useCreateDriver, useUpdateDriver, useCreateTrip, useTrips } from "@/hooks/useFleetData";

export const Route = createFileRoute("/drivers")({
  head: () => ({ meta: [{ title: "Drivers · MoveMate" }] }),
  component: DriversPage,
});

function DriversPage() {
  const { data: drivers = [], isLoading } = useDrivers();
  const { data: trips = [] } = useTrips();
  const create = useCreateDriver();
  const update = useUpdateDriver();
  const createTrip = useCreateTrip();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const { can } = useAuth();
  const canEditDriver = can("driver:edit");
  const canAssignTrip = can("trip:dispatch");

  useEffect(() => {
    if (!selectedId && drivers.length > 0) setSelectedId(drivers[0].id);
  }, [drivers, selectedId]);

  const visibleDrivers = query.trim()
    ? drivers.filter((d) => `${d.id} ${d.name} ${d.license} ${d.phone} ${d.city} ${d.status}`.toLowerCase().includes(query.trim().toLowerCase()))
    : drivers;
  const selected = drivers.find((d) => d.id === selectedId) ?? visibleDrivers[0] ?? drivers[0];

  async function handleAdd(v: Record<string, string>) {
    const id = v.id.trim() || `DR-${Date.now().toString().slice(-4)}`;
    try {
      await create.mutateAsync({ id, name: v.name.trim(), license: v.license.trim(), phone: v.phone.trim(), city: v.city.trim(), score: 90, status: "On Duty", trips: 0, hoursWeek: 0 });
      toast.success("Driver added");
      setAddOpen(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function handleUpdateDriverStatus(status: string) {
    if (!selected) return;
    try {
      await update.mutateAsync({ uuid: selected.uuid, status });
      toast.success("Driver status updated");
      setStatusDialogOpen(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function handleAssignTrip(v: Record<string, string>) {
    if (!selected) return;

    // Prevent assigning if the driver already has an active (incomplete) trip
    const hasActiveTrip = trips.some(
      (t) => t.driver.trim().toLowerCase() === selected.name.trim().toLowerCase() && t.status !== "Completed"
    );
    if (hasActiveTrip) {
      toast.error(`Driver "${selected.name}" already has an active trip assigned.`);
      return;
    }

    const distance = parseInt(v.distance || "0", 10);
    try {
      await createTrip.mutateAsync({
        id: `TRP-${Math.floor(1000 + Math.random() * 9000)}`,
        origin: v.origin.trim(),
        destination: v.destination.trim(),
        driver: selected.name,
        vehicle: v.vehicle.trim(),
        distance,
        status: "Scheduled",
        eta: "Pending",
      });
      await update.mutateAsync({ uuid: selected.uuid, trips: selected.trips + 1, status: "On Duty" });
      toast.success("Trip assigned");
      setAssignOpen(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const selectedDriverHasActiveTrip = trips.some(
    (t) => selected && t.driver.trim().toLowerCase() === selected.name.trim().toLowerCase() && t.status !== "Completed"
  );

  return (
    <AppLayout
      title="Driver Management"
      subtitle={isLoading ? "Loading…" : `${drivers.length} drivers on the roster`}
      actions={
        <>
          <Button variant="outline" icon="filter_list" onClick={() => setFilterOpen((v) => !v)}>Filter</Button>
          {canEditDriver && <Button icon="person_add" onClick={() => setAddOpen(true)} disabled={create.isPending}>Add Driver</Button>}
        </>
      }
    >
      {filterOpen && (
        <div className="mb-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by driver, license, city, or status"
            className="h-10 w-full rounded-mm-md border border-mm-border bg-mm-surface px-3 text-mm-body-md focus:outline-none focus:border-mm-primary"
          />
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-2">
          {visibleDrivers.map((d) => (
            <Card
              key={d.uuid}
              className={`cursor-pointer transition-colors ${d.id === selected?.id ? "border-mm-primary" : ""}`}
            >
              <div onClick={() => setSelectedId(d.id)} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {d.photo ? (
                    <div className="size-12 rounded-mm-pill bg-cover bg-center" style={{ backgroundImage: `url('${d.photo}')` }} />
                  ) : (
                    <div className="grid size-12 place-items-center rounded-mm-pill bg-mm-surface-container text-mm-on-surface-variant">
                      <MMIcon name="person" className="text-[24px]" />
                    </div>
                  )}
                  <div>
                    <div className="text-mm-body-md font-semibold text-mm-on-surface">{d.name}</div>
                    <div className="text-mm-body-sm text-mm-on-surface-variant">DL {d.license} · {d.trips} trips</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-mm-headline-sm text-mm-primary">{d.score}</div>
                    <div className="text-mm-label-sm text-mm-on-surface-variant uppercase">Safety</div>
                  </div>
                  <StatusPill label={d.status} tone={statusToTone[d.status] ?? "neutral"} />
                </div>
              </div>
            </Card>
          ))}
          {visibleDrivers.length === 0 && !isLoading && (
            <Card><div className="py-6 text-center text-mm-on-surface-variant">No drivers found.</div></Card>
          )}
        </div>

        {selected && (
          <Card>
            <SectionTitle title="Driver Details" />
            <div className="flex flex-col items-center gap-3 pb-4">
              {selected.photo ? (
                <div className="size-24 rounded-mm-pill bg-cover bg-center" style={{ backgroundImage: `url('${selected.photo}')` }} />
              ) : (
                <div className="grid size-24 place-items-center rounded-mm-pill bg-mm-surface-container text-mm-on-surface-variant">
                  <MMIcon name="person" className="text-[48px]" />
                </div>
              )}
              <div className="text-center">
                <div className="text-mm-headline-sm text-mm-on-surface">{selected.name}</div>
                <div className="text-mm-body-sm text-mm-on-surface-variant">DL · {selected.license}</div>
              </div>
            </div>
            <div className="space-y-3 text-mm-body-md">
              <Row icon="star" label="Safety score" value={String(selected.score)} />
              <Row icon="route" label="Total trips" value={String(selected.trips)} />
              <Row icon="schedule" label="Hours this week" value={`${selected.hoursWeek}h`} />
              <Row icon="call" label="Contact" value={selected.phone} />
              <Row icon="location_city" label="Base city" value={selected.city} />
              <Row icon="badge" label="Status" value={selected.status} />
            </div>
            {(canEditDriver || canAssignTrip) && (
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex gap-2">
                  {canEditDriver && <Button variant="outline" icon="published_with_changes" onClick={() => setStatusDialogOpen(true)} disabled={update.isPending}>Update Status</Button>}
                  {canAssignTrip && (
                    <Button 
                      icon="assignment" 
                      onClick={() => setAssignOpen(true)} 
                      disabled={createTrip.isPending || update.isPending || selectedDriverHasActiveTrip}
                    >
                      Assign trip
                    </Button>
                  )}
                </div>
                {selectedDriverHasActiveTrip && (
                  <p className="text-xs text-mm-danger font-medium mt-1">
                    * Driver has an active trip and cannot be assigned a new one.
                  </p>
                )}
              </div>
            )}
            <StatusDialog
              open={statusDialogOpen}
              onOpenChange={setStatusDialogOpen}
              title={`Update status for ${selected.name}`}
              options={["On Duty", "Off Duty", "On Leave", "Suspended", "Training"]}
              initial={selected.status}
              onConfirm={handleUpdateDriverStatus}
              loading={update.isPending}
            />
            <FormDialog
              open={assignOpen}
              onOpenChange={setAssignOpen}
              title={`Assign trip to ${selected.name}`}
              submitLabel="Assign"
              loading={createTrip.isPending || update.isPending}
              onSubmit={handleAssignTrip}
              fields={[
                { name: "origin", label: "Origin", type: "text", required: true },
                { name: "destination", label: "Destination", type: "text", required: true },
                { name: "vehicle", label: "Vehicle code", type: "text" },
                { name: "distance", label: "Distance (km)", type: "number" },
              ]}
            />
          </Card>
        )}
      </div>
      <FormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add driver"
        submitLabel="Add"
        loading={create.isPending}
        onSubmit={handleAdd}
        fields={[
          { name: "name", label: "Name", type: "text", required: true },
          { name: "id", label: "Driver code", type: "text", placeholder: "DR-010" },
          { name: "license", label: "License number", type: "text" },
          { name: "phone", label: "Phone", type: "text" },
          { name: "city", label: "Base city", type: "text" },
        ]}
      />
    </AppLayout>
  );
}

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-mm-on-surface-variant">
        <MMIcon name={icon} className="text-[18px]" />
        <span>{label}</span>
      </div>
      <span className="font-medium text-mm-on-surface">{value}</span>
    </div>
  );
}
