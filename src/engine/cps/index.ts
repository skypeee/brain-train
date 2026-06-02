export interface CPSState {
  status: 'idle' | 'running' | 'finished';
  currentInterval: number; // index into intervals array
  clicks: number[]; // clicks per interval
  startTime: number;
}

export const INTERVALS = [
  { label: '1s', ms: 1000 },
  { label: '3s', ms: 3000 },
  { label: '5s', ms: 5000 },
  { label: '10s', ms: 10000 },
];

export function createInitialState(): CPSState {
  return {
    status: 'idle',
    currentInterval: 0,
    clicks: [],
    startTime: 0,
  };
}

export function getTotalCPS(clicks: number[]): number {
  const totalTime = INTERVALS.reduce((sum, i) => sum + i.ms, 0) / 1000;
  const totalClicks = clicks.reduce((a, b) => a + b, 0);
  return totalTime > 0 ? totalClicks / totalTime : 0;
}

export function getIntervalCPS(clicks: number, ms: number): number {
  return ms > 0 ? clicks / (ms / 1000) : 0;
}
