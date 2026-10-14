import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from './route'
import { resetTtsCache } from '@/lib/tts/providers'
import { resetTtsQuota } from '@/lib/tts/quota'

const req = (b: unknown, headers: Record<string, string> = {}) => new Request('http://localhost/api/tts', {
  method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': `10.1.${Math.floor(Math.random() * 250)}.1`, ...headers }, body: JSON.stringify(b),
})
const fetchMock = vi.fn()
beforeEach(() => {
  process.env.TTS_PROVIDER = 'openai'; process.env.OPENAI_API_KEY = 'o'
  resetTtsCache(); resetTtsQuota()
  fetchMock.mockReset(); fetchMock.mockImplementation(async () => new Response(new Uint8Array([7, 7, 7])))
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => { delete process.env.TTS_PROVIDER; delete process.env.OPENAI_API_KEY; delete process.env.TTS_DAILY_CHAR_LIMIT; vi.unstubAllGlobals() })

describe('POST /api/tts', () => {
  it('servis yoksa 503', async () => {
    delete process.env.TTS_PROVIDER
    expect((await POST(req({ text: 'Merhaba' }))).status).toBe(503)
  })
  it('ses döner; aynı metin önbellekten (servise ikinci istek yok)', async () => {
    const r = await POST(req({ text: 'Merhaba Robi', locale: 'tr' }))
    expect(r.status).toBe(200)
    expect(r.headers.get('content-type')).toBe('audio/mpeg')
    expect(new Uint8Array(await r.arrayBuffer())).toEqual(new Uint8Array([7, 7, 7]))
    await POST(req({ text: 'Merhaba   Robi', locale: 'tr' }))
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
  it('geçersiz metin 400, başka siteden 403', async () => {
    expect((await POST(req({ text: '' }))).status).toBe(400)
    expect((await POST(req({ text: 'x'.repeat(1201) }))).status).toBe(400)
    expect((await POST(req({ text: 'a' }, { 'sec-fetch-site': 'cross-site' }))).status).toBe(403)
  })
  it('site günlük karakter kotası 429; servis hatası 502, yetki hatası 503', async () => {
    process.env.TTS_DAILY_CHAR_LIMIT = '10'
    expect((await POST(req({ text: 'on bir harf' }))).status).toBe(429)
    delete process.env.TTS_DAILY_CHAR_LIMIT
    fetchMock.mockImplementationOnce(async () => new Response('x', { status: 500 }))
    expect((await POST(req({ text: 'hata' }))).status).toBe(502)
    fetchMock.mockImplementationOnce(async () => new Response('x', { status: 401 }))
    const r = await POST(req({ text: 'yetki' }))
    expect(r.status).toBe(503)
    expect(await r.json()).toEqual({ error: 'tts_disabled' })
  })
})
