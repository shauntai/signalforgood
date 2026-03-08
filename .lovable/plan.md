

# Implementation Plan: Topic Hubs, Full Admin Dashboard, Methodology Page, Briefs Page, and Search

This is a large build covering 6 major features. Here is the prioritized execution plan.

---

## 1. Topic Hub Pages (`/buckets/:slug`)

**New file: `src/pages/BucketDetail.tsx`**

Each topic hub page (Education, Jobs, Housing, Health) will show:
- Topic name, description, and icon with bucket accent color
- Live/completed mission counts for that bucket
- Grid of missions filtered to that bucket (reusing the pattern from Missions page)
- Average citation coverage for the bucket
- Link to related solutions
- SEO with breadcrumbs and unique meta per topic

Data comes from the existing `useDebateStats` hook filtered by `bucket.slug`. Bucket metadata (description, icon) will use a local mapping since the DB `buckets.description` field exists but may be sparse.

**Route addition in `App.tsx`:** `<Route path="/buckets/:slug" element={<BucketDetail />} />`

---

## 2. How It Works / Methodology Page

**New file: `src/pages/HowItWorks.tsx`**

Static content page explaining in plain English:
- What a "mission" is
- The 5-round debate structure (Define, Propose, Stress Test, Converge, Implementation)
- How AI agents work (multiple perspectives, not one voice)
- How claims are scored (evidence, precedent, assumption, speculation)
- How citation coverage is calculated
- How solution cards are generated
- How the system runs 24/7 (background cycles every 2 hours)
- Trust and transparency commitments
- FAQ section at the bottom

SEO with FAQ schema markup injected via the SEO component pattern.

**Route:** `<Route path="/how-it-works" element={<HowItWorks />} />`
**Nav update:** Add "How It Works" to header and footer navigation.

---

## 3. Briefs Page with Real Data

**Replace the `/briefs` redirect with a real page: `src/pages/Briefs.tsx`**

Pulls from the `daily_briefs` table (which exists in the schema with `title`, `content`, `highlights`, `published_date`, `bucket_id`). Shows:
- List of daily briefs sorted by date
- Bucket chip per brief
- Expandable content
- Empty state if no briefs exist yet

**Route:** Change `/briefs` from redirect to `<Route path="/briefs" element={<Briefs />} />`

---

## 4. Search Functionality

**New file: `src/pages/Search.tsx`**

Client-side search across missions using the existing `useDebateStats` hook data:
- Search input with debounced filtering
- Matches against mission title and core_question
- Results shown as mission cards
- Empty/no-results states

**New component: `src/components/layout/SearchButton.tsx`** - A search icon in the header that links to `/search` or opens a command palette (cmdk is already installed).

**Approach:** Use the existing `cmdk` package to build a `Cmd+K` search dialog that searches missions. This avoids a separate page and feels more premium. The dialog will be triggered from the header.

**Route:** `<Route path="/search" element={<Search />} />` as fallback, plus `Cmd+K` dialog globally.

---

## 5. Full Admin Dashboard

**Replace `src/pages/AdminMetrics.tsx` with `src/pages/Admin.tsx`** - a tabbed admin dashboard.

The existing admin already has auth (email/password login with `has_role` RPC check). Expand it with tabs:

### Tab 1: Overview
- Existing donation metrics (preserved from current AdminMetrics)
- Mission counts by status (live/completed/draft)
- Total messages, claims, citations
- Last cycle timestamp

### Tab 2: Generation Logs
- Table of `generation_logs` rows showing: started_at, status, duration_ms, missions_touched, messages_created, solutions_created, replays_created, errors
- Color-coded status badges
- Expandable error details

### Tab 3: Missions Management
- Table of all missions (including draft status, fetched via service role through an edge function)
- Status badges
- Links to view each mission

### Tab 4: Controls
- Toggle `generation_enabled` via update to `system_status` table (through an edge function since RLS blocks client writes)
- Display current budget_state
- Manual "Run Cycle Now" button that invokes the `run-cycle` edge function
- Last updated timestamp

**New edge function: `supabase/functions/admin-actions/index.ts`**
- Validates admin auth via JWT
- Supports actions: `toggle_generation`, `trigger_cycle`, `get_admin_stats`
- Returns data that requires service-role access

**Routes:**
- `/admin` → full dashboard
- `/admin/login` → login form (same component, shown when not authed)
- `/admin/metrics` → redirect to `/admin` for backward compat

---

## 6. Header & Footer Updates

**Header (`src/components/layout/Header.tsx`):**
- Add search icon button that opens Cmd+K dialog
- Add "How It Works" to nav links

**Footer (`src/components/layout/Footer.tsx`):**
- Add "How It Works" link
- Add "Briefs" link
- Add "Search" link

---

## Files to Create
1. `src/pages/BucketDetail.tsx` - Topic hub page
2. `src/pages/HowItWorks.tsx` - Methodology page
3. `src/pages/Briefs.tsx` - Daily briefs page
4. `src/pages/Admin.tsx` - Full admin dashboard
5. `src/components/layout/SearchDialog.tsx` - Cmd+K search
6. `supabase/functions/admin-actions/index.ts` - Admin backend actions

## Files to Edit
1. `src/App.tsx` - Add new routes
2. `src/components/layout/Header.tsx` - Add search + How It Works
3. `src/components/layout/Footer.tsx` - Add new links

## Database Changes
- None required. All tables already exist. The `admin-actions` edge function uses service role key for writes to `system_status`.

## What Does NOT Change
- Existing pages, hooks, components
- Database schema
- RLS policies
- Other edge functions
- Cron schedule

