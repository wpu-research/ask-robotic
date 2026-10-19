// 3B dikkat yayları: kısa bir cümlenin tokenları bir sıraya dizilir, seçilen sorgu tokenından her tokena bir yay çizilir;
// yayın yüksekliği ve kalınlığı dikkat ağırlığıyla orantılıdır. Hesap ML dersindeki dikkat mekanizmasının kendisidir
// (lib/ml/dikkat-mekanizmasi: softmax(QKᵀ / (√d · τ)) V); burada yalnız sahne geometrisi kurulur. Saf ve deterministik.
import { attention } from '@/lib/ml/dikkat-mekanizmasi'

export interface Arc { from: number; to: number; w: number; height: number }
export interface AttnScene {
  tokens: Array<{ text: string; x: number }>
  /** Sorgu satırının ağırlıkları (toplamı 1). */
  weights: number[]
  arcs: Arc[]
  best: number
  /** Bütün matris (her satır bir sorgu). */
  A: number[][]
}

export const ARC_MAX_H = 1.6
const SPACING = 1.25

export function attnScene(variant: number, tau: number, qi: number, lang: 'tr' | 'en' = 'tr'): AttnScene {
  const r = attention(variant === 1 ? 1 : 0, Math.max(0.05, tau))
  const n = r.words.length
  const q = Math.max(0, Math.min(n - 1, Math.round(qi)))
  const tokens = r.words.map((w, i) => ({ text: w[lang], x: (i - (n - 1) / 2) * SPACING }))
  const weights = r.A[q].slice()
  const max = Math.max(...weights)
  const arcs = weights.map((w, to) => ({ from: q, to, w, height: 0.25 + ARC_MAX_H * (w / (max || 1)) }))
  return { tokens, weights, arcs, best: weights.indexOf(max), A: r.A }
}

/** Yayın üzerindeki nokta (t 0..1): iki token arasında yarım elips; kendine dönen yay küçük bir halka olur. */
export function arcPoint(s: AttnScene, a: Arc, t: number): [number, number, number] {
  const x0 = s.tokens[a.from].x, x1 = s.tokens[a.to].x
  if (a.from === a.to) {
    const ang = t * Math.PI * 2
    const r = 0.18 + 0.25 * (a.height / (ARC_MAX_H + 0.25))
    return [x0 + Math.sin(ang) * r, 0.2 + r - Math.cos(ang) * r, 0]
  }
  return [x0 + (x1 - x0) * t, 0.2 + a.height * Math.sin(Math.PI * t), 0]
}
