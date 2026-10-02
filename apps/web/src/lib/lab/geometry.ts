// Parça geometrisi: boyutlar, parça-yerel pin koordinatları, döndürme dönüşümü, kablo yolu. Saf (DOM yok).
import type { PartInstance, PartType } from './contract'

export interface Pt { x: number; y: number }
export interface PartDef {
  name: string
  w: number
  h: number
  /** Parça-yerel pin koordinatları (döndürülmemiş). */
  pins: Record<string, Pt>
  /** true: parça çizimi pin etiketlerini kendisi çizer (sık yerleşimli çipler); tuval ayrıca etiket çizmez. */
  ownLabels?: boolean
}

const row = (names: string[], x0: number, step: number, y: number): Record<string, Pt> =>
  Object.fromEntries(names.map((n, i) => [n, { x: x0 + i * step, y }]))

const DIP_X = (i: number) => 14 + i * 16 // 16 bacaklı DIP: üst/alt sıra, 8'er bacak, 16 px aralık
const dipRow = (names: (string | null)[], y: number): Record<string, Pt> =>
  Object.fromEntries(names.flatMap((n, i) => (n ? [[n, { x: DIP_X(i), y }]] : [])))
const PINS_LCD = ['VSS', 'VDD', 'V0', 'RS', 'RW', 'E', 'D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'A', 'K']
const LCD_X = (i: number) => 36 + i * 14

/** Başlık (header) pinleri: `names` ortalanmış, `step` aralıklı, alt kenara yakın (y). */
const hdr = (names: string[], w: number, y: number, step = 16): Record<string, Pt> => row(names, (w - (names.length - 1) * step) / 2, step, y)

export const PART_DEFS: Record<PartType, PartDef> = {
  uno: {
    name: 'Arduino Uno', w: 290, h: 150,
    pins: {
      GND2: { x: 36, y: 12 },
      ...row(['D13', 'D12', 'D11', 'D10', 'D9', 'D8'], 52, 16, 12),
      ...row(['D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'D1', 'D0'], 152, 16, 12),
      ...row(['3V3', '5V', 'GND', 'GND3', 'VIN'], 60, 16, 138),
      ...row(['A0', 'A1', 'A2', 'A3', 'A4', 'A5'], 164, 16, 138),
    },
  },
  led: { name: 'LED', w: 40, h: 64, pins: { A: { x: 12, y: 60 }, K: { x: 28, y: 60 } } },
  resistor: { name: 'Direnç', w: 80, h: 24, pins: { '1': { x: 4, y: 12 }, '2': { x: 76, y: 12 } } },
  button: { name: 'Buton', w: 50, h: 50, pins: { A: { x: 4, y: 25 }, B: { x: 46, y: 25 } } },
  pot: { name: 'Potansiyometre', w: 60, h: 70, pins: { VCC: { x: 10, y: 66 }, SIG: { x: 30, y: 66 }, GND: { x: 50, y: 66 } } },
  ldr: { name: 'LDR (ışık sensörü)', w: 60, h: 32, pins: { '1': { x: 4, y: 16 }, '2': { x: 56, y: 16 } } },
  ntc: { name: 'NTC (sıcaklık sensörü)', w: 60, h: 32, pins: { '1': { x: 4, y: 16 }, '2': { x: 56, y: 16 } } },
  buzzer: { name: 'Buzzer', w: 50, h: 64, pins: { '+': { x: 14, y: 60 }, '-': { x: 36, y: 60 } } },
  rgbled: { name: 'RGB LED', w: 62, h: 70, pins: { R: { x: 10, y: 66 }, G: { x: 24, y: 66 }, B: { x: 38, y: 66 }, COM: { x: 52, y: 66 } } },
  servo: { name: 'Servo', w: 100, h: 64, pins: { SIG: { x: 4, y: 16 }, VCC: { x: 4, y: 32 }, GND: { x: 4, y: 48 } } },
  diode: { name: 'Diyot', w: 80, h: 24, pins: { A: { x: 4, y: 12 }, K: { x: 76, y: 12 } } },
  npn: { name: 'NPN transistör', w: 54, h: 76, pins: { B: { x: 12, y: 72 }, C: { x: 27, y: 72 }, E: { x: 42, y: 72 } } },
  mosfet: { name: 'MOSFET', w: 70, h: 100, pins: { G: { x: 17, y: 96 }, D: { x: 35, y: 96 }, S: { x: 53, y: 96 } } },
  dcmotor: { name: 'DC motor', w: 130, h: 64, pins: { M1: { x: 6, y: 22 }, M2: { x: 6, y: 42 } } },
  // L293D (DIP-16, çentik solda; bacak 1 sol altta). Alt: EN12 IN1 OUT1 GND (GND) OUT2 IN2 VCC2; üst: VCC1 IN4 OUT4 (GND) (GND) OUT3 IN3 EN34.
  // Dört GND bacağından yalnız alttaki 4. bacak bağlanabilir (sözleşmede tek 'GND'); diğerleri çizimde sönük gösterilir.
  l293d: {
    name: 'L293D', w: 140, h: 76, ownLabels: true,
    pins: { ...dipRow(['VCC1', 'IN4', 'OUT4', null, null, 'OUT3', 'IN3', 'EN34'], 3), ...dipRow(['EN12', 'IN1', 'OUT1', 'GND', null, 'OUT2', 'IN2', 'VCC2'], 73) },
  },
  relay: {
    name: 'Röle modülü', w: 150, h: 96,
    pins: { VCC: { x: 5, y: 24 }, GND: { x: 5, y: 44 }, IN: { x: 5, y: 64 }, NO: { x: 144, y: 24 }, COM: { x: 144, y: 48 }, NC: { x: 144, y: 72 } },
  },
  sevenseg: {
    name: '7-segment', w: 88, h: 110, ownLabels: true,
    pins: {
      e: { x: 12, y: 107 }, d: { x: 28, y: 107 }, COM: { x: 44, y: 107 }, c: { x: 60, y: 107 }, dp: { x: 76, y: 107 },
      g: { x: 12, y: 3 }, f: { x: 28, y: 3 }, a: { x: 60, y: 3 }, b: { x: 76, y: 3 },
    },
  },
  // 74HC595 (DIP-16, çentik solda). Alt: QB QC QD QE QF QG QH GND; üst: VCC QA SER OE RCLK SRCLK SRCLR QH'.
  sr595: {
    name: '74HC595', w: 140, h: 100, ownLabels: true,
    pins: { ...dipRow(['VCC', 'QA', 'SER', 'OE', 'RCLK', 'SRCLK', 'SRCLR', 'QH_'], 3), ...dipRow(['QB', 'QC', 'QD', 'QE', 'QF', 'QG', 'QH', 'GND'], 97) },
  },
  lcd1602: {
    name: 'LCD 16x2', w: 282, h: 128, ownLabels: true,
    pins: Object.fromEntries(PINS_LCD.map((n, i) => [n, { x: LCD_X(i), y: 5 }])),
  },
  lcdI2c: {
    name: 'LCD 16x2 (I2C)', w: 282, h: 170, ownLabels: true,
    pins: { GND: { x: 117, y: 166 }, VCC: { x: 133, y: 166 }, SDA: { x: 149, y: 166 }, SCL: { x: 165, y: 166 } },
  },
  // Aşama C (Modül 4): sensör modülleri. Pinler sözleşmeyle (PINS) birebir; çizim part-art-c.tsx'te. Hepsi pinleri kendi çizer (ownLabels).
  hcsr04: { name: 'HC-SR04', w: 120, h: 70, ownLabels: true, pins: hdr(['VCC', 'TRIG', 'ECHO', 'GND'], 120, 66) },
  dht: { name: 'DHT11/DHT22', w: 56, h: 80, ownLabels: true, pins: hdr(['VCC', 'DATA', 'GND'], 56, 76) },
  pir: { name: 'PIR hareket', w: 72, h: 84, ownLabels: true, pins: hdr(['VCC', 'OUT', 'GND'], 72, 80) },
  irobstacle: { name: 'IR engel', w: 84, h: 72, ownLabels: true, pins: hdr(['VCC', 'OUT', 'GND', 'AO'], 84, 68) },
  reed: { name: 'Reed anahtarı', w: 80, h: 24, pins: { A: { x: 4, y: 12 }, B: { x: 76, y: 12 } } },
  bmp280: { name: 'BMP280', w: 68, h: 62, ownLabels: true, pins: hdr(['VCC', 'GND', 'SDA', 'SCL'], 68, 58) },
  mpu6050: { name: 'MPU6050', w: 68, h: 76, ownLabels: true, pins: hdr(['VCC', 'GND', 'SDA', 'SCL'], 68, 72) },
  joystick: { name: 'Joystick', w: 100, h: 100, ownLabels: true, pins: hdr(['VCC', 'GND', 'VRX', 'VRY', 'SW'], 100, 96) },
  encoder: { name: 'Döner enkoder', w: 100, h: 92, ownLabels: true, pins: hdr(['CLK', 'DT', 'SW', 'VCC', 'GND'], 100, 88) },
  keypad: { name: 'Keypad 4x4', w: 132, h: 156, ownLabels: true, pins: hdr(['R1', 'R2', 'R3', 'R4', 'C1', 'C2', 'C3', 'C4'], 132, 152, 14) },
  rtc: { name: 'RTC DS3231', w: 100, h: 76, ownLabels: true, pins: hdr(['VCC', 'GND', 'SDA', 'SCL'], 100, 72) },
  mq2: { name: 'MQ-2 gaz', w: 76, h: 96, ownLabels: true, pins: hdr(['VCC', 'GND', 'AO', 'DO'], 76, 92) },
  flame: { name: 'Alev sensörü', w: 76, h: 88, ownLabels: true, pins: hdr(['VCC', 'GND', 'AO', 'DO'], 76, 84) },
  sound: { name: 'Ses sensörü', w: 76, h: 88, ownLabels: true, pins: hdr(['VCC', 'GND', 'AO', 'DO'], 76, 84) },
  soil: { name: 'Toprak nemi', w: 76, h: 136, ownLabels: true, pins: hdr(['VCC', 'GND', 'AO', 'DO'], 76, 132) },
  rain: { name: 'Yağmur sensörü', w: 76, h: 136, ownLabels: true, pins: hdr(['VCC', 'GND', 'AO', 'DO'], 76, 132) },
  waterlevel: { name: 'Su seviyesi sensörü', w: 76, h: 136, ownLabels: true, pins: hdr(['VCC', 'GND', 'AO', 'DO'], 76, 132) },
}

export type Rotation = PartInstance['rotation']
export const ROTATIONS: Rotation[] = [0, 90, 180, 270]
export const nextRotation = (r: Rotation): Rotation => ROTATIONS[(ROTATIONS.indexOf(r) + 1) % 4]

/** Parça-yerel noktayı, parçanın merkezi etrafında döndürüp tuval koordinatına çevirir. */
export function localToWorld(part: Pick<PartInstance, 'type' | 'x' | 'y' | 'rotation'>, p: Pt): Pt {
  const { w, h } = PART_DEFS[part.type]
  const cx = w / 2, cy = h / 2
  const dx = p.x - cx, dy = p.y - cy
  let rx = dx, ry = dy
  switch (part.rotation) {
    case 90: rx = -dy; ry = dx; break
    case 180: rx = -dx; ry = -dy; break
    case 270: rx = dy; ry = -dx; break
  }
  return { x: part.x + cx + rx, y: part.y + cy + ry }
}

export function pinWorld(part: Pick<PartInstance, 'type' | 'x' | 'y' | 'rotation'>, pin: string): Pt | null {
  const loc = PART_DEFS[part.type].pins[pin]
  return loc ? localToWorld(part, loc) : null
}

/** Döndürülmüş parçanın tuvaldeki sınır kutusu. */
export function partBounds(part: Pick<PartInstance, 'type' | 'x' | 'y' | 'rotation'>): { x: number; y: number; w: number; h: number } {
  const { w, h } = PART_DEFS[part.type]
  const cx = part.x + w / 2, cy = part.y + h / 2
  const sw = part.rotation === 90 || part.rotation === 270
  const bw = sw ? h : w, bh = sw ? w : h
  return { x: cx - bw / 2, y: cy - bh / 2, w: bw, h: bh }
}

/** Pinin parçadan dışarı doğru çıkış yönü (dünya ekseninde birim vektör): en yakın kenara göre, döndürme uygulanır. */
export function pinDir(part: Pick<PartInstance, 'type' | 'rotation'>, pin: string): Pt {
  const def = PART_DEFS[part.type]
  const p = def.pins[pin]
  if (!p) return { x: 0, y: 1 }
  const d = [
    { v: { x: -1, y: 0 }, d: p.x }, { v: { x: 1, y: 0 }, d: def.w - p.x },
    { v: { x: 0, y: -1 }, d: p.y }, { v: { x: 0, y: 1 }, d: def.h - p.y },
  ].sort((a, b) => a.d - b.d)[0].v
  switch (part.rotation) {
    case 90: return { x: -d.y, y: d.x }
    case 180: return { x: -d.x, y: -d.y }
    case 270: return { x: d.y, y: -d.x }
    default: return d
  }
}

/** Kablo yolu: pin yönlerinde çıkan yumuşak eğri (kübik Bezier). `lane` paralel kabloları hafifçe ayırır. */
export function wireCurve(a: Pt, da: Pt, b: Pt, db: Pt, lane = 0): string {
  const dist = Math.hypot(b.x - a.x, b.y - a.y)
  const L = Math.max(24, Math.min(140, dist * 0.45)) + Math.abs(lane)
  const c1 = { x: a.x + da.x * L + (da.y !== 0 ? lane : 0), y: a.y + da.y * L + (da.x !== 0 ? lane : 0) }
  const c2 = { x: b.x + db.x * L + (db.y !== 0 ? lane : 0), y: b.y + db.y * L + (db.x !== 0 ? lane : 0) }
  return `M${a.x} ${a.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${b.x} ${b.y}`
}

/** Serbest uca (fare) giden önizleme eğrisi. */
export const wirePreview = (a: Pt, da: Pt, b: Pt) => wireCurve(a, da, b, { x: 0, y: 0 })

export const WORLD = { w: 1200, h: 760 }
export const GRID = 10
export const snap = (v: number) => Math.round(v / GRID) * GRID
