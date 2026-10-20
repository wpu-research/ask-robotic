// ArmScript: bu platformun kendi, küçük robot kolu programlama dili. Hiçbir ticari robot dilinin sözdizimi, anahtar sözcüğü ya da
// kitaplığı değildir. Yorumlayıcı saf TypeScript'tir: eval, Function, dinamik import, ağ ya da dosya erişimi YOKTUR; program yalnızca
// aşağıdaki komutları ve işlevleri çağırabilir. Sunucuda hiçbir şey çalışmaz; her şey tarayıcıda, sınırlı adımla koşar:
// adım, çağrı derinliği, çıktı, kaynak boyu ve benzetim süresi tavanları vardır (sonsuz döngü hata verir, tarayıcıyı kilitlemez).
import { graspable, restZ, violation, type Cell, type Item } from './cell'
import { HOME, DEG, LIMITS, fk, ik, poseDown, toDeg, yawOf, type Joints, type Pose, type V3 } from './kinematics'
import { DT, planLin, planPath, planPtp, sampleLin, sampledAt, type Motion } from './motion'
import { planJoints } from './planner'

/* ---------------- değerler ---------------- */
export interface JointTarget { t: 'joints'; q: Joints }
export interface PoseTarget { t: 'pose'; x: number; y: number; z: number; yaw: number }
export type Target = JointTarget | PoseTarget
export type Value = number | string | boolean | Target

export const LIMITS_SCRIPT = { maxChars: 6000, maxLines: 300, maxSteps: 20000, maxDepth: 12, maxOutput: 200, maxDuration: 600, maxFrames: 20000 } as const

/* ---------------- hatalar ---------------- */
export type ErrorCode =
  | 'syntax' | 'unknown-command' | 'reserved' | 'undefined-var' | 'unknown-proc' | 'unknown-function' | 'arg-count' | 'type' | 'div-zero' | 'nested-proc'
  | 'unreachable' | 'joint-limit' | 'collision' | 'zone' | 'lin-flip' | 'plan-failed' | 'step-limit' | 'depth-limit' | 'output-limit' | 'duration-limit' | 'too-long' | 'bad-index'
export interface ScriptError { code: ErrorCode; line: number; a?: string | number; b?: string | number }
class Fail extends Error { constructor(readonly err: ScriptError) { super(err.code) } }
class Halt extends Error {}
function fail(code: ErrorCode, line: number, a?: string | number, b?: string | number): never { throw new Fail({ code, line, a, b }) }

