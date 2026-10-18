// Ders: sıralama algoritmaları. Sonar mesafe okumaları aynı dizide üç yolla sıralanır: ekleme (~n²/4 karşılaştırma),
// birleştirme (~n log2 n) ve LSD taban (radix: hiç karşılaştırma yok, rakam rakam kovalara dağıtma). Timsort'un fikri sonda.
import { cap, rng, type Frame, type Lesson } from './core'

export interface SortFrame extends Frame {
  arr: number[]
  algo: number
  /** Karşılaştırılan iki konum ve az önce yazılan konum(lar). */
  cmp?: [number, number]
  wr?: number[]
  comps: number
  writes: number
  /** Birleştirmede işlenen aralık [lo, hi); eklemede sıralı önek uzunluğu. */
  range?: [number, number]
  sortedTo?: number
  /** Taban sıralamasında geçerli basamak (1, 10, 100). */
  digit?: number
  done?: boolean
  /** Sonuç karesinde üç algoritmanın sayaçları (aynı dizi). */
  table?: Array<{ comps: number; writes: number }>
  runs?: number
}

/** n sonar okuması (cm, 20–399), sabit tohumlu. */
export function sonar(n: number, seed = 5): number[] {
  const r = rng(seed)
  return Array.from({ length: n }, () => 20 + Math.floor(r() * 380))
}

interface Ev { arr: number[]; line: number; cmp?: [number, number]; wr?: number[]; comps: number; writes: number; range?: [number, number]; sortedTo?: number; digit?: number }

/** Ekleme sıralaması (komşu takası): her karşılaştırma ve takas bir olay. */
export function insertionTrace(a0: readonly number[]) {
  const a = a0.slice(), ev: Ev[] = []
  let comps = 0, writes = 0
  for (let i = 1; i < a.length; i++) {
    for (let j = i; j > 0; j--) {
      comps++
      ev.push({ arr: a.slice(), line: 7, cmp: [j - 1, j], comps, writes, sortedTo: i })
      if (a[j - 1] <= a[j]) break
      ;[a[j - 1], a[j]] = [a[j], a[j - 1]]
      writes += 2
      ev.push({ arr: a.slice(), line: 8, wr: [j - 1, j], comps, writes, sortedTo: i })
    }
  }
  return { a, ev, comps, writes }
}

/** Yukarıdan aşağı birleştirme: her karşılaştırma ve her yazma bir olay. */
export function mergeTrace(a0: readonly number[]) {
  const a = a0.slice(), ev: Ev[] = []
  let comps = 0, writes = 0
  const rec = (lo: number, hi: number) => {
    if (hi - lo < 2) return
    const h = (lo + hi) >> 1
    rec(lo, h); rec(h, hi)
    const L = a.slice(lo, h), R = a.slice(h, hi)
    let i = 0, j = 0, k = lo
    while (i < L.length && j < R.length) {
      comps++
      ev.push({ arr: a.slice(), line: 15, cmp: [lo + i, h + j], comps, writes, range: [lo, hi] })
      a[k] = L[i] <= R[j] ? L[i++] : R[j++]
      writes++
      ev.push({ arr: a.slice(), line: 16, wr: [k], comps, writes, range: [lo, hi] })
      k++
    }
    while (i < L.length) { a[k] = L[i++]; writes++; ev.push({ arr: a.slice(), line: 17, wr: [k], comps, writes, range: [lo, hi] }); k++ }
    while (j < R.length) { a[k] = R[j++]; writes++; ev.push({ arr: a.slice(), line: 17, wr: [k], comps, writes, range: [lo, hi] }); k++ }
  }
  rec(0, a.length)
  return { a, ev, comps, writes }
}

/** LSD taban sıralaması (taban 10, üç basamak): her geçişte kovalara dağıt (n yazma), sonra sırayla geri yaz (n yazma). */
export function radixTrace(a0: readonly number[]) {
  let a = a0.slice()
  const ev: Ev[] = []
  let writes = 0
  for (const d of [1, 10, 100]) {
    const out: number[] = []
    for (let k = 0; k < 10; k++) for (const v of a) if (Math.floor(v / d) % 10 === k) out.push(v)
    writes += a.length
    ev.push({ arr: a.slice(), line: 20, comps: 0, writes, digit: d })
    const b = a.slice()
    for (let i = 0; i < out.length; i++) {
      b[i] = out[i]; writes++
      ev.push({ arr: b.slice(), line: 20, wr: [i], comps: 0, writes, digit: d })
    }
    a = b
  }
  return { a, ev, comps: 0, writes }
}

/** Doğal artan parçaların sayısı (Timsort bunları bulup birleştirir). */
export function naturalRuns(a: readonly number[]): number {
  let r = a.length ? 1 : 0
  for (let i = 1; i < a.length; i++) if (a[i] < a[i - 1]) r++
  return r
}

