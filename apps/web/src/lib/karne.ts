// Öğrenci gelişim karnesi ve rozetler. Her sayı gerçek veriden gelir (tamamlanan dersler, beceri ustalığı, XP defteri);
// veri yoksa sıfır döner, tahmin yapılmaz. Saf kısım (buildReportCard, achievements) DB'siz test edilir.
import { eq, sql, xpEvents, type Db } from '@ask/db'
import type { CatalogModule } from './catalog'
import type { ModuleKind } from './module-meta'
import type { SkillMastery } from './skills'
import { DEGERLER, kazanimFor, type DegerKey } from './kazanim-deger'

export type Tier = 'bronz' | 'gumus' | 'altin'
export type AchievementId = 'proje' | 'beceri' | 'duzen' | 'kasif'

/** Basamak eşikleri: bronz, gümüş, altın. */
export const ACHIEVEMENT_STEPS: Record<AchievementId, readonly [number, number, number]> = {
  /** Tamamı bitirilen hafta (her hafta bir projeyle biter) */
  proje: [1, 5, 15],
  /** Ustalaşılan beceri */
  beceri: [3, 10, 25],
  /** XP kazanılan farklı gün */
  duzen: [3, 10, 30],
  /** En az bir dersi bitirilen farklı alan (blok, devre, robot, oyun, ai) */
  kasif: [2, 3, 5],
}

export interface Achievement { id: AchievementId; value: number; tier: Tier | null; next: number | null }

const TIERS: readonly Tier[] = ['bronz', 'gumus', 'altin']

export function achievement(id: AchievementId, value: number): Achievement {
  const steps = ACHIEVEMENT_STEPS[id]
  const reached = steps.filter((s) => value >= s).length
  return { id, value, tier: reached ? TIERS[reached - 1] : null, next: reached < steps.length ? steps[reached] : null }
}

export interface ModuleProgress { slug: string; title: string; kind: ModuleKind; done: number; total: number; weeksDone: number; weeks: number }
export interface ValueEntry { deger: DegerKey; label: string; outcomes: string[] }

export interface ReportCard {
  modules: ModuleProgress[]
  lessonsDone: number
  weeksDone: number
  mastered: SkillMastery[]
  developing: SkillMastery[]
  xp: number
  activeDays: number
  values: ValueEntry[]
  achievements: Achievement[]
}

export function buildReportCard(
  catalog: readonly CatalogModule[],
  done: ReadonlySet<number>,
  mastery: readonly SkillMastery[],
  xp: { total: number; days: number },
): ReportCard {
  const values = new Map<DegerKey, string[]>()
  const modules: ModuleProgress[] = catalog.map((m) => {
    let total = 0, n = 0, weeksDone = 0
    for (const w of m.weeks) {
      const d = w.lessons.filter((l) => done.has(l.id)).length
      total += w.lessons.length
      n += d
      if (w.lessons.length && d === w.lessons.length) {
        weeksDone++
        const k = kazanimFor(m.slug, w.position)
        if (k) values.set(k.deger, [...(values.get(k.deger) ?? []), k.cikti])
      }
    }
    return { slug: m.slug, title: m.title, kind: m.kind, done: n, total, weeksDone, weeks: m.weeks.length }
  }).filter((m) => m.done > 0)

  const weeksDone = modules.reduce((s, m) => s + m.weeksDone, 0)
  const mastered = mastery.filter((s) => s.level === 'ustalasti').sort((a, b) => b.score - a.score)
  const developing = mastery.filter((s) => s.level === 'gelisiyor' || s.level === 'baslangic').sort((a, b) => a.score - b.score)
  return {
    modules,
    lessonsDone: modules.reduce((s, m) => s + m.done, 0),
    weeksDone,
    mastered,
    developing,
    xp: xp.total,
    activeDays: xp.days,
    values: [...values].map(([deger, outcomes]) => ({ deger, label: DEGERLER[deger], outcomes })),
    achievements: [
      achievement('proje', weeksDone),
      achievement('beceri', mastered.length),
      achievement('duzen', xp.days),
      achievement('kasif', new Set(modules.map((m) => m.kind)).size),
    ],
  }
}

/** XP defteri: toplam ve XP kazanılan farklı gün (İstanbul saatiyle). */
export async function loadXpStats(db: Db, userId: string): Promise<{ total: number; days: number }> {
  const [row] = await db
    .select({
      total: sql<number>`coalesce(sum(${xpEvents.amount}), 0)::int`,
      days: sql<number>`count(distinct (${xpEvents.at} at time zone 'Europe/Istanbul')::date)::int`,
    })
    .from(xpEvents).where(eq(xpEvents.userId, userId))
  return { total: Number(row?.total ?? 0), days: Number(row?.days ?? 0) }
}
