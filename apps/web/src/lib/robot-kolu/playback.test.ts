// Oynatma: kare ara değeri, uç davranışı, parça olaylarının zamanla uygulanması, çalıştırmayla tutarlılık.
import { describe, expect, it } from 'vitest'
import { runProgram } from './armscript'
import { defaultCell } from './cell'
import { fk } from './kinematics'
import { frameAt, itemsAt } from './playback'
import { sampleCell, sampleSrc } from './samples'

describe('frameAt', () => {
  const r = runProgram(sampleSrc('al-birak', 'en'), { cell: sampleCell('al-birak') })
  it('ilk ve son kare; sınır dışı zamanlar uç kareye sıkışır', () => {
    expect(frameAt(r.frames, -1).q).toEqual(r.frames[0].q)
    expect(frameAt(r.frames, 0).q).toEqual(r.frames[0].q)
    expect(frameAt(r.frames, r.duration + 5).q).toEqual(r.frames[r.frames.length - 1].q)
  })
  it('iki kare arasında doğrusal ara değer; tam kare zamanında karenin kendisi', () => {
    const a = r.frames[10], b = r.frames[11]
    const mid = frameAt(r.frames, (a.t + b.t) / 2)
    mid.q.forEach((v, i) => expect(v).toBeCloseTo((a.q[i] + b.q[i]) / 2, 9))
    frameAt(r.frames, a.t).q.forEach((v, i) => expect(v).toBeCloseTo(a.q[i], 9))
  })
  it('zaman monoton ilerledikçe TCP sürekli (sıçrama yok)', () => {
    let prev = fk(frameAt(r.frames, 0).q).p
    for (let t = 0.02; t <= r.duration; t += 0.02) {
      const p = fk(frameAt(r.frames, t).q).p
      expect(Math.hypot(p[0] - prev[0], p[1] - prev[1], p[2] - prev[2])).toBeLessThan(0.05)
      prev = p
    }
  })
})

describe('itemsAt', () => {
  const cell = defaultCell(false)
  const r = runProgram(sampleSrc('al-birak', 'en'), { cell: sampleCell('al-birak') })
  it('başlangıçta parça A\'da ve tutulmuyor; tutma anından sonra tutuluyor; bırakınca B\'de', () => {
    const s0 = itemsAt(cell.items, r.events, 0)
    expect(s0.held).toBeNull()
    expect(s0.items[0].pos[1]).toBeCloseTo(-0.32, 9)
    const pick = r.events.find((e) => e.pos === null)!, put = r.events.find((e) => e.pos !== null)!
    expect(itemsAt(cell.items, r.events, pick.t).held).toBe('k1')
    expect(itemsAt(cell.items, r.events, (pick.t + put.t) / 2).held).toBe('k1')
    const end = itemsAt(cell.items, r.events, r.duration)
    expect(end.held).toBeNull()
    expect(end.items[0].pos[1]).toBeCloseTo(0.32, 9)
  })
  it('başlangıç listesini değiştirmez', () => {
    const before = JSON.stringify(cell.items)
    itemsAt(cell.items, r.events, r.duration)
    expect(JSON.stringify(cell.items)).toBe(before)
  })
  it('son durum, çalıştırmanın items sonucuyla aynı', () => {
    const end = itemsAt(cell.items, r.events, r.duration + 1).items
    end.forEach((it, i) => it.pos.forEach((v, k) => expect(v).toBeCloseTo(r.items[i].pos[k], 12)))
  })
})
