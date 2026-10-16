// Film oyununa özgü bloklar.
import type { GameBlockDef } from '../types'

const COLOR_OPTIONS_EN = [
  ['🟥 red', 'KIRMIZI'], ['🟧 orange', 'TURUNCU'], ['🟨 yellow', 'SARI'], ['🟩 green', 'YESIL'], ['🟦 blue', 'MAVI'],
  ['🟪 purple', 'MOR'], ['🟫 brown', 'KAHVE'], ['⬛ black', 'SIYAH'], ['⬜ white', 'BEYAZ'],
]

const COLOR_OPTIONS = [
  ['🟥 kırmızı', 'KIRMIZI'], ['🟧 turuncu', 'TURUNCU'], ['🟨 sarı', 'SARI'], ['🟩 yeşil', 'YESIL'], ['🟦 mavi', 'MAVI'],
  ['🟪 mor', 'MOR'], ['🟫 kahverengi', 'KAHVE'], ['⬛ siyah', 'SIYAH'], ['⬜ beyaz', 'BEYAZ'],
]
const stmt = { previousStatement: null, nextStatement: null }
const num = (name: string) => ({ type: 'input_value', name, check: 'Number' })
const COL = '#ff6680'
const SHAPE = '#4c97ff'
const MATH = '#5b67a5'

