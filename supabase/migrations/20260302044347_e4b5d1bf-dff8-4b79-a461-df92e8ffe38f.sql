
CREATE TABLE public.generation_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  duration_ms integer,
  cycle_type text NOT NULL DEFAULT 'full',
  cycle_id text,
  status text NOT NULL DEFAULT 'running',
  reason text,
  missions_touched integer DEFAULT 0,
  messages_created integer DEFAULT 0,
  claims_created integer DEFAULT 0,
  citations_created integer DEFAULT 0,
  solutions_created integer DEFAULT 0,
  replays_created integer DEFAULT 0,
  repairs_done integer DEFAULT 0,
  recycles_done integer DEFAULT 0,
  errors jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.generation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read generation_logs"
  ON public.generation_logs
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
