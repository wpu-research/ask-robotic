// Ders 7: temel bileşen analizi (PCA). Rampa çıkan robotun IMU'su 200 kez ileri (ax) ve yan (ay) ivmeyi ölçer; iki sayı neredeyse
// aynı şeyi söyler. Kovaryans matrisinin en büyük özvektörü, verinin en çok değiştiği yönü verir; veri tek sayıya iner.
import { cap, fmt, gauss, mean, rng, type Frame, type Lesson } from './core'
import { explainedRatio } from './egitim/metrics'
import { B, type EgitimRaporu } from './egitim/rapor'

export interface PcaFrame extends Frame {
  A: Array<[number, number]>
  mu: [number, number]
  /** Ortalanmış mı. */
  centered: number
  /** Denenen ya da bulunan yön (radyan) ve o yöndeki varyans. */
  angle?: number
  varAt?: number
  /** Açı taraması: [açı, varyans]. */
  sweep: Array<[number, number]>
  /** İzdüşüm oranı 0 (yok) – 1 (noktalar çizgide). */
  project: number
  found?: boolean
  ratio?: number
}

export function imuData(seed = 31): Array<[number, number]> {
  const r = rng(seed)
  return Array.from({ length: 200 }, () => {
    const t = 1.1 * gauss(r), n = 0.22 * gauss(r)
    return [0.9 + t * 0.87 - n * 0.5, 0.4 + t * 0.5 + n * 0.87] as [number, number]
  })
}

/** 2×2 simetrik matrisin büyük özdeğeri ve özvektörünün açısı. */
export function pca2(Z: Array<[number, number]>) {
  const n = Z.length
  const sxx = Z.reduce((s, [x]) => s + x * x, 0) / n, syy = Z.reduce((s, [, y]) => s + y * y, 0) / n, sxy = Z.reduce((s, [x, y]) => s + x * y, 0) / n
  const tr = sxx + syy, det = sxx * syy - sxy * sxy
  const l1 = tr / 2 + Math.sqrt((tr * tr) / 4 - det), l2 = tr / 2 - Math.sqrt((tr * tr) / 4 - det)
  const angle = Math.atan2(l1 - sxx, sxy)
  return { S: [[sxx, sxy], [sxy, syy]], l1, l2, angle }
}
export const varAlong = (Z: Array<[number, number]>, a: number) => mean(Z.map(([x, y]) => (x * Math.cos(a) + y * Math.sin(a)) ** 2))

/**
 * Eğitim paneli (öğrenme yok, tek adımlık çözüm): 0°–180° arası her 5°'de o eksendeki varyans ve tek sayıya inince kalan
 * yeniden kurma hatası (toplam varyans − eksendeki varyans), özdeğerler ve açıklanan varyans, izdüşüm artıkları.
 */
export function pcaReport(): EgitimRaporu {
  const A = imuData()
  const mu = [mean(A.map((a) => a[0])), mean(A.map((a) => a[1]))]
  const Z = A.map(([x, y]) => [x - mu[0], y - mu[1]] as [number, number])
  const { l1, l2, angle } = pca2(Z)
  const tot = mean(Z.map(([x, y]) => x * x + y * y))
  const h = { angle: [] as number[], variance: [] as number[], recon_error: [] as number[] }
  for (let d = 0; d <= 180; d += 5) { const v = varAlong(Z, (d * Math.PI) / 180); h.angle.push(d); h.variance.push(v); h.recon_error.push(tot - v) }
  const ratio = explainedRatio([l1, l2])
  const deg = ((angle * 180) / Math.PI + 180) % 180
  const c = Math.cos(angle), sn = Math.sin(angle)
  return {
    kind: 'kumeleme', model: 'PCA (2 → 1, kovaryans özvektörü)', seed: 31, hyper: { readings: A.length, components: 1 },
    history: { x: 'angle', cols: h },
    final: [
      { key: 'lambda1', label: B('λ₁ (en büyük özdeğer)', 'λ₁ (largest eigenvalue)'), value: l1, fmt: 3 },
      { key: 'lambda2', label: B('λ₂', 'λ₂'), value: l2, fmt: 4 },
      { key: 'kept', label: B('korunan varyans', 'kept variance'), value: ratio[0], fmt: 'pct' },
      { key: 'recon_mse', label: B('yeniden kurma hatası (MSE)', 'reconstruction error (MSE)'), value: l2, fmt: 4 },
      { key: 'angle', label: B('ana eksen açısı (°)', 'main axis angle (°)'), value: deg, fmt: 1 },
    ],
    charts: [
      { kind: 'line', id: 'sweep', title: B('Eksen açısına göre varyans ve hata', 'Variance and error by axis angle'), x: h.angle, xLabel: B('eksen açısı (°)', 'axis angle (°)'), yLabel: B('(m/s²)²', '(m/s²)²'), yMin: 0,
        series: [{ key: 'variance', label: B('eksendeki varyans', 'variance on axis'), values: h.variance, tone: 1 }, { key: 'recon_error', label: B('yeniden kurma hatası', 'reconstruction error'), values: h.recon_error, tone: 0, dash: true }],
        marker: { x: Math.round(deg), label: B(`ana eksen ${deg.toFixed(0)}°`, `main axis ${deg.toFixed(0)}°`) } },
      { kind: 'bar', id: 'scree', title: B('Açıklanan varyans (scree)', 'Explained variance (scree)'), labels: ['PC1', 'PC2'], series: [{ key: 'ratio', label: B('pay', 'share'), values: ratio, tone: 3 }], yMin: 0, yMax: 1 },
      { kind: 'scatter', id: 'residuals', title: B('İzdüşüm ve dik artık', 'Projection and perpendicular residual'), xLabel: B('PC1 değeri', 'PC1 value'), yLabel: B('artık', 'residual'), points: Z.map(([x, y]) => [x * c + y * sn, -x * sn + y * c]), zero: true },
    ],
  }
}

