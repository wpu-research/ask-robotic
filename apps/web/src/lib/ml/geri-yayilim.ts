// Ders: geri yayılım. Tutucunun iki sensörü (basınç, kayma) → 2 gizli nöron → 1 çıktı: altı ağırlık, tek yanlış cevap.
// Her nöronun suçu bir kez hesaplanır; ona giren her ağırlığın gradyanı = suç × taşıdığı değer. Sayısal türevle doğrulanır.
import { cap, fmt, type Frame, type Lesson } from './core'

export type Mat2 = [[number, number], [number, number]]
export interface Grads { h: [number, number]; o: number; loss: number; so: number; sh: [number, number]; gW1: Mat2; gW2: [number, number] }
export type BpPhase = 'net' | 'hid' | 'out' | 'loss' | 'blameOut' | 'gradOut' | 'blameHid' | 'gradIn' | 'check' | 'update' | 'train'

export interface BpFrame extends Frame {
  W1: Mat2
  W2: [number, number]
  g: Grads
  phase: BpPhase
  /** Sayısal (oynat-ölç) gradyanlar: W1[0,0], W1[0,1], W1[1,0], W1[1,1], W2[0], W2[1]. */
  num?: number[]
  /** Güncellemeden önceki ağırlıklar (güncelleme karesinde). */
  prev?: { W1: Mat2; W2: [number, number] }
  /** Adım başına çıktı (paylaşılan); ilk k değer çizilir. */
  outs: number[]
  k: number
  step: number
  lr: number
}

export const X_IN: [number, number] = [1.0, 0.5]
export const TARGET = 1.0
export const W1_0: Mat2 = [[0.6, 0.6], [-0.5, 0.4]]
export const W2_0: [number, number] = [1.1, 0.3]

const sig = (z: number) => 1 / (1 + Math.exp(-z))
const cp = (W: Mat2): Mat2 => [[W[0][0], W[0][1]], [W[1][0], W[1][1]]]

export function forward(W1: Mat2, W2: [number, number]) {
  const h: [number, number] = [sig(X_IN[0] * W1[0][0] + X_IN[1] * W1[1][0]), sig(X_IN[0] * W1[0][1] + X_IN[1] * W1[1][1])]
  const o = sig(h[0] * W2[0] + h[1] * W2[1])
  return { h, o, loss: (o - TARGET) ** 2 }
}

/** Geri yayılım: çıkışın suçu → gizli nöronların suçu → altı gradyan. */
export function backprop(W1: Mat2, W2: [number, number]): Grads {
  const { h, o, loss } = forward(W1, W2)
  const so = 2 * (o - TARGET) * o * (1 - o)
  const gW2: [number, number] = [so * h[0], so * h[1]]
  const sh: [number, number] = [so * W2[0] * h[0] * (1 - h[0]), so * W2[1] * h[1] * (1 - h[1])]
  const gW1: Mat2 = [[X_IN[0] * sh[0], X_IN[0] * sh[1]], [X_IN[1] * sh[0], X_IN[1] * sh[1]]]
  return { h, o, loss, so, sh, gW1, gW2 }
}

/** Ağırlığı ±e oynatıp kaybın değişimini ölçerek (merkezi fark) altı gradyan. */
export function numericGrads(W1: Mat2, W2: [number, number], e = 1e-6): number[] {
  const out: number[] = []
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    const A = cp(W1), B = cp(W1); A[i][j] += e; B[i][j] -= e
    out.push((forward(A, W2).loss - forward(B, W2).loss) / (2 * e))
  }
  for (let j = 0; j < 2; j++) {
    const A: [number, number] = [W2[0], W2[1]], B: [number, number] = [W2[0], W2[1]]; A[j] += e; B[j] -= e
    out.push((forward(W1, A).loss - forward(W1, B).loss) / (2 * e))
  }
  return out
}

export function update(W1: Mat2, W2: [number, number], g: Grads, lr: number): { W1: Mat2; W2: [number, number] } {
  return {
    W1: [[W1[0][0] - lr * g.gW1[0][0], W1[0][1] - lr * g.gW1[0][1]], [W1[1][0] - lr * g.gW1[1][0], W1[1][1] - lr * g.gW1[1][1]]],
    W2: [W2[0] - lr * g.gW2[0], W2[1] - lr * g.gW2[1]],
  }
}

