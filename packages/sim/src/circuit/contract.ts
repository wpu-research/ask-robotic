// Sanal devre laboratuvarı SÖZLEŞMESİ. Elektrik/simülasyon (packages/sim/src/circuit/*) ve arayüz (apps/web/src/components/lab/*)
// bu dosyadaki tiplere ve pin adlarına dayanır. Değişiklik gerekiyorsa her iki taraf birlikte güncellenmelidir.
// Tasarım: docs/devre-simulatoru-tasarim.md

export type PropValue = number | string | boolean

/** Aşama A parça türleri (Modül 3, H1-H4). Sonraki aşamalar bu birleşime eklenir. */
export type PartType =
  | 'uno' | 'led' | 'resistor' | 'button' | 'pot' | 'ldr' | 'ntc' | 'buzzer' | 'rgbled'
  | 'servo'
  // Aşama B (Modül 3, H5-H7)
  | 'diode' | 'npn' | 'mosfet' | 'dcmotor' | 'l293d' | 'relay' | 'sevenseg' | 'sr595' | 'lcd1602' | 'lcdI2c'
  // Aşama C (Modül 4): sensörler ve girdi cihazları
  | 'hcsr04' | 'dht' | 'pir' | 'irobstacle' | 'reed' | 'bmp280' | 'mpu6050' | 'joystick' | 'encoder' | 'keypad' | 'rtc'
  | 'mq2' | 'flame' | 'sound' | 'soil'

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
  diode: ['A', 'K'], // anot, katot (flyback/doğrultucu diyot; ileri gerilim ≈ 0,7 V)
  npn: ['B', 'C', 'E'], // 2N2222/BC547 tipi NPN; taban akımı ≈ 0,7 V üstünde iletir
  mosfet: ['G', 'D', 'S'], // N kanal, mantık seviyeli (eşik ≈ 2 V)
  dcmotor: ['M1', 'M2'], // küçük fırçalı DC motor
  // L293D (basitleştirilmiş): dört GND ucu tek 'GND'; VCC1 mantık (5 V), VCC2 motor beslemesi
  l293d: ['VCC1', 'VCC2', 'GND', 'EN12', 'IN1', 'IN2', 'OUT1', 'OUT2', 'EN34', 'IN3', 'IN4', 'OUT3', 'OUT4'],
  relay: ['VCC', 'GND', 'IN', 'COM', 'NO', 'NC'], // 5 V röle modülü (kuru kontak)
  sevenseg: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp', 'COM'], // tek haneli; her segment ayrı LED
  sr595: ['QA', 'QB', 'QC', 'QD', 'QE', 'QF', 'QG', 'QH', 'SER', 'SRCLK', 'RCLK', 'OE', 'SRCLR', 'QH_', 'VCC', 'GND'], // QH_ = seri çıkış (QH')
  lcd1602: ['VSS', 'VDD', 'V0', 'RS', 'RW', 'E', 'D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'A', 'K'], // HD44780 paralel, 4-bit kullanılır (D4-D7)
  lcdI2c: ['GND', 'VCC', 'SDA', 'SCL'], // PCF8574 arka paketli 16x2
  // Aşama C
  hcsr04: ['VCC', 'TRIG', 'ECHO', 'GND'], // ultrasonik mesafe; TRIG ve ECHO doğrudan Uno pinlerine bağlanmalı
  dht: ['VCC', 'DATA', 'GND'], // DHT11/DHT22 modülü (3 bacaklı, pull-up kartta); DATA doğrudan bir Uno pinine
  pir: ['VCC', 'OUT', 'GND'], // PIR hareket modülü; OUT HIGH = hareket
  irobstacle: ['VCC', 'OUT', 'GND', 'AO'], // IR engel modülü; OUT engel varken LOW, AO yansıma şiddeti (artar)
  reed: ['A', 'B'], // çıplak reed anahtarı; mıknatıs yakınken A-B kısa devre
  bmp280: ['VCC', 'GND', 'SDA', 'SCL'], // I2C basınç/sıcaklık; SDA = A4, SCL = A5
  mpu6050: ['VCC', 'GND', 'SDA', 'SCL'], // I2C ivmeölçer/jiroskop; SDA = A4, SCL = A5
  joystick: ['VCC', 'GND', 'VRX', 'VRY', 'SW'], // iki potansiyometre + düğme (SW basılınca GND, modülde 10 kΩ pull-up)
  encoder: ['CLK', 'DT', 'SW', 'VCC', 'GND'], // KY-040: açık-kolektör benzeri kontaklar, kartta 10 kΩ pull-up (VCC'ye)
  keypad: ['R1', 'R2', 'R3', 'R4', 'C1', 'C2', 'C3', 'C4'], // 4x4 membran; satır/sütun Uno pinlerine doğrudan
  rtc: ['VCC', 'GND', 'SDA', 'SCL'], // DS3231 (0x68); SDA = A4, SCL = A5
  mq2: ['VCC', 'GND', 'AO', 'DO'], // gaz modülü; DO eşik üstünde LOW
  flame: ['VCC', 'GND', 'AO', 'DO'], // alev modülü; AO alevde düşer, DO alevde LOW
  sound: ['VCC', 'GND', 'AO', 'DO'], // ses modülü; AO sesle yükselir, DO eşik üstünde LOW
  soil: ['VCC', 'GND', 'AO', 'DO'], // kapasitif toprak nemi; AO kuruda yüksek, ıslakta düşük, DO eşik üstü nemde LOW
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
  diode: [],
  npn: [],
  mosfet: [],
  dcmotor: [],
  l293d: [],
  relay: [{ key: 'trigger', label: 'Tetik', kind: 'select', default: 'high', options: [{ value: 'high', label: 'HIGH ile çeker' }, { value: 'low', label: 'LOW ile çeker (aktif-LOW)' }] }],
  sevenseg: [{ key: 'common', label: 'Ortak uç', kind: 'select', default: 'cathode', options: [{ value: 'cathode', label: 'Ortak katot' }, { value: 'anode', label: 'Ortak anot' }] }],
  sr595: [],
  lcd1602: [],
  lcdI2c: [{ key: 'address', label: 'I2C adresi', kind: 'select', default: '0x27', options: [{ value: '0x27', label: '0x27' }, { value: '0x3F', label: '0x3F' }] }],
  hcsr04: [{ key: 'distanceCm', label: 'Mesafe', kind: 'number', default: 100, min: 2, max: 400, step: 1, unit: 'cm', live: true }],
  dht: [
    { key: 'type', label: 'Tür', kind: 'select', default: 'dht22', options: [{ value: 'dht11', label: 'DHT11' }, { value: 'dht22', label: 'DHT22' }] },
    { key: 'tempC', label: 'Sıcaklık', kind: 'number', default: 25, min: -40, max: 80, step: 0.5, unit: '°C', live: true },
    { key: 'humidity', label: 'Nem', kind: 'number', default: 50, min: 0, max: 100, step: 1, unit: '%', live: true },
  ],
  pir: [{ key: 'motion', label: 'Hareket', kind: 'bool', default: false, live: true }],
  irobstacle: [
    { key: 'proximity', label: 'Yakınlık', kind: 'number', default: 0, min: 0, max: 1, step: 0.01, live: true },
    { key: 'threshold', label: 'Eşik (ayar vidası)', kind: 'number', default: 0.5, min: 0, max: 1, step: 0.01, live: true },
  ],
  reed: [{ key: 'magnet', label: 'Mıknatıs yakın', kind: 'bool', default: false, live: true }],
  bmp280: [
    { key: 'tempC', label: 'Sıcaklık', kind: 'number', default: 25, min: -40, max: 85, step: 0.5, unit: '°C', live: true },
    { key: 'pressureHpa', label: 'Basınç', kind: 'number', default: 1013.25, min: 300, max: 1100, step: 0.25, unit: 'hPa', live: true },
    { key: 'address', label: 'I2C adresi', kind: 'select', default: '0x76', options: [{ value: '0x76', label: '0x76' }, { value: '0x77', label: '0x77' }] },
  ],
  mpu6050: [
    { key: 'ax', label: 'İvme X', kind: 'number', default: 0, min: -2, max: 2, step: 0.01, unit: 'g', live: true },
    { key: 'ay', label: 'İvme Y', kind: 'number', default: 0, min: -2, max: 2, step: 0.01, unit: 'g', live: true },
    { key: 'az', label: 'İvme Z', kind: 'number', default: 1, min: -2, max: 2, step: 0.01, unit: 'g', live: true },
    { key: 'gx', label: 'Jiroskop X', kind: 'number', default: 0, min: -250, max: 250, step: 1, unit: '°/s', live: true },
    { key: 'gy', label: 'Jiroskop Y', kind: 'number', default: 0, min: -250, max: 250, step: 1, unit: '°/s', live: true },
    { key: 'gz', label: 'Jiroskop Z', kind: 'number', default: 0, min: -250, max: 250, step: 1, unit: '°/s', live: true },
    { key: 'address', label: 'I2C adresi (AD0)', kind: 'select', default: '0x68', options: [{ value: '0x68', label: '0x68 (AD0 GND)' }, { value: '0x69', label: '0x69 (AD0 5V)' }] },
  ],
  joystick: [
    { key: 'x', label: 'X ekseni', kind: 'number', default: 0.5, min: 0, max: 1, step: 0.01, live: true },
    { key: 'y', label: 'Y ekseni', kind: 'number', default: 0.5, min: 0, max: 1, step: 0.01, live: true },
    { key: 'pressed', label: 'Düğme basılı', kind: 'bool', default: false, live: true },
  ],
  encoder: [
    { key: 'position', label: 'Konum (tık)', kind: 'number', default: 0, min: -10_000, max: 10_000, step: 1, live: true },
    { key: 'pressed', label: 'Düğme basılı', kind: 'bool', default: false, live: true },
  ],
  keypad: [{
    key: 'key', label: 'Basılı tuş', kind: 'select', default: '', live: true,
    options: [{ value: '', label: 'Yok' }, ...['1', '2', '3', 'A', '4', '5', '6', 'B', '7', '8', '9', 'C', '*', '0', '#', 'D'].map((k) => ({ value: k, label: k }))],
  }],
  rtc: [],
  mq2: [
    { key: 'gas', label: 'Gaz düzeyi', kind: 'number', default: 0, min: 0, max: 1, step: 0.01, live: true },
    { key: 'threshold', label: 'Eşik (DO)', kind: 'number', default: 0.5, min: 0, max: 1, step: 0.01, live: true },
  ],
  flame: [
    { key: 'flame', label: 'Alev şiddeti', kind: 'number', default: 0, min: 0, max: 1, step: 0.01, live: true },
    { key: 'threshold', label: 'Eşik (DO)', kind: 'number', default: 0.5, min: 0, max: 1, step: 0.01, live: true },
  ],
  sound: [
    { key: 'sound', label: 'Ses şiddeti', kind: 'number', default: 0, min: 0, max: 1, step: 0.01, live: true },
    { key: 'threshold', label: 'Eşik (DO)', kind: 'number', default: 0.5, min: 0, max: 1, step: 0.01, live: true },
  ],
  soil: [
    { key: 'moisture', label: 'Toprak nemi', kind: 'number', default: 0.3, min: 0, max: 1, step: 0.01, live: true },
    { key: 'threshold', label: 'Eşik (DO)', kind: 'number', default: 0.5, min: 0, max: 1, step: 0.01, live: true },
  ],
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

/** Sanal ölçüm (sanal multimetre): iki uçlu parçalarda uçlar arası gerilim ve parçadan geçen akım. */
export interface Measurement {
  /** Birinci uca göre ikinci uçtaki gerilim farkı değil: |V(pin1) − V(pin2)| değil, işaretli V(pin1) − V(pin2) (V). */
  vAcross: number
  /** Birinci uçtan ikinciye doğru akım, mA (işaretli). */
  currentMa: number
}

export interface PartRuntime {
  /** Mümkün olan her parça için doldurulur (direnç, LED, diyot, buton, pot kolları, motor, buzzer…). */
  meas?: Measurement
  led?: LedState
  buzzer?: { on: boolean; freqHz: number }
  servo?: { angleDeg: number; attached: boolean }
  rgbled?: { r: number; g: number; b: number } // 0-1
  dcmotor?: { speed: number } // -1 (tam geri) … +1 (tam ileri); 0 durur
  relay?: { energized: boolean }
  /** Segmentler a-g ve dp; parlaklık 0-1 (akıma göre). */
  sevenseg?: { segments: Record<'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'dp', number> }
  /** Mandal (çıkış) kaydı: QA..QH. */
  sr595?: { outputs: boolean[] }
  /** LCD/I2C LCD ekran içeriği (satırlar 16 karakter, boşluk dolgulu). */
  lcd?: { lines: string[]; backlight: boolean; poweredOn: boolean }
  // ---- Aşama C ----
  /** HC-SR04: powered=false ise cevap vermez; inRange=false (2-400 cm dışı) ise echo üretmez; pings = cevaplanan ölçüm sayısı. */
  hcsr04?: { powered: boolean; distanceCm: number; inRange: boolean; pings: number }
  /** DHT: reads = cevaplanan okuma sayısı; tempC/humidity DHT11'de tam sayıya yuvarlanarak okunur (burada ham değer). */
  dht?: { powered: boolean; type: 'dht11' | 'dht22'; tempC: number; humidity: number; reads: number }
  /** PIR: out = OUT ucu seviyesi; warmingUp = ısınma sırasında hareket yok sayılır, çıkış parazitli. */
  pir?: { powered: boolean; out: boolean; warmingUp: boolean }
  /** IR engel: out = OUT ucu (engel varken false); detected = engel algılandı (proximity ≥ threshold). */
  irobstacle?: { powered: boolean; out: boolean; detected: boolean; aoVolts: number }
  reed?: { closed: boolean }
  /** I2C sensörleri: present = veri yolunda cevap veriyor (beslenmiş + SDA→A4, SCL→A5). */
  bmp280?: { powered: boolean; present: boolean; tempC: number; pressureHpa: number }
  mpu6050?: { powered: boolean; present: boolean; ax: number; ay: number; az: number; gx: number; gy: number; gz: number }
  /** RTC: time = modülün şu anki saati (ISO 8601, UTC). */
  rtc?: { powered: boolean; present: boolean; time: string }
  joystick?: { powered: boolean; x: number; y: number; pressed: boolean; vrxVolts: number; vryVolts: number }
  /** Enkoder: position = şu ana kadar uygulanan tık (saat yönü +); moving = kuyrukta dönüş var; clk/dt pin seviyeleri. */
  encoder?: { position: number; moving: boolean; clk: boolean; dt: boolean; pressed: boolean }
  keypad?: { key: string | null }
  /** MQ-2 / alev / ses / toprak nemi: level = fiziksel büyüklük (0-1), aoVolts = AO gerilimi, doHigh = DO seviyesi (eşik üstünde LOW). */
  analogModule?: { powered: boolean; level: number; aoVolts: number; doHigh: boolean }
}

export interface PinSnapshot {
  mode: 'out' | 'in' | 'pullup'
  high: boolean
  /** Bu pindeki çözülmüş gerilim (V). */
  volts: number
}

export type WarningKind = 'short-circuit' | 'led-no-resistor' | 'led-burnt' | 'floating-input' | 'reversed-polarity' | 'pin-overcurrent' | 'flyback-missing' | 'unpowered' | 'base-overcurrent'
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
