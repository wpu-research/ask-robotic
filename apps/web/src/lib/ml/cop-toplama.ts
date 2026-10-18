// Ders: çöp toplama (işaretle ve süpür). Robot yazılımının bellekteki 12 nesnesi birbirini gösterir; köklerden ulaşılamayanlar
// çöptür. İşaretle-süpür birbirini tutan "eski plan" döngüsünü de siler; referans sayımı o döngüyü hiç silemez.
import { cap, rng, type Bi, type Frame, type Lesson } from './core'

export const N = 12
export const ROOTS = [0, 1]
export const CYCLE = [9, 10, 11]

export interface Heap {
  refs: number[][]
  kb: number[]
}
export interface GcFrame extends Frame {
  g: Heap
  mode: 'ms' | 'rc'
  marked?: boolean[]
  swept?: boolean[]
  stack?: number[]
  cur?: number
  rc?: number[]
  dead?: boolean[]
  showCycle?: boolean
  /** Bellekte kalan (KB). */
  live?: number
}

export const NAMES: Bi[] = [
  { tr: 'gezinme', en: 'navigator' }, { tr: 'sensörler', en: 'sensors' }, { tr: 'harita', en: 'map' }, { tr: 'yol', en: 'path' },
  { tr: 'lidar tamponu', en: 'lidar buffer' }, { tr: 'görev', en: 'task' }, { tr: 'PID', en: 'PID' }, { tr: 'kayıt', en: 'log' },
  { tr: 'kamera karesi', en: 'camera frame' }, { tr: 'eski plan', en: 'old plan' }, { tr: 'eski yol', en: 'old path' }, { tr: 'eski hedef', en: 'old goal' },
]

/** Nesne grafiği: kökler (0, 1) ikişer, diğerleri (2–8) birer işaretçi; 9→10→11→9 kimsenin göstermediği döngü. */
export function makeHeap(seed = 4): Heap {
  const r = rng(seed)
  const refs: number[][] = Array.from({ length: N }, () => [])
  for (let i = 0; i < 9; i++) {
    const k = ROOTS.includes(i) ? 2 : 1
    for (let t = 0; t < k; t++) {
      const j = Math.floor(r() * 9)
      if (j !== i && !refs[i].includes(j)) refs[i].push(j)
    }
  }
  refs[9] = [10]; refs[10] = [11]; refs[11] = [9]
  const kb = Array.from({ length: N }, () => 40 + 20 * Math.floor(r() * 19))
  return { refs, kb }
}

/** İşaretle: köklerden yığınla gezin. Her çıkarma bir adım. */
export function mark(g: Heap) {
  const marked = new Array<boolean>(N).fill(false)
  const stack = [...ROOTS]
  const steps: Array<{ o: number; already: boolean; marked: boolean[]; stack: number[] }> = []
  while (stack.length) {
    const o = stack.pop()!
    const already = marked[o]
    if (!already) { marked[o] = true; stack.push(...g.refs[o]) }
    steps.push({ o, already, marked: marked.slice(), stack: stack.slice() })
  }
  return { marked, steps, garbage: marked.flatMap((m, i) => (m ? [] : [i])) }
}

/** Referans sayımı: sayacı 0 olan nesne silinir, gösterdiklerinin sayacı düşer. */
export function refCount(g: Heap) {
  const rc = Array.from({ length: N }, (_, o) => g.refs.filter((r) => r.includes(o)).length + (ROOTS.includes(o) ? 1 : 0))
  const rc0 = rc.slice()
  const free = rc.flatMap((c, o) => (c === 0 ? [o] : []))
  const dead = new Array<boolean>(N).fill(false)
  const steps: Array<{ o: number; rc: number[]; dead: boolean[] }> = []
  while (free.length) {
    const o = free.pop()!
    dead[o] = true
    for (const j of g.refs[o]) { rc[j]--; if (rc[j] === 0) free.push(j) }
    steps.push({ o, rc: rc.slice(), dead: dead.slice() })
  }
  return { rc0, rc, dead, steps }
}

/** Köklerden ulaşılabilen nesneler (bağımsız denetim için genişlik öncelikli). */
export function reachable(g: Heap): Set<number> {
  const seen = new Set<number>(ROOTS), q = [...ROOTS]
  while (q.length) for (const j of g.refs[q.shift()!]) if (!seen.has(j)) { seen.add(j); q.push(j) }
  return seen
}

const sum = (a: number[]) => a.reduce((s, x) => s + x, 0)
const names = (ids: number[], lang: 'tr' | 'en') => ids.map((i) => NAMES[i][lang]).join(', ')

