// Özel (mk_*) blokların çalışma zamanı işleyicileri. runtime.ts içe aktarır; başka modül doğrudan içe aktarmamalıdır.
import { clamp } from './device'
import { ARROW_BY_ID, arrowForAngle, ICON_BY_ID, rowsToCells } from './icons'
import { MELODY_BY_ID, NOTE_FREQ } from './music'
import { MikroError, ev, evBool, evNum, evStr, type Ctx, type ExprHandler, type Gen, type StmtHandler } from './runtime'
import type { ButtonName, GestureName, PinName, Value } from './types'
import { fmtNum, looseEq, toNum, toStr } from './values'
import type { PBlock } from './types'

/** Tek harf/rakam gösteriminin sabit kalma süresi (ms). */
export const GLYPH_HOLD_MS = 600
/** Radyo mesajı sınırları (karakter). */
export const RADIO_TEXT_MAX = 32
export const RADIO_NAME_MAX = 12

const f = (b: PBlock, n: string): string => String(b.fields?.[n] ?? '')
const sleep = (ms: number): number => Math.max(1, Math.round(ms))
const idx = (b: PBlock, list: Value[], i: number): number => {
  const k = Math.trunc(i)
  if (!Number.isFinite(k) || k < 0 || k >= list.length) throw new MikroError(`Listede ${fmtNum(i)} numaralı öğe yok (liste ${list.length} öğeli, numaralar 0'dan başlar).`, b.id ?? null)
  return k
}
function* listOf(b: PBlock, name: string, c: Ctx): Gen<Value[]> {
  const v = yield* ev(b, name, c)
  if (!Array.isArray(v)) throw new MikroError('Bu blok için bir liste gerekli.', b.id ?? null)
  return v
}

function* showText(c: Ctx, text: string): Gen<void> {
  const d = c.dev
  if (text === '') return
  if ([...text].length === 1) {
    d.startGlyph(text)
    yield GLYPH_HOLD_MS
    d.finishText()
    return
  }
  const token = d.scrollTokenNow + 1
  const dur = d.startScroll(text)
  yield dur
  d.finishText(token)
}

function* playMelody(c: Ctx, id: string): Gen<void> {
  const m = MELODY_BY_ID[id]
  if (!m) return
  const d = c.dev
  d.record({ t: d.now, kind: 'melody', name: id })
  for (const [freq, beats] of m.notes) {
    const ms = d.beatMs(beats)
    if (freq > 0) d.playTone(freq, ms)
    yield sleep(ms)
  }
}

