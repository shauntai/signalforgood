
ALTER TABLE public.system_status
  ADD COLUMN IF NOT EXISTS seed_version text,
  ADD COLUMN IF NOT EXISTS seeded_at timestamp with time zone;
