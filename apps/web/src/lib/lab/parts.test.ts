import { describe, expect, it } from 'vitest'
import { PINS, type PartType } from './contract'
import { PART_DEFS, localToWorld, partBounds, pinWorld } from './geometry'
import { currentArrow, formatMeasurement, formatMilliamps, formatPinBalloon, formatVolts } from './measure'
import { DEFAULT_PARTS, STAGE_A_PARTS, STAGE_B_PARTS, STAGE_C_PARTS, pickerGroups, STAGE_D_MOTION, STAGE_D_PARTS, STAGE_D_SENSORS, STAGE_E_PARTS, STAGE_E_SENSORS } from './parts'
import { WARNING_META, warningMeta } from './warnings'

const ALL = Object.keys(PINS) as PartType[]

describe('geometri: Aşama B', () => {
  for (const t of STAGE_B_PARTS) {
    it(`${t}: tüm sözleşme pinleri var, sınır içinde, birbirinden >= 10 px`, () => {
      const d = PART_DEFS[t]
      expect(Object.keys(d.pins).sort()).toEqual([...PINS[t]].sort())
      const pts = Object.entries(d.pins)
      for (const [n, p] of pts) {
        expect(p.x, n).toBeGreaterThanOrEqual(0); expect(p.x, n).toBeLessThanOrEqual(d.w)
        expect(p.y, n).toBeGreaterThanOrEqual(0); expect(p.y, n).toBeLessThanOrEqual(d.h)
      }
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        expect(Math.hypot(pts[i][1].x - pts[j][1].x, pts[i][1].y - pts[j][1].y), `${pts[i][0]}-${pts[j][0]}`).toBeGreaterThanOrEqual(10)
      }
    })
  }
  it('her parça türünün pinleri sözleşmeyle birebir aynı', () => {
    for (const t of ALL) expect(Object.keys(PART_DEFS[t].pins).sort(), t).toEqual([...PINS[t]].sort())
  })
  it('döndürme: 90° ve 360° dönüşümü pinleri sınır kutusunda tutar', () => {
    for (const t of STAGE_B_PARTS) {
      for (const rotation of [0, 90, 180, 270] as const) {
        const part = { type: t, x: 100, y: 50, rotation }
        const b = partBounds(part)
        for (const n of PINS[t]) {
          const w = pinWorld(part, n)!
          expect(w.x).toBeGreaterThanOrEqual(b.x - 0.001); expect(w.x).toBeLessThanOrEqual(b.x + b.w + 0.001)
          expect(w.y).toBeGreaterThanOrEqual(b.y - 0.001); expect(w.y).toBeLessThanOrEqual(b.y + b.h + 0.001)
        }
      }
    }
  })
  it('röle: 90° dönünce sol başlık yukarı çıkar', () => {
    const p = { type: 'relay' as const, x: 0, y: 0, rotation: 90 as const }
    const vcc = localToWorld(p, PART_DEFS.relay.pins.VCC), no = localToWorld(p, PART_DEFS.relay.pins.NO)
    expect(vcc.y).toBeLessThan(no.y)
  })
})

describe('geometri: Aşama C', () => {
  for (const t of STAGE_C_PARTS) {
    it(`${t}: pinler sözleşmeyle birebir, sınır içinde, >= 10 px aralıklı, kendi etiketini çizer`, () => {
      const d = PART_DEFS[t]
      expect(Object.keys(d.pins).sort()).toEqual([...PINS[t]].sort())
      expect(d.w).toBeGreaterThan(40)
      const pts = Object.entries(d.pins)
      for (const [n, p] of pts) {
        expect(p.x, n).toBeGreaterThanOrEqual(0); expect(p.x, n).toBeLessThanOrEqual(d.w)
        expect(p.y, n).toBeGreaterThanOrEqual(0); expect(p.y, n).toBeLessThanOrEqual(d.h)
      }
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        expect(Math.hypot(pts[i][1].x - pts[j][1].x, pts[i][1].y - pts[j][1].y), `${pts[i][0]}-${pts[j][0]}`).toBeGreaterThanOrEqual(10)
      }
      if (t !== 'reed') expect(d.ownLabels).toBe(true)
    })
  }
  it('döndürme: Aşama C pinleri sınır kutusunda kalır', () => {
    for (const t of STAGE_C_PARTS) for (const rotation of [0, 90, 180, 270] as const) {
      const part = { type: t, x: 100, y: 50, rotation }
      const b = partBounds(part)
      for (const n of PINS[t]) {
        const w = pinWorld(part, n)!
        expect(w.x).toBeGreaterThanOrEqual(b.x - 0.001); expect(w.x).toBeLessThanOrEqual(b.x + b.w + 0.001)
        expect(w.y).toBeGreaterThanOrEqual(b.y - 0.001); expect(w.y).toBeLessThanOrEqual(b.y + b.h + 0.001)
      }
    }
  })
})

