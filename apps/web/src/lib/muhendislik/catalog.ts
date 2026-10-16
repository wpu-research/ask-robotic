// Mühendislik yolu (büyükler için robotik): Hyvex Academy elektronik serisindeki parçalar, 7 seviyede temel bileşenden drone'a.
// Parça metinleri (özellikler, kullanım, uyarılar) Hyvex'in kendi içeriğidir (hyvex-parcalar.json); seviye ve laboratuvar kiti buradadır.
import data from './hyvex-parcalar.json'
import dataEn from './hyvex-parcalar.en.json'
import { KITS, type Kit, type KitName } from './kits'

/** Uno üzerinde benzetilemeyen parçanın nedeni. */
export type OfflineReason = 'mcu' | 'ai' | 'guc' | 'faz2' | 'mekanik' | 'arac' | 'devre'

export interface EngPart {
  slug: string
  name: string
  level: number
  /** Hyvex kategori anahtarı (sensor-imu, surucu, guc…). */
  group: string
  /** Kaynak Hyvex sayfası (seri-el-*.html). */
  source: string
  interface: string
  voltage: string
  specs: string[]
  uses: string[]
  warnings: string[]
  lab?: { kit: KitName; model?: string }
  offline?: OfflineReason
}

export interface Level {
  n: number
  title: string
  /** Kart üstündeki tek cümle. */
  summary: string
  /** Bu seviyede kazanılan beceriler. */
  skills: string[]
  /** Drone'a/otonom sisteme giden köprü: bu seviye neden gerekli. */
  bridge: string
  en: { title: string; summary: string; skills: string[]; bridge: string }
}

