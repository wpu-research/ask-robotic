// İstek → LLM → doğrulanmış devre. `complete` dışarıdan verilir (testte sahte). Geçersiz çıktıda hata bildirimiyle bir kez daha denenir.
import type { Circuit, PartType } from './contract'
import { buildCircuit, describeCircuit, parseNetlist, systemPrompt, MAX_PROMPT, type AiCircuit } from './ai-circuit'
import type { Complete } from './ai-llm'

export interface GenerateOptions { locale: 'tr' | 'en'; allowed: readonly PartType[]; current?: Circuit; complete: Complete; signal?: AbortSignal }
export type GenerateResult = AiCircuit | { error: 'bad_output' | 'empty'; detail?: string }

export async function generateCircuit(prompt: string, o: GenerateOptions): Promise<GenerateResult> {
  const system = systemPrompt(o.allowed, o.locale)
  const base = `${o.current ? describeCircuit(o.current) + '\n\n' : ''}Request: ${prompt.trim().slice(0, MAX_PROMPT)}`
  let user = base
  let lastError = ''
  for (let attempt = 0; attempt < 2; attempt++) {
    const text = await o.complete(system, user, o.signal)
    const nl = parseNetlist(text)
    if ('error' in nl) { lastError = nl.error; user = `${base}\n\nYour previous reply was not valid (${nl.error}). Reply with ONLY the JSON object.`; continue }
    if (!nl.parts.length) return { error: 'empty', detail: nl.note }
    const built = buildCircuit(nl, o.allowed)
    if ('error' in built) { lastError = built.error; user = `${base}\n\nYour previous reply was not usable (${built.error}). Use only the listed part types and pins. Reply with ONLY the JSON object.`; continue }
    return built
  }
  return { error: 'bad_output', detail: lastError }
}
