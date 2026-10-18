// STM32 çevre birimleri: zamanlayıcı ve PWM (PSC/ARR/CCR), USART çerçevesi ve BRR, ADC + DMA (dairesel tampon, yarım/tam
// aktarım kesmeleri). Saf fonksiyonlar (periph.test.ts); bileşenler yalnız çizer.

// ---------- Zamanlayıcı / PWM ----------
export interface PwmCfg { fTim: number; psc: number; arr: number; ccr: number }
/** Sayaç frekansı f_tim/(PSC+1), taşma (güncelleme) frekansı f_tim/((PSC+1)(ARR+1)). */
export const pwmFreq = (c: Pick<PwmCfg, 'fTim' | 'psc' | 'arr'>) => c.fTim / ((c.psc + 1) * (c.arr + 1))
/** PWM kip 1, yukarı sayım: CNT < CCR iken çıkış 1. CCR > ARR ise %100. */
export const pwmDuty = (c: Pick<PwmCfg, 'arr' | 'ccr'>) => Math.min(1, c.ccr / (c.arr + 1))
/** Görev oranı adımı (bit cinsinden çözünürlük). */
export const pwmBits = (arr: number) => Math.log2(arr + 1)
/** CNT anındaki çıkış (PWM kip 1). */
export const pwmOut = (cnt: number, ccr: number) => (cnt < ccr ? 1 : 0)

/** İstenen frekans için PSC/ARR: 16 bit sınırlar içinde, en yüksek çözünürlük (en küçük PSC). */
export function solvePwm(fTim: number, fTarget: number, maxArr = 0xffff): { psc: number; arr: number; actual: number; errPct: number } | null {
  if (fTarget <= 0 || fTarget > fTim) return null
  const total = fTim / fTarget
  const psc = Math.max(0, Math.ceil(total / (maxArr + 1)) - 1)
  if (psc > 0xffff) return null
  const arr = Math.max(1, Math.round(total / (psc + 1)) - 1)
  if (arr > maxArr) return null
  const actual = pwmFreq({ fTim, psc, arr })
  return { psc, arr, actual, errPct: ((actual - fTarget) / fTarget) * 100 }
}
/** Görev oranından CCR. */
export const ccrFor = (duty: number, arr: number) => Math.round(Math.min(1, Math.max(0, duty)) * (arr + 1))
/** Servo: 50 Hz, 1 µs adım için PSC = f_tim(MHz) − 1 ve ARR = 19999; açı → CCR (µs). */
export const servoCcr = (angle: number, minUs = 1000, maxUs = 2000) => Math.round(minUs + (Math.min(180, Math.max(0, angle)) / 180) * (maxUs - minUs))

