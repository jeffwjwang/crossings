import { timingSafeEqual } from 'node:crypto';

import { NextResponse } from 'next/server';

function same(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Returns a response when the caller must stop, or null when the token matches. */
export function requireAdmin(request: Request): NextResponse | null {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) {
    return NextResponse.json({ error: 'ADMIN_API_TOKEN is not configured' }, { status: 503 });
  }
  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';
  if (!token || !same(token, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
