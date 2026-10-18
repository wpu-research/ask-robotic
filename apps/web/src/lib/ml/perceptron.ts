// Ders 8: perceptron. Otonom araç her an mesafe (m) ve hız (m/s) okur, uzman sürücü fren yapmış mı yapmamış mı? 80 ölçüm,
// doğrusal olarak ayrılabilir. Her yanlış sınıflanan noktada sınır o noktaya doğru çekilir; bir dönem hatasız geçince durur.
import { cap, fmt, rng, type Frame, type Lesson, type Pt, shifted } from './core'

export interface PerFrame extends Frame {
  X: Pt[]
  w: [number, number]
  b: number
  /** O an incelenen nokta ve yanlış mı. */
  at?: number
  wrong?: boolean
  epoch: number
  mistakes: number
  history: number[]
}

/** y = 1 fren, 0 devam (kodda −1). Kural: hız > 0,55·mesafe − 0,8 ise fren; sınırdan biraz uzak noktalar (ayrılabilir). */
export function brakeData(seed = 41, n = 80): Pt[] {
  const r = rng(seed)
  const X: Pt[] = []
  while (X.length < n) {
    const d = 1 + 19 * r(), v = 0.5 + 11 * r()
    const m = v - (0.55 * d - 0.8)
    if (Math.abs(m) < 0.9) continue // sınıra çok yakın noktalar yok: ayrılabilir
    X.push({ x: d, y: v, c: m > 0 ? 1 : 0 })
  }
  return X
}

