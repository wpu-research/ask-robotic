import { describe, expect, it } from 'vitest'
import { AI_ACTIVITIES, ALL_AI_ACTIVITIES, lessonKey } from './activities'
import { DEFAULT_STATE, evaluateAi, sanitizeState } from './activity'

describe('AI etkinlikleri (genel sözleşme)', () => {
  it('33 etkinlik, benzersiz kimlik ve anahtar', () => {
    expect(ALL_AI_ACTIVITIES).toHaveLength(33)
    expect(new Set(ALL_AI_ACTIVITIES.map((a) => a.id)).size).toBe(33)
    expect(Object.keys(AI_ACTIVITIES)).toHaveLength(33)
    expect(lessonKey(1)).toBe('ai-muhendisligi:1:1')
    expect(lessonKey(40)).toBe('ai-muhendisligi:8:5')
  })
  it('metin-yalnız dersler etkinliksiz', () => {
    for (const n of [1, 8, 13, 31, 37, 39, 40]) expect(AI_ACTIVITIES[lessonKey(n)]).toBeUndefined()
  })
  for (const a of ALL_AI_ACTIVITIES) {
    describe(a.id, () => {
      it('başlangıç durumu hedeflerin hepsini sağlamaz, her çağrıda yenidir', () => {
        const s1 = a.initial(), s2 = a.initial()
        expect(s1).not.toBe(s2)
        expect(a.goals.length).toBeGreaterThan(0)
        expect(new Set(a.goals.map((g) => g.id)).size).toBe(a.goals.length)
        expect(evaluateAi(a, s1).allPassed).toBe(false)
      })
      it('çözüm tüm hedefleri sağlar', () => {
        const ev = evaluateAi(a, a.solution())
        expect(ev.results.filter((r) => !r.ok).map((r) => r.id)).toEqual([])
        expect(ev.allPassed).toBe(true)
      })
      it('çözüm kaydedilip yüklenince (sanitize) aynı sonuç verir', () => {
        const back = sanitizeState(a.tool, JSON.parse(JSON.stringify(a.solution())), a.initial())
        expect(evaluateAi(a, back).allPassed).toBe(true)
      })
      it('bozuk durum çökmez', () => {
        const ev = evaluateAi(a, { garip: 1 })
        expect(ev.allPassed).toBe(false)
        expect(evaluateAi(a, null).allPassed).toBe(false)
      })
    })
  }
  it('sanitize: yanlış türdeki alanlar varsayılana döner', () => {
    const s = sanitizeState('tokenizer', { text: 5, merges: 12, corpus: 'en', window: 'x' })
    expect(s).toMatchObject({ text: DEFAULT_STATE.tokenizer().text, merges: 12, corpus: 'en', window: 0 })
    expect(sanitizeState('eval', 'saçma').target).toBe('sentiment')
  })
  it('hiçbir etkinlik dış ağa ya da marka adına başvurmaz', () => {
    const blob = JSON.stringify(ALL_AI_ACTIVITIES.map((a) => [a.title, a.intro, a.goals.map((g) => g.label)]))
    expect(blob).not.toMatch(/micro:bit|makecode|arcade|scratch|https?:\/\/|api key|apikey/i)
  })
})
