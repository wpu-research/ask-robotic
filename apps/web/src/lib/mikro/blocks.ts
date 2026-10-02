// Mikro Kart — özel blok tanımları (kendi tasarımımız). Bu dosya SAF veridir: Blockly'yi içe aktarmaz; Node'da ve sunucuda yüklenir.
// Her `mk_*` blok için: Blockly JSON'u, araç kutusu ön değerleri, JavaScript/Python karşılığı. Yerleşik Blockly blokları
// (döngü, mantık, matematik, liste, değişken, işlev) `BUILTIN_ENTRIES` içinde kategorilere dağıtılır; çalıştırma ve kod üretimi bizdedir.
import { ARROWS, ICONS } from './icons'
import { BEATS, MELODIES, NOTES } from './music'

export type CatKey = 'basic' | 'input' | 'led' | 'music' | 'radio' | 'loops' | 'logic' | 'vars' | 'math' | 'text' | 'list' | 'func' | 'pins'

export interface Category { key: CatKey; label: string; color: string; icon: string; custom?: 'VARIABLE' | 'PROCEDURE' }

export const CATEGORIES: Category[] = [
  { key: 'basic', label: 'Temel', color: '#3b82f6', icon: '🏠' },
  { key: 'input', label: 'Giriş', color: '#f43f5e', icon: '👆' },
  { key: 'led', label: 'LED', color: '#8b5cf6', icon: '💡' },
  { key: 'music', label: 'Müzik', color: '#d946ef', icon: '🎵' },
  { key: 'radio', label: 'Radyo', color: '#10b981', icon: '📡' },
  { key: 'loops', label: 'Döngü', color: '#22a34a', icon: '🔁' },
  { key: 'logic', label: 'Mantık', color: '#06a8c4', icon: '🔀' },
  { key: 'vars', label: 'Değişken', color: '#f59e0b', icon: '📦', custom: 'VARIABLE' },
  { key: 'math', label: 'Matematik', color: '#6366f1', icon: '🔢' },
  { key: 'text', label: 'Metin', color: '#65a30d', icon: '🔤' },
  { key: 'list', label: 'Liste', color: '#ea580c', icon: '📋' },
  { key: 'func', label: 'Fonksiyon', color: '#db2777', icon: '⚙️', custom: 'PROCEDURE' },
  { key: 'pins', label: 'Pinler', color: '#64748b', icon: '🔌' },
]
export const CAT_BY_KEY: Record<CatKey, Category> = Object.fromEntries(CATEGORIES.map((c) => [c.key, c])) as Record<CatKey, Category>
export const BLOCK_PREFIX = 'mk_'

// ---------------- argüman tanımları ----------------
export type Arg =
  | { k: 'val'; n: string; shadow?: 'num' | 'text'; def?: number | string }
  | { k: 'bool'; n: string }
  | { k: 'any'; n: string }
  | { k: 'drop'; n: string; opts: [string, string][]; def?: string; numeric?: boolean }
  | { k: 'num'; n: string; def: number; min: number; max: number }
  | { k: 'leds'; n: string }

const num = (n: string, def = 0): Arg => ({ k: 'val', n, shadow: 'num', def })
const txt = (n: string, def = ''): Arg => ({ k: 'val', n, shadow: 'text', def })
const any = (n: string): Arg => ({ k: 'any', n })
const bool = (n: string): Arg => ({ k: 'bool', n })
const drop = (n: string, opts: [string, string][], def?: string, numeric?: boolean): Arg => ({ k: 'drop', n, opts, def, numeric })
const fnum = (n: string, def: number, min: number, max: number): Arg => ({ k: 'num', n, def, min, max })

