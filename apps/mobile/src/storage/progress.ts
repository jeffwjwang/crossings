import { advanceStreak, nzDate, type StreakState } from '@crossings/scoring';
import type { Difficulty } from '@crossings/puzzle-schema';
import Storage from 'expo-sqlite/kv-store';

import type { GameState } from '../game/types';

const memory = new Map<string, string>();
let useMemory = false;

function withTimeout<T>(promise: Promise<T>, ms = 1200): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('storage timeout')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function getItem(key: string): Promise<string | null> {
  if (useMemory) return memory.get(key) ?? null;
  try {
    return await withTimeout(Storage.getItem(key));
  } catch {
    useMemory = true;
    return memory.get(key) ?? null;
  }
}

async function setItem(key: string, value: string): Promise<void> {
  memory.set(key, value);
  if (useMemory) return;
  try {
    await withTimeout(Storage.setItem(key, value));
  } catch {
    useMemory = true;
  }
}

async function removeItem(key: string): Promise<void> {
  memory.delete(key);
  if (useMemory) return;
  try {
    await withTimeout(Storage.removeItem(key));
  } catch {
    useMemory = true;
  }
}

export interface Settings {
  textScale: number;
  highContrast: boolean;
  lastDifficulty: Difficulty;
}

const DEFAULT_SETTINGS: Settings = {
  textScale: 1,
  highContrast: false,
  lastDifficulty: 'medium',
};

export async function loadSettings(): Promise<Settings> {
  const raw = await getItem('settings');
  if (!raw) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await setItem('settings', JSON.stringify(settings));
}

export async function loadPlay(puzzleId: string): Promise<GameState | null> {
  const raw = await getItem(`play:${puzzleId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export async function savePlay(puzzleId: string, state: GameState): Promise<void> {
  await setItem(`play:${puzzleId}`, JSON.stringify(state));
}

export async function clearPlay(puzzleId: string): Promise<void> {
  await removeItem(`play:${puzzleId}`);
}

export async function loadStreak(): Promise<StreakState> {
  const raw = await getItem('streak');
  if (!raw) return { current: 0, best: 0, lastDay: null };
  try {
    return JSON.parse(raw) as StreakState;
  } catch {
    return { current: 0, best: 0, lastDay: null };
  }
}

export async function recordCompletion(puzzleId: string): Promise<StreakState> {
  const doneRaw = await getItem('completedIds');
  const done = new Set<string>(doneRaw ? (JSON.parse(doneRaw) as string[]) : []);
  const streak = await loadStreak();
  if (done.has(puzzleId)) return streak;
  done.add(puzzleId);
  const next = advanceStreak(streak, nzDate());
  await setItem('completedIds', JSON.stringify([...done]));
  await setItem('streak', JSON.stringify(next));
  return next;
}
