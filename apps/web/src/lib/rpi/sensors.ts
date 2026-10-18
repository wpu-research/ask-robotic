// Pi'de sensör veri yolları: 1-Wire (DS18B20 w1_slave dosyası, Dallas CRC-8), I²C (adres tablosu, çakışma) ve
// SPI (MCP3008 ADC çerçevesi). Saf fonksiyonlar; sensors.test.ts.

/** Dallas/Maxim 1-Wire CRC-8 (polinom x⁸+x⁵+x⁴+1, yansıtılmış 0x8C). */
export function crc8(bytes: number[]): number {
  let crc = 0
  for (let b of bytes) {
    for (let i = 0; i < 8; i++) {
      const mix = (crc ^ b) & 1
      crc >>= 1
      if (mix) crc ^= 0x8c
      b >>= 1
    }
  }
  return crc
}

const hex = (b: number) => b.toString(16).padStart(2, '0')

/** DS18B20 kazıma belleği (9 bayt) ve sürücünün yazdığı w1_slave metni (12 bit, 1/16 °C). */
export function makeW1Slave(tempC: number, corrupt = false): string {
  const raw = Math.round(tempC * 16) & 0xffff
  const sp = [raw & 0xff, raw >> 8, 0x4b, 0x46, 0x7f, 0xff, 0x05, 0x10]
  const crc = crc8(sp)
  const bytes = [...sp, corrupt ? crc ^ 0x5a : crc].map(hex).join(' ')
  const ok = !corrupt
  const t = Math.trunc(((raw & 0x8000 ? raw - 0x10000 : raw) * 1000) / 16) // çekirdek sürücüsü tamsayı böler
  return `${bytes} : crc=${hex(corrupt ? crc ^ 0x5a : crc)} ${ok ? 'YES' : 'NO'}\n${bytes} t=${t}\n`
}

export interface W1Reading { crcOk: boolean; tempC: number | null }
/** w1_slave metnini çözümler: ilk satır YES değilse ölçüm geçersizdir (yeniden oku). */
export function parseW1Slave(text: string): W1Reading {
  const [l1 = '', l2 = ''] = text.trim().split('\n')
  const crcOk = /crc=[0-9a-f]{2} YES$/.test(l1.trim())
  const m = l2.match(/t=(-?\d+)/)
  return { crcOk, tempC: crcOk && m ? Number(m[1]) / 1000 : null }
}
/** Ham bayt dizisinden sıcaklık ve CRC'yi kendin doğrula (sürücüye güvenmeden). */
export function decodeScratchpad(bytes: number[]): W1Reading {
  if (bytes.length !== 9) return { crcOk: false, tempC: null }
  const crcOk = crc8(bytes.slice(0, 8)) === bytes[8]
  const raw = bytes[0] | (bytes[1] << 8)
  return { crcOk, tempC: crcOk ? (raw & 0x8000 ? raw - 0x10000 : raw) / 16 : null }
}

/** Derste kullanılan I²C cihazları ve 7 bit adresleri (bazılarında adres pini ikinci adresi seçer). */
export const I2C_DEVICES = [
  { id: 'bme280', name: 'BME280', addrs: [0x76, 0x77], hyvex: 'bme280' },
  { id: 'ssd1306', name: 'SSD1306 OLED', addrs: [0x3c, 0x3d], hyvex: 'oled-ssd1306-0-96' },
  { id: 'mpu6050', name: 'MPU6050', addrs: [0x68, 0x69], hyvex: 'mpu6050' },
  { id: 'pcf8574', name: 'PCF8574 LCD', addrs: [0x27, 0x3f], hyvex: 'pcf8574-i2c-lcd-adaptoru' },
  { id: 'ds3231', name: 'DS3231 RTC', addrs: [0x68], hyvex: '' },
] as const
export type I2cId = (typeof I2C_DEVICES)[number]['id']

/** Takılı cihazlar ve seçilen adresler → yoldaki adresler ve çakışmalar. */
export function i2cBus(sel: Array<{ id: I2cId; alt: boolean }>): { addrs: number[]; conflicts: Array<{ addr: number; ids: I2cId[] }> } {
  const map = new Map<number, I2cId[]>()
  for (const s of sel) {
    const dev = I2C_DEVICES.find((d) => d.id === s.id)!
    const a = dev.addrs[s.alt && dev.addrs.length > 1 ? 1 : 0]
    map.set(a, [...(map.get(a) ?? []), s.id])
  }
  return {
    addrs: [...map.keys()].sort((a, b) => a - b),
    conflicts: [...map.entries()].filter(([, ids]) => ids.length > 1).map(([addr, ids]) => ({ addr, ids })),
  }
}

/** MCP3008 tek uçlu okuma: gönderilen 3 bayt. */
export const mcp3008Tx = (ch: number): number[] => [0x01, (0x08 | (ch & 7)) << 4, 0x00]
/** 10 bit değer için dönen 3 bayt (ilk bayt anlamsız, örnekte 0). */
export const mcp3008Rx = (value: number): number[] => [0x00, (value >> 8) & 0x03, value & 0xff]
export const mcp3008Decode = (rx: number[]) => ((rx[1] & 0x03) << 8) | rx[2]
/** Gerilim → 10 bit kod (Vref = 3,3 V). */
export const adc10 = (v: number, vref = 3.3) => Math.max(0, Math.min(1023, Math.floor((v / vref) * 1024)))
export const codeToVolts = (code: number, vref = 3.3) => (code / 1024) * vref
