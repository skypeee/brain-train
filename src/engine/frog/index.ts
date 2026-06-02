export const GRID_SIZE = 3;
export const TOTAL_PADS = GRID_SIZE * GRID_SIZE;
export const STARTING_LENGTH = 3;

export interface FrogLevel {
  sequence: number[];
  length: number;
}

export function generateSequence(length: number): number[] {
  const seq: number[] = [];
  let last = -1;
  for (let i = 0; i < length; i++) {
    let next: number;
    do {
      next = Math.floor(Math.random() * TOTAL_PADS);
    } while (next === last);
    seq.push(next);
    last = next;
  }
  return seq;
}

export function getScore(level: number, mistakes: number): number {
  return Math.max(0, level * 1000 - mistakes * 200);
}
