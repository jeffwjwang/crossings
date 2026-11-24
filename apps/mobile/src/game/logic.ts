import { whereAmIHash } from '@crossings/puzzle-schema';

import type { GameAction, GameContext, GameState, PlayablePuzzle } from './types';

export function buildContext(puzzle: PlayablePuzzle, answers: Record<string, string>): GameContext {
  const letterByCell: Record<number, string> = {};
  const cellById = new Map(puzzle.cells.map((cell) => [cell.id, cell]));
  const wordById = new Map(puzzle.words.map((word) => [word.id, word]));
  for (const word of puzzle.words) {
    const answer = answers[word.id];
    if (!answer || answer.length !== word.cellIds.length) {
      throw new Error(`Answer for ${word.id} does not match its cells`);
    }
    word.cellIds.forEach((cellId, index) => {
      const letter = answer[index] ?? '';
      const previous = letterByCell[cellId];
      if (previous && previous !== letter) {
        throw new Error(`Crossing at cell ${cellId} is ${previous} and ${letter}`);
      }
      letterByCell[cellId] = letter;
    });
  }
  return { puzzle, answers, letterByCell, cellById, wordById };
}

export function isDiscovered(ctx: GameContext, state: GameState, wordId: string): boolean {
  if (wordId === ctx.puzzle.startWordId || state.solved[wordId]) return true;
  const word = ctx.wordById.get(wordId);
  if (!word) return false;
  return word.cellIds.some((cellId) => {
    const cell = ctx.cellById.get(cellId);
    return cell?.wordIds.some((other) => other !== wordId && state.solved[other]) ?? false;
  });
}

/** A cell is locked only after one of its streets is fully solved. Given letters stay editable. */
export function isLocked(ctx: GameContext, state: GameState, cellId: number): boolean {
  const cell = ctx.cellById.get(cellId);
  return cell?.wordIds.some((wordId) => state.solved[wordId]) ?? false;
}

export function totalHints(state: GameState): number {
  return Object.values(state.hintsOnWord).reduce((sum, count) => sum + count, 0);
}

export function solvedCount(state: GameState): number {
  return Object.values(state.solved).filter(Boolean).length;
}

function blankState(puzzle: PlayablePuzzle): GameState {
  const solved: Record<string, boolean> = {};
  const hintsOnWord: Record<string, number> = {};
  const wrongChecksOnWord: Record<string, number> = {};
  for (const word of puzzle.words) {
    solved[word.id] = false;
    hintsOnWord[word.id] = 0;
    wrongChecksOnWord[word.id] = 0;
  }
  return {
    entries: {},
    hinted: {},
    prefilled: {},
    solved,
    hintsOnWord,
    wrongChecksOnWord,
    wrongChecks: 0,
    activeSeconds: 0,
    currentWordId: puzzle.startWordId,
    cursor: 0,
    completed: false,
    cardWordId: null,
    finaleVisible: false,
    whereAmIGuess: null,
    whereAmICorrect: null,
    feedback: null,
    failNonce: 0,
  };
}

function copyState(state: GameState): GameState {
  return {
    ...state,
    entries: { ...state.entries },
    hinted: { ...state.hinted },
    prefilled: { ...state.prefilled },
    solved: { ...state.solved },
    hintsOnWord: { ...state.hintsOnWord },
    wrongChecksOnWord: { ...state.wrongChecksOnWord },
    feedback: state.feedback ? { ...state.feedback } : null,
  };
}

function firstWritable(ctx: GameContext, state: GameState, wordId: string): number {
  const cells = ctx.wordById.get(wordId)?.cellIds ?? [];
  for (let index = 0; index < cells.length; index += 1) {
    const cellId = cells[index];
    if (cellId == null) continue;
    if (!isLocked(ctx, state, cellId) && !state.entries[cellId]) return index;
  }
  for (let index = 0; index < cells.length; index += 1) {
    const cellId = cells[index];
    if (cellId != null && !isLocked(ctx, state, cellId)) return index;
  }
  return 0;
}

function cellIdsOf(ctx: GameContext, wordId: string): number[] {
  return ctx.wordById.get(wordId)?.cellIds ?? [];
}

function unlockedIndexes(ctx: GameContext, state: GameState, wordId: string): number[] {
  return cellIdsOf(ctx, wordId)
    .map((cellId, index) => (isLocked(ctx, state, cellId) ? -1 : index))
    .filter((index) => index >= 0);
}

