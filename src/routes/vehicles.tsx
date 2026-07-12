import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppLayout, MMIcon } from "@/components/mm/AppLayout";
import { Card, StatusPill, Button, SectionTitle } from "@/components/mm/ui";
import { FormDialog } from "@/components/mm/FormDialog";
import { statusToTone } from "@/mock/fleet";
import { useAuth } from "@/hooks/useAuth";
import { useVehicles, useCreateVehicle, useUpdateVehicle, useCreateWorkOrder } from "@/hooks/useFleetData";

export const Route = createFileRoute("/vehicles")({
  head: () => ({ meta: [{ title: "Vehicles · MoveMate" }] }),
  component: VehiclesPage,
});

function VehiclesPage() {
  const { data: vehicles = [], isLoading } = useVehicles();
  const create = useCreateVehicle();
  const update = useUpdateVehicle();
  const createWorkOrder = useCreateWorkOrder();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const { can } = useAuth();
  const canCreate = can("vehicle:create");
  const canEdit = can("vehicle:edit");
  const canService = can("maintenance:manage");

  useEffect(() => {
    if (!selectedId && vehicles.length > 0) setSelectedId(vehicles[0].id);
  }, [vehicles, selectedId]);

  const visibleVehicles = query.trim()
    ? vehicles.filter((v) => `${v.id} ${v.type} ${v.driver} ${v.location} ${v.status}`.toLowerCase().includes(query.trim().toLowerCase()))
    : vehicles;
  const selected = vehicles.find((v) => v.id === selectedId) ?? visibleVehicles[0] ?? vehicles[0];

  async function handleAdd(v: Record<string, string>) {
    try {
      await create.mutateAsync({
        id: v.code.trim(),
        type: v.type.trim() || "Unknown",
        driver: v.driver.trim(),
        location: v.location.trim() || "Yard",
        status: "Idle",
        fuel: 100,
        mileage: 0,
      });
      toast.success("Vehicle added");
      setAddOpen(false);
    } catch (e) { toast.error((e as Error).message); }
  }

  async function handleEdit(v: Record<string, string>) {
    if (!selected) return;
    const fuel = Math.max(0, Math.min(100, parseInt(v.fuel || "0", 10)));
    try {
      await update.mutateAsync({ uuid: selected.uuid, status: v.status, fuel, location: v.location || selected.location });
      toast.success("Vehicle updated");
      setEditOpen(false);
    } catch (e) { toast.error((e as Error).message); }
  }

  async function handleService(v: Record<string, string>) {
    if (!selected) return;
    try {
      await createWorkOrder.mutateAsync({
        id: `WO-${Math.floor(1000 + Math.random() * 9000)}`,
        title: v.title,
        vehicle: selected.id,
        priority: v.priority,
        assignee: "Service Bay",
        status: "Open",
        updated: "just now",
      });
      toast.success("Service work order created");
      setServiceOpen(false);
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <AppLayout
      title="Vehicle Management"
      subtitle={isLoading ? "Loading fleet…" : `${vehicles.length} vehicles in your fleet`}
      actions={
        <>
          <Button variant="outline" icon="filter_list" onClick={() => setFilterOpen((v) => !v)}>Filter</Button>
          {canCreate && <Button icon="add" onClick={() => setAddOpen(true)} disabled={create.isPending}>Add Vehicle</Button>}
        </>
      }
    >
      {filterOpen && (
        <div className="mb-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by vehicle, driver, location, or status"
            className="h-10 w-full rounded-mm-md border border-mm-border bg-mm-surface px-3 text-mm-body-md focus:outline-none focus:border-mm-primary"
          />
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card padding={false}>
            <table className="w-full text-mm-body-md">
              <thead className="text-left text-mm-label-md uppercase text-mm-on-surface-variant">
                <tr className="border-b border-mm-border">
                  <th className="px-5 py-3">Vehicle</th>
                  <th className="px-5 py-3">Driver</th>
                  <th className="px-5 py-3">Fuel</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mm-border">
                {visibleVehicles.map((v) => (
                  <tr
                    key={v.uuid}
                    onClick={() => setSelectedId(v.id)}
                    className={`cursor-pointer transition-colors ${
                      v.id === selected?.id ? "bg-mm-primary-container/40" : "hover:bg-mm-surface-container"
                    }`}
                  >
                    <td className="px-5 py-3">
                      <div className="font-medium text-mm-on-surface">{v.id}</div>
                      <div className="text-mm-body-sm text-mm-on-surface-variant">{v.type}</div>
                    </td>
                    <td className="px-5 py-3">{v.driver}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 rounded-mm-pill bg-mm-surface-container">
                          <div className="h-full rounded-mm-pill bg-mm-primary" style={{ width: `${v.fuel}%` }} />
                        </div>
                        <span className="text-mm-body-sm">{v.fuel}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill label={v.status} tone={statusToTone[v.status] ?? "neutral"} />
                    </td>
                  </tr>
                ))}
                {visibleVehicles.length === 0 && !isLoading && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-mm-on-surface-variant">No vehicles found.</td></tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>

        {selected && (
          <Card>
            <SectionTitle title="Vehicle Details" />
            <div className="text-mm-headline-sm text-mm-on-surface">{selected.id}</div>
            <div className="text-mm-body-sm text-mm-on-surface-variant">{selected.type}</div>
            <div className="mt-4 space-y-3 text-mm-body-md">
              <DetailRow icon="person" label="Driver" value={selected.driver} />
              <DetailRow icon="local_gas_station" label="Fuel" value={`${selected.fuel}%`} />
              <DetailRow icon="speed" label="Odometer" value={`${selected.mileage.toLocaleString("en-IN")} km`} />
              <DetailRow icon="location_on" label="Location" value={selected.location} />
            </div>
            {(canEdit || canService) && (
              <div className="mt-4 flex gap-2">
                {canEdit && <Button variant="outline" icon="edit" onClick={() => setEditOpen(true)} disabled={update.isPending}>Edit</Button>}
                {canService && <Button icon="build" onClick={() => setServiceOpen(true)} disabled={createWorkOrder.isPending}>Service</Button>}
              </div>
            )}
          </Card>
        )}
      </div>
      <FormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add vehicle"
        submitLabel="Add"
        loading={create.isPending}
        onSubmit={handleAdd}
        fields={[
          { name: "code", label: "Registration", type: "text", required: true, placeholder: "MH12-AB-9021" },
          { name: "type", label: "Type / model", type: "text", placeholder: "Tata Ace" },
          { name: "driver", label: "Assigned driver", type: "text" },
          { name: "location", label: "Current location", type: "text", defaultValue: "Yard" },
        ]}
      />
      {selected && (
        <>
          <FormDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            title={`Edit ${selected.id}`}
            submitLabel="Save"
            loading={update.isPending}
            onSubmit={handleEdit}
            fields={[
              { name: "status", label: "Status", type: "select", options: ["Idle", "On Route", "In Service", "Available", "Retired"], defaultValue: selected.status },
              { name: "fuel", label: "Fuel %", type: "number", defaultValue: selected.fuel },
              { name: "location", label: "Location", type: "text", defaultValue: selected.location },
            ]}
          />
          <FormDialog
            open={serviceOpen}
            onOpenChange={setServiceOpen}
            title={`Schedule service · ${selected.id}`}
            submitLabel="Create"
            loading={createWorkOrder.isPending}
            onSubmit={handleService}
            fields={[
              { name: "title", label: "Work order title", type: "text", required: true, defaultValue: `Service inspection for ${selected.id}` },
              { name: "priority", label: "Priority", type: "select", options: ["Low", "Medium", "High"], defaultValue: "Medium" },
            ]}
          />
        </>
      )}
    </AppLayout>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
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
