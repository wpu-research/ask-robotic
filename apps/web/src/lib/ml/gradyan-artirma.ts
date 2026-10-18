// Ders: gradyan artırma (XGBoost'un temel fikri). Drone bataryasının uçuş süresi ortam sıcaklığıyla eğri biçimde değişir.
// Her turda tek eşikli bir regresyon kütüğü önceki modelin kalıntısına uydurulur ve öğrenme oranıyla küçültülüp eklenir.
import { cap, fmt, gauss, mean, rng, type Frame, type Lesson } from './core'
import { B, erkenDurdurma, gecmisGrafik, regresyonBlok, type EgitimRaporu } from './egitim/rapor'
import { histogram } from './egitim/metrics'

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

/**
 * Eğitim paneli ve Python kodu için: aynı artırma, ama her 4. uçuş (i % 4 = 3, sıcaklığa göre sıralı) doğrulamaya ayrılır;
 * kütükler yalnız eğitim uçuşlarının kalıntısına uydurulur. Geçmiş: tur 0 (ortalama) … R, eğitim ve doğrulama MSE.
 */
export function boostWithValidation(rounds: number, lr: number) {
  const { T, y } = batteryData()
  const val = T.map((_, i) => i % 4 === 3)
  const tr = T.map((_, i) => i).filter((i) => !val[i]), va = T.map((_, i) => i).filter((i) => val[i])
  const Tt = tr.map((i) => T[i])
  const F0 = mean(tr.map((i) => y[i]))
  const F = T.map(() => F0)
  const h = { round: [] as number[], loss: [] as number[], val_loss: [] as number[] }
  const rec = (k: number) => { h.round.push(k); h.loss.push(mean(tr.map((i) => (y[i] - F[i]) ** 2))); h.val_loss.push(mean(va.map((i) => (y[i] - F[i]) ** 2))) }
  rec(0)
  const stumps: Stump[] = []
  for (let k = 0; k < rounds; k++) {
    const s = fitStump(Tt, tr.map((i) => y[i] - F[i]))
    stumps.push(s)
    T.forEach((x, i) => { F[i] += lr * stumpAt(s, x) })
    rec(k + 1)
  }
  return { T, y, tr, va, F0, F, stumps, h }
}

