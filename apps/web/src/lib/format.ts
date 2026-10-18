/** Süre etiketi: 60 dk altı "45 dk", üstü "12 saat". */
// Unvanlar (Dr., Prof., Doç., Öğr. Gör. ...) selamlamada ad sayılmaz
const TITLE = /^(dr|prof|doç|doc|öğr|ogr|gör|gor|arş|ars|asst|assoc|uzm|av|müh|muh|mr|mrs|ms)\.?$/i

/** Selamlama için ilk ad: "Dr. Murat Arslan" → "Murat". Yalnız unvan varsa olduğu gibi döner. */
export function firstName(name: string | null | undefined): string | undefined {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)
  return parts.find((p) => !TITLE.test(p)) ?? parts[0]
}

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
