// Parça modelleri: sabitler, direnç formülleri ve LED benzeri elemanların listesi.
import type { Circuit, PartInstance, PinRef } from './contract.js'

/** Çıkış pini serbest akım sınırı ve model sabitleri (SI birimleri). */
export const MODEL = {
  vcc: 5,
  v3v3: 3.3,
  /** İdeal sayılan 5V/3V3 hatlarının seri direnci (kısa devrede tekilliği önler). */
  railOhms: 0.01,
  /** Arduino çıkış pini seri direnci. */
  pinOhms: 25,
  /** INPUT_PULLUP iç direnci. */
  pullupOhms: 35_000,
  ledSeriesOhms: 5,
  buttonOnOhms: 0.1,
  buzzerOhms: 100,
  /** Dijital giriş eşiği (V). */
  digitalThreshold: 2.5,
  /** LED yanma (kalıcı hasar) akımı; bunun üstünde burnt=true. */
  ledBurnA: 0.030,
  /** Seri direnci yok sayılan LED akımı eşiği. */
  ledNoResistorA: 0.025,
  /** Uno pini akım uyarı eşiği. */
  pinOvercurrentA: 0.040,
  /** Parlaklık referans akımı: bu akımda (ve doluluk 1'de) brightness = 1. */
  ledRefA: 0.010,
  /** Doluluk oranı penceresi (ms): 490 Hz PWM'in ~2 periyodu. */
  dutyWindowMs: 4.1,
  /** Aktif buzzerin üretilen sabit frekansı (görsel/işitsel amaçlı). */
  activeBuzzerHz: 2000,
  /** Aktif buzzer ses eşiği (V). */
  buzzerOnVolts: 2,
  /** Servo çalışma gerilimi eşiği (V). */
  servoMinVolts: 4,
  servoMinUs: 544,
  servoMaxUs: 2400,
  /** Servo/ buzzer frekans gözlem penceresi (ms). */
  waveWindowMs: 60,
  /** Rail akımı bu değerin üstündeyse kısa devre (A). 5V hattı ideal sayılır (0,01 Ω); gerçek kısa devre yüzlerce amperdir. */
  railShortA: 1.5,
  // ---- Aşama B ----
  /** Beslenmiş sayılma eşiği: VCC–GND farkı (V). */
  powerMinVolts: 4,
  diodeVf: 0.7,
  diodeOhms: 1,
  /** NPN: kazanç, taban-emitör eşiği ve seri direnci, doyum VCE ve doyum direnci. */
  npnBeta: 100,
  npnVbe: 0.7,
  npnRbe: 1,
  npnVsat: 0.2,
  npnRsat: 0.5,
  /** Taban akımı bu değerin üstündeyse uyarı (A). */
  baseOverA: 0.030,
  mosfetVth: 2,
  mosfetRon: 0.05,
  motorOhms: 10,
  /** DC motor anma gerilimi (V): hız = clamp(V/anma, -1, 1). */
  motorRatedV: 6,
  /** L293D: yüksek çıkış = VCC2 − düşüm; düşük çıkış = GND + lowV; çıkış seri direnci. */
  l293dDrop: 1.4,
  l293dLowV: 0.2,
  l293dOutOhms: 0.1,
  relayContactOhms: 0.1,
  /** 74HC595 çıkışının seri direnci (≈ Uno pini gibi, daha sert). */
  sr595OutOhms: 50,
  segVf: 1.9,
  /** LCD: V0 bu değerin üstündeyse ekran boş görünür (V). */
  lcdV0Max: 1.6,
  /** LCD arka ışığı: ileri gerilim ve seri direnç; akım bu eşiğin üstündeyse yanık sayılır (A). */
  lcdBlVf: 3,
  lcdBlOhms: 15,
  lcdBlOnA: 0.001,
} as const

const LED_VF: Record<string, number> = { red: 1.9, yellow: 2.0, green: 2.2, blue: 3.0, white: 3.0 }
export function ledVf(color: unknown): number { return LED_VF[String(color)] ?? LED_VF.red }

export const SEGMENTS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'] as const

const RGB_VF = { R: 1.9, G: 2.2, B: 3.0 } as const

export function ldrOhms(light: number): number {
  const l = Math.min(1, Math.max(0, light))
  return 1e6 * Math.pow(2e-4, l)
}

export function ntcOhms(tempC: number): number {
  const t = tempC + 273.15
  return 10_000 * Math.exp(3950 * (1 / t - 1 / 298.15))
}

export const num = (p: PartInstance, key: string, def: number): number => {
  const v = p.props[key]
  return typeof v === 'number' && Number.isFinite(v) ? v : def
}

/** Diyot benzeri eleman: LED, RGB kanalı, 7-segment çubuğu (yanabilir) ya da diyot / LCD arka ışığı (yanmaz). */
export interface LedSpec {
  /** Benzersiz: LED için part id, RGB/7-segment için `id.R` / `id.a` … */
  key: string
  partId: string
  channel?: string
  kind: 'led' | 'rgb' | 'seg' | 'diode' | 'backlight'
  /** true: LED gibi sınırı aşınca yanar ve uyarı üretir (diyot ve arka ışık yanmaz). */
  burnable: boolean
  a: PinRef
  k: PinRef
  vf: number
  rs: number
}

export function ledSpecs(circuit: Circuit): LedSpec[] {
  const out: LedSpec[] = []
  for (const p of circuit.parts) {
    if (p.type === 'led') {
      out.push({ key: p.id, partId: p.id, kind: 'led', burnable: true, a: { part: p.id, pin: 'A' }, k: { part: p.id, pin: 'K' }, vf: ledVf(p.props.color), rs: MODEL.ledSeriesOhms })
    } else if (p.type === 'diode') {
      out.push({ key: p.id, partId: p.id, kind: 'diode', burnable: false, a: { part: p.id, pin: 'A' }, k: { part: p.id, pin: 'K' }, vf: MODEL.diodeVf, rs: MODEL.diodeOhms })
    } else if (p.type === 'lcd1602') {
      out.push({ key: `${p.id}.bl`, partId: p.id, channel: 'bl', kind: 'backlight', burnable: false, a: { part: p.id, pin: 'A' }, k: { part: p.id, pin: 'K' }, vf: MODEL.lcdBlVf, rs: MODEL.lcdBlOhms })
    } else if (p.type === 'sevenseg') {
      const anode = p.props.common === 'anode'
      const com: PinRef = { part: p.id, pin: 'COM' }
      for (const c of SEGMENTS) {
        const seg: PinRef = { part: p.id, pin: c }
        out.push({ key: `${p.id}.${c}`, partId: p.id, channel: c, kind: 'seg', burnable: true, a: anode ? com : seg, k: anode ? seg : com, vf: MODEL.segVf, rs: MODEL.ledSeriesOhms })
      }
    } else if (p.type === 'rgbled') {
      const anode = p.props.common === 'anode'
      for (const c of ['R', 'G', 'B'] as const) {
        const ch: PinRef = { part: p.id, pin: c }, com: PinRef = { part: p.id, pin: 'COM' }
        out.push({ key: `${p.id}.${c}`, partId: p.id, channel: c, kind: 'rgb', burnable: true, a: anode ? com : ch, k: anode ? ch : com, vf: RGB_VF[c], rs: MODEL.ledSeriesOhms })
      }
    }
  }
  return out
}
