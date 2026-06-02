export const GRID_SIZE = 5;
export const TOTAL_CELLS = GRID_SIZE * GRID_SIZE; // 25
export const PENALTY_MS = 2000; // 2 seconds per mistake

export interface SchulteCell {
  value: number;
  tapped: boolean;
}

export function generateGrid(): SchulteCell[][] {
  const numbers = Array.from({ length: TOTAL_CELLS }, (_, i) => i + 1);
  // Fisher-Yates shuffle
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  const grid: SchulteCell[][] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    grid[row] = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      grid[row][col] = { value: numbers[row * GRID_SIZE + col], tapped: false };
    }
  }
  return grid;
}

export function getScore(timeMs: number, mistakes: number): number {
  const effectiveMs = timeMs + mistakes * PENALTY_MS;
  return Math.max(0, Math.round(100000 / (effectiveMs / 1000 + 1)));
}
