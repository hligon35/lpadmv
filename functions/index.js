const { onRequest } = require('firebase-functions/v2/https');
const cors = require('cors')({ origin: true });
const Stripe = require('stripe');

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function getBaseUrl() {
  return process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_BASE_URL || null;
}

function assertSelection(body) {
  const programKey = body?.programKey;
  const frequencyPerWeek = body?.frequencyPerWeek;
  const commitmentMonths = body?.commitmentMonths;

  if (typeof programKey !== 'string' || !programKey) throw new Error('programKey is required');
  if (![1, 2, 3].includes(Number(frequencyPerWeek))) throw new Error('frequencyPerWeek must be 1, 2, or 3');
  if (![1, 2, 3].includes(Number(commitmentMonths))) throw new Error('commitmentMonths must be 1, 2, or 3');

  return {
    programKey,
    frequencyPerWeek: Number(frequencyPerWeek),
    commitmentMonths: Number(commitmentMonths),
  };
}

function metaMatches(actual, expected) {
  for (const [k, v] of Object.entries(expected)) {
    if ((actual?.[k] ?? null) !== v) return false;
  }
  return true;
}

async function findProductByProgramKey(stripe, programKey) {
  const wanted = { lpa_program_key: programKey, lpa_kind: 'program' };
  let startingAfter;

  while (true) {
    const page = await stripe.products.list({
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    for (const product of page.data) {
      if (metaMatches(product.metadata, wanted)) return product;
    }

    if (!page.has_more) break;
    startingAfter = page.data.at(-1)?.id;
  }

  return null;
}

async function findOneTimePriceForSelection(stripe, productId, { programKey, frequencyPerWeek, commitmentMonths }) {
  const wanted = {
    lpa_program_key: programKey,
    lpa_kind: 'package',
    lpa_frequency_per_week: String(frequencyPerWeek),
    lpa_commitment_months: String(commitmentMonths),
  };

  let startingAfter;
  while (true) {
    const page = await stripe.prices.list({
      product: productId,
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    for (const price of page.data) {
      // one-time price => no recurring object
      if (price.recurring) continue;
      if (metaMatches(price.metadata, wanted)) return price;
    }

    if (!page.has_more) break;
    startingAfter = page.data.at(-1)?.id;
  }

  return null;
}

exports.createCheckoutSession = onRequest({ region: process.env.FUNCTIONS_REGION || 'us-central1' }, (req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const stripeSecretKey = requireEnv('STRIPE_SECRET_KEY');
      const stripe = new Stripe(stripeSecretKey);

      const selection = assertSelection(req.body);

      const product = await findProductByProgramKey(stripe, selection.programKey);
      if (!product) {
        res.status(404).json({ error: `No Stripe Product found for programKey=${selection.programKey}` });
        return;
      }

      const price = await findOneTimePriceForSelection(stripe, product.id, selection);
      if (!price) {
        res.status(404).json({
          error: `No Stripe Price found for selection programKey=${selection.programKey} frequencyPerWeek=${selection.frequencyPerWeek} commitmentMonths=${selection.commitmentMonths}`,
        });
        return;
      }

      const baseUrl = getBaseUrl();
      const successUrl = baseUrl ? `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}` : undefined;
      const cancelUrl = baseUrl ? `${baseUrl}/checkout/cancel` : undefined;

      if (!successUrl || !cancelUrl) {
        res.status(500).json({
          error: 'Missing APP_BASE_URL (or NEXT_PUBLIC_APP_BASE_URL) for success/cancel URLs',
        });
        return;
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{ price: price.id, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          lpa_program_key: selection.programKey,
          lpa_frequency_per_week: String(selection.frequencyPerWeek),
          lpa_commitment_months: String(selection.commitmentMonths),
        },
      });

      res.status(200).json({
        id: session.id,
        url: session.url,
        stripePriceId: price.id,
        stripeProductId: product.id,
      });
    } catch (err) {
      res.status(500).json({ error: err?.message || String(err) });
    }
  });
});

exports.health = onRequest({ region: process.env.FUNCTIONS_REGION || 'us-central1' }, (_req, res) => {
  res.status(200).json({ ok: true });
});
