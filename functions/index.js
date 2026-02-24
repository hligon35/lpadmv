const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const Stripe = require('stripe');
const nodemailer = require('nodemailer');

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function getRegion() {
  return process.env.FUNCTIONS_REGION || 'us-central1';
}

function getAppBaseUrl() {
  return process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_BASE_URL || null;
}

function getStripe() {
  const stripeSecretKey = requireEnv('STRIPE_SECRET_KEY');
  return new Stripe(stripeSecretKey);
}

function initAdmin() {
  if (!admin.apps.length) admin.initializeApp();
  return admin;
}

function loadPricingCatalog() {
  // Copy of docs/pricing.extracted.json placed into functions/ at scaffold time.
  // This keeps server-side validation consistent with the PDF extraction.
  // eslint-disable-next-line global-require
  return require('./pricing.extracted.json');
}

function assertSelection(body) {
  const programKey = body?.programKey;
  const frequencyPerWeek = Number(body?.frequencyPerWeek);
  const commitmentMonths = Number(body?.commitmentMonths);

  if (typeof programKey !== 'string' || !programKey) throw new Error('programKey is required');
  if (![1, 2, 3].includes(frequencyPerWeek)) throw new Error('frequencyPerWeek must be 1, 2, or 3');
  if (![1, 2, 3].includes(commitmentMonths)) throw new Error('commitmentMonths must be 1, 2, or 3');

  return { programKey, frequencyPerWeek, commitmentMonths };
}

function getAmountCentsForSelection(selection) {
  const extracted = loadPricingCatalog();
  const program = extracted.programs.find((p) => p.programKey === selection.programKey);
  if (!program) return null;

  const row = program.prices.find(
    (r) => r.frequencyPerWeek === selection.frequencyPerWeek && r.commitmentMonths === selection.commitmentMonths,
  );
  return row?.amountCents ?? null;
}

function parsePreferredTimes(body) {
  const raw = Array.isArray(body?.preferredTimes) ? body.preferredTimes : [];
  return raw
    .filter((v) => typeof v === 'string' && v.trim())
    .slice(0, 3);
}

