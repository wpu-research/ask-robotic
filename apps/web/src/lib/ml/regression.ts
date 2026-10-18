// Ders 1: doğrusal regresyon, gradyan inişiyle. 40 ölçüm: motora verilen PWM ve tekerleğin ölçülen hızı. Çizgi her dönemde
// hatanın eğimine karşı küçük bir adım atar; öğrenme oranı büyükse salınır, çok büyükse ıraksar.
import { cap, fmt, gauss, mean, rng, std, type Frame, type Lesson } from './core'
import { B, erkenDurdurma, gecmisGrafik, regresyonBlok, type EgitimRaporu } from './egitim/rapor'

export interface RegFrame extends Frame {
  pwm: number[]
  speed: number[]
  /** Ölçekli x için ağırlıklar (x = (pwm − μ) / σ). */
  w: number
  b: number
  mu: number
  sigma: number
  loss: number[]
  epoch: number
  /** Artıkları (dikey hata çizgilerini) göster. */
  resid?: boolean
  /** Ölçekleme gösterimi. */
  scaled?: boolean
}

/** Motor kalibrasyonu: gerçek ilişki hız ≈ 0,21·PWM − 6 cm/s, ±2 cm/s gürültü (motor ölü bölgesinde 0). */
export function motorData(seed = 3) {
  const r = rng(seed)
  const pwm: number[] = [], speed: number[] = []
  for (let i = 0; i < 40; i++) {
    const p = Math.round(40 + 215 * r())
    pwm.push(p)
    speed.push(Math.max(0, 0.21 * p - 6 + 2.2 * gauss(r)))
  }
  return { pwm, speed }
}

export function gradientDescent(pwm: number[], speed: number[], lr: number, epochs: number) {
  const mu = mean(pwm), sigma = std(pwm)
  const x = pwm.map((p) => (p - mu) / sigma)
  let w = 0, b = 0
  const hist: Array<{ w: number; b: number; loss: number }> = []
  for (let e = 0; e < epochs; e++) {
    const err = x.map((xi, i) => w * xi + b - speed[i])
    const loss = mean(err.map((v) => v * v))
    hist.push({ w, b, loss })
    w -= lr * 2 * mean(err.map((v, i) => v * x[i]))
    b -= lr * 2 * mean(err)
  }
  return { mu, sigma, x, hist, w, b }
}

/**
 * Eğitim paneli ve Python kodu için: aynı gradyan inişi, ama her 4. ölçüm (i % 4 = 3) doğrulamaya ayrılır ve güncelleme yalnız
 * eğitim ölçümleriyle yapılır. Her dönemde (güncellemeden önce) eğitim/doğrulama kaybı ve gradyan normu kaydedilir.
 */
export function gdWithValidation(pwm: number[], speed: number[], lr: number, epochs: number) {
  const mu = mean(pwm), sigma = std(pwm)
  const x = pwm.map((p) => (p - mu) / sigma)
  const val = x.map((_, i) => i % 4 === 3)
  const tr = x.map((_, i) => i).filter((i) => !val[i]), va = x.map((_, i) => i).filter((i) => val[i])
  let w = 0, b = 0
  const h = { epoch: [] as number[], loss: [] as number[], val_loss: [] as number[], grad_norm: [] as number[], w: [] as number[], b: [] as number[] }
  for (let e = 0; e < epochs; e++) {
    const err = x.map((xi, i) => w * xi + b - speed[i])
    const loss = mean(tr.map((i) => err[i] ** 2))
    const gw = 2 * mean(tr.map((i) => err[i] * x[i])), gb = 2 * mean(tr.map((i) => err[i]))
    h.epoch.push(e); h.loss.push(loss); h.val_loss.push(mean(va.map((i) => err[i] ** 2))); h.grad_norm.push(Math.hypot(gw, gb)); h.w.push(w / sigma); h.b.push(b - (w * mu) / sigma)
    w -= lr * gw
    b -= lr * gb
  }
  return { mu, sigma, x, val, tr, va, w, b, h }
}

