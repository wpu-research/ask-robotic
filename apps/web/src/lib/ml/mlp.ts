// Ders 9: küçük sinir ağı. Robot arenadaki konumunun pistte mi dışında mı olduğunu öğrenir: iki iç içe hilal (doğrusal olarak
// ayrılamaz). 2 → H (tanh) → 1 (sigmoid), tüm veriyle gradyan inişi ve geri yayılım. Perceptronun çizemediği eğri sınırı çizer.
import { cap, fmt, gauss, rng, type Frame, type Lesson, type Pt, shifted } from './core'
import { B, agirlikHistleri, erkenDurdurma, etkinlesmeHist, gecmisGrafik, siniflandirmaBlok, type EgitimRaporu } from './egitim/rapor'
import { saturatedShare } from './egitim/metrics'

export interface Net { W1: number[][]; b1: number[]; W2: number[]; b2: number }
export interface MlpFrame extends Frame {
  X: Pt[]
  net: Net | null
  step: number
  loss: number[]
  acc: number[]
  /** Hangi katman vurgulansın (ileri / geri). */
  phase?: 'fwd' | 'bwd'
  H: number
  /** Veri kümesi: 0 hilal pist, 1 XOR (4 nokta), 2 dairesel bölge. */
  ds?: number
}

/** İki hilal (scikit-learn make_moons benzeri), gürültülü. c = 1 pistte. */
export function moons(seed = 51, n = 200): Pt[] {
  const r = rng(seed)
  const X: Pt[] = []
  for (let i = 0; i < n; i++) {
    const up = i % 2 === 0
    const t = Math.PI * r()
    const x = up ? Math.cos(t) : 1 - Math.cos(t)
    const y = up ? Math.sin(t) : 0.5 - Math.sin(t)
    X.push({ x: x + 0.12 * gauss(r), y: y + 0.12 * gauss(r), c: up ? 1 : 0 })
  }
  return X
}

/** XOR: iki dokunma sensörü aynıysa 0, farklıysa 1. Birler karşı köşelerde; hiçbir doğru ayıramaz. */
export const xorData = (): Pt[] => [{ x: 0, y: 0, c: 0 }, { x: 0, y: 1, c: 1 }, { x: 1, y: 0, c: 1 }, { x: 1, y: 1, c: 0 }]
/** Arenanın ortasında dairesel güvenli bölge (merkez 0,5; 0,25, yarıçap 0,68): içindeyse 1. */
export function circleData(seed = 33, n = 200): Pt[] {
  const r = rng(seed)
  return Array.from({ length: n }, () => { const x = -0.6 + 2.2 * r(), y = -0.85 + 2.2 * r(); return { x, y, c: Math.hypot(x - 0.5, y - 0.25) < 0.68 ? 1 : 0 } })
}
export const DATASETS = [moons, xorData, circleData] as const

const sig = (z: number) => 1 / (1 + Math.exp(-z))
export function forward(net: Net, x: number, y: number) {
  const h = net.b1.map((b, j) => Math.tanh(net.W1[0][j] * x + net.W1[1][j] * y + b))
  const p = sig(h.reduce((s, hj, j) => s + hj * net.W2[j], net.b2))
  return { h, p }
}
const clone = (n: Net): Net => ({ W1: n.W1.map((r) => [...r]), b1: [...n.b1], W2: [...n.W2], b2: n.b2 })

