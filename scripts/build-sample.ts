import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  DIFFICULTY_PRESETS,
  answerHash,
  bytesToBase64,
  contentHashOf,
  encryptSecret,
  puzzleSchema,
  sampleIv,
  sampleKeyBytes,
  validatePuzzle,
  whereAmIHash,
  type Cell,
  type Difficulty,
  type KnowledgeCard,
  type Puzzle,
  type PuzzleSecret,
  type Word,
  type WordSource,
} from '../packages/puzzle-schema/src/index';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(resolve(root, 'docs/prototype/ponsonby-data.json'), 'utf8')) as {
  bbox: [number, number, number, number];
  roads: { n: string; c: number; p: [number, number][] }[];
  cells: { x: number; y: number; a: string }[];
  words: {
    street: string;
    answer: string;
    clue: string;
    cells: number[];
    path: [number, number][];
  }[];
};

const DAILY_SET = '2026-12-01-ponsonby';
const DATE = '2026-12-01';
const LOCATION = 'Ponsonby, Auckland';
const WHERE = ['Ponsonby', 'Parnell', 'Devonport', 'Grey Lynn'];

interface WordMeta {
  street: string;
  answer: string;
  clue: string;
  source: WordSource;
  title: string;
  body: string;
  wiki: { title: string; url: string };
  len: number;
  meets: string[];
}

const META: WordMeta[] = [
  {
    street: 'Ponsonby Road',
    answer: 'TRAMPING',
    clue: 'This is the Kiwi word for hiking.',
    source: 'nz_slang',
    title: 'Tramping',
    body: 'In New Zealand a tramp is a long walk, often over back-country tracks, and the people who do it are trampers. This street runs about 1490 m and meets Anglesea Street, Brown Street and Collingwood Street.',
    wiki: { title: 'Tramping in New Zealand', url: 'https://en.wikipedia.org/wiki/Tramping_in_New_Zealand' },
    len: 1490,
    meets: ['Anglesea Street', 'Brown Street', 'Collingwood Street'],
  },
  {
    street: 'Pollen Street',
    answer: 'GEYSER',
    clue: 'Pohutu in Rotorua is a famous one of these.',
    source: 'nature',
    title: 'Geyser',
    body: 'A geyser is a hot spring that erupts with steam and water. Pohutu, at Whakarewarewa in Rotorua, is one of the best known. This street is about 390 m long and meets Crummer Road and Rose Road.',
    wiki: { title: 'Geyser', url: 'https://en.wikipedia.org/wiki/Geyser' },
    len: 390,
    meets: ['Crummer Road', 'Rose Road'],
  },
  {
    street: 'Williamson Avenue',
    answer: 'AOTEAROA',
    clue: 'This is the Māori name widely used for New Zealand.',
    source: 'place',
    title: 'Aotearoa',
    body: 'Aotearoa is the Māori name widely used for New Zealand. It is often translated as the land of the long white cloud. This street is about 830 m long.',
    wiki: { title: 'Aotearoa', url: 'https://en.wikipedia.org/wiki/Aotearoa' },
    len: 830,
    meets: [],
  },
  {
    street: 'Richmond Road',
    answer: 'PAVLOVA',
    clue: 'This meringue dessert, topped with cream and fruit, is a Kiwi Christmas favourite.',
    source: 'common',
    title: 'Pavlova',
    body: 'Pavlova is a crisp meringue cake with a soft centre, usually topped with cream and fruit. It is a favourite on Christmas tables here. This street is about 1480 m long and meets Sussex Street and Scanlan Street.',
    wiki: { title: 'Pavlova (dessert)', url: 'https://en.wikipedia.org/wiki/Pavlova_(dessert)' },
    len: 1480,
    meets: ['Sussex Street', 'Scanlan Street'],
  },
  {
    street: 'MacKelvie Street',
    answer: 'PIKELET',
    clue: 'This small, thick pancake is often served with jam and cream.',
    source: 'common',
    title: 'Pikelet',
    body: 'A pikelet is a small, thick pancake. Here it is often served warm with butter, jam and cream. This street is about 680 m long and meets Rose Road.',
    wiki: { title: 'Drop scone', url: 'https://en.wikipedia.org/wiki/Drop_scone' },
    len: 680,
    meets: ['Rose Road'],
  },
  {
    street: 'Scanlan Street',
    answer: 'LOLLIES',
    clue: 'This is the Kiwi word for sweets.',
    source: 'nz_slang',
    title: 'Lollies',
    body: 'Lollies is the New Zealand word for sweets. A mixed bag from the dairy is a familiar treat. This street is about 730 m long and meets Richmond Road and Rose Road.',
    wiki: { title: 'New Zealand English', url: 'https://en.wikipedia.org/wiki/New_Zealand_English' },
    len: 730,
    meets: ['Richmond Road', 'Rose Road'],
  },
  {
    street: 'Rose Road',
    answer: 'SWEETAS',
    clue: 'This Kiwi slang word means all good.',
    source: 'nz_slang',
    title: 'Sweet as',
    body: 'Sweet as is casual New Zealand slang for all good or great. This street is about 870 m long and meets Pollen Street, MacKelvie Street and Scanlan Street.',
    wiki: { title: 'sweet as', url: 'https://en.wiktionary.org/wiki/sweet_as' },
    len: 870,
    meets: ['Pollen Street', 'MacKelvie Street', 'Scanlan Street'],
  },
];

