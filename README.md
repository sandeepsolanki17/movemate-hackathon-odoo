# MoveMate — Intelligent Fleet & Logistics Management System

MoveMate is a comprehensive, full-stack fleet management and logistics tracking platform designed for modern transport operations. It provides real-time telemetry, driver safety monitoring, active trip routing, maintenance work order dispatching, and fuel tracking under a robust Role-Based Access Control (RBAC) model.

Built using the cutting-edge **TanStack Start** (React 19 full-stack framework), **Tailwind CSS v4**, and **Supabase** (PostgreSQL database with Row-Level Security).

---

## 🚀 Key Features

*   **Real-time Operations Dashboard**: Track overall fleet status, fuel consumption, active issues, and telemetry overview using interactive visual charts.
*   **Live Telemetry & Vehicle Tracking**: Monitor vehicle health parameters (current location, status: *Idle*, *On Route*, *Maintenance*, *Charging*, current fuel/charge percentage, and total mileage).
*   **Driver Directory & Safety Scores**: Keep tabs on driver details, shift status (*On Duty*, *Off Duty*, *Break*), total trip counts, weekly work hours, and automatic safety scores.
*   **Trip Routing & Logistics Tracking**: View active trips with source, destination, assigned driver, vehicle details, live ETA, and distance metrics.
*   **Maintenance Dispatch (Work Orders)**: Log, prioritize (*High*, *Medium*, *Low*), and track the status (*Open*, *Scheduled*, *In Progress*, *Completed*) of vehicle maintenance requests.
*   **Fuel & Charging Logs**: Track detailed refuel records and EV charging logs containing liters/kWh, costs, dates, and locations.
*   **Role-Based Access Control (RBAC)**: Secure access using Supabase RLS. The system supports custom workspace access tailored for `fleet_manager`, `safety_officer`, `financial_analyst`, and `driver` roles.

---

## 🛠️ Technology Stack

*   **Frontend Framework**: [React 19](https://react.dev/) & [Vite](https://vitejs.dev/)
*   **Routing & State Management**: [TanStack Start](https://tanstack.com/router/latest/docs/start/overview), [TanStack Router](https://tanstack.com/router/latest), and [TanStack Query v5](https://tanstack.com/query/latest)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom Tailwind integration for Vite
*   **UI Components**: Accessible components built with [Radix UI](https://www.radix-ui.com/) and [shadcn/ui](https://ui.shadcn.com/)
*   **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Row-Level Security, Migrations)
*   **Charts & Visualizations**: [Recharts](https://recharts.org/)
*   **Icons**: [Lucide React](https://lucide.dev/)

---

## 📁 Repository Structure

```text
movemate-hackathon-odoo/
├── src/
│   ├── components/            # Reusable UI & custom MoveMate components
│   │   ├── mm/                # MoveMate layout and telemetry dialogs
│   │   └── ui/                # shadcn primitives (dialog, button, table, etc.)
│   ├── hooks/                 # Custom React hooks (useAuth, useFleetData)
│   ├── integrations/
│   │   └── supabase/          # Supabase Client & TypeScript types
│   ├── lib/                   # Utility helpers and error reporting
│   ├── mock/                  # Seed telemetry data configuration
│   └── routes/                # TanStack Router file-based pages
│       ├── dashboard.tsx      # Metrics and telemetry dashboard
│       ├── drivers.tsx        # Driver safety directory
│       ├── fuel-expenses.tsx  # Fuel logging interface
│       ├── maintenance.tsx    # Maintenance work order boards
│       ├── trips.tsx          # Real-time trip routing log
│       ├── vehicles.tsx       # Live vehicle fleet list
│       └── login.tsx          # Secure auth portal
├── supabase/
│   ├── config.toml            # Supabase local environment config
│   └── migrations/            # SQL migration files with schema and RLS policies
├── .env                       # Environment configuration for Supabase access
├── package.json               # Dependencies and script configurations
├── tsconfig.json              # TypeScript engine configurations
└── vite.config.ts             # Vite configuration with TanStack Plugins
```

---

## ⚙️ Local Development Setup

Follow these steps to run the application locally on your machine:

### 1. Prerequisites
Ensure you have either **Node.js** (v18+) or **Bun** installed.

### 2. Clone the Repository & Install Dependencies
```bash
git clone https://github.com/sandeepsolanki17/movemate-hackathon-odoo.git
cd movemate-hackathon-odoo
npm install
# Or if you are using Bun:
# bun install
```

### 3. Environment Variables Setup
Create a `.env` file in the root directory (or use the configured default) and specify your Supabase project parameters:
```env
VITE_SUPABASE_PROJECT_ID="your_supabase_project_id"
VITE_SUPABASE_PUBLISHABLE_KEY="your_supabase_anon_key"
VITE_SUPABASE_URL="https://your_supabase_project_id.supabase.co"
```

### 4. Apply Database Migrations (Supabase CLI)
Initialize your local database or push migrations to your remote Supabase instance:
```bash
supabase link --project-ref your_supabase_project_id
supabase db push
```

### 5. Launch the Development Server
```bash
npm run dev
# Or with Bun:
# bun dev
```
The application will launch locally at `http://localhost:3000`.

---

## 🧩 Database Schema Reference

The PostgreSQL database comprises the following tables:
*   `public.vehicles`: Telemetry markers, status updates, fuel, mileage, and driver assignments.
*   `public.drivers`: Driving credentials, license keys, contact info, shift statuses, and safety scores.
*   `public.trips`: Dispatch schedules, origins/destinations, ETAs, and assigned transports.
*   `public.work_orders`: Maintenance requests, assignee locations, urgency, and statuses.
*   `public.fuel_entries`: Date, liter/charge intake quantity, cost logs, and gas stations.
*   `public.fleet_alerts`: High-severity sensor notifications.
*   `public.user_roles` / `public.profiles`: Core RBAC profile information mapping authentication users to operational roles.