export const PERCEPTRON: Lesson<PerFrame> = {
  slug: 'perceptron',
  n: 8,
  title: { tr: 'Perceptron: ilk yapay nöron', en: 'Perceptron: the first artificial neuron' },
  sub: { tr: 'Fren mi devam mı? Hatadan öğrenen tek bir doğru', en: 'Brake or keep going? One line that learns from its mistakes' },
  story: {
    tr: 'Otonom bir araç her an iki şey ölçer: öndeki engele mesafe ve kendi hızı. Uzman sürücünün 80 kararını kaydettik: fren ya da devam. Hızlıysan ve engel yakınsa fren; aradaki sınır bir doğru.',
    en: 'An autonomous car measures two things at every moment: the distance to the obstacle ahead and its own speed. We recorded 80 decisions by an expert driver: brake or keep going. Fast and close means brake; the border in between is a line.',
  },
  how: [
    { tr: 'Nöron girdileri ağırlıklarla çarpar, toplar ve işaretine bakar: pozitifse fren.', en: 'The neuron multiplies the inputs by weights, adds them up and looks at the sign: positive means brake.' },
    { tr: 'Noktalar sırayla gezilir. Doğru taraftaysa hiçbir şey olmaz.', en: 'The points are visited in turn. If a point is on the right side, nothing happens.' },
    { tr: 'Yanlış taraftaysa ağırlıklara o nokta eklenir (ya da çıkarılır): sınır noktaya doğru döner ve kayar.', en: 'If it is on the wrong side, the point is added to (or subtracted from) the weights: the border turns and shifts towards it.' },
    { tr: 'Bir dönem hiç hata olmadan geçerse durulur. Veri bir doğruyla ayrılabiliyorsa bu her zaman olur (perceptron yakınsama teoremi).', en: 'When a whole epoch passes without a mistake, it stops. If a line can separate the data, this always happens (the perceptron convergence theorem).' },
  ],
  why: {
    tr: "1958'de Frank Rosenblatt'ın perceptronu ilk öğrenen makineydi. Bugünkü sinir ağlarının her nöronu hâlâ aynı şeyi yapar: ağırlıklı toplam ve bir eşik. Tek başına yalnız doğrusal sınır çizebilir; bir sonraki ders bunun nasıl aşıldığını gösteriyor.",
    en: "Frank Rosenblatt's perceptron of 1958 was the first machine that learned. Every neuron in today's networks still does the same thing: a weighted sum and a threshold. On its own it can only draw a straight border; the next lesson shows how that limit is overcome.",
  },
  file: 'perceptron.py',
  code: [
    ['import numpy as np'],
    ['D = np.genfromtxt(\'surus-fren.csv\', delimiter=\',\', names=True)'],
    ['X, y = np.c_[D[\'mesafe\'], D[\'hiz\']], 2 * D[\'fren\'] - 1', '[mesafe m, hız m/s], +1 fren, −1 devam', '[distance m, speed m/s], +1 brake, −1 go'],
    ['w, b = np.zeros(2), 0.0'],
    ['for epoch in range(20):'],
    ['    mistakes = 0'],
    ['    for x, t in zip(X, y):'],
    ['        if t * (w @ x + b) <= 0:', 'yanlış tarafta', 'wrong side'],
    ['            w += t * x; b += t', 'sınırı noktaya doğru çek', 'pull the border towards it'],
    ['            mistakes += 1'],
    ['    if mistakes == 0: break', 'hepsi doğru: dur', 'all correct: stop'],
  ],
  params: [{ key: 'seed', label: { tr: 'Gezinme sırası (tohum)', en: 'Visit order (seed)' }, min: 1, max: 50, step: 1, value: 1 }],
  run({ seed = 1 }) {
    const X0 = brakeData()
    // gezinme sırası tohumla karıştırılır
    const r = rng(seed)
    const order = X0.map((_, i) => i)
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]] }
    const X = order.map((i) => X0[i])
    let w: [number, number] = [0, 0], b = 0
    const F: PerFrame[] = []
    const history: number[] = []
    const stat = (e: number, m: number) => cap(`dönem ${e} · ${m} hata`, `epoch ${e} · ${m} mistakes`)
    F.push({ X, w, b, epoch: 0, mistakes: 0, history: [], line: 1, cap: cap('80 karar: fren / devam', '80 decisions: brake / go'), stat: cap('başlangıçta sınır yok', 'no border yet'), hold: 1.8 })
    let updates = 0
    for (let e = 1; e <= 20; e++) {
      let mistakes = 0
      X.forEach((p, i) => {
        const t = p.c ? 1 : -1
        const wrong = t * (w[0] * p.x + w[1] * p.y + b) <= 0
        if (wrong) {
          F.push({ X, w, b, at: i, wrong: true, epoch: e, mistakes, history: [...history], line: 6, cap: cap(`yanlış taraf: ${fmt(p.x, 1, 'tr')} m, ${fmt(p.y, 1, 'tr')} m/s`, `wrong side: ${p.x.toFixed(1)} m, ${p.y.toFixed(1)} m/s`), stat: stat(e, mistakes), hold: updates < 6 ? 1.3 : updates < 20 ? 0.5 : 0.18 })
          w = [w[0] + t * p.x, w[1] + t * p.y]; b += t
          mistakes++; updates++
          F.push({ X, w, b, at: i, epoch: e, mistakes, history: [...history], line: 7, cap: cap(`w = (${fmt(w[0], 1, 'tr')}; ${fmt(w[1], 1, 'tr')}) · b = ${b}`, `w = (${w[0].toFixed(1)}, ${w[1].toFixed(1)}) · b = ${b}`), stat: stat(e, mistakes), hold: updates < 6 ? 1.1 : updates < 20 ? 0.4 : 0.15 })
        }
      })
      history.push(mistakes)
      F.push({ X, w, b, epoch: e, mistakes, history: [...history], line: 9, cap: cap(mistakes ? `dönem ${e} bitti` : `dönem ${e}: hatasız, dur`, mistakes ? `epoch ${e} done` : `epoch ${e}: no mistakes, stop`), stat: stat(e, mistakes), hold: mistakes ? 1 : 3 })
      if (!mistakes) break
    }
    return F
  },
}
// Veri CSV'den açılınca 1. satırdan sonra 1 satır eklendi: vurgulanan satırlar kayar.
PERCEPTRON.run = shifted(PERCEPTRON.run, 1, 1)
