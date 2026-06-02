import { supabase } from '../client';

export interface CloudLeaderEntry {
  username: string;
  score: number;
  difficulty: string;
  durationMs: number;
  created_at: string;
}

export async function getCloudLeaderboard(difficulty?: string, limit = 50): Promise<CloudLeaderEntry[]> {
  let query = supabase
    .from('game_records')
    .select('user_id, score, difficulty, duration_ms, created_at')
    .order('score', { ascending: false })
    .limit(limit);

  if (difficulty) {
    query = query.eq('difficulty', difficulty);
  }

  const { data, error } = await query;
  if (error) return [];

  // Fetch usernames for display
  const userIds = [...new Set((data || []).map((d: any) => d.user_id))];
  const profiles: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', userIds);
    (profileData || []).forEach((p: any) => {
      profiles[p.id] = p.username;
    });
  }

  return (data || []).map((d: any) => ({
    username: profiles[d.user_id] || 'Anonymous',
    score: d.score,
    difficulty: d.difficulty,
    durationMs: d.duration_ms,
    created_at: d.created_at,
  }));
}
