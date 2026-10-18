// Projelerin eğitim paneli: canlı koşunun report()'u gerçek geçmişi verir. Sütunlar eşit uzunlukta ve adım attıkça büyür,
// ölçüler geçerli aralıkta, aynı tohum aynı rapor, report() ucuz (oynatıcı 200 ms'de bir çağırır) ve CSV/JSON üretilebilir.
import { describe, expect, it } from 'vitest'
import { PROJECTS } from '../projeler'
import { defaults, type ProjectRun } from '../projeler/core'
import { raporCSV, raporJSON, type EgitimRaporu } from './rapor'

/** Projeye göre: kaç iş birimi ilerletilince geçmişte satır olur. */
const UNITS: Record<string, number> = { 'otonom-arac': 3000, 'robot-kol': 1200, 'drone-inis': 600, 'depo-siniflandirma': 1200, 'nokta-bulutu': 1200 }
const KIND: Record<string, EgitimRaporu['kind']> = { 'otonom-arac': 'evrim', 'robot-kol': 'sinir-agi', 'drone-inis': 'pekistirmeli', 'depo-siniflandirma': 'siniflandirma', 'nokta-bulutu': 'kumeleme' }

const lens = (r: EgitimRaporu) => Object.values(r.history.cols).map((v) => v.length)
const advance = (run: ProjectRun, n: number) => { for (let i = 0; i < n && !run.done(); i += 50) run.step(Math.min(50, n - i)) }

describe('projelerin eğitim raporu', () => {
  for (const p of PROJECTS) {
    it(`${p.slug}: geçmiş büyür, sütunlar eşit, aynı tohum aynı rapor`, () => {
      const a = p.create(defaults(p)), b = p.create(defaults(p))
      expect(typeof a.report, p.slug).toBe('function')
      const r0 = a.report!()
      expect(r0.kind).toBe(KIND[p.slug])
      expect(r0.seed).toBe(defaults(p).seed)
      advance(a, UNITS[p.slug]); advance(b, UNITS[p.slug])
      const r1 = a.report!()
      const L = lens(r1)
      expect(new Set(L).size, `${p.slug} sütun uzunlukları ${L}`).toBe(1)
      expect(L[0], p.slug).toBeGreaterThan(lens(r0)[0] ?? 0)
      expect(L[0], p.slug).toBeGreaterThan(1)
      expect(r1.history.cols[r1.history.x], p.slug).toBeDefined()
      // x sütunu artan
      const xs = r1.history.cols[r1.history.x]
      for (let i = 1; i < xs.length; i++) expect(xs[i], p.slug).toBeGreaterThan(xs[i - 1])
      expect(r1.final.length, p.slug).toBeGreaterThan(2)
      for (const f of r1.final) if (f.fmt === 'pct' && Number.isFinite(f.value)) { expect(f.value, `${p.slug} ${f.key}`).toBeGreaterThanOrEqual(0); expect(f.value, `${p.slug} ${f.key}`).toBeLessThanOrEqual(1) }
      expect(r1.charts.length, p.slug).toBeGreaterThan(2)
      expect(JSON.stringify(b.report!()), p.slug).toBe(JSON.stringify(r1))
      const csv = raporCSV(r1).split('\n')
      expect(csv[0].split(',')[0]).toBe(r1.history.x)
      expect(JSON.parse(raporJSON(r1)).seed).toBe(r1.seed)
    })
    it(`${p.slug}: report() ucuz (önbellekli)`, () => {
      const a = p.create(defaults(p))
      advance(a, UNITS[p.slug])
      a.report!()
      const t = performance.now()
      for (let i = 0; i < 100; i++) a.report!()
      expect(performance.now() - t, p.slug).toBeLessThan(200)
    })
  }

  it('robot kol: kayıp düşer, gradyan normu her katman için, doğrulama kaybı var', () => {
    const p = PROJECTS.find((q) => q.slug === 'robot-kol')!
    const a = p.create(defaults(p))
    advance(a, 4000)
    const c = a.report!().history.cols
    expect(c.loss.at(-1)!).toBeLessThan(c.loss[0])
    expect(c.test_err_cm.at(-1)!).toBeLessThan(c.test_err_cm[0])
    for (const k of ['grad_l1', 'grad_l2', 'grad_l3', 'val_loss']) for (const v of c[k]) expect(v, k).toBeGreaterThan(0)
  })
  it('drone: getiri kayan ortalaması ve başarı oranı gerçek bölüm kaydından', () => {
    const p = PROJECTS.find((q) => q.slug === 'drone-inis')!
    const a = p.create(defaults(p))
    advance(a, 3000)
    const c = a.report!().history.cols
    const n = c.episode.length
    expect(n).toBeGreaterThan(60)
    const w = c.return.slice(n - 50)
    expect(c.return_ma[n - 1]).toBeCloseTo(w.reduce((s, v) => s + v, 0) / 50, 9)
    expect(c.success_ma[n - 1]).toBeCloseTo(c.soft.slice(n - 50).reduce((s, v) => s + v, 0) / 50, 9)
    for (let i = 1; i < n; i++) expect(c.epsilon[i]).toBeLessThanOrEqual(c.epsilon[i - 1])
  })
  it('depo: geçmişin son doğruluğu karışıklık matrisinin köşegeniyle aynı', () => {
    const p = PROJECTS.find((q) => q.slug === 'depo-siniflandirma')!
    const a = p.create(defaults(p))
    advance(a, 100000)
    const r = a.report!()
    const m = r.confusion!.m, tot = m.flat().reduce((s, v) => s + v, 0)
    expect(tot).toBe(200)
    expect(r.history.cols.accuracy.at(-1)).toBeCloseTo(m.reduce((s, row, i) => s + row[i], 0) / tot, 12)
    expect(r.charts.some((g) => g.id === 'learning-curve')).toBe(true)
  })
  it('nokta bulutu: bitince siluet ve eps taraması gelir', () => {
    const p = PROJECTS.find((q) => q.slug === 'nokta-bulutu')!
    const a = p.create(defaults(p))
    advance(a, 100000)
    expect(a.done()).toBe(true)
    const r = a.report!()
    const sil = r.final.find((f) => f.key === 'silhouette')!.value
    expect(sil).toBeGreaterThan(0.3); expect(sil).toBeLessThanOrEqual(1)
    expect(r.charts.some((g) => g.id === 'eps-sweep')).toBe(true)
    expect(r.final.find((f) => f.key === 'objects_found')!.value).toBe(5)
  })
})
