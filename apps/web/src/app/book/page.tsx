'use client';

import { useMemo, useState } from 'react';
import { pricingCatalog, type PricingSelection } from '@lpa/pricing';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatUsdFromCents } from '../../lib/money';
import { Input } from '../../components/ui/Input';

type BookingDraft = PricingSelection & {
  preferredDays: Array<
    'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
  >;
  preferredTimesByDay: Partial<
    Record<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun', string>
  >;
  customerEmail: string;
};

const DAY_OPTIONS: Array<{ key: BookingDraft['preferredDays'][number]; label: string }> = [
  { key: 'Mon', label: 'Mon' },
  { key: 'Tue', label: 'Tue' },
  { key: 'Wed', label: 'Wed' },
  { key: 'Thu', label: 'Thu' },
  { key: 'Fri', label: 'Fri' },
  { key: 'Sat', label: 'Sat' },
  { key: 'Sun', label: 'Sun' },
];

function buildHalfHourTimes(startHour = 6, endHour = 21) {
  const options: Array<{ value: string; label: string }> = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    for (const minute of [0, 30] as const) {
      if (hour === endHour && minute > 0) continue;
      const hh = String(hour).padStart(2, '0');
      const mm = String(minute).padStart(2, '0');
      const value = `${hh}:${mm}`;
      const hour12 = ((hour + 11) % 12) + 1;
      const ampm = hour < 12 ? 'AM' : 'PM';
      const label = `${hour12}:${mm} ${ampm}`;
      options.push({ value, label });
    }
  }
  return options;
}

export default function BookPage() {
  const programOptions = pricingCatalog.catalog.programOptions;
  const freqOptions = pricingCatalog.catalog.frequencyOptions;
  const commitmentOptions = pricingCatalog.catalog.commitmentOptions;

  const [draft, setDraft] = useState<BookingDraft>({
    programKey: programOptions[0]!.value,
    frequencyPerWeek: '' as any,
    commitmentMonths: commitmentOptions[0]!.value,
    preferredDays: [],
    preferredTimesByDay: {},
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

    const preferredTimes = draft.preferredDays
      .map((day) => {
        const time = draft.preferredTimesByDay[day];
        return time ? `${day} ${time}` : null;
      })
      .filter(Boolean);

    try {
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          preferredTimes,
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
        <h1 className="font-display text-5xl leading-none">
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
        <div className="order-2 rounded-lpa border border-lpa-cardBorder bg-lpa-card p-6 lg:order-1">
          <h2 className="font-display text-2xl font-semibold">
            Training Selection
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <div className="font-semibold">Program</div>
              <select
                id="book-program"
                name="program"
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
                id="book-frequency"
                name="frequency"
                className="mt-2 w-full rounded-lpa border border-lpa-cardBorder bg-lpa-bg px-3 py-2"
                value={draft.frequencyPerWeek}
                onChange={(e) => {
                  const next = e.target.value ? (Number(e.target.value) as any) : ('' as any);
                  setDraft((d) => {
                    if (!next) {
                      return { ...d, frequencyPerWeek: next, preferredDays: [], preferredTimesByDay: {} };
                    }

                    const limitedDays = d.preferredDays.slice(0, Number(next));
                    const preferredTimesByDay = { ...d.preferredTimesByDay };
                    for (const day of Object.keys(preferredTimesByDay) as Array<keyof typeof preferredTimesByDay>) {
                      if (!limitedDays.includes(day as any)) delete preferredTimesByDay[day];
                    }
                    return { ...d, frequencyPerWeek: next, preferredDays: limitedDays, preferredTimesByDay };
                  });
                }}
              >
                <option value="">Select frequency…</option>
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
                id="book-commitment"
                name="commitment"
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
            {!draft.frequencyPerWeek ? (
              <p className="mt-1 text-sm text-lpa-mutedFg">Select a frequency to choose your preferred days and times.</p>
            ) : (
              <>
                <p className="mt-1 text-sm text-lpa-mutedFg">
                  Choose exactly {draft.frequencyPerWeek} day{draft.frequencyPerWeek === 1 ? '' : 's'} and a preferred time for each.
                </p>

                <div className="mt-3 grid gap-3 sm:grid-cols-7">
                  {DAY_OPTIONS.map((dOpt) => {
                    const checked = draft.preferredDays.includes(dOpt.key);
                    const atLimit = draft.preferredDays.length >= Number(draft.frequencyPerWeek);
                    const disabled = !checked && atLimit;
                    return (
                      <label
                        key={dOpt.key}
                        className={`flex items-center gap-2 rounded-lpa border border-lpa-cardBorder bg-lpa-bg px-3 py-2 text-sm ${
                          disabled ? 'opacity-60' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setDraft((prev) => {
                              if (!prev.frequencyPerWeek) return prev;

                              if (isChecked) {
                                if (prev.preferredDays.length >= Number(prev.frequencyPerWeek)) return prev;
                                return { ...prev, preferredDays: [...prev.preferredDays, dOpt.key] };
                              }

                              const nextDays = prev.preferredDays.filter((x) => x !== dOpt.key);
                              const nextTimes = { ...prev.preferredTimesByDay };
                              delete nextTimes[dOpt.key];
                              return { ...prev, preferredDays: nextDays, preferredTimesByDay: nextTimes };
                            });
                          }}
                        />
                        <span className="font-semibold">{dOpt.label}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {draft.preferredDays.map((day) => {
                    const timeOptions = buildHalfHourTimes();
                    const selectedTime = draft.preferredTimesByDay[day] ?? '';
                    return (
                      <label key={day} className="text-sm">
                        <div className="font-semibold">{day} time</div>
                        <select
                          className="mt-2 w-full rounded-lpa border border-lpa-cardBorder bg-lpa-bg px-3 py-2"
                          value={selectedTime}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              preferredTimesByDay: { ...prev.preferredTimesByDay, [day]: e.target.value },
                            }))
                          }
                        >
                          <option value="">Select time…</option>
                          {timeOptions.map((t) => (
                            <option key={`${day}-${t.value}`} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="mt-6">
            <label className="text-sm">
              <div className="font-semibold">Email</div>
              <div className="mt-2">
                <Input
                  id="book-email"
                  name="email"
                  autoComplete="email"
                  type="email"
                  value={draft.customerEmail}
                  onChange={(e) => setDraft((d) => ({ ...d, customerEmail: e.target.value }))}
                  placeholder="you@example.com"
                  required
                />
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
        </div>

        <div className="order-1 rounded-lpa border border-lpa-cardBorder bg-lpa-card p-6 lg:order-2">
          <h2 className="font-display text-2xl font-semibold">
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
                      Prices shown for reference.
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
