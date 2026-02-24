# Life Prep Academy (LPA) DMV – Full Stack Scaffold

Monorepo scaffold for:

- Web: Next.js 14 (App Router) at `apps/web`
- Mobile: Expo + React Native at `apps/mobile`
- Backend: Firebase Functions (Stripe Connect + booking approvals + email + calendar) at `functions`

## Quick start

1) Install deps

```bash
npm install
```

2) Create env files

- Copy `.env.example` to `.env` and fill values.

3) Run web

```bash
npm run dev:web
```

4) Run mobile

```bash
npm run dev:mobile
```

5) Run functions locally

```bash
npm run dev:functions
```

## Firestore collections (high level)

- `users/{uid}`: profile + role + Stripe customer ID
- `bookings/{bookingId}`: pending/approved/declined booking requests
- `sessions/{sessionId}`: approved sessions (calendar links + coach/athlete references)
- `pricing/{docId}` (optional): pricing driven from Firestore instead of code

See `docs/firestore-schema.md` for the example schema.

## Pricing extraction

The raw pricing PDF is checked into the repo as `Pricing Sheet- LifePrep Academy.pdf`.

To regenerate a structured JSON version (written to `docs/pricing.extracted.json` by default):

```bash
python scripts/extract_pricing.py
```

For troubleshooting (prints extracted page text + detected money tokens):

```bash
python scripts/extract_pricing.py --debug
```

## Stripe pricing sync (Products + Prices)

The extracted JSON is designed to drive a simple UI flow:

1) user selects `programKey`
2) selects `frequencyPerWeek`
3) selects `commitmentMonths`

Then your app can look up the matching Stripe `priceId`.

This script syncs `docs/pricing.extracted.json` into Stripe Products + **one-time** Prices (idempotent via metadata) and writes a local mapping file at `docs/pricing.stripe.json`.

```bash
npm run stripe:sync-pricing
```

Required env var:

- `STRIPE_SECRET_KEY`

Tip: test without creating anything:

```bash
npm run stripe:sync-pricing -- --dry-run --verbose
```

Checkout note: because these are one-time Prices (not subscriptions), your Stripe Checkout Session should use `mode: 'payment'`.

## Using pricing in a dropdown (shared helpers)

This repo includes a tiny shared package at `packages/pricing`:

- It exports `pricingCatalog` (generated from `docs/pricing.extracted.json`)
- It exports helpers to resolve a user selection to `amountCents` and (optionally) a Stripe `priceId`

Regenerate the TypeScript catalog after updating the PDF:

```bash
npm run pricing:extract
npm run pricing:build-catalog
```

Example usage (UI dropdowns):

```ts
import { pricingCatalog } from '@lpa/pricing';

const programOptions = pricingCatalog.catalog.programOptions;
const frequencyOptions = pricingCatalog.catalog.frequencyOptions;
const commitmentOptions = pricingCatalog.catalog.commitmentOptions;
```

Example usage (resolve selection):

```ts
import { getAmountCentsForSelection, pricingCatalog } from '@lpa/pricing';

const amountCents = getAmountCentsForSelection(pricingCatalog, {
	programKey: 'position',
	frequencyPerWeek: 2,
	commitmentMonths: 3,
});
```

Example usage (resolve Stripe priceId after syncing):

```ts
import { getStripePriceIdForSelection } from '@lpa/pricing';

// Load this however your app prefers (server-side file read, Firestore, etc.)
const mapping = await import('../docs/pricing.stripe.json');

const stripePriceId = getStripePriceIdForSelection(mapping.default, {
	programKey: 'position',
	frequencyPerWeek: 2,
	commitmentMonths: 3,
});
```

## Stripe Checkout endpoint (most efficient shared backend)

This repo now includes a minimal Firebase Functions endpoint that creates a Stripe Checkout Session for the selected dropdown values (one-time payment).

- Function: `createCheckoutSession`
- Method: `POST`
- Body: `{ programKey, frequencyPerWeek, commitmentMonths }`

It finds the matching Stripe Price by metadata (created by the pricing sync script) and returns `{ url, id }` for redirect.

Env vars required on the functions runtime:

- `STRIPE_SECRET_KEY`
- `APP_BASE_URL` (or `NEXT_PUBLIC_APP_BASE_URL`) for success/cancel URLs (example: https://lifeprepacademydmv.com)

Local emulator (after configuring Firebase in this repo):

```bash
npm run dev:functions
```
