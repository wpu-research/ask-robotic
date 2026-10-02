// Olay günlüğü çekirdeği: tipler ve saf işlevler (DOM/React yok; sunucu da kullanır). Ayrıntı: events.ts
export const EVENT_TYPES = [
  'lesson_view', 'lesson_leave', 'activity_start', 'goal_done', 'compile', 'run', 'hint',
  'quiz_answer', 'quiz_done', 'lesson_done', 'concept_view', 'part_view',
] as const
export type EventType = (typeof EVENT_TYPES)[number]
export type PayloadValue = string | number | boolean
export type Payload = Record<string, PayloadValue>

export interface AppEvent {
  /** Zaman damgası (ms). */
  t: number
  type: EventType
  lessonId?: number
  p?: Payload
}

export const EVENTS_KEY = 'ask:events:v1'
export const DEVICE_KEY = 'ask:device:v1'
export const SENT_KEY = 'ask:events:sent:v1'
export const MAX_EVENTS = 1000
export const MAX_PAYLOAD_KEYS = 8
export const MAX_STR = 80
export const BATCH = 50

const isType = (v: unknown): v is EventType => typeof v === 'string' && (EVENT_TYPES as readonly string[]).includes(v)

/** Yük: yalnız ilkel değerler, en çok 8 anahtar, metinler 80 karakter. Diğer her şey atılır. */
export function sanitizePayload(p: unknown): Payload | undefined {
  if (!p || typeof p !== 'object' || Array.isArray(p)) return undefined
  const out: Payload = {}
  for (const [k, v] of Object.entries(p as Record<string, unknown>)) {
    if (Object.keys(out).length >= MAX_PAYLOAD_KEYS) break
    if (!/^[\w-]{1,24}$/.test(k)) continue
    if (typeof v === 'string') out[k] = v.slice(0, MAX_STR)
    else if (typeof v === 'number' && Number.isFinite(v)) out[k] = v
    else if (typeof v === 'boolean') out[k] = v
  }
  return Object.keys(out).length ? out : undefined
}

export function sanitizeEvent(v: unknown): AppEvent | null {
  if (!v || typeof v !== 'object') return null
  const e = v as Record<string, unknown>
  if (!isType(e.type) || typeof e.t !== 'number' || !Number.isFinite(e.t) || e.t <= 0) return null
  const out: AppEvent = { t: Math.round(e.t), type: e.type }
  if (typeof e.lessonId === 'number' && Number.isInteger(e.lessonId) && e.lessonId > 0) out.lessonId = e.lessonId
  const p = sanitizePayload(e.p)
  if (p) out.p = p
  return out
}

export function parseEvents(s: string): AppEvent[] {
  try {
    const v = JSON.parse(s)
    if (!Array.isArray(v)) return []
    return v.map(sanitizeEvent).filter((x): x is AppEvent => x !== null)
  } catch { return [] }
}

/** Halka tamponu: en eski kayıtlar atılır. */
export function pushRing(list: readonly AppEvent[], ev: AppEvent, max = MAX_EVENTS): AppEvent[] {
  const next = [...list, ev]
  return next.length > max ? next.slice(next.length - max) : next
}

/** Gönderilmemiş olaylar (t > son gönderilen), en eskiden, en çok `limit`. */
export function pendingEvents(list: readonly AppEvent[], lastSent: number, limit = BATCH): AppEvent[] {
  return list.filter((e) => e.t > lastSent).slice(0, limit)
}
