// Ders: aktivasyon fonksiyonları. Her nöron üç şey yapar: toplam (z), eğri (a = f(z)), aktarım (a sonraki nöronun girdisi).
// Sayılar XOR ağından: girdiler 1 ve 0, ağırlıklar −5,6 ve 5,7, sapma 2,9 → z = −2,7 → sigmoid 0,06 → cevap 0,95. Eğri olmasa iki katman tek doğruya çöker.
import { cap, fmt, type Frame, type Lesson } from './core'

export const sigmoid = (z: number) => 1 / (1 + Math.exp(-z))
export const relu = (z: number) => Math.max(0, z)
/** GELU, sigmoid yaklaşımıyla: z · σ(1,702 z) (koddakiyle aynı formül). */
export const gelu = (z: number) => z * sigmoid(1.702 * z)
export const tanh = Math.tanh

export type ActKey = 'sigmoid' | 'tanh' | 'relu' | 'gelu'
export const ACTS: Array<{ key: ActKey; f: (z: number) => number; lo: number; hi: number }> = [
  { key: 'sigmoid', f: sigmoid, lo: -0.15, hi: 1.15 },
  { key: 'tanh', f: tanh, lo: -1.2, hi: 1.2 },
  { key: 'relu', f: relu, lo: -0.6, hi: 4.2 },
  { key: 'gelu', f: gelu, lo: -0.6, hi: 4.2 },
]

/** XOR ağı: iki gizli nöron ve bir cevap nöronu. İlk gizli nöronun sayıları videodaki eğitilmiş ağdan. */
export const XOR = { w1: [-5.6, 5.7], b1: 2.9, w2: [5.7, -5.6], b2: 2.9, v: [-7, -7], c: 10.3 }

export function neuron(x1: number, x2: number) {
  const z = XOR.w1[0] * x1 + XOR.w1[1] * x2 + XOR.b1
  const a = sigmoid(z)
  const h2 = sigmoid(XOR.w2[0] * x1 + XOR.w2[1] * x2 + XOR.b2)
  const zy = XOR.v[0] * a + XOR.v[1] * h2 + XOR.c
  return { z, a, h2, zy, y: sigmoid(zy) }
}

/** 1 girdi → 3 gizli nöron → 1 çıktı. act yoksa doğrusal (eğrisiz). */
export const NET2 = { W1: [0.8, -1.2, 2.0], b1: [0.5, 1.0, -1.0], W2: [1.5, 0.7, -1.0], b2: 0.3 }
export function twoLayer(x: number, act?: (z: number) => number) {
  return NET2.W1.reduce((s, w, j) => { const u = w * x + NET2.b1[j]; return s + NET2.W2[j] * (act ? act(u) : u) }, NET2.b2)
}
/** Eğrisiz iki katmanın bileşik ağırlığı ve sapması: tek bir doğru. */
export function composite() {
  const w = NET2.W1.reduce((s, v, j) => s + v * NET2.W2[j], 0)
  const b = NET2.b1.reduce((s, v, j) => s + v * NET2.W2[j], NET2.b2)
  return { w, b }
}

export interface AktFrame extends Frame {
  phase: 'curves' | 'neuron' | 'collapse'
  /** Eğrilerde gezen nokta. */
  z: number
  /** Nöron aşaması: 0 girdiler, 1 ağırlıklar, 2 toplam, 3 eğri, 4 ikinci gizli nöron, 5 aktarım. Çöküş: 0 parçalar, 1 toplam doğru, 2 bileşik, 3 eğriyle. */
  step: number
  x1: number
  x2: number
  N: ReturnType<typeof neuron>
}

