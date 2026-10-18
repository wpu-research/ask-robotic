// Ders: kilitlenme ve yarış durumu. Robotun motor sürücüsü (M) ve sensör okuyucusu (S) iş parçacıkları ortak bir sayacı artırır.
// Kilitsiz: araya girme güncellemeleri kaybeder. İki kilidi ters sırada almak: ikisi de sonsuza dek bekler. Sabit sıra: düzelir.
import { cap, rng, type Frame, type Lesson } from './core'

export type Th = 'M' | 'S'
export type Lk = 'A' | 'B'
export type Op = { k: 'lock' | 'unlock'; l: Lk } | { k: 'read' } | { k: 'write' }
export const THREADS: Th[] = ['M', 'S']

export interface Ev { th: Th; tick: number; op: Op; blocked?: boolean }
export interface LockFrame extends Frame {
  scen: number
  /** Bütün koşunun olayları (paylaşılan); yalnız ilk `upto` tanesi gösterilir. */
  hist: Ev[]
  upto: number
  ticks: number
  owner: Partial<Record<Lk, Th>>
  wait: Partial<Record<Th, Lk>>
  reg: Partial<Record<Th, number>>
  counter: number
  expected: number
  cycle?: boolean
  done?: boolean
}

const body = (a: Lk, b: Lk): Op[] => [{ k: 'lock', l: a }, { k: 'lock', l: b }, { k: 'read' }, { k: 'write' }, { k: 'unlock', l: b }, { k: 'unlock', l: a }]
const rep = <T,>(a: T[], n: number): T[] => Array.from({ length: n }, () => a).flat()
/** Senaryolar: 0 yarış (kilitsiz 5'er artırma), 1 kilitlenme (ters sıra), 2 düzeltilmiş (sabit sıra A → B). */
export function programs(scen: number): Record<Th, Op[]> {
  if (scen === 0) return { M: rep<Op>([{ k: 'read' }, { k: 'write' }], 5), S: rep<Op>([{ k: 'read' }, { k: 'write' }], 5) }
  if (scen === 1) return { M: rep(body('A', 'B'), 3), S: rep(body('B', 'A'), 3) }
  return { M: rep(body('A', 'B'), 3), S: rep(body('A', 'B'), 3) }
}

/** Bekleme grafiğinde döngü: t, u'nun tuttuğu kilidi bekliyor, u da t'nin tuttuğunu... */
export function waitCycle(owner: Partial<Record<Lk, Th>>, wait: Partial<Record<Th, Lk>>): Th[] | null {
  for (const s of THREADS) {
    const seen: Th[] = []
    let t: Th | undefined = s
    while (t && !seen.includes(t)) {
      seen.push(t)
      const l: Lk | undefined = wait[t]
      t = l ? owner[l] : undefined
    }
    if (t === s) return seen
  }
  return null
}

