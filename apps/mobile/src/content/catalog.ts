import {
  DIFFICULTY_ORDER,
  DIFFICULTY_PRESETS,
  puzzleSchema,
  type Difficulty,
  type Puzzle,
} from '@crossings/puzzle-schema';

import easyJson from '../../assets/puzzles/ponsonby-easy.json';
import mediumJson from '../../assets/puzzles/ponsonby-medium.json';
import keysJson from './sample-keys.json';

export const SAMPLE_DATE = '2026-12-01';
export const SAMPLE_SET_ID = '2026-12-01-ponsonby';
export const SAMPLE_NUMBER = 1;

const KEYS = keysJson as Record<string, string>;

const BUNDLED: Record<string, Puzzle> = {
  [puzzleSchema.parse(easyJson).id]: puzzleSchema.parse(easyJson),
  [puzzleSchema.parse(mediumJson).id]: puzzleSchema.parse(mediumJson),
};

export interface DailySlot {
  difficulty: Difficulty;
  label: string;
  summary: string;
  puzzleId: string | null;
  available: boolean;
}

export const LOCAL_SLOTS: DailySlot[] = DIFFICULTY_ORDER.map((difficulty) => {
  const preset = DIFFICULTY_PRESETS[difficulty];
  const puzzleId = `${SAMPLE_SET_ID}-${difficulty === 'super_hard' ? 'super-hard' : difficulty}`;
  return {
    difficulty,
    label: preset.label,
    summary: preset.summary,
    puzzleId,
    available: Boolean(BUNDLED[puzzleId]),
  };
});

export function bundledPuzzle(id: string): Puzzle | null {
  return BUNDLED[id] ?? null;
}

export function bundledKey(id: string): string | null {
  return KEYS[id] ?? null;
}
