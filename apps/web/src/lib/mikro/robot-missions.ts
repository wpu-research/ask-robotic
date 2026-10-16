// Robot Atölyesi görevleri: Mikro Kart'ı iki gövdeden birine takıp sanal arenada görev yapma.
// Her görev bir MikroActivity'dir; hedefler robotun gerçek konumu ve ölçümleriyle denetlenir. `solution` testte çalıştırılır.
import type { ActivityEn, MikroActivity } from './activity'
import { evaluateGoals, usesBlocks, type GoalCtx, type GoalStatus, type MikroGoal } from './goals'
import { oval, rectWalls } from '../arena/geometry'
import { b, cmp, forever, ifThen, onStart, project, repeat } from './program'
import type { DriveBase, RobotProfileId, RobotScene } from './robot'
import { Simulation } from './sim'
import type { MikroProject, PBlock } from './types'

export interface RobotMission extends MikroActivity {
  id: string
  title: string
  profile: RobotProfileId
  /** Her çağrıda taze sahne. */
  scene(): RobotScene
  /** Değerlendirmede programın en çok çalıştırılacağı süre (ms). */
  runMs: number
  /** İngilizce görünüm metinleri. */
  en: ActivityEn & { title: string }
}

// ---------------- blok kısayolları ----------------
export const move = (cm: number, dir: 'forward' | 'back' = 'forward') => b('rb_move', { f: { DIR: dir }, i: { CM: cm } })
export const turn = (deg: number, dir: 'left' | 'right' = 'left') => b('rb_turn', { f: { DIR: dir }, i: { DEG: deg } })
export const motors = (l: number, r: number) => b('rb_motors', { i: { L: l, R: r } })
export const stopMotors = () => b('rb_stop')
export const distance = () => b('rb_distance')
export const colorIs = (c: string) => b('rb_color_is', { f: { C: c } })
export const lineOn = (side: 'left' | 'right') => b('rb_line', { f: { SIDE: side } })
export const lights = (c: string) => b('rb_lights', { f: { COLOR: c } })
const until = (cond: PBlock, body: PBlock[] = []) => b('controls_whileUntil', { f: { MODE: 'UNTIL' }, i: { BOOL: cond }, s: { DO: body } })

// ---------------- hedef yardımcıları ----------------
const robotOf = (c: GoalCtx): DriveBase | null => c.sim?.robot ?? null
const goal = (id: string, text: string, check: (r: DriveBase) => boolean, hint?: string): MikroGoal =>
  ({ id, text, hint, check: (c) => { const r = robotOf(c); return !!r && check(r) } })

const BASE_BLOCKS = ['mk_on_start', 'mk_forever', 'mk_pause', 'mk_show_icon', 'mk_clear', 'rb_stop', 'rb_speed', 'rb_lights', 'mk_play_note']

// ---------------- sahneler ----------------
const box = (id: string, title: string, w: number, h: number, o: Partial<RobotScene> = {}): RobotScene => ({
  id, title, width: w, height: h, walls: rectWalls(0, 0, w, h), lines: [], patches: [], zones: [], pose: { x: 0.25, y: h / 2, theta: 0 }, ...o,
})

