// Ders: olay döngüsü. Robot denetleyicisi sensör olaylarını tek iş parçacıklı bir döngüde işler: önce çağrı yığını boşalır,
// sonra bütün mikro görevler (söz/promise), sonra sıradaki makro görev (zamanlayıcı, G/Ç). Uzun bir hesap döngüyü kilitler.
import { cap, type Bi, type Frame, type Lesson } from './core'

type Op =
  | { k: 'log'; s: Bi; line: number }
  | { k: 'timeout' | 'io'; ms: number; cb: Task; line: number }
  | { k: 'promise'; cb: Task; line: number }
  | { k: 'busy'; ms: number; s: Bi; line: number }
export interface Task { name: Bi; ops: Op[] }

export interface Out { s: Bi; t: number; src: 'main' | 'micro' | 'macro'; plan?: number }
export interface Seg { t0: number; t1: number; src: 'main' | 'micro' | 'macro' | 'busy' }
export interface LoopFrame extends Frame {
  scen: number
  now: number
  stack: Bi[]
  micro: Bi[]
  macro: Array<{ name: Bi; at: number; kind: 'timer' | 'io' }>
  out: Out[]
  segs: Seg[]
  /** Zaman çizgisinin sağ ucu (ms). */
  tmax: number
  idle?: boolean
  /** Yığındaki görevin türü (renk için). */
  src?: 'main' | 'micro' | 'macro'
}

const b = (tr: string, en: string): Bi => ({ tr, en })
const log = (tr: string, en: string, line = 3): Op => ({ k: 'log', s: b(tr, en), line })
const task = (name: Bi, ...ops: Op[]): Task => ({ name, ops })

/** Üç senaryo: (0) eşzamanlı → söz → zamanlayıcı; (1) iç içe sözler ve zamanlayıcılar, G/Ç; (2) uzun hesap döngüyü kilitler. */
export const SCENARIOS: Task[] = [
  task(b('ana betik', 'main script'),
    log('başla', 'start', 6),
    { k: 'timeout', ms: 0, line: 7, cb: task(b('zamanlayıcı (0 ms)', 'timer (0 ms)'), log('zamanlayıcı', 'timer')) },
    { k: 'promise', line: 10, cb: task(b('söz', 'promise'), log('söz', 'promise')) },
    log('bitti', 'done', 15)),
  task(b('ana betik', 'main script'),
    log('başla', 'start', 6),
    { k: 'io', ms: 20, line: 8, cb: task(b('lidar G/Ç', 'lidar I/O'), log('lidar verisi', 'lidar data'), { k: 'promise', line: 10, cb: task(b('lidar sözü', 'lidar promise'), log('lidar işlendi', 'lidar processed')) }) },
    { k: 'timeout', ms: 0, line: 7, cb: task(b('T1 (0 ms)', 'T1 (0 ms)'), log('T1', 'T1'), { k: 'promise', line: 10, cb: task(b('T1 sözü', 'T1 promise'), log('T1 sözü', 'T1 promise')) }) },
    { k: 'timeout', ms: 0, line: 7, cb: task(b('T2 (0 ms)', 'T2 (0 ms)'), log('T2', 'T2')) },
    { k: 'promise', line: 10, cb: task(b('P1', 'P1'), log('P1', 'P1'), { k: 'promise', line: 10, cb: task(b('P2', 'P2'), log('P2', 'P2')) }) },
    log('bitti', 'done', 15)),
  task(b('ana betik', 'main script'),
    log('başla', 'start', 6),
    { k: 'timeout', ms: 10, line: 7, cb: task(b('kontrol (10 ms)', 'control (10 ms)'), log('kontrol', 'control')) },
    { k: 'io', ms: 5, line: 8, cb: task(b('lidar G/Ç (5 ms)', 'lidar I/O (5 ms)'), log('lidar', 'lidar')) },
    { k: 'promise', line: 10, cb: task(b('söz', 'promise'), log('söz', 'promise')) },
    { k: 'busy', ms: 60, line: 13, s: b('yol planı hesabı (60 ms)', 'path planning (60 ms)') },
    log('hesap bitti', 'compute done', 15)),
]
export const EXPECTED: string[][] = [
  ['başla', 'bitti', 'söz', 'zamanlayıcı'],
  ['başla', 'bitti', 'P1', 'P2', 'T1', 'T1 sözü', 'T2', 'lidar verisi', 'lidar işlendi'],
  ['başla', 'hesap bitti', 'söz', 'lidar', 'kontrol'],
]
const SCEN_NAMES = [cap('senaryo 0: kim önce?', 'scenario 0: who goes first?'), cap('senaryo 1: iç içe sözler ve G/Ç', 'scenario 1: nested promises and I/O'), cap('senaryo 2: uzun hesap döngüyü kilitler', 'scenario 2: a long computation blocks the loop')]

