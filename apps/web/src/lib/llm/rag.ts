// Uçtan uca mini RAG (öğretim modeli): parçala → gömme → vektör arama → yeniden sıralama → kaynaklı cevap.
// Parçalama lib/ai/rag.ts'teki chunkWords'ü yeniden kullanır. Cevap adımı gerçek bir model DEĞİLDİR: seçilen parçalardan
// soruya en çok örtüşen cümleleri alıntılayıp [kaynak] etiketiyle birleştirir. Benzerlik eşiğin altındaysa "notlarda yok" der.
import { chunkWords } from '@/lib/ai/rag'
import { stem, stopWordsOf, words, type ContentLang } from '@/lib/ai/text'
import type { Note } from './docs'
import { cosine, embed, sentencesOf, type Features, type Vec } from './embed'

export interface RagChunk { id: string; noteId: string; title: string; text: string; vec: Vec }
export interface RagParams { size: number; overlap: number; k: number; rerank: boolean; threshold: number; features?: Features }
export const RAG_DEFAULTS: RagParams = { size: 40, overlap: 10, k: 3, rerank: true, threshold: 0.2, features: 'ikisi' }

export function buildIndex(notes: readonly Note[], size: number, overlap: number, lang: ContentLang = 'tr', features: Features = 'ikisi'): RagChunk[] {
  return notes.flatMap((n) => chunkWords(n.text, size, overlap).map((c, i) => ({
    id: `${n.id}#${i + 1}`, noteId: n.id, title: n.title, text: c.text, vec: embed(`${n.title}. ${c.text}`, features, lang),
  })))
}

/** Sorgu ile parça arasındaki anahtar kelime örtüşmesi (gövde düzeyinde, 0..1): sorgu terimlerinin parçada geçen payı. */
export function keywordOverlap(query: string, text: string, lang: ContentLang = 'tr'): number {
  const stop = stopWordsOf(lang)
  const q = [...new Set(words(query, lang).filter((w) => !stop.has(w)).map(stem))]
  if (q.length === 0) return 0
  const t = new Set(words(text, lang).map(stem))
  return q.filter((w) => t.has(w)).length / q.length
}

export interface Hit { chunk: RagChunk; vector: number; keyword: number; score: number }
export interface RagResult {
  chunks: number
  retrieved: Hit[]
  reranked: Hit[]
  /** Cevapta kullanılan parçalar (eşiği geçenler, en çok k). */
  used: Hit[]
  answered: boolean
  answer: string
  sources: string[]
  prompt: string
}

/** Yeniden sıralama puanı: vektör benzerliği ile anahtar kelime örtüşmesinin karışımı (hibrit). */
export const hybrid = (vector: number, keyword: number): number => 0.5 * vector + 0.5 * keyword

export function retrieve(index: readonly RagChunk[], query: string, p: RagParams, lang: ContentLang = 'tr'): { retrieved: Hit[]; reranked: Hit[] } {
  const q = embed(query, p.features ?? 'ikisi', lang)
  const all = index.map((chunk) => {
    const vector = cosine(q, chunk.vec), keyword = keywordOverlap(query, `${chunk.title} ${chunk.text}`, lang)
    return { chunk, vector, keyword, score: vector }
  })
  const byVec = [...all].sort((a, b) => b.vector - a.vector || a.chunk.id.localeCompare(b.chunk.id))
  // yeniden sıralayıcı geniş bir aday kümesine bakar (k'nın iki katı), sonra en iyi k'yı seçer
  const cand = byVec.slice(0, Math.max(p.k * 2, p.k))
  const retrieved = byVec.slice(0, p.k)
  const reranked = p.rerank
    ? cand.map((h) => ({ ...h, score: hybrid(h.vector, h.keyword) })).sort((a, b) => b.score - a.score || a.chunk.id.localeCompare(b.chunk.id)).slice(0, p.k)
    : retrieved
  return { retrieved, reranked }
}

const T = {
  tr: { none: 'Bu sorunun cevabı ders notlarında yok. Notlara dayanmayan bir cevap uydurmak yerine bunu söylüyorum.', sys: 'Yalnız <belge> etiketleri içindeki notlara dayanarak cevap ver. Her cümlenin sonunda kaynağı [kimlik] olarak yaz. Cevap notlarda yoksa "Notlarda yok." de.', q: 'Soru' },
  en: { none: 'The answer to this question is not in the course notes. I say so instead of making up an answer that the notes do not support.', sys: 'Answer only from the notes inside the <document> tags. End each sentence with its source as [id]. If the answer is not in the notes, say "Not in the notes."', q: 'Question' },
}

/** Modele gidecek promptun öğretim amaçlı hâli (gerçek API örneğindeki ile aynı düzen). */
export function buildPrompt(query: string, used: readonly Hit[], lang: ContentLang = 'tr'): string {
  const tag = lang === 'en' ? 'document' : 'belge'
  const docs = used.map((h) => `<${tag} id="${h.chunk.id}" baslik="${h.chunk.title}">\n${h.chunk.text}\n</${tag}>`).join('\n')
  return `${T[lang].sys}\n\n${docs}\n\n${T[lang].q}: ${query}`
}

export function runRag(index: readonly RagChunk[], query: string, p: RagParams, lang: ContentLang = 'tr'): RagResult {
  const { retrieved, reranked } = retrieve(index, query, p, lang)
  const used = reranked.filter((h) => h.vector >= p.threshold)
  const prompt = buildPrompt(query, used, lang)
  if (used.length === 0 || used.every((h) => h.keyword === 0)) {
    return { chunks: index.length, retrieved, reranked, used: [], answered: false, answer: T[lang].none, sources: [], prompt }
  }
  // şablon "sentez": her kullanılan parçadan soruyla en çok örtüşen cümleyi al (tekrarsız), en iyi ikisini birleştir
  const picks: Array<{ s: string; id: string; o: number }> = []
  for (const h of used) {
    const best = sentencesOf(h.chunk.text).map((s) => ({ s, id: h.chunk.id, o: keywordOverlap(query, s, lang) })).sort((a, b) => b.o - a.o)[0]
    if (best && best.o > 0 && !picks.some((x) => x.s === best.s)) picks.push(best)
  }
  picks.sort((a, b) => b.o - a.o)
  // ikinci cümle yalnız en iyisi kadar ilgiliyse eklenir (tek ortak kelimeyle gelen alakasız cümleyi ele)
  const top = picks.slice(0, 2).filter((x, i) => i === 0 || x.o >= picks[0].o * 0.6)
  if (top.length === 0) return { chunks: index.length, retrieved, reranked, used, answered: false, answer: T[lang].none, sources: [], prompt }
  const answer = top.map((x) => `${x.s.replace(/\s+$/, '')} [${x.id}]`).join(' ')
  return { chunks: index.length, retrieved, reranked, used, answered: true, answer, sources: [...new Set(top.map((x) => x.id))], prompt }
}
