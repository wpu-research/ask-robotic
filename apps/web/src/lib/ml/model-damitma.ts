// Ders: model damıtma (bilgi damıtma). Sunucudaki büyük öğretmen ağ (2 → 64 → 3) 1500 sürüşle zemin türünü öğrenir; robotun
// mikrodenetleyicisine sığan öğrenci (2 → 4 → 3) yalnız 24 örnek görür: bir kez sert etiketlerle, bir kez öğretmenin sıcaklıklı yumuşak çıktılarıyla.
import { cap, fmt, gauss, rng, type Frame, type Lesson, type Pt } from './core'

export interface Net { W1: number[][]; b1: number[]; W2: number[][]; b2: number[]; h: number }
/** Zemin türleri: 0 beton, 1 çim, 2 çakıl. Özellikler: titreşim (x) ve tekerlek kayması (y), ölçekli. */
const MU: Array<[number, number]> = [[-1, -0.5], [1, -0.5], [0, 1]]
export function terrain(seed: number, n: number): Pt[] {
  const r = rng(seed)
  return Array.from({ length: n }, () => { const c = Math.min(2, Math.floor(r() * 3)); return { x: MU[c][0] + 0.7 * gauss(r), y: MU[c][1] + 0.7 * gauss(r), c } })
}

export function softmax(z: number[], T = 1): number[] {
  const m = Math.max(...z.map((v) => v / T))
  const e = z.map((v) => Math.exp(v / T - m))
  const s = e.reduce((a, b) => a + b, 0)
  return e.map((v) => v / s)
}
export function logits(net: Net, x: number, y: number): number[] {
  const z = [net.b2[0], net.b2[1], net.b2[2]]
  for (let j = 0; j < net.h; j++) {
    const hj = Math.tanh(net.W1[0][j] * x + net.W1[1][j] * y + net.b1[j]), w = net.W2[j]
    z[0] += hj * w[0]; z[1] += hj * w[1]; z[2] += hj * w[2]
  }
  return z
}
export const predict = (net: Net, x: number, y: number): number => { const z = logits(net, x, y); return z[0] >= z[1] ? (z[0] >= z[2] ? 0 : 2) : z[1] >= z[2] ? 1 : 2 }
export const accuracy = (net: Net, X: Pt[]): number => { let ok = 0; for (const q of X) if (predict(net, q.x, q.y) === q.c) ok++; return ok / X.length }
export const paramCount = (net: Net): number => 2 * net.h + net.h + 3 * net.h + 3
const clone = (n: Net): Net => ({ W1: n.W1.map((r) => [...r]), b1: [...n.b1], W2: n.W2.map((r) => [...r]), b2: [...n.b2], h: n.h })

/**
 * Hedef dağılımlara (P: her nokta için 3 olasılık) çapraz entropiyle gradyan inişi. Sıcaklık T: çıktı softmax(z / T) ile
 * karşılaştırılır; gradyan T² ile ölçeklenir (Hinton 2015), böylece büyük T'de adımlar küçülmez. batch > 0: rastgele mini-yığın.
 */