export const filmBlocks: GameBlockDef[] = [
  {
    type: 'film_kare', category: 'Zaman', colour: '#7e57c2', free: true,
    json: {
      message0: 'her karede (zaman 0 → 99)', message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }],
      ...stmt, tooltip: 'İçindeki bloklar 100 kez çalışır: zaman her seferinde bir artar. Film bu karelerden oluşur.',
    },
    en: { category: 'Time', json: { message0: 'every frame (time 0 → 99)', tooltip: 'The blocks inside run 100 times: time goes up by one each time. The movie is made of these frames.' } },
    js: (c) => `for (let zaman = 0; zaman < 100; zaman++) {\n${c.statements('DO')}}\n`,
  },
  {
    type: 'film_zaman', category: 'Zaman', colour: '#ffab19',
    json: { message0: 'zaman', output: 'Number', tooltip: 'Şu anki karenin numarası: 0 ile 99 arası.' },
    en: { category: 'Time', json: { message0: 'time', tooltip: 'The number of the current frame: from 0 to 99.' } },
    js: 'zaman',
  },
  {
    type: 'film_renk', category: 'Renk', colour: COL,
    json: {
      message0: 'rengi %1 yap', args0: [{ type: 'field_dropdown', name: 'RENK', options: COLOR_OPTIONS }],
      ...stmt, tooltip: 'Bundan sonra çizilecek şekillerin rengini seçer.',
    },
    en: { category: 'Colour', json: { message0: 'set colour to %1', args0: [{ type: 'field_dropdown', name: 'RENK', options: COLOR_OPTIONS_EN }], tooltip: 'Picks the colour for the shapes you draw next.' } },
    js: (c) => `renk('${c.field('RENK').toLowerCase()}');`,
  },
  {
    type: 'film_renk_ton', category: 'Renk', colour: COL,
    json: { message0: 'rengi ton %1 yap', args0: [num('HUE')], inputsInline: true, ...stmt, tooltip: 'Gökkuşağı rengi: 0 kırmızı, 120 yeşil, 240 mavi; 360 yine kırmızı.' },
    en: { category: 'Colour', json: { message0: 'set colour to hue %1', tooltip: 'Rainbow colour: 0 red, 120 green, 240 blue; 360 is red again.' } },
    js: 'renkTon({HUE});',
  },
  {
    type: 'film_renk_rgb', category: 'Renk', colour: COL,
    json: { message0: 'rengi kırmızı %1 yeşil %2 mavi %3 yap', args0: [num('R'), num('G'), num('B')], inputsInline: true, ...stmt, tooltip: 'Her renk miktarı 0 ile 255 arasındadır.' },
    en: { category: 'Colour', json: { message0: 'set colour to red %1 green %2 blue %3', tooltip: 'Each colour amount is between 0 and 255.' } },
    js: 'renkRgb({R}, {G}, {B});',
  },
  {
    type: 'film_zemin', category: 'Renk', colour: COL,
    json: {
      message0: 'arka planı %1 yap', args0: [{ type: 'field_dropdown', name: 'RENK', options: COLOR_OPTIONS }],
      ...stmt, tooltip: 'Bütün sahnenin zemin rengi.',
    },
    en: { category: 'Colour', json: { message0: 'set background to %1', args0: [{ type: 'field_dropdown', name: 'RENK', options: COLOR_OPTIONS_EN }], tooltip: 'The background colour of the whole scene.' } },
    js: (c) => `arkaPlan('${c.field('RENK').toLowerCase()}');`,
  },
  {
    type: 'film_kalinlik', category: 'Renk', colour: COL,
    json: { message0: 'çizgi kalınlığı %1', args0: [num('W')], inputsInline: true, ...stmt, tooltip: 'Sonraki çizgilerin kalınlığı.' },
    en: { category: 'Colour', json: { message0: 'line width %1', tooltip: 'How thick the next lines are.' } },
    js: 'kalinlik({W});',
  },
  {
    type: 'film_daire', category: 'Çizim', colour: SHAPE,
    json: {
      message0: 'daire çiz x %1 y %2 yarıçap %3', args0: [num('X'), num('Y'), num('R')], inputsInline: true, ...stmt,
      tooltip: 'Merkezi (x, y) olan bir daire çizer. x sağa, y aşağıya doğru artar.',
    },
    en: { category: 'Drawing', json: { message0: 'draw circle x %1 y %2 radius %3', tooltip: 'Draws a circle with its centre at (x, y). x grows to the right, y grows downwards.' } },
    js: 'daire({X}, {Y}, {R});',
  },
  {
    type: 'film_dikdortgen', category: 'Çizim', colour: SHAPE,
    json: {
      message0: 'dikdörtgen çiz x %1 y %2 genişlik %3 yükseklik %4', args0: [num('X'), num('Y'), num('W'), num('H')], inputsInline: true, ...stmt,
      tooltip: '(x, y) sol üst köşe olacak şekilde bir dikdörtgen çizer.',
    },
    en: { category: 'Drawing', json: { message0: 'draw rectangle x %1 y %2 width %3 height %4', tooltip: 'Draws a rectangle with (x, y) as its top-left corner.' } },
    js: 'dikdortgen({X}, {Y}, {W}, {H});',
  },
  {
    type: 'film_cizgi', category: 'Çizim', colour: SHAPE,
    json: {
      message0: 'çizgi çiz (%1, %2) → (%3, %4)', args0: [num('X1'), num('Y1'), num('X2'), num('Y2')], inputsInline: true, ...stmt,
      tooltip: 'İki nokta arasında düz çizgi çizer.',
    },
    en: { category: 'Drawing', json: { message0: 'draw line (%1, %2) → (%3, %4)', tooltip: 'Draws a straight line between two points.' } },
    js: 'cizgi({X1}, {Y1}, {X2}, {Y2});',
  },
  {
    type: 'film_sin', category: 'Matematik', colour: MATH,
    json: { message0: 'sin %1 °', args0: [num('A')], inputsInline: true, output: 'Number', tooltip: 'Sinüs (derece): −1 ile 1 arasında gidip gelen sayı.' },
    en: { category: 'Math', json: { tooltip: 'Sine (degrees): a number that swings between −1 and 1.' } },
    js: (c) => `Math.sin((${c.value('A')}) * Math.PI / 180)`,
  },
  {
    type: 'film_cos', category: 'Matematik', colour: MATH,
    json: { message0: 'cos %1 °', args0: [num('A')], inputsInline: true, output: 'Number', tooltip: 'Kosinüs (derece): −1 ile 1 arasında gidip gelen sayı.' },
    en: { category: 'Math', json: { tooltip: 'Cosine (degrees): a number that swings between −1 and 1.' } },
    js: (c) => `Math.cos((${c.value('A')}) * Math.PI / 180)`,
  },
]
