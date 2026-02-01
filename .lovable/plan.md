

# Phase 2: Database Schema, Realtime & Mission Hub

## Overview
This phase establishes the complete backend infrastructure for Signal For Good, including all database tables, RLS policies for public read access, Supabase Realtime subscriptions, and the full Mission Hub experience with watch modes.

---

## Part A: Database Schema (18 Tables)

### A.1 Core Tables

```text
┌─────────────────────────────────────────────────────────────────┐
│                         BUCKETS                                 │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid PK), name, slug (unique), color, description,         │
│ created_at                                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         AGENTS                                  │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid PK), name, role, bias_statement, persona_prompt,      │
│ avatar_url, is_active, created_at                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         MISSIONS                                │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid PK), bucket_id (FK), title, core_question,            │
│ constraints (jsonb), success_metric, debate_hook,              │
│ status (enum: draft/live/paused/completed), is_live,           │
│ started_at, completed_at, created_at, updated_at               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DEBATE_MESSAGES                             │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid PK), mission_id (FK), agent_id (FK), round_number,    │
│ content, lane (enum: proposal/support/counter), created_at     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         CLAIMS                                  │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid PK), message_id (FK), mission_id (FK), claim_text,    │
│ claim_type (enum: evidence/precedent/assumption/speculation),  │
│ confidence (0-100), is_flagged, is_retracted, created_at       │
└─────────────────────────────────────────────────────────────────┘
```

### A.2 Source & Citation Tables

```text
┌─────────────────────────────────────────────────────────────────┐
│                      SOURCE_PACKS                               │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid PK), bucket_id (FK), name, description, created_at    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SOURCES                                 │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid PK), source_pack_id (FK), title, url, source_type,    │
│ file_path, metadata (jsonb), created_at                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        CITATIONS                                │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid PK), claim_id (FK), source_id (FK), snippet,          │
│ location_info (jsonb), why_it_matters, created_at              │
└─────────────────────────────────────────────────────────────────┘
```

### A.3 Output Tables

```text
┌─────────────────────────────────────────────────────────────────┐
│                     SOLUTION_CARDS                              │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid PK), mission_id (FK), title, content, summary,        │
│ intended_owner, timeline, cost_band, staffing_assumptions,     │
│ dependencies, risks_mitigations, success_metrics (jsonb),      │
│ is_published, created_at                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      DAILY_BRIEFS                               │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid PK), bucket_id (FK), title, content, highlights,      │
│ published_date, created_at                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         SCORES                                  │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid PK), mission_id (FK), evidence_score, actionability,  │
│ risk_score, clarity_score, overall_score, citation_coverage,   │
│ flagged_claim_rate, revision_count, created_at                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      ARTIFACT_VIEWS (Lens Caching)              │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid PK), target_type, target_id, lens, locale,            │
│ local_context (jsonb), content, created_at                     │
│ UNIQUE(target_type, target_id, lens, local_context)            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         REPLAYS                                 │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid PK), mission_id (FK), script, duration_seconds,       │
│ timestamp_jumps (jsonb), created_at                            │
└─────────────────────────────────────────────────────────────────┘
```

### A.4 Analytics & System Tables

```text
┌─────────────────────────────────────────────────────────────────┐
│                      DEBATE_STATS (Fast Home Metrics)           │
├─────────────────────────────────────────────────────────────────┤
│ mission_id (uuid PK FK), last_message_at, messages_last_hour,  │
│ claims_count, citation_coverage, updated_at                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      SYSTEM_STATUS                              │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid PK), debates_live, messages_last_10_min,              │
│ citation_coverage_24h, generation_enabled, budget_state,       │
│ last_updated                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      SIGNALS_AGG (Trends)                       │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid PK), bucket_id (nullable FK), window, metrics (jsonb),│
│ updated_at                                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      AGENT_STATS                                │
├─────────────────────────────────────────────────────────────────┤
│ agent_id (uuid PK FK), debates_participated, avg_evidence,     │
│ avg_clarity, avg_actionability, updated_at                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         EVENTS (Analytics)                      │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid PK), event_name, session_id, page_path, target_type,  │
│ target_id, metadata (jsonb), created_at                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         EXPORTS                                 │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid PK), export_type, target_type, target_id, created_at  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         SETTINGS                                │
├─────────────────────────────────────────────────────────────────┤
│ key (text PK), value (jsonb), updated_at                       │
└─────────────────────────────────────────────────────────────────┘
```

