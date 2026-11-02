// Devre laboratuvarı ile MuJoCo robotu arasındaki köprü.
//
// Laboratuvar PWM'i zaten çözer: bir servonun açısı `PartRuntime.servo.angleDeg`,
// bir DC motorun hızı `dcmotor.speed` (-1…+1) olarak hazır gelir. Bu dosyanın işi
// o sayıları MuJoCo motor aralığına, MuJoCo sensör okumalarını da devre
// parçalarının canlı özelliklerine (`PROPS` içinde `live: true`) taşımaktır.
//
// Buradaki her şey saf fonksiyondur: ne React'e ne MuJoCo'ya ne de laboratuvara
// bağlıdır, böylece tarayıcısız sınanabilir. Bağlayan taraf `pumpWiring`'i çağırır.

/** Devredeki bir sürücü parçanın MuJoCo motoruna bağlanması. */
export interface MotorLink {
  /** MuJoCo motor (actuator) adı. */
  actuator: string
  /** Devredeki parça kimliği. */
  partId: string
  kind: 'servo' | 'dcmotor'
  /** Yön ters bağlanmışsa (kırmızı-siyah takas): değer işaret değiştirir. */
  invert?: boolean
  /** Servo için açı aralığı; varsayılan 0-180°. */
  degMin?: number
  degMax?: number
}

/** MuJoCo sensör kanalının devredeki bir sensör parçasına bağlanması. */
export interface SensorLink {
  partId: string
  /** Parçanın canlı özelliği: 'distanceCm', 'ax', 'tempC'… */
  prop: string
  /** MuJoCo sensör kanalı adı. */
  channel: string
  /** Kanal biriminden özellik birimine çarpan (ör. metre → cm: 100). */
  scale?: number
  offset?: number
  /** Özelliğin geçerli aralığı; sensör bu sınırlara kırpılır. */
  min?: number
  max?: number
}

export interface WiringPlan {
  motors: MotorLink[]
  sensors: SensorLink[]
}

export const EMPTY_PLAN: WiringPlan = { motors: [], sensors: [] }

/** MuJoCo motorunun kontrol aralığı. */
export interface CtrlRange { name: string; lo: number; hi: number }

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v)

/** Sonlu olmayan değerler (NaN, ±∞) devreden gelebilir; fizik motoruna sızmamalı. */
const finite = (v: number, fallback = 0) => (Number.isFinite(v) ? v : fallback)

/**
 * Servo açısını motor kontrol değerine eşler: `degMin…degMax` aralığı `lo…hi` aralığına
 * doğrusal oturur. Aralık dışı açı kırpılır (gerçek servo da mekanik sınırda durur).
 */
export function servoToCtrl(angleDeg: number, r: CtrlRange, link?: Pick<MotorLink, 'invert' | 'degMin' | 'degMax'>): number {
  const dMin = link?.degMin ?? 0
  const dMax = link?.degMax ?? 180
  const span = dMax - dMin
  if (span === 0) return r.lo
  const t = clamp((finite(angleDeg, dMin) - dMin) / span, 0, 1)
  const u = link?.invert ? 1 - t : t
  return r.lo + u * (r.hi - r.lo)
}

/**
 * DC motor hızını (-1…+1) kontrol değerine eşler. Simetrik aralıkta (-x…+x) hız
 * doğrudan karşılığını bulur; tek yönlü aralıkta (0…x) negatif hız sıfıra oturur.
 */
export function motorToCtrl(speed: number, r: CtrlRange, link?: Pick<MotorLink, 'invert'>): number {
  const s = clamp(finite(speed), -1, 1) * (link?.invert ? -1 : 1)
  return clamp(r.lo + ((s + 1) / 2) * (r.hi - r.lo), Math.min(r.lo, r.hi), Math.max(r.lo, r.hi))
}

/** MuJoCo kanal okumasını parçanın özellik birimine çevirir ve sınırlarına kırpar. */
export function channelToProp(value: number, link: SensorLink): number {
  if (link.prop === 'distanceCm' && value < 0) return link.max ?? 400
  const v = finite(value) * (link.scale ?? 1) + (link.offset ?? 0)
  return clamp(finite(v), link.min ?? -Infinity, link.max ?? Infinity)
}

/** `pumpWiring`'in laboratuvardan ihtiyaç duyduğu kadarı (LabApi'nin dar görünümü). */
export interface LabView {
  state: { parts: Record<string, { servo?: { angleDeg: number }; dcmotor?: { speed: number } } | undefined> }
  setProp(partId: string, key: string, value: number): void
}

