// Proje: robot kol hedefe uzanır. Üç eklemli kol (taban dönüşü, omuz, dirsek; kollar 0,5 ve 0,4 m). İleri kinematik kolay:
// açılar verilince uç noktası trigonometriyle çıkar. Ters kinematik (hedef noktadan açılar) zordur; burada küçük bir sinir ağı
// öğrenir. Veri: rastgele açılar → ileri kinematikle uç noktası; ağ tersini öğrenir: (x, y, z) → açılar. Yalnız "dirsek yukarı"
// dalı kullanılır, böylece her hedefin tek bir cevabı vardır. Başarı, ağın verdiği açılar ileri kinematikten geçirilip hedefe
// olan uzaklıkla (cm) ölçülür. Ağ, dersteki ağın genel hâli (./nn): tanh gizli katmanlar, Adam ve ortalama kare hata.
import { cap, fmt, rng, type Cap } from '../core'
import type { Metric, ProjectDef, ProjectRun } from './core'
import { adamState, nnCreate, nnForward, nnTrainBatch, type NN } from './nn'

/** Kol ölçüleri (m): omuz yüksekliği, üst kol, ön kol. */
export const ARM = { h0: 0.2, L1: 0.5, L2: 0.4 }
const D = Math.PI / 180
/** Eklem sınırları (radyan): taban ±120°, omuz 15–100° (yataydan), dirsek −140…−20° (üst kola göre; negatif = dirsek yukarı). */
export const LIMITS: Array<[number, number]> = [[-120 * D, 120 * D], [15 * D, 100 * D], [-140 * D, -20 * D]]
export type Angles = [number, number, number]
export type Vec3 = [number, number, number]

/** İleri kinematik: açılar → uç nokta (x, y yatay, z yukarı). */
export function fk([q0, q1, q2]: Angles): Vec3 {
  const r = ARM.L1 * Math.cos(q1) + ARM.L2 * Math.cos(q1 + q2)
  const z = ARM.h0 + ARM.L1 * Math.sin(q1) + ARM.L2 * Math.sin(q1 + q2)
  return [r * Math.cos(q0), r * Math.sin(q0), z]
}
/** Dirsek noktası (sahne için). */
export function elbow([q0, q1]: Angles): Vec3 {
  const r = ARM.L1 * Math.cos(q1)
  return [r * Math.cos(q0), r * Math.sin(q0), ARM.h0 + ARM.L1 * Math.sin(q1)]
}
export const dist = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
const clamp = (v: number, [lo, hi]: [number, number]) => Math.min(hi, Math.max(lo, v))

export function randomAngles(r: () => number): Angles {
  return LIMITS.map(([lo, hi]) => lo + (hi - lo) * r()) as Angles
}

/** Ağ girdisi: hedef, ölçekli (yaklaşık −1…1). */
export const encodeIn = ([x, y, z]: Vec3): number[] => [x / 0.9, y / 0.9, (z - ARM.h0) / 0.9]
const mid = (k: number) => (LIMITS[k][0] + LIMITS[k][1]) / 2
const half = (k: number) => (LIMITS[k][1] - LIMITS[k][0]) / 2
/** Ağ çıktısı: taban açısı cos/sin olarak (sarma sorunu yok), omuz ve dirsek sınırlarına göre −1…1. */
export const encodeOut = ([q0, q1, q2]: Angles): number[] => [Math.cos(q0), Math.sin(q0), (q1 - mid(1)) / half(1), (q2 - mid(2)) / half(2)]
export const decodeOut = (o: ArrayLike<number>): Angles => [
  clamp(Math.atan2(o[1], o[0]), LIMITS[0]),
  clamp(mid(1) + o[2] * half(1), LIMITS[1]),
  clamp(mid(2) + o[3] * half(2), LIMITS[2]),
]
export const solve = (net: NN, t: Vec3): Angles => decodeOut(nnForward(net, encodeIn(t)))

/** Rastgele açılardan veri: [hedef, açılar]. */
export function armData(n: number, seed: number) {
  const r = rng(seed)
  return Array.from({ length: n }, () => { const q = randomAngles(r); return { t: fk(q), q } })
}

