// ÖĞRETİM GÖMMESİ: gerçek bir dil modelinin gömmesi DEĞİLDİR. Metni kelime gövdeleri ve/veya harf üçlülerine böler,
// her özelliği sabit bir karma (FNV-1a) ile 64 boyuttan birine ve bir işarete atar, toplar ve birim uzunluğa getirir
// (hashing trick). Deterministiktir, eğitim gerektirmez, tarayıcıda anında çalışır. Anlamı değil yüzey örtüşmesini
// yakalar; derste bu sınır bilerek gösterilir (eş anlamlılar yakın düşmez).
import { stem, stopWordsOf, words, type ContentLang } from '@/lib/ai/text'

export const DIM = 64
export type Features = 'kelime' | 'uclu' | 'ikisi'
export type Vec = number[]

/** FNV-1a 32 bit karma. */
export function fnv1a(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0 }
  return h >>> 0
}

/** Metnin özellikleri: durak kelimeleri atılmış kelime gövdeleri ve/veya "#kel#" biçiminde harf üçlüleri. */
export function featuresOf(text: string, mode: Features = 'ikisi', lang: ContentLang = 'tr'): string[] {
  const stop = stopWordsOf(lang)
  const ws = words(text, lang).filter((w) => !stop.has(w))
  const out: string[] = []
  if (mode !== 'uclu') for (const w of ws) out.push(`w:${stem(w)}`)
  if (mode !== 'kelime') for (const w of ws) { const p = `#${w}#`; for (let i = 0; i + 3 <= p.length; i++) out.push(`t:${p.slice(i, i + 3)}`) }
  return out
}

export function embed(text: string, mode: Features = 'ikisi', lang: ContentLang = 'tr', dim = DIM): Vec {
  const v = new Array<number>(dim).fill(0)
  for (const f of featuresOf(text, mode, lang)) {
    const h = fnv1a(f)
    // kelime özellikleri harf üçlülerinden ağır basar (bir kelime ~5 üçlü üretir)
    const w = f.startsWith('w:') ? 2 : 1
    v[h % dim] += (h & 0x80000000 ? -1 : 1) * w
  }
  return normalize(v)
}

export function normalize(v: Vec): Vec {
  const n = Math.hypot(...v)
  return n > 0 ? v.map((x) => x / n) : v.slice()
}
export const dot = (a: Vec, b: Vec): number => a.reduce((s, x, i) => s + x * (b[i] ?? 0), 0)
/** Kosinüs benzerliği; birim vektörlerde nokta çarpımına eşittir. */
export function cosine(a: Vec, b: Vec): number {
  const na = Math.hypot(...a), nb = Math.hypot(...b)
  return na > 0 && nb > 0 ? dot(a, b) / (na * nb) : 0
}

export interface Neighbour { index: number; score: number }
export function nearest(q: Vec, X: readonly Vec[], k = 3): Neighbour[] {
  return X.map((x, index) => ({ index, score: cosine(q, x) })).sort((a, b) => b.score - a.score || a.index - b.index).slice(0, k)
}

/** İlk iki temel bileşen (güç yinelemesi + söndürme). `mean` ve `axes` ile yeni noktalar da aynı düzleme izdüşürülür. */
export interface Pca2 { mean: Vec; axes: [Vec, Vec]; points: Array<[number, number]> }
export function pca2(X: readonly Vec[], iters = 80): Pca2 {
  const d = X[0]?.length ?? 0
  const mean = new Array<number>(d).fill(0)
  for (const x of X) x.forEach((v, i) => { mean[i] += v / X.length })
  const C = X.map((x) => x.map((v, i) => v - mean[i]))
  const power = (deflate?: Vec): Vec => {
    // deterministik başlangıç
    let v = normalize(Array.from({ length: d }, (_, i) => Math.sin(i + 1) + (deflate ? 0.5 : 0)))
    for (let t = 0; t < iters; t++) {
      const s = C.map((r) => dot(r, v))
      let w = new Array<number>(d).fill(0)
      C.forEach((r, k) => r.forEach((x, i) => { w[i] += x * s[k] }))
      if (deflate) { const p = dot(w, deflate); w = w.map((x, i) => x - p * deflate[i]) }
      const n = Math.hypot(...w)
      if (n < 1e-12) break
      v = w.map((x) => x / n)
    }
    // işaret kararlılığı: en büyük mutlak bileşen pozitif olsun
    let m = 0
    v.forEach((x, i) => { if (Math.abs(x) > Math.abs(v[m])) m = i })
    return v[m] < 0 ? v.map((x) => -x) : v
  }
  const a1 = power()
  const a2 = power(a1)
  const axes: [Vec, Vec] = [a1, a2]
  return { mean, axes, points: X.map((x) => project(x, { mean, axes })) }
}
export function project(x: Vec, p: { mean: Vec; axes: [Vec, Vec] }): [number, number] {
  const c = x.map((v, i) => v - p.mean[i])
  return [dot(c, p.axes[0]), dot(c, p.axes[1])]
}

/** Notları cümlelere böler (gömme görüntüleyicinin noktaları). */
export function sentencesOf(text: string): string[] {
  return text.split(/(?<=[.!?])\s+(?=[A-ZÇĞİÖŞÜ0-9])/u).map((s) => s.trim()).filter((s) => s.length > 0)
}
