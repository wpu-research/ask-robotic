// Ünite tabanlı iki ders (IoT, Sensör-ML): içerik denetimi (check.ts), künye ve bitirme projesi iki dilde eşit, teslimler
// ünitelere sıralı bağlı, bağlantılar geçerli; menü, komut paleti, site haritası ve /muhendislik kartlarında kayıtlı.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { IOT_SIM_META, type IotSimId } from '@/components/iot/sim-meta'
import { SENSOR_SIM_META, type SensorSimId } from '@/components/sensor-ml/sim-meta'
import { NAV, isActive } from '@/components/shell/nav-items'
import sitemap from '@/app/sitemap'
import { STATIC_ITEMS } from '@/lib/command-palette'
import { IOT_CAPSTONE, IOT_META, IOT_RELATED, IOT_UNITS, iotStarter } from '@/lib/iot/course'
import { partBySlug } from '@/lib/muhendislik/catalog'
import { LESSONS } from '@/lib/ml/lessons'
import { datasetById } from '@/lib/ml/veri'
import { SML_CAPSTONE, SML_META, SML_RELATED, SML_UNITS, smlStarter } from '@/lib/sensor-ml/course'
import { checkUnits } from './check'
import type { Capstone, CourseMeta, CourseUnit } from './types'

const TR_CHARS = /[çğıöşüÇĞİÖŞÜ]/

/** Site içi bağlantı bilinen bir rotaya gidiyor mu (ders, ML dersi, laboratuvar, parça kartı). */
function knownHref(h: string): boolean {
  const ml = h.match(/^\/makine-ogrenmesi\/([\w-]+)$/)
  if (ml) return ml[1] === 'veri-setleri' || LESSONS.some((l) => l.slug === ml[1])
  const part = h.match(/^\/muhendislik\/parca\/([\w-]+)$/)
  if (part) return !!partBySlug(part[1])
  const lab = h.match(/^\/laboratuvar\?parca=([\w-]+)$/)
  if (lab) return !!partBySlug(lab[1])?.lab
  const lv = h.match(/^\/muhendislik\/seviye\/(\d+)$/)
  if (lv) return Number(lv[1]) >= 1 && Number(lv[1]) <= 7
  return /^\/(muhendislik(\/(iot|sensor-ml|drone|robotik)(\/.*)?)?|makine-ogrenmesi|laboratuvar)$/.test(h.split('#')[0])
}

function checkCourse<S extends string>(name: string, meta: CourseMeta, units: readonly CourseUnit<S>[], sims: Record<S, unknown>, cap: Capstone, related: Array<{ href: string; tr: string; en: string }>, steps: number[]) {
  describe(name, () => {
    it('üniteler içerik denetiminden geçer', () => {
      expect(checkUnits(units, Object.keys(sims) as S[])).toEqual([])
    })
    it('künye iki dilde eşit; hedef kitle 16+, katılım belgesi', () => {
      expect(meta.tr.outcomes.length).toBe(meta.en.outcomes.length)
      expect(meta.tr.audience).toMatch(/16/)
      expect(meta.en.audience).toMatch(/16/)
      expect(meta.tr.certificate).toContain('Macademia katılım belgesi')
      expect(meta.hours).toBeGreaterThan(20)
      for (const s of [meta.en.title, meta.en.lede, meta.en.audience, meta.en.duration, meta.en.prereq, ...meta.en.outcomes]) expect(TR_CHARS.test(s), s).toBe(false)
      expect(JSON.stringify(meta) + JSON.stringify(cap)).not.toMatch(/İBB|IBB|İSMEK|ISMEK/)
    })
    it('bitirme projesi: gereksinim, mimari, test, demo eşit; teslimler sıralı; notlar %100', () => {
      for (const k of ['requirements', 'architecture', 'tests', 'demo'] as const) {
        expect(cap.tr[k].length, k).toBe(cap.en[k].length)
        expect(cap.tr[k].length, k).toBeGreaterThanOrEqual(3)
      }
      expect(cap.deliverables.map((d) => d.afterUnit)).toEqual(steps)
      expect(Math.max(...steps)).toBe(units.length)
      expect(cap.grading.reduce((a, g) => a + g.pct, 0)).toBe(100)
      for (const p of cap.parts) expect(partBySlug(p), p).toBeTruthy()
      for (const s of [cap.en.title, cap.en.summary, cap.en.scenario, ...cap.en.requirements, ...cap.en.architecture, ...cap.en.tests, ...cap.en.demo, ...cap.deliverables.flatMap((d) => [d.en.title, d.en.deliver]), ...cap.grading.map((g) => g.en)]) expect(TR_CHARS.test(s), s).toBe(false)
    })
    it('bağlantılar bilinen rotalara gider', () => {
      for (const r of [...related, ...units.flatMap((u) => u.related ?? [])]) expect(knownHref(r.href), r.href).toBe(true)
    })
    it('kayıtlı: menü, komut paleti, site haritası, /muhendislik kartı', () => {
      const href = `/muhendislik/${meta.slug}`
      const items = NAV.flatMap((g) => g.items)
      expect(NAV.find((g) => g.key === 'shell.groups.adults')?.items.some((i) => i.href === href)).toBe(true)
      expect(items.filter((i) => i.href === href)).toHaveLength(1)
      expect(isActive(href, `${href}/unite/2`)).toBe(true)
      expect(isActive('/muhendislik', `${href}/unite/2`)).toBe(false)
      expect(STATIC_ITEMS.some((c) => c.href === href)).toBe(true)
      expect(STATIC_ITEMS.some((c) => c.href === `${href}/simulasyon`)).toBe(true)
      const urls = sitemap().map((u) => new URL(u.url).pathname)
      for (const p of [href, `${href}/simulasyon`, `${href}/proje`, ...units.map((u) => `${href}/unite/${u.n}`)]) expect(urls, p).toContain(p)
      const page = readFileSync(join(__dirname, '../../app/muhendislik/page.tsx'), 'utf8')
      expect(page).toContain(`href="${href}"`)
    })
  })
}

