import type { CatalogModule } from './catalog'
import type { PaletteItem } from './command-palette'
import { PART_DEFS } from './lab/geometry'
import { DEFAULT_PARTS, PART_KEYWORDS, SHORT_NAME } from './lab/parts'
import { GAME_META } from './games/meta'
import { PART_GUIDES } from './parca-rehberi'
import { LESSON_KIND_LABEL, UPCOMING } from './module-meta'

/** Modül, ders ve parça arama dizini (sunucuda üretilir; komut paleti ilk açılışta çeker). */
export function buildPaletteItems(catalog: CatalogModule[]): PaletteItem[] {
  const items: PaletteItem[] = []
  for (const m of catalog) {
    items.push({ id: `m:${m.slug}`, group: 'Modül', title: `Modül ${m.position}: ${m.title}`, subtitle: m.tagline, href: `/moduller/${m.slug}`, keywords: m.title })
  }
  for (const m of catalog) {
    for (const w of m.weeks) {
      for (const l of w.lessons) {
        items.push({
          id: `l:${l.id}`, group: 'Ders', title: l.title,
          subtitle: `${m.title} › ${w.position}. hafta · ${LESSON_KIND_LABEL[l.kind]} · ${l.durationMin} dk`,
          href: `/ders/${l.id}`, keywords: `${w.title} ${w.project ?? ''}`,
        })
      }
    }
  }
  for (const g of GAME_META) {
    items.push({ id: `g:${g.slug}`, group: 'Araç', title: `Oyun: ${g.title}`, subtitle: g.tagline, href: `/oyunlar/${g.slug}`, keywords: `oyun ${g.keywords}` })
  }
  for (const t of DEFAULT_PARTS) {
    const d = PART_DEFS[t]
    items.push({ id: `part:${t}`, group: 'Parça', title: SHORT_NAME[t] ?? d.name, subtitle: 'Devre laboratuvarında kullan', href: '/laboratuvar', keywords: `${d.name} ${PART_KEYWORDS[t] ?? ''}` })
  }
  for (const g of PART_GUIDES) {
    items.push({ id: `pg:${g.slug}`, group: 'Parça', title: `${g.title}: nedir?`, subtitle: g.summary, href: `/parcalar/${g.slug}`, keywords: `ansiklopedi parça bilgisi ${g.category}` })
  }
  for (const u of UPCOMING) {
    items.push({ id: `soon:${u.slug}`, group: 'Modül', title: `Modül ${u.position}: ${u.title}`, subtitle: 'Yakında', href: '/#yakinda', keywords: u.description })
  }
  return items
}
