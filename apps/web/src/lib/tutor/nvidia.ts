// Robi için geçici yedek sağlayıcı: NVIDIA API kataloğu (OpenAI uyumlu sohbet, SSE akışı). Yalnız sunucu.
// ANTHROPIC_API_KEY yokken NVIDIA_API_KEY varsa kullanılır (lib/tutor/claude.ts). Model: NVIDIA_MODEL.
// Not: ücretsiz katmanda büyük modeller sırada çok bekleyebiliyor; varsayılan, hızlı yanıt veren küçük model.
import type { TutorResult, TutorTurn } from './claude'

export const NVIDIA_MODEL_DEFAULT = 'nvidia/nemotron-3.5-lightning-30b-a3b'
export const NVIDIA_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'
export const nvidiaEnabled = () => !!process.env.NVIDIA_API_KEY?.trim()
export const nvidiaModel = () => process.env.NVIDIA_MODEL?.trim() || NVIDIA_MODEL_DEFAULT

export class NvidiaError extends Error { constructor(public status: number, message: string) { super(message) } }

export function buildNvidiaBody(system: string, context: string, messages: TutorTurn[]) {
  return {
    model: nvidiaModel(),
    max_tokens: 350,
    temperature: 0.5,
    stream: true,
    // Düşünme kapalı: kısa sohbet, hızlı ilk parça (destekleyen modellerde)
    chat_template_kwargs: { enable_thinking: false },
    messages: [{ role: 'system', content: `${system}\n\n${context}` }, ...messages.map((m) => ({ role: m.role, content: m.content }))],
  }
}

/** Metin parçalarını üretir (akıl yürütme parçaları atlanır). */
export async function* streamNvidia(system: string, context: string, messages: TutorTurn[], signal?: AbortSignal): AsyncGenerator<string, TutorResult> {
  const timeout = AbortSignal.timeout(45_000)
  let res: Response
  try {
    res = await fetch(NVIDIA_URL, {
      method: 'POST',
      headers: { authorization: `Bearer ${process.env.NVIDIA_API_KEY?.trim()}`, 'content-type': 'application/json', accept: 'text/event-stream' },
      body: JSON.stringify(buildNvidiaBody(system, context, messages)),
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    })
  } catch (e) {
    if (signal?.aborted) throw new NvidiaError(499, 'aborted')
    throw new NvidiaError(0, e instanceof Error ? e.message : 'network')
  }
  if (!res.ok || !res.body) throw new NvidiaError(res.status, (await res.text().catch(() => '')).slice(0, 300))
  const reader = res.body.getReader()
  const dec = new TextDecoder()
  let buf = ''
  let finish: string | null = null
  let model: string | null = null
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buf += dec.decode(value, { stream: true })
      let nl: number
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim()
        buf = buf.slice(nl + 1)
        if (!line.startsWith('data:')) continue
        const data = line.slice(5).trim()
        if (data === '[DONE]') continue
        let ev: { model?: string; choices?: { delta?: { content?: string | null }; finish_reason?: string | null }[] }
        try { ev = JSON.parse(data) } catch { continue }
        model ??= ev.model ?? null
        const ch = ev.choices?.[0]
        if (ch?.finish_reason) finish = ch.finish_reason
        const text = ch?.delta?.content
        if (text) yield text
      }
    }
  } catch (e) {
    if (signal?.aborted) throw new NvidiaError(499, 'aborted')
    throw new NvidiaError(0, e instanceof Error ? e.message : 'stream')
  }
  return { stopReason: finish === 'stop' ? 'end_turn' : finish, model, fallback: false }
}