/** Next editable square at or after `from`, wrapping to the start of the word. */
function editableAt(ctx: GameContext, state: GameState, wordId: string, from: number): number | null {
  const open = unlockedIndexes(ctx, state, wordId);
  if (open.length === 0) return null;
  return open.find((index) => index >= from) ?? open[0] ?? null;
}

/** Next unlocked square strictly after `after`. Does not wrap. */
function nextUnlocked(ctx: GameContext, state: GameState, wordId: string, after: number): number | null {
  return unlockedIndexes(ctx, state, wordId).find((index) => index > after) ?? null;
}

/**
 * Where the caret goes after a letter. Skips given letters that have not been
 * edited, so Backspace deletes the letter just typed instead of a gift letter.
 * Does not wrap, so the last letter stays selected and can be corrected.
 */
function nextTypingCursor(ctx: GameContext, state: GameState, wordId: string, after: number): number | null {
  const cells = cellIdsOf(ctx, wordId);
  return (
    unlockedIndexes(ctx, state, wordId).find((index) => {
      if (index <= after) return false;
      const cellId = cells[index];
      return cellId != null && !state.prefilled[cellId];
    }) ?? null
  );
}

/** Square a key writes into. The active square if it can be edited, otherwise the next open one. */
function writeIndex(ctx: GameContext, state: GameState, wordId: string): number | null {
  const cellId = cellIdsOf(ctx, wordId)[state.cursor];
  if (cellId != null && !isLocked(ctx, state, cellId)) return state.cursor;
  return editableAt(ctx, state, wordId, state.cursor);
}

function previousEditable(ctx: GameContext, state: GameState, wordId: string, before: number): number | null {
  const open = unlockedIndexes(ctx, state, wordId);
  for (let i = open.length - 1; i >= 0; i -= 1) {
    const index = open[i];
    if (index != null && index < before) return index;
  }
  return null;
}

/** Previous square Backspace may clear. Given letters are left alone unless they are the selected square. */
function previousDeletable(ctx: GameContext, state: GameState, wordId: string, before: number): number | null {
  const cells = cellIdsOf(ctx, wordId);
  const open = unlockedIndexes(ctx, state, wordId);
  for (let i = open.length - 1; i >= 0; i -= 1) {
    const index = open[i];
    if (index == null || index >= before) continue;
    const cellId = cells[index];
    if (cellId == null || state.prefilled[cellId]) continue;
    return index;
  }
  return null;
}

function wordIsFilled(ctx: GameContext, state: GameState, wordId: string): boolean {
  const cells = ctx.wordById.get(wordId)?.cellIds ?? [];
  return cells.every((cellId) => Boolean(state.entries[cellId]));
}

function wordIsCorrect(ctx: GameContext, state: GameState, wordId: string): boolean {
  const cells = ctx.wordById.get(wordId)?.cellIds ?? [];
  return cells.every((cellId) => state.entries[cellId] === ctx.letterByCell[cellId]);
}

function wrongCellIds(ctx: GameContext, state: GameState, wordId: string): number[] {
  const cells = ctx.wordById.get(wordId)?.cellIds ?? [];
  return cells.filter((cellId) => {
    const got = state.entries[cellId];
    return Boolean(got) && got !== ctx.letterByCell[cellId];
  });
}

function finishIfDone(state: GameState, puzzle: PlayablePuzzle): void {
  state.completed = puzzle.words.every((word) => state.solved[word.id]);
}

function markSolved(ctx: GameContext, state: GameState, wordId: string, showCard: boolean): GameState {
  if (state.solved[wordId]) return state;
  const next = copyState(state);
  const cells = ctx.wordById.get(wordId)?.cellIds ?? [];
  next.solved[wordId] = true;
  for (const cellId of cells) {
    next.entries[cellId] = ctx.letterByCell[cellId] ?? '';
  }
  if (showCard) next.cardWordId = wordId;
  finishIfDone(next, ctx.puzzle);
  next.feedback = {
    tone: 'good',
    text: next.completed
      ? 'Correct! The whole map is revealed.'
      : 'Correct! New streets appear on the map.',
  };
  return sweep(ctx, next, false);
}

/** A crossing can complete another street. Open it, but keep the card on the street the player solved. */
function sweep(ctx: GameContext, state: GameState, showCard: boolean): GameState {
  let current = state;
  let moved = true;
  while (moved) {
    moved = false;
    for (const word of ctx.puzzle.words) {
      if (current.solved[word.id]) continue;
      if (!isDiscovered(ctx, current, word.id)) continue;
      if (!wordIsCorrect(ctx, current, word.id)) continue;
      current = markSolved(ctx, current, word.id, showCard);
      moved = true;
    }
  }
  return current;
}

