// Mikro Kart / Robot Atölyesi — İngilizce görünüm metinleri (yalnız gösterim). Blok türleri, alan değerleri, kayıt biçimi ve
// üretilen kod DEĞİŞMEZ; burada yalnız blok etiketleri, ipuçları, açılır liste yazıları ve çalışma hatalarının İngilizcesi var.
// Türkçe kaynak blocks.ts / icons.ts / music.ts / robot.ts / runtime.ts içindedir.
import type { CatKey } from './blocks'
import type { FloorColor, RobotProfileId, RobotSensor } from './robot'
import { DONUSEN_IDS, DONUSEN_MODELS } from './donusen'

export type MikroLocale = 'tr' | 'en'

export const CATEGORY_EN: Record<CatKey, string> = {
  robot: 'Robot', donusen: 'Transform', basic: 'Basic', input: 'Input', led: 'LED', music: 'Music', radio: 'Radio', loops: 'Loops', logic: 'Logic',
  vars: 'Variables', math: 'Math', text: 'Text', list: 'Lists', func: 'Functions', pins: 'Pins',
}

/** Blok türü → İngilizce etiket (aynı `{ADI}` yer tutucularıyla) ve isteğe bağlı ipucu. */
export const BLOCK_EN: Record<string, { label: string; tip?: string }> = {
  rb_move: { label: 'drive {DIR} {CM} cm', tip: 'The next block waits until the robot has driven this far and stopped.' },
  rb_turn: { label: 'turn {DIR} {DEG} degrees', tip: 'The robot turns on the spot; the next block runs when the turn is done.' },
  rb_motors: { label: 'run motors left {L} % right {R} %', tip: 'Power is between -100 and 100; minus spins backwards. The robot keeps going until you stop it.' },
  rb_stop: { label: 'stop motors' },
  rb_speed: { label: 'set drive speed to {P} %', tip: 'The "drive" and "turn" blocks use this speed (10-100).' },
  rb_distance: { label: 'distance (cm)', tip: 'Distance to the obstacle in front; up to 250 cm.' },
  rb_color_is: { label: 'floor color is {C}?' },
  rb_color: { label: 'floor color' },
  rb_reflect: { label: 'reflected light (%)', tip: 'High on a white floor, low on a black line.' },
  rb_line: { label: '{SIDE} line sensor on the line?' },
  rb_pressed: { label: 'bumper pressed?' },
  rb_motor_deg: { label: '{SIDE} motor angle (°)', tip: 'Total angle the wheel has turned.' },
  rb_heading: { label: 'turn angle (°)', tip: 'How far the robot has turned since the start; left is plus, right is minus.' },
  rb_reset: { label: 'reset angles', tip: 'Resets the motor angles and the turn angle.' },
  rb_lights: { label: 'set lights to {COLOR}' },
  dn_walk: { label: 'walk {DIR} {STEPS} steps', tip: 'Each step is 10 cm.' },
  dn_wave: { label: 'wave {ARM} arm' },
  dn_turn_around: { label: 'turn around' },
  dn_say: { label: 'say {TEXT}', tip: 'The text appears in a speech bubble.' },
  dn_drive: { label: 'drive {DIR} {CM} cm' },
  dn_pose: { label: 'cat {POSE}' },
  dn_tail: { label: 'wag tail {N} times' },
  dn_strum: { label: 'strum the string', tip: 'The note depends on how far your hand is: the closer the hand, the higher the note.' },
  dn_boom: { label: 'turn arm to {DEG} degrees', tip: 'Between 0 and 180 degrees.' },
  dn_hook: { label: '{UPDOWN} the hook' },
  dn_grab: { label: '{ACTION} the load', tip: 'Grabs the load under the hook when the hook is down.' },
  dn_distance: { label: 'distance (cm)', tip: 'The wall in front for the humanoid and the car; your hand for the cat and the instrument.' },
  rb_grip: { label: '{ACTION} gripper', tip: 'Closing grabs the cube in front; opening drops it.' },
  rb_holding: { label: 'gripper holding a cube?' },
  rb_held_is: { label: 'held cube is {C}?', tip: 'The color sensor in the gripper reads the cube\'s color.' },

  mk_on_start: { label: 'on start', tip: 'Runs once when the program starts.' },
  mk_forever: { label: 'forever', tip: 'The blocks inside repeat without stopping.' },
  mk_every: { label: 'every {MS} ms', tip: 'Runs again and again at a set interval.' },
  mk_show_number: { label: 'show number {VALUE}', tip: 'Scrolls the number across the screen.' },
  mk_show_text: { label: 'show text {TEXT}', tip: 'Scrolls the text across the screen.' },
  mk_show_icon: { label: 'show icon {ICON}' },
  mk_show_leds: { label: 'show LEDs {LEDS}', tip: 'Click the boxes to draw your own pattern.' },
  mk_clear: { label: 'clear screen' },
  mk_pause: { label: 'pause {MS} ms', tip: '1000 ms = 1 second.' },
  mk_serial: { label: 'print to console {TEXT}' },

  mk_on_button: { label: 'on button {BTN} {EV}' },
  mk_on_gesture: { label: 'when card is {G}' },
  mk_on_logo: { label: 'when logo is {EV}' },
  mk_button_is: { label: 'button {BTN} pressed?' },
  mk_gesture_is: { label: 'card is {G}?' },
  mk_logo_is: { label: 'logo touched?' },
  mk_accel: { label: 'acceleration ({AXIS})' },
  mk_tilt: { label: 'tilt ({AXIS}) degrees' },
  mk_compass: { label: 'compass heading (degrees)' },
  mk_temperature: { label: 'temperature (°C)' },
  mk_light: { label: 'light level' },
  mk_sound: { label: 'sound level' },
  mk_runtime: { label: 'running time (ms)' },

  mk_plot: { label: 'plot x {X} y {Y}' },
  mk_unplot: { label: 'unplot x {X} y {Y}' },
  mk_plot_brightness: { label: 'plot x {X} y {Y} brightness {B}', tip: 'Brightness is between 0 and 255.' },
  mk_toggle: { label: 'toggle LED x {X} y {Y}' },
  mk_led_on: { label: 'LED x {X} y {Y} is on?' },
  mk_led_brightness: { label: 'brightness of LED x {X} y {Y}' },
  mk_set_brightness: { label: 'set screen brightness to {B}' },
  mk_show_bar: { label: 'bar graph {V} up to {MAX}', tip: 'Shows the value as LED columns, compared to the largest value.' },
  mk_show_arrow: { label: 'show arrow {DIR}' },
  mk_show_arrow_deg: { label: 'show arrow at {ANGLE} degrees', tip: '0 up, 90 right, 180 down, 270 left.' },

  mk_play_note: { label: 'play note {NOTE} for {BEATS} beat' },
  mk_play_tone: { label: 'play tone {FREQ} Hz for {BEATS} beat' },
  mk_ring: { label: 'ring tone {FREQ} Hz', tip: 'The sound keeps playing until you stop it.' },
  mk_stop_sound: { label: 'stop sound' },
  mk_rest: { label: 'rest for {BEATS} beat' },
  mk_play_melody: { label: 'play melody {MEL}', tip: 'Waits until the melody ends.' },
  mk_set_tempo: { label: 'set tempo to {BPM} (bpm)' },
  mk_set_volume: { label: 'set volume to {V} (0-255)' },
  mk_note: { label: 'note {NOTE}', tip: 'Gives the frequency (Hz) of the note.' },
  mk_tempo: { label: 'tempo' },

  mk_on_radio: { label: 'on radio received' },
  mk_radio_group: { label: 'set radio group to {G}', tip: 'Cards in the same group hear each other (0-255).' },
  mk_radio_send_number: { label: 'radio send number {VALUE}' },
  mk_radio_send_text: { label: 'radio send text {TEXT}' },
  mk_radio_send_value: { label: 'radio send {NAME} = {VALUE}' },
  mk_radio_recv: { label: 'received {KIND}' },
  mk_radio_signal: { label: 'signal strength' },

  mk_on_pin: { label: 'on pin {PIN} {EV}' },
  mk_pin_touched: { label: 'pin {PIN} touched?' },
  mk_pin_dread: { label: 'digital read {PIN} (0/1)' },
  mk_pin_dwrite: { label: 'digital write {PIN} to {VALUE}' },
  mk_pin_aread: { label: 'analog read {PIN} (0-1023)' },
  mk_pin_awrite: { label: 'analog write {PIN} to {VALUE}', tip: 'The value is between 0 and 1023.' },
  mk_pin_servo: { label: 'servo {PIN} to angle {ANGLE}', tip: 'The angle is between 0 and 180 degrees.' },

  mk_random_bool: { label: 'coin flip (random true/false)' },
  mk_minmax: { label: '{OP} of {A} and {B}' },
  mk_map: { label: 'map {V} from {A}-{B} to {C}-{D}', tip: 'Scales a value from one range to another.' },
  mk_text_length: { label: 'length of {TEXT}' },
  mk_text_char: { label: 'letter {INDEX} of {TEXT}', tip: 'Numbering starts at 0.' },
  mk_to_number: { label: 'convert {X} to number' },
  mk_to_text: { label: 'convert {X} to text' },
  mk_list_get: { label: 'item {INDEX} of list {LIST}', tip: 'Numbering starts at 0.' },
  mk_list_set: { label: 'set item {INDEX} of list {LIST} to {VALUE}' },
  mk_list_add: { label: 'add {ITEM} to list {LIST}' },
  mk_list_remove: { label: 'remove item {INDEX} from list {LIST}' },
  mk_list_length: { label: 'length of list {LIST}' },
  mk_list_index: { label: 'position of {ITEM} in list {LIST}', tip: 'Gives -1 if it is not there.' },
  mk_list_has: { label: 'list {LIST} contains {ITEM}?' },
}