export const COP_TOPLAMA: Lesson<GcFrame> = {
  slug: 'cop-toplama',
  n: 0,
  title: { tr: 'Çöp toplama: işaretle ve süpür', en: 'Garbage collection: mark and sweep' },
  sub: { tr: 'Köklerden ulaşılamayan nesneleri bulmak, döngüler dahil', en: 'Finding objects the roots cannot reach, cycles included' },
  story: {
    tr: "Robotun gezinme yazılımı saatlerce çalışıyor ve sürekli yeni nesne yaratıyor: haritalar, yol planları, lidar tamponları, kamera kareleri. Bellekte 12 nesne var; programın hâlâ tuttuğu iki kök (gezinme ve sensörler) bunların bir kısmını gösteriyor. Robot yeni plan yapınca eski plan, eski yol ve eski hedef birbirini göstermeye devam ediyor ama artık kimse onlara ulaşamıyor. Bellek dolmadan bunları kim, nasıl bulacak?",
    en: "The robot's navigation software runs for hours and keeps creating objects: maps, path plans, lidar buffers, camera frames. Memory holds 12 objects; the two roots the program still holds (navigator and sensors) point to some of them. When the robot replans, the old plan, old path and old goal keep pointing at each other, but nobody can reach them any more. Who finds them before memory fills up, and how?",
  },
  how: [
    { tr: 'Kökler, programın doğrudan tuttuğu nesnelerdir (yığındaki değişkenler, global değişkenler).', en: 'The roots are the objects the program holds directly (variables on the stack, globals).' },
    { tr: 'İşaretle: köklerden başlayıp her işaretçiyi izleyerek ulaşılan her nesneye işaret konur (bir dalga gibi yayılır).', en: 'Mark: starting from the roots and following every pointer, every reachable object gets a mark (it spreads like a wave).' },
    { tr: 'Süpür: işareti olmayan her nesne silinir ve belleği geri verilir. Birbirini gösteren döngü de işaretsiz kalır, o da silinir.', en: 'Sweep: every unmarked object is deleted and its memory returned. A cycle of objects pointing at each other stays unmarked too, so it is deleted as well.' },
    { tr: 'Referans sayımı her nesnenin kaç kez gösterildiğini sayar ve sayaç 0 olunca siler. Döngüdeki her nesnenin sayacı en az 1 kalır: döngü sonsuza dek bellekte kalır (sızıntı).', en: 'Reference counting counts how many pointers each object has and frees it at zero. In a cycle every counter stays at least 1, so the cycle stays in memory forever (a leak).' },
    { tr: 'Şunu dene: tohumu değiştir; grafik değişir, ama işaretle-süpür her seferinde tam olarak ulaşılamayanları siler, referans sayımı döngüyü hiç silemez.', en: 'Try this: change the seed; the graph changes, but mark and sweep always deletes exactly the unreachable objects while reference counting never frees the cycle.' },
  ],
  why: {
    tr: "JVM, V8 (JavaScript), Go, .NET ve Python'un döngü toplayıcısı bu fikrin üzerine kuruludur; Python ayrıca referans sayımı da yapar, döngüler için ikisini birlikte kullanır. ROS 2 düğümleri gibi günlerce çalışan robot yazılımında asıl tehlike unutulmuş bir referanstır: bir listede tutulan eski kareler hep ulaşılabilir kalır ve hiçbir toplayıcı onları silemez.",
    en: "The JVM, V8 (JavaScript), Go, .NET and Python's cycle collector are built on this idea; Python also counts references and uses both together to handle cycles. In robot software that runs for days, such as ROS 2 nodes, the real danger is a forgotten reference: old frames kept in a list stay reachable and no collector can free them.",
  },
  file: 'cop_toplama.py',
  code: [
    ['import numpy as np'],
    ['rng = np.random.default_rng(4)'],
    ['N, roots = 12, [0, 1]', 'gezinme, sensörler', 'navigator, sensors'],
    ['refs = [set() for _ in range(N)]', 'kim kimi gösteriyor', 'who points at whom'],
    ['for i in range(9):'],
    ['    for j in rng.integers(0, 9, 2 if i in roots else 1):'],
    ['        if j != i: refs[i].add(int(j))'],
    ['refs[9], refs[10], refs[11] = {10}, {11}, {9}', 'eski plan döngüsü', 'old-plan cycle'],
    ['marked, stack = set(), list(roots)', 'köklerden başla', 'start at the roots'],
    ['while stack:', 'işaretle', 'mark'],
    ['    o = stack.pop()'],
    ['    if o not in marked:'],
    ['        marked.add(o); stack.extend(refs[o])', 'işaretle, komşuları ekle', 'mark, push neighbours'],
    ['garbage = [o for o in range(N) if o not in marked]', 'süpür', 'sweep'],
    ['rc = [sum(o in r for r in refs) for o in range(N)]', 'referans sayıları', 'reference counts'],
    ['for r in roots: rc[r] += 1'],
    ['free, dead = [o for o in range(N) if rc[o] == 0], set()'],
    ['while free:', 'referans sayımı', 'reference counting'],
    ['    o = free.pop(); dead.add(o)'],
    ['    for j in refs[o]:'],
    ['        rc[j] -= 1'],
    ['        if rc[j] == 0: free.append(j)'],
    ['print("süpürülen", garbage, "ref.sayımı:", sorted(dead))'],
  ],
  params: [{ key: 'seed', label: { tr: 'Tohum (farklı grafik)', en: 'Seed (different graph)' }, min: 1, max: 30, step: 1, value: 4 }],
  run({ seed = 4 }) {
    seed = Math.round(seed)
    const g = makeHeap(seed)
    const M = mark(g)
    const R = refCount(g)
    const total = sum(g.kb)
    const F: GcFrame[] = []
    const none = new Array<boolean>(N).fill(false)
    const statKb = (live: number) => cap(`bellek ${live} KB / ${total} KB`, `memory ${live} KB / ${total} KB`)
    F.push({ g, mode: 'ms', line: 5, live: total, cap: cap(`${N} nesne; kökler: gezinme ve sensörler`, `${N} objects; roots: navigator and sensors`), stat: statKb(total), hold: 2 })
    F.push({ g, mode: 'ms', showCycle: true, line: 7, live: total, cap: cap('eski plan → eski yol → eski hedef → eski plan: kimse onları göstermiyor', 'old plan → old path → old goal → old plan: nobody points at them'), stat: statKb(total), hold: 2 })
    F.push({ g, mode: 'ms', marked: none, stack: [...ROOTS], line: 8, live: total, cap: cap('işaretleme köklerden başlar', 'marking starts at the roots'), stat: statKb(total), hold: 1.5 })
    M.steps.forEach((s, k) => {
      const c = s.already ? cap(`${NAMES[s.o].tr} zaten işaretli`, `${NAMES[s.o].en} already marked`) : cap(`işaretle: ${NAMES[s.o].tr}`, `mark: ${NAMES[s.o].en}`)
      const st = cap(`işaretli ${s.marked.filter(Boolean).length} · yığında ${s.stack.length}`, `marked ${s.marked.filter(Boolean).length} · on the stack ${s.stack.length}`)
      if (k < 3) F.push({ g, mode: 'ms', marked: k ? M.steps[k - 1].marked : none, stack: [...(k ? M.steps[k - 1].stack : ROOTS)], cur: s.o, line: 10, live: total, cap: cap(`yığından al: ${NAMES[s.o].tr}`, `pop: ${NAMES[s.o].en}`), stat: st, hold: 1 })
      F.push({ g, mode: 'ms', marked: s.marked, stack: s.stack, cur: s.o, line: s.already ? 11 : 12, live: total, cap: c, stat: st, hold: k < 3 ? 1.3 : 0.7 })
    })
    const swept = none.slice()
    let live = total
    for (const o of M.garbage) {
      swept[o] = true; live -= g.kb[o]
      F.push({ g, mode: 'ms', marked: M.marked, swept: swept.slice(), line: 13, live, cap: cap(`süpür: ${NAMES[o].tr} (${g.kb[o]} KB)`, `sweep: ${NAMES[o].en} (${g.kb[o]} KB)`), stat: statKb(live), hold: 0.9 })
    }
    F.push({ g, mode: 'ms', marked: M.marked, swept, line: 13, live, cap: cap(`işaretle-süpür ${M.garbage.length} nesne sildi: ${names(M.garbage, 'tr')}`, `mark and sweep freed ${M.garbage.length} objects: ${names(M.garbage, 'en')}`), stat: statKb(live), hold: 2.5 })
    // referans sayımı: aynı grafik baştan
    F.push({ g, mode: 'rc', rc: R.rc0, dead: none, line: 15, live: total, cap: cap('karşılaştırma: referans sayımı (her nesneyi gösteren ok sayısı)', 'comparison: reference counting (arrows pointing at each object)'), stat: statKb(total), hold: 2 })
    let live2 = total
    R.steps.forEach((s) => {
      live2 -= g.kb[s.o]
      F.push({ g, mode: 'rc', rc: s.rc, dead: s.dead, cur: s.o, line: 20, live: live2, cap: cap(`sayaç 0: ${NAMES[s.o].tr} silindi, gösterdiklerinin sayacı düştü`, `count 0: ${NAMES[s.o].en} freed, its targets' counts drop`), stat: statKb(live2), hold: 1.2 })
    })
    const leak = M.garbage.filter((o) => !R.dead[o])
    F.push({ g, mode: 'rc', rc: R.rc, dead: R.dead, showCycle: true, line: 22, live: live2,
      cap: cap(`referans sayımı ${leak.length} nesneyi silemedi: döngüde sayaçlar 1’de kalıyor`, `reference counting could not free ${leak.length} objects: counts in the cycle stay at 1`),
      stat: cap(`sızıntı ${sum(leak.map((o) => g.kb[o]))} KB · işaretle-süpür: 0 KB`, `leak ${sum(leak.map((o) => g.kb[o]))} KB · mark and sweep: 0 KB`), hold: 3 })
    return F
  },
}
