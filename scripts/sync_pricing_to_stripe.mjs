import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import Stripe from 'stripe';

function parseArgs(argv) {
  const args = {
    in: 'docs/pricing.extracted.json',
    out: 'docs/pricing.stripe.json',
    dryRun: false,
    verbose: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--in') args.in = argv[++i];
    else if (token === '--out') args.out = argv[++i];
    else if (token === '--dry-run') args.dryRun = true;
    else if (token === '--verbose') args.verbose = true;
    else if (token === '-h' || token === '--help') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown arg: ${token}`);
    }
  }

  return args;
}

function printHelp() {
  // Keep this intentionally short.
  console.log(`
Sync extracted pricing to Stripe.

Usage:
  node scripts/sync_pricing_to_stripe.mjs [--in <path>] [--out <path>] [--dry-run] [--verbose]

Env:
  STRIPE_SECRET_KEY=sk_...
`);
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function toStr(value) {
  return String(value);
}

function priceMetadata({ programKey, frequencyPerWeek, commitmentMonths, kind }) {
  const base = {
    lpa_program_key: programKey,
    lpa_kind: kind,
  };
  if (typeof frequencyPerWeek === 'number') base.lpa_frequency_per_week = toStr(frequencyPerWeek);
  if (typeof commitmentMonths === 'number') base.lpa_commitment_months = toStr(commitmentMonths);
  return base;
}

function metaMatches(actual, expected) {
  for (const [k, v] of Object.entries(expected)) {
    if ((actual?.[k] ?? null) !== v) return false;
  }
  return true;
}

async function readJson(filePath) {
  const text = await fs.readFile(filePath, 'utf8');
  return JSON.parse(text);
}

async function writeJson(filePath, payload) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
}

async function findOrCreateProduct(stripe, { programKey, programName, dryRun, verbose }) {
  // Stripe Product search API availability can vary by account; listing is safest.
  // We key off metadata to keep it idempotent.
  const wantedMeta = { lpa_program_key: programKey, lpa_kind: 'program' };

  let startingAfter = undefined;
  while (true) {
    const page = await stripe.products.list({ limit: 100, ...(startingAfter ? { starting_after: startingAfter } : {}) });
    for (const product of page.data) {
      if (metaMatches(product.metadata, wantedMeta)) {
        if (verbose) console.log(`Product ok: ${programKey} -> ${product.id}`);
        return product;
      }
    }
    if (!page.has_more) break;
    startingAfter = page.data.at(-1)?.id;
  }

  if (dryRun) {
    if (verbose) console.log(`[dry-run] Would create product: ${programKey} (${programName})`);
    return { id: null, name: programName, metadata: wantedMeta };
  }

  const created = await stripe.products.create({
    name: programName,
    metadata: wantedMeta,
  });
  if (verbose) console.log(`Created product: ${programKey} -> ${created.id}`);
  return created;
}

async function listPricesForProduct(stripe, productId) {
  let startingAfter = undefined;
  const all = [];
  while (true) {
    const page = await stripe.prices.list({ product: productId, limit: 100, ...(startingAfter ? { starting_after: startingAfter } : {}) });
    all.push(...page.data);
    if (!page.has_more) break;
    startingAfter = page.data.at(-1)?.id;
  }
  return all;
}

function findMatchingPrice(prices, { unitAmount, currency, recurringInterval, metadata }) {
  return (
    prices.find((p) => {
      if (p.unit_amount !== unitAmount) return false;
      if (p.currency !== currency) return false;
      const interval = p.recurring?.interval ?? null;
      if ((recurringInterval ?? null) !== interval) return false;
      return metaMatches(p.metadata, metadata);
    }) ?? null
  );
}

async function findOrCreatePrice(stripe, { productId, unitAmount, currency, recurringInterval, metadata, nickname, dryRun, verbose }) {
  const prices = await listPricesForProduct(stripe, productId);
  const existing = findMatchingPrice(prices, { unitAmount, currency, recurringInterval, metadata });
  if (existing) {
    if (verbose) console.log(`Price ok: ${productId} ${nickname ?? ''} -> ${existing.id}`);
    return existing;
  }

  if (dryRun) {
    if (verbose) console.log(`[dry-run] Would create price: ${productId} ${unitAmount} ${currency} ${recurringInterval ?? 'one_time'}`);
    return { id: null, unit_amount: unitAmount, currency, recurring: recurringInterval ? { interval: recurringInterval } : null, metadata };
  }

  const created = await stripe.prices.create({
    product: productId,
    unit_amount: unitAmount,
    currency,
    ...(recurringInterval ? { recurring: { interval: recurringInterval } } : {}),
    ...(nickname ? { nickname } : {}),
    metadata,
  });
  if (verbose) console.log(`Created price: ${productId} -> ${created.id}`);
  return created;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const stripeSecretKey = requireEnv('STRIPE_SECRET_KEY');

  const input = await readJson(args.in);
  const stripe = new Stripe(stripeSecretKey);

  const programsOut = [];

  for (const program of input.programs ?? []) {
    const programKey = program.programKey;
    const programName = program.programName ?? programKey;
    const currency = program.currency ?? 'usd';

    const product = await findOrCreateProduct(stripe, {
      programKey,
      programName,
      dryRun: args.dryRun,
      verbose: args.verbose,
    });

    const stripeProductId = product.id;

    const pricesOut = [];
    for (const row of program.prices ?? []) {
      const metadata = priceMetadata({
        programKey,
        frequencyPerWeek: row.frequencyPerWeek,
        commitmentMonths: row.commitmentMonths,
        kind: 'package',
      });

      const price = stripeProductId
        ? await findOrCreatePrice(stripe, {
            productId: stripeProductId,
            unitAmount: row.amountCents,
            currency,
            recurringInterval: null,
            nickname: `${row.frequencyPerWeek}x/week · ${row.commitmentMonths}mo (one-time)`,
            metadata,
            dryRun: args.dryRun,
            verbose: args.verbose,
          })
        : { id: null };

      pricesOut.push({
        frequencyPerWeek: row.frequencyPerWeek,
        commitmentMonths: row.commitmentMonths,
        amountCents: row.amountCents,
        stripePriceId: price.id,
      });
    }

    let stripeDropInPriceId = null;
    if (typeof program.dropInFeeCents === 'number') {
      const metadata = priceMetadata({ programKey, kind: 'drop_in' });
      const price = stripeProductId
        ? await findOrCreatePrice(stripe, {
            productId: stripeProductId,
            unitAmount: program.dropInFeeCents,
            currency,
            recurringInterval: null,
            nickname: 'Drop-in fee',
            metadata,
            dryRun: args.dryRun,
            verbose: args.verbose,
          })
        : { id: null };
      stripeDropInPriceId = price.id;
    }

    programsOut.push({
      programKey,
      programName,
      currency,
      isTeam: Boolean(program.isTeam),
      ...(typeof program.teamMinPlayers === 'number' ? { teamMinPlayers: program.teamMinPlayers } : {}),
      ...(typeof program.dropInFeeCents === 'number' ? { dropInFeeCents: program.dropInFeeCents } : {}),
      stripeProductId,
      ...(stripeDropInPriceId ? { stripeDropInPriceId } : {}),
      prices: pricesOut,
    });
  }

  const out = {
    sourcePdf: input.sourcePdf,
    generatedAt: new Date().toISOString(),
    inputFile: args.in,
    dryRun: args.dryRun,
    programs: programsOut,
  };

  await writeJson(args.out, out);
  console.log(`Wrote: ${args.out}`);
  if (args.dryRun) console.log('Dry run: no Stripe objects were created.');
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});
