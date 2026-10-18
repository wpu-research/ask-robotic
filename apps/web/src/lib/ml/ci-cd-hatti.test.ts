// Ders: CI/CD hattı. Hatalı commit hiçbir tohumda üretime (%100) ulaşmaz; canary hatası geri almayı tetikler.
import { describe, expect, it } from 'vitest'
import { CI_CD_HATTI, pipeline, THRESH } from './ci-cd-hatti'

describe('ci-cd-hatti', () => {
  it('kareler: sayı > 3, satırlar kod içinde', () => {
    const F = CI_CD_HATTI.run({ hata: 0.3, seed: 2 })
    expect(F.length).toBeGreaterThan(60)
    for (const f of F) expect(f.line).toBeLessThan(CI_CD_HATTI.code.length)
  })
  it('50 tohum × 3 hata oranı: üretime çıkan her sürüm hatasız', () => {
    let shipped = 0, stopped = 0
    for (const h of [0.3, 0.6, 0.8]) for (let s = 1; s <= 50; s++) for (const c of pipeline(h, s)) {
      if (c.stopAt === 6) { expect(c.bug).toBe('yok'); shipped++ }
      if (c.stopAt <= 4) { expect(c.bug).not.toBe('yok'); stopped++ }
    }
    console.log('üretime çıkan', shipped, 'testte duran', stopped)
    expect(shipped).toBeGreaterThan(500)
    expect(stopped).toBeGreaterThan(500)
  })
  it('canary: testlerden kaçan her hatalı sürüm eşiği aşar ve geri alınır', () => {
    let rolled = 0
    for (let s = 1; s <= 50; s++) for (const c of pipeline(0.3, s)) {
      if (c.stopAt >= 5 && c.bug !== 'yok') { expect(c.rate!).toBeGreaterThan(THRESH); expect(c.stopAt).toBe(5); rolled++ }
    }
    expect(rolled).toBeGreaterThan(5)
    const F = CI_CD_HATTI.run({ hata: 0.3, seed: 2 })
    const rb = F.filter((f) => f.rolledBack)
    expect(rb.length).toBe(1)
    expect(rb[0].rollout).toBe(10)
    expect(F.at(-1)!.cap[0]).toBe('üretimdeki hatalı sürüm: 0')
  })
})
