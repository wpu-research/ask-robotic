// Kural motoru ve akıllı sera modeli. Kurallar iki dilli küçük bir dille yazılır:
//   EĞER sicaklik > 30 VE nem < 80 İSE fan = 1 BEKLE 10      |  IF temp > 30 AND hum < 80 THEN fan = 1 HOLD 10
// Her dakika kurallar sırayla değerlendirilir; koşulları tutan kural eyleyiciyi ayarlar (aynı eyleyicide sonraki kural kazanır),
// eyleyici yeni bir kural gelene kadar değerini korur. BEKLE/HOLD: o eyleyici son değişimden bu yana en az n dakika geçmeden
// yeniden değiştirilemez (röle ve motoru korur). Sera modeli birinci dereceden ısı/nem/toprak nemi dengeleridir. Saf mantık.

export type Sensor = 'temp' | 'hum' | 'soil' | 'light' | 'hour'
export type Actuator = 'window' | 'fan' | 'heater' | 'pump' | 'alarm'
export type Op = '>' | '<' | '>=' | '<=' | '=='
export interface Cond { sensor: Sensor; op: Op; value: number }
export interface Rule { line: number; when: Cond[]; act: Actuator; value: 0 | 1; hold: number }
export type RuleError = { line: number; msg: 'syntax' | 'sensor' | 'actuator' | 'value' }

const SENSOR: Record<string, Sensor> = { temp: 'temp', sicaklik: 'temp', hum: 'hum', nem: 'hum', soil: 'soil', toprak: 'soil', light: 'light', isik: 'light', hour: 'hour', saat: 'hour' }
const ACT: Record<string, Actuator> = { window: 'window', pencere: 'window', fan: 'fan', heater: 'heater', isitici: 'heater', pump: 'pump', sulama: 'pump', pompa: 'pump', alarm: 'alarm' }
export const SENSOR_NAME: Record<Sensor, { tr: string; en: string }> = { temp: { tr: 'sicaklik', en: 'temp' }, hum: { tr: 'nem', en: 'hum' }, soil: { tr: 'toprak', en: 'soil' }, light: { tr: 'isik', en: 'light' }, hour: { tr: 'saat', en: 'hour' } }
export const ACT_NAME: Record<Actuator, { tr: string; en: string }> = { window: { tr: 'pencere', en: 'window' }, fan: { tr: 'fan', en: 'fan' }, heater: { tr: 'isitici', en: 'heater' }, pump: { tr: 'sulama', en: 'pump' }, alarm: { tr: 'alarm', en: 'alarm' } }

/** Türkçe büyük/küçük harf ve aksan farkını kaldırır: "EĞER", "eğer", "EGER" aynı. */
export const norm = (s: string): string => s.replace(/[İIı]/g, 'i').toLowerCase().replace(/ğ/g, 'g').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ö/g, 'o').replace(/ü/g, 'u')

const COND = /^([a-z]+)\s*(>=|<=|==|>|<)\s*(-?\d+(?:[.,]\d+)?)$/

export function parseRules(text: string): { rules: Rule[]; errors: RuleError[] } {
  const rules: Rule[] = [], errors: RuleError[] = []
  text.split('\n').forEach((raw, i) => {
    const line = i + 1, s = norm(raw.trim())
    if (!s || s.startsWith('#')) return
    const m = /^(?:eger|if)\s+(.+?)\s+(?:ise|then)\s+([a-z]+)\s*=\s*(\S+)(?:\s+(?:bekle|hold)\s+(\d+))?$/.exec(s)
    if (!m) { errors.push({ line, msg: 'syntax' }); return }
    const when: Cond[] = []
    for (const part of m[1].split(/\s+(?:ve|and)\s+/)) {
      const c = COND.exec(part.trim())
      if (!c) { errors.push({ line, msg: 'syntax' }); return }
      const sensor = SENSOR[c[1]]
      if (!sensor) { errors.push({ line, msg: 'sensor' }); return }
      when.push({ sensor, op: c[2] as Op, value: Number(c[3].replace(',', '.')) })
    }
    const act = ACT[m[2]]
    if (!act) { errors.push({ line, msg: 'actuator' }); return }
    if (m[3] !== '0' && m[3] !== '1') { errors.push({ line, msg: 'value' }); return }
    rules.push({ line, when, act, value: Number(m[3]) as 0 | 1, hold: m[4] ? Number(m[4]) : 0 })
  })
  return { rules, errors }
}

export const test = (c: Cond, v: number): boolean =>
  c.op === '>' ? v > c.value : c.op === '<' ? v < c.value : c.op === '>=' ? v >= c.value : c.op === '<=' ? v <= c.value : v === c.value

export type Env = Record<Sensor, number>
export type Acts = Record<Actuator, 0 | 1>
export const ACTS0: Acts = { window: 0, fan: 0, heater: 0, pump: 0, alarm: 0 }

/** Bir değerlendirme turu: hangi eyleyici hangi değere istenir (son kazanır) ve hangi kurallar tuttu. */
export function evaluate(rules: readonly Rule[], env: Env): { want: Partial<Acts>; fired: number[]; hold: Partial<Record<Actuator, number>> } {
  const want: Partial<Acts> = {}, hold: Partial<Record<Actuator, number>> = {}, fired: number[] = []
  for (const r of rules) if (r.when.every((c) => test(c, env[c.sensor]))) { want[r.act] = r.value; hold[r.act] = Math.max(hold[r.act] ?? 0, r.hold); fired.push(r.line) }
  return { want, fired, hold }
}

