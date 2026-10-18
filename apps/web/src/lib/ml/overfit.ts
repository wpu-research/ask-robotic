// Ders 2: aşırı öğrenme ve doğrulama. Sharp IR mesafe sensörü: gerilim uzaklıkla ters orantılı (V ≈ 26/d). 15 eğitim ve 30
// doğrulama ölçümüne 1'den 12'ye kadar dereceli polinom uydurulur; eğitim hatası hep düşer, doğrulama hatası önce düşer sonra yükselir.
import { cap, fmt, gauss, mean, rng, type Frame, type Lesson, shifted } from './core'

export interface OverfitFrame extends Frame {
  d: number[]; v: number[]; dt: number[]; vt: number[]
  /** Şu anki polinom katsayıları (ölçekli x üzerinde) ve derece. */
  coef: number[] | null
  deg: number
  train: number[]
  test: number[]
  best?: number
  showTest?: boolean
  /** Erken durdurma evresi: derece 12 gradyan inişiyle (Adam) eğitilir; geçiş sayıları ve iki hata, en iyi geçişin sırası. */
  gd?: { steps: number[]; train: number[]; test: number[]; best?: number }
}

export function sharpData(seed = 11) {
  const r = rng(seed)
  const one = (n: number) => {
    const d: number[] = [], v: number[] = []
    for (let i = 0; i < n; i++) { const x = 10 + 70 * r(); d.push(x); v.push(26 / x + 0.12 + 0.06 * gauss(r)) }
    return { d, v }
  }
  const a = one(15), b = one(30)
  return { d: a.d, v: a.v, dt: b.d, vt: b.v }
}

/** x'i [-1, 1]'e ölçekler: yüksek derecede normal denklemler kararlı kalsın. */
export const scaleX = (d: number) => (d - 45) / 35

/** En küçük kareler (normal denklemler + çok küçük sırt): ölçekli x üzerinde katsayılar c0 + c1 x + … */
export function polyfit(d: number[], v: number[], deg: number): number[] {
  const n = deg + 1
  const A = Array.from({ length: n }, () => new Array<number>(n + 1).fill(0))
  d.forEach((di, k) => {
    const x = scaleX(di)
    const pw = Array.from({ length: n }, (_, i) => x ** i)
    for (let i = 0; i < n; i++) { for (let j = 0; j < n; j++) A[i][j] += pw[i] * pw[j]; A[i][n] += pw[i] * v[k] }
  })
  for (let i = 0; i < n; i++) A[i][i] += 1e-9
  for (let c = 0; c < n; c++) {
    let piv = c
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r
    ;[A[c], A[piv]] = [A[piv], A[c]]
    for (let r = 0; r < n; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k <= n; k++) A[r][k] -= f * A[c][k] }
  }
  return A.map((row, i) => row[n] / row[i])
}
export const polyval = (c: number[], d: number): number => { const x = scaleX(d); return c.reduce((s, ci, i) => s + ci * x ** i, 0) }
export const mse = (c: number[], d: number[], v: number[]): number => mean(d.map((x, i) => (polyval(c, x) - v[i]) ** 2))

/** Erken durdurma için anlık görüntü alınan geçişler: 25'ten 20.000'e logaritmik aralıkla. */
export const GD_STEPS = Array.from({ length: 30 }, (_, i) => Math.round(25 * 800 ** (i / 29)))

/**
 * Derece `deg` polinomu Adam adımlarıyla eğitir (lr 0,02, sıfırdan). Her geçişte doğrulama hatasına bakılır, en iyisi saklanır.
 * Dönüş: GD_STEPS'teki anlık görüntüler ve en iyi geçiş (erken durdurmanın döneceği yer).
 */
