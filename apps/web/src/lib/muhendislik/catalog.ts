// Mühendislik yolu (büyükler için robotik): Hyvex Academy elektronik serisindeki parçalar, 7 seviyede temel bileşenden drone'a.
// Parça metinleri (özellikler, kullanım, uyarılar) Hyvex'in kendi içeriğidir (hyvex-parcalar.json); seviye ve laboratuvar kiti buradadır.
import data from './hyvex-parcalar.json'
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
}

export const LEVELS: Level[] = [
  {
    n: 1, title: 'Temel bileşenler ve ölçüm',
    summary: 'Direnç, LED, diyot, transistör ve MOSFET: her robot kartının iskeleti. Ohm yasasını multimetreyle doğrula.',
    skills: ['Ohm ve Kirchhoff yasaları', 'LED akım sınırlama', 'Transistör / MOSFET ile yük anahtarlama', 'Flyback diyot', 'Multimetreyle gerilim ve akım ölçümü'],
    bridge: 'Drone ESC\'si, güç dağıtım kartı ve uçuş kontrolcüsü bu elemanlardan yapılır; MOSFET anahtarlamayı anlamadan ESC anlaşılmaz.',
  },
  {
    n: 2, title: 'Analog ve dijital sensör modülleri',
    summary: 'MQ gaz ailesi, DHT22 ve DS18B20: ADC, eşik karşılaştırıcı ve tek-tel protokolleri.',
    skills: ['analogRead ve 10-bit ADC', 'LM393 karşılaştırıcılı DO çıkışı', 'Isıtıcılı sensörde ön ısınma', 'Tek-tel ve 1-Wire zamanlama'],
    bridge: 'Yük taşıyan veya keşif yapan drone\'larda ortam sensörleri görev yüküdür; ölçümün güvenilirliği kalibrasyonla başlar.',
  },
  {
    n: 3, title: 'Mesafe ve konum',
    summary: 'Ultrasonik ailesi, Sharp IR, ToF ve LiDAR: hangi sensör hangi menzilde, hangi yüzeyde güvenilir.',
    skills: ['Uçuş süresi (TOF) ölçümü', 'pulseIn ve zaman aşımı', 'Kör bölge ve ölçüm aralığı', 'Analog eğriden mesafe çıkarma'],
    bridge: 'Drone\'da irtifa tutma ve engelden kaçınma bu sensörlerle yapılır (TF-Luna, VL53L0X); menzil sınırı tasarım kararıdır.',
  },
  {
    n: 4, title: 'Hareket: motorlar, sürücüler, servolar',
    summary: 'DC, step ve servo motorlar ile L298N, TB6612, DRV8833, BTS7960, MD10C, TMC2209 sürücüleri.',
    skills: ['H-köprü ve PWM hız kontrolü', 'Bipolar ve MOSFET köprü kaybı', 'Fren ve serbest dönüş', 'STEP/DIR ve mikro adım', 'Servo darbe genişliği'],
    bridge: 'Gimbal, iniş takımı ve kargo mekanizmaları servo/step ile sürülür; sürücü seçimi akım ve verimle yapılır.',
  },
  {
    n: 5, title: 'Veri yolları: I²C / SPI sensörler, ekranlar, haberleşme',
    summary: 'IMU\'lar, çevre sensörleri, ekranlar, Bluetooth, CAN ve lojik seviye çevirme.',
    skills: ['I²C adresleme ve register okuma', 'SPI ile hızlı ekran sürme', 'UART ve seviye uyumu', 'CAN veri yolu', 'Logic analyzer ile protokol çözme'],
    bridge: 'Uçuş kontrolcüsünün kalbi IMU\'dur (MPU6050 → BMI270 → BNO085); telemetri ve ESC haberleşmesi seri veri yollarıyla akar.',
  },
  {
    n: 6, title: 'Güç: regülatör, batarya, koruma',
    summary: 'Lineer ve anahtarlamalı regülatörler, BMS, batarya kimyaları, yakıt göstergesi ve TVS koruması.',
    skills: ['Lineer regülatörde ısı kaybı', 'Buck dönüştürücü verimi', 'Hücre dengeleme ve BMS', 'Batarya C oranı ve kapasite', 'Geçici gerilim koruması'],
    bridge: 'Drone\'un uçuş süresini ve güvenliğini batarya ve güç zinciri belirler; LiPo kullanımı ayrı bir disiplindir.',
  },
  {
    n: 7, title: 'Drone ve otonomi hazırlığı',
    summary: 'ESC + fırçasız motor, güçlü mikrodenetleyiciler, AI kartları, kameralar ve hata ayıklayıcılar.',
    skills: ['ESC kurulumu (arm) ve gaz eğrisi', 'KV, hücre sayısı ve devir', 'ESP32 / STM32 / Raspberry Pi mimarisi', 'Kenar AI ve kamera boru hattı', 'SWD ile hata ayıklama'],
    bridge: 'Buradan sonrası tam bir uçan sistem: itki, kontrol döngüsü, algılama ve görev bilgisayarı bir arada.',
  },
]

