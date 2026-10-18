// Ders 8: perceptron. Otonom araç her an mesafe (m) ve hız (m/s) okur, uzman sürücü fren yapmış mı yapmamış mı? 80 ölçüm,
// doğrusal olarak ayrılabilir. Her yanlış sınıflanan noktada sınır o noktaya doğru çekilir; bir dönem hatasız geçince durur.
import { cap, fmt, rng, type Frame, type Lesson, type Pt } from './core'
import { B, siniflandirmaBlok, type EgitimRaporu } from './egitim/rapor'

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

/** Gezinme sırası: indeksler tohumla karıştırılır (oynatıcı ve eğitim raporu aynı sırayı kullanır). */
export function visitOrder(n: number, seed: number): number[] {
  const r = rng(seed)
  const order = Array.from({ length: n }, (_, i) => i)
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]] }
  return order
}

/**
 * Eğitim paneli ve Python kodu için: her 4. karar (i % 4 = 3) test için ayrılır, perceptron kalan 60 kararla 20 dönem eğitilir
 * (hatasız dönemden sonra sınır değişmez). Dönem başına hata sayısı, eğitim ve test doğruluğu kaydedilir.
 */
export function perceptronReport({ seed = 1 }: Record<string, number>): EgitimRaporu {
  const X0 = brakeData()
  const isTest = (i: number) => i % 4 === 3
  const trIdx = X0.map((_, i) => i).filter((i) => !isTest(i)), teIdx = X0.map((_, i) => i).filter(isTest)
  const order = visitOrder(trIdx.length, seed).map((k) => trIdx[k])
  let w: [number, number] = [0, 0], b = 0, updates = 0
  let stop: number | null = null
  const sc = (i: number) => w[0] * X0[i].x + w[1] * X0[i].y + b
  const ok = (I: number[]) => I.filter((i) => (X0[i].c ? 1 : -1) * sc(i) > 0).length / I.length
  const h = { epoch: [] as number[], mistakes: [] as number[], acc: [] as number[], test_acc: [] as number[], updates: [] as number[] }
  for (let e = 1; e <= 20; e++) {
    let mistakes = 0
    for (const i of order) {
      const t = X0[i].c ? 1 : -1
      if (t * sc(i) <= 0) { w = [w[0] + t * X0[i].x, w[1] + t * X0[i].y]; b += t; mistakes++; updates++ }
    }
    h.epoch.push(e); h.mistakes.push(mistakes); h.acc.push(ok(trIdx)); h.test_acc.push(ok(teIdx)); h.updates.push(updates)
    if (mistakes === 0 && stop === null) stop = e
  }
  const r: EgitimRaporu = {
    kind: 'siniflandirma', model: 'perceptron: işaret(w·x + b)', seed, hyper: { epochs: 20, train: trIdx.length, test: teIdx.length },
    history: { x: 'epoch', cols: { epoch: h.epoch, mistakes: h.mistakes, acc: h.acc, test_acc: h.test_acc } },
    final: [], charts: [],
  }
  const blk = siniflandirmaBlok({ y: teIdx.map((i) => X0[i].c), pred: teIdx.map((i) => (sc(i) > 0 ? 1 : 0)), scores: teIdx.map(sc), threshold: 0, labels: ['devam / go', 'fren / brake'], pos: B('fren', 'brake'), neg: B('devam', 'go'), prefix: 'test_', title: B('test', 'test') })
  r.final = [
    { key: 'acc', label: B('eğitim doğruluğu', 'training accuracy'), value: h.acc.at(-1)!, fmt: 'pct' },
    ...blk.final,
    { key: 'converged_epoch', label: B('ilk hatasız dönem', 'first error-free epoch'), value: stop ?? NaN, fmt: 'int' },
    { key: 'updates', label: B('toplam güncelleme', 'total updates'), value: updates, fmt: 'int' },
  ]
  r.confusion = blk.confusion
  r.scores = blk.scores
  const marker = stop !== null ? { x: stop, label: B(`hatasız: dönem ${stop}`, `error-free: epoch ${stop}`) } : undefined
  r.charts = [
    { kind: 'bar', id: 'mistakes', title: B('Dönem başına hata (güncelleme)', 'Mistakes (updates) per epoch'), labels: h.epoch.map(String), series: [{ key: 'mistakes', label: B('hata', 'mistakes'), values: h.mistakes, tone: 0 }] },
    { kind: 'line', id: 'acc', title: B('Doğruluk: eğitim ve test', 'Accuracy: training and test'), x: h.epoch, xLabel: B('dönem', 'epoch'), yMin: 0, yMax: 1, live: true, marker,
      series: [{ key: 'acc', label: B('eğitim', 'train'), values: h.acc, tone: 1 }, { key: 'test_acc', label: B('test', 'test'), values: h.test_acc, tone: 0, dash: true }] },
    { kind: 'line', id: 'updates', title: B('Toplam güncelleme sayısı', 'Cumulative updates'), x: h.epoch, xLabel: B('dönem', 'epoch'), live: true, series: [{ key: 'updates', label: B('güncelleme', 'updates'), values: h.updates, tone: 4 }] },
    ...blk.charts,
  ]
  return r
}

