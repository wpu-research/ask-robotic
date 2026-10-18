import { describe, expect, it } from 'vitest'
import { SKILL_CHALLENGES, runSkill } from './beceri'
import { b, forever, onStart, project } from './program'
import { motors } from './robot-missions'

describe('sanal beceri', () => {
  for (const ch of SKILL_CHALLENGES) {
    it(`${ch.title}: örnek çözüm bitirir, çarpmaz ve aynı puanı her seferinde alır`, () => {
      const a = runSkill(ch, ch.sample())
      expect(a.error).toBeNull()
      expect(a.finishMs).not.toBeNull()
      expect(a.parts.find((p) => p.label.startsWith('Çarpma'))!.points).toBe(0)
      expect(a.score).toBeGreaterThanOrEqual(60)
      expect(runSkill(ch, ch.sample())).toEqual(a)
    })
    it(`${ch.title}: boş program 0 puan`, () => {
      const r = runSkill(ch, project('boş', [onStart()]))
      expect(r.score).toBe(0)
      expect(r.finishMs).toBeNull()
    })
  }

  it('çarpma cezası düşülür, puan eksiye inmez', () => {
    const ch = SKILL_CHALLENGES[0]
    const r = runSkill(ch, project('duvara', [onStart(motors(100, 100))]))
    expect(r.parts.find((p) => p.label.startsWith('Çarpma'))!.points).toBeLessThan(0)
    expect(r.score).toBeGreaterThanOrEqual(0)
    expect(r.timeMs).toBe(ch.timeLimitS * 1000)
  })

  it('ağır döngü adım sınırına takılır, süre dolmadan biter', () => {
    const heavy = project('ağır', [forever(b('controls_repeat_ext', { i: { TIMES: 1999 }, s: { DO: [b('math_change', { f: { VAR: { id: 'v_x' } }, i: { DELTA: 1 } })] } }), b('mk_pause', { i: { MS: 1 } }))])
    const t0 = Date.now()
    const r = runSkill(SKILL_CHALLENGES[0], heavy)
    expect(Date.now() - t0).toBeLessThan(15000)
    expect(r.score).toBe(0)
  })

  it('küplü sahnede de puan belirlenimci (sunucu ve istemci aynı sonucu bulur)', () => {
    const base = SKILL_CHALLENGES[1]
    const ch = { ...base, scene: () => ({ ...base.scene(), objects: [{ id: 'k', x: 0.5, y: 0.6, color: 'mavi' as const }] }) }
    const a = runSkill(ch, ch.sample())
    expect(runSkill(ch, ch.sample())).toEqual(a)
    expect(a.error).toBeNull()
  })
})
