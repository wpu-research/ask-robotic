// Projeler kaydı: bölüm listesi ile kayıt aynı sırada, slug'lar derslerle çakışmıyor, her metin iki dilde dolu, her projenin
// sahnesi var, ilgili dersler gerçekten var, parametre varsayılanları aralıkta ve bir koşu iki dilde ölçüm üretiyor.
import { describe, expect, it } from 'vitest'
import type { Bi } from '../core'
import { LESSONS } from '../lessons'
import { PROJE_BOLUMU, SECTIONS } from '../sections'
import { ML_TEXT } from '../text'
import { defaults } from './core'
import { PROJECTS, projectBySlug } from '.'
import { SCENE_LOADERS } from '@/components/ml/projeler/scenes'

const full = (b: Bi, what: string) => { expect(b.tr.trim().length, `${what} tr`).toBeGreaterThan(0); expect(b.en.trim().length, `${what} en`).toBeGreaterThan(0) }

describe('ML projeleri kaydı', () => {
  it('beş proje, bölüm listesiyle aynı sırada, slug’lar benzersiz ve derslerle çakışmıyor', () => {
    expect(PROJECTS).toHaveLength(5)
    expect(PROJECTS.map((p) => p.slug)).toEqual(PROJE_BOLUMU.slugs)
    expect(new Set(PROJECTS.map((p) => p.slug)).size).toBe(5)
    for (const p of PROJECTS) {
      expect(LESSONS.some((l) => l.slug === p.slug), p.slug).toBe(false)
      expect(SECTIONS.some((s) => s.id === PROJE_BOLUMU.id)).toBe(false)
      expect(projectBySlug(p.slug)).toBe(p)
    }
    full(PROJE_BOLUMU.title, 'bölüm'); full(PROJE_BOLUMU.sub, 'bölüm alt')
  })
  it('her projenin bütün metinleri iki dilde dolu, kodu ve görevleri var', () => {
    for (const p of PROJECTS) {
      for (const k of ['title', 'sub', 'story', 'goal', 'model'] as const) full(p[k], `${p.slug}.${k}`)
      expect(p.steps.length, p.slug).toBeGreaterThanOrEqual(3)
      expect(p.task.length, p.slug).toBeGreaterThanOrEqual(2)
      for (const b of [...p.steps, ...p.task]) full(b, p.slug)
      expect(p.file).toMatch(/\.py$/)
      expect(p.code.length, p.slug).toBeGreaterThanOrEqual(10)
      for (const [c, tr, en] of p.code) { expect(c.length).toBeGreaterThan(0); expect(!!tr, `${p.slug}: ${c}`).toBe(!!en) }
      for (const pr of p.params) { full(pr.label, `${p.slug}.${pr.key}`); expect(pr.value).toBeGreaterThanOrEqual(pr.min); expect(pr.value).toBeLessThanOrEqual(pr.max) }
      expect(p.params.some((pr) => pr.key === 'seed'), `${p.slug} seed`).toBe(true)
      expect(p.perFrame).toBeGreaterThan(0)
    }
  })
  it('ilgili dersler kursta var; her projenin 3B sahnesi kayıtlı', () => {
    for (const p of PROJECTS) {
      expect(p.lessons.length, p.slug).toBeGreaterThan(0)
      for (const s of p.lessons) expect(LESSONS.some((l) => l.slug === s), `${p.slug} → ${s}`).toBe(true)
      expect(typeof SCENE_LOADERS[p.slug], p.slug).toBe('function')
    }
    expect(Object.keys(SCENE_LOADERS).sort()).toEqual(PROJECTS.map((p) => p.slug).sort())
  })
  it('bir koşu: durum ve ölçümler iki dilde, adım atınca değişir, aynı tohum aynı sonuç', () => {
    for (const p of PROJECTS) {
      const a = p.create(defaults(p)), b = p.create(defaults(p))
      expect(a.done(), p.slug).toBe(false)
      for (let i = 0; i < 5; i++) { a.step(p.perFrame); b.step(p.perFrame) }
      const s = a.status()
      expect(s[0].length * s[1].length, p.slug).toBeGreaterThan(0)
      const m = a.metrics()
      expect(m.length, p.slug).toBeGreaterThan(1)
      for (const x of m) { full(x.label, `${p.slug} ölçüm`); expect(x.value[0].length * x.value[1].length, `${p.slug} ${x.label.en}`).toBeGreaterThan(0) }
      for (const c of a.curves?.() ?? []) full(c.label, `${p.slug} eğri`)
      expect(JSON.stringify(b.metrics()), p.slug).toBe(JSON.stringify(m))
    }
  })
  it('sayfa metinleri iki dilde aynı anahtarlara sahip', () => {
    expect(Object.keys(ML_TEXT.en).sort()).toEqual(Object.keys(ML_TEXT.tr).sort())
    for (const k of ['project', 'projects', 'projectCount', 'goal', 'model', 'steps', 'task', 'python', 'projectNote'] as const) {
      expect(ML_TEXT.tr[k].length).toBeGreaterThan(0); expect(ML_TEXT.en[k].length).toBeGreaterThan(0)
    }
  })
})
