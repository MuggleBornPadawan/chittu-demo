import { ROOM_COUNT, ART_VERSION, MAX_SEED } from './config.ts';
import { generateRandomSeed } from './rng.ts';

export interface TourUrlState {
  seeds: number[];
  artVersion: number;
  roomIndex: number;
  isShared: boolean;
}

/**
 * Parse URL query params for tour state.
 * Expected format: ?tour=12,42,77&v=1&room=2
 */
export function parseTourUrl(queryString: string): TourUrlState {
  const params = new URLSearchParams(queryString);
  const tourParam = params.get('tour');
  const vParam = params.get('v');
  const roomParam = params.get('room');

  let seeds: number[] = [];
  let isShared = false;

  if (tourParam) {
    const rawSeeds = tourParam.split(',').map((s) => parseInt(s.trim(), 10));
    seeds = rawSeeds.filter((s) => !isNaN(s) && s >= 0 && s <= MAX_SEED);
    if (seeds.length > 0) {
      isShared = true;
    }
  }

  if (seeds.length === 0) {
    seeds = Array.from({ length: ROOM_COUNT }, () => generateRandomSeed());
  }

  const artVersion = vParam ? parseInt(vParam, 10) || ART_VERSION : ART_VERSION;

  let roomIndex = roomParam ? parseInt(roomParam, 10) : 0;
  if (isNaN(roomIndex) || roomIndex < 0) {
    roomIndex = 0;
  } else if (roomIndex >= seeds.length) {
    roomIndex = seeds.length - 1;
  }

  return {
    seeds,
    artVersion,
    roomIndex,
    isShared,
  };
}

/**
 * Build shareable query string given tour state.
 */
export function buildTourUrl(seeds: number[], artVersion: number, roomIndex: number): string {
  const tourStr = seeds.join(',');
  return `?tour=${tourStr}&v=${artVersion}&room=${roomIndex}`;
}
