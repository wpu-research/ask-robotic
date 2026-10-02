// Modül 2 ("Scratch ile Kendi Oyununu Yap", slug 'scratch') ders etkinlikleri.
// Anahtar: `scratch:<hafta>:<haftadaki ders>` (1 tabanlı; activityKey ile aynı biçim). 8 hafta x 2 ders = 16 etkinlik.
import type { SahneActivity } from '../activity'
import { A_1_1, A_1_2, A_2_1, A_2_2 } from './h1-h2'
import { A_3_1, A_3_2, A_4_1, A_4_2 } from './h3-h4'
import { A_5_1, A_5_2, A_6_1, A_6_2 } from './h5-h6'
import { A_7_1, A_7_2, A_8_1, A_8_2 } from './h7-h8'

export const SAHNE_MODULE_SLUG = 'scratch'

export const SAHNE_ACTIVITIES: Readonly<Record<string, SahneActivity>> = Object.fromEntries(
  [A_1_1, A_1_2, A_2_1, A_2_2, A_3_1, A_3_2, A_4_1, A_4_2, A_5_1, A_5_2, A_6_1, A_6_2, A_7_1, A_7_2, A_8_1, A_8_2].map((a) => [a.id, a]),
)

/** Ders oynatıcının anahtarıyla ('scratch:<hafta>:<ders>') etkinliği bulur; yoksa null. */
export const getSahneActivity = (key: string | null | undefined): SahneActivity | null => (key ? SAHNE_ACTIVITIES[key] ?? null : null)

export const allSahneActivities = (): [string, SahneActivity][] => Object.entries(SAHNE_ACTIVITIES)
