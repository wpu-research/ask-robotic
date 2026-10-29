import { describe, expect, it } from 'vitest'
import { buildChannels, readChannel, readAll, NO_HIT, SENSOR_RANGEFINDER } from './sensors'
import { GoalTracker, holds, type Goal } from './goals'
import { Trace } from './trace'

describe('sensors', () => {
  it('kanallar: tek değer ad, 3 değer .x/.y/.z, diğerleri .0/.1', () => {
    const ch = buildChannels(['a', 'konum', 'q', ''], [0, 1, 4, 8], [1, 3, 2, 1], [9, 9, 9, 9])
    expect(ch.map((c) => c.name)).toEqual(['a', 'konum.x', 'konum.y', 'konum.z', 'q.0', 'q.1'])
    expect(ch.map((c) => c.adr)).toEqual([0, 1, 2, 3, 4, 5])
  })
  it('menzil bulucu çarpmayınca uzak değer verir', () => {
    const c = { name: 'm', adr: 0, type: SENSOR_RANGEFINDER }
    expect(readChannel(c, [-1])).toBe(NO_HIT)
    expect(readChannel(c, [0.4])).toBe(0.4)
    expect(readAll([{ name: 'j', adr: 1, type: 9 }], [0, 2.5])).toEqual({ j: 2.5 })
  })
})

describe('goals', () => {
  const g = (o: Partial<Goal>): Goal => ({ id: 'g', tr: '', en: '', ch: 's', cmp: 'ge', a: 1, hold: 0, ...o })
  it('karşılaştırmalar', () => {
    expect(holds(g({ cmp: 'ge', a: 1 }), 1)).toBe(true)
    expect(holds(g({ cmp: 'abs_le', a: 0.3 }), -0.2)).toBe(true)
    expect(holds(g({ cmp: 'abs_ge', a: 3 }), -3.2)).toBe(true)
    expect(holds(g({ cmp: 'between', a: 0.1, b: 0.3 }), 0.2)).toBe(true)
    expect(holds(g({ cmp: 'between', a: 0.1, b: 0.3 }), 0.5)).toBe(false)
    expect(holds(g({}), NaN)).toBe(false)
  })
  it('süre boyunca tutmalı: koşul bozulunca sayaç sıfırlanır, tamamlanan kalıcıdır', () => {
    const t = new GoalTracker([g({ cmp: 'abs_le', a: 0.3, hold: 1 })])
    t.update(0.6, { s: 0.1 }); expect(t.progress(0)).toBeCloseTo(0.6)
    t.update(0.1, { s: 0.9 }); expect(t.state[0].held).toBe(0)
    t.update(0.6, { s: 0.1 }); expect(t.state[0].done).toBe(false)
    expect(t.update(0.6, { s: 0.1 })).toBe(true); expect(t.allDone).toBe(true)
    t.update(1, { s: 9 }); expect(t.allDone).toBe(true)
    t.reset(); expect(t.allDone).toBe(false)
  })
})

describe('trace', () => {
  it('pencere ve nokta sınırı; aralık', () => {
    const tr = new Trace(1, 5)
    for (let i = 0; i < 20; i++) tr.push(i * 0.1, { a: i })
    expect(tr.times.length).toBeLessThanOrEqual(5)
    expect(tr.times[tr.times.length - 1] - tr.times[0]).toBeLessThanOrEqual(1)
    const [lo, hi] = tr.range(['a']); expect(lo).toBeLessThan(hi)
    expect(new Trace().range(['yok'])).toEqual([-1, 1])
    const flat = new Trace(); flat.push(0, { a: 2 }); expect(flat.range(['a'])[0]).toBeLessThan(2)
  })
})
