import { and, asc, enrollments, eq, inArray, lessons, modules, progress, sql, weeks, type Db } from '@ask/db'

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

/** Ders anahtarlarını ("modül-slug:hafta:ders") ders kimliği ve başlığa çözer; bulunamayanlar atlanır. */
export async function resolveLessonKeys(db: Db, keys: string[]) {
  const out: { key: string; id: number; title: string; weekTitle: string; moduleTitle: string; moduleSlug: string; weekPos: number; weekName: string }[] = []
  const trees = new Map<string, Awaited<ReturnType<typeof getModuleTree>>>()
  for (const key of keys) {
    const m = key.match(/^([a-z0-9-]+):(\d+):(\d+)$/)
    if (!m) continue
    if (!trees.has(m[1])) trees.set(m[1], await getModuleTree(db, m[1]))
    const tree = trees.get(m[1])
    const lesson = tree?.weeks.find((w) => w.position === Number(m[2]))?.lessons.find((l) => l.position === Number(m[3]))
    const week = tree?.weeks.find((w) => w.position === Number(m[2]))
    if (tree && lesson && week) out.push({ key, id: lesson.id, title: lesson.title, weekTitle: `${week.position}. hafta: ${week.title}`, moduleTitle: tree.module.title, moduleSlug: tree.module.slug, weekPos: week.position, weekName: week.title })
  }
  return out
}

/** Mini testi olan dersler (Testlerim ve İlerlemem için): kimlik, başlık, soru sayısı ve konum.
 * weekLabel Türkçe hazır etikettir; dile göre etiket ve başlık için moduleSlug/moduleTitle/weekPos/lessonPos/weekTitle (lib/content-i18n.ts). */
export async function listQuizLessons(db: Db) {
  const rows = await db
    .select({ id: lessons.id, title: lessons.title, quiz: lessons.quiz, lessonPos: lessons.position, weekPos: weeks.position, weekTitle: weeks.title, moduleTitle: modules.title, moduleSlug: modules.slug })
    .from(lessons)
    .innerJoin(weeks, eq(weeks.id, lessons.weekId))
    .innerJoin(modules, eq(modules.id, weeks.moduleId))
    .where(and(eq(modules.published, true), sql`${lessons.quiz} is not null`))
    .orderBy(asc(modules.position), asc(weeks.position), asc(lessons.position))
  return rows.map((r) => ({ id: r.id, title: r.title, total: r.quiz?.length ?? 0, weekLabel: `${r.moduleTitle} › ${r.weekPos}. hafta: ${r.weekTitle}`, moduleSlug: r.moduleSlug, moduleTitle: r.moduleTitle, weekPos: r.weekPos, lessonPos: r.lessonPos, weekTitle: r.weekTitle }))
}
