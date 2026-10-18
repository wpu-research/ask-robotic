// Ders: tek nöron (lojistik regresyon). 40 görev denemesi: robotun başlangıçtaki pil gerilimi ve görevi bitirip bitirmediği (1/0).
// Regresyondaki doğrunun üstüne sigmoid eğrisi konur: çıktı 0–1 arası bir güvendir; güvenin %50 olduğu yer karar çizgisidir.
import { cap, fmt, mean, rng, std, type Frame, type Lesson } from './core'
import { B, erkenDurdurma, gecmisGrafik, siniflandirmaBlok, type EgitimRaporu } from './egitim/rapor'

export interface LogFrame extends Frame {
  /** Başlangıç gerilimi (V) ve sonuç (1 = görev tamamlandı). Paylaşılan referans. */
  V: number[]
  done: number[]
  /** Ölçekli x için ağırlıklar (x = (V − μ) / σ). */
  w: number
  b: number
  mu: number
  sigma: number
  loss: number[]
  epoch: number
  /** Ölçekleme gösterimi. */
  scaled?: boolean
  /** Hatalar (tahmin − gerçek) gösterilsin. */
  resid?: boolean
  /** Karar çizgisi (eşik) vurgulansın. */
  thr?: boolean
}

export const TRUE_THR = 7.4
export const EPOCHS = 300

export const sigmoid = (z: number) => 1 / (1 + Math.exp(-z))

/** 40 deneme: gerilim 6,6–8,4 V; görevi bitirme olasılığı gerçek eşik 7,4 V çevresinde dik bir sigmoid. */
export function missionData(seed = 4) {
  const r = rng(seed)
  const V: number[] = [], done: number[] = []
  for (let i = 0; i < 40; i++) {
    const v = 6.6 + 1.8 * r()
    V.push(Math.round(v * 100) / 100)
    done.push(r() < sigmoid(8 * (v - TRUE_THR)) ? 1 : 0)
  }
  return { V, done }
}

/** Gradyan inişi, çapraz entropi kaybı. hist[e]: e. dönemin başındaki ağırlıklar ve kayıp. */
export function trainLogistic(V: number[], done: number[], lr: number, epochs = EPOCHS) {
  const mu = mean(V), sigma = std(V)
  const x = V.map((v) => (v - mu) / sigma)
  let w = 0, b = 0
  const hist: Array<{ w: number; b: number; loss: number }> = []
  for (let e = 0; e < epochs; e++) {
    const p = x.map((xi) => sigmoid(w * xi + b))
    const loss = mean(p.map((q, i) => -(done[i] ? Math.log(q + 1e-12) : Math.log(1 - q + 1e-12))))
    hist.push({ w, b, loss })
    const gw = mean(p.map((q, i) => (q - done[i]) * x[i])), gb = mean(p.map((q, i) => q - done[i]))
    w -= lr * gw
    b -= lr * gb
  }
  return { mu, sigma, hist, w, b }
}

/** Güven: görevin tamamlanma olasılığı. */
export const confidence = (v: number, w: number, b: number, mu: number, sigma: number) => sigmoid(w * ((v - mu) / sigma) + b)
/** Güvenin %50 olduğu gerilim (karar çizgisi). */
export const threshold = (w: number, b: number, mu: number, sigma: number) => mu - (b / w) * sigma
export const accuracy = (V: number[], done: number[], w: number, b: number, mu: number, sigma: number) =>
  mean(V.map((v, i) => ((confidence(v, w, b, mu, sigma) > 0.5 ? 1 : 0) === done[i] ? 1 : 0)))

/**
 * Eğitim paneli ve Python kodu için: aynı gradyan inişi, ama her 4. deneme (i % 4 = 3) doğrulamaya ayrılır, güncelleme yalnız
 * eğitim denemeleriyle yapılır. Her dönemde (güncellemeden önce) eğitim/doğrulama kaybı ve doğruluğu kaydedilir.
 */
