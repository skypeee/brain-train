import Taro from '@tarojs/taro';

// WeChat Mini Program Supabase adapter — uses Taro.request (wx.request wrapper)
// instead of the full @supabase/supabase-js client which requires
// WebSocket + fetch polyfills not available in mini program runtime.

const DEFAULT_URL = 'https://disabled.supabase.co';
const DEFAULT_KEY = 'disabled-anon-key';

// These would be set from environment or config in production
const supabaseUrl = DEFAULT_URL;
const supabaseKey = DEFAULT_KEY;

export const isConfigured = !supabaseUrl.includes('disabled');

interface SupabaseResponse<T> {
  data: T | null;
  error: string | null;
}

async function request<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<SupabaseResponse<T>> {
  if (!isConfigured) {
    return { data: null, error: 'Supabase not configured' };
  }

  return new Promise((resolve) => {
    Taro.request({
      url: `${supabaseUrl}/rest/v1/${path}`,
      method,
      header: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      data: body,
      timeout: 10000,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ data: res.data as T, error: null });
        } else {
          resolve({ data: null, error: `HTTP ${res.statusCode}` });
        }
      },
      fail: (err) => {
        resolve({ data: null, error: err.errMsg || 'Network error' });
      },
    });
  });
}

// Game Records
export async function uploadGameRecord(record: {
  id: string;
  game_type: string;
  difficulty: string;
  started_at: number;
  completed_at: number;
  duration_ms: number;
  mistakes: number;
  hints_used: number;
  score: number;
  completed: boolean;
  is_daily: boolean;
  details?: string;
}): Promise<void> {
  try {
    await request('POST', 'game_records', record);
  } catch (_) {
    // Cloud sync is best-effort; silently fail
  }
}

// Leaderboard
export interface LeaderboardEntry {
  id: string;
  game_type: string;
  difficulty: string;
  score: number;
  duration_ms: number;
  mistakes: number;
  completed_at: number;
}

export async function getLeaderboard(
  gameType?: string,
  limit: number = 50,
): Promise<LeaderboardEntry[]> {
  if (!isConfigured) return [];

  let filter = 'completed=eq.true';
  if (gameType) filter += `&game_type=eq.${gameType}`;

  const res = await request<LeaderboardEntry[]>(
    'GET',
    `game_records?select=*&${filter}&order=score.desc&limit=${limit}`,
  );
  return res.data || [];
}

// Daily Challenge (sync today's challenge)
export async function getDailyChallenge(): Promise<{
  id: string;
  date: string;
  board_data: string;
} | null> {
  const today = new Date().toISOString().split('T')[0];
  const res = await request<Array<{ id: string; date: string; board_data: string }>>(
    'GET',
    `daily_challenges?date=eq.${today}&limit=1`,
  );
  return res.data && res.data.length > 0 ? res.data[0] : null;
}
