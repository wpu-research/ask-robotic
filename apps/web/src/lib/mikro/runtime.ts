// Mikro Kart yorumlayıcısı. eval / Function KULLANMAZ: Blockly JSON programını doğrudan dolaşır.
// Kooperatif: her olay işleyicisi bir üreteç (generator) görevidir; `bekle` ve döngü sonları sanal zamanı bırakır.
// Sınırlar: bekleme olmadan ardışık adım sınırı (sonsuz döngü), toplam adım sınırı, duvar saati bütçesi (kare başına).
import { Device } from './device'
import { OPS } from './ops'
import { fieldVarName, topBlocks, variableNames } from './program'
import type { PBlock, RadioMessage, RunError, Value, WorkspaceState } from './types'
import { looseEq, toNum, toStr, truthy } from './values'

export const BURST_LIMIT = 1_000_000
export const TOTAL_STEP_LIMIT = 100_000_000
export const SLICE_STEPS = 2000
export const MAX_DEPTH = 40
export const FOREVER_PAUSE_MS = 20

export class MikroError extends Error {
  blockId: string | null
  constructor(message: string, blockId: string | null = null) { super(message); this.name = 'MikroError'; this.blockId = blockId }
}

export type Signal = undefined | 'break' | 'continue' | 'return'
export type Gen<T> = Generator<number, T, void>

export interface Frame { locals: Map<string, Value>; ret: Value }
export interface Task {
  id: number
  hatId: string | null
  gen: Gen<void>
  wakeAt: number
  done: boolean
  slice: number
  burst: number
  payload: RadioMessage | null
  onDone?: () => void
}
export interface Ctx { rt: Runtime; dev: Device; task: Task; frame: Frame; depth: number }

export type StmtHandler = (b: PBlock, c: Ctx) => Gen<Signal | void> | Signal | void
export type ExprHandler = (b: PBlock, c: Ctx) => Gen<Value> | Value

const isGen = (x: unknown): x is Gen<unknown> => !!x && typeof x === 'object' && typeof (x as { next?: unknown }).next === 'function'

export interface RuntimeOptions {
  seed?: number
  burstLimit?: number
  totalStepLimit?: number
}

interface HatEntry { block: PBlock; running: Task | null; queue: (RadioMessage | null)[] }
interface Timer { entry: HatEntry; interval: number; next: number }

const HAT_KEYS: Record<string, (b: PBlock) => string | null> = {
  mk_on_button: (b) => `button:${b.fields?.BTN ?? 'A'}:${b.fields?.EV ?? 'press'}`,
  mk_on_gesture: (b) => `gesture:${b.fields?.G ?? 'shake'}`,
  mk_on_logo: (b) => `logo:${b.fields?.EV ?? 'touch'}`,
  mk_on_pin: (b) => `pin:${b.fields?.PIN ?? 'P0'}:${b.fields?.EV ?? 'touch'}`,
  mk_on_radio: () => 'radio',
}

export const isDisabledBlock = (b: PBlock): boolean => {
  if (b.disabled) return true
  const r = (b as { disabledReasons?: unknown[] }).disabledReasons
  return Array.isArray(r) && r.length > 0
}

export class Runtime {
  readonly dev: Device
  readonly ws: WorkspaceState
  now = 0
  steps = 0
  error: RunError | null = null
  vars = new Map<string, Value>()
  readonly names: Map<string, string>
  readonly procs = new Map<string, PBlock>()
  private tasks: Task[] = []
  private nextId = 1
  private events = new Map<string, HatEntry[]>()
  private timers: Timer[] = []
  private foreverEntries: HatEntry[] = []
  private startTasks: Task[] = []
  private started = false
  private ready = false
  private pending: [string, RadioMessage | null][] = []
  private rng: () => number
  readonly opts: Required<RuntimeOptions>

