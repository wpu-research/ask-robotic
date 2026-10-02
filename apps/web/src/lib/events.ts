// Ölçme verisi: olay günlüğü (PİLOT, taslak). Kişisel veri yok: yalnız anonim cihaz kimliği, olay türü, ders kimliği ve küçük sayısal/metin değerleri.
// Kayıt YALNIZ onayla yapılır (lib/consent.ts). Tarayıcıda sınırlı halka tamponu ('ask:events:v1'); isteğe bağlı sunucuya gönderim (/api/events).
// Saf işlevler (parseEvents, pushRing, sanitizePayload…) DOM'suz test edilir; DOM'lu kısım dosyanın altındadır.
import { useMemo, useSyncExternalStore } from 'react'
import { getConsent, canRecord, canSync } from './consent'
import { EVENTS_KEY, DEVICE_KEY, SENT_KEY, parseEvents, pendingEvents, pushRing, sanitizeEvent, type AppEvent, type EventType } from './events-core'

export * from './events-core'
const EVENT_NAME = 'ask-events'

// ---- DOM'lu kısım ----

let lessonCtx: number | null = null
/** Ders sayfası, editörlerin çağırdığı logEvent'e ders kimliğini kendiliğinden eklemek için bağlamı ayarlar. */
export function setEventLesson(id: number | null) { lessonCtx = id }

const read = (k: string, fallback: string) => { try { return localStorage.getItem(k) ?? fallback } catch { return fallback } }
const rawEvents = () => read(EVENTS_KEY, '[]')

export function getDeviceId(): string {
  let id = read(DEVICE_KEY, '')
  if (!/^[0-9a-f-]{32,40}$/.test(id)) {
    id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`.padEnd(32, '0').slice(0, 32)
    try { localStorage.setItem(DEVICE_KEY, id) } catch { /* yoksay */ }
  }
  return id
}

let flushTimer: ReturnType<typeof setTimeout> | null = null
let flushing = false

/** Sunucuya gönderim (yalnız "sync" onayıyla). Başarısızlık sessizdir; sonra yeniden denenir. */
export async function flushEvents(): Promise<void> {
  if (flushing || typeof window === 'undefined' || !canSync(getConsent())) return
  flushing = true
  try {
    for (let i = 0; i < 20; i++) {
      const list = parseEvents(rawEvents())
      const lastSent = Number(read(SENT_KEY, '0')) || 0
      const batch = pendingEvents(list, lastSent)
      if (!batch.length) break
      const res = await fetch('/api/events', {
        method: 'POST', headers: { 'content-type': 'application/json' }, keepalive: true,
        body: JSON.stringify({ deviceId: getDeviceId(), events: batch }),
      }).catch(() => null)
      if (!res?.ok) break
      try { localStorage.setItem(SENT_KEY, String(batch[batch.length - 1].t)) } catch { break }
    }
  } finally { flushing = false }
}

function scheduleFlush() {
  if (flushTimer || !canSync(getConsent())) return
  flushTimer = setTimeout(() => { flushTimer = null; void flushEvents() }, 4000)
}

if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') void flushEvents() })
}

/**
 * Olay kaydeder. Onay yoksa hiçbir şey yapmaz. Ders kimliği verilmezse sayfanın bağlamından gelir.
 * Aynı milisaniyedeki olaylar için zaman damgası artırılır (gönderim imleci t'ye dayanır).
 */
export function logEvent(type: EventType, opts: { lessonId?: number; p?: Record<string, unknown> } = {}): void {
  if (typeof window === 'undefined' || !canRecord(getConsent())) return
  try {
    const list = parseEvents(rawEvents())
    const last = list.length ? list[list.length - 1].t : 0
    const ev = sanitizeEvent({ t: Math.max(Date.now(), last + 1), type, lessonId: opts.lessonId ?? lessonCtx ?? undefined, p: opts.p })
    if (!ev) return
    localStorage.setItem(EVENTS_KEY, JSON.stringify(pushRing(list, ev)))
  } catch { return /* gizli pencere vb.: kaydedilemez, sayfa yine çalışır */ }
  window.dispatchEvent(new Event(EVENT_NAME))
  scheduleFlush()
}

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT_NAME, cb)
  window.addEventListener('storage', cb)
  return () => { window.removeEventListener(EVENT_NAME, cb); window.removeEventListener('storage', cb) }
}

/** Kayıtlı olaylar. Sunucuda ve ilk çizimde boş (hidrasyon uyumu). */
export function useEvents(): AppEvent[] {
  const s = useSyncExternalStore(subscribe, rawEvents, () => '[]')
  return useMemo(() => parseEvents(s), [s])
}

/** Yalnız ekran açıkken geçen süreyi sayar; durdurulunca `lesson_leave` olayı yazar (sn, üst sınır 30 dk). */
export function startLessonTimer(lessonId: number): () => void {
  let acc = 0
  let since = document.visibilityState === 'visible' ? Date.now() : 0
  const onVis = () => {
    if (document.visibilityState === 'visible') since = since || Date.now()
    else if (since) { acc += Date.now() - since; since = 0 }
  }
  document.addEventListener('visibilitychange', onVis)
  return () => {
    document.removeEventListener('visibilitychange', onVis)
    if (since) acc += Date.now() - since
    const sec = Math.min(1800, Math.round(acc / 1000))
    if (sec >= 1) logEvent('lesson_leave', { lessonId, p: { sec } })
  }
}

/** "Verilerimi sil": sunucudaki kayıtlar (varsa) + tarayıcıdaki olay günlüğü, cihaz kimliği, gönderim imleci ve onay. */
export async function deleteMyData(): Promise<{ server: 'silindi' | 'yok' | 'hata' }> {
  const id = read(DEVICE_KEY, '')
  let server: 'silindi' | 'yok' | 'hata' = 'yok'
  if (id) {
    const res = await fetch('/api/events', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ deviceId: id }) }).catch(() => null)
    server = res?.ok ? 'silindi' : 'hata'
  }
  if (server !== 'hata') {
    try { for (const k of [EVENTS_KEY, SENT_KEY, DEVICE_KEY, 'ask:consent:v1']) localStorage.removeItem(k) } catch { /* yoksay */ }
    window.dispatchEvent(new Event(EVENT_NAME))
    window.dispatchEvent(new Event('ask-consent'))
  }
  return { server }
}
