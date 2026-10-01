/** Süre etiketi: 60 dk altı "45 dk", üstü "12 saat". */
export const hoursLabel = (min: number) => (min >= 60 ? `${Math.round(min / 60)} saat` : `${min} dk`)

/** Göreli zaman: "az önce", "5 dk önce", "dün", "3 gün önce". */
export function timeAgo(at: number, now: number = Date.now()): string {
  const s = Math.max(0, Math.round((now - at) / 1000))
  if (s < 60) return 'az önce'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} dk önce`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} sa önce`
  const d = Math.floor(h / 24)
  if (d === 1) return 'dün'
  if (d < 30) return `${d} gün önce`
  return new Date(at).toLocaleDateString('tr-TR')
}
