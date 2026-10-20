// Kayıtlar: rota dosyaları, site haritası, menü, komut paleti, mühendislik ana sayfası, programlar listesi, i18n anahtarları.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import sitemap from '@/app/sitemap'
import { NAV, isActive } from '@/components/shell/nav-items'
import { shell as shellEn } from '@/i18n/en/shell'
import { shell as shellTr } from '@/i18n/tr/shell'
import { STATIC_ITEMS } from '../command-palette'
import { PROGRAMS, programOf, totalHours } from '../programlar'
import { ROBOT_COURSE, UNITS } from './course'

const APP = join(__dirname, '..', '..', 'app')
const SRC = join(__dirname, '..', '..')

describe('rotalar', () => {
  it('ana sayfa, simülasyon, proje, ünite sayfası ve düzen dosyası var', () => {
    for (const p of ['page.tsx', 'layout.tsx', 'robot-kolu.css', 'simulasyon/page.tsx', 'proje/page.tsx', 'unite/[n]/page.tsx']) {
      expect(existsSync(join(APP, 'muhendislik', 'robot-kolu', p)), p).toBe(true)
    }
  })
  it('ünite sayfası her üniteyi statik üretir ve kodun geçerli ünite numaraları 1–10', () => {
    const src = readFileSync(join(APP, 'muhendislik', 'robot-kolu', 'unite', '[n]', 'page.tsx'), 'utf8')
    expect(src).toContain('generateStaticParams')
    expect(src).toContain('dynamicParams = false')
    expect(UNITS.map((u) => u.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })
  it('düzen, ESOF 323 / drone / LLM bileşenlerinin stillerini yeniden kullanır', () => {
    const src = readFileSync(join(APP, 'muhendislik', 'robot-kolu', 'layout.tsx'), 'utf8')
    for (const css of ['../robotik/robotik.css', '../drone/drone.css', '../llm/llm.css', './robot-kolu.css']) expect(src).toContain(css)
  })
})

describe('kayıtlar', () => {
  it('site haritasında ana sayfa, simülasyon, proje ve 10 ünite', () => {
    const urls = sitemap().map((u) => u.url)
    for (const h of ['/muhendislik/robot-kolu', '/muhendislik/robot-kolu/simulasyon', '/muhendislik/robot-kolu/proje', ...UNITS.map((u) => `/muhendislik/robot-kolu/unite/${u.n}`)]) {
      expect(urls.some((u) => u.endsWith(h)), h).toBe(true)
    }
    expect(urls.filter((u) => u.includes('/robot-kolu/unite/'))).toHaveLength(10)
  })
  it('Büyükler için menüsünde, doğru işaretlenir ve çevirisi iki dilde var', () => {
    const adults = NAV.find((g) => g.tone === 'adults')!
    const item = adults.items.find((i) => i.href === '/muhendislik/robot-kolu')!
    expect(item).toBeDefined()
    expect(item.key).toBe('shell.nav.robotArm')
    expect(shellTr.nav.robotArm).toBe('Robot kolu dersi')
    expect(shellEn.nav.robotArm).toBe('Robot arm course')
    expect(shellTr.navDesc.robotArm.length).toBeGreaterThan(10)
    expect(shellEn.navDesc.robotArm.length).toBeGreaterThan(10)
    expect(isActive('/muhendislik', '/muhendislik/robot-kolu/unite/3')).toBe(false)
    expect(isActive('/muhendislik/robot-kolu', '/muhendislik/robot-kolu/unite/3')).toBe(true)
    expect(isActive('/muhendislik/robotik', '/muhendislik/robot-kolu/unite/3')).toBe(false)
    expect(isActive('/muhendislik/robot-kolu', '/muhendislik/robotik/hafta/7')).toBe(false)
  })
  it('komut paletinde ders, simülasyonlar ve bitirme; kimlikler benzersiz; markasız', () => {
    const hrefs = STATIC_ITEMS.map((i) => i.href)
    for (const h of ['/muhendislik/robot-kolu', '/muhendislik/robot-kolu/simulasyon', '/muhendislik/robot-kolu/proje']) expect(hrefs, h).toContain(h)
    const ids = STATIC_ITEMS.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
    const mine = STATIC_ITEMS.filter((i) => i.href.startsWith('/muhendislik/robot-kolu'))
    expect(JSON.stringify(mine)).not.toMatch(/KUKA|KRL|WorkVisual/i)
    expect(mine.some((i) => i.keywords?.includes('armscript'))).toBe(true)
  })
  it('mühendislik ana sayfasında ders kartı, ESOF 323 bağı ve marka adı yok', () => {
    const src = readFileSync(join(APP, 'muhendislik', 'page.tsx'), 'utf8')
    expect(src).toContain('href="/muhendislik/robot-kolu"')
    expect(src).toContain('data-testid="eng-robot-kolu"')
    expect(src).not.toMatch(/KUKA|KRL|WorkVisual/i)
  })
  it('programlar listesinde Otonom Sistemler programına bağlı, saatleri tutarlı', () => {
    const p = programOf('otonom-sistemler')!
    const c = p.courses.find((x) => x.href === '/muhendislik/robot-kolu')!
    expect(c).toBeDefined()
    expect(c.hours).toBe(ROBOT_COURSE.hours)
    expect(c.tr.title).toBe(ROBOT_COURSE.tr.title)
    expect(c.en.title).toBe(ROBOT_COURSE.en.title)
    expect(totalHours(p)).toBeGreaterThanOrEqual(80)
    expect(p.tr.outcomes.length).toBe(p.en.outcomes.length)
    expect(PROGRAMS.flatMap((x) => x.courses).filter((x) => x.href === '/muhendislik/robot-kolu').every((x) => x.hours === 40)).toBe(true)
  })
  it('hiçbir robot kolu dosyasında marka adı yok (sayfalar, bileşenler, kütüphane)', () => {
    const files = [
      'app/muhendislik/robot-kolu/page.tsx', 'app/muhendislik/robot-kolu/layout.tsx', 'app/muhendislik/robot-kolu/robot-kolu.css', 'app/muhendislik/robot-kolu/proje/page.tsx',
      'app/muhendislik/robot-kolu/simulasyon/page.tsx', 'app/muhendislik/robot-kolu/unite/[n]/page.tsx',
      'components/robot-kolu/sims.ts', 'components/robot-kolu/scene3d.ts', 'components/robot-kolu/sim-meta.ts', 'components/robot-kolu/robot-sim-box.tsx',
      'lib/robot-kolu/simlogic.ts', 'lib/robot-kolu/playback.ts', 'lib/robot-kolu/course.ts',
    ]
    for (const f of files) expect(readFileSync(join(SRC, f), 'utf8'), f).not.toMatch(/KUKA|KRL\b|WorkVisual/i)
  })
})
