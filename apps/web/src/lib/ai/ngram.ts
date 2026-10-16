// Sonraki-kelime tahmini: derlemden gerçekten sayılan n-gram modeli + gerçek softmax/sıcaklık.
import { CORPUS_TR, NGRAM_EN } from './corpus'
import { lowerOf, mulberry32, type ContentLang } from './text'

export interface NgramModel { start: Map<string, number>; uni: Map<string, number>; bi: Map<string, Map<string, number>>; tri: Map<string, Map<string, number>>; total: number }

export function tokenizeWords(s: string, lang: ContentLang = 'tr'): string[] {
  return lowerOf(s, lang).match(/[\p{L}\p{N}]+|[.!?]/gu) ?? []
}

export function trainNgram(corpus: string): NgramModel {
  const start = new Map<string, number>()
  const uni = new Map<string, number>()
  const bi = new Map<string, Map<string, number>>()
  const tri = new Map<string, Map<string, number>>()
  const bump = (m: Map<string, Map<string, number>>, k: string, w: string) => {
    let row = m.get(k); if (!row) { row = new Map(); m.set(k, row) }
    row.set(w, (row.get(w) ?? 0) + 1)
  }
  let total = 0
  for (const line of corpus.split('\n')) {
    const t = tokenizeWords(line)
    for (let i = 0; i < t.length; i++) {
      uni.set(t[i]!, (uni.get(t[i]!) ?? 0) + 1); total++
      if (i === 0) start.set(t[0]!, (start.get(t[0]!) ?? 0) + 1)
      if (i >= 1) bump(bi, t[i - 1]!, t[i]!)
      if (i >= 2) bump(tri, t[i - 2]! + ' ' + t[i - 1]!, t[i]!)
    }
  }
  return { start, uni, bi, tri, total }
}

let DEFAULT: NgramModel | null = null
export const defaultModel = (): NgramModel => (DEFAULT ??= trainNgram(CORPUS_TR))
let DEFAULT_EN: NgramModel | null = null
/** Dile göre model: 'tr' = CORPUS_TR (varsayılan), 'en' = NGRAM_EN. */
export const modelFor = (lang: ContentLang = 'tr'): NgramModel => (lang === 'en' ? (DEFAULT_EN ??= trainNgram(NGRAM_EN)) : defaultModel())

export interface NextCounts { counts: Map<string, number>; usedOrder: 0 | 1 | 2; context: string[] }
const isEnd = (w: string | undefined) => w === '.' || w === '!' || w === '?'
/** order 2 = son iki kelimeye, 1 = son kelimeye bakar. Veri yoksa daha kısa bağlama "geri çekilir". */
export function nextCounts(model: NgramModel, context: string[], order: 1 | 2): NextCounts {
  // Boş bağlam ya da cümle sonundan sonra: cümle BAŞI sözcüklerine bakılır (usedOrder 0).
  if (context.length === 0 || isEnd(context[context.length - 1])) return { counts: model.start, usedOrder: 0, context: [] }
  if (order === 2 && context.length >= 2) {
    const key = context.slice(-2).join(' ')
    const row = model.tri.get(key)
    if (row && row.size) return { counts: row, usedOrder: 2, context: context.slice(-2) }
  }
  if (context.length >= 1) {
    const row = model.bi.get(context[context.length - 1]!)
    if (row && row.size) return { counts: row, usedOrder: 1, context: context.slice(-1) }
  }
  return { counts: model.uni, usedOrder: 0, context: [] }
}

export interface Candidate { word: string; count: number; p: number }
/** Softmax(log(sayım) / T). T=1 iken olasılık = göreli sıklık. T→0 en olası kelimeye kilitlenir; T büyüdükçe düzleşir. */
export function softmax(logits: number[], temperature: number): number[] {
  if (logits.length === 0) return []
  if (temperature < 1e-3) {
    const m = Math.max(...logits); const first = logits.indexOf(m)
    return logits.map((_, i) => (i === first ? 1 : 0))
  }
  const m = Math.max(...logits)
  const ex = logits.map((l) => Math.exp((l - m) / temperature))
  const s = ex.reduce((a, b) => a + b, 0)
  return ex.map((e) => e / s)
}

export function distribution(counts: Map<string, number>, temperature: number): Candidate[] {
  const entries = [...counts.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
  const p = softmax(entries.map(([, c]) => Math.log(c)), temperature)
  return entries.map(([word, count], i) => ({ word, count, p: p[i]! }))
}

export const entropyBits = (d: Candidate[]): number => -d.reduce((s, c) => (c.p > 0 ? s + c.p * Math.log2(c.p) : s), 0)

export function sampleWord(d: Candidate[], rnd: () => number): string {
  const r = rnd(); let acc = 0
  for (const c of d) { acc += c.p; if (r < acc) return c.word }
  return d[d.length - 1]!.word
}

export interface Generated { words: string[]; steps: { word: string; dist: Candidate[]; usedOrder: number }[] }
/** Aynı (başlangıç, sıcaklık, mertebe, tohum, n) her zaman aynı metni üretir. */
export function generate(model: NgramModel, start: string, n: number, temperature: number, order: 1 | 2, seed: number, lang: ContentLang = 'tr'): Generated {
  const rnd = mulberry32(seed)
  const ctx = tokenizeWords(start, lang)
  const words: string[] = []; const steps: Generated['steps'] = []
  for (let i = 0; i < n; i++) {
    const nc = nextCounts(model, ctx, order)
    const dist = distribution(nc.counts, temperature)
    const w = sampleWord(dist, rnd)
    steps.push({ word: w, dist, usedOrder: nc.usedOrder })
    ctx.push(w); words.push(w)
  }
  return { words, steps }
}