export function trainLogisticSplit(V: number[], done: number[], lr: number, epochs = EPOCHS) {
  const mu = mean(V), sigma = std(V)
  const x = V.map((v) => (v - mu) / sigma)
  const idx = x.map((_, i) => i), tr = idx.filter((i) => i % 4 !== 3), va = idx.filter((i) => i % 4 === 3)
  let w = 0, b = 0
  const h = { epoch: [] as number[], loss: [] as number[], val_loss: [] as number[], acc: [] as number[], val_acc: [] as number[], grad_norm: [] as number[] }
  let p: number[] = []
  for (let e = 0; e < epochs; e++) {
    p = x.map((xi) => sigmoid(w * xi + b))
    const ce = p.map((q, i) => -(done[i] ? Math.log(q + 1e-12) : Math.log(1 - q + 1e-12)))
    const ok = p.map((q, i) => ((q > 0.5 ? 1 : 0) === done[i] ? 1 : 0))
    const gw = mean(tr.map((i) => (p[i] - done[i]) * x[i])), gb = mean(tr.map((i) => p[i] - done[i]))
    h.epoch.push(e); h.loss.push(mean(tr.map((i) => ce[i]))); h.val_loss.push(mean(va.map((i) => ce[i])))
    h.acc.push(mean(tr.map((i) => ok[i]))); h.val_acc.push(mean(va.map((i) => ok[i]))); h.grad_norm.push(Math.hypot(gw, gb))
    w -= lr * gw
    b -= lr * gb
  }
  const pFinal = x.map((xi) => sigmoid(w * xi + b))
  return { mu, sigma, w, b, tr, va, h, p: pFinal }
}

/** Eğitim raporu: kayıp ve doğruluk eğrileri (eğitim/doğrulama), gradyan normu, doğrulamada karışıklık matrisi, ROC/PR. */
export function logisticReport({ lr = 0.5 }: Record<string, number>): EgitimRaporu {
  const { V, done } = missionData()
  const g = trainLogisticSplit(V, done, lr)
  const { h } = g
  const r: EgitimRaporu = {
    kind: 'siniflandirma', model: B('tek nöron: sigmoid(w·x + b)', 'single neuron: sigmoid(w·x + b)'), seed: 4, hyper: { lr, epochs: EPOCHS, train: g.tr.length, val: g.va.length },
    history: { x: 'epoch', cols: { epoch: h.epoch, loss: h.loss, val_loss: h.val_loss, acc: h.acc, val_acc: h.val_acc } },
    final: [], charts: [],
  }
  const labels = ['kaldı / stranded', 'bitti / finished']
  const blk = siniflandirmaBlok({ y: g.va.map((i) => done[i]), pred: g.va.map((i) => (g.p[i] > 0.5 ? 1 : 0)), scores: g.va.map((i) => g.p[i]), threshold: 0.5, labels, pos: B('bitti', 'finished'), neg: B('kaldı', 'stranded'), prefix: 'val_', title: B('doğrulama', 'validation') })
  const thr = threshold(g.w, g.b, g.mu, g.sigma)
  r.final = [
    { key: 'loss', label: B('eğitim kaybı', 'training loss'), value: h.loss.at(-1)!, fmt: 3 },
    { key: 'val_loss', label: B('doğrulama kaybı', 'validation loss'), value: h.val_loss.at(-1)!, fmt: 3 },
    { key: 'acc', label: B('eğitim doğruluğu', 'training accuracy'), value: h.acc.at(-1)!, fmt: 'pct' },
    ...blk.final,
    { key: 'gap', label: B('eğitim − doğrulama farkı', 'train − validation gap'), value: h.acc.at(-1)! - h.val_acc.at(-1)!, fmt: 3 },
    { key: 'threshold_v', label: B('karar çizgisi (V)', 'decision line (V)'), value: thr, fmt: 2 },
  ]
  r.confusion = blk.confusion
  r.scores = blk.scores
  r.charts = [
    gecmisGrafik(r, 'loss', B('Kayıp (çapraz entropi)', 'Loss (cross-entropy)'), [['loss', B('eğitim', 'train'), 1], ['val_loss', B('doğrulama', 'validation'), 0, true]], { marker: erkenDurdurma(h.epoch, h.val_loss) }),
    gecmisGrafik(r, 'acc', B('Doğruluk', 'Accuracy'), [['acc', B('eğitim', 'train'), 1], ['val_acc', B('doğrulama', 'validation'), 0, true]], { yMin: 0, yMax: 1 }),
    { kind: 'line', id: 'grad', title: B('Gradyan normu |∇kayıp|', 'Gradient norm |∇loss|'), x: h.epoch, xLabel: B('dönem', 'epoch'), series: [{ key: 'grad_norm', label: B('|∇|', '|∇|'), values: h.grad_norm, tone: 4 }], live: true, logY: true },
    ...blk.charts,
  ]
  return r
}