const NOTE_NAME: Record<string, string> = { Do: 'C', Re: 'D', Mi: 'E', Fa: 'F', Sol: 'G', La: 'A', Si: 'B' }
/** Nota adı (Türkçe değer) → İngilizce etiket: 'Alçak Do' → 'Low C'. */
export function noteEn(v: string): string {
  const [a, b] = v.split(' ')
  if (b) return `${a === 'Alçak' ? 'Low' : 'High'} ${NOTE_NAME[b] ?? b}`
  return NOTE_NAME[a] ?? a
}

export const ICON_EN: Record<string, string> = {
  heart: 'heart', smallHeart: 'small heart', happy: 'happy face', sad: 'sad face', surprised: 'surprised face', asleep: 'sleeping face',
  yes: 'yes', no: 'no', arrowUp: 'up arrow', arrowDown: 'down arrow', arrowLeft: 'left arrow', arrowRight: 'right arrow',
  square: 'square', diamond: 'diamond', triangle: 'triangle', house: 'house', target: 'target', ghost: 'ghost', skull: 'skull',
  butterfly: 'butterfly', cat: 'cat', note: 'note', sun: 'sun',
}
export const ARROW_EN: Record<string, string> = {
  N: '↑ north', NE: '↗ northeast', E: '→ east', SE: '↘ southeast', S: '↓ south', SW: '↙ southwest', W: '← west', NW: '↖ northwest',
}
export const MELODY_EN: Record<string, string> = {
  ode: 'Ode to joy', twinkle: 'Twinkle star', fanfare: 'Fanfare', sad: 'Sad', alarm: 'Alarm', up: 'Going up', down: 'Going down',
  jingle: 'Jingle', chirp: 'Birdsong',
}

