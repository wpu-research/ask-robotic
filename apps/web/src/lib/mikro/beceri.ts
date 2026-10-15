// Sanal Beceri: süreli, puanlı robot sahaları. Puan, programın belirli tohumla (seed 1) başsız çalıştırılmasıyla hesaplanır;
// sunucu gönderilen programı aynı işlevle yeniden çalıştırır, istemcinin bildirdiği puana güvenilmez.
import { rectWalls } from '../arena/geometry'
import { b, onStart, project } from './program'
import { colorIs, motors, move, stopMotors, turn } from './robot-missions'
import type { DriveBase, RobotProfileId, RobotScene } from './robot'
import { Simulation } from './sim'
import type { MikroProject, PBlock } from './types'


export interface ScorePart { label: string; points: number }
export interface SkillChallenge {
  id: string
  title: string
  profile: RobotProfileId
  summary: string
  rules: string[]
  timeLimitS: number
  scene(): RobotScene
  /** Bitiş koşulu (sağlandığı ilk an kaydedilir). */
  finished(r: DriveBase): boolean
  parts(r: DriveBase, finishMs: number | null): ScorePart[]
  /** YALNIZ TEST: puan alan örnek çözüm. */
  sample(): MikroProject
}

export interface SkillResult { score: number; parts: ScorePart[]; finishMs: number | null; timeMs: number; error: string | null }

/** Puanlı çalıştırmada adım sınırı: sunucu işlemcisini korur, istemcide de aynı (sonuç birebir aynı olsun). */
export const SKILL_STEP_LIMIT = 20_000_000
const POLL_MS = 50
const PENALTY = 5

const timeBonus = (finishMs: number | null, limitS: number) => (finishMs == null ? 0 : Math.max(0, Math.floor((limitS * 1000 - finishMs) / 2000)))
const collisionPart = (r: DriveBase): ScorePart => ({ label: `Çarpma (${r.collisions} × -${PENALTY})`, points: r.collisions ? -PENALTY * r.collisions : 0 })

const box = (id: string, title: string, w: number, h: number, o: Partial<RobotScene>): RobotScene => ({
  id, title, width: w, height: h, walls: rectWalls(0, 0, w, h), lines: [], patches: [], zones: [], pose: { x: 0.3, y: 0.3, theta: 0 }, ...o,
})

const CHECKPOINTS = ['A', 'B', 'C', 'D', 'E']
const COLORS = ['sari', 'mavi', 'yesil'] as const

