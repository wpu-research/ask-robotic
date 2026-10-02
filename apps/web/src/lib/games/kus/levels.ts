// Kuş oyunu seviyeleri: sabit açı → tekrar → engel → "alınana kadar" → koşul → konum okuma → hesaplanan açı → atan2.
import { b, program, seq } from '../program'
import type { LevelDef } from '../types'
import type { BirdLevelData } from './engine'

const hat = () => b('bird_basla')
const start = () => program(hat())
const run = (...blocks: ReturnType<typeof b>[]) => program(seq(hat(), ...blocks))
const heading = (a: number) => b('bird_heading', { ANGLE: a })
const rep = (n: number, ...body: ReturnType<typeof b>[]) => b('controls_repeat_ext', {}, { TIMES: n, DO: seq(...body) })
const forever = (...body: ReturnType<typeof b>[]) => b('controls_whileUntil', { MODE: 'WHILE' }, { BOOL: true, DO: seq(...body) })
const hasWorm = () => b('bird_has_worm')
const coord = (who: 'BIRD' | 'WORM' | 'NEST', axis: 'X' | 'Y') => b('bird_coord', { WHO: who, AXIS: axis })
const sub = (a: ReturnType<typeof b>, c: ReturnType<typeof b>) => b('math_arithmetic', { OP: 'MINUS' }, { A: a, B: c })
const cmp = (op: string, a: ReturnType<typeof b> | number, c: ReturnType<typeof b> | number) => b('logic_compare', { OP: op }, { A: a, B: c })
const angleTo = (t: 'WORM' | 'NEST') => b('bird_angle_to', { TARGET: t })
const headingValue = (v: ReturnType<typeof b>) => b('bird_heading_value', {}, { ANGLE: v })
const ifElse = (c: ReturnType<typeof b>, yes: ReturnType<typeof b>, no: ReturnType<typeof b>) =>
  b('controls_if', {}, { IF0: c, DO0: yes, ELSE: no }, { extraState: { hasElse: true } })
const ifElseIfElse = (c1: ReturnType<typeof b>, d1: ReturnType<typeof b>, c2: ReturnType<typeof b>, d2: ReturnType<typeof b>, no: ReturnType<typeof b>) =>
  b('controls_if', {}, { IF0: c1, DO0: d1, IF1: c2, DO1: d2, ELSE: no }, { extraState: { hasElse: true, elseIfCount: 1 } })

/** x ve y farkından atan2 ile bir hedefin yönü (seviye 10). */
const atanTo = (who: 'WORM' | 'NEST') =>
  headingValue(b('bird_atan2', {}, { DY: sub(coord(who, 'Y'), coord('BIRD', 'Y')), DX: sub(coord(who, 'X'), coord('BIRD', 'X')) }))

const d = (x: BirdLevelData): BirdLevelData => x