/** Döngü simülasyonu: her işlem bir olay; her görev çalışması 1 ms sürer, meşgul işlem ms kadar. */
export function simulate(scen: number) {
  const main = SCENARIOS[scen]
  let now = 0, seq = 0
  const micro: Task[] = []
  const macro: Array<{ t: Task; at: number; kind: 'timer' | 'io'; seq: number }> = []
  const out: Out[] = [], segs: Seg[] = []
  const ev: Array<Omit<LoopFrame, 'scen' | 'tmax' | 'cap' | 'stat'> & { what: Bi }> = []
  let cur: 'main' | 'micro' | 'macro' | undefined
  const snap = (stack: Bi[], line: number, what: Bi, idle = false) => ev.push({
    src: stack.length ? cur : undefined,
    now, stack: stack.slice(), micro: micro.map((t) => t.name), macro: macro.slice().sort((x, y) => x.at - y.at || x.seq - y.seq).map((m) => ({ name: m.t.name, at: m.at, kind: m.kind })),
    out: out.slice(), segs: segs.slice(), line, what, idle,
  })
  const runTask = (t: Task, src: 'main' | 'micro' | 'macro', plan?: number) => {
    const t0 = now
    cur = src
    for (const op of t.ops) {
      if (op.k === 'log') { out.push({ s: op.s, t: now, src, plan }); snap([t.name], op.line, b(`yaz: "${op.s.tr}"`, `print: "${op.s.en}"`)) }
      else if (op.k === 'promise') { micro.push(op.cb); snap([t.name], op.line, b(`söz çözüldü → mikro kuyruk: ${op.cb.name.tr}`, `promise resolved → microtask queue: ${op.cb.name.en}`)) }
      else if (op.k === 'timeout' || op.k === 'io') {
        macro.push({ t: op.cb, at: now + op.ms, kind: op.k === 'io' ? 'io' : 'timer', seq: seq++ })
        snap([t.name], op.line, op.k === 'io' ? b(`G/Ç başladı, ${op.ms} ms sonra hazır`, `I/O started, ready in ${op.ms} ms`) : b(`zamanlayıcı kuruldu: ${op.ms} ms`, `timer set: ${op.ms} ms`))
      } else if (op.k === 'busy') {
        segs.push({ t0: now, t1: now + op.ms, src: 'busy' })
        now += op.ms
        snap([t.name, op.s], op.line, b(`${op.s.tr}: döngü ${op.ms} ms kilitli`, `${op.s.en}: loop blocked for ${op.ms} ms`))
      }
    }
    now += 1
    segs.push({ t0, t1: now, src })
  }
  const drain = () => { while (micro.length) { const t = micro.shift()!; runTask(t, 'micro') } }
  snap([], 17, b('olay döngüsü başlar', 'the event loop starts'))
  runTask(main, 'main')
  snap([], 16, b('yığın boş: önce mikro görevler', 'stack empty: microtasks first'))
  drain()
  while (macro.length) {
    macro.sort((x, y) => x.at - y.at || x.seq - y.seq)
    const m = macro[0]
    if (m.at > now) { now = m.at; snap([], 16, b(`boşta bekle → ${m.at} ms`, `idle until ${m.at} ms`), true) }
    macro.shift()
    snap([], 17, m.at < now ? b(`sıradaki makro görev: ${m.t.name.tr} (${now - m.at} ms gecikmeli)`, `next macrotask: ${m.t.name.en} (${now - m.at} ms late)`) : b(`sıradaki makro görev: ${m.t.name.tr}`, `next macrotask: ${m.t.name.en}`))
    runTask(m.t, 'macro', m.at)
    drain()
  }
  return { ev, out, end: now }
}

