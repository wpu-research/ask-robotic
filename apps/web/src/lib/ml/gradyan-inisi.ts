// Ders: gradyan inişi ve kayıp arazisi. 20 ölçüm: IMU jiroskobunun sıfır kayması sıcaklıkla doğrusal artar. Her (w, b) ikilisi
// bir kayıp verir; model arazide eğime karşı adım atar. Öğrenme oranı büyükse vadinin üstünden atlar ve patlar, küçükse sürünür.
import { cap, fmt, gauss, rng, type Frame, type Lesson } from './core'
import { B, gecmisGrafik, regresyonBlok, type EgitimRaporu } from './egitim/rapor'

export interface GdFrame extends Frame {
  /** Ölçekli sıcaklık (°C / 10) ve ölçülen kayma (°/dk); paylaşılan referans. */
  x: number[]
  y: number[]
  /** Tüm yol (paylaşılan); karede ilk k nokta çizilir. */
  path: Array<[number, number]>
  losses: number[]
  k: number
  lr: number
  /** Şu anki noktada eğimin tersini (iniş yönünü) ok olarak göster. */
  arrow?: [number, number]
  /** Veri grafiğinde hata çizgileri. */
  resid?: boolean
  blown?: boolean
}

/** Jiroskop kayması: gerçek ilişki kayma ≈ 1,5·(T/10) + 1 °/dk, ±0,3 gürültü. */
export function driftData(seed = 6) {
  const r = rng(seed)
  const x: number[] = [], y: number[] = []
  for (let i = 0; i < 20; i++) {
    const t = 10 + 40 * r()
    x.push(t / 10)
    y.push(1.5 * (t / 10) + 1 + 0.3 * gauss(r))
  }
  return { x, y }
}

export const lossAt = (x: readonly number[], y: readonly number[], w: number, b: number): number => {
  let s = 0
  for (let i = 0; i < x.length; i++) { const e = w * x[i] + b - y[i]; s += e * e }
  return s / x.length
}
export function gradAt(x: readonly number[], y: readonly number[], w: number, b: number): [number, number] {
  let gw = 0, gb = 0
  for (let i = 0; i < x.length; i++) { const e = w * x[i] + b - y[i]; gw += 2 * e * x[i]; gb += 2 * e }
  return [gw / x.length, gb / x.length]
}

/** Seçilebilir başlangıç noktaları (w, b). */
export const STARTS: Array<[number, number]> = [[-1, 6], [3.5, 7], [-1, -3], [0.5, -3.5]]

/** steps adım gradyan inişi; |w| ya da |b| 1e6'yı geçerse durur (patladı). */
export function descend(x: readonly number[], y: readonly number[], lr: number, start: [number, number], steps = 300) {
  let [w, b] = start
  const path: Array<[number, number]> = [[w, b]]
  const losses = [lossAt(x, y, w, b)]
  let blown = false
  for (let s = 0; s < steps; s++) {
    const [gw, gb] = gradAt(x, y, w, b)
    w -= lr * gw; b -= lr * gb
    if (!Number.isFinite(w) || !Number.isFinite(b) || Math.abs(w) > 1e6 || Math.abs(b) > 1e6) { blown = true; break }
    path.push([w, b]); losses.push(lossAt(x, y, w, b))
  }
  return { path, losses, blown }
}

const lossTxt = (l: number, lang: 'tr' | 'en') => (l >= 1000 ? l.toExponential(1).replace('.', lang === 'tr' ? ',' : '.') : fmt(l, l < 1 ? 3 : 2, lang))

/**
 * Eğitim paneli: aynı gradyan inişi (300 adım). Geçmiş, her adımın güncellemeden önceki kaybı, gradyan normu ve (w, b)'si; Python
 * kodu da adım başına aynı satırı yazar. Doğrulama kümesi yok: ders bir optimizasyon dersi, arazi 20 ölçümün tamamından çizilir.
 * Karşılaştırma: kodun denediği üç öğrenme oranı (0,1 · 0,05 · 0,0002) aynı başlangıçtan.
 */
