// Kaplumbağa oyunu: ileri/dön/kalem/renk/kalınlık blokları, döngü, değişken ve işlevle şekil çizme. 10 seviye.
import type { GameDef, LevelDef } from '../types'
import { buildToolbox } from '../toolbox'
import { createTurtleRun, type TurtleState } from './engine'
import { COLOURS, PALETTE } from './geometry'
import { levels } from './levels'

const MOVE = '#4c97ff', PEN = '#0fbd8c', PAINT = '#ff6680'
// Blockly 13 çekirdeğinde renk alanı yok: renkli kare resimli açılır liste kullanıyoruz (özgün SVG örnekleri).
const swatch = (hex: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="22"><rect x="1" y="1" width="26" height="20" rx="6" fill="${hex}" stroke="#ffffff" stroke-width="2"/></svg>`)}`
const swatches = Object.entries(COLOURS).map(([name, hex]) => [{ src: swatch(hex), width: 28, height: 22, alt: name === 'kirmizi' ? 'kırmızı' : name === 'sari' ? 'sarı' : name === 'yesil' ? 'yeşil' : name }, hex])
const stmt = { previousStatement: null, nextStatement: null }

const blocks: GameDef['blocks'] = [
  { type: 'kaplumbaga_ileri', category: 'Hareket', colour: MOVE, json: { message0: 'ileri git %1', args0: [{ type: 'input_value', name: 'DIST', check: 'Number' }], ...stmt, tooltip: 'Kaplumbağa baktığı yöne doğru ilerler.' }, js: 'ileri({DIST});' },
  { type: 'kaplumbaga_geri', category: 'Hareket', colour: MOVE, json: { message0: 'geri git %1', args0: [{ type: 'input_value', name: 'DIST', check: 'Number' }], ...stmt, tooltip: 'Kaplumbağa geri geri yürür.' }, js: 'geri({DIST});' },
  { type: 'kaplumbaga_saga', category: 'Hareket', colour: MOVE, json: { message0: 'sağa dön %1 derece', args0: [{ type: 'input_value', name: 'ANGLE', check: 'Number' }], ...stmt, tooltip: 'Kaplumbağa olduğu yerde saat yönünde döner.' }, js: 'sagaDon({ANGLE});' },
  { type: 'kaplumbaga_sola', category: 'Hareket', colour: MOVE, json: { message0: 'sola dön %1 derece', args0: [{ type: 'input_value', name: 'ANGLE', check: 'Number' }], ...stmt, tooltip: 'Kaplumbağa olduğu yerde saat yönünün tersine döner.' }, js: 'solaDon({ANGLE});' },
  { type: 'kaplumbaga_kalem_kaldir', category: 'Kalem', colour: PEN, json: { message0: 'kalemi kaldır', ...stmt, tooltip: 'Kaplumbağa yürürken iz bırakmaz.' }, js: 'kalemiKaldir();' },
  { type: 'kaplumbaga_kalem_indir', category: 'Kalem', colour: PEN, json: { message0: 'kalemi indir', ...stmt, tooltip: 'Kaplumbağa yürürken çizgi çizer.' }, js: 'kalemiIndir();' },
  { type: 'kaplumbaga_kalinlik', category: 'Kalem', colour: PEN, json: { message0: 'kalem kalınlığı %1', args0: [{ type: 'input_value', name: 'WIDTH', check: 'Number' }], ...stmt, tooltip: 'Çizginin kalınlığını belirler.' }, js: 'kalinlik({WIDTH});' },
  { type: 'kaplumbaga_renk', category: 'Renk', colour: PAINT, json: { message0: 'rengi %1 yap', args0: [{ type: 'input_value', name: 'COLOUR', check: 'Colour' }], ...stmt, tooltip: 'Kalemin rengini değiştirir.' }, js: 'renk({COLOUR});' },
  {
    type: 'kaplumbaga_renk_sec', category: 'Renk', colour: PAINT, free: true,
    json: { message0: '%1', args0: [{ type: 'field_dropdown', name: 'COLOUR', options: swatches }], output: 'Colour', tooltip: 'Bir renk seç.' },
    js: (c) => `'${c.field('COLOUR')}'`,
  },
  { type: 'kaplumbaga_renk_ton', category: 'Renk', colour: PAINT, json: { message0: 'ton %1 (0-360)', args0: [{ type: 'input_value', name: 'HUE', check: 'Number' }], output: 'Colour', tooltip: 'Gökkuşağındaki bir renk: 0 kırmızı, 120 yeşil, 240 mavi.' }, js: 'tonRengi({HUE})' },
]

const DEFAULTS: Record<string, Record<string, unknown>> = {
  kaplumbaga_ileri: { DIST: { shadow: { type: 'math_number', fields: { NUM: 100 } } } },
  kaplumbaga_geri: { DIST: { shadow: { type: 'math_number', fields: { NUM: 50 } } } },
  kaplumbaga_saga: { ANGLE: { shadow: { type: 'math_number', fields: { NUM: 90 } } } },
  kaplumbaga_sola: { ANGLE: { shadow: { type: 'math_number', fields: { NUM: 90 } } } },
  kaplumbaga_kalinlik: { WIDTH: { shadow: { type: 'math_number', fields: { NUM: 10 } } } },
  kaplumbaga_renk: { COLOUR: { shadow: { type: 'kaplumbaga_renk_sec', fields: { COLOUR: PALETTE[0] } } } },
  kaplumbaga_renk_ton: { HUE: { shadow: { type: 'math_number', fields: { NUM: 0 } } } },
}

/** Standart araç kutusuna sayı/renk gölgeleri ekler (blokların boş girişle gelmemesi için). */
function toolboxFor(level: LevelDef) {
  const tb = buildToolbox({ blocks }, level) as { contents: { contents?: { kind: string; type: string; inputs?: unknown }[] }[] }
  for (const cat of tb.contents) {
    for (const e of cat.contents ?? []) if (DEFAULTS[e.type]) e.inputs = DEFAULTS[e.type]
  }
  return tb
}

export const kaplumbagaGame: GameDef<TurtleState> = {
  slug: 'kaplumbaga',
  title: 'Kaplumbağa',
  tagline: 'Kaplumbağayla ekrana şekiller ve renkli desenler çiz.',
  levels,
  blocks,
  engine: { createRun: (level) => createTurtleRun(level) },
  scene: () => import('@/components/games/kaplumbaga/scene'),
  toolboxFor,
  stepDelay: 100,
  speed: { min: 0.5, max: 12, default: 2 },
  stageAspect: '1 / 1',
  maxSteps: 20000,
}
