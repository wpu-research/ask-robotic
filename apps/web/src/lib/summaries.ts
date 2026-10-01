import type { Db } from '@ask/db'
import { getModuleTree, listModules } from './content'

export interface ModuleSummary {
  id: number
  slug: string
  title: string
  track: 'cocuk' | 'maker' | 'ai'
  position: number
  minAge: number | null
  weeks: number
  lessons: number
  minutes: number
  lessonIds: number[]
  firstLessonId: number | null
}

export async function getModuleSummaries(db: Db): Promise<ModuleSummary[]> {
  const mods = await listModules(db)
  const out: ModuleSummary[] = []
  for (const m of mods) {
    const tree = await getModuleTree(db, m.slug)
    const lessons = tree?.weeks.flatMap((w) => w.lessons) ?? []
    out.push({
      id: m.id, slug: m.slug, title: m.title, track: m.track, position: m.position, minAge: m.minAge,
      weeks: tree?.weeks.length ?? 0,
      lessons: lessons.length,
      minutes: lessons.reduce((n, l) => n + l.durationMin, 0),
      lessonIds: lessons.map((l) => l.id),
      firstLessonId: lessons[0]?.id ?? null,
    })
  }
  return out
}

export const hours = (min: number) => (min >= 60 ? `${Math.round(min / 60)} saat` : `${min} dk`)
