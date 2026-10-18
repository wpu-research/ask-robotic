// Ders: ikili arama. Kızılötesi mesafe sensörünün kalibrasyon tablosu artan ADC okumalarıyla sıralı; robot bir okumanın satırını
// arar. Her karşılaştırma aralığın yarısını eler: n satırda en çok ⌈log2(n+1)⌉ adım; doğrusal arama ise satır satır yürür.
import { cap, rng, type Frame, type Lesson } from './core'

export interface BinFrame extends Frame {
  /** Kalibrasyon tablosu (64 satır, paylaşılan); yalnız ilk n satır kullanılır. */
  a: number[]
  n: number
  x: number
  lo?: number
  hi?: number
  mid?: number
  /** Doğrusal aramanın baktığı son satır. */
  lin?: number
  /** Şimdiye kadarki karşılaştırma sayıları. */
  bs: number
  ls: number
  /** Sonuç: ekleme noktası (bisect_left) ve tam eşleşme. */
  res?: number
  found?: boolean
}

/** 64 satırlık artan ADC tablosu: her satır öncekinden 4–25 birim büyük. */
export function calibTable(seed = 7): number[] {
  const r = rng(seed)
  let v = 0
  return Array.from({ length: 64 }, () => (v += 4 + Math.floor(r() * 22)))
}
export const TABLE = calibTable()

export interface BisectStep { lo: number; hi: number; mid: number; less: boolean }
/** bisect_left: a[0..n) içinde x'in ekleme noktası; her adımın lo/mid/hi değerleri. */
export function bisect(a: readonly number[], n: number, x: number) {
  let lo = 0, hi = n
  const steps: BisectStep[] = []
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    const less = a[mid] < x
    steps.push({ lo, hi, mid, less })
    if (less) lo = mid + 1
    else hi = mid
  }
  return { lo, steps, found: lo < n && a[lo] === x }
}
/** Doğrusal arama: a[i] ≥ x olan ilk satıra kadar kaç karşılaştırma (hiç yoksa n). */
export function linearComps(a: readonly number[], n: number, x: number): number {
  for (let i = 0; i < n; i++) if (a[i] >= x) return i + 1
  return n
}
export const bound = (n: number) => Math.ceil(Math.log2(n + 1))

