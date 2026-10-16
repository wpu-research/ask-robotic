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
  // ---- Aşama C ----
  /** 3,3 V ile de çalışan modüller (DHT, BMP280, MPU6050, RTC, IR, analog modüller) için beslenmiş sayılma eşiği (V). */
  powerMin3v3: 3,
  /** PIR (HC-SR501 benzeri): ısınma süresi (gerçek modülde 30-60 sn; sanal laboratuvarda kısaltıldı) ve OUT'un HIGH kalma süresi. */
  pirWarmupMs: 2000,
  pirHoldMs: 3000,
  /** Dijital çıkışlı modüllerin (PIR, IR, analog modül DO) çıkış seri direnci. */
  moduleOutOhms: 100,
  /** Enkoder/joystick: kontak (kapalı) direnci, kartın pull-up direnci. */
  encoderContactOhms: 100,
  modulePullupOhms: 10_000,
  /** Enkoder: bir tık = dört durum geçişi (11 → 01 → 00 → 10 → 11, saat yönü). */
  encoderPhasesPerClick: 4,
  /** Joystick ve analog modüllerin AO bölücüsünün toplam direnci. */
  dividerOhms: 10_000,
  /** HC-SR04 menzili (cm); dışında echo yok. */
  hcsr04MinCm: 2,
  hcsr04MaxCm: 400,
  /** RTC'nin açılış zamanı (UTC). */
  rtcStartIso: '2026-01-01T00:00:00.000Z',
  // ---- Aşama D ----
  /** Sharp IR (GP2Y0A21 benzeri): VO ≈ sharpK / cm, [sharpMinV, sharpMaxV] ile sınırlı. */
  sharpK: 26,
  sharpMinV: 0.3,
  sharpMaxV: 3.1,
  /** L298N (bipolar): yüksek taraf düşümü ve alçak taraf gerilimi; toplam ≈ 1,8 V kayıp (Hyvex: 1,5-2 V). */
  l298nDrop: 1.2,
  l298nLowV: 0.6,
  /** MOSFET köprüler (TB6612, DRV8833, BTS7960, MD10C): çok küçük düşüm. */
  fetBridgeDrop: 0.1,
  fetBridgeLowV: 0.05,
  bridgeOutOhms: 0.1,
  /** Step motor: tam adım açısı (NEMA17). */
  stepDeg: 1.8,
  /** ESC: bu genişliğin altındaki darbeler "düşük gaz"; escArmMs boyunca düşük gaz görülünce kurulur. */
  escArmUs: 1100,
  escArmMs: 1000,
  escMinUs: 1000,
  escMaxUs: 2000,
  /** Darbe bu kadar süre gelmezse ESC sinyal kaybı sayar ve kurulumu bozar. */
  escLossMs: 100,
  lipoCellV: 3.7,
} as const

/** HC-SR04 ailesi: model → ölçüm aralığı (cm), Hyvex katalog değerleri. */
export const HCSR04_MODELS: Record<string, { minCm: number; maxCm: number }> = {
  hcsr04: { minCm: 2, maxCm: 400 },
  jsnsr04t: { minCm: 25, maxCm: 600 },
  rcwl1601: { minCm: 2, maxCm: 450 },
  us100: { minCm: 2, maxCm: 450 },
}
export const hcsr04Range = (p: PartInstance): { minCm: number; maxCm: number } => HCSR04_MODELS[String(p.props.model ?? 'hcsr04')] ?? HCSR04_MODELS.hcsr04

export const sharpIrVolts = (cm: number): number => Math.min(MODEL.sharpMaxV, Math.max(MODEL.sharpMinV, MODEL.sharpK / Math.max(cm, 1)))

/**
 * Analog çıkışlı modüller: AO = VCC · clamp(base + span · seviye). `prop` seviyenin özellik anahtarı (0-1).
 * 
 * DO çıkışı, seviye ≥ eşik olduğunda LOW'dur (LM393 karşılaştırıcılı modüller).
 */
export const ANALOG_MODULES = {
  mq2: { prop: 'gas', base: 0.1, span: 0.9, minVolts: 4 },
  flame: { prop: 'flame', base: 1, span: -0.95, minVolts: 3 },
  sound: { prop: 'sound', base: 0.25, span: 0.7, minVolts: 3 },
  soil: { prop: 'moisture', base: 0.9, span: -0.6, minVolts: 3 },
  /** Yağmur kartı: kuruda yüksek (~0,95), ıslandıkça düşer (tam ıslakta ~0,10). */
  rain: { prop: 'wetness', base: 0.95, span: -0.85, minVolts: 3 },
  /** Su seviyesi çubuğu: boşta ~0,05, su yükseldikçe artar (tam doluda ~0,80; çubuk 5 V'ta tam ölçeğe ulaşmaz). */
  waterlevel: { prop: 'level', base: 0.05, span: 0.75, minVolts: 3 },
  // Aşama D: MQ ailesi (ısıtıcı 5 V ister; MQ-2 ile aynı modül davranışı)
  mq3: { prop: 'gas', base: 0.1, span: 0.9, minVolts: 4 },
  mq4: { prop: 'gas', base: 0.1, span: 0.9, minVolts: 4 },
  mq7: { prop: 'gas', base: 0.1, span: 0.9, minVolts: 4 },
  mq135: { prop: 'gas', base: 0.1, span: 0.9, minVolts: 4 },
} as const
export type AnalogModuleType = keyof typeof ANALOG_MODULES
export const isAnalogModule = (t: string): t is AnalogModuleType => t in ANALOG_MODULES

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
