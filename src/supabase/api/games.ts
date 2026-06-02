import { supabase } from '../client';

export async function saveGameRecord(record: {
  difficulty: string;
  startedAt: number;
  completedAt: number;
  durationMs: number;
  mistakes: number;
  hintsUsed: number;
  score: number;
  completed: boolean;
  isDaily: boolean;
}) {
  const { data, error } = await supabase.from('game_records').insert(record).select().single();
  if (error) throw error;
  return data;
}

export async function getLeaderboard(limit = 50) {
  const { data, error } = await supabase
    .from('game_records')
    .select('*')
    .order('score', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}
