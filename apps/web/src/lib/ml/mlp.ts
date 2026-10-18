// Ders 9: küçük sinir ağı. Robot arenadaki konumunun pistte mi dışında mı olduğunu öğrenir: iki iç içe hilal (doğrusal olarak
// ayrılamaz). 2 → H (tanh) → 1 (sigmoid), tüm veriyle gradyan inişi ve geri yayılım. Perceptronun çizemediği eğri sınırı çizer.
import { cap, fmt, gauss, rng, type Frame, type Lesson, type Pt } from './core'

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
    ['from pist import X, y', '200 konum, y = 1 pistte', '200 positions, y = 1 on track'],
    ['rng, lr, H = np.random.default_rng(0), 0.5, 8', 'H gizli nöron', 'H hidden neurons'],
    ['W1, b1 = rng.normal(size=(2, H)), np.zeros(H)'],
    ['W2, b2 = rng.normal(size=H), 0.0'],
    ['for step in range(3001):'],
    ['    h = np.tanh(X @ W1 + b1)', 'gizli katman', 'hidden layer'],
    ['    p = 1 / (1 + np.exp(-(h @ W2 + b2)))', 'pistte olma olasılığı', 'probability of being on track'],
    ['    loss = -(y * np.log(p) + (1 - y) * np.log(1 - p)).mean()', 'çapraz entropi', 'cross-entropy'],
    ['    g = (p - y) / len(X)', 'kaybın çıkışa göre türevi', 'derivative at the output'],
    ['    gh = np.outer(g, W2) * (1 - h ** 2)', 'geri yayılım: gizli katmana', 'backprop to the hidden layer'],
    ['    W2 -= lr * h.T @ g; b2 -= lr * g.sum()'],
    ['    W1 -= lr * X.T @ gh; b1 -= lr * gh.sum(0)'],
  ],
  params: [
    { key: 'H', label: { tr: 'Gizli nöron sayısı', en: 'Hidden neurons' }, min: 1, max: 16, step: 1, value: 8 },
    { key: 'lr', label: { tr: 'Öğrenme oranı', en: 'Learning rate' }, min: 0.05, max: 2, step: 0.05, value: 0.5 },
    { key: 'veri', label: { tr: 'Veri: 0 hilal, 1 XOR, 2 daire', en: 'Data: 0 moons, 1 XOR, 2 circle' }, min: 0, max: 2, step: 1, value: 0 },
  ],
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
