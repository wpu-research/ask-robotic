// Statik devre analizi (hex gerekmez): düğüm eşitliği, parça üzerinden bağlantı ve statik uyarılar.
import type { Circuit, CircuitAnalysis, LabWarning, PartInstance, PartType, PinRef } from './contract.js'
import { PINS } from './contract.js'
import { ledSpecs } from './model.js'
import { buildNetlist, internalPaths, type Netlist } from './netlist.js'

const RESISTIVE: ReadonlySet<PartType> = new Set<PartType>(['resistor', 'pot', 'ldr', 'ntc', 'buzzer', 'dcmotor'])
const PASSIVE: readonly PartType[] = ['resistor', 'button', 'reed', 'pot', 'ldr', 'ntc', 'buzzer', 'led', 'rgbled', 'diode', 'dcmotor', 'sevenseg']

/** Pinleri sinyal girişi/çıkışı olan etkin parçalar: bu parçalara bağlı hat "yüzen" sayılmaz. */
const ACTIVE: readonly PartType[] = [
  'npn', 'mosfet', 'l293d', 'relay', 'sr595', 'lcd1602', 'lcdI2c',
  'hcsr04', 'dht', 'pir', 'irobstacle', 'bmp280', 'mpu6050', 'joystick', 'encoder', 'keypad', 'rtc', 'mq2', 'flame', 'sound', 'soil', 'rain', 'waterlevel',
  'mq3', 'mq4', 'mq7', 'mq135', 'sharpir', 'l298n', 'tb6612', 'drv8833', 'bts7960', 'md10c', 'stepper', 'esc',
  'oled', 'bme280', 'ds18b20', 'vl53l0x', 'hc05',
  'battery', 'lm7805', 'buck', 'max17048',
]

/** Besleme pinleri (modül/entegre): VCC 5 V hattında (ya da bir Uno pininde), GND toprakta olmalı. */
const POWER: Partial<Record<PartType, { vcc: string[]; gnd: string; name: string; v33?: boolean }>> = {
  l293d: { vcc: ['VCC1', 'VCC2'], gnd: 'GND', name: 'L293D' },
  relay: { vcc: ['VCC'], gnd: 'GND', name: 'Röle modülü' },
  sr595: { vcc: ['VCC'], gnd: 'GND', name: '74HC595' },
  lcd1602: { vcc: ['VDD'], gnd: 'VSS', name: 'LCD' },
  lcdI2c: { vcc: ['VCC'], gnd: 'GND', name: 'I2C LCD' },
  // Aşama C (v33: 3,3 V ile de beslenebilir)
  hcsr04: { vcc: ['VCC'], gnd: 'GND', name: 'HC-SR04' },
  dht: { vcc: ['VCC'], gnd: 'GND', name: 'DHT sensörü', v33: true },
  pir: { vcc: ['VCC'], gnd: 'GND', name: 'PIR modülü' },
  irobstacle: { vcc: ['VCC'], gnd: 'GND', name: 'IR engel modülü', v33: true },
  bmp280: { vcc: ['VCC'], gnd: 'GND', name: 'BMP280', v33: true },
  mpu6050: { vcc: ['VCC'], gnd: 'GND', name: 'MPU6050', v33: true },
  rtc: { vcc: ['VCC'], gnd: 'GND', name: 'RTC modülü', v33: true },
  joystick: { vcc: ['VCC'], gnd: 'GND', name: 'Joystick', v33: true },
  mq2: { vcc: ['VCC'], gnd: 'GND', name: 'MQ-2 modülü' },
  flame: { vcc: ['VCC'], gnd: 'GND', name: 'Alev modülü', v33: true },
  sound: { vcc: ['VCC'], gnd: 'GND', name: 'Ses modülü', v33: true },
  soil: { vcc: ['VCC'], gnd: 'GND', name: 'Toprak nemi modülü', v33: true },
  rain: { vcc: ['VCC'], gnd: 'GND', name: 'Yağmur sensörü', v33: true },
  waterlevel: { vcc: ['VCC'], gnd: 'GND', name: 'Su seviyesi sensörü', v33: true },
  // Aşama D
  mq3: { vcc: ['VCC'], gnd: 'GND', name: 'MQ-3 modülü' },
  mq4: { vcc: ['VCC'], gnd: 'GND', name: 'MQ-4 modülü' },
  mq7: { vcc: ['VCC'], gnd: 'GND', name: 'MQ-7 modülü' },
  mq135: { vcc: ['VCC'], gnd: 'GND', name: 'MQ-135 modülü' },
  sharpir: { vcc: ['VCC'], gnd: 'GND', name: 'Sharp IR sensörü' },
  l298n: { vcc: ['12V'], gnd: 'GND', name: 'L298N' },
  tb6612: { vcc: ['VM', 'VCC'], gnd: 'GND', name: 'TB6612FNG', v33: true },
  drv8833: { vcc: ['VCC'], gnd: 'GND', name: 'DRV8833', v33: true },
  bts7960: { vcc: ['VCC'], gnd: 'GND', name: 'BTS7960' },
  md10c: { vcc: ['VCC'], gnd: 'GND', name: 'MD10C' },
  stepper: { vcc: ['VCC'], gnd: 'GND', name: 'TMC2209 step sürücü', v33: true },
  // Aşama E
  oled: { vcc: ['VCC'], gnd: 'GND', name: 'SSD1306 OLED', v33: true },
  bme280: { vcc: ['VCC'], gnd: 'GND', name: 'BME280', v33: true },
  ds18b20: { vcc: ['VCC'], gnd: 'GND', name: 'DS18B20', v33: true },
  vl53l0x: { vcc: ['VCC'], gnd: 'GND', name: 'VL53L0X', v33: true },
  hc05: { vcc: ['VCC'], gnd: 'GND', name: 'HC-05' },
}

