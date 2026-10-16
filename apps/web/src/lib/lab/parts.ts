// Palet: parça kümeleri, kategoriler ve arama süzgeci. Saf (DOM yok).
import type { PartType } from './contract'
import { PART_DEFS } from './geometry'

/** Aşama A (Modül 3, H1-H4). */
export const STAGE_A_PARTS: PartType[] = ['led', 'resistor', 'button', 'pot', 'ldr', 'ntc', 'buzzer', 'rgbled', 'servo']
/** Aşama B (Modül 3, H5-H7). */
export const STAGE_B_PARTS: PartType[] = ['diode', 'npn', 'mosfet', 'dcmotor', 'l293d', 'relay', 'sevenseg', 'sr595', 'lcd1602', 'lcdI2c']
/** Aşama C (Modül 4): sensörler ve girdi cihazları. */
export const STAGE_C_PARTS: PartType[] = ['hcsr04', 'dht', 'pir', 'irobstacle', 'reed', 'bmp280', 'mpu6050', 'joystick', 'encoder', 'keypad', 'rtc', 'mq2', 'flame', 'sound', 'soil', 'rain', 'waterlevel']
/** Aşama D (Hyvex elektronik serisi, büyükler için): gaz sensörü ailesi, Sharp IR, motor sürücüler, step motor, ESC. */
export const STAGE_D_SENSORS: PartType[] = ['mq3', 'mq4', 'mq7', 'mq135', 'sharpir']
export const STAGE_D_MOTION: PartType[] = ['l298n', 'tb6612', 'drv8833', 'bts7960', 'md10c', 'stepper', 'esc']
export const STAGE_D_PARTS: PartType[] = [...STAGE_D_SENSORS, ...STAGE_D_MOTION]
/** Aşama E (Hyvex, büyükler için): gerçek Arduino kütüphaneleriyle çalışan veri yolu cihazları (I2C, 1-Wire). */
export const STAGE_E_OUTPUTS: PartType[] = ['oled']
export const STAGE_E_SENSORS: PartType[] = ['bme280', 'ds18b20', 'vl53l0x']
export const STAGE_E_PARTS: PartType[] = [...STAGE_E_OUTPUTS, ...STAGE_E_SENSORS]
/** Varsayılan palet (ders etkinliği `allowedParts` ile kısıtlayabilir). */
export const DEFAULT_PARTS: PartType[] = [...STAGE_A_PARTS, ...STAGE_B_PARTS, ...STAGE_C_PARTS, ...STAGE_D_PARTS, ...STAGE_E_PARTS]

/** `key`: sözlükteki kategori adı (lab.picker.cat.*); `title` Türkçe kaynak. */
export interface PartCategory { key: PickerCategoryKey; title: string; types: PartType[] }
export type PickerCategoryKey = 'output' | 'input' | 'active' | 'sensors' | 'motion' | 'other'
export const PICKER_CATEGORIES: PartCategory[] = [
  { key: 'output', title: 'Çıkış', types: ['led', 'rgbled', 'buzzer', 'sevenseg', 'lcd1602', 'lcdI2c', ...STAGE_E_OUTPUTS, 'dcmotor', 'servo', 'relay'] },
  { key: 'input', title: 'Giriş', types: ['button', 'pot', 'ldr', 'ntc'] },
  { key: 'active', title: 'Aktif devre elemanları', types: ['resistor', 'diode', 'npn', 'mosfet', 'l293d', 'sr595'] },
  { key: 'sensors', title: 'Sensörler', types: [...STAGE_C_PARTS, ...STAGE_D_SENSORS, ...STAGE_E_SENSORS] },
  { key: 'motion', title: 'Motor sürücüler ve hareket', types: [...STAGE_D_MOTION] },
]

export const SHORT_NAME: Partial<Record<PartType, string>> = {
  ldr: 'LDR', ntc: 'NTC', pot: 'Potansiyometre', lcd1602: 'LCD 16x2', lcdI2c: 'LCD I2C', npn: 'NPN', sevenseg: '7-segment', relay: 'Röle',
  dht: 'DHT11/22', irobstacle: 'IR engel', reed: 'Reed', encoder: 'Enkoder', keypad: 'Keypad 4x4', rtc: 'RTC DS3231', mq2: 'MQ-2 gaz', soil: 'Toprak nemi', rain: 'Yağmur', waterlevel: 'Su seviyesi',
  mq3: 'MQ-3 alkol', mq4: 'MQ-4 metan', mq7: 'MQ-7 CO', mq135: 'MQ-135', sharpir: 'Sharp IR', l298n: 'L298N', tb6612: 'TB6612FNG', drv8833: 'DRV8833',
  bts7960: 'BTS7960', md10c: 'MD10C', stepper: 'Step motor', esc: 'ESC + BLDC',
  oled: 'OLED 0.96"', bme280: 'BME280', ds18b20: 'DS18B20', vl53l0x: 'VL53L0X',
}

