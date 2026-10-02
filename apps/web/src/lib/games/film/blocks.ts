// Film oyununa özgü bloklar.
import type { GameBlockDef } from '../types'

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
    js: (c) => `for (let zaman = 0; zaman < 100; zaman++) {\n${c.statements('DO')}}\n`,
  },
  {
    type: 'film_zaman', category: 'Zaman', colour: '#ffab19',
    json: { message0: 'zaman', output: 'Number', tooltip: 'Şu anki karenin numarası: 0 ile 99 arası.' },
    js: 'zaman',
  },
  {
    type: 'film_renk', category: 'Renk', colour: COL,
    json: {
      message0: 'rengi %1 yap', args0: [{ type: 'field_dropdown', name: 'RENK', options: COLOR_OPTIONS }],
      ...stmt, tooltip: 'Bundan sonra çizilecek şekillerin rengini seçer.',
    },
    js: (c) => `renk('${c.field('RENK').toLowerCase()}');`,
  },
  {
    type: 'film_renk_ton', category: 'Renk', colour: COL,
    json: { message0: 'rengi ton %1 yap', args0: [num('HUE')], inputsInline: true, ...stmt, tooltip: 'Gökkuşağı rengi: 0 kırmızı, 120 yeşil, 240 mavi; 360 yine kırmızı.' },
    js: 'renkTon({HUE});',
  },
  {
    type: 'film_renk_rgb', category: 'Renk', colour: COL,
    json: { message0: 'rengi kırmızı %1 yeşil %2 mavi %3 yap', args0: [num('R'), num('G'), num('B')], inputsInline: true, ...stmt, tooltip: 'Her renk miktarı 0 ile 255 arasındadır.' },
    js: 'renkRgb({R}, {G}, {B});',
  },
  {
    type: 'film_zemin', category: 'Renk', colour: COL,
    json: {
      message0: 'arka planı %1 yap', args0: [{ type: 'field_dropdown', name: 'RENK', options: COLOR_OPTIONS }],
      ...stmt, tooltip: 'Bütün sahnenin zemin rengi.',
    },
    js: (c) => `arkaPlan('${c.field('RENK').toLowerCase()}');`,
  },
  {
    type: 'film_kalinlik', category: 'Renk', colour: COL,
    json: { message0: 'çizgi kalınlığı %1', args0: [num('W')], inputsInline: true, ...stmt, tooltip: 'Sonraki çizgilerin kalınlığı.' },
    js: 'kalinlik({W});',
  },
  {
    type: 'film_daire', category: 'Çizim', colour: SHAPE,
    json: {
      message0: 'daire çiz x %1 y %2 yarıçap %3', args0: [num('X'), num('Y'), num('R')], inputsInline: true, ...stmt,
      tooltip: 'Merkezi (x, y) olan bir daire çizer. x sağa, y aşağıya doğru artar.',
    },
    js: 'daire({X}, {Y}, {R});',
  },
  {
    type: 'film_dikdortgen', category: 'Çizim', colour: SHAPE,
    json: {
      message0: 'dikdörtgen çiz x %1 y %2 genişlik %3 yükseklik %4', args0: [num('X'), num('Y'), num('W'), num('H')], inputsInline: true, ...stmt,
      tooltip: '(x, y) sol üst köşe olacak şekilde bir dikdörtgen çizer.',
    },
    js: 'dikdortgen({X}, {Y}, {W}, {H});',
  },
  {
    type: 'film_cizgi', category: 'Çizim', colour: SHAPE,
    json: {
      message0: 'çizgi çiz (%1, %2) → (%3, %4)', args0: [num('X1'), num('Y1'), num('X2'), num('Y2')], inputsInline: true, ...stmt,
      tooltip: 'İki nokta arasında düz çizgi çizer.',
    },
    js: 'cizgi({X1}, {Y1}, {X2}, {Y2});',
  },
  {
    type: 'film_sin', category: 'Matematik', colour: MATH,
    json: { message0: 'sin %1 °', args0: [num('A')], inputsInline: true, output: 'Number', tooltip: 'Sinüs (derece): −1 ile 1 arasında gidip gelen sayı.' },
    js: (c) => `Math.sin((${c.value('A')}) * Math.PI / 180)`,
  },
  {
    type: 'film_cos', category: 'Matematik', colour: MATH,
    json: { message0: 'cos %1 °', args0: [num('A')], inputsInline: true, output: 'Number', tooltip: 'Kosinüs (derece): −1 ile 1 arasında gidip gelen sayı.' },
    js: (c) => `Math.cos((${c.value('A')}) * Math.PI / 180)`,
  },
]