/** Gradyan artırma dersinin eğitim raporu: kayıp eğrileri, erken durdurma, artıklar, kütük eşiklerinin dağılımı. */
export function boostReport({ rounds = 100, lr = 0.1 }: Record<string, number>): EgitimRaporu {
  const R = Math.max(1, Math.round(rounds))
  const g = boostWithValidation(R, lr)
  const r: EgitimRaporu = {
    kind: 'regresyon', model: B(`gradyan artırma, ${R} kütük`, `gradient boosting, ${R} stumps`), seed: 8, hyper: { rounds: R, lr, train: g.tr.length, val: g.va.length },
    history: { x: 'round', cols: g.h }, final: [], charts: [],
  }
  const blk = regresyonBlok({ y: g.va.map((i) => g.y[i]), pred: g.va.map((i) => g.F[i]), x: g.va.map((i) => g.T[i]), xLabel: B('sıcaklık (°C)', 'temperature (°C)'), unit: 'dk', prefix: 'val_' })
  const bi = g.h.val_loss.indexOf(Math.min(...g.h.val_loss))
  r.final = [
    { key: 'loss', label: B('eğitim kaybı (MSE)', 'training loss (MSE)'), value: g.h.loss[R], fmt: 3 },
    ...blk.final,
    { key: 'best_round', label: B('en iyi doğrulama turu', 'best validation round'), value: g.h.round[bi], fmt: 'int' },
  ]
  const hs = histogram(g.stumps.map((s) => s.t), 20, -10, 50)
  r.charts = [
    gecmisGrafik(r, 'loss', B('Kayıp (MSE): eğitim ve doğrulama', 'Loss (MSE): training and validation'), [['loss', B('eğitim', 'train'), 1], ['val_loss', B('doğrulama', 'validation'), 0, true]], { xLabel: B('tur (kütük sayısı)', 'round (stumps)'), yLabel: B('MSE', 'MSE'), logY: true, marker: erkenDurdurma(g.h.round, g.h.val_loss) }),
    ...blk.charts,
    { kind: 'hist', id: 'stump-t', title: B('Kütük eşiklerinin dağılımı', 'Where the stumps split'), edges: hs.edges, frames: [{ label: `${R}`, counts: hs.counts }], xLabel: B('eşik sıcaklığı (°C)', 'threshold temperature (°C)'), note: B('Kütükler eğrinin büküldüğü yerlerde (soğuk ve sıcak uçlar) yoğunlaşır.', 'Stumps cluster where the curve bends (the cold and hot ends).') },
  ]
  return r
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
    ['val = np.arange(80) % 4 == 3', 'her 4. uçuş doğrulama', 'every 4th flight: validation'],
    ['Tt, yt = T[~val], y[~val]', 'eğitim uçuşları', 'training flights'],
    ['def kutuk(r):'],
    ['    best = (np.inf, 0, 0, 0)'],
    ['    for t in (Tt[1:] + Tt[:-1]) / 2:', 'her eşik', 'every threshold'],
    ['        L = Tt <= t'],
    ['        a, b = r[L].mean(), r[~L].mean()', 'iki yaprak: ortalama', 'two leaves: mean'],
    ['        e = ((r - np.where(L, a, b)) ** 2).sum()'],
    ['        if e < best[0]: best = (e, t, a, b)'],
    ['    return best[1:]'],
    ['lr = 0.1', 'öğrenme oranı', 'learning rate'],
    ['F = np.full(80, yt.mean())', 'başlangıç: ortalama', 'start: the mean'],
    ['mse = lambda m: float(((y - F)[m] ** 2).mean())', 'MSE (maske)', 'MSE (mask)'],
    ["history = {'round': [0], 'loss': [mse(~val)],"],
    ["           'val_loss': [mse(val)]}", 'eğitim geçmişi', 'training history'],
    ['for tur in range(100):'],
    ['    r = yt - F[~val]', 'kalıntı (eğitim)', 'residual (training)'],
    ['    t, a, b = kutuk(r)', 'kalıntıya kütük', 'stump on the residual'],
    ['    F += lr * np.where(T <= t, a, b)', 'küçültüp ekle', 'shrink and add'],
    ['    row = tur + 1, mse(~val), mse(val)'],
    ['    for k, v in zip(history, row): history[k].append(v)'],
    ["kayip = history['loss']"],
    ["print('kayıp', f'{kayip[0]:.1f} -> {kayip[-1]:.2f}')"],
    ["print('oran', kayip[-1] / kayip[0])"],
    ["vl = history['val_loss']; best = int(np.argmin(vl))", 'erken durdurma', 'early stopping'],
    ['res = (y - F)[val]', 'doğrulama artıkları', 'validation residuals'],
    ['r2 = 1 - (res ** 2).mean() / y[val].var()', 'doğrulamada R²', 'validation R²'],
    ["for k, v in [('loss', kayip[-1]), ('val_loss', vl[-1]),"],
    ["             ('val_r2', r2), ('best_round', best)]:"],
    ["    print(f'{k:<11}{v:>9.3f}')", 'son ölçümler', 'final metrics'],
    ['import csv'],
    ["with open('egitim_gecmisi.csv', 'w', newline='') as f:"],
    ['    w = csv.writer(f); w.writerow(history)', 'satır başına bir tur', 'one row per round'],
    ['    w.writerows(zip(*history.values()))'],
    ['try:'],
    ['    import matplotlib.pyplot as plt', 'varsa grafik', 'plot if available'],
    ["    for k in ('loss', 'val_loss'):"],
    ["        plt.plot(history['round'], history[k], label=k)"],
    ["    plt.yscale('log'); plt.legend(); plt.show()"],
    ['except ImportError:'],
    ["    print('matplotlib yok: grafik atlandı')"],
  ],
  params: [
    { key: 'rounds', label: { tr: 'Tur sayısı', en: 'Rounds' }, min: 1, max: 200, step: 1, value: 100 },
    { key: 'lr', label: { tr: 'Öğrenme oranı', en: 'Learning rate' }, min: 0.02, max: 1, step: 0.02, value: 0.1 },
  ],
  report: boostReport,
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
// Python koduna doğrulama ayrımı (2 satır) ve geçmiş kaydı eklendi: vurgulanan satırlar eski satırlarına göre kayar.
const gbRun = GRADYAN_ARTIRMA.run
GRADYAN_ARTIRMA.run = (p) => gbRun(p).map((f) => ({ ...f, line: f.line <= 5 ? f.line : f.line <= 16 ? f.line + 2 : f.line <= 21 ? f.line + 4 : f.line + 6 }))
