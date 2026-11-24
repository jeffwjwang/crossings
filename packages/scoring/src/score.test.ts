import { describe, expect, it } from 'vitest';

import { scorePlay } from './score';
import { addDays, advanceStreak, nzDate } from './streak';

describe('scorePlay', () => {
  const words = [
    { id: 'a', nonPrefilledLetters: 4, hintedLetters: 0, wrongChecks: 0 },
    { id: 'b', nonPrefilledLetters: 3, hintedLetters: 1, wrongChecks: 2 },
  ];

  it('applies the medium multiplier, a time bonus, and a no-hint bonus', () => {
    const result = scorePlay({
      difficulty: 'medium',
      words: words.map((word) => ({ ...word, hintedLetters: 0, wrongChecks: 0 })),
      activeSeconds: 0,
      targetSeconds: 720,
      hintsUsed: 0,
      whereAmICorrect: false,
      streak: 0,
    });
    expect(result.wordScores).toEqual({ a: 40, b: 30 });
    expect(result.raw).toBe(70);
    expect(result.score).toBe(Math.round((70 * 1.5 + 70 * 0.3 + 70 * 0.2) * 1));
  });

  it('floors a word at zero and drops the no-hint bonus after a hint', () => {
    const result = scorePlay({
      difficulty: 'easy',
      words: [{ id: 'a', nonPrefilledLetters: 1, hintedLetters: 2, wrongChecks: 3 }],
      activeSeconds: 9999,
      targetSeconds: 480,
      hintsUsed: 2,
      whereAmICorrect: true,
      streak: 10,
    });
    expect(result.wordScores.a).toBe(0);
    expect(result.noHintBonus).toBe(0);
    expect(result.timeBonus).toBe(0);
    expect(result.whereAmIBonus).toBe(50);
    expect(result.streakMul).toBe(1.5);
    expect(result.score).toBe(Math.round(50 * 1.5));
  });

  it('halves an assisted score', () => {
    const plain = scorePlay({
      difficulty: 'hard',
      words: [{ id: 'a', nonPrefilledLetters: 5, hintedLetters: 0, wrongChecks: 0 }],
      activeSeconds: 1080,
      targetSeconds: 1080,
      hintsUsed: 1,
      whereAmICorrect: false,
      streak: 0,
    });
    const assisted = scorePlay({
      difficulty: 'hard',
      words: [{ id: 'a', nonPrefilledLetters: 5, hintedLetters: 0, wrongChecks: 0 }],
      activeSeconds: 1080,
      targetSeconds: 1080,
      hintsUsed: 1,
      whereAmICorrect: false,
      streak: 0,
      assisted: true,
    });
    expect(assisted.score).toBe(Math.round(plain.score * 0.5));
  });
});

describe('streak', () => {
  it('formats the New Zealand calendar date', () => {
    expect(nzDate(new Date('2026-11-23T12:00:00Z'))).toBe('2026-11-24');
    expect(nzDate(new Date('2026-11-23T10:00:00Z'))).toBe('2026-11-23');
  });

  it('increments once per day and resets after a gap', () => {
    const first = advanceStreak({ current: 0, best: 0, lastDay: null }, '2026-11-24');
    expect(first).toEqual({ current: 1, best: 1, lastDay: '2026-11-24' });
    const sameDay = advanceStreak(first, '2026-11-24');
    expect(sameDay).toBe(first);
    const next = advanceStreak(first, addDays('2026-11-24', 1));
    expect(next.current).toBe(2);
    const later = advanceStreak(next, addDays('2026-11-24', 4));
    expect(later.current).toBe(1);
    expect(later.best).toBe(2);
  });
});