export const FLOOR_EN: Record<FloorColor | 'kapali', string> = {
  siyah: 'black', beyaz: 'white', kirmizi: 'red', yesil: 'green', mavi: 'blue', sari: 'yellow', kapali: 'off',
}

/** Açılır liste değerlerinin İngilizcesi (değer → yazı). Blok türüne özel olanlar `OPT_EN_BY_TYPE` içinde. */
const OPT_EN: Record<string, string> = {
  forward: 'forward', back: 'backward', left: 'left', right: 'right',
  press: 'pressed', release: 'released', long: 'long pressed', touch: 'touched',
  shake: 'shaken', tiltLeft: 'tilted left', tiltRight: 'tilted right', tiltForward: 'tilted forward', tiltBack: 'tilted back',
  faceUp: 'face up', faceDown: 'face down', freeFall: 'falling',
  strength: 'strength', pitch: 'pitch (forward +)', roll: 'roll (right +)', min: 'smaller', max: 'larger',
  close: 'close', open: 'open', both: 'both', otur: 'sits', kalk: 'stands', down: 'lower', up: 'raise', grab: 'grab',
  number: 'number', text: 'text', name: 'name', value: 'value',
  ...FLOOR_EN,
}
const OPT_EN_BY_TYPE: Record<string, Record<string, string>> = {
  mk_gesture_is: { shake: 'shaking', freeFall: 'falling' },
  dn_grab: { release: 'drop' },
}

