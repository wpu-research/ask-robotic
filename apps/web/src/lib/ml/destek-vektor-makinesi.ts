// Ders: destek vektör makinesi (doğrusal SVM). Ayıklama bandında iki parça türü: yük hücresi ağırlığı (g) ve lazer kapısı
// uzunluğu (mm). Hinge kaybı + L2 cezası, ikili (dual) problemde nokta nokta çözülür (tek değişkenli SMO); marj öğrenirken daralır.
import { cap, fmt, gauss, mean, rng, std, type Frame, type Lesson, type Pt } from './core'

export interface SvmFrame extends Frame {
  /** 80 parça (x: ağırlık g, y: uzunluk mm, c: 0 tip A, 1 tip B). Paylaşılan referans. */
  X: Pt[]
  /** Ölçekleme: z = (x − mu) / sd. */
  mu: [number, number]
  sd: [number, number]
  /** Ölçekli uzayda [w0, w1, b]: f = w0·z0 + w1·z1 + b. */
  w: [number, number, number]
  /** Her noktanın α'sı (0 ≤ α ≤ C); α > 0 olanlar destek vektörü. null: henüz başlamadı. */
  alpha: number[] | null
  C: number
  epoch: number
  /** Şu an güncellenen nokta. */
  at?: number
  /** Dönem sonlarında marj genişliği 2/‖w‖ (ölçekli birim). */
  hist: number[]
  /** Sonuç: eğitim hatası, destek vektörü sayısı, marj genişliği (ölçekli birim). */
  errors?: number
  nsv?: number
  margin?: number
}

/** Tip A (küçük braket) ve tip B (büyük braket): ağırlık g, uzunluk mm; sabit tohum. */
export function partsData(seed = 4): Pt[] {
  const r = rng(seed)
  const X: Pt[] = []
  for (let i = 0; i < 40; i++) X.push({ x: 24 + 2.2 * gauss(r), y: 32 + 2.8 * gauss(r), c: 0 })
  for (let i = 0; i < 40; i++) X.push({ x: 34 + 2.2 * gauss(r), y: 47 + 2.8 * gauss(r), c: 1 })
  return X
}

export interface SvmFit {
  Z: Array<[number, number, number]>
  y: number[]
  mu: [number, number]
  sd: [number, number]
  w: [number, number, number]
  alpha: number[]
  /** Her dönem sonundaki [w, α] ve amaç. */
  epochs: Array<{ w: [number, number, number]; alpha: number[]; obj: number }>
  /** İlk dönemin adım adım kaydı (nokta, w, α sonrası). */
  first: Array<{ i: number; G: number; w: [number, number, number]; alpha: number[] }>
}

export const svmObjective = (Z: SvmFit['Z'], y: number[], w: [number, number, number], C: number): number =>
  0.5 * (w[0] ** 2 + w[1] ** 2 + w[2] ** 2) + C * Z.reduce((s, z, i) => s + Math.max(0, 1 - y[i] * (w[0] * z[0] + w[1] * z[1] + w[2] * z[2])), 0)

/** İkili koordinat inişi: her nokta için α'yı kendi en iyi değerine taşı, [0, C] aralığına kırp; w = Σ α y z. */
export function trainSvm(X: Pt[], C: number, seed = 4, maxEpochs = 50): SvmFit {
  const r = rng(seed * 31 + 7)
  const xs = X.map((p) => p.x), ys = X.map((p) => p.y)
  const mu: [number, number] = [mean(xs), mean(ys)], sd: [number, number] = [std(xs), std(ys)]
  const Z = X.map((p) => [(p.x - mu[0]) / sd[0], (p.y - mu[1]) / sd[1], 1] as [number, number, number])
  const y = X.map((p) => (p.c ? 1 : -1))
  const n = X.length
  const a = new Array<number>(n).fill(0)
  const w: [number, number, number] = [0, 0, 0]
  const epochs: SvmFit['epochs'] = [], first: SvmFit['first'] = []
  for (let e = 0; e < maxEpochs; e++) {
    // karıştır (Fisher-Yates)
    const order = Array.from({ length: n }, (_, i) => i)
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]] }
    let moved = 0
    for (const i of order) {
      const z = Z[i]
      const G = y[i] * (w[0] * z[0] + w[1] * z[1] + w[2] * z[2]) - 1
      const q = z[0] * z[0] + z[1] * z[1] + z[2] * z[2]
      const nw = Math.min(C, Math.max(0, a[i] - G / q))
      const d = (nw - a[i]) * y[i]
      w[0] += d * z[0]; w[1] += d * z[1]; w[2] += d * z[2]
      moved = Math.max(moved, Math.abs(nw - a[i]))
      a[i] = nw
      if (e === 0) first.push({ i, G, w: [...w] as [number, number, number], alpha: [...a] })
    }
    epochs.push({ w: [...w] as [number, number, number], alpha: [...a], obj: svmObjective(Z, y, w, C) })
    if (moved < 1e-7) break
  }
  return { Z, y, mu, sd, w, alpha: a, epochs, first }
}