/** Rastgele araya girme ile koşu: her tıkta çalışabilen iş parçacıklarından biri bir işlem yapar (zaman dilimli). */
export function simulate(scen: number, seed: number) {
  const P = programs(scen)
  const r = rng(seed * 7919 + scen)
  const pc: Record<Th, number> = { M: 0, S: 0 }
  const owner: Partial<Record<Lk, Th>> = {}
  const reg: Partial<Record<Th, number>> = {}
  let counter = 0, tick = 0
  let prev: Th | undefined
  const hist: Ev[] = []
  const states: Array<{ ev: Ev; owner: Partial<Record<Lk, Th>>; wait: Partial<Record<Th, Lk>>; reg: Partial<Record<Th, number>>; counter: number }> = []
  const waitOf = (): Partial<Record<Th, Lk>> => {
    const w: Partial<Record<Th, Lk>> = {}
    for (const t of THREADS) { const op = P[t][pc[t]]; if (op && op.k === 'lock' && owner[op.l] && owner[op.l] !== t) w[t] = op.l }
    return w
  }
  const ready = (t: Th) => {
    const op = P[t][pc[t]]
    return !!op && (op.k !== 'lock' || owner[op.l] === undefined || owner[op.l] === t)
  }
  for (;;) {
    const run = THREADS.filter(ready)
    if (!run.length) break
    // zaman dilimi: çalışan iş parçacığı %70 olasılıkla devam eder, yoksa zamanlayıcı rastgele seçer
    const t = prev && run.includes(prev) && r() < 0.7 ? prev : run[Math.floor(r() * run.length)]
    prev = t
    // diğer iş parçacığı bir kilit bekliyorsa bu tıkta bekleme kaydı
    for (const u of THREADS) if (u !== t && !ready(u) && P[u][pc[u]]) { const ev = { th: u, tick, op: P[u][pc[u]], blocked: true }; hist.push(ev) }
    const op = P[t][pc[t]]; pc[t]++
    if (op.k === 'lock') owner[op.l] = t
    if (op.k === 'unlock') delete owner[op.l]
    if (op.k === 'read') reg[t] = counter
    if (op.k === 'write') counter = (reg[t] ?? 0) + 1
    const ev: Ev = { th: t, tick, op }
    hist.push(ev)
    states.push({ ev, owner: { ...owner }, wait: waitOf(), reg: { ...reg }, counter })
    tick++
  }
  const done = THREADS.every((t) => pc[t] === P[t].length)
  const wait = waitOf()
  if (!done) for (const u of THREADS) if (wait[u]) hist.push({ th: u, tick, op: P[u][pc[u]], blocked: true })
  const expected = scen === 0 ? 10 : 6
  return { hist, states, done, counter, expected, owner: { ...owner }, wait, cycle: done ? null : waitCycle(owner, wait), ticks: tick + (done ? 0 : 1), reg: { ...reg } }
}

const opName = (op: Op, tr: boolean) => op.k === 'lock' ? (tr ? `kilitle ${op.l}` : `lock ${op.l}`) : op.k === 'unlock' ? (tr ? `bırak ${op.l}` : `unlock ${op.l}`) : op.k === 'read' ? (tr ? 'sayacı oku' : 'read counter') : (tr ? 'sayaç = okunan + 1' : 'counter = read + 1')
const thName = (t: Th, tr: boolean) => (t === 'M' ? (tr ? 'motor sürücü' : 'motor driver') : (tr ? 'sensör okuyucu' : 'sensor reader'))
const LINE = { lock: 14, unlock: 15, read: 16, write: 17 } as const
const SC = [cap('yarış (kilitsiz)', 'race (no lock)'), cap('kilitlenme (ters sıra)', 'deadlock (opposite order)'), cap('düzeltilmiş (sabit sıra A → B)', 'fixed (same order A → B)')]