function evaluateWord(ctx: GameContext, state: GameState, wordId: string, explicit: boolean): GameState {
  const mode = ctx.puzzle.rules.checkMode;
  const filled = wordIsFilled(ctx, state, wordId);
  if (wordIsCorrect(ctx, state, wordId) && filled) {
    return markSolved(ctx, state, wordId, true);
  }
  if (!filled) {
    if (!explicit) return state;
    const next = copyState(state);
    if (mode !== 'end_only') {
      next.failNonce += wrongCellIds(ctx, next, wordId).length > 0 ? 1 : 0;
    }
    next.feedback = {
      tone: 'bad',
      text: 'Keep going — some letters are still empty.',
    };
    return next;
  }
  const next = copyState(state);
  next.wrongChecks += 1;
  next.wrongChecksOnWord[wordId] = (next.wrongChecksOnWord[wordId] ?? 0) + 1;
  next.failNonce += 1;
  if (mode === 'end_only') {
    next.feedback = {
      tone: 'bad',
      text: 'Not quite. This street stays in the fog. Try again, or tap Hint.',
    };
  } else {
    next.feedback = {
      tone: 'bad',
      text: 'Not quite. Red letters are wrong. Try again, or tap Hint.',
    };
  }
  return next;
}

export function wrongCells(ctx: GameContext, state: GameState): number[] {
  if (ctx.puzzle.rules.checkMode === 'end_only') return [];
  if (state.feedback?.tone !== 'bad') return [];
  const cells = ctx.wordById.get(state.currentWordId)?.cellIds ?? [];
  return cells.filter((cellId) => {
    const got = state.entries[cellId];
    return Boolean(got) && got !== ctx.letterByCell[cellId];
  });
}

function typeLetter(ctx: GameContext, state: GameState, raw: string): GameState {
  const letter = raw.toUpperCase();
  if (!/^[A-Z]$/.test(letter)) return state;
  const wordId = state.currentWordId;
  if (state.solved[wordId] || state.completed) return state;
  const index = writeIndex(ctx, state, wordId);
  if (index == null) return state;
  const cellId = cellIdsOf(ctx, wordId)[index];
  if (cellId == null) return state;
  const next = copyState(state);
  next.entries[cellId] = letter;
  next.hinted[cellId] = false;
  next.prefilled[cellId] = false;
  next.cursor = nextTypingCursor(ctx, next, wordId, index) ?? index;
  next.feedback = null;
  next.cardWordId = null;
  if (wordIsFilled(ctx, next, wordId)) return evaluateWord(ctx, next, wordId, false);
  return next;
}

function backspace(ctx: GameContext, state: GameState): GameState {
  const wordId = state.currentWordId;
  if (state.solved[wordId] || state.completed) return state;
  const cells = cellIdsOf(ctx, wordId);
  const next = copyState(state);
  const currentId = cells[state.cursor];
  const currentEditable = currentId != null && !isLocked(ctx, state, currentId);
  if (currentEditable && state.entries[currentId] && !state.prefilled[currentId]) {
    delete next.entries[currentId];
    next.hinted[currentId] = false;
    next.prefilled[currentId] = false;
    const previous = previousDeletable(ctx, next, wordId, state.cursor);
    if (previous != null) next.cursor = previous;
  } else if (currentEditable && state.entries[currentId] && state.prefilled[currentId]) {
    delete next.entries[currentId];
    next.hinted[currentId] = false;
    next.prefilled[currentId] = false;
  } else {
    const previous = previousDeletable(ctx, state, wordId, state.cursor);
    if (previous == null) return state;
    const id = cells[previous];
    if (id == null) return state;
    delete next.entries[id];
    next.hinted[id] = false;
    next.prefilled[id] = false;
    next.cursor = previous;
  }
  next.feedback = null;
  next.cardWordId = null;
  return next;
}

export function createInitialState(ctx: GameContext): GameState {
  const state = blankState(ctx.puzzle);
  for (const cell of ctx.puzzle.cells) {
    if (!cell.preRevealed) continue;
    state.entries[cell.id] = ctx.letterByCell[cell.id] ?? '';
    state.prefilled[cell.id] = true;
  }
  state.cursor = firstWritable(ctx, state, state.currentWordId);
  return sweep(ctx, state, false);
}