const stmts: Record<string, StmtHandler> = {
  // ---- Temel ----
  mk_on_start() {}, mk_forever() {}, mk_on_button() {}, mk_on_gesture() {}, mk_on_logo() {}, mk_on_pin() {}, mk_on_radio() {}, mk_every() {},
  *mk_show_number(b, c) {
    const n = yield* evNum(b, 'VALUE', c)
    c.dev.record({ t: c.dev.now, kind: 'number', value: n })
    yield* showText(c, fmtNum(n))
  },
  *mk_show_text(b, c) {
    const t = yield* evStr(b, 'TEXT', c)
    c.dev.record({ t: c.dev.now, kind: 'text', text: t })
    yield* showText(c, t)
  },
  mk_show_icon(b, c) {
    const ic = ICON_BY_ID[f(b, 'ICON')]
    if (!ic) return
    c.dev.record({ t: c.dev.now, kind: 'icon', icon: ic.id })
    c.dev.setLeds(rowsToCells(ic.rows))
  },
  mk_show_leds(b, c) { c.dev.setLeds(f(b, 'LEDS').padEnd(25, '0')) },
  mk_clear(_b, c) { c.dev.clear() },
  *mk_pause(b, c) { yield sleep(yield* evNum(b, 'MS', c)) },
  *mk_serial(b, c) { c.dev.writeSerial(toStr(yield* ev(b, 'TEXT', c))) },

  // ---- LED ----
  *mk_plot(b, c) { c.dev.plot(yield* evNum(b, 'X', c), yield* evNum(b, 'Y', c), 255) },
  *mk_unplot(b, c) { c.dev.plot(yield* evNum(b, 'X', c), yield* evNum(b, 'Y', c), 0) },
  *mk_plot_brightness(b, c) { c.dev.plot(yield* evNum(b, 'X', c), yield* evNum(b, 'Y', c), yield* evNum(b, 'B', c)) },
  *mk_toggle(b, c) { c.dev.toggle(yield* evNum(b, 'X', c), yield* evNum(b, 'Y', c)) },
  *mk_set_brightness(b, c) { c.dev.brightness = clamp(Math.round(yield* evNum(b, 'B', c)), 0, 255) },
  *mk_show_bar(b, c) {
    const v = yield* evNum(b, 'V', c), max = yield* evNum(b, 'MAX', c)
    const n = max > 0 ? Math.round(clamp(v / max, 0, 1) * 25) : 0
    const cells = Array<string>(25).fill('0')
    for (let k = 0; k < n; k++) cells[(4 - Math.floor(k / 5)) * 5 + (k % 5)] = '1'
    c.dev.setLeds(cells.join(''))
  },
  mk_show_arrow(b, c) { const a = ARROW_BY_ID[f(b, 'DIR')]; if (a) c.dev.setLeds(rowsToCells(a.rows)) },
  *mk_show_arrow_deg(b, c) { c.dev.setLeds(rowsToCells(ARROW_BY_ID[arrowForAngle(yield* evNum(b, 'ANGLE', c))].rows)) },

  // ---- Müzik ----
  *mk_play_note(b, c) {
    const ms = c.dev.beatMs(toNum(f(b, 'BEATS')))
    c.dev.playTone(NOTE_FREQ[f(b, 'NOTE')] ?? 262, ms)
    yield sleep(ms)
  },
  *mk_play_tone(b, c) {
    const freq = yield* evNum(b, 'FREQ', c)
    const ms = c.dev.beatMs(toNum(f(b, 'BEATS')))
    c.dev.playTone(freq, ms)
    yield sleep(ms)
  },
  *mk_ring(b, c) { c.dev.playTone(yield* evNum(b, 'FREQ', c), 0) },
  mk_stop_sound(_b, c) { c.dev.stopSound() },
  *mk_rest(b, c) {
    const ms = c.dev.beatMs(toNum(f(b, 'BEATS')))
    c.dev.record({ t: c.dev.now, kind: 'rest', ms })
    yield sleep(ms)
  },
  *mk_play_melody(b, c) { yield* playMelody(c, f(b, 'MEL')) },
  *mk_set_tempo(b, c) { c.dev.tempo = clamp(Math.round(yield* evNum(b, 'BPM', c)), 20, 400) },
  *mk_set_volume(b, c) { c.dev.volume = clamp(Math.round(yield* evNum(b, 'V', c)), 0, 255) },

  // ---- Radyo ----
  *mk_radio_group(b, c) { c.dev.setRadioGroup(yield* evNum(b, 'G', c)) },
  *mk_radio_send_number(b, c) { c.dev.radioSend({ kind: 'num', num: yield* evNum(b, 'VALUE', c) }) },
  *mk_radio_send_text(b, c) { c.dev.radioSend({ kind: 'str', str: (yield* evStr(b, 'TEXT', c)).slice(0, RADIO_TEXT_MAX) }) },
  *mk_radio_send_value(b, c) {
    const name = (yield* evStr(b, 'NAME', c)).slice(0, RADIO_NAME_MAX)
    c.dev.radioSend({ kind: 'kv', name, value: yield* evNum(b, 'VALUE', c) })
  },

  // ---- Pinler ----
  *mk_pin_dwrite(b, c) { c.dev.pinWrite(f(b, 'PIN') as PinName, 'digital', yield* evNum(b, 'VALUE', c)) },
  *mk_pin_awrite(b, c) { c.dev.pinWrite(f(b, 'PIN') as PinName, 'analog', yield* evNum(b, 'VALUE', c)) },
  *mk_pin_servo(b, c) { c.dev.pinWrite(f(b, 'PIN') as PinName, 'servo', yield* evNum(b, 'ANGLE', c)) },

  // ---- Liste ----
  *mk_list_set(b, c) {
    const l = yield* listOf(b, 'LIST', c)
    const i = yield* evNum(b, 'INDEX', c)
    const v = yield* ev(b, 'VALUE', c)
    if (Math.trunc(i) === l.length) l.push(v)
    else l[idx(b, l, i)] = v
  },
  *mk_list_add(b, c) { const l = yield* listOf(b, 'LIST', c); l.push(yield* ev(b, 'ITEM', c)) },
  *mk_list_remove(b, c) { const l = yield* listOf(b, 'LIST', c); l.splice(idx(b, l, yield* evNum(b, 'INDEX', c)), 1) },
}

