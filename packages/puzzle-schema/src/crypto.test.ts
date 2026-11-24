import { describe, expect, it } from 'vitest';

import { decryptSecret, encryptSecret, sampleIv, sampleKeyBytes, bytesToBase64 } from './crypto';
import { answerHash, contentHashOf } from './hash';
import type { PuzzleSecret } from './types';

describe('secret encryption', () => {
  it('round-trips a puzzle secret with the sample key', () => {
    const secret: PuzzleSecret = {
      locationName: 'Ponsonby, Auckland',
      answers: { w1: 'TRAMPING' },
      streets: { w1: 'Ponsonby Road' },
      roadNames: {},
    };
    const key = sampleKeyBytes('sample');
    const blob = encryptSecret(secret, key, sampleIv('sample'));
    expect(decryptSecret(blob, bytesToBase64(key))).toEqual(secret);
  });

  it('hashes answers and public content independently of key order', () => {
    expect(answerHash('p', 'w1', 'CAT')).toHaveLength(64);
    const left = contentHashOf({ b: 1, a: { d: 2, c: [3] } });
    const right = contentHashOf({ a: { c: [3], d: 2 }, b: 1 });
    expect(left).toBe(right);
  });
});