// ---------- USART ----------
export type Parity = 'none' | 'even' | 'odd'
export interface UartCfg { baud: number; bits: 8 | 9; parity: Parity; stop: 1 | 2 }
export interface Bit { v: 0 | 1; kind: 'idle' | 'start' | 'data' | 'parity' | 'stop'; i?: number }
/** STM32'de parite, kelime uzunluğunun içinde sayılır: 8 bit + parite için M=1 (9 bit) seçilir. Burada veri bitleri ayrı tutulur. */
export function frameBits(byte: number, c: Pick<UartCfg, 'parity' | 'stop'>, dataBits = 8): Bit[] {
  const out: Bit[] = [{ v: 0, kind: 'start' }]
  let ones = 0
  for (let i = 0; i < dataBits; i++) { const v = ((byte >> i) & 1) as 0 | 1; ones += v; out.push({ v, kind: 'data', i }) } // LSB önce
  if (c.parity !== 'none') out.push({ v: (c.parity === 'even' ? ones % 2 : 1 - (ones % 2)) as 0 | 1, kind: 'parity' })
  for (let s = 0; s < c.stop; s++) out.push({ v: 1, kind: 'stop' })
  return out
}
export function frameString(text: string, c: Pick<UartCfg, 'parity' | 'stop'>, idle = 2): Bit[] {
  const out: Bit[] = Array.from({ length: idle }, () => ({ v: 1 as const, kind: 'idle' as const }))
  for (const ch of new TextEncoder().encode(text)) out.push(...frameBits(ch, c), { v: 1, kind: 'idle' })
  return out
}
/** Bit dizisini çöz: hatalı stop biti çerçeve hatası (FE), parite tutmazsa PE. */
export function decodeBits(levels: Array<0 | 1>, c: Pick<UartCfg, 'parity' | 'stop'>): Array<{ byte: number; fe: boolean; pe: boolean }> {
  const out: Array<{ byte: number; fe: boolean; pe: boolean }> = []
  let i = 0
  const n = 1 + 8 + (c.parity !== 'none' ? 1 : 0) + c.stop
  while (i < levels.length) {
    if (levels[i] === 1) { i++; continue }
    if (i + n > levels.length) break
    let byte = 0, ones = 0
    for (let k = 0; k < 8; k++) { const v = levels[i + 1 + k]; byte |= v << k; ones += v }
    let pe = false
    if (c.parity !== 'none') { const p = levels[i + 9]; pe = c.parity === 'even' ? (ones + p) % 2 !== 0 : (ones + p) % 2 !== 1 }
    const stopAt = i + 9 + (c.parity !== 'none' ? 1 : 0)
    let fe = false
    for (let s = 0; s < c.stop; s++) if (levels[stopAt + s] !== 1) fe = true
    out.push({ byte, fe, pe })
    i += n
  }
  return out
}
/** BRR (OVER8 = 0): USARTDIV = f_ck / (16·baud), mantis 12 bit + kesir 4 bit. Gerçek baud ve hata. */
export function brr(fck: number, baud: number): { mantissa: number; fraction: number; reg: number; actual: number; errPct: number } {
  const div = fck / (16 * baud)
  let mantissa = Math.floor(div)
  let fraction = Math.round((div - mantissa) * 16)
  if (fraction === 16) { mantissa++; fraction = 0 }
  const actual = fck / (16 * (mantissa + fraction / 16))
  return { mantissa, fraction, reg: (mantissa << 4) | fraction, actual, errPct: ((actual - baud) / baud) * 100 }
}
/** Her iki uçtaki toplam saat hatası ±%2'yi (8N1 için kabaca) aşarsa çerçeveler bozulabilir. */
export const baudSafe = (errPct: number) => Math.abs(errPct) < 2
export const bitTimeUs = (baud: number) => 1e6 / baud
/** Saniyede kullanıcı baytı: 8N1'de çerçeve 10 bit. */
export const bytesPerSecond = (c: UartCfg) => c.baud / (1 + 8 + (c.parity !== 'none' ? 1 : 0) + c.stop)

// ---------- ADC + DMA ----------
/** 12 bit ADC: kod = V/Vref · 4096 (0..4095). */
export const adc12 = (v: number, vref = 3.3) => Math.max(0, Math.min(4095, Math.floor((v / vref) * 4096)))
export const codeToV = (code: number, vref = 3.3) => (code / 4096) * vref
/** Dönüşüm süresi: (örnekleme + 12) ADC saat çevrimi (STM32F4, 12 bit). */
export const SAMPLE_CYCLES = [3, 15, 28, 56, 84, 112, 144, 480] as const
export const convTimeUs = (sampleCycles: number, fAdcMHz: number, bits = 12) => (sampleCycles + bits) / fAdcMHz
/** Tarama kipinde n kanal: tam bir tur süresi ve kanal başına örnekleme hızı. */
export const scanRate = (channels: number, sampleCycles: number, fAdcMHz: number) => 1e6 / (channels * convTimeUs(sampleCycles, fAdcMHz))

export interface DmaEvent { t: number; kind: 'half' | 'full'; filled: number[] }
/**
 * Dairesel DMA: ADC her dönüşümde bir sonraki tampon hücresine yazar; NDTR sıfırlanınca başa döner. Yarıya gelince HT,
 * sona gelince TC kesmesi. İşlemci, DMA öbür yarıya yazarken bitmiş yarıyı işler (çift tampon). cpuMs > yarı süre ise
 * işlemci geri kalır ve veri ezilir (overrun): sonuçta raporlanır.
 */
export function simulateDma(samples: number[], bufLen: number, sampleUs: number, cpuUsPerHalf: number) {
  const buf = new Array<number>(bufLen).fill(0)
  const events: DmaEvent[] = []
  let busyUntil = 0, overruns = 0, processed = 0
  const half = bufLen / 2
  samples.forEach((s, k) => {
    const idx = k % bufLen
    buf[idx] = s
    const t = (k + 1) * sampleUs
    if (idx === half - 1 || idx === bufLen - 1) {
      const kind = idx === half - 1 ? 'half' : 'full'
      events.push({ t, kind, filled: kind === 'half' ? buf.slice(0, half) : buf.slice(half) })
      if (busyUntil > t) overruns++
      busyUntil = Math.max(busyUntil, t) + cpuUsPerHalf
      processed++
    }
  })
  const halfTimeUs = half * sampleUs
  return { buf, events, overruns, processed, halfTimeUs, cpuLoad: cpuUsPerHalf / halfTimeUs }
}
/** Hareketli ortalama: yarım tamponun ortalaması (gürültü azaltma). */
export const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
