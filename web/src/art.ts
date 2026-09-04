import { mulberry32 } from './rng.ts';

export interface StaticParams {
  count: number;
  twist: number;
  scales: number[];
  paletteIdx: number;
  lightAngle: number;
}

export interface FrameTransform {
  rotationY: number;
  scaleFactor: number;
  lightAngle: number;
}

export const PALETTES = [
  '#FFFFFF', // 0 = white art
  '#000000', // 1 = black art
  '#808080', // 2 = mid-grey art
] as const;

/**
 * Pure function mapping seed -> static art parameters.
 * Deterministic for a given seed.
 */
export function generateStaticParams(seed: number): StaticParams {
  const rng = mulberry32(seed);

  const count = Math.floor(rng() * 10) + 5;
  const twist = rng() * Math.PI * 2;
  
  const scales: number[] = [];
  for (let i = 0; i < count; i++) {
    scales.push(0.5 + rng() * 1.5);
  }

  const paletteIdx = Math.floor(rng() * 3);
  const lightAngle = rng() * Math.PI * 2;

  return {
    count,
    twist,
    scales,
    paletteIdx,
    lightAngle,
  };
}

/**
 * Frame draw function computing live dynamic transforms for a given time.
 * Dynamic: rotation + ~5% scale pulse + light shift.
 */
export function draw(params: StaticParams, time: number): FrameTransform {
  const rotationY = time * 0.5;
  const scaleFactor = 1.0 + 0.05 * Math.sin(time * 2.0);
  const lightAngle = params.lightAngle + Math.sin(time * 0.2) * 0.1;

  return {
    rotationY,
    scaleFactor,
    lightAngle,
  };
}
