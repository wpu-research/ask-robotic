import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildNvidiaBody, NVIDIA_MODEL_DEFAULT, streamNvidia } from './nvidia'
import { tutorEnabled, tutorErrorInfo } from './claude'

afterEach(() => { delete process.env.NVIDIA_API_KEY; delete process.env.NVIDIA_MODEL; delete process.env.ANTHROPIC_API_KEY; vi.unstubAllGlobals() })

const sse = (lines: string[]) => new Response(new ReadableStream({
  start(c) { const e = new TextEncoder(); for (const l of lines) c.enqueue(e.encode(l)); c.close() },
}), { headers: { 'content-type': 'text/event-stream' } })

describe('NVIDIA yedek sağlayıcı', () => {
  it('anahtar varsa Mac açık; gövde sistem + bağlamı tek sistem mesajında taşır', () => {
    expect(tutorEnabled()).toBe(false)
    process.env.NVIDIA_API_KEY = 'nv'
    expect(tutorEnabled()).toBe(true)
    const b = buildNvidiaBody('SİSTEM', '<ders_baglami>', [{ role: 'user', content: 'Soru' }])
    expect(b.model).toBe(NVIDIA_MODEL_DEFAULT)
    expect(b.messages[0]).toEqual({ role: 'system', content: 'SİSTEM\n\n<ders_baglami>' })
    expect(b.messages[1]).toEqual({ role: 'user', content: 'Soru' })
    expect(b.stream).toBe(true)
  })
  it('SSE akışı metin parçalarını verir (parçalı satırlar, akıl yürütme atlanır)', async () => {
    process.env.NVIDIA_API_KEY = 'nv'
    vi.stubGlobal('fetch', vi.fn(async () => sse([
      'data: {"model":"m","choices":[{"delta":{"reasoning_content":"düşün"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"Mer"}}]}\n\ndata: {"choices":[{"del',
      'ta":{"content":"haba"},"finish_reason":"stop"}]}\n\n',
      'data: [DONE]\n\n',
    ])))
    const gen = streamNvidia('s', 'c', [{ role: 'user', content: 'q' }])
    let out = ''
    let r = await gen.next()
    while (!r.done) { out += r.value; r = await gen.next() }
    expect(out).toBe('Merhaba')
    expect(r.value).toEqual({ stopReason: 'end_turn', model: 'm', fallback: false })
  })
  it('HTTP hataları Mac hata kodlarına çevrilir', async () => {
    process.env.NVIDIA_API_KEY = 'nv'
    for (const [status, code] of [[401, 'tutor_disabled'], [429, 'tutor_busy'], [500, 'tutor_unavailable']] as const) {
      vi.stubGlobal('fetch', vi.fn(async () => new Response('x', { status })))
      const err = await streamNvidia('s', 'c', [{ role: 'user', content: 'q' }]).next().catch((e) => e)
      expect(tutorErrorInfo(err).error).toBe(code)
    }
  })
})
