// OpenCV ve PyTorch dersleri: veri bütünlüğü (TR/EN eşit yapı), araç kayıtları, bitirme teslimleri, Colab defterleri
// (geçerli nbformat v4, her ünitede iki dil) ve kayıtlar (menü, komut paleti, site haritası).
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { NAV } from '@/components/shell/nav-items'
import { STATIC_ITEMS } from '@/lib/command-palette'
import { shell as tr } from '@/i18n/tr/shell'
import { shell as en } from '@/i18n/en/shell'
import sitemap from '@/app/sitemap'
import { CV_COURSE, CV_UNITS } from '@/lib/opencv/course'
import { CV_CAPSTONE } from '@/lib/opencv/project'
import { CV_TOOL_META } from '@/lib/opencv/tools'
import { PT_COURSE, PT_UNITS, notebookHref } from '@/lib/pytorch/course'
import { PT_CAPSTONE } from '@/lib/pytorch/project'
import { PT_VIZ_META } from '@/lib/pytorch/tools'
import type { KursCapstone, KursMeta, KursUnit } from './types'

const tags = (html: string) => (html.match(/<\/?[a-z0-9]+/gi) ?? []).join(' ')
const trChars = /[çğıöşüÇĞİÖŞÜ]/

function checkCourse<T extends string>(name: string, meta: KursMeta, units: readonly KursUnit<T>[], cap: KursCapstone, toolIds: string[], n: number) {
  describe(`${name} dersi`, () => {
    it(`${n} ünite, sıralı; her ünitede en az bir araç; tüm araçlar kullanılıyor`, () => {
      expect(units.map((u) => u.n)).toEqual([...Array(n)].map((_, i) => i + 1))
      for (const u of units) { expect(u.tools.length).toBeGreaterThan(0); for (const t of u.tools) expect(toolIds, `${u.n}: ${t}`).toContain(t) }
      const used = new Set([...units.flatMap((u) => u.tools)])
      for (const t of toolIds) if (t !== 'scanner' && t !== 'digits') expect(used.has(t as T), t).toBe(true)
    })
    it('TR ve EN aynı yapıda; quiz 4 soru, cevaplar aynı; uzun tire yok', () => {
      for (const u of units) {
        for (const l of ['tr', 'en'] as const) {
          const t = u[l]
          expect(t.notes.length, `${u.n} ${l}`).toBeGreaterThan(800)
          expect(t.lab.length).toBeGreaterThan(80)
          expect(t.pitfalls.length).toBeGreaterThanOrEqual(4)
          expect(t.code.length).toBeGreaterThan(0)
          expect(t.quiz).toHaveLength(4)
          for (const q of t.quiz) { expect(q.options).toHaveLength(4); expect(q.answer).toBeGreaterThanOrEqual(0); expect(q.answer).toBeLessThan(4) }
          expect(t.notes + t.se + t.lab, `${u.n} ${l}`).not.toContain('—')
        }
        expect(u.tr.goals.length).toBe(u.en.goals.length)
        expect(u.tr.pitfalls.length).toBe(u.en.pitfalls.length)
        expect(tags(u.tr.notes), `ünite ${u.n}`).toBe(tags(u.en.notes))
        expect(tags(u.tr.se), `ünite ${u.n}`).toBe(tags(u.en.se))
        expect(u.tr.quiz.map((q) => q.answer)).toEqual(u.en.quiz.map((q) => q.answer))
        u.tr.code.forEach((c, i) => expect(c.src.split('\n').length, `ünite ${u.n} kod ${i}`).toBe(u.en.code[i].src.split('\n').length))
      }
    })
    it('İngilizce metinlerde Türkçe karakter yok', () => {
      for (const u of units) {
        const s = [u.en.title, u.en.summary, ...u.en.goals, u.en.lab, ...u.en.pitfalls, ...u.en.quiz.flatMap((q) => [q.q, ...q.options, q.why])]
        for (const x of s) expect(trChars.test(x), `${u.n}: ${x}`).toBe(false)
      }
      for (const x of [meta.en.title, meta.en.lede, meta.en.audience, meta.en.prereq, ...meta.en.outcomes]) expect(trChars.test(x), x).toBe(false)
    })
    it('genel bakış: 16+ hedef kitle, saat, kazanımlar TR/EN eşit', () => {
      expect(meta.tr.audience).toContain('16')
      expect(meta.en.audience).toContain('16')
      expect(meta.hours).toBeGreaterThan(20)
      expect(meta.tr.outcomes.length).toBe(meta.en.outcomes.length)
    })
    it('bitirme projesi: gereksinim/mimari/test/demo TR-EN eşit; teslimler sıralı ve ünitelere bağlı', () => {
      for (const k of ['requirements', 'architecture', 'tests', 'demo'] as const) { expect(cap.tr[k].length, k).toBe(cap.en[k].length); expect(cap.tr[k].length).toBeGreaterThanOrEqual(4) }
      const after = cap.deliverables.map((d) => d.afterUnit)
      expect(after).toEqual([...after].sort((a, b) => a - b))
      expect(after.at(-1)).toBe(n)
      for (const a of after) expect(units.some((u) => u.n === a)).toBe(true)
    })
  })
}

