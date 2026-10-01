// Palet: parça kümeleri, kategoriler ve arama süzgeci. Saf (DOM yok).
import type { PartType } from './contract'
import { PART_DEFS } from './geometry'

/** Aşama A (Modül 3, H1-H4). */
export const STAGE_A_PARTS: PartType[] = ['led', 'resistor', 'button', 'pot', 'ldr', 'ntc', 'buzzer', 'rgbled', 'servo']
/** Aşama B (Modül 3, H5-H7). */
export const STAGE_B_PARTS: PartType[] = ['diode', 'npn', 'mosfet', 'dcmotor', 'l293d', 'relay', 'sevenseg', 'sr595', 'lcd1602', 'lcdI2c']
/** Varsayılan palet (ders etkinliği `allowedParts` ile kısıtlayabilir). */
export const DEFAULT_PARTS: PartType[] = [...STAGE_A_PARTS, ...STAGE_B_PARTS]

export interface PartCategory { title: string; types: PartType[] }
export const PICKER_CATEGORIES: PartCategory[] = [
  { title: 'Çıkış', types: ['led', 'rgbled', 'buzzer', 'sevenseg', 'lcd1602', 'lcdI2c', 'dcmotor', 'servo', 'relay'] },
  { title: 'Giriş', types: ['button', 'pot', 'ldr', 'ntc'] },
  { title: 'Aktif devre elemanları', types: ['resistor', 'diode', 'npn', 'mosfet', 'l293d', 'sr595'] },
]

export const SHORT_NAME: Partial<Record<PartType, string>> = {
  ldr: 'LDR', ntc: 'NTC', pot: 'Potansiyometre', lcd1602: 'LCD 16x2', lcdI2c: 'LCD I2C', npn: 'NPN', sevenseg: '7-segment', relay: 'Röle',
}

export const PART_KEYWORDS: Partial<Record<PartType, string>> = {
  led: 'ışık diyot lamba', rgbled: 'renkli ışık led', buzzer: 'ses zil hoparlör', servo: 'motor kol açı', button: 'düğme anahtar tuş',
  pot: 'ayarlı direnç knob', ldr: 'ışık sensörü foto', ntc: 'sıcaklık sensörü termistör', resistor: 'ohm',
  diode: 'diyot 1n4007 geri tepme flyback doğrultucu', npn: 'transistör 2n2222 bc547 anahtar bjt', mosfet: 'transistör fet irlz44n anahtar',
  dcmotor: 'motor fırçalı dönen pervane', l293d: 'motor sürücü h köprü entegre çip', relay: 'röle anahtar kontak com no nc',
  sevenseg: 'yedi segment rakam hane display gösterge', sr595: 'kaydırmalı yazmaç shift register entegre çip 74hc595 portu genişlet',
  lcd1602: 'ekran lcd 16x2 hd44780 yazı display paralel', lcdI2c: 'ekran lcd 16x2 i2c pcf8574 yazı display',
}

const norm = (s: string) => s.toLocaleLowerCase('tr-TR')

export interface PartGroup { title: string; types: PartType[] }

/** İzinli parçaları kategorilere böler; `query` ad ve anahtar sözcüklerde aranır (Türkçe büyük/küçük harf duyarsız). */
export function pickerGroups(allowed: readonly PartType[], query: string): PartGroup[] {
  const needle = norm(query.trim())
  const match = (t: PartType) => !needle || norm(`${PART_DEFS[t].name} ${SHORT_NAME[t] ?? ''} ${PART_KEYWORDS[t] ?? ''}`).includes(needle)
  const known = new Set(PICKER_CATEGORIES.flatMap((c) => c.types))
  const cats: PartCategory[] = [...PICKER_CATEGORIES, { title: 'Diğer', types: allowed.filter((t) => !known.has(t)) }]
  return cats.map((c) => ({ title: c.title, types: c.types.filter((t) => allowed.includes(t) && match(t)) })).filter((c) => c.types.length)
}
