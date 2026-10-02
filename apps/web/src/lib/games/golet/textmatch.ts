// JavaScript kipi: oyuncunun yazdığı kodu derler ve tüm maçı çalıştırır (hiçbir şeye bağımlı değil; Node'da test edilir, tarayıcıda Web Worker içinde koşar).
// Kod her tikte BAŞTAN çalışır. Tikler arası bilgi `hafiza` nesnesinde tutulur. Komutlar: swim, cannon, scan, health, getX, getY, speed.
import { CONTROLLERS } from './ai'
import { advance, createWorld, settle, snapshot, type DuckApi, type PlayerController, type PondData, type PondFrame } from './sim'

export const API_NAMES = ['swim', 'cannon', 'scan', 'health', 'getX', 'getY', 'speed'] as const

export type Compiled = { ok: true; controller: PlayerController } | { ok: false; error: string }

/** Kodu derler. Yazım hatası `ok:false` olarak döner; çalışma hatası maç sırasında yakalanır. */
export function compilePlayerCode(code: string): Compiled {
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function(...API_NAMES, 'hafiza', `"use strict";\n${code}`) as (...a: unknown[]) => void
    const controller: PlayerController = (api: DuckApi, mem) => {
      fn(api.swim, api.cannon, api.scan, api.health, api.getX, api.getY, api.speed, mem)
    }
    return { ok: true, controller }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export interface MatchResult {
  frames: PondFrame[]
  won: boolean
  reason: PondFrame['reason']
  ticks: number
  error?: string
}

export function runTextMatch(code: string, data: PondData, seed = 1): MatchResult {
  const compiled = compilePlayerCode(code)
  const world = createWorld(data, { seed, record: true, controllers: CONTROLLERS })
  if (!compiled.ok) {
    world.over = true; world.reason = 'error'; world.error = `Kodda yazım hatası: ${compiled.error}`
    world.frames!.push(snapshot(world))
    return { frames: world.frames!, won: false, reason: 'error', ticks: 0, error: world.error }
  }
  world.ducks[0].controller = compiled.controller
  while (!world.over) advance(world)
  if (world.error) world.error = `Kodun ${world.tick + 1}. tikte hata verdi: ${world.error}`
  else settle(world)
  const frames = world.frames!
  const last = frames[frames.length - 1]
  const won = world.ducks[0].alive && world.ducks.slice(1).every((d) => !d.alive)
  return { frames, won, reason: last.reason, ticks: world.tick, ...(world.error ? { error: world.error } : {}) }
}
