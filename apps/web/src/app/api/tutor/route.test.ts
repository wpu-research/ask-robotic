import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { LessonStep } from '@ask/db'

// Gerçek API asla çağrılmaz: SDK, DB katmanı ve oturum taklit edilir.
const h = vi.hoisted(() => {
  class APIError extends Error { status?: number; constructor(status?: number, message = 'api') { super(message); this.status = status } }
  class APIUserAbortError extends APIError {}
  class AuthenticationError extends APIError {}
  class PermissionDeniedError extends APIError {}
  class RateLimitError extends APIError {}
  class BadRequestError extends APIError {}
  return {
    errors: { APIError, APIUserAbortError, AuthenticationError, PermissionDeniedError, RateLimitError, BadRequestError },
    stream: vi.fn(),
    ctor: vi.fn(),
    server: {
      loadTutorLesson: vi.fn(), loadPageSource: vi.fn(), loadTutorUser: vi.fn(), tutorGate: vi.fn(),
      countUserMessagesToday: vi.fn(), saveTutorExchange: vi.fn(),
    },
    user: vi.fn(),
    rateLimited: vi.fn(() => false),
  }
})

vi.mock('@anthropic-ai/sdk', () => {
  class Anthropic {
    static APIError = h.errors.APIError
    static APIUserAbortError = h.errors.APIUserAbortError
    static AuthenticationError = h.errors.AuthenticationError
    static PermissionDeniedError = h.errors.PermissionDeniedError
    static RateLimitError = h.errors.RateLimitError
    static BadRequestError = h.errors.BadRequestError
    beta = { messages: { stream: h.stream } }
    constructor(opts: unknown) { h.ctor(opts) }
  }
  return { default: Anthropic }
})
vi.mock('@/lib/tutor/server', () => h.server)
vi.mock('@/lib/auth/current', () => ({ getCurrentUser: h.user }))
vi.mock('@/lib/auth/rate-limit', () => ({ rateLimited: h.rateLimited }))
vi.mock('@/lib/db', () => ({ getDb: () => ({}) }))

import { POST } from './route'
import { resetDailyCounts } from '@/lib/tutor/limits'
import { REFUSAL_TEXT, REPLACE } from '@/lib/tutor/protocol'
import { TUTOR_SYSTEM } from '@/lib/tutor/prompt'
import { ROBI_PAGE_SYSTEM } from '@/lib/tutor/page-context'

const STEPS: LessonStep[] = [
  { kind: 'explain', body: 'Direnç akımı sınırlar.' },
  { kind: 'choice', prompt: 'Hangisi?', options: ['Kablo', 'Direnç'], answer: 1, why: 'GIZLI-NEDEN' },
]
const DEVICE = '0123456789abcdef0123456789abcdef'
const body = (over: Record<string, unknown> = {}) => ({
  lessonId: 5, stepIndex: 1, status: 'wrong', attempts: 1, answerSnapshot: 'Seçtiği: A) Kablo',
  messages: [{ role: 'user', content: 'İpucu ver' }], deviceId: DEVICE, ...over,
})
const req = (b: unknown, ip = '10.0.0.1') => new Request('http://localhost/api/tutor', {
  method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': ip }, body: JSON.stringify(b),
})

type Ev = { type: string; delta?: { type: string; text?: string } }
function fakeStream(texts: string[], final: Record<string, unknown> = {}, failAfter?: Error) {
  const events: Ev[] = [
    { type: 'message_start' },
    { type: 'content_block_delta', delta: { type: 'thinking_delta' } },
    ...texts.map((t) => ({ type: 'content_block_delta', delta: { type: 'text_delta', text: t } })),
    { type: 'message_stop' },
  ]
  return {
    async *[Symbol.asyncIterator]() {
      for (const [i, e] of events.entries()) {
        if (failAfter && i === events.length - 1) throw failAfter
        yield e
      }
    },
    finalMessage: async () => ({ stop_reason: 'end_turn', model: 'claude-opus-5-5', usage: { iterations: [] }, ...final }),
  }
}
const flush = () => new Promise((r) => setTimeout(r, 0))

beforeEach(() => {
  process.env.ANTHROPIC_API_KEY = 'test-key'
  delete process.env.TUTOR_EFFORT
  resetDailyCounts()
  h.stream.mockReset(); h.user.mockReset(); h.rateLimited.mockReset(); h.rateLimited.mockReturnValue(false)
  for (const f of Object.values(h.server)) f.mockReset()
  h.user.mockResolvedValue(null)
  h.server.loadTutorLesson.mockResolvedValue({ id: 5, title: 'İlk LED', moduleTitle: 'Arduino', minAge: 12, steps: STEPS })
  h.server.tutorGate.mockResolvedValue({ ok: true })
  h.server.countUserMessagesToday.mockResolvedValue(0)
  h.server.loadTutorUser.mockResolvedValue({ age: 8, locale: 'tr' })
  h.server.saveTutorExchange.mockResolvedValue(undefined)
})
afterEach(() => { delete process.env.ANTHROPIC_API_KEY })

