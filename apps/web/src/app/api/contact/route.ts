import { NextResponse } from 'next/server';
import { getFunctionsBaseUrl } from '../../../lib/functionsBaseUrl';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.message) {
    return NextResponse.json({ error: 'Missing email or message' }, { status: 400 });
  }

  const baseUrl = getFunctionsBaseUrl();
  const res = await fetch(`${baseUrl}/sendContactEmail`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    return new NextResponse(text, { status: res.status });
  }

  return new NextResponse(text, { status: 200 });
}