### A.5 Comments Table

```text
┌─────────────────────────────────────────────────────────────────┐
│                        COMMENTS                                 │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid PK), target_type, target_id, content (max 500),       │
│ status (enum: visible/queued/hidden/removed),                  │
│ fingerprint_hash, ip_hash, ua_hash, spam_score,                │
│ created_at                                                     │
└─────────────────────────────────────────────────────────────────┘
```

### A.6 Admin Role System (Secure)

```text
┌─────────────────────────────────────────────────────────────────┐
│                   APP_ROLE (Enum)                               │
├─────────────────────────────────────────────────────────────────┤
│ 'admin', 'moderator', 'user'                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      USER_ROLES                                 │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid PK), user_id (FK auth.users), role (app_role),        │
│ UNIQUE(user_id, role)                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   has_role() Function                           │
├─────────────────────────────────────────────────────────────────┤
│ SECURITY DEFINER function to check roles without recursion     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part B: RLS Policies

### Policy Strategy
- **Public read** on all published content (missions, messages, claims, solutions, briefs, agents, buckets, system_status)
- **No public write** - all writes go through Edge Functions with service role
- **Admin-only** for user_roles, settings, and moderation actions

### Key Policies

| Table | SELECT | INSERT/UPDATE/DELETE |
|-------|--------|---------------------|
| buckets | Public (true) | Admin only |
| agents | Public (is_active = true) | Admin only |
| missions | Public (status in live/completed) | Service role |
| debate_messages | Public via mission join | Service role |
| claims | Public via mission join | Service role |
| solution_cards | Public (is_published = true) | Service role |
| daily_briefs | Public (true) | Service role |
| comments | Public (status = visible) | Via Edge Function |
| system_status | Public (true) | Service role |
| debate_stats | Public (true) | Service role |
| user_roles | has_role('admin') | has_role('admin') |
| settings | has_role('admin') | has_role('admin') |
| events | None (service role only) | Service role |
| exports | None (service role only) | Service role |

---

## Part C: Realtime Subscriptions

### Tables with Realtime Enabled
1. **system_status** - HeartbeatBar updates
2. **debate_messages** - Live ticker and mission hub
3. **debate_stats** - Debate wall metrics
4. **missions** - Status changes (live/completed)

### Frontend Hooks

**New files to create:**
- `src/hooks/useSystemStatus.ts` - Real-time heartbeat metrics
- `src/hooks/useDebateMessages.ts` - Real-time message stream
- `src/hooks/useDebateStats.ts` - Real-time debate wall updates
- `src/hooks/useMission.ts` - Single mission with realtime

### HeartbeatBar Integration
```text
Index.tsx
    │
    └── useSystemStatus() hook
            │
            └── Supabase Realtime subscription
                    │
                    └── system_status table updates
```

### LiveTicker Integration
```text
LiveTicker.tsx
    │
    └── useRecentMessages() hook
            │
            └── Supabase Realtime subscription
                    │
                    └── debate_messages (last 10 messages)
```

---

## Part D: Mission Hub - Watch Modes

### Route Structure
```text
/missions/:id
    │
    ├── Watch Mode Toggle (top bar)
    │   ├── Replay 30s
    │   ├── Live Studio (default)
    │   ├── Decision View
    │   └── Evidence View
    │
    ├── AI Lens Dropdown (top right)
    │   ├── Plain English
    │   ├── Skeptic
    │   ├── Budget
    │   ├── Equity
    │   └── Local (with location input)
    │
    └── Main Content Area (varies by mode)
```

### Component Architecture

**New files:**
```text
src/pages/MissionDetail.tsx (refactor)
src/components/mission/
    ├── MissionHeader.tsx          # Title, bucket, status, lenses
    ├── WatchModeToggle.tsx        # Mode selector tabs
    ├── LensSelector.tsx           # Dropdown with all lens options
    ├── modes/
    │   ├── ReplayMode.tsx         # 30-second highlight with TTS
    │   ├── LiveStudioMode.tsx     # Raw stream with agent avatars
    │   ├── DecisionMode.tsx       # Solution + Scorecard + Risks
    │   └── EvidenceMode.tsx       # Claims ledger + citations
    ├── ArgumentMap.tsx            # 3-column proposal/support/counter
    ├── MessageBubble.tsx          # Single debate message
    ├── ClaimCard.tsx              # Claim with label + confidence
    ├── CitationPopover.tsx        # Hover/click citation details
    └── ScoreCard.tsx              # Mission scores display
