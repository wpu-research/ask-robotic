// Yapay zekâ atölyesi etkinlik altyapısı. Bir etkinlik: araç türü + giriş metni + başlangıç durumu + hedefler (her hedefin
// kendi testi) + çözüm durumu. Hedefler yalnız aracın DURUMUNDAN hesaplanır (başsız, deterministik); API çağrısı yoktur.
import type { Method } from './embedding'
import type { CorpusId } from './tokenizer'
import type { EvalCase, TargetId } from './evals'
import type { Level } from './injection'
import type { Mark } from './detective'
import type { WorldId } from './agent'

export type AiTool = 'tokenizer' | 'nextword' | 'embed' | 'rag' | 'agent' | 'prompt' | 'injection' | 'eval' | 'detective'
export const AI_TOOLS: { id: AiTool; title: string; about: string }[] = [
  { id: 'tokenizer', title: 'Token ve BPE', about: 'Yazının token\'lara nasıl bölündüğünü ve bağlam penceresini gör.' },
  { id: 'nextword', title: 'Sonraki kelime ve sıcaklık', about: 'Mini metinden sayılan n-gram modeli, gerçek softmax ve sıcaklık.' },
  { id: 'embed', title: 'Metin benzerliği', about: 'Sayım ve TF-IDF vektörleri, gerçek kosinüs benzerliği.' },
  { id: 'rag', title: 'RAG hattı', about: 'Parçala, vektörleştir, getir, bağlama yerleştir.' },
  { id: 'agent', title: 'Ajan döngüsü', about: 'Araç çağrılarını adım adım çalıştır; sanal robot ve hesap makinesi.' },
  { id: 'prompt', title: 'Prompt denetleyici', about: 'Yazdığın prompt\'u kural tabanlı bir kontrol listesiyle incele.' },
  { id: 'injection', title: 'Prompt injection', about: 'Kırmızı takım: saldır, sonra savun (simülasyon).' },
  { id: 'eval', title: 'Eval tablosu', about: 'Test vakaları yaz, doğruluğu hesapla, zayıf noktaları bul.' },
  { id: 'detective', title: 'Halüsinasyon dedektifi', about: 'Özetteki iddiaları kaynakla karşılaştır.' },
]

export interface TokState { text: string; corpus: CorpusId; merges: number; window: number }
export interface NextState { text: string; temperature: number; order: 1 | 2; seed: number; count: number; tried: string[] }
export interface EmbedState { query: string; method: Method }
export interface RagState { question: string; size: number; overlap: number; topK: number }
export interface AgentState { script: string; world: WorldId }
export interface PromptState { prompt: string; task: string }
export interface InjState { mode: 'attack' | 'defense'; level: Level; attack: string; defenses: string[] }
export interface EvalState { target: TargetId; cases: EvalCase[] }
export interface DetState { setId: string; marks: Record<string, Mark> }

export interface ToolStates { tokenizer: TokState; nextword: NextState; embed: EmbedState; rag: RagState; agent: AgentState; prompt: PromptState; injection: InjState; eval: EvalState; detective: DetState }

export const DEFAULT_STATE: { [K in AiTool]: () => ToolStates[K] } = {
  tokenizer: () => ({ text: 'Robot engeli görür ve sola döner.', corpus: 'tr', merges: 0, window: 0 }),
  nextword: () => ({ text: 'robot', temperature: 1, order: 1, seed: 1, count: 0, tried: [] }),
  embed: () => ({ query: 'mesafe ölçme', method: 'tfidf' }),
  rag: () => ({ question: 'Proje teslimi ne zaman?', size: 30, overlap: 5, topK: 2 }),
  agent: () => ({ script: '', world: 'hesap' }),
  prompt: () => ({ prompt: '', task: 'serbest' }),
  injection: () => ({ mode: 'attack', level: 0, attack: '', defenses: [] }),
  eval: () => ({ target: 'sentiment', cases: [{ text: 'Bu uygulama çok güzel', expected: 'olumlu' }] }),
  detective: () => ({ setId: 'sensor', marks: {} }),
}

export interface AiGoal<S> { id: string; label: string; hint?: string; test: (s: S) => boolean }
export interface AiActivityOf<K extends AiTool> {
  id: string
  title: string
  tool: K
  /** Öğrenciye gösterilen giriş / yönerge (düz metin). */
  intro: string
  initial: () => ToolStates[K]
  goals: AiGoal<ToolStates[K]>[]
  /** Tüm hedefleri sağlayan örnek durum. */
  solution: () => ToolStates[K]
}
export type AiActivity = { [K in AiTool]: AiActivityOf<K> }[AiTool]
/** Etkinlik türünün Türkçe adı (özellik listesinde "AiEtkinlik"). */
export type AiEtkinlik = AiActivity

export function defineActivity<K extends AiTool>(a: AiActivityOf<K>): AiActivityOf<K> { return a }

export interface AiGoalResult { id: string; label: string; hint?: string; ok: boolean }
export interface AiEvaluation { results: AiGoalResult[]; allPassed: boolean }

export function evaluateAi(a: AiActivity, state: unknown): AiEvaluation {
  const goals = a.goals as AiGoal<unknown>[]
  const results = goals.map((g) => {
    let ok = false
    try { ok = !!g.test(state) } catch { ok = false }
    return { id: g.id, label: g.label, hint: g.hint, ok }
  })
  return { results, allPassed: results.every((r) => r.ok) }
}

/** Kayıtlı/bozuk veriden güvenli durum: varsayılan alanlar korunur, türü uyan alanlar alınır. */
export function sanitizeState<K extends AiTool>(tool: K, raw: unknown, base?: ToolStates[K]): ToolStates[K] {
  const def = (base ?? DEFAULT_STATE[tool]()) as unknown as Record<string, unknown>
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return def as unknown as ToolStates[K]
  const r = raw as Record<string, unknown>
  const out: Record<string, unknown> = { ...def }
  for (const k of Object.keys(def)) {
    const d = def[k], v = r[k]
    if (v === undefined) continue
    if (Array.isArray(d) ? Array.isArray(v) : typeof v === typeof d && (typeof d !== 'object' || (v !== null && !Array.isArray(v)))) out[k] = v
  }
  return out as unknown as ToolStates[K]
}

export const AI_STORAGE_PREFIX = 'ask:ai:v1:'
export function loadAiState<K extends AiTool>(tool: K, key: string, base?: ToolStates[K]): ToolStates[K] | null {
  try {
    if (typeof localStorage === 'undefined') return null
    const s = localStorage.getItem(AI_STORAGE_PREFIX + key)
    return s ? sanitizeState(tool, JSON.parse(s), base) : null
  } catch { return null }
}
export function saveAiState(key: string, state: unknown): void {
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(AI_STORAGE_PREFIX + key, JSON.stringify(state)) } catch { /* depolama kapalı */ }
}
export function clearAiState(key: string): void {
  try { if (typeof localStorage !== 'undefined') localStorage.removeItem(AI_STORAGE_PREFIX + key) } catch { /* yoksay */ }
}
