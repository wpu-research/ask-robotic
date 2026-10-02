// Oyun Atölyesi modülü (modul-11), hafta 4-6 ders etkinlikleri. Ders numaraları modül içi küresel numaradır (H4 = 16-20, H5 = 21-25, H6 = 26-30).
// Koordinatör bu listeyi `activities/index.ts` içindeki ACTIVITIES'e ekler (ya da ayrı kullanır).
import type { OyunActivity } from '../activity'
import { OA_16_DEVRIYE } from './m11-h4-16-devriye'
import { OA_17_TAKIP } from './m11-h4-17-takip'
import { OA_18_RASTGELE } from './m11-h4-18-rastgele'
import { OA_19_ATES } from './m11-h4-19-ates'
import { OA_20_HAYALET_AVCISI } from './m11-h4-20-hayalet-avcisi'
import { OA_21_YERCEKIMI } from './m11-h5-21-yercekimi'
import { OA_22_ZIPLAMA } from './m11-h5-22-ziplama'
import { OA_23_DIKEN_PLATFORM } from './m11-h5-23-diken-platform'
import { OA_24_EZME } from './m11-h5-24-ezme'
import { OA_25_PLATFORM_ATLAYICI } from './m11-h5-25-platform-atlayici'
import { OA_26_ISKELET } from './m11-h6-26-iskelet'
import { OA_27_UZAY_SAVUNMASI } from './m11-h6-27-uzay-savunmasi'
import { OA_28_LABIRENT_KACIS } from './m11-h6-28-labirent-kacis'
import { OA_29_HATA_AYIKLAMA } from './m11-h6-29-hata-ayiklama'
import { OA_30_FINAL } from './m11-h6-30-final'

/** [ders numarası, ders dosyası adı (content-src/modul-11/hN/ altında, uzantısız), etkinlik] */
export const M11_H4_H6: readonly { lesson: number; week: 4 | 5 | 6; slug: string; activity: OyunActivity }[] = [
  { lesson: 16, week: 4, slug: '16-devriye', activity: OA_16_DEVRIYE },
  { lesson: 17, week: 4, slug: '17-takip', activity: OA_17_TAKIP },
  { lesson: 18, week: 4, slug: '18-rastgele-hareket', activity: OA_18_RASTGELE },
  { lesson: 19, week: 4, slug: '19-ates-etme', activity: OA_19_ATES },
  { lesson: 20, week: 4, slug: '20-proje-hayalet-avcisi', activity: OA_20_HAYALET_AVCISI },
  { lesson: 21, week: 5, slug: '21-yercekimi', activity: OA_21_YERCEKIMI },
  { lesson: 22, week: 5, slug: '22-ziplama', activity: OA_22_ZIPLAMA },
  { lesson: 23, week: 5, slug: '23-platform-ve-diken', activity: OA_23_DIKEN_PLATFORM },
  { lesson: 24, week: 5, slug: '24-dusmanin-ustune-zipla', activity: OA_24_EZME },
  { lesson: 25, week: 5, slug: '25-proje-platform-atlayici', activity: OA_25_PLATFORM_ATLAYICI },
  { lesson: 26, week: 6, slug: '26-oyun-iskeleti', activity: OA_26_ISKELET },
  { lesson: 27, week: 6, slug: '27-tam-oyun-uzay-savunmasi', activity: OA_27_UZAY_SAVUNMASI },
  { lesson: 28, week: 6, slug: '28-tam-oyun-labirent-kacisi', activity: OA_28_LABIRENT_KACIS },
  { lesson: 29, week: 6, slug: '29-cila-ve-hata-ayiklama', activity: OA_29_HATA_AYIKLAMA },
  { lesson: 30, week: 6, slug: '30-final-kendi-oyunun', activity: OA_30_FINAL },
]
export const M11_H4_H6_ACTIVITIES: readonly OyunActivity[] = M11_H4_H6.map((x) => x.activity)