export const KILITLENME: Lesson<LockFrame> = {
  slug: 'kilitlenme',
  n: 0,
  title: { tr: 'Kilitlenme ve yarış durumu', en: 'Deadlock and race conditions' },
  sub: { tr: 'İki iş parçacığı, iki kilit: program neden bazen durur ya da yanlış sayar?', en: 'Two threads, two locks: why a program sometimes stops or miscounts' },
  story: {
    tr: "Robotta iki iş parçacığı aynı anda çalışıyor: motor sürücüsü (M) ve sensör okuyucusu (S). İkisi de ortak bir komut sayacını artırıyor ve ikisi de iki paylaşılan kaynağa dokunuyor: A = motor veri yolu, B = sensör tamponu. Hangi iş parçacığının ne zaman çalışacağına işletim sistemi karar verir; biz bu araya girme sırasını bir tohumla canlandırıyoruz.",
    en: 'Two threads run at once on the robot: the motor driver (M) and the sensor reader (S). Both increment a shared command counter and both touch two shared resources: A = motor bus, B = sensor buffer. The operating system decides which thread runs when; we replay that interleaving with a seed.',
  },
  how: [
    { tr: "Yarış: 'sayaç += 1' aslında iki adımdır: oku, sonra yaz. İkisi de 3 okur, ikisi de 4 yazar: bir artırma kaybolur. Hata yalnız bazı araya girme sıralarında olur; bu yüzden 'rastgele' bozulur.", en: "Race: 'counter += 1' is really two steps: read, then write. Both read 3, both write 4, and one increment is lost. It only happens for some interleavings, which is why it breaks 'randomly'." },
    { tr: "Kilitlenme: M önce A'yı, S önce B'yi alır. Sonra M B'yi, S A'yı bekler. Bekleme grafiğinde döngü oluşur (M → B → S → A → M): hata yok, istisna yok, program yalnızca ilerlemez.", en: 'Deadlock: M takes A first, S takes B first. Then M waits for B and S waits for A. The wait-for graph has a cycle (M → B → S → A → M): no error, no exception, the program simply stops making progress.' },
    { tr: 'Düzeltme: herkes kilitleri aynı sırayla alır (önce A, sonra B); döngü oluşamaz. Sayaç için ise kilit ya da atomik işlem (tek adımda oku-artır-yaz) kullanılır.', en: 'Fix: everyone takes the locks in the same order (A, then B), so no cycle can form. For the counter, use a lock or an atomic operation (read-increment-write in one step).' },
    { tr: 'Şunu dene: senaryo 1’de tohumu değiştir; bazı tohumlarda iş biter, yaklaşık yarısında kilitlenir. Senaryo 0’da da bazı tohumlar 10’u bulur, bazıları bulamaz. Senaryo 2’de hiçbir tohum kilitlenmez ve sayaç her zaman 6’dır.', en: 'Try this: change the seed in scenario 1; with some seeds the work finishes, with about half it deadlocks. In scenario 0, too, some seeds reach 10 and some do not. In scenario 2 no seed deadlocks and the counter is always 6.' },
  ],
  why: {
    tr: "Robot yazılımı doğası gereği eşzamanlıdır: ROS 2'nin çok iş parçacıklı yürütücüsü, sürücü iş parçacıkları, kesme (interrupt) işleyicileri ve RTOS görevleri. Bu hatalar testte nadiren görünür, sahada bir gün robotu dondurur. Sabit kilit sırası, kilitleri kısa tutmak, atomik sayaçlar ve kilitsiz kuyruklar en yaygın çözümlerdir.",
    en: "Robot software is concurrent by nature: ROS 2's multi-threaded executor, driver threads, interrupt handlers and RTOS tasks. These bugs rarely show up in testing and then freeze the robot one day in the field. A fixed lock order, short critical sections, atomic counters and lock-free queues are the common cures.",
  },
  file: 'kilitlenme.py',
  code: [
    ['import numpy as np'],
    ['rng = np.random.default_rng(3)', 'araya girme sırası', 'interleaving order'],
    ['def prog(a, b):', 'önce a, sonra b kilidi', 'lock a, then b'],
    ['    body = [("lock", a), ("lock", b), ("read",), ("write",)]'],
    ['    return (body + [("unlock", b), ("unlock", a)]) * 3'],
    ['th = {"M": prog("A", "B"), "S": prog("B", "A")}', 'ters sıra!', 'opposite order!'],
    ['pc, owner, reg, counter = {"M": 0, "S": 0}, {}, {}, 0'],
    ['def ready(t):', 'çalışabilir mi?', 'can it run?'],
    ['    if pc[t] == len(th[t]): return False'],
    ['    op = th[t][pc[t]]'],
    ['    return op[0] != "lock" or owner.get(op[1]) in (None, t)', 'kilit boşsa', 'if the lock is free'],
    ['while run := [t for t in th if ready(t)]:'],
    ['    t = run[rng.integers(len(run))]', 'zamanlayıcı seçer', 'the scheduler picks'],
    ['    op = th[t][pc[t]]; pc[t] += 1'],
    ['    if op[0] == "lock": owner[op[1]] = t'],
    ['    if op[0] == "unlock": del owner[op[1]]'],
    ['    if op[0] == "read": reg[t] = counter', 'oku', 'read'],
    ['    if op[0] == "write": counter = reg[t] + 1', 'yaz', 'write'],
    ['if all(pc[t] == len(th[t]) for t in th):'],
    ['    print("bitti, sayaç", counter)'],
    ['else:'],
    ['    print("KİLİTLENME:", owner, "sayaç", counter)', 'herkes bekliyor', 'everyone is waiting'],
  ],
  params: [
    { key: 'scen', label: { tr: 'Senaryo (0 yarış · 1 kilitlenme · 2 düzeltilmiş)', en: 'Scenario (0 race · 1 deadlock · 2 fixed)' }, min: 0, max: 2, step: 1, value: 1 },
    { key: 'seed', label: { tr: 'Tohum (araya girme sırası)', en: 'Seed (interleaving order)' }, min: 1, max: 20, step: 1, value: 7 },
  ],
  run({ scen = 1, seed = 7 }) {
    scen = Math.max(0, Math.min(2, Math.round(scen)))
    seed = Math.round(seed)
    const S = simulate(scen, seed)
    const base = { scen, hist: S.hist, ticks: Math.max(S.ticks, 12), expected: S.expected }
    const F: LockFrame[] = []
    const stat = cap(`${SC[scen][0]} · tohum ${seed}`, `${SC[scen][1]} · seed ${seed}`)
    F.push({ ...base, upto: 0, owner: {}, wait: {}, reg: {}, counter: 0, line: 5, cap: scen === 0 ? cap('iki iş parçacığı, kilit yok: ikisi de sayacı 5’er kez artıracak', 'two threads, no lock: each will increment the counter 5 times') : scen === 1 ? cap('M önce A’yı, S önce B’yi kilitler: ters sıra', 'M locks A first, S locks B first: opposite order') : cap('ikisi de önce A’yı, sonra B’yi kilitler', 'both lock A first, then B'), stat, hold: 2 })
    S.states.forEach((s, i) => {
      const upto = S.hist.indexOf(s.ev) + 1
      const t = s.ev.th, op = s.ev.op
      const c = cap(`${thName(t, true)}: ${opName(op, true)}${op.k === 'write' ? ` → ${s.counter}` : op.k === 'read' ? ` (${s.reg[t]})` : ''}`, `${thName(t, false)}: ${opName(op, false)}${op.k === 'write' ? ` → ${s.counter}` : op.k === 'read' ? ` (${s.reg[t]})` : ''}`)
      const st = cap(`sayaç ${s.counter} · tık ${i + 1}`, `counter ${s.counter} · tick ${i + 1}`)
      const blockedNow = Object.keys(s.wait).length > 0
      F.push({ ...base, upto, owner: s.owner, wait: s.wait, reg: s.reg, counter: s.counter, line: LINE[op.k], cap: c, stat: st, hold: i < 6 ? 1.1 : blockedNow ? 0.9 : 0.6 })
    })
    const L = S.states.at(-1)
    const fin = { ...base, upto: S.hist.length, owner: S.owner, wait: S.wait, reg: L?.reg ?? {}, counter: S.counter, done: S.done }
    if (!S.done) {
      F.push({ ...fin, line: 11, cap: cap('kimse çalışamıyor: ikisi de diğerinin tuttuğu kilidi bekliyor', 'nobody can run: each waits for the lock the other holds'), stat, hold: 1.6 })
      F.push({ ...fin, cycle: !!S.cycle, line: 21, cap: cap(`KİLİTLENME: M → B (S'de) → S → A (M'de) → M · sayaç ${S.counter}/${S.expected}`, `DEADLOCK: M → B (held by S) → S → A (held by M) → M · counter ${S.counter}/${S.expected}`), stat: cap('hata yok, istisna yok: program yalnızca ilerlemiyor', 'no error, no exception: the program simply stops making progress'), hold: 3 })
    } else {
      const lost = S.expected - S.counter
      F.push({ ...fin, line: 19, cap: lost ? cap(`bitti ama sayaç ${S.counter}, olması gereken ${S.expected}: ${lost} artırma kayboldu`, `finished but the counter is ${S.counter}, it should be ${S.expected}: ${lost} increments lost`) : cap(`bitti: sayaç ${S.counter} / ${S.expected}, doğru`, `finished: counter ${S.counter} / ${S.expected}, correct`), stat, hold: 3 })
    }
    return F
  },
}