export const LEVELS: Level[] = [
  {
    n: 1, title: 'Temel bileşenler ve ölçüm',
    summary: 'Direnç, LED, diyot, transistör ve MOSFET: her robot kartının iskeleti. Ohm yasasını multimetreyle doğrula.',
    skills: ['Ohm ve Kirchhoff yasaları', 'LED akım sınırlama', 'Transistör / MOSFET ile yük anahtarlama', 'Flyback diyot', 'Multimetreyle gerilim ve akım ölçümü'],
    bridge: 'Drone ESC\'si, güç dağıtım kartı ve uçuş kontrolcüsü bu elemanlardan yapılır; MOSFET anahtarlamayı anlamadan ESC anlaşılmaz.',
    en: { title: "Basic components and measurement", summary: "Resistors, LEDs, diodes, transistors and MOSFETs: the skeleton of every robot board. Check Ohm's law with a multimeter.", skills: ["Ohm's and Kirchhoff's laws", "LED current limiting", "Switching loads with a transistor / MOSFET", "Flyback diode", "Measuring voltage and current with a multimeter"], bridge: "Drone ESCs, power distribution boards and flight controllers are built from these parts; you cannot understand an ESC without MOSFET switching." },
  },
  {
    n: 2, title: 'Analog ve dijital sensör modülleri',
    summary: 'MQ gaz ailesi, DHT22 ve DS18B20: ADC, eşik karşılaştırıcı ve tek-tel protokolleri.',
    skills: ['analogRead ve 10-bit ADC', 'LM393 karşılaştırıcılı DO çıkışı', 'Isıtıcılı sensörde ön ısınma', 'Tek-tel ve 1-Wire zamanlama'],
    bridge: 'Yük taşıyan veya keşif yapan drone\'larda ortam sensörleri görev yüküdür; ölçümün güvenilirliği kalibrasyonla başlar.',
    en: { title: "Analog and digital sensor modules", summary: "The MQ gas family, DHT22 and DS18B20: ADCs, threshold comparators and single-wire protocols.", skills: ["analogRead and the 10-bit ADC", "DO output with an LM393 comparator", "Pre-heating a heated sensor", "Single-wire and 1-Wire timing"], bridge: "On payload or survey drones, environment sensors are the payload; reliable measurement starts with calibration." },
  },
  {
    n: 3, title: 'Mesafe ve konum',
    summary: 'Ultrasonik ailesi, Sharp IR, ToF ve LiDAR: hangi sensör hangi menzilde, hangi yüzeyde güvenilir.',
    skills: ['Uçuş süresi (TOF) ölçümü', 'pulseIn ve zaman aşımı', 'Kör bölge ve ölçüm aralığı', 'Analog eğriden mesafe çıkarma'],
    bridge: 'Drone\'da irtifa tutma ve engelden kaçınma bu sensörlerle yapılır (TF-Luna, VL53L0X); menzil sınırı tasarım kararıdır.',
    en: { title: "Distance and position", summary: "The ultrasonic family, Sharp IR, ToF and LiDAR: which sensor is reliable at which range and on which surface.", skills: ["Time-of-flight (TOF) measurement", "pulseIn and timeouts", "Blind zone and measuring range", "Getting distance from an analog curve"], bridge: "Altitude hold and obstacle avoidance on drones use these sensors (TF-Luna, VL53L0X); the range limit is a design decision." },
  },
  {
    n: 4, title: 'Hareket: motorlar, sürücüler, servolar',
    summary: 'DC, step ve servo motorlar ile L298N, TB6612, DRV8833, BTS7960, MD10C, TMC2209 sürücüleri.',
    skills: ['H-köprü ve PWM hız kontrolü', 'Bipolar ve MOSFET köprü kaybı', 'Fren ve serbest dönüş', 'STEP/DIR ve mikro adım', 'Servo darbe genişliği'],
    bridge: 'Gimbal, iniş takımı ve kargo mekanizmaları servo/step ile sürülür; sürücü seçimi akım ve verimle yapılır.',
    en: { title: "Motion: motors, drivers, servos", summary: "DC, stepper and servo motors with the L298N, TB6612, DRV8833, BTS7960, MD10C and TMC2209 drivers.", skills: ["H-bridges and PWM speed control", "Bipolar vs MOSFET bridge losses", "Braking and coasting", "STEP/DIR and microstepping", "Servo pulse width"], bridge: "Gimbals, landing gear and cargo mechanisms are driven by servos and steppers; drivers are chosen by current and efficiency." },
  },
  {
    n: 5, title: 'Veri yolları: I²C / SPI sensörler, ekranlar, haberleşme',
    summary: 'IMU\'lar, çevre sensörleri, ekranlar, Bluetooth, CAN ve lojik seviye çevirme.',
    skills: ['I²C adresleme ve register okuma', 'SPI ile hızlı ekran sürme', 'UART ve seviye uyumu', 'CAN veri yolu', 'Logic analyzer ile protokol çözme'],
    bridge: 'Uçuş kontrolcüsünün kalbi IMU\'dur (MPU6050 → BMI270 → BNO085); telemetri ve ESC haberleşmesi seri veri yollarıyla akar.',
    en: { title: "Buses: I\u00b2C / SPI sensors, displays, communication", summary: "IMUs, environment sensors, displays, Bluetooth, CAN and logic level shifting.", skills: ["I\u00b2C addressing and register reads", "Driving displays fast over SPI", "UART and level matching", "The CAN bus", "Decoding protocols with a logic analyzer"], bridge: "The heart of a flight controller is its IMU (MPU6050 \u2192 BMI270 \u2192 BNO085); telemetry and ESC communication run over serial buses." },
  },
  {
    n: 6, title: 'Güç: regülatör, batarya, koruma',
    summary: 'Lineer ve anahtarlamalı regülatörler, BMS, batarya kimyaları, yakıt göstergesi ve TVS koruması.',
    skills: ['Lineer regülatörde ısı kaybı', 'Buck dönüştürücü verimi', 'Hücre dengeleme ve BMS', 'Batarya C oranı ve kapasite', 'Geçici gerilim koruması'],
    bridge: 'Drone\'un uçuş süresini ve güvenliğini batarya ve güç zinciri belirler; LiPo kullanımı ayrı bir disiplindir.',
    en: { title: "Power: regulators, batteries, protection", summary: "Linear and switching regulators, BMS, battery chemistries, fuel gauges and TVS protection.", skills: ["Heat loss in linear regulators", "Buck converter efficiency", "Cell balancing and BMS", "Battery C rating and capacity", "Transient voltage protection"], bridge: "A drone's flight time and safety are set by its battery and power chain; handling LiPo cells is a discipline of its own." },
  },
  {
    n: 7, title: 'Drone ve otonomi hazırlığı',
    summary: 'ESC + fırçasız motor, güçlü mikrodenetleyiciler, AI kartları, kameralar ve hata ayıklayıcılar.',
    skills: ['ESC kurulumu (arm) ve gaz eğrisi', 'KV, hücre sayısı ve devir', 'ESP32 / STM32 / Raspberry Pi mimarisi', 'Kenar AI ve kamera boru hattı', 'SWD ile hata ayıklama'],
    bridge: 'Buradan sonrası tam bir uçan sistem: itki, kontrol döngüsü, algılama ve görev bilgisayarı bir arada.',
    en: { title: "Drone and autonomy preparation", summary: "ESC + brushless motor, powerful microcontrollers, AI boards, cameras and debuggers.", skills: ["ESC arming and the throttle curve", "KV, cell count and RPM", "ESP32 / STM32 / Raspberry Pi architecture", "Edge AI and the camera pipeline", "Debugging with SWD"], bridge: "From here on it is a complete flying system: thrust, control loop, perception and a mission computer together." },
  },
]

