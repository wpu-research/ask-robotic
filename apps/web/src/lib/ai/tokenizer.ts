// Bayt-çifti kodlaması (BPE) — gerçek algoritmanın küçük hâli.
// Eğitim: derlemdeki kelimeleri karakterlere böl; en sık yan yana gelen çifti birleştir; bunu N kez tekrarla.
// Kodlama: yeni metni karakterlere böl, öğrenilen birleştirmeleri SIRAYLA uygula.
// Not: gerçek modeller karakter değil bayt düzeyinde başlar ve çok büyük metinlerle eğitilir; burada yalnız karakter vardır.
import { CORPUS_EN, CORPUS_KARMA, CORPUS_TR } from './corpus'

export type Pair = readonly [string, string]
export interface Bpe { merges: Pair[] }
export const WORD_MARK = '▁'

/** Metni ön-parçalara böler: kelimeler (başına ▁ eklenir) ve noktalama (tek başına). */
export function pretokenize(text: string): string[] {
  const parts = text.match(/[\p{L}\p{N}]+|[^\s\p{L}\p{N}]/gu) ?? []
  return parts.map((p) => (/^[\p{L}\p{N}]/u.test(p) ? WORD_MARK + p : p))
}

const symbolsOf = (piece: string): string[] => Array.from(piece)

export function trainBpe(corpus: string, numMerges: number): Bpe {
  const freq = new Map<string, number>()
  for (const p of pretokenize(corpus)) freq.set(p, (freq.get(p) ?? 0) + 1)
  let vocab = [...freq.entries()].map(([w, c]) => ({ syms: symbolsOf(w), c }))
  const merges: Pair[] = []
  for (let i = 0; i < numMerges; i++) {
    const pairs = new Map<string, number>()
    for (const { syms, c } of vocab) {
      for (let j = 0; j < syms.length - 1; j++) {
        const k = syms[j] + '\u0000' + syms[j + 1]
        pairs.set(k, (pairs.get(k) ?? 0) + c)
      }
    }
    let best: string | null = null
    let bestC = 1 // tek kez geçen çiftleri birleştirmeyiz
    for (const [k, c] of pairs) {
      if (c > bestC || (c === bestC && best !== null && k < best)) { best = k; bestC = c }
    }
    if (best === null) break
    const [a, b] = best.split('\u0000') as [string, string]
    merges.push([a, b])
    vocab = vocab.map(({ syms, c }) => ({ syms: applyMerge(syms, a, b), c }))
  }
  return { merges }
}

function applyMerge(syms: string[], a: string, b: string): string[] {
  const out: string[] = []
  for (let i = 0; i < syms.length; i++) {
    if (i < syms.length - 1 && syms[i] === a && syms[i + 1] === b) { out.push(a + b); i++ } else out.push(syms[i]!)
  }
  return out
}

/** `maxMerges` verilirse yalnız ilk N birleştirme uygulanır (0 = salt karakter). */
export function encode(text: string, bpe: Bpe, maxMerges: number = bpe.merges.length): string[] {
  const n = Math.max(0, Math.min(maxMerges, bpe.merges.length))
  const out: string[] = []
  for (const piece of pretokenize(text)) {
    let syms = symbolsOf(piece)
    for (let i = 0; i < n && syms.length > 1; i++) syms = applyMerge(syms, bpe.merges[i]![0], bpe.merges[i]![1])
    out.push(...syms)
  }
  return out
}

export type CorpusId = 'tr' | 'en' | 'karma'
export const CORPUS_LABEL: Record<CorpusId, string> = { tr: 'Türkçe mini derlem', en: 'İngilizce mini derlem', karma: 'Karma (TR + EN)' }
export const MAX_MERGES = 120
const CACHE = new Map<CorpusId, Bpe>()
export function getBpe(id: CorpusId): Bpe {
  let b = CACHE.get(id)
  if (!b) {
    b = trainBpe({ tr: CORPUS_TR, en: CORPUS_EN, karma: CORPUS_KARMA }[id], MAX_MERGES)
    CACHE.set(id, b)
  }
  return b
}

export interface WindowFit { kept: string[]; dropped: string[] }
/** Bağlam penceresi: en yeni `size` token sığar, en eski olanlar dışarıda kalır. size <= 0 sınırsızdır. */
export function fitWindow(tokens: string[], size: number): WindowFit {
  if (size <= 0 || tokens.length <= size) return { kept: tokens, dropped: [] }
  return { kept: tokens.slice(tokens.length - size), dropped: tokens.slice(0, tokens.length - size) }
}

export const displayToken = (t: string): string => t.replace(WORD_MARK, '·')
export const utf8Bytes = (s: string): number => new TextEncoder().encode(s).length

export interface TokStats { tokens: string[]; chars: number; count: number; perChar: number; bytes: number }
export function tokenStats(text: string, corpus: CorpusId, merges: number): TokStats {
  const tokens = encode(text, getBpe(corpus), merges)
  const chars = Array.from(text.replace(/\s+/g, '')).length
  return { tokens, chars, count: tokens.length, perChar: chars === 0 ? 0 : tokens.length / chars, bytes: utf8Bytes(text) }
}