export const ROBOT_MISSIONS: RobotMission[] = [
  {
    id: 'ilk-surus',
    en: {
      title: 'First drive',
      intro: 'The Block Robot is 60 cm behind the target circle. Use the "drive" block to take the robot right to the target and stop there.',
      goals: { git: { text: 'Use the "drive" block' }, hedef: { text: 'The robot stops inside the target circle', hint: 'The robot\'s center is 60 cm from the target.' } },
    },
    title: 'İlk sürüş',
    profile: 'blok',
    intro: 'Blok Robotu hedef dairesinin 60 cm gerisinde. "git" bloğuyla robotu tam hedefe götür ve orada durdur.',
    scene: () => box('ilk-surus', 'İlk sürüş', 1.6, 0.8, {
      patches: [{ x1: 0.78, y1: 0.33, x2: 0.92, y2: 0.47, color: 'kirmizi' }],
      zones: [{ id: 'hedef', label: 'hedef', kind: 'goal', x: 0.85, y: 0.4, r: 0.06 }],
      pose: { x: 0.25, y: 0.4, theta: 0 },
    }),
    runMs: 8000,
    allowedBlocks: [...BASE_BLOCKS, 'rb_move', 'rb_turn'],
    starter: () => project('İlk sürüş', [onStart()]),
    goals: [
      usesBlocks('git', '"git" bloğunu kullan', ['rb_move']),
      goal('hedef', 'Robot hedef dairesinde dursun', (r) => r.inZone('hedef') && r.stopped, 'Robotun merkezi ile hedef arası 60 cm.'),
    ],
    solution: () => project('İlk sürüş', [onStart(move(60))]),
  },
  {
    id: 'kare',
    en: {
      title: 'Draw a square',
      intro: 'Use the Mini Rover to draw a square with 40 cm sides and come back to where you started. Don\'t write the same blocks four times: use the repeat block.',
      goals: { tekrar: { text: 'Use the "repeat times" block' }, kare: { text: 'Four sides and four turns: at least 1.5 m driven, at least 350° turned' }, donus: { text: 'Stop within 5 cm of where you started', hint: 'After each side, turn 90 degrees the same way.' } },
    },
    title: 'Kare çiz',
    profile: 'gezgin',
    intro: 'Mini Gezgin ile kenarı 40 cm olan bir kare çiz ve başladığın yere dön. Aynı blokları dört kez yazma: tekrarla bloğunu kullan.',
    scene: () => box('kare', 'Kare çiz', 1.2, 1.2, {
      zones: [{ id: 'baslangic', label: 'başlangıç', kind: 'start', x: 0.35, y: 0.35, r: 0.05 }],
      pose: { x: 0.35, y: 0.35, theta: 0 },
    }),
    runMs: 20000,
    allowedBlocks: [...BASE_BLOCKS, 'rb_move', 'rb_turn', 'controls_repeat_ext'],
    starter: () => project('Kare', [onStart()]),
    goals: [
      usesBlocks('tekrar', '"kez tekrarla" bloğunu kullan', ['controls_repeat_ext']),
      goal('kare', 'Dört kenar ve dört dönüş: en az 1,5 m yol, en az 350° dönüş', (r) => r.distanceM >= 1.5 && r.turnedDeg >= 350),
      goal('donus', 'Başladığın yere 5 cm yakın dur', (r) => r.distanceM >= 1.5 && r.inZone('baslangic') && r.stopped, 'Her kenardan sonra aynı yöne 90 derece dön.'),
    ],
    solution: () => project('Kare', [onStart(repeat(4, [move(40), turn(90)]))]),
  },
  {
    id: 'duvarda-dur',
    en: {
      title: 'Stop at the wall',
      intro: 'The robot is driving toward a wall. Use the distance sensor: stop 10 cm before the wall. Don\'t crash!',
      goals: { mesafe: { text: 'Use the "distance (cm)" block' }, dur: { text: 'Stop 5-15 cm from the wall without crashing', hint: 'Wait while the distance is more than 10 (loop), then stop the motors.' } },
    },
    title: 'Duvarda dur',
    profile: 'blok',
    intro: 'Robot duvara doğru gidiyor. Mesafe sensörünü kullan: duvara 10 cm kala dur. Duvara çarpma!',
    scene: () => box('duvarda-dur', 'Duvarda dur', 1.6, 0.8),
    runMs: 15000,
    allowedBlocks: [...BASE_BLOCKS, 'rb_motors', 'rb_move', 'rb_distance', 'controls_whileUntil', 'controls_if', 'logic_compare', 'math_number'],
    starter: () => project('Duvarda dur', [onStart(motors(40, 40))]),
    goals: [
      usesBlocks('mesafe', '"mesafe (cm)" bloğunu kullan', ['rb_distance']),
      goal('dur', 'Duvara 5-15 cm kala, çarpmadan dur', (r) => r.stopped && r.collisions === 0 && r.distanceCm >= 5 && r.distanceCm <= 15,
        'Mesafe 10\'dan büyük olduğu sürece bekle (döngü), sonra motorları durdur.'),
    ],
    solution: () => project('Duvarda dur', [onStart(motors(40, 40), b('controls_whileUntil', { f: { MODE: 'WHILE' }, i: { BOOL: cmp('GT', distance(), 10) } }), stopMotors())]),
  },
  {
    id: 'renkte-dur',
    en: {
      title: 'Stop on red',
      intro: 'There are blue, yellow and red areas on the way. Use the color sensor: the robot should stop on the red area and turn its lights red.',
      goals: { renk: { text: 'Use a color sensor block' }, kirmizi: { text: 'Stop while the color sensor is over red' }, isik: { text: 'When you stop, turn the lights red' } },
    },
    title: 'Kırmızıda dur',
    profile: 'blok',
    intro: 'Yolda mavi, sarı ve kırmızı alanlar var. Renk sensörünü kullan: robot kırmızı alanın üstünde dursun ve ışıklarını kırmızı yaksın.',
    scene: () => box('renkte-dur', 'Kırmızıda dur', 2, 0.8, {
      patches: [
        { x1: 0.55, y1: 0.25, x2: 0.7, y2: 0.55, color: 'mavi' },
        { x1: 0.9, y1: 0.25, x2: 1.05, y2: 0.55, color: 'sari' },
        { x1: 1.3, y1: 0.25, x2: 1.45, y2: 0.55, color: 'kirmizi' },
      ],
    }),
    runMs: 20000,
    allowedBlocks: [...BASE_BLOCKS, 'rb_motors', 'rb_move', 'rb_color_is', 'rb_color', 'rb_reflect', 'controls_whileUntil', 'controls_if', 'logic_negate', 'logic_compare'],
    starter: () => project('Kırmızıda dur', [onStart(motors(30, 30))]),
    goals: [
      usesBlocks('renk', 'Renk sensörü bloğunu kullan', ['rb_color_is', 'rb_color', 'rb_reflect'], { any: true }),
      goal('kirmizi', 'Renk sensörü kırmızının üstündeyken dur', (r) => r.stopped && r.color === 'kirmizi'),
      goal('isik', 'Durunca ışıkları kırmızı yak', (r) => r.stopped && r.color === 'kirmizi' && r.lights === 'kirmizi'),
    ],
    solution: () => project('Kırmızıda dur', [onStart(motors(30, 30), until(colorIs('kirmizi')), stopMotors(), lights('kirmizi'))]),
  },
  {
    id: 'cizgi-izle',
    en: {
      title: 'Follow the line',
      intro: 'The Mini Rover is on an oval track. Follow the line with the two line sensors and pass the three checkpoints. If the left sensor sees the line, turn left; if the right sensor sees it, turn right.',
      goals: { sensor: { text: 'Use the line sensor block' }, n1: { text: 'Pass checkpoint 1' }, n2: { text: 'Pass checkpoint 2' }, n3: { text: 'Pass checkpoint 3', hint: 'The track curves to the left; when the left sensor sees the line, turn left.' } },
    },
    title: 'Çizgi izle',
    profile: 'gezgin',
    intro: 'Mini Gezgin oval pistin üstünde. İki çizgi sensörüyle çizgiyi izle ve pistin üç kontrol noktasından geç. Sol sensör çizgiyi görürse sola, sağ sensör görürse sağa dön.',
    scene: () => box('cizgi-izle', 'Çizgi izle', 2, 1.4, {
      lines: [oval(1, 0.7, 0.45, 0.4)],
      lineWidth: 0.025,
      zones: [
        { id: 'sag', label: '1', kind: 'checkpoint', x: 1.85, y: 0.7, r: 0.1 },
        { id: 'ust', label: '2', kind: 'checkpoint', x: 1, y: 1.1, r: 0.1 },
        { id: 'sol', label: '3', kind: 'checkpoint', x: 0.15, y: 0.7, r: 0.1 },
      ],
      pose: { x: 1, y: 0.3, theta: 0 },
    }),
    runMs: 40000,
    allowedBlocks: [...BASE_BLOCKS, 'rb_motors', 'rb_line', 'controls_if', 'logic_negate', 'logic_operation'],
    starter: () => project('Çizgi izle', [forever()]),
    goals: [
      usesBlocks('sensor', 'Çizgi sensörü bloğunu kullan', ['rb_line']),
      goal('n1', '1. kontrol noktasından geç', (r) => r.visited.has('sag')),
      goal('n2', '2. kontrol noktasından geç', (r) => r.visited.has('ust')),
      goal('n3', '3. kontrol noktasından geç', (r) => r.visited.has('sol'), 'Pist sola doğru kıvrılıyor; sol sensör çizgiyi görünce sola dön.'),
    ],
    solution: () => project('Çizgi izle', [forever(
      ifThen(lineOn('left'), [motors(0, 40)], [ifThen(lineOn('right'), [motors(40, 0)], [motors(40, 40)])]),
    )]),
  },
  {
    id: 'labirent',
    en: {
      title: 'Escape the corridor',
      intro: 'The Mini Rover is in an L-shaped corridor. Use the distance sensor: stop when you get close to the wall, turn left and reach the target at the exit. Don\'t hit the walls.',
      goals: { mesafe: { text: 'Use the "distance (cm)" block' }, cikis: { text: 'Reach the target at the exit and stop without crashing' } },
    },
    title: 'Koridordan çık',
    profile: 'gezgin',
    intro: 'Mini Gezgin L biçimli bir koridorda. Mesafe sensörünü kullanarak duvara yaklaşınca dur, sola dön ve çıkıştaki hedefe ulaş. Duvarlara çarpma.',
    scene: () => box('labirent', 'Koridordan çık', 1.6, 1.2, {
      walls: [...rectWalls(0, 0, 1.6, 1.2), ...rectWalls(0, 0.4, 1.2, 1.2)],
      zones: [{ id: 'cikis', label: 'çıkış', kind: 'goal', x: 1.4, y: 1, r: 0.1 }],
      pose: { x: 0.2, y: 0.2, theta: 0 },
    }),
    runMs: 25000,
    allowedBlocks: [...BASE_BLOCKS, 'rb_motors', 'rb_move', 'rb_turn', 'rb_distance', 'controls_whileUntil', 'controls_repeat_ext', 'controls_if', 'logic_compare'],
    starter: () => project('Koridor', [onStart()]),
    goals: [
      usesBlocks('mesafe', '"mesafe (cm)" bloğunu kullan', ['rb_distance']),
      goal('cikis', 'Çıkıştaki hedefe çarpmadan ulaş ve dur', (r) => r.inZone('cikis') && r.stopped && r.collisions === 0),
    ],
    solution: () => {
      const ileriDuvara = [motors(50, 50), b('controls_whileUntil', { f: { MODE: 'WHILE' }, i: { BOOL: cmp('GT', distance(), 15) } }), stopMotors()]
      return project('Koridor', [onStart(...ileriDuvara, turn(90), ...ileriDuvara.map((x) => JSON.parse(JSON.stringify(x)) as PBlock))])
    },
  },
]

