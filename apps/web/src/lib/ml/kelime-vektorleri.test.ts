// Kelime vektörleri: birlikte geçen kelimeler benzer vektör alır (sayılar sahnedekiyle aynı fonksiyonlardan).
import { describe, expect, it } from 'vitest'
import { KELIME_VEKTORLERI, WORDS, cooc, corpus, cosine, neighbours, ppmi, unitRows, wordIndex } from './kelime-vektorleri'

const vecs = (win: number) => unitRows(ppmi(cooc(corpus(), win)))

describe('kelime vektörleri', () => {
  it('kareler ve kod satırları tutarlı', () => {
    for (const win of [1, 2, 3]) {
      const F = KELIME_VEKTORLERI.run({ word: 2, win })
      expect(F.length).toBeGreaterThan(3)
      expect(F.length).toBeGreaterThanOrEqual(60)
      for (const f of F) expect(f.line).toBeLessThan(KELIME_VEKTORLERI.code.length)
    }
  })
  it('20 cümle, 19 kelime; eş-bulunma matrisi simetrik', () => {
    const S = corpus()
    expect(S).toHaveLength(20)
    const M = cooc(S, 2)
    expect(M).toHaveLength(WORDS.length)
    for (let i = 0; i < M.length; i++) for (let j = 0; j < M.length; j++) expect(M[i][j]).toBe(M[j][i])
  })
  it('anlamca yakın çift (LiDAR–sonar, motor–tekerlek) uzak çiftten (LiDAR–batarya) çok daha benzer', () => {
    const U = vecs(2)
    const [li, so, ba, mo, wh] = ['lidar', 'sonar', 'battery', 'motor', 'wheel'].map(wordIndex)
    const near = cosine(U, li, so), far = cosine(U, li, ba)
    console.log('cos lidar-sonar', near.toFixed(3), 'lidar-battery', far.toFixed(3), 'motor-wheel', cosine(U, mo, wh).toFixed(3))
    expect(near).toBeCloseTo(0.92, 2) // Python çıktısı: 0.92
    expect(far).toBeCloseTo(0.05, 2) // Python çıktısı: 0.05
    expect(near).toBeGreaterThan(far + 0.5)
    expect(cosine(U, mo, wh)).toBeGreaterThan(cosine(U, mo, ba) + 0.5)
  })
  it("her nesnenin en yakın 2 komşusu kendi konusundan; pencere 1'de LiDAR–sonar benzerliği düşer", () => {
    const U = vecs(2)
    for (const id of ['lidar', 'camera', 'sonar', 'motor', 'wheel', 'track', 'battery', 'charger', 'cell']) {
      const a = wordIndex(id)
      for (const [k] of neighbours(U, a, 2)) expect(WORDS[k].topic, id).toBe(WORDS[a].topic)
    }
    const U1 = vecs(1)
    expect(cosine(U1, wordIndex('lidar'), wordIndex('sonar'))).toBeLessThan(cosine(U, wordIndex('lidar'), wordIndex('sonar')))
  })
  it('2B harita: üç konunun ortalama konumları birbirinden uzak (harita kümeleri ayırıyor)', () => {
    const last = KELIME_VEKTORLERI.run({ word: 2, win: 2 }).at(-1)!
    const Y = last.Y!
    const c = [0, 1, 2].map((t) => { const ix = WORDS.map((w, i) => (w.topic === t ? i : -1)).filter((i) => i >= 0); return [ix.reduce((s, i) => s + Y[i][0], 0) / ix.length, ix.reduce((s, i) => s + Y[i][1], 0) / ix.length] })
    for (let a = 0; a < 3; a++) for (let b = a + 1; b < 3; b++) expect(Math.hypot(c[a][0] - c[b][0], c[a][1] - c[b][1])).toBeGreaterThan(0.5)
    expect(last.nn!.map(([k]) => WORDS[k].id)).toEqual(['camera', 'sonar', 'distance'])
  })
})
