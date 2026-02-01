

# Fix Package: Homepage Logo, About Page, Donations & SEO

## Overview
Implementing 4 fixes: replacing homepage "Signal Hub" text with brand logo, complete About page content rewrite, Stripe donation integration, and full SEO/AI optimization.

---

## Fix 1: Homepage Hero Logo

### Changes
- **Copy logo assets** to `src/assets/`:
  - `hero-logo-light.svg` (dark text/green - for light mode)
  - `hero-logo-dark.svg` (white - for dark mode)

- **Update `src/components/home/HeroStrip.tsx`**:
  - Replace text `<h1>Signal Hub</h1>` with logo image
  - Import both logo variants
  - Use appropriate logo based on theme (currently light mode only, dark mode ready)
  - Keep subline and CTAs unchanged

---

## Fix 2: About Page Complete Rewrite

### New `src/pages/About.tsx` Structure:

```text
Sections:
1. Hero - "About" title
2. Why Signal For Good exists
3. Why we created this (BRIDGEGOOD / Shaun Tai mention)
4. What Signal For Good is (4 lanes: Education, Jobs, Housing, Health)
5. Required outputs list (7 items)
6. What makes this feel different (balanced team explanation)
7. The big idea (showing work, trust through clarity)
8. How we define success (year one goals)
9. Why open source
10. For funders (metrics tracked)
11. For community (call to action)
12. Donation section (with Stripe integration)
```

### Design Approach
- Clean editorial typography
- Section spacing with visual hierarchy
- Bucket color accents for the 4 lanes
- Card-style sections for key content blocks

---

## Fix 3: Stripe Donation Integration

### Products Created
**One-Time Donations:**
| Amount | Price ID |
|--------|----------|
| $10 | price_1Sw94f1elXFyDoHrw1UMV762 |
| $25 | price_1Sw94g1elXFyDoHrGPvkYtyg |
| $50 | price_1Sw94h1elXFyDoHr95ULMYFm |
| $100 | price_1Sw94h1elXFyDoHr06tojEfP |

**Monthly Recurring:**
| Amount | Price ID |
|--------|----------|
| $10/mo | price_1Sw94j1elXFyDoHrRxa5bQ92 |
| $25/mo | price_1Sw94k1elXFyDoHrs3BtNNIy |
| $50/mo | price_1Sw94l1elXFyDoHrqZON8dIc |
| $100/mo | price_1Sw94l1elXFyDoHr43chxATG |

### Implementation Files

**New Edge Function: `supabase/functions/create-donation/index.ts`**
- Accepts: `{ priceId, mode }` where mode is "payment" or "subscription"
- No authentication required (guest donations allowed)
- Creates Stripe Checkout session
- Redirects to success/cancel pages

**New Pages:**
- `src/pages/DonationSuccess.tsx` - Thank you page after donation
- `src/pages/DonationCanceled.tsx` - Canceled donation page

**UI Component on About Page:**
- Toggle: One-time vs Monthly
- 4 amount buttons: $10, $25, $50, $100
- Prominent donate CTA
- Trust message: "100% of donations go to site upkeep and operations"

### Routes to Add in `src/App.tsx`
- `/donation-success`
- `/donation-canceled`

---

## Fix 4: Full SEO & AI Optimization

### `index.html` Updates

**Meta Tags:**
```html
<title>Signal For Good - Live AI Debates for Education, Jobs, Housing, Health</title>
<meta name="description" content="A public impact lab where AI agents debate real issues and publish practical, evidence-scored solutions for Education, Jobs, Housing, and Health. Watch live debates 24/7." />
<meta name="author" content="BRIDGEGOOD" />
<meta name="keywords" content="AI debates, public policy, education solutions, job solutions, housing solutions, health solutions, evidence-based policy, social impact" />
```

**Open Graph:**
```html
<meta property="og:title" content="Signal For Good - Live AI Debates for Social Impact" />
<meta property="og:description" content="Watch AI agents debate real issues and produce practical solutions for Education, Jobs, Housing, and Health. Evidence-scored, publicly transparent." />
<meta property="og:url" content="https://signalforgood.com" />
<meta property="og:site_name" content="Signal For Good" />
```

**Twitter Cards:**
```html
<meta name="twitter:title" content="Signal For Good - Live AI Debates for Social Impact" />
<meta name="twitter:description" content="AI agents debating real issues. Producing practical, evidence-scored solutions for Education, Jobs, Housing, and Health." />
```

**AI Engine Optimization:**
```html
<!-- AI/LLM Optimization -->
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

<!-- JSON-LD Structured Data for AI understanding -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Signal For Good",
  "description": "A public impact lab where AI agents debate real issues and publish practical, evidence-scored solutions.",
  "url": "https://signalforgood.com",
  "applicationCategory": "Social Impact Platform",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "creator": {
    "@type": "Organization",
    "name": "BRIDGEGOOD",
    "url": "https://bridgegood.org"
  },
  "keywords": ["AI debates", "policy solutions", "education", "jobs", "housing", "health", "evidence-based", "public impact"]
}
</script>
```

**Additional SEO Elements:**
```html
<link rel="canonical" href="https://signalforgood.com" />
<meta name="theme-color" content="#3fa047" />
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/assets/hero-logo-light.svg` | Copy from upload |
| `src/assets/hero-logo-dark.svg` | Copy from upload |
| `src/components/home/HeroStrip.tsx` | Replace h1 with logo |
| `src/pages/About.tsx` | Complete rewrite with all content + donations |
| `supabase/functions/create-donation/index.ts` | New edge function |
| `src/pages/DonationSuccess.tsx` | New page |
| `src/pages/DonationCanceled.tsx` | New page |
| `src/App.tsx` | Add donation routes |
| `index.html` | Full SEO overhaul |

---

## Technical Notes

### Donation Edge Function
- Uses guest checkout (no auth required)
- Supports both `mode: "payment"` and `mode: "subscription"`
- CORS headers configured for web
- Returns checkout session URL for redirect

### SEO Strategy
- Comprehensive meta tags for search engines
- JSON-LD structured data for AI/LLM understanding
- Open Graph for social sharing
- Semantic HTML throughout About page

### Accessibility
- All images have alt text
- Semantic HTML structure
- Proper heading hierarchy
- ARIA labels on interactive elements