export function describeError(e: ScriptError, lang: 'tr' | 'en'): string {
  const t = (tr: string, en: string) => `${lang === 'en' ? 'Line' : 'Satır'} ${e.line}: ${lang === 'en' ? en : tr}`
  const a = String(e.a ?? ''), b = String(e.b ?? '')
  switch (e.code) {
    case 'syntax': return t(`sözdizimi hatası, ${a} bekleniyordu`, `syntax error, expected ${a}`)
    case 'unknown-command': return t(`bilinmeyen komut "${a}"`, `unknown command "${a}"`)
    case 'reserved': return t(`"${a}" ayrılmış bir sözcük, değişken adı olamaz`, `"${a}" is a reserved word and cannot be a variable name`)
    case 'undefined-var': return t(`"${a}" tanımlı değil (önce var ile tanımla)`, `"${a}" is not defined (declare it with var first)`)
    case 'unknown-proc': return t(`"${a}" adında yordam yok`, `no procedure named "${a}"`)
    case 'unknown-function': return t(`"${a}" adında işlev yok`, `no function named "${a}"`)
    case 'arg-count': return t(`"${a}" ${b} argüman ister`, `"${a}" takes ${b} argument(s)`)
    case 'type': return t(`tür hatası: ${a} bekleniyordu`, `type error: expected ${a}`)
    case 'div-zero': return t('sıfıra bölme', 'division by zero')
    case 'nested-proc': return t('proc yalnızca programın en üst düzeyinde tanımlanabilir', 'proc can only be defined at the top level')
    case 'unreachable': return t(`hedef erişilemiyor (${a})`, `target is out of reach (${a})`)
    case 'joint-limit': return t(`eklem ${a} sınırı aşıyor`, `joint ${a} exceeds its limit`)
    case 'collision': return t(`çarpışma: ${a === 'table' ? 'masa' : a === 'wall' ? 'duvar' : a} ile (uzuv ${b}); plan komutuyla çarpışmasız yol iste`, `collision with ${a} (link ${b}); ask for a collision-free path with plan`)
    case 'zone': return t(`yasak bölgeye girildi: ${a}`, `entered the restricted zone: ${a}`)
    case 'lin-flip': return t(`lin sırasında kol yapılandırma değiştirmek zorunda kaldı (tekillik civarı), ${a} s`, `the arm would have to change configuration during lin (near a singularity), at ${a} s`)
    case 'plan-failed': return t('çarpışmasız yol bulunamadı', 'no collision-free path found')
    case 'step-limit': return t(`adım sınırı (${a}) aşıldı, sonsuz döngü olabilir`, `step limit (${a}) exceeded, possibly an infinite loop`)
    case 'depth-limit': return t(`çağrı derinliği sınırı (${a}) aşıldı`, `call depth limit (${a}) exceeded`)
    case 'output-limit': return t(`çıktı sınırı (${a} satır) aşıldı`, `output limit (${a} lines) exceeded`)
    case 'duration-limit': return t(`benzetim süresi sınırı (${a} s) aşıldı`, `simulated duration limit (${a} s) exceeded`)
    case 'too-long': return t(`program çok uzun (en çok ${a})`, `program too long (at most ${a})`)
    case 'bad-index': return t(`geçersiz parça numarası ${a}`, `invalid item number ${a}`)
  }
}

/* ---------------- sözcükleme ---------------- */
type Tok = { k: 'num' | 'str' | 'id' | 'op' | 'nl' | 'eof'; v: string; line: number }
const KEYWORDS = new Set(['var', 'point', 'ptp', 'lin', 'plan', 'open', 'close', 'wait', 'speed', 'print', 'repeat', 'while', 'for', 'to', 'step', 'if', 'else', 'end', 'proc', 'call', 'halt', 'and', 'or', 'not', 'true', 'false'])
function lex(src: string): Tok[] {
  const toks: Tok[] = []
  let line = 1, i = 0
  while (i < src.length) {
    const c = src[i]
    if (c === '\n') { toks.push({ k: 'nl', v: '', line }); line++; i++; continue }
    if (c === ' ' || c === '\t' || c === '\r') { i++; continue }
    if (c === '#') { while (i < src.length && src[i] !== '\n') i++; continue }
    if (c >= '0' && c <= '9') {
      let j = i
      while (j < src.length && src[j] >= '0' && src[j] <= '9') j++
      if (src[j] === '.' && src[j + 1] >= '0' && src[j + 1] <= '9') { j++; while (j < src.length && src[j] >= '0' && src[j] <= '9') j++ }
      toks.push({ k: 'num', v: src.slice(i, j), line }); i = j; continue
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++
      toks.push({ k: 'id', v: src.slice(i, j), line }); i = j; continue
    }
    if (c === '"') {
      let j = i + 1
      while (j < src.length && src[j] !== '"' && src[j] !== '\n') j++
      if (src[j] !== '"') fail('syntax', line, '"')
      toks.push({ k: 'str', v: src.slice(i + 1, j), line }); i = j + 1; continue
    }
    const two = src.slice(i, i + 2)
    if (['==', '!=', '<=', '>='].includes(two)) { toks.push({ k: 'op', v: two, line }); i += 2; continue }
    if ('+-*/%<>=(),'.includes(c)) { toks.push({ k: 'op', v: c, line }); i++; continue }
    fail('syntax', line, `"${c}"`)
  }
  toks.push({ k: 'nl', v: '', line }, { k: 'eof', v: '', line })
  return toks
}

/* ---------------- sözdizim ağacı ---------------- */
type Expr =
  | { t: 'num'; v: number } | { t: 'str'; v: string } | { t: 'bool'; v: boolean }
  | { t: 'var'; name: string; line: number }
  | { t: 'bin'; op: string; a: Expr; b: Expr; line: number }
  | { t: 'not'; a: Expr; line: number } | { t: 'neg'; a: Expr; line: number }
  | { t: 'fn'; name: string; args: Expr[]; line: number }
