export const DEFAULT_WORK_MS = 25 * 60 * 1000;
export const DEFAULT_SHORT_BREAK_MS = 5 * 60 * 1000;
export const DEFAULT_LONG_BREAK_MS = 15 * 60 * 1000;
export const SESSIONS_BEFORE_LONG_BREAK = 4;

export type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak';

export function getNextPhase(current: PomodoroPhase, sessionCount: number): PomodoroPhase {
  if (current === 'work') {
    return sessionCount % SESSIONS_BEFORE_LONG_BREAK === 0 ? 'longBreak' : 'shortBreak';
  }
  return 'work';
}

export function getPhaseDuration(phase: PomodoroPhase): number {
  switch (phase) {
    case 'work': return DEFAULT_WORK_MS;
    case 'shortBreak': return DEFAULT_SHORT_BREAK_MS;
    case 'longBreak': return DEFAULT_LONG_BREAK_MS;
  }
}