function buildGoogleCalendarUrl({ title, details, location, start, end }) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: details || '',
    location: location || '',
    dates: `${start.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}/${end
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}Z$/, 'Z')}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildIcs({ title, description, start, end }) {
  const dt = (iso) => iso.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const uid = `lpa-${Date.now()}@lifeprepacademydmv.com`;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Life Prep Academy DMV//Booking//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dt(new Date().toISOString())}`,
    `DTSTART:${dt(start)}`,
    `DTEND:${dt(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${(description || '').replace(/\n/g, '\\n')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

async function sendEmail({ to, subject, text }) {
  // Scaffold: configure one of these in Functions env vars.
  // - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
  // OR swap in SendGrid/Mailgun.
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || process.env.ADMIN_NOTIFICATION_EMAIL;

  if (!host || !port || !user || !pass || !from) {
    console.log('[email scaffold] Missing SMTP env; would send:', { to, subject, text });
    return { ok: false, skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({ from, to, subject, text });
  return { ok: true };
}

exports.health = onRequest({ region: getRegion() }, (_req, res) => {
  res.status(200).json({ ok: true });
});

// =====================================================
// Booking flow
// =====================================================

exports.createBooking = onRequest({ region: getRegion() }, (req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

      initAdmin();
      const stripe = getStripe();

      const selection = assertSelection(req.body);
      const preferredTimes = parsePreferredTimes(req.body);
      const customerEmail = typeof req.body?.customerEmail === 'string' ? req.body.customerEmail : null;
      if (!customerEmail) return res.status(400).json({ error: 'customerEmail is required' });

      const amountCents = getAmountCentsForSelection(selection);
      if (!amountCents) return res.status(400).json({ error: 'Invalid pricing selection' });

      const connectedAccountId = process.env.DEFAULT_CONNECTED_ACCOUNT_ID || null;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: 'usd',
        capture_method: 'manual',
        receipt_email: customerEmail,
        automatic_payment_methods: { enabled: true },
        ...(connectedAccountId
          ? {
              transfer_data: { destination: connectedAccountId },
            }
          : {}),
        metadata: {
          lpa_kind: 'booking',
          lpa_program_key: selection.programKey,
          lpa_frequency_per_week: String(selection.frequencyPerWeek),
          lpa_commitment_months: String(selection.commitmentMonths),
        },
      });

      const db = admin.firestore();
      const bookingRef = await db.collection('bookings').add({
        status: 'pending_approval',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        customerEmail,
        selection,
        preferredTimes,
        amountCents,
        currency: 'usd',
        stripe: {
          paymentIntentId: paymentIntent.id,
          connectedAccountId,
          captureMethod: 'manual',
        },
      });

      const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
      if (adminEmail) {
        await sendEmail({
          to: adminEmail,
          subject: 'New LPA booking pending approval',
          text: `Booking ${bookingRef.id} pending approval. Customer: ${customerEmail}`,
        });
      }

      res.status(200).json({
        bookingId: bookingRef.id,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (err) {
      res.status(500).json({ error: err?.message || String(err) });
    }
  });
});

exports.approveBooking = onRequest({ region: getRegion() }, (req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

      initAdmin();
      const stripe = getStripe();
      const db = admin.firestore();

      const bookingId = typeof req.body?.bookingId === 'string' ? req.body.bookingId : null;
      if (!bookingId) return res.status(400).json({ error: 'bookingId is required' });

      const bookingRef = db.collection('bookings').doc(bookingId);
      const snap = await bookingRef.get();
      if (!snap.exists) return res.status(404).json({ error: 'Booking not found' });
      const booking = snap.data();

      if (booking.status !== 'pending_approval') {
        return res.status(400).json({ error: `Booking status must be pending_approval (got ${booking.status})` });
      }

      const paymentIntentId = booking?.stripe?.paymentIntentId;
      if (!paymentIntentId) return res.status(400).json({ error: 'Missing paymentIntentId on booking' });

      // Choose a final session time (scaffold: first preferred time or now+24h)
      const finalStartIso =
        typeof req.body?.finalStartIso === 'string'
          ? req.body.finalStartIso
          : Array.isArray(booking.preferredTimes) && booking.preferredTimes[0]
            ? booking.preferredTimes[0]
            : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const durationMinutes = Number(req.body?.durationMinutes || 60);
      const start = new Date(finalStartIso);
      const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

      // Capture the authorized funds
      const captured = await stripe.paymentIntents.capture(paymentIntentId);

      const title = 'LPA Training Session';
      const details = `Booking ${bookingId} approved.`;
      const googleCalendarUrl = buildGoogleCalendarUrl({
        title,
        details,
        location: '',
        start: start.toISOString(),
        end: end.toISOString(),
      });
      const icsText = buildIcs({
        title,
        description: details,
        start: start.toISOString(),
        end: end.toISOString(),
      });

      const sessionRef = await db.collection('sessions').add({
        bookingId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        customerEmail: booking.customerEmail,
        selection: booking.selection,
        stripe: { paymentIntentId },
        calendar: {
          googleCalendarUrl,
          appleIcsText: icsText,
        },
      });

      await bookingRef.update({
        status: 'approved',
        approvedAt: admin.firestore.FieldValue.serverTimestamp(),
        sessionId: sessionRef.id,
        stripe: {
          ...(booking.stripe || {}),
          capturedAt: admin.firestore.FieldValue.serverTimestamp(),
          captureStatus: captured.status,
        },
        calendar: { googleCalendarUrl },
      });

      if (booking.customerEmail) {
        await sendEmail({
          to: booking.customerEmail,
          subject: 'Your LPA booking is confirmed',
          text: `Your booking is approved.\n\nGoogle Calendar: ${googleCalendarUrl}\n\n(Apple .ics provided by the app.)`,
        });
      }

      res.status(200).json({ ok: true, sessionId: sessionRef.id, googleCalendarUrl });
    } catch (err) {
      res.status(500).json({ error: err?.message || String(err) });
    }
  });
});

exports.declineBooking = onRequest({ region: getRegion() }, (req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

      initAdmin();
      const stripe = getStripe();
      const db = admin.firestore();

      const bookingId = typeof req.body?.bookingId === 'string' ? req.body.bookingId : null;
      if (!bookingId) return res.status(400).json({ error: 'bookingId is required' });

      const bookingRef = db.collection('bookings').doc(bookingId);
      const snap = await bookingRef.get();
      if (!snap.exists) return res.status(404).json({ error: 'Booking not found' });
      const booking = snap.data();

      const paymentIntentId = booking?.stripe?.paymentIntentId;
      if (paymentIntentId) {
        await stripe.paymentIntents.cancel(paymentIntentId);
      }

      await bookingRef.update({
        status: 'declined',
        declinedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      if (booking.customerEmail) {
        await sendEmail({
          to: booking.customerEmail,
          subject: 'Your LPA booking request was declined',
          text: 'Your booking request was declined. Please contact us to reschedule.',
        });
      }

      res.status(200).json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err?.message || String(err) });
    }
  });
});

// =====================================================
// Email + Calendar helpers
// =====================================================

exports.sendContactEmail = onRequest({ region: getRegion() }, (req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

      const name = typeof req.body?.name === 'string' ? req.body.name : '';
      const email = typeof req.body?.email === 'string' ? req.body.email : '';
      const message = typeof req.body?.message === 'string' ? req.body.message : '';

      if (!email || !message) return res.status(400).json({ error: 'email and message are required' });

      const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
      if (!adminEmail) {
        console.log('[contact] ADMIN_NOTIFICATION_EMAIL not set; message:', { name, email, message });
        return res.status(200).json({ ok: true, skipped: true });
      }

      await sendEmail({
        to: adminEmail,
        subject: 'New contact form submission (LPA DMV)',
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      });

      res.status(200).json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err?.message || String(err) });
    }
  });
});

exports.generateCalendarLinks = onRequest({ region: getRegion() }, (req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

      const startIso = typeof req.body?.startIso === 'string' ? req.body.startIso : null;
      const endIso = typeof req.body?.endIso === 'string' ? req.body.endIso : null;
      if (!startIso || !endIso) return res.status(400).json({ error: 'startIso and endIso are required' });

      const title = typeof req.body?.title === 'string' ? req.body.title : 'LPA Training Session';
      const details = typeof req.body?.details === 'string' ? req.body.details : '';

      const googleCalendarUrl = buildGoogleCalendarUrl({
        title,
        details,
        location: '',
        start: startIso,
        end: endIso,
      });
      const icsText = buildIcs({ title, description: details, start: startIso, end: endIso });

      res.status(200).json({ googleCalendarUrl, appleIcsText: icsText });
    } catch (err) {
      res.status(500).json({ error: err?.message || String(err) });
    }
  });
});

// =====================================================
// Stripe webhooks
// =====================================================

exports.handleStripeWebhook = onRequest({ region: getRegion() }, (req, res) => {
  // NOTE: Stripe webhooks require the raw request body.
  // In Firebase Functions, req.rawBody is available.
  try {
    initAdmin();
    const stripe = getStripe();
    const sig = req.headers['stripe-signature'];
    const webhookSecret = requireEnv('STRIPE_WEBHOOK_SECRET');
    const event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);

    const type = event.type;
    const obj = event.data.object;

    // Fire-and-forget async updates
    (async () => {
      const db = admin.firestore();
      const piId = obj?.id;
      if (!piId) return;

      const snap = await db
        .collection('bookings')
        .where('stripe.paymentIntentId', '==', piId)
        .limit(1)
        .get();

      if (snap.empty) return;
      const doc = snap.docs[0];

      const update = {
        'stripe.lastWebhookType': type,
        'stripe.lastWebhookAt': admin.firestore.FieldValue.serverTimestamp(),
      };

      if (type === 'payment_intent.created') {
        update['stripe.status'] = obj.status;
      }
      if (type === 'payment_intent.canceled') {
        update['stripe.status'] = obj.status;
        update['status'] = 'canceled';
      }
      if (type === 'payment_intent.capture_failed') {
        update['stripe.status'] = obj.status;
        update['status'] = 'capture_failed';
      }
      if (type === 'payment_intent.succeeded') {
        update['stripe.status'] = obj.status;
      }

      await doc.ref.update(update);
    })().catch((e) => console.error('[webhook update error]', e));

    res.status(200).json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err?.message || String(err)}`);
  }
});
