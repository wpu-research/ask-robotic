import { describe, expect, it } from 'vitest'
import { submitDesignRun } from './tasarim-server'
import { DESIGN_CHALLENGES } from './mikro/tasarim-gorevleri'
import { exportDesign } from './mikro/tasarim'

describe('tasarım yarışması sunucu puanı', () => {
  it('JSON üstünden gelen tasarım + program sunucuda yeniden puanlanır (girişsiz: kaydedilmez)', async () => {
    const ch = DESIGN_CHALLENGES.find((c) => c.id === 'tek-motor-park')!
    const s = ch.sample()
    const body = JSON.parse(JSON.stringify({ design: JSON.parse(exportDesign(s.design)), project: s.project }))
    const r = await submitDesignRun(null, null, ch.id, body.design, body.project)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.saved).toBe(false)
    expect(r.score).toBeGreaterThanOrEqual(60)
  })
  it('bilinmeyen yarışma, bozuk tasarım ve bozuk program reddedilir', async () => {
    const s = DESIGN_CHALLENGES[0].sample()
    expect((await submitDesignRun(null, null, 'yok', s.design, s.project)).ok).toBe(false)
    expect((await submitDesignRun(null, null, DESIGN_CHALLENGES[0].id, { chassis: 'dev', parts: [] }, s.project)).ok).toBe(false)
    expect((await submitDesignRun(null, null, DESIGN_CHALLENGES[0].id, s.design, { version: 9 })).ok).toBe(false)
  })
})
