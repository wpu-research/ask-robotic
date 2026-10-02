import { getDb } from '@/lib/db'
import { isJson } from '@/lib/auth/http'
import { rateLimited } from '@/lib/auth/rate-limit'
import { MAX_BODY_BYTES, DEVICE_RE, deleteDeviceEvents, parseBatch, storeEvents } from '@/lib/events-server'

// Anonim olay günlüğü (pilot, taslak). Kimlik doğrulama yok: kayıtlar yalnız rastgele cihaz kimliğine bağlıdır.
// Oran sınırı: cihaz başına dakikada 20 istek (bellek içi, tek örnek). IP veritabanına yazılmaz; yalnız oran anahtarında kullanılır.
const ipOf = (req: Request) => req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

async function readBody(req: Request): Promise<unknown | 'big' | null> {
  const text = await req.text().catch(() => null)
  if (text === null) return null
  if (text.length > MAX_BODY_BYTES) return 'big'
  try { return JSON.parse(text) } catch { return null }
}

export async function POST(req: Request) {
  if (!isJson(req)) return Response.json({ error: 'JSON bekleniyor' }, { status: 415 })
  const body = await readBody(req)
  if (body === 'big') return Response.json({ error: 'İstek çok büyük' }, { status: 413 })
  const parsed = parseBatch(body)
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 })
  if (rateLimited(`events|${parsed.deviceId}`, 20, 60_000) || rateLimited(`events-ip|${ipOf(req)}`, 120, 60_000)) {
    return Response.json({ error: 'Çok sık istek' }, { status: 429, headers: { 'retry-after': '30' } })
  }
  try {
    const stored = await storeEvents(getDb(), parsed.deviceId, parsed.events)
    return Response.json({ ok: true, stored, dropped: parsed.dropped })
  } catch {
    return Response.json({ error: 'Kaydedilemedi' }, { status: 503 })
  }
}

export async function DELETE(req: Request) {
  if (!isJson(req)) return Response.json({ error: 'JSON bekleniyor' }, { status: 415 })
  const body = await readBody(req)
  const id = body && typeof body === 'object' ? (body as { deviceId?: unknown }).deviceId : undefined
  if (typeof id !== 'string' || !DEVICE_RE.test(id)) return Response.json({ error: 'Geçersiz cihaz kimliği' }, { status: 400 })
  if (rateLimited(`events-del|${id}`, 10, 60_000)) return Response.json({ error: 'Çok sık istek' }, { status: 429 })
  try {
    const deleted = await deleteDeviceEvents(getDb(), id)
    return Response.json({ ok: true, deleted })
  } catch {
    return Response.json({ error: 'Silinemedi' }, { status: 503 })
  }
}
