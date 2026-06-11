export const TARGET_MS = 10000;

export function getDifferenceMs(stoppedMs: number): number {
  return Math.abs(stoppedMs - TARGET_MS);
}

export function getResult(diffMs: number): {
  rating: string;
  color: string;
} {
  if (diffMs <= 50) return { rating: 'perfect', color: '#F59E0B' };
  if (diffMs <= 200) return { rating: 'excellent', color: '#10B981' };
  if (diffMs <= 500) return { rating: 'great', color: '#229CF8' };
  if (diffMs <= 1000) return { rating: 'good', color: '#6366F1' };
  return { rating: 'keepTrying', color: '#6B7280' };
}
