
# Complete Page Build-Out with Material 3 Design, Dark Mode & SEO

## Overview
This plan builds out all remaining pages (/open-source, /policies, /status, /signals, /agents), implements dark mode logo switching throughout the application, and optimizes SEO to 2026 best practices.

---

## 1. Dark Mode Infrastructure

### 1.1 Theme Provider Setup
**File: `src/App.tsx`**
- Wrap application with `ThemeProvider` from `next-themes` (already installed)
- Configure with `attribute="class"`, `defaultTheme="system"`, `enableSystem`

### 1.2 Theme Toggle Component
**New File: `src/components/ui/theme-toggle.tsx`**
- Button with Moon/Sun icons
- Uses `useTheme()` hook to cycle between light/dark/system
- Accessible with proper ARIA labels
- Follows Material 3 icon button pattern (40dp touch target)

### 1.3 Logo Switching Implementation
**Files to Update:**
- `src/components/layout/Header.tsx` - Import both logo variants, use `useTheme()` to swap
- `src/components/home/HeroStrip.tsx` - Same pattern for hero logo

**Pattern:**
```text
const { resolvedTheme } = useTheme();
const logoSrc = resolvedTheme === 'dark' ? logoDark : logoLight;
```

---

## 2. Page Implementations

All pages follow this structure:
- Header + Footer layout wrapper
- Hero section with page title and description
- Content sections with proper heading hierarchy (H1 > H2 > H3)
- Material 3 card elevation and spacing (16dp padding, 12dp radius)
- Consistent typography scale

### 2.1 Signals Page (`/signals`)
**Purpose:** Real-time intelligence dashboard showing trends across all lanes

**Sections:**
1. **Hero** - "Signals" title + "Real-time intelligence across Education, Jobs, Housing, and Health"
2. **Live Activity Feed** - Recent debate activity across all lanes (uses existing real-time hooks)
3. **Trending Topics** - Cards showing most active debate topics per bucket
4. **Daily Briefs Summary** - Latest insights from each lane
5. **Stats Overview** - Aggregate metrics (total debates, messages today, citation coverage)

**Components Used:**
- Card, Badge, Tabs, Progress
- BucketChip for lane indicators
- LivePill for active items

### 2.2 Agents Page (`/agents`)
**Purpose:** Introduce the AI agent panel and their roles

**Sections:**
1. **Hero** - "Meet the Agent Panel" + "Balanced perspectives for practical solutions"
2. **Agent Philosophy** - Explains the balanced team approach
3. **Agent Grid** - Cards for each agent role:
   - Economist (budget reality)
   - Labor Advocate (fairness and access)
   - Policy Analyst (data and measurement)
   - Skeptic (risks and what could go wrong)
   - Practitioner (real-world implementation)
   - Historian (lessons from the past)
   - Facilitator (landing decisions)
4. **How Agents Work** - Process explanation with visual flow
5. **Transparency Note** - Links to open-source prompts

**Components Used:**
- Avatar for agent icons
- Card with accent borders by role
- Accordion for agent detail expansion

### 2.3 Open Source Page (`/open-source`)
**Purpose:** Explain the open-source philosophy and provide resources

**Sections:**
1. **Hero** - "Built in the Open" + "Transparency is how trust gets built"
2. **Why Open Source** - 3-card callouts:
   - Audit the work
   - Fork and adapt
   - Propose improvements
3. **What's Public** - Checklist of open components:
   - Scoring algorithms
   - Agent prompts
   - Debate rules
   - Data schemas
   - UI components
4. **Repository Links** - Cards with GitHub links (placeholder URLs)
5. **Contributing** - How to get involved
6. **License Info** - MIT/Apache note

**Components Used:**
- Card with icons
- Badge for labels (MIT, Apache)
- Button for external links

### 2.4 Policies Page (`/policies`)
**Purpose:** Legal and editorial policies

**Sections:**
1. **Hero** - "Policies" + "How we operate and protect your data"
2. **Policy Accordion:**
   - **Privacy Policy** - Data collection, cookies, third parties
   - **Terms of Service** - Usage terms, disclaimers
   - **Editorial Standards** - How debates are moderated, correction policy
   - **AI Transparency** - How AI is used, limitations disclosed
   - **Accessibility** - WCAG 2.1 AA commitment
3. **Contact** - Email for policy questions
4. **Last Updated** - Timestamp

**Components Used:**
- Accordion for expandable sections
- Alert for important notices
- Separator between sections

### 2.5 Status Page (`/status`)
**Purpose:** System health and operational status

**Sections:**
1. **Hero** - "System Status" + "Current operational health of Signal For Good"
2. **Current Status Banner** - Large indicator (Operational/Degraded/Outage)
3. **Service Grid** - Cards for each service:
   - Debate Engine (uses system_status table)
   - Real-time Updates
   - Citation Verification
   - Solution Publishing
   - API (if applicable)
4. **Metrics Dashboard:**
   - Uptime percentage (30 days)
   - Response time
   - Active debates count
5. **Incident History** - Placeholder for past incidents
6. **Subscribe** - Email notification signup (placeholder)

**Components Used:**
- Badge variants (success/warning/destructive) for status
- Card with status indicators
- Progress for uptime percentage

---

