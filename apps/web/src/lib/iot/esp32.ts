// ESP32 (WROOM-32 DevKit) pin kuralları ve Wi-Fi bağlantı benzetimi. Saf mantık: pin planlayıcı ve Wi-Fi simülasyonu
// bunu kullanır. Kaynak: Espressif ESP32 veri sayfası ve donanım tasarım kılavuzundaki pin kısıtları (özgün özet).
import { rng } from '@/lib/ml/core'

export type PinUse = 'out' | 'in' | 'adc' | 'pwm' | 'sda' | 'scl' | 'dac' | 'touch'
export type Issue =
  | 'flash' | 'inputOnly' | 'noPull' | 'strap' | 'strap12' | 'adc2Wifi' | 'noAdc' | 'noDac' | 'noTouch' | 'uart0' | 'notI2cDefault' | 'noPin'

export const ESP32_PINS = [0, 1, 2, 3, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33, 34, 35, 36, 39] as const
const FLASH = [6, 7, 8, 9, 10, 11]
const INPUT_ONLY = [34, 35, 36, 39]
const STRAP = [0, 2, 5, 15]
const ADC1 = [32, 33, 34, 35, 36, 39]
const ADC2 = [0, 2, 4, 12, 13, 14, 15, 25, 26, 27]
const DAC = [25, 26]
const TOUCH = [0, 2, 4, 12, 13, 14, 15, 27, 32, 33]

export interface PinCheck { level: 'ok' | 'warn' | 'err'; issues: Issue[] }

/** Bir pini bir iş için kullanmanın sorunları. err: çalışmaz; warn: dikkatle çalışır. */
export function checkPin(pin: number, use: PinUse, wifi: boolean): PinCheck {
  const err: Issue[] = [], warn: Issue[] = []
  if (FLASH.includes(pin)) return { level: 'err', issues: ['flash'] }
  if (!(ESP32_PINS as readonly number[]).includes(pin)) return { level: 'err', issues: ['noPin'] }
  const outputish = use === 'out' || use === 'pwm' || use === 'sda' || use === 'scl' || use === 'dac'
  if (INPUT_ONLY.includes(pin) && outputish) err.push('inputOnly')
  if (INPUT_ONLY.includes(pin) && use === 'in') warn.push('noPull')
  if (use === 'adc') {
    if (ADC2.includes(pin)) { if (wifi) err.push('adc2Wifi') }
    else if (!ADC1.includes(pin)) err.push('noAdc')
  }
  if (use === 'dac' && !DAC.includes(pin)) err.push('noDac')
  if (use === 'touch' && !TOUCH.includes(pin)) err.push('noTouch')
  if (pin === 12) warn.push('strap12')
  else if (STRAP.includes(pin)) warn.push('strap')
  if (pin === 1 || pin === 3) warn.push('uart0')
  if ((use === 'sda' && pin !== 21) || (use === 'scl' && pin !== 22)) warn.push('notI2cDefault')
  return { level: err.length ? 'err' : warn.length ? 'warn' : 'ok', issues: [...err, ...warn] }
}

/** ADC ham değerinden gerilim (12 bit, 11 dB zayıflatma ≈ 0–3,1 V; doğrusal yaklaşım). */
export const adcToVolt = (raw: number, bits = 12, vref = 3.1): number => (raw / (2 ** bits - 1)) * vref

// --- Wi-Fi --------------------------------------------------------------------------------------------------------------

export type WifiState = 'connected' | 'connecting' | 'waiting' | 'noap'
/** Arduino WiFi.status() karşılıkları (eğitimde gösterilir). */
export const WL: Record<WifiState, string> = { connected: 'WL_CONNECTED', connecting: 'WL_IDLE_STATUS', waiting: 'WL_DISCONNECTED', noap: 'WL_NO_SSID_AVAIL' }

export interface WifiParams {
  /** Saniye cinsinden benzetim süresi. */
  horizon: number
  /** Erişim noktasının kapalı olduğu aralık [başlangıç, bitiş). */
  apDown: [number, number]
  /** Sinyal gücü (dBm); -85'in altında kopma olasılığı artar. */
  rssi: number
  strategy: 'fixed' | 'backoff'
  /** Sabit bekleme ya da geri çekilmenin ilk adımı (s). */
  base: number
  /** Geri çekilme üst sınırı (s). */
  cap: number
  /** Bir bağlanma denemesinin süresi (s). */
  connectS?: number
  seed?: number
}
export interface WifiResult { states: WifiState[]; dt: number; attempts: number; drops: number; downtime: number; recoverS: number }

/** Üstel geri çekilme: base, 2·base, 4·base… cap'te sabitlenir. */
export const backoff = (base: number, cap: number, k: number): number => Math.min(cap, base * 2 ** k)

/** Olasılıksal kopma: RSSI -70 dBm üstünde ihmal edilir, -90'da saniyede ~%4. */
export const dropRate = (rssi: number): number => rssi >= -70 ? 0 : Math.min(0.08, 0.002 * Math.exp((-70 - rssi) / 6.7))

export function simulateWifi(p: WifiParams): WifiResult {
  const dt = 0.1, steps = Math.round(p.horizon / dt), connectS = p.connectS ?? 2
  const r = rng(p.seed ?? 5)
  const states: WifiState[] = []
  let st: WifiState = 'connecting', timer = connectS, k = 0, attempts = 1, drops = 0, down = 0, recoverAt = -1
  for (let i = 0; i < steps; i++) {
    const t = i * dt
    const apUp = !(t >= p.apDown[0] && t < p.apDown[1])
    if (st === 'connected') {
      if (!apUp || r() < dropRate(p.rssi) * dt) { st = 'waiting'; drops++; timer = p.strategy === 'fixed' ? p.base : backoff(p.base, p.cap, 0); k = 0 }
    } else {
      timer -= dt
      if (timer <= 0) {
        if (st === 'connecting' || st === 'noap') {
          // Deneme bitti: AP varsa ve zayıf sinyal şansı yaver giderse bağlanır
          if (apUp && r() > dropRate(p.rssi) * 5) { st = 'connected'; k = 0; if (recoverAt < 0 && t >= p.apDown[1]) recoverAt = t }
          else { st = 'waiting'; k++; timer = p.strategy === 'fixed' ? p.base : backoff(p.base, p.cap, k) }
        } else { st = apUp ? 'connecting' : 'noap'; timer = connectS; attempts++ }
      }
    }
    if (st !== 'connected') down += dt
    states.push(st)
  }
  return { states, dt, attempts, drops, downtime: Math.round(down * 10) / 10, recoverS: recoverAt < 0 ? Infinity : Math.round((recoverAt - p.apDown[1]) * 10) / 10 }
}
