// RAG hattı: parçala → vektörleştir → getir → bağlama yerleştir. İlk dört adım GERÇEKTEN hesaplanır.
// Son adım (sentez) burada bir model DEĞİLDİR: bağlamdan en çok eşleşen cümleyi seçen basit bir şablondur.
import { rank, terms, type Item, type Method, type Ranked } from './embedding'

export interface Chunk extends Item { index: number; startWord: number; endWord: number }

/** Metni `size` kelimelik pencerelerle böler; ardışık pencereler `overlap` kelime örtüşür. */
export function chunkWords(text: string, size: number, overlap: number): Chunk[] {
  const w = text.split(/\s+/).filter(Boolean)
  const sz = Math.max(3, Math.floor(size))
  const ov = Math.max(0, Math.min(Math.floor(overlap), sz - 1))
  const step = sz - ov
  const out: Chunk[] = []
  for (let s = 0; s < w.length; s += step) {
    const e = Math.min(w.length, s + sz)
    out.push({ id: `p${out.length + 1}`, index: out.length, text: w.slice(s, e).join(' '), startWord: s, endWord: e })
    if (e >= w.length) break
  }
  return out
}

export interface RagOptions { size: number; overlap: number; topK: number; method?: Method }
export interface RagRun {
  chunks: Chunk[]
  ranked: Ranked<Chunk>[]
  retrieved: Ranked<Chunk>[]
  context: string
  prompt: string
  template: { label: string; text: string; sentence: string | null }
}

export const TEMPLATE_LABEL = 'ŞABLON ÇIKTI — sentez adımı burada gerçek bir model olurdu. Bu satır yalnız bağlamdaki en çok eşleşen cümleyi alıntılar.'

export function splitSentences(s: string): string[] {
  return s.split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean)
}

export function runRag(text: string, question: string, opt: RagOptions): RagRun {
  const chunks = chunkWords(text, opt.size, opt.overlap)
  const ranked = rank(question, chunks, opt.method ?? 'tfidf')
  const retrieved = ranked.slice(0, Math.max(1, opt.topK)).filter((r) => r.score > 0)
  const context = retrieved.map((r, i) => `[${i + 1}] ${r.item.text}`).join('\n')
  const prompt = `Aşağıdaki bağlama dayanarak soruyu yanıtla. Bağlamda yoksa "bilmiyorum" de.\n\nBağlam:\n${context || '(hiçbir parça getirilemedi)'}\n\nSoru: ${question}`
  const q = new Set(terms(question))
  let best: { s: string; n: number } | null = null
  for (const r of retrieved) for (const s of splitSentences(r.item.text)) {
    const n = terms(s).filter((t) => q.has(t)).length
    if (n > 0 && (!best || n > best.n)) best = { s, n }
  }
  const sentence = best?.s ?? null
  return { chunks, ranked, retrieved, context, prompt, template: { label: TEMPLATE_LABEL, text: sentence ?? 'Bağlamda yanıt bulunamadı → gerçek bir model "bilmiyorum" demeliydi.', sentence } }
}

/** Getirilen bağlam bu ifadeyi (büyük/küçük harf fark etmeden) içeriyor mu? */
export function contextHas(run: RagRun, needle: string): boolean {
  return run.context.toLocaleLowerCase('tr-TR').includes(needle.toLocaleLowerCase('tr-TR'))
}
