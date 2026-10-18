// Tasarım yarışmaları: hem robotu hem programı birlikte puanlar ("en hafif robotla slalom", "tek motorla park et" ...).
// Puan, tasarımdan türetilen gövdeyle programın belirli tohumla (seed 1) başsız çalıştırılmasıyla hesaplanır; sunucu gönderilen
// tasarımı ve programı aynı işlevle yeniden çalıştırır, istemcinin bildirdiği puana güvenilmez (bkz. Sanal Beceri, beceri.ts).
import { rectWalls } from '../arena/geometry'
import { evaluateGoals } from './goals'
import { cmp, forever, ifThen, onStart, project, whileLoop } from './program'
import { MISSION_BY_ID, distance, lineOn, motors, stopMotors } from './robot-missions'
import type { DriveBase, RobotScene } from './robot'
import { Simulation } from './sim'
import { SKILL_STEP_LIMIT, type ScorePart } from './beceri'
import { TEMPLATES, deriveDesign, type DerivedDesign, type RobotDesign } from './tasarim'
import type { MikroProject } from './types'

export interface DesignChallenge {
  id: string
  title: string
  summary: string
  rules: string[]
  en: { title: string; summary: string; rules: string[] }
  timeLimitS: number
  scene(): RobotScene
  /** Tasarım bu yarışmaya uygun mu; değilse nedeni (TR, EN). */
  requires?(d: DerivedDesign): null | [string, string]
  /** Bitiş koşulu (sağlandığı ilk an kaydedilir). */
  finished(r: DriveBase, ws: MikroProject['workspace']): boolean
  parts(r: DriveBase, d: DerivedDesign, finishMs: number | null, design: RobotDesign): ScorePart[]
  /** Yarışmanın blok kısıtı (görevdeki gibi); boşsa hepsi serbest. */
  allowedBlocks?: string[]
  /** YALNIZ TEST: puan alan örnek tasarım ve program. */
  sample(): { design: RobotDesign; project: MikroProject }
}

export interface DesignResult { score: number; parts: ScorePart[]; finishMs: number | null; timeMs: number; error: string | null; massG: number; partCount: number }

const PENALTY = 5
const POLL_MS = 50
const collisionPart = (r: DriveBase): ScorePart => ({ label: `Çarpma (${r.collisions} × -${PENALTY})`, en: `Crashes (${r.collisions} × -${PENALTY})`, points: r.collisions ? -PENALTY * r.collisions : 0 })
const timeBonus = (finishMs: number | null, limitS: number) => (finishMs == null ? 0 : Math.max(0, Math.floor((limitS * 1000 - finishMs) / 2000)))
const allGoals = (id: string, r: DriveBase, ws: MikroProject['workspace']) => {
  const m = MISSION_BY_ID[id]
  // Simulation yerine yalnız robotu veren küçük bağlam: hedefler robotu c.sim.robot'tan okur
  return evaluateGoals(m.goals, { sim: { robot: r } as unknown as Simulation, ws }).status.every((s) => s.done)
}

const PARK = { x: 1.3, y: 0.25, r: 0.05 }

/** Hafif slalom için örnek: küçük şasi, küçük teker, mini motor, tek hücreli pil. */
const LIGHT: RobotDesign = { v: 1, name: 'Tüy', chassis: 'kucuk', parts: [
  { id: 'tl', type: 'teker-kucuk', c: 3, r: 0 }, { id: 'tr', type: 'teker-kucuk', c: 3, r: 3 },
  { id: 'ml', type: 'motor-mini', c: 3, r: 1 }, { id: 'mr', type: 'motor-mini', c: 3, r: 2 },
  { id: 'sh', type: 'sarhos', c: 0, r: 1 }, { id: 'pl', type: 'lipo-1s', c: 0, r: 2 },
] }
/** Tek motorlu örnek: iki teker aynı sütunda, motor yalnız solda. */
const ONE_MOTOR: RobotDesign = { v: 1, name: 'Tek motor', chassis: 'orta', parts: [
  { id: 'tl', type: 'teker-buyuk', c: 4, r: 0 }, { id: 'tr', type: 'teker-buyuk', c: 4, r: 4 },
  { id: 'ml', type: 'motor-std', c: 4, r: 1 }, { id: 'sh', type: 'sarhos', c: 0, r: 2 }, { id: 'pl', type: 'pil-4aa', c: 1, r: 2 },
  { id: 'ir', type: 'mesafe-ir', c: 6, r: 2 },
] }
/** Az parçalı çizgi izleyici. */
const LINE: RobotDesign = { v: 1, name: 'Çizgici', chassis: 'kucuk', parts: [
  { id: 'tl', type: 'teker-kucuk', c: 3, r: 0 }, { id: 'tr', type: 'teker-kucuk', c: 3, r: 3 },
  { id: 'ml', type: 'motor-mini', c: 3, r: 1 }, { id: 'mr', type: 'motor-mini', c: 3, r: 2 },
  { id: 'sh', type: 'sarhos', c: 0, r: 1 }, { id: 'pl', type: 'pil-4aa', c: 0, r: 2 }, { id: 'cz', type: 'cizgi', c: 4, r: 1 },
] }

