// Kaplumbağa: 10 seviye. Hedefler `geometry.ts` şablonlarıyla (yürüyüşten bağımsız) tanımlı.
import { b, program, seq, varField, type ProgramBlock } from '../program'
import type { LevelDef } from '../types'
import type { TurtleLevelData } from './engine'
import { COLOURS as C, dir, line, ngon, polyline, type Stroke } from './geometry'

// ---- Çözüm kurucuları ----
const ileri = (n: number | ProgramBlock) => b('kaplumbaga_ileri', {}, { DIST: n })
const saga = (n: number | ProgramBlock) => b('kaplumbaga_saga', {}, { ANGLE: n })
const kaldir = () => b('kaplumbaga_kalem_kaldir')
const indir = () => b('kaplumbaga_kalem_indir')
const kalinlik = (n: number) => b('kaplumbaga_kalinlik', {}, { WIDTH: n })
const renk = (hex: string): ProgramBlock => {
  const blk = b('kaplumbaga_renk')
  blk.inputs = { COLOUR: { shadow: b('kaplumbaga_renk_sec', { COLOUR: hex }) } }
  return blk
}
const tekrar = (n: number, ...body: ProgramBlock[]) => b('controls_repeat_ext', {}, { TIMES: n, DO: seq(...body) })
const get = (name: string) => b('variables_get', { VAR: varField(name) })
const carp = (a: ProgramBlock | number, c: ProgramBlock | number) => b('math_arithmetic', { OP: 'MULTIPLY' }, { A: a, B: c })
const tanim = (name: string, ...body: ProgramBlock[]) => b('procedures_defnoreturn', { NAME: name }, { STACK: seq(...body) }, { extraState: { params: [] } })
const cagir = (name: string) => b('procedures_callnoreturn', {}, {}, { extraState: { name, params: [] } })

const data = (start: { x: number; y: number; heading?: number }, target: Stroke[], extra: Partial<TurtleLevelData> = {}): TurtleLevelData =>
  ({ start: { x: start.x, y: start.y, heading: start.heading ?? 0 }, target, ...extra })

// ---- Hedef şablonları ----
const sq: [number, number][] = [[150, 250], [150, 150], [250, 150], [250, 250]]
const L1 = data({ x: 150, y: 250 }, polyline(sq, { closed: true }))

const L2 = data({ x: 140, y: 270 }, ngon([140, 270], 0, 120, 3))

const L3 = data({ x: 160, y: 270 }, ngon([160, 270], 0, 120, 5, { skip: 2 }))

const L4 = data({ x: 60, y: 200, heading: 90 }, Array.from({ length: 7 }, (_, k) => line(60 + 40 * k, 200, 80 + 40 * k, 200)))

const L5 = data({ x: 150, y: 250 }, [
  line(150, 250, 150, 150, C.kirmizi), line(150, 150, 250, 150, C.turuncu),
  line(250, 150, 250, 250, C.yesil), line(250, 250, 150, 250, C.mavi),
], { colours: true })

const house: Stroke[] = [
  ...polyline([[150, 300], [150, 200], [250, 200], [250, 300]], { closed: true, colour: C.mavi, width: 10 }),
  ...polyline([[150, 200], [200, 200 - 50 * Math.sqrt(3)], [250, 200]], { colour: C.kirmizi, width: 10 }),
]
const L6 = data({ x: 150, y: 300 }, house, { colours: true, width: true })

// Kare sarmalı: i. kenar 8·i uzunluğunda, 90°·(i-1) yönünde.
function spiral(start: [number, number], count: number, len: (i: number) => number, turn: number, colour?: (i: number) => string): Stroke[] {
  const out: Stroke[] = []
  let [x, y] = start
  for (let i = 1; i <= count; i++) {
    const [dx, dy] = dir(turn * (i - 1))
    const l = len(i)
    out.push(line(x, y, x + dx * l, y + dy * l, colour?.(i)))
    x += dx * l; y += dy * l
  }
  return out
}
const L7 = data({ x: 200, y: 200 }, spiral([200, 200], 24, (i) => 8 * i, 90))

const L8 = data({ x: 200, y: 200 }, Array.from({ length: 12 }, (_, k) => ngon([200, 200], 30 * k, 60, 4)).flat())