/** Bir açılır liste seçeneğinin görünen yazısı (Türkçe yazı `tr`, değer `value`). */
export function optionEn(type: string, arg: string, value: string, tr: string): string {
  if (arg === 'ICON') return ICON_EN[value] ?? tr
  if (arg === 'DIR' && type === 'mk_show_arrow') return ARROW_EN[value] ?? tr
  if (arg === 'MEL') return MELODY_EN[value] ?? tr
  if (arg === 'NOTE') return noteEn(value)
  if (arg === 'BEATS' || arg === 'PIN' || arg === 'BTN') return tr
  return OPT_EN_BY_TYPE[type]?.[value] ?? OPT_EN[value] ?? tr
}

/** Araç kutusundaki hazır yazı değerlerinin İngilizcesi. */
export const TEXT_DEFAULT_EN: Record<string, string> = { 'Merhaba!': 'Hello!', merhaba: 'hello', ad: 'name' }

/** Yerleşik Blockly bloklarının İngilizce etiketleri (Blockly'nin İngilizcesinin üstüne, çocuk dostu kısaltmalar). */
export const MESSAGES_EN: Record<string, string> = {
  CONTROLS_REPEAT_INPUT_DO: '',
  VARIABLES_DEFAULT_NAME: 'item',
  NEW_VARIABLE: 'Make a variable...',
  NEW_VARIABLE_TITLE: 'New variable name:',
  CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK: 'break out of loop',
  CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE: 'skip to next round',
  MATH_RANDOM_INT_TITLE: 'random number from %1 to %2',
  MATH_CONSTRAIN_TITLE: 'limit %1 between %2 and %3',
  PROCEDURES_DEFNORETURN_TITLE: 'function',
  PROCEDURES_DEFRETURN_TITLE: 'function',
  PROCEDURES_BEFORE_PARAMS: 'inputs:',
  PROCEDURES_CALL_BEFORE_PARAMS: 'inputs:',
  PROCEDURES_DEFRETURN_RETURN: 'give back',
  LISTS_CREATE_WITH_INPUT_WITH: 'make list',
  LISTS_CREATE_EMPTY_TITLE: 'empty list',
  TEXT_JOIN_TITLE_CREATEWITH: 'join texts',
}

export const PROFILE_EN: Record<RobotProfileId, { title: string; summary: string }> = {
  blok: { title: 'Block Robot', summary: 'A two-motor robot built from construction parts: distance sensor in front, color sensor underneath, bumper (force) sensor in front.' },
  gezgin: { title: 'Mini Rover', summary: 'A small ready-made robot: ultrasonic distance sensor in front, two line sensors underneath, two colored headlights in front.' },
  kiskac: { title: 'Gripper Robot', summary: 'A two-motor robot with a two-finger gripper in front: distance sensor in front, color sensor underneath; the gripper grabs, carries and senses the color of a cube.' },
}
const SENSOR_EN: Record<string, string> = {
  'mesafe sensörü': 'distance sensor', 'renk sensörü': 'color sensor', 'tampon (kuvvet) sensörü': 'bumper (force) sensor', 'çizgi sensörü': 'line sensor', 'kıskaç': 'gripper', 'ışık sensörü': 'light sensor', 'jiroskop': 'gyro',
}
export const SENSOR_LABEL_EN: Record<RobotSensor, string> = { distance: 'distance sensor', color: 'color sensor', force: 'bumper sensor', line: 'line sensor', gripper: 'gripper', light: 'light sensor', gyro: 'gyro' }
const PROFILE_TITLE_EN: Record<string, string> = { 'Blok Robotu': 'Block Robot', 'Mini Gezgin': 'Mini Rover', 'Kıskaçlı Robot': 'Gripper Robot' }

const MODEL_TITLE_EN: Record<string, string> = Object.fromEntries(DONUSEN_IDS.map((id) => [DONUSEN_MODELS[id].title, DONUSEN_MODELS[id].en.title]))