export const PART_KEYWORDS: Partial<Record<PartType, string>> = {
  led: 'ışık diyot lamba', rgbled: 'renkli ışık led', buzzer: 'ses zil hoparlör', servo: 'motor kol açı', button: 'düğme anahtar tuş',
  pot: 'ayarlı direnç knob', ldr: 'ışık sensörü foto', ntc: 'sıcaklık sensörü termistör', resistor: 'ohm',
  diode: 'diyot 1n4007 geri tepme flyback doğrultucu', npn: 'transistör 2n2222 bc547 anahtar bjt', mosfet: 'transistör fet irlz44n anahtar',
  dcmotor: 'motor fırçalı dönen pervane', l293d: 'motor sürücü h köprü entegre çip', relay: 'röle rele anahtar kontak com no nc',
  sevenseg: 'yedi segment rakam hane display gösterge', sr595: 'kaydırmalı yazmaç shift register entegre çip 74hc595 portu genişlet',
  hcsr04: 'mesafe uzaklık ultrasonik sonar ölçer hc-sr04 yankı echo trig',
  dht: 'sıcaklık nem sensörü dht11 dht22 hava nemölçer',
  pir: 'hareket sensörü kızılötesi insan algılama pir',
  irobstacle: 'engel kızılötesi ir yakınlık algılayıcı çizgi izleyici',
  reed: 'mıknatıs manyetik kapı pencere anahtar reed',
  bmp280: 'basınç barometre rakım yükseklik sıcaklık sensörü i2c',
  mpu6050: 'ivme ivmeölçer jiroskop gyro eğim denge hareket sensörü i2c',
  joystick: 'analog kol oyun kumandası xy eksen ky-023',
  encoder: 'döner enkoder encoder ky-040 çevirmeli düğme knob dönüş',
  keypad: 'tuş takımı 4x4 matris klavye şifre tuş',
  rtc: 'saat gerçek zamanlı ds3231 tarih zaman pil i2c',
  mq2: 'gaz duman sensörü lpg yanıcı mq-2 kaçak',
  flame: 'alev yangın ateş sensörü kızılötesi',
  sound: 'ses mikrofon sensörü gürültü alkış',
  soil: 'toprak nem sensörü bitki sulama kapasitif',
  rain: 'yağmur sensörü yağış damla ıslaklık hava durumu yl-83',
  waterlevel: 'su seviyesi sensörü depo tank sıvı seviye taşma',
  mq3: 'alkol gaz sensörü nefes etanol mq-3',
  mq4: 'metan doğalgaz gaz sensörü mq-4 kaçak',
  mq7: 'karbon monoksit co gaz sensörü zehirli mq-7 soba',
  mq135: 'hava kalitesi amonyak nox benzen co2 gaz sensörü mq-135',
  sharpir: 'sharp ir kızılötesi mesafe uzaklık analog gp2y0a21',
  l298n: 'motor sürücü h köprü l298n çift kanal dc',
  tb6612: 'motor sürücü h köprü tb6612fng mosfet verimli çift kanal',
  drv8833: 'motor sürücü h köprü drv8833 küçük pil n20',
  bts7960: 'motor sürücü yüksek akım bts7960 ibt-2 43a büyük motor',
  md10c: 'motor sürücü cytron md10c pwm dir tek kanal',
  stepper: 'step motor adım nema17 tmc2209 a4988 sürücü cnc 3d yazıcı',
  esc: 'esc fırçasız bldc motor drone pervane brushless kv lipo',
  lcd1602: 'ekran lcd 16x2 hd44780 yazı display paralel', lcdI2c: 'ekran lcd 16x2 i2c pcf8574 yazı display',
  oled: 'ekran oled ssd1306 128x64 grafik piksel display i2c 0.96',
  bme280: 'sıcaklık basınç nem barometre rakım hava istasyonu i2c bosch',
  ds18b20: 'sıcaklık termometre su geçirmez prob 1-wire onewire dallas',
  vl53l0x: 'mesafe uzaklık lazer tof uçuş süresi i2c',
}

