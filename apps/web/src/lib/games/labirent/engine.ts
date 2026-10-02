// Labirent motoru: saf mantık (DOM yok). Harita metinle tanımlanır: '#' çalı/duvar, '.' yol, 'S' başlangıç, 'G' hedef.
import { HaltProgram, type RunApi } from '../interpreter'
import type { GameRun, LevelDef, RunOutcome } from '../types'

/** Yönler saat yönünde: 0 kuzey (yukarı), 1 doğu, 2 güney, 3 batı. */
export type Dir = 0 | 1 | 2 | 3
export const DX = [0, 1, 0, -1] as const
export const DY = [-1, 0, 1, 0] as const
export type Rel = 'AHEAD' | 'LEFT' | 'RIGHT'

export interface MazeData {
  /** Satırlar (hepsi aynı uzunlukta). */
  grid: string[]
  /** Başlangıçtaki bakış yönü. */
  dir: Dir
}

export interface MazeState {
  x: number
  y: number
  /** Birikimli açı (derece, kuzey = 0, saat yönü +). Dönüş animasyonunun hep kısa yoldan olması için sınırsızdır. */
  angle: number
  /** Duvara çarptı mı? */
  crashed: boolean
  /** Hedefte mi? */
  atGoal: boolean
  /** Gidilen karelerin sırası (ayak izi). */
  trail: Array<[number, number]>
  /** Yapılan toplam hareket sayısı. */
  moves: number
}

export const dataOf = (level: LevelDef): MazeData => level.data as MazeData

export function findCell(grid: string[], ch: string): [number, number] {
  for (let y = 0; y < grid.length; y++) {
    const x = grid[y].indexOf(ch)
    if (x >= 0) return [x, y]
  }
  throw new Error(`Haritada '${ch}' yok`)
}

export const isOpen = (grid: string[], x: number, y: number): boolean => {
  const c = grid[y]?.[x]
  return c !== undefined && c !== '#'
}

export const dirOf = (angle: number): Dir => ((((Math.round(angle / 90) % 4) + 4) % 4) as Dir)

/** Bakış yönüne göre bir yön: önde, solda, sağda. */
export function relDir(d: Dir, rel: Rel): Dir {
  return ((d + (rel === 'AHEAD' ? 0 : rel === 'LEFT' ? 3 : 1)) % 4) as Dir
}

export function pathExists(data: MazeData, st: Pick<MazeState, 'x' | 'y' | 'angle'>, rel: Rel): boolean {
  const d = relDir(dirOf(st.angle), rel)
  return isOpen(data.grid, st.x + DX[d], st.y + DY[d])
}

/** Döngüde gövde hiç hareket etmiyorsa sonsuz beklemeyi önleyen üst sınır. */
const IDLE_LIMIT = 2000

export function createMazeRun(level: LevelDef): GameRun<MazeState> {
  const data = dataOf(level)
  const [sx, sy] = findCell(data.grid, 'S')
  const [gx, gy] = findCell(data.grid, 'G')
  const st: MazeState = { x: sx, y: sy, angle: data.dir * 90, crashed: false, atGoal: false, trail: [[sx, sy]], moves: 0 }

  const api: RunApi = {
    hats: ['labirent_basla'],
    blocks: {
      labirent_ileri: () => {
        const d = dirOf(st.angle)
        const nx = st.x + DX[d], ny = st.y + DY[d]
        if (!isOpen(data.grid, nx, ny)) {
          st.crashed = true
          throw new HaltProgram('Duvara çarptın!')
        }
        st.x = nx; st.y = ny; st.moves++
        st.trail.push([nx, ny])
        if (nx === gx && ny === gy) { st.atGoal = true; throw new HaltProgram('Hedefe vardın!') }
      },
      labirent_sol: () => { st.angle -= 90 },
      labirent_sag: () => { st.angle += 90 },
      labirent_hedefe_kadar: function* (c) {
        let idle = 0
        while (!st.atGoal) {
          const before = `${st.x},${st.y},${st.angle}`
          yield* c.statements('DO')
          idle = before === `${st.x},${st.y},${st.angle}` ? idle + 1 : 0
          if (idle > IDLE_LIMIT) throw new HaltProgram('Döngünün içi boş görünüyor.')
        }
      },
      labirent_eger: function* (c) {
        if (pathExists(data, st, c.field('DIR') as Rel)) yield* c.statements('DO')
      },
      labirent_eger_degilse: function* (c) {
        if (pathExists(data, st, c.field('DIR') as Rel)) yield* c.statements('DO')
        else yield* c.statements('ELSE')
      },
    },
  }

  return {
    api,
    snapshot: () => ({ ...st, trail: st.trail.map((p) => [p[0], p[1]] as [number, number]) }),
    evaluate(result): RunOutcome {
      if (st.atGoal) return { ok: true, message: 'Hedefe ulaştın!' }
      if (st.crashed) return { ok: false, message: 'Duvara çarptın! Yolu bloklarla dikkatle planla.' }
      if (result.reason === 'limit') return { ok: false, message: 'Yolcu hedefe varamadan dönüp duruyor. Programında takıldığı bir yer var.' }
      if (result.reason === 'error') return { ok: false, message: result.message || 'Programda bir sorun var.' }
      return { ok: false, message: 'Yolcu durdu ama hedefe varamadı. Biraz daha ilerlemesi gerek.' }
    },
  }
}
