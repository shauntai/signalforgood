# Fix Activity, Solution Cards, Replays, and Language

## Root Cause Analysis

Several cascading failures are making the site appear dead:

1. `**generation_logs` table does not exist.** The run-cycle function tries to insert into it on every run and crashes with a 500 error before doing any work. The cron job runs every 2 hours but silently fails every time.
2. **All 128 missions are "completed", zero are "live."** Even if the run-cycle didn't crash, it exits immediately when there are no live missions. There is no "recycle" logic to restart debates.
3. **Solution cards table has 0 rows.** The run-cycle insert includes 4 columns that don't exist in the schema (`decision_summary`, `why_this_over_alternatives`, `implementation_steps`, `first_30_days_plan`), causing silent insert failures when missions complete.
4. **Replays table has 0 rows.** No code generates replay records.
5. **Replay fallback script is a generic one-liner** that doesn't reference the actual debate content.
6. **AI prompt language is academic/robotic** ("analytical finding", "stakeholder input", "research consensus").

## Plan (4 changes)

### 1. Create `generation_logs` table

Database migration to add the table the run-cycle expects. Without this, every cron invocation crashes.

### 2. Rewrite `run-cycle/index.ts` (major)

**Recycle logic:** When no live missions exist, pick 4-8 completed missions (one per bucket), reset them to `status: live, is_live: true`, clear their old messages/claims/scores/solutions/replays, and process them fresh. This ensures activity every 2 hours minimum.

**Fix solution card insert:** Remove the 4 non-existent columns. Use only valid columns: `title`, `summary`, `content`, `intended_owner`, `timeline`, `cost_band`, `staffing_assumptions`, `risks_mitigations`, `success_metrics`, `is_published`.

**Generate replays on completion:** When a mission finishes, build a replay `script` from actual debate messages (pull top highlights from each round) and insert into `replays` with `timestamp_jumps`.

**Plain language (10th-grade):** Rewrite the AI prompt to require simple, direct sentences. Replace template fallbacks with conversational language. Example: "Here's what the experts found about phone bans..." instead of "The available evidence suggests multiple viable approaches."

### 3. Update `ReplayMode.tsx` fallback script

Replace the generic `generateDefaultScript()` with a function that builds a topic-specific script from the mission title and core question. Example output: "Here's the quick take on AI Triage in ERs. Should AI help decide who gets seen first? The debate brought out strong opinions on both sides..."

### 4. Update `DecisionMode.tsx` pending state

When `isCompleted` is true but no solution exists yet, show "Wrapping up the results..." instead of the permanent "Decision Pending" or "Solution card is being generated..." skeleton. This handles the brief window between mission completion and solution generation.

## Addenda to append

### 5. Add preflight checks so the cycle never hard-crashes at startup

Before `run-cycle` does any real work, run a fast preflight:

- Confirm `generation_logs` exists
- Confirm `solution_cards` has the exact columns the insert will use
- Confirm `replays` has the exact columns the insert will use
- Confirm missions table has at least one valid candidate set (`live`, `completed`, or recyclable)

If any check fails:

- write a structured log row with `status: blocked`
- include the failing table/column name
- exit cleanly with a 200 response, not a 500
- never throw before logging

This prevents “one missing table = site looks dead for hours.”

### 6. Add a cycle lock so two runs cannot step on each other

Cron, manual trigger, retry, or deploy hooks can overlap. That creates duplicate resets, duplicate inserts, and corrupted state.

Add:

- one cycle-level mutex (`pg_try_advisory_lock` or equivalent)
- a unique `cycle_id` per invocation
- early exit if a lock is already held
- `started_at`, `finished_at`, `status`, and `reason` in `generation_logs`

Rule: only one active run-cycle at a time.

### 7. Make the cycle idempotent

Every mission step should be safe to re-run.

Add guards so the function checks before writing:

- if a mission already got a solution this cycle, skip solution generation
- if a mission already got a replay this cycle, skip replay generation
- if recycle already ran this cycle, do not recycle again
- if a row insert returns 0 rows, treat it as a failure and log it immediately

No silent “maybe it worked.” Every write should verify success.

### 8. Add partial-failure handling so one broken mission does not kill the whole batch

Right now, one bad mission can poison the whole cycle.

Change the cycle behavior to:

- process missions independently
- log failures per mission
- continue processing the rest
- return `partial_success` when some missions fail but others succeed

Example:

- Mission A replay fails
- Mission B solution succeeds
- Mission C recycles successfully

That cycle should still count as productive, not dead.

### 9. Add a repair pass before normal processing

This is a huge one. Before you process live missions, first repair orphaned content.

On every cycle, first scan for:

- completed missions with no solution card
- completed missions with no replay
- live missions stuck with no new activity for more than one cycle
- solution cards or replays with empty/null core fields

Then repair those first.

This gives you automatic self-healing and cleans up the existing mess over time without a one-off manual babysit.

### 10. Add recycle guardrails so activity feels fresh, not repetitive

Recycling is good, but it needs rules or users will see the same stuff over and over.

Add:

- cooldown window: do not recycle the same mission twice within 24 hours
- bucket rotation: spread picks across categories
- repeat cap: max 2 recycles per mission per 7 days
- freshness bias: prefer missions not shown recently
- minimum viable recycle: if only 2 valid missions exist, recycle 2 instead of exiting

This keeps “active” from becoming “stale.”

### 11. Snapshot old content before clearing it

When you recycle a completed mission, do not blindly wipe history first.

Before clearing:

- capture old debate highlights
- capture previous solution summary
- capture previous replay summary
- write a compact snapshot into `generation_logs.metadata`

