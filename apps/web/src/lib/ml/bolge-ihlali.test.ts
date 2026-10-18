// Bölge ihlali: ışın atma bilinen noktalarda doğru; KKD'siz giriş alarm, KKD'li giriş uyarı olarak yakalanır.
import { describe, expect, it } from 'vitest'
import { BOLGE_IHLALI, WORKERS, ZONE, inside, rayHits, simulate } from './bolge-ihlali'

describe('bölge ihlali', () => {
  it('kareler ve kod satırları tutarlı', () => {
    const f = BOLGE_IHLALI.run({ zone: 1, people: 4 })
    expect(f.length).toBeGreaterThan(3)
    for (const x of f) expect(x.line).toBeLessThan(BOLGE_IHLALI.code.length)
  })
  it('ışın atma: bilinen içeri/dışarı noktaları (içbükey girinti dahil)', () => {
    expect(inside(6, 4, ZONE)).toBe(true)
    expect(inside(5, 6, ZONE)).toBe(true)
    expect(inside(3.6, 3.4, ZONE)).toBe(true)
    expect(inside(1, 1, ZONE)).toBe(false)
    expect(inside(11, 7, ZONE)).toBe(false)
    expect(inside(7, 6.2, ZONE)).toBe(false) // konveyör girintisi
    expect(inside(8.5, 2.2, ZONE)).toBe(false)
    expect(rayHits(7, 6.2, ZONE)).toHaveLength(2) // girintide: 2 kesişim, dışarıda
    expect(rayHits(5, 6, ZONE)).toHaveLength(3) // girintiyi aşan ışın: 3 kesişim, içeride
    // kare için klasik sonuç
    const sq: Array<[number, number]> = [[0, 0], [2, 0], [2, 2], [0, 2]]
    expect(inside(1, 1, sq)).toBe(true)
    expect(inside(3, 1, sq)).toBe(false)
  })
  it('varsayılan: KKD\'siz işçi alarm, KKD\'li işçi uyarı; çevrede dolaşanlar olay üretmez', () => {
    const S = simulate(1, 4)
    console.log(S.events.map((e) => `${(e.t / 10).toFixed(1)}s w${e.k + 1} ${e.kind}`).join(' | '))
    expect(S.events.some((e) => e.k === 1 && e.kind === 'alarm')).toBe(true)
    expect(S.events.some((e) => e.k === 2 && e.kind === 'warn')).toBe(true)
    for (const e of S.events) expect(e.kind === 'alarm').toBe(!(WORKERS[e.k].helmet && WORKERS[e.k].vest))
    expect(S.events.some((e) => e.k === 0 || e.k === 3)).toBe(false)
    // alarm anında robot durur
    const a = S.events.find((e) => e.kind === 'alarm')!
    expect(S.frames[a.t].robot).toBe('stop')
  })
  it('büyük bölge ve 6 kişi daha çok olay üretir', () => {
    const base = simulate(1, 4).events.length
    const big = simulate(1.3, 4).events.length
    const six = simulate(1, 6).events.filter((e) => e.kind === 'alarm').length
    console.log('events', base, 'zone1.3', big, 'alarms6', six)
    expect(big).toBeGreaterThan(base)
    expect(six).toBeGreaterThan(simulate(1, 4).events.filter((e) => e.kind === 'alarm').length)
  })
})
