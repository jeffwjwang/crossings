import { NextResponse } from 'next/server';

import { readSample } from '../../../../../src/lib/sample';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const puzzle = readSample(id);
  if (!puzzle) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({
    puzzle,
    key: null,
    note: 'The sample app keeps its own key locally. Production keys are issued on the day.',
  });
}
