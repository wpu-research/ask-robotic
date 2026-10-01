import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { compileSketch } from '@/lib/compile/compile'
import { FREE_STARTERS, freeScenes } from './free'
import { createArenaRuntime } from './runtime'
import type { RoverSnapshot } from './types'

const hasCli = (() => { try { execFileSync(process.env.ARDUINO_CLI ?? 'arduino-cli', ['version'], { stdio: 'ignore' }); return true } catch { return false } })()

describe('serbest mod sahneleri', () => {
  const scenes = freeScenes()
  it('her sahnenin örnek kodu vardır ve sahne kimlikleri benzersizdir', () => {
    expect(new Set(scenes.map((s) => s.id)).size).toBe(scenes.length)
    for (const s of scenes) expect(FREE_STARTERS[s.id], s.id).toBeTruthy()
  })
  for (const s of scenes) {
    it.skipIf(!hasCli)(`${s.id}: örnek kod derlenir ve sahnede çalışır`, async () => {
      const r = await compileSketch(FREE_STARTERS[s.id])
      if (!r.ok) throw new Error(JSON.stringify(r))
      const rt = createArenaRuntime(r.hex, s)
      for (let t = 0; t < (s.timeLimitS ?? 30) * 1000 && (rt.snapshot() as RoverSnapshot).finishedAtS === null; t += 100) rt.advance(100)
      const sn = rt.snapshot() as RoverSnapshot
      console.log(s.id, 't=', sn.timeS.toFixed(1), 'fin=', sn.finishedAtS, 'dist=', sn.distanceM.toFixed(2), 'coll=', sn.collisions, 'exits=', sn.lineExits, 'visited=', [...sn.visited].join(','), 'pos=', sn.x.toFixed(2), sn.y.toFixed(2))
      expect(sn.distanceM).toBeGreaterThan(0.5)
    }, 90_000)
  }
})
