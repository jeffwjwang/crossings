import type { Difficulty } from '@crossings/puzzle-schema';

export const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  easy: 1,
  medium: 1.5,
  hard: 2,
  super_hard: 3,
};

export interface WordScoreInput {
  id: string;
  nonPrefilledLetters: number;
  hintedLetters: number;
  wrongChecks: number;
}

export interface ScoreInput {
  difficulty: Difficulty;
  words: WordScoreInput[];
  activeSeconds: number;
  targetSeconds: number;
  hintsUsed: number;
  whereAmICorrect: boolean;
  streak: number;
  assisted?: boolean;
}

export interface ScoreBreakdown {
  raw: number;
  wordScores: Record<string, number>;
  difficultyMul: number;
  timeBonus: number;
  noHintBonus: number;
  whereAmIBonus: number;
  streakMul: number;
  assistMul: number;
  score: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Local preview of the server score. The phone never has the final say.
 * Pausing on a card or leaving the app should already be excluded from activeSeconds.
 */
export function scorePlay(input: ScoreInput): ScoreBreakdown {
  const wordScores: Record<string, number> = {};
  let raw = 0;
  for (const word of input.words) {
    const base = 10 * word.nonPrefilledLetters;
    const score = Math.max(0, base - 10 * word.hintedLetters - 5 * word.wrongChecks);
    wordScores[word.id] = score;
    raw += score;
  }
  const difficultyMul = DIFFICULTY_MULTIPLIER[input.difficulty];
  const timeRatio =
    input.targetSeconds > 0
      ? clamp((input.targetSeconds - input.activeSeconds) / input.targetSeconds, 0, 1)
      : 0;
  const timeBonus = raw * 0.3 * timeRatio;
  const noHintBonus = input.hintsUsed === 0 ? raw * 0.2 : 0;
  const whereAmIBonus = input.whereAmICorrect ? 50 : 0;
  const streakMul = 1 + Math.min(Math.max(input.streak, 0), 10) * 0.05;
  const assistMul = input.assisted ? 0.5 : 1;
  const score = Math.round(
    (raw * difficultyMul + timeBonus + noHintBonus + whereAmIBonus) * streakMul * assistMul,
  );
  return {
    raw,
    wordScores,
    difficultyMul,
    timeBonus,
    noHintBonus,
    whereAmIBonus,
    streakMul,
    assistMul,
    score,
  };
}
