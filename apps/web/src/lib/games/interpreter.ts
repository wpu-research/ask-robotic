// Güvenli, adım adım blok yorumlayıcısı. eval / Function KULLANMAZ: Blockly'nin JSON programını (ProgramState)
// doğrudan dolaşır. Her çalışan blok için bir "adım" üretir (vurgulama + animasyon kancası); adım ve süre sınırı vardır.
// Saf TypeScript: Node'da (başsız test) ve tarayıcıda aynı kodla çalışır.

import { isDisabled, topStacks, type ProgramBlock, type ProgramState } from './program'

export type Value = number | string | boolean | null | undefined

export interface StepInfo {
  blockId: string | null
  type: string
  /** true: eylem bloğu (animasyon/gecikme uygulanır); false: denetim bloğu (yalnız vurgulama). */
  wait: boolean
  /** Bu adıma kadar sayılan toplam yürütme adımı. */
  step: number
}

/** Oyun kodunun fırlatabileceği "kontrollü durdurma" (çarpma, hedefe varma…). Hata sayılmaz. */
export class HaltProgram extends Error {
  constructor(message = '') { super(message); this.name = 'HaltProgram' }
}
export class ProgramError extends Error {
  blockId: string | null
  constructor(message: string, blockId: string | null = null) { super(message); this.name = 'ProgramError'; this.blockId = blockId }
}
export class LimitError extends Error {
  constructor(message: string) { super(message); this.name = 'LimitError' }
}

export type Signal = undefined | 'break' | 'continue' | 'return'
export type StepGen<T = Signal> = Generator<StepInfo, T, void>

export interface BlockCtx {
  block: ProgramBlock
  type: string
  id: string | null
  /** Alan değeri (yoksa undefined). */
  field(name: string): unknown
  /** Giriş bağlı mı? */
  has(name: string): boolean
  /** Değer girişini değerlendirir (boşsa undefined). */
  value(name: string): Value
  /** Değer girişi sayı olarak (boşsa `def`). */
  num(name: string, def?: number): number
  /** Değer girişi mantıksal olarak (boşsa false). */
  bool(name: string): boolean
  /** Deyim girişindeki blokları çalıştırır: `yield* c.statements('DO')`. */
  statements(name: string): StepGen
  /** Tohumlu rastgele [0,1). */
  random(): number
  /** Tohumlu rastgele tamsayı [a,b]. */
  randomInt(a: number, b: number): number
  /** Değişken oku/yaz. */
  getVar(name: string): Value
  setVar(name: string, v: Value): void
}

/** Blok işleyici: deyim bloğunda dönüş değeri yok sayılır (generator ise yield* ile sürülür); değer bloğunda dönüş değeri kullanılır. */
export type BlockHandler = (c: BlockCtx) => unknown

export interface RunApi {
  /** Oyuna özgü blok türü → işleyici. Yerleşik bloklar (döngü, if, matematik…) yorumlayıcıda hazırdır. */
  blocks: Record<string, BlockHandler>
  /** Verilirse yalnız bu "başlık" türüyle başlayan yığınlar çalışır (başlığın kendisi bir adım değildir). */
  hats?: string[]
}

export interface RunOptions {
  maxSteps?: number
  /** Yalnız eşzamanlı (başsız) kipte CPU süre sınırı, ms. */
  maxMillis?: number
  /** Eylem adımı başına bekleme (ms) ya da adıma göre hesaplayan işlev. Varsayılan 0. */
  stepDelay?: number | ((info: StepInfo) => number)
  /** Her adımdan sonra çağrılır (bekleme ve oyun anlık görüntüsü için); Promise dönebilir. */
  onStep?: (info: StepInfo) => void | Promise<void>
  /** Çalışan bloğu vurgula (null: vurguyu kaldır). */
  onHighlight?: (blockId: string | null) => void
  signal?: AbortSignal
  /** Rastgelelik tohumu (varsayılan 1). */
  seed?: number
}

export interface RunResult {
  /** finished: bitti · stopped: kullanıcı durdurdu · halted: oyun kodu durdurdu · error: hata · limit: adım/süre sınırı */
  reason: 'finished' | 'stopped' | 'halted' | 'error' | 'limit'
  steps: number
  /** error / halted / limit için ileti. */
  message?: string
  /** Son çalışan (ya da hataya yol açan) blok. */
  blockId: string | null
}

