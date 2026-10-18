import { describe, expect, it } from 'vitest'
import { isActive, NAV } from '@/components/shell/nav-items'
import { DEMO_IMPLS } from '@/components/cv-demo/demo-view'
import sitemap from '@/app/sitemap'
import { STATIC_ITEMS } from './command-palette'
import { FALL_DEFAULTS, FATIGUE_DEFAULTS, POSTURE_DEFAULTS, pyFor, RIPE_DEFAULTS } from './cv-demo-logic'
import { DEMO_TEXT, DEMOS, demoOf, MODEL_LABEL, paramDefaults, SECTOR_LABEL } from './cv-demolar'

const LANGS = ['tr', 'en'] as const

describe('Gerçek Hayat Demoları kaydı', () => {
  it('8 demo, benzersiz slug, her birinin bileşeni var', () => {
    expect(DEMOS).toHaveLength(8)
    expect(new Set(DEMOS.map((d) => d.slug)).size).toBe(8)
    expect(Object.keys(DEMO_IMPLS).sort()).toEqual(DEMOS.map((d) => d.slug).sort())
    expect(demoOf('yok')).toBeUndefined()
  })
  it('her demo iki dilde eksiksiz: başlık, tanıtım, adımlar (eş sayıda), görev, örnek açıklaması, not eşliği', () => {
    for (const d of DEMOS) {
      for (const l of LANGS) {
        const t = d[l]
        for (const k of ['title', 'tagline', 'intro', 'task', 'sample'] as const) expect(t[k].trim(), `${d.slug}.${l}.${k}`).not.toBe('')
        expect(t.steps.length, d.slug).toBeGreaterThanOrEqual(4)
        for (const s of t.steps) expect(s.trim()).not.toBe('')
      }
      expect(d.tr.steps.length, d.slug).toBe(d.en.steps.length)
      expect(!!d.tr.note, d.slug).toBe(!!d.en.note)
      expect(d.tr.title).not.toBe(d.en.title)
      expect(SECTOR_LABEL[d.sector]).toBeDefined(); expect(MODEL_LABEL[d.model]).toBeDefined()
    }
  })
  it('parametreler: iki dilde etiket, varsayılan aralıkta ve adıma uygun', () => {
    for (const d of DEMOS) {
      for (const p of d.params) {
        expect(p.tr && p.en, `${d.slug}.${p.key}`).toBeTruthy()
        expect(p.def).toBeGreaterThanOrEqual(p.min); expect(p.def).toBeLessThanOrEqual(p.max)
        const k = (p.def - p.min) / p.step
        expect(Math.abs(k - Math.round(k)), `${d.slug}.${p.key}`).toBeLessThan(1e-6)
      }
      expect(Object.keys(paramDefaults(d))).toEqual(d.params.map((p) => p.key))
    }
  })
  it('metindeki ve koddaki eşikler mantık varsayılanlarıyla aynı', () => {
    const dus = demoOf('dusme-tespiti')!, yor = demoOf('yorgunluk')!, mey = demoOf('meyve-olgunlugu')!, dur = demoOf('durus-analizi')!
    expect(paramDefaults(dus)).toMatchObject({ speed: FALL_DEFAULTS.speed, angle: FALL_DEFAULTS.angle, frames: FALL_DEFAULTS.frames })
    expect(dus.tr.steps.join(' ')).toContain('1,2 gövde/sn'); expect(dus.en.steps.join(' ')).toContain('1.2 torsos/s')
    expect(dus.py).toContain(`SPEED, ANGLE, N, WINDOW = ${FALL_DEFAULTS.speed}, ${FALL_DEFAULTS.angle}`)
    expect(paramDefaults(yor)).toMatchObject({ ear: FATIGUE_DEFAULTS.ear, mar: FATIGUE_DEFAULTS.mar })
    expect(yor.tr.steps.join(' ')).toContain('EAR < 0,21'); expect(yor.en.steps.join(' ')).toContain('EAR < 0.21')
    expect(paramDefaults(mey)).toMatchObject({ ripe: RIPE_DEFAULTS.ripe, redMax: RIPE_DEFAULTS.redMax })
    expect(mey.py).toContain(`H < ${RIPE_DEFAULTS.redMax}`)
    expect(paramDefaults(dur)).toMatchObject({ tilt: POSTURE_DEFAULTS.tilt, neck: POSTURE_DEFAULTS.neck })
  })
  it('nabız ve yorgunluk demolarında "tıbbi değil / eğitim amaçlı" uyarısı', () => {
    expect(demoOf('nabiz-rppg')!.tr.note).toMatch(/tıbbi değil/)
    expect(demoOf('nabiz-rppg')!.en.note).toMatch(/not medical/)
    expect(demoOf('yorgunluk')!.tr.note).toMatch(/[Ee]ğitim amaçlı/)
  })
  it('Python kodu: her dilde yorumlar seçilir, "||" kalmaz, OpenCV ya da MediaPipe kullanır', () => {
    for (const d of DEMOS) for (const l of LANGS) {
      const py = pyFor(d.py, l)
      expect(py, d.slug).not.toContain('||')
      expect(py, d.slug).toMatch(/import cv2/)
    }
    expect(pyFor(demoOf('trafik-sayaci')!.py, 'en')).toContain('# fixed camera')
  })
  it('sayfa metinleri iki dilde aynı anahtarlar, boş değil', () => {
    expect(Object.keys(DEMO_TEXT.en).sort()).toEqual(Object.keys(DEMO_TEXT.tr).sort())
    for (const l of LANGS) for (const v of Object.values(DEMO_TEXT[l])) expect(String(v).trim()).not.toBe('')
  })
})

describe('Gerçek Hayat Demoları: menü, komut paleti, site haritası', () => {
  it('Büyükler için menüsünde, komut paletinde ve site haritasında', () => {
    const adults = NAV.find((g) => g.tone === 'adults')!
    expect(adults.items.map((i) => i.href)).toContain('/robotun-gozleri/demolar')
    expect(STATIC_ITEMS.map((i) => i.href)).toContain('/robotun-gozleri/demolar')
    const urls = sitemap().map((u) => u.url)
    expect(urls.some((u) => u.endsWith('/robotun-gozleri/demolar'))).toBe(true)
    for (const d of DEMOS) expect(urls.some((u) => u.endsWith(`/robotun-gozleri/demolar/${d.slug}`)), d.slug).toBe(true)
  })
  it('demolarda çocukların "Robotun Gözleri" öğesi değil, demolar öğesi işaretli', () => {
    expect(isActive('/robotun-gozleri', '/robotun-gozleri/demolar/nabiz-rppg')).toBe(false)
    expect(isActive('/robotun-gozleri/demolar', '/robotun-gozleri/demolar/nabiz-rppg')).toBe(true)
    expect(isActive('/robotun-gozleri', '/robotun-gozleri/oyun/yuz-aynasi')).toBe(true)
  })
})
