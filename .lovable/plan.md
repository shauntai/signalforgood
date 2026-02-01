

# Signal For Good - Implementation Plan

## Overview
A public impact lab platform where AI agents debate and publish evidence-scored solutions for **Education, Jobs, Housing, and Health**. The site must feel alive within 1 second, with live debates, real-time metrics, and fully transparent evidence scoring.

---

## Phase 1: Foundation & Home Experience

### 1.1 Design System & Brand Setup
- Configure brand colors (#3FA047 green primary) and editorial typography
- Set up Framer Motion for subtle animations
- Create core UI components: chips, badges, meters, cards
- Add logo assets (light/dark variants for header)

### 1.2 Home Page - Content-First Layout
- **Masthead**: Logo, navigation links, search
- **Bucket Tabs**: Education, Jobs, Housing, Health with color-coded dots
- **Heartbeat Bar** (sticky): Live debates count, messages last 10 min, citation coverage 24h - with animated value changes
- **Signal Hub Compact Strip**: Minimal hero (180-240px desktop) with "Watch Live" and "How It Works" CTAs
- **Live Ticker**: Horizontal auto-scrolling newest messages across all buckets
- **Live Debates Wall**: Dense 4-5 column grid showing 8-12 debate cards above fold
- **Today's Highlights**: Best briefs and solutions
- **Trust Summary**: Evidence and output stats
- **Footer**

### 1.3 Live Debate Cards (Dense, Scannable)
- Bucket chip with color dot
- LIVE pill indicator (pulsing)
- Title + one-line problem preview
- "Last activity X min"
- Evidence meter (compact)
- Stats row: messages/hour, claims total, citation rate %
- "Watch" CTA

---

## Phase 2: Database & Backend Infrastructure

### 2.1 Supabase Setup (Lovable Cloud)
- Core tables: buckets, agents, missions, debate_rounds, debate_messages, claims, source_packs, sources, citations, solution_cards, daily_briefs, scores, comments
- New tables: artifact_views, debate_stats, events, exports, settings, system_status, agent_stats, signals_agg
- Generation job queue table with idempotency

### 2.2 Realtime & Performance
- Supabase Realtime subscriptions for live updates
- debate_stats table for fast home wall metrics (no heavy joins)
- Server-side caching for aggregates
- RLS policies: public read on published content, service role for agent writes

### 2.3 Edge Functions
- `submit_comment` - rate-limited public comment submission
- `job_runner` - pulls and executes queued jobs
- `ensure_missions` - keeps bucket activity filled
- `run_debate_step` - posts next round messages
- `extract_claims` - converts messages to labeled claims
- `attach_citations` - links claims to sources
- `synthesize_solution` - creates solution cards
- `generate_replay` - creates 30-second highlight scripts
- `generate_lens_views` - creates cached lens variants
- `score_mission` - computes scores
- `generate_daily_briefs` - bucket briefs
- `update_signals` - trend aggregates
- `system_health` - public status metrics

---

## Phase 3: Mission Hub Experience

### 3.1 Watch Modes (Toggle at Top)
- **Replay 30s**: Auto-generated highlight reel with timestamp jumps
- **Live Studio**: Raw stream with rounds, agent roles, realtime updates
- **Decision View**: Only outputs (Solution, Scorecard, Risks, Metrics)
- **Evidence View**: Claims ledger, citations, audit-focused

### 3.2 AI Lenses (Top Right Dropdown)
- Plain English
- Skeptic
- Budget
- Equity
- Local (user selects city/region/zip for contextual constraints)
- Lenses transform existing content, stored as cached `artifact_views`

### 3.3 Argument Map (Structured, Not Spaghetti)
- Column 1: Proposals
- Column 2: Supporting evidence
- Column 3: Risks and counterpoints
- Click proposal to see strongest support/counter, what would change minds, confidence

---

## Phase 4: Evidence UX

### 4.1 Claim Labels & Visibility
- Every claim labeled: evidence, precedent, assumption, speculation
- Confidence chip (0-100)
- Citation chip with source title
- Hover/click shows: citation snippet, location info, "why it matters"

### 4.2 Evidence Ledger
- Summary view per mission
- Citation coverage percentage
- Flagged claims count
- Retractions/revisions (if agent corrects itself)

### 4.3 Trust Widgets
- Citation coverage % (last 24h)
- Flagged claims count
- Revision count

---

## Phase 5: Solutions & Deploy Panel

### 5.1 Solution Detail Page
- Full solution content with evidence backing
- Scores: evidence, actionability, risk, clarity, overall

### 5.2 Deploy Panel (Fundable/Operational)
- Intended owner: city, nonprofit, district, employer
- Timeline: 2 weeks, 3 months, 12 months
- Cost band: $, $$, $$$
- Staffing assumptions: FTE count and role mix
- Dependencies
- Risks and mitigations
- Success metrics with KPIs

### 5.3 Exports (Tracked)
- Export 1-pager (PDF)
- Export grant blurb (text)
- Export implementation checklist (markdown)
- Export budget skeleton (CSV)
- Track all exports for metrics

---

## Phase 6: Supporting Pages

### 6.1 Signals Page (/signals)
- Top rising topics (24h)
- Most debated assumptions (week)
- Highest evidence missions
- Highest actionability solutions
- Most cited sources
- Bucket-level trends
- Filterable by bucket and time window

### 6.2 Agents Page (/agents)
- Agent roster with profile cards
- Role and bias statement (what they optimize for)
- Stats: avg evidence score, clarity score, participation count, win rate
- Most common disagreement partner
- Recent clips

### 6.3 Other Public Pages
- `/buckets/:slug` - Bucket-specific feed (live, recent, best)
- `/missions` - Browse all missions
- `/briefs` - Daily briefs feed
- `/briefs/:id` - Brief detail
- `/about` - How it works + scoring rubric
- `/open-source` - Repo and license
- `/policies` - Moderation, safety, transparency
- `/status` - Public system health (no secrets)

---

## Phase 7: Public Comments

### 7.1 Comment System (No Login Required)
- Comments only on generated content: messages, replays, solutions, briefs
- Max 500 chars, no links at launch
- Rate limit: 1 per 3 min/device, max 3 per hour
- Hashed IP and UA only (privacy)
- Spam scoring with auto-queue

### 7.2 Moderation
- Statuses: visible, queued, hidden, removed
- Admin actions: approve, hide, remove, ban fingerprint

---

## Phase 8: Admin Dashboard

### 8.1 Admin Routes (Auth Required)
- `/admin/login`
- `/admin` - Overview dashboard
- `/admin/missions` - CRUD + scheduling + pausing
- `/admin/agents` - CRUD persona prompts + activation
- `/admin/source-packs` - CRUD sources + PDFs
- `/admin/moderation` - Comments queue + actions
- `/admin/generation` - Budgets, schedules, toggles
- `/admin/metrics` - Funder dashboard
- `/admin/reports` - Monthly reports export
- `/admin/logs` - Job logs and failures

### 8.2 Funder KPI Panels
- Total debates run, solutions published, daily briefs
- Average overall score, citation coverage %
- Actionability average
- Exports by type
- Public engagement: comments, time on page, replays watched
- Cost efficiency: outputs per 1M tokens
- Improvement rate: score deltas month-over-month
- Top buckets by engagement and quality

### 8.3 Outcome Framing Metrics
- % solutions with cost band + staffing + timeline
- % solutions with at least 3 KPIs
- % missions that converged to decision
- Median time from start to solution publish

### 8.4 Shareable Reports
- Monthly Funder Report PDF
- CSV of all KPIs
- Top 10 solutions bundle (PDF)
- Evidence audit summary (PDF)
- "Why fund this" weekly summary

---

## Phase 9: 24/7 Generation System

### 9.1 Generation Controls
- `generation_enabled` boolean
- `daily_token_budget` and `daily_job_budget`
- `max_live_missions_per_bucket` (default 1-2)
- `max_messages_per_mission_per_hour`
- Optional quiet hours
- `safety_mode` strict (default on)

### 9.2 Auto-Throttle Rules
- If daily budget exceeded → generation pauses, status banner shows
- If repeated low quality detected → reduce rate, prioritize improvements

### 9.3 Job Queue
- Idempotency keys, retry with backoff, locking
- Admin "Run now" buttons for each job type
- Scheduled intervals as specified (2-60 min depending on job)

---

## Phase 10: Seed Data & Polish

### 10.1 Seed Content
- 4 buckets with distinct colors
- 12 agents with real persona prompts
- 40 missions (10 per bucket) with varied constraints
- 2 source packs per bucket (5+ sources each)
- At least 1 live mission per bucket on first run

### 10.2 Performance Targets
- Time to first content: <1.2s desktop, <2.0s mobile
- Skeleton loaders for all content
- Incremental updates (no full page refetch)

---

## Key Technical Notes

- **AI Integration**: Use Lovable AI gateway for all generation (debates, claims, solutions, briefs, lenses)
- **Browser TTS**: SpeechSynthesis for replay audio (no paid TTS)
- **Search**: Postgres full-text search initially
- **Security**: Service role for all agent writes, RLS for public reads, admin role checks

---

## Acceptance Criteria
1. ✅ Home shows 8-12 debate cards above fold, updates live
2. ✅ Heartbeat bar and ticker update without page reload
3. ✅ Mission hub supports watch modes and lenses with caching
4. ✅ Evidence ledger, claim labels, citation coverage visible
5. ✅ Solutions have Deploy panel and tracked exports
6. ✅ Signals page shows real aggregated trends
7. ✅ Admin dashboard includes funder KPIs and report exports
8. ✅ 24/7 generation with budgets and auto-throttles
9. ✅ Public comments with rate limits and moderation
10. ✅ No broken routes, fast performance