function metaFor(street: string): WordMeta {
  const found = META.find((item) => item.street === street);
  if (!found) throw new Error(`Missing meta for ${street}`);
  if (found.body.length > 280) throw new Error(`${street} card is ${found.body.length} characters`);
  return found;
}

function maskStreet(name: string): string {
  const [first, ...rest] = name.split(' ');
  if (!first) return name;
  return [`${first[0]}${'•'.repeat(first.length - 1)}`, ...rest].join(' ');
}

function card(id: string, meta: WordMeta, kind: KnowledgeCard['kind']): KnowledgeCard {
  return {
    id,
    kind,
    title: meta.title,
    body: meta.body,
    mediaIds: [],
    links: [{ label: 'Read more', url: meta.wiki.url }],
    sources: [
      {
        url: meta.wiki.url,
        title: meta.wiki.title,
        publisher: meta.wiki.url.includes('wiktionary') ? 'Wiktionary' : 'Wikipedia',
        accessedAt: '2026-11-24',
        licence: 'CC BY-SA 4.0',
      },
      {
        url: 'https://www.openstreetmap.org/copyright',
        title: 'OpenStreetMap',
        publisher: 'OpenStreetMap contributors',
        accessedAt: '2026-11-24',
        licence: 'ODbL',
      },
    ],
    sensitivity: 'none',
  };
}

