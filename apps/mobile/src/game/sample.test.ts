import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { decryptSecret, puzzleSchema, validatePuzzle } from '@crossings/puzzle-schema';
import { describe, expect, it } from 'vitest';

import { buildContext, createInitialState, isDiscovered, isLocked, reduce } from './logic';
import { buildShareText } from './share';

function read(name: string) {
  return JSON.parse(readFileSync(resolve(process.cwd(), name), 'utf8')) as unknown;
}

const keys = read('docs/sample-keys.json') as Record<string, string>;

function load(file: string) {
  const puzzle = puzzleSchema.parse(read(file));
  const key = keys[puzzle.id];
  if (!key) throw new Error(`Missing sample key for ${puzzle.id}`);
  const report = validatePuzzle(puzzle, key);
  return { puzzle, secret: decryptSecret(puzzle.secret, key), report };
}

function solveAll(file: string) {
  const { puzzle, secret } = load(file);
  const ctx = buildContext(puzzle, secret.answers);
  let state = createInitialState(ctx);
  let guard = 0;
  while (!state.completed && guard < 20) {
    guard += 1;
    const word = puzzle.words.find((item) => isDiscovered(ctx, state, item.id) && !state.solved[item.id]);
    if (!word) break;
    state = reduce(ctx, state, { type: 'select', wordId: word.id, index: 0 });
    const answer = secret.answers[word.id] ?? '';
    for (let index = 0; index < answer.length; index += 1) {
      if (state.solved[word.id]) break;
      const cellId = word.cellIds[index];
      if (cellId == null || isLocked(ctx, state, cellId)) continue;
      state = reduce(ctx, state, { type: 'select', wordId: word.id, index });
      state = reduce(ctx, state, { type: 'type', letter: answer[index] ?? '' });
    }
  }
  return { puzzle, secret, state };
}

describe('Ponsonby sample', () => {
  it('validates easy and medium, with the place name still masked', () => {
    for (const file of ['docs/sample-ponsonby.json', 'docs/sample-ponsonby-easy.json']) {
      const { puzzle, secret, report } = load(file);
      expect(report.errors).toEqual([]);
      expect(puzzle.dailySetId).toBe('2026-12-01-ponsonby');
      expect(puzzle.locationHint.maskedName).toBe('P•••••••');
      expect(secret.locationName).toBe('Ponsonby, Auckland');
      expect(JSON.stringify(puzzle.words).includes('Ponsonby')).toBe(false);
    }
    const set = read('docs/sample-daily-set.json') as { slots: { difficulty: string; available: boolean }[] };
    expect(set.slots.map((slot) => slot.difficulty)).toEqual(['easy', 'medium', 'hard', 'super_hard']);
    expect(set.slots.filter((slot) => slot.available)).toHaveLength(2);
  });

  it('plays the full neighbourhood from the first street to the last', () => {
    const { puzzle, state } = solveAll('docs/sample-ponsonby.json');
    expect(state.completed).toBe(true);
    expect(puzzle.words.every((word) => state.solved[word.id])).toBe(true);
    const share = buildShareText({
      number: 1,
      difficulty: puzzle.difficulty,
      wordIds: puzzle.words.map((word) => word.id),
      hintsOnWord: state.hintsOnWord,
      totalHints: 0,
      minutes: 1,
    });
    expect(share).toContain('Crossings #1 · Medium');
    expect(share.toLowerCase()).not.toContain('ponsonby');
    expect(share.toLowerCase()).not.toContain('auckland');
  });

  it('plays the shorter easy set as well', () => {
    const { state } = solveAll('docs/sample-ponsonby-easy.json');
    expect(state.completed).toBe(true);
  });
});