export const ENG_PARTS: readonly EngPart[] = data as EngPart[]

export const partBySlug = (slug: string): EngPart | undefined => ENG_PARTS.find((p) => p.slug === slug)
export const partsOfLevel = (n: number): EngPart[] => ENG_PARTS.filter((p) => p.level === n)
export const levelOf = (n: number): Level | undefined => LEVELS.find((l) => l.n === n)

/** Laboratuvarda açılabilir parçanın kiti (yoksa undefined). */
export const kitOf = (p: EngPart): Kit | undefined => (p.lab ? KITS[p.lab.kit] : undefined)

export const labHref = (p: EngPart): string | null => (p.lab ? `/laboratuvar?parca=${encodeURIComponent(p.slug)}` : null)

export const OFFLINE_TEXT_EN: Record<OfflineReason, string> = {
  mcu: 'This is a microcontroller board. The lab simulates the Arduino Uno (ATmega328P) exactly; this board has no simulation of its own. Read the pin and voltage differences in the specifications below.',
  ai: 'A Linux / AI accelerator board or a camera. It is not simulated on the Uno; level 7 covers it as mission computer architecture.',
  guc: 'A power part whose behaviour the lab\'s DC solver cannot capture: charging, cell balancing (BMS) and surge protection (TVS) change over time. Batteries, regulators and the fuel gauge do open in the lab; study the specifications and warnings here.',
  faz2: 'The bus model for this part (I²C / SPI / 1-Wire / UART) will be added to the lab in the next phase. For now, study its specifications and warnings here.',
  mekanik: 'A mechanical part: it has no electrical simulation. Try the step-to-angle relation in the stepper kit; lead screws and belts turn that angle into linear travel.',
  arac: 'A measurement / development tool. In the lab you can click any part to read its voltage and current like a virtual multimeter.',
  devre: 'The lab\'s DC solver does not model capacitors and inductors yet (they need time-varying behaviour).',
}

