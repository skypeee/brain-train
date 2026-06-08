export interface GameStatsRecord {
  id: string;
  gameType?: string | null;
  difficulty: string;
  durationMs: number;
  score: number | null;
  completed: boolean;
}

export interface GameTypeStats {
  totalGames: number;
  completed: number;
  bestDurationMs: number | null;
  avgDurationMs: number | null;
  totalScore: number;
  bestScore: number;
}

export interface ComputedGameStats {
  totalGames: number;
  completed: number;
  winRate: number;
  bestTime: string;
  sudokuBestTime: string;
  avgTimeByDifficulty: Record<string, string>;
  totalScore: number;
  gamesByType: Record<string, number>;
  byGameType: Record<string, GameTypeStats>;
}

export function normalizeGameType(gameType?: string | null) {
  return gameType || 'sudoku';
}

export function formatDuration(ms: number | null | undefined) {
  if (ms === null || ms === undefined) return '--:--';
  const minutes = Math.floor(ms / 60000);
  const seconds = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function computeGameStats(records: GameStatsRecord[]): ComputedGameStats {
  const completed = records.filter((g) => g.completed);
  const byGameType: Record<string, GameTypeStats> = {};
  const gamesByType: Record<string, number> = {};
  const sudokuCompleted = completed.filter((g) => normalizeGameType(g.gameType) === 'sudoku');

  records.forEach((game) => {
    const type = normalizeGameType(game.gameType);
    gamesByType[type] = (gamesByType[type] || 0) + 1;

    if (!byGameType[type]) {
      byGameType[type] = {
        totalGames: 0,
        completed: 0,
        bestDurationMs: null,
        avgDurationMs: null,
        totalScore: 0,
        bestScore: 0,
      };
    }

    const bucket = byGameType[type];
    bucket.totalGames += 1;

    if (game.completed) {
      const score = game.score || 0;
      bucket.completed += 1;
      bucket.totalScore += score;
      bucket.bestScore = Math.max(bucket.bestScore, score);
      bucket.bestDurationMs =
        bucket.bestDurationMs === null ? game.durationMs : Math.min(bucket.bestDurationMs, game.durationMs);
    }
  });

  Object.entries(byGameType).forEach(([type, bucket]) => {
    const completedInType = completed.filter((g) => normalizeGameType(g.gameType) === type);
    if (completedInType.length === 0) return;
    const totalDuration = completedInType.reduce((sum, game) => sum + game.durationMs, 0);
    bucket.avgDurationMs = totalDuration / completedInType.length;
  });

  const byDiff: Record<string, number[]> = {};
  sudokuCompleted.forEach((g) => {
    if (!byDiff[g.difficulty]) byDiff[g.difficulty] = [];
    byDiff[g.difficulty].push(g.durationMs);
  });

  const avgTimeByDifficulty: Record<string, string> = {};
  Object.entries(byDiff).forEach(([diff, times]) => {
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    avgTimeByDifficulty[diff] = formatDuration(avg);
  });

  const sudokuBestDuration =
    sudokuCompleted.length > 0
      ? sudokuCompleted.reduce((best, game) => Math.min(best, game.durationMs), sudokuCompleted[0].durationMs)
      : null;
  const totalScore = completed.reduce((sum, g) => sum + (g.score || 0), 0);

  return {
    totalGames: records.length,
    completed: completed.length,
    winRate: records.length > 0 ? Math.round((completed.length / records.length) * 100) : 0,
    bestTime: formatDuration(sudokuBestDuration),
    sudokuBestTime: formatDuration(sudokuBestDuration),
    avgTimeByDifficulty,
    totalScore,
    gamesByType,
    byGameType,
  };
}