type Stmt =
  | { t: 'var'; name: string; e: Expr; line: number }
  | { t: 'set'; name: string; e: Expr; line: number }
  | { t: 'move'; kind: 'ptp' | 'lin' | 'plan'; e: Expr; line: number }
  | { t: 'wait' | 'speed'; e: Expr; line: number }
  | { t: 'print'; es: Expr[]; line: number }
  | { t: 'grip'; kind: 'open' | 'close'; line: number }
  | { t: 'halt'; line: number }
  | { t: 'repeat'; n: Expr; body: Stmt[]; line: number }
  | { t: 'while'; c: Expr; body: Stmt[]; line: number }
  | { t: 'for'; v: string; from: Expr; to: Expr; step: Expr | null; body: Stmt[]; line: number }
  | { t: 'if'; c: Expr; a: Stmt[]; b: Stmt[]; line: number }
  | { t: 'call'; name: string; args: Expr[]; line: number }
export interface Program { body: Stmt[]; procs: Map<string, { params: string[]; body: Stmt[]; line: number }> }

class Parser {
  private i = 0
  readonly procs: Program['procs'] = new Map()
  constructor(private toks: Tok[]) {}
  private get cur() { return this.toks[this.i] }
  private isOp(v: string) { return this.cur.k === 'op' && this.cur.v === v }
  private isId(v: string) { return this.cur.k === 'id' && this.cur.v === v }
  private expectOp(v: string) { if (!this.isOp(v)) fail('syntax', this.cur.line, `"${v}"`); this.i++ }
  private expectNl() { if (this.cur.k !== 'nl' && this.cur.k !== 'eof') fail('syntax', this.cur.line, 'end of line'); while (this.cur.k === 'nl') this.i++ }
  private name(): string {
    if (this.cur.k !== 'id') fail('syntax', this.cur.line, 'name')
    const v = this.cur.v
    this.i++
    return v
  }
  private varName(): string {
    const line = this.cur.line, v = this.name()
    if (KEYWORDS.has(v)) fail('reserved', line, v)
    return v
  }
  program(): Program {
    while (this.cur.k === 'nl') this.i++
    const body = this.block([], true)
    if (this.cur.k !== 'eof') fail('syntax', this.cur.line, 'end of program')
    return { body, procs: this.procs }
  }
  private block(stops: string[], top = false): Stmt[] {
    const out: Stmt[] = []
    for (;;) {
      while (this.cur.k === 'nl') this.i++
      if (this.cur.k === 'eof') { if (stops.length) fail('syntax', this.cur.line, `"${stops[0]}"`); return out }
      if (this.cur.k === 'id' && stops.includes(this.cur.v)) return out
      const s = this.stmt(top)
      if (s) out.push(s)
    }
  }
  private stmt(top: boolean): Stmt | null {
    const t = this.cur, line = t.line
    if (t.k !== 'id') fail('syntax', line, 'command')
    const w = t.v
    switch (w) {
      case 'var': case 'point': { this.i++; const name = this.varName(); this.expectOp('='); const e = this.expr(); this.expectNl(); return { t: 'var', name, e, line } }
      case 'ptp': case 'lin': case 'plan': { this.i++; const e = this.expr(); this.expectNl(); return { t: 'move', kind: w, e, line } }
      case 'wait': case 'speed': { this.i++; const e = this.expr(); this.expectNl(); return { t: w, e, line } }
      case 'print': { this.i++; const es = [this.expr()]; while (this.isOp(',')) { this.i++; es.push(this.expr()) } this.expectNl(); return { t: 'print', es, line } }
      case 'open': case 'close': this.i++; this.expectNl(); return { t: 'grip', kind: w, line }
      case 'halt': this.i++; this.expectNl(); return { t: 'halt', line }
      case 'repeat': { this.i++; const n = this.expr(); this.expectNl(); const body = this.block(['end']); this.i++; this.expectNl(); return { t: 'repeat', n, body, line } }
      case 'while': { this.i++; const c = this.expr(); this.expectNl(); const body = this.block(['end']); this.i++; this.expectNl(); return { t: 'while', c, body, line } }
      case 'for': {
        this.i++; const v = this.varName(); this.expectOp('=')
        const from = this.expr()
        if (!this.isId('to')) fail('syntax', this.cur.line, '"to"')
        this.i++
        const to = this.expr()
        let step: Expr | null = null
        if (this.isId('step')) { this.i++; step = this.expr() }
        this.expectNl(); const body = this.block(['end']); this.i++; this.expectNl()
        return { t: 'for', v, from, to, step, body, line }
      }
      case 'if': {
        this.i++; const c = this.expr(); this.expectNl()
        const a = this.block(['else', 'end'])
        let b: Stmt[] = []
        if (this.isId('else')) { this.i++; this.expectNl(); b = this.block(['end']) }
        this.i++; this.expectNl()
        return { t: 'if', c, a, b, line }
      }
      case 'proc': {
        if (!top) fail('nested-proc', line)
        this.i++; const name = this.varName(); this.expectOp('(')
        const params: string[] = []
        if (!this.isOp(')')) { params.push(this.varName()); while (this.isOp(',')) { this.i++; params.push(this.varName()) } }
        this.expectOp(')'); this.expectNl()
        const body = this.block(['end']); this.i++; this.expectNl()
        this.procs.set(name, { params, body, line })
        return null
      }
      case 'call': {
        this.i++; const name = this.name(); this.expectOp('(')
        const args: Expr[] = []
        if (!this.isOp(')')) { args.push(this.expr()); while (this.isOp(',')) { this.i++; args.push(this.expr()) } }
        this.expectOp(')'); this.expectNl()
        return { t: 'call', name, args, line }
      }
      default: {
        if (KEYWORDS.has(w)) fail('syntax', line, 'command')
        this.i++
        if (this.isOp('=')) { this.i++; const e = this.expr(); this.expectNl(); return { t: 'set', name: w, e, line } }
        return fail('unknown-command', line, w)
      }
    }
  }
  expr(): Expr { return this.or() }
  private or(): Expr { let a = this.and(); while (this.isId('or')) { const line = this.cur.line; this.i++; a = { t: 'bin', op: 'or', a, b: this.and(), line } } return a }
  private and(): Expr { let a = this.not(); while (this.isId('and')) { const line = this.cur.line; this.i++; a = { t: 'bin', op: 'and', a, b: this.not(), line } } return a }
  private not(): Expr { if (this.isId('not')) { const line = this.cur.line; this.i++; return { t: 'not', a: this.not(), line } } return this.cmp() }
  private cmp(): Expr {
    let a = this.sum()
    while (this.cur.k === 'op' && ['==', '!=', '<', '>', '<=', '>='].includes(this.cur.v)) { const { v, line } = this.cur; this.i++; a = { t: 'bin', op: v, a, b: this.sum(), line } }
    return a
  }
  private sum(): Expr {
    let a = this.prod()
    while (this.isOp('+') || this.isOp('-')) { const { v, line } = this.cur; this.i++; a = { t: 'bin', op: v, a, b: this.prod(), line } }
    return a
  }
  private prod(): Expr {
    let a = this.unary()
    while (this.isOp('*') || this.isOp('/') || this.isOp('%')) { const { v, line } = this.cur; this.i++; a = { t: 'bin', op: v, a, b: this.unary(), line } }
    return a
  }
  private unary(): Expr { if (this.isOp('-')) { const line = this.cur.line; this.i++; return { t: 'neg', a: this.unary(), line } } return this.primary() }
  private primary(): Expr {
    const t = this.cur
    if (t.k === 'num') { this.i++; return { t: 'num', v: Number(t.v) } }
    if (t.k === 'str') { this.i++; return { t: 'str', v: t.v } }
    if (t.k === 'id') {
      if (t.v === 'true' || t.v === 'false') { this.i++; return { t: 'bool', v: t.v === 'true' } }
      if (KEYWORDS.has(t.v)) fail('syntax', t.line, 'value')
      this.i++
      if (this.isOp('(')) {
        this.i++
        const args: Expr[] = []
        if (!this.isOp(')')) { args.push(this.expr()); while (this.isOp(',')) { this.i++; args.push(this.expr()) } }
        this.expectOp(')')
        return { t: 'fn', name: t.v, args, line: t.line }
      }
      return { t: 'var', name: t.v, line: t.line }
    }
    if (this.isOp('(')) { this.i++; const e = this.expr(); this.expectOp(')'); return e }
    return fail('syntax', t.line, 'value')
  }
}

