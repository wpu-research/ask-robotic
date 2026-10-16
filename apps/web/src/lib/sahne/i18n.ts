// Sahne Atölyesi: çalışma zamanı iletilerinin (yorumlayıcı hataları, hedef ayrıntıları) İngilizce görünümü.
// Motor ve hedef denetimi Türkçe ileti üretmeye devam eder (testler ve davranış aynı); arayüz İngilizceyken burada çevrilir.
import type { Locale } from '@/i18n'
import { SOUND_BY_ID } from './sounds'
import { CHARACTERS } from './gallery/characters'

const RULES: [RegExp, (...m: string[]) => string][] = [
  [/^Bir blok kendini sonsuza kadar çağırıyor olabilir \(çok derin iç içe çağrı\)\.$/, () => 'A block may be calling itself forever (too many nested calls).'],
  [/^Beklenmeyen hata: (.*)$/s, (_, e) => `Unexpected error: ${e}`],
  [/^Bu blok yalnız sprite'larda çalışır, sahnede değil\.$/, () => 'This block only works on sprites, not on the Stage.'],
  [/^'(.*)' adlı kostüm bulunamadı\. Kostümler sekmesinden kontrol et\.$/s, (_, n) => `Couldn't find a costume named '${n}'. Check the Costumes tab.`],
  [/^'(.*)' adlı arka plan bulunamadı\.$/s, (_, n) => `Couldn't find a backdrop named '${n}'.`],
  [/^'(.*)' bloğu kendini çok kez çağırdı \(en çok (\d+) iç içe çağrı\)\. Bir bitiş koşulu ekle\.$/s, (_, n, k) => `The '${n}' block called itself too many times (at most ${k} nested calls). Add a stop condition.`],
  [/^Galeride '(.*)' arka planı yok\.$/, (_, n) => `There is no '${n}' backdrop in the gallery.`],
  // hedef ayrıntıları (activity.ts)
  [/^Program hata verdi\.$/, () => 'The program had an error.'],
  [/^(\d+) farklı blok$/, (_, n) => `${n} different blocks`],
  [/^(\d+) farklı konum$/, (_, n) => `${n} different positions`],
  [/^(\d+) farklı$/, (_, n) => `${n} different`],
  [/^(\d+) öğe$/, (_, n) => `${n} items`],
  [/^(\d+) blok tanımı$/, (_, n) => `${n} block definitions`],
  [/^(\d+) çağrı$/, (_, n) => `${n} calls`],
  [/^(\d+) satır$/, (_, n) => `${n} lines`],
  [/^Sprite bulunamadı\.$/, () => 'Sprite not found.'],
  [/^Değişken yok\.$/, () => 'No variable.'],
  [/^Tek kişi konuşuyor\.$/, () => 'Only one character is talking.'],
  [/^Konuşmalar üst üste biniyor\.$/, () => 'The speech bubbles overlap.'],
  [/^en çok (\d+) klon$/, (_, n) => `at most ${n} clones`],
]

/** Motorun Türkçe iletisini dile göre verir (bilinmeyen ileti olduğu gibi kalır). */
export function localizeMessage(msg: string, locale: Locale): string {
  if (locale !== 'en') return msg
  for (const [re, fn] of RULES) { const m = msg.match(re); if (m) return fn(...m) }
  return msg
}

/** Galeri sesinin görünen adı. */
export const soundLabel = (gid: string, locale: Locale): string => {
  const s = SOUND_BY_ID[gid]
  return s ? (locale === 'en' ? s.nameEn : s.name) : gid
}

/** Galeri karakterinin görünen adı. */
export const characterLabel = (id: string, locale: Locale): string => {
  const c = CHARACTERS.find((x) => x.id === id)
  return c ? (locale === 'en' ? c.nameEn : c.name) : id
}
