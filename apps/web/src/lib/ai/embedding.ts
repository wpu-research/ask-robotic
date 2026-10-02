// Metin vektörleri: sayım (bag-of-words) ve TF-IDF; benzerlik: kosinüs. Hepsi gerçekten hesaplanır.
// UYARI: Bu "anlam" vektörü DEĞİL, sözcük sayımı vektörüdür. Eş anlamlıları (mesafe / uzaklık) birbirine bağlayamaz.
// Gerçek gömme (embedding) modelleri anlamı sayı dizisine kodlar; burada yalnız hesabın mantığını gösteriyoruz.
import { STOP_WORDS, stem, words } from './text'

export type Method = 'sayim' | 'tfidf'
export type Vec = Map<string, number>

export function terms(text: string, useStem = true): string[] {
  return words(text).filter((w) => !STOP_WORDS.has(w)).map((w) => (useStem ? stem(w) : w))
}

export function cosine(a: Vec, b: Vec): number {
  let dot = 0
  for (const [k, v] of a) { const o = b.get(k); if (o !== undefined) dot += v * o }
  const na = Math.sqrt([...a.values()].reduce((s, v) => s + v * v, 0))
  const nb = Math.sqrt([...b.values()].reduce((s, v) => s + v * v, 0))
  return na === 0 || nb === 0 ? 0 : dot / (na * nb)
}

export interface Item { id: string; text: string }
export interface Ranked<T extends Item> { item: T; score: number }

export interface Idf { table: Map<string, number>; unseen: number }
export function idfTable(items: readonly Item[], useStem = true): Idf {
  const df = new Map<string, number>()
  for (const it of items) for (const t of new Set(terms(it.text, useStem))) df.set(t, (df.get(t) ?? 0) + 1)
  const n = items.length
  const idf = new Map<string, number>()
  for (const [t, d] of df) idf.set(t, Math.log((n + 1) / (d + 1)) + 1)
  return { table: idf, unseen: Math.log(n + 1) + 1 } // hiç görülmemiş terim: df = 0
}

export function vectorize(text: string, method: Method, idf: Idf, useStem = true): Vec {
  const v: Vec = new Map()
  for (const t of terms(text, useStem)) v.set(t, (v.get(t) ?? 0) + 1)
  if (method === 'tfidf') for (const [t, c] of v) v.set(t, c * (idf.table.get(t) ?? idf.unseen))
  return v
}

export function rank<T extends Item>(query: string, items: readonly T[], method: Method = 'tfidf', useStem = true): Ranked<T>[] {
  const idf = idfTable(items, useStem)
  const q = vectorize(query, method, idf, useStem)
  return items
    .map((item) => ({ item, score: cosine(q, vectorize(item.text, method, idf, useStem)) }))
    .sort((a, b) => b.score - a.score || (a.item.id < b.item.id ? -1 : 1))
}

/** Sorgu ile belge arasında ortak terimler (neden benzer?). */
export function sharedTerms(a: string, b: string, useStem = true): string[] {
  const tb = new Set(terms(b, useStem))
  return [...new Set(terms(a, useStem))].filter((t) => tb.has(t))
}
