import { puzzleSchema } from '@crossings/puzzle-schema';
import { NextResponse } from 'next/server';

import { requireAdmin } from '../../../../src/lib/admin';

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const body = (await request.json()) as { puzzle?: unknown; secretPlain?: unknown; puzzleKey?: unknown };
  const parsed = puzzleSchema.safeParse(body.puzzle);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid puzzle', issues: parsed.error.issues.length }, { status: 400 });
  }
  if (!body.secretPlain || !body.puzzleKey) {
    return NextResponse.json({ error: 'secretPlain and puzzleKey are required' }, { status: 400 });
  }
  return NextResponse.json({
    ok: true,
    id: parsed.data.id,
    contentHash: parsed.data.contentHash,
    stored: false,
    note: 'Skeleton only. Connect a database and file storage before this persists anything.',
  });
}
