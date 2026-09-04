import { MAX_SEED } from './config.ts';

/**
 * Canonical mulberry32 PRNG (v1).
 * Range: [0, 1)
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function (): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a random seed using web crypto API.
 * Returns integer in range [0, 99999].
 */
export function generateRandomSeed(): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % (MAX_SEED + 1);
}
