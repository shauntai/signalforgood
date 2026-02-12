

# Unify Stripe to ONE Account (No UI Changes)

## Current State

This project has two donation edge functions:

1. **`create-donation-checkout/index.ts`** (ACTIVE) — Already uses dynamic `price_data` with no Price IDs. Called by the `/donate` page. This is correct and only needs the import fix.
2. **`create-donation/index.ts`** (LEGACY) — Uses hardcoded `priceId` param. Not called by any current UI. Needs to be updated to use dynamic `price_data` for safety.
3. **`stripe-webhook/index.ts`** — Already reads `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` from env vars. Handles `checkout.session.completed`. Needs import fix and additional event handling.

All three functions already read `STRIPE_SECRET_KEY` from environment, so swapping the account is purely a secret value change.

## Build Error Fix

Both `create-donation-checkout` and `stripe-webhook` use `npm:@supabase/supabase-js@2.57.2` which fails in edge runtime. Change to the `esm.sh` import pattern:

```
// Before (broken)
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

// After (works)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
```

## Changes (3 files, no UI touched)

### 1. `supabase/functions/create-donation-checkout/index.ts`
- Fix import: `npm:` to `https://esm.sh/`
- No other changes needed. It already uses `price_data` with dynamic amounts.

### 2. `supabase/functions/create-donation/index.ts`
- Remove `priceId`/`mode` input pattern
- Replace with `{ amount, email, isMonthly }` input
- Default amount to 25, convert to cents, validate >= 100
- Use `price_data` with product name "BRIDGEGOOD Donation"
- If `isMonthly`, add `recurring: { interval: "month" }` and set mode to "subscription"
- Keep existing success/cancel URLs (`/donation-success`, `/donation-canceled`)

### 3. `supabase/functions/stripe-webhook/index.ts`
- Fix import: `npm:` to `https://esm.sh/`
- Add handling for `invoice.paid` and `customer.subscription.deleted` events (log them, insert to `donation_events`)

## Secrets to Update

After code changes, you will be prompted to paste new values for:

1. **STRIPE_SECRET_KEY** — The restricted key (`rk_live_...`) from `acct_17ruIoI4Pw2yf1mk`
2. **STRIPE_WEBHOOK_SECRET** — The signing secret (`whsec_...`) for this project's webhook endpoint

### Webhook URL for this project

The webhook endpoint URL to register in Stripe Dashboard for `acct_17ruIoI4Pw2yf1mk`:

```
https://tbyhmqrfdhbxqrjstfns.supabase.co/functions/v1/stripe-webhook
```

Events to subscribe: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`

## What Does NOT Change
- All frontend pages and components (zero UI changes)
- Database schema
- Preset amounts, custom amount input, monthly toggle
- Route structure
- Email notifications

## Summary

| Item | Before | After |
|------|--------|-------|
| `create-donation` | Requires `priceId` | Uses dynamic `price_data`, supports `isMonthly` |
| `create-donation-checkout` | Broken import | Fixed import, logic unchanged |
| `stripe-webhook` | Broken import, only `checkout.session.completed` | Fixed import, adds `invoice.paid` and `customer.subscription.deleted` |
| Stripe account | Unknown/disconnected | `acct_17ruIoI4Pw2yf1mk` (via secret swap) |

