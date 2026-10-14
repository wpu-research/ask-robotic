// Claude çağrısı (yalnız sunucu). Model: claude-opus-5-5 (düşünme hep açık; `thinking` gönderilmez).
// Önbellek: TUTOR_SYSTEM tek kırılma noktası (ephemeral); ders bağlamı ondan SONRA ikinci sistem bloğunda (önbelleksiz).
// Ret: sunucu tarafı yedek model AÇIK (fallbacks: "default", beta server-side-fallback-2026-07-01); yine de
// stop_reason === 'refusal' her zaman denetlenir (zincirin tamamı reddetmiş olabilir).
import Anthropic from '@anthropic-ai/sdk'
import { TUTOR_SYSTEM } from './prompt'

export const TUTOR_MODEL_DEFAULT = 'claude-opus-5-5'
export const TUTOR_MAX_TOKENS = 1024
export const FALLBACK_BETA = 'server-side-fallback-2026-07-01'
const EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max'] as const
type Effort = (typeof EFFORTS)[number]

export const tutorEnabled = () => !!process.env.ANTHROPIC_API_KEY?.trim()
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

export function buildTutorParams(context: string, messages: TutorTurn[]): StreamParams {
  return {
    model: tutorModel(),
    max_tokens: TUTOR_MAX_TOKENS,
    betas: [FALLBACK_BETA],
    fallbacks: 'default',
    output_config: { effort: tutorEffort() },
    system: [
      { type: 'text', text: TUTOR_SYSTEM, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: context },
    ],
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  }
}

export interface TutorResult { stopReason: string | null; model: string | null; fallback: boolean }

/** Metin parçalarını üretir; dönüş değeri son durum (stop_reason, hangi model yanıtladı). */
export async function* streamTutor(context: string, messages: TutorTurn[], signal?: AbortSignal): AsyncGenerator<string, TutorResult> {
  const stream = getClient().beta.messages.stream(buildTutorParams(context, messages), { signal })
  for await (const ev of stream) {
    if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta' && ev.delta.text) yield ev.delta.text
  }
  const final = await stream.finalMessage()
  const fallback = (final.usage?.iterations ?? []).some((it: { type?: string }) => it.type === 'fallback_message')
  return { stopReason: final.stop_reason ?? null, model: final.model ?? null, fallback }
}

/** SDK hatası → HTTP durumu ve istemciye gösterilecek kod. */
export function tutorErrorInfo(err: unknown): { status: number; error: string } {
  if (err instanceof Anthropic.APIUserAbortError) return { status: 499, error: 'aborted' }
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) return { status: 503, error: 'tutor_disabled' }
  if (err instanceof Anthropic.RateLimitError) return { status: 503, error: 'tutor_busy' }
  if (err instanceof Anthropic.BadRequestError) return { status: 502, error: 'tutor_bad_request' }
  if (err instanceof Anthropic.APIError) return { status: 502, error: 'tutor_unavailable' }
  return { status: 500, error: 'tutor_error' }
}
