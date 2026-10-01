// Panel hesapları: ilerleme, "kaldığın yerden devam", haftalık öneri, istatistik ve etkinlik akışı.
// Saf işlevler (DOM/DB yok); veri localStorage'taki gerçek ilerlemeden gelir, hiçbir değer uydurulmaz.
import type { CatalogLesson, CatalogModule } from './catalog'

export type LessonStatus = 'yok' | 'suruyor' | 'bitti'

export interface FlatLesson {
  lesson: CatalogLesson
  moduleSlug: string
  moduleTitle: string
  modulePosition: number
  weekPosition: number
  weekTitle: string
  /** Müfredat sırası (0 tabanlı). */
  order: number
}

/** Modül sırası, hafta sırası ve ders sırasıyla düzleştirir. */
export function flattenCatalog(catalog: CatalogModule[]): FlatLesson[] {
  const out: FlatLesson[] = []
  for (const m of [...catalog].sort((a, b) => a.position - b.position)) {
    for (const w of [...m.weeks].sort((a, b) => a.position - b.position)) {
      for (const l of [...w.lessons].sort((a, b) => a.position - b.position)) {
        out.push({ lesson: l, moduleSlug: m.slug, moduleTitle: m.title, modulePosition: m.position, weekPosition: w.position, weekTitle: w.title, order: out.length })
      }
    }
  }
  return out
}

export interface Counts { done: number; total: number; pct: number }

export function countDone(ids: readonly number[], done: ReadonlySet<number>): Counts {
  const n = ids.filter((i) => done.has(i)).length
  return { done: n, total: ids.length, pct: ids.length ? Math.round((n / ids.length) * 100) : 0 }
}

export const moduleLessonIds = (m: CatalogModule) => m.weeks.flatMap((w) => w.lessons.map((l) => l.id))

/** Modülün durumu: hiç başlanmadı / sürüyor / bitti. Boş modül "yok". */
export function moduleState(ids: readonly number[], done: ReadonlySet<number>, opened: Readonly<Record<string, number>> = {}): LessonStatus {
  if (!ids.length) return 'yok'
  const c = countDone(ids, done)
  if (c.done === c.total) return 'bitti'
  if (c.done > 0 || ids.some((i) => opened[String(i)])) return 'suruyor'
  return 'yok'
}

export function lessonStatus(id: number, done: ReadonlySet<number>, opened: Readonly<Record<string, number>> = {}): LessonStatus {
  if (done.has(id)) return 'bitti'
  return opened[String(id)] ? 'suruyor' : 'yok'
}

export function overallProgress(catalog: CatalogModule[], done: ReadonlySet<number>): Counts {
  return countDone(catalog.flatMap(moduleLessonIds), done)
}

export interface ContinueTarget { item: FlatLesson; mode: 'resume' | 'next' | 'start'; /** Son açılan ders (varsa). */ lastOpened: FlatLesson | null }

/** Son açılan ders (zaman damgasına göre) müfredatta yoksa null. */
export function lastOpenedLesson(flat: FlatLesson[], opened: Readonly<Record<string, number>>): FlatLesson | null {
  let best: FlatLesson | null = null
  let bestTs = -1
  for (const f of flat) {
    const ts = opened[String(f.lesson.id)]
    if (ts && ts > bestTs) { best = f; bestTs = ts }
  }
  return best
}

/** "Kaldığın yerden devam et": son açılan ders bitmediyse o; bittiyse ondan sonraki yapılmamış ders; hiç açılmadıysa ilk yapılmamış ders. */
export function continueTarget(catalog: CatalogModule[], done: ReadonlySet<number>, opened: Readonly<Record<string, number>> = {}): ContinueTarget | null {
  const flat = flattenCatalog(catalog)
  if (!flat.length) return null
  const last = lastOpenedLesson(flat, opened)
  if (last && !done.has(last.lesson.id)) return { item: last, mode: 'resume', lastOpened: last }
  const from = last ? last.order + 1 : 0
  const next = flat.slice(from).find((f) => !done.has(f.lesson.id)) ?? flat.find((f) => !done.has(f.lesson.id))
  if (!next) return null
  const anyDone = flat.some((f) => done.has(f.lesson.id))
  return { item: next, mode: last || anyDone ? 'next' : 'start', lastOpened: last }
}