describe('geometri: Aşama E', () => {
  for (const t of STAGE_E_PARTS) {
    it(`${t}: pinler sözleşmeyle birebir, sınır içinde, >= 10 px aralıklı, kendi etiketini çizer`, () => {
      const d = PART_DEFS[t]
      expect(Object.keys(d.pins).sort()).toEqual([...PINS[t]].sort())
      expect(d.ownLabels).toBe(true)
      const pts = Object.entries(d.pins)
      for (const [n, p] of pts) {
        expect(p.x, n).toBeGreaterThanOrEqual(0); expect(p.x, n).toBeLessThanOrEqual(d.w)
        expect(p.y, n).toBeGreaterThanOrEqual(0); expect(p.y, n).toBeLessThanOrEqual(d.h)
      }
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        expect(Math.hypot(pts[i][1].x - pts[j][1].x, pts[i][1].y - pts[j][1].y), `${pts[i][0]}-${pts[j][0]}`).toBeGreaterThanOrEqual(10)
      }
    })
  }
})

describe('palet', () => {
  it('varsayılan = A + B + C + D + E', () => {
    expect(DEFAULT_PARTS).toEqual([...STAGE_A_PARTS, ...STAGE_B_PARTS, ...STAGE_C_PARTS, ...STAGE_D_PARTS, ...STAGE_E_PARTS])
    expect(new Set(DEFAULT_PARTS).size).toBe(DEFAULT_PARTS.length)
  })
  it('kategoriler: çıkış, giriş, aktif devre elemanları, sensörler, motor sürücüler', () => {
    const g = pickerGroups(DEFAULT_PARTS, '')
    expect(g.map((x) => x.title)).toEqual(['Çıkış', 'Giriş', 'Aktif devre elemanları', 'Sensörler', 'Motor sürücüler ve hareket'])
    expect(g[3].types).toEqual([...STAGE_C_PARTS, ...STAGE_D_SENSORS, ...STAGE_E_SENSORS])
    expect(g[0].types).toContain('oled')
    expect(g[4].types).toEqual(STAGE_D_MOTION)
    expect(g[0].types).toContain('relay'); expect(g[1].types).toEqual(['button', 'pot', 'ldr', 'ntc']); expect(g[2].types).toContain('l293d')
    expect(g.flatMap((x) => x.types).sort()).toEqual([...DEFAULT_PARTS].sort())
  })
  it('allowedParts kısıtlaması korunur', () => {
    const g = pickerGroups(['led', 'resistor'], '')
    expect(g.flatMap((x) => x.types).sort()).toEqual(['led', 'resistor'])
    expect(pickerGroups(['led'], 'röle')).toEqual([])
  })
  it('arama: Türkçe, büyük/küçük harf duyarsız, anahtar sözcük', () => {
    const t = (q: string) => pickerGroups(DEFAULT_PARTS, q).flatMap((x) => x.types)
    expect(t('RÖLE')).toEqual(['relay'])
    expect(t('transistör').sort()).toEqual(['mosfet', 'npn'])
    expect(t('lcd').sort()).toEqual(['lcd1602', 'lcdI2c'])
    expect(t('Işık')).toContain('ldr')
    expect(t('xyz')).toEqual([])
  })
  it('arama: aksansız yazım, tire/boşluk ve çok sözcüklü sorgu', () => {
    const t = (q: string) => pickerGroups(DEFAULT_PARTS, q).flatMap((x) => x.types)
    expect(t('ROLE')).toEqual(['relay'])
    expect(t('rele')).toEqual(['relay'])
    expect(t('transistor').sort()).toEqual(['mosfet', 'npn'])
    expect(t('7 segment')).toEqual(['sevenseg'])
    expect(t('lcd i2c')).toEqual(['lcdI2c'])
    expect(t('servo motor')).toEqual(['servo'])
    expect(t('encoder')).toEqual(['encoder'])
    expect(t('sicaklik').sort()).toEqual(['bme280', 'bmp280', 'dht', 'ds18b20', 'ntc'])
  })
  it('arama: Aşama C Türkçe anahtar sözcükler', () => {
    const t = (q: string) => pickerGroups(DEFAULT_PARTS, q).flatMap((x) => x.types)
    expect(t('mesafe')).toEqual(['hcsr04', 'sharpir', 'vl53l0x'])
    expect(t('Nem').sort()).toEqual(['bme280', 'dht', 'soil', 'stepper']) // step motorun adında NEMA17 geçer
    expect(t('hareket')).toEqual(expect.arrayContaining(['pir', 'mpu6050']))
    expect(t('mıknatıs')).toEqual(['reed'])
    expect(t('Şifre')).toEqual(['keypad'])
    expect(t('gaz')).toEqual(['mq2', 'mq3', 'mq4', 'mq7', 'mq135'])
    expect(t('motor sürücü')).toEqual(['l293d', 'l298n', 'tb6612', 'drv8833', 'bts7960', 'md10c', 'stepper'])
    expect(t('drone')).toEqual(['esc'])
    expect(t('jiroskop')).toEqual(['mpu6050'])
    expect(t('toprak')).toEqual(['soil'])
    expect(t('saat')).toEqual(['rtc'])
    expect(t('alev')).toEqual(['flame'])
    expect(t('mikrofon')).toEqual(['sound'])
    expect(t('enkoder')).toEqual(['encoder'])
    expect(t('yağmur')).toEqual(['rain'])
    expect(t('seviye')).toEqual(['waterlevel'])
    expect(t('oled')).toEqual(['oled'])
    expect(t('1-wire')).toEqual(['ds18b20'])
    expect(t('lazer')).toEqual(['vl53l0x'])
  })
  it('Diğer: kategorisiz izinli tür görünür', () => {
    expect(pickerGroups(['uno', 'led'], '').map((x) => x.title)).toEqual(['Çıkış', 'Diğer'])
  })
})

