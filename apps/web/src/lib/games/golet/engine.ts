// Blok kipi motoru: `createRun`. Her eylem bloğu dünyayı bir tik ilerletir; sahne her tikte `snapshot()` alır.
import { HaltProgram } from '../interpreter'
import type { GameRun, LevelDef } from '../types'
import { CONTROLLERS } from './ai'
import { saveRecording } from './recording'
import { advance, apiFor, createWorld, settle, snapshot, type PondData, type PondFrame } from './sim'

export const MATCH_OVER = 'Maç bitti.'

export function outcomeMessage(frame: PondFrame, won: boolean, en = false): string {
  if (won) return frame.tick < 200 ? (en ? 'You beat the rivals fast!' : 'Rakipleri hızla yendin!') : (en ? 'You won the match!' : 'Maçı kazandın!')
  const me = frame.ducks[0]
  if (!me.alive) return en ? 'Your duck was beaten. Try moving and dodging.' : 'Ördeğin yenildi. Hareket etmeyi ve kaçmayı dene.'
  const left = frame.ducks.slice(1).filter((d) => d.alive).length
  if (frame.reason === 'timeout') return en ? `Time's up, ${left} rival(s) still swimming. You need more hits.` : `Süre doldu, ${left} rakip hâlâ yüzüyor. Daha çok isabet gerek.`
  if (en) return left === 1 ? 'One rival is still swimming. Your program may have ended too early.' : `${left} rivals are still swimming. Your program may have ended too early.`
  return left === 1 ? 'Bir rakip hâlâ yüzüyor. Programın erken bitmiş olabilir.' : `${left} rakip hâlâ yüzüyor. Programın erken bitmiş olabilir.`
}

export function createRun(level: LevelDef, opts: { seed?: number } = {}): GameRun<PondFrame> {
  const data = level.data as PondData
  const world = createWorld(data, { seed: opts.seed, record: true, controllers: CONTROLLERS })
  const me = world.ducks[0]
  const api = apiFor(world, me)
  const live = () => { if (world.over) throw new HaltProgram(MATCH_OVER) }
  const act = () => { live(); advance(world) }
  saveRecording(world.recId, world.frames!)
  return {
    api: {
      blocks: {
        golet_yuz: (c) => { api.swim(c.num('DIR'), c.num('SPEED', 50)); act() },
        golet_ates: (c) => { api.cannon(c.num('DIR'), c.num('RANGE')); act() },
                golet_surekli: function* (c) {
          for (;;) {
            live()
            const t0 = world.tick
            yield* c.statements('DO')
            if (world.tick === t0) advance(world) // turda hiç eylem yoksa ördek bir tik bekler (sonsuz döngü donmasın)
          }
        },
        golet_tara: (c) => { const d = api.scan(c.num('DIR'), 5); return Number.isFinite(d) ? Math.round(d * 10) / 10 : 999 },
        golet_can: () => api.health(),
        golet_x: () => api.getX(),
        golet_y: () => api.getY(),
        golet_hiz: () => api.speed(),
      },
    },
    snapshot: () => snapshot(world),
    evaluate: () => {
      settle(world)
      const won = me.alive && world.ducks.slice(1).every((d) => !d.alive)
      const f = snapshot(world)
      return won ? { ok: true, message: outcomeMessage(f, true), messageEn: outcomeMessage(f, true, true) } : { ok: false, message: outcomeMessage(f, false), messageEn: outcomeMessage(f, false, true) }
    },
  }
}
