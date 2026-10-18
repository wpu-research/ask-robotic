// Ders: gradyan artırma (XGBoost'un temel fikri). Drone bataryasının uçuş süresi ortam sıcaklığıyla eğri biçimde değişir.
// Her turda tek eşikli bir regresyon kütüğü önceki modelin kalıntısına uydurulur ve öğrenme oranıyla küçültülüp eklenir.
import { cap, fmt, gauss, mean, rng, type Frame, type Lesson } from './core'

/** Kütük: x ≤ t ise a, değilse b. */
export interface Stump { t: number; a: number; b: number }

export interface GbFrame extends Frame {
  /** 80 uçuş: sıcaklık (°C, sıralı) ve uçuş süresi (dk). Paylaşılan referans. */
  T: number[]
  y: number[]
  /** Başlangıç tahmini (ortalama), öğrenme oranı ve bütün kütükler (paylaşılan). */
  F0: number
  lr: number
  stumps: Stump[]
  /** Modele eklenmiş kütük sayısı. */
  m: number
  /** Alt panelde gösterilen kalıntı: ilk `res` kütükten sonra; kütük: `show` indeksli kütük (yoksa çizilmez). */
  res?: number
  show?: number
  /** Kayıp (ortalama kare hata) geçmişi, paylaşılan; kayip[k] = k kütükten sonra. */
  loss: number[]
}

/** Gerçek ilişki: soğukta (−10 °C) süre yarıya iner, 30 °C üstünde yeniden düşer; ±1,5 dk ölçüm gürültüsü. */
export function batteryData(seed = 8) {
  const r = rng(seed)
  const T = Array.from({ length: 80 }, () => -10 + 60 * r()).sort((a, b) => a - b)
  const y = T.map((t) => 62 - 30 * Math.exp(-(t + 10) / 10) - 0.04 * Math.max(0, t - 30) ** 2 + 1.5 * gauss(r))
  return { T, y }
}

/** En iyi tek eşikli kütük (en küçük kare hata); eşikler komşu sıcaklıkların ortası. T sıralı olmalı. */
export function fitStump(T: number[], r: number[]): Stump {
  const n = T.length
  const tot = r.reduce((a, b) => a + b, 0)
  let best = Infinity, s: Stump = { t: T[0], a: 0, b: 0 }
  let sl = 0
  for (let k = 0; k < n - 1; k++) {
    sl += r[k]
    const nl = k + 1, nr = n - nl
    const a = sl / nl, b = (tot - sl) / nr
    // kare hata = Σr² − nl·a² − nr·b² (Σr² sabit; en büyük nl·a² + nr·b² aranır)
    const e = -(nl * a * a + nr * b * b)
    if (e < best - 1e-12) { best = e; s = { t: (T[k] + T[k + 1]) / 2, a, b } }
  }
  return s
}

export const stumpAt = (s: Stump, x: number): number => (x <= s.t ? s.a : s.b)
/** İlk m kütükle model. */
export const gbPredict = (F0: number, lr: number, stumps: Stump[], m: number, x: number): number => {
  let v = F0
  for (let j = 0; j < m; j++) v += lr * stumpAt(stumps[j], x)
  return v
}

export function boost(rounds: number, lr: number) {
  const { T, y } = batteryData()
  const F0 = mean(y)
  const F = T.map(() => F0)
  const mse = () => mean(F.map((v, i) => (y[i] - v) ** 2))
  const loss = [mse()]
  const stumps: Stump[] = []
  for (let k = 0; k < rounds; k++) {
    const r = y.map((v, i) => v - F[i])
    const s = fitStump(T, r)
    stumps.push(s)
    T.forEach((x, i) => { F[i] += lr * stumpAt(s, x) })
    loss.push(mse())
  }
  return { T, y, F0, stumps, loss }
}