const NAMES = [cap('ekleme sıralaması', 'insertion sort'), cap('birleştirme sıralaması', 'merge sort'), cap('LSD taban (radix) sıralaması', 'LSD radix sort')]

export const SIRALAMA: Lesson<SortFrame> = {
  slug: 'siralama-algoritmalari',
  n: 0,
  title: { tr: 'Sıralama algoritmaları', en: 'Sorting algorithms' },
  sub: { tr: 'Ekleme, birleştirme ve taban sıralaması aynı sonar okumalarında', en: 'Insertion, merge and radix sort on the same sonar readings' },
  story: {
    tr: "Robotun önündeki sonar, bir tarama boyunca 24 mesafe okuması (20–399 cm) verdi. Ortanca mesafeyi ve en yakın 3 engeli bulmak için okumaları sıralamak gerekiyor. Aynı diziyi üç farklı algoritmayla sıralayıp kaç karşılaştırma ve kaç yazma yaptıklarını sayıyoruz.",
    en: "The robot's front sonar returned 24 distance readings (20–399 cm) in one sweep. To find the median distance and the 3 nearest obstacles we must sort them. We sort the same array with three algorithms and count their comparisons and writes.",
  },
  how: [
    { tr: 'Ekleme: soldaki kısım hep sıralıdır; yeni eleman, kendinden büyük komşusuyla yer değiştirerek yerine kayar. Rastgele dizide yaklaşık n²/4 karşılaştırma; neredeyse sıralı dizide yaklaşık n.', en: 'Insertion: the left part is always sorted; each new element swaps past larger neighbours into place. About n²/4 comparisons on random data, about n on nearly sorted data.' },
    { tr: 'Birleştirme: diziyi ikiye böl, her yarıyı sırala, iki sıralı yarıyı baştan karşılaştırarak birleştir. Her düzeyde en çok n karşılaştırma, log2 n düzey: ~n log2 n.', en: 'Merge: split in two, sort each half, merge the two sorted halves by comparing their fronts. At most n comparisons per level, log2 n levels: ~n log2 n.' },
    { tr: 'LSD taban: hiç karşılaştırmaz. Önce birler basamağına, sonra onlar, sonra yüzler basamağına göre kararlı biçimde kovalara dağıtır; 3 geçişte biter (n + aralık işi).', en: 'LSD radix: never compares. It distributes stably into buckets by the ones digit, then tens, then hundreds; three passes finish the job (n + range work).' },
    { tr: "Timsort (Python'un sorted'ı) gerçek veride hazır gelen artan parçaları bulur, kısa parçaları eklemeyle uzatır ve parçaları birleştirmeyle birleştirir: sıralı veride n, en kötü durumda n log n.", en: "Timsort (Python's sorted) finds the ascending runs already present in real data, extends short runs with insertion sort and merges runs with merge sort: n on sorted data, n log n in the worst case." },
    { tr: 'Şunu dene: dizi boyunu 12’den 48’e çıkar; ekleme sayacı ~16 kat, birleştirme ~7 kat büyür, taban yalnız 4 kat.', en: 'Try this: raise the array size from 12 to 48; the insertion counter grows ~16×, merge ~7×, radix only 4×.' },
  ],
  why: {
    tr: "Sıralama, ortanca süzgeç (sensör gürültüsünü bastırmak), en yakın engelleri seçme, olayları zaman damgasına göre dizme ve ikili aramaya hazırlık için her gün çalışır. Mikrodenetleyicide küçük dizilerde ekleme sıralaması çoğu zaman en hızlısıdır; büyük ve tam sayı verilerde taban sıralaması, genel amaçlı işte ise Timsort ya da birleştirme tercih edilir.",
    en: 'Sorting runs every day for median filters (suppressing sensor noise), picking the nearest obstacles, ordering events by timestamp and preparing for binary search. On a microcontroller, insertion sort is often fastest for small arrays; radix sort wins on large integer data, and Timsort or merge sort for general-purpose work.',
  },
  file: 'siralama.py',
  code: [
    ['import numpy as np'],
    ['rng = np.random.default_rng(5)'],
    ['a, c = [int(v) for v in rng.integers(20, 400, 24)], [0, 0]', 'sonar (cm), sayaçlar', 'sonar (cm), counters'],
    ['def insertion(a):'],
    ['    for i in range(1, len(a)):', 'a[:i] hep sıralı', 'a[:i] is always sorted'],
    ['        for j in range(i, 0, -1):'],
    ['            c[0] += 1', 'karşılaştırma', 'comparison'],
    ['            if a[j - 1] <= a[j]: break', 'yerine oturdu', 'in place'],
    ['            a[j - 1], a[j] = a[j], a[j - 1]', 'sola kaydır', 'shift left'],
    ['    return a'],
    ['def merge(a):'],
    ['    if len(a) < 2: return a'],
    ['    h = len(a) // 2'],
    ['    L, R, out = merge(a[:h]), merge(a[h:]), []', 'iki yarıyı sırala', 'sort both halves'],
    ['    while L and R:'],
    ['        c[1] += 1', 'önleri karşılaştır', 'compare the fronts'],
    ['        out.append((L if L[0] <= R[0] else R).pop(0))', 'küçüğü al', 'take the smaller'],
    ['    return out + L + R', 'artanları ekle', 'append the rest'],
    ['def radix(a):'],
    ['    for d in (1, 10, 100):', 'birler, onlar, yüzler', 'ones, tens, hundreds'],
    ['        a = [v for k in range(10) for v in a if v//d%10==k]', 'kova k, sıra korunur', 'bucket k, order kept'],
    ['    return a'],
    ['print(insertion(a[:]) == merge(a) == radix(a) == sorted(a))'],
    ['print("ekleme, birleştirme:", c)', 'karşılaştırma sayıları', 'comparison counts'],
  ],
  params: [
    { key: 'algo', label: { tr: 'Algoritma (0 ekleme · 1 birleştirme · 2 taban)', en: 'Algorithm (0 insertion · 1 merge · 2 radix)' }, min: 0, max: 2, step: 1, value: 0 },
    { key: 'n', label: { tr: 'Dizi boyu', en: 'Array size' }, min: 8, max: 48, step: 1, value: 24 },
  ],
  run({ algo = 0, n = 24 }) {
    algo = Math.max(0, Math.min(2, Math.round(algo)))
    n = Math.max(2, Math.min(48, Math.round(n)))
    const a0 = sonar(n)
    const tr = [insertionTrace(a0), mergeTrace(a0), radixTrace(a0)]
    const T = tr[algo]
    const nm = NAMES[algo]
    const stat = cap(`${n} okuma · ${nm[0]}`, `${n} readings · ${nm[1]}`)
    const F: SortFrame[] = []
    F.push({ arr: a0, algo, comps: 0, writes: 0, line: 2, cap: cap(`${n} sonar okuması (cm), karışık sırada`, `${n} sonar readings (cm), in random order`), stat, hold: 2 })
    F.push({ arr: a0, algo, comps: 0, writes: 0, line: [3, 10, 18][algo], cap: nm, stat, hold: 1.5 })
    // ilk 24 olay tek tek, sonrası en çok ~260 kareye seyreltilir
    const ev = T.ev, head = 24, budget = 260
    const stride = Math.max(1, Math.ceil((ev.length - head) / budget))
    ev.forEach((e, i) => {
      if (i >= head && (i - head) % stride !== 0 && i !== ev.length - 1) return
      const c = e.digit
        ? cap(`basamak ${e.digit === 1 ? 'birler' : e.digit === 10 ? 'onlar' : 'yüzler'} · ${e.wr ? 'kovadan geri yaz' : 'kovalara dağıt'}`, `${e.digit === 1 ? 'ones' : e.digit === 10 ? 'tens' : 'hundreds'} digit · ${e.wr ? 'write back from buckets' : 'distribute into buckets'}`)
        : e.cmp ? cap(`karşılaştır: ${e.arr[e.cmp[0]]} ile ${e.arr[e.cmp[1]]}`, `compare ${e.arr[e.cmp[0]]} with ${e.arr[e.cmp[1]]}`)
          : cap(`yaz: konum ${e.wr!.join(', ')}`, `write: position ${e.wr!.join(', ')}`)
      F.push({ arr: e.arr, algo, cmp: e.cmp, wr: e.wr, comps: e.comps, writes: e.writes, range: e.range, sortedTo: e.sortedTo, digit: e.digit, line: e.line, cap: c,
        stat: cap(`${e.comps} karşılaştırma · ${e.writes} yazma`, `${e.comps} comparisons · ${e.writes} writes`), hold: i < head ? (i < 8 ? 1 : 0.6) : 0.12 })
    })
    const table = tr.map((t) => ({ comps: t.comps, writes: t.writes }))
    const runs = naturalRuns(a0)
    F.push({ arr: T.a, algo, comps: T.comps, writes: T.writes, done: true, table, runs, line: 22,
      cap: cap(`sıralandı: ${T.comps} karşılaştırma, ${T.writes} yazma`, `sorted: ${T.comps} comparisons, ${T.writes} writes`),
      stat: cap(`n²/4 = ${Math.round((n * n) / 4)} · n·log2 n = ${Math.round(n * Math.log2(n))}`, `n²/4 = ${Math.round((n * n) / 4)} · n·log2 n = ${Math.round(n * Math.log2(n))}`), hold: 2 })
    F.push({ arr: T.a, algo, comps: T.comps, writes: T.writes, done: true, table, runs, line: 23,
      cap: cap(`Timsort bu dizide ${runs} doğal artan parça bulur ve onları birleştirir`, `Timsort finds ${runs} natural ascending runs here and merges them`), stat, hold: 3 })
    return F
  },
}