export const MISSION_BY_ID: Record<string, RobotMission> = Object.fromEntries(ROBOT_MISSIONS.map((m) => [m.id, m]))

/** Serbest arena: çizgi pisti, renk alanları ve bir engel. */
export const freeScene = (): RobotScene => box('serbest', 'Serbest arena', 2, 1.4, {
  walls: [...rectWalls(0, 0, 2, 1.4), ...rectWalls(1.55, 0.15, 1.75, 0.35)],
  lines: [oval(0.85, 0.75, 0.3, 0.35)],
  lineWidth: 0.025,
  patches: [
    { x1: 1.5, y1: 1.05, x2: 1.75, y2: 1.25, color: 'kirmizi' },
    { x1: 1.5, y1: 0.7, x2: 1.75, y2: 0.9, color: 'yesil' },
    { x1: 1.5, y1: 0.45, x2: 1.75, y2: 0.6, color: 'mavi' },
  ],
  pose: { x: 0.85, y: 0.4, theta: 0 },
})

/** Projeyi görevin sahnesinde başsız çalıştırır; program biter ve robot durursa erken bırakır. */
export function runMission(m: RobotMission, p: MikroProject): Simulation {
  const sim = new Simulation(p, { robot: { profile: m.profile, scene: m.scene() } })
  sim.start()
  for (let t = 0; t < m.runMs; t += 100) {
    sim.advance(100)
    if (sim.error || (!sim.card.runtime.busy && sim.robot!.stopped)) break
  }
  return sim
}

export function evaluateMission(m: RobotMission, p: MikroProject): { status: GoalStatus[]; done: boolean; error: string | null } {
  const sim = runMission(m, p)
  const { status } = evaluateGoals(m.goals, { sim, ws: p.workspace })
  return { status, done: status.every((s) => s.done), error: sim.error?.message ?? null }
}