/** Yalnızca sözdizimini denetler (çalıştırmaz). Hata varsa döndürür. */
export function parseProgram(src: string): { ok: true; program: Program } | { ok: false; error: ScriptError } {
  try {
    if (src.length > LIMITS_SCRIPT.maxChars) fail('too-long', 1, `${LIMITS_SCRIPT.maxChars}`)
    if (src.split('\n').length > LIMITS_SCRIPT.maxLines) fail('too-long', 1, `${LIMITS_SCRIPT.maxLines} lines`)
    return { ok: true, program: new Parser(lex(src)).program() }
  } catch (e) {
    if (e instanceof Fail) return { ok: false, error: e.err }
    throw e
  }
}

/* ---------------- çalıştırma ---------------- */
export interface Frame { t: number; q: Joints; grip: number }
/** Parça olayı: pos null ise parça tutucuda (TCP'yi izler), değilse bu konumda durur. */
export interface ItemEvent { t: number; id: string; pos: V3 | null }
export interface RunStats { steps: number; ptp: number; lin: number; plan: number; picks: number; places: number; drops: number; commands: number }
export interface RunResult {
  ok: boolean
  error?: ScriptError
  /** Hata varsa, hatanın olduğu ana kadarki benzetim. */
  frames: Frame[]
  events: ItemEvent[]
  output: string[]
  duration: number
  stats: RunStats
  items: Item[]
  halted: boolean
}
export interface RunOptions { cell: Cell; home?: Joints; maxSteps?: number }