export const GRADYAN_ARTIRMA: Lesson<GbFrame> = {
  slug: 'gradyan-artirma',
  n: 0,
  title: { tr: 'Gradyan artırma', en: 'Gradient boosting' },
  sub: { tr: 'Küçük ağaçlar art arda, her biri öncekinin hatasını düzeltir', en: 'Tiny trees in a row, each fixing the error of the ones before' },
  story: {
    tr: 'Bir kargo dronunu −10 °C ile 50 °C arasında 80 kez aynı görevle uçurduk ve batarya bitene kadar kaç dakika havada kaldığını ölçtük. Soğukta kimyasal tepkime yavaşlar, süre 30 dakikanın altına düşer; 30 °C’nin üstünde batarya koruması devreye girer, süre yine azalır. Görev planlayıcı, hava sıcaklığından uçuş süresini tahmin etmek istiyor.',
    en: 'We flew a cargo drone on the same mission 80 times between −10 °C and 50 °C and measured how many minutes it stayed in the air until the battery ran out. In the cold the chemistry slows down and the time drops below 30 minutes; above 30 °C the battery protection kicks in and the time drops again. The mission planner wants to predict flight time from the air temperature.',
  },
  how: [
    { tr: 'Başlangıç modeli düz bir çizgidir: bütün uçuşların ortalaması.', en: 'The starting model is a flat line: the average of all flights.' },
    { tr: 'Kalıntı = gerçek − tahmin. Kare hatanın gradyanı tam olarak budur; adı buradan gelir.', en: 'Residual = actual − prediction. This is exactly the gradient of the squared error, which is where the name comes from.' },
    { tr: 'Kalıntıya bir kütük uydurulur: tek eşik, iki yaprak, her yaprak kendi kalıntılarının ortalaması.', en: 'A stump is fitted to the residuals: one threshold, two leaves, each leaf the mean of its residuals.' },
    { tr: 'Kütük öğrenme oranıyla küçültülüp modele eklenir; sonra yeni kalıntılar hesaplanır. Basamaklar üst üste binerek eğriyi çizer.', en: 'The stump is shrunk by the learning rate and added to the model; then new residuals are computed. The steps pile up and draw the curve.' },
    { tr: 'Şunu dene: öğrenme oranını 1 yap. Model birkaç turda oturur ama gürültüyü de kovalar; 0,1 ile daha yavaş ve daha düzgün öğrenir.', en: 'Try this: set the learning rate to 1. The model settles in a few rounds but also chases the noise; with 0.1 it learns more slowly and more smoothly.' },
  ],
  why: {
    tr: 'XGBoost, LightGBM ve CatBoost bu fikrin hızlı ve düzenlileştirilmiş hâlleridir; tablo verisinde Kaggle yarışmalarını yıllardır onlar kazanır. Robotik ve enerji sistemlerinde batarya ömrü, motor sıcaklığı ve arıza süresi tahmininde sık kullanılır.',
    en: 'XGBoost, LightGBM and CatBoost are fast, regularised versions of this idea; they have won tabular-data Kaggle competitions for years. In robotics and energy systems they are often used to predict battery life, motor temperature and time to failure.',
  },
  file: 'gradyan_artirma.py',
  code: [
    ['import numpy as np'],
    ['rng = np.random.default_rng(8)'],
    ['T = np.sort(rng.uniform(-10, 50, 80))', 'ortam sıcaklığı, °C', 'air temperature, °C'],
    ['y = 62 - 30 * np.exp(-(T + 10) / 10)', 'soğukta düşüş', 'drop in the cold'],
    ['y -= 0.04 * np.maximum(0, T - 30) ** 2', 'sıcakta düşüş', 'drop in the heat'],
    ['y += rng.normal(0, 1.5, 80)', 'uçuş süresi, dk', 'flight time, min'],
    ['def kutuk(r):'],
    ['    best = (np.inf, 0, 0, 0)'],
    ['    for t in (T[1:] + T[:-1]) / 2:', 'her eşik', 'every threshold'],
    ['        L = T <= t'],
    ['        a, b = r[L].mean(), r[~L].mean()', 'iki yaprak: ortalama', 'two leaves: mean'],
    ['        e = ((r - np.where(L, a, b)) ** 2).sum()'],
    ['        if e < best[0]: best = (e, t, a, b)'],
    ['    return best[1:]'],
    ['lr = 0.1', 'öğrenme oranı', 'learning rate'],
    ['F = np.full(80, y.mean())', 'başlangıç: ortalama', 'start: the mean'],
    ['kayip = [((y - F) ** 2).mean()]'],
    ['for tur in range(100):'],
    ['    r = y - F', 'kalıntı', 'residual'],
    ['    t, a, b = kutuk(r)', 'kalıntıya kütük', 'stump on the residual'],
    ['    F += lr * np.where(T <= t, a, b)', 'küçültüp ekle', 'shrink and add'],
    ['    kayip.append(((y - F) ** 2).mean())'],
    ["print('kayıp', kayip[0].round(1), '->', kayip[-1].round(2))"],
    ["print('oran', kayip[-1] / kayip[0])"],
  ],
  params: [
    { key: 'rounds', label: { tr: 'Tur sayısı', en: 'Rounds' }, min: 1, max: 200, step: 1, value: 100 },
    { key: 'lr', label: { tr: 'Öğrenme oranı', en: 'Learning rate' }, min: 0.02, max: 1, step: 0.02, value: 0.1 },
  ],
  run({ rounds = 100, lr = 0.1 }) {
    const R = Math.max(1, Math.round(rounds))
    const { T, y, F0, stumps, loss } = boost(R, lr)
    const base = { T, y, F0, lr, stumps, loss }
    const F: GbFrame[] = []
    const lt = (k: number) => fmt(loss[k], 2, 'tr'), le = (k: number) => loss[k].toFixed(2)
    const stat = cap(`80 uçuş · öğrenme oranı ${fmt(lr, 2, 'tr')}`, `80 flights · learning rate ${lr.toFixed(2)}`)
    F.push({ ...base, m: 0, line: 5, cap: cap('80 uçuş: sıcaklık ve uçuş süresi', '80 flights: temperature and flight time'), stat, hold: 2 })
    F.push({ ...base, m: 0, line: 15, cap: cap(`başlangıç: ortalama ${fmt(F0, 1, 'tr')} dk`, `start: the mean, ${F0.toFixed(1)} min`), stat: cap(`kayıp ${lt(0)}`, `loss ${le(0)}`), hold: 1.8 })
    for (let k = 1; k <= R; k++) {
      const s = stumps[k - 1]
      const c = cap(`tur ${k} · kayıp ${lt(k)}`, `round ${k} · loss ${le(k)}`)
      const st = cap(`kütük: T ≤ ${fmt(s.t, 1, 'tr')} °C ise ${fmt(s.a, 2, 'tr')}, değilse ${fmt(s.b, 2, 'tr')}`, `stump: ${s.a.toFixed(2)} if T ≤ ${s.t.toFixed(1)} °C, else ${s.b.toFixed(2)}`)
      if (k <= 2) {
        F.push({ ...base, m: k - 1, res: k - 1, line: 18, cap: cap(`tur ${k} · kalıntı = gerçek − tahmin`, `round ${k} · residual = actual − prediction`), stat: cap(`kayıp ${lt(k - 1)}`, `loss ${le(k - 1)}`), hold: 1.6 })
        F.push({ ...base, m: k - 1, res: k - 1, show: k - 1, line: 19, cap: cap(`tur ${k} · kalıntıya kütük uyduruldu`, `round ${k} · stump fitted to the residual`), stat: st, hold: 1.8 })
        F.push({ ...base, m: k, res: k - 1, show: k - 1, line: 20, cap: c, stat: cap(`kütük × ${fmt(lr, 2, 'tr')} eklendi`, `stump × ${lr.toFixed(2)} added`), hold: 1.6 })
        F.push({ ...base, m: k, res: k, line: 21, cap: c, stat: cap('yeni kalıntı küçüldü', 'the new residual is smaller'), hold: 1 })
      } else if (k <= 20 || (k <= 60 && k % 2 === 0) || k % 5 === 0 || k === R) {
        F.push({ ...base, m: k, res: k - 1, show: k - 1, line: 20, cap: c, stat: st, hold: k <= 6 ? 0.9 : k <= 20 ? 0.5 : 0.3 })
      }
    }
    F.push({
      ...base, m: R, res: R, line: 22,
      cap: cap(`${R} tur: kayıp ${lt(0)} → ${lt(R)}`, `${R} rounds: loss ${le(0)} → ${le(R)}`),
      stat: cap(`başlangıca oranı %${fmt((100 * loss[R]) / loss[0], 1, 'tr')}`, `${((100 * loss[R]) / loss[0]).toFixed(1)}% of the start`), hold: 3,
    })
    return F
  },
}
