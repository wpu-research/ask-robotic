// Ders: yığın (stack) ve öbek (heap). Robotun yol planlama fonksiyonu özyinelemeli çağrılarla yol uzunluğunu toplar: her çağrı
// yığına bir çerçeve ekler, dönüşte silinir; noktalar öbekte yaşar. Sınır aşılınca yığın taşar. Closure: hücre çerçeveden uzun yaşar.
import { cap, type Frame, type Lesson } from './core'

export interface StackVar { name: string; val: string; ref?: string }
export interface StackFrame { fn: string; vars: StackVar[] }
export interface HeapObj { id: string; kind: 'list' | 'tuple' | 'func' | 'cell'; label: string; refs?: string[] }
export interface YFrame extends Frame {
  mode: 'rec' | 'clo'
  stack: StackFrame[]
  heap: HeapObj[]
  /** Vurgulanan öbek nesnesi ve aktif çerçeve dizini. */
  hot?: string
  /** Dönen değer (aktif çerçevenin üstünde gösterilir). */
  ret?: string
  overflow?: boolean
  /** Bu ana kadar görülen en büyük uzunluk() çerçeve sayısı. */
  maxDepth: number
  limit: number
  /** Yol sonucu (m) ya da sayaç değerleri. */
  result?: number
  counts?: number[]
}

export const SINIR = 16

export const points = (n: number): Array<[number, number]> => Array.from({ length: n }, (_, i) => [i, (i * 7) % 5])
export function pathLength(n: number): number {
  const P = points(n)
  let s = 0
  for (let i = 0; i + 1 < n; i++) s += Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1])
  return s
}

const f2 = (x: number, tr: boolean) => (tr ? x.toFixed(2).replace('.', ',') : x.toFixed(2))