export const DEFAULT_MAX_STEPS = 20000

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

const isGen = (x: unknown): x is Generator<StepInfo, unknown, void> =>
  !!x && typeof x === 'object' && typeof (x as { next?: unknown }).next === 'function' && typeof (x as { [Symbol.iterator]?: unknown })[Symbol.iterator] === 'function'

const num = (v: Value): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  if (typeof v === 'boolean') return v ? 1 : 0
  if (typeof v === 'string') { const n = Number(v); return Number.isFinite(n) ? n : 0 }
  return 0
}
const truthy = (v: Value): boolean => !!v

const MAX_DEPTH = 64

/** Yorumlayıcı örneği. `run()` bir adım üreticisidir. */
export class Interpreter {
  steps = 0
  lastBlockId: string | null = null
  private vars = new Map<string, Value>()
  private rng: () => number
  private deadline = Infinity
  private depth = 0
  private retVal: Value = undefined
  private procs = new Map<string, { params: string[]; body?: ProgramBlock; ret?: ProgramBlock }>()
  private varNames = new Map<string, string>()

  constructor(private program: ProgramState, private api: RunApi, private opts: { maxSteps?: number; seed?: number } = {}) {
    this.rng = mulberry32(opts.seed ?? 1)
    for (const v of program.variables ?? []) this.varNames.set(v.id, v.name)
    for (const t of program.blocks?.blocks ?? []) {
      if (t.type === 'procedures_defnoreturn' || t.type === 'procedures_defreturn') {
        const name = String(t.fields?.NAME ?? '')
        const params = ((t.extraState as { params?: { name?: string }[] } | undefined)?.params ?? []).map((p) => String(p?.name ?? ''))
        this.procs.set(name, { params, body: t.inputs?.STACK?.block, ret: t.inputs?.RETURN?.block })
      }
    }
  }

  setDeadline(ms: number) { this.deadline = Date.now() + ms }

  private tick(blk: ProgramBlock | null) {
    this.steps++
    if (blk) this.lastBlockId = blk.id ?? this.lastBlockId
    const max = this.opts.maxSteps ?? DEFAULT_MAX_STEPS
    if (this.steps > max) throw new LimitError('Program çok uzun sürdü (sonsuz döngü olabilir).')
    if ((this.steps & 255) === 0 && Date.now() > this.deadline) throw new LimitError('Program çok uzun sürdü (süre doldu).')
  }

  private varName(v: unknown): string {
    if (v && typeof v === 'object') {
      const id = String((v as { id?: unknown }).id ?? '')
      return this.varNames.get(id) ?? String((v as { name?: unknown }).name ?? id)
    }
    const s = String(v ?? '')
    return this.varNames.get(s) ?? s
  }

  private step(blk: ProgramBlock, wait: boolean): StepInfo {
    return { blockId: blk.id ?? null, type: blk.type, wait, step: this.steps }
  }

  private ctx(blk: ProgramBlock): BlockCtx {
    const self = this
    return {
      block: blk,
      type: blk.type,
      id: blk.id ?? null,
      field: (n) => blk.fields?.[n],
      has: (n) => !!(blk.inputs?.[n]?.block ?? blk.inputs?.[n]?.shadow),
      value: (n) => self.input(blk, n),
      num: (n, def = 0) => { const v = self.input(blk, n); return v === undefined ? def : num(v) },
      bool: (n) => truthy(self.input(blk, n)),
      statements: (n) => self.stack(blk.inputs?.[n]?.block),
      random: () => self.rng(),
      randomInt: (a, c) => { const lo = Math.ceil(Math.min(a, c)), hi = Math.floor(Math.max(a, c)); return lo + Math.floor(self.rng() * (hi - lo + 1)) },
      getVar: (n) => self.vars.get(n),
      setVar: (n, v) => { self.vars.set(n, v) },
    }
  }

  private input(blk: ProgramBlock, name: string): Value {
    const c = blk.inputs?.[name]?.block ?? blk.inputs?.[name]?.shadow
    return c ? this.evalValue(c) : undefined
  }