/** Ölçekli uzaydaki karar değeri, fiziksel birimlerde (g, mm). */
export const svmF = (w: readonly number[], mu: readonly number[], sd: readonly number[], x: number, y: number): number =>
  w[0] * ((x - mu[0]) / sd[0]) + w[1] * ((y - mu[1]) / sd[1]) + w[2]

export function svmSummary(fit: SvmFit, C: number) {
  const f = fit.Z.map((z) => fit.w[0] * z[0] + fit.w[1] * z[1] + fit.w[2] * z[2])
  const errors = f.filter((v, i) => Math.sign(v) !== fit.y[i]).length
  const sv = fit.alpha.map((a, i) => (a > 1e-6 ? i : -1)).filter((i) => i >= 0)
  const free = sv.filter((i) => fit.alpha[i] < C - 1e-6)
  const margin = 2 / Math.hypot(fit.w[0], fit.w[1])
  return { f, errors, sv, free, margin }
}

const NM: Array<[string, string]> = [['A', 'A'], ['B', 'B']]

export const SVM: Lesson<SvmFrame> = {
  slug: 'destek-vektor-makinesi',
  n: 0,
  title: { tr: 'Destek vektör makinesi', en: 'Support vector machine' },
  sub: { tr: 'İki parça türü arasında en geniş boşluğu bırakan çizgi', en: 'The line that leaves the widest gap between two kinds of parts' },
  story: {
    tr: 'Ayıklama bandından iki tür braket geçiyor. Bant üzerindeki yük hücresi her parçanın ağırlığını (g), lazer kapısı uzunluğunu (mm) ölçüyor. Operatör 80 parçayı etiketledi: 40 tip A, 40 tip B. Robot kol tip B’yi ayrı kutuya itecek; iki türü ayıran çizgiyi ve iki tür arasında olabildiğince geniş bir güvenlik boşluğunu arıyoruz.',
    en: 'Two kinds of bracket pass along a sorting belt. A load cell weighs each part (g) and a laser gate measures its length (mm). An operator labeled 80 parts: 40 type A, 40 type B. A robot arm will push type B into a separate bin; we want the line that separates the two kinds with the widest possible safety gap.',
  },
  how: [
    { tr: 'Karar değeri f = w·x + b. f = 0 karar çizgisi, f = +1 ve f = −1 iki kenar çizgisi; aralarındaki şerit marj, genişliği 2/‖w‖.', en: 'The decision value is f = w·x + b. f = 0 is the decision line, f = +1 and f = −1 are the two edges; the strip between them is the margin, 2/‖w‖ wide.' },
    { tr: 'Amaç: ½‖w‖² (marjı geniş tut) + C·Σ max(0, 1 − y·f) (hinge kaybı: kenarı aşan her nokta ceza öder).', en: 'Objective: ½‖w‖² (keep the margin wide) + C·Σ max(0, 1 − y·f) (hinge loss: every point that crosses its edge pays).' },
    { tr: 'Her noktanın bir ağırlığı α vardır (0 ile C arası), w = Σ α·y·x. Noktalar sırayla gezilir; kenarını aşan noktanın α’sı büyür, rahat olanınki sıfıra iner. Bu, SMO’nun tek değişkenli hâlidir.', en: 'Every point has a weight α (between 0 and C), and w = Σ α·y·x. Points are visited in turn; a point that crosses its edge gets a larger α, a comfortable one drops to zero. This is the one-variable form of SMO.' },
    { tr: 'Sonunda α’sı sıfır olmayan birkaç nokta kalır: destek vektörleri. Çizgiyi yalnız onlar belirler; diğer 70 küsur parçayı silsen çizgi kıpırdamaz.', en: 'In the end only a few points keep a non-zero α: the support vectors. They alone define the line; delete the other seventy-odd parts and the line does not move.' },
    { tr: 'Şunu dene: C’yi 0,05’e indir. Ceza ucuzlar, marj genişler, birçok nokta şeridin içine girer ve destek vektörü sayısı artar.', en: 'Try this: lower C to 0.05. Crossing becomes cheap, the margin widens, many points sit inside the strip and the number of support vectors grows.' },
  ],
  why: {
    tr: 'SVM, derin öğrenmeden önce görüntü ve sinyal sınıflamanın baş aracıydı; az veriyle bile kararlı ve açıklanabilir sınır çizer. Robotikte parça ayıklama, HOG + SVM ile yaya ve nesne tespiti, titreşim sinyalinden arıza teşhisi gibi işlerde hâlâ kullanılır. Çekirdek (kernel) hilesiyle aynı yöntem eğri sınırlar da çizer.',
    en: 'Before deep learning, SVMs were the main tool for image and signal classification; they draw a stable, explainable border even with little data. In robotics they are still used for part sorting, HOG + SVM pedestrian and object detection, and fault diagnosis from vibration signals. With the kernel trick the same method draws curved borders too.',
  },
  file: 'svm.py',
  code: [
    ['import numpy as np'],
    ['rng = np.random.default_rng(4)'],
    ['A = rng.normal([24, 32], [2.2, 2.8], (40, 2))', 'tip A: g, mm', 'type A: g, mm'],
    ['B = rng.normal([34, 47], [2.2, 2.8], (40, 2))', 'tip B', 'type B'],
    ['X = np.vstack([A, B]); y = np.r_[-np.ones(40), np.ones(40)]'],
    ['Z = (X - X.mean(0)) / X.std(0)', 'ölçekle', 'scale'],
    ['Z = np.c_[Z, np.ones(80)]', 'b için sabit 1', 'constant 1 for b'],
    ['C = 1.0', 'yumuşak marj', 'soft margin'],
    ['a = np.zeros(80); w = np.zeros(3)', 'her noktaya bir α', 'one α per point'],
    ['for epoch in range(50):'],
    ['    for i in rng.permutation(80):'],
    ['        G = y[i] * Z[i] @ w - 1', 'kenara göre pay', 'slack to the edge'],
    ['        new = np.clip(a[i] - G / (Z[i] @ Z[i]), 0, C)', 'α: 0 ile C arası', 'α between 0 and C'],
    ['        w += (new - a[i]) * y[i] * Z[i]', 'w = Σ α·y·z', 'w = Σ α·y·z'],
    ['        a[i] = new'],
    ['f = Z @ w', 'karar değeri', 'decision value'],
    ["print('hata', (np.sign(f) != y).sum())"],
    ['sv = a > 1e-6', 'destek vektörleri', 'support vectors'],
    ["print('destek', sv.sum(), np.abs(f[sv]).round(3))", 'kenarda: |f| = 1', 'on the edge: |f| = 1'],
    ["print('marj', 2 / np.linalg.norm(w[:2]))", 'ölçekli birimde', 'in scaled units'],
  ],
  params: [{ key: 'C', label: { tr: 'C (yumuşak marj)', en: 'C (soft margin)' }, min: 0.02, max: 2, step: 0.02, value: 1 }],
  run({ C = 1 }) {
    const X = partsData()
    const fit = trainSvm(X, C)
    const { mu, sd, Z, y } = fit
    const base = { X, mu, sd, C }
    const F: SvmFrame[] = []
    const zero: [number, number, number] = [0, 0, 0]
    const Ct = fmt(C, 2, 'tr'), Ce = C.toFixed(2)
    const stat = cap(`80 parça · C = ${Ct}`, `80 parts · C = ${Ce}`)
    F.push({ ...base, w: zero, alpha: null, epoch: 0, hist: [], line: 4, cap: cap('40 tip A, 40 tip B', '40 type A, 40 type B'), stat, hold: 2 })
    F.push({ ...base, w: zero, alpha: null, epoch: 0, hist: [], line: 5, cap: cap(`ölçekle: ağırlık σ = ${fmt(sd[0], 1, 'tr')} g, uzunluk σ = ${fmt(sd[1], 1, 'tr')} mm`, `scale: weight σ = ${sd[0].toFixed(1)} g, length σ = ${sd[1].toFixed(1)} mm`), stat, hold: 1.5 })
    const obj0 = svmObjective(Z, y, zero, C)
    F.push({ ...base, w: zero, alpha: new Array(X.length).fill(0), epoch: 0, hist: [], line: 8, cap: cap('bütün α = 0: henüz çizgi yok', 'every α = 0: no line yet'), stat: cap(`amaç ${fmt(obj0, 1, 'tr')}`, `objective ${obj0.toFixed(1)}`), hold: 1.5 })
    // ilk dönem: ilk noktalar satır satır, sonra hızlan
    let prevW = zero, prevA = new Array<number>(X.length).fill(0)
    fit.first.forEach((s, k) => {
      const nm = NM[X[s.i].c]
      const aT = fmt(s.alpha[s.i], 2, 'tr'), aE = s.alpha[s.i].toFixed(2)
      const c1 = cap(`dönem 1 · parça ${k + 1}/80 (tip ${nm[0]})`, `epoch 1 · part ${k + 1}/80 (type ${nm[1]})`)
      if (k < 4) {
        F.push({ ...base, w: prevW, alpha: prevA, epoch: 1, at: s.i, hist: [], line: 11, cap: c1, stat: cap(`y·f − 1 = ${fmt(s.G, 2, 'tr')}${s.G < 0 ? ': kenarı aşıyor' : ': rahat'}`, `y·f − 1 = ${s.G.toFixed(2)}${s.G < 0 ? ': crosses its edge' : ': comfortable'}`), hold: k < 2 ? 1.4 : 1 })
        F.push({ ...base, w: prevW, alpha: s.alpha, epoch: 1, at: s.i, hist: [], line: 12, cap: c1, stat: cap(`yeni α = ${aT}`, `new α = ${aE}`), hold: k < 2 ? 1.2 : 0.8 })
        F.push({ ...base, w: s.w, alpha: s.alpha, epoch: 1, at: s.i, hist: [], line: 13, cap: c1, stat: cap('çizgi ve kenarlar kaydı', 'line and edges moved'), hold: k < 2 ? 1.4 : 0.9 })
      } else if (k < 20 || k % 6 === 5 || k === fit.first.length - 1) {
        F.push({ ...base, w: s.w, alpha: s.alpha, epoch: 1, at: s.i, hist: [], line: 13, cap: c1, stat: cap(`α = ${aT}`, `α = ${aE}`), hold: k < 20 ? 0.5 : 0.35 })
      }
      prevW = s.w; prevA = s.alpha
    })
    const hist: number[] = []
    fit.epochs.forEach((ep, e) => {
      const nsv = ep.alpha.filter((a) => a > 1e-6).length
      const m = 2 / Math.hypot(ep.w[0], ep.w[1])
      hist.push(m)
      if (e === 0 || e < 12 || e % 4 === 3 || e === fit.epochs.length - 1)
        F.push({
          ...base, w: ep.w, alpha: ep.alpha, epoch: e + 1, hist: [...hist], line: 10,
          cap: cap(`dönem ${e + 1} · amaç ${fmt(ep.obj, 2, 'tr')}`, `epoch ${e + 1} · objective ${ep.obj.toFixed(2)}`),
          stat: cap(`marj ${fmt(m, 2, 'tr')} · ${nsv} destek vektörü`, `margin ${m.toFixed(2)} · ${nsv} support vectors`),
          hold: e < 3 ? 1 : 0.45,
        })
    })
    const S = svmSummary(fit, C)
    const lastE = fit.epochs.length
    F.push({ ...base, w: fit.w, alpha: fit.alpha, epoch: lastE, hist: [...hist], errors: S.errors, nsv: S.sv.length, line: 16, cap: cap(`${lastE} dönemde durdu · eğitim hatası ${S.errors}`, `stopped after ${lastE} epochs · training errors ${S.errors}`), stat, hold: 1.5 })
    const onEdge = S.free.length ? Math.max(...S.free.map((i) => Math.abs(Math.abs(S.f[i]) - 1))) : 0
    F.push({ ...base, w: fit.w, alpha: fit.alpha, epoch: lastE, hist: [...hist], errors: S.errors, nsv: S.sv.length, line: 18, cap: cap(`${S.sv.length} destek vektörü, ${S.free.length} tanesi tam kenarda`, `${S.sv.length} support vectors, ${S.free.length} exactly on an edge`), stat: cap(`kenardakiler: |f| = 1 ± ${fmt(onEdge, 4, 'tr')}`, `on the edge: |f| = 1 ± ${onEdge.toFixed(4)}`), hold: 1.8 })
    F.push({ ...base, w: fit.w, alpha: fit.alpha, epoch: lastE, hist: [...hist], errors: S.errors, nsv: S.sv.length, margin: S.margin, line: 19, cap: cap(`marj genişliği ${fmt(S.margin, 2, 'tr')} (ölçekli birim)`, `margin width ${S.margin.toFixed(2)} (scaled units)`), stat: cap(`${S.errors} hata · ${S.sv.length} destek vektörü · C = ${Ct}`, `${S.errors} errors · ${S.sv.length} support vectors · C = ${Ce}`), hold: 3 })
    return F
  },
}
