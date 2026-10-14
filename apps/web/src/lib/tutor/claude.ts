// Claude çağrısı (yalnız sunucu). Model: claude-opus-5-5 (düşünme hep açık; `thinking` gönderilmez).
// Önbellek: sistem istemi (TUTOR_SYSTEM ya da her sayfadaki Robi için ROBI_PAGE_SYSTEM) tek kırılma noktası (ephemeral); ders bağlamı ondan SONRA ikinci sistem bloğunda (önbelleksiz).
// Ret: sunucu tarafı yedek model AÇIK (fallbacks: "default", beta server-side-fallback-2026-07-01); yine de
// stop_reason === 'refusal' her zaman denetlenir (zincirin tamamı reddetmiş olabilir).
import Anthropic from '@anthropic-ai/sdk'
import { TUTOR_SYSTEM } from './prompt'
import { NvidiaError, nvidiaEnabled, streamNvidia } from './nvidia'

export const TUTOR_MODEL_DEFAULT = 'claude-opus-5-5'
export const TUTOR_MAX_TOKENS = 1024
export const FALLBACK_BETA = 'server-side-fallback-2026-07-01'
const EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max'] as const
type Effort = (typeof EFFORTS)[number]

const anthropicEnabled = () => !!process.env.ANTHROPIC_API_KEY?.trim()
/** Robi açık mı: Claude (öncelikli) ya da geçici yedek NVIDIA anahtarı. */
export const tutorEnabled = () => anthropicEnabled() || nvidiaEnabled()
export const tutorModel = () => process.env.TUTOR_MODEL?.trim() || TUTOR_MODEL_DEFAULT
/** Sohbet gecikmesi için varsayılan 'low'; TUTOR_EFFORT ile değiştirilebilir. */
export function tutorEffort(): Effort {
  const e = process.env.TUTOR_EFFORT?.trim().toLowerCase()
  return (EFFORTS as readonly string[]).includes(e ?? '') ? (e as Effort) : 'low'
}

let client: Anthropic | undefined
let clientKey: string | undefined
function getClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY
  if (!client || clientKey !== key) { client = new Anthropic({ apiKey: key, maxRetries: 1, timeout: 60_000 }); clientKey = key }
  return client
}

type StreamParams = Parameters<Anthropic['beta']['messages']['stream']>[0]
export type TutorTurn = { role: 'user' | 'assistant'; content: string }

export function buildTutorParams(context: string, messages: TutorTurn[], system: string = TUTOR_SYSTEM): StreamParams {
  return {
    model: tutorModel(),
    max_tokens: TUTOR_MAX_TOKENS,
    betas: [FALLBACK_BETA],
    fallbacks: 'default',
    output_config: { effort: tutorEffort() },
    system: [
      { type: 'text', text: system, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: context },
    ],
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  }
}

export interface TutorResult { stopReason: string | null; model: string | null; fallback: boolean }

/** Metin parçalarını üretir; dönüş değeri son durum (stop_reason, hangi model yanıtladı). */
export async function* streamTutor(context: string, messages: TutorTurn[], signal?: AbortSignal, system: string = TUTOR_SYSTEM): AsyncGenerator<string, TutorResult> {
  if (!anthropicEnabled()) return yield* streamNvidia(system, context, messages, signal)
  const stream = getClient().beta.messages.stream(buildTutorParams(context, messages, system), { signal })
  for await (const ev of stream) {
    if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta' && ev.delta.text) yield ev.delta.text
  }
  const final = await stream.finalMessage()
  const fallback = (final.usage?.iterations ?? []).some((it: { type?: string }) => it.type === 'fallback_message')
  return { stopReason: final.stop_reason ?? null, model: final.model ?? null, fallback }
}

/** SDK hatası → HTTP durumu ve istemciye gösterilecek kod. */
export function tutorErrorInfo(err: unknown): { status: number; error: string } {
  if (err instanceof NvidiaError) {
    if (err.status === 499) return { status: 499, error: 'aborted' }
    if (err.status === 401 || err.status === 403) return { status: 503, error: 'tutor_disabled' }
    if (err.status === 429) return { status: 503, error: 'tutor_busy' }
    return { status: 502, error: 'tutor_unavailable' }
  }
  if (err instanceof Anthropic.APIUserAbortError) return { status: 499, error: 'aborted' }
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) return { status: 503, error: 'tutor_disabled' }
  if (err instanceof Anthropic.RateLimitError) return { status: 503, error: 'tutor_busy' }
  if (err instanceof Anthropic.BadRequestError) return { status: 502, error: 'tutor_bad_request' }
  if (err instanceof Anthropic.APIError) return { status: 502, error: 'tutor_unavailable' }
  return { status: 500, error: 'tutor_error' }
}
