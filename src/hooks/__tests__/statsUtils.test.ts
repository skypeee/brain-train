import { describe, expect, it } from '@jest/globals';
import { computeGameStats, formatDuration } from '../statsUtils';

describe('statsUtils', () => {
  it('keeps sudoku best time separate from other game durations', () => {
    const stats = computeGameStats([
      {
        id: 'sudoku-slow',
        gameType: 'sudoku',
        difficulty: 'easy',
        durationMs: 300000,
        score: 1200,
        completed: true,
      },
      {
        id: 'reaction-fast',
        gameType: 'reaction',
        difficulty: 'normal',
        durationMs: 900,
        score: 9000,
        completed: true,
      },
      {
        id: 'cps-fast',
        gameType: 'cps',
        difficulty: 'normal',
        durationMs: 1000,
        score: 700,
        completed: true,
      },
    ]);

    expect(stats.totalGames).toBe(3);
    expect(stats.completed).toBe(3);
    expect(stats.totalScore).toBe(10900);
    expect(stats.sudokuBestTime).toBe('5:00');
    expect(stats.bestTime).toBe('5:00');
    expect(stats.byGameType.sudoku.bestDurationMs).toBe(300000);
    expect(stats.byGameType.reaction.bestDurationMs).toBe(900);
    expect(stats.byGameType.cps.bestDurationMs).toBe(1000);
  });

  it('calculates averages within each game type', () => {
    const stats = computeGameStats([
      {
        id: 'sudoku-1',
        gameType: 'sudoku',
        difficulty: 'medium',
        durationMs: 120000,
        score: 1000,
        completed: true,
      },
      {
        id: 'sudoku-2',
        gameType: 'sudoku',
        difficulty: 'medium',
        durationMs: 180000,
        score: 900,
        completed: true,
      },
      {
        id: 'reaction-1',
        gameType: 'reaction',
        difficulty: 'normal',
        durationMs: 500,
        score: 9500,
        completed: true,
      },
    ]);

    expect(formatDuration(stats.byGameType.sudoku.avgDurationMs)).toBe('2:30');
    expect(formatDuration(stats.byGameType.reaction.avgDurationMs)).toBe('0:00');
    expect(stats.avgTimeByDifficulty.medium).toBe('2:30');
  });
});
