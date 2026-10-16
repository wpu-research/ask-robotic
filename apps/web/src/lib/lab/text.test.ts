import { describe, expect, it } from 'vitest'
import { createT } from '@/i18n'
import { lab as trLab } from '@/i18n/tr/lab'
import { PROPS, type PartType } from './contract'
import { PART_DEFS } from './geometry'
import { formatMeasurement, formatPinBalloon, MEASURE_HINT, MEASURE_IDLE, MEASURE_NONE } from './measure'
import { DEFAULT_PARTS, PICKER_CATEGORIES, SHORT_NAME, pickerGroups } from './parts'
import { partName, partShortName, propLabel, propOptionLabel } from './text'
import { WARNING_META, warningMessage, warningTitle } from './warnings'

const tr = createT('tr'), en = createT('en')
const TYPES = Object.keys(PART_DEFS) as PartType[]
const TR_CHARS = /[ğşıİçöüÇŞĞÖÜ]/

describe('lab sözlüğü: Türkçe kaynaklarla birebir', () => {
  it('parça adları, kısa adlar, özellik etiketleri ve seçenekler Türkçede değişmez', () => {
    for (const t of TYPES) {
      expect(partName(tr, t), t).toBe(PART_DEFS[t].name)
      expect(partShortName(tr, t), t).toBe(SHORT_NAME[t] ?? PART_DEFS[t].name)
      for (const d of PROPS[t]) {
        expect(propLabel(tr, t, d), `${t}.${d.key}`).toBe(d.label)
        for (const o of d.options ?? []) expect(propOptionLabel(tr, t, d.key, o), `${t}.${d.key}.${o.value}`).toBe(o.label)
      }
    }
    for (const c of PICKER_CATEGORIES) expect(tr(`lab.picker.cat.${c.key}`)).toBe(c.title)
    for (const [k, m] of Object.entries(WARNING_META)) expect(warningTitle(tr, k)).toBe(m!.title)
    expect(trLab.measure.hint).toBe(MEASURE_HINT); expect(trLab.measure.idle).toBe(MEASURE_IDLE); expect(trLab.measure.none).toBe(MEASURE_NONE)
  })
  it('İngilizcede her parça adı, etiketi ve Türkçe seçenek etiketi çevrilmiştir', () => {
    for (const t of TYPES) {
      expect(partName(en, t), t).not.toMatch(TR_CHARS)
      expect(partShortName(en, t), t).not.toMatch(TR_CHARS)
      for (const d of PROPS[t]) {
        expect(propLabel(en, t, d), `${t}.${d.key}`).not.toMatch(TR_CHARS)
        for (const o of d.options ?? []) expect(propOptionLabel(en, t, d.key, o), `${t}.${d.key}.${o.value}`).not.toMatch(/[ğşıİçöüÇŞĞÖÜ]|Yok|dişli|ile|Ortak|Tam adım/)
      }
    }
    expect(partName(en, 'resistor')).toBe('Resistor')
    expect(warningTitle(en, 'short-circuit')).toBe('Short circuit')
    expect(warningTitle(en, 'bilinmeyen')).toBe('Warning')
  })
})