  // ---- Değerler (eşzamanlı) ----
  evalValue(blk: ProgramBlock): Value {
    const f = (n: string) => blk.fields?.[n]
    const v = (n: string) => this.input(blk, n)
    switch (blk.type) {
      case 'math_number': return num(f('NUM') as Value)
      case 'text': return String(f('TEXT') ?? '')
      case 'logic_boolean': return f('BOOL') === 'TRUE' || f('BOOL') === true
      case 'logic_null': return null
      case 'logic_negate': return !truthy(v('BOOL'))
      case 'logic_operation': {
        const a = truthy(v('A'))
        return f('OP') === 'OR' ? (a || truthy(v('B'))) : (a && truthy(v('B')))
      }
      case 'logic_compare': {
        const a = v('A'), c = v('B')
        switch (f('OP')) {
          case 'EQ': return a === c || (typeof a !== typeof c && String(a) === String(c))
          case 'NEQ': return !(a === c || (typeof a !== typeof c && String(a) === String(c)))
          case 'LT': return num(a) < num(c)
          case 'LTE': return num(a) <= num(c)
          case 'GT': return num(a) > num(c)
          case 'GTE': return num(a) >= num(c)
          default: throw new ProgramError('Bilinmeyen karşılaştırma', blk.id ?? null)
        }
      }
      case 'logic_ternary': return truthy(v('IF')) ? v('THEN') : v('ELSE')
      case 'math_arithmetic': {
        const a = num(v('A')), c = num(v('B'))
        switch (f('OP')) {
          case 'ADD': return a + c
          case 'MINUS': return a - c
          case 'MULTIPLY': return a * c
          case 'DIVIDE': return c === 0 ? 0 : a / c
          case 'POWER': return Math.pow(a, c)
          default: throw new ProgramError('Bilinmeyen işlem', blk.id ?? null)
        }
      }
      case 'math_modulo': { const c = num(v('DIVISOR')); return c === 0 ? 0 : num(v('DIVIDEND')) % c }
      case 'math_single': {
        const x = num(v('NUM'))
        switch (f('OP')) {
          case 'ROOT': return Math.sqrt(Math.max(0, x))
          case 'ABS': return Math.abs(x)
          case 'NEG': return -x
          default: return x
        }
      }
      case 'math_round': {
        const x = num(v('NUM'))
        return f('OP') === 'ROUNDUP' ? Math.ceil(x) : f('OP') === 'ROUNDDOWN' ? Math.floor(x) : Math.round(x)
      }
      case 'math_random_int': { const c = this.ctx(blk); return c.randomInt(num(v('FROM')), num(v('TO'))) }
      case 'math_number_property': {
        const x = num(v('NUMBER_TO_CHECK'))
        switch (f('PROPERTY')) {
          case 'EVEN': return x % 2 === 0
          case 'ODD': return Math.abs(x % 2) === 1
          case 'POSITIVE': return x > 0
          case 'NEGATIVE': return x < 0
          case 'WHOLE': return Number.isInteger(x)
          case 'DIVISIBLE_BY': { const d = num(v('DIVISOR')); return d !== 0 && x % d === 0 }
          default: return false
        }
      }
      case 'text_join': {
        let s = ''
        for (let i = 0; blk.inputs?.[`ADD${i}`]; i++) s += String(v(`ADD${i}`) ?? '')
        return s
      }
      case 'variables_get': return this.vars.get(this.varName(f('VAR')))
      case 'procedures_callreturn': return this.callProc(blk, true)
      default: {
        const h = this.api.blocks[blk.type]
        if (!h) throw new ProgramError(`Bilinmeyen blok: ${blk.type}`, blk.id ?? null)
        this.lastBlockId = blk.id ?? this.lastBlockId
        const r = h(this.ctx(blk))
        if (isGen(r)) { // değer bloğu içinde adım üretiliyorsa adımlar yutulur (vurgulanmaz)
          let n = r.next()
          while (!n.done) n = r.next()
          return n.value as Value
        }
        return r as Value
      }
    }
  }

