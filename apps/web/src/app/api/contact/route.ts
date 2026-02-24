import { NextResponse } from 'next/server';
import { getFunctionsBaseUrl } from '../../../lib/functionsBaseUrl';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FETCH_TIMEOUT_MS = 15_000;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.message) {
    return NextResponse.json(
      { error: 'Missing email or message' },
      { status: 400, headers: { 'cache-control': 'no-store' } },
    );
  }

  const baseUrl = getFunctionsBaseUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/sendContactEmail`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  const text = await res.text();
  if (!res.ok) {
    return new NextResponse(text, {
      status: res.status,
      headers: {
        'cache-control': 'no-store',
        'content-type': res.headers.get('content-type') ?? 'text/plain; charset=utf-8',
      },
    });
  }

  return new NextResponse(text, {
    status: 200,
    headers: {
      'cache-control': 'no-store',
      'content-type': res.headers.get('content-type') ?? 'text/plain; charset=utf-8',
    },
  });
}
