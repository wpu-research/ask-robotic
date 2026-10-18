// Eğitim paneli için saf ölçüm fonksiyonları (DOM yok). Derslerin ve projelerin gerçek eğitim kodundan gelen tahmin, skor ve
// kayıp dizilerini doğruluk, kesinlik/duyarlılık, ROC/AUC, R², siluet, şaşkınlık (perplexity) gibi sayılara çevirir.
// Hepsi deterministik; NaN/Infinity gelen değerler olduğu gibi geçer (ıraksayan eğitim panelde de ıraksamış görünür).

/** Doğru tahmin oranı. */
export function accuracy(y: readonly number[], pred: readonly number[]): number {
  if (!y.length) return 0
  let ok = 0
  for (let i = 0; i < y.length; i++) if (y[i] === pred[i]) ok++
  return ok / y.length
}

/** Karışıklık matrisi: satır gerçek sınıf, sütun tahmin. Sınıflar 0…k−1. */
export function confusionMatrix(y: readonly number[], pred: readonly number[], k?: number): number[][] {
  const K = k ?? Math.max(1, ...y.map((v) => v + 1), ...pred.map((v) => v + 1))
  const m = Array.from({ length: K }, () => new Array<number>(K).fill(0))
  for (let i = 0; i < y.length; i++) if (y[i] >= 0 && y[i] < K && pred[i] >= 0 && pred[i] < K) m[y[i]][pred[i]]++
  return m
}

export interface ClassScore { precision: number; recall: number; f1: number; support: number }

/** Sınıf başına kesinlik, duyarlılık, F1 ve destek (gerçek örnek sayısı). Payda 0 ise ölçü 0 sayılır. */
export function perClass(m: readonly (readonly number[])[]): ClassScore[] {
  const K = m.length
  return Array.from({ length: K }, (_, c) => {
    const tp = m[c][c]
    let col = 0, row = 0
    for (let j = 0; j < K; j++) { col += m[j][c]; row += m[c][j] }
    const precision = col ? tp / col : 0, recall = row ? tp / row : 0
    const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0
    return { precision, recall, f1, support: row }
  })
}

/** Sınıfların düz ortalaması (macro). */
export function macro(s: readonly ClassScore[]): { precision: number; recall: number; f1: number } {
  const n = s.length || 1
  return {
    precision: s.reduce((a, c) => a + c.precision, 0) / n,
    recall: s.reduce((a, c) => a + c.recall, 0) / n,
    f1: s.reduce((a, c) => a + c.f1, 0) / n,
  }
}

/** İkili sınıflandırma, eşik t: skor ≥ t ise 1. */
export function binaryAt(y: readonly number[], s: readonly number[], t: number) {
  let tp = 0, fp = 0, tn = 0, fn = 0
  for (let i = 0; i < y.length; i++) {
    const p = s[i] >= t
    if (y[i] === 1) { if (p) tp++; else fn++ } else if (p) fp++; else tn++
  }
  const precision = tp + fp ? tp / (tp + fp) : 0
  const recall = tp + fn ? tp / (tp + fn) : 0
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0
  const acc = y.length ? (tp + tn) / y.length : 0
  const fpr = fp + tn ? fp / (fp + tn) : 0
  return { tp, fp, tn, fn, precision, recall, f1, acc, fpr }
}

/**
 * ROC eğrisi: eşik büyükten küçüğe inerken (FPR, TPR) noktaları. Aynı skorlu örnekler tek adımda geçilir. (0,0) ile başlar,
 * (1,1) ile biter. `thr[i]`, i. noktanın eşiğidir (ilk nokta +∞).
 */
export function rocCurve(y: readonly number[], s: readonly number[]): { fpr: number[]; tpr: number[]; thr: number[] } {
  const idx = s.map((_, i) => i).sort((a, b) => s[b] - s[a])
  const P = y.filter((v) => v === 1).length, N = y.length - P
  const fpr = [0], tpr = [0], thr = [Infinity]
  let tp = 0, fp = 0
  for (let k = 0; k < idx.length; k++) {
    const i = idx[k]
    if (y[i] === 1) tp++; else fp++
    if (k === idx.length - 1 || s[idx[k + 1]] !== s[i]) {
      fpr.push(N ? fp / N : 0); tpr.push(P ? tp / P : 0); thr.push(s[i])
    }
  }
  return { fpr, tpr, thr }
}

