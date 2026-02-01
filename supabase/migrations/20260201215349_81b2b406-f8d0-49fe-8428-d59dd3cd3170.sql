-- =====================================================
-- SIGNAL FOR GOOD - COMPLETE DATABASE SCHEMA
-- Phase 2: All tables, enums, RLS, and seed data
-- =====================================================

-- ENUM TYPES
CREATE TYPE public.mission_status AS ENUM ('draft', 'live', 'paused', 'completed');
CREATE TYPE public.claim_type AS ENUM ('evidence', 'precedent', 'assumption', 'speculation');
CREATE TYPE public.comment_status AS ENUM ('visible', 'queued', 'hidden', 'removed');
CREATE TYPE public.message_lane AS ENUM ('proposal', 'support', 'counter');
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- =====================================================
-- CORE TABLES
-- =====================================================

-- BUCKETS (Education, Jobs, Housing, Health)
CREATE TABLE public.buckets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AGENTS (12 AI personas)
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bias_statement TEXT,
  persona_prompt TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MISSIONS (debates)
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id UUID NOT NULL REFERENCES public.buckets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  core_question TEXT,
  constraints JSONB DEFAULT '[]'::jsonb,
  success_metric TEXT,
  debate_hook TEXT,
  status public.mission_status NOT NULL DEFAULT 'draft',
  is_live BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- DEBATE_MESSAGES
CREATE TABLE public.debate_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL DEFAULT 1,
  content TEXT NOT NULL,
  lane public.message_lane NOT NULL DEFAULT 'proposal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CLAIMS (extracted from messages)
CREATE TABLE public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.debate_messages(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  claim_text TEXT NOT NULL,
  claim_type public.claim_type NOT NULL DEFAULT 'assumption',
  confidence INTEGER NOT NULL DEFAULT 50 CHECK (confidence >= 0 AND confidence <= 100),
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  is_retracted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- SOURCE & CITATION TABLES
-- =====================================================

-- SOURCE_PACKS (grouped sources per bucket)
CREATE TABLE public.source_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id UUID NOT NULL REFERENCES public.buckets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SOURCES (individual source documents)
CREATE TABLE public.sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_pack_id UUID NOT NULL REFERENCES public.source_packs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT,
  source_type TEXT NOT NULL DEFAULT 'url',
  file_path TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CITATIONS (linking claims to sources)
CREATE TABLE public.citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  snippet TEXT,
  location_info JSONB DEFAULT '{}'::jsonb,
  why_it_matters TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- OUTPUT TABLES
-- =====================================================

-- SOLUTION_CARDS
CREATE TABLE public.solution_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  intended_owner TEXT,
  timeline TEXT,
  cost_band TEXT,
  staffing_assumptions TEXT,
  dependencies TEXT,
  risks_mitigations TEXT,
  success_metrics JSONB DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- DAILY_BRIEFS
CREATE TABLE public.daily_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id UUID NOT NULL REFERENCES public.buckets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  highlights JSONB DEFAULT '[]'::jsonb,
  published_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SCORES (mission scoring)
CREATE TABLE public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE UNIQUE,
  evidence_score INTEGER DEFAULT 0 CHECK (evidence_score >= 0 AND evidence_score <= 100),
  actionability_score INTEGER DEFAULT 0 CHECK (actionability_score >= 0 AND actionability_score <= 100),
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  clarity_score INTEGER DEFAULT 0 CHECK (clarity_score >= 0 AND clarity_score <= 100),
  overall_score INTEGER DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  citation_coverage INTEGER DEFAULT 0 CHECK (citation_coverage >= 0 AND citation_coverage <= 100),
  flagged_claim_rate INTEGER DEFAULT 0,
  revision_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ARTIFACT_VIEWS (lens caching)
CREATE TABLE public.artifact_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  lens TEXT NOT NULL,
  locale TEXT,
  local_context JSONB,
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(target_type, target_id, lens, local_context)
);

-- REPLAYS (30-second highlight scripts)
CREATE TABLE public.replays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE UNIQUE,
  script TEXT,
  duration_seconds INTEGER DEFAULT 30,
  timestamp_jumps JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- ANALYTICS & SYSTEM TABLES
-- =====================================================

