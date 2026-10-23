// Yol haritası: her ders tam bir aşamada, her hedefin dersleri var olan rotalara gider, saatler programlar.ts ile aynı,
// TR/EN dolu; menü, komut paleti ve site haritası kayıtları.
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import sitemap from '@/app/sitemap'
import { NAV } from '@/components/shell/nav-items'
import { STATIC_ITEMS } from './command-palette'
import { MODULES_EN } from './catalog-en'
import { CAREERS, COURSES, STAGES, careerHours } from './kariyer'
import { PROGRAMS } from './programlar'

const APP = join(__dirname, '..', 'app')
function routeExists(href: string): boolean {
  const mod = /^\/moduller\/(.+)$/.exec(href)
  if (mod) return mod[1] in MODULES_EN && existsSync(join(APP, 'moduller', '[slug]', 'page.tsx'))
  return existsSync(join(APP, ...href.split('/').filter(Boolean), 'page.tsx'))
}

describe('yol haritası verisi', () => {
  it('her ders gerçek bir rotaya gider ve TR/EN künyesi dolu', () => {
    for (const [h, c] of Object.entries(COURSES)) {
      expect(routeExists(h), h).toBe(true)
      expect(c.hours, h).toBeGreaterThan(0)
      for (const l of ['tr', 'en'] as const) expect(c[l].title && c[l].topics, `${h} ${l}`).toBeTruthy()
    }
  })
  it('her ders tam bir aşamada', () => {
    const all = STAGES.flatMap((s) => s.courses)
    expect(new Set(all).size).toBe(all.length)
    expect([...all].sort()).toEqual(Object.keys(COURSES).sort())
  })
  it('programlardaki ders saatleriyle aynı', () => {
    for (const p of PROGRAMS) for (const c of p.courses) if (COURSES[c.href]) expect(COURSES[c.href].hours, c.href).toBe(c.hours)
  })
  it('5-10 hedef; her hedefte 3+ sıralı ders, tekrar yok, bilinen dersler, TR/EN dolu', () => {
    expect(CAREERS.length).toBeGreaterThanOrEqual(5)
    expect(CAREERS.length).toBeLessThanOrEqual(10)
    expect(new Set(CAREERS.map((c) => c.slug)).size).toBe(CAREERS.length)
    for (const c of CAREERS) {
      expect(c.core.length, c.slug).toBeGreaterThanOrEqual(3)
      const all = [...c.core, ...c.extra]
      expect(new Set(all).size, `${c.slug}: tekrar yok`).toBe(all.length)
      for (const h of all) expect(COURSES[h], `${c.slug}: ${h}`).toBeDefined()
      expect(careerHours(c)).toBeGreaterThan(50)
      for (const l of ['tr', 'en'] as const) expect(c[l].title && c[l].summary && c[l].work, `${c.slug} ${l}`).toBeTruthy()
    }
  })
  it('her ders en az bir hedefte geçer', () => {
    const used = new Set(CAREERS.flatMap((c) => [...c.core, ...c.extra]))
    for (const h of Object.keys(COURSES)) if (h !== '/laboratuvar') expect(used.has(h), h).toBe(true)
  })
})

describe('yol haritası kayıtları', () => {
  it('menü, komut paleti, site haritası', () => {
    expect(NAV.find((g) => g.tone === 'adults')!.items.map((i) => i.href)).toContain('/yol-haritasi')
    expect(STATIC_ITEMS.map((i) => i.href)).toContain('/yol-haritasi')
    expect(sitemap().some((u) => u.url.endsWith('/yol-haritasi'))).toBe(true)
  })
})