  private callProc(blk: ProgramBlock, wantValue: boolean): Value {
    const name = String(blk.fields?.NAME ?? (blk.extraState as { name?: unknown } | undefined)?.name ?? '')
    const def = this.procs.get(name)
    if (!def) throw new ProgramError(`"${name}" adlı işlev yok`, blk.id ?? null)
    if (++this.depth > MAX_DEPTH) { this.depth = 0; throw new LimitError('İşlev çok derin iç içe çağrıldı.') }
    const saved = def.params.map((p) => [p, this.vars.get(p)] as const)
    def.params.forEach((p, i) => this.vars.set(p, this.input(blk, `ARG${i}`)))
    try {
      // Değer bağlamında (ve deyim çağrısında) gövde adımsız ilerler; yalnız sayılır.
      this.retVal = undefined
      const g = this.stack(def.body)
      let n = g.next()
      while (!n.done) n = g.next()
      if (n.value === 'return') return this.retVal
      return wantValue && def.ret ? this.evalValue(def.ret) : undefined
    } finally {
      for (const [p, val] of saved) this.vars.set(p, val)
      this.depth--
    }
  }

  // ---- Deyimler ----
  *stack(first: ProgramBlock | undefined): StepGen {
    for (let blk = first; blk; blk = blk.next?.block ?? blk.next?.shadow) {
      if (isDisabled(blk)) continue
      const sig = yield* this.exec(blk)
      if (sig) return sig
    }
    return undefined
  }

  private *exec(blk: ProgramBlock): StepGen {
    this.tick(blk)
    const f = (n: string) => blk.fields?.[n]
    switch (blk.type) {
      case 'controls_repeat_ext':
      case 'controls_repeat': {
        yield this.step(blk, false)
        const times = Math.floor(blk.type === 'controls_repeat' ? num(f('TIMES') as Value) : num(this.input(blk, 'TIMES')))
        for (let i = 0; i < times; i++) {
          this.tick(blk)
          const sig = yield* this.stack(blk.inputs?.DO?.block)
          if (sig === 'break') break
          if (sig === 'return') return sig
        }
        return undefined
      }
      case 'controls_whileUntil': {
        yield this.step(blk, false)
        const until = f('MODE') === 'UNTIL'
        for (;;) {
          this.tick(blk)
          const c = truthy(this.input(blk, 'BOOL'))
          if (until ? c : !c) break
          const sig = yield* this.stack(blk.inputs?.DO?.block)
          if (sig === 'break') break
          if (sig === 'return') return sig
        }
        return undefined
      }
      case 'controls_for': {
        yield this.step(blk, false)
        const name = this.varName(f('VAR'))
        const from = num(this.input(blk, 'FROM')), to = num(this.input(blk, 'TO'))
        const by = Math.abs(num(this.input(blk, 'BY')) || 1)
        const dir = from <= to ? 1 : -1
        for (let i = from; dir > 0 ? i <= to : i >= to; i += dir * by) {
          this.tick(blk)
          this.vars.set(name, i)
          const sig = yield* this.stack(blk.inputs?.DO?.block)
          if (sig === 'break') break
          if (sig === 'return') return sig
        }
        return undefined
      }
      case 'controls_if': {
        yield this.step(blk, false)
        for (let i = 0; blk.inputs?.[`IF${i}`] || blk.inputs?.[`DO${i}`]; i++) {
          if (truthy(this.input(blk, `IF${i}`))) return yield* this.stack(blk.inputs?.[`DO${i}`]?.block)
        }
        if (blk.inputs?.ELSE) return yield* this.stack(blk.inputs.ELSE.block)
        return undefined
      }
      case 'controls_flow_statements':
        yield this.step(blk, false)
        return f('FLOW') === 'CONTINUE' ? 'continue' : 'break'
      case 'variables_set':
        this.vars.set(this.varName(f('VAR')), this.input(blk, 'VALUE'))
        yield this.step(blk, false)
        return undefined
      case 'math_change': {
        const n = this.varName(f('VAR'))
        this.vars.set(n, num(this.vars.get(n)) + num(this.input(blk, 'DELTA')))
        yield this.step(blk, false)
        return undefined
      }
      case 'procedures_defnoreturn':
      case 'procedures_defreturn':
        return undefined // tanım; çağrılınca çalışır
      case 'procedures_callnoreturn':
        yield this.step(blk, false)
        this.callProc(blk, false)
        return undefined
      case 'procedures_ifreturn':
        if (truthy(this.input(blk, 'CONDITION'))) { this.retVal = this.input(blk, 'VALUE'); return 'return' }
        return undefined
      default: {
        const h = this.api.blocks[blk.type]
        if (!h) throw new ProgramError(`Bilinmeyen blok: ${blk.type}`, blk.id ?? null)
        const r = h(this.ctx(blk))
        if (isGen(r)) yield* r as StepGen
        yield this.step(blk, true)
        return undefined
      }
    }
  }