export const BTN_OPTS: [string, string][] = [['A', 'A'], ['B', 'B'], ['A+B', 'AB']]
export const BTN_EVENT_OPTS: [string, string][] = [['basılınca', 'press'], ['bırakılınca', 'release'], ['uzun basılınca', 'long']]
export const GESTURE_EVENT_OPTS: [string, string][] = [
  ['sallandığında', 'shake'], ['sola yatınca', 'tiltLeft'], ['sağa yatınca', 'tiltRight'], ['öne yatınca', 'tiltForward'],
  ['arkaya yatınca', 'tiltBack'], ['yüzü yukarı bakınca', 'faceUp'], ['yüzü aşağı bakınca', 'faceDown'], ['serbest düşünce', 'freeFall'],
]
export const GESTURE_STATE_OPTS: [string, string][] = [
  ['sallanıyor', 'shake'], ['sola yatık', 'tiltLeft'], ['sağa yatık', 'tiltRight'], ['öne yatık', 'tiltForward'],
  ['arkaya yatık', 'tiltBack'], ['yüzü yukarı', 'faceUp'], ['yüzü aşağı', 'faceDown'], ['serbest düşüyor', 'freeFall'],
]
export const PIN_OPTS: [string, string][] = [['P0', 'P0'], ['P1', 'P1'], ['P2', 'P2']]
export const TOUCH_EVENT_OPTS: [string, string][] = [['dokununca', 'touch'], ['bırakılınca', 'release']]
const NOTE_OPTS: [string, string][] = NOTES.map(([n]) => [n, n])
const BEAT_OPTS: [string, string][] = BEATS.map(([l, v]) => [l, v])
const ICON_OPTS: [string, string][] = ICONS.map((i) => [i.label, i.id])
const ARROW_OPTS: [string, string][] = ARROWS.map((a) => [a.label, a.id])
const MELODY_OPTS: [string, string][] = MELODIES.map((m) => [m.label, m.id])

// ---------------- blok tanımı ----------------
export type Kind = 'hat' | 'stmt' | 'value' | 'bool'

export interface Spec {
  type: string
  cat: CatKey
  kind: Kind
  /** `{ADI}` yer tutucularıyla etiket. */
  label: string
  args?: Arg[]
  tip?: string
  /** Çağrı biçimi: JS adı (python adı camelCase -> snake_case türetilir). Sırayla `params` (yoksa tüm argümanlar) verilir. */
  call?: string
  params?: string[]
  /** Çağrı biçimini geçersiz kılan şablonlar. `{ADI}` ifade/alan, `{(ADI)}` gerekirse parantezli. */
  js?: string
  py?: string
  /** Şablonun ifade öncelik sınıfı: 0 = atom (varsayılan), 4 = toplama düzeyi vb. */
  prec?: number
  /** Araç kutusunda gösterilmez (yalnız programlarda var olabilir). */
  hidden?: boolean
}

const hat = (type: string, cat: CatKey, label: string, call: string, args: Arg[] = [], tip?: string): Spec => ({ type, cat, kind: 'hat', label, args, call, tip })
const st = (type: string, cat: CatKey, label: string, call: string, args: Arg[] = [], extra: Partial<Spec> = {}): Spec => ({ type, cat, kind: 'stmt', label, args, call, ...extra })
const val = (type: string, cat: CatKey, label: string, call: string, args: Arg[] = [], extra: Partial<Spec> = {}): Spec => ({ type, cat, kind: 'value', label, args, call, ...extra })
const bl = (type: string, cat: CatKey, label: string, call: string, args: Arg[] = [], extra: Partial<Spec> = {}): Spec => ({ type, cat, kind: 'bool', label, args, call, ...extra })

