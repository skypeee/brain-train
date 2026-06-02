import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

const expoDb = openDatabaseSync('braintrain.db');

// Ensure the tables and columns exist
try {
  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      game_type TEXT NOT NULL DEFAULT 'sudoku',
      difficulty TEXT NOT NULL,
      started_at INTEGER NOT NULL,
      completed_at INTEGER,
      duration_ms INTEGER NOT NULL DEFAULT 0,
      mistakes INTEGER NOT NULL DEFAULT 0,
      hints_used INTEGER NOT NULL DEFAULT 0,
      score INTEGER NOT NULL DEFAULT 0,
      completed INTEGER NOT NULL DEFAULT 0,
      is_daily INTEGER NOT NULL DEFAULT 0,
      details TEXT
    );
    CREATE TABLE IF NOT EXISTS daily_challenges (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      started_at INTEGER NOT NULL,
      completed_at INTEGER,
      duration_ms INTEGER NOT NULL DEFAULT 0,
      mistakes INTEGER NOT NULL DEFAULT 0,
      hints_used INTEGER NOT NULL DEFAULT 0,
      score INTEGER NOT NULL DEFAULT 0,
      completed INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS streaks (
      id INTEGER PRIMARY KEY,
      current_streak INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      last_completed_date TEXT
    );
  `);

  // Add missing columns to existing databases
  try {
    const info = expoDb.getAllSync<{ name: string }>("PRAGMA table_info('games')");
    if (info.length > 0) {
      const columns = new Set(info.map((r) => r.name));
      if (!columns.has('game_type')) {
        expoDb.runSync("ALTER TABLE games ADD COLUMN game_type TEXT NOT NULL DEFAULT 'sudoku'");
      }
      if (!columns.has('details')) {
        expoDb.runSync("ALTER TABLE games ADD COLUMN details TEXT");
      }
    }
  } catch { /* table may not exist yet — handled above */ }
} catch { /* DB not ready at import time */ }

export const db = drizzle(expoDb, { schema });
export { schema };
