import { rateLimited } from '@/lib/auth/rate-limit'
import { compileSketch } from '@/lib/compile/compile'
import { validateSource } from '@/lib/compile/validate'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 90

export const MAX_BODY_BYTES = 40 * 1024
const RATE_MAX = 20
const RATE_WINDOW_MS = 60_000

function json(body: unknown, status: number, headers?: Record<string, string>) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } })
}

// Güvenilir proxy'nin eklediği en sağdaki adres; istemcinin gönderdiği soldaki değerlere güvenilmez.
function clientIp(req: Request) {
  const real = req.headers.get('x-real-ip')?.trim()
  if (real) return real
  const parts = req.headers.get('x-forwarded-for')?.split(',').map((s) => s.trim()).filter(Boolean)
  return parts?.length ? parts[parts.length - 1] : 'unknown'
}

async function readLimited(req: Request, max: number): Promise<string | null> {
  const declared = Number(req.headers.get('content-length'))
  if (Number.isFinite(declared) && declared > max) return null
  if (!req.body) return ''
  const reader = req.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > max) {
      await reader.cancel().catch(() => {})
      return null
    }
    chunks.push(value)
  }
  return Buffer.concat(chunks).toString('utf8')
}

export async function POST(req: Request) {
  if (process.env.COMPILE_ENABLED !== 'true') return json({ error: 'Derleme servisi kapalı' }, 503)

  if (!/^application\/json\s*(;|$)/i.test(req.headers.get('content-type') ?? '')) {
    return json({ error: 'JSON bekleniyor' }, 415)
  }

  if (rateLimited(`compile:${clientIp(req)}`, RATE_MAX, RATE_WINDOW_MS)) {
    return json({ error: 'Çok fazla istek, biraz bekleyip tekrar dene' }, 429, { 'Retry-After': '60' })
  }

  const text = await readLimited(req, MAX_BODY_BYTES)
  if (text === null) return json({ error: 'İstek gövdesi çok büyük' }, 413)

  let body: unknown
  try {
    body = JSON.parse(text)
  } catch {
    return json({ error: 'Geçersiz JSON' }, 400)
  }
  const code = (body as { code?: unknown } | null)?.code
  if (typeof code !== 'string') return json({ error: 'code alanı metin olmalı' }, 400)

  const v = validateSource(code)
  if (!v.ok) return json({ ok: false, errors: v.errors }, 400)

  const r = await compileSketch(code)
  if (r.ok) return json({ ok: true, hex: r.hex, flashBytes: r.flashBytes, ramBytes: r.ramBytes, cached: r.cached }, 200)
  switch (r.reason) {
    case 'invalid':
      return json({ ok: false, errors: r.errors }, 400)
    case 'compile':
      return json({ ok: false, errors: r.errors }, 422)
    case 'busy':
      return json({ ok: false, error: 'Derleme sırası dolu, birazdan tekrar dene' }, 503, { 'Retry-After': '10' })
    case 'timeout':
      return json({ ok: false, error: 'Derleme zaman aşımına uğradı' }, 504)
    default:
      return json({ ok: false, error: 'Derleme servisi geçici olarak kullanılamıyor' }, 500)
  }
}
