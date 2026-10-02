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
  { type: 'bird_basla', category: 'Uçuş', colour: FLIGHT, hat: true, json: { message0: 'kuş uçsun', nextStatement: null, tooltip: 'Program buradan başlar.' }, js: '// kuş uçsun' },
  {
    type: 'bird_heading', category: 'Uçuş', colour: FLIGHT,
    json: { message0: '%1° yönünde uç', args0: [{ type: 'field_number', name: 'ANGLE', value: 90, min: 0, max: 360, precision: 1 }], previousStatement: null, nextStatement: null, tooltip: 'Kuş bu açıda bir kanat çırpışı (en çok 100 adım) uçar. 0° sağ, 90° yukarı, 180° sol, 270° aşağı.' },
    js: 'heading({ANGLE});',
  },
  {
    type: 'bird_heading_value', category: 'Uçuş', colour: FLIGHT,
    json: { message0: '%1 yönünde uç', args0: [{ type: 'input_value', name: 'ANGLE', check: 'Number' }], previousStatement: null, nextStatement: null, tooltip: 'Açıyı bir sayı ya da hesaplanmış değerle ver.' },
    js: 'heading({ANGLE});',
  },
  { type: 'bird_has_worm', category: 'Algılama', colour: SENSE, json: { message0: 'solucan alındı mı?', output: 'Boolean', tooltip: 'Kuş solucanı aldıysa doğru.' }, js: 'hasWorm()' },
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
  },
  {
    type: 'bird_angle_to', category: 'Algılama', colour: SENSE,
    json: {
      message0: '%1 yönü',
      args0: [{ type: 'field_dropdown', name: 'TARGET', options: [['solucanın', 'WORM'], ['yuvanın', 'NEST']] }],
      output: 'Number', tooltip: 'Kuştan hedefe giden doğrunun açısı (derece).',
    },
    js: "angleTo('{TARGET}')",
  },
  {
    type: 'bird_atan2', category: 'Matematik', colour: MATH,
    json: {
      message0: 'atan2 ( dy %1 , dx %2 )',
      args0: [{ type: 'input_value', name: 'DY', check: 'Number' }, { type: 'input_value', name: 'DX', check: 'Number' }],
      output: 'Number', tooltip: 'Yatay (dx) ve dikey (dy) farktan açıyı derece olarak bulur.',
    },
    js: 'atan2Degrees({DY}, {DX})',
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
