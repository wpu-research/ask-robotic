import type { MetadataRoute } from 'next'
import { DEMOS } from '@/lib/cv-demolar'
import { UNITS } from '@/lib/drone/course'
import { UNITS as LLM_UNITS } from '@/lib/llm/course'
import { UNITS as ROBOT_UNITS } from '@/lib/robot-kolu/course'
import { RPI_COURSE } from '@/lib/rpi/course'
import { STM32_COURSE } from '@/lib/stm32/course'
import { IOT_UNITS } from '@/lib/iot/course'
import { SML_UNITS } from '@/lib/sensor-ml/course'
import { LESSONS } from '@/lib/ml/lessons'
import { CV_UNITS } from '@/lib/opencv/course'
import { PT_UNITS } from '@/lib/pytorch/course'
import { PROJECTS } from '@/lib/ml/projeler'
import { SITE_URL } from '@/lib/site'
import { SEASONS } from '@/lib/mikro/sezon'
import { LEGAL } from './yasal/metinler'

// Herkese açık vitrin sayfaları; hesap/öğretmen/sınıf sayfaları robots.ts'te kapalı
const PAGES = [
  '', '/fiyatlar', '/okullar', '/konular', '/moduller', '/atolye', '/robot-atolyesi', '/robotun-gozleri',
  '/robotun-gozleri/demolar', ...DEMOS.map((d) => `/robotun-gozleri/demolar/${d.slug}`),
  '/makine-ogrenmesi', '/laboratuvar', '/parcalar', '/muhendislik', '/muhendislik/robotik',
  '/muhendislik/drone', '/muhendislik/drone/parcalar', '/muhendislik/drone/simulasyon', '/muhendislik/drone/proje',
  ...UNITS.map((u) => `/muhendislik/drone/unite/${u.n}`),
  ...[RPI_COURSE, STM32_COURSE].flatMap((c) => [`/muhendislik/${c.slug}`, `/muhendislik/${c.slug}/simulasyon`, `/muhendislik/${c.slug}/proje`, ...c.units.map((u) => `/muhendislik/${c.slug}/unite/${u.n}`)]), ...LESSONS.map((l) => `/makine-ogrenmesi/${l.slug}`),
  ...UNITS.map((u) => `/muhendislik/drone/unite/${u.n}`), ...LESSONS.map((l) => `/makine-ogrenmesi/${l.slug}`),
  '/muhendislik/iot', '/muhendislik/iot/simulasyon', '/muhendislik/iot/proje', ...IOT_UNITS.map((u) => `/muhendislik/iot/unite/${u.n}`),
  '/muhendislik/sensor-ml', '/muhendislik/sensor-ml/simulasyon', '/muhendislik/sensor-ml/proje', ...SML_UNITS.map((u) => `/muhendislik/sensor-ml/unite/${u.n}`),
  ...PROJECTS.map((p) => `/makine-ogrenmesi/${p.slug}`), '/makine-ogrenmesi/veri-setleri', '/oyunlar', '/ai-atolyesi',
  '/oyun-atolyesi', '/sahne-atolyesi', '/mikro-kart', '/arena', '/egitmen/murat-arslan',
  '/muhendislik/llm', '/muhendislik/llm/simulasyon', '/muhendislik/llm/proje', ...LLM_UNITS.map((u) => `/muhendislik/llm/unite/${u.n}`),
  '/muhendislik/robot-kolu', '/muhendislik/robot-kolu/simulasyon', '/muhendislik/robot-kolu/proje', ...ROBOT_UNITS.map((u) => `/muhendislik/robot-kolu/unite/${u.n}`),
  '/programlar',
  '/robot-atolyesi/sezonlar', ...SEASONS.map((s) => `/robot-atolyesi/sezonlar/${s.id}`),
  '/robot-atolyesi/tasarla', '/muhendislik/insansi',
  '/muhendislik/opencv', '/muhendislik/opencv/proje', ...CV_UNITS.map((u) => `/muhendislik/opencv/unite/${u.n}`),
  '/muhendislik/pytorch', '/muhendislik/pytorch/proje', ...PT_UNITS.map((u) => `/muhendislik/pytorch/unite/${u.n}`),
]

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PAGES.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: 'weekly' as const, priority: p ? 0.7 : 1 })),
    ...Object.keys(LEGAL).map((slug) => ({ url: `${SITE_URL}/yasal/${slug}`, changeFrequency: 'yearly' as const, priority: 0.2 })),
  ]
}
