# Firestore schema (example)

## `users/{uid}`

```ts
type UserDoc = {
  uid: string;
  email?: string;
  displayName?: string;
  role?: 'athlete' | 'coach' | 'admin';
  stripeCustomerId?: string;
  stripeConnectedAccountId?: string; // for coaches
  // Optional: custom claims / access control fields
  isAdmin?: boolean;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
```

## `bookings/{bookingId}`

```ts
type BookingDoc = {
  // Who
  athleteUid?: string; // optional until Auth is wired end-to-end
  customerEmail?: string;
  coachUid?: string;

  // What (pricing selection)
  selection: {
    programKey: string;
    frequencyPerWeek: 1 | 2 | 3;
    commitmentMonths: 1 | 2 | 3;
  };

  // When (up to 3 preferred session times)
  preferredTimes: string[]; // ISO strings
  finalStartTime?: string; // ISO
  finalEndTime?: string; // ISO

  // Money
  amountCents: number;
  currency: 'usd';

  // Stripe (Connect + manual capture)
  stripe: {
    paymentIntentId: string;
    connectedAccountId?: string | null;
    captureMethod: 'manual';
    status?: string;
    lastWebhookType?: string;
    lastWebhookAt?: FirebaseFirestore.Timestamp;
    capturedAt?: FirebaseFirestore.Timestamp;
    captureStatus?: string;
  };

  status:
    | 'pending_approval'
    | 'approved'
    | 'declined'
    | 'canceled'
    | 'capture_failed';

  sessionId?: string;
  calendar?: {
    googleCalendarUrl?: string;
  };

  createdAt: FirebaseFirestore.Timestamp;
  approvedAt?: FirebaseFirestore.Timestamp;
  declinedAt?: FirebaseFirestore.Timestamp;
}
```

## `sessions/{sessionId}`

```ts
type SessionDoc = {
  athleteUid?: string;
  coachUid?: string;
  bookingId: string;

  startTime: string; // ISO
  endTime: string; // ISO
  location?: string;

  calendar?: {
    googleCalendarUrl?: string;
    appleIcsText?: string; // scaffold stores inline; production can store in Storage and link
  };

  createdAt: FirebaseFirestore.Timestamp;
}
```

## `pricing/{docId}` (optional)

You can optionally store pricing in Firestore if you want dynamic updates.

```ts
type PricingDoc = {
  sourcePdf?: string;
  generatedAt?: FirebaseFirestore.Timestamp;
  data: unknown; // full extracted catalog JSON
}
```
