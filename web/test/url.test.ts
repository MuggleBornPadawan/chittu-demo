import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseTourUrl, buildTourUrl } from '../src/url.ts';
import { ROOM_COUNT, ART_VERSION } from '../src/config.ts';

describe('URL State Manager', () => {
  it('parses valid tour URL parameters', () => {
    const state = parseTourUrl('?tour=12,42,77&v=1&room=2');
    assert.deepStrictEqual(state.seeds, [12, 42, 77]);
    assert.strictEqual(state.artVersion, 1);
    assert.strictEqual(state.roomIndex, 2);
    assert.strictEqual(state.isShared, true);
  });

  it('clamps room index within seed array boundaries', () => {
    const stateOverflow = parseTourUrl('?tour=10,20,30&v=1&room=99');
    assert.strictEqual(stateOverflow.roomIndex, 2);

    const stateUnderflow = parseTourUrl('?tour=10,20,30&v=1&room=-5');
    assert.strictEqual(stateUnderflow.roomIndex, 0);
  });

  it('generates fresh seeds if no tour param present', () => {
    const state = parseTourUrl('');
    assert.strictEqual(state.seeds.length, ROOM_COUNT);
    assert.strictEqual(state.artVersion, ART_VERSION);
    assert.strictEqual(state.roomIndex, 0);
    assert.strictEqual(state.isShared, false);
  });

  it('builds canonical share URL string', () => {
    const url = buildTourUrl([12, 42, 77], 1, 2);
    assert.strictEqual(url, '?tour=12,42,77&v=1&room=2');
  });
});
