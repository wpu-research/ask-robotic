// Bulmaca: hayvan özellikleri modeli (saf veri, DOM yok). Sahne ve motor aynı modeli kullanır.

export type ColorKey = 'VARSAYILAN' | 'KIRMIZI' | 'SARI' | 'MAVI' | 'YESIL' | 'TURUNCU' | 'BEYAZ' | 'KAHVERENGI' | 'GRI' | 'PEMBE'

export const COLORS: Record<ColorKey, { label: string; hex: string }> = {
  VARSAYILAN: { label: 'boyasız', hex: '#e6d5ae' },
  KIRMIZI: { label: 'kırmızı', hex: '#e5484d' },
  SARI: { label: 'sarı', hex: '#f6c933' },
  MAVI: { label: 'mavi', hex: '#4c97ff' },
  YESIL: { label: 'yeşil', hex: '#3fb96b' },
  TURUNCU: { label: 'turuncu', hex: '#ff8c1a' },
  BEYAZ: { label: 'beyaz', hex: '#f8f8f4' },
  KAHVERENGI: { label: 'kahverengi', hex: '#a7693b' },
  GRI: { label: 'gri', hex: '#98a2b3' },
  PEMBE: { label: 'pembe', hex: '#ff80b5' },
}

/** Sayılabilir ve mantıksal özellikler (sıra: "her özellik için" döngüsünün sırası). */
export type FeatureKey = 'BACAK' | 'KANAT' | 'GOZ' | 'KULAK' | 'GAGA' | 'KUYRUK' | 'BIYIK'
export const FEATURE_ORDER: FeatureKey[] = ['BACAK', 'KANAT', 'GOZ', 'KULAK', 'GAGA', 'KUYRUK', 'BIYIK']

export const FEATURE_INFO: Record<FeatureKey, { prop: 'legs' | 'wings' | 'eyes' | 'ears' | 'beak' | 'tail' | 'whiskers'; label: string; max: number; countable: boolean }> = {
  BACAK: { prop: 'legs', label: 'bacak', max: 8, countable: true },
  KANAT: { prop: 'wings', label: 'kanat', max: 2, countable: true },
  GOZ: { prop: 'eyes', label: 'göz', max: 2, countable: true },
  KULAK: { prop: 'ears', label: 'kulak', max: 2, countable: true },
  GAGA: { prop: 'beak', label: 'gaga', max: 1, countable: false },
  KUYRUK: { prop: 'tail', label: 'kuyruk', max: 1, countable: false },
  BIYIK: { prop: 'whiskers', label: 'bıyık', max: 1, countable: false },
}

export interface Features {
  legs: number
  wings: number
  eyes: number
  ears: number
  beak: boolean
  tail: boolean
  whiskers: boolean
  color: ColorKey
  name: string
}

export const emptyFeatures = (): Features => ({ legs: 0, wings: 0, eyes: 0, ears: 0, beak: false, tail: false, whiskers: false, color: 'VARSAYILAN', name: '' })
export const makeFeatures = (p: Partial<Features>): Features => ({ ...emptyFeatures(), ...p })

export interface Card { title: string; f: Features }

/** Özelliğin sayısı (mantıksal özellikler 0/1). */
export function featureCount(f: Features, k: FeatureKey): number {
  const v = f[FEATURE_INFO[k].prop]
  return typeof v === 'boolean' ? (v ? 1 : 0) : v
}

export const normName = (s: string): string => s.trim().toLocaleLowerCase('tr-TR')

/** İki hayvanı karşılaştırır; ilk farkı çocuk dostu anlatır, aynıysa null. */
export function firstDifference(target: Features, built: Features): string | null {
  for (const k of FEATURE_ORDER) {
    const t = featureCount(target, k), c = featureCount(built, k)
    if (t === c) continue
    const { label, countable } = FEATURE_INFO[k]
    if (!countable) return t ? `Kartta ${label} var ama sende yok.` : `Kartta ${label} yok ama sende var.`
    return c < t ? `Kartta ${t} ${label} var ama sende ${c} tane var. Eksik ${label} ekle.` : `Kartta ${t} ${label} var ama sende ${c} tane var. Fazla ${label} var.`
  }
  if (target.color !== built.color) return `Hayvanın rengi karttakiyle aynı değil. Kartta ${COLORS[target.color].label}.`
  if (normName(target.name) !== normName(built.name)) return target.name ? `Hayvanın adı karttakiyle aynı değil. Kartta "${target.name}" yazıyor.` : 'Kartta ad yok; adı silmelisin.'
  return null
}
