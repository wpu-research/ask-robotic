// Gölet Eğitmeni: ördeğini bloklarla yüzdür, tara, top at. 10 seviye: hareket → ateş → tarama → döngü → düello.
import { HaltProgram, type BlockCtx, type StepInfo } from '../interpreter'
import type { GameDef, GameRun, LevelDef } from '../types'
import { pondtutorBlocks } from './blocks'
import { pondtutorLevels } from './levels'
import { createWorld, playerFire, playerScan, playerSwim, tick, WORLD_MESSAGE_EN, type PondLevelData, type World } from './world'

export type PondTutorState = World

/** Alan (sayı kutusu) varsa onu, yoksa değer girişini okur. */
const fnum = (c: BlockCtx, name: string, def: number): number => {
  const f = c.field(name)
  return f !== undefined && f !== null && f !== '' ? Number(f) || 0 : c.num(name, def)
}

function createRun(level: LevelDef, opts?: { seed?: number }): GameRun<PondTutorState> {
  const w = createWorld(level.data as PondLevelData, opts?.seed ?? 1)
  const advance = () => {
    tick(w)
    if (w.status !== 'playing') throw new HaltProgram(w.message)
  }
  const info = (id: string | null, type: string): StepInfo => ({ blockId: id, type, wait: true, step: 0 })
  return {
    api: {
      blocks: {
        pt_swim: (c) => { playerSwim(w, fnum(c, 'DIR', 0), fnum(c, 'SPEED', 100)); advance() },
        pt_swim_e: (c) => { playerSwim(w, fnum(c, 'DIR', 0), fnum(c, 'SPEED', 100)); advance() },
        pt_stop: () => { playerSwim(w, w.player.heading, 0); advance() },
        pt_wait: function* (c) {
          const n = Math.min(300, Math.max(0, Math.floor(fnum(c, 'N', 1))))
          for (let i = 1; i < n; i++) { advance(); yield info(c.id, c.type) }
          if (n > 0) advance()
        },
        pt_cannon: (c) => { playerFire(w, fnum(c, 'DEG', 0), fnum(c, 'RANGE', 0)); advance() },
        pt_cannon_e: (c) => { playerFire(w, fnum(c, 'DEG', 0), fnum(c, 'RANGE', 0)); advance() },
        pt_scan: (c) => playerScan(w, c.num('DEG')),
        pt_x: () => Math.round(w.player.x),
        pt_y: () => Math.round(w.player.y),
        pt_health: () => Math.round(w.player.health),
      },
    },
    snapshot: () => structuredClone(w),
    evaluate: (result) => {
      if (w.status === 'won') return { ok: true, message: w.message, messageEn: WORLD_MESSAGE_EN[w.message] }
      if (w.status !== 'playing') return { ok: false, message: w.message, messageEn: WORLD_MESSAGE_EN[w.message] }
      if (result.reason === 'stopped') return { ok: false }
      if (w.goal === 'reach') return { ok: false, message: 'Ördek yaprağa varamadı. Yönü ya da bekleme süresini değiştir.', messageEn: "The duck didn't reach the leaf. Change the direction or the waiting time." }
      const e = w.enemy
      const alive = !!e && e.health > 0
      return {
        ok: false,
        message: alive ? `Rakip hâlâ ayakta (can ${Math.ceil(e.health)}). Daha çok ateş etmen gerek.` : 'Hedefe ulaşılamadı.',
        messageEn: alive ? `The rival is still afloat (health ${Math.ceil(e.health)}). You need to fire more.` : 'The goal was not reached.',
      }
    },
  }
}

export const pondtutorGame: GameDef<PondTutorState> = {
  slug: 'golet-egitmeni',
  title: 'Gölet Eğitmeni',
  tagline: "Gölet'e hazırlan: ördeğini yönlendirmeyi adım adım öğren.",
  en: { title: 'Pond Tutor', tagline: 'Get ready for Pond: learn to steer your duck step by step.' },
  levels: pondtutorLevels,
  blocks: pondtutorBlocks,
  engine: { createRun },
  scene: () => import('@/components/games/pondtutor/scene'),
  stepDelay: 90,
  speed: { min: 0.5, max: 4, default: 1 },
  stageAspect: '1 / 1',
  maxSteps: 20000,
}