/** Ders 1'in eğitim raporu: kayıp eğrileri, gradyan normu, eğim, artıklar ve tahmin–gerçek (doğrulama ölçümleri). */
export function regressionReport({ lr = 0.1 }: Record<string, number>): EgitimRaporu {
  const { pwm, speed } = motorData()
  const g = gdWithValidation(pwm, speed, lr, 60)
  const pred = g.x.map((xi) => g.w * xi + g.b)
  const { h } = g
  const r: EgitimRaporu = {
    kind: 'regresyon', model: B('hız = w·PWM + b (gradyan inişi)', 'speed = w·PWM + b (gradient descent)'), seed: 3, hyper: { lr, epochs: 60, train: g.tr.length, val: g.va.length },
    history: { x: 'epoch', cols: { epoch: h.epoch, loss: h.loss, val_loss: h.val_loss, grad_norm: h.grad_norm } },
    final: [], charts: [],
  }
  const blk = regresyonBlok({ y: g.va.map((i) => speed[i]), pred: g.va.map((i) => pred[i]), unit: 'cm/s', prefix: 'val_' })
  r.final = [
    { key: 'loss', label: B('eğitim kaybı (MSE)', 'training loss (MSE)'), value: h.loss.at(-1)!, fmt: 3 },
    ...blk.final,
    { key: 'slope', label: B('eğim (cm/s başına PWM)', 'slope (cm/s per PWM)'), value: g.w / g.sigma, fmt: 4 },
  ]
  const big = Math.max(...h.loss.filter(Number.isFinite)) / Math.max(1e-9, Math.min(...h.loss.filter(Number.isFinite))) > 50
  r.charts = [
    gecmisGrafik(r, 'loss', B('Kayıp (MSE): eğitim ve doğrulama', 'Loss (MSE): training and validation'), [['loss', B('eğitim', 'train'), 1], ['val_loss', B('doğrulama', 'validation'), 0, true]], { logY: big, yLabel: B('MSE', 'MSE'), marker: erkenDurdurma(h.epoch, h.val_loss) }),
    gecmisGrafik(r, 'grad', B('Gradyan normu |∇kayıp|', 'Gradient norm |∇loss|'), [['grad_norm', B('|∇|', '|∇|'), 4]], { logY: big }),
    { kind: 'line', id: 'slope', title: B('Eğim ve kesişim', 'Slope and intercept'), x: h.epoch, xLabel: B('dönem', 'epoch'), series: [{ key: 'w', label: B('eğim × 100', 'slope × 100'), values: h.w.map((v) => v * 100), tone: 2 }, { key: 'b', label: B('kesişim', 'intercept'), values: h.b, tone: 5 }], live: true },
    ...blk.charts,
  ]
  return r
}