/** Yamuk kuralıyla eğri altı alan (x artan sırada olmalı). */
export function trapz(x: readonly number[], y: readonly number[]): number {
  let a = 0
  for (let i = 1; i < x.length; i++) a += ((x[i] - x[i - 1]) * (y[i] + y[i - 1])) / 2
  return a
}

/** ROC eğrisi altı alan. */
export const auc = (y: readonly number[], s: readonly number[]): number => { const r = rocCurve(y, s); return trapz(r.fpr, r.tpr) }

/** Kesinlik–duyarlılık eğrisi (eşik büyükten küçüğe) ve ortalama kesinlik (AP = Σ ΔR · P). */
export function prCurve(y: readonly number[], s: readonly number[]): { recall: number[]; precision: number[]; ap: number } {
  const idx = s.map((_, i) => i).sort((a, b) => s[b] - s[a])
  const P = y.filter((v) => v === 1).length
  const recall: number[] = [0], precision: number[] = [1]
  let tp = 0, fp = 0, ap = 0, lastR = 0
  for (let k = 0; k < idx.length; k++) {
    const i = idx[k]
    if (y[i] === 1) tp++; else fp++
    if (k === idx.length - 1 || s[idx[k + 1]] !== s[i]) {
      const r = P ? tp / P : 0, p = tp / (tp + fp)
      ap += (r - lastR) * p
      lastR = r
      recall.push(r); precision.push(p)
    }
  }
  return { recall, precision, ap }
}

/** Ortalama kare hata. */
export function mse(y: readonly number[], p: readonly number[]): number {
  if (!y.length) return 0
  let s = 0
  for (let i = 0; i < y.length; i++) s += (p[i] - y[i]) ** 2
  return s / y.length
}
/** Ortalama mutlak hata. */
export function mae(y: readonly number[], p: readonly number[]): number {
  if (!y.length) return 0
  let s = 0
  for (let i = 0; i < y.length; i++) s += Math.abs(p[i] - y[i])
  return s / y.length
}
/** Belirlilik katsayısı R² = 1 − SS_hata / SS_toplam. Sabit y için 0. */
export function r2(y: readonly number[], p: readonly number[]): number {
  if (!y.length) return 0
  const m = y.reduce((a, v) => a + v, 0) / y.length
  let res = 0, tot = 0
  for (let i = 0; i < y.length; i++) { res += (y[i] - p[i]) ** 2; tot += (y[i] - m) ** 2 }
  return tot ? 1 - res / tot : 0
}

/** Kümelerin içindeki kare uzaklık toplamı (k-means'in "inertia"sı). */
export function inertia(X: readonly (readonly number[])[], g: readonly number[], C: readonly (readonly number[])[]): number {
  let s = 0
  for (let i = 0; i < X.length; i++) { const c = C[g[i]]; if (!c) continue; for (let d = 0; d < c.length; d++) s += (X[i][d] - c[d]) ** 2 }
  return s
}

/**
 * Ortalama siluet skoru (−1…1). Her nokta için a = kendi kümesine ortalama uzaklık, b = en yakın diğer kümeye ortalama uzaklık,
 * s = (b − a) / max(a, b). Tek elemanlı kümedeki nokta 0 sayılır; gürültü etiketi (< 0) hesaba katılmaz. En az 2 küme gerekir.
 */
export function silhouette(X: readonly (readonly number[])[], g: readonly number[]): number {
  const labels = [...new Set(g.filter((v) => v >= 0))]
  if (labels.length < 2) return 0
  const dist = (a: readonly number[], b: readonly number[]) => { let s = 0; for (let d = 0; d < a.length; d++) s += (a[d] - b[d]) ** 2; return Math.sqrt(s) }
  let tot = 0, n = 0
  for (let i = 0; i < X.length; i++) {
    if (g[i] < 0) continue
    const sum = new Map<number, number>(), cnt = new Map<number, number>()
    for (let j = 0; j < X.length; j++) {
      if (j === i || g[j] < 0) continue
      sum.set(g[j], (sum.get(g[j]) ?? 0) + dist(X[i], X[j])); cnt.set(g[j], (cnt.get(g[j]) ?? 0) + 1)
    }
    const own = cnt.get(g[i]) ?? 0
    n++
    if (!own) continue
    const a = sum.get(g[i])! / own
    let b = Infinity
    for (const [l, c] of cnt) if (l !== g[i]) b = Math.min(b, sum.get(l)! / c)
    if (!Number.isFinite(b)) continue
    tot += (b - a) / Math.max(a, b)
  }
  return n ? tot / n : 0
}

