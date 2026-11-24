import { boolean, date, integer, jsonb, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Skeleton only. Nothing here is migrated or connected.
 * Puzzle keys are text (base64) until a database is attached; the plan's bytea column can replace puzzleKey.
 */

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  displayName: text('display_name'),
  friendCode: text('friend_code'),
  ageBand: text('age_band'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const puzzles = pgTable('puzzles', {
  id: text('id').primaryKey(),
  kind: text('kind').notNull(),
  date: date('date'),
  difficulty: text('difficulty').notNull(),
  dailySetId: text('daily_set_id'),
  publicUrl: text('public_url'),
  contentHash: text('content_hash').notNull(),
  puzzleKey: text('puzzle_key').notNull(),
  answers: jsonb('answers').notNull(),
  locationName: text('location_name').notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
});

export const dailySets = pgTable('daily_sets', {
  id: text('id').primaryKey(),
  date: date('date').notNull(),
  suburb: text('suburb').notNull(),
  city: text('city').notNull(),
  status: text('status').notNull(),
});

export const puzzleSchedule = pgTable(
  'puzzle_schedule',
  {
    date: date('date').notNull(),
    difficulty: text('difficulty').notNull(),
    puzzleId: text('puzzle_id').notNull(),
    dailySetId: text('daily_set_id').notNull(),
  },
  (table) => [primaryKey({ columns: [table.date, table.difficulty] })],
);

export const plays = pgTable('plays', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  puzzleId: text('puzzle_id').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  activeSeconds: integer('active_seconds'),
  hintsUsed: integer('hints_used'),
  wrongChecks: integer('wrong_checks'),
  assisted: boolean('assisted').notNull(),
  score: integer('score'),
  suspicious: boolean('suspicious').notNull(),
});
