'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { getDb } from '../../lib/firebaseClient';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

type BookingDoc = {
  status: string;
  createdAt?: any;
  customerEmail?: string;
  selection?: { programKey: string; frequencyPerWeek: number; commitmentMonths: number };
  stripe?: { paymentIntentId?: string };
};

export default function AdminPage() {
  const [rows, setRows] = useState<Array<{ id: string; data: BookingDoc }>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getDb();
    const q = query(
      collection(db, 'bookings'),
      where('status', '==', 'pending_approval'),
      orderBy('createdAt', 'desc'),
    );

    return onSnapshot(
      q,
      (snap) => {
        setRows(snap.docs.map((d) => ({ id: d.id, data: d.data() as BookingDoc })));
      },
      (e) => setError(e.message),
    );
  }, []);

  const count = useMemo(() => rows.length, [rows.length]);

  async function approve(id: string) {
    await fetch('/api/bookings/approve', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ bookingId: id }),
    });
  }

  async function decline(id: string) {
    await fetch('/api/bookings/decline', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ bookingId: id }),
    });
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="text-sm font-semibold text-lpa-accent">Admin</div>
        <h1 className="font-display text-5xl leading-none">
          APPROVALS
        </h1>
        <p className="max-w-3xl text-lpa-mutedFg">
          Pending bookings awaiting coach/admin approval. Approve to capture payment and send confirmations.
        </p>
      </header>

      {error && <div className="text-sm text-red-300">{error}</div>}

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="text-sm font-semibold text-lpa-accent">Pending</div>
          <div className="mt-2 text-3xl font-semibold">{count}</div>
          <div className="mt-1 text-sm text-lpa-mutedFg">
            Approve captures payment and sends confirmation. Decline releases the authorization and notifies the athlete.
          </div>
        </Card>
      </section>

      <section className="space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="rounded-lpa border border-lpa-cardBorder bg-lpa-card p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-semibold">Booking {r.id}</div>
                <div className="text-sm text-lpa-mutedFg">
                  {r.data.customerEmail ?? '—'} · {r.data.selection?.programKey ?? '—'} · {r.data.selection?.frequencyPerWeek ?? '—'}x/wk · {r.data.selection?.commitmentMonths ?? '—'} mo
                </div>
                <div className="text-xs text-lpa-mutedFg">PI: {r.data.stripe?.paymentIntentId ?? '—'}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="accent" onClick={() => approve(r.id)}>
                  Approve
                </Button>
                <Button variant="ghost" onClick={() => decline(r.id)}>
                  Decline
                </Button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