export const REGRESSION: Lesson<RegFrame> = {
  slug: 'dogrusal-regresyon',
  n: 1,
  title: { tr: 'Doğrusal regresyon ve gradyan inişi', en: 'Linear regression and gradient descent' },
  sub: { tr: 'Motorun PWM–hız çizgisini adım adım öğrenmek', en: "Learning the motor's PWM-to-speed line step by step" },
  story: {
    tr: "Bir robot tekerleğine 40 kez farklı PWM değeri verdik ve tekerleğin hızını ölçtük. Robotun belli bir hızda gitmesi için hangi PWM'i vermesi gerektiğini bilmek istiyoruz: ölçümlerden geçen en iyi doğruyu arıyoruz.",
    en: 'We sent 40 different PWM values to a robot wheel and measured its speed. We want to know which PWM the robot should send to drive at a given speed, so we look for the best straight line through the measurements.',
  },
  how: [
    { tr: "PWM'i ölçekleriz (ortalaması 0, standart sapması 1): adımlar her yönde aynı büyüklükte olur.", en: 'We scale PWM (mean 0, standard deviation 1) so steps have the same size in every direction.' },
    { tr: 'Çizgi yatay başlar (w = 0, b = 0). Her dönemde tahmin, hata ve ortalama kare hata (kayıp) hesaplanır.', en: 'The line starts flat (w = 0, b = 0). Every epoch computes the prediction, the error and the mean squared error (the loss).' },
    { tr: "Kaybın w ve b'ye göre türevi, kaybın hangi yönde arttığını söyler; ters yönde, öğrenme oranı kadar adım atılır.", en: 'The derivative of the loss with respect to w and b says which way the loss grows; we step the other way by the learning rate.' },
    { tr: "Öğrenme oranını 1'e yaklaştır: çizgi salınır. 1'i geçince ıraksar ve kayıp patlar. Tersine 0,01'e indir: adımlar o kadar küçüktür ki son dönemde eğim hâlâ 0,150'dedir (doğrusu 0,213); model doğru yöne gider ama zamanı yetmez.", en: 'Push the learning rate towards 1 and the line oscillates; above 1 it diverges and the loss explodes. Lower it to 0.01 instead: the steps are so small that the slope is still 0.150 at the last epoch (the right value is 0.213); the model heads the right way but runs out of time.' },
  ],
  why: {
    tr: "Gradyan inişi, bugünkü bütün sinir ağlarını eğiten yöntemin ta kendisidir: milyarlarca ağırlık için de aynı iki satır çalışır. Robotikte sensör ve motor kalibrasyonu, ileri besleme (feedforward) terimi ve basit tahmin modelleri hep bu doğruyla başlar.",
    en: 'Gradient descent is the very method that trains every neural network today: the same two lines run for billions of weights. In robotics, sensor and motor calibration, feedforward terms and simple prediction models all start with this line.',
  },
  file: 'regresyon.py',
  code: [
    ['import numpy as np'],
    ['pwm, speed = np.genfromtxt(\'motor-pwm.csv\', delimiter=\',\', skip_header=1, unpack=True)', '40 ölçüm: PWM, cm/s', '40 measurements: PWM, cm/s'],
    ['x = (pwm - pwm.mean()) / pwm.std()', 'ölçekle', 'scale'],
    ['w, b, lr = 0.0, 0.0, 0.1', 'yatay çizgiyle başla', 'start with a flat line'],
    ['val = np.arange(len(x)) % 4 == 3', 'her 4. ölçüm doğrulamaya ayrılır', 'every 4th measurement is held out for validation'],
    ['history = {\'epoch\': [], \'loss\': [], \'val_loss\': [], \'grad_norm\': []}', 'eğitim geçmişi', 'training history'],
    ['for epoch in range(60):'],
    ['    pred = w * x + b', 'tahmin', 'prediction'],
    ['    err = pred - speed', 'hata', 'error'],
    ['    loss = (err[~val] ** 2).mean()', 'eğitim kümesinde ortalama kare hata', 'mean squared error on the training set'],
    ['    gw, gb = 2 * (err[~val] * x[~val]).mean(), 2 * err[~val].mean()', 'kaybın w ve b\'ye göre eğimi', 'slope of the loss in w and b'],
    ['    for k, v in zip(history, (epoch, loss, (err[val] ** 2).mean(), np.hypot(gw, gb))): history[k].append(float(v))'],
    ['    w -= lr * gw', 'eğime karşı adım', 'step against the slope'],
    ['    b -= lr * gb'],
    ['print(w / pwm.std(), b - w * pwm.mean() / pwm.std())', 'cm/s başına PWM, kesişim', 'cm/s per PWM, intercept'],
    ['res = speed[val] - (w * x[val] + b)', 'doğrulama artıkları', 'validation residuals'],
    ['r2 = 1 - (res ** 2).sum() / ((speed[val] - speed[val].mean()) ** 2).sum()'],
    ['for k, v in [(\'loss\', history[\'loss\'][-1]), (\'val_loss\', history[\'val_loss\'][-1]), (\'val_r2\', r2)]:', 'son ölçümler tablosu', 'final metrics table'],
    ['    print(f\'{k:<10}{v:>10.4f}\')'],
    ['import csv'],
    ['with open(\'egitim_gecmisi.csv\', \'w\', newline=\'\') as f:', 'geçmişi CSV\'ye yaz', 'write the history to CSV'],
    ['    csv.writer(f).writerows([list(history), *zip(*history.values())])', 'satır başına bir dönem', 'one row per epoch'],
    ['try:'],
    ['    import matplotlib.pyplot as plt', 'varsa grafik çiz', 'plot if available'],
    ['    for k in (\'loss\', \'val_loss\'): plt.plot(history[\'epoch\'], history[k], label=k)'],
    ['    plt.xlabel(\'epoch\'); plt.ylabel(\'MSE\'); plt.yscale(\'log\'); plt.legend(); plt.show()'],
    ['except ImportError:'],
    ['    print(\'matplotlib yok: grafik atlandı\')'],
  ],
  params: [{ key: 'lr', label: { tr: 'Öğrenme oranı', en: 'Learning rate' }, min: 0.01, max: 1.1, step: 0.01, value: 0.1 }],
  report: regressionReport,
  run({ lr = 0.1 }) {
    const { pwm, speed } = motorData()
    const E = 60
    const gd = gradientDescent(pwm, speed, lr, E)
    const { mu, sigma, hist } = gd
    const base = { pwm, speed, mu, sigma }
    const F: RegFrame[] = []
    const stat = cap(`40 ölçüm · öğrenme oranı ${fmt(lr, 2, 'tr')}`, `40 measurements · learning rate ${lr.toFixed(2)}`)
    F.push({ ...base, w: 0, b: 0, loss: [], epoch: 0, line: 1, cap: cap('ölçümler', 'the measurements'), stat, hold: 2 })
    F.push({ ...base, w: 0, b: 0, loss: [], epoch: 0, scaled: true, line: 2, cap: cap(`ölçekle: μ = ${mu.toFixed(0)}, σ = ${sigma.toFixed(0)}`, `scale: μ = ${mu.toFixed(0)}, σ = ${sigma.toFixed(0)}`), stat, hold: 1.5 })
    F.push({ ...base, w: 0, b: 0, loss: [], epoch: 0, line: 3, cap: cap('yatay çizgi: w = 0, b = 0', 'flat line: w = 0, b = 0'), stat, hold: 1.2 })
    const show = (x: number) => (Number.isFinite(x) && Math.abs(x) < 1e6 ? x : NaN)
    hist.forEach((h, e) => {
      const loss = hist.slice(0, e + 1).map((q) => q.loss)
      const slope = h.w / sigma
      const st = { ...base, w: show(h.w), b: show(h.b), loss, epoch: e + 1 }
      const c = cap(`dönem ${e + 1} · kayıp ${Number.isFinite(h.loss) && h.loss < 1e9 ? fmt(h.loss, 1, 'tr') : '∞'}`, `epoch ${e + 1} · loss ${Number.isFinite(h.loss) && h.loss < 1e9 ? h.loss.toFixed(1) : '∞'}`)
      const s = cap(`eğim ${Number.isFinite(slope) ? fmt(slope, 3, 'tr') : '?'} cm/s başına PWM`, `slope ${Number.isFinite(slope) ? slope.toFixed(3) : '?'} cm/s per PWM`)
      if (e < 2) {
        F.push({ ...st, line: 7, cap: c, stat: s, hold: 1 })
        F.push({ ...st, line: 8, resid: true, cap: c, stat: s, hold: 1.2 })
        F.push({ ...st, line: 9, resid: true, cap: c, stat: s, hold: 1 })
        F.push({ ...st, line: 12, cap: c, stat: s, hold: 1 })
      } else F.push({ ...st, line: 12, cap: c, stat: s, hold: e < 10 ? 0.6 : 0.3 })
    })
    const slope = gd.w / sigma, icpt = gd.b - (gd.w * mu) / sigma
    const ok = Number.isFinite(slope) && Math.abs(slope) < 10
    F.push({
      ...base, w: show(gd.w), b: show(gd.b), loss: hist.map((q) => q.loss), epoch: E, resid: ok, line: 14,
      cap: ok ? cap(`hız ≈ ${fmt(slope, 3, 'tr')} · PWM ${icpt < 0 ? '−' : '+'} ${fmt(Math.abs(icpt), 1, 'tr')}`, `speed ≈ ${slope.toFixed(3)} · PWM ${icpt < 0 ? '−' : '+'} ${Math.abs(icpt).toFixed(1)}`)
        : cap('ıraksadı: öğrenme oranı çok büyük', 'diverged: learning rate too large'),
      stat: ok ? cap(`20 cm/s için PWM ≈ ${Math.round((20 - icpt) / slope)}`, `PWM for 20 cm/s ≈ ${Math.round((20 - icpt) / slope)}`) : stat,
      hold: 3,
    })
    return F
  },
}