/** Doğrudan bir Uno pinine bağlanması gereken sinyal uçları (Sim cihaz modelleri bu pinleri kullanır). */
const DIRECT_PINS: Partial<Record<PartType, { pins: string[]; name: string }>> = {
  hcsr04: { pins: ['TRIG', 'ECHO'], name: 'HC-SR04' },
  dht: { pins: ['DATA'], name: 'DHT' },
  stepper: { pins: ['STEP'], name: 'Step sürücü' },
  esc: { pins: ['SIG'], name: 'ESC' },
  keypad: { pins: ['R1', 'R2', 'R3', 'R4', 'C1', 'C2', 'C3', 'C4'], name: 'Keypad' },
  ds18b20: { pins: ['DQ'], name: 'DS18B20' },
}
/** I2C sensörleri: SDA A4'e, SCL A5'e bağlı olmalı. */
const I2C_PARTS: readonly PartType[] = ['bmp280', 'mpu6050', 'rtc', 'oled', 'bme280', 'vl53l0x', 'max17048']

/** 1-Wire pull-up için kabul edilen en büyük direnç (Ω): gerçekte 4,7 kΩ; 1-10 kΩ arası çalışır. */
export const ONEWIRE_PULLUP_MAX_OHMS = 10_000

/**
 * DS18B20 DQ hattının pull-up direncinin besleme ucundaki düğümler: DQ'dan tek bir dirençle (≤ 10 kΩ) 5V/3V3 hattına, bir Uno pinine
 * ya da sensörün kendi VCC düğümüne gidilebiliyorsa o düğüm. Boş dizi: pull-up yok.
 */
export function oneWirePullupNets(circuit: Circuit, nl: Netlist, p: PartInstance): number[] {
  const dq = nl.netOf({ part: p.id, pin: 'DQ' })
  if (dq === undefined || !nl.isWired({ part: p.id, pin: 'DQ' })) return []
  const vcc = nl.isWired({ part: p.id, pin: 'VCC' }) ? nl.netOf({ part: p.id, pin: 'VCC' }) : undefined
  const out: number[] = []
  for (const e of nl.neighbors(dq, ['resistor'])) {
    const r = circuit.parts.find((x) => x.id === e.partId)
    const ohms = typeof r?.props.ohms === 'number' ? r.props.ohms : 330
    if (ohms > ONEWIRE_PULLUP_MAX_OHMS || e.to === dq || e.to === nl.ground) continue
    if (e.to === nl.rail5 || e.to === nl.rail3 || e.to === vcc || nl.unoPinsOnNet(e.to).length > 0) out.push(e.to)
  }
  return out
}

/**
 * HC-05 RXD ucunu süren Uno pini: doğrudan aynı düğümde ya da tek bir direnç üzerinden (gerilim bölücünün üst direnci).
 * `direct` = araya direnç konmamış (5 V lojik doğrudan 3,3 V girişe gidiyor).
 */
