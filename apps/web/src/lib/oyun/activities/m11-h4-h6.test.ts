import { describe, expect, it } from 'vitest'
import { M11_H4_H6, M11_H4_H6_ACTIVITIES } from './m11-h4-h6'
import { ACTIVITIES } from './index'
import { disallowedBlocks, evaluateGoals, runScenario } from '../activity'
import { validateProject } from '../project'
import { toolboxJson } from '../blocks'
import { exportProject, parseProject } from '../project'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Başlangıç/çözüm projelerinin JSON dosyaları (content-src/modul-11/hN/projeler/). Yeniden üretmek için: GEN_JSON=1 pnpm vitest run <bu dosya>
const ICERIK = resolve(__dirname, '../../../../../../content-src/modul-11')

describe('Oyun Atölyesi modül 11, hafta 4-6 etkinlikleri', () => {
  it('15 etkinlik (haftada 5), kimlikler benzersiz ve mevcut etkinliklerle çakışmıyor', () => {
    expect(M11_H4_H6_ACTIVITIES).toHaveLength(15)
    const ids = M11_H4_H6_ACTIVITIES.map((a) => a.id)
    expect(new Set(ids).size).toBe(15)
    for (const id of ids) expect(ACTIVITIES.some((a) => a.id === id && !M11_H4_H6_ACTIVITIES.includes(a))).toBe(false)
    expect(M11_H4_H6.map((x) => x.lesson)).toEqual(Array.from({ length: 15 }, (_, i) => 16 + i))
  })

  for (const { activity: a } of M11_H4_H6) {
    describe(a.id, () => {
      it('başlangıç geçerli, yeni nesne, hedefleri var', () => {
        const s1 = a.starter(), s2 = a.starter()
        expect(s1).not.toBe(s2)
        expect(validateProject(JSON.parse(JSON.stringify(s1)))).not.toBeNull()
        expect(a.goals.length).toBeGreaterThanOrEqual(3)
        expect(a.goals.every((g) => !!g.hint)).toBe(true)
        expect(new Set(a.goals.map((g) => g.id)).size).toBe(a.goals.length)
      })
      it('başlangıç hedeflerin tamamını sağlamaz ve hata vermez', () => {
        const ev = evaluateGoals(a, a.starter())
        expect(ev.error).toBeNull()
        expect(ev.allPassed).toBe(false)
      })
      it('çözüm tüm hedefleri sağlar', () => {
        const ev = evaluateGoals(a, a.solution())
        expect(ev.error).toBeNull()
        expect(ev.results.filter((r) => !r.ok).map((r) => r.id)).toEqual([])
      })
      it('çözüm yalnız izinli blokları kullanır; araç kutusu açılır', () => {
        expect(disallowedBlocks(a.solution(), a.allowedBlocks)).toEqual([])
        expect(toolboxJson(a.allowedBlocks).contents.length).toBeGreaterThan(0)
      })
      it('çözüm belirlenimcidir', () => {
        const r1 = runScenario(a.solution(), a.scenario, a.seed ?? 1), r2 = runScenario(a.solution(), a.scenario, a.seed ?? 1)
        expect(r1.engine.snapshot()).toEqual(r2.engine.snapshot())
      })
    })
  }

  describe('hedefler yanlış çözümleri ayırt eder', () => {
    const byId = (id: string) => M11_H4_H6.find((x) => x.activity.id === id)!.activity
    const mut = (id: string, edit: (blocks: any[]) => any[]) => {
      const a = byId(id), p = a.solution()
      const blocks = edit(JSON.parse(JSON.stringify(p.blocks.blocks!.blocks)))
      return { a, p: { ...p, blocks: { ...p.blocks, blocks: { ...p.blocks.blocks!, blocks } } } }
    }
    const failed = (a: any, p: any) => evaluateGoals(a, p).results.filter((r) => !r.ok).map((r) => r.id)

    it('17: koşulsuz takip "uzaktayken durur" hedefini geçemez', () => {
      const { a, p } = mut('ders-17-takip', (bl) => bl.map((x) => (x.type === 'oyun_her_kare' ? { ...x, inputs: { DO: { block: { type: 'sprite_takip', fields: {}, inputs: { S: { block: { type: 'variables_get', fields: { VAR: { id: 'hayalet' } } } }, O: { block: { type: 'variables_get', fields: { VAR: { id: 'kedi' } } } }, N: { block: { type: 'math_number', fields: { NUM: 25 } } } } } } } } : x)))
      expect(failed(a, p)).toContain('durur')
    })
    it('22: eğer bloğu olmayan zıplama çift zıplamayı geçirir (hedef yakalar)', () => {
      const { a, p } = mut('ders-22-ziplama', (bl) => bl.map((x) => (x.type === 'den_dugme' ? { ...x, inputs: { DO: { block: x.inputs.DO.block.inputs.DO0.block } } } : x)))
      expect(failed(a, p)).toContain('tek')
    })
    it('24: her çarpışmada can götüren çözüm "ezme" hedeflerini geçemez', () => {
      const { a, p } = mut('ders-24-dusmanin-ustune-zipla', (bl) => bl.map((x) => (x.type === 'sprite_carpisinca' ? { ...x, inputs: { DO: { block: x.inputs.DO.block.inputs.ELSE.block } } } : x)))
      const f = failed(a, p)
      expect(f).toContain('ezme')
      expect(f).toContain('cansiz')
    })
    it('29: kaçan meyveyi silmeyen düzeltme "kacirma" hedefini geçemez', () => {
      const { a, p } = mut('ders-29-cila-ve-hata-ayiklama', (bl) => bl.map((x) => (x.type === 'oyun_her_kare' ? { ...x, inputs: { DO: { block: { ...x.inputs.DO.block, inputs: { ...x.inputs.DO.block.inputs, DO: { block: { ...x.inputs.DO.block.inputs.DO.block, inputs: { ...x.inputs.DO.block.inputs.DO.block.inputs, DO0: { block: { type: 'oyun_can_degistir', inputs: { N: { block: { type: 'math_number', fields: { NUM: -1 } } } } } } } } } } } } } } : x)))
      expect(failed(a, p)).toContain('kacirma')
    })
  })

  describe('ders proje dosyaları (JSON)', () => {
    for (const { week, slug, activity: a } of M11_H4_H6) {
      const dir = resolve(ICERIK, `h${week}`, 'projeler')
      for (const [ad, uret] of [['baslangic', () => a.starter()], ['cozum', () => a.solution()]] as const) {
        it(`${slug}.${ad}.oyun.json güncel ve içe aktarılabilir`, () => {
          const f = resolve(dir, `${slug}.${ad}.oyun.json`)
          if (process.env.GEN_JSON) { mkdirSync(dir, { recursive: true }); writeFileSync(f, exportProject(uret()) + '\n') }
          expect(existsSync(f)).toBe(true)
          const text = readFileSync(f, 'utf8')
          expect(parseProject(text)).not.toBeNull()
          const norm = (t: string) => JSON.parse(t.replace(/"id": "b\d+"/g, '"id": "b"'))
          expect(norm(text)).toEqual(norm(exportProject(uret())))
        })
      }
    }
  })

  describe('ders metinleri (content-src/modul-11/h4-h6)', () => {
    for (const { week, slug } of M11_H4_H6) {
      it(`${slug}.md biçimi`, () => {
        const f = resolve(ICERIK, `h${week}`, `${slug}.md`)
        expect(existsSync(f)).toBe(true)
        const t = readFileSync(f, 'utf8')
        expect(t.startsWith('# ')).toBe(true)
        const dk = Number(/^süre: (\d+)$/m.exec(t)?.[1])
        expect(dk).toBeGreaterThanOrEqual(15)
        expect(dk).toBeLessThanOrEqual(40)
        for (const h of ['Merak', 'Etkinlik', 'Konuşalım']) {
          const m = new RegExp(`^## ${h}\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, 'm').exec(t)
          expect(m?.[1].trim().length ?? 0).toBeGreaterThan(40)
        }
      })
    }
  })
})