/** İngilizce arama sözcükleri (İngilizce ad dahil); arama her iki dilde de çalışır. */
export const PART_KEYWORDS_EN: Partial<Record<PartType, string>> = {
  uno: 'arduino board microcontroller', led: 'light diode lamp', rgbled: 'color colour light led', buzzer: 'sound beeper speaker piezo tone',
  servo: 'motor arm angle', button: 'push button switch key tactile', pot: 'potentiometer variable resistor knob trimmer',
  ldr: 'light sensor photoresistor photocell', ntc: 'temperature sensor thermistor', resistor: 'resistor ohm', diode: 'diode rectifier flyback',
  npn: 'transistor bjt switch', mosfet: 'transistor fet switch', dcmotor: 'dc motor brushed propeller fan', l293d: 'motor driver h bridge chip ic',
  relay: 'relay switch contact', sevenseg: 'seven segment digit display', sr595: 'shift register chip ic port expander',
  lcd1602: 'lcd screen display text', lcdI2c: 'lcd screen display text i2c',
  hcsr04: 'distance ultrasonic sonar range echo', dht: 'temperature humidity sensor weather', pir: 'motion sensor infrared human presence',
  irobstacle: 'obstacle infrared proximity detector line follower', reed: 'reed switch magnet magnetic door window',
  bmp280: 'pressure barometer altitude temperature sensor', mpu6050: 'accelerometer gyroscope gyro imu tilt balance motion sensor',
  joystick: 'joystick analog stick gamepad thumbstick', encoder: 'rotary encoder knob dial', keypad: 'keypad matrix keyboard password keys',
  rtc: 'real time clock date time battery', mq2: 'gas smoke sensor lpg leak', flame: 'flame fire sensor infrared', sound: 'sound microphone noise clap sensor',
  soil: 'soil moisture sensor plant watering capacitive', rain: 'rain sensor raindrop wet weather', waterlevel: 'water level sensor tank liquid overflow',
  mq3: 'alcohol gas sensor breath ethanol', mq4: 'methane natural gas sensor leak', mq7: 'carbon monoxide co gas sensor',
  mq135: 'air quality ammonia benzene co2 gas sensor', sharpir: 'infrared distance range analog sensor',
  l298n: 'motor driver h bridge dual channel', tb6612: 'motor driver h bridge mosfet dual channel', drv8833: 'motor driver h bridge small battery',
  bts7960: 'motor driver high current big motor', md10c: 'motor driver pwm dir single channel',
  stepper: 'stepper motor step nema17 driver cnc 3d printer', esc: 'esc brushless bldc motor drone propeller lipo',
  oled: 'oled screen display graphics pixel', bme280: 'temperature pressure humidity barometer weather station',
  ds18b20: 'temperature thermometer waterproof probe one wire', vl53l0x: 'distance range laser time of flight tof',
}

/** Küçük harfe indirir, Türkçe aksanları (ö→o, ı→i…) ve tireyi sadeleştirir: "ROLE", "rele", "transistor", "7 segment" bulunur. */
const norm = (s: string) => s.toLocaleLowerCase('tr-TR').replace(/[ıöüşçğ]/g, (c) => ({ ı: 'i', ö: 'o', ü: 'u', ş: 's', ç: 'c', ğ: 'g' })[c]!).replace(/[-_/]+/g, ' ')

export interface PartGroup { key: PickerCategoryKey; title: string; types: PartType[] }

/**
 * İzinli parçaları kategorilere böler; `query` ad ve anahtar sözcüklerde (Türkçe + İngilizce) aranır (Türkçe büyük/küçük harf duyarsız).
 * `extra`: aramaya eklenecek metin (ör. arayüz dilindeki parça adı).
 */
export function pickerGroups(allowed: readonly PartType[], query: string, extra?: (t: PartType) => string): PartGroup[] {
  const words = norm(query.trim()).split(/\s+/).filter(Boolean)
  const match = (t: PartType) => {
    if (!words.length) return true
    const hay = norm(`${PART_DEFS[t].name} ${SHORT_NAME[t] ?? ''} ${PART_KEYWORDS[t] ?? ''} ${PART_KEYWORDS_EN[t] ?? ''} ${extra?.(t) ?? ''}`)
    return words.every((w) => hay.includes(w))
  }
  const known = new Set(PICKER_CATEGORIES.flatMap((c) => c.types))
  const cats: PartCategory[] = [...PICKER_CATEGORIES, { key: 'other', title: 'Diğer', types: allowed.filter((t) => !known.has(t)) }]
  return cats.map((c) => ({ key: c.key, title: c.title, types: c.types.filter((t) => allowed.includes(t) && match(t)) })).filter((c) => c.types.length)
}
