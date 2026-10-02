// Palet: parça kümeleri, kategoriler ve arama süzgeci. Saf (DOM yok).
import type { PartType } from './contract'
import { PART_DEFS } from './geometry'

/** Aşama A (Modül 3, H1-H4). */
export const STAGE_A_PARTS: PartType[] = ['led', 'resistor', 'button', 'pot', 'ldr', 'ntc', 'buzzer', 'rgbled', 'servo']
/** Aşama B (Modül 3, H5-H7). */
export const STAGE_B_PARTS: PartType[] = ['diode', 'npn', 'mosfet', 'dcmotor', 'l293d', 'relay', 'sevenseg', 'sr595', 'lcd1602', 'lcdI2c']
/** Aşama C (Modül 4): sensörler ve girdi cihazları. */
export const STAGE_C_PARTS: PartType[] = ['hcsr04', 'dht', 'pir', 'irobstacle', 'reed', 'bmp280', 'mpu6050', 'joystick', 'encoder', 'keypad', 'rtc', 'mq2', 'flame', 'sound', 'soil', 'rain', 'waterlevel']
/** Varsayılan palet (ders etkinliği `allowedParts` ile kısıtlayabilir). */
export const DEFAULT_PARTS: PartType[] = [...STAGE_A_PARTS, ...STAGE_B_PARTS, ...STAGE_C_PARTS]

export interface PartCategory { title: string; types: PartType[] }
export const PICKER_CATEGORIES: PartCategory[] = [
  { title: 'Çıkış', types: ['led', 'rgbled', 'buzzer', 'sevenseg', 'lcd1602', 'lcdI2c', 'dcmotor', 'servo', 'relay'] },
  { title: 'Giriş', types: ['button', 'pot', 'ldr', 'ntc'] },
  { title: 'Aktif devre elemanları', types: ['resistor', 'diode', 'npn', 'mosfet', 'l293d', 'sr595'] },
  { title: 'Sensörler', types: [...STAGE_C_PARTS] },
]

export const SHORT_NAME: Partial<Record<PartType, string>> = {
  ldr: 'LDR', ntc: 'NTC', pot: 'Potansiyometre', lcd1602: 'LCD 16x2', lcdI2c: 'LCD I2C', npn: 'NPN', sevenseg: '7-segment', relay: 'Röle',
  dht: 'DHT11/22', irobstacle: 'IR engel', reed: 'Reed', encoder: 'Enkoder', keypad: 'Keypad 4x4', rtc: 'RTC DS3231', mq2: 'MQ-2 gaz', soil: 'Toprak nemi', rain: 'Yağmur', waterlevel: 'Su seviyesi',
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
  lcd1602: 'ekran lcd 16x2 hd44780 yazı display paralel', lcdI2c: 'ekran lcd 16x2 i2c pcf8574 yazı display',
}

/** Küçük harfe indirir, Türkçe aksanları (ö→o, ı→i…) ve tireyi sadeleştirir: "ROLE", "rele", "transistor", "7 segment" bulunur. */
const norm = (s: string) => s.toLocaleLowerCase('tr-TR').replace(/[ıöüşçğ]/g, (c) => ({ ı: 'i', ö: 'o', ü: 'u', ş: 's', ç: 'c', ğ: 'g' })[c]!).replace(/[-_/]+/g, ' ')

export interface PartGroup { title: string; types: PartType[] }

/** İzinli parçaları kategorilere böler; `query` ad ve anahtar sözcüklerde aranır (Türkçe büyük/küçük harf duyarsız). */
export function pickerGroups(allowed: readonly PartType[], query: string): PartGroup[] {
  const words = norm(query.trim()).split(/\s+/).filter(Boolean)
  const match = (t: PartType) => {
    if (!words.length) return true
    const hay = norm(`${PART_DEFS[t].name} ${SHORT_NAME[t] ?? ''} ${PART_KEYWORDS[t] ?? ''}`)
    return words.every((w) => hay.includes(w))
  }
  const known = new Set(PICKER_CATEGORIES.flatMap((c) => c.types))
  const cats: PartCategory[] = [...PICKER_CATEGORIES, { title: 'Diğer', types: allowed.filter((t) => !known.has(t)) }]
  return cats.map((c) => ({ title: c.title, types: c.types.filter((t) => allowed.includes(t) && match(t)) })).filter((c) => c.types.length)
}
