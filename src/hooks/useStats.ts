import { useCallback, useEffect, useState } from 'react';
import { db, schema } from '../db/client';
import { eq, desc, sql } from 'drizzle-orm';
import { useAuth } from '../supabase/auth';

interface GameStats {
  totalGames: number;
  completed: number;
  winRate: number;
  currentStreak: number;
  longestStreak: number;
  bestTime: string;
  avgTimeByDifficulty: Record<string, string>;
  totalScore: number;
  gamesByType: Record<string, number>;
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
    avgTimeByDifficulty: {},
    totalScore: 0,
    gamesByType: {},
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadStats = useCallback(async () => {
    try {
      const [allGames, streakData] = await Promise.all([
        db.select().from(schema.games).all(),
        db.select().from(schema.streaks).limit(1).all(),
      ]);

      const completed = allGames.filter((g) => g.completed);
      const totalGames = allGames.length;

      // Win rate
      const wins = completed.length;
      const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

      // Best time
      const bestGame = completed.length > 0
        ? completed.reduce((a, b) => (a.durationMs < b.durationMs ? a : b))
        : null;
      const bestTime = bestGame
        ? `${Math.floor(bestGame.durationMs / 60000)}:${String(Math.floor((bestGame.durationMs % 60000) / 1000)).padStart(2, '0')}`
        : '--:--';

      // Avg time by difficulty
      const byDiff: Record<string, number[]> = {};
      completed.forEach((g) => {
        if (!byDiff[g.difficulty]) byDiff[g.difficulty] = [];
        byDiff[g.difficulty].push(g.durationMs);
      });
      const avgTimeByDifficulty: Record<string, string> = {};
      for (const [diff, times] of Object.entries(byDiff)) {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        avgTimeByDifficulty[diff] = `${Math.floor(avg / 60000)}:${String(Math.floor((avg % 60000) / 1000)).padStart(2, '0')}`;
      }

      // Total score
      const totalScore = completed.reduce((sum, g) => sum + (g.score || 0), 0);

      // Streaks
      const streak = streakData[0];
      const currentStreak = streak?.currentStreak || 0;
      const longestStreak = streak?.longestStreak || 0;

      // Count games by type
      const gamesByType: Record<string, number> = {};
      allGames.forEach((g: any) => {
        const t = g.gameType || 'sudoku';
        gamesByType[t] = (gamesByType[t] || 0) + 1;
      });

      setStats({
        totalGames,
        completed: wins,
        winRate,
        currentStreak,
        longestStreak,
        bestTime,
        avgTimeByDifficulty,
        totalScore,
        gamesByType,
      });
    } catch (e) {
      // DB might not be initialized yet
    }
  }, []);

  const loadLeaderboard = useCallback(async () => {
    try {
      const entries = db
        .select()
        .from(schema.games)
        .where(eq(schema.games.completed, true))
        .orderBy(desc(schema.games.score))
        .limit(50)
        .all();
      setLeaderboard(entries as LeaderboardEntry[]);
    } catch {
      // Silently fail
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
          } catch {
            // Cloud sync is best-effort
          }
        }
      } catch {
        // Best-effort
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
        await db.insert(schema.dailyChallenges).values(record).run();
        await updateStreak(record.completed);
        await loadStats();
      } catch {
        // Best-effort
      }
    },
    [loadStats]
  );

  const updateStreak = async (completed: boolean) => {
    try {
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
    } catch {
      // Best-effort
    }
  };

  useEffect(() => {
    loadStats();
    loadLeaderboard();
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