const exprs: Record<string, ExprHandler> = {
  mk_button_is: (b, c) => c.dev.isPressed(f(b, 'BTN') as ButtonName),
  mk_gesture_is: (b, c) => c.dev.isGesture(f(b, 'G') as GestureName),
  mk_logo_is: (_b, c) => c.dev.logo,
  mk_accel(b, c) {
    const a = c.dev.accelNow()
    switch (f(b, 'AXIS')) { case 'y': return a.y; case 'z': return a.z; case 'strength': return c.dev.strength(); default: return a.x }
  },
  mk_tilt: (b, c) => (f(b, 'AXIS') === 'roll' ? c.dev.roll() : c.dev.pitch()),
  mk_compass: (_b, c) => c.dev.compass,
  mk_temperature: (_b, c) => c.dev.temperature,
  mk_light: (_b, c) => c.dev.light,
  mk_sound: (_b, c) => c.dev.soundLevel,
  mk_runtime: (_b, c) => Math.floor(c.rt.now),
  mk_led_on(b, c) { return Evaluate(b, c, (x, y) => c.dev.led(x, y) > 0) },
  mk_led_brightness(b, c) { return Evaluate(b, c, (x, y) => c.dev.led(x, y)) },
  mk_note: (b) => NOTE_FREQ[f(b, 'NOTE')] ?? 0,
  mk_tempo: (_b, c) => c.dev.tempo,
  mk_radio_recv(b, c) {
    const m = c.task.payload ?? c.dev.lastRadio
    if (!m) return f(b, 'KIND') === 'text' || f(b, 'KIND') === 'name' ? '' : 0
    switch (f(b, 'KIND')) {
      case 'text': return m.kind === 'str' ? (m.str ?? '') : m.kind === 'num' ? fmtNum(m.num ?? 0) : fmtNum(m.value ?? 0)
      case 'name': return m.kind === 'kv' ? (m.name ?? '') : ''
      case 'value': return m.kind === 'kv' ? (m.value ?? 0) : m.kind === 'num' ? (m.num ?? 0) : toNum(m.str)
      default: return m.kind === 'num' ? (m.num ?? 0) : m.kind === 'kv' ? (m.value ?? 0) : toNum(m.str)
    }
  },
  mk_radio_signal: (_b, c) => (c.task.payload ?? c.dev.lastRadio)?.signal ?? 0,
  mk_pin_touched: (b, c) => c.dev.pins[f(b, 'PIN') as PinName].touch,
  mk_pin_dread: (b, c) => c.dev.pinDigitalRead(f(b, 'PIN') as PinName),
  mk_pin_aread: (b, c) => c.dev.pinAnalogRead(f(b, 'PIN') as PinName),
  mk_random_bool: (_b, c) => c.rt.rand() < 0.5,
  *mk_minmax(b, c) {
    const a = yield* evNum(b, 'A', c), d = yield* evNum(b, 'B', c)
    return f(b, 'OP') === 'max' ? Math.max(a, d) : Math.min(a, d)
  },
  *mk_map(b, c) {
    const v = yield* evNum(b, 'V', c), a = yield* evNum(b, 'A', c), d = yield* evNum(b, 'B', c), e = yield* evNum(b, 'C', c), g = yield* evNum(b, 'D', c)
    if (a === d) return e
    return Math.round(e + ((v - a) * (g - e)) / (d - a))
  },
  *mk_text_length(b, c) { return [...(yield* evStr(b, 'TEXT', c))].length },
  *mk_text_char(b, c) { const s = [...(yield* evStr(b, 'TEXT', c))]; return s[Math.trunc(yield* evNum(b, 'INDEX', c))] ?? '' },
  *mk_to_number(b, c) { return toNum(yield* ev(b, 'X', c)) },
  *mk_to_text(b, c) { return toStr(yield* ev(b, 'X', c)) },
  *mk_list_get(b, c) { const l = yield* listOf(b, 'LIST', c); return l[idx(b, l, yield* evNum(b, 'INDEX', c))] },
  *mk_list_length(b, c) { return (yield* listOf(b, 'LIST', c)).length },
  *mk_list_index(b, c) {
    const l = yield* listOf(b, 'LIST', c)
    const it = yield* ev(b, 'ITEM', c)
    return l.findIndex((x) => looseEq(x, it))
  },
  *mk_list_has(b, c) {
    const l = yield* listOf(b, 'LIST', c)
    const it = yield* ev(b, 'ITEM', c)
    return l.some((x) => looseEq(x, it))
  },
}

function* Evaluate<T>(b: PBlock, c: Ctx, fn: (x: number, y: number) => T): Gen<T> {
  const x = Math.round(yield* evNum(b, 'X', c)), y = Math.round(yield* evNum(b, 'Y', c))
  return fn(x, y)
}

export const OPS = { stmts, exprs }
export { evBool }