const petals: Stroke[] = []
for (let i = 1; i <= 8; i++) {
  const h = 45 * (i - 1)
  const [a, bb] = [dir(h), dir(h + 60)]
  const p0: [number, number] = [200, 200]
  const p1: [number, number] = [p0[0] + 60 * a[0], p0[1] + 60 * a[1]]
  const p2: [number, number] = [p1[0] + 60 * bb[0], p1[1] + 60 * bb[1]]
  const p3: [number, number] = [p0[0] + 60 * bb[0], p0[1] + 60 * bb[1]]
  petals.push(...polyline([p0, p1, p2, p3], { closed: true, colour: i % 2 === 0 ? C.kirmizi : C.mavi }))
}
const L9 = data({ x: 200, y: 200 }, petals, { colours: true })

const L10 = data({ x: 200, y: 200 }, spiral([200, 200], 36, (i) => 4 * i, 60))

// ---- Seviyeler ----
const MOVE = ['kaplumbaga_ileri', 'kaplumbaga_saga']

export const levels: LevelDef[] = [
  {
    id: 1,
    intro: 'Kaplumbağa bir kare çizmek istiyor! Gri şablonun üstünden geçecek şekilde 100 adım ileri git, sonra sağa 90 derece dön. Bunu dört kez yap.',
    hint: 'Önce "ileri git 100", sonra "sağa dön 90" bloğunu bağla. Aynı iki bloğu dört kez alt alta dizersen kare tamamlanır.',
    en: { intro: 'The turtle wants to draw a square! Move forward 100 steps over the grey outline, then turn right 90 degrees. Do this four times.', hint: 'First snap on "move forward 100", then "turn right 90". Stack the same two blocks four times and the square is done.' },
    toolbox: MOVE,
    data: L1,
    solution: program(seq(ileri(100), saga(90), ileri(100), saga(90), ileri(100), saga(90), ileri(100), saga(90))),
  },
  {
    id: 2,
    intro: 'Şimdi üçgen zamanı! Aynı blokları tekrar tekrar dizmek yerine "tekrarla" bloğunu kullan. En fazla 3 blokla eşkenar üçgeni çiz (kenar 120).',
    hint: 'Üçgenin üç kenarı var. Her köşede kaplumbağa 120 derece dönmeli (360 ÷ 3).',
    en: { intro: 'Now it\'s triangle time! Instead of stacking the same blocks again and again, use the "repeat" block. Draw an equilateral triangle (side 120) with at most 3 blocks.', hint: 'A triangle has three sides. At each corner the turtle must turn 120 degrees (360 ÷ 3).' },
    maxBlocks: 3,
    toolbox: ['controls_repeat_ext', ...MOVE],
    data: L2,
    solution: program(tekrar(3, ileri(120), saga(120))),
  },
  {
    id: 3,
    intro: 'Beş köşeli bir yıldız çiz! Kenar uzunluğu 120. Yıldızın köşelerinde kaplumbağa çok keskin döner.',
    hint: 'Yıldız beş çizgiden oluşur. Her çizgiden sonra 144 derece sağa dön (5 × 144 = 720, yani iki tam tur).',
    en: { intro: 'Draw a five-pointed star! Each side is 120 long. At the star\'s points the turtle turns very sharply.', hint: 'A star is made of five lines. After each line turn right 144 degrees (5 × 144 = 720, that\'s two full turns).' },
    maxBlocks: 3,
    toolbox: ['controls_repeat_ext', ...MOVE, 'kaplumbaga_sola'],
    data: L3,
    solution: program(tekrar(5, ileri(120), saga(144))),
  },
  {
    id: 4,
    intro: 'Kesik çizgi çiz! Kaplumbağa sağa bakıyor. 20 adım çiz, kalemi kaldırıp 20 adım atla, kalemi geri indir. Bunu 7 kez tekrarla.',
    hint: '"Kalemi kaldır" bloğundan sonra kaplumbağa yürür ama iz bırakmaz. İçeride: çiz, kaldır, atla, indir.',
    en: { intro: 'Draw a dashed line! The turtle is facing right. Draw 20 steps, lift the pen and skip 20 steps, then put the pen down again. Repeat this 7 times.', hint: 'After "pen up" the turtle walks but leaves no line. Inside the loop: draw, lift, skip, put down.' },
    maxBlocks: 6,
    toolbox: ['controls_repeat_ext', 'kaplumbaga_ileri', 'kaplumbaga_kalem_kaldir', 'kaplumbaga_kalem_indir', 'kaplumbaga_saga'],
    data: L4,
    solution: program(tekrar(7, ileri(20), kaldir(), ileri(20), indir())),
  },
  {
    id: 5,
    intro: 'Renkli kare! Sol kenar kırmızı, üst kenar turuncu, sağ kenar yeşil, alt kenar mavi olsun. Her kenardan önce kalem rengini değiştir.',
    hint: 'Önce "rengi … yap" bloğuyla rengi seç, sonra ileri git, sonra sağa dön. Bunu her kenar için yeniden yap.',
    en: { intro: 'A colourful square! Make the left side red, the top orange, the right side green and the bottom blue. Change the pen colour before each side.', hint: 'First pick the colour with "set colour to …", then move forward, then turn right. Do it again for every side.' },
    toolbox: ['kaplumbaga_renk', ...MOVE],
    data: L5,
    solution: program(seq(
      renk(C.kirmizi), ileri(100), saga(90), renk(C.turuncu), ileri(100), saga(90),
      renk(C.yesil), ileri(100), saga(90), renk(C.mavi), ileri(100), saga(90),
    )),
  },
  {
    id: 6,
    intro: 'Kalın çizgilerle mavi bir ev çiz ve çatısını kırmızı yap! Önce kalem kalınlığını 10 yap. Duvarlar kare, çatı ise iki eşkenar üçgen kenarı.',
    hint: 'Kareyi bitirince kaplumbağa başladığı köşeye döner. Kalemi kaldırıp 100 ileri git (evin köşesine), kalemi indir, rengi kırmızı yap. Sağa 30 dön, ileri 100, sağa 120, ileri 100.',
    en: { intro: 'Draw a blue house with thick lines and give it a red roof! First set the pen width to 10. The walls are a square and the roof is two sides of an equilateral triangle.', hint: 'When the square is done, the turtle is back at its starting corner. Lift the pen and move forward 100 (to the corner of the house), put the pen down, set the colour to red. Turn right 30, forward 100, turn right 120, forward 100.' },
    toolbox: ['controls_repeat_ext', 'kaplumbaga_kalinlik', 'kaplumbaga_renk', 'kaplumbaga_kalem_kaldir', 'kaplumbaga_kalem_indir', ...MOVE],
    data: L6,
    solution: program(seq(
      kalinlik(10), renk(C.mavi), tekrar(4, ileri(100), saga(90)),
      kaldir(), ileri(100), indir(), renk(C.kirmizi), saga(30), ileri(100), saga(120), ileri(100),
    )),
  },
  {
    id: 7,
    intro: 'Kare sarmalı çiz! Her kenar bir öncekinden 8 adım uzun olsun: 8, 16, 24… Bir "uzunluk" değişkeni kullan, her kenardan sonra 8 artır. Toplam 24 kenar.',
    hint: '"uzunluk" değişkenini 8 yap. Tekrarla (24): ileri git (uzunluk), sağa dön 90, "uzunluk" değişkenini 8 artır.',
    en: { intro: 'Draw a square spiral! Each side is 8 steps longer than the one before: 8, 16, 24… Use a "uzunluk" (length) variable and add 8 after each side. 24 sides in total.', hint: 'Set the "uzunluk" variable to 8. Repeat (24): move forward (uzunluk), turn right 90, change "uzunluk" by 8.' },
    maxBlocks: 7,
    toolbox: ['controls_repeat_ext', ...MOVE, 'variables_set', 'variables_get', 'math_change'],
    data: L7,
    solution: program(seq(
      b('variables_set', { VAR: varField('uzunluk') }, { VALUE: 8 }),
      tekrar(24, ileri(get('uzunluk')), saga(90), b('math_change', { VAR: varField('uzunluk') }, { DELTA: 8 })),
    )),
  },
  {
    id: 8,
    intro: 'Kendi bloğunu yap! "kare" adında bir işlev tanımla (kenar 60). Sonra onu 12 kez çağır; her çağrıdan sonra sağa 30 dön. Güzel bir rozet çıkacak!',
    hint: '"İşlevler" çekmecesinden yeni bir işlev oluştur ve adını "kare" yap. İçine tekrarla 4 { ileri 60, sağa 90 } koy. Ana programda tekrarla 12 { kare, sağa 30 }.',
    en: { intro: 'Make your own block! Define a function called "kare" (square, side 60). Then call it 12 times, turning right 30 after each call. A pretty badge will appear!', hint: 'Create a new function from the "Functions" drawer and name it "kare". Put repeat 4 { forward 60, right 90 } inside. In the main program: repeat 12 { kare, right 30 }.' },
    maxBlocks: 9,
    toolbox: ['controls_repeat_ext', ...MOVE, 'procedures_defnoreturn', 'procedures_callnoreturn'],
    data: L8,
    solution: program(
      tanim('kare', tekrar(4, ileri(60), saga(90))),
      tekrar(12, cagir('kare'), saga(30)),
    ),
  },
  {
    id: 9,
    intro: 'Çiçek zamanı! Yaprak şekli: kenarı 60 olan bir baklava dilimi (60° ve 120° dönüşlerle). Sekiz yaprağı 45° arayla çiz; tek sıradakiler mavi, çift sıradakiler kırmızı olsun.',
    hint: 'Yaprak işlevi: tekrarla 2 { ileri 60, sağa 60, ileri 60, sağa 120 }. "i değerini 2\'ye böl, kalan 0 mı?" diye sorarak rengi seç. Her yapraktan sonra sağa 45 dön.',
    en: { intro: 'Flower time! The petal is a diamond with sides of 60 (turns of 60° and 120°). Draw eight petals 45° apart; odd ones blue, even ones red.', hint: 'Petal function: repeat 2 { forward 60, right 60, forward 60, right 120 }. Pick the colour by asking "is the remainder of i ÷ 2 equal to 0?". Turn right 45 after each petal.' },
    maxBlocks: 17,
    toolbox: [
      'controls_for', 'controls_if', 'logic_compare', 'math_modulo', 'variables_get', 'controls_repeat_ext',
      'kaplumbaga_renk', ...MOVE, 'procedures_defnoreturn', 'procedures_callnoreturn',
    ],
    data: L9,
    solution: program(
      tanim('yaprak', tekrar(2, ileri(60), saga(60), ileri(60), saga(120))),
      b('controls_for', { VAR: varField('i') }, {
        FROM: 1, TO: 8, BY: 1,
        DO: seq(
          b('controls_if', {}, {
            IF0: b('logic_compare', { OP: 'EQ' }, { A: b('math_modulo', {}, { DIVIDEND: get('i'), DIVISOR: 2 }), B: 0 }),
            DO0: renk(C.kirmizi),
            ELSE: renk(C.mavi),
          }, { extraState: { hasElse: true } }),
          cagir('yaprak'),
          saga(45),
        ),
      }),
    ),
  },
  {
    id: 10,
    intro: 'Büyük final: gökkuşağı sarmalı! Her adımda kalem rengini değiştir. i. adımda 4 × i adım ileri git ve 60° sağa dön. i = 1\'den 36\'ya kadar say.',
    hint: '"say" döngüsünde i değişkeni 1\'den 36\'ya gider. Renk için "ton" bloğuna i × 10 koy. İleri git için de i × 4 kullan.',
    en: { intro: 'Big finale: a rainbow spiral! Change the pen colour at every step. At step i, move forward 4 × i steps and turn right 60°. Count i from 1 to 36.', hint: 'In the "count" loop the variable i goes from 1 to 36. For the colour put i × 10 into the "hue" block. Use i × 4 for moving forward too.' },
    maxBlocks: 10,
    toolbox: ['controls_for', 'variables_get', 'math_arithmetic', 'kaplumbaga_renk', 'kaplumbaga_renk_ton', ...MOVE],
    data: L10,
    solution: program(
      b('controls_for', { VAR: varField('i') }, {
        FROM: 1, TO: 36, BY: 1,
        DO: seq(
          (() => { const r = b('kaplumbaga_renk'); r.inputs = { COLOUR: { block: b('kaplumbaga_renk_ton', {}, { HUE: carp(get('i'), 10) }) } }; return r })(),
          ileri(carp(get('i'), 4)),
          saga(60),
        ),
      }),
    ),
  },
]