function build(difficulty: Difficulty, streets: string[], seed: number): { puzzle: Puzzle; key: string } {
  const rules = DIFFICULTY_PRESETS[difficulty];
  const selected = data.words.filter((word) => streets.includes(word.street));
  const id = `${DAILY_SET}-${difficulty === 'super_hard' ? 'super-hard' : difficulty}`;
  const used = new Set(selected.flatMap((word) => word.cells));
  const indexOf = new Map<number, number>();
  const cells: Cell[] = [];
  data.cells.forEach((cell, index) => {
    if (!used.has(index)) return;
    const idNum = cells.length;
    indexOf.set(index, idNum);
    const owners = selected
      .map((word, wordIndex) => (word.cells.includes(index) ? `w${wordIndex + 1}` : null))
      .filter((value): value is string => Boolean(value));
    cells.push({ id: idNum, x: cell.x, y: cell.y, wordIds: owners, preRevealed: false });
  });

  const nonCrossing = cells.filter((cell) => cell.wordIds.length === 1).map((cell) => cell.id);
  const crossing = cells.filter((cell) => cell.wordIds.length > 1).map((cell) => cell.id);
  const order = [...nonCrossing, ...crossing];
  const target = Math.round(cells.length * rules.preRevealRatio);
  const byWord = selected.map(() => [] as number[]);
  for (const cellId of order) {
    const owner = cells[cellId]?.wordIds[0];
    const wordIndex = owner ? Number(owner.slice(1)) - 1 : 0;
    byWord[wordIndex]?.push(cellId);
  }
  const revealed = new Set<number>();
  while (revealed.size < target) {
    let added = false;
    for (const bucket of byWord) {
      if (revealed.size >= target) break;
      const next = bucket.shift();
      if (next == null) continue;
      revealed.add(next);
      added = true;
    }
    if (!added) break;
  }
  for (const cell of cells) cell.preRevealed = revealed.has(cell.id);

  const words: Word[] = selected.map((word, index) => {
    const meta = metaFor(word.street);
    const wordId = `w${index + 1}`;
    return {
      id: wordId,
      cellIds: word.cells.map((cell) => {
        const mapped = indexOf.get(cell);
        if (mapped == null) throw new Error(`Missing cell ${cell}`);
        return mapped;
      }),
      path: word.path,
      length: word.answer.length,
      clue: { text: meta.clue, style: 'straight' },
      source: meta.source,
      answerHash: answerHash(id, wordId, word.answer),
      revealOrder: index + 1,
      cardId: `k-${wordId}`,
      maskedStreet: maskStreet(word.street),
    };
  });

  const start = words
    .map((word) => ({
      id: word.id,
      crossings: word.cellIds.filter((cellId) => (cells[cellId]?.wordIds.length ?? 0) > 1).length,
    }))
    .sort((a, b) => b.crossings - a.crossings || a.id.localeCompare(b.id))[0]?.id;
  if (!start) throw new Error('No start word');
  const ordered = orderFrom(start, words, cells);
  for (const word of words) word.revealOrder = ordered.indexOf(word.id) + 1;

  const cards = selected.map((word, index) => card(`k-w${index + 1}`, metaFor(word.street), 'word'));
  const finale: KnowledgeCard = {
    id: 'k-finale',
    kind: 'finale',
    title: LOCATION,
    body: 'The fog has lifted on a real neighbourhood of wooden villas, cafés and a busy village street, just west of the city centre: Ponsonby, Auckland.',
    mediaIds: [],
    links: [{ label: 'About this suburb', url: 'https://en.wikipedia.org/wiki/Ponsonby,_Auckland' }],
    sources: [
      {
        url: 'https://en.wikipedia.org/wiki/Ponsonby,_Auckland',
        title: 'Ponsonby, Auckland',
        publisher: 'Wikipedia',
        accessedAt: '2026-11-24',
        licence: 'CC BY-SA 4.0',
      },
    ],
    sensitivity: 'none',
  };
  if (finale.body.length > 280) throw new Error('Finale card is too long');

  const secret: PuzzleSecret = {
    locationName: LOCATION,
    answers: Object.fromEntries(words.map((word, index) => [word.id, selected[index]?.answer ?? ''])),
    streets: Object.fromEntries(words.map((word, index) => [word.id, selected[index]?.street ?? ''])),
    roadNames: {},
  };

  const publicPuzzle = {
    schemaVersion: '1.0' as const,
    id,
    kind: 'daily' as const,
    dailySetId: DAILY_SET,
    date: DATE,
    difficulty,
    theme: { id: 'kiwi-classics', title: 'Kiwi classics', season: null },
    region: { island: 'north' as const, regionCode: 'AUK' },
    locationHint: { maskedName: 'P•••••••', letterCount: 8 },
    projection: {
      originLat: -36.856,
      originLon: 174.744,
      unit: 'm' as const,
    },
    bbox: data.bbox,
    cellSpacing: 20,
    background: {
      roads: data.roads
        .filter((road) => road.p.length >= 2)
        .map((road, index) => ({
          id: `r${index + 1}`,
          cls: road.c as 0 | 1 | 2 | 3,
          pts: road.p,
        })),
      parks: [],
    },
    cells,
    words,
    startWordId: start,
    rules: {
      maxHints: rules.maxHints,
      preRevealRatio: rules.preRevealRatio,
      checkMode: rules.checkMode,
      showWordLengthOnMap: rules.showWordLengthOnMap,
      targetSeconds: rules.targetSeconds,
    },
    knowledgeCards: [...cards, finale],
    media: [],
    finale: {
      cardId: 'k-finale',
      whereAmI: {
        askAfterSolvedCount: Math.max(1, Math.ceil(words.length / 2)),
        options: WHERE,
        answerHash: whereAmIHash(id, 'Ponsonby'),
      },
    },
    attribution: { osm: true as const, text: '© OpenStreetMap contributors' },
    generator: { pipelineVersion: '0.1.0', wordbankDate: '2026-11-24', seed },
  };

  const withHash = { ...publicPuzzle, contentHash: contentHashOf(publicPuzzle) };
  const keyBytes = sampleKeyBytes(id);
  const puzzle = puzzleSchema.parse({
    ...withHash,
    secret: encryptSecret(secret, keyBytes, sampleIv(id)),
  });
  const key = bytesToBase64(keyBytes);
  const report = validatePuzzle(puzzle, key);
  if (!report.ok) {
    throw new Error(`${id} failed validation:\n${report.errors.join('\n')}`);
  }
  if (report.warnings.length) {
    console.log(`${id} warnings:\n- ${report.warnings.join('\n- ')}`);
  }
  return { puzzle, key };
}