export const SPECS: Spec[] = [
  // ---- Temel ----
  hat('mk_on_start', 'basic', 'başlangıçta', 'card.onStart', [], 'Program başlayınca bir kez çalışır.'),
  hat('mk_forever', 'basic', 'sonsuza kadar', 'card.forever', [], 'İçindeki bloklar durmadan tekrarlanır.'),
  hat('mk_every', 'basic', 'her {MS} ms\'de', 'card.every', [fnum('MS', 1000, 20, 3600000)], 'Belirli aralıklarla tekrar tekrar çalışır.'),
  st('mk_show_number', 'basic', 'sayıyı göster {VALUE}', 'screen.showNumber', [num('VALUE', 0)], { tip: 'Sayıyı ekranda kaydırır.' }),
  st('mk_show_text', 'basic', 'yazıyı göster {TEXT}', 'screen.showText', [txt('TEXT', 'Merhaba!')], { tip: 'Yazıyı ekranda kaydırır.' }),
  st('mk_show_icon', 'basic', 'simgeyi göster {ICON}', 'screen.showIcon', [drop('ICON', ICON_OPTS, 'heart')]),
  st('mk_show_leds', 'basic', "LED'leri göster {LEDS}", 'screen.showLeds', [{ k: 'leds', n: 'LEDS' }], { tip: 'Kutulara tıklayarak kendi deseni çiz.' }),
  st('mk_clear', 'basic', 'ekranı temizle', 'screen.clear'),
  st('mk_pause', 'basic', 'bekle {MS} ms', 'wait', [num('MS', 500)], { tip: '1000 ms = 1 saniye.' }),
  st('mk_serial', 'basic', 'konsola yaz {TEXT}', 'console.log', [txt('TEXT', 'merhaba')], { py: 'print({TEXT})' }),

  // ---- Giriş ----
  hat('mk_on_button', 'input', 'düğme {BTN} {EV}', 'card.onButton', [drop('BTN', BTN_OPTS, 'A'), drop('EV', BTN_EVENT_OPTS, 'press')]),
  hat('mk_on_gesture', 'input', 'kart {G}', 'card.onGesture', [drop('G', GESTURE_EVENT_OPTS, 'shake')]),
  hat('mk_on_logo', 'input', 'logoya {EV}', 'card.onLogo', [drop('EV', TOUCH_EVENT_OPTS, 'touch')]),
  bl('mk_button_is', 'input', '{BTN} düğmesi basılı mı?', 'input.buttonPressed', [drop('BTN', BTN_OPTS, 'A')]),
  bl('mk_gesture_is', 'input', 'kart {G} mu?', 'input.isGesture', [drop('G', GESTURE_STATE_OPTS, 'shake')]),
  bl('mk_logo_is', 'input', 'logoya dokunuluyor mu?', 'input.logoTouched'),
  val('mk_accel', 'input', 'ivme ({AXIS})', 'input.acceleration', [drop('AXIS', [['x', 'x'], ['y', 'y'], ['z', 'z'], ['güç', 'strength']], 'x')]),
  val('mk_tilt', 'input', 'eğim ({AXIS}) derece', 'input.tilt', [drop('AXIS', [['boy (öne +)', 'pitch'], ['yan (sağa +)', 'roll']], 'pitch')]),
  val('mk_compass', 'input', 'pusula yönü (derece)', 'input.compass'),
  val('mk_temperature', 'input', 'sıcaklık (°C)', 'input.temperature'),
  val('mk_light', 'input', 'ışık seviyesi', 'input.lightLevel'),
  val('mk_sound', 'input', 'ses seviyesi', 'input.soundLevel'),
  val('mk_runtime', 'input', 'çalışma süresi (ms)', 'input.runningTime'),

  // ---- LED ----
  st('mk_plot', 'led', 'LED yak x {X} y {Y}', 'screen.plot', [num('X', 2), num('Y', 2)]),
  st('mk_unplot', 'led', 'LED söndür x {X} y {Y}', 'screen.unplot', [num('X', 2), num('Y', 2)]),
  st('mk_plot_brightness', 'led', 'LED x {X} y {Y} parlaklığı {B}', 'screen.plotBrightness', [num('X', 2), num('Y', 2), num('B', 128)], { tip: 'Parlaklık 0 ile 255 arasındadır.' }),
  st('mk_toggle', 'led', 'LED x {X} y {Y} durumunu değiştir', 'screen.toggle', [num('X', 2), num('Y', 2)]),
  bl('mk_led_on', 'led', 'LED x {X} y {Y} yanıyor mu?', 'screen.isOn', [num('X', 2), num('Y', 2)]),
  val('mk_led_brightness', 'led', 'LED x {X} y {Y} parlaklığı', 'screen.getBrightness', [num('X', 2), num('Y', 2)]),
  st('mk_set_brightness', 'led', 'ekran parlaklığını {B} yap', 'screen.setBrightness', [num('B', 255)]),
  st('mk_show_bar', 'led', 'çubuk grafik {V} / en çok {MAX}', 'screen.showBar', [num('V', 3), num('MAX', 5)], { tip: 'Değeri, en çok değere göre LED sütunlarıyla gösterir.' }),
  st('mk_show_arrow', 'led', 'oku göster {DIR}', 'screen.showArrow', [drop('DIR', ARROW_OPTS, 'N')]),
  st('mk_show_arrow_deg', 'led', 'oku {ANGLE} derece yönünde göster', 'screen.showArrowAngle', [num('ANGLE', 0)], { tip: '0 yukarı, 90 sağ, 180 aşağı, 270 sol.' }),

  // ---- Müzik ----
  st('mk_play_note', 'music', '{NOTE} notasını {BEATS} vuruş çal', 'music.playNote', [drop('NOTE', NOTE_OPTS, 'Do'), drop('BEATS', BEAT_OPTS, '1', true)]),
  st('mk_play_tone', 'music', '{FREQ} Hz sesini {BEATS} vuruş çal', 'music.playTone', [num('FREQ', 440), drop('BEATS', BEAT_OPTS, '1', true)]),
  st('mk_ring', 'music', '{FREQ} Hz sesi sürekli çal', 'music.ringTone', [num('FREQ', 440)], { tip: 'Ses, durdurana kadar sürer.' }),
  st('mk_stop_sound', 'music', 'sesi durdur', 'music.stop'),
  st('mk_rest', 'music', '{BEATS} vuruş sus', 'music.rest', [drop('BEATS', BEAT_OPTS, '1', true)]),
  st('mk_play_melody', 'music', 'ezgiyi çal {MEL}', 'music.playMelody', [drop('MEL', MELODY_OPTS, 'ode')], { tip: 'Ezgi bitene kadar bekler.' }),
  st('mk_set_tempo', 'music', 'tempoyu {BPM} yap (vuruş/dk)', 'music.setTempo', [num('BPM', 120)]),
  st('mk_set_volume', 'music', 'ses seviyesini {V} yap (0-255)', 'music.setVolume', [num('V', 128)]),
  val('mk_note', 'music', 'nota {NOTE}', 'music.note', [drop('NOTE', NOTE_OPTS, 'Do')], { tip: 'Notanın frekansını (Hz) verir.' }),
  val('mk_tempo', 'music', 'tempo', 'music.tempo'),

  // ---- Radyo ----
  hat('mk_on_radio', 'radio', 'radyo mesajı alınınca', 'card.onRadio'),
  st('mk_radio_group', 'radio', 'radyo grubunu {G} yap', 'radio.setGroup', [num('G', 1)], { tip: 'Aynı gruptaki kartlar birbirini duyar (0-255).' }),
  st('mk_radio_send_number', 'radio', 'radyoyla sayı gönder {VALUE}', 'radio.sendNumber', [num('VALUE', 1)]),
  st('mk_radio_send_text', 'radio', 'radyoyla yazı gönder {TEXT}', 'radio.sendText', [txt('TEXT', 'merhaba')]),
  st('mk_radio_send_value', 'radio', 'radyoyla {NAME} = {VALUE} gönder', 'radio.sendValue', [txt('NAME', 'ad'), num('VALUE', 1)]),
  val('mk_radio_recv', 'radio', 'alınan {KIND}', 'radio.received', [drop('KIND', [['sayı', 'number'], ['yazı', 'text'], ['ad', 'name'], ['değer', 'value']], 'number')]),
  val('mk_radio_signal', 'radio', 'sinyal gücü', 'radio.signalStrength'),

  // ---- Pinler ----
  hat('mk_on_pin', 'pins', '{PIN} pinine {EV}', 'card.onPin', [drop('PIN', PIN_OPTS, 'P0'), drop('EV', TOUCH_EVENT_OPTS, 'touch')]),
  bl('mk_pin_touched', 'pins', '{PIN} pinine dokunuluyor mu?', 'pins.isTouched', [drop('PIN', PIN_OPTS, 'P0')]),
  val('mk_pin_dread', 'pins', '{PIN} dijital oku (0/1)', 'pins.digitalRead', [drop('PIN', PIN_OPTS, 'P0')]),
  st('mk_pin_dwrite', 'pins', '{PIN} dijital yaz {VALUE}', 'pins.digitalWrite', [drop('PIN', PIN_OPTS, 'P0'), num('VALUE', 1)]),
  val('mk_pin_aread', 'pins', '{PIN} analog oku (0-1023)', 'pins.analogRead', [drop('PIN', PIN_OPTS, 'P0')]),
  st('mk_pin_awrite', 'pins', '{PIN} analog yaz {VALUE}', 'pins.analogWrite', [drop('PIN', PIN_OPTS, 'P0'), num('VALUE', 512)], { tip: 'Değer 0 ile 1023 arasındadır.' }),
  st('mk_pin_servo', 'pins', '{PIN} servo açısı {ANGLE}', 'pins.servo', [drop('PIN', PIN_OPTS, 'P0'), num('ANGLE', 90)], { tip: 'Açı 0 ile 180 derece arasındadır.' }),

  // ---- Mantık / Matematik / Metin / Liste (özel) ----
  bl('mk_random_bool', 'logic', 'yazı tura (rastgele doğru/yanlış)', 'randomBool'),
  val('mk_minmax', 'math', '{A} ve {B} arasında {OP}', 'x', [num('A', 1), num('B', 2), drop('OP', [['en küçük', 'min'], ['en büyük', 'max']], 'min')], { js: 'Math.{OP}({A}, {B})', py: '{OP}({A}, {B})' }),
  val('mk_map', 'math', '{V} değerini {A}-{B} aralığından {C}-{D} aralığına eşle', 'mapRange', [num('V', 512), num('A', 0), num('B', 1023), num('C', 0), num('D', 4)], { tip: 'Bir aralıktaki değeri başka bir aralığa orantılar.' }),
  val('mk_text_length', 'text', '{TEXT} uzunluğu', 'x', [txt('TEXT', 'merhaba')], { js: 'String({TEXT}).length', py: 'len(str({TEXT}))' }),
  val('mk_text_char', 'text', '{TEXT} yazısının {INDEX} numaralı harfi', 'x', [txt('TEXT', 'merhaba'), num('INDEX', 0)], { js: 'String({TEXT}).charAt({INDEX})', py: 'str({TEXT})[{INDEX}]', tip: 'Numaralama 0 ile başlar.' }),
  val('mk_to_number', 'text', '{X} sayıya çevir', 'toNumber', [any('X')]),
  val('mk_to_text', 'text', '{X} yazıya çevir', 'x', [any('X')], { js: 'String({X})', py: 'str({X})' }),
  val('mk_list_get', 'list', '{LIST} listesinde {INDEX} numaralı öğe', 'x', [any('LIST'), num('INDEX', 0)], { js: '{(LIST)}[{INDEX}]', py: '{(LIST)}[{INDEX}]', tip: 'Numaralama 0 ile başlar.' }),
  st('mk_list_set', 'list', '{LIST} listesinde {INDEX} numaralı öğeyi {VALUE} yap', 'x', [any('LIST'), num('INDEX', 0), num('VALUE', 0)], { js: '{(LIST)}[{INDEX}] = {VALUE};', py: '{(LIST)}[{INDEX}] = {VALUE}' }),
  st('mk_list_add', 'list', '{LIST} listesine {ITEM} ekle', 'x', [any('LIST'), num('ITEM', 0)], { js: '{(LIST)}.push({ITEM});', py: '{(LIST)}.append({ITEM})' }),
  st('mk_list_remove', 'list', '{LIST} listesinden {INDEX} numaralı öğeyi sil', 'x', [any('LIST'), num('INDEX', 0)], { js: '{(LIST)}.splice({INDEX}, 1);', py: '{(LIST)}.pop({INDEX})' }),
  val('mk_list_length', 'list', '{LIST} listesinin uzunluğu', 'x', [any('LIST')], { js: '{(LIST)}.length', py: 'len({LIST})' }),
  val('mk_list_index', 'list', '{LIST} listesinde {ITEM} kaçıncı?', 'lists.indexOf', [any('LIST'), num('ITEM', 0)], { tip: 'Yoksa -1 verir.' }),
  bl('mk_list_has', 'list', '{LIST} listesinde {ITEM} var mı?', 'x', [any('LIST'), num('ITEM', 0)], { js: '{(LIST)}.includes({ITEM})', py: '({ITEM} in {LIST})' }),
]