  /** Programın tamamı: başlık varsa yalnız başlıklı yığınlar, yoksa tüm yığınlar (üstten alta). */
  *run(): StepGen<void> {
    const hats = this.api.hats
    for (const top of topStacks(this.program)) {
      if (isDisabled(top)) continue
      if (top.type === 'procedures_defnoreturn' || top.type === 'procedures_defreturn') continue
      if (hats) {
        if (!hats.includes(top.type)) continue
        const sig = yield* this.stack(top.next?.block)
        if (sig === 'return') return
      } else {
        const sig = yield* this.stack(top)
        if (sig === 'return') return
      }
    }
  }
}

function classify(e: unknown, it: Interpreter): RunResult {
  const base = { steps: it.steps, blockId: it.lastBlockId }
  if (e instanceof HaltProgram) return { reason: 'halted', message: e.message, ...base }
  if (e instanceof LimitError) return { reason: 'limit', message: e.message, ...base }
  if (e instanceof ProgramError) return { reason: 'error', message: e.message, ...base, blockId: e.blockId ?? base.blockId }
  return { reason: 'error', message: e instanceof Error ? e.message : String(e), ...base }
}

/** Başsız (eşzamanlı) çalıştırma: bekleme yok, vurgulama yok. Testler ve çözüm doğrulama için. */
export function runProgramSync(program: ProgramState, api: RunApi, opts: RunOptions = {}): RunResult {
  const it = new Interpreter(program, api, { maxSteps: opts.maxSteps, seed: opts.seed })
  it.setDeadline(opts.maxMillis ?? 4000)
  try {
    const g = it.run()
    let n = g.next()
    while (!n.done) {
      void opts.onStep?.(n.value)
      n = g.next()
    }
    return { reason: 'finished', steps: it.steps, blockId: it.lastBlockId }
  } catch (e) {
    return classify(e, it)
  }
}

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve) => {
    if (signal?.aborted) return resolve()
    const t = setTimeout(done, ms)
    function done() { clearTimeout(t); signal?.removeEventListener('abort', done); resolve() }
    signal?.addEventListener('abort', done)
  })

/**
 * Animasyonlu çalıştırma. Her adımda önce vurgulama, sonra `onStep` (oyun sahnesini güncelle), sonra gecikme.
 * `signal.abort()` ile durdurulur → reason 'stopped'.
 */
export async function runProgram(program: ProgramState, api: RunApi, opts: RunOptions = {}): Promise<RunResult> {
  const it = new Interpreter(program, api, { maxSteps: opts.maxSteps, seed: opts.seed })
  const { signal, onHighlight, onStep } = opts
  let sinceYield = 0
  try {
    const g = it.run()
    for (;;) {
      if (signal?.aborted) return { reason: 'stopped', steps: it.steps, blockId: it.lastBlockId }
      const n = g.next()
      if (n.done) break
      const info = n.value
      onHighlight?.(info.blockId)
      if (onStep) await onStep(info)
      if (info.wait) {
        const d = typeof opts.stepDelay === 'function' ? opts.stepDelay(info) : (opts.stepDelay ?? 0)
        if (d > 0) await sleep(d, signal)
        else if (++sinceYield >= 200) { sinceYield = 0; await sleep(0, signal) }
      }
    }
    return { reason: 'finished', steps: it.steps, blockId: it.lastBlockId }
  } catch (e) {
    return classify(e, it)
  } finally {
    onHighlight?.(null)
  }
}
