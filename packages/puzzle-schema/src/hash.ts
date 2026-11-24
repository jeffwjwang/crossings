import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js';

export function sha256Hex(value: string): string {
  return bytesToHex(sha256(utf8ToBytes(value)));
}

export function answerHash(puzzleId: string, wordId: string, answer: string): string {
  return sha256Hex(`${puzzleId}:${wordId}:${answer}`);
}

export function whereAmIHash(puzzleId: string, option: string): string {
  return sha256Hex(`${puzzleId}:where:${option}`);
}

/** Stable JSON with sorted object keys. Arrays keep their order. */
export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalize(item)).join(',')}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj)
    .filter((key) => obj[key] !== undefined)
    .sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalize(obj[key])}`).join(',')}}`;
}

export function contentHashOf(puzzleWithoutSecretOrHash: unknown): string {
  return sha256Hex(canonicalize(puzzleWithoutSecretOrHash));
}