export const IKILI_ARAMA: Lesson<BinFrame> = {
  slug: 'ikili-arama',
  n: 0,
  title: { tr: 'İkili arama', en: 'Binary search' },
  sub: { tr: 'Sıralı kalibrasyon tablosunda her adımda yarıyı elemek', en: 'Halving a sorted calibration table at every step' },
  story: {
    tr: "Robotun kızılötesi mesafe sensörü için 64 satırlık bir kalibrasyon tablosu var: her satırda bir ADC okuması (artan sırada) ve ona karşılık gelen mesafe. Sensör saniyede 100 kez okuma verir; her okumada robot tablodaki doğru satırı bulup mesafeyi oradan hesaplamalı. Satır satır aramak mı, ortadan bölmek mi?",
    en: 'The robot has a 64-row calibration table for its infrared distance sensor: each row holds an ADC reading (in increasing order) and its distance. The sensor reports 100 readings per second, and for each one the robot must find the right row and read the distance from it. Walk row by row, or cut in the middle?',
  },
  how: [
    { tr: 'Aralık [lo, hi) bütün tabloyla başlar. Ortadaki satıra (mid) bakılır.', en: 'The range [lo, hi) starts as the whole table. We look at the middle row (mid).' },
    { tr: "Ortadaki değer aranandan küçükse aranan sağ yarıdadır (lo = mid + 1); değilse sol yarıdadır (hi = mid). Öbür yarı bir daha hiç okunmaz.", en: 'If the middle value is smaller than the target, the target is in the right half (lo = mid + 1); otherwise in the left half (hi = mid). The other half is never read again.' },
    { tr: "Her adım aralığı yarıya indirir: n satırda en çok ⌈log2(n+1)⌉ adım. 64 satır 7 adımda biter; doğrusal arama ortalama 32 satıra bakar.", en: 'Every step halves the range: at most ⌈log2(n+1)⌉ steps for n rows. 64 rows take 7 steps; a linear scan looks at 32 rows on average.' },
    { tr: "Değer tabloda yoksa lo, onun sokulacağı yeri (ekleme noktasını) verir; robot iki komşu satır arasında ara değer bulur. Python'daki bisect modülü tam olarak budur.", en: "If the value is not in the table, lo is where it would be inserted; the robot interpolates between the two neighbouring rows. Python's bisect module is exactly this." },
    { tr: 'Şunu dene: dizi boyunu 8’den 64’e çıkar; doğrusal sayaç 8 kat büyürken ikili sayaç yalnız 3 adım artar.', en: 'Try this: raise the table size from 8 to 64; the linear counter grows eightfold while the binary one grows by only 3 steps.' },
  ],
  why: {
    tr: "Sıralı veride arama her yerde: sensör kalibrasyon tabloları, zaman damgalı kayıtlarda belirli bir ana gitmek, veritabanı indeksleri, git bisect ile hatalı commit'i bulmak. Robotun kontrol döngüsünde milisaniyeler sayılır; log2(n) adım, tablo büyüse de süreyi neredeyse sabit tutar.",
    en: 'Searching sorted data is everywhere: sensor calibration tables, jumping to a moment in time-stamped logs, database indexes, finding the bad commit with git bisect. In a robot control loop milliseconds count; log2(n) steps keep the time almost constant even as the table grows.',
  },
  file: 'ikili_arama.py',
  code: [
    ['import numpy as np'],
    ['rng = np.random.default_rng(7)'],
    ['n = 32', 'tablo boyu', 'table size'],
    ['adc = np.cumsum(rng.integers(4, 26, n))', 'artan ADC tablosu', 'increasing ADC table'],
    ['x = int(adc[21])', 'aranan okuma', 'reading to find'],
    ['lo, hi, steps = 0, n, 0', 'aralık [lo, hi)', 'range [lo, hi)'],
    ['while lo < hi:'],
    ['    mid = (lo + hi) // 2', 'ortadaki satır', 'middle row'],
    ['    steps += 1'],
    ['    if adc[mid] < x:', 'tek karşılaştırma', 'one comparison'],
    ['        lo = mid + 1', 'sol yarıyı ele', 'drop the left half'],
    ['    else:'],
    ['        hi = mid', 'sağ yarıyı ele', 'drop the right half'],
    ['found = lo < n and adc[lo] == x'],
    ['lin = next((i + 1 for i in range(n) if adc[i] >= x), n)', 'doğrusal arama', 'linear search'],
    ['print("satır", lo, "bulundu", found)'],
    ['print("ikili", steps, "doğrusal", lin)'],
    ['print("sınır", int(np.ceil(np.log2(n + 1))))', '⌈log2(n+1)⌉'],
  ],
  params: [
    { key: 'x', label: { tr: 'Aranan değer (ADC)', en: 'Target value (ADC)' }, min: 0, max: 1000, step: 1, value: TABLE[21] },
    { key: 'n', label: { tr: 'Dizi boyu', en: 'Array size' }, min: 4, max: 64, step: 1, value: 32 },
  ],
  run({ x = TABLE[21], n = 32 }) {
    n = Math.max(1, Math.min(64, Math.round(n)))
    x = Math.round(x)
    const a = TABLE
    const b = bisect(a, n, x)
    const L = linearComps(a, n, x)
    const base = { a, n, x }
    const F: BinFrame[] = []
    const stat = cap(`${n} satır · sınır ⌈log2(${n}+1)⌉ = ${bound(n)} adım`, `${n} rows · bound ⌈log2(${n}+1)⌉ = ${bound(n)} steps`)
    F.push({ ...base, bs: 0, ls: 0, line: 3, cap: cap(`${n} satırlık sıralı kalibrasyon tablosu`, `a sorted ${n}-row calibration table`), stat, hold: 2 })
    F.push({ ...base, bs: 0, ls: 0, line: 4, cap: cap(`aranan ADC okuması: ${x}`, `ADC reading to find: ${x}`), stat, hold: 1.5 })
    F.push({ ...base, lo: 0, hi: n, bs: 0, ls: 0, line: 5, cap: cap(`aralık [0, ${n}): bütün tablo`, `range [0, ${n}): the whole table`), stat, hold: 1.2 })
    b.steps.forEach((s, k) => {
      const nlo = s.less ? s.mid + 1 : s.lo, nhi = s.less ? s.hi : s.mid
      const c = cap(`adım ${k + 1}: adc[${s.mid}] = ${a[s.mid]} ${s.less ? '<' : '≥'} ${x}`, `step ${k + 1}: adc[${s.mid}] = ${a[s.mid]} ${s.less ? '<' : '≥'} ${x}`)
      const left = cap(`kalan aralık: ${nhi - nlo} satır`, `remaining range: ${nhi - nlo} rows`)
      if (k < 2) {
        F.push({ ...base, lo: s.lo, hi: s.hi, mid: s.mid, bs: k, ls: 0, line: 7, cap: cap(`mid = (${s.lo} + ${s.hi}) // 2 = ${s.mid}`, `mid = (${s.lo} + ${s.hi}) // 2 = ${s.mid}`), stat, hold: 1.2 })
        F.push({ ...base, lo: s.lo, hi: s.hi, mid: s.mid, bs: k + 1, ls: 0, line: 9, cap: c, stat, hold: 1.4 })
      } else F.push({ ...base, lo: s.lo, hi: s.hi, mid: s.mid, bs: k + 1, ls: 0, line: 9, cap: c, stat, hold: 1 })
      F.push({ ...base, lo: nlo, hi: nhi, mid: s.mid, bs: k + 1, ls: 0, line: s.less ? 10 : 12, cap: c, stat: left, hold: k < 2 ? 1.4 : 0.9 })
    })
    const bs = b.steps.length
    const res = cap(b.found ? `bulundu: satır ${b.lo}, ${bs} karşılaştırma` : `tabloda yok: ekleme noktası ${b.lo} (${bs} karşılaştırma)`,
      b.found ? `found: row ${b.lo}, ${bs} comparisons` : `not in the table: insertion point ${b.lo} (${bs} comparisons)`)
    F.push({ ...base, lo: b.lo, hi: b.lo, bs, ls: 0, res: b.lo, found: b.found, line: 13, cap: res, stat, hold: 2 })
    for (let i = 0; i < L; i++) {
      F.push({ ...base, lin: i, bs, ls: i + 1, res: b.lo, found: b.found, line: 14, cap: cap(`doğrusal arama: adc[${i}] = ${a[i]}`, `linear search: adc[${i}] = ${a[i]}`), stat, hold: i < 3 ? 0.8 : 0.22 })
    }
    F.push({
      ...base, lin: L - 1, bs, ls: L, res: b.lo, found: b.found, line: 16,
      cap: cap(`ikili ${bs} karşılaştırma · doğrusal ${L}`, `binary ${bs} comparisons · linear ${L}`),
      stat: cap(`sınır ⌈log2(${n}+1)⌉ = ${bound(n)} · doğrusal en kötü ${n}`, `bound ⌈log2(${n}+1)⌉ = ${bound(n)} · linear worst case ${n}`),
      hold: 3,
    })
    return F
  },
}