export const YIGIN_VE_OBEK: Lesson<YFrame> = {
  slug: 'yigin-ve-obek',
  n: 0,
  title: { tr: 'Yığın, öbek ve closure', en: 'Stack, heap and closures' },
  sub: { tr: 'Yol planlayıcının özyinelemeli çağrıları bellekte ne yapar?', en: "What the path planner's recursive calls do in memory" },
  story: {
    tr: "Depo robotu 10 ara noktadan geçen bir rotanın uzunluğunu hesaplıyor. Fonksiyon özyinelemeli: 'buradan hedefe uzunluk = bir sonraki noktaya mesafe + oradan hedefe uzunluk'. Her çağrı yığına bir çerçeve koyar; ara noktalar ise öbekte, bir listede durur. Robotun gömülü bilgisayarında yığın küçüktür; burada 16 çerçeveyle sınırladık.",
    en: "A warehouse robot computes the length of a route through 10 waypoints. The function is recursive: 'length from here to the goal = distance to the next point + length from there'. Every call pushes a frame on the stack, while the waypoints live on the heap in a list. The robot's embedded computer has a small stack; here we limit it to 16 frames.",
  },
  how: [
    { tr: 'Yığın: her çağrı için bir çerçeve (yerel değişkenler, dönüş adresi). Fonksiyon dönünce çerçeve hemen silinir; sırası hep "son giren ilk çıkar".', en: 'Stack: one frame per call (locals, return address). When the function returns the frame is gone at once; the order is always last in, first out.' },
    { tr: 'Öbek: nesnelerin yaşadığı alan (liste, demetler). Çerçevedeki değişken nesnenin kendisi değil, ona bir referanstır (ok). Nesne, ona işaret eden kalmayınca silinir.', en: 'Heap: where objects live (the list, the tuples). A variable in a frame is not the object but a reference to it (an arrow). An object is freed once nothing points to it.' },
    { tr: 'Özyineleme derinliği kadar çerçeve aynı anda yığında durur. Sınırı aşan çağrı RecursionError (yığın taşması) verir.', en: 'As many frames as the recursion depth sit on the stack at once. A call beyond the limit raises RecursionError (stack overflow).' },
    { tr: "Closure: iç fonksiyon dış fonksiyonun değişkenini kullanıyorsa Python o değişkeni bir hücre (cell) nesnesine taşır. Dış çerçeve silinse de hücre öbekte yaşar; sayaç değerini çağrılar arasında korur.", en: 'Closure: if an inner function uses an outer variable, Python moves that variable into a cell object. Even after the outer frame is gone the cell lives on the heap and keeps the counter between calls.' },
    { tr: "Şunu dene: derinliği 17 yap; 17. çağrı yığına sığmaz ve taşma olur.", en: 'Try this: set the depth to 17; the 17th call does not fit on the stack and it overflows.' },
  ],
  why: {
    tr: "Mikrodenetleyicilerde yığın birkaç kilobayttır; derin özyineleme ya da büyük yerel diziler robotu sessizce çökertir, bu yüzden gömülü kodda yol arama genelde döngü ve açık bir kuyrukla yazılır. Closure ise geri çağırmalarda (sensör olayı, zamanlayıcı) durumu taşımanın en kısa yoludur.",
    en: 'On microcontrollers the stack is a few kilobytes; deep recursion or large local arrays silently crash the robot, so path search in embedded code is usually written with a loop and an explicit queue. Closures are the shortest way to carry state into callbacks (sensor events, timers).',
  },
  file: 'yigin_obek.py',
  code: [
    ['import math, sys'],
    ['N, SINIR = 10, 16', 'çağrı sayısı, yığın sınırı', 'number of calls, stack limit'],
    ['sys.setrecursionlimit(SINIR + 1)', '+1: modül çerçevesi', '+1: module frame'],
    ['noktalar = [(i, i * 7 % 5) for i in range(N)]', 'öbekte', 'on the heap'],
    ['def uzunluk(i):', "i'den hedefe yol (m)", 'path from i to goal (m)'],
    ['    p = noktalar[i]', 'öbekteki demete referans', 'reference to a heap tuple'],
    ['    if i == N - 1:'],
    ['        return 0.0', 'son nokta: çerçeve silinir', 'last point: frame removed'],
    ['    d = math.dist(p, noktalar[i + 1])'],
    ['    return d + uzunluk(i + 1)', 'yeni çerçeve yığına', 'new frame on the stack'],
    ['try:'],
    ["    print('yol:', round(uzunluk(0), 2), 'm')"],
    ['except RecursionError:'],
    ["    print('yığın taşması: sınır', SINIR, 'çerçeve')"],
    ['def sayac_yap():'],
    ['    n = 0', 'hücre (cell) nesnesine taşınır', 'moved into a cell object'],
    ['    def say():'],
    ['        nonlocal n'],
    ['        n += 1'],
    ['        return n'],
    ['    return say', 'çerçeve gider, hücre kalır', 'frame goes, cell stays'],
    ['s = sayac_yap()'],
    ['print(s(), s(), s())', '1 2 3'],
    ['print(s.__closure__[0].cell_contents)', '3'],
  ],
  params: [{ key: 'depth', label: { tr: 'Özyineleme derinliği (çağrı)', en: 'Recursion depth (calls)' }, min: 2, max: 24, step: 1, value: 10 }],
  run({ depth = 10 }) {
    const N = Math.max(2, Math.round(depth))
    const P = points(N)
    const F: YFrame[] = []
    const heap0: HeapObj[] = [{ id: 'L', kind: 'list', label: `noktalar [${N}]`, refs: P.map((_, i) => `t${i}`) }, ...P.map((q, i) => ({ id: `t${i}`, kind: 'tuple' as const, label: `(${q[0]}, ${q[1]})` }))]
    const mod: StackFrame = { fn: '<module>', vars: [{ name: 'noktalar', val: '', ref: 'L' }] }
    let stack: StackFrame[] = [mod]
    let maxDepth = 0
    const stat = cap(`${N} çağrı · sınır ${SINIR} çerçeve`, `${N} calls · limit ${SINIR} frames`)
    const push = (f: Omit<YFrame, 'maxDepth' | 'limit' | 'stack' | 'mode' | 'heap'> & { stack?: StackFrame[]; heap?: HeapObj[]; mode?: YFrame['mode'] }) => {
      const st = f.stack ?? stack
      maxDepth = Math.max(maxDepth, Math.min(SINIR, st.length - 1))
      F.push({ mode: 'rec', heap: heap0, stat, ...f, stack: st, maxDepth, limit: SINIR })
    }
    push({ line: 3, hot: 'L', cap: cap(`noktalar listesi ve ${N} demet öbekte`, `the list and ${N} tuples are on the heap`), hold: 2 })
    // özyineleme: uzunluk(0) … uzunluk(N-1)
    const overflow = N > SINIR
    const calls = overflow ? SINIR : N
    const dist: number[] = []
    for (let i = 0; i < calls; i++) {
      const slow = i < 2
      const fr: StackFrame = { fn: `uzunluk(${i})`, vars: [{ name: 'i', val: String(i) }] }
      stack = [...stack, fr]
      push({ line: i ? 9 : 11, cap: cap(`uzunluk(${i}) çağrıldı: yığında ${stack.length - 1} çerçeve`, `uzunluk(${i}) called: ${stack.length - 1} frames on the stack`), hold: slow ? 1.5 : 0.5 })
      const fr2: StackFrame = { fn: fr.fn, vars: [...fr.vars, { name: 'p', val: '', ref: `t${i}` }] }
      stack = [...stack.slice(0, -1), fr2]
      push({ line: 5, hot: `t${i}`, cap: cap(`p → öbekteki (${P[i][0]}, ${P[i][1]}) demeti`, `p → the tuple (${P[i][0]}, ${P[i][1]}) on the heap`), hold: slow ? 1.4 : 0.6 })
      if (i === N - 1) break
      const d = Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1])
      dist.push(d)
      const fr3: StackFrame = { fn: fr.fn, vars: [...fr2.vars, { name: 'd', val: f2(d, true) }] }
      stack = [...stack.slice(0, -1), fr3]
      push({ line: 8, hot: `t${i + 1}`, cap: cap(`d = ${f2(d, true)} m (sonraki noktaya)`, `d = ${f2(d, false)} m (to the next point)`), hold: slow ? 1.2 : 0.4 })
    }
    if (overflow) {
      const bad: StackFrame = { fn: `uzunluk(${SINIR})`, vars: [] }
      push({ line: 9, stack: [...stack, bad], overflow: true, cap: cap(`uzunluk(${SINIR}) sığmadı: RecursionError (yığın taşması)`, `uzunluk(${SINIR}) does not fit: RecursionError (stack overflow)`), hold: 3 })
      push({ line: 12, stack: [mod], cap: cap('hata yukarı çıktı, tüm çerçeveler silindi', 'the error propagated, all frames are gone'), hold: 1.6 })
      push({ line: 13, stack: [mod], overflow: true, cap: cap(`yığın taşması: sınır ${SINIR} çerçeve`, `stack overflow: limit ${SINIR} frames`), hold: 2.5 })
    } else {
      // dönüşler: son çerçeveden başa
      let acc = 0
      push({ line: 7, ret: '0.0', cap: cap(`son nokta: uzunluk(${N - 1}) 0,0 döndürür`, `last point: uzunluk(${N - 1}) returns 0.0`), hold: 1.4 })
      stack = stack.slice(0, -1)
      for (let i = N - 2; i >= 0; i--) {
        acc += dist[i]
        const slow = i >= N - 3 || i === 0
        push({ line: 9, ret: f2(acc, true), cap: cap(`uzunluk(${i}) = ${f2(dist[i], true)} + … = ${f2(acc, true)} döner`, `uzunluk(${i}) = ${f2(dist[i], false)} + … = ${f2(acc, false)} returns`), hold: slow ? 1.2 : 0.45 })
        stack = stack.slice(0, -1)
        push({ line: 9, cap: cap(`uzunluk(${i}) çerçevesi silindi: yığında ${stack.length - 1}`, `frame uzunluk(${i}) removed: ${stack.length - 1} left`), hold: slow ? 0.8 : 0.35 })
      }
      push({ line: 11, result: acc, cap: cap(`yol: ${f2(acc, true)} m · en derin yığın ${maxDepth} çerçeve`, `path: ${f2(acc, false)} m · deepest stack ${maxDepth} frames`), hold: 3 })
    }
    // closure
    const modC = (extra: StackVar[] = []): StackFrame => ({ fn: '<module>', vars: extra })
    const cell = (v: number): HeapObj => ({ id: 'C', kind: 'cell', label: `cell: n = ${v}` })
    const func: HeapObj = { id: 'S', kind: 'func', label: 'say()', refs: ['C'] }
    const outer = (withS = false): StackFrame => ({ fn: 'sayac_yap()', vars: [{ name: 'n', val: '', ref: 'C' }, ...(withS ? [{ name: 'say', val: '', ref: 'S' }] : [])] })
    push({ mode: 'clo', line: 21, stack: [modC(), { fn: 'sayac_yap()', vars: [] }], heap: [], cap: cap('closure: sayac_yap() çağrılır', 'closure: sayac_yap() is called'), hold: 1.6 })
    push({ mode: 'clo', line: 15, stack: [modC(), outer()], heap: [cell(0)], hot: 'C', cap: cap('n, iç fonksiyon kullandığı için hücreye taşınır', 'n is moved into a cell because the inner function uses it'), hold: 2 })
    push({ mode: 'clo', line: 16, stack: [modC(), outer(true)], heap: [cell(0), func], hot: 'S', cap: cap('say fonksiyon nesnesi öbekte; __closure__ → hücre', 'the say function object is on the heap; __closure__ → cell'), hold: 1.8 })
    push({ mode: 'clo', line: 20, stack: [modC([{ name: 's', val: '', ref: 'S' }])], heap: [cell(0), func], hot: 'C', cap: cap('sayac_yap çerçevesi silindi, hücre hâlâ yaşıyor', 'the sayac_yap frame is gone, the cell is still alive'), hold: 2.4 })
    const counts: number[] = []
    for (let c = 1; c <= 3; c++) {
      const m = modC([{ name: 's', val: '', ref: 'S' }])
      const sayF: StackFrame = { fn: 'say()', vars: [{ name: 'n', val: '', ref: 'C' }] }
      push({ mode: 'clo', line: 22, stack: [m, sayF], heap: [cell(c - 1), func], counts: [...counts], cap: cap(`s() çağrısı ${c}: yeni çerçeve`, `call s() #${c}: new frame`), hold: c === 1 ? 1.4 : 0.8 })
      push({ mode: 'clo', line: 18, stack: [m, sayF], heap: [cell(c), func], hot: 'C', counts: [...counts], cap: cap(`n += 1 → hücrede ${c}`, `n += 1 → ${c} in the cell`), hold: c === 1 ? 1.4 : 0.8 })
      counts.push(c)
      push({ mode: 'clo', line: 19, stack: [m], heap: [cell(c), func], ret: String(c), counts: [...counts], cap: cap(`${c} döner, çerçeve silinir; hücre ${c} değerini korur`, `returns ${c}, the frame is removed; the cell keeps ${c}`), hold: c === 1 ? 1.6 : 0.9 })
    }
    push({ mode: 'clo', line: 23, stack: [modC([{ name: 's', val: '', ref: 'S' }])], heap: [cell(3), func], hot: 'C', counts, cap: cap('s.__closure__[0].cell_contents = 3', 's.__closure__[0].cell_contents = 3'), hold: 3 })
    return F
  },
}