Then clear mission-scoped rows.

That gives you an audit trail and prevents permanent loss if a fresh generation fails mid-run.

### 12. Use transaction boundaries for destructive actions

The recycle step is destructive. It should be atomic.

Put these in one transaction:

- select recycle candidates
- snapshot old content
- clear old related records
- reset mission fields
- mark mission `live`

If any part fails, roll the whole reset back.

This avoids half-reset missions that are neither properly completed nor truly live.

### 13. Add deterministic fallbacks for AI failures

Do not let AI outages make the product look blank.

For solution cards:

- if AI fails, generate a plain structured fallback from mission title, core question, top claims, and winning side

For replays:

- if AI fails, generate a topic-specific script from mission title + top 3 highlights

For language cleanup:

- run a final text pass that strips stiff phrases and rewrites into plain English

Rule: every completed mission must produce something readable, even without AI.

### 14. Add output validation before saving AI content

Never trust raw AI output.

Validate before insert:

- required fields present
- no empty `title`, `summary`, or `content`
- minimum/maximum length thresholds
- banned robotic phrases removed
- sentence complexity capped
- fallback triggered if validation fails

Simple example gates:

- title: 5–120 chars
- summary: 40–400 chars
- content: 150–3000 chars
- no “analytical finding,” “stakeholder input,” “research consensus,” etc.

This stops ugly AI outputs from leaking into production.

### 15. Make replay generation depend on real debate density

Not every mission will have enough content for a strong replay.

Add logic:

- if enough real debate messages exist, build replay from actual message highlights
- if debate is thin, blend real content with topic-aware fallback copy
- if debate is nearly empty, generate a short “quick take” version, not a fake full replay

That keeps replays honest instead of padded nonsense.

### 16. Add stale-state recovery in the UI

The frontend should never show a permanent dead-end message.

Add time-based fallback states:

- `isCompleted + no solution + recent` → “Wrapping up the results...”
- `isCompleted + no solution + stale (over 1 cycle)` → “This decision is taking longer than expected. Refresh soon.”
- `no replay yet` → show topic-aware fallback replay immediately
- `no live missions` → show “Recent debates” or “Latest decisions” instead of empty space

No blank states. No permanent skeletons.

### 17. Add an activity guarantee: every cycle must do at least one useful thing

Define a no-op as a failure unless the system is intentionally paused.

Each cycle must perform at least one of these:

- process a live mission
- recycle a completed mission
- repair a missing solution
- repair a missing replay
- promote recent completed content to fallback display

If none happen:

- log `status: idle_unexpected`
- include counts for why
- flag it as a real issue, not a harmless pass

That’s how you keep it “super active.”

### 18. Add a safe-mode switch

Add environment flags so you can keep the site alive during outages:

- `RUN_CYCLE_ENABLED`
- `DISABLE_AI_GENERATION`
- `FORCE_FALLBACK_COPY`
- `MAX_MISSIONS_PER_CYCLE`
- `DRY_RUN_RECYCLE`

This lets the system degrade gracefully instead of crashing hard when AI, quotas, or schema drift hits.

### 19. Add time-budget protection for the edge function

If the function runs too long, it can die mid-cycle and leave inconsistent state.

Add:

- track elapsed time after each mission
- stop accepting new work when nearing timeout
- finish current mission safely
- log `status: truncated_safe`
- resume remaining work next cycle

Better to complete 4 missions cleanly than attempt 8 and lose all of them.

### 20. Add a one-time historical backfill after deploy

You already have:

- 128 completed missions
- 0 live
- 0 solution cards
- 0 replays

After deploying the fix, run one controlled backfill:

- repair missing solution cards for recent completed missions
- generate replays for recent completed missions
- recycle 4–8 completed missions into live state
- verify the homepage, decision view, and replay view all have fresh content

Without this, the system may be fixed but still look empty until the next few cycles.

---

## Tightened “definition of done”

To make this truly production-safe, I’d define success with hard checks:

- 0 uncaught 500s from `run-cycle`
- 100% of cycles log a terminal state (`success`, `partial_success`, `blocked`, `idle_unexpected`, etc.)
- at least 4 live missions after each healthy cycle, unless fewer than 4 valid candidates exist
- 100% of completed missions get a solution card within the same cycle or the next cycle
- 100% of completed missions get a replay within the same cycle or the next cycle
- 0 permanent blank states in Decision or Replay views
- no mission recycled more than once in 24 hours
- last successful cycle visible and less than 3 hours old

---

## One more addendum I’d explicitly add to your summary

Before:

- one failure can stop the whole cycle
- missing content stays missing forever
- AI outage = blank UX
- repeated recycles can feel stale

After:

- startup checks fail safely
- one mission can fail without killing the batch
- orphaned solutions/replays self-heal every cycle
- fallback copy guarantees visible output
- recycle rules keep content fresh, not repetitive
- every cycle must produce at least one useful result

This is the difference between “fixed” and “ops-safe.”  
  
  
What Does NOT Change

- Database schema for existing tables (no column adds/removes on missions, solution_cards, replays, etc.)
- Frontend routes, layout, or header/footer
- Other edge functions
- Cron schedule (stays at every 2 hours)
- RLS policies

## Summary

```text
Before                              After
─────                              ─────
generation_logs missing → crash    Table exists, logging works
0 live missions → idle forever     Recycles 4-8 per cycle
Solution insert uses bad columns   Uses valid columns only
0 replays ever created             Generated from real debate content
Generic replay script              Topic-specific, plain English
Academic/robotic language           10th-grade, conversational
```