export const levels: LevelDef[] = [
  {
    id: 1,
    intro: 'Kuşu önce solucana, sonra yuvasına uçur! "Uç" bloğundaki sayıyı değiştirerek yön seç: 0° sağ, 90° yukarı.',
    hint: 'Solucan kuşun tam sağında: 0°. Yuva solucanın tam üstünde: 90°.',
    maxBlocks: 2,
    toolbox: ['bird_heading'],
    startBlocks: start(),
    data: d({ start: [60, 60], worm: [160, 60], nest: [160, 160] }),
    solution: run(heading(0), heading(90)),
  },
  {
    id: 2,
    intro: 'Bu sefer solucan çapraz yönde. Açı ne kadar olmalı? Sağ ile yukarının tam ortası!',
    hint: '45° tam çapraz. Yuva solucanın sağında, yani 0°.',
    maxBlocks: 2,
    toolbox: ['bird_heading'],
    startBlocks: start(),
    data: d({ start: [60, 60], worm: [130, 130], nest: [230, 130] }),
    solution: run(heading(45), heading(0)),
  },
  {
    id: 3,
    intro: 'Hedefler uzakta! Kuş bir kanat çırpışında en fazla 100 adım uçar. "Tekrarla" ile aynı yöne birkaç kez uç.',
    hint: 'Solucan 2 çırpış sağda, yuva 2 çırpış yukarıda.',
    maxBlocks: 4,
    toolbox: ['bird_heading', 'controls_repeat_ext'],
    startBlocks: start(),
    data: d({ start: [50, 100], worm: [250, 100], nest: [250, 300] }),
    solution: run(rep(2, heading(0)), rep(2, heading(90))),
  },
  {
    id: 4,
    intro: 'Dikkat, taş duvar var! Duvara çarparsan oyun biter. Duvarın bittiği yerden dolaş.',
    hint: 'Duvar sağda biter. Önce sağa, sonra yukarı, sonra sola doğru uç (180° sol).',
    maxBlocks: 6,
    toolbox: ['bird_heading', 'controls_repeat_ext'],
    startBlocks: start(),
    data: d({ start: [50, 50], worm: [350, 250], nest: [50, 250], walls: [{ x: 0, y: 145, w: 300, h: 10 }] }),
    solution: run(rep(3, heading(0)), rep(2, heading(90)), rep(3, heading(180))),
  },
  {
    id: 5,
    intro: 'Kaç kez uçacağını bilmiyorsan "solucan alınana kadar tekrarla" kullan. Sonra yuvaya ulaşana kadar uç!',
    hint: 'Önce: solucan alındı mı olana kadar 30° uç. Sonra "sürekli tekrarla" ile 90° uç. Yuvaya varınca program durur.',
    maxBlocks: 7,
    toolbox: ['bird_heading', 'controls_whileUntil', 'bird_has_worm', 'logic_boolean'],
    startBlocks: start(),
    data: d({ start: [50, 50], worm: [266, 175], nest: [266, 360] }),
    solution: run(
      b('controls_whileUntil', { MODE: 'UNTIL' }, { BOOL: hasWorm(), DO: heading(30) }),
      forever(heading(90)),
    ),
  },
  {
    id: 6,
    intro: 'Tek bir döngüde karar ver: solucan alındıysa yuvaya, alınmadıysa solucana doğru uç.',
    hint: '"Sürekli tekrarla" içine "eğer solucan alındı mı ise 180° uç, değilse 45° uç" koy.',
    maxBlocks: 6,
    toolbox: ['bird_heading', 'controls_whileUntil', 'controls_if', 'bird_has_worm', 'logic_boolean'],
    startBlocks: start(),
    data: d({ start: [50, 50], worm: [250, 250], nest: [50, 250] }),
    solution: run(forever(ifElse(hasWorm(), heading(180), heading(45)))),
  },
  {
    id: 7,
    intro: 'Duvarı aşmak için yüksekliğe bak! Kuşun y konumu 250\'den küçükse yukarı, değilse sağa uç. Sonra yuvaya in.',
    hint: 'Üç durum var: solucan alındı → aşağı (270°); y < 250 → yukarı (90°); yoksa sağa (0°). "değilse eğer" kullan.',
    maxBlocks: 10,
    toolbox: ['bird_heading', 'controls_whileUntil', 'controls_if', 'logic_compare', 'bird_coord', 'bird_has_worm', 'logic_boolean'],
    startBlocks: start(),
    data: d({ start: [50, 50], worm: [350, 250], nest: [350, 50], walls: [{ x: 195, y: 0, w: 10, h: 230 }] }),
    solution: run(forever(ifElseIfElse(hasWorm(), heading(270), cmp('LT', coord('BIRD', 'Y'), 250), heading(90), heading(0)))),
  },
  {
    id: 8,
    intro: 'Çapraz taş kutular yolu kapatıyor. Kuşun x ve y konumunu karşılaştırarak merdiven gibi çık!',
    hint: 'y büyükse sağa (0°), değilse yukarı (90°) uç. Solucanı alınca 270° ile aşağı in.',
    maxBlocks: 11,
    toolbox: ['bird_heading', 'controls_whileUntil', 'controls_if', 'logic_compare', 'bird_coord', 'bird_has_worm', 'logic_boolean'],
    startBlocks: start(),
    data: d({
      start: [50, 50], worm: [350, 350], nest: [350, 50],
      walls: [{ x: 80, y: 80, w: 40, h: 40 }, { x: 180, y: 180, w: 40, h: 40 }, { x: 280, y: 280, w: 40, h: 40 }],
    }),
    solution: run(forever(ifElseIfElse(hasWorm(), heading(270), cmp('GT', coord('BIRD', 'Y'), coord('BIRD', 'X')), heading(0), heading(90)))),
  },
  {
    id: 9,
    intro: 'Solucan her seferinde başka yerde olabilir! Açıyı elle yazamazsın; "solucanın yönü" ve "yuvanın yönü" bloklarını kullan.',
    hint: '"Sürekli tekrarla: eğer solucan alındıysa yuvanın yönünde uç, değilse solucanın yönünde uç."',
    maxBlocks: 9,
    toolbox: ['bird_heading_value', 'bird_angle_to', 'controls_whileUntil', 'controls_if', 'bird_has_worm', 'logic_boolean'],
    startBlocks: start(),
    data: d({ start: [50, 50], worm: [220, 280], nest: [350, 60], random: { worm: { x: [60, 340], y: [180, 340] } } }),
    solution: run(forever(ifElse(hasWorm(), headingValue(angleTo('NEST')), headingValue(angleTo('WORM'))))),
  },
  {
    id: 10,
    intro: 'Son görev: yön hazır değil! Solucan ve yuvanın konumundan açıyı kendin bul. İpucu: atan2 (dy, dx) yönü verir.',
    hint: 'dy = hedefin y\'si − kuşun y\'si, dx = hedefin x\'i − kuşun x\'i. Solucan alındıysa hedef yuvadır, değilse solucan.',
    maxBlocks: 22,
    toolbox: ['bird_heading_value', 'bird_atan2', 'bird_coord', 'math_arithmetic', 'controls_whileUntil', 'controls_if', 'bird_has_worm', 'logic_boolean'],
    startBlocks: start(),
    data: d({
      start: [50, 50], worm: [300, 300], nest: [80, 320],
      random: { worm: { x: [100, 340], y: [100, 340] }, nest: { x: [60, 340], y: [60, 340] } },
    }),
    solution: run(forever(ifElse(hasWorm(), atanTo('NEST'), atanTo('WORM')))),
  },
]
