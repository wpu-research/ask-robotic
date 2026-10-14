// Robi günlük mesaj kotası. Bellek içi sayaç (tek sunucu örneği) + kullanıcılar için DB sayımı (yeniden başlatmaya dayanıklı).
// Gün sınırı Türkiye günüdür (UTC+3).
export const GUEST_DAILY = 15
export const USER_DAILY = 60
/** Cihaz kimliği kolayca yenilenebildiği için misafirlere ayrıca IP başına günlük tavan. */
export const GUEST_IP_DAILY = 60

const OFFSET = 3 * 60 * 60 * 1000
/** Türkiye günü başlangıcı (UTC). */
export function dayStart(now: Date): Date {
  const local = new Date(now.getTime() + OFFSET)
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - OFFSET)
}

const counts = new Map<string, { day: number; n: number }>()

export interface QuotaResult { ok: boolean; used: number; remaining: number }

/**
 * Kotayı yoklar ve uygunsa bir harcar. `dbUsed`: kalıcı kayıttan bugünkü sayım (biliniyorsa); bellek sayacıyla büyüğü geçerli.
 */
export function takeDaily(key: string, max: number, now = new Date(), dbUsed = 0): QuotaResult {
  const day = dayStart(now).getTime()
  const cur = counts.get(key)
  const mem = cur && cur.day === day ? cur.n : 0
  const used = Math.max(mem, dbUsed)
  if (used >= max) return { ok: false, used, remaining: 0 }
  counts.set(key, { day, n: used + 1 })
  if (counts.size > 50_000) for (const [k, v] of counts) if (v.day !== day) counts.delete(k)
  return { ok: true, used: used + 1, remaining: max - used - 1 }
}

/** Başarısız (ör. API hatası) bir isteğin harcadığı hakkı geri verir. */
export function refundDaily(key: string, now = new Date()) {
  const cur = counts.get(key)
  if (cur && cur.day === dayStart(now).getTime() && cur.n > 0) cur.n--
}

/** Yalnız testler için. */
export function resetDailyCounts() { counts.clear() }
