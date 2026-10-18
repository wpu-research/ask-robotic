// Yapay zekâ ajanı: kurallı planlayıcı her görevi adım sınırı içinde bitirir; araç hata dönünce aynı çağrıyı yeniden dener.
import { describe, expect, it } from 'vitest'
import { MAX_STEPS, MAX_TRIES, PLACES, TASKS, YAPAY_ZEKA_AJANI, runAgent } from './yapay-zeka-ajani'

describe('yapay zekâ ajanı', () => {
  it('kareler ve kod satırları tutarlı', () => {
    for (let task = 1; task <= 4; task++) for (const fault of [0, 1]) {
      const F = YAPAY_ZEKA_AJANI.run({ task, fault })
      expect(F.length).toBeGreaterThanOrEqual(60)
      for (const f of F) expect(f.line).toBeLessThan(YAPAY_ZEKA_AJANI.code.length)
    }
  })
  it(`her görev en fazla ${MAX_STEPS} adımda tamamlanır (hatalı ve hatasız)`, () => {
    for (let t = 0; t < TASKS.length; t++) for (const fault of [false, true]) {
      const r = runAgent(t, fault)
      expect(r.done, `görev ${t + 1}`).toBe(true)
      expect(r.decisions).toBeLessThanOrEqual(MAX_STEPS)
      expect(r.steps.at(-1)!.tool).toBeUndefined()
    }
    // görev 2: Python çıktısıyla aynı: 6 araç adımı, 7 çağrı (1 yeniden deneme)
    const r = runAgent(1, true)
    expect(r.steps.filter((s) => s.tool && s.attempt === 1).length).toBe(6)
    expect(r.calls).toBe(7)
  })
  it('hatalı araç dönüşünde aynı çağrıyı yeniden dener ve sonunda başarır', () => {
    const exp = [1, 1, 1, 2]
    for (let t = 0; t < 4; t++) {
      const ok = runAgent(t, false), bad = runAgent(t, true)
      expect(ok.retries).toBe(0)
      expect(bad.retries).toBe(exp[t])
      expect(bad.calls).toBe(ok.calls + exp[t])
      const fails = bad.steps.filter((s) => !s.ok)
      for (const f of fails) {
        const next = bad.steps[bad.steps.indexOf(f) + 1]
        expect(next.tool).toBe(f.tool); expect(next.args).toBe(f.args); expect(next.attempt).toBe(f.attempt + 1)
        expect(next.attempt).toBeLessThanOrEqual(MAX_TRIES)
      }
    }
  })
  it('görevler gerçekten hedefe ulaşır: kutu yükleme alanında bırakılır, şarjda biter', () => {
    const b = runAgent(1, true)
    expect(b.end.pos).toEqual(PLACES.dock.xy)
    expect(b.end.held).toBe(false)
    expect(b.steps.some((s) => s.tool === 'gripper' && s.ok && s.held)).toBe(true)
    expect(runAgent(0, true).end.pos).toEqual(PLACES.charger.xy)
    expect(runAgent(3, true).steps.some((s) => s.tool === 'send_message')).toBe(true)
  })
})