export function adamFit(D: ReturnType<typeof sharpData>, deg = 12, steps = 20000, lr = 0.02) {
  const n = deg + 1
  const A = D.d.map((d) => Array.from({ length: n }, (_, i) => scaleX(d) ** i))
  const w = new Array<number>(n).fill(0), m = new Array<number>(n).fill(0), v = new Array<number>(n).fill(0)
  const snaps: Array<{ step: number; coef: number[]; train: number; test: number }> = []
  let best = { step: 0, coef: [...w], test: Infinity }
  for (let t = 1; t <= steps; t++) {
    const r = A.map((row, k) => row.reduce((s, a, i) => s + a * w[i], 0) - D.v[k])
    for (let i = 0; i < n; i++) {
      const g = (2 * A.reduce((s, row, k) => s + row[i] * r[k], 0)) / A.length
      m[i] = 0.9 * m[i] + 0.1 * g; v[i] = 0.999 * v[i] + 0.001 * g * g
      w[i] -= (lr * (m[i] / (1 - 0.9 ** t))) / (Math.sqrt(v[i] / (1 - 0.999 ** t)) + 1e-8)
    }
    const te = mse(w, D.dt, D.vt)
    if (te < best.test) best = { step: t, coef: [...w], test: te }
    if (GD_STEPS.includes(t)) snaps.push({ step: t, coef: [...w], train: mse(w, D.d, D.v), test: te })
  }
  return { snaps, best }
}