export function hc05RxdSource(circuit: Circuit, nl: Netlist, p: PartInstance): { pin: string; direct: boolean } | undefined {
  const r = { part: p.id, pin: 'RXD' }
  const net = nl.netOf(r)
  if (net === undefined || !nl.isWired(r)) return undefined
  const here = nl.unoPinsOnNet(net)
  if (here.length) return { pin: here[0], direct: true }
  for (const e of nl.neighbors(net, ['resistor'])) {
    if (e.to === nl.ground || e.to === nl.rail5 || e.to === nl.rail3) continue
    const pins = nl.unoPinsOnNet(e.to)
    if (pins.length && circuit.parts.some((x) => x.id === e.partId)) return { pin: pins[0], direct: false }
  }
  return undefined
}

interface Ends { gnd: boolean; rail: boolean; pin: boolean; freeSrc: Set<number>; freeSink: Set<number> }

/** Bir düğümden (kendi parçası hariç) ulaşılabilen uç türleri; uçlar (toprak, hat, Uno pini) genişletilmez. */
function ends(nl: Netlist, start: number, exclude: string): Ends {
  const r: Ends = { gnd: false, rail: false, pin: false, freeSrc: new Set(), freeSink: new Set() }
  const seen = new Set<string>()
  const queue: Array<[number, boolean]> = [[start, false]]
  while (queue.length) {
    const [net, crossed] = queue.shift()!
    const k = `${net}:${crossed ? 1 : 0}`
    if (seen.has(k)) continue
    seen.add(k)
    const isGnd = net === nl.ground
    const isRail = net === nl.rail5 || net === nl.rail3
    const isPin = nl.unoPinsOnNet(net).length > 0
    if (isGnd || isRail || isPin) {
      if (isGnd) r.gnd = true; else if (isRail) r.rail = true; else r.pin = true
      if (!crossed) {
        if (isRail || isPin) r.freeSrc.add(net)
        if (isGnd || isPin) r.freeSink.add(net)
      }
      continue
    }
    for (const e of nl.neighbors(net, PASSIVE)) {
      if (e.partId === exclude) continue
      queue.push([e.to, crossed || RESISTIVE.has(e.type)])
    }
  }
  return r
}

export function staticWarnings(circuit: Circuit, nl: Netlist = buildNetlist(circuit)): LabWarning[] {
  const out: LabWarning[] = []
  const unoId = nl.unoId
  if (unoId !== undefined && nl.ground !== undefined) {
    if (nl.rail5 === nl.ground) out.push({ kind: 'short-circuit', partId: unoId, message: '5V hattı doğrudan GND\'ye bağlı (kısa devre).' })
    if (nl.rail3 === nl.ground) out.push({ kind: 'short-circuit', partId: unoId, message: '3V3 hattı doğrudan GND\'ye bağlı (kısa devre).' })
    if (nl.rail5 === nl.rail3) out.push({ kind: 'short-circuit', partId: unoId, message: '5V ile 3V3 hatları birbirine bağlı.' })
  }
  const warnedPart = new Set<string>()
  for (const led of ledSpecs(circuit).filter((l) => l.burnable)) {
    const na = nl.netOf(led.a), nk = nl.netOf(led.k)
    if (na === undefined || nk === undefined) continue
    const ea = ends(nl, na, led.partId), ek = ends(nl, nk, led.partId)
    const reversed =
      (ea.gnd && !ea.rail && !ek.gnd && (ek.rail || ek.pin)) ||
      (ea.pin && !ea.gnd && !ea.rail && ek.rail && !ek.gnd)
    if (reversed) {
      out.push({ kind: 'reversed-polarity', partId: led.partId, message: 'LED ters bağlı: anot (+) toprağa daha yakın.' })
      continue
    }
    let noRes = false
    for (const s of ea.freeSrc) for (const t of ek.freeSink) if (s !== t) noRes = true
    if (noRes && !warnedPart.has(led.partId)) {
      warnedPart.add(led.partId)
      out.push({ kind: 'led-no-resistor', partId: led.partId, message: 'LED\'in seri direnci yok; akım sınırlanmazsa LED yanar.' })
    }
  }

  // Yüzen giriş (statik): kabloyla bağlı ama toprak/besleme/başka Uno pini ya da servo sinyaline hiç iletken yolu olmayan pin.
  if (unoId !== undefined) {
    const adj = new Map<number, number[]>()
    const link = (a: number, b: number): void => { (adj.get(a) ?? adj.set(a, []).get(a)!).push(b) }
    const servoNets = new Set<number>()
    for (const p of circuit.parts) {
      if (p.type === 'servo') { const n = nl.netOf({ part: p.id, pin: 'SIG' }); if (n !== undefined) servoNets.add(n) }
      if (ACTIVE.includes(p.type)) for (const pin of PINS[p.type]) { const n = nl.netOf({ part: p.id, pin }); if (n !== undefined) servoNets.add(n) }
      for (const path of internalPaths(p)) {
        const a = nl.netOf({ part: p.id, pin: path.from }), b = nl.netOf({ part: p.id, pin: path.to })
        if (a !== undefined && b !== undefined) { link(a, b); link(b, a) }
      }
    }
    for (const name of PINS.uno.filter((n) => /^(D\d+|A\d)$/.test(n))) {
      const ref: PinRef = { part: unoId, pin: name }
      if (!nl.isWired(ref)) continue
      const start = nl.netOf(ref)!
      const driven = (net: number): boolean =>
        net === nl.ground || net === nl.rail5 || net === nl.rail3 || servoNets.has(net) || nl.unoPinsOnNet(net).some((n) => n !== name)
      const seen = new Set<number>([start]); const stack = [start]
      let ok = false
      while (stack.length) {
        const n = stack.pop()!
        if (driven(n)) { ok = true; break }
        for (const m of adj.get(n) ?? []) if (!seen.has(m)) { seen.add(m); stack.push(m) }
      }
      if (!ok) out.push({ kind: 'floating-input', partId: unoId, message: `${name} pinine bağlı hat toprağa, besleme hattına ya da başka bir uca iletken yolla bağlı değil (yüzen).` })
    }
  }
  staticPartWarnings(circuit, nl, out)
  return out
}

