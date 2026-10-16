import { describe, expect, it } from 'vitest'
import { classifyPose, countFingers, mathQuestion, mouthOpen, QUIZ, readFace, shuffle, type P } from './gozler-logic'

/** Yapay el: `open` her parmak için (başparmak, işaret, orta, yüzük, serçe) açık/kapalı. */
function hand(open: boolean[]): P[] {
  const lm: P[] = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.9 }))
  lm[0] = { x: 0.5, y: 0.9 }
  lm[1] = { x: 0.42, y: 0.82 }; lm[2] = { x: 0.36, y: 0.74 }; lm[3] = { x: 0.31, y: 0.67 }
  lm[4] = open[0] ? { x: 0.18, y: 0.58 } : { x: 0.47, y: 0.63 }
  ;[[5, 0.45], [9, 0.5], [13, 0.55], [17, 0.6]].forEach(([mcp, x], f) => {
    lm[mcp] = { x, y: 0.6 }; lm[mcp + 1] = { x, y: 0.5 }; lm[mcp + 2] = { x, y: open[f + 1] ? 0.42 : 0.58 }; lm[mcp + 3] = { x, y: open[f + 1] ? 0.35 : 0.62 }
  })
  return lm
}
const rotate = (lm: P[], deg: number): P[] => { const a = (deg * Math.PI) / 180, c = lm[0]; return lm.map((p) => ({ x: c.x + (p.x - c.x) * Math.cos(a) - (p.y - c.y) * Math.sin(a), y: c.y + (p.x - c.x) * Math.sin(a) + (p.y - c.y) * Math.cos(a) })) }

describe('countFingers', () => {
  it('yumruk 0, açık el 5', () => {
    expect(countFingers(hand([false, false, false, false, false]))).toBe(0)
    expect(countFingers(hand([true, true, true, true, true]))).toBe(5)
  })
  it('ara sayılar', () => {
    expect(countFingers(hand([false, true, false, false, false]))).toBe(1)
    expect(countFingers(hand([false, true, true, false, false]))).toBe(2)
    expect(countFingers(hand([true, true, true, false, false]))).toBe(3)
    expect(countFingers(hand([false, true, true, true, true]))).toBe(4)
  })
  it('el dönükse de aynı sayar', () => {
    for (const deg of [30, 90, -60, 180]) expect(countFingers(rotate(hand([false, true, true, true, false]), deg))).toBe(3)
  })
  it('eksik veri 0', () => { expect(countFingers([])).toBe(0) })
})

/** Yapay vücut: burun, omuzlar ve bilekler verilir, gerisi görünür ama ilgisiz. */
function body(lw: [number, number] | null, rw: [number, number] | null): P[] {
  const lm: P[] = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.8, visibility: 0.9 }))
  lm[0] = { x: 0.5, y: 0.3, visibility: 0.99 }
  lm[11] = { x: 0.6, y: 0.45, visibility: 0.99 }; lm[12] = { x: 0.4, y: 0.45, visibility: 0.99 }
  lm[15] = lw ? { x: lw[0], y: lw[1], visibility: 0.95 } : { x: 0.6, y: 0.9, visibility: 0.1 }
  lm[16] = rw ? { x: rw[0], y: rw[1], visibility: 0.95 } : { x: 0.4, y: 0.9, visibility: 0.1 }
  return lm
}
describe('classifyPose', () => {
  it('iki el yukarı', () => { expect(classifyPose(body([0.65, 0.15], [0.35, 0.15]))).toBe('both-up') })
  it('T (uçak)', () => { expect(classifyPose(body([0.9, 0.46], [0.1, 0.44]))).toBe('t-pose') })
  it('sağ el yukarı (kişinin sağı: bilek 16)', () => { expect(classifyPose(body([0.62, 0.7], [0.35, 0.12]))).toBe('right-up') })
  it('sol el yukarı', () => { expect(classifyPose(body([0.66, 0.12], null))).toBe('left-up') })
  it('eller aşağıda: poz yok', () => { expect(classifyPose(body([0.62, 0.75], [0.38, 0.75]))).toBe('none') })
  it('omuzlar görünmüyorsa poz yok', () => { const b = body([0.65, 0.15], [0.35, 0.15]); b[11].visibility = 0.1; expect(classifyPose(b)).toBe('none') })
})

describe('yüz', () => {
  const bs = (o: Record<string, number>) => Object.entries(o).map(([categoryName, score]) => ({ categoryName, score }))
  it('ifadeler', () => {
    expect(readFace(bs({ mouthSmileLeft: 0.8, mouthSmileRight: 0.7 }))).toBe('smile')
    expect(readFace(bs({ jawOpen: 0.6, browInnerUp: 0.5 }))).toBe('surprise')
    expect(readFace(bs({ browDownLeft: 0.6, browDownRight: 0.5 }))).toBe('angry')
    expect(readFace(bs({ eyeBlinkLeft: 0.9, eyeBlinkRight: 0.1 }))).toBe('wink')
    expect(readFace(bs({ eyeBlinkLeft: 0.9, eyeBlinkRight: 0.9 }))).toBe('neutral')
  })
  it('ağız açık', () => { expect(mouthOpen(bs({ jawOpen: 0.5 }))).toBe(true); expect(mouthOpen(bs({ jawOpen: 0.1 }))).toBe(false) })
})

describe('sorular', () => {
  it('parmak hesabı: cevap 0–5, işlem doğru', () => {
    let seed = 1; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    for (let i = 0; i < 300; i++) {
      const q = mathQuestion(rnd)
      expect(q.answer).toBeGreaterThanOrEqual(0); expect(q.answer).toBeLessThanOrEqual(5)
      expect(q.op === '+' ? q.a + q.b : q.a - q.b).toBe(q.answer)
      expect(q.a).toBeGreaterThanOrEqual(0); expect(q.b).toBeGreaterThanOrEqual(0); expect(q.a).toBeLessThanOrEqual(10)
    }
  })
  it('doğru/yanlış: 10 ifade, ikisi de var, iki dilde', () => {
    expect(QUIZ).toHaveLength(10)
    expect(QUIZ.some((q) => q.ok)).toBe(true); expect(QUIZ.some((q) => !q.ok)).toBe(true)
    for (const q of QUIZ) { expect(q.tr.length).toBeGreaterThan(10); expect(q.en.length).toBeGreaterThan(10) }
  })
  it('karıştırma aynı öğeleri korur', () => { expect(shuffle([1, 2, 3, 4, 5]).sort()).toEqual([1, 2, 3, 4, 5]) })
})

describe('oyun listesi', async () => {
  const { GAMES, gameOf } = await import('./robotun-gozleri')
  it('10 oyun, slug benzersiz, her türden en az biri, iki dilde metin', () => {
    expect(GAMES).toHaveLength(10)
    expect(new Set(GAMES.map((g) => g.slug)).size).toBe(10)
    for (const k of ['face', 'hand', 'body'] as const) expect(GAMES.some((g) => g.kind === k)).toBe(true)
    for (const g of GAMES) { expect(gameOf(g.slug)).toBe(g); for (const l of ['tr', 'en'] as const) { expect(g[l].title).toBeTruthy(); expect(g[l].how.length).toBeGreaterThan(40) } }
  })
})