export const DESIGN_CHALLENGES: DesignChallenge[] = [
  {
    id: 'hafif-slalom',
    title: 'En hafif robotla slalom',
    summary: 'Slalom görevini bitir: 1, 2, 3 kapılarından geçip bitişte dur. Robotun ne kadar hafifse o kadar çok puan alırsın.',
    rules: [
      'Slalomun bütün hedeflerini sağlarsan 60 puan.',
      'Bitirirsen 600 g\'ın altındaki her 5 g için +1 puan.',
      'Bitirirsen kalan her 2 saniye için +1 puan.',
      `Her çarpma -${PENALTY} puan. Puan sıfırın altına düşmez.`,
    ],
    en: {
      title: 'Lightest robot slalom',
      summary: 'Finish the slalom mission: pass gates 1, 2, 3 and stop at the finish. The lighter your robot, the more points you get.',
      rules: [
        'Meet all slalom goals for 60 points.',
        'If you finish, +1 point for every 5 g under 600 g.',
        'If you finish, +1 point for every 2 seconds left.',
        `Each crash is -${PENALTY} points. The score never goes below zero.`,
      ],
    },
    timeLimitS: 30,
    scene: () => MISSION_BY_ID.slalom.scene(),
    allowedBlocks: MISSION_BY_ID.slalom.allowedBlocks,
    finished: (r, ws) => allGoals('slalom', r, ws),
    parts: (r, d, finishMs) => [
      { label: 'Slalom tamam', en: 'Slalom done', points: finishMs != null ? 60 : 0 },
      { label: `Hafiflik (${d.massG} g)`, en: `Lightness (${d.massG} g)`, points: finishMs != null ? Math.max(0, Math.floor((600 - d.massG) / 5)) : 0 },
      { label: 'Zaman bonusu', en: 'Time bonus', points: timeBonus(finishMs, 30) },
      collisionPart(r),
    ],
    sample: () => ({ design: LIGHT, project: MISSION_BY_ID.slalom.solution() }),
  },
  {
    id: 'tek-motor-park',
    title: 'Tek motorla park et',
    summary: 'Robotunda yalnız bir sürüş motoru olsun: robot dönemez, yalnız düz gider. Mesafe sensörüyle duvarın önündeki park dairesinde dur.',
    rules: [
      'Tasarımda tam bir sürüş motoru olmalı (iki teker ortak akstadır).',
      'Robotun merkezi park dairesindeyken durursan 60 puan.',
      'Daire merkezine her yakın santimetre için puan: en çok +20.',
      'Bitirirsen kalan her 2 saniye için +1 puan.',
      `Her çarpma -${PENALTY} puan.`,
    ],
    en: {
      title: 'Park with one motor',
      summary: 'Your robot may have only one drive motor: it cannot turn, only drive straight. Use the distance sensor to stop in the parking circle in front of the wall.',
      rules: [
        'The design must have exactly one drive motor (both wheels share an axle).',
        'Stop with the robot\'s center inside the parking circle for 60 points.',
        'Points for every centimetre closer to the circle\'s center: up to +20.',
        'If you finish, +1 point for every 2 seconds left.',
        `Each crash is -${PENALTY} points.`,
      ],
    },
    timeLimitS: 20,
    scene: () => ({
      id: 'tek-motor-park', title: 'Tek motorla park et', width: 1.6, height: 0.5, walls: rectWalls(0, 0, 1.6, 0.5), lines: [], patches: [
        { x1: PARK.x - 0.06, y1: 0.02, x2: PARK.x + 0.06, y2: 0.48, color: 'sari' },
      ],
      zones: [{ id: 'park', label: 'park', kind: 'goal', x: PARK.x, y: PARK.y, r: PARK.r }],
      pose: { x: 0.25, y: 0.25, theta: 0 },
    }),
    requires: (d) => (d.driveMotors === 1 ? null : ['Bu yarışmada robotun tam bir sürüş motoru olmalı.', 'In this challenge the robot must have exactly one drive motor.']),
    finished: (r) => r.inZone('park') && r.stopped,
    parts(r, _d, finishMs) {
      const cm = Math.hypot(r.x - PARK.x, r.y - PARK.y) * 100
      return [
        { label: 'Park dairesinde durma', en: 'Stopped in the parking circle', points: finishMs != null ? 60 : 0 },
        { label: `Hassasiyet (${cm.toFixed(1)} cm)`, en: `Precision (${cm.toFixed(1)} cm)`, points: finishMs != null ? Math.max(0, Math.round(20 - cm * 4)) : 0 },
        { label: 'Zaman bonusu', en: 'Time bonus', points: timeBonus(finishMs, 20) },
        collisionPart(r),
      ]
    },
    sample: () => ({ design: ONE_MOTOR, project: project('Tek motor', [onStart(motors(50, 50), whileLoop(cmp('GT', distance(), 25), []), stopMotors())]) }),
  },
  {
    id: 'az-parca-cizgi',
    title: 'En az parçayla çizgi izle',
    summary: 'Çizgi izleme görevini bitir: oval pistte 1, 2, 3 kontrol noktalarından geç. Robotunda ne kadar az parça varsa o kadar çok puan alırsın.',
    rules: [
      'Çizgi izlemenin bütün hedeflerini sağlarsan 60 puan.',
      'Bitirirsen 12 parçadan eksik her parça için +5 puan (Mikro Kart ve şasi sayılmaz).',
      `Her çarpma -${PENALTY} puan.`,
    ],
    en: {
      title: 'Line following with the fewest parts',
      summary: 'Finish the line-following mission: pass checkpoints 1, 2, 3 on the oval track. The fewer parts your robot has, the more points you get.',
      rules: [
        'Meet all line-following goals for 60 points.',
        'If you finish, +5 points for every part under 12 (the Micro Card and chassis do not count).',
        `Each crash is -${PENALTY} points.`,
      ],
    },
    timeLimitS: 40,
    scene: () => MISSION_BY_ID['cizgi-izle'].scene(),
    allowedBlocks: MISSION_BY_ID['cizgi-izle'].allowedBlocks,
    finished: (r, ws) => allGoals('cizgi-izle', r, ws),
    parts: (r, _d, finishMs, design) => [
      { label: 'Çizgi izleme tamam', en: 'Line following done', points: finishMs != null ? 60 : 0 },
      { label: `Az parça (${design.parts.length})`, en: `Few parts (${design.parts.length})`, points: finishMs != null ? Math.max(0, (12 - design.parts.length) * 5) : 0 },
      collisionPart(r),
    ],
    sample: () => ({ design: LINE, project: project('Çizgi', [forever(ifThen(lineOn('left'), [motors(0, 40)], [ifThen(lineOn('right'), [motors(40, 0)], [motors(40, 40)])]))]) }),
  },
]
export const DESIGN_CHALLENGE_BY_ID: Record<string, DesignChallenge> = Object.fromEntries(DESIGN_CHALLENGES.map((c) => [c.id, c]))
/** Sunucu kaydında beceri sahalarıyla karışmasın diye önek. */
export const designRunId = (id: string) => `tasarim:${id}`

