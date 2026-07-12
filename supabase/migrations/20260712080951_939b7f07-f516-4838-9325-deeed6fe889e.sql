CREATE TYPE public.app_role_new AS ENUM ('fleet_manager', 'safety_officer', 'financial_analyst', 'driver');

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

ALTER TABLE public.user_roles
  ALTER COLUMN role TYPE public.app_role_new
  USING role::text::public.app_role_new;

DROP TYPE public.app_role;

ALTER TYPE public.app_role_new RENAME TO app_role;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;