describe('POST /api/tutor — arayüz dili', () => {
  const STEPS_EN: LessonStep[] = [
    { kind: 'explain', body: 'A resistor limits the current.' },
    { kind: 'choice', prompt: 'Which one?', options: ['Wire', 'Resistor'], answer: 1, why: 'SECRET-WHY' },
  ]
  it("istekteki locale 'en' hesabın dilinden önce gelir; İngilizce adımlar bağlam olur", async () => {
    h.user.mockResolvedValue({ id: 'u1' })
    h.server.loadTutorLesson.mockResolvedValue({ id: 5, title: 'İlk LED', moduleTitle: 'Arduino', minAge: 12, steps: STEPS, stepsEn: STEPS_EN })
    h.stream.mockReturnValue(fakeStream(['Which part limits current?']))
    expect((await POST(req(body({ locale: 'en' })))).status).toBe(200)
    const ctx = h.stream.mock.calls[0][0].system[1].text as string
    expect(ctx).toContain('DİL: en')
    expect(ctx).toContain('Which one?')
    expect(ctx).not.toContain('Hangisi?')
  })
  it('locale yoksa hesabın dili (tr) ve Türkçe adımlar', async () => {
    h.user.mockResolvedValue({ id: 'u1' })
    h.server.loadTutorLesson.mockResolvedValue({ id: 5, title: 'İlk LED', moduleTitle: 'Arduino', minAge: 12, steps: STEPS, stepsEn: STEPS_EN })
    h.stream.mockReturnValue(fakeStream(['Sence?']))
    expect((await POST(req(body()))).status).toBe(200)
    const ctx = h.stream.mock.calls[0][0].system[1].text as string
    expect(ctx).toContain('DİL: tr')
    expect(ctx).toContain('Hangisi?')
  })
})

describe('POST /api/tutor', () => {
  it('ANTHROPIC_API_KEY yoksa 503 tutor_disabled (çökmeden)', async () => {
    delete process.env.ANTHROPIC_API_KEY
    const res = await POST(req(body()))
    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ error: 'tutor_disabled' })
    expect(h.stream).not.toHaveBeenCalled()
  })

  it('geçersiz gövde 400, JSON değilse 415, cihaz kimliği yoksa 400', async () => {
    expect((await POST(req(body({ messages: [] })))).status).toBe(400)
    expect((await POST(new Request('http://localhost/api/tutor', { method: 'POST', body: 'x' }))).status).toBe(415)
    expect((await POST(req(body({ deviceId: undefined })))).status).toBe(400)
    expect((await POST(req(body({ stepIndex: 9 })))).status).toBe(400)
    h.server.loadTutorLesson.mockResolvedValueOnce(null)
    expect((await POST(req(body()))).status).toBe(404)
  })

  it('akışla düz metin döner, istemi doğru kurar ve kaydeder', async () => {
    h.stream.mockReturnValue(fakeStream(['Sence ', 'hangisi akımı ', 'sınırlar?']))
    const res = await POST(req(body()))
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('text/plain; charset=utf-8')
    expect(await res.text()).toBe('Sence hangisi akımı sınırlar?')

    const [params, opts] = h.stream.mock.calls[0]
    expect(params.model).toBe('claude-opus-5-5')
    expect(params.max_tokens).toBe(1024)
    expect(params.betas).toEqual(['server-side-fallback-2026-07-01'])
    expect(params.fallbacks).toBe('default') // ret yedeği varsayılan açık
    expect(params.output_config).toEqual({ effort: 'low' })
    expect(params).not.toHaveProperty('thinking')
    expect(params.system[0]).toEqual({ type: 'text', text: TUTOR_SYSTEM, cache_control: { type: 'ephemeral' } })
    expect(params.system[1].cache_control).toBeUndefined()
    expect(params.system[1].text).toContain('Seçtiği: A) Kablo')
    expect(params.system[1].text).not.toContain('GIZLI-NEDEN') // 1 deneme: cevap kilitli
    expect(params.messages).toEqual([{ role: 'user', content: 'İpucu ver' }])
    expect(opts.signal).toBeInstanceOf(AbortSignal)

    await flush()
    expect(h.server.saveTutorExchange).toHaveBeenCalledWith({}, expect.objectContaining({
      userId: null, deviceId: DEVICE, lessonId: 5, question: 'İpucu ver', answer: 'Sence hangisi akımı sınırlar?', flag: null,
    }))
  })

  it('TUTOR_EFFORT ve kullanıcı yaşı', async () => {
    process.env.TUTOR_EFFORT = 'medium'
    h.user.mockResolvedValue({ id: 'u1', email: null, name: 'Ada', role: 'student' })
    h.stream.mockReturnValue(fakeStream(['Tamam']))
    await (await POST(req(body({ deviceId: undefined })))).text()
    const [params] = h.stream.mock.calls[0]
    expect(params.output_config).toEqual({ effort: 'medium' })
    expect(params.system[1].text).toContain('KISA') // 8 yaş
    await flush()
    expect(h.server.saveTutorExchange.mock.calls[0][1]).toMatchObject({ userId: 'u1', deviceId: null })
  })

  it('ret: stop_reason refusal → ayırıcı + nazik mesaj, iki satır "refusal" işaretli', async () => {
    h.stream.mockReturnValue(fakeStream(['Kısmi'], { stop_reason: 'refusal', stop_details: { category: 'cyber' } }))
    const res = await POST(req(body()))
    const text = await res.text()
    expect(text).toBe(`Kısmi${REPLACE}${REFUSAL_TEXT}`)
    await flush()
    expect(h.server.saveTutorExchange.mock.calls[0][1].flag).toBe('refusal')
  })

  it('erken SDK hatası HTTP durumuna çevrilir ve kota iade edilir', async () => {
    h.stream.mockImplementation(() => { throw new h.errors.RateLimitError(429, 'rate') })
    const res = await POST(req(body()))
    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ error: 'tutor_busy' })
    h.stream.mockImplementation(() => { throw new h.errors.AuthenticationError(401, 'auth') })
    expect(await (await POST(req(body()))).json()).toEqual({ error: 'tutor_disabled' })
    expect(h.server.saveTutorExchange).not.toHaveBeenCalled()
  })

  it('akış ortasında hata: ayırıcı + hata metni, "error" işareti', async () => {
    h.stream.mockReturnValue(fakeStream(['Yarım'], {}, new h.errors.APIError(500, 'boom')))
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const text = await (await POST(req(body()))).text()
    expect(text.startsWith(`Yarım${REPLACE}`)).toBe(true)
    await flush()
    expect(h.server.saveTutorExchange.mock.calls[0][1].flag).toBe('error')
    err.mockRestore()
  })

  it('misafir günde 15 mesaj; kullanıcıda DB sayımı esas', async () => {
    h.stream.mockImplementation(() => fakeStream(['ok']))
    for (let i = 0; i < 15; i++) expect((await POST(req(body()))).status).toBe(200)
    const res = await POST(req(body()))
    expect(res.status).toBe(429)
    expect(await res.json()).toEqual({ error: 'daily_limit', limit: 15 })

    h.user.mockResolvedValue({ id: 'u2', email: null, name: 'B', role: 'student' })
    h.server.countUserMessagesToday.mockResolvedValue(60)
    expect((await POST(req(body({ deviceId: undefined })))).status).toBe(429)
  })

  it('dakika sınırı 429; kurum kapattıysa 403', async () => {
    h.rateLimited.mockReturnValueOnce(true)
    expect((await POST(req(body()))).status).toBe(429)
    h.server.tutorGate.mockResolvedValueOnce({ ok: false, reason: 'org_disabled' })
    const res = await POST(req(body()))
    expect(res.status).toBe(403)
    expect(await res.json()).toEqual({ error: 'tutor_not_allowed', reason: 'org_disabled' })
  })
})

