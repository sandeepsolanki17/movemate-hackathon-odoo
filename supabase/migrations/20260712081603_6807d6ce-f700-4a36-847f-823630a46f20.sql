DROP POLICY IF EXISTS "role read drivers" ON public.drivers;
DROP POLICY IF EXISTS "role read vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "role read trips" ON public.trips;
DROP POLICY IF EXISTS "manager driver write trips" ON public.trips;

CREATE POLICY "role read drivers"
ON public.drivers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('fleet_manager', 'safety_officer', 'financial_analyst')
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'driver'
      AND lower(public.drivers.name) IN (
        lower(coalesce(p.full_name, '')),
        lower(split_part(coalesce(p.email, ''), '@', 1))
      )
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
      AND ur.role IN ('fleet_manager', 'safety_officer')
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'driver'
      AND lower(public.vehicles.driver) IN (
        lower(coalesce(p.full_name, '')),
        lower(split_part(coalesce(p.email, ''), '@', 1))
      )
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
      AND ur.role IN ('fleet_manager', 'safety_officer')
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'driver'
      AND lower(public.trips.driver) IN (
        lower(coalesce(p.full_name, '')),
        lower(split_part(coalesce(p.email, ''), '@', 1))
      )
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
      AND ur.role = 'fleet_manager'
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'driver'
      AND lower(public.trips.driver) IN (
        lower(coalesce(p.full_name, '')),
        lower(split_part(coalesce(p.email, ''), '@', 1))
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'fleet_manager'
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'driver'
      AND lower(public.trips.driver) IN (
        lower(coalesce(p.full_name, '')),
        lower(split_part(coalesce(p.email, ''), '@', 1))
      )
  )
);