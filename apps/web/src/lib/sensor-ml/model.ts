// Model eğitimi ve değerlendirme: en küçük kareler / ridge (normal denklemler, Gauss eleme), karar kütüğü (tek bölmeli
// karar ağacı; Gini ölçüsü ML dersinin karar ağacıyla aynı: lib/ml/tree.ts), MAE/RMSE/R², doğruluk/kesinlik/duyarlılık,
// rastgele ve zamana göre bölme, kayan pencereli (walk-forward) doğrulama ve "persistence" tabanı.
import { rng } from '@/lib/ml/core'
import { gini } from '@/lib/ml/tree'

/** A x = b çözümü (kısmi pivotlu Gauss eleme). */
export function solve(A: number[][], b: number[]): number[] {
  const n = b.length, M = A.map((r, i) => [...r, b[i]])
  for (let c = 0; c < n; c++) {
    let p = c
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]]
    const d = M[c][c] || 1e-12
    for (let r = 0; r < n; r++) {
      if (r === c) continue
      const f = M[r][c] / d
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]
    }
  }
  return M.map((r, i) => r[n] / (r[i] || 1e-12))
}

export interface Linear { /** w[0] sabit terim, w[1..] özellik ağırlıkları (ham ölçekte). */ w: number[]; mu: number[]; sd: number[] }
/**
 * Ridge regresyon: özellikler standartlaştırılır (ortalama 0, σ 1), (XᵀX + λI) w = Xᵀy çözülür; sabit terim cezalanmaz.
 * Sonuç ağırlıklar ham ölçeğe geri çevrilir: mikrodenetleyici ölçekleme yapmadan y = w0 + Σ wi·xi hesaplar.
 */
export function fitLinear(X: readonly number[][], y: readonly number[], lambda = 0): Linear {
  const n = X.length, d = X[0]?.length ?? 0
  const mu = Array.from({ length: d }, (_, j) => X.reduce((s, r) => s + r[j], 0) / n)
  const sd = Array.from({ length: d }, (_, j) => Math.sqrt(X.reduce((s, r) => s + (r[j] - mu[j]) ** 2, 0) / n) || 1)
  const Z = X.map((r) => [1, ...r.map((v, j) => (v - mu[j]) / sd[j])])
  const A = Array.from({ length: d + 1 }, (_, i) => Array.from({ length: d + 1 }, (_, j) => Z.reduce((s, r) => s + r[i] * r[j], 0) + (i === j && i > 0 ? lambda : 0)))
  const b = Array.from({ length: d + 1 }, (_, i) => Z.reduce((s, r, k) => s + r[i] * y[k], 0))
  const ws = solve(A, b)
  const w = [ws[0] - ws.slice(1).reduce((s, v, j) => s + (v * mu[j]) / sd[j], 0), ...ws.slice(1).map((v, j) => v / sd[j])]
  return { w, mu, sd }
}
export const predictLinear = (m: Pick<Linear, 'w'>, x: readonly number[]): number => x.reduce((s, v, j) => s + v * m.w[j + 1], m.w[0])

export interface Stump { f: number; t: number; left: number; right: number; gini: number }
/** Karar kütüğü: tüm özellik/eşik çiftleri içinde ağırlıklı Gini'yi en çok düşüren tek bölme. x[f] ≤ t → left sınıfı. */
export function fitStump(X: readonly number[][], c: readonly number[]): Stump {
  const maj = (a: number[]) => (a.filter((v) => v === 1).length * 2 >= a.length && a.length ? 1 : 0)
  let best: Stump = { f: 0, t: 0, left: maj([...c]), right: maj([...c]), gini: gini([...c]) }
  const d = X[0]?.length ?? 0
  for (let f = 0; f < d; f++) {
    const vals = [...new Set(X.map((r) => r[f]))].sort((a, b) => a - b)
    const step = Math.max(1, Math.floor(vals.length / 64)) // en çok ~64 aday eşik: hızlı ve yeterli
    for (let k = 0; k < vals.length - 1; k += step) {
      const t = (vals[k] + vals[k + 1]) / 2
      const L: number[] = [], R: number[] = []
      X.forEach((r, i) => (r[f] <= t ? L : R).push(c[i]))
      const g = (L.length * gini(L) + R.length * gini(R)) / c.length
      if (g < best.gini - 1e-12) best = { f, t, left: maj(L), right: maj(R), gini: g }
    }
  }
  return best
}
export const predictStump = (s: Stump, x: readonly number[]): number => (x[s.f] <= s.t ? s.left : s.right)

export const mae = (y: readonly number[], p: readonly number[]) => y.reduce((s, v, i) => s + Math.abs(v - p[i]), 0) / (y.length || 1)
export const rmse = (y: readonly number[], p: readonly number[]) => Math.sqrt(y.reduce((s, v, i) => s + (v - p[i]) ** 2, 0) / (y.length || 1))
export function r2(y: readonly number[], p: readonly number[]): number {
  const m = y.reduce((s, v) => s + v, 0) / (y.length || 1)
  const ss = y.reduce((s, v) => s + (v - m) ** 2, 0)
  return ss > 0 ? 1 - y.reduce((s, v, i) => s + (v - p[i]) ** 2, 0) / ss : 0
}
export interface ClsScore { acc: number; precision: number; recall: number; tp: number; fp: number; fn: number; tn: number }
export function clsScore(y: readonly number[], p: readonly number[]): ClsScore {
  let tp = 0, fp = 0, fn = 0, tn = 0
  y.forEach((v, i) => { if (p[i] === 1) (v === 1 ? tp++ : fp++); else (v === 1 ? fn++ : tn++) })
  return { acc: (tp + tn) / (y.length || 1), precision: tp + fp ? tp / (tp + fp) : 0, recall: tp + fn ? tp / (tp + fn) : 0, tp, fp, fn, tn }
}

export interface Split { train: number[]; test: number[] }
/** Rastgele bölme: zaman serisinde YANILTICIDIR, test noktasının komşuları eğitimde olduğu için hata iyimser çıkar. */
export function randomSplit(n: number, testFrac: number, seed = 7): Split {
  const r = rng(seed), idx = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1));[idx[i], idx[j]] = [idx[j], idx[i]] }
  const k = Math.round(n * testFrac)
  return { test: idx.slice(0, k).sort((a, b) => a - b), train: idx.slice(k).sort((a, b) => a - b) }
}
/** Zamana göre bölme: ilk (1 − testFrac) eğitim, son kısım test. Araya `gap` satır boşluk konur (hedef ufku kadar). */
export function timeSplit(n: number, testFrac: number, gap = 0): Split {
  const cut = Math.round(n * (1 - testFrac))
  return { train: Array.from({ length: Math.max(0, cut - gap) }, (_, i) => i), test: Array.from({ length: n - cut }, (_, i) => cut + i) }
}
/** Kayan pencereli doğrulama: her katta eğitim geçmişin tamamı, test hemen sonraki blok. */
export function walkForward(n: number, folds: number, minTrain: number, gap = 0): Split[] {
  const block = Math.floor((n - minTrain) / folds)
  return Array.from({ length: folds }, (_, f) => {
    const start = minTrain + f * block
    return { train: Array.from({ length: Math.max(0, start - gap) }, (_, i) => i), test: Array.from({ length: f === folds - 1 ? n - start : block }, (_, i) => start + i) }
  })
}
export const pick = <T>(a: readonly T[], idx: readonly number[]): T[] => idx.map((i) => a[i])
