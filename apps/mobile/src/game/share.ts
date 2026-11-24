import type { Difficulty } from '@crossings/puzzle-schema';

export function difficultyLabel(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'easy':
      return 'Easy';
    case 'medium':
      return 'Medium';
    case 'hard':
      return 'Hard';
    case 'super_hard':
      return 'Super Hard';
  }
}

export function buildShareText(options: {
  number: number;
  difficulty: Difficulty;
  wordIds: string[];
  hintsOnWord: Record<string, number>;
  totalHints: number;
  minutes: number | null;
}): string {
  const squares = options.wordIds
    .map((id) => ((options.hintsOnWord[id] ?? 0) > 0 ? '🟨' : '🟩'))
    .join('');
  const hints = `💡 ${options.totalHints} hint${options.totalHints === 1 ? '' : 's'}`;
  const time = options.minutes != null ? ` · ⏱ ${options.minutes} min` : '';
  return [
    `Crossings #${options.number} · ${difficultyLabel(options.difficulty)}`,
    `🗺️ ${options.wordIds.length}/${options.wordIds.length} streets explored`,
    squares,
    `${hints}${time}`,
    'Where were you today? 🔍',
  ].join('\n');
}

export function maskPlaceName(text: string, locationName: string, revealed: boolean): string {
  if (revealed) return text;
  const suburb = locationName.split(',')[0]?.trim() ?? '';
  if (!suburb) return text;
  const masked = `${suburb[0]}${'•'.repeat(Math.max(0, suburb.length - 1))}`;
  return text.split(suburb).join(masked);
}
