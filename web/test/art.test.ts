import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { mulberry32, generateRandomSeed } from '../src/rng.ts';
import { generateStaticParams, draw } from '../src/art.ts';

const vectorsPath = join(import.meta.dirname, 'vectors.json');
const vectors = JSON.parse(readFileSync(vectorsPath, 'utf8'));

describe('RNG mulberry32', () => {
  it('matches frozen test vectors for seeds 1, 42, 99', () => {
    for (const [seedStr, expectedValues] of Object.entries(vectors.rng)) {
      const seed = parseInt(seedStr, 10);
      const rng = mulberry32(seed);
      const generated = (expectedValues as number[]).map(() => rng());
      
      generated.forEach((val, idx) => {
        const expected = (expectedValues as number[])[idx];
        assert.ok(
          Math.abs(val - expected) < 1e-9,
          `Seed ${seed} index ${idx}: expected ${expected}, got ${val}`
        );
      });
    }
  });

  it('generates random seeds within [0, 99999]', () => {
    for (let i = 0; i < 50; i++) {
      const seed = generateRandomSeed();
      assert.strictEqual(Number.isInteger(seed), true);
      assert.strictEqual(seed >= 0, true);
      assert.strictEqual(seed <= 99999, true);
    }
  });
});

describe('Art Parameter Generator', () => {
  it('matches frozen staticParams vectors for seeds 1, 42, 99', () => {
    for (const [seedStr, expected] of Object.entries(vectors.staticParams)) {
      const seed = parseInt(seedStr, 10);
      const params = generateStaticParams(seed);
      const exp = expected as any;

      assert.strictEqual(params.count, exp.count);
      assert.ok(Math.abs(params.twist - exp.twist) < 1e-9);
      assert.strictEqual(params.paletteIdx, exp.paletteIdx);
      assert.ok(Math.abs(params.lightAngle - exp.lightAngle) < 1e-9);

      assert.strictEqual(params.scales.length, exp.scales.length);
      params.scales.forEach((scale, idx) => {
        assert.ok(Math.abs(scale - exp.scales[idx]) < 1e-9);
      });
    }
  });

  it('draw returns frame transform', () => {
    const params = generateStaticParams(42);
    const frame = draw(params, 1.0);
    assert.strictEqual(typeof frame.rotationY, 'number');
    assert.strictEqual(typeof frame.scaleFactor, 'number');
    assert.strictEqual(typeof frame.lightAngle, 'number');
  });
});
