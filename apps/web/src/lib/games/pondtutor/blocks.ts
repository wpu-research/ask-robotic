// Gölet Eğitmeni blokları. Adlar gerçek "Gölet" oyunundaki işlev adlarıyla (swim, cannon, scan) aynı mantıkta; JS karşılığı aynı adları kullanır.
import type { GameBlockDef } from '../types'

const SWIM_TIP_EN = 'Turns the duck to the given direction and gives it speed. Direction: 0 = right, 90 = up, 180 = left, 270 = down. Speed 0-100.'
const CANNON_TIP_EN = 'Fires a ball in the given direction and distance (at most 70). The ball explodes when it lands. You have to wait a little before the next shot.'

const COL_MOVE = '#4c97ff'
const COL_FIGHT = '#ff6680'
const COL_SENSE = '#ffab19'

const stmt = { previousStatement: null, nextStatement: null, inputsInline: true }
const numIn = (name: string) => ({ type: 'input_value', name, check: 'Number' })
const numField = (name: string, value: number, min: number, max: number) => ({ type: 'field_number', name, value, min, max, precision: 1 })

const SWIM_TIP = 'Ördeği verilen yöne çevirir ve hız verir. Yön: 0 = sağ, 90 = yukarı, 180 = sol, 270 = aşağı. Hız 0-100.'
const CANNON_TIP = 'Topu verilen yöne ve uzaklığa atar (en çok 70). Top yere düşünce patlar. Sonraki atış için biraz beklemek gerekir.'

// Not: sayı alanlı (başlangıç) ve ifade girişli (`_e`, değişken/işlem bağlanabilir) ikizler. Araç kutusunda gölge sayı bloğu
// olmadığı için ilk seviyeler alanlı blokları kullanır; ifade gerektiren seviyeler `_e` ikizlerini.
export const pondtutorBlocks: GameBlockDef[] = [
  {
    type: 'pt_swim', category: 'Hareket', colour: COL_MOVE,
    json: { message0: 'yüz  yön %1 °  hız %2 %', args0: [numField('DIR', 0, -720, 720), numField('SPEED', 100, 0, 100)], ...stmt, tooltip: SWIM_TIP },
    en: { category: 'Movement', json: { message0: 'swim  direction %1 °  speed %2 %', tooltip: SWIM_TIP_EN } },
    js: 'swim({DIR}, {SPEED});',
  },
  {
    type: 'pt_swim_e', category: 'Hareket', colour: COL_MOVE,
    json: { message0: 'yüz  yön %1 °  hız %2 %', args0: [numIn('DIR'), numIn('SPEED')], ...stmt, tooltip: SWIM_TIP },
    en: { category: 'Movement', json: { message0: 'swim  direction %1 °  speed %2 %', tooltip: SWIM_TIP_EN } },
    js: 'swim({DIR}, {SPEED});',
  },
  {
    type: 'pt_stop', category: 'Hareket', colour: COL_MOVE,
    json: { message0: 'dur', ...stmt, tooltip: 'Ördek yavaşlayıp durur.' },
    en: { category: 'Movement', json: { message0: 'stop', tooltip: 'The duck slows down and stops.' } },
    js: 'stop();',
  },
  {
    type: 'pt_wait', category: 'Hareket', colour: COL_MOVE,
    json: { message0: 'bekle %1 adım', args0: [numField('N', 10, 0, 300)], ...stmt, tooltip: 'Zaman geçsin: ördek aynı hareketle ilerlemeye devam eder. Her adım saniyenin onda biri.' },
    en: { category: 'Movement', json: { message0: 'wait %1 steps', tooltip: 'Let time pass: the duck keeps moving the same way. Each step is a tenth of a second.' } },
    js: 'wait({N});',
  },
  {
    type: 'pt_cannon', category: 'Savaş', colour: COL_FIGHT,
    json: { message0: 'top at  yön %1 °  menzil %2', args0: [numField('DEG', 0, -720, 720), numField('RANGE', 40, 0, 70)], ...stmt, tooltip: CANNON_TIP },
    en: { category: 'Battle', json: { message0: 'fire cannon  direction %1 °  range %2', tooltip: CANNON_TIP_EN } },
    js: 'cannon({DEG}, {RANGE});',
  },
  {
    type: 'pt_cannon_e', category: 'Savaş', colour: COL_FIGHT,
    json: { message0: 'top at  yön %1 °  menzil %2', args0: [numIn('DEG'), numIn('RANGE')], ...stmt, tooltip: CANNON_TIP },
    en: { category: 'Battle', json: { message0: 'fire cannon  direction %1 °  range %2', tooltip: CANNON_TIP_EN } },
    js: 'cannon({DEG}, {RANGE});',
  },
  {
    type: 'pt_scan', category: 'Algıla', colour: COL_SENSE,
    json: { message0: 'tara  yön %1 °', args0: [numIn('DEG')], output: 'Number', inputsInline: true, tooltip: 'O yönde (±5°) rakip varsa uzaklığını verir; yoksa 9999.' },
    en: { category: 'Sense', json: { message0: 'scan  direction %1 °', tooltip: 'If there is a rival in that direction (±5°), gives its distance; otherwise 9999.' } },
    js: 'scan({DEG})',
  },
  {
    type: 'pt_x', category: 'Algıla', colour: COL_SENSE,
    json: { message0: 'x konumum', output: 'Number', tooltip: 'Ördeğin yatay konumu (0-100).' },
    en: { category: 'Sense', json: { message0: 'my x position', tooltip: "The duck's horizontal position (0-100)." } },
    js: 'loc_x()',
  },
  {
    type: 'pt_y', category: 'Algıla', colour: COL_SENSE,
    json: { message0: 'y konumum', output: 'Number', tooltip: 'Ördeğin dikey konumu (0-100, yukarı doğru artar).' },
    en: { category: 'Sense', json: { message0: 'my y position', tooltip: "The duck's vertical position (0-100, grows upwards)." } },
    js: 'loc_y()',
  },
  {
    type: 'pt_health', category: 'Algıla', colour: COL_SENSE,
    json: { message0: 'canım', output: 'Number', tooltip: 'Ördeğinin kalan canı (0-100).' },
    en: { category: 'Sense', json: { message0: 'my health', tooltip: "Your duck's remaining health (0-100)." } },
    js: 'health()',
  },
]