export const SKILL_CHALLENGES: SkillChallenge[] = [
  {
    id: 'kontrol-turu',
    title: 'Kontrol noktası turu',
    profile: 'gezgin',
    summary: 'Mini Gezgin ile beş kontrol noktasından geç, bitiş dairesinde dur. 60 saniyen var.',
    rules: [
      'Her kontrol noktası (A-E) 10 puan; robotun merkezi daireye girince sayılır.',
      'Beşinden de geçip bitiş dairesinde durursan +20 puan.',
      'Bitirirsen kalan her 2 saniye için +1 puan.',
      `Her çarpma -${PENALTY} puan. Puan sıfırın altına düşmez.`,
    ],
    timeLimitS: 60,
    scene: () => box('kontrol-turu', 'Kontrol noktası turu', 2.4, 1.6, {
      walls: [...rectWalls(0, 0, 2.4, 1.6), ...rectWalls(0.8, 0.65, 1.6, 0.95)],
      zones: [
        { id: 'A', label: 'A', kind: 'checkpoint', x: 1.2, y: 0.3, r: 0.1 },
        { id: 'B', label: 'B', kind: 'checkpoint', x: 2.1, y: 0.3, r: 0.1 },
        { id: 'C', label: 'C', kind: 'checkpoint', x: 2.1, y: 1.3, r: 0.1 },
        { id: 'D', label: 'D', kind: 'checkpoint', x: 1.2, y: 1.3, r: 0.1 },
        { id: 'E', label: 'E', kind: 'checkpoint', x: 0.3, y: 1.3, r: 0.1 },
        { id: 'bitis', label: 'bitiş', kind: 'goal', x: 0.3, y: 0.8, r: 0.1 },
      ],
      pose: { x: 0.3, y: 0.3, theta: 0 },
    }),
    finished: (r) => CHECKPOINTS.every((c) => r.visited.has(c)) && r.inZone('bitis') && r.stopped,
    parts(r, finishMs) {
      const n = CHECKPOINTS.filter((c) => r.visited.has(c)).length
      return [
        { label: `Kontrol noktası (${n} × 10)`, points: n * 10 },
        { label: 'Bitişte durma', points: finishMs != null ? 20 : 0 },
        { label: 'Zaman bonusu', points: timeBonus(finishMs, 60) },
        collisionPart(r),
      ]
    },
    sample: () => project('Kontrol turu', [onStart(
      b('rb_speed', { i: { P: 80 } }),
      move(180), turn(90), move(100), turn(90), move(180), turn(90), move(50),
    )]),
  },
  {
    id: 'renk-avcisi',
    title: 'Renk avcısı',
    profile: 'blok',
    summary: 'Blok Robotu ile sarı, mavi ve yeşil alanlardan geç, sonunda kırmızı alanın üstünde dur. 60 saniyen var.',
    rules: [
      'Sarı, mavi ve yeşil alanların her biri 10 puan; robotun merkezi daireye girince sayılır.',
      'Üçünden de geçip renk sensörü kırmızının üstündeyken durursan +30 puan.',
      'Bitirirsen kalan her 2 saniye için +1 puan.',
      `Her çarpma -${PENALTY} puan. Puan sıfırın altına düşmez.`,
    ],
    timeLimitS: 60,
    scene: () => box('renk-avcisi', 'Renk avcısı', 2, 1.3, {
      patches: [
        { x1: 0.62, y1: 0.52, x2: 0.78, y2: 0.68, color: 'sari' },
        { x1: 1.02, y1: 0.52, x2: 1.18, y2: 0.68, color: 'mavi' },
        { x1: 1.42, y1: 0.52, x2: 1.58, y2: 0.68, color: 'yesil' },
        { x1: 1.38, y1: 0.95, x2: 1.62, y2: 1.12, color: 'kirmizi' },
      ],
      zones: [
        { id: 'sari', kind: 'checkpoint', x: 0.7, y: 0.6, r: 0.08 },
        { id: 'mavi', kind: 'checkpoint', x: 1.1, y: 0.6, r: 0.08 },
        { id: 'yesil', kind: 'checkpoint', x: 1.5, y: 0.6, r: 0.08 },
      ],
      pose: { x: 0.25, y: 0.6, theta: 0 },
    }),
    finished: (r) => COLORS.every((c) => r.visited.has(c)) && r.stopped && r.color === 'kirmizi',
    parts(r, finishMs) {
      const n = COLORS.filter((c) => r.visited.has(c)).length
      return [
        { label: `Renk alanı (${n} × 10)`, points: n * 10 },
        { label: 'Kırmızıda durma', points: finishMs != null ? 30 : 0 },
        { label: 'Zaman bonusu', points: timeBonus(finishMs, 60) },
        collisionPart(r),
      ]
    },
    sample: () => project('Renk avcısı', [onStart(
      move(125), turn(90), motors(40, 40),
      b('controls_whileUntil', { f: { MODE: 'UNTIL' }, i: { BOOL: colorIs('kirmizi') } }) as PBlock,
      stopMotors(),
    )]),
  },
]

export const SKILL_BY_ID: Record<string, SkillChallenge> = Object.fromEntries(SKILL_CHALLENGES.map((c) => [c.id, c]))

/** Resmi puan: tohum 1, sabit süre; program biter ve robot durursa erken biter. */
export function runSkill(ch: SkillChallenge, p: MikroProject): SkillResult {
  const sim = new Simulation(p, { seed: 1, totalStepLimit: SKILL_STEP_LIMIT, robot: { profile: ch.profile, scene: ch.scene() } })
  const r = sim.robot!
  sim.start()
  let finishMs: number | null = null
  const limit = ch.timeLimitS * 1000
  while (sim.now < limit) {
    sim.advance(Math.min(POLL_MS, limit - sim.now))
    if (finishMs == null && ch.finished(r)) finishMs = sim.now
    if (sim.error || finishMs != null || (!sim.card.runtime.busy && r.stopped)) break
  }
  sim.stop()
  const parts = ch.parts(r, finishMs)
  return { score: Math.max(0, parts.reduce((s, x) => s + x.points, 0)), parts, finishMs, timeMs: sim.now, error: sim.error?.message ?? null }
}