/** Resmi puan: tasarım geçerli ve yarışmaya uygunsa programı tohum 1 ile çalıştırır. */
export function runDesignChallenge(ch: DesignChallenge, design: RobotDesign, p: MikroProject): DesignResult {
  const d = deriveDesign(design)
  const base = { finishMs: null, timeMs: 0, massG: d.massG, partCount: design.parts.length }
  if (!d.ok) return { ...base, score: 0, parts: [], error: `Tasarımda hata var: ${d.issues.find((i) => i.level === 'hata')!.text}` }
  const why = ch.requires?.(d)
  if (why) return { ...base, score: 0, parts: [], error: why[0] }
  const sim = new Simulation(p, { seed: 1, totalStepLimit: SKILL_STEP_LIMIT, robot: { profile: d.profile, scene: ch.scene() } })
  const r = sim.robot!
  sim.start()
  let finishMs: number | null = null
  const limit = ch.timeLimitS * 1000
  while (sim.now < limit) {
    sim.advance(Math.min(POLL_MS, limit - sim.now))
    if (finishMs == null && ch.finished(r, p.workspace)) finishMs = sim.now
    if (sim.error || finishMs != null || (!sim.card.runtime.busy && r.stopped)) break
  }
  sim.stop()
  const parts = ch.parts(r, d, finishMs, design)
  return { ...base, score: Math.max(0, parts.reduce((s, x) => s + x.points, 0)), parts, finishMs, timeMs: sim.now, error: sim.error?.message ?? null }
}

/** Örnek: hazır Blok Robotu tasarımıyla görev çalıştırma (testlerde ve "bu görevi tasarımınla dene" düğmesinde). */
export const templateDesign = (id: 'blok' | 'gezgin' | 'kiskac'): RobotDesign => TEMPLATES.find((t) => t.id === id)!.design
