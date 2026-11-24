import { gcm } from '@noble/ciphers/aes.js';
import { bytesToUtf8, utf8ToBytes } from '@noble/ciphers/utils.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { utf8ToBytes as hashUtf8 } from '@noble/hashes/utils.js';

import type { EncryptedBlob, PuzzleSecret } from './types';

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function bytesToBase64(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i] ?? 0;
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const triple = (a << 16) | (b << 8) | c;
    out += B64[(triple >> 18) & 63];
    out += B64[(triple >> 12) & 63];
    out += i + 1 < bytes.length ? B64[(triple >> 6) & 63] : '=';
    out += i + 2 < bytes.length ? B64[triple & 63] : '=';
  }
  return out;
}

export function base64ToBytes(value: string): Uint8Array {
  const clean = value.replace(/=+$/, '');
  const out = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let p = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const n0 = B64.indexOf(clean[i] ?? 'A');
    const n1 = B64.indexOf(clean[i + 1] ?? 'A');
    const n2 = i + 2 < clean.length ? B64.indexOf(clean[i + 2] ?? 'A') : 0;
    const n3 = i + 3 < clean.length ? B64.indexOf(clean[i + 3] ?? 'A') : 0;
    const triple = (n0 << 18) | (n1 << 12) | (n2 << 6) | n3;
    if (p < out.length) out[p++] = (triple >> 16) & 255;
    if (i + 2 < clean.length && p < out.length) out[p++] = (triple >> 8) & 255;
    if (i + 3 < clean.length && p < out.length) out[p++] = triple & 255;
  }
  return out;
}

/**
 * Deterministic sample key. Production keys are random and stay on the server.
 * sha256 is 32 bytes, which is an AES-256 key.
 */
export function sampleKeyBytes(puzzleId: string): Uint8Array {
  return sha256(hashUtf8(`crossings-sample-key:${puzzleId}`));
}

export function sampleIv(puzzleId: string): Uint8Array {
  return sha256(hashUtf8(`crossings-sample-iv:${puzzleId}`)).slice(0, 12);
}

export function encryptSecret(
  secret: PuzzleSecret,
  key: Uint8Array,
  iv: Uint8Array,
): EncryptedBlob {
  const sealed = gcm(key, iv).encrypt(utf8ToBytes(JSON.stringify(secret)));
  return { alg: 'A256GCM', iv: bytesToBase64(iv), data: bytesToBase64(sealed) };
}

export function decryptSecret(blob: EncryptedBlob, keyB64: string): PuzzleSecret {
  if (blob.alg !== 'A256GCM') {
    throw new Error(`Unsupported secret algorithm: ${blob.alg}`);
  }
  const key = base64ToBytes(keyB64);
  const iv = base64ToBytes(blob.iv);
  const data = base64ToBytes(blob.data);
  const opened = gcm(key, iv).decrypt(data);
  return JSON.parse(bytesToUtf8(opened)) as PuzzleSecret;
}