export const BLOCK_BY_TYPE: Record<string, Spec> = Object.fromEntries(SPECS.map((s) => [s.type, s]))
export const isMikroBlock = (type: string) => type in BLOCK_BY_TYPE
export const HAT_TYPES = SPECS.filter((s) => s.kind === 'hat').map((s) => s.type)

// ---------------- Blockly JSON ----------------
export interface BlockJson {
  type: string
  style: string
  message0: string
  args0: Record<string, unknown>[]
  message1?: string
  args1?: Record<string, unknown>[]
  previousStatement?: null
  nextStatement?: null
  output?: string | null
  tooltip: string
  inputsInline: boolean
}

export const styleName = (c: CatKey) => `mk_${c}`

export function blockJson(s: Spec): BlockJson {
  const args = s.args ?? []
  const args0: Record<string, unknown>[] = []
  let message0 = s.label
  args.forEach((a, i) => {
    message0 = message0.replace(`{${a.n}}`, `%${i + 1}`)
    switch (a.k) {
      case 'val': case 'any': args0.push({ type: 'input_value', name: a.n }); break
      case 'bool': args0.push({ type: 'input_value', name: a.n, check: 'Boolean' }); break
      case 'drop': args0.push({ type: 'field_dropdown', name: a.n, options: a.opts }); break
      case 'num': args0.push({ type: 'field_number', name: a.n, value: a.def, min: a.min, max: a.max, precision: 1 }); break
      case 'leds': args0.push({ type: 'field_mk_leds', name: a.n, value: '0'.repeat(25) }); break
    }
  })
  const j: BlockJson = { type: s.type, style: styleName(s.cat), message0, args0, tooltip: s.tip ?? s.label.replace(/\{(\w+)\}/g, '…'), inputsInline: true }
  if (s.kind === 'hat') { j.message1 = '%1'; j.args1 = [{ type: 'input_statement', name: 'DO' }] }
  else if (s.kind === 'stmt') { j.previousStatement = null; j.nextStatement = null }
  else if (s.kind === 'bool') j.output = 'Boolean'
  else j.output = null
  return j
}
export const BLOCK_JSON: BlockJson[] = SPECS.map(blockJson)

