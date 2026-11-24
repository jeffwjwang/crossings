export type Difficulty = 'easy' | 'medium' | 'hard' | 'super_hard';

export type WordSource =
  | 'common'
  | 'news'
  | 'nz_slang'
  | 'place'
  | 'history'
  | 'street_name'
  | 'nature';

export type ClueStyle = 'straight' | 'fill_blank' | 'cryptic_lite' | 'cryptic';

export type CheckMode = 'per_letter' | 'per_word' | 'end_only';

export interface Puzzle {
  schemaVersion: '1.0';
  id: string;
  kind: 'daily' | 'pack' | 'expedition_leg' | 'seasonal' | 'challenge_custom';
  packId?: string | null;
  dailySetId: string | null;
  date: string | null;
  difficulty: Difficulty;
  theme: {
    id: string;
    title: string;
    season?: 'matariki' | 'waitangi' | 'christmas' | 'anzac' | 'rugby' | null;
  };
  region: { island: 'north' | 'south' | 'other'; regionCode: string };
  locationHint: { maskedName: string; letterCount: number };
  projection: { originLat: number; originLon: number; unit: 'm' };
  bbox: [number, number, number, number];
  cellSpacing: number;
  background: {
    roads: { id: string; cls: 0 | 1 | 2 | 3; pts: [number, number][]; nameRef?: string }[];
    parks: { id: string; pts: [number, number][] }[];
    water?: { id: string; pts: [number, number][] }[];
    landmarks?: { id: string; x: number; y: number; icon: string; revealAfterWordId?: string }[];
  };
  cells: Cell[];
  words: Word[];
  startWordId: string;
  rules: DifficultyRules;
  knowledgeCards: KnowledgeCard[];
  media: MediaAsset[];
  finale: { cardId: string; whereAmI?: WhereAmIQuestion };
  attribution: { osm: true; text: string };
  secret: EncryptedBlob;
  contentHash: string;
  generator: { pipelineVersion: string; wordbankDate: string; seed: number };
}

export interface Cell {
  id: number;
  x: number;
  y: number;
  wordIds: string[];
  preRevealed: boolean;
}

export interface Word {
  id: string;
  cellIds: number[];
  path: [number, number][];
  length: number;
  enumeration?: string;
  clue: { text: string; style: ClueStyle };
  source: WordSource;
  answerHash: string;
  revealOrder: number;
  cardId: string;
  maskedStreet: string;
}

export interface PuzzleSecret {
  locationName: string;
  answers: Record<string, string>;
  streets: Record<string, string>;
  roadNames: Record<string, string>;
}

export interface EncryptedBlob {
  alg: 'A256GCM';
  iv: string;
  data: string;
}

export interface DifficultyRules {
  maxHints: number | null;
  preRevealRatio: number;
  checkMode: CheckMode;
  showWordLengthOnMap: boolean;
  targetSeconds: number;
}

export interface WhereAmIQuestion {
  askAfterSolvedCount: number;
  options: string[];
  answerHash: string;
}

export interface KnowledgeCard {
  id: string;
  kind: 'street' | 'word' | 'news' | 'wiki' | 'history' | 'photo' | 'finale';
  title: string;
  body: string;
  mediaIds: string[];
  links: { label: string; url: string }[];
  sources: SourceRef[];
  freshness?: { publishedAt: string; expiresAt?: string };
  sensitivity: 'none' | 'review';
}

export interface SourceRef {
  url: string;
  title: string;
  publisher: string;
  accessedAt: string;
  licence?: string;
}

export interface MediaAsset {
  id: string;
  type: 'image' | 'audio';
  url: string;
  width?: number;
  height?: number;
  durationSec?: number;
  alt: string;
  creator: string;
  sourceUrl: string;
  licence: string;
  licenceUrl?: string;
  attributionText: string;
  commercialUseOk: boolean;
  modified: boolean;
  thenAndNow?: { pairedMediaId: string; year?: number };
}
