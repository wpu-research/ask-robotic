import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { LEGAL } from './yasal/metinler'

// Herkese açık vitrin sayfaları; hesap/öğretmen/sınıf sayfaları robots.ts'te kapalı
const PAGES = [
  '', '/fiyatlar', '/okullar', '/konular', '/moduller', '/atolye', '/robot-atolyesi', '/robotun-gozleri',
  '/makine-ogrenmesi', '/laboratuvar', '/parcalar', '/muhendislik', '/muhendislik/robotik', '/oyunlar', '/ai-atolyesi',
  '/oyun-atolyesi', '/sahne-atolyesi', '/mikro-kart', '/arena',
]

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PAGES.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: 'weekly' as const, priority: p ? 0.7 : 1 })),
    ...Object.keys(LEGAL).map((slug) => ({ url: `${SITE_URL}/yasal/${slug}`, changeFrequency: 'yearly' as const, priority: 0.2 })),
  ]
}
