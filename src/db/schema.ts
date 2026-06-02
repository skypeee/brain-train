import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const games = sqliteTable('games', {
  id: text('id').primaryKey(),
  gameType: text('game_type').notNull().default('sudoku'),
  difficulty: text('difficulty').notNull(),
  startedAt: integer('started_at').notNull(),
  completedAt: integer('completed_at'),
  durationMs: integer('duration_ms').notNull().default(0),
  mistakes: integer('mistakes').notNull().default(0),
  hintsUsed: integer('hints_used').notNull().default(0),
  score: integer('score').notNull().default(0),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  isDaily: integer('is_daily', { mode: 'boolean' }).notNull().default(false),
  details: text('details'),
});

export const dailyChallenges = sqliteTable('daily_challenges', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  startedAt: integer('started_at').notNull(),
  completedAt: integer('completed_at'),
  durationMs: integer('duration_ms').notNull().default(0),
  mistakes: integer('mistakes').notNull().default(0),
  hintsUsed: integer('hints_used').notNull().default(0),
  score: integer('score').notNull().default(0),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
});

export const streaks = sqliteTable('streaks', {
  id: integer('id').primaryKey(),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  lastCompletedDate: text('last_completed_date'),
});
