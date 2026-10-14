import { createHash } from 'node:crypto'
import { isJson } from '@/lib/auth/http'
import { rateLimited } from '@/lib/auth/rate-limit'
import { DEVICE_RE } from '@/lib/tutor/request'
import { refundChars, siteDailyChars, spendChars, TTS_DEVICE_DAILY, TTS_IP_DAILY, TTS_MAX_CHARS } from '@/lib/tts/quota'
import { cacheGet, cacheSet, synthesize, TtsError, ttsProvider, ttsVoice, type TtsLocale } from '@/lib/tts/providers'

// Robi'nin doğal sesi: POST { text, locale, deviceId? } → audio/mpeg. Servis yoksa 503 (istemci tarayıcı sesine döner).
// Maliyet sınırları: önbellekten dönen ses sayılmaz; yeni sentez cihaz, IP ve tüm site için günlük karakter kotasından düşer.
// Okulda bir sınıf tek IP'den gelir: IP sınırları bu yüzden cihaz sınırlarından geniştir.
export const dynamic = 'force-dynamic'

const ipOf = (req: Request) => req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
const json = (body: unknown, status: number) => Response.json(body, { status })

export async function POST(req: Request) {
  const provider = ttsProvider()
  if (!provider) return json({ error: 'tts_disabled' }, 503)
  // Yalnız kendi sayfalarımızdan (başka sitelerin bedava ses servisi olmasın)
  const site = req.headers.get('sec-fetch-site')
  if (site && site !== 'same-origin') return json({ error: 'forbidden' }, 403)
  if (!isJson(req)) return json({ error: 'JSON bekleniyor' }, 415)
  const body = await req.json().catch(() => null) as { text?: unknown; locale?: unknown; deviceId?: unknown } | null
  const text = typeof body?.text === 'string' ? body.text.replace(/\s+/g, ' ').trim() : ''
  if (!text || text.length > TTS_MAX_CHARS) return json({ error: 'Geçersiz metin' }, 400)
  const locale: TtsLocale = body?.locale === 'en' ? 'en' : 'tr'
  const deviceId = typeof body?.deviceId === 'string' && DEVICE_RE.test(body.deviceId) ? body.deviceId : null

  const ip = ipOf(req)
  if (rateLimited(`tts-ip|${ip}`, 300, 60_000) || (deviceId && rateLimited(`tts-dev|${deviceId}`, 30, 60_000))) {
    return Response.json({ error: 'too_fast' }, { status: 429, headers: { 'retry-after': '10' } })
  }

  const key = createHash('sha256').update(`${provider}|${ttsVoice(provider, locale)}|${locale}|${text}`).digest('hex')
  let audio = cacheGet(key)
  if (!audio) {
    const now = new Date()
    const n = text.length
    const spent: string[] = []
    const take = (k: string, max: number) => { if (!spendChars(k, n, max, now)) return false; spent.push(k); return true }
    if (!take('tts-site', siteDailyChars()) || !take(`tts-ip|${ip}`, TTS_IP_DAILY) || (deviceId && !take(`tts-dev|${deviceId}`, TTS_DEVICE_DAILY))) {
      spent.forEach((k) => refundChars(k, n))
      return json({ error: 'daily_limit' }, 429)
    }
    try {
      audio = await synthesize(provider, text, locale, req.signal)
    } catch (err) {
      spent.forEach((k) => refundChars(k, n))
      const status = err instanceof TtsError ? err.status : 0
      console.error('[tts]', provider, status, err instanceof Error ? err.message : err)
      // Anahtar/yetki hatası: istemci bu oturumda doğal sesi kapatır
      return json({ error: status === 401 || status === 403 ? 'tts_disabled' : 'tts_unavailable' }, status === 401 || status === 403 ? 503 : 502)
    }
    cacheSet(key, audio)
  }
  return new Response(audio as BodyInit, {
    status: 200,
    headers: { 'content-type': 'audio/mpeg', 'content-length': String(audio.length), 'cache-control': 'private, max-age=86400' },
  })
}
