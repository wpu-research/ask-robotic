// Parça ansiklopedisini dile göre birleştirir. Yalnız sunucu sayfaları kullanır (İngilizce veri istemci paketine girmesin;
// parts-index hazır, yerelleştirilmiş listeyi prop olarak alır). Çeviri yoksa Türkçe kayıt olduğu gibi döner.
import type { Locale } from '@/i18n'
import { parcalarEn } from './parca-rehberi.en.generated'
import { guideBySlug, PART_GUIDES, type ComponentGuide } from './parca-rehberi'

export function localizeGuide(g: ComponentGuide, locale: Locale): ComponentGuide {
  const en = locale === 'en' ? parcalarEn[g.slug] : undefined
  return en ? { ...g, ...en } : g
}

export const localizedGuides = (locale: Locale): ComponentGuide[] => PART_GUIDES.map((g) => localizeGuide(g, locale))

export function localizedGuideBySlug(slug: string, locale: Locale): ComponentGuide | undefined {
  const g = guideBySlug(slug)
  return g && localizeGuide(g, locale)
}
