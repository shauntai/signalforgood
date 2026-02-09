
-- donation_intents: tracks every donation click (card + external)
CREATE TABLE public.donation_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  method text NOT NULL,
  amount_cents integer,
  page_path text NOT NULL,
  user_agent_hash text,
  ip_hash text,
  status text NOT NULL DEFAULT 'intent',
  stripe_session_id text,
  metadata jsonb
);

ALTER TABLE public.donation_intents ENABLE ROW LEVEL SECURITY;

-- Admin read only
CREATE POLICY "Admins can read donation_intents"
  ON public.donation_intents
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- No public policies at all. Service role inserts only.

-- donation_events: completed donations from webhooks
CREATE TABLE public.donation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  provider text NOT NULL,
  provider_event_id text NOT NULL UNIQUE,
  session_id text,
  amount_cents integer NOT NULL,
  currency text NOT NULL,
  payment_status text NOT NULL
);

ALTER TABLE public.donation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read donation_events"
  ON public.donation_events
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
