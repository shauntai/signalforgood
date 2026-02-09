
# Build Complete /donate Page for Signal For Good

## Overview

Create a robust, high-trust public donation page at `/donate` with animated SVG art, Stripe Checkout integration for custom amounts, external payment links (Venmo, Cash App, PayPal), intent tracking with hashed PII, and full SEO.

---

## Database Changes (2 new tables)

### Table: `donation_intents`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, default gen_random_uuid() |
| created_at | timestamptz | default now() |
| method | text | not null (card, venmo, cashapp, paypal_link, paypal_fundraiser) |
| amount_cents | integer | nullable (null for external methods) |
| page_path | text | not null |
| user_agent_hash | text | nullable, SHA-256 hash |
| ip_hash | text | nullable, SHA-256 hash |
| status | text | not null, default 'intent' |
| stripe_session_id | text | nullable |
| metadata | jsonb | nullable |

RLS: No public read/write. Service role only for inserts. Admin read via `has_role`.

### Table: `donation_events`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, default gen_random_uuid() |
| created_at | timestamptz | default now() |
| provider | text | not null |
| provider_event_id | text | not null, unique |
| session_id | text | nullable |
| amount_cents | integer | not null |
| currency | text | not null |
| payment_status | text | not null |

RLS: Admin only via `has_role`.

---

## Edge Functions

### 1. `create-donation-checkout` (new)

**Path:** `supabase/functions/create-donation-checkout/index.ts`

Inputs: `{ amount_cents: number, donor_email?: string, user_agent?: string, ip?: string }`

Logic:
- Validate `amount_cents` is between 500 and 2,500,000
- Hash IP and user_agent with WebCrypto SHA-256 (never store raw)
- Insert `donation_intents` row with method="card", hashed fields, status="intent"
- Create Stripe Checkout Session in `payment` mode using `price_data` (not a fixed price ID) with:
  - Product name: "Donation to Signal For Good"
  - Amount from input
  - Success URL: `{origin}/donate?success=1`
  - Cancel URL: `{origin}/donate?canceled=1`
  - Metadata: `{ amount_cents, page: "donate", project: "signalforgood", intent_id }`
- Return `{ session_url }`
- Uses `STRIPE_SECRET_KEY` (already configured) and `SUPABASE_SERVICE_ROLE_KEY` for DB writes

### 2. `track-donation-intent` (new)

**Path:** `supabase/functions/track-donation-intent/index.ts`

A lightweight function called when users click external payment links.

Inputs: `{ method: string, page_path: string, user_agent?: string, ip?: string }`

Logic:
- Hash IP and user_agent
- Insert `donation_intents` row with amount_cents=null, status="external_click"
- Return success

### 3. `stripe-webhook` (new, optional but included)

**Path:** `supabase/functions/stripe-webhook/index.ts`

- Verify Stripe signature using `STRIPE_WEBHOOK_SECRET`
- On `checkout.session.completed`: insert into `donation_events`, update matching `donation_intents` status to "completed"
- Note: This requires a `STRIPE_WEBHOOK_SECRET` to be configured. Will add a note but not block the build on it.

---

## New UI Components

### 1. `src/pages/Donate.tsx`
Full page component with all sections from the copy spec. Handles `?success=1` and `?canceled=1` query params to show inline banners. Includes SEO component and DonateAction JSON-LD.

### 2. `src/components/donate/SignalRainArt.tsx`
Decorative SVG with:
- viewBox 0 0 1000 1000
- 100+ scattered vertical line segments with rounded caps
- Ring of 30+ segments around center at radius ~170
- Stroke currentColor, opacity 0.25 light / 0.18 dark
- Gentle downward drift animation (18s duration) respecting `prefers-reduced-motion`
- Absolute positioned, pointer-events-none, aria-hidden

### 3. `src/components/donate/DonateAmountPicker.tsx`
Four preset buttons ($50, $250, $500, $1,000) with descriptive labels. Custom amount input with $5 minimum validation.

### 4. `src/components/donate/DonateCardForm.tsx`
Optional email field + "Continue to secure checkout" button. Calls `create-donation-checkout` edge function and redirects to Stripe. Shows loading state and error handling.

### 5. `src/components/donate/OtherWaysToGive.tsx`
Three cards for Venmo, Cash App, PayPal with exact copy, links, and helpers. Each click calls `track-donation-intent` before opening link in new tab.