## 3. SEO Optimization (100% Compliance)

### 3.1 Update `index.html`
**Complete Meta Tag Overhaul:**

```text
Core Meta:
- <title> with brand + primary keywords
- <meta name="description"> 155-160 chars, action-oriented
- <meta name="keywords"> 8-12 relevant terms
- <meta name="author"> BRIDGEGOOD
- <meta name="robots"> index, follow, max-image-preview:large

Open Graph:
- og:title, og:description, og:url, og:site_name
- og:image (1200x630 recommended)
- og:type = website
- og:locale = en_US

Twitter Cards:
- twitter:card = summary_large_image
- twitter:site, twitter:title, twitter:description, twitter:image

Technical:
- <link rel="canonical">
- <meta name="theme-color"> (light + dark variants)
- <meta name="color-scheme" content="light dark">
- <meta name="viewport"> (already present)

AI/LLM Optimization:
- JSON-LD structured data (Organization, WebApplication)
- <meta name="ai-content-declaration"> for transparency
```

### 3.2 Per-Page SEO with React Helmet
**New File: `src/components/SEO.tsx`**
- Reusable component for page-specific meta tags
- Props: title, description, canonical, ogImage

**Usage on Each Page:**
```text
<SEO 
  title="Signals | Signal For Good"
  description="Real-time intelligence dashboard..."
/>
```

### 3.3 Structured Data (JSON-LD)
**Enhanced Schema Markup:**
- `Organization` schema for BRIDGEGOOD
- `WebApplication` for Signal For Good
- `FAQPage` schema for Policies
- `Article` schema potential for solution cards

### 3.4 Performance SEO
- Ensure images have alt text (already good)
- Add `loading="lazy"` to non-critical images
- Preload critical fonts

---

## 4. Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/App.tsx` | Modify | Add ThemeProvider wrapper |
| `src/components/ui/theme-toggle.tsx` | Create | Dark mode toggle button |
| `src/components/layout/Header.tsx` | Modify | Add theme toggle, dark mode logo |
| `src/components/home/HeroStrip.tsx` | Modify | Dark mode hero logo |
| `src/components/SEO.tsx` | Create | Reusable SEO meta component |
| `src/pages/Signals.tsx` | Rewrite | Full signals dashboard |
| `src/pages/Agents.tsx` | Rewrite | Agent panel showcase |
| `src/pages/OpenSource.tsx` | Create | Open source philosophy |
| `src/pages/Policies.tsx` | Create | Legal and editorial policies |
| `src/pages/Status.tsx` | Create | System status page |
| `index.html` | Modify | Complete SEO overhaul |

### Route Updates in `src/App.tsx`
```text
/signals - Signals.tsx
/agents - Agents.tsx
/open-source - OpenSource.tsx
/policies - Policies.tsx
/status - Status.tsx
```

---

## 5. Material 3 Design Principles Applied

### Typography Scale
- Display: 57px (page heroes - not used, too large)
- Headline Large: 32px (H1)
- Headline Medium: 28px (H2)
- Title Large: 22px (H3)
- Body Large: 16px (paragraph)
- Body Medium: 14px (secondary text)
- Label: 12px (chips, badges)

### Spacing
- Component padding: 16dp (p-4)
- Section padding: 64dp (py-16)
- Card radius: 12dp (rounded-lg)
- Touch targets: 48dp minimum

### Elevation
- Cards: Level 1 (subtle shadow)
- Dialogs: Level 3
- Navigation: Level 2

### Color
- Already using HSL tokens with light/dark variants
- Ensure sufficient contrast (WCAG AA 4.5:1 for text)

---

## 6. UX Writing Standards (Google/Microsoft)

### Headlines
- Action-oriented, benefit-focused
- 3-8 words for scannability
- Sentence case (not Title Case)

### Body Copy
- Front-load key information
- Short paragraphs (2-3 sentences)
- Bulleted lists for 3+ items
- Active voice, present tense

### CTAs
- Verb-first: "Watch live", "View details"
- Specific: "Explore agents" not "Learn more"

### Error States
- Explain what happened
- Suggest next steps
- Avoid blame

---

## 7. Implementation Order

1. **Phase 1: Infrastructure**
   - ThemeProvider setup
   - Theme toggle component
   - SEO component

2. **Phase 2: Core Updates**
   - Header with theme toggle + dark logo
   - HeroStrip with dark logo
   - index.html SEO overhaul

3. **Phase 3: Pages (parallel)**
   - Signals page
   - Agents page
   - Open Source page
   - Policies page
   - Status page

4. **Phase 4: Polish**
   - Per-page SEO meta
   - Final accessibility review
   - Test dark mode across all pages

---

## Technical Notes

### Dark Mode Logo Detection
- Use `resolvedTheme` from `useTheme()` to get actual theme (accounts for system preference)
- Add SSR protection: check if `mounted` before rendering theme-dependent content to prevent hydration mismatch

### SEO Best Practices 2026
- Core Web Vitals remain critical (LCP, FID, CLS)
- AI-friendly structured data increasingly important
- E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness)
- Mobile-first indexing standard

### Accessibility
- All interactive elements keyboard accessible
- Color not sole indicator of state
- Skip links for navigation
- Proper heading hierarchy on every page
