import { useCallback, useEffect, useState } from 'react';
import { db, schema } from '../db/client';
import { eq, desc, and } from 'drizzle-orm';
import { useAuth } from '../supabase/auth';
import { computeGameStats, GameTypeStats } from './statsUtils';

interface GameStats {
  totalGames: number;
  completed: number;
  winRate: number;
  currentStreak: number;
  longestStreak: number;
  bestTime: string;
  sudokuBestTime: string;
  avgTimeByDifficulty: Record<string, string>;
  totalScore: number;
  gamesByType: Record<string, number>;
  byGameType: Record<string, GameTypeStats>;
}

interface LeaderboardEntry {
  id: string;
  gameType?: string;
  difficulty: string;
  score: number;
  durationMs: number;
  mistakes: number;
  completedAt: number;
}

export function useStats() {
  const [stats, setStats] = useState<GameStats>({
    totalGames: 0,
    completed: 0,
    winRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    bestTime: '--:--',
    sudokuBestTime: '--:--',
    avgTimeByDifficulty: {},
    totalScore: 0,
    gamesByType: {},
    byGameType: {},
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadStats = useCallback(async () => {
    try {
      if (!db) return;
      const [allGames, streakData] = await Promise.all([
        db.select().from(schema.games).all(),
        db.select().from(schema.streaks).limit(1).all(),
      ]);

      const computed = computeGameStats(allGames);

      // Streaks
      const streak = streakData[0];
      const currentStreak = streak?.currentStreak || 0;
      const longestStreak = streak?.longestStreak || 0;

      setStats({
        ...computed,
        currentStreak,
        longestStreak,
      });
    } catch (e) {
      // DB might not be initialized yet
      if (__DEV__) console.warn('Failed to load stats', e);
    }
  }, []);

  const loadLeaderboard = useCallback(async (gameType?: string) => {
    try {
      if (!db) return;
      const whereClause = gameType
        ? and(eq(schema.games.completed, true), eq(schema.games.gameType, gameType))
        : eq(schema.games.completed, true);
      const entries = db
        .select()
        .from(schema.games)
        .where(whereClause)
        .orderBy(desc(schema.games.score))
        .limit(50)
        .all();
      setLeaderboard(entries as LeaderboardEntry[]);
    } catch (e) {
      // Silently fail
      if (__DEV__) console.warn('Failed to load leaderboard', e);
    }
  }, []);

  const saveGameResult = useCallback(
    async (record: {
      id: string;
      gameType?: string;
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
    }) => {
      try {
        if (!db) return;
        await db.insert(schema.games).values({
          ...record,
          gameType: record.gameType || 'sudoku',
          details: record.details || null,
        } as any).run();
        await loadStats();

        // Save to Supabase if logged in
        if (user) {
          try {
            const { supabase } = await import('../supabase/client');
            await supabase.from('game_records').insert(record);
          } catch (e) {
            // Cloud sync is best-effort
            if (__DEV__) console.warn('Failed to sync game result', e);
          }
        }
      } catch (e) {
        // Best-effort
        if (__DEV__) console.warn('Failed to save game result', e);
      }
    },
    [user, loadStats]
  );

  const saveDailyChallenge = useCallback(
    async (record: {
      id: string;
      date: string;
      startedAt: number;
      completedAt: number;
      durationMs: number;
      mistakes: number;
      hintsUsed: number;
      score: number;
      completed: boolean;
    }) => {
      try {
        if (!db) return;
        await db.insert(schema.dailyChallenges).values(record).run();
        await updateStreak(record.completed);
        await loadStats();
      } catch (e) {
        // Best-effort
        if (__DEV__) console.warn('Failed to save daily challenge', e);
      }
    },
    [loadStats]
  );

  const updateStreak = async (completed: boolean) => {
    try {
      if (!db) return;
      const today = new Date().toISOString().split('T')[0];
      const existing = db.select().from(schema.streaks).limit(1).all();
      const streak = existing[0];

      if (!streak) {
        await db.insert(schema.streaks).values({
          id: 1,
          currentStreak: completed ? 1 : 0,
          longestStreak: completed ? 1 : 0,
          lastCompletedDate: completed ? today : null,
        }).run();
      } else if (completed) {
        const lastDate = streak.lastCompletedDate;
        if (lastDate === today) return; // Already recorded today

        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const isConsecutive = lastDate === yesterday;

        const newStreak = isConsecutive ? streak.currentStreak + 1 : 1;
        await db.update(schema.streaks)
          .set({
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, streak.longestStreak),
            lastCompletedDate: today,
          })
          .where(eq(schema.streaks.id, 1))
          .run();
      }
    } catch (e) {
      // Best-effort
      if (__DEV__) console.warn('Failed to update streak', e);
    }
  };

  useEffect(() => {
    loadStats();
    setLoading(false);
  }, []);

  return {
    stats,
    leaderboard,
    loading,
    loadStats,
    loadLeaderboard,
    saveGameResult,
    saveDailyChallenge,
  };
}
