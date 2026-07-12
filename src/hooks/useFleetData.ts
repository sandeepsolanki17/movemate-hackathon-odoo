import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { VehicleStatus } from "@/mock/fleet";

export type Vehicle = {
  id: string; // code (e.g. MH12-AB-9021) — kept name `id` for UI compat
  uuid: string;
  type: string;
  driver: string;
  status: VehicleStatus | string;
  fuel: number;
  mileage: number;
  location: string;
};

export type Driver = {
  id: string;
  uuid: string;
  name: string;
  license: string;
  phone: string;
  city: string;
  score: number;
  status: string;
  trips: number;
  hoursWeek: number;
  photo: string | null;
};

export type Trip = {
  id: string;
  uuid: string;
  origin: string;
  destination: string;
  driver: string;
  vehicle: string;
  status: string;
  eta: string;
  distance: number;
};

export type WorkOrder = {
  id: string;
  uuid: string;
  title: string;
  vehicle: string;
  priority: string;
  status: string;
  assignee: string;
  updated: string;
};

export type FuelEntry = {
  id: string;
  date: string;
  vehicle: string;
  driver: string;
  litres: number;
  cost: number;
  station: string;
  user_id: string | null;
};

export type FleetAlert = {
  id: string;
  severity: string;
  title: string;
  vehicle: string;
  time: string;
};

export function useVehicles(opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["vehicles"],
    enabled: opts?.enabled ?? true,
    queryFn: async (): Promise<Vehicle[]> => {
      const { data, error } = await supabase.from("vehicles").select("*").order("code");
      if (error) throw error;
      return (data ?? []).map((v) => ({
        id: v.code, uuid: v.id, type: v.type, driver: v.driver,
        status: v.status, fuel: v.fuel, mileage: v.mileage, location: v.location,
      }));
    },
  });
}

export function useDrivers() {
  return useQuery({
    queryKey: ["drivers"],
    queryFn: async (): Promise<Driver[]> => {
      const { data, error } = await supabase.from("drivers").select("*").order("code");
      if (error) throw error;
      return (data ?? []).map((d) => ({
        id: d.code, uuid: d.id, name: d.name, license: d.license, phone: d.phone,
        city: d.city, score: d.score, status: d.status, trips: d.trips,
        hoursWeek: d.hours_week, photo: d.photo,
      }));
    },
  });
}

export function useTrips() {
  return useQuery({
    queryKey: ["trips"],
    queryFn: async (): Promise<Trip[]> => {
      const { data, error } = await supabase.from("trips").select("*").order("code", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((t) => ({
        id: t.code, uuid: t.id, origin: t.origin, destination: t.destination,
        driver: t.driver, vehicle: t.vehicle, status: t.status, eta: t.eta, distance: t.distance,
      }));
    },
  });
}

export function useWorkOrders() {
  return useQuery({
    queryKey: ["work_orders"],
    queryFn: async (): Promise<WorkOrder[]> => {
      const { data, error } = await supabase.from("work_orders").select("*").order("code", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((w) => ({
        id: w.code, uuid: w.id, title: w.title, vehicle: w.vehicle,
        priority: w.priority, status: w.status, assignee: w.assignee, updated: w.updated_label,
      }));
    },
  });
}

export function useFuelEntries(opts?: { mine?: boolean }) {
  return useQuery({
    queryKey: ["fuel_entries", opts?.mine ? "mine" : "all"],
    queryFn: async (): Promise<FuelEntry[]> => {
      let query = supabase.from("fuel_entries").select("*").order("entry_date", { ascending: false });
      if (opts?.mine) {
        const { data: userRes } = await supabase.auth.getUser();
        const uid = userRes.user?.id;
        if (uid) query = query.eq("user_id", uid);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map((e) => ({
        id: e.id, date: e.entry_date, vehicle: e.vehicle, driver: e.driver,
        litres: Number(e.litres), cost: Number(e.cost), station: e.station, user_id: e.user_id,
      }));
    },
  });
}

export function useAlerts() {
  return useQuery({
    queryKey: ["fleet_alerts"],
    queryFn: async (): Promise<FleetAlert[]> => {
      const { data, error } = await supabase.from("fleet_alerts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((a) => ({
        id: a.code, severity: a.severity, title: a.title, vehicle: a.vehicle, time: a.time_label,
      }));
    },
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────
export function useLogFuelEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      date: string; vehicle: string; station: string; litres: number; cost: number; driver: string;
    }) => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id ?? null;
      const { data, error } = await supabase.from("fuel_entries").insert({
        entry_date: input.date,
        vehicle: input.vehicle,
        station: input.station,
        litres: input.litres,
        cost: input.cost,
        driver: input.driver,
        user_id: uid,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fuel_entries"] }),
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Vehicle> & { id: string; type: string }) => {
      const { data, error } = await supabase.from("vehicles").insert({
        code: input.id,
        type: input.type,
        driver: input.driver ?? "",
        status: input.status ?? "Idle",
        fuel: input.fuel ?? 0,
        mileage: input.mileage ?? 0,
        location: input.location ?? "",
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  });
}

export function useUpdateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Vehicle> & { uuid: string }) => {
      const patch: { code?: string; type?: string; driver?: string; status?: string; fuel?: number; mileage?: number; location?: string } = {};
      if (input.id !== undefined) patch.code = input.id;
      if (input.type !== undefined) patch.type = input.type;
      if (input.driver !== undefined) patch.driver = input.driver;
      if (input.status !== undefined) patch.status = input.status;
      if (input.fuel !== undefined) patch.fuel = input.fuel;
      if (input.mileage !== undefined) patch.mileage = input.mileage;
      if (input.location !== undefined) patch.location = input.location;
      const { data, error } = await supabase.from("vehicles").update(patch).eq("id", input.uuid).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  });
}

