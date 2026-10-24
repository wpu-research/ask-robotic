import { afterEach, describe, expect, it, vi } from 'vitest'
import { tr } from './tr'
import { en } from './en'
import { createT, interpolate, plural, resolveLocale, translate, type MessageKey } from './index'
import { formatDuration, formatNumber, formatTimeAgo } from './format'
import { hoursLabel, timeAgo } from '@/lib/format'

type Tree = { [k: string]: string | Tree }
function leaves(t: Tree, prefix = ''): [string, string][] {
  return Object.entries(t).flatMap(([k, v]) => (typeof v === 'string' ? [[`${prefix}${k}`, v] as [string, string]] : leaves(v, `${prefix}${k}.`)))
}
const trLeaves = new Map(leaves(tr as unknown as Tree))
const enLeaves = new Map(leaves(en as unknown as Tree))
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)/g)].map((m) => m[1]).sort()

describe('sözlük eşliği (tr ↔ en)', () => {
  it('en, tr\'deki her anahtarı içerir ve fazlası yok', () => {
    expect([...enLeaves.keys()].sort()).toEqual([...trLeaves.keys()].sort())
  })
  it('boş metin yok', () => {
    for (const [k, v] of [...trLeaves, ...enLeaves]) expect(v.trim(), k).not.toBe('')
  })
  it('ara değer adları iki dilde aynı (İngilizcede yalnız çoğul seçici olarak eklenen ad serbest)', () => {
    const pluralOnly = (s: string) => new Set([...s.matchAll(/\{(\w+)\|/g)].map((m) => m[1]).filter((n) => !new RegExp(`\\{${n}\\}`).test(s)))
    for (const [k, v] of trLeaves) {
      const e = enLeaves.get(k)!
      const extra = pluralOnly(e)
      expect([...new Set(placeholders(e))].filter((n) => !extra.has(n) || placeholders(v).includes(n)).sort(), k).toEqual([...new Set(placeholders(v))].sort())
    }
  })
})

describe('çeviri ve ara değerler', () => {
  it('anahtar → metin; eksik anahtar Türkçeye, o da yoksa anahtara düşer', () => {
    expect(translate('tr', 'common.language.label')).toBe('Dil')
    expect(translate('en', 'common.language.label')).toBe('Language')
    expect(translate('en', 'yok.boyle.bir.anahtar')).toBe('yok.boyle.bir.anahtar')
  })
  it('{ad} ara değerleri', () => {
    const t = createT('en')
    expect(t('common.language.switchTo' as MessageKey, { name: 'Türkçe' })).toBe('Change language: Türkçe')
    expect(interpolate('tr', '{n}. hafta · {title}', { n: 3, title: 'Işıklar' })).toBe('3. hafta · Işıklar')
    expect(interpolate('tr', 'eksik {x}', {})).toBe('eksik {x}')
  })
  it('çoğul: {n|one|other} ve # sayı', () => {
    expect(interpolate('en', '{n} {n|lesson|lessons}', { n: 1 })).toBe('1 lesson')
    expect(interpolate('en', '{n} {n|lesson|lessons}', { n: 3 })).toBe('3 lessons')
    expect(interpolate('en', '{n|# day|# days} left', { n: 0 })).toBe('0 days left')
    expect(plural('en', 1, { one: 'a', other: 'b' })).toBe('a')
    expect(plural('en', 2, { one: 'a', other: 'b' })).toBe('b')
  })
})

describe('dil çözümü (öncelik)', () => {
  it('çerez > kullanıcı > tr; tarayıcı dili kullanılmaz', () => {
    expect(resolveLocale({ cookie: 'en', userLocale: 'tr' })).toBe('en')
    expect(resolveLocale({ cookie: 'tr', userLocale: 'en' })).toBe('tr')
    expect(resolveLocale({ cookie: 'fr', userLocale: 'en' })).toBe('en')
    expect(resolveLocale({ userLocale: 'de' })).toBe('tr')
    expect(resolveLocale({})).toBe('tr')
  })
})

const h = vi.hoisted(() => ({ cookie: undefined as string | undefined, accept: null as string | null, user: null as { locale: string } | null, calls: 0 }))
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: (k: string) => (k === 'ask-locale' && h.cookie ? { name: k, value: h.cookie } : undefined) }),
  headers: async () => new Headers(h.accept ? { 'accept-language': h.accept } : {}),
}))
vi.mock('@/lib/auth/current', () => ({ getCurrentUser: async () => { h.calls++; return h.user } }))
vi.mock('@/lib/flags', () => ({ authEnabled: () => true }))

describe('getLocale (sunucu)', () => {
  afterEach(() => { h.cookie = undefined; h.accept = null; h.user = null; h.calls = 0 })
  const load = async () => (await import('./server')).getLocale()
  it('çerez varsa kullanıcıya bakmaz', async () => {
    h.cookie = 'en'; h.user = { locale: 'tr' }
    expect(await load()).toBe('en')
    expect(h.calls).toBe(0)
  })
  it('çerez yoksa users.locale, o da yoksa Türkçe; İngilizce tarayıcı Türkçe görür', async () => {
    h.user = { locale: 'en' }; h.accept = 'tr-TR'
    expect(await load()).toBe('en')
    h.user = null; h.accept = 'en-US,en;q=0.9'
    expect(await load()).toBe('tr')
    h.accept = null
    expect(await load()).toBe('tr')
  })
})

describe('biçimler', () => {
  it('Türkçe çıktı lib/format ile aynı', () => {
    const now = 1_800_000_000_000
    for (const ago of [5_000, 5 * 60_000, 3 * 3600_000, 26 * 3600_000, 5 * 86400_000]) expect(formatTimeAgo('tr', now - ago, now)).toBe(timeAgo(now - ago, now))
    for (const m of [45, 600]) expect(formatDuration('tr', m)).toBe(hoursLabel(m))
  })
  it('İngilizce', () => {
    const now = 1_800_000_000_000
    expect(formatTimeAgo('en', now - 26 * 3600_000, now)).toBe('yesterday')
    expect(formatDuration('en', 45)).toBe('45 min')
    expect(formatNumber('en', 1234.5)).toBe('1,234.5')
    expect(formatNumber('tr', 1234.5)).toBe('1.234,5')
  })
})
