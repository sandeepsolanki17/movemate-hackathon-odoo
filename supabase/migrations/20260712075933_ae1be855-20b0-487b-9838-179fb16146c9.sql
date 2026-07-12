
-- =========================================================
-- Fleet tables
-- =========================================================
CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  type text NOT NULL,
  driver text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Idle',
  fuel int NOT NULL DEFAULT 0,
  mileage int NOT NULL DEFAULT 0,
  location text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read vehicles"   ON public.vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth write vehicles"  ON public.vehicles FOR ALL    TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  license text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  score int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Off Duty',
  trips int NOT NULL DEFAULT 0,
  hours_week int NOT NULL DEFAULT 0,
  photo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.drivers TO authenticated;
GRANT ALL ON public.drivers TO service_role;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read drivers"  ON public.drivers FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth write drivers" ON public.drivers FOR ALL    TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  origin text NOT NULL,
  destination text NOT NULL,
  driver text NOT NULL DEFAULT '',
  vehicle text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Scheduled',
  eta text NOT NULL DEFAULT '',
  distance int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trips TO authenticated;
GRANT ALL ON public.trips TO service_role;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read trips"  ON public.trips FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth write trips" ON public.trips FOR ALL    TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.work_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  vehicle text NOT NULL DEFAULT '',
  priority text NOT NULL DEFAULT 'Medium',
  status text NOT NULL DEFAULT 'Open',
  assignee text NOT NULL DEFAULT '',
  updated_label text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.work_orders TO authenticated;
GRANT ALL ON public.work_orders TO service_role;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read work_orders"  ON public.work_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth write work_orders" ON public.work_orders FOR ALL    TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.fuel_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date date NOT NULL DEFAULT (now()::date),
  vehicle text NOT NULL,
  driver text NOT NULL DEFAULT '',
  litres numeric(10,2) NOT NULL DEFAULT 0,
  cost numeric(12,2) NOT NULL DEFAULT 0,
  station text NOT NULL DEFAULT '',
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fuel_entries TO authenticated;
GRANT ALL ON public.fuel_entries TO service_role;
ALTER TABLE public.fuel_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read fuel_entries" ON public.fuel_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert fuel_entries" ON public.fuel_entries FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "owner update fuel_entries" ON public.fuel_entries FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "owner delete fuel_entries" ON public.fuel_entries FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.fleet_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  vehicle text NOT NULL DEFAULT '',
  time_label text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fleet_alerts TO authenticated;
GRANT ALL ON public.fleet_alerts TO service_role;
ALTER TABLE public.fleet_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read fleet_alerts"  ON public.fleet_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth write fleet_alerts" ON public.fleet_alerts FOR ALL    TO authenticated USING (true) WITH CHECK (true);

-- updated_at triggers
CREATE TRIGGER trg_vehicles_updated    BEFORE UPDATE ON public.vehicles    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_drivers_updated     BEFORE UPDATE ON public.drivers     FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_trips_updated       BEFORE UPDATE ON public.trips       FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_work_orders_updated BEFORE UPDATE ON public.work_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_fuel_entries_updated BEFORE UPDATE ON public.fuel_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- Seed data
-- =========================================================
INSERT INTO public.vehicles (code, type, driver, status, fuel, mileage, location) VALUES
('MH12-AB-9021','Tata Prima 4028.S','Ramesh Patel','On Route',68,84210,'NH48, Ahmedabad'),
('GJ01-CD-4412','Ashok Leyland 4225','Suresh Chauhan','Idle',45,121440,'Surat Depot'),
('MH14-EF-7788','BharatBenz 2823R','Krish Nair','Maintenance',12,205110,'Bay 3 · Pune'),
('GJ05-GH-3301','Eicher Pro 6055','Ajit Pandey','On Route',82,56320,'NH8, Vadodara'),
('KA01-IJ-5540','Tata Signa 4825','Dev Kishan','Charging',30,98720,'Bangalore Yard'),
('GJ03-KL-1120','Tata Ultra T.7 EV','Krunal Modi','On Route',91,22140,'NH8, Rajkot');

INSERT INTO public.drivers (code, name, license, phone, city, score, status, trips, hours_week) VALUES
('DR-001','Ramesh Patel','GJ01 20230012345','+91 98250 12345','Ahmedabad',96,'On Duty',128,42),
('DR-002','Suresh Chauhan','GJ05 20220098765','+91 99098 87654','Vadodara',92,'On Duty',210,38),
('DR-003','Krish Nair','KA01 20210056789','+91 98450 34567','Bangalore',88,'Off Duty',76,12),
('DR-004','Ajit Pandey','MH12 20230034521','+91 98220 11223','Pune',97,'On Duty',154,40),
('DR-005','Dev Kishan','GJ03 20220076543','+91 99045 22334','Rajkot',84,'Break',92,22),
('DR-006','Krunal Modi','GJ05 20240087654','+91 98240 55667','Surat',95,'On Duty',188,44);

INSERT INTO public.trips (code, origin, destination, driver, vehicle, status, eta, distance) VALUES
('TRP-4821','Ahmedabad, GJ','Vadodara, GJ','Ramesh Patel','MH12-AB-9021','In Transit','3h 12m',112),
('TRP-4820','Surat, GJ','Mumbai, MH','Suresh Chauhan','GJ01-CD-4412','Scheduled','Tomorrow 08:00',285),
('TRP-4818','Pune, MH','Mumbai, MH','Ajit Pandey','GJ05-GH-3301','In Transit','1h 40m',150),
('TRP-4815','Rajkot, GJ','Ahmedabad, GJ','Krunal Modi','GJ03-KL-1120','Completed','Delivered',215),
('TRP-4812','Bangalore, KA','Mysore, KA','Dev Kishan','KA01-IJ-5540','Delayed','+45m',145);

INSERT INTO public.work_orders (code, title, vehicle, priority, status, assignee, updated_label) VALUES
('WO-2201','Brake Pad Replacement','MH14-EF-7788','High','In Progress','Bay 3 · Pune','2h ago'),
('WO-2200','Oil & Filter Service','GJ01-CD-4412','Medium','Scheduled','Surat Depot','Yesterday'),
('WO-2199','Tire Rotation','GJ05-GH-3301','Low','Completed','Vadodara Yard','Mon'),
('WO-2198','DEF System Diagnostic','KA01-IJ-5540','High','Open','Bangalore Yard','3h ago');

INSERT INTO public.fuel_entries (entry_date, vehicle, driver, litres, cost, station) VALUES
('2026-07-11','MH12-AB-9021','Ramesh Patel',160.5,15890,'IndianOil #421 · Ahmedabad'),
('2026-07-11','GJ01-CD-4412','Suresh Chauhan',210.2,20820,'HPCL #88 · Surat'),
('2026-07-10','GJ05-GH-3301','Ajit Pandey',145.0,14360,'BPCL #112 · Vadodara'),
('2026-07-10','KA01-IJ-5540','Dev Kishan',182.4,18065,'IndianOil #302 · Bangalore'),
('2026-07-09','GJ03-KL-1120','Krunal Modi',0,640,'Depot Charger · Rajkot');

INSERT INTO public.fleet_alerts (code, severity, title, vehicle, time_label) VALUES
('AL-01','danger','Brake sensor fault','MH14-EF-7788','12 min ago'),
('AL-02','warning','Fuel below 15%','MH14-EF-7788','38 min ago'),
('AL-03','info','Route deviation resolved','GJ05-GH-3301','1h ago');
