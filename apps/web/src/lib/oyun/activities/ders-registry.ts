// Oyun Atölyesi (modül slug 'oyun-atolyesi', content-src/modul-11) ders etkinlikleri: ders oynatıcının anahtarı
// `oyun-atolyesi:<hafta>:<haftadaki sıra 1-5>` (activityKey ile aynı biçim) → etkinlik.
import type { OyunActivity } from '../activity'
import { DERS_ETKINLIKLERI_H1_H3 } from './dersler-h1-h3'
import { M11_H4_H6_ACTIVITIES } from './m11-h4-h6'

export const OYUN_ATOLYESI_SLUG = 'oyun-atolyesi'

const ALL: readonly OyunActivity[] = [...DERS_ETKINLIKLERI_H1_H3, ...M11_H4_H6_ACTIVITIES]

/** 30 etkinlik, modüldeki ders sırasıyla (H1 1-5, H2 6-10, ...). */
export const OYUN_ATOLYESI_ACTIVITIES: Readonly<Record<string, OyunActivity>> = Object.fromEntries(
  ALL.map((a, i) => [`${OYUN_ATOLYESI_SLUG}:${Math.floor(i / 5) + 1}:${(i % 5) + 1}`, a]),
)

export const getOyunActivity = (key: string | null | undefined): OyunActivity | null =>
  key ? OYUN_ATOLYESI_ACTIVITIES[key] ?? null : null
