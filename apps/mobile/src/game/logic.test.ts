import { whereAmIHash } from '@crossings/puzzle-schema';
import { describe, expect, it } from 'vitest';

import { buildContext, createInitialState, isDiscovered, isLocked, reduce, solvedCount } from './logic';
import { buildShareText } from './share';
import type { PlayablePuzzle } from './types';

function puzzle(mode: PlayablePuzzle['rules']['checkMode'], maxHints: number | null = null): PlayablePuzzle {
  return {
    id: 'toy',
    startWordId: 'a',
    rules: {
      maxHints,
      preRevealRatio: 0,
      checkMode: mode,
      showWordLengthOnMap: true,
      targetSeconds: 100,
    },
    cells: [
      { id: 0, wordIds: ['a', 'b'], preRevealed: false },
      { id: 1, wordIds: ['a'], preRevealed: false },
      { id: 2, wordIds: ['b'], preRevealed: true },
    ],
    words: [
      { id: 'a', cellIds: [0, 1] },
      { id: 'b', cellIds: [0, 2] },
    ],
    finale: {
      whereAmI: {
        askAfterSolvedCount: 0,
        options: ['Ponsonby', 'Parnell', 'Devonport', 'Grey Lynn'],
        answerHash: whereAmIHash('toy', 'Ponsonby'),
      },
    },
  };
}

const answers = { a: 'CA', b: 'CT' };

function play(mode: PlayablePuzzle['rules']['checkMode'] = 'per_word', maxHints: number | null = 2) {
  const ctx = buildContext(puzzle(mode, maxHints), answers);
  return { ctx, state: createInitialState(ctx) };
}

describe('crossings and discovery', () => {
  it('shares a crossing letter and locks it once one street is solved', () => {
    const { ctx, state: initial } = play();
    expect(initial.entries[2]).toBe('T');
    expect(isLocked(ctx, initial, 2)).toBe(true);
    expect(isDiscovered(ctx, initial, 'b')).toBe(false);

    let state = reduce(ctx, initial, { type: 'select', wordId: 'a', index: 0 });
    state = reduce(ctx, state, { type: 'type', letter: 'C' });
    expect(state.entries[0]).toBe('C');
    expect(state.solved.a).toBe(false);
    state = reduce(ctx, state, { type: 'type', letter: 'A' });

    expect(state.solved.a).toBe(true);
    expect(state.solved.b).toBe(true);
    expect(state.completed).toBe(true);
    expect(state.entries[0]).toBe('C');
    expect(isLocked(ctx, state, 0)).toBe(true);
    expect(isDiscovered(ctx, state, 'b')).toBe(true);
  });

  it('rejects a crossing whose letters disagree', () => {
    expect(() => buildContext(puzzle('per_word'), { a: 'CA', b: 'XT' })).toThrow(/Crossing/);
  });

  it('does not open a side street until the crossing street is solved', () => {
    const { ctx, state } = play('per_letter');
    const ignored = reduce(ctx, state, { type: 'select', wordId: 'b' });
    expect(ignored.currentWordId).toBe('a');
    expect(solvedCount(state)).toBe(0);
  });
});

describe('check modes', () => {
  it('marks a wrong letter immediately on easy, and a wrong word on medium', () => {
    const easy = play('per_letter');
    const typed = reduce(easy.ctx, easy.state, { type: 'type', letter: 'Z' });
    expect(typed.entries[0]).toBe('Z');
    expect(typed.feedback?.tone).toBe('bad');
    expect(typed.wrongChecks).toBe(0);

    const medium = play('per_word');
    let state = reduce(medium.ctx, medium.state, { type: 'type', letter: 'Z' });
    expect(state.feedback).toBeNull();
    state = reduce(medium.ctx, state, { type: 'type', letter: 'A' });
    expect(state.solved.a).toBe(false);
    expect(state.wrongChecks).toBe(1);
    expect(state.feedback?.text).toMatch(/Red letters/);
  });

  it('on super hard, a wrong street gets no letter marks and a right one still opens the fog', () => {
    const { ctx, state: initial } = play('end_only');
    let state = reduce(ctx, initial, { type: 'type', letter: 'Z' });
    state = reduce(ctx, state, { type: 'type', letter: 'A' });
    expect(state.solved.a).toBe(false);
    expect(state.wrongChecks).toBe(1);
    expect(state.feedback?.text).toMatch(/fog/);

    state = reduce(ctx, state, { type: 'select', wordId: 'a', index: 0 });
    state = reduce(ctx, state, { type: 'type', letter: 'C' });
    state = reduce(ctx, state, { type: 'type', letter: 'A' });
    expect(state.completed).toBe(true);
  });

  it('stops hints at the difficulty limit', () => {
    const { ctx, state: initial } = play('per_word', 1);
    let state = reduce(ctx, initial, { type: 'hint' });
    expect(state.entries[0]).toBe('C');
    expect(state.hintsOnWord.a).toBe(1);
    state = reduce(ctx, state, { type: 'hint' });
    expect(state.hintsOnWord.a).toBe(1);
    expect(state.feedback?.text).toMatch(/No hints/);
  });

  it('allows one where-am-I guess, and not after the map is complete', () => {
    const { ctx, state: initial } = play('per_word');
    const wrong = reduce(ctx, initial, { type: 'guessWhere', option: 'Parnell' });
    expect(wrong.whereAmICorrect).toBe(false);
    const second = reduce(ctx, wrong, { type: 'guessWhere', option: 'Ponsonby' });
    expect(second.whereAmIGuess).toBe('Parnell');

    let done = reduce(ctx, initial, { type: 'type', letter: 'C' });
    done = reduce(ctx, done, { type: 'type', letter: 'A' });
    expect(done.completed).toBe(true);
    expect(reduce(ctx, done, { type: 'guessWhere', option: 'Ponsonby' }).whereAmIGuess).toBeNull();
    expect(solvedCount(done)).toBe(2);
  });
});

describe('share text', () => {
  it('counts hints per street and never names the place', () => {
    const text = buildShareText({
      number: 1,
      difficulty: 'medium',
      wordIds: ['a', 'b'],
      hintsOnWord: { a: 0, b: 2 },
      totalHints: 2,
      minutes: 1,
    });
    expect(text).toContain('Crossings #1 · Medium');
    expect(text).toContain('🟩🟨');
    expect(text).toContain('Where were you today?');
    expect(text.toLowerCase()).not.toContain('ponsonby');
    expect(text.toLowerCase()).not.toContain('auckland');
  });
});
