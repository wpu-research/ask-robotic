import {
  boolean, integer, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid,
} from 'drizzle-orm/pg-core'

export const userRole = pgEnum('user_role', ['student', 'parent', 'teacher', 'admin'])
export const track = pgEnum('track', ['cocuk', 'maker', 'ai'])
export const progressStatus = pgEnum('progress_status', ['started', 'completed'])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: userRole('role').notNull().default('student'),
  // 16 yaş altı için ebeveyn hesabına bağlanır (KVKK)
  parentId: uuid('parent_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const modules = pgTable('modules', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  track: track('track').notNull(),
  position: integer('position').notNull(),
  minAge: integer('min_age'),
  published: boolean('published').notNull().default(false),
})

export const weeks = pgTable('weeks', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  moduleId: integer('module_id').notNull().references(() => modules.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
  title: text('title').notNull(),
  project: text('project'),
}, (t) => [uniqueIndex('weeks_module_position').on(t.moduleId, t.position)])

// Hyvex formatı: problem → kavram+vaka → demo → soru (15-20 dk)
export const lessons = pgTable('lessons', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  weekId: integer('week_id').notNull().references(() => weeks.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
  title: text('title').notNull(),
  durationMin: integer('duration_min').notNull().default(20),
  problem: text('problem'),
  contentMd: text('content_md'),
  question: text('question'),
}, (t) => [uniqueIndex('lessons_week_position').on(t.weekId, t.position)])

export const enrollments = pgTable('enrollments', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  moduleId: integer('module_id').notNull().references(() => modules.id, { onDelete: 'cascade' }),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex('enrollments_pk').on(t.userId, t.moduleId)])

export const progress = pgTable('progress', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  lessonId: integer('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  status: progressStatus('status').notNull().default('started'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
}, (t) => [uniqueIndex('progress_pk').on(t.userId, t.lessonId)])

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  // Çerezdeki ham token tutulmaz; yalnızca SHA-256 özeti saklanır
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
