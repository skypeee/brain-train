export const TOTAL_TRIALS = 5;
export const MIN_WAIT_MS = 1500;
export const MAX_WAIT_MS = 4000;

export type RTState = 'waiting' | 'ready' | 'go' | 'tooSoon' | 'done';

export interface TrialResult {
  reactionMs: number;
}