export const PCA: Lesson<PcaFrame> = {
  slug: 'pca',
  n: 7,
  title: { tr: 'Temel bileşen analizi (PCA)', en: 'Principal component analysis (PCA)' },
  sub: { tr: 'İki IMU ölçümünü, bilgiyi kaybetmeden tek sayıya indirmek', en: 'Reducing two IMU readings to one number without losing information' },
  story: {
    tr: 'Rampa çıkan robotun IMU’su 200 kez ileri ve yan ivmeyi ölçtü. Robot rampaya çapraz durduğu için iki sayı birlikte artıp azalıyor: aslında tek bir şeyi, rampanın eğimini anlatıyorlar.',
    en: 'The IMU of a robot climbing a ramp measured forward and sideways acceleration 200 times. The robot sits at an angle on the ramp, so the two numbers rise and fall together: they really describe one thing, the slope of the ramp.',
  },
  how: [
    { tr: 'Önce veri ortalanır: her ölçümden ortalama çıkarılır.', en: 'First the data is centred: the mean is subtracted from every reading.' },
    { tr: 'Kovaryans matrisi, iki sayının birlikte nasıl değiştiğini özetler.', en: 'The covariance matrix summarises how the two numbers vary together.' },
    { tr: 'En büyük özdeğerin özvektörü, veriyi o yöne izdüşürünce varyansın en büyük olduğu yöndür. Sahnede eksen döndükçe varyansın nasıl değiştiğini görürsün.', en: 'The eigenvector of the largest eigenvalue is the direction where the projected variance is largest. In the scene you see the variance change as the axis turns.' },
    { tr: 'Noktalar bu çizgiye izdüşürülür: iki sayı yerine bir sayı. Korunan varyans oranı ne kadar bilgi kaldığını söyler.', en: 'The points are projected onto this line: one number instead of two. The kept variance ratio says how much information remains.' },
  ],
  why: {
    tr: 'Çok boyutlu sensör verisini sıkıştırmak, gürültüyü azaltmak ve görselleştirmek için ilk araçtır. Görüntü işlemede yüz tanımadan (özyüzler) nokta bulutlarında yüzey yönünü bulmaya kadar, robotikte her yerde karşına çıkar.',
    en: 'It is the first tool for compressing multi-dimensional sensor data, reducing noise and visualising it. From face recognition (eigenfaces) to finding surface orientation in point clouds, it shows up everywhere in robotics.',
  },
  file: 'pca.py',
  code: [
    ['import numpy as np'],
    ['A = np.genfromtxt(\'imu.csv\', delimiter=\',\', skip_header=1)', '200 ölçüm: [ax, ay], m/s²', '200 readings: [ax, ay], m/s²'],
    ['Z = A - A.mean(0)', 'ortala', 'centre'],
    ['S = Z.T @ Z / len(Z)', 'kovaryans matrisi', 'covariance matrix'],
    ['vals, vecs = np.linalg.eigh(S)', 'özdeğerler, özvektörler', 'eigenvalues, eigenvectors'],
    ['pc = vecs[:, vals.argmax()]', 'en çok değişen yön', 'direction of most variance'],
    ['z = Z @ pc', 'her ölçüm artık tek sayı', 'every reading is now one number'],
    ['print(vals.max() / vals.sum())', 'korunan varyans oranı', 'kept variance ratio'],
    ['tot = (Z ** 2).sum(1).mean()', 'toplam varyans', 'total variance'],
    ["history = {'angle': [], 'variance': [], 'recon_error': []}", 'açı taraması', 'angle sweep'],
    ['for deg in range(0, 181, 5):'],
    ['    u = np.array([np.cos(np.radians(deg)), np.sin(np.radians(deg))])'],
    ['    v = ((Z @ u) ** 2).mean()', 'bu eksendeki varyans', 'variance on this axis'],
    ['    for k, x in zip(history, (deg, v, tot - v)): history[k].append(float(x))'],
    ["for k, v in [('lambda1', vals.max()), ('lambda2', vals.min()),", 'son ölçümler', 'final metrics'],
    ["             ('kept', vals.max() / vals.sum()), ('recon_mse', vals.min())]:"],
    ["    print(f'{k:<10}{v:>8.4f}')"],
    ['import csv'],
    ["with open('egitim_gecmisi.csv', 'w', newline='') as f:", 'satır başına bir açı', 'one row per angle'],
    ['    csv.writer(f).writerows([list(history), *zip(*history.values())])'],
    ['try:'],
    ['    import matplotlib.pyplot as plt', 'varsa grafik çiz', 'plot if available'],
    ["    for k in ('variance', 'recon_error'): plt.plot(history['angle'], history[k], label=k)"],
    ["    plt.xlabel('angle (deg)'); plt.legend(); plt.show()"],
    ['except ImportError:'],
    ["    print('matplotlib yok: grafik atlandı')"],
  ],
  params: [],
  report: pcaReport,
  run() {
    const A = imuData()
    const mu: [number, number] = [mean(A.map((a) => a[0])), mean(A.map((a) => a[1]))]
    const Z = A.map(([x, y]) => [x - mu[0], y - mu[1]] as [number, number])
    const { S, l1, l2, angle } = pca2(Z)
    const F: PcaFrame[] = []
    const base = { A, mu, sweep: [] as Array<[number, number]>, project: 0, centered: 0 }
    const stat = cap('200 ölçüm', '200 readings')
    F.push({ ...base, line: 1, cap: cap('ileri ve yan ivme', 'forward and sideways acceleration'), stat, hold: 1.8 })
    for (const c of [0.5, 1]) F.push({ ...base, centered: c, line: 2, cap: cap(`ortala: μ = (${fmt(mu[0], 2, 'tr')}; ${fmt(mu[1], 2, 'tr')})`, `centre: μ = (${mu[0].toFixed(2)}, ${mu[1].toFixed(2)})`), stat, hold: 0.9 })
    F.push({ ...base, centered: 1, line: 3, cap: cap(`S = [[${fmt(S[0][0], 2, 'tr')}; ${fmt(S[0][1], 2, 'tr')}], [${fmt(S[1][0], 2, 'tr')}; ${fmt(S[1][1], 2, 'tr')}]]`, `S = [[${S[0][0].toFixed(2)}, ${S[0][1].toFixed(2)}], [${S[1][0].toFixed(2)}, ${S[1][1].toFixed(2)}]]`), stat, hold: 1.8 })
    const sweep: Array<[number, number]> = []
    for (let k = 0; k <= 36; k++) {
      const a = (k / 36) * Math.PI
      const v = varAlong(Z, a)
      sweep.push([a, v])
      F.push({ ...base, centered: 1, sweep: [...sweep], angle: a, varAt: v, line: 4, cap: cap(`eksen ${Math.round((a * 180) / Math.PI)}° · varyans ${fmt(v, 2, 'tr')}`, `axis ${Math.round((a * 180) / Math.PI)}° · variance ${v.toFixed(2)}`), stat: cap('eigh bu taramayı tek adımda yapar', 'eigh does this sweep in one step'), hold: 0.25 })
    }
    const deg = ((angle * 180) / Math.PI + 180) % 180
    F.push({ ...base, centered: 1, sweep, angle, varAt: l1, found: true, line: 5, cap: cap(`en çok değişen yön: ${deg.toFixed(0)}°`, `direction of most variance: ${deg.toFixed(0)}°`), stat: cap(`λ₁ = ${fmt(l1, 2, 'tr')} · λ₂ = ${fmt(l2, 3, 'tr')}`, `λ₁ = ${l1.toFixed(2)} · λ₂ = ${l2.toFixed(3)}`), hold: 2 })
    for (const pr of [0.33, 0.66, 1]) F.push({ ...base, centered: 1, sweep, angle, varAt: l1, found: true, project: pr, line: 6, cap: cap('izdüşüm: iki sayı yerine bir sayı', 'projection: one number instead of two'), stat, hold: 0.8 })
    const ratio = l1 / (l1 + l2)
    F.push({ ...base, centered: 1, sweep, angle, varAt: l1, found: true, project: 1, ratio, line: 7, cap: cap(`korunan varyans %${fmt(ratio * 100, 1, 'tr')}`, `kept variance ${(ratio * 100).toFixed(1)}%`), stat: cap('bilginin neredeyse tamamı tek sayıda', 'almost all information in one number'), hold: 3 })
    return F
  },
}