/** Aşama B parçalarının statik uyarıları: besleme, flyback diyodu, taban direnci, yüzen giriş. */
function staticPartWarnings(circuit: Circuit, nl: Netlist, out: LabWarning[]): void {
  const ref = (part: string, pin: string): PinRef => ({ part, pin })
  const isSupply = (net: number | undefined, v33 = false): boolean => net !== undefined && (net === nl.rail5 || (v33 && net === nl.rail3) || nl.unoPinsOnNet(net).length > 0)
  for (const p of circuit.parts) {
    const pw = POWER[p.type]
    if (pw) {
      const missing: string[] = []
      for (const v of pw.vcc) if (!nl.isWired(ref(p.id, v)) || !isSupply(nl.netOf(ref(p.id, v)), pw.v33)) missing.push(v === 'VCC2' ? 'VCC2 (motor beslemesi)' : v)
      const g = nl.netOf(ref(p.id, pw.gnd))
      if (!nl.isWired(ref(p.id, pw.gnd)) || g === undefined || g !== nl.ground) missing.push(pw.gnd)
      if (missing.length) out.push({ kind: 'unpowered', partId: p.id, message: `${pw.name} beslenmemiş: ${missing.join(', ')} 5 V / GND hattına bağlı değil.` })
    }
    const direct = DIRECT_PINS[p.type]
    if (direct) {
      for (const pin of direct.pins) {
        const r = ref(p.id, pin)
        if (!nl.isWired(r)) out.push({ kind: 'floating-input', partId: p.id, message: `${direct.name} ${pin} ucu bağlı değil: sensör çalışmaz.` })
        else if (nl.unoPinOf(r) === undefined) out.push({ kind: 'floating-input', partId: p.id, message: `${direct.name} ${pin} ucu doğrudan bir Arduino pinine bağlı olmalı (araya direnç/parça koyma).` })
      }
    }
    if (I2C_PARTS.includes(p.type)) {
      for (const [pin, uno] of [['SDA', 'A4'], ['SCL', 'A5']] as const) {
        const n = nl.netOf(ref(p.id, pin))
        if (!nl.isWired(ref(p.id, pin)) || n === undefined || !nl.unoPinsOnNet(n).includes(uno)) {
          out.push({ kind: 'floating-input', partId: p.id, message: `${POWER[p.type]?.name ?? p.type} ${pin} ucu ${uno} pinine bağlı değil: I2C cihazı veri yolunda görünmez.` })
        }
      }
    }
    if (p.type === 'hc05') hc05Warnings(circuit, nl, p, out)
    if (p.type === 'battery' || p.type === 'lm7805' || p.type === 'buck' || p.type === 'max17048') powerWarnings(nl, p, out)
    if (p.type === 'ds18b20' && nl.isWired(ref(p.id, 'DQ')) && oneWirePullupNets(circuit, nl, p).length === 0) {
      out.push({ kind: 'floating-input', partId: p.id, message: 'DS18B20 DQ hattında pull-up direnci yok: DQ ile VCC arasına 4,7 kΩ direnç bağla (yoksa sensör bulunamaz).' })
    }
    if (p.type === 'sr595') {
      for (const pin of ['SER', 'SRCLK', 'RCLK', 'OE', 'SRCLR']) {
        if (!nl.isWired(ref(p.id, pin))) {
          const note = pin === 'OE' ? 'çıkışlar kapalı kalır (OE GND\'ye bağlanmalı)' : pin === 'SRCLR' ? 'kaydırma yazmacı temizlenmiş sayılır (SRCLR 5 V\'a bağlanmalı)' : 'çip çalışmaz'
          out.push({ kind: 'floating-input', partId: p.id, message: `74HC595 ${pin} ucu bağlı değil (yüzen giriş): ${note}.` })
        }
      }
    }
    if (p.type === 'npn') {
      const base = nl.netOf(ref(p.id, 'B'))
      if (base !== undefined && nl.isWired(ref(p.id, 'B'))) {
        const e = ends(nl, base, p.id)
        if (e.freeSrc.size > 0) out.push({ kind: 'base-overcurrent', partId: p.id, message: 'Transistörün tabanında seri direnç yok: taban akımı sınırsız (tabana direnç ekle).' })
      }
    }
    if (p.type === 'dcmotor') {
      const n1 = nl.netOf(ref(p.id, 'M1')), n2 = nl.netOf(ref(p.id, 'M2'))
      if (n1 === undefined || n2 === undefined) continue
      // sürücü: motor ucunun düğümünde bir transistör kolektörü ya da MOSFET akacı var mı (alçak taraf anahtarı)
      let lowNet: number | undefined
      for (const q of circuit.parts) {
        const pin = q.type === 'npn' ? 'C' : q.type === 'mosfet' ? 'D' : undefined
        if (!pin) continue
        const qn = nl.netOf(ref(q.id, pin))
        if (qn === n1 || qn === n2) lowNet = qn
      }
      if (lowNet === undefined || n1 === n2) continue
      let ok = false, reversed = false
      for (const d of circuit.parts) {
        if (d.type !== 'diode') continue
        const a = nl.netOf(ref(d.id, 'A')), k = nl.netOf(ref(d.id, 'K'))
        if (!((a === n1 && k === n2) || (a === n2 && k === n1))) continue
        if (a === lowNet) ok = true; else reversed = true
      }
      if (!ok) out.push({ kind: 'flyback-missing', partId: p.id, message: reversed ? 'Motorun flyback diyodu ters bağlı: anot (düz uç) transistör tarafında, katot (çizgili uç) motorun artı ucunda olmalı.' : 'Motor transistör/MOSFET ile sürülüyor ama uçlarına paralel flyback diyodu yok: kesilen akım transistörü bozabilir.' })
    }
  }
}

