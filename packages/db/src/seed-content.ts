import { modules, weeks, lessons } from './schema'
import { allModules, type ModuleContent } from './content'
import type { Db } from './index'

/** İçeriği veritabanına yazar. Tekrar çalıştırılabilir: slug/konum üzerinden günceller, silmez. */
export async function seedContent(db: Db, content: ModuleContent[] = allModules) {
  for (const m of content) {
    const [mod] = await db
      .insert(modules)
      .values({ slug: m.slug, title: m.title, track: m.track, position: m.position, minAge: m.minAge, published: true })
      // published'a dokunma: yönetici yayından kaldırdıysa geri açılmasın
      .onConflictDoUpdate({
        target: modules.slug,
        set: { title: m.title, track: m.track, position: m.position, minAge: m.minAge },
      })
      .returning()

    for (const [wi, w] of m.weeks.entries()) {
      const [week] = await db
        .insert(weeks)
        .values({ moduleId: mod.id, position: wi + 1, title: w.title, project: w.project, guideMd: w.guideMd ?? null, guideMdEn: w.guideMdEn ?? null })
        .onConflictDoUpdate({
          target: [weeks.moduleId, weeks.position],
          set: { title: w.title, project: w.project, guideMd: w.guideMd ?? null, guideMdEn: w.guideMdEn ?? null },
        })
        .returning()

      for (const [li, l] of w.lessons.entries()) {
        await db
          .insert(lessons)
          .values({
            weekId: week.id,
            position: li + 1,
            title: l.title,
            durationMin: l.durationMin,
            problem: l.problem,
            contentMd: l.contentMd,
            question: l.question,
            explainerMd: l.explainerMd ?? null,
            concepts: l.concepts ?? null,
            quiz: l.quiz ?? null,
            steps: l.steps ?? null,
            stepsEn: l.stepsEn ?? null,
            contentEn: l.contentEn ?? null,
          })
          .onConflictDoUpdate({
            target: [lessons.weekId, lessons.position],
            set: {
              title: l.title,
              durationMin: l.durationMin,
              problem: l.problem,
              contentMd: l.contentMd,
              question: l.question,
              explainerMd: l.explainerMd ?? null,
              concepts: l.concepts ?? null,
              quiz: l.quiz ?? null,
              steps: l.steps ?? null,
              stepsEn: l.stepsEn ?? null,
              contentEn: l.contentEn ?? null,
            },
          })
      }
    }
  }
}
