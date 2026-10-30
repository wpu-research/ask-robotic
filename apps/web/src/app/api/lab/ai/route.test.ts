import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = { user: null as null | { id: string }, enabled: true, text: '' }
vi.mock('@/lib/auth/current', () => ({ getCurrentUser: async () => state.user }))
vi.mock('@/lib/lab/ai-llm', () => ({
  labAiEnabled: () => state.enabled,
  complete: async () => state.text,
  LabAiError: class extends Error { constructor(public status: number, m: string) { super(m) } },
}))

import { resetDailyCounts } from '@/lib/tutor/limits'
import { POST } from './route'

const good = JSON.stringify({
  parts: [{ id: 'uno', type: 'uno' }, { id: 'r1', type: 'resistor' }, { id: 'led1', type: 'led' }],
  wires: [{ a: 'uno.D13', b: 'r1.1' }, { a: 'r1.2', b: 'led1.A' }, { a: 'led1.K', b: 'uno.GND' }], code: 'void setup(){}void loop(){}',
})
const req = (body: unknown) => new Request('http://x/api/lab/ai', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })

describe('POST /api/lab/ai', () => {
  beforeEach(() => { state.user = { id: 'u-' + Math.random() }; state.enabled = true; state.text = good; resetDailyCounts() })

  it('misafir 401 alır', async () => {
    state.user = null
    expect((await POST(req({ prompt: 'LED yak' }))).status).toBe(401)
  })
  it('üyeye doğrulanmış devre döner', async () => {
    const r = await POST(req({ prompt: 'LED yak', locale: 'tr' }))
    expect(r.status).toBe(200)
    const j = await r.json()
    expect(j.circuit.parts).toHaveLength(3)
    expect(j.circuit.wires).toHaveLength(3)
    expect(j.remaining).toBe(19)
  })
  it('kapalıyken 503, boş ya da uzun istek 400, geçersiz LLM çıktısı 502 ve hak iade', async () => {
    state.enabled = false
    expect((await POST(req({ prompt: 'x' }))).status).toBe(503)
    state.enabled = true
    expect((await POST(req({ prompt: '' }))).status).toBe(400)
    expect((await POST(req({ prompt: 'a'.repeat(501) }))).status).toBe(400)
    state.text = 'çöp'
    const bad = await POST(req({ prompt: 'LED yak' }))
    expect(bad.status).toBe(502)
    state.text = good
    expect((await (await POST(req({ prompt: 'LED yak' }))).json()).remaining).toBe(19) // başarısız istek hak yemedi
  })
  it('günlük kota dolunca 429', async () => {
    process.env.LAB_AI_DAILY = '2'
    try {
      state.user = { id: 'kota-kullanicisi' }
      expect((await POST(req({ prompt: 'bir' }))).status).toBe(200)
      expect((await POST(req({ prompt: 'iki' }))).status).toBe(200)
      expect((await POST(req({ prompt: 'üç' }))).status).toBe(429)
    } finally { delete process.env.LAB_AI_DAILY }
  })
})