export function useCreateDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Driver> & { id: string; name: string }) => {
      const { data, error } = await supabase.from("drivers").insert({
        code: input.id, name: input.name,
        license: input.license ?? "", phone: input.phone ?? "", city: input.city ?? "",
        score: input.score ?? 0, status: input.status ?? "Off Duty",
        trips: input.trips ?? 0, hours_week: input.hoursWeek ?? 0, photo: input.photo ?? null,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drivers"] }),
  });
}

export function useUpdateDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Driver> & { uuid: string }) => {
      const patch: {
        code?: string; name?: string; license?: string; phone?: string; city?: string;
        score?: number; status?: string; trips?: number; hours_week?: number; photo?: string | null;
      } = {};
      if (input.id !== undefined) patch.code = input.id;
      if (input.name !== undefined) patch.name = input.name;
      if (input.license !== undefined) patch.license = input.license;
      if (input.phone !== undefined) patch.phone = input.phone;
      if (input.city !== undefined) patch.city = input.city;
      if (input.score !== undefined) patch.score = input.score;
      if (input.status !== undefined) patch.status = input.status;
      if (input.trips !== undefined) patch.trips = input.trips;
      if (input.hoursWeek !== undefined) patch.hours_week = input.hoursWeek;
      if (input.photo !== undefined) patch.photo = input.photo;
      const { data, error } = await supabase.from("drivers").update(patch).eq("id", input.uuid).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drivers"] }),
  });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Trip> & { id: string; origin: string; destination: string }) => {
      const { data, error } = await supabase.from("trips").insert({
        code: input.id, origin: input.origin, destination: input.destination,
        driver: input.driver ?? "", vehicle: input.vehicle ?? "",
        status: input.status ?? "Scheduled", eta: input.eta ?? "", distance: input.distance ?? 0,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}

export function useUpdateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Trip> & { uuid: string }) => {
      const patch: {
        code?: string; origin?: string; destination?: string; driver?: string;
        vehicle?: string; status?: string; eta?: string; distance?: number;
      } = {};
      if (input.id !== undefined) patch.code = input.id;
      if (input.origin !== undefined) patch.origin = input.origin;
      if (input.destination !== undefined) patch.destination = input.destination;
      if (input.driver !== undefined) patch.driver = input.driver;
      if (input.vehicle !== undefined) patch.vehicle = input.vehicle;
      if (input.status !== undefined) patch.status = input.status;
      if (input.eta !== undefined) patch.eta = input.eta;
      if (input.distance !== undefined) patch.distance = input.distance;
      const { data, error } = await supabase.from("trips").update(patch).eq("id", input.uuid).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}

export function useCreateWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<WorkOrder> & { id: string; title: string }) => {
      const { data, error } = await supabase.from("work_orders").insert({
        code: input.id, title: input.title,
        vehicle: input.vehicle ?? "", priority: input.priority ?? "Medium",
        status: input.status ?? "Open", assignee: input.assignee ?? "", updated_label: input.updated ?? "just now",
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["work_orders"] }),
  });
}

export function useUpdateWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<WorkOrder> & { uuid: string }) => {
      const patch: {
        code?: string; title?: string; vehicle?: string; priority?: string;
        status?: string; assignee?: string; updated_label?: string;
      } = {};
      if (input.id !== undefined) patch.code = input.id;
      if (input.title !== undefined) patch.title = input.title;
      if (input.vehicle !== undefined) patch.vehicle = input.vehicle;
      if (input.priority !== undefined) patch.priority = input.priority;
      if (input.status !== undefined) patch.status = input.status;
      if (input.assignee !== undefined) patch.assignee = input.assignee;
      if (input.updated !== undefined) patch.updated_label = input.updated;
      const { data, error } = await supabase.from("work_orders").update(patch).eq("id", input.uuid).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["work_orders"] }),
  });
}
