import type { Db } from '@ask/db'
import { activityKey, getActivity } from './jr/activity'
import { getLabActivity } from './lab/activity'
import { getArenaActivity } from './arena/activity'
import { getModuleTree, listModules } from './content'
import { MODULE_META, moduleKind, type LessonKind, type ModuleKind } from './module-meta'

/** Panel ve arama için düz, JSON'a çevrilebilir müfredat görünümü. */
export interface CatalogLesson { id: number; title: string; durationMin: number; kind: LessonKind; position: number }
export interface CatalogWeek { id: number; position: number; title: string; project: string | null; lessons: CatalogLesson[] }
export interface CatalogModule {
  id: number
  slug: string
  title: string
  position: number
  track: 'cocuk' | 'maker' | 'ai'
  kind: ModuleKind
  minAge: number | null
  tagline: string
  audience: string
  weeks: CatalogWeek[]
}

export function lessonKind(moduleSlug: string, weekPos: number, lessonPos: number): LessonKind {
  const key = activityKey(moduleSlug, weekPos, lessonPos)
  if (getArenaActivity(key)) return 'arena'
  if (getLabActivity(key)) return 'devre'
  if (getActivity(key)) return 'blok'
  return 'metin'
}

type Tree = NonNullable<Awaited<ReturnType<typeof getModuleTree>>>

function toCatalogModule(m: Tree['module'], tree: Tree | null): CatalogModule {
  const meta = MODULE_META[m.slug]
  return {
    id: m.id, slug: m.slug, title: m.title, position: m.position, track: m.track, kind: moduleKind(m.slug), minAge: m.minAge,
    tagline: meta?.tagline ?? '', audience: meta?.audience ?? '',
    weeks: (tree?.weeks ?? []).map((w) => ({
      id: w.id, position: w.position, title: w.title, project: w.project ?? null,
      lessons: w.lessons.map((l) => ({ id: l.id, title: l.title, durationMin: l.durationMin, position: l.position, kind: lessonKind(m.slug, w.position, l.position) })),
    })),
  }
}

export async function getCatalog(db: Db): Promise<CatalogModule[]> {
  const mods = await listModules(db)
  const out: CatalogModule[] = []
  for (const m of mods) out.push(toCatalogModule(m, await getModuleTree(db, m.slug)))
  return out
}

export async function getCatalogModule(db: Db, slug: string): Promise<CatalogModule | null> {
  const tree = await getModuleTree(db, slug)
  return tree ? toCatalogModule(tree.module, tree) : null
}