export function train(X: Pt[], P: number[][], h: number, opt: { T?: number; steps: number; lr: number; seed: number; batch?: number; every?: number; onSnap?: (s: number, n: Net) => void }): Net {
  const T = opt.T ?? 1
  const r = rng(opt.seed)
  const net: Net = { W1: [0, 1].map(() => Array.from({ length: h }, () => gauss(r))), b1: new Array(h).fill(0), W2: Array.from({ length: h }, () => [0, 1, 2].map(() => 0.5 * gauss(r))), b2: [0, 0, 0], h }
  const N = X.length
  const H = new Float64Array(h), gW1x = new Float64Array(h), gW1y = new Float64Array(h), gb1 = new Float64Array(h), gW2 = new Float64Array(h * 3)
  const gb2 = new Float64Array(3), z = new Float64Array(3), G = new Float64Array(3)
  const idx = new Int32Array(opt.batch ?? N)
  for (let s = 0; s <= opt.steps; s++) {
    if (opt.onSnap && opt.every && s % opt.every === 0) opt.onSnap(s, clone(net))
    if (s === opt.steps) break
    for (let i = 0; i < idx.length; i++) idx[i] = opt.batch ? Math.floor(r() * N) : i
    gW1x.fill(0); gW1y.fill(0); gb1.fill(0); gW2.fill(0); gb2.fill(0)
    const B = idx.length
    for (let b = 0; b < B; b++) {
      const i = idx[b], q = X[i], P0 = P[i]
      z[0] = net.b2[0]; z[1] = net.b2[1]; z[2] = net.b2[2]
      for (let j = 0; j < h; j++) {
        const hj = Math.tanh(net.W1[0][j] * q.x + net.W1[1][j] * q.y + net.b1[j]), w = net.W2[j]
        H[j] = hj; z[0] += hj * w[0]; z[1] += hj * w[1]; z[2] += hj * w[2]
      }
      const m = Math.max(z[0], z[1], z[2]) / T
      const e0 = Math.exp(z[0] / T - m), e1 = Math.exp(z[1] / T - m), e2 = Math.exp(z[2] / T - m), se = e0 + e1 + e2
      G[0] = ((e0 / se - P0[0]) * T) / B; G[1] = ((e1 / se - P0[1]) * T) / B; G[2] = ((e2 / se - P0[2]) * T) / B
      gb2[0] += G[0]; gb2[1] += G[1]; gb2[2] += G[2]
      for (let j = 0; j < h; j++) {
        const w = net.W2[j], hj = H[j]
        gW2[3 * j] += hj * G[0]; gW2[3 * j + 1] += hj * G[1]; gW2[3 * j + 2] += hj * G[2]
        const gh = (G[0] * w[0] + G[1] * w[1] + G[2] * w[2]) * (1 - hj * hj)
        gW1x[j] += q.x * gh; gW1y[j] += q.y * gh; gb1[j] += gh
      }
    }
    for (let j = 0; j < h; j++) {
      net.W1[0][j] -= opt.lr * gW1x[j]; net.W1[1][j] -= opt.lr * gW1y[j]; net.b1[j] -= opt.lr * gb1[j]
      for (let k = 0; k < 3; k++) net.W2[j][k] -= opt.lr * gW2[3 * j + k]
    }
    for (let k = 0; k < 3; k++) net.b2[k] -= opt.lr * gb2[k]
  }
  return net
}
const onehot = (c: number) => [0, 1, 2].map((k) => (k === c ? 1 : 0))

/** Öğretmen: 1500 etiketli sürüş, 64 gizli nöron, mini-yığınlı gradyan inişi. Sıcaklıktan bağımsız; bir kez eğitilip saklanır. */
let TEACHER: { net: Net; big: Pt[]; test: Pt[]; acc: number } | null = null
export function teacher() {
  if (TEACHER) return TEACHER
  const big = terrain(11, 1500), test = terrain(99, 1000)
  const net = train(big, big.map((q) => onehot(q.c)), 64, { steps: 1000, lr: 0.3, seed: 5, batch: 32 })
  TEACHER = { net, big, test, acc: accuracy(net, test) }
  return TEACHER
}

export function distill(T: number, n: number) {
  const t = teacher()
  const small = terrain(7, n)
  const soft = small.map((q) => softmax(logits(t.net, q.x, q.y), T))
  const every = 40, steps = 2000
  const hardS: Net[] = [], softS: Net[] = []
  const hard = train(small, small.map((q) => onehot(q.c)), 4, { steps, lr: 0.75, seed: 3, every, onSnap: (_, net) => hardS.push(net) })
  const dist = train(small, soft, 4, { T, steps, lr: 0.75, seed: 3, every, onSnap: (_, net) => softS.push(net) })
  return { t, small, soft, hard, dist, hardS, softS, every, hardAcc: hardS.map((s) => accuracy(s, t.test)), softAcc: softS.map((s) => accuracy(s, t.test)) }
}

