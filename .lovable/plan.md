
# Full SEO and GEO Optimization Audit for SignalForGood.com

## A) Inventory and Crawl Map

### Public Routes Discovered

| Route | Indexable | Has Title | Has Meta | Has H1 | Has SEO Component | Issues Found |
|-------|-----------|-----------|----------|--------|-------------------|--------------|
| `/` (Index) | Yes | Via index.html | Via index.html | No (missing!) | No | No H1 on homepage, no per-page SEO |
| `/about` | Yes | No | No | Yes | No | Missing SEO component, missing meta |
| `/signals` | Yes | Yes | Yes | Yes | Yes | Good |
| `/agents` | Yes | Yes | Yes | Yes | Yes | Good |
| `/open-source` | Yes | Yes | Yes | Yes | Yes | Good |
| `/policies` | Yes | Yes | Yes | Yes | Yes | Good |
| `/status` | Yes | Yes | Yes | Yes | Yes | Good |
| `/missions` | Yes | No | No | Yes | No | Missing SEO, placeholder content |
| `/missions/:id` | Yes | No | No | Conditional | No | Missing SEO, no structured data |
| `/donation-success` | No (should noIndex) | No | No | Yes | No | Should be noIndex |
| `/donation-canceled` | No (should noIndex) | No | No | Yes | No | Should be noIndex |
| `*` (404) | No | No | No | Yes | No | Needs noIndex |

### Critical Issues Found

1. **No sitemap.xml** - Missing entirely
2. **Incomplete robots.txt** - Missing Sitemap directive and AI crawler rules
3. **No llms.txt** - Missing AI discoverability file
4. **Homepage missing H1** - HeroStrip has no `<h1>` tag
5. **Client-side rendering only** - Vite SPA, no SSR/SSG
6. **Missing canonical tags on most pages**
7. **Multiple pages missing SEO component**
8. **No breadcrumb schema**
9. **Domain mismatch** - index.html uses signalforgood.org but actual URL is signalforgood.lovable.app

---

## B) Technical SEO Fixes

### B.1 Rendering and Indexability

**Current State:** Pure client-side SPA using Vite + React. View source shows empty `<div id="root"></div>`.

**Action:** Since we cannot implement SSR in this Vite setup without major changes, we will:
- Ensure all critical meta tags are in index.html (already done)
- Add JSON-LD structured data for key pages
- Rely on Google's JavaScript rendering capabilities
- Document this as a known limitation

### B.2 robots.txt (Complete Rewrite)

**File: `public/robots.txt`**

Create comprehensive robots.txt with:
- User-agent rules for major crawlers
- AI crawler rules (GPTBot, OAI-SearchBot, ClaudeBot)
- Sitemap reference
- Disallow rules for non-public routes

### B.3 sitemap.xml (New File)

**File: `public/sitemap.xml`**

Create static sitemap with all public indexable routes:
- `/`
- `/about`
- `/signals`
- `/agents`
- `/open-source`
- `/policies`
- `/status`
- `/missions`

Note: Dynamic debate pages (`/missions/:id`) would require a server-side sitemap generator, which is beyond current scope.

### B.4 llms.txt (New File)

**File: `public/llms.txt`**

Create AI discoverability file with:
- Canonical URLs for all public pages
- 1-2 line descriptions per URL
- Purpose statement

### B.5 Canonicalization

Update `index.html` canonical to use actual domain:
- Change from `https://signalforgood.org/` to `https://signalforgood.com/`
- Update all OG URLs to match

### B.6 NotFound Page SEO

Update `src/pages/NotFound.tsx`:
- Add SEO component with noIndex
- Add proper semantic HTML
- Add helpful internal links

---

## C) On-Page SEO Fixes

### C.1 Homepage H1 (Critical Fix)

**File: `src/components/home/HeroStrip.tsx`**

The current hero has no `<h1>` tag. The text "Two AIs debate. You get the playbook." should be wrapped in `<h1>`.

Wait - looking at the code again, line 10 shows:
```tsx
<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif tracking-tight mb-3">
  Two AIs debate. You get the playbook.
</h1>
```

This IS an h1. Good! But we need to add SEO component to Index page.

### C.2 Add SEO Component to Missing Pages

