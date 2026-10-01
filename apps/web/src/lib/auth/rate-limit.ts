// Bellek içi, tek sunucu örneği için. Birden fazla örneğe çıkılırsa DB/Redis'e taşınmalı.
const hits = new Map<string, number[]>()

export function rateLimited(key: string, max = 5, windowMs = 15 * 60 * 1000, now = Date.now()) {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  if (recent.length >= max) {
    hits.set(key, recent)
    return true
  }
  recent.push(now)
  hits.set(key, recent)
  return false
}
