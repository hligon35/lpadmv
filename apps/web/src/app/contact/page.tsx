'use client';

import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input, TextArea } from '../../components/ui/Input';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus('sent');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="text-sm font-semibold text-lpa-accent">Contact</div>
        <h1 className="text-5xl leading-none" style={{ fontFamily: 'var(--font-display)' }}>
          LET’S CONNECT
        </h1>
        <p className="max-w-3xl text-lpa-mutedFg">
          Send us a message and we’ll follow up with availability, next steps, and the best training fit.
        </p>
      </header>

      <form onSubmit={onSubmit} className="max-w-2xl space-y-4 rounded-lpa border border-lpa-cardBorder bg-lpa-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold">Name</label>
            <div className="mt-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold">Email</label>
            <div className="mt-2">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" required />
            </div>
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold">Message</label>
          <div className="mt-2">
            <TextArea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us what you’re looking for..." required />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" variant="accent" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send Message'}
          </Button>
          {status === 'sent' && <div className="text-sm text-lpa-mutedFg">Sent. We’ll be in touch.</div>}
          {status === 'error' && <div className="text-sm text-red-300">Something went wrong.</div>}
        </div>

        <p className="text-xs text-lpa-mutedFg">
          This form calls a Firebase Function email handler via the Next.js API route `/api/contact`.
        </p>
      </form>
    </div>
  );
}
