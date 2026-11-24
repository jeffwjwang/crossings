import { decryptSecret } from './crypto';
import { answerHash, contentHashOf, whereAmIHash } from './hash';
import type { Puzzle, PuzzleSecret } from './types';

export interface ValidationReport {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

const WORD_RANGES: Record<Puzzle['difficulty'], { words: [number, number]; len: [number, number] }> = {
  easy: { words: [4, 5], len: [3, 7] },
  medium: { words: [6, 7], len: [4, 8] },
  hard: { words: [8, 10], len: [5, 10] },
  super_hard: { words: [10, 14], len: [5, 12] },
};

function suburbOf(locationName: string): string {
  return locationName.split(',')[0]?.trim() ?? locationName;
}

export function validatePuzzle(puzzle: Puzzle, keyB64: string): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (puzzle.schemaVersion !== '1.0') {
    errors.push(`Unsupported schemaVersion ${puzzle.schemaVersion}`);
  }
  if (puzzle.kind === 'daily' && (!puzzle.date || !puzzle.dailySetId)) {
    errors.push('Daily puzzles need a date and dailySetId');
  }

  const { secret: encrypted, contentHash, ...rest } = puzzle;
  const recomputed = contentHashOf(rest);
  if (recomputed !== contentHash) {
    errors.push('contentHash does not match the public puzzle');
  }

  let secret: PuzzleSecret;
  try {
    secret = decryptSecret(encrypted, keyB64);
  } catch {
    errors.push('Secret could not be decrypted with the supplied key');
    return { ok: false, errors, warnings };
  }

  const cellById = new Map(puzzle.cells.map((cell) => [cell.id, cell]));
  if (cellById.size !== puzzle.cells.length) errors.push('Cell ids are not unique');
  const wordIds = new Set(puzzle.words.map((word) => word.id));
  if (wordIds.size !== puzzle.words.length) errors.push('Word ids are not unique');
  if (!wordIds.has(puzzle.startWordId)) errors.push('startWordId is not a word');

  for (const word of puzzle.words) {
    if (word.length !== word.cellIds.length) {
      errors.push(`${word.id} length does not match its cells`);
    }
    const answer = secret.answers[word.id];
    if (!answer || !/^[A-Z]+$/.test(answer)) {
      errors.push(`${word.id} is missing an A–Z answer`);
      continue;
    }
    if (answer.length !== word.cellIds.length) {
      errors.push(`${word.id} answer length does not match its cells`);
    }
    if (answerHash(puzzle.id, word.id, answer) !== word.answerHash) {
      errors.push(`${word.id} answerHash does not match the secret`);
    }
    if (!secret.streets[word.id]) errors.push(`${word.id} is missing a street name`);
    for (const cellId of word.cellIds) {
      const cell = cellById.get(cellId);
      if (!cell) errors.push(`${word.id} references missing cell ${cellId}`);
      else if (!cell.wordIds.includes(word.id)) {
        errors.push(`Cell ${cellId} does not list ${word.id}`);
      }
    }
    const card = puzzle.knowledgeCards.find((item) => item.id === word.cardId);
    if (!card) errors.push(`${word.id} points at missing card ${word.cardId}`);
  }

  for (const cell of puzzle.cells) {
    for (const wordId of cell.wordIds) {
      const word = puzzle.words.find((item) => item.id === wordId);
      if (!word || !word.cellIds.includes(cell.id)) {
        errors.push(`Cell ${cell.id} lists ${wordId}, but that word does not use the cell`);
      }
    }
  }

  const letterAt = new Map<number, string>();
  for (const word of puzzle.words) {
    const answer = secret.answers[word.id];
    if (!answer) continue;
    word.cellIds.forEach((cellId, index) => {
      const letter = answer[index];
      const previous = letterAt.get(cellId);
      if (previous && previous !== letter) {
        errors.push(`Shared cell ${cellId} has ${previous} and ${letter}`);
      }
      if (letter) letterAt.set(cellId, letter);
    });
  }