export const OVERFIT: Lesson<OverfitFrame> = {
  slug: 'asiri-ogrenme',
  n: 2,
  title: { tr: 'Aşırı öğrenme ve doğrulama', en: 'Overfitting and validation' },
  sub: { tr: 'Sensör eğrisine uyan en iyi model, en karmaşık olanı değildir', en: 'The best model for a sensor curve is not the most complex one' },
  story: {
    tr: 'Sharp IR mesafe sensörünün çıkış gerilimi uzaklık arttıkça eğri biçiminde düşer. 15 ölçümle bir kalibrasyon eğrisi uyduracağız, sonra eğrinin hiç görmediği 30 ölçümle sınayacağız.',
    en: 'The output voltage of a Sharp IR distance sensor drops along a curve as the distance grows. We fit a calibration curve to 15 measurements, then test it on 30 measurements the curve has never seen.',
  },
  how: [
    { tr: 'Her derece için polinom en küçük kareler yöntemiyle eğitim noktalarına uydurulur.', en: 'For every degree, a polynomial is fitted to the training points with least squares.' },
    { tr: 'Eğitim hatası derece arttıkça hep azalır: eğri her noktaya biraz daha yaklaşır.', en: 'The training error always falls as the degree grows: the curve gets a little closer to every point.' },
    { tr: 'Doğrulama hatası önce düşer, sonra yükselir: eğri gürültüyü de ezberlemeye başlar ve noktaların arasında savrulur.', en: 'The validation error falls first, then rises: the curve starts memorising the noise too and swings between the points.' },
    { tr: 'Seçilen model, doğrulama hatası en küçük olandır; eğitim hatasına bakarak seçmek her zaman en karmaşık modeli verir.', en: 'We pick the model with the smallest validation error; picking by training error always gives the most complex model.' },
    { tr: 'Aynı şey zamanda da olur. Derece 12’lik eğriyi bu kez gradyan inişiyle (Adam) adım adım eğitiriz: eğitim hatası her geçişte biraz düşer, doğrulama hatası birkaç yüz geçişte dibe vurur ve sonra tırmanır. Dipteki ağırlıkları saklayıp oraya dönmeye erken durdurma denir; büyük sinir ağları da çoğu zaman böyle eğitilir.', en: 'The same happens over time. This time we train the degree-12 curve step by step with gradient descent (Adam): the training error falls a little with every pass, while the validation error bottoms out after a few hundred passes and then climbs. Keeping the weights from the bottom and going back to them is called early stopping; large neural networks are usually trained this way too.' },
    { tr: 'Şunu dene: son kareye kadar oynat ve 20.000 geçişteki savrulan eğriyi, erken durdurmanın döndüğü sakin eğriyle karşılaştır. Sonra son dereceyi 3’e indir: doğrulama hatası daha 3. derecede dipteyken bile eğitim hatası düşmeye devam eder.', en: 'Try this: play to the last frame and compare the swinging curve after 20,000 passes with the calm curve early stopping goes back to. Then lower the last degree to 3: even while the validation error is at its lowest, the training error keeps falling.' },
  ],
  why: {
    tr: "Her makine öğrenmesi modeli bu dengeyle yaşar: az karmaşık olan eksik öğrenir, çok karmaşık olan ezberler. Eğitim ve doğrulama verisini ayırmak, çapraz doğrulama ve erken durdurma bu yüzden vardır. Robotta ezberlenmiş bir kalibrasyon, laboratuvarda mükemmel, sahada tehlikelidir.",
    en: 'Every machine learning model lives with this trade-off: too simple and it underfits, too complex and it memorises. That is why we split training and validation data, cross-validate and stop early. On a robot, a memorised calibration is perfect in the lab and dangerous in the field.',
  },
  file: 'asiri_ogrenme.py',
  code: [
    ['import numpy as np'],
    ['D = np.genfromtxt(\'sharp-ir.csv\', delimiter=\',\', names=True)', '15 eğitim, 30 doğrulama ölçümü', '15 training, 30 validation measurements'],
    ['d, v, d_val, v_val = [D[c][D[\'grup\'] == g] for g in (0, 1) for c in (\'uzaklik\', \'gerilim\')]', 'grup 0 eğitim, 1 doğrulama', 'group 0 training, 1 validation'],
    ['x, x_val = (d - 45) / 35, (d_val - 45) / 35', '[-1, 1] aralığına ölçekle', 'scale to [-1, 1]'],
    ['for deg in range(1, 13):'],
    ['    c = np.polyfit(x, v, deg)', 'en küçük kareler', 'least squares'],
    ['    train = ((np.polyval(c, x) - v) ** 2).mean()', 'eğitim hatası', 'training error'],
    ['    val = ((np.polyval(c, x_val) - v_val) ** 2).mean()', 'doğrulama hatası', 'validation error'],
    ['    print(deg, train, val)'],
    ['A, A_val = np.vander(x, 13), np.vander(x_val, 13)', 'erken durdurma: derece 12, adım adım', 'early stopping: degree 12, step by step'],
    ['w, m, s, best = np.zeros(13), np.zeros(13), np.zeros(13), (1e9, 0, None)'],
    ['for t in range(1, 20001):'],
    ['    g = 2 * A.T @ (A @ w - v) / len(v)', 'eğim', 'slope'],
    ['    m = .9 * m + .1 * g; s = .999 * s + .001 * g * g', 'Adam: eğimin ve büyüklüğünün ortalaması', 'Adam: running mean of the slope and its size'],
    ['    w -= .02 * (m / (1 - .9 ** t)) / (np.sqrt(s / (1 - .999 ** t)) + 1e-8)'],
    ['    val = ((A_val @ w - v_val) ** 2).mean()'],
    ['    if val < best[0]: best = (val, t, w.copy())', 'en iyi geçişi sakla', 'keep the best pass'],
    ['w = best[2]; print("en iyi geçiş", best[1], best[0])', 'erken durdurma: en iyi geçişe dön', 'early stopping: go back to the best pass'],
  ],
  params: [{ key: 'deg', label: { tr: 'Son gösterilecek derece', en: 'Show up to degree' }, min: 1, max: 12, step: 1, value: 12 }],
  run({ deg: maxDeg = 12 }) {
    const D = sharpData()
    const F: OverfitFrame[] = []
    const base = { ...D, coef: null as number[] | null, deg: 0, train: [] as number[], test: [] as number[] }
    const stat = cap('15 eğitim · 30 doğrulama', '15 training · 30 validation')
    F.push({ ...base, line: 1, cap: cap('eğitim ölçümleri', 'training measurements'), stat, hold: 1.6 })
    F.push({ ...base, line: 1, showTest: true, cap: cap('doğrulama ölçümleri (modelden saklı)', 'validation measurements (hidden from the model)'), stat, hold: 1.6 })
    const train: number[] = [], test: number[] = []
    for (let deg = 1; deg <= maxDeg; deg++) {
      const c = polyfit(D.d, D.v, deg)
      train.push(mse(c, D.d, D.v)); test.push(mse(c, D.dt, D.vt))
      const st = { ...base, coef: c, deg, train: [...train], test: [...test] }
      const caption = cap(`derece ${deg}`, `degree ${deg}`)
      F.push({ ...st, line: 4, cap: caption, stat: cap(`eğitim hatası ${fmt(train.at(-1)! * 1000, 2, 'tr')} · 10⁻³ V²`, `training error ${(train.at(-1)! * 1000).toFixed(2)} · 10⁻³ V²`), hold: deg <= 3 ? 1.2 : 0.8 })
      F.push({ ...st, line: 6, showTest: true, cap: caption, stat: cap(`doğrulama hatası ${fmt(test.at(-1)! * 1000, 2, 'tr')} · 10⁻³ V²`, `validation error ${(test.at(-1)! * 1000).toFixed(2)} · 10⁻³ V²`), hold: deg <= 3 ? 1.2 : 0.8 })
    }
    const best = test.indexOf(Math.min(...test)) + 1
    F.push({
      ...base, coef: polyfit(D.d, D.v, best), deg: best, train, test, best, showTest: true, line: 7,
      cap: cap(`seçilen: derece ${best}`, `chosen: degree ${best}`),
      stat: cap(`doğrulama hatası en küçük · eğitime göre seçseydik: ${train.length}`, `smallest validation error · picking by training error: ${train.length}`), hold: 3,
    })
    // erken durdurma: derece 12, Adam ile adım adım
    const G = adamFit(D)
    const gtr: number[] = [], gte: number[] = []
    const e3 = (x: number, lang: 'tr' | 'en') => fmt(x * 1000, 2, lang)
    G.snaps.forEach((s, i) => {
      gtr.push(s.train); gte.push(s.test)
      const line = i === 0 ? 10 : i % 2 ? 13 : 15
      F.push({
        ...base, coef: s.coef, deg: 12, train, test, showTest: true, gd: { steps: GD_STEPS, train: [...gtr], test: [...gte] }, line,
        cap: cap(`derece 12 · geçiş ${s.step.toLocaleString('tr-TR')}`, `degree 12 · pass ${s.step.toLocaleString('en-US')}`),
        stat: cap(`eğitim ${e3(s.train, 'tr')} · doğrulama ${e3(s.test, 'tr')} · 10⁻³ V²`, `training ${e3(s.train, 'en')} · validation ${e3(s.test, 'en')} · 10⁻³ V²`), hold: i < 4 ? 0.8 : 0.45,
      })
    })
    const bi = GD_STEPS.reduce((b, st, i) => (Math.abs(st - G.best.step) < Math.abs(GD_STEPS[b] - G.best.step) ? i : b), 0)
    F.push({
      ...base, coef: G.best.coef, deg: 12, train, test, showTest: true, gd: { steps: GD_STEPS, train: gtr, test: gte, best: bi }, line: 16,
      cap: cap(`erken durdurma: geçiş ${G.best.step.toLocaleString('tr-TR')}`, `early stopping: pass ${G.best.step.toLocaleString('en-US')}`),
      stat: cap(`doğrulama ${e3(G.best.test, 'tr')} · 20.000. geçişte ${e3(gte.at(-1)!, 'tr')} · 10⁻³ V²`, `validation ${e3(G.best.test, 'en')} · at pass 20,000 ${e3(gte.at(-1)!, 'en')} · 10⁻³ V²`), hold: 3,
    })
    return F
  },
}
// Veri CSV'den açılınca 1. satırdan sonra 1 satır eklendi: vurgulanan satırlar kayar.
OVERFIT.run = shifted(OVERFIT.run, 1, 1)
