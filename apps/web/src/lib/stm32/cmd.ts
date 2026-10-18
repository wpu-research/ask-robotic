// Bitirme projesinin UART komut arayüzü: satır tabanlı, büyük/küçük harf duyarsız, her komut tek satır yanıt verir.
// Gömülü C sürümü (lib/stm32/code.ts capstoneParser) ile aynı sözleşme; UART simülasyonunun "Komut" sekmesi bunu çalıştırır.
import { ccrFor, solvePwm } from './periph'

export interface MotorState { duty: number; dir: 'F' | 'R'; freq: number; running: boolean; arr: number; psc: number; ccr: number; faults: number }
export const TIM_HZ = 84_000_000
export const newMotor = (): MotorState => ({ duty: 0, dir: 'F', freq: 20_000, running: false, arr: 4199, psc: 0, ccr: 0, faults: 0 })
export const MAX_LINE = 32

const withTimer = (s: MotorState): MotorState => ({ ...s, ccr: s.running ? ccrFor(s.duty / 100, s.arr) : 0 })

/** Bir satırı işler: yeni durum ve yanıt. Hatalı komut ERR ile başlar ve durumu değiştirmez (bilinmeyen komut yalnız hata sayacını artırır). */
export function command(s: MotorState, raw: string): { state: MotorState; reply: string } {
  const line = raw.trim()
  if (line.length > MAX_LINE) return { state: s, reply: 'ERR line too long' }
  const [cmd = '', arg, extra] = line.toUpperCase().split(/\s+/)
  if (extra !== undefined) return { state: s, reply: 'ERR too many arguments' }
  const num = (v: string | undefined) => (v !== undefined && /^\d+$/.test(v) ? Number(v) : NaN)
  switch (cmd) {
    case 'HELP': return { state: s, reply: 'OK PWM <0-100> | DIR F|R | FREQ <100-50000> | START | STOP | STATUS' }
    case 'PWM': {
      const d = num(arg)
      if (!(d >= 0 && d <= 100)) return { state: s, reply: 'ERR PWM expects 0-100' }
      const n = withTimer({ ...s, duty: d })
      return { state: n, reply: `OK PWM ${d} CCR ${n.ccr}` }
    }
    case 'DIR': {
      if (arg !== 'F' && arg !== 'R') return { state: s, reply: 'ERR DIR expects F or R' }
      // Dönerken yön değiştirmek akım sıçratır: önce dur
      if (s.running && s.duty > 0 && arg !== s.dir) return { state: s, reply: 'ERR stop before reversing' }
      return { state: { ...s, dir: arg }, reply: `OK DIR ${arg}` }
    }
    case 'FREQ': {
      const f = num(arg)
      if (!(f >= 100 && f <= 50_000)) return { state: s, reply: 'ERR FREQ expects 100-50000' }
      const p = solvePwm(TIM_HZ, f)!
      const n = withTimer({ ...s, freq: f, psc: p.psc, arr: p.arr })
      return { state: n, reply: `OK FREQ ${f} PSC ${p.psc} ARR ${p.arr}` }
    }
    case 'START': { const n = withTimer({ ...s, running: true }); return { state: n, reply: `OK START CCR ${n.ccr}` } }
    case 'STOP': return { state: withTimer({ ...s, running: false }), reply: 'OK STOP' }
    case 'STATUS': return { state: s, reply: `OK ${s.running ? 'RUN' : 'IDLE'} PWM ${s.duty} DIR ${s.dir} FREQ ${s.freq}` }
    case '': return { state: s, reply: '' }
    default: return { state: { ...s, faults: s.faults + 1 }, reply: `ERR unknown command ${cmd}` }
  }
}
