// Sanal ölçüm (multimetre karşılığı) biçimleme: Türkçe ondalık virgül, işaretli değer. Saf.
import type { Measurement, PinSnapshot } from './contract'

const MINUS = '−'

function signed(n: number, digits: number): string {
  const s = Math.abs(n).toFixed(digits)
  const zero = Number(s) === 0
  return `${n < 0 && !zero ? MINUS : ''}${s.replace('.', ',')}`
}

export const formatVolts = (v: number): string => `${signed(v, 2)} V`

export function formatMilliamps(ma: number): string {
  const a = Math.abs(ma)
  return `${signed(ma, a < 1 ? 2 : a < 100 ? 1 : 0)} mA`
}

/** Akım yönü oku: + → (1. uçtan 2. uca), − ← ; sıfıra yakınsa boş. */
export const currentArrow = (ma: number): string => (Math.abs(ma) < 0.05 ? '' : ma > 0 ? '→' : '←')

export const MEASURE_HINT = 'Akım yönü 1. uçtan 2. uca'
export const MEASURE_NONE = 'Ölçülemiyor'
export const MEASURE_IDLE = 'Ölçmek için ▶’e bas'

/** "3,10 V · 8,6 mA →"; ölçüm yoksa ya da sonlu değilse null. */
export function formatMeasurement(m: Measurement | undefined | null): string | null {
  if (!m || !Number.isFinite(m.vAcross) || !Number.isFinite(m.currentMa)) return null
  const arrow = currentArrow(m.currentMa)
  return `${formatVolts(m.vAcross)} · ${formatMilliamps(m.currentMa)}${arrow ? ` ${arrow}` : ''}`
}

const MODE_TR: Record<PinSnapshot['mode'], string> = { out: 'çıkış', in: 'giriş', pullup: 'giriş (iç pull-up)' }
/** Uno pini üstüne gelince gösterilen balon metni. */
export const formatPinBalloon = (pin: string, s: PinSnapshot): string => `${pin}: ${formatVolts(s.volts)} · ${MODE_TR[s.mode]}`
