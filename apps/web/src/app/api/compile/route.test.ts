import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const compileSketch = vi.hoisted(() => vi.fn())
vi.mock('@/lib/compile/compile', () => ({ compileSketch }))

import { POST } from './route'

let ipCounter = 0
function req(body: unknown, init: { ip?: string; type?: string | null; raw?: string } = {}) {
  const headers = new Headers()
  if (init.type !== null) headers.set('content-type', init.type ?? 'application/json')
  headers.set('x-real-ip', init.ip ?? `10.0.0.${++ipCounter}`)
  return new Request('http://localhost/api/compile', {
    method: 'POST',
    headers,
    body: init.raw ?? (typeof body === 'string' ? body : JSON.stringify(body)),
  })
}
const BLINK = 'void setup() {}\nvoid loop() {}\n'

beforeEach(() => {
  process.env.COMPILE_ENABLED = 'true'
  compileSketch.mockReset()
})
afterEach(() => {
  delete process.env.COMPILE_ENABLED
})

describe('POST /api/compile', () => {
  it('COMPILE_ENABLED kapalıyken 503', async () => {
    delete process.env.COMPILE_ENABLED
    const res = await POST(req({ code: BLINK }))
    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ error: 'Derleme servisi kapalı' })
    process.env.COMPILE_ENABLED = 'false'
    expect((await POST(req({ code: BLINK }))).status).toBe(503)
    expect(compileSketch).not.toHaveBeenCalled()
  })

  it('yanlış içerik türü 415', async () => {
    compileSketch.mockResolvedValue({ ok: false, reason: 'busy', errors: [] })
    expect((await POST(req({ code: BLINK }, { type: 'text/plain' }))).status).toBe(415)
    expect((await POST(req({ code: BLINK }, { type: null }))).status).toBe(415)
    expect((await POST(req({ code: BLINK }, { type: 'application/x-www-form-urlencoded' }))).status).toBe(415)
    expect((await POST(req({ code: BLINK }, { type: 'application/jsonx' }))).status).toBe(415)
    expect((await POST(req({ code: BLINK }, { type: 'application/json; charset=utf-8' }))).status).not.toBe(415)
  })

  it('büyük gövde 413 (Content-Length ile ve akışla)', async () => {
    const big = JSON.stringify({ code: 'a'.repeat(50_000) })
    expect((await POST(req(big))).status).toBe(413)
    // Content-Length başlığı olmayan/akış gövdesi de sınırlanır
    const stream = new ReadableStream<Uint8Array>({
      start(c) {
        const chunk = new TextEncoder().encode('x'.repeat(10_000))
        for (let i = 0; i < 6; i++) c.enqueue(chunk)
        c.close()
      },
    })
    const r = new Request('http://localhost/api/compile', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-real-ip': '10.9.9.9' },
      body: stream,
      duplex: 'half',
    } as RequestInit)
    expect((await POST(r)).status).toBe(413)
    expect(compileSketch).not.toHaveBeenCalled()
  })

  it('geçersiz JSON / code metin değil -> 400', async () => {
    expect((await POST(req('{bozuk'))).status).toBe(400)
    expect((await POST(req({ code: 5 }))).status).toBe(400)
    expect((await POST(req({}))).status).toBe(400)
    expect((await POST(req('null'))).status).toBe(400)
  })

  it('geçersiz kod 400 + satır numaralı hatalar, derleyiciye gitmez', async () => {
    const res = await POST(req({ code: 'int x;\n#include "/etc/passwd"\n' }))
    expect(res.status).toBe(400)
    const j = await res.json()
    expect(j.ok).toBe(false)
    expect(j.errors[0].line).toBe(2)
    expect(compileSketch).not.toHaveBeenCalled()
  })

  it('IP başına dakikada 20 istek, 21. istek 429', async () => {
    const ip = '203.0.113.50'
    for (let i = 0; i < 20; i++) {
      const res = await POST(req({ code: 5 }, { ip }))
      expect(res.status).toBe(400)
    }
    const res = await POST(req({ code: 5 }, { ip }))
    expect(res.status).toBe(429)
    expect(res.headers.get('retry-after')).toBeTruthy()
    // başka IP etkilenmez
    expect((await POST(req({ code: 5 }, { ip: '203.0.113.51' }))).status).toBe(400)
  })

  it('X-Forwarded-For: istemcinin eklediği soldaki değer hız sınırını atlatamaz', async () => {
    const mk = (spoof: string) =>
      new Request('http://localhost/api/compile', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-forwarded-for': `${spoof}, 198.51.100.7` },
        body: JSON.stringify({ code: 5 }),
      })
    for (let i = 0; i < 20; i++) await POST(mk(`1.1.1.${i}`))
    expect((await POST(mk('9.9.9.9'))).status).toBe(429)
  })

  it('başarı: 200 {ok, hex, flashBytes, ramBytes}', async () => {
    compileSketch.mockResolvedValue({ ok: true, hex: ':00000001FF\n', flashBytes: 444, ramBytes: 9, cached: false })
    const res = await POST(req({ code: BLINK }))
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ ok: true, hex: ':00000001FF\n', flashBytes: 444, ramBytes: 9 })
    expect(compileSketch).toHaveBeenCalledWith(BLINK)
  })

  it('derleme hatası 422 + errors', async () => {
    const errors = [{ line: 1, column: 5, message: 'hata' }]
    compileSketch.mockResolvedValue({ ok: false, reason: 'compile', errors })
    const res = await POST(req({ code: BLINK }))
    expect(res.status).toBe(422)
    expect(await res.json()).toEqual({ ok: false, errors })
  })

  it('kuyruk dolu 503 + Retry-After; zaman aşımı 504; iç hata 500 ve ayrıntı sızmaz', async () => {
    compileSketch.mockResolvedValueOnce({ ok: false, reason: 'busy', errors: [] })
    const busy = await POST(req({ code: BLINK }))
    expect(busy.status).toBe(503)
    expect(busy.headers.get('retry-after')).toBeTruthy()

    compileSketch.mockResolvedValueOnce({ ok: false, reason: 'timeout', errors: [] })
    expect((await POST(req({ code: BLINK }))).status).toBe(504)

    compileSketch.mockResolvedValueOnce({ ok: false, reason: 'internal', errors: [], secret: '/home/x/.arduino15' })
    const res = await POST(req({ code: BLINK }))
    expect(res.status).toBe(500)
    expect(JSON.stringify(await res.json())).not.toMatch(/home|arduino15|tmp/)
  })
})