```

### Watch Mode Details

**1. Replay 30s Mode**
- Auto-generated script from `replays` table
- Browser SpeechSynthesis for audio
- Timestamp jumps to key moments
- Play/pause controls

**2. Live Studio Mode**
- Real-time message stream (via Realtime subscription)
- Agent avatars with role indicators
- Round number display
- Auto-scroll with new messages

**3. Decision Mode**
- Solution card (if published)
- Scorecard visualization
- Risks and mitigations
- Success metrics

**4. Evidence Mode**
- Claims ledger table
- Filter by claim type
- Citation coverage meter
- Flagged claims highlight
- Click-to-expand citation details

### AI Lenses Implementation

Lenses transform the *display* of existing content:
- Check `artifact_views` for cached lens view
- If not cached, show loading state (generation triggered separately)
- Apply lens styling/transformation to UI

---

## Part E: Seed Data

### Included in Migration
1. **4 Buckets** with brand colors
2. **12 Agents** with full persona prompts (as provided)
3. **10 sample missions** (subset of the 160 provided, 2-3 per bucket for initial load)
4. **System settings** with defaults

### Data Volume
- Full 160 missions added via subsequent data insert
- Source packs and sources added as separate operation
- Initial debate messages created for live missions

---

## Part F: Implementation Files

### Database Migration
Single migration file with:
- All enum types (mission_status, claim_type, comment_status, app_role, etc.)
- All 18 tables with proper relationships
- RLS policies for each table
- Security definer function `has_role()`
- Realtime publication for 4 tables
- Seed data inserts

### New TypeScript Files

**Hooks (6 files):**
- `src/hooks/useSystemStatus.ts`
- `src/hooks/useRecentMessages.ts`
- `src/hooks/useDebateStats.ts`
- `src/hooks/useMission.ts`
- `src/hooks/useClaims.ts`
- `src/hooks/useSolution.ts`

**Mission Components (12 files):**
- `src/components/mission/MissionHeader.tsx`
- `src/components/mission/WatchModeToggle.tsx`
- `src/components/mission/LensSelector.tsx`
- `src/components/mission/modes/ReplayMode.tsx`
- `src/components/mission/modes/LiveStudioMode.tsx`
- `src/components/mission/modes/DecisionMode.tsx`
- `src/components/mission/modes/EvidenceMode.tsx`
- `src/components/mission/ArgumentMap.tsx`
- `src/components/mission/MessageBubble.tsx`
- `src/components/mission/ClaimCard.tsx`
- `src/components/mission/CitationPopover.tsx`
- `src/components/mission/ScoreCard.tsx`

**Updated Pages:**
- `src/pages/Index.tsx` - Use real data hooks
- `src/pages/MissionDetail.tsx` - Full refactor with watch modes
- `src/components/home/HeartbeatBar.tsx` - Use useSystemStatus
- `src/components/home/LiveTicker.tsx` - Use useRecentMessages
- `src/components/home/DebateWall.tsx` - Use useDebateStats

---

## Technical Notes

### Performance Optimizations
- `debate_stats` table prevents expensive joins on home page
- Skeleton loaders while data loads
- Realtime updates are incremental, not full refetch
- Lens views are cached in `artifact_views`

### Security Model
- All public tables have RLS with public SELECT
- Comments can only be inserted via Edge Function
- Admin actions require `has_role('admin')` check
- No direct client writes to mission content tables

### TypeScript Types
After migration, types will auto-regenerate in `src/integrations/supabase/types.ts`

---

## Acceptance Criteria

1. All 18 tables created with proper relationships
2. RLS policies allow public read, block public write
3. HeartbeatBar updates in real-time from system_status
4. LiveTicker shows latest messages with realtime subscription
5. DebateWall uses debate_stats for fast metrics
6. Mission Hub has all 4 watch modes functional
7. Lens selector displays (caching logic ready for edge functions)
8. Evidence mode shows claims with labels and citations
9. Seed data includes 4 buckets, 12 agents, 10 sample missions
10. No breaking changes to existing routes

