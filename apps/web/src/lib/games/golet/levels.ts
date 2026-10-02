// Gölet meydan okumaları: 10 seviye. Seviye 1–5: her seviyede yeni bir rakip; 6–10: üç rakibe karşı tek başına.
import { b, program, seq, varField, type ProgramBlock } from '../program'
import type { LevelDef } from '../types'
import type { PondData } from './sim'

const me = { x: 20, y: 50, dir: 0 }
const V = (n: string) => b('variables_get', { VAR: varField(n) })

/** Blok çözümleri için ortak parçalar. */
const tara = (dir: ProgramBlock) => b('golet_tara', {}, { DIR: dir })
const ates = (dir: ProgramBlock | number, range: ProgramBlock | number) => b('golet_ates', {}, { DIR: dir, RANGE: range })
const yuz = (dir: ProgramBlock | number, speed: number) => b('golet_yuz', {}, { DIR: dir, SPEED: speed })
const lt = (a: ProgramBlock, n: number) => b('logic_compare', { OP: 'LT' }, { A: a, B: n })
const plus = (a: ProgramBlock, n: number) => b('math_arithmetic', { OP: 'ADD' }, { A: a, B: n })
const surekli = (...body: ProgramBlock[]) => b('golet_surekli', {}, { DO: seq(...body) })
/** Tüm yönleri 5°'lik adımlarla tarar; rakip görünce `onSee` blokları çalışır. */
const sweep = (...onSee: ProgramBlock[]) =>
  b('controls_for', { VAR: varField('aci') }, { FROM: 0, TO: 355, BY: 5, DO: b('controls_if', {}, { IF0: lt(tara(V('aci')), 900), DO0: seq(...onSee) }) })
const shootSeen = () => ates(V('aci'), tara(V('aci')))
/** Gördüğüne ateş et, sonra gördüğü yöne DİK yüz (rakibin etrafında dönerek kaçınır). */
const shootAndOrbit = (speed = 100) => [shootSeen(), yuz(plus(V('aci'), 90), speed)]

/** Oyuncunun (20,50) topunun menzilinde (70) kalan bölge. */
/** Final çözümü: her 20 tikte yan yönü değiştir (rakibin tahmini şaşsın). */
const zigzag = () => [
  b('math_change', { VAR: varField('n') }, { DELTA: 1 }),
  b('controls_for', { VAR: varField('aci') }, {
    FROM: 0, TO: 355, BY: 5,
    DO: b('controls_if', {}, {
      IF0: lt(tara(V('aci')), 900),
      DO0: seq(
        shootSeen(),
        b('controls_if', {}, {
          IF0: b('logic_compare', { OP: 'LT' }, { A: b('math_modulo', {}, { DIVIDEND: V('n'), DIVISOR: 40 }), B: 20 }),
          DO0: yuz(plus(V('aci'), 90), 100),
          ELSE: yuz(plus(V('aci'), 270), 100),
        }, { extraState: { hasElse: true } }),
      ),
    }),
  }),
]

const FOES_BOX: [number, number, number, number] = [45, 20, 78, 80]
const MID = { x: 50, y: 50, dir: 0 }
const WEST = { x: 12, y: 50, dir: 0 }
const RIGHT: [number, number, number, number] = [40, 8, 92, 92]
const ALL: [number, number, number, number] = [8, 8, 92, 92]

const data = (foes: PondData['foes'], maxTicks: number, player = me): PondData => ({ player, foes, maxTicks })

const SWEEP_TB = ['math_number', 'golet_tara', 'golet_ates', 'golet_surekli', 'controls_for', 'controls_if', 'logic_compare', 'variables_get', 'variables_set']