/** Blok için araç kutusu girdisi: gölge (shadow) blok değerleriyle. */
export function flyoutEntry(s: Spec): { kind: 'block'; type: string; inputs?: Record<string, unknown>; fields?: Record<string, unknown> } {
  const inputs: Record<string, unknown> = {}
  const fields: Record<string, unknown> = {}
  for (const a of s.args ?? []) {
    if (a.k === 'val' && a.shadow === 'num') inputs[a.n] = { shadow: { type: 'math_number', fields: { NUM: a.def ?? 0 } } }
    else if (a.k === 'val' && a.shadow === 'text') inputs[a.n] = { shadow: { type: 'text', fields: { TEXT: a.def ?? '' } } }
    else if (a.k === 'drop' && a.def !== undefined) fields[a.n] = a.def
    else if (a.k === 'num') fields[a.n] = a.def
  }
  return { kind: 'block', type: s.type, ...(Object.keys(inputs).length ? { inputs } : {}), ...(Object.keys(fields).length ? { fields } : {}) }
}

// ---------------- yerleşik blokların kategorilere dağılımı ----------------
const numShadow = (n: number) => ({ shadow: { type: 'math_number', fields: { NUM: n } } })
export interface BuiltinEntry { type: string; inputs?: Record<string, unknown>; fields?: Record<string, unknown>; extraState?: unknown }

