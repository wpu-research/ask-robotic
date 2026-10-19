// ESP32 üzerinde çalışan küçük bir REST sunucusunun benzetimi: yollar, yöntemler, JSON gövde doğrulama, durum kodları,
// isteğe bağlı belirteç (Bearer) ve ham HTTP/1.1 yanıt metni. Saf mantık; REST oyun alanı simülasyonu ve testler kullanır.

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'
export interface Req { method: Method; path: string; body?: string; token?: string }
export interface Res { status: number; headers: Record<string, string>; body: string }
export interface Schedule { id: number; at: string; on: boolean }
export interface DevState { led: boolean; schedules: Schedule[]; nextId: number; uptime: number; requireToken: boolean; token: string }

export const STATUS_TEXT: Record<number, string> = {
  200: 'OK', 201: 'Created', 204: 'No Content', 400: 'Bad Request', 401: 'Unauthorized', 404: 'Not Found', 405: 'Method Not Allowed', 415: 'Unsupported Media Type', 422: 'Unprocessable Entity',
}

export const initialDev = (requireToken = false): DevState => ({ led: false, schedules: [], nextId: 1, uptime: 3600, requireToken, token: 'sera-123' })

/** JSON ayrıştırma: hata iletisini döndürür (sunucunun 400 gövdesine yazdığı gibi). */
export function parseJson(text: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try { return { ok: true, value: JSON.parse(text) } } catch (e) { return { ok: false, error: (e as Error).message } }
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/

/** Basit sensör okuması (deterministik): gün içi sıcaklık ve nem. */
export function sensorNow(uptime: number) {
  const h = (uptime / 3600) % 24
  return { temp: Math.round((22 + 4 * Math.sin((h - 9) / 24 * 2 * Math.PI)) * 10) / 10, hum: Math.round((55 - 10 * Math.sin((h - 9) / 24 * 2 * Math.PI)) * 10) / 10 }
}

const json = (status: number, v: unknown, extra: Record<string, string> = {}): Res => {
  const body = v === undefined ? '' : JSON.stringify(v)
  return { status, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), 'Content-Length': String(new TextEncoder().encode(body).length), ...extra }, body }
}

/** Yollar ve izinli yöntemler (405'te Allow başlığına yazılır). */
export const ROUTES: Array<{ pattern: RegExp; allow: Method[]; path: string }> = [
  { pattern: /^\/api\/status$/, allow: ['GET'], path: '/api/status' },
  { pattern: /^\/api\/sensor$/, allow: ['GET'], path: '/api/sensor' },
  { pattern: /^\/api\/led$/, allow: ['GET', 'PUT'], path: '/api/led' },
  { pattern: /^\/api\/schedules$/, allow: ['GET', 'POST'], path: '/api/schedules' },
  { pattern: /^\/api\/schedules\/(\d+)$/, allow: ['GET', 'DELETE'], path: '/api/schedules/{id}' },
]

/** İsteği işler; yeni durum ve yanıt döner (durum değiştirilmez, kopyalanır). */
export function handle(s0: DevState, req: Req): { state: DevState; res: Res } {
  const s: DevState = { ...s0, schedules: [...s0.schedules], uptime: s0.uptime + 1 }
  const route = ROUTES.find((r) => r.pattern.test(req.path))
  if (!route) return { state: s, res: json(404, { error: 'not found', path: req.path }) }
  if (!route.allow.includes(req.method)) return { state: s, res: json(405, { error: 'method not allowed' }, { Allow: route.allow.join(', ') }) }
  const writes = req.method !== 'GET'
  if (s.requireToken && writes && req.token !== s.token) return { state: s, res: json(401, { error: 'missing or invalid token' }, { 'WWW-Authenticate': 'Bearer' }) }
  const body = () => {
    const p = parseJson(req.body ?? '')
    return p.ok ? (isObj(p.value) ? { v: p.value } : { err: 'body must be a JSON object' }) : { err: p.error }
  }
  switch (route.path) {
    case '/api/status': return { state: s, res: json(200, { uptime: s.uptime, rssi: -61, heap: 214_532, fw: '1.4.0' }) }
    case '/api/sensor': return { state: s, res: json(200, sensorNow(s.uptime)) }
    case '/api/led': {
      if (req.method === 'GET') return { state: s, res: json(200, { on: s.led }) }
      const b = body()
      if ('err' in b) return { state: s, res: json(400, { error: b.err }) }
      if (typeof b.v.on !== 'boolean') return { state: s, res: json(422, { error: '"on" must be true or false' }) }
      s.led = b.v.on
      return { state: s, res: json(200, { on: s.led }) }
    }
    case '/api/schedules': {
      if (req.method === 'GET') return { state: s, res: json(200, s.schedules) }
      const b = body()
      if ('err' in b) return { state: s, res: json(400, { error: b.err }) }
      if (typeof b.v.at !== 'string' || !HHMM.test(b.v.at) || typeof b.v.on !== 'boolean') return { state: s, res: json(422, { error: 'need {"at":"HH:MM","on":true|false}' }) }
      const sc: Schedule = { id: s.nextId++, at: b.v.at, on: b.v.on }
      s.schedules.push(sc)
      return { state: s, res: json(201, sc, { Location: `/api/schedules/${sc.id}` }) }
    }
    default: {
      const id = Number(route.pattern.exec(req.path)![1])
      const i = s.schedules.findIndex((x) => x.id === id)
      if (i < 0) return { state: s, res: json(404, { error: 'no such schedule', id }) }
      if (req.method === 'GET') return { state: s, res: json(200, s.schedules[i]) }
      s.schedules.splice(i, 1)
      return { state: s, res: json(204, undefined) }
    }
  }
}

/** Ham HTTP/1.1 yanıt metni (satır sonları CRLF yerine \n ile gösterim için). */
export function rawResponse(r: Res): string {
  return [`HTTP/1.1 ${r.status} ${STATUS_TEXT[r.status] ?? ''}`, ...Object.entries(r.headers).map(([k, v]) => `${k}: ${v}`), '', r.body].join('\n')
}
/** Ham HTTP/1.1 istek metni. */
export function rawRequest(q: Req, host = 'sera.local'): string {
  const body = q.method === 'GET' || q.method === 'DELETE' ? '' : q.body ?? ''
  const h = [`${q.method} ${q.path} HTTP/1.1`, `Host: ${host}`]
  if (q.token) h.push(`Authorization: Bearer ${q.token}`)
  if (body) h.push('Content-Type: application/json', `Content-Length: ${new TextEncoder().encode(body).length}`)
  return [...h, '', body].join('\n')
}
/** İdempotent yöntem mi (aynı isteği tekrar etmek sonucu değiştirmez)? */
export const idempotent = (m: Method): boolean => m !== 'POST'
