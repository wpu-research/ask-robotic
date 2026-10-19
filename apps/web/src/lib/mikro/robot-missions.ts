// Robot Atölyesi görevleri: Mikro Kart'ı iki gövdeden birine takıp sanal arenada görev yapma.
// Her görev bir MikroActivity'dir; hedefler robotun gerçek konumu ve ölçümleriyle denetlenir. `solution` testte çalıştırılır.
import type { ActivityEn, MikroActivity } from './activity'
import { evaluateGoals, showsNumber, usesBlocks, type GoalCtx, type GoalStatus, type MikroGoal } from './goals'
import { oval, rectWalls } from '../arena/geometry'
import { b, changeVar, cmp, forever, getVar, ifThen, logicOp, onStart, project, repeat, setVar, whileLoop } from './program'
import type { DriveBase, RobotProfile, RobotProfileId, RobotScene } from './robot'
import type { Wall } from '@ask/sim'
import { Simulation } from './sim'
import type { MikroProject, PBlock } from './types'

export type ChapterId = 'baslangic' | 'sensorler' | 'algoritmalar' | 'yarisma'

/** Görev bölümü: çocuk sırayla ilerler; öğretmen/veli notu bölümde öğrenilen kavramı kısaca anlatır. */
export interface MissionChapter {
  id: ChapterId
  title: string
  /** Kavram etiketi (sıra, döngü, koşul, sensör, algoritma). */
  concept: string
  /** Öğretmen / veli notu. */
  note: string
  en: { title: string; concept: string; note: string }
}

export const MISSION_CHAPTERS: MissionChapter[] = [
  {
    id: 'baslangic',
    title: 'Başlangıç',
    concept: 'sıra · döngü',
    note: 'Çocuk komutların sırayla çalıştığını (sıra) ve aynı işi tekrarlamak için döngü kullanmayı öğrenir. Uzunluk (cm) ve açı (derece) tahmini yapar; önce tahmin edip sonra deneyerek düzeltmesini isteyin.',
    en: {
      title: 'Getting started',
      concept: 'sequence · loops',
      note: 'Children learn that commands run one after another (sequence) and use a loop to repeat the same steps. They estimate lengths (cm) and angles (degrees); ask them to guess first, then test and correct.',
    },
  },
  {
    id: 'sensorler',
    title: 'Sensörler',
    concept: 'sensör · koşul',
    note: 'Robot artık çevresini algılar: mesafe, renk, tampon ve çizgi sensörleri. Çocuk "... olana kadar bekle" ve "eğer ... ise" bloklarıyla koşul kurar, değişkenle sayar. Gerçek sensör değerlerini arenanın altındaki göstergeden birlikte okuyun.',
    en: {
      title: 'Sensors',
      concept: 'sensors · conditions',
      note: 'Now the robot senses the world: distance, color, bumper and line sensors. Children build conditions with "repeat until" and "if ... then" blocks and count with a variable. Read the live sensor values under the arena together.',
    },
  },
  {
    id: 'algoritmalar',
    title: 'Algoritmalar',
    concept: 'algoritma · iç içe döngü',
    note: 'Birden çok adımı bir plana dönüştürme: labirentte sağ el kuralı, küpü bulma-tutma-taşıma. Çocuk iç içe döngü ve koşullarla genel bir yöntem yazar. Önce adımları kâğıda çizmesini ya da yüksek sesle anlatmasını isteyin.',
    en: {
      title: 'Algorithms',
      concept: 'algorithms · nested loops',
      note: 'Turning several steps into a plan: the right-hand rule in a maze, find-grab-carry a cube. Children write a general method with nested loops and conditions. Ask them to draw the steps on paper or explain them out loud first.',
    },
  },
  {
    id: 'yarisma',
    title: 'Yarışma',
    concept: 'eniyileme · karar',
    note: 'Yarışma görevleri zamana ve doğruluğa karşıdır: daha hızlı çizgi izleme, halkada kalma, renge göre ayırma. Çocuk çalışan programını ölçer, değiştirir ve yeniden dener (hata ayıklama ve iyileştirme). Puanlı sahalar için "Sanal beceri" satırına bakın.',
    en: {
      title: 'Competition',
      concept: 'optimizing · decisions',
      note: 'Competition missions are against time and accuracy: faster line following, staying in the ring, sorting by color. Children measure a working program, change it and try again (debugging and improving). See the "Skill challenges" row for scored arenas.',
    },
  },
]