export function reduce(ctx: GameContext, state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'type':
      return typeLetter(ctx, state, action.letter);
    case 'backspace':
      return backspace(ctx, state);
    case 'move': {
      const wordId = state.currentWordId;
      const target =
        action.delta < 0
          ? previousEditable(ctx, state, wordId, state.cursor)
          : nextUnlocked(ctx, state, wordId, state.cursor);
      if (target == null || target === state.cursor) return state;
      return { ...state, cursor: target };
    }
    case 'check': {
      if (state.solved[state.currentWordId]) {
        return { ...state, feedback: { tone: 'neutral', text: 'That street is already solved.' } };
      }
      return evaluateWord(ctx, state, state.currentWordId, true);
    }
    case 'hint': {
      const wordId = state.currentWordId;
      if (state.solved[wordId] || state.completed) return state;
      const limit = ctx.puzzle.rules.maxHints;
      if (limit != null && totalHints(state) >= limit) {
        return {
          ...state,
          feedback: { tone: 'neutral', text: 'No hints left on this difficulty.' },
        };
      }
      const cells = ctx.wordById.get(wordId)?.cellIds ?? [];
      const open = (index: number) => {
        const cellId = cells[index];
        if (cellId == null) return false;
        return !isLocked(ctx, state, cellId) && state.entries[cellId] !== ctx.letterByCell[cellId];
      };
      const index = open(state.cursor) ? state.cursor : cells.findIndex((_, item) => open(item));
      if (index < 0) return evaluateWord(ctx, state, wordId, false);
      const cellId = cells[index];
      if (cellId == null) return state;
      const next = copyState(state);
      next.entries[cellId] = ctx.letterByCell[cellId] ?? '';
      next.hinted[cellId] = true;
      next.hintsOnWord[wordId] = (next.hintsOnWord[wordId] ?? 0) + 1;
      next.cursor = index;
      next.feedback = { tone: 'neutral', text: 'A letter has been filled in for you.' };
      if (wordIsFilled(ctx, next, wordId)) return evaluateWord(ctx, next, wordId, false);
      return next;
    }
    case 'select': {
      if (!isDiscovered(ctx, state, action.wordId)) return state;
      const cells = cellIdsOf(ctx, action.wordId);
      const length = cells.length || 1;
      let index =
        action.index == null
          ? firstWritable(ctx, state, action.wordId)
          : Math.max(0, Math.min(length - 1, action.index));
      const chosen = cells[index];
      if (chosen != null && isLocked(ctx, state, chosen)) {
        index = editableAt(ctx, state, action.wordId, index) ?? index;
      }
      return {
        ...state,
        currentWordId: action.wordId,
        cursor: index,
        feedback: null,
        cardWordId: null,
      };
    }
    case 'dismissCard':
      return { ...state, cardWordId: null };
    case 'nextUnsolved': {
      const words = ctx.puzzle.words;
      const start = words.findIndex((word) => word.id === state.currentWordId);
      for (let step = 1; step <= words.length; step += 1) {
        const word = words[(start + step) % words.length];
        if (word && isDiscovered(ctx, state, word.id) && !state.solved[word.id]) {
          return reduce(ctx, state, { type: 'select', wordId: word.id });
        }
      }
      return { ...state, cardWordId: null };
    }
    case 'addTime':
      if (state.completed || action.seconds <= 0) return state;
      return { ...state, activeSeconds: state.activeSeconds + action.seconds };
    case 'guessWhere': {
      const where = ctx.puzzle.finale?.whereAmI;
      if (!where || state.whereAmIGuess || state.completed) return state;
      if (solvedCount(state) < where.askAfterSolvedCount) {
        return {
          ...state,
          feedback: { tone: 'neutral', text: 'Solve a few more streets before guessing.' },
        };
      }
      const correct = whereAmIHash(ctx.puzzle.id, action.option) === where.answerHash;
      return {
        ...state,
        whereAmIGuess: action.option,
        whereAmICorrect: correct,
        feedback: {
          tone: correct ? 'good' : 'bad',
          text: correct
            ? "That's the one. The name stays hidden until the map is complete."
            : 'Not this time. You only get one guess.',
        },
      };
    }
    case 'showFinale':
      return state.completed ? { ...state, finaleVisible: true, cardWordId: null } : state;
    case 'hideFinale':
      return { ...state, finaleVisible: false };
    default:
      return state;
  }
}