  constructor(dev: Device, ws: WorkspaceState, opts: RuntimeOptions = {}) {
    this.dev = dev
    this.ws = ws
    this.opts = { seed: opts.seed ?? 1, burstLimit: opts.burstLimit ?? BURST_LIMIT, totalStepLimit: opts.totalStepLimit ?? TOTAL_STEP_LIMIT }
    installOps()
    this.names = variableNames(ws)
    this.rng = mulberry32(this.opts.seed + dev.id * 7919)
    dev.onInput = (key, payload) => this.dispatch(key, payload ?? null)
  }

  rand(): number { return this.rng() }

  // ---------- başlatma ----------
  start() {
    if (this.started) return
    this.started = true
    for (const b of topBlocks(this.ws)) {
      if (isDisabledBlock(b)) continue
      if (b.type === 'procedures_defnoreturn' || b.type === 'procedures_defreturn') this.procs.set(String(b.fields?.NAME ?? ''), b)
    }
    const starts: HatEntry[] = []
    for (const b of topBlocks(this.ws)) {
      if (isDisabledBlock(b)) continue
      const entry: HatEntry = { block: b, running: null, queue: [] }
      if (b.type === 'mk_on_start') starts.push(entry)
      else if (b.type === 'mk_forever') this.foreverEntries.push(entry)
      else if (b.type === 'mk_every') this.timers.push({ entry, interval: Math.max(10, toNum(b.fields?.MS as Value) || 1000), next: Infinity })
      else if (HAT_KEYS[b.type]) {
        const key = HAT_KEYS[b.type](b)!
        const l = this.events.get(key) ?? []
        l.push(entry)
        this.events.set(key, l)
      }
    }
    if (starts.length === 0) { this.beginRunning(); return }
    for (const e of starts) this.startTasks.push(this.spawn(e, null, () => { if (this.startTasks.every((t) => t.done)) this.beginRunning() }))
  }

  private beginRunning() {
    if (this.ready) return
    this.ready = true
    for (const e of this.foreverEntries) this.spawnForever(e)
    for (const t of this.timers) t.next = this.now + t.interval
    const pend = this.pending
    this.pending = []
    for (const [k, p] of pend) this.dispatch(k, p)
  }

  stop() {
    this.tasks = []
    this.timers = []
    this.events.clear()
    this.dev.stopSound()
  }

  /** Çalışmayı hata ile sonlandırır. */
  fail(message: string, blockId: string | null) {
    if (this.error) return
    this.error = { message, blockId, card: this.dev.id }
    this.tasks = []
    this.dev.stopSound()
  }

  /** Şu an çalışan (ya da kuyrukta bekleyen) üst düzey başlık blokları. */
  activeHatIds(): string[] {
    const ids: string[] = []
    for (const t of this.tasks) if (!t.done && t.hatId) ids.push(t.hatId)
    return ids
  }
  get busy(): boolean { return this.tasks.length > 0 }

  // ---------- görev yönetimi ----------
  private spawn(entry: HatEntry, payload: RadioMessage | null, onDone?: () => void): Task {
    const frame: Frame = { locals: new Map(), ret: null }
    const task: Task = { id: this.nextId++, hatId: entry.block.id ?? null, gen: undefined as unknown as Gen<void>, wakeAt: this.now, done: false, slice: 0, burst: 0, payload }
    const ctx: Ctx = { rt: this, dev: this.dev, task, frame, depth: 0 }
    task.gen = this.hatBody(entry.block, ctx)
    task.onDone = () => {
      entry.running = null
      onDone?.()
      if (entry.queue.length && this.ready && !this.error) this.spawn(entry, entry.queue.shift() ?? null)
    }
    entry.running = task
    this.tasks.push(task)
    return task
  }

  private *hatBody(hat: PBlock, c: Ctx): Gen<void> {
    yield* execChain(hat.inputs?.DO?.block, c)
  }

  private spawnForever(entry: HatEntry) {
    const frame: Frame = { locals: new Map(), ret: null }
    const task: Task = { id: this.nextId++, hatId: entry.block.id ?? null, gen: undefined as unknown as Gen<void>, wakeAt: this.now, done: false, slice: 0, burst: 0, payload: null }
    const ctx: Ctx = { rt: this, dev: this.dev, task, frame, depth: 0 }
    const body = entry.block.inputs?.DO?.block
    task.gen = (function* (): Gen<void> {
      while (true) {
        yield* execChain(body, ctx)
        yield FOREVER_PAUSE_MS
      }
    })()
    entry.running = task
    this.tasks.push(task)
  }

