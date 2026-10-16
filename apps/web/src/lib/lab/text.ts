// Laboratuvar arayüz metinleri için dile bağlı yardımcılar (sözlük: i18n/{tr,en}/lab.ts).
// Sim paketindeki Türkçe etiketler (PROPS, uyarı iletileri) burada, web katmanında çevrilir; packages/sim değişmez.
import type { Locale, MessageKey, TFunction } from '@/i18n'
import type { PartType, PropDef } from './contract'
import { PART_DEFS } from './geometry'
import { SHORT_NAME } from './parts'

/** Anahtar sözlükte yoksa (translate anahtarın kendisini döndürür) `fallback`. */
export function tx(t: TFunction, key: string, fallback: string, params?: Record<string, string | number>): string {
  const r = t(key as MessageKey, params)
  return r === key ? fallback : r
}

export const partName = (t: TFunction, type: PartType): string => tx(t, `lab.parts.${type}`, PART_DEFS[type]?.name ?? type)

export const partShortName = (t: TFunction, type: PartType): string =>
  SHORT_NAME[type] ? tx(t, `lab.short.${type}`, SHORT_NAME[type]!) : partName(t, type)

export const propLabel = (t: TFunction, type: PartType, def: Pick<PropDef, 'key' | 'label'>): string =>
  tx(t, `lab.propLabel.${type}.${def.key}`, def.label)

export const propOptionLabel = (t: TFunction, type: PartType, key: string, opt: { value: string; label: string }): string =>
  tx(t, `lab.propOpt.${type}.${key}.${opt.value === '' ? 'none' : opt.value}`, opt.label)

/** Ondalık ayırıcı: Türkçede virgül, İngilizcede nokta. */
export const dec = (locale: Locale, s: string): string => (locale === 'tr' ? s.replace('.', ',') : s)

/** Yüzde: tr "%12,5", en "12.5%". */
export const percent = (t: TFunction, locale: Locale, n: number, digits = 1): string =>
  t('lab.editor.pct', { p: dec(locale, n.toFixed(digits)) })
