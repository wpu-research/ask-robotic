// Hafta 4-6 etkinlikleri için genel etkinlik testi (activities.test.ts ile aynı denetimler; kayıt dosyasına dokunmadan).
import { describe, expect, it } from 'vitest'
import { disallowedTypes, evaluateActivity } from '../activity'
import { toJavaScript, toPython } from '../codegen'
import { parseProject, exportProject } from '../storage'
import { MIKRO_KART_H456 } from './h456'

describe('hafta 4-6 kayıt', () => {
  it('15 etkinlik, anahtarlar mikro-kart:<hafta>:<ders>', () => {
    const keys = Object.keys(MIKRO_KART_H456)
    expect(keys).toHaveLength(15)
    for (const w of [4, 5, 6]) for (let d = 1; d <= 5; d++) expect(keys).toContain(`mikro-kart:${w}:${d}`)
  })
})

describe.each(Object.entries(MIKRO_KART_H456))('etkinlik %s', (_key, act) => {
  it('metinler ve hedefler dolu, kimlikler benzersiz', () => {
    expect(act.goals.length).toBeGreaterThan(0)
    expect(new Set(act.goals.map((g) => g.id)).size).toBe(act.goals.length)
    for (const g of act.goals) expect(g.text.trim().length).toBeGreaterThan(5)
    expect(act.intro?.length ?? 0).toBeGreaterThan(20)
  })
  it('starter() her çağrıda taze nesne verir; JSON gidiş-dönüş', () => {
    const a = act.starter(), c = act.starter()
    expect(a).not.toBe(c)
    expect(a.workspace).not.toBe(c.workspace)
    expect(parseProject(exportProject(a)).ok).toBe(true)
    expect(parseProject(exportProject(act.solution())).ok).toBe(true)
  })
  it('starter hedefleri sağlamaz', () => {
    const r = evaluateActivity(act, act.starter())
    expect(r.done).toBe(false)
    expect(r.error).toBeNull()
    for (const s of r.status) {
      const goal = act.goals.find((g) => g.id === s.id)!
      if (goal.sticky !== false) expect(s.done, `starter ${s.id} hedefini sağlıyor`).toBe(false)
    }
  })
  it('solution tüm hedefleri sağlar, hata vermez', () => {
    const r = evaluateActivity(act, act.solution())
    expect(r.error).toBeNull()
    expect(r.status.filter((s) => !s.done).map((s) => s.id)).toEqual([])
    expect(r.done).toBe(true)
  })
  it('çözüm yalnız izinli blokları kullanır; starter de', () => {
    expect(disallowedTypes(act, act.solution())).toEqual([])
    expect(disallowedTypes(act, act.starter())).toEqual([])
  })
  it('çözümün JavaScript ve Python karşılığı üretilir', () => {
    expect(toJavaScript(act.solution().workspace)).toMatch(/card\.(on|forever|every)/)
    expect(toPython(act.solution().workspace)).toMatch(/card\.(on_|forever|every)/)
  })
})
