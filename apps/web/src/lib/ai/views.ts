// Araç durumlarından türetilen görünümler: hem bileşenler hem hedef testleri aynı hesabı kullanır.
import { DOCS_ROBOT, RAG_GUIDE } from './corpus'
import { rank } from './embedding'
import { defaultModel, distribution, entropyBits, generate, nextCounts, tokenizeWords } from './ngram'
import { runRag } from './rag'
import { fitWindow, getBpe, pretokenize, encode, tokenStats } from './tokenizer'
import type { EmbedState, NextState, RagState, TokState } from './activity'

export function tokView(s: TokState) {
  const st = tokenStats(s.text, s.corpus, s.merges)
  const fit = fitWindow(st.tokens, s.window)
  return { ...st, ...fit }
}
/** Aynı metnin iki derlemde token sayısı. */
export const tokenCountBy = (text: string, merges: number) => ({ tr: encode(text, getBpe('tr'), merges).length, en: encode(text, getBpe('en'), merges).length })
/** Metindeki en çok parçaya bölünen kelimenin parça sayısı. */
export function maxPiecesPerWord(text: string, corpus: TokState['corpus'], merges: number): number {
  const bpe = getBpe(corpus)
  return Math.max(0, ...pretokenize(text).filter((p) => p.startsWith('▁')).map((p) => encode(p.slice(1), bpe, merges).length + 0))
}

export function nextView(s: NextState) {
  const ctx = tokenizeWords(s.text)
  const nc = nextCounts(defaultModel(), ctx, s.order)
  const dist = distribution(nc.counts, s.temperature)
  const gen = generate(defaultModel(), s.text, s.count, s.temperature, s.order, s.seed)
  return { ctx, usedOrder: nc.usedOrder, dist, entropy: entropyBits(dist), top: dist[0], gen, fullText: [...ctx, ...gen.words].join(' ') }
}

export const embedRank = (s: EmbedState) => rank(s.query, DOCS_ROBOT, s.method)
export const ragView = (s: RagState) => runRag(RAG_GUIDE, s.question, { size: s.size, overlap: s.overlap, topK: s.topK })
