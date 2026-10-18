// Ders: tek nöron (lojistik regresyon). 40 görev denemesi: robotun başlangıçtaki pil gerilimi ve görevi bitirip bitirmediği (1/0).
// Regresyondaki doğrunun üstüne sigmoid eğrisi konur: çıktı 0–1 arası bir güvendir; güvenin %50 olduğu yer karar çizgisidir.
import { cap, fmt, mean, rng, std, type Frame, type Lesson } from './core'

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
    ['for epoch in range(300):'],
    ['    p = 1 / (1 + np.exp(-(w * x + b)))', 'doğru + sigmoid: güven', 'line + sigmoid: confidence'],
    ['    loss = -(y * np.log(p) + (1 - y) * np.log(1 - p)).mean()', 'çapraz entropi', 'cross-entropy'],
    ['    w -= lr * ((p - y) * x).mean()', 'hataya karşı adım', 'step against the error'],
    ['    b -= lr * (p - y).mean()'],
    ['thr = V.mean() - b / w * V.std()', 'güven %50: karar çizgisi', 'confidence 50%: decision line'],
    ['print(thr, ((p > 0.5) == y).mean(), loss)', 'eşik, doğruluk, kayıp', 'threshold, accuracy, loss'],
  ],
  params: [{ key: 'lr', label: { tr: 'Öğrenme oranı', en: 'Learning rate' }, min: 0.05, max: 5, step: 0.05, value: 0.5 }],
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
        F.push({ ...st, line: 8, cap: c, stat: s, hold: 1.2 })
        F.push({ ...st, line: 9, resid: true, cap: c, stat: s, hold: 1.2 })
        F.push({ ...st, line: 10, resid: true, cap: c, stat: s, hold: 1 })
        F.push({ ...st, line: 11, cap: c, stat: s, hold: 0.9 })
      } else F.push({ ...st, line: 10, cap: c, stat: s, hold: ep <= 20 ? 0.5 : 0.25 })
    })
    const thr = threshold(gd.w, gd.b, mu, sigma)
    const acc = accuracy(V, done, gd.w, gd.b, mu, sigma)
    const fin = { ...base, w: gd.w, b: gd.b, loss: hist.map((q) => q.loss), epoch: EPOCHS, thr: true }
    F.push({ ...fin, line: 12, cap: cap(`karar çizgisi: ${fmt(thr, 2, 'tr')} V (gerçek 7,4 V)`, `decision line: ${thr.toFixed(2)} V (true 7.4 V)`), stat: accStat(gd.w, gd.b), hold: 2 })
    const c7 = confidence(7.2, gd.w, gd.b, mu, sigma), c8 = confidence(7.8, gd.w, gd.b, mu, sigma)
    F.push({
      ...fin, line: 13,
      cap: cap(`eşik ${fmt(thr, 2, 'tr')} V · doğruluk %${Math.round(acc * 100)}`, `threshold ${thr.toFixed(2)} V · accuracy ${Math.round(acc * 100)}%`),
      stat: cap(`7,2 V ile güven %${Math.round(c7 * 100)} · 7,8 V ile %${Math.round(c8 * 100)}`, `confidence at 7.2 V: ${Math.round(c7 * 100)}% · at 7.8 V: ${Math.round(c8 * 100)}%`),
      hold: 3,
    })
    return F
  },
}
