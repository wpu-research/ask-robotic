// 3B gömme uzayı: dersin 64 boyutlu öğretim gömmesi (embed.ts) PCA ile üç eksene izdüşürülür. Sahnenin bütün durumu burada,
// saf ve deterministik hesaplanır (three.js yalnız çizer): nokta konumları, sorgunun konumu, en yakın k komşu ve kosinüs
// puanları, RAG geri getirme animasyonunun adımları (sorgu → komşular → yeniden sıralama → cevap) ve zamanlaması.
// Komşular 2B görüntüleyiciyle aynı nearest() ile bulunur; ilk iki eksen pca2() ile aynı düzlemi verir.
import type { ContentLang } from '@/lib/ai/text'
import type { Note } from './docs'
import { dot, embed, nearest, normalize, sentencesOf, type Features, type Neighbour, type Vec } from './embed'
import { runRag, type RagChunk, type RagParams, type RagResult } from './rag'

export type V3 = [number, number, number]

/** k temel bileşen: güç yinelemesi + önceki eksenlere karşı söndürme. `variance` her eksenin açıkladığı varyanstır. */
export interface PcaK { mean: Vec; axes: Vec[]; variance: number[]; total: number }

export function pcaK(X: readonly Vec[], k = 3, iters = 300): PcaK {
  const d = X[0]?.length ?? 0
  const n = Math.max(1, X.length)
  const mean = new Array<number>(d).fill(0)
  for (const x of X) x.forEach((v, i) => { mean[i] += v / n })
  const C = X.map((x) => x.map((v, i) => v - mean[i]))
  const total = C.reduce((s, r) => s + dot(r, r), 0) / n
  const axes: Vec[] = []
  const variance: number[] = []
  for (let a = 0; a < k; a++) {
    // deterministik başlangıç (pca2 ile aynı aile); önceki eksenler çıkarılır
    const orth = (w: Vec): Vec => { let u = w; for (const e of axes) { const p = dot(u, e); u = u.map((x, i) => x - p * e[i]) } return u }
    let v = normalize(orth(Array.from({ length: d }, (_, i) => Math.sin(i + 1) + 0.5 * a)))
    for (let t = 0; t < iters; t++) {
      const s = C.map((r) => dot(r, v))
      const w = new Array<number>(d).fill(0)
      C.forEach((r, j) => r.forEach((x, i) => { w[i] += x * s[j] }))
      const u = orth(w)
      const nn = Math.hypot(...u)
      if (nn < 1e-12) break
      v = u.map((x) => x / nn)
    }
    // işaret kararlılığı: en büyük mutlak bileşen pozitif olsun
    let m = 0
    v.forEach((x, i) => { if (Math.abs(x) > Math.abs(v[m])) m = i })
    if (v[m] < 0) v = v.map((x) => -x)
    axes.push(v)
    variance.push(C.reduce((s, r) => s + dot(r, v) ** 2, 0) / n)
  }
  return { mean, axes, variance, total }
}

export function project3(x: Vec, p: { mean: Vec; axes: Vec[] }): V3 {
  const c = x.map((v, i) => v - p.mean[i])
  return [dot(c, p.axes[0]), dot(c, p.axes[1] ?? []), dot(c, p.axes[2] ?? [])]
}

/** Uzaydaki bir nokta: bir cümle (gömme dersi) ya da bir parça (RAG). `group` not sırasıdır (renk). */
export interface SpacePoint { id: string; label: string; text: string; group: number; vec: Vec; pos: V3 }
export interface Space {
  points: SpacePoint[]
  pca: PcaK
  /** Ham PCA koordinatlarını [−1, 1] küpüne getiren çarpan. */
  scale: number
  groups: string[]
  mode: Features
}

export interface SpaceItem { id: string; label: string; text: string; group: number; vec: Vec }

export function buildSpace(items: readonly SpaceItem[], groups: string[], mode: Features = 'ikisi'): Space {
  const pca = pcaK(items.map((x) => x.vec), 3)
  const raw = items.map((x) => project3(x.vec, pca))
  const m = Math.max(1e-9, ...raw.flat().map(Math.abs))
  const scale = 1 / m
  return { points: items.map((x, i) => ({ ...x, pos: raw[i].map((v) => v * scale) as V3 })), pca, scale, groups, mode }
}

/** Gömme dersinin noktaları: notların cümleleri (2B görüntüleyiciyle aynı sıra ve aynı gömme). */
export function sentenceItems(notes: readonly Note[], mode: Features = 'ikisi', lang: ContentLang = 'tr'): SpaceItem[] {
  return notes.flatMap((n, ni) => sentencesOf(n.text).map((s, si) => ({ id: `${n.id}.${si + 1}`, label: n.title, text: s, group: ni, vec: embed(s, mode, lang) })))
}
/** RAG'ın noktaları: dizindeki parçalar (vektörleri buildIndex'in hesapladığı). */
export function chunkItems(index: readonly RagChunk[], notes: readonly Note[]): SpaceItem[] {
  return index.map((c) => ({ id: c.id, label: c.id, text: c.text, group: Math.max(0, notes.findIndex((n) => n.id === c.noteId)), vec: c.vec }))
}

export interface QueryState { vec: Vec; pos: V3; neighbours: Neighbour[] }
/** Sorgunun uzaydaki yeri (aynı PCA ve ölçekle) ve en yakın k nokta. Komşular 64 boyutta bulunur, izdüşümde değil. */
export function queryState(space: Space, query: string, k = 3, lang: ContentLang = 'tr'): QueryState {
  const vec = embed(query, space.mode, lang)
  const pos = project3(vec, space.pca).map((v) => v * space.scale) as V3
  return { vec, pos, neighbours: nearest(vec, space.points.map((p) => p.vec), k) }
}