function orderFrom(start: string, words: Word[], cells: Cell[]): string[] {
  const neighbours = new Map<string, string[]>();
  for (const word of words) neighbours.set(word.id, []);
  for (const cell of cells) {
    if (cell.wordIds.length < 2) continue;
    for (const left of cell.wordIds) {
      for (const right of cell.wordIds) {
        if (left !== right) neighbours.get(left)?.push(right);
      }
    }
  }
  const seen = new Set<string>([start]);
  const queue = [start];
  const order: string[] = [];
  while (queue.length) {
    const id = queue.shift();
    if (!id) break;
    order.push(id);
    for (const next of neighbours.get(id) ?? []) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  return order;
}

const mediumStreets = data.words.map((word) => word.street);
const easyStreets = ['Rose Road', 'Pollen Street', 'MacKelvie Street', 'Scanlan Street', 'Richmond Road'];

const medium = build('medium', mediumStreets, 27);
const easy = build('easy', easyStreets, 28);

function write(path: string, value: unknown) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

write(resolve(root, 'docs/sample-ponsonby.json'), medium.puzzle);
write(resolve(root, 'docs/sample-ponsonby-easy.json'), easy.puzzle);
write(resolve(root, 'apps/mobile/assets/puzzles/ponsonby-medium.json'), medium.puzzle);
write(resolve(root, 'apps/mobile/assets/puzzles/ponsonby-easy.json'), easy.puzzle);

const keys = {
  [medium.puzzle.id]: medium.key,
  [easy.puzzle.id]: easy.key,
};
write(resolve(root, 'docs/sample-keys.json'), keys);
write(resolve(root, 'apps/mobile/src/content/sample-keys.json'), keys);
write(resolve(root, 'docs/sample-daily-set.json'), {
  dailySetId: DAILY_SET,
  date: DATE,
  note: 'Local sample. Easy and Medium are playable. Hard and Super Hard are reserved slots for the same neighbourhood.',
  slots: [
    { difficulty: 'easy', puzzleId: easy.puzzle.id, file: 'sample-ponsonby-easy.json', available: true },
    { difficulty: 'medium', puzzleId: medium.puzzle.id, file: 'sample-ponsonby.json', available: true },
    { difficulty: 'hard', puzzleId: `${DAILY_SET}-hard`, file: null, available: false },
    { difficulty: 'super_hard', puzzleId: `${DAILY_SET}-super-hard`, file: null, available: false },
  ],
});

console.log(`Wrote ${medium.puzzle.id} (${medium.puzzle.words.length} streets, start ${medium.puzzle.startWordId})`);
console.log(`Wrote ${easy.puzzle.id} (${easy.puzzle.words.length} streets, start ${easy.puzzle.startWordId})`);