describe('POST /api/tutor — her sayfada Robi', () => {
  it('sayfa bağlamı sunucuda yüklenir, sayfa istemiyle akar ve ders kimliğiyle kaydedilir', async () => {
    h.user.mockResolvedValue({ id: 'u1' })
    h.server.loadPageSource.mockResolvedValue({ kind: 'lesson', lessonId: 9, title: 'Klasik LED', moduleTitle: 'Arduino', weekTitle: 'Işık', minAge: 10, question: 'Neden?' })
    h.stream.mockReturnValue(fakeStream(['Sence ', 'ne olur?']))
    const r = await POST(req({ page: '/ders/9', messages: [{ role: 'user', content: 'Basitçe anlat' }] }))
    expect(r.status).toBe(200)
    expect(await r.text()).toBe('Sence ne olur?')
    expect(h.server.loadPageSource).toHaveBeenCalledWith({}, '/ders/9', true)
    expect(h.server.loadTutorLesson).not.toHaveBeenCalled()
    const params = h.stream.mock.calls[0][0]
    expect(params.system[0].text).toBe(ROBI_PAGE_SYSTEM)
    expect(params.system[1].text).toContain('Klasik LED')
    await flush()
    expect(h.server.saveTutorExchange).toHaveBeenCalledWith({}, expect.objectContaining({ lessonId: 9, userId: 'u1' }))
  })
  it('genel sayfada ders kimliği null', async () => {
    h.user.mockResolvedValue({ id: 'u1' })
    h.server.loadPageSource.mockResolvedValue({ kind: 'section', key: 'lab' })
    h.stream.mockReturnValue(fakeStream(['Devre kur!']))
    const r = await POST(req({ page: '/laboratuvar', messages: [{ role: 'user', content: 'Burada ne yapabilirim?' }] }))
    await r.text(); await flush()
    expect(h.stream.mock.calls[0][0].system[1].text).toContain('laboratuvar')
    expect(h.server.saveTutorExchange).toHaveBeenCalledWith({}, expect.objectContaining({ lessonId: null }))
  })
})
