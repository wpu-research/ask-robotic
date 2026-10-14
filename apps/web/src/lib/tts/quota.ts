// /api/tts maliyet sınırları: günlük karakter kotası (bellek içi, tek sunucu örneği; Türkiye günü).
import { dayStart } from '@/lib/tutor/limits'

export const TTS_MAX_CHARS = 1200
export const TTS_DEVICE_DAILY = 40_000
export const TTS_IP_DAILY = 400_000
export const siteDailyChars = () => Number(process.env.TTS_DAILY_CHAR_LIMIT) || 2_000_000

const used = new Map<string, { day: number; n: number }>()
/** Günlük karakter kotası: sığarsa düşer ve true. */
export function spendChars(key: string, chars: number, max: number, now: Date) {
  const day = dayStart(now).getTime()
  const cur = used.get(key)
  const n = cur && cur.day === day ? cur.n : 0
  if (n + chars > max) return false
  used.set(key, { day, n: n + chars })
  if (used.size > 50_000) for (const [k, v] of used) if (v.day !== day) used.delete(k)
  return true
}
export const refundChars = (key: string, chars: number) => { const cur = used.get(key); if (cur) cur.n = Math.max(0, cur.n - chars) }
/** Yalnız testler için. */
export function resetTtsQuota() { used.clear() }