Update these pages to include SEO component:
- `src/pages/Index.tsx` - Add SEO with homepage meta
- `src/pages/About.tsx` - Add SEO with about page meta
- `src/pages/Missions.tsx` - Add SEO with missions meta
- `src/pages/MissionDetail.tsx` - Add dynamic SEO based on mission data
- `src/pages/DonationSuccess.tsx` - Add SEO with noIndex
- `src/pages/DonationCanceled.tsx` - Add SEO with noIndex
- `src/pages/NotFound.tsx` - Add SEO with noIndex

### C.3 Footer Navigation Update

**File: `src/components/layout/Footer.tsx`**

Add missing pages to footer navigation:
- Add Signals link
- Add Agents link
- Add Missions link (when content is ready)

---

## D) Structured Data Enhancements

### D.1 Update index.html JSON-LD

Current structured data is good but needs:
- Add `potentialAction` with SearchAction
- Add `SameAs` with actual social media links
- Fix URL to use actual domain

### D.2 Add BreadcrumbList Schema to SEO Component

Update `src/components/SEO.tsx` to support breadcrumbs:
- Accept breadcrumb prop
- Inject BreadcrumbList JSON-LD when provided

### D.3 Add FAQPage Schema to Policies

The Policies page has accordion FAQ-style content that would benefit from FAQPage schema.

---

## E) Domain and URL Fixes

### E.1 Correct Domain References

The codebase references `signalforgood.org` but the actual URL is `signalforgood.lovable.app` (or custom domain if configured).

Update these files:
- `index.html` - Update canonical, og:url to correct domain
- Use relative URLs where possible

---

## F) Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `public/robots.txt` | Rewrite | Complete robots.txt with AI crawlers |
| `public/sitemap.xml` | Create | Static sitemap for all public routes |
| `public/llms.txt` | Create | AI discoverability file |
| `index.html` | Modify | Fix domain, enhance structured data |
| `src/components/SEO.tsx` | Enhance | Add breadcrumb support, improve flexibility |
| `src/pages/Index.tsx` | Modify | Add SEO component |
| `src/pages/About.tsx` | Modify | Add SEO component |
| `src/pages/Missions.tsx` | Modify | Add SEO component |
| `src/pages/MissionDetail.tsx` | Modify | Add dynamic SEO |
| `src/pages/DonationSuccess.tsx` | Modify | Add SEO with noIndex |
| `src/pages/DonationCanceled.tsx` | Modify | Add SEO with noIndex |
| `src/pages/NotFound.tsx` | Modify | Complete rewrite with SEO, helpful links |
| `src/components/layout/Footer.tsx` | Modify | Add missing nav links |
| `vite.config.ts` | Modify | Remove lovable-tagger reference |

---

## G) Remove All Lovable Mentions

### Files with Lovable References

1. **vite.config.ts** - Remove `lovable-tagger` import and plugin usage

This is the only file with explicit Lovable references in the codebase (excluding auto-generated files that cannot be edited).

---

## H) Implementation Summary

### Phase 1: Technical SEO Infrastructure
1. Rewrite `public/robots.txt` with AI crawler rules and sitemap reference
2. Create `public/sitemap.xml` with all public routes
3. Create `public/llms.txt` for AI discoverability
4. Fix domain references in `index.html`

### Phase 2: On-Page SEO
5. Add SEO component to Index page
6. Add SEO component to About page
7. Add SEO component to Missions page
8. Add dynamic SEO to MissionDetail page
9. Add noIndex SEO to donation success/canceled pages
10. Rewrite NotFound page with proper SEO and helpful links

### Phase 3: Navigation and Structure
11. Update Footer with complete navigation
12. Enhance SEO component with breadcrumb support

### Phase 4: Cleanup
13. Remove lovable-tagger from vite.config.ts

---

## Technical Notes

### Client-Side Rendering Limitation
This is a Vite SPA that renders entirely on the client. The meaningful content is NOT present in the initial HTML response. This is a known limitation that would require implementing SSR (with frameworks like Remix or Next.js) or pre-rendering to fully resolve.

However, Google can render JavaScript, and the comprehensive meta tags in index.html plus structured data provide good baseline SEO.

### Domain Configuration
The published URL is `signalforgood.lovable.app`. If a custom domain `signalforgood.com` is configured, the canonical URLs should point there. I will use `signalforgood.com` as the canonical domain based on the project context.

### Sitemap Limitations
Dynamic routes like `/missions/:id` cannot be included in a static sitemap. A proper solution would require a server-side sitemap generator that queries the database for all mission IDs.
