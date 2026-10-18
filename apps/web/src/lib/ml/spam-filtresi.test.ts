// Spam süzgeci dersi: sayımlar doğru, +1 düzeltmesi sıfırı önler, test doğruluğu yüksek, kılık değiştirmiş spam zorlar.
import { describe, expect, it } from 'vitest'
import { EXAMPLES, SPAM_FILTRESI, WORDS, evaluate, fitSpam, inbox, isSpam, mailScore, wordScore } from './spam-filtresi'

describe('spam-filtresi', () => {
  it('400 e-posta: 200 spam, türler 160/40/160/40, aynı tohum aynı kutu', () => {
    const M = inbox()
    expect(M).toHaveLength(400)
    expect(M.filter((m) => m.spam)).toHaveLength(200)
    expect([0, 1, 2, 3].map((k) => M.filter((m) => m.kind === k).length)).toEqual([160, 40, 160, 40])
    expect(inbox()[17].w).toEqual(M[17].w)
  })
  it('her kelimenin iki dilde karşılığı var, Türkçe kelimeler benzersiz', () => {
    for (const [tr, en] of WORDS) { expect(tr.length).toBeGreaterThan(0); expect(en.length).toBeGreaterThan(0) }
    expect(new Set(WORDS.map((w) => w[0])).size).toBe(WORDS.length)
  })
  it('+1 düzeltmesi: spam’de hiç görülmeyen kelimenin puanı sonlu ve negatif', () => {
    const all = inbox(), M = fitSpam(all.slice(0, 20))
    const w = M.cs.findIndex((c, i) => c === 0 && M.cn[i] > 0)
    expect(w).toBeGreaterThanOrEqual(0)
    const s = wordScore(M, w)!
    expect(Number.isFinite(s)).toBe(true)
    expect(s).toBeLessThan(0)
    expect(wordScore(fitSpam(all.slice(0, 300)), WORDS.findIndex((x) => x[0] === 'tıkla'))!).toBeGreaterThan(0)
  })
  it('eşik 0: açık spam ve kişisel posta hatasız, doğruluk ≥ %78; kılık değiştirmiş spam kaçar', () => {
    const all = inbox(), M = fitSpam(all.slice(0, 300))
    const ev = evaluate(M, all.slice(300))
    console.log('spam', ev.ok, ev.by)
    expect(ev.acc).toBeGreaterThanOrEqual(0.78)
    expect(ev.by[0][0]).toBe(ev.by[0][1])
    expect(ev.by[2][0]).toBe(ev.by[2][1])
    expect(ev.by[1][0] / ev.by[1][1]).toBeLessThan(0.3)
  })
  it('eşik −4: kılık değiştirmiş spam’in çoğu yakalanır ama bültenler spam sayılır (ödünleşim)', () => {
    const all = inbox(), M = fitSpam(all.slice(0, 300)), test = all.slice(300)
    const a = evaluate(M, test, 0), b = evaluate(M, test, -4)
    expect(b.by[1][0] / b.by[1][1]).toBeGreaterThan(0.6)
    expect(b.by[3][0]).toBeLessThan(a.by[3][0])
    expect(SPAM_FILTRESI.run({ esik: -4 }).at(-1)!.cap[1]).toBe(`test: ${b.ok} / 100 correct`)
  })
  it('örnekler: açık spam spam, kişisel normal', () => {
    const M = fitSpam(inbox().slice(0, 300))
    expect(isSpam(M, EXAMPLES[0].w)).toBe(true)
    expect(isSpam(M, EXAMPLES[1].w)).toBe(false)
    expect(mailScore(M, EXAMPLES[0].w)).toBeGreaterThan(mailScore(M, EXAMPLES[2].w))
  })
})