/** 2B görünüm: üçüncü ekseni sıfırlar (ilk iki eksen pca2'nin düzlemidir). `f` 0 → 3B, 1 → tamamen düz. */
export const flatten = (p: V3, f: number): V3 => [p[0], p[1], p[2] * (1 - f)]
export const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
/** Yumuşak geçiş (0..1 → 0..1). */
export const ease = (t: number): number => { const x = Math.min(1, Math.max(0, t)); return x * x * (3 - 2 * x) }

/* ---------------- RAG geri getirme animasyonu ---------------- */
export type RagStepKind = 'sorgu' | 'ara' | 'getir' | 'sirala' | 'cevap'
export const RAG_STEPS: readonly RagStepKind[] = ['sorgu', 'ara', 'getir', 'sirala', 'cevap']
export const STEP_TEXT: Record<RagStepKind, { tr: string; en: string }> = {
  sorgu: { tr: 'Sorgu gömülür ve uzaya yerleşir', en: 'The query is embedded and placed in the space' },
  ara: { tr: 'Vektör arama: aday parçalar (2k)', en: 'Vector search: candidate chunks (2k)' },
  getir: { tr: 'En yakın k parça (kosinüs)', en: 'Nearest k chunks (cosine)' },
  sirala: { tr: 'Yeniden sıralama (vektör + anahtar kelime)', en: 'Rerank (vector + keyword)' },
  cevap: { tr: 'Eşiği geçen parçalardan kaynaklı cevap', en: 'Answer with sources from chunks above the threshold' },
}
/** Bir adımda sorgudan çizilen bağ: hedef nokta indeksi, gösterilen puan ve vurgu. */
export interface Link { index: number; score: number; kind: 'aday' | 'ust' | 'kullanilan' | 'elenen' }
export interface RagFrame { kind: RagStepKind; links: Link[]; text: { tr: string; en: string } }
export interface RagAnim { frames: RagFrame[]; result: RagResult; query: QueryState }

/** runRag sonucunu adım adım çizilecek karelere çevirir. Puanlar ve sıralar rag.ts'in kendi sonucundan gelir. */
export function ragAnimation(space: Space, index: readonly RagChunk[], query: string, p: RagParams, lang: ContentLang = 'tr'): RagAnim {
  const result = runRag(index, query, p, lang)
  const q = queryState(space, query, p.k, lang)
  const at = (id: string) => space.points.findIndex((x) => x.id === id)
  const cand = q.neighbours.length ? nearest(q.vec, space.points.map((x) => x.vec), Math.max(p.k * 2, p.k)) : []
  const top = result.retrieved.map((h) => ({ index: at(h.chunk.id), score: h.vector, kind: 'ust' as const }))
  const rer = result.reranked.map((h) => ({ index: at(h.chunk.id), score: h.score, kind: 'ust' as const }))
  const usedIds = new Set(result.used.map((h) => h.chunk.id))
  const ans = result.reranked.map((h) => ({ index: at(h.chunk.id), score: h.vector, kind: usedIds.has(h.chunk.id) ? 'kullanilan' as const : 'elenen' as const }))
  const frames: RagFrame[] = [
    { kind: 'sorgu', links: [], text: STEP_TEXT.sorgu },
    { kind: 'ara', links: cand.map((n) => ({ index: n.index, score: n.score, kind: 'aday' })), text: STEP_TEXT.ara },
    { kind: 'getir', links: top, text: STEP_TEXT.getir },
    { kind: 'sirala', links: p.rerank ? rer : top, text: STEP_TEXT.sirala },
    { kind: 'cevap', links: ans, text: STEP_TEXT.cevap },
  ]
  return { frames, result, query: q }
}

/** Adım süreleri (saniye). Animasyon saati yalnız sahne görünürken ilerler. */
export const STEP_SEC: Record<RagStepKind, number> = { sorgu: 1.4, ara: 1.4, getir: 1.4, sirala: 1.6, cevap: 2.0 }
export const totalSec = (frames: readonly RagFrame[]): number => frames.reduce((s, f) => s + STEP_SEC[f.kind], 0)

/** t saniyedeki adım ve adımın içindeki ilerleme (0..1). t ≥ toplam ise son adım, ilerleme 1. */
export function stepAt(frames: readonly RagFrame[], t: number): { i: number; p: number; done: boolean } {
  let acc = 0
  for (let i = 0; i < frames.length; i++) {
    const d = STEP_SEC[frames[i].kind]
    if (t < acc + d) return { i, p: Math.max(0, (t - acc) / d), done: false }
    acc += d
  }
  return { i: frames.length - 1, p: 1, done: true }
}
/** i. adımın başladığı an (adım adım ilerletme düğmesi için). */
export const stepStart = (frames: readonly RagFrame[], i: number): number => frames.slice(0, Math.max(0, i)).reduce((s, f) => s + STEP_SEC[f.kind], 0)

/** Sorgu noktası "sorgu" adımında uzayın merkezinden kendi yerine uçar; sonra yerinde durur. */
export function queryPosAt(anim: RagAnim, t: number): V3 {
  const s = stepAt(anim.frames, t)
  return s.i === 0 ? lerp3([0, 0, 0], anim.query.pos, ease(s.p)) : anim.query.pos
}