/** Şaşkınlık (perplexity): doğru belirtecin olasılıklarından exp(ortalama −log p). */
export function perplexity(probs: readonly number[]): number {
  if (!probs.length) return 1
  let s = 0
  for (const p of probs) s += -Math.log(Math.max(p, 1e-12))
  return Math.exp(s / probs.length)
}

/** Histogram: [lo, hi] aralığını `bins` eşit kutuya böler; aralık dışı değerler uç kutulara sayılır. */
export function histogram(values: ArrayLike<number>, bins: number, lo?: number, hi?: number): { edges: number[]; counts: number[] } {
  let a = lo ?? Infinity, b = hi ?? -Infinity
  if (lo === undefined || hi === undefined) for (let i = 0; i < values.length; i++) { const v = values[i]; if (!Number.isFinite(v)) continue; if (lo === undefined) a = Math.min(a, v); if (hi === undefined) b = Math.max(b, v) }
  if (!Number.isFinite(a) || !Number.isFinite(b)) { a = 0; b = 1 }
  if (a === b) { a -= 0.5; b += 0.5 }
  const w = (b - a) / bins
  const counts = new Array<number>(bins).fill(0)
  for (let i = 0; i < values.length; i++) {
    const v = values[i]
    if (!Number.isFinite(v)) continue
    counts[Math.min(bins - 1, Math.max(0, Math.floor((v - a) / w)))]++
  }
  return { edges: Array.from({ length: bins + 1 }, (_, i) => a + i * w), counts }
}

/** Kayan ortalama: her nokta kendisi dahil son `k` değerin ortalaması (başta daha az değer). */
export function movingAverage(a: readonly number[], k: number): number[] {
  const out: number[] = []
  let s = 0
  for (let i = 0; i < a.length; i++) {
    s += a[i]
    if (i >= k) s -= a[i - k]
    out.push(s / Math.min(i + 1, k))
  }
  return out
}

/** Vektörün L2 normu. */
export function l2(a: ArrayLike<number>): number {
  let s = 0
  for (let i = 0; i < a.length; i++) s += a[i] * a[i]
  return Math.sqrt(s)
}

/** Ölü nöron payı: bir veri kümesinin hiçbir örneğinde etkinleşmeyen (|a| ≤ eps) nöronların oranı. acts[örnek][nöron]. */
export function deadShare(acts: readonly ArrayLike<number>[], eps = 1e-9): number {
  if (!acts.length) return 0
  const H = acts[0].length
  let dead = 0
  for (let j = 0; j < H; j++) { let alive = false; for (const a of acts) if (Math.abs(a[j]) > eps) { alive = true; break } if (!alive) dead++ }
  return H ? dead / H : 0
}

/** Doymuş tanh payı: |a| > 0,99 olan etkinleşmelerin oranı (gradyan bu nöronlardan neredeyse geçmez). */
export function saturatedShare(acts: readonly ArrayLike<number>[], lim = 0.99): number {
  let n = 0, s = 0
  for (const a of acts) for (let j = 0; j < a.length; j++) { n++; if (Math.abs(a[j]) > lim) s++ }
  return n ? s / n : 0
}

/** Açıklanan varyans oranları (özdeğerlerden). */
export const explainedRatio = (eig: readonly number[]): number[] => { const t = eig.reduce((a, v) => a + Math.max(0, v), 0); return eig.map((v) => (t ? Math.max(0, v) / t : 0)) }

/** Erken durdurma noktası: doğrulama kaybının en küçük olduğu indeks (ilk en küçük). */
export function bestIndex(a: readonly number[], mode: 'min' | 'max' = 'min'): number {
  let bi = 0
  for (let i = 1; i < a.length; i++) if (mode === 'min' ? a[i] < a[bi] : a[i] > a[bi]) bi = i
  return bi
}

/** Tekrarlanabilir eğitim/doğrulama ayrımı için karışık indeksler (Fisher-Yates, verilen üreteçle). */
export function shuffledIdx(n: number, r: () => number): number[] {
  const a = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}