  const spacing = puzzle.cellSpacing;
  let closest = Infinity;
  for (let i = 0; i < puzzle.cells.length; i += 1) {
    for (let j = i + 1; j < puzzle.cells.length; j += 1) {
      const a = puzzle.cells[i];
      const b = puzzle.cells[j];
      if (!a || !b) continue;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      closest = Math.min(closest, dist);
      if (dist < spacing * 0.85) {
        errors.push(`Cells ${a.id} and ${b.id} overlap (${dist.toFixed(1)} m)`);
      }
    }
  }
  if (closest < spacing * 1.15) {
    warnings.push(
      `Closest distinct cells are ${closest.toFixed(1)} m apart; consecutive letters sit near cellSpacing (${spacing} m), under the 1.15× gap`,
    );
  }

  const neighbours = new Map<string, Set<string>>();
  for (const word of puzzle.words) neighbours.set(word.id, new Set());
  for (const cell of puzzle.cells) {
    if (cell.wordIds.length < 2) continue;
    for (const left of cell.wordIds) {
      for (const right of cell.wordIds) {
        if (left !== right) neighbours.get(left)?.add(right);
      }
    }
  }
  const seen = new Set<string>([puzzle.startWordId]);
  const queue = [puzzle.startWordId];
  while (queue.length) {
    const id = queue.pop();
    if (!id) break;
    for (const next of neighbours.get(id) ?? []) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  if (seen.size !== puzzle.words.length) {
    errors.push('Not every street can be reached from the start word by crossings');
  }

  const range = WORD_RANGES[puzzle.difficulty];
  if (puzzle.words.length < range.words[0] || puzzle.words.length > range.words[1]) {
    warnings.push(`${puzzle.difficulty} has ${puzzle.words.length} words; expected ${range.words.join('–')}`);
  }
  for (const word of puzzle.words) {
    if (word.length < range.len[0] || word.length > range.len[1]) {
      warnings.push(`${word.id} is ${word.length} letters; ${puzzle.difficulty} expects ${range.len.join('–')}`);
    }
  }

  const suburb = suburbOf(secret.locationName).toLowerCase();
  const city = secret.locationName.split(',')[1]?.trim().toLowerCase() ?? '';
  const streetNames = Object.values(secret.streets).map((name) => name.toLowerCase());
  for (const word of puzzle.words) {
    const clue = word.clue.text.toLowerCase();
    if (clue.includes(suburb) || (city && clue.includes(city))) {
      errors.push(`Clue for ${word.id} contains the place name`);
    }
    if (streetNames.some((name) => clue.includes(name))) {
      errors.push(`Clue for ${word.id} contains a street name`);
    }
  }

  const cardsById = new Map(puzzle.knowledgeCards.map((card) => [card.id, card]));
  if (!cardsById.has(puzzle.finale.cardId)) errors.push('Finale card is missing');
  for (const card of puzzle.knowledgeCards) {
    if (card.sensitivity === 'review') errors.push(`Card ${card.id} is still marked for review`);
    if (card.kind === 'news' && !card.freshness?.publishedAt) {
      errors.push(`News card ${card.id} needs a published date`);
    }
    const visible = `${card.title}\n${card.body}`.toLowerCase();
    if (card.kind !== 'finale' && (visible.includes(suburb) || (city && visible.includes(city)))) {
      errors.push(`Card ${card.id} reveals the place name before the finale`);
    }
    for (const mediaId of card.mediaIds) {
      if (!puzzle.media.some((media) => media.id === mediaId)) {
        errors.push(`Card ${card.id} references missing media ${mediaId}`);
      }
    }
  }
  for (const media of puzzle.media) {
    if (media.commercialUseOk !== true || !media.alt.trim() || !media.attributionText.trim()) {
      errors.push(`Media ${media.id} is missing commercial permission or attribution`);
    }
  }

  if (puzzle.finale.whereAmI) {
    const where = puzzle.finale.whereAmI;
    const matched = where.options.filter(
      (option) => whereAmIHash(puzzle.id, option) === where.answerHash,
    );
    if (matched.length !== 1) errors.push('Where-am-I answer hash must match exactly one option');
  }

  if (puzzle.attribution.osm !== true || !puzzle.attribution.text.toLowerCase().includes('openstreetmap')) {
    errors.push('OSM attribution is required');
  }

  return { ok: errors.length === 0, errors, warnings };
}