/** steps adım eğitim; her adımın başındaki ağırlıklar ve çıktı. */
export function trainBp(lr: number, steps = 60) {
  let W1 = cp(W1_0), W2: [number, number] = [W2_0[0], W2_0[1]]
  const hist: Array<{ W1: Mat2; W2: [number, number]; g: Grads }> = []
  for (let s = 0; s <= steps; s++) {
    const g = backprop(W1, W2)
    hist.push({ W1, W2, g })
    ;({ W1, W2 } = update(W1, W2, g, lr))
  }
  return hist
}

export const GERI_YAYILIM: Lesson<BpFrame> = {
  slug: 'geri-yayilim',
  n: 0,
  title: { tr: 'Geri yayılım: altı ağırlıktan hangisi suçlu?', en: 'Backpropagation: which of six weights is to blame?' },
  sub: { tr: 'Suç çıkıştan başlar, katman katman geriye akar', en: 'Blame starts at the output and flows back layer by layer' },
  story: {
    tr: "Bir robot tutucusunun iki sensörü var: parmak basıncı ve kayma titreşimi. Bu okumalar (ölçekli: 1,0 ve 0,5) küçük bir ağa girer: 2 girdi → 2 gizli nöron → 1 çıktı, toplam altı ağırlık. Nesne sağlam tutulduğu için doğru cevap 1,0; ağ ise 0,701 diyor. Altı ağırlık bu cevabı birlikte üretti: hangisi ne kadar suçlu?",
    en: "A robot gripper has two sensors: finger pressure and slip vibration. The readings (scaled: 1.0 and 0.5) go into a small network: 2 inputs → 2 hidden neurons → 1 output, six weights in all. The object is held firmly, so the right answer is 1.0; the network says 0.701. Six weights produced that answer together: which one is to blame, and by how much?",
  },
  how: [
    { tr: 'İleri geçiş: girdiler gizli katmandan geçer, tek bir sayı çıkar. Kayıp = (çıktı − hedef)²: 0,09.', en: 'Forward pass: the inputs run through the hidden layer and one number comes out. Loss = (output − target)²: 0.09.' },
    { tr: 'Bir ağırlığın gradyanı: onu çok az oynatınca kaybın ne kadar değiştiği. Her ağırlığı tek tek oynatmak yerine kısayol kullanılır.', en: "A weight's gradient: how much the loss changes when it moves a tiny bit. Instead of wiggling every weight one by one, there is a shortcut." },
    { tr: 'Kısayol: bir nöronun suçu bir kez hesaplanır. Ona giren her ağırlığın gradyanı = o suç × ağırlığın taşıdığı değer. Suç çıkıştan başlar ve katman katman geriye aktarılır.', en: "The shortcut: a neuron's blame is computed once. Every weight going into it gets gradient = that blame × the value the weight carried. Blame starts at the output and is handed back layer by layer." },
    { tr: 'Güncelleme: her ağırlık kendi gradyanının tersine kayar. Altı gradyan da negatif, altı ağırlık da artar; çıktı 1 adımda 0,769, 60 adımda 0,968 olur.', en: 'Update: every weight moves against its own gradient. All six gradients are negative, so all six weights go up; the output reads 0.769 after 1 step and 0.968 after 60.' },
    { tr: 'Şunu dene: öğrenme oranını 0,5 yap, 60 adımda çıktı ancak 0,907 olur; 6 yap, 0,978’e çıkar.', en: 'Try this: set the learning rate to 0.5 and the output only reaches 0.907 in 60 steps; set it to 6 and it climbs to 0.978.' },
  ],
  why: {
    tr: "Geri yayılım, milyonlarca ağırlıklı bir ağı eğitmeyi mümkün kılan hesaptır: tek bir ileri ve tek bir geri geçişle bütün gradyanlar çıkar. Görüntüden nesne tanıyan, robot kolunu yöneten ya da dil üreten her ağ böyle eğitilir. PyTorch'taki loss.backward() tam olarak bu işi yapar.",
    en: "Backpropagation is the computation that makes training a network with millions of weights possible: one forward and one backward pass give every gradient. Every network that recognises objects, steers a robot arm or writes text is trained this way. PyTorch's loss.backward() does exactly this job.",
  },
  file: 'geri_yayilim.py',
  code: [
    ['import numpy as np'],
    ['sig = lambda z: 1 / (1 + np.exp(-z))'],
    ['x = np.array([1.0, 0.5])', 'basınç, kayma (ölçekli)', 'pressure, slip (scaled)'],
    ['target, lr = 1.0, 3.0', 'sağlam kavrama = 1', 'firm grip = 1'],
    ['W1 = np.array([[0.6, 0.6], [-0.5, 0.4]])', 'girdi → gizli', 'input → hidden'],
    ['W2 = np.array([1.1, 0.3])', 'gizli → çıkış', 'hidden → output'],
    ['def forward(W1, W2):'],
    ['    h = sig(x @ W1)', 'gizli katman', 'hidden layer'],
    ['    return h, sig(h @ W2)', 'çıktı', 'output'],
    ['L = lambda W1, W2: (forward(W1, W2)[1] - target) ** 2'],
    ['for step in range(61):'],
    ['    h, out = forward(W1, W2)', 'ileri geçiş', 'forward pass'],
    ['    loss = (out - target) ** 2', 'kayıp', 'loss'],
    ['    d_out = 2 * (out - target) * out * (1 - out)', 'çıkışın suçu', "the output's blame"],
    ['    gW2 = d_out * h', 'suç × taşıdığı değer', 'blame × value carried'],
    ['    d_h = d_out * W2 * h * (1 - h)', 'suç bir katman geri', 'blame one layer back'],
    ['    gW1 = np.outer(x, d_h)', 'suç × girdi', 'blame × input'],
    ['    if step == 0:', 'kontrol: oynat ve ölç', 'check: wiggle and measure'],
    ['        E = np.zeros((2, 2)); E[0, 0] = 1e-6'],
    ['        num = (L(W1 + E, W2) - L(W1 - E, W2)) / 2e-6'],
    ['        print(f"{gW1[0, 0]:.9f} = {num:.9f} ?")'],
    ['    W1 -= lr * gW1; W2 -= lr * gW2', 'güncelleme', 'update'],
    ['    if step in (0, 1, 60):'],
    ['        print(step, f"{out:.3f}", f"{loss:.4f}")', 'adım, çıktı, kayıp', 'step, output, loss'],
  ],
  params: [{ key: 'lr', label: { tr: 'Öğrenme oranı', en: 'Learning rate' }, min: 0.5, max: 6, step: 0.5, value: 3 }],
  run({ lr = 3 }) {
    const hist = trainBp(lr, 60)
    const outs = hist.map((q) => q.g.o)
    const F: BpFrame[] = []
    const h0 = hist[0], g = h0.g
    const base = { W1: h0.W1, W2: h0.W2, g, outs, lr, step: 0 }
    const o3 = (o: number) => cap(`çıktı ${fmt(o, 3, 'tr')} · hedef 1,0`, `output ${o.toFixed(3)} · target 1.0`)
    F.push({ ...base, phase: 'net', k: 0, line: 2, cap: cap('2 sensör → 2 gizli nöron → 1 çıktı', '2 sensors → 2 hidden neurons → 1 output'), stat: cap('altı ağırlık', 'six weights'), hold: 2 })
    F.push({ ...base, phase: 'net', k: 0, line: 4, cap: cap('başlangıç ağırlıkları', 'starting weights'), stat: cap(`öğrenme oranı ${fmt(lr, 1, 'tr')}`, `learning rate ${lr.toFixed(1)}`), hold: 1.6 })
    F.push({ ...base, phase: 'hid', k: 0, line: 7, cap: cap('ileri geçiş: gizli katman', 'forward pass: hidden layer'), stat: cap(`h = ${fmt(g.h[0], 3, 'tr')} ve ${fmt(g.h[1], 3, 'tr')}`, `h = ${g.h[0].toFixed(3)} and ${g.h[1].toFixed(3)}`), hold: 1.6 })
    F.push({ ...base, phase: 'out', k: 1, line: 8, cap: cap('ileri geçiş: çıktı', 'forward pass: output'), stat: o3(g.o), hold: 1.6 })
    F.push({ ...base, phase: 'loss', k: 1, line: 12, cap: cap(`kayıp = (${fmt(g.o, 3, 'tr')} − 1)² = ${fmt(g.loss, 4, 'tr')}`, `loss = (${g.o.toFixed(3)} − 1)² = ${g.loss.toFixed(4)}`), stat: cap('hangi ağırlık ne kadar suçlu?', 'which weight is to blame, and how much?'), hold: 2 })
    F.push({ ...base, phase: 'blameOut', k: 1, line: 13, cap: cap(`çıkışın suçu: ${fmt(g.so, 4, 'tr')}`, `the output's blame: ${g.so.toFixed(4)}`), stat: cap('bir kez hesaplanır', 'computed once'), hold: 1.8 })
    F.push({ ...base, phase: 'gradOut', k: 1, line: 14, cap: cap('çıkışa giren 2 ağırlık: suç × taşıdığı değer', 'the 2 weights into the output: blame × value carried'), stat: cap(`${fmt(g.so, 4, 'tr')} × ${fmt(g.h[0], 3, 'tr')} = ${fmt(g.gW2[0], 4, 'tr')}`, `${g.so.toFixed(4)} × ${g.h[0].toFixed(3)} = ${g.gW2[0].toFixed(4)}`), hold: 2 })
    F.push({ ...base, phase: 'blameHid', k: 1, line: 15, cap: cap('suç bir katman geri: gizli nöronlar', 'blame one layer back: the hidden neurons'), stat: cap(`${fmt(g.sh[0], 4, 'tr')} ve ${fmt(g.sh[1], 4, 'tr')}`, `${g.sh[0].toFixed(4)} and ${g.sh[1].toFixed(4)}`), hold: 2 })
    F.push({ ...base, phase: 'gradIn', k: 1, line: 16, cap: cap('gizli nöronlara giren 4 ağırlık: suç × girdi', 'the 4 weights into the hidden layer: blame × input'), stat: cap('altı gradyanın hepsi negatif', 'all six gradients are negative'), hold: 2 })
    const num = numericGrads(h0.W1, h0.W2)
    const ana = [g.gW1[0][0], g.gW1[0][1], g.gW1[1][0], g.gW1[1][1], g.gW2[0], g.gW2[1]]
    const worst = Math.max(...ana.map((a, i) => Math.abs(a - num[i])))
    F.push({ ...base, phase: 'check', num, k: 1, line: 19, cap: cap('kontrol: her ağırlığı ±0,000001 oynat, kaybı ölç', 'check: wiggle each weight by ±0.000001, measure the loss'), stat: cap(`en büyük fark ${worst.toExponential(0)}`, `largest gap ${worst.toExponential(0)}`), hold: 3 })
    const h1 = hist[1]
    F.push({ ...base, W1: h1.W1, W2: h1.W2, prev: { W1: h0.W1, W2: h0.W2 }, phase: 'update', k: 1, line: 21, cap: cap('güncelleme: her ağırlık gradyanının tersine', 'update: every weight against its gradient'), stat: cap(`yeni = eski − ${fmt(lr, 1, 'tr')} × gradyan`, `new = old − ${lr.toFixed(1)} × gradient`), hold: 2 })
    F.push({ W1: h1.W1, W2: h1.W2, g: h1.g, outs, lr, step: 1, phase: 'out', k: 2, line: 11, cap: cap(`adım 1: çıktı ${fmt(h1.g.o, 3, 'tr')}`, `step 1: output ${h1.g.o.toFixed(3)}`), stat: cap(`kayıp ${fmt(h1.g.loss, 4, 'tr')}`, `loss ${h1.g.loss.toFixed(4)}`), hold: 2 })
    // ikinci adım hızlı, satır satır
    const h2 = hist[2]
    ;([[11, 'out'], [13, 'blameOut'], [15, 'blameHid'], [21, 'update']] as Array<[number, BpPhase]>).forEach(([line, phase]) => {
      const up = phase === 'update'
      F.push({ W1: up ? h2.W1 : h1.W1, W2: up ? h2.W2 : h1.W2, g: h1.g, outs, lr, step: 1, phase, prev: up ? { W1: h1.W1, W2: h1.W2 } : undefined, k: 2, line, cap: cap('ikinci tur: aynı dört iş', 'second round: the same four jobs'), stat: o3(h1.g.o), hold: 0.8 })
    })
    for (let s = 2; s <= 60; s++) {
      const q = hist[s]
      F.push({ W1: q.W1, W2: q.W2, g: q.g, outs, lr, step: s, phase: 'train', k: s + 1, line: 21, cap: cap(`adım ${s}: çıktı ${fmt(q.g.o, 3, 'tr')}`, `step ${s}: output ${q.g.o.toFixed(3)}`), stat: cap(`kayıp ${fmt(q.g.loss, 4, 'tr')}`, `loss ${q.g.loss.toFixed(4)}`), hold: s < 8 ? 0.6 : 0.3 })
    }
    const last = hist[60]
    F.push({ W1: last.W1, W2: last.W2, g: last.g, outs, lr, step: 60, phase: 'train', k: 61, line: 23, cap: cap(`60 adım: çıktı ${fmt(g.o, 3, 'tr')} → ${fmt(last.g.o, 3, 'tr')}`, `60 steps: output ${g.o.toFixed(3)} → ${last.g.o.toFixed(3)}`), stat: cap(`kayıp ${fmt(g.loss, 4, 'tr')} → ${fmt(last.g.loss, 4, 'tr')}`, `loss ${g.loss.toFixed(4)} → ${last.g.loss.toFixed(4)}`), hold: 3 })
    return F
  },
}
