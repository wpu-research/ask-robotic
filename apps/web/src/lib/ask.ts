// "Neye yardım lazım?" kutusu: serbest cümleyi ders ve kurslara yönlendirir (Brilliant ana sayfasındaki niyet → ders kartı).
// Komut paletinden farkı: her sözcüğün geçmesi gerekmez, soru kalıpları atılır, Türkçe ekler için kök öneki eşleşir.
import type { CatalogModule } from './catalog'
import { normTr } from './command-palette'

export interface AskHit { href: string; title: string; where: string; score: number; kind: 'kurs' | 'ders' }

const STOP = new Set(['nasil', 'nedir', 'ne', 'neden', 'bir', 'ile', 'icin', 've', 'ya', 'da', 'de', 'mi', 'mu', 'ogren', 'ogrenmek', 'istiyorum', 'yapilir', 'yap', 'yapmak', 'hakkinda', 'bana', 'anlat', 'nasildir', 'nerede', 'olan', 'olur', 'calisir', 'kullanilir'])

/** Sözcük kökü: Türkçe ekleri kabaca atmak için ilk 4 harf (kısa sözcükler aynen). */
const stem = (w: string) => (w.length > 5 ? w.slice(0, 4) : w)

export function askWords(q: string): string[] {
  return normTr(q).replace(/[^a-z0-9 ]/g, ' ').split(' ').filter((w) => w.length > 1 && !STOP.has(w)).map(stem)
}

export function askSearch(catalog: CatalogModule[], query: string, limit = 3): AskHit[] {
  const words = askWords(query)
  if (!words.length) return []
  const hits: AskHit[] = []
  const rate = (text: string, extra = '') => {
    const t = normTr(text).split(' ')
    const e = normTr(extra).split(' ')
    let s = 0
    for (const w of words) {
      if (t.some((x) => x.startsWith(w))) s += 3
      else if (e.some((x) => x.startsWith(w))) s += 1
    }
    return s
  }
  for (const m of catalog) {
    const s = rate(m.title, m.tagline)
    if (s > 0) hits.push({ href: `/moduller/${m.slug}`, title: m.title, where: 'Kurs', score: s + 1, kind: 'kurs' })
    for (const w of m.weeks) for (const l of w.lessons) {
      const ls = rate(l.title, `${w.title} ${m.title}`)
      if (ls > 0) hits.push({ href: `/ders/${l.id}`, title: l.title, where: `${m.title} · ${w.position}. hafta`, score: ls + (l.steps ? 0.5 : 0), kind: 'ders' })
    }
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit)
}
