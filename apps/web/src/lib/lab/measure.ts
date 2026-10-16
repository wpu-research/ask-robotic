// Sanal ölçüm (multimetre karşılığı) biçimleme: Türkçe ondalık virgül, işaretli değer. Saf.
import type { Locale } from '@/i18n'
import type { Measurement, PinSnapshot } from './contract'

const MINUS = '−'

function signed(n: number, digits: number, locale: Locale): string {
  const s = Math.abs(n).toFixed(digits)
  const zero = Number(s) === 0
  return `${n < 0 && !zero ? MINUS : ''}${locale === 'tr' ? s.replace('.', ',') : s}`
}

/** `locale`: ondalık ayırıcı (tr virgül, en nokta). */
export const formatVolts = (v: number, locale: Locale = 'tr'): string => `${signed(v, 2, locale)} V`

export function formatMilliamps(ma: number, locale: Locale = 'tr'): string {
  const a = Math.abs(ma)
  return `${signed(ma, a < 1 ? 2 : a < 100 ? 1 : 0, locale)} mA`
}

/** Akım yönü oku: + → (1. uçtan 2. uca), − ← ; sıfıra yakınsa boş. */
export const currentArrow = (ma: number): string => (Math.abs(ma) < 0.05 ? '' : ma > 0 ? '→' : '←')

export const MEASURE_HINT = 'Akım yönü 1. uçtan 2. uca'
export const MEASURE_NONE = 'Ölçülemiyor'
export const MEASURE_IDLE = 'Ölçmek için ▶’e bas'

/** "3,10 V · 8,6 mA →"; ölçüm yoksa ya da sonlu değilse null. */
export function formatMeasurement(m: Measurement | undefined | null, locale: Locale = 'tr'): string | null {
  if (!m || !Number.isFinite(m.vAcross) || !Number.isFinite(m.currentMa)) return null
  const arrow = currentArrow(m.currentMa)
  return `${formatVolts(m.vAcross, locale)} · ${formatMilliamps(m.currentMa, locale)}${arrow ? ` ${arrow}` : ''}`
}

const MODE_TR: Record<PinSnapshot['mode'], string> = { out: 'çıkış', in: 'giriş', pullup: 'giriş (iç pull-up)' }
/** Uno pini üstüne gelince gösterilen balon metni. `mode`: çevrilmiş kip adı (verilmezse Türkçe). */
export const formatPinBalloon = (pin: string, s: PinSnapshot, locale: Locale = 'tr', mode?: string): string =>
  `${pin}: ${formatVolts(s.volts, locale)} · ${mode ?? MODE_TR[s.mode]}`