export const BUILTIN_ENTRIES: Partial<Record<CatKey, BuiltinEntry[]>> = {
  loops: [
    { type: 'controls_repeat_ext', inputs: { TIMES: numShadow(4) } },
    { type: 'controls_whileUntil' },
    { type: 'controls_for', inputs: { FROM: numShadow(0), TO: numShadow(4), BY: numShadow(1) } },
    { type: 'controls_forEach' },
    { type: 'controls_flow_statements' },
  ],
  logic: [
    { type: 'controls_if' },
    { type: 'controls_if', extraState: { hasElse: true } },
    { type: 'logic_compare' },
    { type: 'logic_operation' },
    { type: 'logic_negate' },
    { type: 'logic_boolean' },
    { type: 'logic_ternary' },
  ],
  math: [
    { type: 'math_number' },
    { type: 'math_arithmetic', inputs: { A: numShadow(1), B: numShadow(1) } },
    { type: 'math_modulo', inputs: { DIVIDEND: numShadow(10), DIVISOR: numShadow(3) } },
    { type: 'math_single', inputs: { NUM: numShadow(9) } },
    { type: 'math_round', inputs: { NUM: numShadow(3.7) } },
    { type: 'math_constrain', inputs: { VALUE: numShadow(50), LOW: numShadow(1), HIGH: numShadow(100) } },
    { type: 'math_random_int', inputs: { FROM: numShadow(1), TO: numShadow(6) } },
    { type: 'math_number_property', inputs: { NUMBER_TO_CHECK: numShadow(0) } },
  ],
  text: [
    { type: 'text' },
    { type: 'text_join', extraState: { itemCount: 2 } },
  ],
  list: [
    { type: 'lists_create_with', extraState: { itemCount: 3 }, inputs: { ADD0: numShadow(1), ADD1: numShadow(2), ADD2: numShadow(3) } },
    { type: 'lists_create_with', extraState: { itemCount: 0 } },
  ],
}

