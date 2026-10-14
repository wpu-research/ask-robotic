// Toplu öğrenci listesi ayrıştırma ve kullanıcı adı üretimi (saf). DB tarafı: classroom.ts → addStudents.

export interface RosterName { first: string; last: string }

export const MAX_ROSTER = 200
const MAX_PART = 40

const TR: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', i̇: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' }

/** Türkçe harfleri sadeleştirip [a-z0-9] bırakır. */
export function asciiSlug(s: string): string {
  return s
    .toLocaleLowerCase('tr')
    .replace(/[çğıöşüâîû]/g, (c) => TR[c] ?? c)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '')
}

const clean = (s: string) => s.replace(/\s+/g, ' ').trim().slice(0, MAX_PART)

/**
 * Satır başına bir öğrenci. "ad,soyad" (CSV; noktalı virgül ve sekme de olur) ya da "Ad Soyad"
 * (son kelime soyad). "ad,soyad" başlık satırı ve boş satırlar atlanır.
 */
export function parseRoster(text: string): RosterName[] {
  const out: RosterName[] = []
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) continue
    let first: string
    let last: string
    if (/[,;\t]/.test(line)) {
      const [a = '', b = ''] = line.split(/[,;\t]/).map((x) => x.replace(/^"|"$/g, ''))
      first = clean(a); last = clean(b)
      if (/^(ad|isim|adı)$/i.test(first) && /^(soyad|soyadı|soyadi)$/i.test(last)) continue
    } else {
      const parts = clean(line).split(' ')
      last = parts.length > 1 ? parts.pop()! : ''
      first = parts.join(' ')
    }
    if (!asciiSlug(first)) continue
    out.push({ first, last })
  }
  return out
}

/** Sınıf adından kullanıcı adı soneki: "7-B" → "7b". */
export const classSuffix = (className: string) => asciiSlug(className).slice(0, 8) || 'sinif'

/** "ada.k-7b"; alınmışsa "ada.k2-7b", "ada.k3-7b"… `taken` güncellenir. */
export function makeUsername(n: RosterName, suffix: string, taken: Set<string>): string {
  const first = asciiSlug(n.first.split(' ')[0]).slice(0, 16) || 'ogrenci'
  const ini = asciiSlug(n.last).slice(0, 1)
  const base = ini ? `${first}.${ini}` : first
  for (let i = 1; ; i++) {
    const u = `${base}${i === 1 ? '' : i}-${suffix}`
    if (!taken.has(u)) { taken.add(u); return u }
  }
}

export const fullName = (n: RosterName) => (n.last ? `${n.first} ${n.last}` : n.first)

/** Lig ve diğer öğrencilere görünen ad: "Ada K." (soyadın yalnız baş harfi). */
export function shortName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length <= 1) return parts[0] ?? '?'
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toLocaleUpperCase('tr')}.`
}