export const ENG_PARTS: readonly EngPart[] = data as EngPart[]

export const partBySlug = (slug: string): EngPart | undefined => ENG_PARTS.find((p) => p.slug === slug)
export const partsOfLevel = (n: number): EngPart[] => ENG_PARTS.filter((p) => p.level === n)
export const levelOf = (n: number): Level | undefined => LEVELS.find((l) => l.n === n)

/** Laboratuvarda açılabilir parçanın kiti (yoksa undefined). */
export const kitOf = (p: EngPart): Kit | undefined => (p.lab ? KITS[p.lab.kit] : undefined)

export const labHref = (p: EngPart): string | null => (p.lab ? `/laboratuvar?parca=${encodeURIComponent(p.slug)}` : null)

export const OFFLINE_TEXT: Record<OfflineReason, string> = {
  mcu: 'Bu bir mikrodenetleyici kartı. Laboratuvar Arduino Uno\'yu (ATmega328P) birebir benzetir; bu kartın kendi benzetimi yok. Pin ve gerilim farklarını aşağıdaki özelliklerden oku.',
  ai: 'Linux / AI hızlandırıcı kartı veya kamera. Uno üzerinde benzetilmez; Seviye 7\'de görev bilgisayarı mimarisi olarak işlenir.',
  guc: 'Güç parçası. Laboratuvar şimdilik Uno\'nun 5V ve 3V3 hatlarını ideal kaynak sayar; regülatör ve batarya modeli sonraki aşamada eklenecek.',
  faz2: 'Bu parçanın veri yolu modeli (I²C / SPI / 1-Wire / UART) laboratuvara sonraki aşamada eklenecek. Şimdilik özellikleri ve uyarıları buradan çalış.',
  mekanik: 'Mekanik parça: elektriksel benzetimi yok. Step motor kitinde adım → açı ilişkisini dene; vidalı mil ve kayışta açı → doğrusal yol dönüşümü yapılır.',
  arac: 'Ölçüm / geliştirme aracı. Laboratuvarda bir parçaya tıklayınca gerilim ve akımı sanal multimetre gibi okuyabilirsin.',
  devre: 'Laboratuvarın DC çözücüsü kondansatör ve bobini henüz modellemiyor (zamanla değişen davranış gerekir).',
}

/** Hyvex kategori anahtarlarının okunur adları. */
export const GROUP_NAME: Record<string, string> = {
  'sensor-imu': 'IMU', 'sensor-sicaklik': 'Sıcaklık', 'sensor-mesafe': 'Mesafe', 'sensor-gaz': 'Gaz / hava', 'sensor-diger': 'Çevre sensörü', 'sensor-isik': 'Işık',
  kamera: 'Kamera', 'ai-kart': 'AI kartı', mcu: 'Mikrodenetleyici', ekran: 'Ekran', motor: 'Motor', servo: 'Servo', surucu: 'Motor sürücü',
  guc: 'Güç', bilesen: 'Bileşen', diger: 'Diğer',
}
