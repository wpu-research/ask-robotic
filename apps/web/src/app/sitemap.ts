import type { MetadataRoute } from 'next'
import { UNITS } from '@/lib/drone/course'
import { SITE_URL } from '@/lib/site'
import { LEGAL } from './yasal/metinler'

// Herkese açık vitrin sayfaları; hesap/öğretmen/sınıf sayfaları robots.ts'te kapalı
const PAGES = [
  '', '/fiyatlar', '/okullar', '/konular', '/moduller', '/atolye', '/robot-atolyesi', '/robotun-gozleri',
  '/makine-ogrenmesi', '/laboratuvar', '/parcalar', '/muhendislik', '/muhendislik/robotik',
  '/muhendislik/drone', '/muhendislik/drone/parcalar', '/muhendislik/drone/simulasyon', '/muhendislik/drone/proje',
  ...UNITS.map((u) => `/muhendislik/drone/unite/${u.n}`), '/oyunlar', '/ai-atolyesi',
  '/oyun-atolyesi', '/sahne-atolyesi', '/mikro-kart', '/arena',
]

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PAGES.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: 'weekly' as const, priority: p ? 0.7 : 1 })),
    ...Object.keys(LEGAL).map((slug) => ({ url: `${SITE_URL}/yasal/${slug}`, changeFrequency: 'yearly' as const, priority: 0.2 })),
  ]
}
