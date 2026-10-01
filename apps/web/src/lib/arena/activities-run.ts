// YALNIZ TEST: bir haftanın etkinliklerini derleyip çalıştıran ortak test gövdesi.
import { describe, expect, it } from 'vitest'
import { compileSketch } from '@/lib/compile/compile'
import { allArenaActivities } from './activity'
import { runHeadless } from './headless'
import { hasCli, solutionOf } from './test-support'

export function describeWeekRuns(week: number): void {
  const entries = allArenaActivities().filter(([k]) => k.startsWith(`robotik:${week}:`))
  describe(`arena etkinlikleri: hafta ${week} koşuları`, () => {
    it('bu haftanın etkinlikleri kayıtlıdır', () => { expect(entries.length).toBeGreaterThan(0) })
    for (const [k, a] of entries) {
      describe(k, () => {
        it.skipIf(!hasCli)('starter derlenir ve çalışınca tüm hedefler sağlanmaz', async () => {
          const code = a.starter()
          const r = await compileSketch(code)
          if (!r.ok) throw new Error('starter derlenmedi: ' + JSON.stringify(r))
          const out = runHeadless({ ...a, scenario: undefined, runSeconds: 6 }, r.hex, code)
          expect(out.results.every((x) => x.done)).toBe(false)
        }, 120_000)
        it.skipIf(!hasCli)('çözüm derlenir ve çalışınca tüm hedefler sağlanır', async () => {
          const code = solutionOf(k, a)
          const r = await compileSketch(code)
          if (!r.ok) throw new Error('çözüm derlenmedi: ' + JSON.stringify(r))
          const out = runHeadless(a, r.hex, code)
          expect(out.results.filter((x) => !x.done).map((x) => x.id)).toEqual([])
        }, 300_000)
      })
    }
  })
}
