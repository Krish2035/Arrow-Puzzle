import { pgTable, serial, varchar, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';

/**
 * Users table definition in Drizzle ORM
 */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: varchar('uid', { length: 128 }),
  username: varchar('username', { length: 100 }).notNull().default('Arrow Master'),
  email: varchar('email', { length: 255 }),
  photoUrl: text('photo_url'),
  currentLevel: integer('current_level').notNull().default(1),
  stars: integer('stars').notNull().default(0),
  hearts: integer('hearts').notNull().default(3),
  hints: integer('hints').notNull().default(2),
  createdAt: timestamp('created_at').defaultNow()
});

/**
 * Levels table definition in Drizzle ORM
 */
export const levels = pgTable('levels', {
  id: serial('id').primaryKey(),
  levelNumber: integer('level_number').notNull().unique(),
  title: varchar('title', { length: 150 }).notNull(),
  difficulty: varchar('difficulty', { length: 50 }).notNull().default('easy'),
  gridSize: integer('grid_size').notNull().default(6),
  arrows: jsonb('arrows').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

/**
 * Level completions history table definition in Drizzle ORM
 */
export const levelCompletions = pgTable('level_completions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  levelNumber: integer('level_number').notNull(),
  heartsLeft: integer('hearts_left').default(3),
  timeSeconds: integer('time_seconds').default(0),
  completedAt: timestamp('completed_at').defaultNow()
});