/** Oynatıcı satırları (eski numara → kod listesindeki yeni numara): veri yükleme, test ayrımı ve geçmiş satırları eklendi. */
const LINE_MAP: Record<number, number> = { 1: 1, 6: 9, 7: 10, 9: 13 }

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
    ['test = np.arange(len(X)) % 4 == 3', 'her 4. karar test için ayrılır', 'every 4th decision is held out for testing'],
    ['w, b = np.zeros(2), 0.0'],
    ['history, stop = {\'epoch\': [], \'mistakes\': [], \'acc\': [], \'test_acc\': []}, None', 'eğitim geçmişi', 'training history'],
    ['for epoch in range(20):'],
    ['    mistakes = 0'],
    ['    for x, t in zip(X[~test], y[~test]):'],
    ['        if t * (w @ x + b) <= 0:', 'yanlış tarafta', 'wrong side'],
    ['            w += t * x; b += t', 'sınırı noktaya doğru çek', 'pull the border towards it'],
    ['            mistakes += 1'],
    ['    for k, v in zip(history, (epoch + 1, mistakes, (y[~test] * (X[~test] @ w + b) > 0).mean(), (y[test] * (X[test] @ w + b) > 0).mean())): history[k].append(float(v))'],
    ['    if mistakes == 0 and stop is None: stop = epoch + 1', 'hatasız dönem: sınır artık değişmez', 'no mistakes: the border stops moving'],
    ['print(\'w =\', w, \'b =\', b, \'hatasız dönem:\', stop)'],
    ['for k in (\'acc\', \'test_acc\'):', 'son ölçümler tablosu', 'final metrics table'],
    ['    print(f\'{k:<10}{history[k][-1]:>10.4f}\')'],
    ['import csv'],
    ['with open(\'egitim_gecmisi.csv\', \'w\', newline=\'\') as f:', 'geçmişi CSV\'ye yaz', 'write the history to CSV'],
    ['    csv.writer(f).writerows([list(history), *zip(*history.values())])', 'satır başına bir dönem', 'one row per epoch'],
    ['try:'],
    ['    import matplotlib.pyplot as plt', 'varsa grafik çiz', 'plot if available'],
    ['    plt.bar(history[\'epoch\'], history[\'mistakes\']); plt.xlabel(\'epoch\'); plt.ylabel(\'mistakes\'); plt.show()'],
    ['except ImportError:'],
    ['    print(\'matplotlib yok: grafik atlandı\')'],
  ],
  params: [{ key: 'seed', label: { tr: 'Gezinme sırası (tohum)', en: 'Visit order (seed)' }, min: 1, max: 50, step: 1, value: 1 }],
  report: perceptronReport,
  run({ seed = 1 }) {
    const X0 = brakeData()
    // gezinme sırası tohumla karıştırılır
    const X = visitOrder(X0.length, seed).map((i) => X0[i])
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
// Kod listesine veri yükleme, test ayrımı ve geçmiş satırları eklendi: vurgulanan satırlar yeni yerlerine eşlenir.
const runFrames = PERCEPTRON.run
PERCEPTRON.run = (p) => runFrames(p).map((f) => ({ ...f, line: LINE_MAP[f.line] ?? f.line }))