export function gradyanInisiReport({ lr = 0.05, start = 0 }: Record<string, number>): EgitimRaporu {
  const { x, y } = driftData()
  const si = Math.max(0, Math.min(3, Math.round(start)))
  const s0 = STARTS[si]
  const STEPS = 300
  const d = descend(x, y, lr, s0, STEPS)
  const n = Math.min(d.path.length, STEPS)
  const P = d.path.slice(0, n)
  const step = P.map((_, i) => i), loss = d.losses.slice(0, n), grad = P.map(([w, b]) => Math.hypot(...gradAt(x, y, w, b)))
  const r: EgitimRaporu = {
    kind: 'regresyon', model: B('kayma = w·(T/10) + b (gradyan inişi)', 'slip = w·(T/10) + b (gradient descent)'), seed: 6, hyper: { lr, start: `(${s0[0]}, ${s0[1]})`, steps: STEPS },
    history: { x: 'step', cols: { step, loss, grad_norm: grad, w: P.map((p) => p[0]), b: P.map((p) => p[1]) } },
    final: [], charts: [],
  }
  const [wf, bf] = d.path.at(-1)!
  const fit = regresyonBlok({ y, pred: x.map((xi) => wf * xi + bf), unit: '°/dk' })
  r.final = [
    { key: 'loss_start', label: B('başlangıç kaybı', 'starting loss'), value: d.losses[0], fmt: 3 },
    { key: 'loss', label: B('son kayıp (MSE)', 'final loss (MSE)'), value: d.losses.at(-1)!, fmt: 4 },
    { key: 'grad_norm', label: B('son gradyan normu', 'final gradient norm'), value: Math.hypot(...gradAt(x, y, wf, bf)), fmt: 4 },
    { key: 'w', label: B('w', 'w'), value: wf, fmt: 3 },
    { key: 'b', label: B('b', 'b'), value: bf, fmt: 3 },
    { key: 'diverged', label: B('patladı mı (1 = evet)', 'diverged (1 = yes)'), value: d.blown ? 1 : 0, fmt: 'int' },
    ...(d.blown ? [] : fit.final.filter((f) => f.key === 'r2')),
  ]
  const big = Math.max(...loss) / Math.max(1e-12, Math.min(...loss)) > 30
  const cmp = [0.1, 0.05, 0.0002].map((q, i) => {
    const e = descend(x, y, q, s0, STEPS)
    return { key: `lr_${q}`, label: B(`lr ${String(q).replace('.', ',')}`, `lr ${q}`), values: e.losses.slice(0, STEPS), x: e.losses.slice(0, STEPS).map((_, k) => k), tone: [0, 1, 2][i] }
  })
  r.charts = [
    gecmisGrafik(r, 'loss', B('Kayıp (MSE)', 'Loss (MSE)'), [['loss', B('kayıp', 'loss'), 1]], { logY: big, yLabel: B('MSE', 'MSE') }),
    gecmisGrafik(r, 'grad', B('Gradyan normu |∇kayıp|', 'Gradient norm |∇loss|'), [['grad_norm', B('|∇|', '|∇|'), 4]], { logY: true }),
    gecmisGrafik(r, 'params', B('Parametrelerin yolu', 'Parameter trajectory'), [['w', B('w', 'w'), 2], ['b', B('b', 'b'), 5]]),
    { kind: 'scatter', id: 'path', title: B('Arazideki yol (w, b)', 'Path on the landscape (w, b)'), xLabel: B('w', 'w'), yLabel: B('b', 'b'), points: P.map(([w, b], i) => [w, b, i === 0 ? 0 : 1]) },
    { kind: 'line', id: 'lr-compare', title: B('Üç öğrenme oranı, aynı başlangıç', 'Three learning rates, same start'), x: step, xLabel: B('adım', 'step'), yLabel: B('MSE', 'MSE'), series: cmp, logY: true, note: B('0,1 vadinin üstünden atlayıp patlar, 0,0002 sürünür, 0,05 dibe iner.', '0.1 overshoots the valley and explodes, 0.0002 crawls, 0.05 reaches the bottom.') },
    ...(d.blown ? [] : fit.charts),
  ]
  return r
}

