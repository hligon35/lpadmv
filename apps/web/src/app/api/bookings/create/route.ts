import { NextResponse } from 'next/server';
import { getFunctionsBaseUrl } from '../../../../lib/functionsBaseUrl';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.programKey || !body?.frequencyPerWeek || !body?.commitmentMonths || !body?.customerEmail) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const baseUrl = getFunctionsBaseUrl();
  const res = await fetch(`${baseUrl}/createBooking`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) return new NextResponse(text, { status: res.status });

  return new NextResponse(text, { status: 200, headers: { 'content-type': 'application/json' } });
}