describe('sanal ölçüm biçimi', () => {
  it('ondalık virgül ve işaret', () => {
    expect(formatMeasurement({ vAcross: 3.1, currentMa: 8.6 })).toBe('3,10 V · 8,6 mA →')
    expect(formatMeasurement({ vAcross: -1.2, currentMa: -3 })).toBe('−1,20 V · −3,0 mA ←')
    expect(formatMeasurement({ vAcross: 0.001, currentMa: 0 })).toBe('0,00 V · 0,00 mA')
    expect(formatMilliamps(250.4)).toBe('250 mA'); expect(formatMilliamps(0.35)).toBe('0,35 mA')
    expect(formatVolts(-0.004)).toBe('0,00 V')
  })
  it('değer yoksa null', () => {
    expect(formatMeasurement(undefined)).toBeNull()
    expect(formatMeasurement({ vAcross: NaN, currentMa: 1 })).toBeNull()
    expect(currentArrow(0.01)).toBe('')
  })
  it('Uno pin balonu', () => {
    expect(formatPinBalloon('D13', { mode: 'out', high: true, volts: 4.98 })).toBe('D13: 4,98 V · çıkış')
  })
})

describe('uyarı meta', () => {
  it('yeni türler Türkçe başlıklı', () => {
    expect(WARNING_META['flyback-missing']?.title).toMatch(/diyot/i)
    expect(WARNING_META.unpowered?.title).toMatch(/Besleme/)
    expect(warningMeta('bilinmeyen').title).toBe('Uyarı')
  })
})
