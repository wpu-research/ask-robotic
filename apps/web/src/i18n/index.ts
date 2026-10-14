// Küçük i18n katmanı (çerçeve yok): tipli sözlükler (tr kaynak, en aynı anahtarları sağlar), `{ad}` ara değerleri,
// `{n|one|other}` çoğul biçimi. Sunucu: i18n/server.ts (getLocale/getT). İstemci: i18n/client.tsx (I18nProvider/useT).
import { tr, type Messages } from './tr'
import { en } from './en'

export type Locale = 'tr' | 'en'
export const LOCALES: readonly Locale[] = ['tr', 'en']
export const DEFAULT_LOCALE: Locale = 'tr'
/** Dil tercihi çerezi (1 yıl). Giriş yapmış kullanıcıda users.locale de güncellenir (PUT /api/me/locale). */
export const LOCALE_COOKIE = 'ask-locale'
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export const isLocale = (x: unknown): x is Locale => x === 'tr' || x === 'en'

export type { Messages }
export const dictionaries: Record<Locale, Messages> = { tr, en }

/** Sözlükteki her yaprağın noktalı yolu: 'shell.search', 'home.hero.title' … */
type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>
}[keyof T & string]
export type MessageKey = Leaves<Messages>
export type Params = Record<string, string | number>
export type TFunction = (key: MessageKey, params?: Params) => string

/** Intl için BCP 47 etiketi. */
export const intlTag = (locale: Locale) => (locale === 'en' ? 'en-US' : 'tr-TR')

const rulesCache = new Map<Locale, Intl.PluralRules>()
const rules = (locale: Locale) => {
  let r = rulesCache.get(locale)
  if (!r) { r = new Intl.PluralRules(intlTag(locale)); rulesCache.set(locale, r) }
  return r
}

/** Çoğul seçimi (Intl.PluralRules): 1 → one, diğerleri other. Türkçe metinlerde sayıdan sonra ad tekil kalır; çoğul biçimi gerekmez. */
export function plural(locale: Locale, n: number, forms: { one: string; other: string }): string {
  return rules(locale).select(n) === 'one' ? forms.one : forms.other
}

function lookup(dict: Messages, key: string): string | undefined {
  let cur: unknown = dict
  for (const part of key.split('.')) {
    if (cur && typeof cur === 'object' && part in (cur as Record<string, unknown>)) cur = (cur as Record<string, unknown>)[part]
    else return undefined
  }
  return typeof cur === 'string' ? cur : undefined
}

/**
 * Ara değerler: `{n}` → params.n. Çoğul: `{n|ders|dersler}` → n'ye göre biçim; biçim içindeki `#` sayının kendisidir.
 * Eksik parametre olduğu gibi bırakılır (hata görünür olsun).
 */
export function interpolate(locale: Locale, msg: string, params?: Params): string {
  if (!params) return msg
  return msg.replace(/\{(\w+)(?:\|([^|}]*)\|([^}]*))?\}/g, (whole, name: string, one?: string, other?: string) => {
    const v = params[name]
    if (v === undefined) return whole
    if (one === undefined || other === undefined) return String(v)
    return plural(locale, Number(v), { one, other }).replace(/#/g, String(v))
  })
}

/** Anahtar → metin. Eksik çeviri Türkçeye, o da yoksa anahtarın kendisine düşer. */
export function translate(locale: Locale, key: string, params?: Params): string {
  const msg = lookup(dictionaries[locale], key) ?? lookup(dictionaries.tr, key) ?? key
  return interpolate(locale, msg, params)
}

export function createT(locale: Locale): TFunction {
  return (key, params) => translate(locale, key, params)
}

/** Accept-Language başlığından desteklenen ilk dil (q değerine göre). Yoksa null. */
export function parseAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) return null
  const items = header.split(',').map((part, i) => {
    const [tag, ...ps] = part.trim().split(';')
    const q = ps.map((p) => p.trim()).find((p) => p.startsWith('q='))
    const qv = q ? Number(q.slice(2)) : 1
    return { lang: tag.trim().toLowerCase().split('-')[0], q: Number.isFinite(qv) ? qv : 0, i }
  })
  items.sort((a, b) => b.q - a.q || a.i - b.i)
  for (const it of items) if (it.q > 0 && isLocale(it.lang)) return it.lang
  return null
}

/** Dil önceliği: çerez → giriş yapmış kullanıcının users.locale'i → Accept-Language → 'tr'. Saf işlev (test: i18n.test.ts). */
export function resolveLocale(input: { cookie?: string | null; userLocale?: string | null; acceptLanguage?: string | null }): Locale {
  if (isLocale(input.cookie)) return input.cookie
  if (isLocale(input.userLocale)) return input.userLocale
  return parseAcceptLanguage(input.acceptLanguage) ?? DEFAULT_LOCALE
}