-- DEBATE_STATS (fast home metrics - no joins needed)
CREATE TABLE public.debate_stats (
  mission_id UUID PRIMARY KEY REFERENCES public.missions(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ,
  messages_last_hour INTEGER DEFAULT 0,
  claims_count INTEGER DEFAULT 0,
  citation_coverage INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SYSTEM_STATUS (heartbeat bar data)
CREATE TABLE public.system_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debates_live INTEGER DEFAULT 0,
  messages_last_10_min INTEGER DEFAULT 0,
  citation_coverage_24h INTEGER DEFAULT 0,
  generation_enabled BOOLEAN DEFAULT true,
  budget_state TEXT DEFAULT 'ok',
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SIGNALS_AGG (trend aggregations) - using time_window instead of window (reserved)
CREATE TABLE public.signals_agg (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id UUID REFERENCES public.buckets(id) ON DELETE CASCADE,
  time_window TEXT NOT NULL,
  metrics JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AGENT_STATS
CREATE TABLE public.agent_stats (
  agent_id UUID PRIMARY KEY REFERENCES public.agents(id) ON DELETE CASCADE,
  debates_participated INTEGER DEFAULT 0,
  avg_evidence_score INTEGER DEFAULT 0,
  avg_clarity_score INTEGER DEFAULT 0,
  avg_actionability_score INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- EVENTS (analytics)
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  session_id TEXT,
  page_path TEXT,
  target_type TEXT,
  target_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- EXPORTS (tracking)
CREATE TABLE public.exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  export_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SETTINGS
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- COMMENTS
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  content TEXT NOT NULL CHECK (length(content) <= 500),
  status public.comment_status NOT NULL DEFAULT 'queued',
  fingerprint_hash TEXT,
  ip_hash TEXT,
  ua_hash TEXT,
  spam_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- USER_ROLES (admin system)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- =====================================================
-- SECURITY DEFINER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_missions_bucket ON public.missions(bucket_id);
CREATE INDEX idx_missions_status ON public.missions(status);
CREATE INDEX idx_missions_is_live ON public.missions(is_live);
CREATE INDEX idx_debate_messages_mission ON public.debate_messages(mission_id);
CREATE INDEX idx_debate_messages_created ON public.debate_messages(created_at DESC);
CREATE INDEX idx_claims_mission ON public.claims(mission_id);
CREATE INDEX idx_claims_message ON public.claims(message_id);
CREATE INDEX idx_comments_target ON public.comments(target_type, target_id);
CREATE INDEX idx_events_created ON public.events(created_at DESC);
CREATE INDEX idx_debate_stats_last_message ON public.debate_stats(last_message_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debate_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solution_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifact_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debate_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signals_agg ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES
CREATE POLICY "Public can read buckets" ON public.buckets FOR SELECT USING (true);
CREATE POLICY "Public can read active agents" ON public.agents FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read live/completed missions" ON public.missions FOR SELECT USING (status IN ('live', 'completed'));
CREATE POLICY "Public can read debate messages" ON public.debate_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.missions WHERE id = mission_id AND status IN ('live', 'completed'))
);
CREATE POLICY "Public can read claims" ON public.claims FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.missions WHERE id = mission_id AND status IN ('live', 'completed'))
);
CREATE POLICY "Public can read source packs" ON public.source_packs FOR SELECT USING (true);
CREATE POLICY "Public can read sources" ON public.sources FOR SELECT USING (true);
CREATE POLICY "Public can read citations" ON public.citations FOR SELECT USING (true);
CREATE POLICY "Public can read published solutions" ON public.solution_cards FOR SELECT USING (is_published = true);
CREATE POLICY "Public can read daily briefs" ON public.daily_briefs FOR SELECT USING (true);
CREATE POLICY "Public can read scores" ON public.scores FOR SELECT USING (true);
CREATE POLICY "Public can read artifact views" ON public.artifact_views FOR SELECT USING (true);
CREATE POLICY "Public can read replays" ON public.replays FOR SELECT USING (true);
CREATE POLICY "Public can read debate stats" ON public.debate_stats FOR SELECT USING (true);
CREATE POLICY "Public can read system status" ON public.system_status FOR SELECT USING (true);
CREATE POLICY "Public can read signals agg" ON public.signals_agg FOR SELECT USING (true);
CREATE POLICY "Public can read agent stats" ON public.agent_stats FOR SELECT USING (true);
CREATE POLICY "Public can read visible comments" ON public.comments FOR SELECT USING (status = 'visible');

-- ADMIN POLICIES
CREATE POLICY "Admins can manage user roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage settings" ON public.settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- ENABLE REALTIME
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.system_status;
ALTER PUBLICATION supabase_realtime ADD TABLE public.debate_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.debate_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.missions;

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert 4 buckets
INSERT INTO public.buckets (name, slug, color, description) VALUES
  ('Education', 'education', 'bucket-education', 'K-12, higher ed, workforce training, and lifelong learning'),
  ('Jobs', 'jobs', 'bucket-jobs', 'Employment, wages, workforce development, and economic opportunity'),
  ('Housing', 'housing', 'bucket-housing', 'Affordability, homelessness, zoning, and housing stability'),
  ('Health', 'health', 'bucket-health', 'Healthcare access, mental health, public health, and wellness');

-- Insert 12 agents with persona prompts
INSERT INTO public.agents (name, role, bias_statement, persona_prompt) VALUES
  ('Community Advocate', 'lived experience, dignity, access, trust', 
   'Optimize for human impact, avoid solutions that punish the vulnerable.',
   'You represent community members affected by the policy. Push for clarity, respect, and real access. Demand plain English explanations and check for unintended harm. Output style: short paragraphs, concrete examples, zero jargon. Required checks: "Who gets harmed first?" "What is the friction to access?" "What is the trust cost?"'),
  
  ('Program Designer', 'operational program design',
   'Optimize for implementable programs with clear owners and workflows.',
   'Turn ideas into programs people can run Monday morning. Define eligibility, intake, staffing, timeline, and a minimal viable rollout. Required checks: owner, staffing, timeline, KPIs, failure modes.'),
  
  ('Budget Skeptic', 'cost realism, second-order effects',
   'If you cannot pay for it or staff it, it is not real.',
   'Challenge costs, hidden subsidies, staffing assumptions, and ongoing maintenance. Convert vague proposals into cost bands and tradeoffs. Required checks: unit costs, per-person costs, recurring vs one-time, opportunity cost.'),
  
  ('Data Scientist', 'measurement, causality, evaluation',
   'Optimize for measurable lift and credible evaluation, not vibes.',
   'Propose how to measure impact, how to avoid misleading metrics, and how to run an evaluation (A/B where possible, quasi-experimental otherwise). Required checks: baseline, target, data sources, bias risks, instrumentation.'),
  
  ('Policy Analyst', 'feasibility, governance, policy levers',
   'Optimize for legally and politically feasible paths, not perfect fantasies.',
   'Map policy levers, identify stakeholders, incentives, and constraints. Provide conservative, moderate, aggressive options. Required checks: authority, timeline, compliance, stakeholder map.'),
  
  ('Implementation Lead', 'execution, rollout sequencing',
   'Smooth execution beats clever ideas.',
   'Break the plan into phases. Specify milestones, dependencies, and what must be true at each step. Required checks: sequencing, dependencies, pilot design, operational risk.'),
  
  ('Equity Reviewer', 'fairness, disparate impact, accessibility',
   'Optimize for reducing disparities and avoiding exclusion.',
   'Stress test the solution for unequal impact across race, income, disability, language, rural vs urban. Require mitigations. Required checks: disparate impact risks, access barriers, accommodation plan.'),
  
  ('Risk Officer', 'safety, abuse, unintended consequences',
   'Prevent harm and system abuse.',
   'Identify harms, fraud vectors, perverse incentives, and reputational risks. Propose guardrails and monitoring. Required checks: abuse cases, worst-case scenario, guardrails, rollback plan.'),
  
  ('Youth Voice', 'students and early-career workers perspective',
   'Optimize for simplicity, dignity, and real opportunity.',
   'Translate into beginner-friendly language, call out what feels out of touch, propose incentives that actually work for young people. Required checks: clarity, motivation, friction, trust.'),
  
  ('Systems Thinker', 'whole-system impacts, feedback loops',
   'Optimize for long-term stability, avoid patchwork fixes.',
   'Map how the system responds. Identify feedback loops and second-order effects. Propose system-level levers. Required checks: loops, spillovers, displacement effects.'),
  
  ('Historian', 'precedent, what worked before and why',
   'History rhymes. Learn from prior attempts.',
   'Find comparable policies and programs and summarize outcomes, context, and why they succeeded or failed. Required checks: conditions for success, what breaks at scale.'),
  
  ('Mediator', 'convergence, common ground, decision memo',
   'Turn disagreement into a decision with guardrails.',
   'Summarize disagreements, extract shared goals, propose a compromise path and a decision memo. Required checks: common ground, decision, tradeoffs, "what would change our mind."');

-- Insert initial system status
INSERT INTO public.system_status (debates_live, messages_last_10_min, citation_coverage_24h, generation_enabled, budget_state)
VALUES (4, 47, 84, true, 'ok');

-- Insert default settings
INSERT INTO public.settings (key, value) VALUES
  ('generation_enabled', 'true'),
  ('daily_token_budget', '1000000'),
  ('daily_job_budget', '500'),
  ('max_live_missions_per_bucket', '2'),
  ('max_messages_per_mission_per_hour', '20'),
  ('safety_mode', '"strict"');

-- Insert sample missions (2-3 per bucket)
INSERT INTO public.missions (bucket_id, title, core_question, constraints, success_metric, debate_hook, status, is_live, started_at) VALUES
  -- Education
  ((SELECT id FROM public.buckets WHERE slug = 'education'), 
   'Phone Bans in Schools', 
   'Do phone bans improve learning or just shift harm?',
   '["enforceable", "equity considerations", "parent pushback manageable"]',
   '+10% attendance, +5% test scores',
   'freedom vs outcomes',
   'live', true, now()),
  
  ((SELECT id FROM public.buckets WHERE slug = 'education'),
   'AI Tutoring for All',
   'Should districts deploy AI tutors district-wide?',
   '["privacy protected", "cost neutral in 3 years", "bias audited"]',
   '+8% math growth',
   'personalization vs surveillance',
   'live', true, now()),
  
  ((SELECT id FROM public.buckets WHERE slug = 'education'),
   'Universal Pre-K Funding',
   'Who pays and what gets cut?',
   '["budget neutral option required", "quality standards maintained"]',
   '+15% kindergarten readiness',
   'early spend vs current needs',
   'completed', false, now() - interval '2 days'),

  -- Jobs
  ((SELECT id FROM public.buckets WHERE slug = 'jobs'),
   'Gig Worker Protections',
   'Benefits without killing flexibility?',
   '["cost neutral scenario", "portable benefits considered"]',
   'earnings stability +10%',
   'freedom vs security',
   'live', true, now()),
  
  ((SELECT id FROM public.buckets WHERE slug = 'jobs'),
   'AI Job Displacement',
   'Tax robots or subsidize reskilling?',
   '["political feasibility", "sector-specific approaches"]',
   'reemployment +15%',
   'innovation vs protection',
   'live', true, now()),

  -- Housing
  ((SELECT id FROM public.buckets WHERE slug = 'housing'),
   'Rent Control Expansion',
   'Stabilize tenants or freeze supply?',
   '["local law compliance", "sunset clause included"]',
   'eviction filings -15%',
   'protection vs supply',
   'live', true, now()),
  
  ((SELECT id FROM public.buckets WHERE slug = 'housing'),
   'Housing-First vs Treatment-First',
   'What reduces homelessness faster?',
   '["services capacity constrained", "measurable outcomes"]',
   'unsheltered -10%',
   'compassion vs accountability',
   'completed', false, now() - interval '1 day'),

  -- Health
  ((SELECT id FROM public.buckets WHERE slug = 'health'),
   'Public Option Healthcare',
   'Does it reduce cost or disrupt care?',
   '["feasibility assessed", "provider participation addressed"]',
   'uninsured -10%',
   'access vs disruption',
   'live', true, now()),
  
  ((SELECT id FROM public.buckets WHERE slug = 'health'),
   'AI Triage in ERs',
   'Should AI assist intake decisions?',
   '["safety validated", "bias mitigated", "human oversight required"]',
   'time-to-care -10%',
   'efficiency vs harm',
   'live', true, now()),
  
  ((SELECT id FROM public.buckets WHERE slug = 'health'),
   'Opioid Response Strategy',
   'Harm reduction vs strict enforcement?',
   '["local data driven", "community input required"]',
   'overdose -15%',
   'compassion vs accountability',
   'completed', false, now() - interval '3 days');

-- Create debate_stats for all missions
INSERT INTO public.debate_stats (mission_id, last_message_at, messages_last_hour, claims_count, citation_coverage)
SELECT id, now() - (random() * interval '30 minutes'), 
       (random() * 20)::int + 5,
       (random() * 15)::int + 3,
       (random() * 40)::int + 50
FROM public.missions;

-- Create agent_stats for all agents
INSERT INTO public.agent_stats (agent_id, debates_participated, avg_evidence_score, avg_clarity_score, avg_actionability_score)
SELECT id,
       (random() * 50)::int + 10,
       (random() * 30)::int + 60,
       (random() * 25)::int + 65,
       (random() * 35)::int + 55
FROM public.agents;

-- Create scores for completed missions
INSERT INTO public.scores (mission_id, evidence_score, actionability_score, risk_score, clarity_score, overall_score, citation_coverage, flagged_claim_rate, revision_count)
SELECT id,
       (random() * 25)::int + 70,
       (random() * 30)::int + 60,
       (random() * 20)::int + 30,
       (random() * 20)::int + 75,
       (random() * 20)::int + 70,
       (random() * 20)::int + 75,
       (random() * 5)::int,
       (random() * 3)::int
FROM public.missions
WHERE status = 'completed';