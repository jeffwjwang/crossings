import { NextResponse } from 'next/server';

import { listSamples } from '../../../../../src/lib/sample';

/** Public shape only. This skeleton never returns a puzzle key. */
export function GET() {
  const puzzles = listSamples().map((puzzle) => ({
    difficulty: puzzle.difficulty,
    puzzleId: puzzle.id,
    contentHash: puzzle.contentHash,
    url: null,
    key: null,
  }));
  return NextResponse.json({
    date: '2026-12-01',
    timeZone: 'Pacific/Auckland',
    dailySetId: '2026-12-01-ponsonby',
    note: 'Sample only. Keys are not issued here. Hard and Super Hard are not generated yet.',
    puzzles,
  });
}
