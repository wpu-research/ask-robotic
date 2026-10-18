import type { MetadataRoute } from 'next'
import { DEMOS } from '@/lib/cv-demolar'
import { UNITS } from '@/lib/drone/course'
import { RPI_COURSE } from '@/lib/rpi/course'
import { STM32_COURSE } from '@/lib/stm32/course'
import { LESSONS } from '@/lib/ml/lessons'
import { PROJECTS } from '@/lib/ml/projeler'
import { SITE_URL } from '@/lib/site'
import { LEGAL } from './yasal/metinler'

// Herkese açık vitrin sayfaları; hesap/öğretmen/sınıf sayfaları robots.ts'te kapalı
const PAGES = [
  '', '/fiyatlar', '/okullar', '/konular', '/moduller', '/atolye', '/robot-atolyesi', '/robotun-gozleri',
  '/robotun-gozleri/demolar', ...DEMOS.map((d) => `/robotun-gozleri/demolar/${d.slug}`),
  '/makine-ogrenmesi', '/laboratuvar', '/parcalar', '/muhendislik', '/muhendislik/robotik',
  '/muhendislik/drone', '/muhendislik/drone/parcalar', '/muhendislik/drone/simulasyon', '/muhendislik/drone/proje',
  ...UNITS.map((u) => `/muhendislik/drone/unite/${u.n}`),
  ...[RPI_COURSE, STM32_COURSE].flatMap((c) => [`/muhendislik/${c.slug}`, `/muhendislik/${c.slug}/simulasyon`, `/muhendislik/${c.slug}/proje`, ...c.units.map((u) => `/muhendislik/${c.slug}/unite/${u.n}`)]), ...LESSONS.map((l) => `/makine-ogrenmesi/${l.slug}`),
  ...PROJECTS.map((p) => `/makine-ogrenmesi/${p.slug}`), '/makine-ogrenmesi/veri-setleri', '/oyunlar', '/ai-atolyesi',
  '/oyun-atolyesi', '/sahne-atolyesi', '/mikro-kart', '/arena', '/egitmen/murat-arslan',
]

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PAGES.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: 'weekly' as const, priority: p ? 0.7 : 1 })),
    ...Object.keys(LEGAL).map((slug) => ({ url: `${SITE_URL}/yasal/${slug}`, changeFrequency: 'yearly' as const, priority: 0.2 })),
  ]
}