describe('uyarı iletileri', () => {
  const SIM_MESSAGES = [
    '5V hattı doğrudan GND\'ye bağlı (kısa devre).', '3V3 hattı doğrudan GND\'ye bağlı (kısa devre).', '5V ile 3V3 hatları birbirine bağlı.',
    'LED ters bağlı: anot (+) toprağa daha yakın.', 'LED\'in seri direnci yok; akım sınırlanmazsa LED yanar.',
    'D2 pinine bağlı hat toprağa, besleme hattına ya da başka bir uca iletken yolla bağlı değil (yüzen).',
    'Röle modülü beslenmemiş: VCC, GND 5 V / GND hattına bağlı değil.', 'L293D beslenmemiş: VCC2 (motor beslemesi) 5 V / GND hattına bağlı değil.',
    'HC-SR04 TRIG ucu bağlı değil: sensör çalışmaz.', 'Step sürücü STEP ucu doğrudan bir Arduino pinine bağlı olmalı (araya direnç/parça koyma).',
    'BMP280 SDA ucu A4 pinine bağlı değil: I2C cihazı veri yolunda görünmez.',
    'DS18B20 DQ hattında pull-up direnci yok: DQ ile VCC arasına 4,7 kΩ direnç bağla (yoksa sensör bulunamaz).', 'SSD1306 OLED beslenmemiş: VCC 5 V / GND hattına bağlı değil.',
    '74HC595 OE ucu bağlı değil (yüzen giriş): çıkışlar kapalı kalır (OE GND\'ye bağlanmalı).',
    '74HC595 SRCLR ucu bağlı değil (yüzen giriş): kaydırma yazmacı temizlenmiş sayılır (SRCLR 5 V\'a bağlanmalı).',
    '74HC595 SER ucu bağlı değil (yüzen giriş): çip çalışmaz.',
    'Transistörün tabanında seri direnç yok: taban akımı sınırsız (tabana direnç ekle).',
    'Motorun flyback diyodu ters bağlı: anot (düz uç) transistör tarafında, katot (çizgili uç) motorun artı ucunda olmalı.',
    'Motor transistör/MOSFET ile sürülüyor ama uçlarına paralel flyback diyodu yok: kesilen akım transistörü bozabilir.',
    'LED\'in seri direnci yok ya da çok küçük: akım güvenli sınırı aştı.', 'LED yandı (52 mA). Sıfırlayınca düzelir; seri direnç ekle.',
    'Taban akımı 31 mA: çok yüksek. Tabana seri direnç (örn. 1 kΩ) ekle.', '5V hattı dirençsiz bir yolla topraklandı (kısa devre).',
    'D13 pini doğrudan GND\'ye bağlı (kısa devre).', 'D7 pini doğrudan 5V\'a bağlı (kısa devre).', 'D9 pininden 55 mA geçiyor (sınır 40 mA).',
  ]
  it('Türkçede sim iletisi aynen gösterilir', () => {
    for (const m of SIM_MESSAGES) expect(warningMessage(tr, 'tr', { message: m })).toBe(m)
  })
  it('İngilizcede bilinen her sim iletisi çevrilir, değerler korunur', () => {
    for (const m of SIM_MESSAGES) expect(warningMessage(en, 'en', { message: m }), m).not.toMatch(TR_CHARS)
    expect(warningMessage(en, 'en', { message: 'D9 pininden 55 mA geçiyor (sınır 40 mA).' })).toBe('55 mA flowing through pin D9 (limit 40 mA).')
    expect(warningMessage(en, 'en', { message: 'Röle modülü beslenmemiş: VCC, GND 5 V / GND hattına bağlı değil.' })).toBe('Relay module is not powered: VCC, GND not connected to the 5 V / GND rails.')
    expect(warningMessage(en, 'en', { message: 'tanınmayan ileti' })).toBe('tanınmayan ileti')
  })
})

describe('dile bağlı biçim ve arama', () => {
  it('ölçüm ve pin balonu: İngilizcede ondalık nokta', () => {
    expect(formatMeasurement({ vAcross: 3.1, currentMa: 8.6 }, 'en')).toBe('3.10 V · 8.6 mA →')
    expect(formatPinBalloon('D13', { mode: 'out', high: true, volts: 4.98 }, 'en', en('lab.canvas.pinMode.out'))).toBe('D13: 4.98 V · output')
  })
  it('parça araması İngilizce sözcüklerle de çalışır', () => {
    const q = (s: string) => pickerGroups(DEFAULT_PARTS, s).flatMap((x) => x.types)
    expect(q('relay')).toEqual(['relay'])
    expect(q('resistor')).toContain('resistor')
    expect(q('humidity')).toEqual(['dht', 'bme280'])
    expect(q('one wire')).toEqual(['ds18b20'])
    expect(q('flame')).toEqual(['flame'])
    expect(pickerGroups(DEFAULT_PARTS, '').map((g) => g.key)).toEqual(['output', 'input', 'active', 'sensors', 'motion', 'comm', 'power'])
  })
})