export function train(X: Pt[], H: number, lr: number, steps: number, every: number, seed = 0) {
  const r = rng(seed + 1)
  const net: Net = { W1: [0, 1].map(() => Array.from({ length: H }, () => gauss(r))), b1: new Array(H).fill(0), W2: Array.from({ length: H }, () => gauss(r)), b2: 0 }
  const snaps: Array<{ step: number; net: Net; loss: number; acc: number }> = []
  const N = X.length
  for (let s = 0; s <= steps; s++) {
    const gW1 = [new Array(H).fill(0), new Array(H).fill(0)], gb1 = new Array(H).fill(0), gW2 = new Array(H).fill(0)
    let gb2 = 0, loss = 0, ok = 0
    for (const q of X) {
      const { h, p } = forward(net, q.x, q.y)
      loss += -(q.c ? Math.log(p + 1e-12) : Math.log(1 - p + 1e-12))
      if ((p > 0.5 ? 1 : 0) === q.c) ok++
      const g = (p - q.c) / N
      for (let j = 0; j < H; j++) {
        gW2[j] += h[j] * g
        const gh = g * net.W2[j] * (1 - h[j] * h[j])
        gW1[0][j] += q.x * gh; gW1[1][j] += q.y * gh; gb1[j] += gh
      }
      gb2 += g
    }
    if (s % every === 0) snaps.push({ step: s, net: clone(net), loss: loss / N, acc: ok / N })
    for (let j = 0; j < H; j++) { net.W2[j] -= lr * gW2[j]; net.W1[0][j] -= lr * gW1[0][j]; net.W1[1][j] -= lr * gW1[1][j]; net.b1[j] -= lr * gb1[j] }
    net.b2 -= lr * gb2
  }
  return snaps
}

/**
 * Eğitim paneli için aynı ağ ve aynı başlangıç (train ile aynı tohum), ama her 5. nokta doğrulamaya ayrılır (sınıflar sırayla
 * geldiği için 4 değil: her 4. nokta hep aynı sınıftan olurdu) ve gradyan yalnız eğitim noktalarından gelir (Python kodu da böyle). XOR'un 4 noktası bölünmez: doğrulama = eğitim. Her `every` adımda kayıp,
 * doğruluk ve katman gradyan normları; dört anda ağırlık kopyası; başta ve sonda gizli katman etkinleşmeleri kaydedilir.
 */
export function trainWithHistory(X: Pt[], H: number, lr: number, steps: number, every: number, seed = 0) {
  const r = rng(seed + 1)
  const net: Net = { W1: [0, 1].map(() => Array.from({ length: H }, () => gauss(r))), b1: new Array(H).fill(0), W2: Array.from({ length: H }, () => gauss(r)), b2: 0 }
  const split = X.length > 8
  const isVal = X.map((_, i) => split && i % 5 === 4)
  const nTr = isVal.filter((v) => !v).length
  const h = { step: [] as number[], loss: [] as number[], val_loss: [] as number[], acc: [] as number[], val_acc: [] as number[], grad_W1: [] as number[], grad_W2: [] as number[] }
  const wSnaps: Array<{ label: string; layers: number[][] }> = []
  const snapAt = new Set([0, Math.round(steps / 4), Math.round(steps / 2), steps])
  const acts: Array<{ label: string; values: number[] }> = []
  let lastActs: number[][] = []
  for (let s = 0; s <= steps; s++) {
    const gW1 = [new Array(H).fill(0), new Array(H).fill(0)], gb1 = new Array(H).fill(0), gW2 = new Array(H).fill(0)
    let gb2 = 0, lt = 0, lv = 0, ot = 0, ov = 0
    const record = s % every === 0 || s === steps
    const A: number[][] = []
    X.forEach((q, i) => {
      const { h: hid, p } = forward(net, q.x, q.y)
      if (record) A.push(hid)
      const ce = -(q.c ? Math.log(p + 1e-12) : Math.log(1 - p + 1e-12)), ok = (p > 0.5 ? 1 : 0) === q.c ? 1 : 0
      if (isVal[i]) { lv += ce; ov += ok; return }
      lt += ce; ot += ok
      const g = (p - q.c) / nTr
      for (let j = 0; j < H; j++) {
        gW2[j] += hid[j] * g
        const gh = g * net.W2[j] * (1 - hid[j] * hid[j])
        gW1[0][j] += q.x * gh; gW1[1][j] += q.y * gh; gb1[j] += gh
      }
      gb2 += g
    })
    if (record) {
      const nV = split ? X.length - nTr : nTr
      if (!split) { lv = lt; ov = ot }
      h.step.push(s); h.loss.push(lt / nTr); h.val_loss.push(lv / nV); h.acc.push(ot / nTr); h.val_acc.push(ov / nV)
      h.grad_W1.push(Math.hypot(...gW1[0], ...gW1[1])); h.grad_W2.push(Math.hypot(...gW2))
      if (s === 0) acts.push({ label: '0', values: A.flat() })
      lastActs = A
    }
    if (snapAt.has(s)) wSnaps.push({ label: `${s}`, layers: [[...net.W1[0], ...net.W1[1]], [...net.W2]] })
    for (let j = 0; j < H; j++) { net.W2[j] -= lr * gW2[j]; net.W1[0][j] -= lr * gW1[0][j]; net.W1[1][j] -= lr * gW1[1][j]; net.b1[j] -= lr * gb1[j] }
    net.b2 -= lr * gb2
  }
  acts.push({ label: `${steps}`, values: lastActs.flat() })
  return { net, h, isVal, wSnaps, acts, lastActs, split }
}