export const levels: LevelDef[] = [
  {
    id: 1,
    intro: 'Dümdüz ördek hep aynı yerde duruyor: tam sağında, 55 birim ötede. Topunu ona doğrult ve patlat!',
    hint: '"Top at" bloğuna yön 0° (sağ) ve menzil 55 yaz. Top her 16 tikte bir hazır olur (hazır değilken atış boşa gider). Bir "tekrarla" bloğuyla yüz kez dene.',
    maxBlocks: 5,
    toolbox: ['golet_ates', 'controls_repeat_ext', 'math_number'],
    data: data([{ kind: 'sitter', x: 75, y: 50 }], 700),
    solution: program(b('controls_repeat_ext', {}, { TIMES: 100, DO: ates(0, 55) })),
  },
  {
    id: 2,
    intro: 'Dümdüz bu sefer sağ üst köşeye doğru, tam çaprazında duruyor: yön 45°, uzaklık 64. Maç bitene kadar ateş et!',
    hint: 'Yön 45°, menzil 64 yaz. "Maç bitene kadar tekrarla" bloğu sayı saymanı gerektirmez.',
    maxBlocks: 5,
    toolbox: ['golet_ates', 'golet_surekli', 'controls_repeat_ext', 'math_number'],
    data: data([{ kind: 'sitter', x: 70, y: 70 }], 800, { x: 25, y: 25, dir: 0 }),
    solution: program(surekli(ates(45, 64))),
  },
  {
    id: 3,
    intro: 'Bu kez Dümdüz\'ün nerede durduğunu bilmiyorsun! Etrafı tara, rakibi bulunca o yöne ateş et.',
    hint: '"Tara" bloğu o yöndeki rakibin uzaklığını verir, kimse yoksa 999 verir. 0°\'den 355°\'ye 5\'er 5\'er sayan bir "say" döngüsü kur; uzaklık 900\'den küçükse o yöne ateş et.',
    maxBlocks: 14,
    toolbox: SWEEP_TB,
    data: data([{ kind: 'sitter', region: FOES_BOX }], 1200),
    solution: program(surekli(sweep(shootSeen()))),
  },
  {
    id: 4,
    intro: 'Gezgin ördek havuzda dolaşıyor, ama top atmıyor. Hareket eden hedefi vurmak için sürekli yeniden tara!',
    hint: 'Gezgin yavaş yüzer. Her turda yeniden tara ve görür görmez ateş et; hedef çok uzaklaşmadan top patlar.',
    maxBlocks: 14,
    toolbox: SWEEP_TB,
    data: data([{ kind: 'wanderer', region: [45, 25, 80, 75] }], 1500),
    solution: program(surekli(sweep(shootSeen()))),
  },
  {
    id: 5,
    intro: 'Avcı ördek seni görünce ateş ediyor! Yerinde durursan vurulursun: ateş et ve yüzerek kaç.',
    hint: 'Rakibi görünce ateş et, sonra "yüz" bloğunda yönü rakibin yönü + 90° yap, hızı 100 seç: yan yan yüzen ördeği vurmak zordur.',
    maxBlocks: 20,
    toolbox: [...SWEEP_TB, 'golet_yuz', 'math_arithmetic'],
    data: data([{ kind: 'hunter', x: 80, y: 50 }], 1500),
    solution: program(surekli(sweep(...shootAndOrbit()))),
  },
  {
    id: 6,
    intro: 'Üç Dümdüz birden! Hepsi hareketsiz ama nerede olduklarını bilmiyorsun. Hepsini batır.',
    hint: 'Bir rakip batınca tarama diğerini bulur. Aynı tarayıp ateş etme programı üçü için de işe yarar.',
    maxBlocks: 14,
    toolbox: SWEEP_TB,
    data: data([{ kind: 'sitter', region: ALL }, { kind: 'sitter', region: ALL }, { kind: 'sitter', region: ALL }], 2000, MID),
    solution: program(surekli(sweep(shootSeen()))),
  },
  {
    id: 7,
    intro: 'İki Gezgin ve bir Dümdüz var. Hepsi seninle uğraşmıyor ama hedefler hareketli. Sabırla hepsini bul ve vur.',
    hint: 'Süre yeterli ama boşa top atma: sadece "tara" bir rakip gösterdiğinde ateş et.',
    maxBlocks: 14,
    toolbox: SWEEP_TB,
    data: data([{ kind: 'wanderer', region: ALL }, { kind: 'wanderer', region: ALL }, { kind: 'sitter', region: ALL }], 2200, MID),
    solution: program(surekli(sweep(shootSeen()))),
  },
  {
    id: 8,
    intro: 'Avcı, Gezgin ve Dümdüz bir arada. Avcı herkese ateş eder: önce yüzmeyi unutma, sonra vur!',
    hint: 'Aynı kaçış işe yarar: ateş et, sonra rakibin yönü + 90° yüz. Tek yerde durma!',
    maxBlocks: 20,
    toolbox: [...SWEEP_TB, 'golet_yuz', 'math_arithmetic'],
    data: data([{ kind: 'hunter', region: ALL }, { kind: 'wanderer', region: ALL }, { kind: 'sitter', region: ALL }], 2200, MID),
    solution: program(surekli(sweep(...shootAndOrbit()))),
  },
  {
    id: 9,
    intro: 'Nişancı hareket eden hedeflerin gideceği yeri tahmin edip önüne ateş eder. Yanında Avcı ve Gezgin var. Dikkatli ol!',
    hint: 'Nişancı durağan ördekleri çok sever. Yan yan yüzmek ve hızı 100 yapmak onu şaşırtır.',
    maxBlocks: 24,
    toolbox: [...SWEEP_TB, 'golet_yuz', 'golet_can', 'math_arithmetic', 'logic_operation'],
    data: data([{ kind: 'sniper', region: RIGHT }, { kind: 'hunter', region: RIGHT }, { kind: 'wanderer', region: RIGHT }], 2400, WEST),
    solution: program(surekli(sweep(...shootAndOrbit()))),
  },
  {
    id: 10,
    intro: 'Büyük final! Usta, Nişancı ve Avcı bir arada. Hepsine karşı havuzun son ördeği sen ol.',
    hint: 'Hep aynı yöne dönersen Usta nereye gideceğini tahmin eder. Bir sayaç tut ve her 20 tikte yüzme yönünü değiştir (+90° ile +270° arasında).',
    maxBlocks: 38,
    toolbox: [...SWEEP_TB, 'golet_yuz', 'golet_can', 'golet_x', 'golet_y', 'math_arithmetic', 'math_modulo', 'math_change', 'logic_operation'],
    data: data([{ kind: 'master', region: RIGHT }, { kind: 'sniper', region: RIGHT }, { kind: 'hunter', region: RIGHT }], 2600, WEST),
    solution: program(surekli(...zigzag())),
  },
]
