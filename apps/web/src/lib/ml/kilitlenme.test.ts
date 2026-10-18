// Kilitlenme ve yarış: ters sırada kilitleme bekleme döngüsü üretir; sabit sıra her tohumda biter ve sayaç doğru;
// kilitsiz artırma en az bir tohumda güncelleme kaybeder.
import { describe, expect, it } from 'vitest'
import { KILITLENME, simulate, waitCycle } from './kilitlenme'

const seeds = Array.from({ length: 20 }, (_, i) => i + 1)

describe('kilitlenme ve yarış durumu', () => {
  it('kareler: sayı > 3, her satır kodda var', () => {
    for (const scen of [0, 1, 2]) for (const seed of [1, 7, 11]) {
      const F = KILITLENME.run({ scen, seed })
      expect(F.length).toBeGreaterThan(3)
      for (const f of F) expect(f.line).toBeLessThan(KILITLENME.code.length)
    }
  })
  it('kilitlenme senaryosu (varsayılan tohum 7): iş bitmez, bekleme döngüsü M → B → S → A bulunur', () => {
    const s = simulate(1, 7)
    expect(s.done).toBe(false)
    expect(s.cycle).not.toBeNull()
    expect(new Set(s.cycle)).toEqual(new Set(['M', 'S']))
    expect(s.owner).toEqual({ A: 'M', B: 'S' })
    expect(s.wait).toEqual({ M: 'B', S: 'A' })
    expect(s.counter).toBeLessThan(s.expected)
    expect(KILITLENME.run({ scen: 1, seed: 7 }).at(-1)!.cycle).toBe(true)
    // her takılmada döngü vardır; tohumların bir kısmında takılır, bir kısmında biter
    const dl = seeds.filter((k) => !simulate(1, k).done)
    for (const k of dl) expect(simulate(1, k).cycle).not.toBeNull()
    expect(dl.length).toBeGreaterThan(3)
    expect(dl.length).toBeLessThan(20)
  })
  it('düzeltilmiş senaryo: her tohumda iş biter, sayaç 6', () => {
    for (const k of seeds) {
      const s = simulate(2, k)
      expect(s.done).toBe(true)
      expect(s.cycle).toBeNull()
      expect(s.counter).toBe(6)
    }
  })
  it('yarış: en az bir tohumda sayaç 10’dan az (kayıp güncelleme), sayaç hiç 10’u geçmez', () => {
    const c = seeds.map((k) => simulate(0, k).counter)
    console.log('yarış sayaçları', c.join(' '))
    expect(c.some((x) => x < 10)).toBe(true)
    expect(Math.max(...c)).toBeLessThanOrEqual(10)
    for (const k of seeds) expect(simulate(0, k).done).toBe(true)
  })
  it('döngü denetimi: tek yönlü bekleme döngü değildir', () => {
    expect(waitCycle({ A: 'M' }, { S: 'A' })).toBeNull()
    expect(waitCycle({ A: 'M', B: 'S' }, { M: 'B', S: 'A' })).not.toBeNull()
  })
})