/** Sinir ağı dersinin eğitim raporu. */
export function mlpReport({ H = 8, lr = 0.5, veri = 0 }: Record<string, number>): EgitimRaporu {
  const ds = Math.max(0, Math.min(2, Math.round(veri)))
  const X = DATASETS[ds]()
  const t = trainWithHistory(X, H, lr, 3000, 75)
  const { h } = t
  const vi = X.map((_, i) => i).filter((i) => !t.split || t.isVal[i])
  const p = vi.map((i) => forward(t.net, X[i].x, X[i].y).p)
  const y = vi.map((i) => X[i].c)
  const blk = siniflandirmaBlok({ y, pred: p.map((v) => (v > 0.5 ? 1 : 0)), scores: p, labels: ['dışında', 'pistte'], pos: B('pistte', 'on track'), neg: B('dışında', 'off track'), prefix: 'val_', title: B('doğrulama', 'validation') })
  const r: EgitimRaporu = {
    kind: 'sinir-agi', model: `MLP 2-${H}-1 (tanh, sigmoid)`, seed: 1, hyper: { H, lr, steps: 3000, veri: ['hilal', 'XOR', 'daire'][ds], train: X.length - (t.split ? vi.length : 0), val: t.split ? vi.length : 0 },
    history: { x: 'step', cols: h }, final: [], charts: [],
  }
  const best = erkenDurdurma(h.step, h.val_loss)
  r.final = [
    { key: 'loss', label: B('eğitim kaybı', 'training loss'), value: h.loss.at(-1)!, fmt: 3 },
    { key: 'val_loss', label: B('doğrulama kaybı', 'validation loss'), value: h.val_loss.at(-1)!, fmt: 3 },
    { key: 'acc', label: B('eğitim doğruluğu', 'training accuracy'), value: h.acc.at(-1)!, fmt: 'pct' },
    ...blk.final,
    { key: 'gap', label: B('aşırı öğrenme farkı (doğr. − eğit. kaybı)', 'overfitting gap (val − train loss)'), value: h.val_loss.at(-1)! - h.loss.at(-1)!, fmt: 3 },
    { key: 'saturated', label: B('doymuş tanh payı (|a| > 0,99)', 'saturated tanh share (|a| > 0.99)'), value: saturatedShare(t.lastActs), fmt: 'pct' },
  ]
  r.confusion = blk.confusion
  r.scores = blk.scores
  r.charts = [
    gecmisGrafik(r, 'loss', B('Kayıp (çapraz entropi)', 'Loss (cross-entropy)'), [['loss', B('eğitim', 'train'), 1], ['val_loss', B('doğrulama', 'validation'), 0, true]], { marker: best, yLabel: B('kayıp', 'loss') }),
    gecmisGrafik(r, 'acc', B('Doğruluk', 'Accuracy'), [['acc', B('eğitim', 'train'), 1], ['val_acc', B('doğrulama', 'validation'), 0, true]], { yMin: 0, yMax: 1 }),
    gecmisGrafik(r, 'grad', B('Katman başına gradyan normu', 'Gradient norm per layer'), [['grad_W1', B('W1 (giriş → gizli)', 'W1 (input → hidden)'), 2], ['grad_W2', B('W2 (gizli → çıkış)', 'W2 (hidden → output)'), 4]], { logY: true, note: B(`Öğrenme oranı sabit: ${String(lr).replace('.', ',')}. Normlar küçüldükçe ağ bir çukura yerleşir.`, `Learning rate is constant: ${lr}. As the norms shrink the network settles into a minimum.`) }),
    ...agirlikHistleri(t.wSnaps, ['W1', 'W2'], 20),
    { ...etkinlesmeHist(t.acts, -1, 1, 20), note: B('Gizli katman (tanh). Uçlara (±1) yığılma doymuş nöron demektir.', 'Hidden layer (tanh). Piling up at ±1 means saturated neurons.') },
    ...blk.charts,
  ]
  return r
}

