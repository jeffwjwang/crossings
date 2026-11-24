import { puzzleSchema, type Puzzle } from '@crossings/puzzle-schema';

import { bundledKey, bundledPuzzle } from '../content/catalog';

export interface LoadedPuzzle {
  puzzle: Puzzle;
  key: string | null;
  source: 'bundle' | 'remote';
}

/**
 * Bundled sample today. When EXPO_PUBLIC_API_BASE_URL is set, try the API first.
 * A missing key falls back to the bundled sample key so this build stays playable.
 */
export async function loadPuzzle(id: string): Promise<LoadedPuzzle | null> {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
  if (base) {
    try {
      const response = await fetch(`${base}/api/v1/puzzles/${encodeURIComponent(id)}`);
      if (response.ok) {
        const body = (await response.json()) as { puzzle?: unknown; key?: string | null };
        const puzzle = puzzleSchema.parse(body.puzzle);
        return { puzzle, key: body.key ?? bundledKey(puzzle.id), source: 'remote' };
      }
    } catch {
      // The sample still plays from the bundle when the API is down.
    }
  }
  const puzzle = bundledPuzzle(id);
  if (!puzzle) return null;
  return { puzzle, key: bundledKey(id), source: 'bundle' };
}