  /** Giriş olayını ilgili işleyicilere iletir. */
  dispatch(key: string, payload: RadioMessage | null = null) {
    if (this.error) return
    if (!this.ready) { if (this.started && this.pending.length < 16) this.pending.push([key, payload]); return }
    const list = this.events.get(key)
    if (!list) return
    for (const e of list) {
      if (e.running) { if (e.queue.length < 3) e.queue.push(payload) }
      else this.spawn(e, payload)
    }
  }

  // ---------- zaman ----------
  /** Sanal saati `target` ms'ye (mutlak) ilerletir. `wallMs` verilirse gerçek süre bütçesi dolunca erken döner; ulaşılan saati verir. */
  advanceTo(target: number, wallMs = Infinity): number {
    const t0 = wallMs === Infinity ? 0 : performance.now()
    while (!this.error) {
      this.process()
      if (this.error) break
      let next = Infinity
      for (const t of this.tasks) if (t.wakeAt < next) next = t.wakeAt
      for (const tm of this.timers) if (tm.next < next) next = tm.next
      if (next > target) { this.now = Math.max(this.now, target); this.dev.tick(this.now); break }
      this.now = Math.max(this.now, next)
      if (wallMs !== Infinity && performance.now() - t0 > wallMs && this.now < target) break
    }
    return this.now
  }

  /** `now` anında hazır olan zamanlayıcı ve görevleri çalıştırır (yeni doğanlar dahil). */
  private process() {
    this.dev.tick(this.now)
    for (const tm of this.timers) {
      if (tm.next <= this.now) {
        while (tm.next <= this.now) tm.next += tm.interval
        if (!tm.entry.running) this.spawn(tm.entry, null)
      }
    }
    for (let round = 0; round < 1000 && !this.error; round++) {
      const ready = this.tasks.filter((t) => !t.done && t.wakeAt <= this.now)
      if (ready.length === 0) break
      for (const t of ready) { if (!this.error) this.runSlice(t) }
      this.tasks = this.tasks.filter((t) => !t.done)
    }
    this.tasks = this.tasks.filter((t) => !t.done)
  }

  private runSlice(t: Task) {
    this.dev.now = this.now
    t.slice = 0
    try {
      const r = t.gen.next()
      if (r.done) { t.done = true; t.onDone?.(); return }
      const v = r.value
      if (v < 0) t.wakeAt = this.now + 1
      else { t.wakeAt = this.now + v; if (v >= 1) t.burst = 0 }
    } catch (e) {
      t.done = true
      if (e instanceof MikroError) this.fail(e.message, e.blockId)
      else this.fail(e instanceof Error ? `Beklenmeyen hata: ${e.message}` : 'Beklenmeyen hata', null)
    }
  }

