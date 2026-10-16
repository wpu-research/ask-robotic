// Ders 2: aşırı öğrenme ve doğrulama. Sharp IR mesafe sensörü: gerilim uzaklıkla ters orantılı (V ≈ 26/d). 15 eğitim ve 30
// doğrulama ölçümüne 1'den 12'ye kadar dereceli polinom uydurulur; eğitim hatası hep düşer, doğrulama hatası önce düşer sonra yükselir.
import { cap, fmt, gauss, mean, rng, type Frame, type Lesson } from './core'

export interface OverfitFrame extends Frame {
  d: number[]; v: number[]; dt: number[]; vt: number[]
  /** Şu anki polinom katsayıları (ölçekli x üzerinde) ve derece. */
  coef: number[] | null
  deg: number
  train: number[]
  test: number[]
  best?: number
  showTest?: boolean
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
  ],
  why: {
    tr: "Her makine öğrenmesi modeli bu dengeyle yaşar: az karmaşık olan eksik öğrenir, çok karmaşık olan ezberler. Eğitim ve doğrulama verisini ayırmak, çapraz doğrulama ve erken durdurma bu yüzden vardır. Robotta ezberlenmiş bir kalibrasyon, laboratuvarda mükemmel, sahada tehlikelidir.",
    en: 'Every machine learning model lives with this trade-off: too simple and it underfits, too complex and it memorises. That is why we split training and validation data, cross-validate and stop early. On a robot, a memorised calibration is perfect in the lab and dangerous in the field.',
  },
  file: 'asiri_ogrenme.py',
  code: [
    ['import numpy as np'],
    ['from sharp import d, v, d_val, v_val', '15 eğitim, 30 doğrulama ölçümü', '15 training, 30 validation measurements'],
    ['x, x_val = (d - 45) / 35, (d_val - 45) / 35', '[-1, 1] aralığına ölçekle', 'scale to [-1, 1]'],
    ['for deg in range(1, 13):'],
    ['    c = np.polyfit(x, v, deg)', 'en küçük kareler', 'least squares'],
    ['    train = ((np.polyval(c, x) - v) ** 2).mean()', 'eğitim hatası', 'training error'],
    ['    val = ((np.polyval(c, x_val) - v_val) ** 2).mean()', 'doğrulama hatası', 'validation error'],
    ['    print(deg, train, val)'],
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
    return F
  },
}