export interface DayParams { outMean: number; outAmp: number; cloud: number; seed?: number }
export interface DayResult {
  t: number[]; temp: number[]; hum: number[]; soil: number[]; out: number[]
  acts: Record<Actuator, Array<0 | 1>>
  switches: Record<Actuator, number>
  comfortPct: number; hotMin: number; coldMin: number; dryMin: number; energyKwh: number
}
const POWER_KW: Record<Actuator, number> = { window: 0.02, fan: 0.12, heater: 2, pump: 0.06, alarm: 0 }

/** 24 saatlik sera günü, dakikalık adım. Konfor: 18–30 °C. Sıcak: > 35 °C. Soğuk: < 10 °C. Kuru: toprak nemi < 30. */
export function simulateDay(rules: readonly Rule[], p: DayParams): DayResult {
  const N = 1440
  const R: DayResult = { t: [], temp: [], hum: [], soil: [], out: [], acts: { window: [], fan: [], heater: [], pump: [], alarm: [] }, switches: { window: 0, fan: 0, heater: 0, pump: 0, alarm: 0 }, comfortPct: 0, hotMin: 0, coldMin: 0, dryMin: 0, energyKwh: 0 }
  let T = 15, H = 70, S = 45
  const acts: Acts = { ...ACTS0 }
  const last: Record<Actuator, number> = { window: -1e9, fan: -1e9, heater: -1e9, pump: -1e9, alarm: -1e9 }
  let comfort = 0
  for (let m = 0; m < N; m++) {
    const h = m / 60
    const out = p.outMean + p.outAmp * Math.sin(((h - 9) / 24) * 2 * Math.PI)
    const sun = Math.max(0, Math.sin(((h - 6) / 12) * Math.PI)) * (1 - 0.7 * p.cloud)
    const env: Env = { temp: T, hum: H, soil: S, light: Math.round(1000 * sun), hour: Math.floor(h) }
    const { want, hold } = evaluate(rules, env)
    for (const a of Object.keys(want) as Actuator[]) {
      if (want[a] !== acts[a] && m - last[a] >= (hold[a] ?? 0)) { acts[a] = want[a]!; last[a] = m; R.switches[a]++ }
    }
    const vent = 1 + 3 * acts.window + 2 * acts.fan
    T += 0.004 * (out - T) * vent + 0.09 * sun * (1 - 0.3 * acts.window) + 0.06 * acts.heater
    H += 0.01 * ((vent > 1 ? 55 : 82) - H) * vent / 2 + 0.25 * acts.pump - 0.02 * acts.heater
    H = Math.max(10, Math.min(100, H))
    S += -0.02 - 0.03 * sun + 0.5 * acts.pump
    S = Math.max(0, Math.min(100, S))
    R.t.push(h); R.temp.push(T); R.hum.push(H); R.soil.push(S); R.out.push(out)
    for (const a of Object.keys(acts) as Actuator[]) { R.acts[a].push(acts[a]); R.energyKwh += acts[a] * POWER_KW[a] / 60 }
    if (T >= 18 && T <= 30) comfort++
    if (T > 35) R.hotMin++
    if (T < 10) R.coldMin++
    if (S < 30) R.dryMin++
  }
  R.comfortPct = Math.round((comfort / N) * 1000) / 10
  R.energyKwh = Math.round(R.energyKwh * 100) / 100
  return R
}

export const DEFAULT_RULES = {
  tr: ['# Sera kuralları (sırayla; aynı eyleyicide sonraki kazanır)', 'EĞER sicaklik > 30 İSE pencere = 1', 'EĞER sicaklik < 26 İSE pencere = 0', 'EĞER sicaklik > 33 İSE fan = 1 BEKLE 5', 'EĞER sicaklik < 29 İSE fan = 0 BEKLE 5', 'EĞER sicaklik < 14 İSE isitici = 1 BEKLE 10', 'EĞER sicaklik > 17 İSE isitici = 0 BEKLE 10', 'EĞER toprak < 35 VE saat >= 6 İSE sulama = 1', 'EĞER toprak > 60 İSE sulama = 0', 'EĞER sicaklik > 36 İSE alarm = 1', 'EĞER sicaklik < 34 İSE alarm = 0'].join('\n'),
  en: ['# Greenhouse rules (in order; later wins on the same actuator)', 'IF temp > 30 THEN window = 1', 'IF temp < 26 THEN window = 0', 'IF temp > 33 THEN fan = 1 HOLD 5', 'IF temp < 29 THEN fan = 0 HOLD 5', 'IF temp < 14 THEN heater = 1 HOLD 10', 'IF temp > 17 THEN heater = 0 HOLD 10', 'IF soil < 35 AND hour >= 6 THEN pump = 1', 'IF soil > 60 THEN pump = 0', 'IF temp > 36 THEN alarm = 1', 'IF temp < 34 THEN alarm = 0'].join('\n'),
}
