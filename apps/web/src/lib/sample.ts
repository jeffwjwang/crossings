import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { puzzleSchema, type Puzzle } from '@crossings/puzzle-schema';

const FILES: Record<string, string> = {
  '2026-12-01-ponsonby-easy': 'sample-ponsonby-easy.json',
  '2026-12-01-ponsonby-medium': 'sample-ponsonby.json',
};

export function readSample(id: string): Puzzle | null {
  const file = FILES[id];
  if (!file) return null;
  const full = resolve(process.cwd(), '../../docs', file);
  return puzzleSchema.parse(JSON.parse(readFileSync(full, 'utf8')));
}

export function listSamples(): Puzzle[] {
  return Object.keys(FILES)
    .map((id) => readSample(id))
    .filter((puzzle): puzzle is Puzzle => puzzle != null);
}