export function analyzeCircuit(circuit: Circuit): CircuitAnalysis {
  const nl = buildNetlist(circuit)
  return {
    sameNet(a, b) {
      const x = nl.netOf(a), y = nl.netOf(b)
      return x !== undefined && x === y
    },
    connected(a, b, via) {
      const x = nl.netOf(a), y = nl.netOf(b)
      if (x === undefined || y === undefined) return false
      return nl.reachable(x, via ?? []).has(y)
    },
    warnings: staticWarnings(circuit, nl),
  }
}

/** HC-05: TXD doğrudan bir Uno pinine, RXD bölücüyle; D0/D1 donanım seri hattı (USB) laboratuvarda modüle bağlanmaz. */
function hc05Warnings(circuit: Circuit, nl: Netlist, p: PartInstance, out: LabWarning[]): void {
  const txd = { part: p.id, pin: 'TXD' }
  const txWired = nl.isWired(txd), rxWired = nl.isWired({ part: p.id, pin: 'RXD' })
  const txPin = nl.unoPinOf(txd)
  const rx = hc05RxdSource(circuit, nl, p)
  if (!txWired && !rxWired) out.push({ kind: 'floating-input', partId: p.id, message: 'HC-05 TXD ve RXD bağlı değil: modül Arduino ile konuşamaz (TXD → SoftwareSerial RX, RXD ← SoftwareSerial TX).' })
  if (txWired && txPin === undefined) out.push({ kind: 'floating-input', partId: p.id, message: 'HC-05 TXD ucu doğrudan bir Arduino pinine bağlı olmalı (araya direnç/parça koyma).' })
  if (rxWired && !rx) out.push({ kind: 'floating-input', partId: p.id, message: 'HC-05 RXD ucu bir Arduino pinine (doğrudan ya da bölücü direnciyle) bağlı değil: modül Arduino\'dan veri alamaz.' })
  if (rx?.direct) out.push({ kind: 'logic-level', partId: p.id, message: 'HC-05 RXD 3,3 V lojik girişidir: Arduino\'nun 5 V TX ucunu 1 kΩ / 2 kΩ gerilim bölücüyle bağla (doğrudan bağlantı modülü zamanla bozar).' })
  if (txPin === 'D0' || txPin === 'D1' || rx?.pin === 'D0' || rx?.pin === 'D1') {
    out.push({ kind: 'floating-input', partId: p.id, message: 'HC-05 D0/D1\'e bağlı: bu pinler USB seri hattıdır (yükleme ve seri monitörle çakışır). SoftwareSerial ile başka pinlere bağla (ör. D10/D11).' })
  }
}

