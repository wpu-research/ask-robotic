import { getCurrentUser } from '@/lib/auth/current'
import { isJson } from '@/lib/auth/http'
import { rateLimited } from '@/lib/auth/rate-limit'
import { MAX_PROMPT } from '@/lib/lab/ai-circuit'
import { generateCircuit } from '@/lib/lab/ai-generate'
import { complete, LabAiError, labAiEnabled } from '@/lib/lab/ai-llm'
import { isCircuit } from '@/lib/lab/ops'
import { DEFAULT_PARTS } from '@/lib/lab/parts'
import { refundDaily, takeDaily } from '@/lib/tutor/limits'

// "Yapay zekâyla devre kur": { prompt, locale?, current? } → { circuit, code?, note?, warnings }.
// Yalnız giriş yapmış üyeler (maliyet kontrolü); dakikada 4 istek, günde LAB_AI_DAILY (varsayılan 20).
export const dynamic = 'force-dynamic'
export const maxDuration = 90

const json = (body: unknown, status: number, headers?: Record<string, string>) => Response.json(body, { status, headers })
const daily = () => { const n = Number(process.env.LAB_AI_DAILY); return Number.isInteger(n) && n > 0 ? n : 20 }

export async function POST(req: Request) {
  if (!labAiEnabled()) return json({ error: 'ai_disabled' }, 503)
  if (!isJson(req)) return json({ error: 'JSON bekleniyor' }, 415)
  const body = await req.json().catch(() => null) as { prompt?: unknown; locale?: unknown; current?: unknown } | null
  const prompt = typeof body?.prompt === 'string' ? body.prompt.replace(/\s+/g, ' ').trim() : ''
  if (!prompt || prompt.length > MAX_PROMPT) return json({ error: 'bad_prompt' }, 400)
  const locale = body?.locale === 'en' ? 'en' : 'tr'

  const user = await getCurrentUser().catch(() => null)
  if (!user) return json({ error: 'login_required' }, 401)
  if (rateLimited(`labai|${user.id}`, 4, 60_000)) return json({ error: 'too_fast' }, 429, { 'retry-after': '20' })
  const key = `labai-day|${user.id}`
  const q = takeDaily(key, daily())
  if (!q.ok) return json({ error: 'daily_limit', limit: daily() }, 429)

  const current = isCircuit(body?.current) ? body.current : undefined
  try {
    const r = await generateCircuit(prompt, { locale, allowed: DEFAULT_PARTS, current, complete, signal: req.signal })
    if ('error' in r) { refundDaily(key); return json(r, r.error === 'empty' ? 200 : 502) }
    return json({ ...r, remaining: q.remaining }, 200)
  } catch (e) {
    refundDaily(key)
    if (e instanceof LabAiError) return json({ error: e.status === 503 ? e.message : 'ai_unavailable' }, e.status === 503 ? 503 : 502)
    console.error('[lab-ai]', e)
    return json({ error: 'ai_error' }, 500)
  }
}
