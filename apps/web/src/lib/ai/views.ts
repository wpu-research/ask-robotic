// Araç durumlarından türetilen görünümler: hem bileşenler hem hedef testleri aynı hesabı kullanır.
import { DOCS_ROBOT, DOCS_ROBOT_EN, RAG_GUIDE, RAG_GUIDE_EN } from './corpus'
import { rank } from './embedding'
import { distribution, entropyBits, generate, modelFor, nextCounts, tokenizeWords } from './ngram'
import { runRag } from './rag'
import { fitWindow, getBpe, pretokenize, encode, tokenStats } from './tokenizer'
import type { EmbedState, NextState, RagState, TokState } from './activity'
import type { ContentLang } from './text'

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

export function nextView(s: NextState, lang: ContentLang = 'tr') {
  const model = modelFor(lang)
  const ctx = tokenizeWords(s.text, lang)
  const nc = nextCounts(model, ctx, s.order)
  const dist = distribution(nc.counts, s.temperature)
  const gen = generate(model, s.text, s.count, s.temperature, s.order, s.seed, lang)
  return { ctx, usedOrder: nc.usedOrder, dist, entropy: entropyBits(dist), top: dist[0], gen, fullText: [...ctx, ...gen.words].join(' ') }
}

/** Benzerlik oyuncağının belgeleri (dile göre). */
export const docsFor = (lang: ContentLang = 'tr') => (lang === 'en' ? DOCS_ROBOT_EN : DOCS_ROBOT)
export const ragGuideFor = (lang: ContentLang = 'tr') => (lang === 'en' ? RAG_GUIDE_EN : RAG_GUIDE)
export const embedRank = (s: EmbedState, lang: ContentLang = 'tr') => rank(s.query, docsFor(lang), s.method, true, lang)
export const ragView = (s: RagState, lang: ContentLang = 'tr') => runRag(ragGuideFor(lang), s.question, { size: s.size, overlap: s.overlap, topK: s.topK, lang })
