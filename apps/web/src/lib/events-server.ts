// Olay günlüğünün sunucu tarafı (PİLOT, taslak). IP veritabanına YAZILMAZ. Giriş yapmışsa yalnız user_id yazılır (öğretmen paneli
// beceri haritası); ad/e-posta yazılmaz. Anonim kayıtta user_id null.
import { events, eq, type Db } from '@ask/db'
import { BATCH, sanitizeEvent, type AppEvent } from './events-core'

export const MAX_BODY_BYTES = 32_000
export const DEVICE_RE = /^[0-9a-f-]{32,40}$/

export type ParsedBatch = { ok: true; deviceId: string; events: AppEvent[]; dropped: number } | { ok: false; error: string }

/** İstek gövdesini doğrular: cihaz kimliği biçimi, en çok BATCH olay, geçersiz olaylar elenir, gelecekteki zaman damgaları reddedilir. */
export function parseBatch(body: unknown, now = Date.now()): ParsedBatch {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Geçersiz istek' }
  const b = body as Record<string, unknown>
  if (typeof b.deviceId !== 'string' || !DEVICE_RE.test(b.deviceId)) return { ok: false, error: 'Geçersiz cihaz kimliği' }
  if (!Array.isArray(b.events) || b.events.length === 0 || b.events.length > BATCH) return { ok: false, error: `1-${BATCH} olay bekleniyor` }
  const good: AppEvent[] = []
  for (const raw of b.events) {
    const e = sanitizeEvent(raw)
    if (e && e.t <= now + 5 * 60_000 && e.t >= now - 400 * 24 * 3600_000) good.push(e)
  }
  return { ok: true, deviceId: b.deviceId, events: good, dropped: b.events.length - good.length }
}

export async function storeEvents(db: Db, deviceId: string, list: AppEvent[], userId: string | null = null): Promise<number> {
  if (!list.length) return 0
  await db.insert(events).values(list.map((e) => ({ deviceId, userId, type: e.type, lessonId: e.lessonId ?? null, payload: e.p ?? null, ts: new Date(e.t) })))
  return list.length
}

/** Cihaza ait tüm olayları siler ("Verilerimi sil"). */
export async function deleteDeviceEvents(db: Db, deviceId: string): Promise<number> {
  const rows = await db.delete(events).where(eq(events.deviceId, deviceId)).returning({ id: events.id })
  return rows.length
}