export interface DistFrame extends Frame {
  teacher: Net
  big: Pt[]
  small: Pt[]
  soft: number[][]
  tAcc: number
  /** Öğrenci ağları (yoksa henüz eğitim yok). */
  hard: Net | null
  dist: Net | null
  hardAcc: number[]
  softAcc: number[]
  /** Yumuşak hedefi gösterilen örnek. */
  probe?: number
  T: number
  showBig: boolean
  showTeacher: boolean
  step: number
}

export const MODEL_DAMITMA: Lesson<DistFrame> = {
  slug: 'model-damitma',
  n: 0,
  title: { tr: 'Model damıtma', en: 'Model distillation' },
  sub: { tr: 'Büyük öğretmen sunucuda, küçük öğrenci robotun çipinde', en: "A big teacher on the server, a small student on the robot's chip" },
  story: {
    tr: 'Robot, titreşim (IMU) ve tekerlek kaymasından zeminin beton, çim ya da çakıl olduğunu anlamalı. Sunucuda 1500 etiketli sürüşle eğitilmiş büyük bir ağ var (64 gizli nöron, 387 sayı). Robotun mikrodenetleyicisine ise yalnız 4 gizli nöronlu, 27 sayılık bir ağ sığar ve elimizde onun için yalnız 24 etiketli örnek var. Zeminler birbirine karışır: aynı titreşim bazen çim, bazen çakıldır; tek tek etiketler gürültülüdür.',
    en: "The robot must tell from vibration (IMU) and wheel slip whether the ground is concrete, grass or gravel. On the server there is a big network trained on 1500 labelled drives (64 hidden neurons, 387 numbers). The robot's microcontroller only fits a network with 4 hidden neurons, 27 numbers, and we have only 24 labelled examples for it. The terrains overlap: the same vibration is sometimes grass, sometimes gravel, so single labels are noisy.",
  },
  how: [
    { tr: 'Sert etiket: "bu örnek çim" (1, 0, 0 gibi). Yumuşak hedef: öğretmenin olasılıkları, ör. çim 0,6, çakıl 0,3, beton 0,1. İkincisi "ne kadar emin" ve "neye benziyor" bilgisini de taşır.', en: 'Hard label: "this example is grass" (like 1, 0, 0). Soft target: the teacher\'s probabilities, e.g. grass 0.6, gravel 0.3, concrete 0.1. The second also tells "how sure" and "what it resembles".' },
    { tr: 'Sıcaklık T: öğretmenin çıktıları softmax(z / T) ile yumuşatılır. T büyüdükçe küçük olasılıklar görünür olur; öğrenci aynı T ile eğitilir, gradyan T² ile ölçeklenir.', en: "Temperature T: the teacher's outputs are softened with softmax(z / T). The larger T, the more visible the small probabilities; the student is trained at the same T and the gradient is scaled by T²." },
    { tr: 'İki öğrenci aynı 24 noktayı, aynı başlangıç ağırlıklarını ve aynı 2000 adımı kullanır; tek fark hedeftir. Doğruluk, 1000 yeni sürüşte ölçülür.', en: 'Both students use the same 24 points, the same initial weights and the same 2000 steps; only the target differs. Accuracy is measured on 1000 new drives.' },
    { tr: 'Sert etiketli öğrenci gürültülü 24 noktayı ezberler ve sınırı büker; damıtılmış öğrenci öğretmenin düzgün sınırını kopyalar.', en: "The hard-label student memorises the 24 noisy points and bends the border; the distilled student copies the teacher's smooth border." },
    { tr: 'Şunu dene: örnek sayısını 120 yap; fark küçülür, çünkü bol veri gürültüyü kendisi ortalar. T’yi 1 ile 8 arasında değiştir: bu basit problemde T’nin etkisi küçüktür.', en: "Try this: raise the number of examples to 120; the gap shrinks because plenty of data averages out the noise itself. Vary T between 1 and 8: in this simple problem T has only a small effect." },
  ],
  why: {
    tr: 'Büyük dil modellerinin küçük ve hızlı sürümleri (ör. DeepSeek’in damıtılmış modelleri, telefonlarda çalışan asistanlar) böyle eğitilir: büyük model öğretmen olur, küçük model onun çıktılarını taklit eder. Robotikte sunucudaki ağır algı modelleri, mikrodenetleyici ya da gömülü GPU’ya sığan küçük ağlara bu yolla aktarılır; enerji, gecikme ve bellek kazanılır.',
    en: "Small, fast versions of large language models (such as DeepSeek's distilled models or assistants that run on phones) are trained this way: the big model is the teacher and the small one imitates its outputs. In robotics heavy perception models on the server are moved this way into small networks that fit a microcontroller or an embedded GPU, saving energy, latency and memory.",
  },
  file: 'damitma.py',
  code: [
    ['import numpy as np'],
    ['M = np.array([[-1, -.5], [1, -.5], [0, 1]])', 'beton, çim, çakıl', 'concrete, grass, gravel'],
    ['def data(n, g=np.random.default_rng(0)):', 'titreşim, kayma; sınıflar örtüşür', 'vibration, slip; classes overlap'],
    ['    y = g.integers(0, 3, n)'],
    ['    return M[y] + g.normal(0, .7, (n, 2)), y'],
    ['def sm(z, T=1):', 'sıcaklıklı softmax', 'softmax with temperature'],
    ['    e = np.exp((z - z.max(1, keepdims=True)) / T)'],
    ['    return e / e.sum(1, keepdims=True)'],
    ['def train(X, P, h, T=1, steps=2000, lr=.75):', 'P: hedef olasılıklar', 'P: target probabilities'],
    ['    r = np.random.default_rng(1)'],
    ['    W1, W2 = r.normal(0, 1, (2, h)), r.normal(0, .5, (h, 3))'],
    ['    b1, b2 = np.zeros(h), np.zeros(3)'],
    ['    for _ in range(steps):'],
    ['        H = np.tanh(X @ W1 + b1)'],
    ['        G = (sm(H @ W2 + b2, T) - P) * T / len(X)', 'gradyan × T²', 'gradient × T²'],
    ['        GH = G @ W2.T * (1 - H ** 2)', 'geri yayılım', 'backprop'],
    ['        W2 -= lr * H.T @ G; b2 -= lr * G.sum(0)'],
    ['        W1 -= lr * X.T @ GH; b1 -= lr * GH.sum(0)'],
    ['    return lambda X: np.tanh(X @ W1 + b1) @ W2 + b2'],
    ['(A, a), (S, s), (X, y) = data(1500), data(24), data(1000)', 'büyük, küçük, test', 'big, small, test'],
    ['big = train(A, np.eye(3)[a], 64, lr=.3)', 'öğretmen: 387 sayı', 'teacher: 387 numbers'],
    ['hard = train(S, np.eye(3)[s], 4)', 'öğrenci, sert etiket: 27 sayı', 'student, hard labels: 27 numbers'],
    ['soft = train(S, sm(big(S), 4), 4, T=4)', 'öğrenci, yumuşak hedef', 'student, soft targets'],
    ['for f in big, hard, soft: print(np.mean(f(X).argmax(1)==y))', 'test doğruluğu', 'test accuracy'],
  ],
  params: [
    { key: 'T', label: { tr: 'Sıcaklık T', en: 'Temperature T' }, min: 1, max: 8, step: 0.5, value: 4 },
    { key: 'n', label: { tr: 'Öğrencinin etiketli örneği', en: "Student's labelled examples" }, min: 12, max: 120, step: 12, value: 24 },
  ],
  run({ T = 4, n = 24 }) {
    const Tm = Math.max(0.5, T)
    const nn = Math.max(6, Math.round(n))
    const d = distill(Tm, nn)
    const F: DistFrame[] = []
    const base = { teacher: d.t.net, big: d.t.big, small: d.small, soft: d.soft, tAcc: d.t.acc, T: Tm }
    const pc = cap(`öğretmen ${paramCount(d.t.net)} sayı · öğrenci ${paramCount(d.hard)} sayı`, `teacher ${paramCount(d.t.net)} numbers · student ${paramCount(d.hard)} numbers`)
    const pct = (x: number) => Math.round(x * 100)
    F.push({ ...base, hard: null, dist: null, hardAcc: [], softAcc: [], showBig: true, showTeacher: false, step: 0, line: 19, cap: cap('sunucuda 1500 etiketli sürüş', '1500 labelled drives on the server'), stat: pc, hold: 2 })
    F.push({ ...base, hard: null, dist: null, hardAcc: [], softAcc: [], showBig: true, showTeacher: true, step: 0, line: 20, cap: cap(`öğretmen (64 gizli nöron): test doğruluğu %${pct(d.t.acc)}`, `teacher (64 hidden neurons): test accuracy ${pct(d.t.acc)}%`), stat: pc, hold: 2 })
    F.push({ ...base, hard: null, dist: null, hardAcc: [], softAcc: [], showBig: false, showTeacher: true, step: 0, line: 19, cap: cap(`robot için yalnız ${nn} etiketli örnek`, `only ${nn} labelled examples for the robot`), stat: pc, hold: 1.8 })
    const names = [{ tr: 'beton', en: 'concrete' }, { tr: 'çim', en: 'grass' }, { tr: 'çakıl', en: 'gravel' }]
    const probes = Math.min(8, nn)
    for (let i = 0; i < probes; i++) {
      const s = d.soft[i], c = d.small[i].c
      F.push({
        ...base, hard: null, dist: null, hardAcc: [], softAcc: [], showBig: false, showTeacher: true, probe: i, step: 0, line: 22,
        cap: cap(`örnek ${i + 1}: etiket "${names[c].tr}" · öğretmen (T = ${fmt(Tm, 1, 'tr')}): ${s.map((v, k) => `${names[k].tr} ${fmt(v, 2, 'tr')}`).join(', ')}`, `example ${i + 1}: label "${names[c].en}" · teacher (T = ${Tm.toFixed(1)}): ${s.map((v, k) => `${names[k].en} ${v.toFixed(2)}`).join(', ')}`),
        stat: cap('sert etiket mi, yumuşak hedef mi?', 'hard label or soft target?'), hold: i < 2 ? 1.6 : 0.8,
      })
    }
    d.hardS.forEach((h, i) => {
      const step = i * d.every
      const hA = d.hardAcc.slice(0, i + 1), sA = d.softAcc.slice(0, i + 1)
      F.push({
        ...base, hard: h, dist: d.softS[i], hardAcc: hA, softAcc: sA, showBig: false, showTeacher: true, step, line: i < 2 ? 14 + i : i % 2 ? 21 : 22,
        cap: cap(`adım ${step} · sert %${pct(hA[i])} · damıtılmış %${pct(sA[i])}`, `step ${step} · hard ${pct(hA[i])}% · distilled ${pct(sA[i])}%`), stat: pc, hold: i < 3 ? 1 : 0.22,
      })
    })
    const hA = d.hardAcc.at(-1)!, sA = d.softAcc.at(-1)!
    F.push({
      ...base, hard: d.hard, dist: d.dist, hardAcc: d.hardAcc, softAcc: d.softAcc, showBig: false, showTeacher: true, step: 2000, line: 23,
      cap: cap(`1000 yeni sürüşte: sert etiket %${pct(hA)}, damıtılmış %${pct(sA)}, öğretmen %${pct(d.t.acc)}`, `on 1000 new drives: hard labels ${pct(hA)}%, distilled ${pct(sA)}%, teacher ${pct(d.t.acc)}%`),
      stat: cap(`aynı ${nn} nokta, aynı 27 sayılık ağ; tek fark hedef`, `same ${nn} points, same 27-number network; only the target differs`), hold: 3,
    })
    return F
  },
}
