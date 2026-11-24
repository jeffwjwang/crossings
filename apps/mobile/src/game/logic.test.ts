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
    expect(isLocked(ctx, initial, 2)).toBe(false);
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

describe('correcting letters', () => {
  it('overwrites a wrong letter in the selected square', () => {
    const { ctx, state: initial } = play('per_word');
    let state = reduce(ctx, initial, { type: 'type', letter: 'Z' });
    expect(state.entries[0]).toBe('Z');
    state = reduce(ctx, state, { type: 'select', wordId: 'a', index: 0 });
    state = reduce(ctx, state, { type: 'type', letter: 'C' });
    expect(state.entries[0]).toBe('C');
    expect(state.cursor).toBe(1);
  });

  it('backspace deletes the current letter and steps back', () => {
    const { ctx, state: initial } = play('per_word');
    let state = reduce(ctx, initial, { type: 'type', letter: 'Z' });
    state = reduce(ctx, state, { type: 'type', letter: 'Q' });
    expect(state.entries[0]).toBe('Z');
    expect(state.entries[1]).toBe('Q');
    state = reduce(ctx, state, { type: 'backspace' });
    expect(state.entries[1]).toBeUndefined();
    expect(state.cursor).toBe(0);
    state = reduce(ctx, state, { type: 'backspace' });
    expect(state.entries[0]).toBeUndefined();
  });

  it('keeps accepting letters when the caret is already on the last square', () => {
    const { ctx, state: initial } = play('per_word');
    let state = reduce(ctx, initial, { type: 'type', letter: 'Z' });
    state = reduce(ctx, state, { type: 'type', letter: 'Q' });
    expect(state.cursor).toBe(1);
    state = reduce(ctx, state, { type: 'type', letter: 'A' });
    expect(state.entries[1]).toBe('A');
    expect(state.entries[0]).toBe('Z');
    expect(state.cursor).toBe(1);
  });

  it('backspace on an empty square deletes the previous letter', () => {
    const { ctx, state: initial } = play('per_word');
    let state = reduce(ctx, initial, { type: 'type', letter: 'Z' });
    expect(state.cursor).toBe(1);
    expect(state.entries[1]).toBeUndefined();
    state = reduce(ctx, state, { type: 'backspace' });
    expect(state.entries[0]).toBeUndefined();
    expect(state.cursor).toBe(0);
  });

  it('still enters a letter when the cursor is sitting on a solved crossing', () => {
    const ctx = buildContext(
      {
        id: 'cross',
        startWordId: 'a',
        rules: {
          maxHints: null,
          preRevealRatio: 0,
          checkMode: 'per_word',
          showWordLengthOnMap: true,
          targetSeconds: 100,
        },
        cells: [
          { id: 0, wordIds: ['a', 'b'], preRevealed: false },
          { id: 1, wordIds: ['a'], preRevealed: false },
          { id: 2, wordIds: ['b'], preRevealed: false },
          { id: 3, wordIds: ['b'], preRevealed: false },
        ],
        words: [
          { id: 'a', cellIds: [0, 1] },
          { id: 'b', cellIds: [0, 2, 3] },
        ],
      },
      { a: 'CA', b: 'CXY' },
    );
    let state = createInitialState(ctx);
    state = reduce(ctx, state, { type: 'type', letter: 'C' });
    state = reduce(ctx, state, { type: 'type', letter: 'A' });
    expect(state.solved.a).toBe(true);
    expect(state.solved.b).toBe(false);
    expect(isLocked(ctx, state, 0)).toBe(true);
    expect(isLocked(ctx, state, 2)).toBe(false);

    state = reduce(ctx, state, { type: 'select', wordId: 'b', index: 0 });
    expect(state.cursor).not.toBe(0);
    state = reduce(ctx, state, { type: 'type', letter: 'Z' });
    expect(state.entries[0]).toBe('C');
    expect(state.entries[2]).toBe('Z');
    state = reduce(ctx, state, { type: 'select', wordId: 'b', index: 1 });
    state = reduce(ctx, state, { type: 'type', letter: 'X' });
    expect(state.entries[2]).toBe('X');
    expect(state.entries[0]).toBe('C');
  });

  it('skips a given letter when moving on, and Backspace removes the letter just typed', () => {
    const ctx = buildContext(
      {
        id: 'gift',
        startWordId: 'a',
        rules: {
          maxHints: null,
          preRevealRatio: 0,
          checkMode: 'per_word',
          showWordLengthOnMap: true,
          targetSeconds: 100,
        },
        cells: [
          { id: 0, wordIds: ['a'], preRevealed: false },
          { id: 1, wordIds: ['a'], preRevealed: true },
          { id: 2, wordIds: ['a'], preRevealed: false },
        ],
        words: [{ id: 'a', cellIds: [0, 1, 2] }],
      },
      { a: 'CAT' },
    );
    let state = createInitialState(ctx);
    expect(state.entries[1]).toBe('A');
    expect(isLocked(ctx, state, 1)).toBe(false);
    state = reduce(ctx, state, { type: 'type', letter: 'Z' });
    expect(state.entries[0]).toBe('Z');
    expect(state.entries[1]).toBe('A');
    expect(state.cursor).toBe(2);
    state = reduce(ctx, state, { type: 'backspace' });
    expect(state.entries[0]).toBeUndefined();
    expect(state.entries[1]).toBe('A');
    expect(state.cursor).toBe(0);
    state = reduce(ctx, state, { type: 'select', wordId: 'a', index: 1 });
    state = reduce(ctx, state, { type: 'type', letter: 'X' });
    expect(state.entries[1]).toBe('X');
    expect(isLocked(ctx, state, 1)).toBe(false);
  });

  it('does not lock a wrong letter after Check', () => {
    const { ctx, state: initial } = play('per_word');
    let state = reduce(ctx, initial, { type: 'type', letter: 'Z' });
    state = reduce(ctx, state, { type: 'type', letter: 'Q' });
    state = reduce(ctx, state, { type: 'check' });
    expect(state.solved.a).toBe(false);
    expect(isLocked(ctx, state, 0)).toBe(false);
    expect(isLocked(ctx, state, 1)).toBe(false);
    state = reduce(ctx, state, { type: 'select', wordId: 'a', index: 0 });
    state = reduce(ctx, state, { type: 'type', letter: 'C' });
    state = reduce(ctx, state, { type: 'type', letter: 'A' });
    expect(state.solved.a).toBe(true);
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
