// Ders: zincir kuralı, geri yayılım ve gradyan inişi bir arada. 20 ölçüm: servo komutu → doyuma giden eklem açısı (S eğrisi).
// 1 girdi → 1 gizli nöron → 1 çıktı: tam iki ağırlık, bu yüzden bütün kayıp arazisi çizilebilir. Gradyan halkaların çarpımıdır.
import { cap, fmt, gauss, rng, type Frame, type Lesson } from './core'

export type ZkPhase = 'data' | 'model' | 'fwd' | 'dpred' | 'g2' | 'dz' | 'g1' | 'check' | 'step' | 'train'

export interface ChainInfo {
  /** Zinciri gösterilen nokta. */
  i: number
  dPred: number
  w2: number
  dh: number
  u: number
  part: number
  h: number
}

export interface ZkFrame extends Frame {
  u: number[]
  y: number[]
  /** (w1, w2) yolu ve kayıplar (paylaşılan); ilk k nokta çizilir. */
  path: Array<[number, number]>
  losses: number[]
  k: number
  lr: number
  phase: ZkPhase
  g?: [number, number]
  chain?: ChainInfo
  /** Dürtme ile ölçülen ∂L/∂w1 (ileri fark, e = 1e-6). */
  nudge?: number
}

const sig = (z: number) => 1 / (1 + Math.exp(-z))

/** Servo: komut u (−3…3) → eklem açısı ≈ 3·sig(2u) rad, ±0,2 gürültü. Gerçek ağırlıklar w1 = 2, w2 = 3. */
export function servoData(seed = 19) {
  const r = rng(seed)
  const u = Array.from({ length: 20 }, () => -3 + 6 * r()).sort((a, b) => a - b)
  const y = u.map((q) => 3 * sig(2 * q) + 0.2 * gauss(r))
  return { u, y }
}

export const predict = (w1: number, w2: number, u: number) => w2 * sig(w1 * u)

export function zkLoss(u: readonly number[], y: readonly number[], w1: number, w2: number): number {
  let s = 0
  for (let i = 0; i < u.length; i++) { const e = w2 * sig(w1 * u[i]) - y[i]; s += e * e }
  return s / u.length
}

/** Zincir kuralı: ∂L/∂ŷ bir kez hesaplanır, iki ağırlık için de kullanılır. */
export function zkGrad(u: readonly number[], y: readonly number[], w1: number, w2: number): [number, number] {
  let g1 = 0, g2 = 0
  const n = u.length
  for (let i = 0; i < n; i++) {
    const h = sig(w1 * u[i])
    const dPred = (2 * (w2 * h - y[i])) / n
    g2 += dPred * h
    g1 += dPred * w2 * h * (1 - h) * u[i]
  }
  return [g1, g2]
}

export const START: [number, number] = [0.2, 1.0]

export function zkTrain(u: readonly number[], y: readonly number[], lr: number, steps = 100) {
  let [w1, w2] = START
  const path: Array<[number, number]> = [[w1, w2]]
  const losses = [zkLoss(u, y, w1, w2)]
  for (let s = 0; s < steps; s++) {
    const [g1, g2] = zkGrad(u, y, w1, w2)
    w1 -= lr * g1; w2 -= lr * g2
    path.push([w1, w2]); losses.push(zkLoss(u, y, w1, w2))
  }
  return { path, losses }
}

