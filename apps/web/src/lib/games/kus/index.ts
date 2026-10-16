// Kuş (Bird): kuşu açıyla uçurup solucanı yakalat ve yuvaya götür. Konu: açı (trigonometri), koşul, döngü, konum okuma.
import { buildToolbox } from '../toolbox'
import type { GameBlockDef, GameDef, LevelDef } from '../types'
import { createBirdRun, type BirdState } from './engine'
import { levels } from './levels'

export const KUS_STEP_DELAY = 650

const FLIGHT = '#4c97ff'
const SENSE = '#ffab19'
const MATH = '#5b67a5'

export const blocks: GameBlockDef[] = [
  { type: 'bird_basla', category: 'Uçuş', colour: FLIGHT, hat: true, json: { message0: 'kuş uçsun', nextStatement: null, tooltip: 'Program buradan başlar.' }, js: '// kuş uçsun',
    en: { category: 'Flight', json: { message0: 'bird, fly!', tooltip: 'The program starts here.' } } },
  {
    type: 'bird_heading', category: 'Uçuş', colour: FLIGHT,
    json: { message0: '%1° yönünde uç', args0: [{ type: 'field_number', name: 'ANGLE', value: 90, min: 0, max: 360, precision: 1 }], previousStatement: null, nextStatement: null, tooltip: 'Kuş bu açıda bir kanat çırpışı (en çok 100 adım) uçar. 0° sağ, 90° yukarı, 180° sol, 270° aşağı.' },
    js: 'heading({ANGLE});',
    en: { category: 'Flight', json: { message0: 'fly at %1°', tooltip: 'The bird flies one flap (at most 100 steps) at this angle. 0° is right, 90° is up, 180° is left, 270° is down.' } },
  },
  {
    type: 'bird_heading_value', category: 'Uçuş', colour: FLIGHT,
    json: { message0: '%1 yönünde uç', args0: [{ type: 'input_value', name: 'ANGLE', check: 'Number' }], previousStatement: null, nextStatement: null, tooltip: 'Açıyı bir sayı ya da hesaplanmış değerle ver.' },
    js: 'heading({ANGLE});',
    en: { category: 'Flight', json: { message0: 'fly at %1', tooltip: 'Give the angle as a number or a calculated value.' } },
  },
  { type: 'bird_has_worm', category: 'Algılama', colour: SENSE, json: { message0: 'solucan alındı mı?', output: 'Boolean', tooltip: 'Kuş solucanı aldıysa doğru.' }, js: 'hasWorm()',
    en: { category: 'Sensing', json: { message0: 'worm taken?', tooltip: 'True if the bird has the worm.' } } },
  {
    type: 'bird_coord', category: 'Algılama', colour: SENSE,
    json: {
      message0: '%1 %2 konumu',
      args0: [
        { type: 'field_dropdown', name: 'WHO', options: [['kuşun', 'BIRD'], ['solucanın', 'WORM'], ['yuvanın', 'NEST']] },
        { type: 'field_dropdown', name: 'AXIS', options: [['x', 'X'], ['y', 'Y']] },
      ],
      output: 'Number', tooltip: 'Konum 0 ile 400 arasındadır. x sağa, y yukarı doğru artar.',
    },
    js: "position('{WHO}', '{AXIS}')",
    en: {
      category: 'Sensing',
      json: {
        message0: '%1 position of the %2',
        args0: [
          { type: 'field_dropdown', name: 'AXIS', options: [['x', 'X'], ['y', 'Y']] },
          { type: 'field_dropdown', name: 'WHO', options: [['bird', 'BIRD'], ['worm', 'WORM'], ['nest', 'NEST']] },
        ],
        tooltip: 'Positions go from 0 to 400. x grows to the right, y grows upward.',
      },
    },
  },
  {
    type: 'bird_angle_to', category: 'Algılama', colour: SENSE,
    json: {
      message0: '%1 yönü',
      args0: [{ type: 'field_dropdown', name: 'TARGET', options: [['solucanın', 'WORM'], ['yuvanın', 'NEST']] }],
      output: 'Number', tooltip: 'Kuştan hedefe giden doğrunun açısı (derece).',
    },
    js: "angleTo('{TARGET}')",
    en: { category: 'Sensing', json: { message0: 'direction of the %1', args0: [{ type: 'field_dropdown', name: 'TARGET', options: [['worm', 'WORM'], ['nest', 'NEST']] }], tooltip: 'The angle (in degrees) of the line from the bird to the target.' } },
  },
  {
    type: 'bird_atan2', category: 'Matematik', colour: MATH,
    json: {
      message0: 'atan2 ( dy %1 , dx %2 )',
      args0: [{ type: 'input_value', name: 'DY', check: 'Number' }, { type: 'input_value', name: 'DX', check: 'Number' }],
      output: 'Number', tooltip: 'Yatay (dx) ve dikey (dy) farktan açıyı derece olarak bulur.',
    },
    js: 'atan2Degrees({DY}, {DX})',
    en: { json: { tooltip: 'Finds the angle in degrees from the horizontal (dx) and vertical (dy) difference.' } },
  },
]

/** Yön gerektiren bloklara varsayılan sayı gölgesi ekler (araç kutusunda boş soket kalmasın). */
function withShadows(tb: ReturnType<typeof buildToolbox>) {
  return {
    ...tb,
    contents: tb.contents.map((cat) => {
      const c = cat as { contents?: Record<string, unknown>[] }
      if (!c.contents) return cat
      return {
        ...cat,
        contents: c.contents.map((e) =>
          e.type === 'bird_heading_value' ? { ...e, inputs: { ANGLE: { shadow: { type: 'math_number', fields: { NUM: 90 } } } } } : e),
      }
    }),
  }
}

export const kusGame: GameDef<BirdState> = {
  slug: 'kus',
  title: 'Kuş',
  tagline: 'Kuşu solucana götür, sonra yuvasına geri döndür.',
  en: { title: 'Bird', tagline: 'Take the bird to the worm, then fly it back to its nest.' },
  levels: levels as LevelDef[],
  blocks,
  engine: { createRun: (level, opts) => createBirdRun(level, opts?.seed ?? 1) },
  scene: () => import('@/components/games/kus/scene'),
  toolboxFor: (level) => withShadows(buildToolbox({ blocks }, level)),
  stepDelay: KUS_STEP_DELAY,
  speed: { min: 0.5, max: 3, default: 1 },
  stageAspect: '1 / 1',
  maxSteps: 600,
}