export const LOJISTIK_NORON: Lesson<LogFrame> = {
  slug: 'lojistik-noron',
  n: 0,
  title: { tr: 'Tek nöron: doğru + sigmoid', en: 'One neuron: a line plus a sigmoid' },
  sub: { tr: 'Pil gerilimine bakıp "görev biter mi?" güvenini öğrenmek', en: 'Learning from battery voltage how sure we are the mission will finish' },
  story: {
    tr: 'Bir teslimat robotu 40 kez aynı görev rotasına çıktı. Her denemede yola çıkarkenki pil gerilimini (6,6–8,4 V) ve görevi bitirip bitirmediğini (1 = bitirdi, 0 = yolda kaldı) kaydettik. Cevap artık bir sayı değil, bir grup: evet ya da hayır. Robotun yola çıkmadan önce "bu gerilimle görevi bitirir miyim?" sorusuna bir güvenle cevap vermesini istiyoruz.',
    en: 'A delivery robot ran the same mission route 40 times. Each time we logged the battery voltage at the start (6.6–8.4 V) and whether it finished (1 = finished, 0 = stranded). The answer is no longer a number but a group: yes or no. We want the robot to answer "will I finish with this voltage?" with a confidence before it sets off.',
  },
  how: [
    { tr: 'Ağırlıklı toplam regresyondaki doğrunun aynısıdır: z = w·x + b (x ölçekli gerilim).', en: 'The weighted sum is the same line as in regression: z = w·x + b (x is the scaled voltage).' },
    { tr: 'Yeni olan sigmoid eğrisidir: z ne olursa olsun çıktıyı 0 ile 1 arasına sıkıştırır. Bu çıktı nöronun ne kadar emin olduğudur.', en: 'What is new is the sigmoid curve: whatever z is, it squeezes the output between 0 and 1. That output is how sure the neuron is.' },
    { tr: 'Hata ve adım öncekiyle aynıdır: (güven − gerçek) ile ağırlıklar biraz düzeltilir. Kayıp olarak çapraz entropi kullanılır: emin ve yanlış tahmin ağır cezalanır.', en: 'The error and the step are as before: (confidence − truth) nudges the weights. The loss is cross-entropy: confident wrong answers are punished hard.' },
    { tr: 'Nöron hiçbir zaman evet ya da hayır demez; ne kadar emin olduğunu söyler. Güvenin %50 olduğu yerde karar çizgisini çekeriz.', en: 'A neuron never says yes or no; it says how sure it is. Where it says one half, we draw the decision line.' },
    { tr: 'Şunu dene: öğrenme oranını 0,05 yap; eğri 300 dönemde zor dikleşir. 5 yap: eşik hızla yerine oturur.', en: 'Try this: set the learning rate to 0.05 and the curve barely steepens in 300 epochs; set it to 5 and the threshold snaps into place.' },
  ],
  why: {
    tr: 'Bu tek nöron, istatistikte lojistik regresyon adıyla bilinir ve sinir ağlarının yapı taşıdır: büyük dil modelleri de milyarlarca ağırlıkla aynı hesabı yapar. Robotikte "kavrama başarılı olur mu?", "bu engel gerçek mi?", "bu batarya görevi bitirir mi?" gibi evet/hayır kararlarının güvenle verilmesi buna dayanır.',
    en: 'This single neuron is known in statistics as logistic regression, and it is the building block of neural networks: large language models do the same calculation with billions of weights. In robotics, yes/no decisions with a confidence, such as "will this grasp succeed?", "is this obstacle real?" or "will this battery last the mission?", rest on it.',
  },
  file: 'lojistik_noron.py',
  code: [
    ['import numpy as np'],
    ['rng = np.random.default_rng(4)'],
    ['V = rng.uniform(6.6, 8.4, 40)', 'başlangıç gerilimi (V)', 'starting voltage (V)'],
    ['p_true = 1 / (1 + np.exp(-8 * (V - 7.4)))', 'gerçek eşik 7,4 V', 'true threshold 7.4 V'],
    ['y = 1.0 * (rng.random(40) < p_true)', '1 = görev bitti', '1 = mission finished'],
    ['x = (V - V.mean()) / V.std()', 'ölçekle', 'scale'],
    ['w, b, lr = 0.0, 0.0, 0.5'],
    ['val = np.arange(40) % 4 == 3', 'her 4. deneme doğrulamaya ayrılır', 'every 4th run is held out for validation'],
    ['history = {\'epoch\': [], \'loss\': [], \'val_loss\': [], \'acc\': [], \'val_acc\': []}', 'eğitim geçmişi', 'training history'],
    ['for epoch in range(300):'],
    ['    p = 1 / (1 + np.exp(-(w * x + b)))', 'doğru + sigmoid: güven', 'line + sigmoid: confidence'],
    ['    ce = -(y * np.log(p) + (1 - y) * np.log(1 - p))', 'çapraz entropi (deneme başına)', 'cross-entropy (per run)'],
    ['    loss, ok = ce[~val].mean(), (p > 0.5) == y', 'eğitim kaybı, doğru tahminler', 'training loss, correct predictions'],
    ['    for k, v in zip(history, (epoch, loss, ce[val].mean(), ok[~val].mean(), ok[val].mean())): history[k].append(float(v))'],
    ['    w -= lr * ((p - y) * x)[~val].mean()', 'hataya karşı adım (yalnız eğitim)', 'step against the error (training only)'],
    ['    b -= lr * (p - y)[~val].mean()'],
    ['thr = V.mean() - b / w * V.std()', 'güven %50: karar çizgisi', 'confidence 50%: decision line'],
    ['print(thr, ((p > 0.5) == y).mean(), loss)', 'eşik, doğruluk, kayıp', 'threshold, accuracy, loss'],
    ['for k in history:', 'son ölçümler tablosu', 'final metrics table'],
    ['    if k != \'epoch\': print(f\'{k:<10}{history[k][-1]:>10.4f}\')'],
    ['import csv'],
    ['with open(\'egitim_gecmisi.csv\', \'w\', newline=\'\') as f:', 'geçmişi CSV\'ye yaz', 'write the history to CSV'],
    ['    csv.writer(f).writerows([list(history), *zip(*history.values())])', 'satır başına bir dönem', 'one row per epoch'],
    ['try:'],
    ['    import matplotlib.pyplot as plt', 'varsa grafik çiz', 'plot if available'],
    ['    fig, (a1, a2) = plt.subplots(1, 2, figsize=(9, 3.5))'],
    ['    for k in (\'loss\', \'val_loss\'): a1.plot(history[\'epoch\'], history[k], label=k)'],
    ['    for k in (\'acc\', \'val_acc\'): a2.plot(history[\'epoch\'], history[k], label=k)'],
    ['    a1.legend(); a2.legend(); a1.set_xlabel(\'epoch\'); a2.set_xlabel(\'epoch\'); plt.show()'],
    ['except ImportError:'],
    ['    print(\'matplotlib yok: grafik atlandı\')'],
  ],
  params: [{ key: 'lr', label: { tr: 'Öğrenme oranı', en: 'Learning rate' }, min: 0.05, max: 5, step: 0.05, value: 0.5 }],
  report: logisticReport,
  run({ lr = 0.5 }) {
    const { V, done } = missionData()
    const gd = trainLogistic(V, done, lr)
    const { mu, sigma, hist } = gd
    const base = { V, done, mu, sigma }
    const nOk = done.filter((d) => d === 1).length
    const F: LogFrame[] = []
    const stat0 = cap(`40 deneme · ${nOk} bitti, ${40 - nOk} yolda kaldı`, `40 runs · ${nOk} finished, ${40 - nOk} stranded`)
    F.push({ ...base, w: 0, b: 0, loss: [], epoch: 0, line: 2, cap: cap('40 görev denemesi', '40 mission runs'), stat: stat0, hold: 2 })
    F.push({ ...base, w: 0, b: 0, loss: [], epoch: 0, line: 4, cap: cap('cevap bir grup: 1 bitti, 0 kaldı', 'the answer is a group: 1 finished, 0 stranded'), stat: stat0, hold: 1.6 })
    F.push({ ...base, w: 0, b: 0, loss: [], epoch: 0, scaled: true, line: 5, cap: cap(`ölçekle: μ = ${fmt(mu, 2, 'tr')} V, σ = ${fmt(sigma, 2, 'tr')} V`, `scale: μ = ${mu.toFixed(2)} V, σ = ${sigma.toFixed(2)} V`), stat: stat0, hold: 1.5 })
    F.push({ ...base, w: 0, b: 0, loss: [], epoch: 0, line: 6, cap: cap('w = 0, b = 0: her yerde güven %50', 'w = 0, b = 0: 50% confidence everywhere'), stat: stat0, hold: 1.5 })
    const accStat = (w: number, b: number) => {
      const a = accuracy(V, done, w, b, mu, sigma)
      return cap(`doğruluk %${Math.round(a * 100)} · öğrenme oranı ${fmt(lr, 2, 'tr')}`, `accuracy ${Math.round(a * 100)}% · learning rate ${lr.toFixed(2)}`)
    }
    hist.forEach((h, e) => {
      const ep = e + 1
      const keep = ep <= 20 || ep % 5 === 0
      if (!keep) return
      const loss = hist.slice(0, ep).map((q) => q.loss)
      const st = { ...base, w: h.w, b: h.b, loss, epoch: ep }
      const thr = h.w ? threshold(h.w, h.b, mu, sigma) : NaN
      const tStr = Number.isFinite(thr) && thr > 5 && thr < 10 ? [fmt(thr, 2, 'tr'), thr.toFixed(2)] : ['–', '–']
      const c = cap(`dönem ${ep} · kayıp ${fmt(h.loss, 3, 'tr')} · eşik ${tStr[0]} V`, `epoch ${ep} · loss ${h.loss.toFixed(3)} · threshold ${tStr[1]} V`)
      const s = accStat(h.w, h.b)
      if (ep <= 2) {
        F.push({ ...st, line: 10, cap: c, stat: s, hold: 1.2 })
        F.push({ ...st, line: 11, resid: true, cap: c, stat: s, hold: 1.2 })
        F.push({ ...st, line: 14, resid: true, cap: c, stat: s, hold: 1 })
        F.push({ ...st, line: 15, cap: c, stat: s, hold: 0.9 })
      } else F.push({ ...st, line: 14, cap: c, stat: s, hold: ep <= 20 ? 0.5 : 0.25 })
    })
    const thr = threshold(gd.w, gd.b, mu, sigma)
    const acc = accuracy(V, done, gd.w, gd.b, mu, sigma)
    const fin = { ...base, w: gd.w, b: gd.b, loss: hist.map((q) => q.loss), epoch: EPOCHS, thr: true }
    F.push({ ...fin, line: 16, cap: cap(`karar çizgisi: ${fmt(thr, 2, 'tr')} V (gerçek 7,4 V)`, `decision line: ${thr.toFixed(2)} V (true 7.4 V)`), stat: accStat(gd.w, gd.b), hold: 2 })
    const c7 = confidence(7.2, gd.w, gd.b, mu, sigma), c8 = confidence(7.8, gd.w, gd.b, mu, sigma)
    F.push({
      ...fin, line: 17,
      cap: cap(`eşik ${fmt(thr, 2, 'tr')} V · doğruluk %${Math.round(acc * 100)}`, `threshold ${thr.toFixed(2)} V · accuracy ${Math.round(acc * 100)}%`),
      stat: cap(`7,2 V ile güven %${Math.round(c7 * 100)} · 7,8 V ile %${Math.round(c8 * 100)}`, `confidence at 7.2 V: ${Math.round(c7 * 100)}% · at 7.8 V: ${Math.round(c8 * 100)}%`),
      hold: 3,
    })
    return F
  },
}
