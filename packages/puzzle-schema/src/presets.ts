import type { Difficulty, DifficultyRules } from './types';

export const DIFFICULTY_PRESETS: Record<
  Difficulty,
  DifficultyRules & { label: string; summary: string }
> = {
  easy: {
    label: 'Easy',
    summary: 'A few short streets. Type freely, then tap Check. Hints are unlimited.',
    maxHints: null,
    preRevealRatio: 0.2,
    checkMode: 'per_letter',
    showWordLengthOnMap: true,
    targetSeconds: 480,
  },
  medium: {
    label: 'Medium',
    summary: 'The full sample neighbourhood. A street is checked as a whole word. Five hints.',
    maxHints: 5,
    preRevealRatio: 0.1,
    checkMode: 'per_word',
    showWordLengthOnMap: true,
    targetSeconds: 720,
  },
  hard: {
    label: 'Hard',
    summary: 'More streets and tighter clues. Three hints. Not in this sample yet.',
    maxHints: 3,
    preRevealRatio: 0,
    checkMode: 'per_word',
    showWordLengthOnMap: true,
    targetSeconds: 1080,
  },
  super_hard: {
    label: 'Super Hard',
    summary: 'The whole neighbourhood. One hint, and no letter-by-letter marking. Not in this sample yet.',
    maxHints: 1,
    preRevealRatio: 0,
    checkMode: 'end_only',
    showWordLengthOnMap: false,
    targetSeconds: 1500,
  },
};

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard', 'super_hard'];