export interface RobotMission extends MikroActivity {
  id: string
  title: string
  profile: RobotProfileId
  chapter: ChapterId
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
export const pressed = () => b('rb_pressed')
export const grip = (action: 'close' | 'open') => b('rb_grip', { f: { ACTION: action } })
export const heldIs = (c: string) => b('rb_held_is', { f: { C: c } })
const showNumber = (v: PBlock | number) => b('mk_show_number', { i: { VALUE: v } })
const not = (v: PBlock) => b('logic_negate', { i: { BOOL: v } })
const until = (cond: PBlock, body: PBlock[] = []) => b('controls_whileUntil', { f: { MODE: 'UNTIL' }, i: { BOOL: cond }, s: { DO: body } })

// ---------------- hedef yardımcıları ----------------
const robotOf = (c: GoalCtx): DriveBase | null => c.sim?.robot ?? null
const goal = (id: string, text: string, check: (r: DriveBase) => boolean, hint?: string): MikroGoal =>
  ({ id, text, hint, check: (c) => { const r = robotOf(c); return !!r && check(r) } })

/** Noktalardan art arda duvar parçaları. */
const path = (...pts: Array<[number, number]>): Wall[] => pts.slice(1).map((p, i) => [...pts[i], ...p] as Wall)
/** Robotun bütün izi (ve şimdiki konumu) merkezden `r` içinde mi. */
const stayedWithin = (rb: DriveBase, cx: number, cy: number, r: number) =>
  Math.hypot(rb.x - cx, rb.y - cy) <= r && rb.trail.every(([x, y]) => Math.hypot(x - cx, y - cy) <= r)
/** Bölgeler bu sırayla (ilk giriş anına göre) ziyaret edildi mi. */
const visitedInOrder = (rb: DriveBase, ids: string[]) => ids.every((id, i) => rb.visitedAt.has(id) && (i === 0 || rb.visitedAt.get(id)! > rb.visitedAt.get(ids[i - 1])!))
/** Küp tutulmuyor ve altındaki zemin bu renkte. */
const cubeOn = (rb: DriveBase, id: string, color: string) => rb.held !== id && rb.objectFloor(id) === color

const BASE_BLOCKS = ['mk_on_start', 'mk_forever', 'mk_pause', 'mk_show_icon', 'mk_clear', 'rb_stop', 'rb_speed', 'rb_lights', 'mk_play_note']

// ---------------- sahneler ----------------
const box = (id: string, title: string, w: number, h: number, o: Partial<RobotScene> = {}): RobotScene => ({
  id, title, width: w, height: h, walls: rectWalls(0, 0, w, h), lines: [], patches: [], zones: [], pose: { x: 0.25, y: h / 2, theta: 0 }, ...o,
})

const CORE_MISSIONS: RobotMission[] = [
  {
    id: 'ilk-surus',
    chapter: 'baslangic',
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
    chapter: 'baslangic',
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
    chapter: 'sensorler',
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
    chapter: 'sensorler',
    en: {
      title: 'Stop on red',
      intro: 'There are blue, yellow and red areas on the way. Use the color sensor: the robot should stop on the red area and turn its lights red.',
      goals: { renk: { text: 'Use a color sensor block' }, kirmizi: { text: 'Stop while the color sensor is over red', hint: 'Run the motors, wait until the floor is red, then stop the motors.' }, isik: { text: 'When you stop, turn the lights red' } },
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
      goal('kirmizi', 'Renk sensörü kırmızının üstündeyken dur', (r) => r.stopped && r.color === 'kirmizi', 'Motorları çalıştır, zemin kırmızı olana kadar bekle, sonra motorları durdur.'),
      goal('isik', 'Durunca ışıkları kırmızı yak', (r) => r.stopped && r.color === 'kirmizi' && r.lights === 'kirmizi'),
    ],
    solution: () => project('Kırmızıda dur', [onStart(motors(30, 30), until(colorIs('kirmizi')), stopMotors(), lights('kirmizi'))]),
  },
  {
    id: 'cizgi-izle',
    chapter: 'sensorler',
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
    chapter: 'algoritmalar',
    en: {
      title: 'Escape the corridor',
      intro: 'The Mini Rover is in an L-shaped corridor. Use the distance sensor: stop when you get close to the wall, turn left and reach the target at the exit. Don\'t hit the walls.',
      goals: { mesafe: { text: 'Use the "distance (cm)" block' }, cikis: { text: 'Reach the target at the exit and stop without crashing', hint: 'Drive while the distance is more than 15, stop, turn left 90 degrees and do the same again.' } },
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
      goal('cikis', 'Çıkıştaki hedefe çarpmadan ulaş ve dur', (r) => r.inZone('cikis') && r.stopped && r.collisions === 0, 'Mesafe 15\'ten büyükken git, dur, sola 90 derece dön ve aynısını bir daha yap.'),
    ],
    solution: () => {
      const ileriDuvara = [motors(50, 50), b('controls_whileUntil', { f: { MODE: 'WHILE' }, i: { BOOL: cmp('GT', distance(), 15) } }), stopMotors()]
      return project('Koridor', [onStart(...ileriDuvara, turn(90), ...ileriDuvara.map((x) => JSON.parse(JSON.stringify(x)) as PBlock))])
    },
  },
]

// ---------------- genişletilmiş görevler (bölümlere dağılır) ----------------
/** Halka (sumo) ve hızlı tur sahnelerinin ölçüleri. */
const RING = { x: 0.7, y: 0.7, r: 0.55 }
const LAP_LIMIT_S = 22

const MORE_MISSIONS: RobotMission[] = [
  {
    id: 'park-et',
    chapter: 'baslangic',
    en: {
      title: 'Park it',
      intro: 'Park the Block Robot nose-first in the parking space between the two black lines. The space is 90 cm ahead and 60 cm to the left.',
      goals: {
        park: { text: 'Stop inside the parking space', hint: 'Drive 90 cm, turn left 90 degrees, then drive 60 cm.' },
        duz: { text: 'Park straight (facing the back line) without crashing' },
      },
    },
    title: 'Park et',
    profile: 'blok',
    intro: 'Blok Robotu\'nu iki siyah çizginin arasındaki park yerine burnu önde park et. Park yeri 90 cm ileride ve 60 cm solda.',
    scene: () => box('park-et', 'Park et', 1.6, 1.2, {
      patches: [
        { x1: 1.03, y1: 0.72, x2: 1.05, y2: 1.1, color: 'siyah' },
        { x1: 1.35, y1: 0.72, x2: 1.37, y2: 1.1, color: 'siyah' },
        { x1: 1.03, y1: 1.08, x2: 1.37, y2: 1.1, color: 'siyah' },
      ],
      zones: [{ id: 'park', label: 'park', kind: 'goal', x: 1.2, y: 0.9, r: 0.06 }],
      pose: { x: 0.3, y: 0.3, theta: 0 },
    }),
    runMs: 15000,
    allowedBlocks: [...BASE_BLOCKS, 'rb_move', 'rb_turn'],
    starter: () => project('Park et', [onStart()]),
    goals: [
      goal('park', 'Park yerinin içinde dur', (r) => r.inZone('park') && r.stopped, '90 cm git, sola 90 derece dön, sonra 60 cm git.'),
      goal('duz', 'Düz park et (arka çizgiye bakarak), çarpmadan', (r) => r.inZone('park') && r.stopped && Math.abs(r.headingDeg - 90) <= 10 && r.collisions === 0),
    ],
    solution: () => project('Park et', [onStart(move(90), turn(90), move(60))]),
  },
  {
    id: 'merdiven',
    chapter: 'baslangic',
    en: {
      title: 'Climb the stairs',
      intro: 'The Mini Rover climbs three steps: each step is 25 cm forward, a left turn, 20 cm up and a right turn. Write one step and repeat it 3 times.',
      goals: {
        tekrar: { text: 'Use the "repeat times" block' },
        basamak: { text: 'Pass all three step corners in order' },
        zirve: { text: 'Stop at the top without touching the walls', hint: 'Inside the loop: drive 25, turn left 90, drive 20, turn right 90.' },
      },
    },
    title: 'Merdiven çık',
    profile: 'gezgin',
    intro: 'Mini Gezgin üç basamak çıkacak: her basamak 25 cm ileri, sola dönüş, 20 cm yukarı ve sağa dönüş. Bir basamağı yaz, 3 kez tekrarla.',
    scene: () => box('merdiven', 'Merdiven çık', 1.4, 1.1, {
      walls: [
        ...rectWalls(0, 0, 1.4, 1.1),
        ...path([0.65, 0.12], [0.65, 0.35], [0.9, 0.35], [0.9, 0.55], [1.15, 0.55], [1.15, 0.75], [1.4, 0.75]),
        ...path([0.12, 0.35], [0.45, 0.35], [0.45, 0.55], [0.7, 0.55], [0.7, 0.75], [0.95, 0.75], [0.95, 0.95], [1.4, 0.95]),
      ],
      patches: [
        { x1: 0.45, y1: 0.35, x2: 0.65, y2: 0.55, color: 'sari' },
        { x1: 0.7, y1: 0.55, x2: 0.9, y2: 0.75, color: 'sari' },
        { x1: 0.95, y1: 0.75, x2: 1.15, y2: 0.95, color: 'sari' },
      ],
      zones: [
        { id: 'b1', label: '1', kind: 'checkpoint', x: 0.55, y: 0.45, r: 0.05 },
        { id: 'b2', label: '2', kind: 'checkpoint', x: 0.8, y: 0.65, r: 0.05 },
        { id: 'zirve', label: 'zirve', kind: 'goal', x: 1.05, y: 0.85, r: 0.05 },
      ],
      pose: { x: 0.3, y: 0.25, theta: 0 },
    }),
    runMs: 25000,
    allowedBlocks: [...BASE_BLOCKS, 'rb_move', 'rb_turn', 'controls_repeat_ext'],
    starter: () => project('Merdiven', [onStart()]),
    goals: [
      usesBlocks('tekrar', '"kez tekrarla" bloğunu kullan', ['controls_repeat_ext']),
      goal('basamak', 'Üç basamak köşesinden sırayla geç', (r) => visitedInOrder(r, ['b1', 'b2', 'zirve'])),
      goal('zirve', 'Duvarlara değmeden zirvede dur', (r) => r.inZone('zirve') && r.stopped && r.collisions === 0, 'Döngünün içine: 25 git, sola 90 dön, 20 git, sağa 90 dön.'),
    ],
    solution: () => project('Merdiven', [onStart(repeat(3, [move(25), turn(90), move(20), turn(90, 'right')]))]),
  },
  {
    id: 'slalom',
    chapter: 'baslangic',
    en: {
      title: 'Slalom',
      intro: 'Weave the Mini Rover between three cones: pass below the first, above the second and below the third, in order, then stop at the finish. Careful turns: 45 and 90 degrees.',
      goals: {
        sira: { text: 'Pass checkpoints 1, 2 and 3 in order' },
        bitis: { text: 'Stop at the finish without touching a cone', hint: 'Drive 10, turn right 45, drive 28; then turn 90 degrees, alternating left and right, and drive 57 cm.' },
      },
    },
    title: 'Slalom',
    profile: 'gezgin',
    intro: 'Mini Gezgin\'i üç dubanın arasından kıvrılarak geçir: birincinin altından, ikincinin üstünden, üçüncünün altından sırayla geç ve bitişte dur. Dikkatli dönüşler: 45 ve 90 derece.',
    scene: () => box('slalom', 'Slalom', 2, 1.2, {
      walls: [...rectWalls(0, 0, 2, 1.2), ...rectWalls(0.46, 0.56, 0.54, 0.64), ...rectWalls(0.86, 0.56, 0.94, 0.64), ...rectWalls(1.26, 0.56, 1.34, 0.64)],
      zones: [
        { id: 'g1', label: '1', kind: 'checkpoint', x: 0.5, y: 0.4, r: 0.07 },
        { id: 'g2', label: '2', kind: 'checkpoint', x: 0.9, y: 0.8, r: 0.07 },
        { id: 'g3', label: '3', kind: 'checkpoint', x: 1.3, y: 0.4, r: 0.07 },
        { id: 'bitis', label: 'bitiş', kind: 'goal', x: 1.75, y: 0.6, r: 0.07 },
      ],
      pose: { x: 0.2, y: 0.6, theta: 0 },
    }),
    runMs: 30000,
    allowedBlocks: [...BASE_BLOCKS, 'rb_move', 'rb_turn', 'controls_repeat_ext'],
    starter: () => project('Slalom', [onStart()]),
    goals: [
      goal('sira', '1, 2 ve 3. kontrol noktasından sırayla geç', (r) => visitedInOrder(r, ['g1', 'g2', 'g3'])),
      goal('bitis', 'Dubalara değmeden bitişte dur', (r) => visitedInOrder(r, ['g1', 'g2', 'g3', 'bitis']) && r.inZone('bitis') && r.stopped && r.collisions === 0,
        '10 git, sağa 45 dön, 28 git; sonra sırayla sola ve sağa 90 derece dönüp 57 cm git.'),
    ],
    solution: () => project('Slalom', [onStart(
      move(10), turn(45, 'right'), move(28), turn(90), move(57), turn(90, 'right'), move(57), turn(90), move(28), turn(45, 'right'), move(25),
    )]),
  },
  {
    id: 'engelden-don',
    chapter: 'sensorler',
    en: {
      title: 'Bump and come back',
      intro: 'Drive the Block Robot toward the obstacle. When the bumper touches it, back up a little, turn around and drive back to the green home area. Use the bumper (force) sensor so you never crash.',
      goals: {
        tampon: { text: 'Use the "bumper pressed?" block' },
        engel: { text: 'Touch the obstacle with the bumper without crashing' },
        ev: { text: 'Come back and stop on the green home area', hint: 'Wait until the bumper is pressed, back up 10 cm, turn 180 degrees, then drive until the floor is green.' },
      },
    },
    title: 'Engelden kaç ve dön',
    profile: 'blok',
    intro: 'Blok Robotu engele doğru gitsin. Tampon engele değince biraz geri çekilsin, arkasını dönsün ve yeşil eve geri dönsün. Çarpmamak için tampon (kuvvet) sensörünü kullan.',
    scene: () => box('engelden-don', 'Engelden kaç ve dön', 1.6, 0.8, {
      walls: [...rectWalls(0, 0, 1.6, 0.8), ...rectWalls(1.2, 0.2, 1.3, 0.6)],
      patches: [{ x1: 0.12, y1: 0.25, x2: 0.42, y2: 0.55, color: 'yesil' }],
      zones: [
        { id: 'engel', kind: 'checkpoint', x: 1.08, y: 0.4, r: 0.06 },
        { id: 'ev', label: 'ev', kind: 'goal', x: 0.3, y: 0.4, r: 0.18 },
      ],
      pose: { x: 0.3, y: 0.4, theta: 0 },
    }),
    runMs: 25000,
    allowedBlocks: [...BASE_BLOCKS, 'rb_motors', 'rb_move', 'rb_turn', 'rb_pressed', 'rb_color_is', 'controls_whileUntil', 'controls_if', 'logic_negate'],
    starter: () => project('Engelden dön', [onStart(motors(40, 40))]),
    goals: [
      usesBlocks('tampon', '"tampona basılı mı?" bloğunu kullan', ['rb_pressed']),
      goal('engel', 'Tamponla engele çarpmadan dokun', (r) => r.visited.has('engel') && r.collisions === 0),
      goal('ev', 'Geri dön ve yeşil evde dur', (r) => r.visited.has('engel') && r.inZone('ev') && r.stopped && r.collisions === 0,
        'Tampona basılana kadar bekle, 10 cm geri git, 180 derece dön, sonra zemin yeşil olana kadar git.'),
    ],
    solution: () => project('Engelden dön', [onStart(
      motors(40, 40), until(pressed()), stopMotors(), move(10, 'back'), turn(180), motors(40, 40), until(colorIs('yesil')), stopMotors(),
    )]),
  },
  {
    id: 'renk-sirasi',
    chapter: 'sensorler',
    en: {
      title: 'Color order',
      intro: 'Red, blue and green areas are lined up on the way. Each time the robot drives over an area, its lights should turn that color. At the end, stop on the yellow finish.',
      goals: {
        kosul: { text: 'Use the "if" block' },
        sira: { text: 'Lights match the floor in order: red → blue → green', hint: 'Inside a loop: if the floor is red, set the lights to red; do the same for blue and green.' },
        bitis: { text: 'Stop on the yellow finish' },
      },
    },
    title: 'Renk sırası',
    profile: 'blok',
    intro: 'Yolda kırmızı, mavi ve yeşil alanlar sırayla dizili. Robot her alanın üstünden geçerken ışıkları o alanın rengine yansın. Sonunda sarı bitişte dur.',
    scene: () => box('renk-sirasi', 'Renk sırası', 2.2, 0.8, {
      patches: [
        { x1: 0.6, y1: 0.25, x2: 0.75, y2: 0.55, color: 'kirmizi' },
        { x1: 1.0, y1: 0.25, x2: 1.15, y2: 0.55, color: 'mavi' },
        { x1: 1.4, y1: 0.25, x2: 1.55, y2: 0.55, color: 'yesil' },
        { x1: 1.8, y1: 0.25, x2: 1.95, y2: 0.55, color: 'sari' },
      ],
      pose: { x: 0.25, y: 0.4, theta: 0 },
    }),
    runMs: 25000,
    allowedBlocks: [...BASE_BLOCKS, 'rb_motors', 'rb_color_is', 'rb_color', 'controls_whileUntil', 'controls_if', 'logic_negate', 'logic_compare', 'logic_operation'],
    starter: () => project('Renk sırası', [onStart(motors(30, 30))]),
    goals: [
      usesBlocks('kosul', '"eğer" bloğunu kullan', ['controls_if']),
      goal('sira', 'Işıklar zeminle sırayla aynı renk: kırmızı → mavi → yeşil', (r) => {
        const at = ['kirmizi', 'mavi', 'yesil'].map((c) => r.colorLights.indexOf(`${c}:${c}`))
        return at.every((i, k) => i >= 0 && (k === 0 || i > at[k - 1]))
      }, 'Bir döngünün içinde: zemin kırmızıysa ışıkları kırmızı yap; mavi ve yeşil için de aynısını yap.'),
      goal('bitis', 'Sarı bitişte dur', (r) => r.stopped && r.color === 'sari'),
    ],
    solution: () => project('Renk sırası', [onStart(
      motors(30, 30),
      until(colorIs('sari'), [
        ifThen(colorIs('kirmizi'), [lights('kirmizi')]),
        ifThen(colorIs('mavi'), [lights('mavi')]),
        ifThen(colorIs('yesil'), [lights('yesil')]),
      ]),
      stopMotors(),
    )]),
  },
  {
    id: 'kavsak-say',
    chapter: 'sensorler',
    en: {
      title: 'Count the crossings',
      intro: 'Short lines cross the Mini Rover\'s track. When both line sensors see black, the robot is on a crossing. Count the crossings with a variable, stop on the 3rd one and show the number on the screen.',
      goals: {
        sayac: { text: 'Count with a variable' },
        dur: { text: 'Stop on the 3rd crossing', hint: 'Wait until both sensors see the line, add 1 to the counter, then wait until they leave the line.' },
        goster: { text: 'Show 3 on the screen' },
      },
    },
    title: 'Kavşak say',
    profile: 'gezgin',
    intro: 'Mini Gezgin\'in yolunu kısa çizgiler kesiyor. İki çizgi sensörü de siyahı görüyorsa robot bir kavşaktadır. Kavşakları bir değişkenle say, 3. kavşakta dur ve sayıyı ekranda göster.',
    scene: () => box('kavsak-say', 'Kavşak say', 2, 1, {
      lines: [[[0.1, 0.5], [1.9, 0.5]], [[0.6, 0.4], [0.6, 0.6]], [[1.0, 0.4], [1.0, 0.6]], [[1.4, 0.4], [1.4, 0.6]]],
      lineWidth: 0.025,
      zones: [{ id: 'k3', label: '3', kind: 'goal', x: 1.36, y: 0.5, r: 0.04 }],
      pose: { x: 0.25, y: 0.5, theta: 0 },
    }),
    runMs: 25000,
    allowedBlocks: [...BASE_BLOCKS, 'rb_motors', 'rb_line', 'controls_whileUntil', 'controls_repeat_ext', 'controls_if', 'logic_operation', 'logic_compare', 'logic_negate', 'variables_get', 'variables_set', 'mk_show_number'],
    starter: () => project('Kavşak say', [onStart(motors(30, 30))]),
    goals: [
      usesBlocks('sayac', 'Bir değişkenle say', ['variables_set']),
      goal('dur', '3. kavşakta dur', (r) => r.inZone('k3') && r.stopped, 'İki sensör de çizgiyi görene kadar bekle, sayaca 1 ekle, sonra çizgiden çıkana kadar bekle.'),
      showsNumber('goster', 'Ekranda 3 göster', 3),
    ],
    solution: () => {
      const ikisi = () => logicOp('AND', lineOn('left'), lineOn('right'))
      return project('Kavşak say', [onStart(
        setVar('kavsak', 0), motors(30, 30),
        until(cmp('EQ', getVar('kavsak'), 3), [whileLoop(ikisi(), []), until(ikisi()), changeVar('kavsak', 1)]),
        stopMotors(), showNumber(getVar('kavsak')),
      )])
    },
  },
  {
    id: 'sag-el',
    chapter: 'algoritmalar',
    en: {
      title: 'Maze (right-hand rule)',
      intro: 'The Block Robot is in a maze. Use the right-hand rule: drive until you get close to a wall, then look right; if the right side is closed too, turn around to the left. Repeat until the floor is green.',
      goals: {
        dongu: { text: 'Use a loop and a condition together' },
        cikis: { text: 'Reach the green exit and stop without crashing', hint: 'Repeat until green: drive until the distance is under 12; if close to a wall, turn right 90; if it is still under 25, turn left 180.' },
      },
    },
    title: 'Labirent (sağ el kuralı)',
    profile: 'blok',
    intro: 'Blok Robotu bir labirentte. Sağ el kuralını kullan: duvara yaklaşana kadar git, sonra sağa bak; sağ da kapalıysa sola doğru geri dön. Zemin yeşil olana kadar tekrarla.',
    scene: () => box('sag-el', 'Labirent', 2, 2, {
      walls: [...rectWalls(0, 0, 2, 2), ...rectWalls(0, 0.4, 1.6, 0.8), ...rectWalls(0.4, 1.2, 2, 1.6)],
      patches: [{ x1: 1.75, y1: 1.62, x2: 1.98, y2: 1.98, color: 'yesil' }],
      zones: [{ id: 'cikis', label: 'çıkış', kind: 'goal', x: 1.8, y: 1.8, r: 0.15 }],
      pose: { x: 0.2, y: 0.2, theta: 0 },
    }),
    runMs: 60000,
    allowedBlocks: [...BASE_BLOCKS, 'rb_motors', 'rb_move', 'rb_turn', 'rb_distance', 'rb_color_is', 'controls_whileUntil', 'controls_repeat_ext', 'controls_if', 'logic_compare', 'logic_operation', 'logic_negate'],
    starter: () => project('Labirent', [onStart()]),
    goals: [
      usesBlocks('dongu', 'Döngü ve koşulu birlikte kullan', ['controls_whileUntil', 'controls_if']),
      goal('cikis', 'Yeşil çıkışa çarpmadan ulaş ve dur', (r) => r.inZone('cikis') && r.stopped && r.collisions === 0,
        'Yeşil olana kadar tekrarla: mesafe 12\'nin altına inene kadar git; duvara yakınsan sağa 90 dön; hâlâ 25\'in altındaysa sola 180 dön.'),
    ],
    solution: () => project('Labirent', [onStart(
      until(colorIs('yesil'), [
        motors(40, 40),
        until(logicOp('OR', cmp('LT', distance(), 12), colorIs('yesil'))),
        stopMotors(),
        ifThen(cmp('LT', distance(), 12), [turn(90, 'right'), ifThen(cmp('LT', distance(), 25), [turn(180)])]),
      ]),
      stopMotors(),
    )]),
  },
  {
    id: 'nesne-tasi',
    chapter: 'algoritmalar',
    en: {
      title: 'Carry the cube',
      intro: 'The Gripper Robot has a red cube in front of it. Drive up to the cube, grab it with the gripper, carry it to the yellow area on the left and drop it there.',
      goals: {
        kiskac: { text: 'Use the gripper block' },
        tasi: { text: 'Drop the cube on the yellow area', hint: 'Drive until the distance is under 3 cm, close the gripper, turn left 90, drive 30 cm, open the gripper.' },
        geri: { text: 'Back away from the cube and stop without crashing' },
      },
    },
    title: 'Nesne taşı',
    profile: 'kiskac',
    intro: 'Kıskaçlı Robot\'un önünde kırmızı bir küp var. Küpe kadar git, kıskaçla tut, soldaki sarı alana taşı ve orada bırak.',
    scene: () => box('nesne-tasi', 'Nesne taşı', 1.6, 1.1, {
      patches: [{ x1: 0.52, y1: 0.8, x2: 0.76, y2: 1.02, color: 'sari' }],
      objects: [{ id: 'kup', x: 0.75, y: 0.5, color: 'kirmizi' }],
      pose: { x: 0.25, y: 0.5, theta: 0 },
    }),
    runMs: 20000,
    allowedBlocks: [...BASE_BLOCKS, 'rb_motors', 'rb_move', 'rb_turn', 'rb_distance', 'rb_grip', 'rb_holding', 'controls_whileUntil', 'controls_if', 'logic_compare'],
    starter: () => project('Nesne taşı', [onStart()]),
    goals: [
      usesBlocks('kiskac', 'Kıskaç bloğunu kullan', ['rb_grip']),
      goal('tasi', 'Küpü sarı alana bırak', (r) => cubeOn(r, 'kup', 'sari'), 'Mesafe 3 cm\'nin altına inene kadar git, kıskacı kapat, sola 90 dön, 30 cm git, kıskacı aç.'),
      goal('geri', 'Küpten geri çekil ve çarpmadan dur', (r) => cubeOn(r, 'kup', 'sari') && r.stopped && r.collisions === 0 && Math.hypot(r.x - r.object('kup')!.x, r.y - r.object('kup')!.y) > 0.15),
    ],
    solution: () => project('Nesne taşı', [onStart(
      motors(30, 30), whileLoop(cmp('GT', distance(), 3), []), stopMotors(), grip('close'), turn(90), move(30), grip('open'), move(15, 'back'),
    )]),
  },
  {
    id: 'hizli-tur',
    chapter: 'yarisma',
    en: {
      title: 'Fast lap',
      intro: `Race the Mini Rover around the oval track: pass checkpoints 1, 2 and 3 and reach the finish within ${LAP_LIMIT_S} seconds. Follow the line, but faster!`,
      goals: {
        tur: { text: 'Complete the lap: 1 → 2 → 3 → finish' },
        sure: { text: `Reach the finish within ${LAP_LIMIT_S} seconds`, hint: 'A faster robot overshoots the curves: use more power on the straights and turn with one wheel forward, the other backward.' },
      },
    },
    title: 'Hızlı tur',
    profile: 'gezgin',
    intro: `Mini Gezgin ile oval pistte yarış: 1, 2 ve 3. kontrol noktasından geç ve ${LAP_LIMIT_S} saniye içinde bitişe ulaş. Çizgiyi izle, ama daha hızlı!`,
    scene: () => box('hizli-tur', 'Hızlı tur', 2, 1.4, {
      lines: [oval(1, 0.7, 0.45, 0.4)],
      lineWidth: 0.025,
      zones: [
        { id: 'sag', label: '1', kind: 'checkpoint', x: 1.85, y: 0.7, r: 0.1 },
        { id: 'ust', label: '2', kind: 'checkpoint', x: 1, y: 1.1, r: 0.1 },
        { id: 'sol', label: '3', kind: 'checkpoint', x: 0.15, y: 0.7, r: 0.1 },
        { id: 'bitis', label: 'bitiş', kind: 'goal', x: 0.75, y: 0.3, r: 0.08 },
      ],
      pose: { x: 1, y: 0.3, theta: 0 },
    }),
    runMs: 40000,
    allowedBlocks: [...BASE_BLOCKS, 'rb_motors', 'rb_line', 'controls_if', 'logic_negate', 'logic_operation'],
    starter: () => project('Hızlı tur', [forever()]),
    goals: [
      goal('tur', 'Turu tamamla: 1 → 2 → 3 → bitiş', (r) => visitedInOrder(r, ['sag', 'ust', 'sol', 'bitis'])),
      goal('sure', `${LAP_LIMIT_S} saniye içinde bitişe ulaş`, (r) => visitedInOrder(r, ['sag', 'ust', 'sol', 'bitis']) && r.visitedAt.get('bitis')! <= LAP_LIMIT_S * 1000,
        'Hızlı robot virajlarda çizgiden kaçar: düzlükte gücü artır, dönerken bir tekeri ileri, ötekini geri çevir.'),
    ],
    solution: () => project('Hızlı tur', [forever(
      ifThen(lineOn('left'), [motors(-20, 70)], [ifThen(lineOn('right'), [motors(70, -20)], [motors(80, 80)])]),
    )]),
  },
  {
    id: 'sumo',
    chapter: 'yarisma',
    en: {
      title: 'Sumo ring',
      intro: 'The Block Robot is in a ring with a black edge. Push the red cube out of the ring, but never leave the ring yourself: when the color sensor sees black, back up and turn. Stay in the ring for at least 10 seconds.',
      goals: {
        sensor: { text: 'Use a color sensor block' },
        rakip: { text: 'Push the cube out of the ring' },
        icerde: { text: 'Stay inside the ring for 10 seconds', hint: 'Forever: if the floor is black, drive back 15 cm and turn 135 degrees; otherwise run the motors forward.' },
      },
    },
    title: 'Sumo halkası',
    profile: 'blok',
    intro: 'Blok Robotu kenarı siyah bir halkada. Kırmızı küpü halkanın dışına it, ama kendin hiç çıkma: renk sensörü siyahı görünce geri git ve dön. En az 10 saniye halkada kal.',
    scene: () => box('sumo', 'Sumo halkası', 1.4, 1.4, {
      lines: [oval(RING.x, RING.y, 0, RING.r, 36)],
      lineWidth: 0.03,
      objects: [{ id: 'rakip', x: 0.95, y: 0.7, color: 'kirmizi', size: 0.08 }],
      pose: { x: 0.4, y: 0.7, theta: 0 },
    }),
    runMs: 15000,
    allowedBlocks: [...BASE_BLOCKS, 'rb_motors', 'rb_move', 'rb_turn', 'rb_color_is', 'rb_reflect', 'rb_distance', 'controls_if', 'controls_whileUntil', 'logic_compare', 'logic_negate'],
    starter: () => project('Sumo', [forever()]),
    goals: [
      usesBlocks('sensor', 'Renk sensörü bloğunu kullan', ['rb_color_is', 'rb_reflect'], { any: true }),
      goal('rakip', 'Küpü halkanın dışına it', (r) => { const o = r.object('rakip')!; return Math.hypot(o.x - RING.x, o.y - RING.y) > RING.r + 0.02 }),
      goal('icerde', '10 saniye halkanın içinde kal', (r) => r.timeMs >= 10000 && r.distanceM > 1 && stayedWithin(r, RING.x, RING.y, RING.r),
        'Sürekli: zemin siyahsa 15 cm geri git ve 135 derece dön; değilse motorları ileri çalıştır.'),
    ],
    solution: () => project('Sumo', [forever(
      ifThen(colorIs('siyah'), [move(15, 'back'), turn(135)], [motors(50, 50)]),
    )]),
  },
  {
    id: 'renge-gore-ayir',
    chapter: 'yarisma',
    en: {
      title: 'Sort by color',
      intro: 'Two cubes are lined up in front of the Gripper Robot. Grab each cube, read its color with the gripper and carry it to its own area: red cubes to the red strip on the left, blue cubes to the blue strip on the right. The same steps work for both cubes: use a loop.',
      goals: {
        kosul: { text: 'Decide with "held cube is ... ?" and "if"' },
        kirmizi: { text: 'The red cube is on the red strip' },
        mavi: { text: 'The blue cube is on the blue strip', hint: 'Repeat 2 times: drive to the cube, close the gripper; if it is red turn left, otherwise turn right; drive 30, open, back 30 and turn back.' },
      },
    },
    title: 'Renge göre ayır',
    profile: 'kiskac',
    intro: 'Kıskaçlı Robot\'un önünde iki küp dizili. Her küpü tut, rengini kıskaçla oku ve kendi alanına taşı: kırmızı küpler soldaki kırmızı şeride, mavi küpler sağdaki mavi şeride. İki küp için de aynı adımlar çalışır: döngü kullan.',
    scene: () => box('renge-gore-ayir', 'Renge göre ayır', 1.8, 1.2, {
      patches: [
        { x1: 0.3, y1: 0.92, x2: 1.6, y2: 1.15, color: 'kirmizi' },
        { x1: 0.3, y1: 0.05, x2: 1.6, y2: 0.28, color: 'mavi' },
      ],
      objects: [{ id: 'k', x: 0.6, y: 0.6, color: 'kirmizi' }, { id: 'm', x: 1.1, y: 0.6, color: 'mavi' }],
      pose: { x: 0.2, y: 0.6, theta: 0 },
    }),
    runMs: 45000,
    allowedBlocks: [...BASE_BLOCKS, 'rb_motors', 'rb_move', 'rb_turn', 'rb_distance', 'rb_grip', 'rb_holding', 'rb_held_is', 'rb_color_is', 'controls_whileUntil', 'controls_repeat_ext', 'controls_if', 'logic_compare'],
    starter: () => project('Renge göre ayır', [onStart()]),
    goals: [
      usesBlocks('kosul', '"tutulan küp ... mi?" ve "eğer" ile karar ver', ['rb_held_is', 'controls_if']),
      goal('kirmizi', 'Kırmızı küp kırmızı şeritte', (r) => cubeOn(r, 'k', 'kirmizi')),
      goal('mavi', 'Mavi küp mavi şeritte', (r) => cubeOn(r, 'm', 'mavi'),
        '2 kez tekrarla: küpe git, kıskacı kapat; kırmızıysa sola, değilse sağa dön; 30 git, aç, 30 geri gel ve geri dön.'),
    ],
    solution: () => project('Renge göre ayır', [onStart(repeat(2, [
      motors(30, 30), whileLoop(cmp('GT', distance(), 3), []), stopMotors(), grip('close'),
      ifThen(heldIs('kirmizi'),
        [turn(90), move(30), grip('open'), move(30, 'back'), turn(90, 'right')],
        [turn(90, 'right'), move(30), grip('open'), move(30, 'back'), turn(90)]),
    ]))]),
  },
]

/** Görev sırası: bölüm bölüm, bölüm içinde kolaydan zora. */
const MISSION_ORDER = ['ilk-surus', 'park-et', 'kare', 'merdiven', 'slalom', 'duvarda-dur', 'engelden-don', 'renkte-dur', 'renk-sirasi', 'cizgi-izle', 'kavsak-say',
  'labirent', 'sag-el', 'nesne-tasi', 'hizli-tur', 'sumo', 'renge-gore-ayir']
const ALL_MISSIONS = [...CORE_MISSIONS, ...MORE_MISSIONS]
export const ROBOT_MISSIONS: RobotMission[] = MISSION_ORDER.map((id) => ALL_MISSIONS.find((m) => m.id === id)!)

/** Bölümün görevleri ve tamamlanan sayısı. */
export function chapterProgress(ch: ChapterId, done: ReadonlySet<string>): { missions: RobotMission[]; done: number } {
  const missions = ROBOT_MISSIONS.filter((m) => m.chapter === ch)
  return { missions, done: missions.filter((m) => done.has(m.id)).length }
}

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
  objects: [{ id: 'k1', x: 0.25, y: 1.15, color: 'kirmizi' }, { id: 'k2', x: 0.4, y: 1.15, color: 'mavi' }, { id: 'k3', x: 0.25, y: 0.25, color: 'yesil' }],
  pose: { x: 0.85, y: 0.4, theta: 0 },
})

/** Projeyi görevin sahnesinde başsız çalıştırır; program biter ve robot durursa erken bırakır. `profile`: görevi başka gövdeyle (ör. tasarlanan robot) dene. */
export function runMission(m: RobotMission, p: MikroProject, profile?: RobotProfile): Simulation {
  const sim = new Simulation(p, { robot: { profile: profile ?? m.profile, scene: m.scene() } })
  sim.start()
  for (let t = 0; t < m.runMs; t += 100) {
    sim.advance(100)
    if (sim.error || (!sim.card.runtime.busy && sim.robot!.stopped)) break
  }
  return sim
}

export function evaluateMission(m: RobotMission, p: MikroProject, profile?: RobotProfile): { status: GoalStatus[]; done: boolean; error: string | null } {
  const sim = runMission(m, p, profile)
  const { status } = evaluateGoals(m.goals, { sim, ws: p.workspace })
  return { status, done: status.every((s) => s.done), error: sim.error?.message ?? null }
}
