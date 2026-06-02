import { Difficulty } from './types';

export interface ScoreResult {
  baseScore: number;
  timeBonus: number;
  mistakePenalty: number;
  hintPenalty: number;
  dailyBonus: number;
  total: number;
}

export function calculateScore(
  difficulty: Difficulty,
  emptyCells: number,
  elapsedMs: number,
  mistakes: number,
  hintsUsed: number,
  isDaily: boolean
): ScoreResult {
  const elapsedSec = elapsedMs / 1000;
  if (elapsedSec <= 0) {
    return { baseScore: 0, timeBonus: 0, mistakePenalty: 0, hintPenalty: 0, dailyBonus: 0, total: 0 };
  }

  const baseScore = Math.round((1000 * emptyCells * emptyCells) / elapsedSec);

  const timeBonus = difficulty === 'expert' ? 200 : difficulty === 'hard' ? 150 : difficulty === 'medium' ? 100 : 50;

  const mistakePenalty = Math.round(baseScore * 0.1 * mistakes);
  const hintPenalty = Math.round(baseScore * 0.15 * hintsUsed);
  const dailyBonus = isDaily ? 100 : 0;

  const total = Math.max(0, baseScore + timeBonus - mistakePenalty - hintPenalty + dailyBonus);

  return { baseScore, timeBonus, mistakePenalty, hintPenalty, dailyBonus, total };
}
