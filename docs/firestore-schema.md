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
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
```

## `bookings/{bookingId}`

```ts
type BookingDoc = {
  athleteUid: string;
  athleteEmail?: string;
  coachUid?: string;
  coachConnectedAccountId?: string;

  programKey: string;
  frequencyPerWeek: 1 | 2 | 3;
  commitmentMonths: 1 | 2 | 3;

  requestedTimes: string[]; // ISO strings or human-readable
  notes?: string;

  amountCents: number;
  currency: 'usd';
  stripePaymentIntentId: string;
  stripeCustomerId?: string;

  status: 'pending_approval' | 'approved' | 'declined' | 'canceled';

  approval?: {
    decidedByUid: string;
    decidedAt: FirebaseFirestore.Timestamp;
    reason?: string;
  };

  calendar?: {
    googleCalendarUrl?: string;
    appleCalendarIcsUrl?: string;
  };

  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
```

## `sessions/{sessionId}`

```ts
type SessionDoc = {
  athleteUid: string;
  coachUid: string;
  bookingId: string;

  startTime: FirebaseFirestore.Timestamp;
  endTime: FirebaseFirestore.Timestamp;
  location?: string;

  calendar?: {
    googleCalendarUrl?: string;
    appleCalendarIcsUrl?: string;
  };

  createdAt: FirebaseFirestore.Timestamp;
}
```