### 6. `src/components/donate/TransparencyPromise.tsx`
Static section with bullets and links to /about, /status, /open-source.

### 7. `src/components/donate/DonateFAQ.tsx`
Accordion with 5 Q&A pairs using exact copy provided. Includes FAQPage JSON-LD.

### 8. `src/components/donate/ContactBlock.tsx`
Address block with the exact contact info and footer legal text provided.

---

## Integration Updates

### Router (`src/App.tsx`)
- Add `import Donate from "./pages/Donate"`
- Add `<Route path="/donate" element={<Donate />} />`

### Header (`src/components/layout/Header.tsx`)
- Add `{ label: 'Donate', href: '/donate' }` to navLinks
- Style the Donate link as a small CTA button instead of plain text link

### Footer (`src/components/layout/Footer.tsx`)
- Add `{ label: 'Donate', href: '/donate' }` to footerLinks

### Home Hero (`src/components/home/HeroStrip.tsx`)
- Add a third CTA button: "Donate" linking to /donate, using `outline` variant

### About Page (`src/pages/About.tsx`)
- Add a "Support our work" link/button pointing to /donate in the donation section

### Policies Page (`src/pages/Policies.tsx`)
- Add a "Support Signal For Good" link to /donate near the contact section

### SEO files
- Update `public/sitemap.xml` to include `/donate`
- `public/robots.txt` already allows all public pages

### Config (`supabase/config.toml`)
- Add `[functions.create-donation-checkout]` with `verify_jwt = false`
- Add `[functions.track-donation-intent]` with `verify_jwt = false`
- Add `[functions.stripe-webhook]` with `verify_jwt = false`

---

## SEO on /donate

The `<SEO>` component will set:
- Title: "Donate | Signal For Good"
- Description: "Support AI education and public transparency. Help keep live debates, citations, and playbooks open to everyone."
- Canonical: "/donate"
- OG title: "Donate to Signal For Good"
- OG description: "Your gift supports AI education and transparency for all. Fund Open Labs, student stipends, scholarships, and public learning campaigns."

JSON-LD injected via useEffect:
- Organization schema (Signal For Good under BRIDGEGOOD)
- DonateAction potentialAction with target https://signalforgood.com/donate
- FAQPage schema in the FAQ section

---

## Files Summary

| File | Action |
|------|--------|
| `src/pages/Donate.tsx` | Create |
| `src/components/donate/SignalRainArt.tsx` | Create |
| `src/components/donate/DonateAmountPicker.tsx` | Create |
| `src/components/donate/DonateCardForm.tsx` | Create |
| `src/components/donate/OtherWaysToGive.tsx` | Create |
| `src/components/donate/TransparencyPromise.tsx` | Create |
| `src/components/donate/DonateFAQ.tsx` | Create |
| `src/components/donate/ContactBlock.tsx` | Create |
| `supabase/functions/create-donation-checkout/index.ts` | Create |
| `supabase/functions/track-donation-intent/index.ts` | Create |
| `supabase/functions/stripe-webhook/index.ts` | Create |
| `src/App.tsx` | Modify (add route) |
| `src/components/layout/Header.tsx` | Modify (add Donate link) |
| `src/components/layout/Footer.tsx` | Modify (add Donate link) |
| `src/components/home/HeroStrip.tsx` | Modify (add Donate CTA) |
| `src/pages/About.tsx` | Modify (add Donate link) |
| `src/pages/Policies.tsx` | Modify (add Donate link) |
| `public/sitemap.xml` | Modify (add /donate) |
| `supabase/config.toml` | Modify (add function configs) |
| Database migration | Create donation_intents + donation_events tables |

---

## Acceptance Checklist

- /donate route exists and renders all sections
- Linked from Header, Footer, Home hero, About page, and Policies page
- Amount presets ($50, $250, $500, $1,000) and custom amount work
- "Continue to secure checkout" creates Stripe session and redirects
- ?success=1 and ?canceled=1 show inline banners
- External links (Venmo, Cash App, PayPal) open in new tabs
- Each click inserts a `donation_intents` row with hashed fields only
- SVG art is visible, subtle, animated, and respects reduced motion
- Page works in light and dark mode
- SEO tags, canonical, and JSON-LD present
- /donate in sitemap
- No login required anywhere
- No card data stored on site
- No raw IP or user agent stored
- All copy matches the spec exactly
- Footer legal text uses BRIDGEGOOD domain and EIN
- Contact section shows correct address and phone