export interface PumpArgs {
  lab: LabView
  plan: WiringPlan
  /** MuJoCo motorlarının kontrol aralıkları (sıra `ctrl` dizisiyle aynı). */
  ranges: CtrlRange[]
  /** Yazılacak kontrol dizisi (yerinde değiştirilir). */
  ctrl: number[]
  /** O anki MuJoCo sensör okumaları (kanal adı → değer). */
  readings: Record<string, number>
}

/**
 * Bir benzetim adımında iki yönü de taşır: devredeki sürücüler → motor hedefleri,
 * MuJoCo sensörleri → devredeki sensör özellikleri. Bağlanmamış motora dokunulmaz,
 * böylece elle sürüş ve blok programı aynı anda çalışmaya devam edebilir.
 *
 * Dönen sayı, gerçekten sürülen motor sayısıdır (arayüz "kablo bağlı mı" diye sorar).
 */
export function pumpWiring({ lab, plan, ranges, ctrl, readings }: PumpArgs): number {
  let driven = 0
  for (const link of plan.motors) {
    const i = ranges.findIndex((r) => r.name === link.actuator)
    if (i < 0) continue
    const part = lab.state.parts[link.partId]
    if (!part) continue
    if (link.kind === 'servo') {
      if (!part.servo) continue
      ctrl[i] = servoToCtrl(part.servo.angleDeg, ranges[i], link)
    } else {
      if (!part.dcmotor) continue
      ctrl[i] = motorToCtrl(part.dcmotor.speed, ranges[i], link)
    }
    driven++
  }
  for (const link of plan.sensors) {
    const v = readings[link.channel]
    if (v === undefined) continue
    lab.setProp(link.partId, link.prop, channelToProp(v, link))
  }
  return driven
}

// ---- Otomatik bağlantı tahmini ----------------------------------------------

/** `autoPlan` için devrenin gereken kadarı. */
export interface CircuitView {
  parts: { id: string; type: string }[]
}

/** Kanal adından sensör özelliğini çıkarmak için bilinen eşleşmeler. */
const SENSOR_RULES: { partType: string; prop: string; match: RegExp; scale: number; min: number; max: number }[] = [
  // MuJoCo rangefinder metre verir, HC-SR04 cm bekler; menzil dışı (-1) en büyük değere oturur
  { partType: 'hcsr04', prop: 'distanceCm', match: /range|dist|sonar|mesafe/i, scale: 100, min: 2, max: 400 },
  { partType: 'sharpir', prop: 'distanceCm', match: /range|dist|mesafe/i, scale: 100, min: 4, max: 80 },
  { partType: 'mpu6050', prop: 'ax', match: /accel.*x|ivme.*x/i, scale: 1 / 9.81, min: -16, max: 16 },
  { partType: 'mpu6050', prop: 'ay', match: /accel.*y|ivme.*y/i, scale: 1 / 9.81, min: -16, max: 16 },
  { partType: 'mpu6050', prop: 'az', match: /accel.*z|ivme.*z/i, scale: 1 / 9.81, min: -16, max: 16 },
]

/**
 * Öğrenci her motoru elle eşlemek zorunda kalmasın diye makul bir başlangıç önerir:
 * devredeki servolar MuJoCo motorlarına sırayla, DC motorlar kalanlara, tanınan
 * sensör kanalları uygun sensör parçalarına bağlanır.
 *
 * Tahmindir, doğruluk iddiası yoktur: arayüz bunu düzenlenebilir biçimde gösterir.
 */
export function autoPlan(circuit: CircuitView, ranges: CtrlRange[], channels: string[]): WiringPlan {
  const servos = circuit.parts.filter((p) => p.type === 'servo')
  const motors = circuit.parts.filter((p) => p.type === 'dcmotor')
  const drivers = [...servos.map((p) => ({ p, kind: 'servo' as const })), ...motors.map((p) => ({ p, kind: 'dcmotor' as const }))]

  const motorLinks: MotorLink[] = []
  for (let i = 0; i < Math.min(drivers.length, ranges.length); i++) {
    motorLinks.push({ actuator: ranges[i].name, partId: drivers[i].p.id, kind: drivers[i].kind })
  }

  const sensorLinks: SensorLink[] = []
  const used = new Set<string>()
  for (const rule of SENSOR_RULES) {
    const part = circuit.parts.find((p) => p.type === rule.partType && !used.has(p.id + rule.prop))
    if (!part) continue
    const channel = channels.find((c) => rule.match.test(c))
    if (!channel) continue
    used.add(part.id + rule.prop)
    sensorLinks.push({ partId: part.id, prop: rule.prop, channel, scale: rule.scale, min: rule.min, max: rule.max })
  }

  return { motors: motorLinks, sensors: sensorLinks }
}
