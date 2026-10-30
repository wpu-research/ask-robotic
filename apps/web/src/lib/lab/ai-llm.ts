// Laboratuvar yapay zekâsı için tek seferlik (akışsız) LLM çağrısı. Yalnız sunucu.
// Sağlayıcı sırası Mac ile aynı: ANTHROPIC_API_KEY varsa Claude, yoksa NVIDIA_API_KEY (lib/tutor/nvidia.ts).
import Anthropic from '@anthropic-ai/sdk'
import { NVIDIA_URL, nvidiaEnabled, nvidiaModel } from '@/lib/tutor/nvidia'

export type Complete = (system: string, user: string, signal?: AbortSignal) => Promise<string>

const anthropicEnabled = () => !!process.env.ANTHROPIC_API_KEY?.trim()
export const labAiEnabled = () => anthropicEnabled() || nvidiaEnabled()
export const labAiModel = () => process.env.LAB_AI_MODEL?.trim() || 'claude-sonnet-5-5'

export class LabAiError extends Error { constructor(public status: number, message: string) { super(message) } }

let client: Anthropic | undefined
let clientKey: string | undefined
const getClient = () => {
  const key = process.env.ANTHROPIC_API_KEY
  if (!client || clientKey !== key) { client = new Anthropic({ apiKey: key, maxRetries: 1, timeout: 60_000 }); clientKey = key }
  return client
}

export const complete: Complete = async (system, user, signal) => {
  if (anthropicEnabled()) {
    try {
      const msg = await getClient().messages.create({ model: labAiModel(), max_tokens: 3000, system, messages: [{ role: 'user', content: user }] }, { signal })
      return msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('')
    } catch (e) {
      if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) throw new LabAiError(503, 'ai_disabled')
      if (e instanceof Anthropic.RateLimitError) throw new LabAiError(503, 'ai_busy')
      throw new LabAiError(502, e instanceof Error ? e.message : 'ai_unavailable')
    }
  }
  const timeout = AbortSignal.timeout(60_000)
  let res: Response
  try {
    res = await fetch(NVIDIA_URL, {
      method: 'POST',
      headers: { authorization: `Bearer ${process.env.NVIDIA_API_KEY?.trim()}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: nvidiaModel(), max_tokens: 2500, temperature: 0.2, stream: false,
        chat_template_kwargs: { enable_thinking: false },
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      }),
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    })
  } catch (e) { throw new LabAiError(0, e instanceof Error ? e.message : 'network') }
  if (res.status === 401 || res.status === 403) throw new LabAiError(503, 'ai_disabled')
  if (res.status === 429) throw new LabAiError(503, 'ai_busy')
  if (!res.ok) throw new LabAiError(502, `nvidia ${res.status}`)
  const j = await res.json().catch(() => null) as { choices?: { message?: { content?: string | null } }[] } | null
  return j?.choices?.[0]?.message?.content ?? ''
}
