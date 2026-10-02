// Bulmaca blokları. Tür adları `bulmaca_` ile başlar.
import type { GameBlockDef } from '../types'
import { COLORS, FEATURE_INFO, FEATURE_ORDER } from './features'

const PARCA = '#ff8c1a'
const BOYA = '#9966ff'
const KART = '#e6a100'
const DONGU = '#4c97ff'

const part = (type: string, label: string, tip: string, js: string): GameBlockDef => ({
  type, category: 'Parçalar', colour: PARCA,
  json: { message0: label, previousStatement: null, nextStatement: null, tooltip: tip },
  js,
})

const featureOptions = (): [string, string][] => FEATURE_ORDER.map((k) => [FEATURE_INFO[k].label, k])

export const bulmacaBlocks: GameBlockDef[] = [
  {
    type: 'bulmaca_basla', category: 'Başlangıç', colour: '#5b67a5', hat: true,
    json: { message0: 'hayvanı yap', nextStatement: null, tooltip: 'Programın buradan başlar. Blokları bunun altına tak.' },
    js: '// hayvanı yap',
  },
  {
    type: 'bulmaca_her_kart', category: 'Kart', colour: DONGU, free: true,
    json: { message0: 'her kart için', message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }], previousStatement: null, nextStatement: null, tooltip: 'Aşağıdaki kartların her biri için içindeki blokları baştan çalıştırır.' },
    js: (c) => `for (const kart of kartlar) {\n  yeniHayvan();\n${c.statements('DO')}  kontrolEt(kart);\n}\n`,
  },
  part('bulmaca_bacak', 'bacak ekle', 'Hayvana bir bacak ekler.', 'bacakEkle();'),
  part('bulmaca_kanat', 'kanat ekle', 'Hayvana bir kanat ekler.', 'kanatEkle();'),
  part('bulmaca_goz', 'göz ekle', 'Hayvana bir göz ekler.', 'gozEkle();'),
  part('bulmaca_kulak', 'kulak ekle', 'Hayvana bir kulak ekler.', 'kulakEkle();'),
  part('bulmaca_gaga', 'gaga ekle', 'Hayvana gaga ekler.', 'gagaEkle();'),
  part('bulmaca_kuyruk', 'kuyruk ekle', 'Hayvana kuyruk ekler.', 'kuyrukEkle();'),
  part('bulmaca_biyik', 'bıyık ekle', 'Hayvana bıyık ekler.', 'biyikEkle();'),
  {
    type: 'bulmaca_bacak_n', category: 'Parçalar', colour: PARCA,
    json: { message0: 'bacak ekle: %1 tane', args0: [{ type: 'input_value', name: 'N', check: 'Number' }], previousStatement: null, nextStatement: null, tooltip: 'Yazdığın sayı kadar bacak ekler.' },
    js: 'bacakEkle({N});',
  },
  {
    type: 'bulmaca_goz_n', category: 'Parçalar', colour: PARCA,
    json: { message0: 'göz ekle: %1 tane', args0: [{ type: 'input_value', name: 'N', check: 'Number' }], previousStatement: null, nextStatement: null, tooltip: 'Yazdığın sayı kadar göz ekler.' },
    js: 'gozEkle({N});',
  },
  {
    type: 'bulmaca_boya', category: 'Boya ve ad', colour: BOYA,
    json: {
      message0: 'boya: %1',
      args0: [{ type: 'field_dropdown', name: 'RENK', options: (Object.keys(COLORS) as (keyof typeof COLORS)[]).filter((k) => k !== 'VARSAYILAN').map((k) => [COLORS[k].label, k]) }],
      previousStatement: null, nextStatement: null, tooltip: 'Hayvanın gövdesini boyar.',
    },
    js: "boya('{RENK}');",
  },
  {
    type: 'bulmaca_ad', category: 'Boya ve ad', colour: BOYA,
    json: { message0: 'adını yaz: %1', args0: [{ type: 'field_input', name: 'AD', text: 'ad' }], previousStatement: null, nextStatement: null, tooltip: 'Hayvanın adını yazar. Kutuya tıklayıp değiştirebilirsin.' },
    js: "adYaz('{AD}');",
  },
  {
    type: 'bulmaca_boya_kart', category: 'Boya ve ad', colour: BOYA,
    json: { message0: 'kartın rengine boya', previousStatement: null, nextStatement: null, tooltip: 'Hayvanı kartın rengine boyar.' },
    js: 'boya(kart.renk);',
  },
  {
    type: 'bulmaca_ad_kart', category: 'Boya ve ad', colour: BOYA,
    json: { message0: 'kartın adını yaz', previousStatement: null, nextStatement: null, tooltip: 'Kartta yazan adı hayvana yazar.' },
    js: 'adYaz(kart.ad);',
  },
  {
    type: 'bulmaca_kartta_var', category: 'Kart', colour: KART,
    json: { message0: 'kartta %1 var mı?', args0: [{ type: 'field_dropdown', name: 'OZ', options: featureOptions() }], output: 'Boolean', tooltip: 'Karttaki hayvanda bu parça varsa doğru olur.' },
    js: "kartta('{OZ}') > 0",
  },
  {
    type: 'bulmaca_kart_say', category: 'Kart', colour: KART,
    json: { message0: 'kartta kaç %1 var', args0: [{ type: 'field_dropdown', name: 'OZ', options: featureOptions() }], output: 'Number', tooltip: 'Karttaki hayvanın o parçadan kaç tane olduğunu verir.' },
    js: "kartta('{OZ}')",
  },
  {
    type: 'bulmaca_her_ozellik', category: 'Kart', colour: DONGU,
    json: { message0: 'her özellik için', message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }], previousStatement: null, nextStatement: null, tooltip: 'Bacak, kanat, göz, kulak, gaga, kuyruk ve bıyık için içindekileri sırayla çalıştırır.' },
    js: (c) => `for (const ozellik of ['bacak', 'kanat', 'göz', 'kulak', 'gaga', 'kuyruk', 'bıyık']) {\n${c.statements('DO')}}\n`,
  },
  {
    type: 'bulmaca_kart_say_bu', category: 'Kart', colour: KART,
    json: { message0: 'kartta bu özellikten kaç var', output: 'Number', tooltip: '"Her özellik için" içinde sıradaki özelliğin kartta kaç tane olduğunu verir.' },
    js: 'kartta(ozellik)',
  },
  {
    type: 'bulmaca_ekle_bu', category: 'Parçalar', colour: PARCA,
    json: { message0: 'bu özelliği ekle', previousStatement: null, nextStatement: null, tooltip: '"Her özellik için" içinde sıradaki parçayı ekler.' },
    js: 'ekle(ozellik);',
  },
]