/** Ağın verdiği açılarla uca kalan ortalama uzaklık (cm). */
export function meanErrorCm(net: NN, targets: Vec3[]): number {
  return (targets.reduce((s, t) => s + dist(fk(solve(net, t)), t), 0) / targets.length) * 100
}

export interface KolView {
  /** Gösterim hedefleri ve ağın bu hedefler için verdiği açılar (değerlendirmede güncellenir). */
  demo: Vec3[]
  demoAngles: Angles[]
  demoErr: number[]
  /** Sahnenin şu an gösterdiği hedef (sahne zamanla değiştirir; ölçüm kutusu buradan okur). */
  focus: number
  /** Saklı test hedefleri (sahnede soluk noktalar). */
  test: Vec3[]
  step: number
  err: number
}

export const BATCH = 32
const MAX_STEPS = 24000
export const GOAL_CM = 2

/** Bir eğitim koşusu: her iş birimi bir mini grup (32 örnek) üzerinde bir Adam adımı. */
export function createKol(p: Record<string, number>): ProjectRun<KolView> & { net: NN; steps(): number; errHist: number[]; lossHist: number[] } {
  const seed = Math.round(p.seed ?? 1), H = Math.round(p.H ?? 32), lr = p.lr ?? 0.01, N = Math.round(p.n ?? 2000)
  const r = rng(seed * 7919 + 3)
  const net = nnCreate([3, H, H, 4], r)
  const opt = adamState(net)
  const data = armData(N, seed)
  const X = data.map((d) => encodeIn(d.t)), Y = data.map((d) => encodeOut(d.q))
  const test = armData(200, 9001).map((d) => d.t)
  const demo = armData(8, 777 + seed).map((d) => d.t)
  const view: KolView = { demo, demoAngles: demo.map((t) => solve(net, t)), demoErr: [], focus: 0, test, step: 0, err: meanErrorCm(net, test) }
  view.demoErr = demo.map((t, i) => dist(fk(view.demoAngles[i]), t) * 100)
  const errHist = [view.err], lossHist: number[] = []
  let lossAcc = 0, lossN = 0, steps = 0
  const bx: number[][] = new Array(BATCH), by: number[][] = new Array(BATCH)
  const evaluate = () => {
    view.err = meanErrorCm(net, test)
    view.demoAngles = demo.map((t) => solve(net, t))
    view.demoErr = demo.map((t, i) => dist(fk(view.demoAngles[i]), t) * 100)
    errHist.push(view.err)
    if (lossN) { lossHist.push(lossAcc / lossN); lossAcc = 0; lossN = 0 }
  }
  const done = () => view.err < GOAL_CM || steps >= MAX_STEPS
  return {
    net, view, errHist, lossHist,
    steps: () => steps,
    step(n) {
      for (let k = 0; k < n && !done(); k++) {
        for (let b = 0; b < BATCH; b++) { const i = Math.floor(r() * N); bx[b] = X[i]; by[b] = Y[i] }
        lossAcc += nnTrainBatch(net, opt, bx, by, lr); lossN++
        steps++
        view.step = steps
        if (steps % 200 === 0) evaluate()
      }
    },
    status(): Cap {
      return done() && view.err < GOAL_CM
        ? cap(`${steps.toLocaleString('tr-TR')} adımda hedef: ortalama hata ${fmt(view.err, 1, 'tr')} cm`, `goal after ${steps.toLocaleString('en-US')} steps: mean error ${view.err.toFixed(1)} cm`)
        : cap(`eğitim adımı ${steps.toLocaleString('tr-TR')} · ortalama hata ${fmt(view.err, 1, 'tr')} cm`, `training step ${steps.toLocaleString('en-US')} · mean error ${view.err.toFixed(1)} cm`)
    },
    metrics(): Metric[] {
      const f = view.focus % demo.length, e = view.demoErr[f] ?? 0
      const loss = lossHist.at(-1)
      return [
        { label: { tr: 'Saklı 200 hedefte ortalama hata', en: 'Mean error on 200 hidden targets' }, value: cap(`${fmt(view.err, 1, 'tr')} cm`, `${view.err.toFixed(1)} cm`), tone: view.err < GOAL_CM ? 'good' : undefined },
        { label: { tr: `Şu anki hedef (${f + 1} / ${demo.length})`, en: `Current target (${f + 1} / ${demo.length})` }, value: cap(`${fmt(e, 1, 'tr')} cm`, `${e.toFixed(1)} cm`), tone: e < GOAL_CM ? 'good' : e > 10 ? 'bad' : undefined },
        { label: { tr: 'Eğitim kaybı (MSE)', en: 'Training loss (MSE)' }, value: loss === undefined ? cap('—', '—') : cap(fmt(loss, 4, 'tr'), loss.toFixed(4)) },
        { label: { tr: 'Mini grup adımı', en: 'Mini-batch steps' }, value: cap(steps.toLocaleString('tr-TR'), steps.toLocaleString('en-US')) },
        { label: { tr: 'Ağ', en: 'Network' }, value: cap(`3 → ${H} → ${H} → 4 · ${N} örnek`, `3 → ${H} → ${H} → 4 · ${N} samples`) },
      ]
    },
    curves() {
      return [
        { label: { tr: 'Saklı hedeflerde ortalama hata (cm)', en: 'Mean error on hidden targets (cm)' }, values: [...errHist] },
        { label: { tr: 'Eğitim kaybı (log)', en: 'Training loss (log)' }, values: lossHist.map((l) => Math.log10(l)), tone: 1 as const },
      ]
    },
    done,
  }
}

