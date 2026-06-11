import Taro from '@tarojs/taro';

// ----- Types (mirror original Drizzle schema) -----

export interface GameRecord {
  id: string;
  gameType: string;
  difficulty: string;
  startedAt: number;
  completedAt: number;
  durationMs: number;
  mistakes: number;
  hintsUsed: number;
  score: number;
  completed: boolean;
  isDaily: boolean;
  details?: string;
}

export interface DailyChallenge {
  id: string;
  date: string;
  startedAt: number;
  completedAt: number | null;
  durationMs: number;
  mistakes: number;
  hintsUsed: number;
  score: number;
  completed: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
}

// ----- Keys -----

const KEYS = {
  GAME_RECORDS: 'gameRecords',
  DAILY_CHALLENGES: 'dailyChallenges',
  STREAKS: 'streaks',
} as const;

// ----- Game Records -----

export function getAllGameRecords(): GameRecord[] {
  try {
    const raw = Taro.getStorageSync(KEYS.GAME_RECORDS);
    return Array.isArray(raw) ? raw : [];
  } catch { return []; }
}

export function saveGameRecord(record: GameRecord): void {
  const records = getAllGameRecords();
  records.push(record);
  Taro.setStorageSync(KEYS.GAME_RECORDS, records);
}

export function getFilteredRecords(opts: {
  gameType?: string;
  limit?: number;
  completed?: boolean;
}): GameRecord[] {
  let records = getAllGameRecords();
  if (opts.gameType) records = records.filter((r) => r.gameType === opts.gameType);
  if (opts.completed !== undefined) records = records.filter((r) => r.completed === opts.completed);
  records.sort((a, b) => b.completedAt - a.completedAt);
  if (opts.limit) records = records.slice(0, opts.limit);
  return records;
}

export function clearAllRecords(): void {
  Taro.removeStorageSync(KEYS.GAME_RECORDS);
  Taro.removeStorageSync(KEYS.DAILY_CHALLENGES);
  Taro.removeStorageSync(KEYS.STREAKS);
}

// ----- Streaks -----

export function getStreaks(): StreakData {
  try {
    const raw = Taro.getStorageSync(KEYS.STREAKS);
    if (raw && typeof raw === 'object') {
      return {
        currentStreak: raw.currentStreak || 0,
        longestStreak: raw.longestStreak || 0,
        lastCompletedDate: raw.lastCompletedDate || null,
      };
    }
  } catch (_) {}
  return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null };
}

export function updateStreak(completed: boolean): StreakData {
  const streaks = getStreaks();
  const today = new Date().toISOString().split('T')[0];

  if (!completed) return streaks;

  // Already recorded today
  if (streaks.lastCompletedDate === today) return streaks;

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const isConsecutive = streaks.lastCompletedDate === yesterday;
  const newStreak = isConsecutive ? streaks.currentStreak + 1 : 1;

  const updated: StreakData = {
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, streaks.longestStreak),
    lastCompletedDate: today,
  };

  Taro.setStorageSync(KEYS.STREAKS, updated);
  return updated;
}

// ----- Daily Challenges -----

export function getDailyChallenges(): DailyChallenge[] {
  try {
    const raw = Taro.getStorageSync(KEYS.DAILY_CHALLENGES);
    return Array.isArray(raw) ? raw : [];
  } catch { return []; }
}

export function saveDailyChallenge(challenge: DailyChallenge): void {
  const all = getDailyChallenges();
  // Replace if same date exists
  const idx = all.findIndex((c) => c.date === challenge.date);
  if (idx >= 0) all[idx] = challenge;
  else all.push(challenge);
  Taro.setStorageSync(KEYS.DAILY_CHALLENGES, all);
}

export function getTodayDailyChallenge(): DailyChallenge | null {
  const today = new Date().toISOString().split('T')[0];
  return getDailyChallenges().find((c) => c.date === today) || null;
}