export const MLP: Lesson<MlpFrame> = {
  slug: 'sinir-agi',
  n: 9,
  title: { tr: 'Küçük bir sinir ağı', en: 'A small neural network' },
  sub: { tr: 'Gizli katman ve geri yayılım: doğrunun çizemediği sınır', en: 'A hidden layer and backpropagation: the border a line cannot draw' },
  story: {
    tr: 'Robot arenada 200 konumda durdu ve her seferinde pistte mi dışında mı olduğunu kaydetti. Pist kıvrımlı: iki iç içe hilal. Tek bir doğru (perceptron) bunu ayıramaz; gizli bir katman gerekir.',
    en: 'The robot stopped at 200 positions in the arena and each time recorded whether it was on the track or off it. The track is curved: two interlocking crescents. A single line (a perceptron) cannot separate them; it takes a hidden layer.',
  },
  how: [
    { tr: 'Gizli katmandaki her nöron girdinin bir doğrusal birleşimini tanh ile büker. Çıkış nöronu bu bükülmüş özellikleri birleştirip bir olasılık verir.', en: 'Each hidden neuron bends a linear combination of the inputs with tanh. The output neuron combines these bent features into a probability.' },
    { tr: 'Kayıp (çapraz entropi), yanlış ve emin tahminleri ağır cezalandırır.', en: 'The loss (cross-entropy) punishes confident wrong predictions heavily.' },
    { tr: 'Geri yayılım, kaybın her ağırlığa göre türevini zincir kuralıyla çıkıştan girişe doğru hesaplar. Her ağırlık türevin tersine küçük bir adım atar.', en: 'Backpropagation computes the derivative of the loss with respect to every weight with the chain rule, from the output back to the input. Every weight takes a small step against its derivative.' },
    { tr: 'Sınır her adımda biraz daha kıvrılır. Gizli nöron sayısını 2’ye indir: sınır yeterince bükülemez.', en: 'The border curls a little more with every step. Drop the hidden neurons to 2 and the border cannot bend enough.' },
    { tr: 'Şunu dene: veriyi 1 (XOR) yap. Dört nokta var; aynı girdiler 0, farklı girdiler 1 verir ve birler karşı köşelerde durur. Tek gizli nöronla ağ en fazla 3/4 doğru yapar. 2 nöron kâğıt üstünde yeter ama bu başlangıçla yerel bir çukura takılır ve 2/4’te kalır; 3 nöron 4/4’e ulaşır. Sonra veriyi 2 (daire) yap: 1 nöron daireyi çevreleyemez, 3 nöron üçgenle, 8 nöron neredeyse yuvarlak bir çitle çevreler.', en: 'Try this: set the data to 1 (XOR). There are four points; equal inputs give 0, different inputs give 1, and the ones sit in opposite corners. With one hidden neuron the network gets at most 3/4 right. Two neurons are enough on paper, but from this start they get stuck in a local dip at 2/4; three neurons reach 4/4. Then set the data to 2 (circle): one neuron cannot surround it, three make a triangle and eight build an almost round fence.' },
  ],
  why: {
    tr: 'Bu, derin öğrenmenin en küçük hâlidir. Görüntüden nesne tanıyan ağlar da, robot kolunu yöneten politikalar da, dil modelleri de aynı üç şeyi yapar: ileri hesap, kayıp, geri yayılım. Fark yalnız katman ve ağırlık sayısındadır.',
    en: 'This is deep learning at its smallest. Networks that recognise objects in images, policies that steer robot arms and language models all do the same three things: a forward pass, a loss and backpropagation. The difference is only the number of layers and weights.',
  },
  file: 'sinir_agi.py',
  code: [
    ['import numpy as np'],
    ['D = np.genfromtxt(\'pist-konum.csv\', delimiter=\',\', names=True)'],
    ['X, y = np.c_[D[\'x\'], D[\'y\']], D[\'pistte\']', '200 konum, y = 1 pistte', '200 positions, y = 1 on track'],
    ['rng, lr, H = np.random.default_rng(0), 0.5, 8', 'H gizli nöron', 'H hidden neurons'],
    ['W1, b1 = rng.normal(size=(2, H)), np.zeros(H)'],
    ['W2, b2 = rng.normal(size=H), 0.0'],
    ['val = np.arange(len(X)) % 5 == 4', 'her 5. konum doğrulamaya ayrılır', 'every 5th position is held out for validation'],
    ['history = {k: [] for k in (\'step\', \'loss\', \'val_loss\', \'acc\', \'val_acc\', \'grad_W1\', \'grad_W2\')}', 'eğitim geçmişi', 'training history'],
    ['for step in range(3001):'],
    ['    h = np.tanh(X @ W1 + b1)', 'gizli katman', 'hidden layer'],
    ['    p = 1 / (1 + np.exp(-(h @ W2 + b2)))', 'pistte olma olasılığı', 'probability of being on track'],
    ['    ce = -(y * np.log(p) + (1 - y) * np.log(1 - p)); loss = ce[~val].mean()', 'çapraz entropi (eğitim)', 'cross-entropy (training)'],
    ['    g = np.where(val, 0, p - y) / (~val).sum()', 'kaybın çıkışa göre türevi', 'derivative at the output'],
    ['    gh = np.outer(g, W2) * (1 - h ** 2)', 'geri yayılım: gizli katmana', 'backprop to the hidden layer'],
    ['    gW2, gW1 = h.T @ g, X.T @ gh', 'katman gradyanları', 'layer gradients'],
    ['    if step % 75 == 0:', 'her 75 adımda bir kaydet', 'record every 75 steps'],
    ['        ok = (p > 0.5) == y; [history[k].append(float(v)) for k, v in zip(history, (step, loss, ce[val].mean(), ok[~val].mean(), ok[val].mean(), np.linalg.norm(gW1), np.linalg.norm(gW2)))]'],
    ['    W2 -= lr * gW2; b2 -= lr * g.sum()'],
    ['    W1 -= lr * gW1; b1 -= lr * gh.sum(0)'],
    ['for k in (\'loss\', \'val_loss\', \'acc\', \'val_acc\'):', 'son ölçümler tablosu', 'final metrics table'],
    ['    print(f\'{k:<10}{history[k][-1]:>10.4f}\')'],
    ['print(\'aşırı öğrenme farkı (val_loss - loss):\', round(history[\'val_loss\'][-1] - history[\'loss\'][-1], 4))'],
    ['import csv'],
    ['with open(\'egitim_gecmisi.csv\', \'w\', newline=\'\') as f:', 'geçmişi CSV\'ye yaz', 'write the history to CSV'],
    ['    csv.writer(f).writerows([list(history), *zip(*history.values())])', 'satır başına bir kayıt', 'one row per record'],
    ['try:'],
    ['    import matplotlib.pyplot as plt', 'varsa grafik çiz', 'plot if available'],
    ['    fig, (a, b) = plt.subplots(1, 2, figsize=(9, 3.5))'],
    ['    for k in (\'loss\', \'val_loss\'): a.plot(history[\'step\'], history[k], label=k)'],
    ['    for k in (\'acc\', \'val_acc\'): b.plot(history[\'step\'], history[k], label=k)'],
    ['    a.legend(); b.legend(); a.set_xlabel(\'step\'); b.set_xlabel(\'step\'); plt.show()'],
    ['except ImportError:'],
    ['    print(\'matplotlib yok: grafik atlandı\')'],
  ],
  params: [
    { key: 'H', label: { tr: 'Gizli nöron sayısı', en: 'Hidden neurons' }, min: 1, max: 16, step: 1, value: 8 },
    { key: 'lr', label: { tr: 'Öğrenme oranı', en: 'Learning rate' }, min: 0.05, max: 2, step: 0.05, value: 0.5 },
    { key: 'veri', label: { tr: 'Veri: 0 hilal, 1 XOR, 2 daire', en: 'Data: 0 moons, 1 XOR, 2 circle' }, min: 0, max: 2, step: 1, value: 0 },
  ],
  report: mlpReport,
  run({ H = 8, lr = 0.5, veri = 0 }) {
    const ds = Math.max(0, Math.min(2, Math.round(veri)))
    const X = DATASETS[ds]()
    const snaps = train(X, H, lr, 3000, 75)
    const F: MlpFrame[] = []
    const stat = (s: { loss: number; acc: number }) => cap(`kayıp ${fmt(s.loss, 3, 'tr')} · doğruluk %${Math.round(s.acc * 100)}`, `loss ${s.loss.toFixed(3)} · accuracy ${Math.round(s.acc * 100)}%`)
    F.push({ ds, X, net: null, step: 0, loss: [], acc: [], H, line: 1, cap: ds === 1 ? cap('XOR: 4 nokta, aynıysa 0 farklıysa 1', 'XOR: 4 points, 0 if equal, 1 if different') : ds === 2 ? cap('200 konum: güvenli dairenin içi / dışı', '200 positions: inside / outside the safe circle') : cap('200 konum: pistte / dışında', '200 positions: on / off track'), stat: cap(`2 → ${H} → 1 nöron`, `2 → ${H} → 1 neurons`), hold: 1.8 })
    const first = snaps[0]
    F.push({ ds, X, net: first.net, step: 0, loss: [first.loss], acc: [first.acc], H, line: 3, cap: cap('rastgele ağırlıklar', 'random weights'), stat: stat(first), hold: 1.4 })
    const lines: Array<[number, 'fwd' | 'bwd']> = [[6, 'fwd'], [7, 'fwd'], [8, 'fwd'], [10, 'bwd'], [11, 'bwd'], [12, 'bwd']]
    lines.forEach(([l, ph]) => F.push({ ds, X, net: first.net, step: 0, loss: [first.loss], acc: [first.acc], H, phase: ph, line: l, cap: cap(ph === 'fwd' ? 'adım 0 · ileri hesap' : 'adım 0 · geri yayılım', ph === 'fwd' ? 'step 0 · forward pass' : 'step 0 · backpropagation'), stat: stat(first), hold: 0.9 }))
    snaps.forEach((s, i) => {
      if (i === 0) return
      F.push({ ds, X, net: s.net, step: s.step, loss: snaps.slice(0, i + 1).map((q) => q.loss), acc: snaps.slice(0, i + 1).map((q) => q.acc), H, line: 12, cap: cap(`adım ${s.step}`, `step ${s.step}`), stat: stat(s), hold: i < 8 ? 0.7 : 0.35 })
    })
    const last = snaps.at(-1)!
    F.push({ ds, X, net: last.net, step: last.step, loss: snaps.map((q) => q.loss), acc: snaps.map((q) => q.acc), H, line: 5, cap: cap(`${last.step} adım sonra`, `after ${last.step} steps`), stat: stat(last), hold: 3 })
    return F
  },
}
// Veri CSV'den açılınca 1. satırdan sonra 1 satır eklendi: vurgulanan satırlar kayar. Eğitim geçmişi satırları (doğrulama
// ayrımı, geçmiş sözlüğü, gradyanlar ve kayıt) eklenince döngü satırları da kayar: 5'ten sonra 2, 13'ten sonra 3 satır daha.
MLP.run = shifted(shifted(shifted(MLP.run, 1, 1), 5, 2), 13, 3)
