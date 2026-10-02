// Parça ansiklopedisi erişimi. İçerik: content-src/parcalar/*.md -> @ask/db (parcalar.generated.ts).
// Dikkat: '@ask/db' kökü sunucu kodu (postgres) içerir; tarayıcıya girebilen bu dosya yalnız hafif alt yolu kullanır.
import { parcalar } from '@ask/db/parcalar'
import type { ComponentGuide } from '@ask/db'
import { normTr } from './command-palette'

export type { ComponentGuide }
export const PART_GUIDES: readonly ComponentGuide[] = parcalar

export const guideBySlug = (slug: string): ComponentGuide | undefined => PART_GUIDES.find((g) => g.slug === slug)
export const guideForPartType = (type: string): ComponentGuide | undefined => PART_GUIDES.find((g) => g.partType === type)

/** Başlık, kategori ve özet üzerinde Türkçe büyük/küçük harf ve aksan duyarsız arama; her sözcük bir yerde geçmeli. */
export function searchGuides(list: readonly ComponentGuide[], query: string): ComponentGuide[] {
  const words = normTr(query).split(' ').filter(Boolean)
  if (!words.length) return [...list]
  const scored = list.map((g, i) => {
    const title = normTr(g.title)
    const rest = normTr(`${g.category} ${g.summary} ${g.slug} ${g.partType}`)
    let s = 0
    for (const w of words) {
      if (title.startsWith(w)) s += 4
      else if (title.includes(w)) s += 3
      else if (rest.includes(w)) s += 1
      else return { g, i, s: -1 }
    }
    return { g, i, s }
  }).filter((x) => x.s >= 0)
  scored.sort((a, b) => b.s - a.s || a.i - b.i)
  return scored.map((x) => x.g)
}

/** "modül-slug:hafta:ders" anahtarını ayrıştırır. */
export function parseLessonKey(key: string): { moduleSlug: string; week: number; lesson: number } | null {
  const m = key.match(/^([a-z0-9-]+):(\d+):(\d+)$/)
  return m ? { moduleSlug: m[1], week: Number(m[2]), lesson: Number(m[3]) } : null
}
