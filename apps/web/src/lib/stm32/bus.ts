// I²C ve SPI zamanlama diyagramları: bir işlemin SCL/SDA ya da SCK/MOSI/MISO/CS dalga biçimini yarım bit adımlarla üretir
// ve her adımı etiketler (START, adres, R/W, ACK/NACK, veri, STOP; SPI'de örnekleme kenarları). Saf fonksiyonlar (bus.test.ts).

export interface Sample { scl: 0 | 1; sda: 0 | 1; label?: string; sampleAt?: boolean }
export interface I2cTxn { addr: number; read: boolean; data: number[]; /** Cihaz yoksa adres NACK alır. */ present: boolean; /** Okumada son bayttan sonra efendi NACK verir. */ }

/** Bir I²C işlemini yarım periyot örneklerine çevirir. SDA yalnız SCL düşükken değişir; SCL yüksekken değişirse START/STOP. */
export function i2cWave(t: I2cTxn): { samples: Sample[]; fields: Array<{ from: number; to: number; text: string }>; acked: boolean } {
  const s: Sample[] = [{ scl: 1, sda: 1 }, { scl: 1, sda: 0, label: 'S' }]
  const fields: Array<{ from: number; to: number; text: string }> = []
  let sda: 0 | 1 = 0
  const bit = (v: 0 | 1, label?: string) => {
    s.push({ scl: 0, sda: v, label }) // SCL düşük: veri değişir
    s.push({ scl: 1, sda: v, sampleAt: true }) // SCL yüksek: alıcı örnekler
    sda = v
  }
  const byte = (b: number, text: string) => {
    const from = s.length
    for (let i = 7; i >= 0; i--) bit(((b >> i) & 1) as 0 | 1) // MSB önce
    fields.push({ from, to: s.length, text })
  }
  byte((t.addr << 1) | (t.read ? 1 : 0), `0x${t.addr.toString(16).padStart(2, '0')} ${t.read ? 'R' : 'W'}`)
  const ackFrom = s.length
  bit(t.present ? 0 : 1)
  fields.push({ from: ackFrom, to: s.length, text: t.present ? 'ACK' : 'NACK' })
  if (t.present) {
    t.data.forEach((d, i) => {
      byte(d, `0x${d.toString(16).padStart(2, '0')}`)
      const last = i === t.data.length - 1
      const a = s.length
      // Yazmada köle ACK verir; okumada efendi, son bayt hariç ACK verir
      const nack = t.read && last
      bit(nack ? 1 : 0)
      fields.push({ from: a, to: s.length, text: nack ? 'NACK' : 'ACK' })
    })
  }
  s.push({ scl: 0, sda: 0 })
  s.push({ scl: 1, sda: 0 })
  s.push({ scl: 1, sda: 1, label: 'P' })
  void sda
  return { samples: s, fields, acked: t.present }
}
/** I²C hızı ve bir işlemin süresi (µs): bayt başına 9 saat + START/STOP. */
export const i2cDurationUs = (bytes: number, khz: number) => ((bytes * 9 + 2) * 1000) / khz
/** Çekme direnci üst sınırı (yükselme süresi): R ≤ tr / (0,8473 · Cb). Standart kipte tr = 1000 ns, hızlı kipte 300 ns. */
export const pullupMaxOhm = (busPf: number, fast: boolean) => ((fast ? 300e-9 : 1000e-9) / (0.8473 * busPf * 1e-12))
/** Alt sınır: 3,3 V'ta en fazla 3 mA çekim (VOL 0,4 V). */
export const pullupMinOhm = (vcc = 3.3) => (vcc - 0.4) / 0.003

export interface SpiSample { sck: 0 | 1; mosi: 0 | 1; miso: 0 | 1; cs: 0 | 1; sampleAt?: boolean }
/**
 * SPI kipleri: CPOL boşta saat seviyesi; CPHA=0 ilk kenarda, CPHA=1 ikinci kenarda örnekler. Veri MSB önce.
 * Dönen dizide `sampleAt` örnekleme anını işaretler; köle aynı kipte değilse yanlış bitler okunur.
 */
export function spiWave(mosiByte: number, misoByte: number, cpol: 0 | 1, cpha: 0 | 1): SpiSample[] {
  const idle = cpol, act = (1 - cpol) as 0 | 1
  const out: SpiSample[] = [{ sck: idle, mosi: 0, miso: 0, cs: 1 }]
  for (let i = 7; i >= 0; i--) {
    const mo = ((mosiByte >> i) & 1) as 0 | 1, mi = ((misoByte >> i) & 1) as 0 | 1
    if (cpha === 0) {
      out.push({ sck: idle, mosi: mo, miso: mi, cs: 0 }) // veri ilk kenardan önce hazır
      out.push({ sck: act, mosi: mo, miso: mi, cs: 0, sampleAt: true })
    } else {
      out.push({ sck: act, mosi: mo, miso: mi, cs: 0 }) // ilk kenarda veri değişir
      out.push({ sck: idle, mosi: mo, miso: mi, cs: 0, sampleAt: true })
    }
  }
  out.push({ sck: idle, mosi: 0, miso: 0, cs: 0 }, { sck: idle, mosi: 0, miso: 0, cs: 1 })
  return out
}
/** Örnekleme anlarındaki MOSI bitlerinden okunan bayt. */
export function spiRead(w: SpiSample[], line: 'mosi' | 'miso' = 'mosi'): number {
  return w.filter((x) => x.sampleAt).reduce((b, x) => (b << 1) | x[line], 0) & 0xff
}
/** Efendi (cpolM,cphaM) ile örnekler, veri köle kipinde (cpolS,cphaS) üretilmişse okunan bayt. Uyuşmazlık hatası gösterir. */
export function spiMismatch(byte: number, slave: [0 | 1, 0 | 1], master: [0 | 1, 0 | 1]): number {
  const w = spiWave(byte, byte, slave[0], slave[1])
  // Efendinin örnekleme anları: kendi kipinde üretilmiş dalganın sampleAt indisleri
  const mw = spiWave(0, 0, master[0], master[1])
  const idx = mw.map((x, i) => (x.sampleAt ? i : -1)).filter((i) => i >= 0)
  // Faz farkı varsa efendi, kölenin veriyi değiştirdiği yarım periyotta örnekler: bir bit kayar
  const shift = slave[1] === master[1] ? 0 : master[1] > slave[1] ? 1 : -1
  return idx.reduce((b, i) => (b << 1) | (w[Math.min(w.length - 1, Math.max(0, i + shift))]?.miso ?? 0), 0) & 0xff
}