/** Dinamik kategorilerdeki yerleşik tür adları (araç kutusunda Blockly üretir). */
export const VARIABLE_TYPES = ['variables_get', 'variables_set', 'math_change']
export const PROCEDURE_TYPES = ['procedures_defnoreturn', 'procedures_defreturn', 'procedures_callnoreturn', 'procedures_callreturn', 'procedures_ifreturn']

/** Programda her zaman izin verilen (gölge değer) bloklar. */
export const ALWAYS_ALLOWED = ['math_number', 'text', 'logic_boolean']

export interface ToolboxCat { key: CatKey; label: string; color: string; custom?: 'VARIABLE' | 'PROCEDURE'; entries: Record<string, unknown>[] }

/** `allowed` verilirse yalnız o türler; boş kategori gösterilmez. */
export function toolboxCategories(allowed?: readonly string[] | null): ToolboxCat[] {
  const ok = allowed ? new Set(allowed) : null
  const out: ToolboxCat[] = []
  for (const c of CATEGORIES) {
    if (c.custom) {
      const types = c.custom === 'VARIABLE' ? VARIABLE_TYPES : PROCEDURE_TYPES
      if (!ok || types.some((t) => ok.has(t))) out.push({ key: c.key, label: c.label, color: c.color, custom: c.custom, entries: [] })
      continue
    }
    const entries: Record<string, unknown>[] = []
    for (const s of SPECS) if (s.cat === c.key && !s.hidden && (!ok || ok.has(s.type))) entries.push(flyoutEntry(s))
    for (const b of BUILTIN_ENTRIES[c.key] ?? []) {
      if (ok && !ok.has(b.type)) continue
      entries.push({ kind: 'block', type: b.type, ...(b.inputs ? { inputs: b.inputs } : {}), ...(b.fields ? { fields: b.fields } : {}), ...(b.extraState ? { extraState: b.extraState } : {}) })
    }
    if (entries.length) out.push({ key: c.key, label: c.label, color: c.color, entries })
  }
  return out
}

export function toolboxJson(allowed?: readonly string[] | null) {
  return {
    kind: 'categoryToolbox',
    contents: toolboxCategories(allowed).map((c) => ({
      kind: 'category',
      name: c.label,
      categorystyle: `mk_cat_${c.key}`,
      cssConfig: { icon: `mkb-ic-${c.key}` },
      ...(c.custom ? { custom: c.custom } : { contents: c.entries }),
    })),
  }
}

/** Tüm destekli blok türleri (özel + yerleşik). Etkinlik izin listeleri bundan seçer. */
export const ALL_BLOCK_TYPES: string[] = [
  ...SPECS.map((s) => s.type),
  ...Object.values(BUILTIN_ENTRIES).flatMap((l) => (l ?? []).map((b) => b.type)),
  ...VARIABLE_TYPES, ...PROCEDURE_TYPES,
].filter((t, i, a) => a.indexOf(t) === i)

export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16)
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(amount < 0 ? v * (1 + amount) : v + (255 - v) * amount)))
  return `#${((1 << 24) | (ch((n >> 16) & 255) << 16) | (ch((n >> 8) & 255) << 8) | ch(n & 255)).toString(16).slice(1)}`
}
