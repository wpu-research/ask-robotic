// 3B geliştirme kartı sahnesinin saf mantığı: GPIOA yazmaçları + saat → başlıktaki pin seviyeleri ve LD2 (PA5);
// TIM3 PWM (PSC/ARR/CCR) → motor sürücüsüne giden ortalama gerilim → birinci dereceden motor hızı ve rotor açısı;
// zamanlayıcı çıkışının dalga biçimi (sahnede 3B şerit). 3B bileşen (components/gomulu/scene3d-stm32.tsx) yalnız çizer.
import { pinLevel, type GpioRegs } from './core'
import { pwmDuty, pwmFreq, pwmOut } from './periph'

export interface Board3DIn { regs: GpioRegs; clockOn: boolean; psc: number; arr: number; ccr: number; fTim: number; pwmOn: boolean; dirFwd: boolean }
export interface Board3DView { levels: Array<0 | 1 | 'float'>; led: boolean; duty: number; freq: number; volts: number; audible: boolean }

export const VM = 6 // motor kaynağı (V); TB6612FNG kaybı küçük, ihmal
export const KV_RPM = 30 // rpm / V (ders motoru, yüksüz)
export const TAU = 0.25 // s

export function boardView(i: Board3DIn): Board3DView {
  const levels = Array.from({ length: 16 }, (_, pin) => (i.clockOn ? pinLevel(i.regs, pin, null) : 'float'))
  const duty = i.pwmOn ? pwmDuty({ arr: i.arr, ccr: i.ccr }) : 0
  const freq = pwmFreq({ fTim: i.fTim, psc: i.psc, arr: i.arr })
  return { levels, led: levels[5] === 1, duty, freq, volts: (i.dirFwd ? 1 : -1) * duty * VM, audible: i.pwmOn && duty > 0 && freq < 18_000 && freq > 20 }
}
/** Motor hızı (rpm) birinci dereceden yaklaşır; açı radyan. */
export function motorStep(m: { rpm: number; angle: number }, volts: number, dt: number) {
  const target = KV_RPM * volts
  const rpm = target + (m.rpm - target) * Math.exp(-dt / TAU)
  return { rpm, angle: (m.angle + (rpm / 60) * 2 * Math.PI * dt) % (2 * Math.PI) }
}
/** Gösterim için zamanlayıcı çıkışı: n periyot, periyot başına s örnek (CNT ile CCR karşılaştırması). */
export function waveform(arr: number, ccr: number, periods = 3, s = 40): Array<0 | 1> {
  const out: Array<0 | 1> = []
  for (let k = 0; k < periods * s; k++) out.push(pwmOut(((k % s) / s) * (arr + 1), ccr) as 0 | 1)
  return out
}