const isTarget = (v: Value): v is Target => typeof v === 'object'
const fmt = (v: Value): string => {
  if (typeof v === 'number') return String(Math.round(v * 10000) / 10000)
  if (typeof v === 'object') return v.t === 'joints' ? `joints(${toDeg(v.q).map((x) => Math.round(x * 100) / 100).join(', ')})` : `pose(${[v.x, v.y, v.z, v.yaw].map((x) => Math.round(x * 10000) / 10000).join(', ')})`
  return String(v)
}
const poseOf = (p: PoseTarget): Pose => poseDown(p.x, p.y, p.z, p.yaw)
const FN_ARITY: Record<string, number | [number, number]> = {
  joints: 6, pose: [3, 4], offset: 4, here: 0, holding: 0, items: 0, item_x: 1, item_y: 1, item_z: 1, x_of: 1, y_of: 1, z_of: 1,
  sin: 1, cos: 1, sqrt: 1, abs: 1, round: 1, floor: 1, min: 2, max: 2, dist: 2,
}
export const FUNCTIONS = Object.keys(FN_ARITY)

export function runProgram(src: string, opt: RunOptions): RunResult {
  const stats: RunStats = { steps: 0, ptp: 0, lin: 0, plan: 0, picks: 0, places: 0, drops: 0, commands: 0 }
  const items: Item[] = opt.cell.items.map((i) => ({ ...i, pos: [...i.pos] as V3 }))
  const cell: Cell = { obstacles: opt.cell.obstacles, zones: opt.cell.zones, items }
  const out: RunResult = { ok: false, frames: [], events: [], output: [], duration: 0, stats, items, halted: false }
  const parsed = parseProgram(src)
  if (!parsed.ok) { out.error = parsed.error; return out }
  const { program } = parsed
  const maxSteps = opt.maxSteps ?? LIMITS_SCRIPT.maxSteps

  let q: Joints = opt.home ?? HOME
  let grip = 1, time = 0, speed = 60, held: Item | null = null, planSeed = 1, depth = 0
  out.frames.push({ t: 0, q, grip })
  const globals = new Map<string, Value>()
  let locals: Map<string, Value> | null = null

  const tick = (line: number) => { if (++stats.steps > maxSteps) fail('step-limit', line, maxSteps) }
  const push = (dur: number, at: (t: number) => Joints, g0: number, g1: number, line: number) => {
    if (time + dur > LIMITS_SCRIPT.maxDuration) fail('duration-limit', line, LIMITS_SCRIPT.maxDuration)
    const n = Math.max(1, Math.ceil(dur / DT))
    for (let i = 1; i <= n; i++) {
      const s = Math.min(dur, i * DT)
      q = at(s)
      out.frames.push({ t: time + s, q, grip: g0 + (g1 - g0) * (dur > 0 ? s / dur : 1) })
    }
    time += dur; out.duration = time; grip = g1
    if (out.frames.length > LIMITS_SCRIPT.maxFrames) fail('duration-limit', line, LIMITS_SCRIPT.maxDuration)
  }
  const check = (qs: Joints, line: number) => {
    const v = violation(qs, cell)
    if (!v) return
    if (v.kind === 'limit') fail('joint-limit', line, qs.findIndex((x, i) => x < LIMITS[i][0] - 1e-9 || x > LIMITS[i][1] + 1e-9) + 1)
    if (v.kind === 'collision') fail('collision', line, v.with, v.link)
    fail('zone', line, v.name)
  }
  const checkMotion = (m: Motion<Joints>, line: number) => {
    const n = Math.max(1, Math.ceil(m.duration / DT))
    for (let i = 0; i <= n; i++) check(m.at(Math.min(m.duration, i * DT)), line)
  }
  const tcp = (): V3 => fk(q).p

  /* ---- ifade ---- */
  const num = (v: Value, line: number): number => (typeof v === 'number' ? v : fail('type', line, 'number'))
  const tgt = (v: Value, line: number): Target => (isTarget(v) ? v : fail('type', line, 'joints(...) / pose(...)'))
  const lookup = (name: string, line: number): Value => {
    if (locals?.has(name)) return locals.get(name)!
    if (globals.has(name)) return globals.get(name)!
    return fail('undefined-var', line, name)
  }
  const itemAt = (i: number, line: number): Item => {
    const it = items[Math.round(i) - 1]
    return it ?? fail('bad-index', line, i)
  }
  const pos = (it: Item): V3 => (held && held.id === it.id ? tcp() : it.pos)
  const call = (name: string, args: Value[], line: number): Value => {
    const ar = FN_ARITY[name]
    if (ar === undefined) return fail('unknown-function', line, name)
    const okN = Array.isArray(ar) ? args.length >= ar[0] && args.length <= ar[1] : args.length === ar
    if (!okN) fail('arg-count', line, name, Array.isArray(ar) ? `${ar[0]}-${ar[1]}` : ar)
    const n = (i: number) => num(args[i], line)
    switch (name) {
      case 'joints': { const qq = toRad6(args.map((_, i) => n(i))); return { t: 'joints', q: qq } }
      case 'pose': return { t: 'pose', x: n(0), y: n(1), z: n(2), yaw: args.length > 3 ? n(3) : 0 }
      case 'offset': {
        const p = tgt(args[0], line)
        if (p.t !== 'pose') return fail('type', line, 'pose')
        return { t: 'pose', x: p.x + n(1), y: p.y + n(2), z: p.z + n(3), yaw: p.yaw }
      }
      case 'here': { const f = fk(q); return { t: 'pose', x: f.p[0], y: f.p[1], z: f.p[2], yaw: yawOf(f.R) } }
      case 'holding': return held !== null
      case 'items': return items.length
      case 'item_x': return pos(itemAt(n(0), line))[0]
      case 'item_y': return pos(itemAt(n(0), line))[1]
      case 'item_z': return pos(itemAt(n(0), line))[2]
      case 'x_of': case 'y_of': case 'z_of': {
        const p = tgt(args[0], line), c = name === 'x_of' ? 0 : name === 'y_of' ? 1 : 2
        return p.t === 'pose' ? [p.x, p.y, p.z][c] : fk(p.q).p[c]
      }
      case 'sin': return Math.sin(n(0) * DEG)
      case 'cos': return Math.cos(n(0) * DEG)
      case 'sqrt': return n(0) < 0 ? fail('type', line, 'number >= 0') : Math.sqrt(n(0))
      case 'abs': return Math.abs(n(0))
      case 'round': return Math.round(n(0))
      case 'floor': return Math.floor(n(0))
      case 'min': return Math.min(n(0), n(1))
      case 'max': return Math.max(n(0), n(1))
      case 'dist': {
        const a = tgt(args[0], line), b = tgt(args[1], line)
        const pa = a.t === 'pose' ? [a.x, a.y, a.z] : fk(a.q).p, pb = b.t === 'pose' ? [b.x, b.y, b.z] : fk(b.q).p
        return Math.hypot(pa[0] - pb[0], pa[1] - pb[1], pa[2] - pb[2])
      }
    }
    return fail('unknown-function', line, name)
  }
  const ev = (e: Expr): Value => {
    switch (e.t) {
      case 'num': case 'str': case 'bool': return e.v
      case 'var': return lookup(e.name, e.line)
      case 'neg': return -num(ev(e.a), e.line)
      case 'not': { const v = ev(e.a); return typeof v === 'boolean' ? !v : fail('type', e.line, 'true / false') }
      case 'fn': return call(e.name, e.args.map(ev), e.line)
      case 'bin': {
        if (e.op === 'and' || e.op === 'or') {
          const a = ev(e.a)
          if (typeof a !== 'boolean') return fail('type', e.line, 'true / false')
          if (e.op === 'and' ? !a : a) return a
          const b = ev(e.b)
          return typeof b === 'boolean' ? b : fail('type', e.line, 'true / false')
        }
        const a = ev(e.a), b = ev(e.b)
        if (e.op === '==' || e.op === '!=') {
          const same = isTarget(a) || isTarget(b) ? fmt(a) === fmt(b) : a === b
          return e.op === '==' ? same : !same
        }
        if (e.op === '+' && (typeof a === 'string' || typeof b === 'string')) return fmt(a) + fmt(b)
        const x = num(a, e.line), y = num(b, e.line)
        switch (e.op) {
          case '+': return x + y
          case '-': return x - y
          case '*': return x * y
          case '/': return y === 0 ? fail('div-zero', e.line) : x / y
          case '%': return y === 0 ? fail('div-zero', e.line) : x % y
          case '<': return x < y
          case '>': return x > y
          case '<=': return x <= y
          default: return x >= y
        }
      }
    }
  }
  const truth = (v: Value, line: number) => (typeof v === 'boolean' ? v : fail('type', line, 'true / false'))

  /* ---- hareket ---- */
  /** Hedefi eklem duruşuna çevirir (pozlar için en yakın, uç noktada ihlalsiz çözüm). */
  const goalQ = (t: Target, line: number): Joints => {
    if (t.t === 'joints') { check(t.q, line); return t.q }
    const sols = ik(poseOf(t), q)
    if (!sols.length) return fail('unreachable', line, `x=${t.x}, y=${t.y}, z=${t.z}`)
    const good = sols.find((s) => !violation(s, cell))
    if (!good) { check(sols[0], line) }
    return good ?? sols[0]
  }
  const move = (kind: 'ptp' | 'lin' | 'plan', t: Target, line: number) => {
    stats.commands++
    if (kind === 'ptp') {
      const g = goalQ(t, line), m = planPtp(q, g, speed)
      checkMotion(m, line)
      push(m.duration, m.at, grip, grip, line); stats.ptp++
    } else if (kind === 'lin') {
      const a = fk(q), b = t.t === 'pose' ? poseOf(t) : fk(t.q)
      const r = sampleLin(a, b, q, speed)
      if (!r.ok) return r.fail.kind === 'unreachable' ? fail('unreachable', line, `t=${r.fail.t.toFixed(2)} s`) : fail('lin-flip', line, r.fail.t.toFixed(2))
      for (const s of r.qs) check(s, line)
      push(r.duration, (s) => sampledAt(r.qs, r.duration, s), grip, grip, line); stats.lin++
    } else {
      const g = goalQ(t, line)
      const res = planJoints(q, g, cell, { seed: planSeed++ })
      if (!res.ok) return fail('plan-failed', line)
      const m = planPath(res.path, speed)
      push(m.duration, m.at, grip, grip, line); stats.plan++
    }
  }
  const gripper = (kind: 'open' | 'close', line: number) => {
    stats.commands++
    const target = kind === 'open' ? 1 : 0
    push(0.4, () => q, grip, target, line)
    if (kind === 'close' && !held) {
      const it = graspable(q, items)
      if (it) { held = it; stats.picks++; out.events.push({ t: time, id: it.id, pos: null }) }
    }
    if (kind === 'open' && held) {
      const p = tcp()
      const it = held
      held = null
      const rest = restZ({ ...it, pos: [p[0], p[1], 0] }, items)
      if (p[2] - rest > 0.03) stats.drops++
      it.pos = [p[0], p[1], rest]
      stats.places++
      out.events.push({ t: time, id: it.id, pos: [...it.pos] as V3 })
    }
  }

  /* ---- deyimler ---- */
  const run = (body: Stmt[]) => { for (const s of body) exec(s) }
  const setVar = (name: string, v: Value, line: number) => {
    if (locals?.has(name)) locals.set(name, v)
    else if (globals.has(name)) globals.set(name, v)
    else fail('undefined-var', line, name)
  }
  function exec(s: Stmt): void {
    tick(s.line)
    switch (s.t) {
      case 'var': { const v = ev(s.e); if (locals) locals.set(s.name, v); else globals.set(s.name, v); return }
      case 'set': setVar(s.name, ev(s.e), s.line); return
      case 'move': move(s.kind, tgt(ev(s.e), s.line), s.line); return
      case 'wait': { const d = num(ev(s.e), s.line); stats.commands++; push(Math.max(0, d), () => q, grip, grip, s.line); return }
      case 'speed': { const v = num(ev(s.e), s.line); speed = Math.min(100, Math.max(1, v)); return }
      case 'print': {
        if (out.output.length >= LIMITS_SCRIPT.maxOutput) fail('output-limit', s.line, LIMITS_SCRIPT.maxOutput)
        out.output.push(s.es.map((e) => fmt(ev(e))).join(' ')); return
      }
      case 'grip': gripper(s.kind, s.line); return
      case 'halt': throw new Halt()
      case 'repeat': { const n = Math.floor(num(ev(s.n), s.line)); for (let i = 0; i < n; i++) { tick(s.line); run(s.body) } return }
      case 'while': while (truth(ev(s.c), s.line)) { tick(s.line); run(s.body) } return
      case 'for': {
        const from = num(ev(s.from), s.line), to = num(ev(s.to), s.line), st = s.step ? num(ev(s.step), s.line) : 1
        if (st === 0) return fail('div-zero', s.line)
        const own = locals ?? globals
        for (let i = from; st > 0 ? i <= to : i >= to; i += st) { tick(s.line); own.set(s.v, i); run(s.body) }
        return
      }
      case 'if': run(truth(ev(s.c), s.line) ? s.a : s.b); return
      case 'call': {
        const p = program.procs.get(s.name)
        if (!p) return fail('unknown-proc', s.line, s.name)
        if (p.params.length !== s.args.length) return fail('arg-count', s.line, s.name, p.params.length)
        if (depth >= LIMITS_SCRIPT.maxDepth) return fail('depth-limit', s.line, LIMITS_SCRIPT.maxDepth)
        const frame = new Map<string, Value>()
        p.params.forEach((n, i) => frame.set(n, ev(s.args[i])))
        const saved = locals
        locals = frame; depth++
        try { run(p.body) } finally { locals = saved; depth-- }
        return
      }
    }
  }

  try {
    run(program.body)
    out.ok = true
  } catch (e) {
    if (e instanceof Halt) { out.ok = true; out.halted = true } else if (e instanceof Fail) out.error = e.err
    else throw e
  }
  return out
}
const toRad6 = (d: number[]): Joints => d.map((x) => x * DEG) as Joints