export const OLAY_DONGUSU: Lesson<LoopFrame> = {
  slug: 'olay-dongusu',
  n: 0,
  title: { tr: 'Olay döngüsü', en: 'The event loop' },
  sub: { tr: 'Tek iş parçacığı, iki kuyruk: çıktı sırası neden şaşırtır?', en: 'One thread, two queues: why the output order surprises' },
  story: {
    tr: "Robotun denetleyicisi tek iş parçacıklı bir olay döngüsünde çalışıyor: 10 ms'de bir kontrol zamanlayıcısı, 5 ms'de gelen lidar verisi, bir de çözülen sözler (promise). Aynı anda yalnız bir iş yapabiliyor; yine de donmadan hepsine yetişmesi gerekiyor. Üç senaryoda çıktıların hangi sırayla ve hangi milisaniyede yazıldığını izliyoruz.",
    en: "The robot's controller runs in a single-threaded event loop: a control timer every 10 ms, lidar data arriving after 5 ms, and promises being resolved. It can do only one thing at a time, yet it must keep up with all of them without freezing. In three scenarios we watch in which order, and at which millisecond, the outputs are printed.",
  },
  how: [
    { tr: 'Eşzamanlı kod çağrı yığınında sonuna kadar çalışır; araya hiçbir şey giremez.', en: 'Synchronous code runs on the call stack to the end; nothing can interrupt it.' },
    { tr: "Yığın boşalınca önce mikro görev kuyruğunun TAMAMI işlenir (promise.then; asyncio'da call_soon'un hazır kuyruğu). Mikro görevin eklediği mikro görev de hemen çalışır.", en: "When the stack is empty the WHOLE microtask queue runs first (promise.then; in asyncio the call_soon ready queue). A microtask added by a microtask runs right away too." },
    { tr: 'Sonra makro kuyruktan yalnız BİR görev alınır (setTimeout, G/Ç tamamlanması), ardından yine bütün mikro görevler. Bu yüzden 0 ms zamanlayıcı bile sözden sonra gelir.', en: 'Then only ONE task is taken from the macrotask queue (setTimeout, I/O completion), followed again by all microtasks. That is why even a 0 ms timer comes after a promise.' },
    { tr: 'Zamanlayıcının süresi bir söz değil, bir alt sınırdır: döngü 60 ms hesapla meşgulse 10 ms zamanlayıcı 50 ms gecikir.', en: "A timer's delay is a lower bound, not a promise: if the loop is busy computing for 60 ms, a 10 ms timer fires 50 ms late." },
    { tr: 'Şunu dene: senaryoyu 2 yap; kontrol zamanlayıcısının kırmızı gecikme çizgisine bak. Ağır hesabı ayrı bir iş parçacığına ya da parçalara bölmek bu yüzden gerekir.', en: 'Try this: set the scenario to 2 and look at the control timer’s red delay line. That is why heavy computation must move to another thread or be split into chunks.' },
  ],
  why: {
    tr: "JavaScript (tarayıcı, Node.js), Python asyncio, ROS 2'nin tek iş parçacıklı yürütücüsü ve birçok gömülü denetleyici bu modelle çalışır. Robotikte kural basittir: döngüde uzun süren bir şey yapma; yoksa güvenlik zamanlayıcıları ve sensör geri çağırmaları gecikir, robot geç fren yapar.",
    en: "JavaScript (browsers, Node.js), Python asyncio, ROS 2's single-threaded executor and many embedded controllers follow this model. The rule in robotics is simple: never do anything long inside the loop, or safety timers and sensor callbacks are delayed and the robot brakes late.",
  },
  file: 'olay_dongusu.py',
  code: [
    ['import asyncio, time'],
    ['out, t0 = [], time.perf_counter()'],
    ['def log(s):', 'çıktı + zaman (ms)', 'output + time (ms)'],
    ['    out.append(f"{s}@{(time.perf_counter()-t0)*1e3:.0f}ms")'],
    ['async def main():'],
    ['    loop = asyncio.get_running_loop()'],
    ['    log("başla")', 'eşzamanlı', 'synchronous'],
    ['    loop.call_later(0.010, log, "kontrol")', 'setTimeout 10 ms', 'setTimeout 10 ms'],
    ['    loop.call_later(0.005, log, "lidar")', 'G/Ç 5 ms sonra hazır', 'I/O ready after 5 ms'],
    ['    f = loop.create_future()'],
    ['    f.add_done_callback(lambda _: log("söz"))', 'then()', 'then()'],
    ['    f.set_result(None)', 'söz çözüldü', 'promise resolved'],
    ['    t = time.perf_counter()'],
    ['    while time.perf_counter() - t < 0.06:', '60 ms hesap', '60 ms computation'],
    ['        pass', 'döngü kilitli', 'loop blocked'],
    ['    log("hesap bitti")'],
    ['    await asyncio.sleep(0.02)', 'döngüye bırak', 'yield to the loop'],
    ['asyncio.run(main())', 'olay döngüsü', 'the event loop'],
    ['print(out)'],
  ],
  params: [{ key: 'scen', label: { tr: 'Senaryo (0 sıra · 1 iç içe · 2 uzun hesap)', en: 'Scenario (0 order · 1 nested · 2 long task)' }, min: 0, max: 2, step: 1, value: 0 }],
  run({ scen = 0 }) {
    scen = Math.max(0, Math.min(2, Math.round(scen)))
    const S = simulate(scen)
    const tmax = Math.max(30, Math.ceil((S.end + 5) / 10) * 10)
    const F: LoopFrame[] = []
    S.ev.forEach((e, i) => {
      const last = i === S.ev.length - 1
      F.push({ ...e, scen, tmax, cap: [e.what.tr, e.what.en], stat: cap(`${SCEN_NAMES[scen][0]} · t = ${e.now} ms`, `${SCEN_NAMES[scen][1]} · t = ${e.now} ms`), hold: i === 0 ? 2 : last ? 1.2 : e.idle ? 1.4 : 1.1 })
    })
    const ord = S.out.map((o) => o.s)
    const late = S.out.filter((o) => o.plan !== undefined && o.t - o.plan > 5).reverse()
    const lastEv = S.ev[S.ev.length - 1]
    F.push({
      ...lastEv, stack: [], micro: [], macro: [], scen, tmax, line: 18,
      cap: cap(`çıktı sırası: ${ord.map((s) => s.tr).join(' → ')}`, `output order: ${ord.map((s) => s.en).join(' → ')}`),
      stat: late.length ? cap(`${late[0].s.tr}: planlanan ${late[0].plan} ms, çalıştığı ${late[0].t} ms`, `${late[0].s.en}: planned ${late[0].plan} ms, ran at ${late[0].t} ms`)
        : cap('söz (mikro görev) her zaman zamanlayıcıdan (makro görev) önce', 'a promise (microtask) always runs before a timer (macrotask)'),
      hold: 3,
    })
    return F
  },
}
