export type VehicleStatus = "On Route" | "Idle" | "Maintenance" | "Charging" | "Offline";

import driver1 from "@/assets/driver1.png.asset.json";
import driver2 from "@/assets/driver2.png.asset.json";
import driver3 from "@/assets/driver3.png.asset.json";

// Indian Rupee formatter — grouping like ₹1,20,000
export const formatINR = (amount: number, opts: { maximumFractionDigits?: number } = {}) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: opts.maximumFractionDigits ?? 0,
  }).format(amount);

export const vehicles = [
  { id: "MH12-AB-9021", type: "Tata Prima 4028.S", driver: "Ramesh Patel", status: "On Route" as VehicleStatus, fuel: 68, mileage: 84210, location: "NH48, Ahmedabad" },
  { id: "GJ01-CD-4412", type: "Ashok Leyland 4225", driver: "Suresh Chauhan", status: "Idle" as VehicleStatus, fuel: 45, mileage: 121440, location: "Surat Depot" },
  { id: "MH14-EF-7788", type: "BharatBenz 2823R", driver: "Krish Nair", status: "Maintenance" as VehicleStatus, fuel: 12, mileage: 205110, location: "Bay 3 · Pune" },
  { id: "GJ05-GH-3301", type: "Eicher Pro 6055", driver: "Ajit Pandey", status: "On Route" as VehicleStatus, fuel: 82, mileage: 56320, location: "NH8, Vadodara" },
  { id: "KA01-IJ-5540", type: "Tata Signa 4825", driver: "Dev Kishan", status: "Charging" as VehicleStatus, fuel: 30, mileage: 98720, location: "Bangalore Yard" },
  { id: "GJ03-KL-1120", type: "Tata Ultra T.7 EV", driver: "Krunal Modi", status: "On Route" as VehicleStatus, fuel: 91, mileage: 22140, location: "NH8, Rajkot" },
];

export const drivers = [
  { id: "DR-001", name: "Ramesh Patel",   license: "GJ01 20230012345", phone: "+91 98250 12345", city: "Ahmedabad", score: 96, status: "On Duty",  trips: 128, hoursWeek: 42, photo: driver1.url },
  { id: "DR-002", name: "Suresh Chauhan", license: "GJ05 20220098765", phone: "+91 99098 87654", city: "Vadodara",  score: 92, status: "On Duty",  trips: 210, hoursWeek: 38, photo: driver2.url },
  { id: "DR-003", name: "Krish Nair",     license: "KA01 20210056789", phone: "+91 98450 34567", city: "Bangalore", score: 88, status: "Off Duty", trips: 76,  hoursWeek: 12, photo: null as string | null },
  { id: "DR-004", name: "Ajit Pandey",    license: "MH12 20230034521", phone: "+91 98220 11223", city: "Pune",      score: 97, status: "On Duty",  trips: 154, hoursWeek: 40, photo: driver3.url },
  { id: "DR-005", name: "Dev Kishan",     license: "GJ03 20220076543", phone: "+91 99045 22334", city: "Rajkot",    score: 84, status: "Break",    trips: 92,  hoursWeek: 22, photo: null as string | null },
  { id: "DR-006", name: "Krunal Modi",    license: "GJ05 20240087654", phone: "+91 98240 55667", city: "Surat",     score: 95, status: "On Duty",  trips: 188, hoursWeek: 44, photo: null as string | null },
];

export const trips = [
  { id: "TRP-4821", origin: "Ahmedabad, GJ", destination: "Vadodara, GJ",  driver: "Ramesh Patel",   vehicle: "MH12-AB-9021", status: "In Transit", eta: "3h 12m",         distance: 112 },
  { id: "TRP-4820", origin: "Surat, GJ",     destination: "Mumbai, MH",    driver: "Suresh Chauhan", vehicle: "GJ01-CD-4412", status: "Scheduled",  eta: "Tomorrow 08:00", distance: 285 },
  { id: "TRP-4818", origin: "Pune, MH",      destination: "Mumbai, MH",    driver: "Ajit Pandey",    vehicle: "GJ05-GH-3301", status: "In Transit", eta: "1h 40m",         distance: 150 },
  { id: "TRP-4815", origin: "Rajkot, GJ",    destination: "Ahmedabad, GJ", driver: "Krunal Modi",    vehicle: "GJ03-KL-1120", status: "Completed",  eta: "Delivered",      distance: 215 },
  { id: "TRP-4812", origin: "Bangalore, KA", destination: "Mysore, KA",    driver: "Dev Kishan",     vehicle: "KA01-IJ-5540", status: "Delayed",    eta: "+45m",           distance: 145 },
];

export const workOrders = [
  { id: "WO-2201", title: "Brake Pad Replacement", vehicle: "MH14-EF-7788", priority: "High",   status: "In Progress", assignee: "Bay 3 · Pune",     updated: "2h ago" },
  { id: "WO-2200", title: "Oil & Filter Service",  vehicle: "GJ01-CD-4412", priority: "Medium", status: "Scheduled",   assignee: "Surat Depot",      updated: "Yesterday" },
  { id: "WO-2199", title: "Tire Rotation",         vehicle: "GJ05-GH-3301", priority: "Low",    status: "Completed",   assignee: "Vadodara Yard",    updated: "Mon" },
  { id: "WO-2198", title: "DEF System Diagnostic", vehicle: "KA01-IJ-5540", priority: "High",   status: "Open",        assignee: "Bangalore Yard",   updated: "3h ago" },
];

// Fuel in litres, cost in INR
export const fuelEntries = [
  { date: "2026-07-11", vehicle: "MH12-AB-9021", driver: "Ramesh Patel",   litres: 160.5, cost: 15890, station: "IndianOil #421 · Ahmedabad" },
  { date: "2026-07-11", vehicle: "GJ01-CD-4412", driver: "Suresh Chauhan", litres: 210.2, cost: 20820, station: "HPCL #88 · Surat" },
  { date: "2026-07-10", vehicle: "GJ05-GH-3301", driver: "Ajit Pandey",    litres: 145.0, cost: 14360, station: "BPCL #112 · Vadodara" },
  { date: "2026-07-10", vehicle: "KA01-IJ-5540", driver: "Dev Kishan",     litres: 182.4, cost: 18065, station: "IndianOil #302 · Bangalore" },
  { date: "2026-07-09", vehicle: "GJ03-KL-1120", driver: "Krunal Modi",    litres: 0,     cost: 640,   station: "Depot Charger · Rajkot" },
];

export const alerts = [
  { id: "AL-01", severity: "danger",  title: "Brake sensor fault",         vehicle: "MH14-EF-7788", time: "12 min ago" },
  { id: "AL-02", severity: "warning", title: "Fuel below 15%",             vehicle: "MH14-EF-7788", time: "38 min ago" },
  { id: "AL-03", severity: "info",    title: "Route deviation resolved",   vehicle: "GJ05-GH-3301", time: "1h ago" },
];

export const statusToTone: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  "On Route": "success",
  "In Transit": "success",
  "Completed": "success",
  "On Duty": "success",
  "Idle": "warning",
  "Scheduled": "info",
  "Charging": "info",
  "Break": "warning",
  "Off Duty": "neutral",
  "Offline": "neutral",
  "Maintenance": "danger",
  "Delayed": "danger",
  "Open": "warning",
  "In Progress": "info",
};
