import type { DifficultyRules } from '@crossings/puzzle-schema';

/** The slice of a puzzle the rules engine needs. A full Puzzle satisfies this. */
export interface PlayablePuzzle {
  id: string;
  startWordId: string;
  rules: DifficultyRules;
  cells: { id: number; wordIds: string[]; preRevealed: boolean }[];
  words: { id: string; cellIds: number[] }[];
  finale?: {
    whereAmI?: { askAfterSolvedCount: number; options: string[]; answerHash: string };
  };
}

export interface GameFeedback {
  tone: 'good' | 'bad' | 'neutral';
  text: string;
}

export interface GameState {
  entries: Record<number, string>;
  hinted: Record<number, boolean>;
  prefilled: Record<number, boolean>;
  solved: Record<string, boolean>;
  hintsOnWord: Record<string, number>;
  wrongChecksOnWord: Record<string, number>;
  wrongChecks: number;
  activeSeconds: number;
  currentWordId: string;
  cursor: number;
  completed: boolean;
  cardWordId: string | null;
  finaleVisible: boolean;
  whereAmIGuess: string | null;
  whereAmICorrect: boolean | null;
  feedback: GameFeedback | null;
  failNonce: number;
}

export type GameAction =
  | { type: 'type'; letter: string }
  | { type: 'backspace' }
  | { type: 'move'; delta: number }
  | { type: 'check' }
  | { type: 'hint' }
  | { type: 'select'; wordId: string; index?: number }
  | { type: 'dismissCard' }
  | { type: 'nextUnsolved' }
  | { type: 'addTime'; seconds: number }
  | { type: 'guessWhere'; option: string }
  | { type: 'showFinale' }
  | { type: 'hideFinale' };

export interface GameContext {
  puzzle: PlayablePuzzle;
  answers: Record<string, string>;
  letterByCell: Record<number, string>;
  cellById: Map<number, PlayablePuzzle['cells'][number]>;
  wordById: Map<string, PlayablePuzzle['words'][number]>;
}
