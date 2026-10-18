// Programlar: altı program, TR/EN eşit, saatler tutarlı, her ders bağlantısı gerçek bir rotaya gider (paralel dallarda
// yazılan dersler PARALLEL_ROUTES izin listesinde), menü/komut paleti/site haritası/mühendislik sayfası kayıtları.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import sitemap from '@/app/sitemap'
import { NAV, isActive } from '@/components/shell/nav-items'
import { STATIC_ITEMS } from './command-palette'
import { MODULES_EN } from './catalog-en'
import { PARALLEL_ROUTES, PROGRAMS, programOf, totalHours } from './programlar'

const APP = join(__dirname, '..', 'app')
function routeExists(href: string): boolean {
  const mod = /^\/moduller\/(.+)$/.exec(href)
  if (mod) return mod[1] in MODULES_EN && existsSync(join(APP, 'moduller', '[slug]', 'page.tsx'))
  return existsSync(join(APP, ...href.split('/').filter(Boolean), 'page.tsx'))
}

describe('programlar verisi', () => {
  it('altı program, beklenen adlar ve benzersiz kimlikler', () => {
    expect(PROGRAMS.map((p) => p.slug)).toEqual(['robotik-programlama', 'gomulu-sistemler', 'iot-ve-veri', 'yapay-zeka-uygulama', 'goruntu-isleme', 'otonom-sistemler'])
    expect(PROGRAMS.map((p) => p.tr.title)).toEqual(['Robotik Programlama', 'Gömülü Sistemler', 'Nesnelerin İnterneti ve Veri', 'Yapay Zekâ Uygulama Geliştirme', 'Görüntü İşleme', 'Otonom Sistemler'])
    expect(programOf('otonom-sistemler')?.tone).toBe('otonom')
  })
  it('her programda 3+ ders, toplam saat, ön koşul, 4+ kazanım, bitirme; TR/EN eşit', () => {
    for (const p of PROGRAMS) {
      expect(p.courses.length, p.slug).toBeGreaterThanOrEqual(3)
      expect(new Set(p.courses.map((c) => c.href)).size, `${p.slug}: ders tekrarı yok`).toBe(p.courses.length)
      expect(totalHours(p), p.slug).toBeGreaterThanOrEqual(80)
      for (const l of ['tr', 'en'] as const) {
        expect(p[l].outcomes.length, `${p.slug} ${l}`).toBeGreaterThanOrEqual(4)
        expect(p[l].prereq.length, `${p.slug} ${l}`).toBeGreaterThan(20)
        expect(p[l].capstone.length, `${p.slug} ${l}`).toBeGreaterThan(40)
      }
      expect(p.tr.outcomes.length).toBe(p.en.outcomes.length)
      for (const c of p.courses) { expect(c.hours).toBeGreaterThan(0); expect(c.tr.title && c.en.title).toBeTruthy() }
    }
  })
  it('aynı ders her programda aynı saatle sayılır', () => {
    const hours = new Map<string, number>()
    for (const p of PROGRAMS) for (const c of p.courses) {
      if (hours.has(c.href)) expect(c.hours, c.href).toBe(hours.get(c.href))
      hours.set(c.href, c.hours)
    }
  })
  it('her ders bağlantısı var olan bir rotaya ya da izinli paralel rotaya gider', () => {
    const allow = new Set<string>(PARALLEL_ROUTES)
    for (const p of PROGRAMS) for (const c of p.courses) expect(routeExists(c.href) || allow.has(c.href), `${p.slug}: ${c.href}`).toBe(true)
    // izin listesindeki her rota gerçekten bir programda kullanılıyor
    const used = new Set(PROGRAMS.flatMap((p) => p.courses.map((c) => c.href)))
    for (const r of PARALLEL_ROUTES) expect(used.has(r), r).toBe(true)
    expect(routeExists('/muhendislik/llm')).toBe(true)
  })
  it('sitede kurum adı geçmez', () => {
    const txt = JSON.stringify(PROGRAMS) + readFileSync(join(APP, 'programlar', 'page.tsx'), 'utf8')
    expect(txt).not.toMatch(/İBB|IBB|İSMEK|ISMEK|Enstitü/)
  })
})

describe('kayıtlar: menü, komut paleti, site haritası, mühendislik sayfası', () => {
  it('Büyükler için menüsünde LLM dersi ve Programlar', () => {
    const adults = NAV.find((g) => g.tone === 'adults')!
    const hrefs = adults.items.map((i) => i.href)
    expect(hrefs).toContain('/muhendislik/llm')
    expect(hrefs).toContain('/programlar')
    expect(isActive('/muhendislik', '/muhendislik/llm/unite/3')).toBe(false)
    expect(isActive('/muhendislik/llm', '/muhendislik/llm/unite/3')).toBe(true)
  })
  it('komut paletinde ve site haritasında', () => {
    const p = STATIC_ITEMS.map((i) => i.href)
    for (const h of ['/muhendislik/llm', '/muhendislik/llm/simulasyon', '/programlar']) expect(p, h).toContain(h)
    const urls = sitemap().map((u) => u.url)
    for (const h of ['/programlar', '/muhendislik/llm', '/muhendislik/llm/proje', '/muhendislik/llm/unite/10']) expect(urls.some((u) => u.endsWith(h)), h).toBe(true)
  })
  it('mühendislik sayfasında LLM ve Programlar kartları', () => {
    const src = readFileSync(join(APP, 'muhendislik', 'page.tsx'), 'utf8')
    expect(src).toContain('href="/muhendislik/llm"')
    expect(src).toContain('href="/programlar"')
  })
})