checkCourse('OpenCV', CV_COURSE, CV_UNITS, CV_CAPSTONE, Object.keys(CV_TOOL_META), 12)
checkCourse('PyTorch', PT_COURSE, PT_UNITS, PT_CAPSTONE, Object.keys(PT_VIZ_META), 10)

describe('araç meta verisi', () => {
  it('her aracın TR/EN başlığı ve açıklaması var', () => {
    for (const m of [...Object.values(CV_TOOL_META), ...Object.values(PT_VIZ_META)]) for (const l of ['tr', 'en'] as const) { expect(m[l].title.length).toBeGreaterThan(5); expect(m[l].desc.length).toBeGreaterThan(60) }
  })
})

describe('Colab defterleri', () => {
  const dir = join(process.cwd(), 'public')
  const names = [...PT_UNITS.map((u) => u.notebook!), PT_CAPSTONE.notebook!]
  it('her ünitenin ve bitirmenin defteri var', () => {
    for (const u of PT_UNITS) expect(u.notebook, `ünite ${u.n}`).toBeTruthy()
    expect(new Set(names).size).toBe(names.length)
  })
  it.each(names.flatMap((n) => [[n, 'tr'], [n, 'en']] as const))('%s (%s): geçerli nbformat v4, başlık + Colab talimatı, kod hücreleri', (n, l) => {
    const p = join(dir, notebookHref(n, l))
    expect(existsSync(p), p).toBe(true)
    const nb = JSON.parse(readFileSync(p, 'utf8'))
    expect(nb.nbformat).toBe(4)
    expect(nb.nbformat_minor).toBeGreaterThanOrEqual(4)
    expect(nb.metadata.kernelspec.language).toBe('python')
    expect(nb.cells.length).toBeGreaterThan(5)
    const ids = new Set<string>()
    for (const c of nb.cells) {
      expect(['markdown', 'code']).toContain(c.cell_type)
      expect(Array.isArray(c.source)).toBe(true)
      expect(typeof c.id).toBe('string'); ids.add(c.id)
      if (c.cell_type === 'code') { expect(c.outputs).toEqual([]); expect(c.execution_count).toBeNull() }
      const src = c.source.join('')
      expect(src).not.toMatch(/[«»]/)
    }
    expect(ids.size).toBe(nb.cells.length)
    expect(nb.cells[1].source.join('')).toContain('colab.research.google.com')
    expect(nb.cells.filter((c: { cell_type: string }) => c.cell_type === 'code').length).toBeGreaterThanOrEqual(4)
    if (l === 'en') for (const c of nb.cells) if (c.cell_type === 'markdown') expect(trChars.test(c.source.join('').replace(/Macademia|agirliklar|Dosya/g, ''))).toBe(false)
  })
})

describe('kayıtlar', () => {
  it('"Büyükler için" menüsünde iki ders; i18n anahtarları iki dilde', () => {
    const g = NAV.find((x) => x.key === 'shell.groups.adults')!
    expect(g.items.map((i) => i.href)).toEqual(expect.arrayContaining(['/muhendislik/opencv', '/muhendislik/pytorch']))
    for (const k of ['opencv', 'pytorch'] as const) { expect(tr.nav[k]).toBeTruthy(); expect(en.nav[k]).toBeTruthy(); expect(tr.navDesc[k]).toBeTruthy(); expect(en.navDesc[k]).toBeTruthy() }
  })
  it('komut paletinde ve site haritasında tüm sayfalar', () => {
    const hrefs = STATIC_ITEMS.map((c) => c.href)
    for (const h of ['/muhendislik/opencv', '/muhendislik/pytorch', '/muhendislik/opencv/proje', '/muhendislik/pytorch/proje']) expect(hrefs).toContain(h)
    const urls = sitemap().map((s) => s.url)
    for (const u of [...CV_UNITS.map((x) => `/muhendislik/opencv/unite/${x.n}`), ...PT_UNITS.map((x) => `/muhendislik/pytorch/unite/${x.n}`), '/muhendislik/opencv/proje', '/muhendislik/pytorch/proje']) expect(urls.some((x) => x.endsWith(u)), u).toBe(true)
  })
})