/** Çalışma ve dosya hatalarının (lib içinde Türkçe üretilir) görünen İngilizcesi. Tanınmayan metin olduğu gibi kalır. */
const ERRORS_EN: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^Program çok fazla adım çalıştırdı\. Döngülerini kontrol et\.$/, () => 'The program ran too many steps. Check your loops.'],
  [/^Program durmadan döngüde kaldı\. Döngünün içine bir 'bekle' bloğu ekle\.$/, () => "The program got stuck in a loop. Add a 'pause' block inside the loop."],
  [/^Bilinmeyen blok: (.*)$/, (m) => `Unknown block: ${m[1]}`],
  [/^"Her öğe için" bloğuna bir liste vermelisin\.$/, () => 'The "for each item" block needs a list.'],
  [/^"(.*)" adlı fonksiyon bulunamadı\.$/, (m) => `Function "${m[1]}" was not found.`],
  [/^"(.*)" fonksiyonu kendini çok derin çağırdı\.$/, (m) => `Function "${m[1]}" called itself too many times.`],
  [/^Beklenmeyen hata: (.*)$/, (m) => `Unexpected error: ${m[1]}`],
  [/^Beklenmeyen hata$/, () => 'Unexpected error'],
  [/^Listede (.+) numaralı öğe yok \(liste (\d+) öğeli, numaralar 0'dan başlar\)\.$/, (m) => `There is no item ${m[1]} in the list (the list has ${m[2]} items, numbering starts at 0).`],
  [/^Bu blok için bir liste gerekli\.$/, () => 'This block needs a list.'],
  [/^Robot blokları yalnız Robot Atölyesi'nde, kart bir robota takılıyken çalışır\.$/, () => 'Robot blocks only work in the Robot Workshop, when the card is on a robot.'],
  [/^(.+) gövdesinde (.+) yok\.$/, (m) => `The ${PROFILE_TITLE_EN[m[1]] ?? m[1]} has no ${SENSOR_EN[m[2]] ?? m[2]}.`],
  [/^Dönüşen Robot blokları yalnız Robot Atölyesi'nde, kart Dönüşen Robot'a takılıyken çalışır\.$/, () => 'Transforming Robot blocks only work in the Robot Workshop, when the card is on the Transforming Robot.'],
  [/^(.+) modelinde bu blok yok; (.+) modelinde çalışır\.$/, (m) => `The ${MODEL_TITLE_EN[m[1]] ?? m[1]} model has no such block; it works on: ${m[2].split(', ').map((x) => MODEL_TITLE_EN[x] ?? x).join(', ')}.`],
  [/^Bloklar çok derin iç içe\.$/, () => 'Blocks are nested too deeply.'],
  [/^Geçersiz blok\.$/, () => 'Invalid block.'],
  [/^Blok türü eksik\.$/, () => 'A block type is missing.'],
  [/^Tanınmayan blok: (.*)$/, (m) => `Unknown block: ${m[1]}`],
  [/^Çok fazla blok var\.$/, () => 'There are too many blocks.'],
  [/^Geçersiz giriş\.$/, () => 'Invalid input.'],
  [/^Dosya bir proje gibi görünmüyor\.$/, () => 'This file does not look like a project.'],
  [/^Bu proje sürümü desteklenmiyor\.$/, () => 'This project version is not supported.'],
  [/^Projede blok bulunamadı\.$/, () => 'No blocks found in the project.'],
  [/^Değişken listesi bozuk\.$/, () => 'The variable list is broken.'],
  [/^Dosya çok büyük\.$/, () => 'The file is too big.'],
  [/^Dosya okunamadı \(JSON değil\)\.$/, () => 'Could not read the file (not JSON).'],
]

export function errorText(msg: string, locale: MikroLocale): string {
  if (locale !== 'en') return msg
  for (const [re, fn] of ERRORS_EN) { const m = msg.match(re); if (m) return fn(m) }
  return msg
}

/** Sahne kimliği → İngilizce sahne adı (2B görünüşün erişilebilir adı). */
export const SCENE_EN: Record<string, string> = {
  'ilk-surus': 'First drive', kare: 'Draw a square', 'duvarda-dur': 'Stop at the wall', 'renkte-dur': 'Stop on red', 'cizgi-izle': 'Follow the line',
  labirent: 'Escape the corridor', serbest: 'Free arena', 'kontrol-turu': 'Checkpoint tour', 'renk-avcisi': 'Color hunter',
  'park-et': 'Park it', merdiven: 'Climb the stairs', slalom: 'Slalom', 'engelden-don': 'Bump and come back', 'renk-sirasi': 'Color order',
  'kavsak-say': 'Count the crossings', 'sag-el': 'Maze', 'nesne-tasi': 'Carry the cube', 'hizli-tur': 'Fast lap', sumo: 'Sumo ring', 'renge-gore-ayir': 'Sort by color',
}
/** Arenadaki bölge yazıları (Türkçe yazı → İngilizce). */
export const ZONE_EN: Record<string, string> = { hedef: 'target', 'başlangıç': 'start', 'çıkış': 'exit', 'bitiş': 'finish', park: 'parking', ev: 'home', zirve: 'top' }