export const AKTIVASYON: Lesson<AktFrame> = {
  slug: 'aktivasyon-fonksiyonlari',
  n: 0,
  title: { tr: 'Aktivasyon fonksiyonları', en: 'Activation functions' },
  sub: { tr: 'Toplam, eğri, aktarım: nöronu nöron yapan eğri', en: 'Sum, curve, hand over: the curve that makes a neuron a neuron' },
  story: {
    tr: 'Robotun iki dokunma sensörü var ve "yalnız biri basılıysa dur" kuralını (XOR) öğrenmiş küçük bir ağ kullanıyor: iki gizli nöron, bir cevap nöronu. Sol sensör basılı (1), sağ değil (0). Bu girdinin ağın içinden nasıl geçtiğini sayı sayı izliyoruz: ilk gizli nöronda ağırlıklar −5,6 ve 5,7, sapma 2,9. Sonra aynı soruyu eğri olmadan sorarız: iki katman ne işe yarar?',
    en: 'The robot has two touch sensors and uses a small network that has learnt the rule "stop if exactly one is pressed" (XOR): two hidden neurons and one answer neuron. The left sensor is pressed (1), the right one is not (0). We follow this input through the network number by number: in the first hidden neuron the weights are −5.6 and 5.7, the bias 2.9. Then we ask the same question without the curve: what are two layers good for?',
  },
  how: [
    { tr: 'Toplam: her girdi kendi ağırlığıyla çarpılır, hepsi toplanır, sapma eklenir. Tek bir sayı çıkar: z = 1·(−5,6) + 0·5,7 + 2,9 = −2,7.', en: 'Sum: each input times its weight, all added up, plus the bias. One number comes out: z = 1·(−5.6) + 0·5.7 + 2.9 = −2.7.' },
    { tr: 'Eğri: z aktivasyon fonksiyonuna verilir; eğrinin z’deki yüksekliği nöronun çıktısıdır. Sigmoid(−2,7) ≈ 0,06.', en: 'Curve: z goes into the activation function; the height of the curve at z is the output. Sigmoid(−2.7) ≈ 0.06.' },
    { tr: 'Aktarım: bu çıktı bir sonraki nöronun girdisidir: ağırlıkla çarpılır, sonraki toplama, sonraki eğriye girer. Cevap nöronu 0,95 der: açık bir evet.', en: 'Hand over: the output is the input of the next neuron: times a weight, into the next sum, into the next curve. The answer neuron says 0.95, a clear yes.' },
    { tr: 'Her eğrinin bir işi var: sigmoid 0–1 arası güven, tanh −1 ile 1 arası, ReLU sıfırın altını keser, GELU onun yumuşak hâli (dil modellerinde), softmax birçok seçenekten birini seçer.', en: 'Each curve has a job: sigmoid gives a 0–1 confidence, tanh squashes to −1…1, ReLU cuts off everything below zero, GELU is its smooth cousin (used in language models), softmax picks one of many.' },
    { tr: 'Şunu dene: girdileri 1 ve 1 yap; z = 3,0 olur, cevap 0,05’e düşer: XOR “hayır” der. Eğrisiz iki katman ise ne yaparsan yap tek bir doğrudur.', en: 'Try this: set both inputs to 1; z becomes 3.0 and the answer drops to 0.05: XOR says "no". Two layers without a curve stay a single straight line whatever you do.' },
  ],
  why: {
    tr: 'Eğri olmasaydı yüz katmanlı bir ağ bile tek bir doğrusal işleme çökerdi; köşe, kıvrım, "yalnız biri" gibi kuralları öğrenemezdi. Robotikte görüntüden nesne bulan ağlar ReLU, kontrol politikaları çoğunlukla tanh, olasılık veren çıkışlar sigmoid ya da softmax kullanır.',
    en: 'Without the curve even a hundred-layer network would collapse into one linear operation and could not learn corners, bends or rules like "exactly one". In robotics, vision networks use ReLU, control policies mostly tanh, and outputs that give probabilities use sigmoid or softmax.',
  },
  file: 'aktivasyon.py',
  code: [
    ['import numpy as np'],
    ['sig = lambda z: 1 / (1 + np.exp(-z))', '0 ile 1 arası', 'between 0 and 1'],
    ['relu = lambda z: np.maximum(0, z)', 'sıfırın altını keser', 'cuts below zero'],
    ['gelu = lambda z: z * sig(1.702 * z)', "ReLU'nun yumuşak hâli", 'smooth cousin of ReLU'],
    ['x = np.array([1.0, 0.0])', 'sol sensör 1, sağ 0', 'left sensor 1, right 0'],
    ['w, b = np.array([-5.6, 5.7]), 2.9', 'XOR ağı, 1. gizli nöron', 'XOR net, hidden neuron 1'],
    ['z = x @ w + b', '1) toplam', '1) sum'],
    ['a = sig(z)', '2) eğri', '2) curve'],
    ['h2 = sig(x @ [5.7, -5.6] + 2.9)', '2. gizli nöron', 'hidden neuron 2'],
    ['y = sig(-7 * a - 7 * h2 + 10.3)', '3) aktarım: cevap nöronu', '3) hand over: answer neuron'],
    ['print(f"z = {z:.1f}  a = {a:.2f}  y = {y:.2f}")'],
    ['for f in (sig, np.tanh, relu, gelu):', 'dört eğri', 'four curves'],
    ['    print(f(np.array([-2.0, 0.0, 2.0])).round(2))'],
    ['W1, b1 = np.array([.8, -1.2, 2.]), np.array([.5, 1., -1.])', 'eğrisiz iki katman', 'two layers, no curve'],
    ['W2, b2 = np.array([1.5, 0.7, -1.0]), 0.3'],
    ['X = np.linspace(-3, 3, 7)'],
    ['flat = (np.outer(X, W1) + b1) @ W2 + b2'],
    ['print(W1 @ W2, b1 @ W2 + b2)', 'bileşik ağırlık ve sapma', 'combined weight and bias'],
    ['print(np.allclose(flat, X * (W1 @ W2) + b1 @ W2 + b2))', 'tek doğru: True', 'a single line: True'],
    ['bent = np.tanh(np.outer(X, W1) + b1) @ W2 + b2', 'aynı ağ, eğriyle', 'same net, with a curve'],
    ['print(np.diff(flat, 2).round(3), np.diff(bent, 2).round(2))', 'bükülme: 0 ve 0 değil', 'bend: 0 and not 0'],
  ],
  params: [
    { key: 'x1', label: { tr: 'Sol sensör (girdi 1)', en: 'Left sensor (input 1)' }, min: 0, max: 1, step: 0.1, value: 1 },
    { key: 'x2', label: { tr: 'Sağ sensör (girdi 2)', en: 'Right sensor (input 2)' }, min: 0, max: 1, step: 0.1, value: 0 },
  ],
  run({ x1 = 1, x2 = 0 }) {
    const N = neuron(x1, x2)
    const base = { x1, x2, N }
    const F: AktFrame[] = []
    const T = (x: number, d: number): [string, string] => [fmt(x, d, 'tr').replace('-', '−'), x.toFixed(d).replace('-', '−')]
    const four = cap('sigmoid · tanh · ReLU · GELU', 'sigmoid · tanh · ReLU · GELU')
    F.push({ ...base, phase: 'curves', z: -4, step: 0, line: 1, cap: cap('sigmoid: her şeyi 0 ile 1 arasına sıkıştırır', 'sigmoid squashes everything between 0 and 1'), stat: four, hold: 1.8 })
    F.push({ ...base, phase: 'curves', z: -4, step: 0, line: 2, cap: cap('ReLU: sıfırın altını keser, gerisini tutar', 'ReLU cuts off everything below zero, keeps the rest'), stat: four, hold: 1.4 })
    F.push({ ...base, phase: 'curves', z: -4, step: 0, line: 3, cap: cap("GELU: ReLU'nun yumuşak kuzeni", 'GELU: the smooth cousin of ReLU'), stat: four, hold: 1.4 })
    for (let i = 0; i <= 80; i++) {
      const z = Math.round((-4 + i * 0.1) * 10) / 10
      const key = Math.abs(z) === 2 || z === 0
      const zs = T(z, 1)
      const vals = ACTS.map((A) => T(A.f(z), 2))
      F.push({
        ...base, phase: 'curves', z, step: 0, line: 12,
        cap: cap(`z = ${zs[0]}`, `z = ${zs[1]}`),
        stat: cap(`sigmoid ${vals[0][0]} · tanh ${vals[1][0]} · ReLU ${vals[2][0]} · GELU ${vals[3][0]}`, `sigmoid ${vals[0][1]} · tanh ${vals[1][1]} · ReLU ${vals[2][1]} · GELU ${vals[3][1]}`),
        hold: key ? 1.4 : 0.22,
      })
    }
    const z = T(N.z, 1), a = T(N.a, 2), h2 = T(N.h2, 2), y = T(N.y, 2), xs1 = T(x1, 1), xs2 = T(x2, 1)
    const nst = cap(`girdiler ${xs1[0]} ve ${xs2[0]}`, `inputs ${xs1[1]} and ${xs2[1]}`)
    F.push({ ...base, phase: 'neuron', z: N.z, step: 0, line: 4, cap: cap(`girdiler: sol sensör ${xs1[0]}, sağ sensör ${xs2[0]}`, `inputs: left sensor ${xs1[1]}, right sensor ${xs2[1]}`), stat: cap('bir nöron, üç adım', 'one neuron, three steps'), hold: 2 })
    F.push({ ...base, phase: 'neuron', z: N.z, step: 1, line: 5, cap: cap('ağırlıklar −5,6 ve 5,7, sapma 2,9', 'weights −5.6 and 5.7, bias 2.9'), stat: nst, hold: 1.6 })
    F.push({ ...base, phase: 'neuron', z: N.z, step: 2, line: 6, cap: cap(`1) toplam: z = ${z[0]}`, `1) sum: z = ${z[1]}`), stat: nst, hold: 2 })
    F.push({ ...base, phase: 'neuron', z: N.z, step: 3, line: 7, cap: cap(`2) eğri: sigmoid(${z[0]}) = ${a[0]}`, `2) curve: sigmoid(${z[1]}) = ${a[1]}`), stat: nst, hold: 2 })
    F.push({ ...base, phase: 'neuron', z: N.z, step: 4, line: 8, cap: cap(`yandaki gizli nöron: h₂ = ${h2[0]}`, `the other hidden neuron: h₂ = ${h2[1]}`), stat: nst, hold: 1.5 })
    F.push({ ...base, phase: 'neuron', z: N.z, step: 5, line: 9, cap: cap(`3) aktarım: cevap nöronu ${y[0]}`, `3) hand over: the answer neuron says ${y[1]}`), stat: cap(N.y > 0.5 ? 'XOR: evet, yalnız biri basılı' : 'XOR: hayır', N.y > 0.5 ? 'XOR: yes, exactly one is pressed' : 'XOR: no'), hold: 2.4 })
    F.push({ ...base, phase: 'neuron', z: N.z, step: 5, line: 10, cap: cap(`z = ${z[0]} · a = ${a[0]} · y = ${y[0]}`, `z = ${z[1]} · a = ${a[1]} · y = ${y[1]}`), stat: cap('toplam, eğri, aktarım', 'sum, curve, hand over'), hold: 2 })
    const C = composite(), cw = T(C.w, 2), cb = T(C.b, 2)
    const cst = cap('1 girdi → 3 gizli nöron → 1 çıktı', '1 input → 3 hidden neurons → 1 output')
    F.push({ ...base, phase: 'collapse', z: N.z, step: 0, line: 13, cap: cap('eğrisiz iki katman: her gizli nöron bir doğru', 'two layers, no curve: each hidden neuron is a line'), stat: cst, hold: 2 })
    F.push({ ...base, phase: 'collapse', z: N.z, step: 0, line: 14, cap: cap('çıktı nöronu bu doğruları ağırlıkla toplar', 'the output neuron adds the lines with weights'), stat: cst, hold: 1.4 })
    F.push({ ...base, phase: 'collapse', z: N.z, step: 1, line: 16, cap: cap('doğruların toplamı… yine bir doğru', 'the sum of lines… is again a line'), stat: cst, hold: 2 })
    F.push({ ...base, phase: 'collapse', z: N.z, step: 2, line: 17, cap: cap(`bileşik ağırlık ${cw[0]}, sapma ${cb[0]}`, `combined weight ${cw[1]}, bias ${cb[1]}`), stat: cap(`y = ${cw[0]}·x + ${cb[0]}`, `y = ${cw[1]}·x + ${cb[1]}`), hold: 2 })
    F.push({ ...base, phase: 'collapse', z: N.z, step: 2, line: 18, cap: cap('iki katman tek doğruya çöktü', 'two layers collapsed into one line'), stat: cap(`y = ${cw[0]}·x + ${cb[0]}`, `y = ${cw[1]}·x + ${cb[1]}`), hold: 2 })
    F.push({ ...base, phase: 'collapse', z: N.z, step: 3, line: 19, cap: cap('aynı ağırlıklar, araya tanh: çıktı bükülür', 'same weights, tanh in between: the output bends'), stat: cst, hold: 2.2 })
    F.push({ ...base, phase: 'collapse', z: N.z, step: 3, line: 20, cap: cap('ağı bir doğrudan fazlası yapan şey eğridir', 'the curve is what makes a network more than a line'), stat: cap('ikinci fark: eğrisiz 0, eğriyle 0 değil', 'second difference: 0 without, not 0 with the curve'), hold: 3 })
    return F
  },
}