/**
 * Güç parçaları. Laboratuvarda Uno USB'den beslenir ve 5V/VIN hattı ideal kaynaktır: harici bir kaynağı bu hatta bağlamak
 * modellenmez (gerçekte de 5V pinine dışarıdan gerilim vermek kartı bozabilir). Pilin − ucu ortak toprakta olmalı.
 */
export function powerSourceOk(nl: Netlist, p: PartInstance): boolean {
  const pos = nl.netOf({ part: p.id, pin: p.type === 'battery' ? '+' : p.type === 'lm7805' ? 'OUT' : 'VOUT' })
  return pos !== undefined && pos !== nl.rail5 && pos !== nl.rail3 && pos !== nl.ground
}
function powerWarnings(nl: Netlist, p: PartInstance, out: LabWarning[]): void {
  const r = (pin: string): PinRef => ({ part: p.id, pin })
  const net = (pin: string) => (nl.isWired(r(pin)) ? nl.netOf(r(pin)) : undefined)
  const onRail = (n: number | undefined) => n !== undefined && (n === nl.rail5 || n === nl.rail3)
  if (p.type === 'battery') {
    const plus = net('+'), minus = net('-')
    if (plus !== undefined && minus !== undefined && plus === minus) out.push({ kind: 'short-circuit', partId: p.id, message: 'Pilin + ve − uçları doğrudan birbirine bağlı (kısa devre): gerçekte pil ısınır, Li-ion ve LiPo tutuşabilir.' })
    else if (plus !== undefined && plus === nl.ground) out.push({ kind: 'short-circuit', partId: p.id, message: 'Pilin + ucu GND\'ye bağlı (kısa devre).' })
    if (nl.isWired(r('+')) && minus !== nl.ground) out.push({ kind: 'power', partId: p.id, message: 'Pilin − ucu Arduino GND\'sine bağlı değil: ortak toprak olmadan devre kapanmaz (pil devre dışı).' })
    if (onRail(plus)) out.push({ kind: 'power', partId: p.id, message: 'Pil Uno\'nun 5V/VIN hattına bağlı: laboratuvarda Uno USB\'den beslenir, bu bağlantı modellenmez. Pili yüke, motor sürücüsüne ya da bir regülatöre bağla.' })
    return
  }
  if (p.type === 'max17048') {
    if (!nl.isWired(r('CELL'))) out.push({ kind: 'unpowered', partId: p.id, message: 'MAX17048 beslenmemiş: CELL, GND 5 V / GND hattına bağlı değil.' })
    return
  }
  const name = p.type === 'lm7805' ? 'LM7805' : 'Buck modülü'
  const outPin = p.type === 'lm7805' ? 'OUT' : 'VOUT', inPin = p.type === 'lm7805' ? 'IN' : 'VIN'
  if (net('GND') !== nl.ground) out.push({ kind: 'power', partId: p.id, message: `${name} GND ucu Arduino GND'sine bağlı değil: regülatör çalışmaz.` })
  if (!nl.isWired(r(inPin))) out.push({ kind: 'power', partId: p.id, message: `${name} girişi (${inPin}) bağlı değil: bir pil ya da güç kaynağı bağla.` })
  if (onRail(net(outPin))) out.push({ kind: 'power', partId: p.id, message: `${name} çıkışı Uno'nun 5V/VIN hattına bağlı: laboratuvarda Uno USB'den beslenir, bu bağlantı modellenmez. Çıkışı yüke bağla.` })
}
