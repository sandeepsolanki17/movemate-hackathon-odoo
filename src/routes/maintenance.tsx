import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppLayout, MMIcon } from "@/components/mm/AppLayout";
import { Card, StatusPill, Button, SectionTitle } from "@/components/mm/ui";
import { StatusDialog } from "@/components/mm/StatusDialog";
import { FormDialog } from "@/components/mm/FormDialog";
import { statusToTone } from "@/mock/fleet";
import { useWorkOrders, useCreateWorkOrder, useUpdateWorkOrder } from "@/hooks/useFleetData";

export const Route = createFileRoute("/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance · MoveMate" }] }),
  component: MaintenancePage,
});

const timeline = [
  { time: "Today · 10:24", label: "Parts received from vendor", by: "System" },
  { time: "Today · 09:10", label: "Work order accepted", by: "J. Alvarez" },
  { time: "Yesterday · 16:45", label: "Diagnostic complete — brake pads worn", by: "M. Chen" },
  { time: "Yesterday · 14:02", label: "Vehicle checked into Bay 3", by: "Front Desk" },
];

function MaintenancePage() {
  const { data: workOrders = [], isLoading } = useWorkOrders();
  const create = useCreateWorkOrder();
  const update = useUpdateWorkOrder();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);

  useEffect(() => {
    if (!selectedId && workOrders.length > 0) setSelectedId(workOrders[0].id);
  }, [workOrders, selectedId]);
  const visibleWorkOrders = query.trim()
    ? workOrders.filter((w) => `${w.id} ${w.title} ${w.vehicle} ${w.priority} ${w.status} ${w.assignee}`.toLowerCase().includes(query.trim().toLowerCase()))
    : workOrders;
  const selected = workOrders.find((w) => w.id === selectedId) ?? visibleWorkOrders[0] ?? workOrders[0];

  async function handleNew(v: Record<string, string>) {
    const id = `WO-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      await create.mutateAsync({ id, title: v.title.trim(), vehicle: v.vehicle.trim(), priority: v.priority, assignee: v.assignee.trim(), status: "Open", updated: "just now" });
      toast.success("Work order created");
      setNewOpen(false);
    } catch (e) { toast.error((e as Error).message); }
  }

  async function handleUpdateStatus(status: string) {
    if (!selected) return;
    try {
      await update.mutateAsync({ uuid: selected.uuid, status, updated: "just now" });
      toast.success("Work order updated");
      setStatusDialogOpen(false);
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <AppLayout
      title="Maintenance"
      subtitle={isLoading ? "Loading…" : "Track work orders across every service bay."}
      actions={<><Button variant="outline" icon="filter_list" onClick={() => setFilterOpen((v) => !v)}>Filter</Button><Button icon="add" onClick={() => setNewOpen(true)} disabled={create.isPending}>New Work Order</Button></>}
    >
      {filterOpen && (
        <div className="mb-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by work order, vehicle, priority, status, or assignee"
            className="h-10 w-full rounded-mm-md border border-mm-border bg-mm-surface px-3 text-mm-body-md focus:outline-none focus:border-mm-primary"
          />
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-2">
          {visibleWorkOrders.map((w) => (
            <Card key={w.uuid} className={`cursor-pointer ${w.id === selected?.id ? "border-mm-primary" : ""}`}>
              <div onClick={() => setSelectedId(w.id)} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-mm-md bg-mm-primary-container">
                    <MMIcon name="build" className="text-[20px] text-mm-on-surface" />
                  </div>
                  <div>
                    <div className="text-mm-body-md font-semibold text-mm-on-surface">{w.title}</div>
                    <div className="text-mm-body-sm text-mm-on-surface-variant">{w.vehicle} · {w.assignee}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-mm-body-sm text-mm-on-surface-variant">{w.updated}</span>
                  <StatusPill label={w.status} tone={statusToTone[w.status] ?? "neutral"} />
                </div>
              </div>
            </Card>
          ))}
          {visibleWorkOrders.length === 0 && !isLoading && <Card><div className="py-6 text-center text-mm-on-surface-variant">No work orders found.</div></Card>}
        </div>

        {selected && (
          <Card>
            <SectionTitle title={selected.title} />
            <div className="space-y-3 text-mm-body-md">
              <Row label="Work order" value={selected.id} />
              <Row label="Vehicle" value={selected.vehicle} />
              <Row label="Priority" value={selected.priority} />
              <Row label="Assigned to" value={selected.assignee} />
            </div>
            <Button className="mt-4 w-full justify-center" icon="published_with_changes" onClick={() => setStatusDialogOpen(true)} disabled={update.isPending}>Update Status</Button>
            <StatusDialog
              open={statusDialogOpen}
              onOpenChange={setStatusDialogOpen}
              title="Update work order status"
              description={selected.title}
              options={["Open", "In Progress", "On Hold", "Completed", "Cancelled"]}
              initial={selected.status}
              onConfirm={handleUpdateStatus}
              loading={update.isPending}
            />
            <div className="mt-5">
              <div className="text-mm-label-md uppercase text-mm-on-surface-variant mb-3">Status Updates</div>
              <ol className="relative border-l border-mm-border pl-4 space-y-4">
                {timeline.map((t, i) => (
                  <li key={i}>
                    <div className="absolute -left-1.5 size-3 rounded-mm-pill bg-mm-primary" />
                    <div className="text-mm-body-md text-mm-on-surface">{t.label}</div>
                    <div className="text-mm-body-sm text-mm-on-surface-variant">{t.time} · {t.by}</div>
                  </li>
                ))}
              </ol>
            </div>
          </Card>
        )}
      </div>
      <FormDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        title="New work order"
        submitLabel="Create"
        loading={create.isPending}
        onSubmit={handleNew}
        fields={[
          { name: "title", label: "Work order title", type: "text", required: true },
          { name: "vehicle", label: "Vehicle code", type: "text" },
          { name: "priority", label: "Priority", type: "select", options: ["Low", "Medium", "High"], defaultValue: "Medium" },
          { name: "assignee", label: "Assignee / Bay", type: "text" },
        ]}
      />
    </AppLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-mm-on-surface-variant">{label}</span>
      <span className="font-medium text-mm-on-surface">{value}</span>
    </div>
  );
}