  // ---------- değişkenler ----------
  getVar(c: Ctx, name: string): Value {
    if (c.frame.locals.has(name)) return c.frame.locals.get(name)!
    return this.vars.get(name) ?? 0
  }
  setVar(c: Ctx, name: string, v: Value) {
    if (c.frame.locals.has(name)) c.frame.locals.set(name, v)
    else this.vars.set(name, v)
  }
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// =====================================================================================
//  Deyim ve ifade yürütme
// =====================================================================================

export function* execChain(first: PBlock | undefined, c: Ctx): Gen<Signal> {
  for (let b = first; b; b = b.next?.block) {
    if (isDisabledBlock(b)) continue
    const rt = c.rt
    if (++rt.steps > rt.opts.totalStepLimit) throw new MikroError('Program çok fazla adım çalıştırdı. Döngülerini kontrol et.', b.id ?? null)
    if (++c.task.burst > rt.opts.burstLimit) throw new MikroError("Program durmadan döngüde kaldı. Döngünün içine bir 'bekle' bloğu ekle.", b.id ?? null)
    if (++c.task.slice >= SLICE_STEPS) { c.task.slice = 0; yield -1 }
    const h = STMTS[b.type]
    if (!h) throw new MikroError(`Bilinmeyen blok: ${b.type}`, b.id ?? null)
    const r = h(b, c)
    const sig = (isGen(r) ? yield* (r as Gen<Signal>) : (r as Signal)) || undefined
    if (sig) return sig
  }
  return undefined
}

export function* ev(b: PBlock | undefined, name: string, c: Ctx): Gen<Value> {
  const inp = b?.inputs?.[name]
  const blk = inp?.block ?? inp?.shadow
  if (!blk) return null
  return yield* evalBlock(blk, c)
}

export function* evalBlock(b: PBlock, c: Ctx): Gen<Value> {
  const h = EXPRS[b.type]
  if (!h) throw new MikroError(`Bilinmeyen blok: ${b.type}`, b.id ?? null)
  const r = h(b, c)
  return isGen(r) ? yield* (r as Gen<Value>) : (r as Value)
}

export function* evNum(b: PBlock, name: string, c: Ctx): Gen<number> { return toNum(yield* ev(b, name, c)) }
export function* evStr(b: PBlock, name: string, c: Ctx): Gen<string> { return toStr(yield* ev(b, name, c)) }
export function* evBool(b: PBlock, name: string, c: Ctx): Gen<boolean> { return truthy(yield* ev(b, name, c)) }

const hasInput = (b: PBlock, n: string) => !!(b.inputs?.[n]?.block ?? b.inputs?.[n]?.shadow)
const varOf = (b: PBlock, rt: Runtime, f = 'VAR') => fieldVarName(b, rt.names, f)

// ---------------- yerleşik deyimler ----------------
export const STMTS: Record<string, StmtHandler> = {
  *controls_if(b, c) {
    for (let i = 0; hasInput(b, `IF${i}`) || b.inputs?.[`DO${i}`]; i++) {
      if (!hasInput(b, `IF${i}`)) continue
      if (yield* evBool(b, `IF${i}`, c)) return yield* execChain(b.inputs?.[`DO${i}`]?.block, c)
    }
    if (b.inputs?.ELSE) return yield* execChain(b.inputs.ELSE.block, c)
  },
  *controls_repeat_ext(b, c) {
    const n = Math.floor(yield* evNum(b, 'TIMES', c))
    for (let i = 0; i < n; i++) {
      const s = yield* execChain(b.inputs?.DO?.block, c)
      if (s === 'break') break
      if (s === 'return') return s
      yield* loopYield(c, b.id ?? null)
    }
  },
  *controls_whileUntil(b, c) {
    const until = b.fields?.MODE === 'UNTIL'
    while (true) {
      const cond = yield* evBool(b, 'BOOL', c)
      if (until ? cond : !cond) break
      const s = yield* execChain(b.inputs?.DO?.block, c)
      if (s === 'break') break
      if (s === 'return') return s
      yield* loopYield(c, b.id ?? null)
    }
  },
  *controls_for(b, c) {
    const name = varOf(b, c.rt)
    const from = yield* evNum(b, 'FROM', c)
    const to = yield* evNum(b, 'TO', c)
    let by = Math.abs(yield* evNum(b, 'BY', c))
    if (by === 0) by = 1
    const up = from <= to
    for (let i = from; up ? i <= to : i >= to; i += up ? by : -by) {
      c.rt.setVar(c, name, i)
      const s = yield* execChain(b.inputs?.DO?.block, c)
      if (s === 'break') break
      if (s === 'return') return s
      yield* loopYield(c, b.id ?? null)
    }
  },
  *controls_forEach(b, c) {
    const name = varOf(b, c.rt)
    const list = yield* ev(b, 'LIST', c)
    if (!Array.isArray(list)) throw new MikroError('"Her öğe için" bloğuna bir liste vermelisin.', b.id ?? null)
    for (const item of [...list]) {
      c.rt.setVar(c, name, item)
      const s = yield* execChain(b.inputs?.DO?.block, c)
      if (s === 'break') break
      if (s === 'return') return s
      yield* loopYield(c, b.id ?? null)
    }
  },
  controls_flow_statements(b) { return b.fields?.FLOW === 'CONTINUE' ? 'continue' : 'break' },
  *variables_set(b, c) { c.rt.setVar(c, varOf(b, c.rt), yield* ev(b, 'VALUE', c)) },
  *math_change(b, c) {
    const n = varOf(b, c.rt)
    c.rt.setVar(c, n, toNum(c.rt.getVar(c, n)) + (yield* evNum(b, 'DELTA', c)))
  },
  *procedures_callnoreturn(b, c) { yield* callProc(b, c) },
  *procedures_ifreturn(b, c) {
    if (yield* evBool(b, 'CONDITION', c)) {
      c.frame.ret = hasInput(b, 'VALUE') ? yield* ev(b, 'VALUE', c) : null
      return 'return'
    }
  },
  // procedures_defnoreturn / defreturn: üst düzey tanımlardır, zincirde çalıştırılmaz
  procedures_defnoreturn() {},
  procedures_defreturn() {},
}

/** Her döngü turu bir adımdır: boş gövdeli sonsuz döngü bile sınırlara takılır ve dilim sonunda zamanı bırakır. */
function* loopYield(c: Ctx, blockId: string | null): Gen<void> {
  const rt = c.rt
  if (++rt.steps > rt.opts.totalStepLimit) throw new MikroError('Program çok fazla adım çalıştırdı. Döngülerini kontrol et.', blockId)
  if (++c.task.burst > rt.opts.burstLimit) throw new MikroError("Program durmadan döngüde kaldı. Döngünün içine bir 'bekle' bloğu ekle.", blockId)
  if (++c.task.slice >= SLICE_STEPS) { c.task.slice = 0; yield -1 }
}

function* callProc(b: PBlock, c: Ctx): Gen<Value> {
  const name = String((b.extraState as { name?: string } | undefined)?.name ?? b.fields?.NAME ?? '')
  const def = c.rt.procs.get(name)
  if (!def) throw new MikroError(`"${name}" adlı fonksiyon bulunamadı.`, b.id ?? null)
  if (c.depth >= MAX_DEPTH) throw new MikroError(`"${name}" fonksiyonu kendini çok derin çağırdı.`, b.id ?? null)
  const params = ((def.extraState as { params?: { name: string }[] } | undefined)?.params ?? []).map((p) => p.name)
  const locals = new Map<string, Value>()
  for (let i = 0; i < params.length; i++) locals.set(params[i], hasInput(b, `ARG${i}`) ? yield* ev(b, `ARG${i}`, c) : 0)
  const frame: Frame = { locals, ret: null }
  const ctx: Ctx = { ...c, frame, depth: c.depth + 1 }
  yield* execChain(def.inputs?.STACK?.block, ctx)
  if (def.type === 'procedures_defreturn' && hasInput(def, 'RETURN') && frame.ret === null) return yield* ev(def, 'RETURN', ctx)
  return frame.ret
}

// ---------------- yerleşik ifadeler ----------------
const cmpVals = (op: string, a: Value, b: Value): boolean => {
  switch (op) {
    case 'EQ': return looseEq(a, b)
    case 'NEQ': return !looseEq(a, b)
  }
  const bothStr = typeof a === 'string' && typeof b === 'string'
  const x = bothStr ? a : toNum(a), y = bothStr ? b : toNum(b)
  switch (op) {
    case 'LT': return x < y
    case 'LTE': return x <= y
    case 'GT': return x > y
    case 'GTE': return x >= y
  }
  return false
}

const isPrime = (n: number) => {
  if (!Number.isInteger(n) || n < 2) return false
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false
  return true
}

export const EXPRS: Record<string, ExprHandler> = {
  math_number: (b) => toNum(b.fields?.NUM as Value),
  text: (b) => String(b.fields?.TEXT ?? ''),
  logic_boolean: (b) => b.fields?.BOOL === 'TRUE',
  *logic_compare(b, c) { return cmpVals(String(b.fields?.OP ?? 'EQ'), yield* ev(b, 'A', c), yield* ev(b, 'B', c)) },
  *logic_operation(b, c) {
    const a = yield* evBool(b, 'A', c)
    if (b.fields?.OP === 'OR') return a ? true : yield* evBool(b, 'B', c)
    return a ? yield* evBool(b, 'B', c) : false
  },
  *logic_negate(b, c) { return !(yield* evBool(b, 'BOOL', c)) },
  *logic_ternary(b, c) { return (yield* evBool(b, 'IF', c)) ? yield* ev(b, 'THEN', c) : yield* ev(b, 'ELSE', c) },
  *math_arithmetic(b, c) {
    const a = yield* evNum(b, 'A', c), d = yield* evNum(b, 'B', c)
    switch (b.fields?.OP) {
      case 'MINUS': return a - d
      case 'MULTIPLY': return a * d
      case 'DIVIDE': return a / d
      case 'POWER': return Math.pow(a, d)
      default: return a + d
    }
  },
  *math_modulo(b, c) { return (yield* evNum(b, 'DIVIDEND', c)) % (yield* evNum(b, 'DIVISOR', c)) },
  *math_single(b, c) {
    const x = yield* evNum(b, 'NUM', c)
    switch (b.fields?.OP) {
      case 'ROOT': return Math.sqrt(x)
      case 'ABS': return Math.abs(x)
      case 'NEG': return -x
      case 'LN': return Math.log(x)
      case 'LOG10': return Math.log10(x)
      case 'EXP': return Math.exp(x)
      case 'POW10': return Math.pow(10, x)
      default: return x
    }
  },
  *math_round(b, c) {
    const x = yield* evNum(b, 'NUM', c)
    return b.fields?.OP === 'ROUNDUP' ? Math.ceil(x) : b.fields?.OP === 'ROUNDDOWN' ? Math.floor(x) : Math.round(x)
  },
  *math_constrain(b, c) {
    const v = yield* evNum(b, 'VALUE', c), lo = yield* evNum(b, 'LOW', c), hi = yield* evNum(b, 'HIGH', c)
    return Math.min(Math.max(v, lo), hi)
  },
  *math_random_int(b, c) {
    let a = Math.floor(yield* evNum(b, 'FROM', c)), d = Math.floor(yield* evNum(b, 'TO', c))
    if (a > d) [a, d] = [d, a]
    return a + Math.floor(c.rt.rand() * (d - a + 1))
  },
  *math_number_property(b, c) {
    const n = yield* evNum(b, 'NUMBER_TO_CHECK', c)
    switch (b.fields?.PROPERTY) {
      case 'EVEN': return n % 2 === 0
      case 'ODD': return Math.abs(n % 2) === 1
      case 'PRIME': return isPrime(n)
      case 'WHOLE': return Number.isInteger(n)
      case 'POSITIVE': return n > 0
      case 'NEGATIVE': return n < 0
      case 'DIVISIBLE_BY': { const d = yield* evNum(b, 'DIVISOR', c); return d !== 0 && n % d === 0 }
    }
    return false
  },
  *text_join(b, c) {
    const n = (b.extraState as { itemCount?: number } | undefined)?.itemCount ?? 2
    let s = ''
    for (let i = 0; i < n; i++) s += toStr(yield* ev(b, `ADD${i}`, c))
    return s
  },
  *lists_create_with(b, c) {
    const n = (b.extraState as { itemCount?: number } | undefined)?.itemCount ?? 3
    const out: Value[] = []
    for (let i = 0; i < n; i++) out.push(hasInput(b, `ADD${i}`) ? yield* ev(b, `ADD${i}`, c) : 0)
    return out
  },
  variables_get: (b, c) => c.rt.getVar(c, varOf(b, c.rt)),
  procedures_callreturn: (b, c) => callProc(b, c),
}

let installed = false
/** ops modülü bu dosyayı içe aktardığı için kayıt tembel yapılır (döngüsel içe aktarma sırası fark etmesin). */
export function installOps() {
  if (installed) return
  installed = true
  Object.assign(STMTS, OPS.stmts)
  Object.assign(EXPRS, OPS.exprs)
}