/** "Bu hafta" önerisi: devam noktasından başlayıp yapılmamış sıradaki dersler (varsayılan 5). */
export function recommendNext(catalog: CatalogModule[], done: ReadonlySet<number>, opened: Readonly<Record<string, number>> = {}, limit = 5): FlatLesson[] {
  const flat = flattenCatalog(catalog)
  const target = continueTarget(catalog, done, opened)
  if (!target) return []
  const tail = flat.slice(target.item.order).filter((f) => !done.has(f.lesson.id))
  return tail.slice(0, Math.max(0, limit))
}

export interface Stats { lessonsDone: number; goalLessons: number; minutes: number }

/** Yalnız müfredatta bulunan derslere göre; süre tamamlanan derslerin tahmini sürelerinin toplamıdır. */
export function computeStats(catalog: CatalogModule[], done: ReadonlySet<number>, goals: Readonly<Record<string, number>> = {}): Stats {
  const flat = flattenCatalog(catalog)
  let lessonsDone = 0, minutes = 0, goalLessons = 0
  for (const f of flat) {
    if (done.has(f.lesson.id)) { lessonsDone++; minutes += f.lesson.durationMin }
    if (goals[String(f.lesson.id)]) goalLessons++
  }
  return { lessonsDone, goalLessons, minutes }
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${min} dk`
  const h = Math.floor(min / 60), m = min % 60
  return m ? `${h} sa ${m} dk` : `${h} sa`
}

export interface ActivityLike { opened: Record<string, number>; goals: Record<string, number>; finished: Record<string, number> }
export interface FeedEvent { key: string; type: 'open' | 'goals' | 'done'; at: number; item: FlatLesson }

/** Son etkinlikler: ders tamamlama, hedef bitirme ve ders açma kayıtları, yeniden eskiye. Aynı ders için aynı türden tek kayıt. */
export function buildEvents(catalog: CatalogModule[], act: ActivityLike, done: ReadonlySet<number>, limit = 8): FeedEvent[] {
  const byId = new Map(flattenCatalog(catalog).map((f) => [String(f.lesson.id), f]))
  const ev: FeedEvent[] = []
  for (const [id, at] of Object.entries(act.finished)) { const item = byId.get(id); if (item && done.has(item.lesson.id)) ev.push({ key: `done:${id}`, type: 'done', at, item }) }
  for (const [id, at] of Object.entries(act.goals)) { const item = byId.get(id); if (item) ev.push({ key: `goals:${id}`, type: 'goals', at, item }) }
  for (const [id, at] of Object.entries(act.opened)) {
    const item = byId.get(id)
    // Ders tamamlandıysa "açıldı" kaydı gürültüdür.
    if (item && !done.has(item.lesson.id)) ev.push({ key: `open:${id}`, type: 'open', at, item })
  }
  return ev.sort((a, b) => b.at - a.at).slice(0, limit)
}

export interface BadgeInfo { id: string; title: string; hint: string; earned: boolean }

/** Rozetler yalnız gerçek ilerlemeden türetilir; kazanılmayanlar nasıl kazanılacağını söyler. */
export function badges(catalog: CatalogModule[], done: ReadonlySet<number>, goals: Readonly<Record<string, number>> = {}): BadgeInfo[] {
  const s = computeStats(catalog, done, goals)
  const out: BadgeInfo[] = [
    { id: 'ilk-ders', title: 'İlk adım', hint: 'Bir ders tamamla', earned: s.lessonsDone >= 1 },
    { id: 'on-ders', title: 'Isındım', hint: '10 ders tamamla', earned: s.lessonsDone >= 10 },
    { id: 'ilk-hedef', title: 'Hedef avcısı', hint: 'Bir etkinliğin tüm hedeflerini bitir', earned: s.goalLessons >= 1 },
  ]
  for (const m of [...catalog].sort((a, b) => a.position - b.position)) {
    const ids = moduleLessonIds(m)
    out.push({ id: `modul-${m.slug}`, title: `Modül ${m.position} tamam`, hint: `${m.title}: tüm dersleri bitir`, earned: ids.length > 0 && ids.every((i) => done.has(i)) })
  }
  return out
}