export const ZINCIR_KURALI: Lesson<ZkFrame> = {
  slug: 'zincir-kurali',
  n: 0,
  title: { tr: 'Zincir kuralı: geri yayılım ile gradyan inişi buluşuyor', en: 'The chain rule: backpropagation meets gradient descent' },
  sub: { tr: 'İki ağırlıklı bir ağ, bütün kayıp arazisi ve halka halka türev', en: 'A two-weight network, its whole loss landscape and the derivative link by link' },
  story: {
    tr: "Bir robot kolunun eklem servosuna 20 farklı komut (−3 ile 3 arası) verdik ve eklemin açısını ölçtük (radyan). Açı önce hızla artar, sonra mekanik sınıra yaklaşınca doyar: bir S eğrisi. 1 girdi → 1 gizli nöron → 1 çıktılık ağın tam iki ağırlığı var (w1 eğriyi diker, w2 yüksekliğini belirler); bu yüzden bütün kayıp arazisini çizebiliyoruz. Veriyi üreten gerçek değerler 2 ve 3.",
    en: "We sent 20 different commands (between −3 and 3) to a robot arm's joint servo and measured the joint angle (radians). The angle first rises quickly, then saturates near the mechanical limit: an S curve. A 1 input → 1 hidden neuron → 1 output network has exactly two weights (w1 sets the steepness, w2 the height), so we can draw its whole loss landscape. The true values behind the data are 2 and 3.",
  },
  how: [
    { tr: 'Türev bir eğimdir: ağırlık çok az oynayınca kaybın ne kadar değiştiği. Diğer ağırlık sabitken alınan türev kısmi türevdir; ikisinin listesi gradyandır.', en: 'A derivative is a slope: how much the loss changes when a weight moves a tiny bit. Taken for one weight while the other holds still, it is a partial derivative; the list of both is the gradient.' },
    { tr: 'Zincir kuralı: kayıp, w1’e dört halkalık bir zincirle bağlı (w1 → z → h → ŷ → kayıp). Her halkanın eğimi çarpılır: ∂L/∂w1 = ∂L/∂ŷ · ∂ŷ/∂h · ∂h/∂z · ∂z/∂w1.', en: 'The chain rule: the loss is tied to w1 by a chain of four links (w1 → z → h → ŷ → loss). The slopes of the links multiply: ∂L/∂w1 = ∂L/∂ŷ · ∂ŷ/∂h · ∂h/∂z · ∂z/∂w1.' },
    { tr: 'Geri yayılım bu çarpımı kayıptan geriye doğru yapar ve çıkıştaki eğimi (∂L/∂ŷ) iki ağırlık için de yeniden kullanır. Gradyan inişi o gradyanla adım atar: yeni ağırlık = ağırlık − öğrenme oranı × eğim.', en: 'Backpropagation does this product backwards from the loss and reuses the slope at the output (∂L/∂ŷ) for both weights. Gradient descent then steps with that gradient: new weight = weight − learning rate × slope.' },
    { tr: "PyTorch'ta aynı ayrım görünür: loss.backward() geri yayılımı çalıştırır, optimizer.step() gradyan adımını atar.", en: 'PyTorch shows the same split: loss.backward() runs backpropagation, optimizer.step() takes the gradient step.' },
    { tr: 'Şunu dene: öğrenme oranını 0,1 yap; 10. adımda kayıp hâlâ 0,6 civarındadır ve 100 adımda w1 ancak 1,6’ya gelir. 1,5 yap: ilk adımlarda vadiye büyük sıçramalarla iner.', en: 'Try this: set the learning rate to 0.1; at step 10 the loss is still around 0.6 and after 100 steps w1 only reaches 1.6. Set it to 1.5: it drops into the valley in big jumps.' },
  ],
  why: {
    tr: 'Derin öğrenme kütüphanelerinin hepsi bu iki parçanın üstüne kurulu: türevleri zincir kuralıyla otomatik hesaplayan bir motor (autograd) ve o türevlerle adım atan bir optimizasyoncu. Robotikte eklem ve motor modellerinin doyum eğrileri, sensör tepkileri ve öğrenen kontrolcüler aynı yolla ayarlanır.',
    en: 'Every deep learning library is built on these two parts: an engine that computes derivatives automatically with the chain rule (autograd) and an optimizer that steps with them. In robotics, saturation curves of joint and motor models, sensor responses and learned controllers are fitted the same way.',
  },
  file: 'zincir_kurali.py',
  code: [
    ['import numpy as np'],
    ['sig = lambda z: 1 / (1 + np.exp(-z))'],
    ['rng = np.random.default_rng(19)'],
    ['u = np.sort(rng.uniform(-3, 3, 20))', 'servo komutu', 'servo command'],
    ['y = 3 * sig(2 * u) + rng.normal(0, 0.2, 20)', 'eklem açısı (rad)', 'joint angle (rad)'],
    ['w1, w2, lr = 0.2, 1.0, 0.5', 'iki ağırlık', 'two weights'],
    ['def loss(w1, w2):'],
    ['    return np.mean((w2 * sig(w1 * u) - y) ** 2)'],
    ['print(f"başta kayıp {loss(w1, w2):.2f}")'],
    ['for step in range(100):'],
    ['    z = w1 * u', 'halka 1', 'link 1'],
    ['    h = sig(z)', 'halka 2: gizli nöron', 'link 2: hidden neuron'],
    ['    pred = w2 * h', 'halka 3: çıktı', 'link 3: output'],
    ['    d_pred = 2 * (pred - y) / len(u)', '∂L/∂ŷ, bir kez', '∂L/∂ŷ, once'],
    ['    g2 = np.sum(d_pred * h)', '∂ŷ/∂w2 = h', '∂ŷ/∂w2 = h'],
    ['    d_z = d_pred * w2 * h * (1 - h)', '· ∂ŷ/∂h · ∂h/∂z', '· ∂ŷ/∂h · ∂h/∂z'],
    ['    g1 = np.sum(d_z * u)', '· ∂z/∂w1 = u', '· ∂z/∂w1 = u'],
    ['    if step == 0:', 'kontrol: w1’i dürt', 'check: nudge w1'],
    ['        num = (loss(w1 + 1e-6, w2) - loss(w1, w2)) / 1e-6'],
    ['        print(f"g1 {g1:.7f}  dürtme {num:.7f}")'],
    ['    w1, w2 = w1 - lr * g1, w2 - lr * g2', 'optimizer.step()', 'optimizer.step()'],
    ['print(f"kayıp {loss(w1, w2):.3f}  w {w1:.2f} {w2:.2f}")'],
  ],
  params: [{ key: 'lr', label: { tr: 'Öğrenme oranı', en: 'Learning rate' }, min: 0.1, max: 1.5, step: 0.1, value: 0.5 }],
  run({ lr = 0.5 }) {
    const { u, y } = servoData()
    const { path, losses } = zkTrain(u, y, lr, 100)
    const base = { u, y, path, losses, lr }
    const F: ZkFrame[] = []
    const [w1, w2] = START
    const g = zkGrad(u, y, w1, w2)
    // zinciri gösterilecek nokta: ∂L/∂w1'e en çok katkı veren
    let bi = 0, bv = -1
    const info = u.map((q, i) => {
      const h = sig(w1 * q), dPred = (2 * (w2 * h - y[i])) / u.length, dh = h * (1 - h)
      const part = dPred * w2 * dh * q
      if (Math.abs(part) > bv) { bv = Math.abs(part); bi = i }
      return { i, dPred, w2, dh, u: q, part, h }
    })
    const chain = info[bi]
    const nudge = (zkLoss(u, y, w1 + 1e-6, w2) - zkLoss(u, y, w1, w2)) / 1e-6
    const L0 = losses[0], Ln = losses[losses.length - 1]
    const ws = (i: number) => cap(`w1 = ${fmt(path[i][0], 2, 'tr')}, w2 = ${fmt(path[i][1], 2, 'tr')}`, `w1 = ${path[i][0].toFixed(2)}, w2 = ${path[i][1].toFixed(2)}`)
    F.push({ ...base, k: 0, phase: 'data', line: 4, cap: cap('20 ölçüm: servo komutu → eklem açısı', '20 measurements: servo command → joint angle'), stat: cap('açı doyuyor: S eğrisi', 'the angle saturates: an S curve'), hold: 2 })
    F.push({ ...base, k: 1, phase: 'model', line: 5, cap: cap(`ŷ = w2 · sig(w1 · u), başta kayıp ${fmt(L0, 2, 'tr')}`, `ŷ = w2 · sig(w1 · u), loss at start ${L0.toFixed(2)}`), stat: ws(0), hold: 2 })
    F.push({ ...base, k: 1, phase: 'fwd', line: 12, cap: cap('ileri: z = w1·u → h = sig(z) → ŷ = w2·h', 'forward: z = w1·u → h = sig(z) → ŷ = w2·h'), stat: ws(0), hold: 1.5 })
    F.push({ ...base, k: 1, phase: 'dpred', chain, g, line: 13, cap: cap('halka 1: kayıp ŷ’ye göre ne kadar eğimli?', 'link 1: how steep is the loss with respect to ŷ?'), stat: cap('bir kez hesaplanır, iki ağırlık da kullanır', 'computed once, used by both weights'), hold: 1.8 })
    F.push({ ...base, k: 1, phase: 'g2', chain, g, line: 14, cap: cap(`∂L/∂w2 = Σ ∂L/∂ŷ · h = ${fmt(g[1], 4, 'tr')}`, `∂L/∂w2 = Σ ∂L/∂ŷ · h = ${g[1].toFixed(4)}`), stat: cap('w2’ye giden zincir kısa', 'the chain to w2 is short'), hold: 1.8 })
    F.push({ ...base, k: 1, phase: 'dz', chain, g, line: 15, cap: cap('halka 2 ve 3: ∂ŷ/∂h = w2, ∂h/∂z = h(1 − h)', 'links 2 and 3: ∂ŷ/∂h = w2, ∂h/∂z = h(1 − h)'), stat: cap('çarpanlar geriye doğru eklenir', 'factors are added backwards'), hold: 1.8 })
    F.push({ ...base, k: 1, phase: 'g1', chain, g, line: 16, cap: cap(`halka 4: ∂z/∂w1 = u → ∂L/∂w1 = ${fmt(g[0], 7, 'tr')}`, `link 4: ∂z/∂w1 = u → ∂L/∂w1 = ${g[0].toFixed(7)}`), stat: cap('20 noktanın katkısı toplanır', 'the 20 points’ shares are summed'), hold: 2.2 })
    F.push({ ...base, k: 1, phase: 'check', chain, g, nudge, line: 18, cap: cap(`dürtme ${fmt(nudge, 7, 'tr')} · geri yayılım ${fmt(g[0], 7, 'tr')}`, `nudge ${nudge.toFixed(7)} · backprop ${g[0].toFixed(7)}`), stat: cap('fark dürtmenin kendi hatası: 0,000001 sıfır değil', 'the gap is the nudge’s own error: 0.000001 is not zero'), hold: 2.6 })
    F.push({ ...base, k: 2, phase: 'step', g, line: 20, cap: cap(`adım 1: kayıp ${fmt(L0, 3, 'tr')} → ${fmt(losses[1], 3, 'tr')}`, `step 1: loss ${L0.toFixed(3)} → ${losses[1].toFixed(3)}`), stat: ws(1), hold: 1.6 })
    for (let s = 2; s <= 100; s++) {
      F.push({ ...base, k: s + 1, phase: 'train', line: 20, cap: cap(`adım ${s}: kayıp ${fmt(losses[s], 3, 'tr')}`, `step ${s}: loss ${losses[s].toFixed(3)}`), stat: ws(s), hold: s < 10 ? 0.6 : 0.25 })
    }
    F.push({ ...base, k: 101, phase: 'train', line: 21, cap: cap(`100 adım: kayıp ${fmt(L0, 2, 'tr')} → ${fmt(Ln, 3, 'tr')}`, `100 steps: loss ${L0.toFixed(2)} → ${Ln.toFixed(3)}`), stat: cap(`w1 = ${fmt(path[100][0], 2, 'tr')}, w2 = ${fmt(path[100][1], 2, 'tr')} (gerçek 2 ve 3)`, `w1 = ${path[100][0].toFixed(2)}, w2 = ${path[100][1].toFixed(2)} (true 2 and 3)`), hold: 3 })
    return F
  },
}
