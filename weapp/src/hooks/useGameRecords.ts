import { useCallback } from 'react';
import { saveGameRecord, updateStreak, saveDailyChallenge } from '../utils/storage';
import { uploadGameRecord } from '../utils/supabase';
import type { GameRecord, DailyChallenge } from '../utils/storage';

export function useGameRecords() {
  const saveResult = useCallback(async (record: GameRecord) => {
    // Save locally
    saveGameRecord(record);

    // Update streak if completed
    if (record.completed) {
      updateStreak(true);
    }

    // Try cloud sync (best-effort, non-blocking)
    try {
      await uploadGameRecord({
        id: record.id,
        game_type: record.gameType,
        difficulty: record.difficulty,
        started_at: record.startedAt,
        completed_at: record.completedAt,
        duration_ms: record.durationMs,
        mistakes: record.mistakes,
        hints_used: record.hintsUsed,
        score: record.score,
        completed: record.completed,
        is_daily: record.isDaily,
        details: record.details,
      });
    } catch (_) {
      // Cloud sync is best-effort
    }
  }, []);

  const saveDaily = useCallback((challenge: DailyChallenge) => {
    saveDailyChallenge(challenge);
    if (challenge.completed) {
      updateStreak(true);
    }
  }, []);

  return { saveResult, saveDaily };
}