checkCourse('IoT dersi', IOT_META, IOT_UNITS, IOT_SIM_META as Record<IotSimId, unknown>, IOT_CAPSTONE, IOT_RELATED, [3, 5, 7, 9, 10])
checkCourse('Sensör-ML dersi', SML_META, SML_UNITS, SENSOR_SIM_META as Record<SensorSimId, unknown>, SML_CAPSTONE, SML_RELATED, [2, 4, 6, 7, 8])

describe('derse özgü', () => {
  it('IoT: 10 ünite; Arduino C++ ve MicroPython kodu; MQTT kütüphaneleri; Wokwi', () => {
    expect(IOT_UNITS).toHaveLength(10)
    const src = IOT_UNITS.flatMap((u) => u.tr.code.map((c) => c.src)).join('\n')
    for (const s of ['WiFi.h', 'PubSubClient', 'umqtt', 'WiFiClientSecure', 'esp_deep_sleep']) expect(src, s).toContain(s)
    expect(IOT_UNITS.filter((u) => u.wokwi).length).toBeGreaterThanOrEqual(5)
    expect(iotStarter('tr').src.split('\n').length).toBe(iotStarter('en').src.split('\n').length)
    expect(TR_CHARS.test(iotStarter('en').src)).toBe(false)
  })
  it('Sensör-ML: 8 ünite; her ünitede tarayıcıda Python ve sera veri seti; ML dersine ve IoT dersine bağlı', () => {
    expect(SML_UNITS).toHaveLength(8)
    for (const u of SML_UNITS) {
      expect(u.py, `ünite ${u.n}`).toBeTruthy()
      expect(u.py!.data).toContain('sera-sensorleri')
      for (const d of u.py!.data) expect(datasetById(d), d).toBeTruthy()
      expect(u.py!.code.map(([c]) => c).join('\n'), `ünite ${u.n}`).toContain("'sera-sensorleri.csv'")
      expect(u.py!.code.map(([c]) => c).join('\n'), `ünite ${u.n}`).not.toMatch(/^\s*(import|from) (pandas|matplotlib|sklearn)/m)
    }
    const rel = [...SML_RELATED, ...SML_UNITS.flatMap((u) => u.related ?? [])].map((r) => r.href)
    expect(rel).toContain('/muhendislik/iot')
    expect(rel.some((h) => h.startsWith('/makine-ogrenmesi/'))).toBe(true)
    expect(smlStarter('tr').src.split('\n').length).toBe(smlStarter('en').src.split('\n').length)
    expect(TR_CHARS.test(smlStarter('en').src)).toBe(false)
    expect(datasetById('sera-sensorleri')?.courses?.[0].href).toBe('/muhendislik/sensor-ml')
  })
})
