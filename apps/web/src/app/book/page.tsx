'use client';

import { useMemo, useState } from 'react';
import { pricingCatalog, type PricingSelection } from '@lpa/pricing';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatUsdFromCents } from '../../lib/money';
import { Input } from '../../components/ui/Input';

type BookingDraft = PricingSelection & {
  preferred1?: string;
  preferred2?: string;
  preferred3?: string;
  customerEmail: string;
};

export default function BookPage() {
  const programOptions = pricingCatalog.catalog.programOptions;
  const freqOptions = pricingCatalog.catalog.frequencyOptions;
  const commitmentOptions = pricingCatalog.catalog.commitmentOptions;

  const [draft, setDraft] = useState<BookingDraft>({
    programKey: programOptions[0]!.value,
    frequencyPerWeek: freqOptions[0]!.value,
    commitmentMonths: commitmentOptions[0]!.value,
    customerEmail: '',
  });

  const [pricingRefProgramKey, setPricingRefProgramKey] = useState<(typeof programOptions)[number]['value']>(
    programOptions[0]!.value,
  );

  const program = useMemo(
    () => pricingCatalog.programs.find((p) => p.programKey === draft.programKey),
    [draft.programKey],
  );

  const amountCents = useMemo(() => {
    const row = program?.prices.find(
      (p) => p.frequencyPerWeek === draft.frequencyPerWeek && p.commitmentMonths === draft.commitmentMonths,
    );
    return row?.amountCents;
  }, [program, draft.frequencyPerWeek, draft.commitmentMonths]);

  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');
  const [result, setResult] = useState<{ bookingId: string; paymentIntentId: string } | null>(null);

  async function submitBooking() {
    setStatus('submitting');
    setResult(null);

    try {
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          preferredTimes: [draft.preferred1, draft.preferred2, draft.preferred3].filter(Boolean),
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as { bookingId: string; paymentIntentId: string };
      setResult(json);
      setStatus('submitted');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <div className="text-sm font-semibold text-lpa-accent">Book</div>
        <h1 className="text-5xl leading-none" style={{ fontFamily: 'var(--font-display)' }}>
          BOOK TRAINING
        </h1>
        <p className="max-w-3xl text-lpa-mutedFg">
          Pricing is based off strength of the commitment! Select your program, frequency, and duration to see your rate.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="text-sm font-semibold text-lpa-accent">Programs</div>
          <div className="mt-2 text-sm text-lpa-mutedFg">
            Position, Strength, Combination, plus Team options.
          </div>
        </Card>
        <Card>
          <div className="text-sm font-semibold text-lpa-accent">Drop-in</div>
          <div className="mt-2 text-sm text-lpa-mutedFg">Drop-in fee: $40</div>
        </Card>
        <Card>
          <div className="text-sm font-semibold text-lpa-accent">Approval</div>
          <div className="mt-2 text-sm text-lpa-mutedFg">
            Requests are pending approval. Payment is authorized and captured only after approval.
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lpa border border-lpa-cardBorder bg-lpa-card p-6">
          <h2 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
            Training Selection
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <div className="font-semibold">Program</div>
              <select
                className="mt-2 w-full rounded-lpa border border-lpa-cardBorder bg-lpa-bg px-3 py-2"
                value={draft.programKey}
                onChange={(e) => setDraft((d) => ({ ...d, programKey: e.target.value as BookingDraft['programKey'] }))}
              >
                {programOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              <div className="font-semibold">Frequency</div>
              <select
                className="mt-2 w-full rounded-lpa border border-lpa-cardBorder bg-lpa-bg px-3 py-2"
                value={draft.frequencyPerWeek}
                onChange={(e) => setDraft((d) => ({ ...d, frequencyPerWeek: Number(e.target.value) as any }))}
              >
                {freqOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              <div className="font-semibold">Commitment</div>
              <select
                className="mt-2 w-full rounded-lpa border border-lpa-cardBorder bg-lpa-bg px-3 py-2"
                value={draft.commitmentMonths}
                onChange={(e) => setDraft((d) => ({ ...d, commitmentMonths: Number(e.target.value) as any }))}
              >
                {commitmentOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="text-sm">
              <div className="font-semibold">Estimated Total</div>
              <div className="mt-2 rounded-lpa border border-lpa-cardBorder bg-lpa-bg px-3 py-2">
                {formatUsdFromCents(amountCents)}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold">Preferred Session Times</h3>
            <p className="mt-1 text-sm text-lpa-mutedFg">Pick up to 3 preferred times. (You’ll get a confirmation after approval.)</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Input type="datetime-local" value={draft.preferred1 ?? ''} onChange={(e) => setDraft((d) => ({ ...d, preferred1: e.target.value }))} />
              <Input type="datetime-local" value={draft.preferred2 ?? ''} onChange={(e) => setDraft((d) => ({ ...d, preferred2: e.target.value }))} />
              <Input type="datetime-local" value={draft.preferred3 ?? ''} onChange={(e) => setDraft((d) => ({ ...d, preferred3: e.target.value }))} />
            </div>
          </div>

          <div className="mt-6">
            <label className="text-sm">
              <div className="font-semibold">Email</div>
              <div className="mt-2">
                <Input type="email" value={draft.customerEmail} onChange={(e) => setDraft((d) => ({ ...d, customerEmail: e.target.value }))} placeholder="you@example.com" required />
              </div>
            </label>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button variant="accent" onClick={submitBooking} disabled={status === 'submitting' || !draft.customerEmail}>
              {status === 'submitting' ? 'Submitting…' : 'Request Booking'}
            </Button>
            {status === 'submitted' && result && (
              <div className="text-sm text-lpa-mutedFg">Submitted (pending approval). Booking: {result.bookingId}</div>
            )}
            {status === 'error' && <div className="text-sm text-red-300">Could not submit booking.</div>}
          </div>

          <p className="mt-3 text-xs text-lpa-mutedFg">
            This is a scaffold: payment authorization + manual capture is handled by Firebase Functions.
          </p>
        </div>

        <div className="rounded-lpa border border-lpa-cardBorder bg-lpa-card p-6">
          <h2 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
            Pricing Reference
          </h2>
          <div className="mt-4 space-y-4">
            <label className="text-sm">
              <div className="font-semibold">Select a package</div>
              <select
                className="mt-2 w-full rounded-lpa border border-lpa-cardBorder bg-lpa-bg px-3 py-2"
                value={pricingRefProgramKey}
                onChange={(e) => setPricingRefProgramKey(e.target.value as any)}
              >
                {programOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            {(() => {
              const p = pricingCatalog.programs.find((x) => x.programKey === pricingRefProgramKey);
              if (!p) return null;

              return (
                <div className="rounded-lpa border border-lpa-cardBorder/80 bg-lpa-bg p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-semibold">{p.programName}</div>
                    {typeof p.dropInFeeCents === 'number' && (
                      <div className="text-sm text-lpa-mutedFg">Drop-in: {formatUsdFromCents(p.dropInFeeCents)}</div>
                    )}
                  </div>

                  <details className="mt-3">
                    <summary className="cursor-pointer select-none text-sm font-semibold text-lpa-accent">
                      View pricing tiers
                    </summary>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-lpa-mutedFg">
                      {p.prices.map((row) => (
                        <div
                          key={`${row.frequencyPerWeek}-${row.commitmentMonths}`}
                          className="rounded-lpa border border-lpa-cardBorder/70 px-2 py-2"
                        >
                          <div className="font-semibold text-lpa-fg">
                            {row.frequencyPerWeek}x / wk · {row.commitmentMonths} mo
                          </div>
                          <div>{formatUsdFromCents(row.amountCents)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-lpa-mutedFg">
                      (Matrix sourced from the pricing PDF extraction.)
                    </div>
                  </details>
                </div>
              );
            })()}
          </div>
        </div>
      </section>
    </div>
  );
}