export const GRADYAN_INISI: Lesson<GdFrame> = {
  slug: 'gradyan-inisi',
  n: 0,
  title: { tr: 'Gradyan inişi: kayıp arazisinde yokuş aşağı', en: 'Gradient descent: walking downhill on the loss landscape' },
  sub: { tr: 'Türev yönü söyler, öğrenme oranı adım boyunu', en: 'The derivative gives the direction, the learning rate the step size' },
  story: {
    tr: "Bir robotun IMU'sunu 10 ile 50 °C arasında 20 farklı sıcaklıkta beklettik ve jiroskobun sıfır kaymasını ölçtük (derece/dakika). Kayma sıcaklıkla doğrusal artıyor: kayma ≈ w · (T/10) + b. Robot, sıcaklığı okuyup kaymayı çıkarabilsin diye w ve b'yi arıyoruz.",
    en: "We held a robot's IMU at 20 different temperatures between 10 and 50 °C and measured the gyroscope's zero drift (degrees per minute). The drift grows linearly with temperature: drift ≈ w · (T/10) + b. We look for w and b so the robot can read the temperature and subtract the drift.",
  },
  how: [
    { tr: 'Kayıp: tahmin eksi ölçüm, karesi, ortalaması. Her (w, b) ikilisi tek bir kayıp verir; w ve b zemin, kayıp yükseklik olunca hata bir arazi olur.', en: 'The loss: prediction minus measurement, squared, averaged. Every (w, b) pair gives one loss; with w and b as the floor and the loss as height, the error becomes a landscape.' },
    { tr: 'Model vadiyi göremez, yalnız ayağının altındaki eğimi hisseder. Türev hangi yönün yokuş yukarı olduğunu söyler; tersine bir adım atılır.', en: 'The model cannot see the valley, only the slope under its feet. The derivative says which way is uphill; it steps the other way.' },
    { tr: 'Adım boyu öğrenme oranıdır: yeni ağırlık = ağırlık − öğrenme oranı × eğim. Ölç, eğimi al, in; tekrar tekrar.', en: 'The step size is the learning rate: new weight = weight − learning rate × slope. Measure, take the slope, step down; again and again.' },
    { tr: 'Şunu dene: öğrenme oranını 0,1 yap, vadinin üstünden atlar ve patlar; 0,0002 yap, 300 adımda hâlâ yoldadır; 0,05 dibe oturur. Başlangıç noktasını değiştir: hepsi aynı dibe iner.', en: 'Try this: set the learning rate to 0.1 and it jumps across the valley and explodes; 0.0002 is still on its way after 300 steps; 0.05 settles at the bottom. Change the starting point: every one ends at the same bottom.' },
  ],
  why: {
    tr: "ChatGPT'ye kadar duyduğunuz her model bu tek fikirle öğrendi: yokuş aşağı yürümek. Gerçek ağlar aynı şeyi milyonlarca boyutta yapar. Robotikte sensör kalibrasyonu, kontrolcü kazancı ayarı ve öğrenen her politika bu döngüyle eğitilir.",
    en: 'Every model you have heard of, up to ChatGPT, learned with this one idea: walk downhill. Real networks do the same in millions of dimensions. In robotics, sensor calibration, controller gain tuning and every learned policy are trained with this loop.',
  },
  file: 'gradyan_inisi.py',
  code: [
    ['import numpy as np'],
    ['rng = np.random.default_rng(6)'],
    ['T = rng.uniform(10, 50, 20)', '20 sıcaklık (°C)', '20 temperatures (°C)'],
    ['x = T / 10', 'ölçekle: 1..5', 'scale: 1..5'],
    ['y = 1.5 * x + 1 + rng.normal(0, 0.3, 20)', 'kayma (°/dk)', 'drift (°/min)'],
    ['def loss(w, b):'],
    ['    return np.mean((w * x + b - y) ** 2)', 'arazinin yüksekliği', 'height of the landscape'],
    ['hist = {}', 'her öğrenme oranının geçmişi', 'history of each learning rate'],
    ['for lr in (0.1, 0.05, 0.0002):', 'üç adım boyu', 'three step sizes'],
    ['    w, b = -1.0, 6.0', 'başlangıç noktası', 'starting point'],
    ['    L0 = loss(w, b)'],
    ['    hist[lr] = h = {\'step\': [], \'loss\': [], \'grad_norm\': [], \'w\': [], \'b\': []}'],
    ['    for step in range(300):'],
    ['        err = w * x + b - y', 'tahmin − ölçüm', 'prediction − measurement'],
    ['        gw = 2 * np.mean(err * x)', 'w yönündeki eğim', 'slope along w'],
    ['        gb = 2 * np.mean(err)', 'b yönündeki eğim', 'slope along b'],
    ['        for k, v in zip(h, (step, loss(w, b), np.hypot(gw, gb), w, b)): h[k].append(float(v))', 'adımdan önce kaydet', 'record before the step'],
    ['        w, b = w - lr * gw, b - lr * gb', 'eğime karşı adım', 'step against the slope'],
    ['        if abs(w) > 1e6:', 'patladı', 'exploded'],
    ['            break'],
    ['    print(f"lr {lr}: {step + 1} adım,"'],
    ['          f" kayıp {L0:.3g} -> {loss(w, b):.3g}")'],
    ['h = hist[0.05]', 'tablo ve CSV: lr = 0.05', 'table and CSV: lr = 0.05'],
    ['for k in (\'loss\', \'grad_norm\', \'w\', \'b\'):'],
    ['    print(f\'{k:<10}{h[k][-1]:>12.5f}\')'],
    ['import csv'],
    ['with open(\'egitim_gecmisi.csv\', \'w\', newline=\'\') as f:', 'geçmişi CSV\'ye yaz', 'write the history to CSV'],
    ['    csv.writer(f).writerows([list(h), *zip(*h.values())])', 'satır başına bir adım', 'one row per step'],
    ['try:'],
    ['    import matplotlib.pyplot as plt', 'varsa grafik çiz', 'plot if available'],
    ['    for lr, q in hist.items(): plt.plot(q[\'step\'], q[\'loss\'], label=f\'lr {lr}\')'],
    ['    plt.xlabel(\'step\'); plt.ylabel(\'MSE\'); plt.yscale(\'log\'); plt.legend(); plt.show()'],
    ['except ImportError:'],
    ['    print(\'matplotlib yok: grafik atlandı\')'],
  ],
  params: [
    { key: 'lr', label: { tr: 'Öğrenme oranı', en: 'Learning rate' }, min: 0.0002, max: 0.1, step: 0.0002, value: 0.05 },
    { key: 'start', label: { tr: 'Başlangıç noktası', en: 'Starting point' }, min: 0, max: 3, step: 1, value: 0 },
  ],
  report: gradyanInisiReport,
  run({ lr = 0.05, start = 0 }) {
    const { x, y } = driftData()
    const s0 = STARTS[Math.max(0, Math.min(3, Math.round(start)))]
    const { path, losses, blown } = descend(x, y, lr, s0, 300)
    const base = { x, y, path, losses, lr }
    const F: GdFrame[] = []
    const lrT = (lang: 'tr' | 'en') => (lr < 0.001 ? fmt(lr, 4, lang) : fmt(lr, 3, lang).replace(/0+$/, ''))
    const stat = cap(`20 ölçüm · öğrenme oranı ${lrT('tr')}`, `20 measurements · learning rate ${lrT('en')}`)
    const wb = (i: number) => {
      const [w, b] = path[i]
      return cap(`w = ${fmt(w, 2, 'tr')}, b = ${fmt(b, 2, 'tr')}`, `w = ${w.toFixed(2)}, b = ${b.toFixed(2)}`)
    }
    F.push({ ...base, k: 0, line: 4, cap: cap('20 ölçüm: sıcaklık → jiroskop kayması', '20 measurements: temperature → gyro drift'), stat, hold: 2 })
    F.push({ ...base, k: 1, line: 6, cap: cap('her (w, b) bir kayıp: koyu yer düşük kayıp', 'every (w, b) has a loss: dark means low'), stat, hold: 2 })
    F.push({ ...base, k: 1, line: 9, resid: true, cap: cap(`başlangıç: kayıp ${lossTxt(losses[0], 'tr')}`, `start: loss ${lossTxt(losses[0], 'en')}`), stat: wb(0), hold: 1.6 })
    // ilk iki adım satır satır
    for (let s = 0; s < 2 && s + 1 < path.length; s++) {
      const g = gradAt(x, y, path[s][0], path[s][1])
      const c = cap(`adım ${s + 1} · kayıp ${lossTxt(losses[s], 'tr')}`, `step ${s + 1} · loss ${lossTxt(losses[s], 'en')}`)
      F.push({ ...base, k: s + 1, line: 13, resid: true, cap: c, stat: wb(s), hold: 1 })
      F.push({ ...base, k: s + 1, line: 14, arrow: [-g[0], -g[1]], cap: c, stat: cap(`eğim: ∂L/∂w = ${fmt(g[0], 2, 'tr')}`, `slope: ∂L/∂w = ${g[0].toFixed(2)}`), hold: 1.1 })
      F.push({ ...base, k: s + 1, line: 15, arrow: [-g[0], -g[1]], cap: c, stat: cap(`eğim: ∂L/∂b = ${fmt(g[1], 2, 'tr')}`, `slope: ∂L/∂b = ${g[1].toFixed(2)}`), hold: 1.1 })
      F.push({ ...base, k: s + 2, line: 17, cap: cap(`adım ${s + 1} → kayıp ${lossTxt(losses[s + 1], 'tr')}`, `step ${s + 1} → loss ${lossTxt(losses[s + 1], 'en')}`), stat: wb(s + 1), hold: 1.2 })
    }
    // sonra hızlan
    const n = path.length - 1
    for (let s = 3; s <= n; s++) {
      if (!(s <= 30 || (s <= 100 && s % 5 === 0) || s % 10 === 0 || s === n)) continue
      F.push({ ...base, k: s + 1, line: 17, cap: cap(`adım ${s} · kayıp ${lossTxt(losses[s], 'tr')}`, `step ${s} · loss ${lossTxt(losses[s], 'en')}`), stat: wb(s), hold: s <= 10 ? 0.6 : 0.35 })
    }
    const L0 = losses[0], Ln = losses[n]
    if (blown) {
      F.push({ ...base, k: path.length, blown: true, line: 18, cap: cap(`${n + 1}. adımda patladı: öğrenme oranı çok büyük`, `exploded at step ${n + 1}: learning rate too large`), stat: cap(`son kayıp ${lossTxt(Ln, 'tr')}`, `last loss ${lossTxt(Ln, 'en')}`), hold: 3 })
    } else {
      const ok = Ln < 0.01 * L0
      F.push({
        ...base, k: path.length, resid: true, line: 20,
        cap: cap(`300 adım: kayıp ${lossTxt(L0, 'tr')} → ${lossTxt(Ln, 'tr')}`, `300 steps: loss ${lossTxt(L0, 'en')} → ${lossTxt(Ln, 'en')}`),
        stat: ok ? cap(`dipte: kayma ≈ ${fmt(path[n][0], 2, 'tr')} · T/10 + ${fmt(path[n][1], 2, 'tr')}`, `at the bottom: drift ≈ ${path[n][0].toFixed(2)} · T/10 + ${path[n][1].toFixed(2)}`)
          : cap('hâlâ yolda: adımlar çok küçük', 'still on its way: steps too small'),
        hold: 3,
      })
    }
    return F
  },
}
