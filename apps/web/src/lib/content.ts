import { and, asc, enrollments, eq, inArray, lessons, modules, progress, weeks, type Db } from '@ask/db'

export async function listModules(db: Db) {
  return db.select().from(modules).where(eq(modules.published, true)).orderBy(asc(modules.position))
}

export async function getModuleTree(db: Db, slug: string) {
  const [mod] = await db
    .select()
    .from(modules)
    .where(and(eq(modules.slug, slug), eq(modules.published, true)))
    .limit(1)
  if (!mod) return null
  const weekRows = await db.select().from(weeks).where(eq(weeks.moduleId, mod.id)).orderBy(asc(weeks.position))
  const lessonRows = weekRows.length
    ? await db
        .select()
        .from(lessons)
        .where(inArray(lessons.weekId, weekRows.map((w) => w.id)))
        .orderBy(asc(lessons.position))
    : []
  return {
    module: mod,
    weeks: weekRows.map((w) => ({ ...w, lessons: lessonRows.filter((l) => l.weekId === w.id) })),
  }
}

/** Dersi, modül içindeki önceki/sonraki ders bilgisiyle döndürür. */
export async function getLessonContext(db: Db, lessonId: number) {
  const [row] = await db
    .select({ lesson: lessons, week: weeks, module: modules })
    .from(lessons)
    .innerJoin(weeks, eq(weeks.id, lessons.weekId))
    .innerJoin(modules, eq(modules.id, weeks.moduleId))
    .where(and(eq(lessons.id, lessonId), eq(modules.published, true)))
    .limit(1)
  if (!row) return null
  const tree = await getModuleTree(db, row.module.slug)
  const flat = tree!.weeks.flatMap((w) => w.lessons)
  const i = flat.findIndex((l) => l.id === lessonId)
  return { ...row, prev: flat[i - 1] ?? null, next: flat[i + 1] ?? null, index: i + 1, total: flat.length }
}

export async function getCompletedLessonIds(db: Db, userId: string, lessonIds: number[]) {
  if (!lessonIds.length) return new Set<number>()
  const rows = await db
    .select({ lessonId: progress.lessonId })
    .from(progress)
    .where(and(eq(progress.userId, userId), eq(progress.status, 'completed'), inArray(progress.lessonId, lessonIds)))
  return new Set(rows.map((r) => r.lessonId))
}

/** Dersi tamamlandı olarak işaretler (tekrar çağrılabilir). Ders yoksa/yayında değilse false. */
export async function completeLesson(db: Db, userId: string, lessonId: number) {
  const ctx = await getLessonContext(db, lessonId)
  if (!ctx) return false
  await db
    .insert(progress)
    .values({ userId, lessonId, status: 'completed', completedAt: new Date() })
    .onConflictDoUpdate({
      target: [progress.userId, progress.lessonId],
      set: { status: 'completed', completedAt: new Date() },
    })
  await db.insert(enrollments).values({ userId, moduleId: ctx.module.id }).onConflictDoNothing()
  return true
}