export const OFFLINE_TEXT: Record<OfflineReason, string> = {
  mcu: 'Bu bir mikrodenetleyici kartı. Laboratuvar Arduino Uno\'yu (ATmega328P) birebir benzetir; bu kartın kendi benzetimi yok. Pin ve gerilim farklarını aşağıdaki özelliklerden oku.',
  ai: 'Linux / AI hızlandırıcı kartı veya kamera. Uno üzerinde benzetilmez; Seviye 7\'de görev bilgisayarı mimarisi olarak işlenir.',
  guc: 'Bu güç parçasının davranışı laboratuvarın DC çözücüsüyle modellenemez: şarj, hücre dengeleme (BMS) ve darbe koruması (TVS) zamanla değişir. Piller, regülatörler ve yakıt göstergesi laboratuvarda açılır; bu parçanın özelliklerini ve uyarılarını buradan çalış.',
  faz2: 'Bu parçanın veri yolu modeli (I²C / SPI / 1-Wire / UART) laboratuvara sonraki aşamada eklenecek. Şimdilik özellikleri ve uyarıları buradan çalış.',
  mekanik: 'Mekanik parça: elektriksel benzetimi yok. Step motor kitinde adım → açı ilişkisini dene; vidalı mil ve kayışta açı → doğrusal yol dönüşümü yapılır.',
  arac: 'Ölçüm / geliştirme aracı. Laboratuvarda bir parçaya tıklayınca gerilim ve akımı sanal multimetre gibi okuyabilirsin.',
  devre: 'Laboratuvarın DC çözücüsü kondansatör ve bobini henüz modellemiyor (zamanla değişen davranış gerekir).',
}

export const GROUP_NAME_EN: Record<string, string> = {
  'sensor-imu': 'IMU', 'sensor-sicaklik': 'Temperature', 'sensor-mesafe': 'Distance', 'sensor-gaz': 'Gas / air', 'sensor-diger': 'Environment sensor', 'sensor-isik': 'Light',
  kamera: 'Camera', 'ai-kart': 'AI board', mcu: 'Microcontroller', ekran: 'Display', motor: 'Motor', servo: 'Servo', surucu: 'Motor driver',
  guc: 'Power', bilesen: 'Component', diger: 'Other',
}

type Lang = 'tr' | 'en'
interface PartEn { name: string; interface: string; voltage: string; specs: string[]; uses: string[]; warnings: string[] }
const EN_PARTS = dataEn as Record<string, PartEn>
/** Parçanın görünen metinleri arayüz diline göre (Hyvex metni Türkçe kaynaktır; İngilizcesi hyvex-parcalar.en.json). */
export function partText(p: EngPart, lang: Lang): PartEn {
  const e = lang === 'en' ? EN_PARTS[p.slug] : undefined
  return e ?? { name: p.name, interface: p.interface, voltage: p.voltage, specs: p.specs, uses: p.uses, warnings: p.warnings }
}
export const levelText = (l: Level, lang: Lang) => (lang === 'en' ? l.en : { title: l.title, summary: l.summary, skills: l.skills, bridge: l.bridge })
export const groupName = (g: string, lang: Lang) => (lang === 'en' ? GROUP_NAME_EN : GROUP_NAME)[g] ?? g
export const offlineText = (r: OfflineReason, lang: Lang) => (lang === 'en' ? OFFLINE_TEXT_EN : OFFLINE_TEXT)[r]

/** Hyvex kategori anahtarlarının okunur adları. */
export const GROUP_NAME: Record<string, string> = {
  'sensor-imu': 'IMU', 'sensor-sicaklik': 'Sıcaklık', 'sensor-mesafe': 'Mesafe', 'sensor-gaz': 'Gaz / hava', 'sensor-diger': 'Çevre sensörü', 'sensor-isik': 'Işık',
  kamera: 'Kamera', 'ai-kart': 'AI kartı', mcu: 'Mikrodenetleyici', ekran: 'Ekran', motor: 'Motor', servo: 'Servo', surucu: 'Motor sürücü',
  guc: 'Güç', bilesen: 'Bileşen', diger: 'Diğer',
}
