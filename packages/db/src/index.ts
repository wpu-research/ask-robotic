import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core'
import * as schema from './schema'

export * from './schema'
// Tek drizzle-orm kopyası: web tarafı operatörleri buradan almalı (pnpm iki kopya kurabiliyor)
export { and, asc, eq, gt, inArray, isNull, sql } from 'drizzle-orm'
export { seedContent } from './seed-content'
export { allModules, allComponents } from './content'
export type { ModuleContent, WeekContent, LessonContent, Concept, QuizQuestion, QuizKind, ComponentGuide, LessonStep, WidgetSpec, WidgetGoal } from './content'

export function createDb(url = process.env.DATABASE_URL) {
  if (!url) throw new Error('DATABASE_URL tanımlı değil')
  return drizzle(postgres(url), { schema })
}

// postgres-js ve PGlite (test) sürücülerinin ortak tipi
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>
