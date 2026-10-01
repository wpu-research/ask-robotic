// Sanal devre laboratuvarı SÖZLEŞMESİ. Elektrik/simülasyon (packages/sim/src/circuit/*) ve arayüz (apps/web/src/components/lab/*)
// bu dosyadaki tiplere ve pin adlarına dayanır. Değişiklik gerekiyorsa her iki taraf birlikte güncellenmelidir.
// Tasarım: docs/devre-simulatoru-tasarim.md

export type PropValue = number | string | boolean

/** Aşama A parça türleri (Modül 3, H1-H4). Sonraki aşamalar bu birleşime eklenir. */
export type PartType =
  | 'uno' | 'led' | 'resistor' | 'button' | 'pot' | 'ldr' | 'ntc' | 'buzzer' | 'rgbled'
  // Aşama B (sonra): 'servo' | 'lcdI2c' | 'lcd16x2' | 'npn' | 'diode' | 'motor' | 'relay' | ...
  | 'servo'

/**
 * Parça pin kimlikleri (devrede kablo uçları böyle adlandırılır). `Record<PartType, readonly string[]>`
 * Uno: dijital D0-D13, analog A0-A5, 5V, 3V3, GND (üç GND ucu aynı düğümdür: 'GND', 'GND2', 'GND3'), VIN.
 */
export const PINS: Record<PartType, readonly string[]> = {
  uno: ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5', '5V', '3V3', 'GND', 'GND2', 'GND3', 'VIN'],
  led: ['A', 'K'], // anot (+), katot (-)
  resistor: ['1', '2'],
  button: ['A', 'B'], // basılıyken A-B kısa devre
  pot: ['VCC', 'SIG', 'GND'], // kayar uç SIG
  ldr: ['1', '2'],
  ntc: ['1', '2'],
  buzzer: ['+', '-'],
  rgbled: ['R', 'G', 'B', 'COM'], // ortak uç COM; 'common' özelliği 'cathode' | 'anode'
  servo: ['SIG', 'VCC', 'GND'],
}

export interface PropDef {
  key: string
  label: string
  kind: 'number' | 'select' | 'bool'
  default: PropValue
  min?: number
  max?: number
  step?: number
  unit?: string
  options?: { value: string; label: string }[]
  /** true: devre çalışırken değiştirilebilir (buton basma, sensör kaydırıcısı…). */
  live?: boolean
}

/** Parça özellikleri (sözleşme gereği anahtar adları sabittir). */
export const PROPS: Record<PartType, readonly PropDef[]> = {
  uno: [],
  led: [{ key: 'color', label: 'Renk', kind: 'select', default: 'red', options: [
    { value: 'red', label: 'Kırmızı' }, { value: 'yellow', label: 'Sarı' }, { value: 'green', label: 'Yeşil' }, { value: 'blue', label: 'Mavi' }, { value: 'white', label: 'Beyaz' },
  ] }],
  resistor: [{ key: 'ohms', label: 'Direnç', kind: 'number', default: 330, min: 1, max: 1_000_000, step: 1, unit: 'Ω' }],
  button: [{ key: 'pressed', label: 'Basılı', kind: 'bool', default: false, live: true }],
  pot: [{ key: 'position', label: 'Konum', kind: 'number', default: 0.5, min: 0, max: 1, step: 0.01, live: true }, { key: 'ohms', label: 'Toplam direnç', kind: 'number', default: 10_000, min: 100, max: 1_000_000, step: 100, unit: 'Ω' }],
  ldr: [{ key: 'light', label: 'Işık', kind: 'number', default: 0.5, min: 0, max: 1, step: 0.01, live: true }],
  ntc: [{ key: 'tempC', label: 'Sıcaklık', kind: 'number', default: 25, min: -20, max: 120, step: 0.5, unit: '°C', live: true }],
  buzzer: [{ key: 'kind', label: 'Tür', kind: 'select', default: 'passive', options: [{ value: 'active', label: 'Aktif (kendi sesi var)' }, { value: 'passive', label: 'Pasif (tone ile)' }] }],
  rgbled: [{ key: 'common', label: 'Ortak uç', kind: 'select', default: 'cathode', options: [{ value: 'cathode', label: 'Ortak katot' }, { value: 'anode', label: 'Ortak anot' }] }],
  servo: [],
}

export interface PartInstance {
  id: string
  type: PartType
  /** Tuval koordinatı (piksel), sol-üst köşe. */
  x: number
  y: number
  rotation: 0 | 90 | 180 | 270
  props: Record<string, PropValue>
}

export interface PinRef { part: string; pin: string }
export interface Wire { id: string; a: PinRef; b: PinRef; color?: string }
export interface Circuit { parts: PartInstance[]; wires: Wire[] }

// ---- Çalışma zamanı durumu ----

export interface LedState {
  on: boolean
  /** 0-1 görsel parlaklık (akım ve PWM doluluğundan). */
  brightness: number
  currentMa: number
  /** Güvenli akım aşılırsa true (LED yandı); gerçek hayatta geri dönüşü yok, sanal laboratuvarda sıfırlayınca düzelir. */
  burnt: boolean
}

export interface PartRuntime {
  led?: LedState
  buzzer?: { on: boolean; freqHz: number }
  servo?: { angleDeg: number; attached: boolean }
  rgbled?: { r: number; g: number; b: number } // 0-1
}

export interface PinSnapshot {
  mode: 'out' | 'in' | 'pullup'
  high: boolean
  /** Bu pindeki çözülmüş gerilim (V). */
  volts: number
}

export type WarningKind = 'short-circuit' | 'led-no-resistor' | 'led-burnt' | 'floating-input' | 'reversed-polarity' | 'pin-overcurrent'
export interface LabWarning { kind: WarningKind; partId?: string; message: string }

export interface LabState {
  timeMs: number
  running: boolean
  /** Anahtar: 'D13', 'A0' … */
  pins: Record<string, PinSnapshot>
  /** Anahtar: part id. */
  parts: Record<string, PartRuntime>
  serial: string
  warnings: LabWarning[]
}

export interface LabApi {
  readonly state: LabState
  /** Canlı özellik değişikliği (buton, potansiyometre, LDR, NTC…). */
  setProp(partId: string, key: string, value: PropValue): void
  /** Benzetimi ms kadar ilerletir (içeride devre çözücü gerektikçe yeniden çalışır). */
  advance(ms: number): void
  sendSerial(text: string): void
  /** Başlangıç durumuna döner (yanmış LED'ler dahil). */
  reset(): void
  dispose(): void
}

/** Bağlantı denetimi için analiz arayüzü (hedefler ve uyarılar için; kodsuz, hex gerektirmez). */
export interface CircuitAnalysis {
  /** İki pin aynı düğümde (doğrudan kablolarla) mi? */
  sameNet(a: PinRef, b: PinRef): boolean
  /** A'dan B'ye, yalnız `via` türlerindeki parçalar üzerinden geçerek (örn. direnç) bir yol var mı? */
  connected(a: PinRef, b: PinRef, via?: PartType[]): boolean
  warnings: LabWarning[]
}
