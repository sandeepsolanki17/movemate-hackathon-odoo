DROP POLICY IF EXISTS "auth write drivers" ON public.drivers;
DROP POLICY IF EXISTS "auth write fleet_alerts" ON public.fleet_alerts;
DROP POLICY IF EXISTS "auth write trips" ON public.trips;
DROP POLICY IF EXISTS "auth write vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "auth write work_orders" ON public.work_orders;
DROP POLICY IF EXISTS "auth read drivers" ON public.drivers;
DROP POLICY IF EXISTS "auth read fleet_alerts" ON public.fleet_alerts;
DROP POLICY IF EXISTS "auth read trips" ON public.trips;
DROP POLICY IF EXISTS "auth read vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "auth read work_orders" ON public.work_orders;
DROP POLICY IF EXISTS "auth read fuel_entries" ON public.fuel_entries;
DROP POLICY IF EXISTS "auth insert fuel_entries" ON public.fuel_entries;
DROP POLICY IF EXISTS "owner update fuel_entries" ON public.fuel_entries;
DROP POLICY IF EXISTS "owner delete fuel_entries" ON public.fuel_entries;

CREATE POLICY "role read drivers"
ON public.drivers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('fleet_manager', 'safety_officer', 'financial_analyst', 'driver')
  )
);

CREATE POLICY "manager safety write drivers"
ON public.drivers
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('fleet_manager', 'safety_officer')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('fleet_manager', 'safety_officer')
  )
);

CREATE POLICY "role read vehicles"
ON public.vehicles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('fleet_manager', 'safety_officer', 'driver')
  )
);

CREATE POLICY "manager write vehicles"
ON public.vehicles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'fleet_manager'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'fleet_manager'
  )
);

CREATE POLICY "role read trips"
ON public.trips
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('fleet_manager', 'safety_officer', 'driver')
  )
);

CREATE POLICY "manager driver write trips"
ON public.trips
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('fleet_manager', 'driver')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('fleet_manager', 'driver')
  )
);

CREATE POLICY "role read work_orders"
ON public.work_orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('fleet_manager', 'safety_officer')
  )
);

CREATE POLICY "manager safety write work_orders"
ON public.work_orders
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('fleet_manager', 'safety_officer')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('fleet_manager', 'safety_officer')
  )
);

CREATE POLICY "role read fleet_alerts"
ON public.fleet_alerts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('fleet_manager', 'safety_officer', 'financial_analyst')
  )
);

CREATE POLICY "manager safety write fleet_alerts"
ON public.fleet_alerts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('fleet_manager', 'safety_officer')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('fleet_manager', 'safety_officer')
  )
);

CREATE POLICY "role read fuel_entries"
ON public.fuel_entries
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('fleet_manager', 'financial_analyst')
  )
);

CREATE POLICY "role insert fuel_entries"
ON public.fuel_entries
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('fleet_manager', 'financial_analyst')
  )
);

CREATE POLICY "role update fuel_entries"
ON public.fuel_entries
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('fleet_manager', 'financial_analyst')
  )
)
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('fleet_manager', 'financial_analyst')
  )
);

CREATE POLICY "role delete fuel_entries"
ON public.fuel_entries
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('fleet_manager', 'financial_analyst')
  )
);