export const ROBOT_KOL: ProjectDef<KolView> = {
  slug: 'robot-kol',
  title: { tr: 'Robot kol hedefe uzanır', en: 'A robot arm reaches for a target' },
  sub: { tr: 'Üç eklemli kolun ters kinematiğini küçük bir sinir ağı öğrenir', en: 'A small neural network learns the inverse kinematics of a three-joint arm' },
  story: {
    tr: 'Masaya vidalı üç eklemli bir kol: taban sağa sola döner, omuz ve dirsek yukarı aşağı. Kamera bir parçanın yerini (x, y, z) söylüyor; kolun ucunu oraya götürmek için üç motorun hangi açıya döneceğini bulmamız gerek. Açılardan uç noktasını hesaplamak kolay (ileri kinematik), tersi zor. Formül türetmek yerine kolu rastgele açılarda gezdirip nereye vardığını kaydediyor ve tersini bir ağa öğretiyoruz.',
    en: 'A three-joint arm bolted to a table: the base turns left and right, the shoulder and elbow move up and down. A camera reports where a part is (x, y, z); we need the angles for the three motors that bring the tip of the arm there. Computing the tip from the angles is easy (forward kinematics), the reverse is hard. Instead of deriving a formula we move the arm to random angles, record where it ends up, and teach a network the reverse.',
  },
  goal: {
    tr: 'Kolun hiç görmediği 200 hedefte ortalama uzaklık 2 cm’nin altına inince eğitim biter.',
    en: 'Training ends when the mean distance on 200 targets the arm has never seen drops below 2 cm.',
  },
  model: {
    tr: 'Çok katmanlı sinir ağı ile regresyon: 3 girdi (hedef), iki tanh gizli katman, 4 çıktı (taban açısının kosinüs ve sinüsü, omuz ve dirsek açısı). Kayıp ortalama kare hata, ağırlıklar geri yayılım ve Adam ile güncellenir; doğrusal regresyon, sinir ağı, gradyan inişi ve geri yayılım derslerindeki parçaların aynısı.',
    en: 'Regression with a multi-layer neural network: 3 inputs (the target), two tanh hidden layers, 4 outputs (cosine and sine of the base angle, shoulder and elbow angle). The loss is mean squared error and the weights are updated with backpropagation and Adam: the same parts as in the linear regression, neural network, gradient descent and backpropagation lessons.',
  },
  lessons: ['dogrusal-regresyon', 'sinir-agi', 'gradyan-inisi', 'geri-yayilim', 'asiri-ogrenme'],
  steps: [
    { tr: 'Veri: kol rastgele açılara getirilir, ileri kinematikle ucun vardığı nokta hesaplanır. Her örnek bir (nokta, açılar) çiftidir. Yalnız “dirsek yukarı” duruşlar kullanılır; aynı noktaya iki farklı duruşla varılabildiği için ağın kafası karışmasın.', en: 'Data: the arm is moved to random angles and forward kinematics gives the point the tip reaches. Each sample is a (point, angles) pair. Only “elbow up” poses are used: the same point can be reached with two poses, and that would confuse the network.' },
    { tr: 'Ağ ters yönde çalışır: nokta girer, açılar çıkar. Taban açısı doğrudan değil, kosinüs ve sinüsüyle öğrenilir; böylece −120° ile +120° arasında atlama olmaz.', en: 'The network runs the other way: a point goes in, angles come out. The base angle is learned as its cosine and sine rather than directly, so there is no jump between −120° and +120°.' },
    { tr: 'Her adımda 32 örneklik bir mini grupta tahmin edilen açılar gerçek açılarla karşılaştırılır; ortalama kare hata geri yayılımla ağırlıklara paylaştırılır ve Adam küçük bir adım atar.', en: 'At every step the predicted angles of a 32-sample mini-batch are compared with the true angles; backpropagation shares the mean squared error among the weights and Adam takes a small step.' },
    { tr: 'Asıl ölçüt açı hatası değil, ucun hedefe uzaklığıdır: ağın verdiği açılar ileri kinematikten geçirilir ve kolun hiç görmediği 200 hedefte ortalama uzaklık (cm) ölçülür.', en: 'The real measure is not the angle error but the distance from the tip to the target: the network’s angles go through forward kinematics and the mean distance (cm) is measured on 200 targets the arm has never seen.' },
    { tr: 'Sahnede kol sekiz hedefe sırayla uzanır. Eğitimin başında uç hedefin çok uzağında kalır; hata düştükçe kıskaç hedefe oturur ve aradaki çizgi kırmızıdan yeşile döner.', en: 'In the scene the arm reaches for eight targets in turn. At the start of training the tip stays far from the target; as the error falls the gripper settles on the target and the line between them turns from red to green.' },
  ],
  task: [
    { tr: 'Gizli nöron sayısını 4’e indir. Ağ bu kadar az nöronla kolun eğri yüzeyini çizemez: hata 7 cm civarında takılır ve 24.000 adımlık bütçe hedefe ulaşmadan biter. 8 nöronla 3 cm civarında kalır; 32 nöron 7.600 adımda 2 cm’nin altına iner.', en: 'Lower the hidden neurons to 4. With so few neurons the network cannot draw the curved surface of the arm: the error gets stuck around 7 cm and the 24,000-step budget runs out before the goal. With 8 neurons it stays around 3 cm; 32 neurons get below 2 cm in 7,600 steps.' },
    { tr: 'Öğrenme oranını 0,03’e çıkar. Adımlar büyüdüğü için hata düzgün inmez, zıplar: 3.000. adımdaki hata 1.000. adımdakinden kötüdür ve hedefe 7.600 yerine 18.800 adımda ulaşılır.', en: 'Raise the learning rate to 0.03. The steps are bigger, so the error does not fall smoothly but jumps around: the error at step 3,000 is worse than at step 1,000, and the goal is reached after 18,800 steps instead of 7,600.' },
    { tr: 'Eğitim örneğini 50’ye indir. Eğitim kaybı 2.000 örnektekinden bile düşer (0,00004), ama kolun görmediği hedeflerde hata 6–7 cm’de kalır: ağ 50 duruşu ezberlemiştir, aradaki boşlukları bilmez. Aşırı öğrenme dersindeki durumun aynısı.', en: 'Lower the training samples to 50. The training loss falls even lower than with 2,000 samples (0.00004), but on targets the arm has not seen the error stays at 6–7 cm: the network has memorised 50 poses and knows nothing about the gaps between them. The same situation as in the overfitting lesson.' },
  ],
  file: 'robot_kol.py',
  code: [
    ['import numpy as np'],
    ['h0, L1, L2 = 0.2, 0.5, 0.4', 'omuz yüksekliği, üst kol, ön kol (m)', 'shoulder height, upper arm, forearm (m)'],
    ['lo = np.radians([-120, 15, -140]); hi = np.radians([120, 100, -20])', 'eklem sınırları, dirsek yukarı', 'joint limits, elbow up'],
    ['def fk(q):', 'ileri kinematik', 'forward kinematics'],
    ['    r = L1 * np.cos(q[:, 1]) + L2 * np.cos(q[:, 1] + q[:, 2])'],
    ['    z = h0 + L1 * np.sin(q[:, 1]) + L2 * np.sin(q[:, 1] + q[:, 2])'],
    ['    return np.c_[r * np.cos(q[:, 0]), r * np.sin(q[:, 0]), z]'],
    ['rng = np.random.default_rng(1)'],
    ['q = rng.uniform(lo, hi, (2000, 3))', 'rastgele duruşlar', 'random poses'],
    ['X = fk(q) / 0.9; X[:, 2] -= h0 / 0.9', 'girdi: uç noktası', 'input: tip position'],
    ['mid, half = (lo + hi) / 2, (hi - lo) / 2'],
    ['Y = np.c_[np.cos(q[:, 0]), np.sin(q[:, 0]), ((q - mid) / half)[:, 1:]]', 'çıktı: açılar', 'output: angles'],
    ['sizes = [3, 32, 32, 4]'],
    ['W = [rng.normal(0, 1 / np.sqrt(a), (a, b)) for a, b in zip(sizes, sizes[1:])]'],
    ['B = [np.zeros(b) for b in sizes[1:]]'],
    ['for step in range(20000):'],
    ['    i = rng.integers(0, len(X), 32)', 'mini grup', 'mini-batch'],
    ['    a = [X[i]]'],
    ['    for k in range(3): z = a[-1] @ W[k] + B[k]; a.append(np.tanh(z) if k < 2 else z)', 'ileri', 'forward'],
    ['    d = 2 * (a[-1] - Y[i]) / a[-1].size', 'ortalama kare hatanın türevi', 'derivative of mean squared error'],
    ['    for k in (2, 1, 0):', 'geri yayılım', 'backpropagation'],
    ['        gW, gB = a[k].T @ d, d.sum(0)'],
    ['        if k: d = (d @ W[k].T) * (1 - a[k] ** 2)'],
    ['        W[k] -= 0.01 * gW; B[k] -= 0.01 * gB', 'basitlik için düz adım (projede Adam)', 'plain step for simplicity (Adam in the project)'],
    ['def ik(p):', 'ters kinematik: ağın cevabı', 'inverse kinematics: the network’s answer'],
    ['    a = (p - [0, 0, h0]) / 0.9'],
    ['    for k in range(3): a = a @ W[k] + B[k]; a = np.tanh(a) if k < 2 else a'],
    ['    return np.r_[np.arctan2(a[1], a[0]), mid[1:] + a[2:] * half[1:]]'],
    ['test = fk(rng.uniform(lo, hi, (200, 3)))'],
    ['print(np.mean([np.linalg.norm(fk(ik(p)[None])[0] - p) for p in test]) * 100, "cm")', 'ucun hedefe ortalama uzaklığı', 'mean distance of the tip to the target'],
  ],
  params: [
    { key: 'H', label: { tr: 'Gizli nöron (katman başına)', en: 'Hidden neurons (per layer)' }, min: 4, max: 64, step: 4, value: 32 },
    { key: 'lr', label: { tr: 'Öğrenme oranı', en: 'Learning rate' }, min: 0.001, max: 0.05, step: 0.001, value: 0.01 },
    { key: 'n', label: { tr: 'Eğitim örneği', en: 'Training samples' }, min: 50, max: 4000, step: 50, value: 2000 },
    { key: 'seed', label: { tr: 'Tohum', en: 'Seed' }, min: 1, max: 20, step: 1, value: 1 },
  ],
  perFrame: 2,
  create: createKol,
}
