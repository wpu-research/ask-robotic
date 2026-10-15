// Blok programından JavaScript ve Python (MicroPython benzeri) kodu üretir. Kod kendi API'mizi kullanır (README'de tanımlı).
// Görünüm salt okunurdur; çalıştırma yorumlayıcıdan yapılır, üretilen kod çalıştırılmaz.
import { BLOCK_BY_TYPE, type Arg, type Spec } from './blocks'
import { cellsToRows } from './icons'
import { fieldVarName, topBlocks, variableNames } from './program'
import type { PBlock, WorkspaceState } from './types'

export type Lang = 'js' | 'py'
interface Expr { c: string; p: number }
// öncelik sınıfları (küçük = sıkı bağlanır)
const ATOM = 0, UNARY = 2, MUL = 3, ADD = 4, REL = 5, EQ = 6, AND = 7, OR = 8, TERN = 9

const JS_RESERVED = new Set('break case catch class const continue debugger default delete do else export extends finally for function if import in instanceof new return super switch this throw try typeof var void while with yield let static enum await implements package protected interface private public null true false undefined card screen input music radio pins robot console Math String Number'.split(' '))
const PY_RESERVED = new Set('False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield card screen input music radio pins robot print len str float int min max abs pow round'.split(' '))

const TR_MAP: Record<string, string> = { ç: 'c', Ç: 'C', ğ: 'g', Ğ: 'G', ı: 'i', İ: 'I', ö: 'o', Ö: 'O', ş: 's', Ş: 'S', ü: 'u', Ü: 'U' }
export function ident(name: string, lang: Lang): string {
  let s = [...name].map((ch) => TR_MAP[ch] ?? ch).join('').replace(/[^A-Za-z0-9_]/g, '_')
  if (!s || /^[0-9]/.test(s)) s = `_${s}`
  if ((lang === 'js' ? JS_RESERVED : PY_RESERVED).has(s)) s += '_'
  return s
}
const snake = (s: string) => s.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`)
const q = (s: string) => JSON.stringify(s)

const wrap = (e: Expr, max: number) => (e.p > max ? `(${e.c})` : e.c)

class Gen {
  names: Map<string, string>
  private loops = 0
  constructor(readonly lang: Lang, ws: WorkspaceState) { this.names = variableNames(ws) }
  private get js() { return this.lang === 'js' }
  private v(n: string) { return ident(n, this.lang) }
  varName(b: PBlock, f = 'VAR') { return this.v(fieldVarName(b, this.names, f)) }

  // ---------- ifadeler ----------
  input(b: PBlock, name: string): Expr {
    const inp = b.inputs?.[name]
    const blk = inp?.block ?? inp?.shadow
    return blk ? this.expr(blk) : { c: '0', p: ATOM }
  }
  private num(n: unknown): Expr {
    const x = Number(n)
    const s = Number.isFinite(x) ? String(x) : '0'
    return { c: s, p: x < 0 ? UNARY : ATOM }
  }
  private bin(b: PBlock, op: string, p: number, a = 'A', c = 'B'): Expr {
    return { c: `${wrap(this.input(b, a), p)} ${op} ${wrapStrict(this.input(b, c), p)}`, p }
  }

  expr(b: PBlock): Expr {
    const js = this.js
    switch (b.type) {
      case 'math_number': return this.num(b.fields?.NUM)
      case 'text': return { c: q(String(b.fields?.TEXT ?? '')), p: ATOM }
      case 'logic_boolean': { const t = b.fields?.BOOL === 'TRUE'; return { c: js ? String(t) : t ? 'True' : 'False', p: ATOM } }
      case 'logic_compare': {
        const ops: Record<string, string> = { EQ: '==', NEQ: '!=', LT: '<', LTE: '<=', GT: '>', GTE: '>=' }
        const op = String(b.fields?.OP ?? 'EQ')
        return this.bin(b, ops[op] ?? '==', op === 'EQ' || op === 'NEQ' ? EQ : REL)
      }
      case 'logic_operation': {
        const or = b.fields?.OP === 'OR'
        return this.bin(b, js ? (or ? '||' : '&&') : or ? 'or' : 'and', or ? OR : AND)
      }
      case 'logic_negate': return { c: `${js ? '!' : 'not '}${wrap(this.input(b, 'BOOL'), UNARY)}`, p: UNARY }
      case 'logic_ternary': {
        const c = this.input(b, 'IF'), t = this.input(b, 'THEN'), e = this.input(b, 'ELSE')
        return { c: js ? `${wrap(c, OR)} ? ${wrap(t, OR)} : ${wrap(e, OR)}` : `${wrap(t, OR)} if ${wrap(c, OR)} else ${wrap(e, OR)}`, p: TERN }
      }
      case 'math_arithmetic': {
        const op = String(b.fields?.OP ?? 'ADD')
        if (op === 'POWER') return { c: `${js ? 'Math.pow' : 'pow'}(${this.input(b, 'A').c}, ${this.input(b, 'B').c})`, p: ATOM }
        const map: Record<string, [string, number]> = { ADD: ['+', ADD], MINUS: ['-', ADD], MULTIPLY: ['*', MUL], DIVIDE: ['/', MUL] }
        const [s, p] = map[op] ?? map.ADD
        return this.bin(b, s, p)
      }
      case 'math_modulo': return this.bin(b, '%', MUL, 'DIVIDEND', 'DIVISOR')
      case 'math_single': {
        const x = this.input(b, 'NUM')
        const fn: Record<string, [string, string]> = { ROOT: ['Math.sqrt', 'sqrt'], ABS: ['Math.abs', 'abs'], LN: ['Math.log', 'log'], LOG10: ['Math.log10', 'log10'], EXP: ['Math.exp', 'exp'] }
        const op = String(b.fields?.OP ?? 'ABS')
        if (op === 'NEG') return { c: `-${wrap(x, UNARY)}`, p: UNARY }
        if (op === 'POW10') return { c: `${js ? 'Math.pow' : 'pow'}(10, ${x.c})`, p: ATOM }
        const f = fn[op] ?? fn.ABS
        return { c: `${js ? f[0] : f[1]}(${x.c})`, p: ATOM }
      }
      case 'math_round': {
        const op = String(b.fields?.OP ?? 'ROUND')
        const f = op === 'ROUNDUP' ? ['Math.ceil', 'ceil'] : op === 'ROUNDDOWN' ? ['Math.floor', 'floor'] : ['Math.round', 'round']
        return { c: `${js ? f[0] : f[1]}(${this.input(b, 'NUM').c})`, p: ATOM }
      }
      case 'math_constrain': {
        const v = this.input(b, 'VALUE').c, lo = this.input(b, 'LOW').c, hi = this.input(b, 'HIGH').c
        return { c: js ? `Math.min(Math.max(${v}, ${lo}), ${hi})` : `min(max(${v}, ${lo}), ${hi})`, p: ATOM }
      }
      case 'math_random_int': return { c: `${js ? 'randomInt' : 'random_int'}(${this.input(b, 'FROM').c}, ${this.input(b, 'TO').c})`, p: ATOM }
      case 'math_number_property': {
        const x = this.input(b, 'NUMBER_TO_CHECK')
        const prop = String(b.fields?.PROPERTY ?? 'EVEN')
        switch (prop) {
          case 'EVEN': return { c: `${wrap(x, MUL)} % 2 == 0`, p: EQ }
          case 'ODD': return { c: `${wrap(x, MUL)} % 2 == 1`, p: EQ }
          case 'PRIME': return { c: `${js ? 'isPrime' : 'is_prime'}(${x.c})`, p: ATOM }
          case 'WHOLE': return { c: `${js ? 'isWhole' : 'is_whole'}(${x.c})`, p: ATOM }
          case 'POSITIVE': return { c: `${wrap(x, REL)} > 0`, p: REL }
          case 'NEGATIVE': return { c: `${wrap(x, REL)} < 0`, p: REL }
          default: return { c: `${wrap(x, MUL)} % ${wrapStrict(this.input(b, 'DIVISOR'), MUL)} == 0`, p: EQ }
        }
      }
      case 'text_join': {
        const n = (b.extraState as { itemCount?: number } | undefined)?.itemCount ?? 2
        const items = Array.from({ length: n }, (_, i) => {
          const e = this.input(b, `ADD${i}`)
          return e.c.startsWith('"') && !e.c.includes('" +') ? e.c : js ? `String(${e.c})` : `str(${e.c})`
        })
        return js ? { c: `[${items.join(', ')}].join("")`, p: ATOM } : { c: `"".join([${items.join(', ')}])`, p: ATOM }
      }
      case 'lists_create_with': {
        const n = (b.extraState as { itemCount?: number } | undefined)?.itemCount ?? 3
        return { c: `[${Array.from({ length: n }, (_, i) => this.input(b, `ADD${i}`).c).join(', ')}]`, p: ATOM }
      }
      case 'variables_get': return { c: this.varName(b), p: ATOM }
      case 'procedures_callreturn': return { c: this.callCode(b), p: ATOM }
      default: {
        const s = BLOCK_BY_TYPE[b.type]
        if (s) return { c: this.spec(b, s), p: s.prec ?? ATOM }
        return { c: js ? '/* ? */ 0' : '0  # bilinmeyen blok', p: ATOM }
      }
    }
  }

  private callCode(b: PBlock): string {
    const name = String((b.extraState as { name?: string } | undefined)?.name ?? b.fields?.NAME ?? '')
    const args: string[] = []
    for (let i = 0; b.inputs?.[`ARG${i}`]; i++) args.push(this.input(b, `ARG${i}`).c)
    return `${ident(name, this.lang)}(${args.join(', ')})`
  }

  /** Özel blok kodu: şablon varsa o, yoksa çağrı biçimi. */
  private spec(b: PBlock, s: Spec): string {
    const tpl = this.js ? s.js : s.py
    const args = s.args ?? []
    if (tpl) {
      return tpl.replace(/\{(\(?)(\w+)\)?\}/g, (_m, paren: string, name: string) => {
        const a = args.find((x) => x.n === name)
        if (!a) return ''
        if (a.k === 'drop' || a.k === 'num') return String(b.fields?.[name] ?? '')
        const e = this.input(b, name)
        return paren ? wrap(e, ATOM) : e.c
      })
    }
    const call = this.js ? s.call! : s.call!.split('.').map((seg, i, arr) => (i === arr.length - 1 ? snake(seg) : seg)).join('.')
    const names = s.params ?? args.map((a) => a.n)
    const parts = names.map((n) => this.argCode(b, args.find((a) => a.n === n)!))
    return `${call}(${parts.join(', ')})`
  }
  private argCode(b: PBlock, a: Arg): string {
    switch (a.k) {
      case 'drop': { const v = String(b.fields?.[a.n] ?? a.def ?? ''); return a.numeric ? v : q(v) }
      case 'num': return String(b.fields?.[a.n] ?? a.def)
      case 'leds': return `[${cellsToRows(String(b.fields?.[a.n] ?? '0'.repeat(25))).map(q).join(', ')}]`
      default: return this.input(b, a.n).c
    }
  }

  // ---------- deyimler ----------
  private ind = (n: number) => (this.js ? '  ' : '    ').repeat(n)

  chain(first: PBlock | undefined, depth: number): string[] {
    const out: string[] = []
    for (let b = first; b; b = b.next?.block) {
      if (b.disabled) continue
      out.push(...this.stmt(b, depth))
    }
    return out
  }
  private body(first: PBlock | undefined, depth: number): string[] {
    const l = this.chain(first, depth)
    return l.length ? l : this.js ? [] : [`${this.ind(depth)}pass`]
  }
  private open(head: string, depth: number) { return this.js ? `${this.ind(depth)}${head} {` : `${this.ind(depth)}${head}:` }
  private close(depth: number): string[] { return this.js ? [`${this.ind(depth)}}`] : [] }

  stmt(b: PBlock, d: number): string[] {
    const js = this.js, I = this.ind(d)
    switch (b.type) {
      case 'controls_if': {
        const out: string[] = []
        let i = 0
        for (; b.inputs?.[`IF${i}`] || b.inputs?.[`DO${i}`]; i++) {
          const cond = this.input(b, `IF${i}`).c
          const head = i === 0 ? 'if' : js ? '} else if' : 'elif'
          out.push(js ? (i === 0 ? `${I}if (${cond}) {` : `${I}} else if (${cond}) {`) : `${I}${head} ${cond}:`)
          out.push(...this.body(b.inputs?.[`DO${i}`]?.block, d + 1))
        }
        if (b.inputs?.ELSE) {
          out.push(js ? `${I}} else {` : `${I}else:`)
          out.push(...this.body(b.inputs.ELSE.block, d + 1))
        }
        out.push(...this.close(d))
        return out
      }
      case 'controls_repeat_ext': {
        const n = this.input(b, 'TIMES')
        const lv = `_${'ijklmn'[Math.min(this.loops, 5)]}`
        this.loops++
        const body = this.body(b.inputs?.DO?.block, d + 1)
        this.loops--
        return [this.open(js ? `for (let ${lv} = 0; ${lv} < ${wrap(n, REL)}; ${lv}++)` : `for _ in range(int(${n.c}))`, d), ...body, ...this.close(d)]
      }
      case 'controls_whileUntil': {
        const cond = this.input(b, 'BOOL')
        const until = b.fields?.MODE === 'UNTIL'
        const c = until ? (js ? `!${wrap(cond, UNARY)}` : `not ${wrap(cond, UNARY)}`) : cond.c
        return [this.open(js ? `while (${c})` : `while ${c}`, d), ...this.body(b.inputs?.DO?.block, d + 1), ...this.close(d)]
      }
      case 'controls_for': {
        const v = this.varName(b)
        const from = this.input(b, 'FROM'), to = this.input(b, 'TO'), by = this.input(b, 'BY')
        const desc = isNum(from.c) && isNum(to.c) && Number(from.c) > Number(to.c)
        const head = js
          ? `for (${v} = ${from.c}; ${v} ${desc ? '>=' : '<='} ${to.c}; ${v} ${desc ? '-=' : '+='} ${by.c})`
          : desc ? `for ${v} in range(${from.c}, ${isNum(to.c) ? Number(to.c) - 1 : `${wrap(to, ADD)} - 1`}, -${wrap(by, UNARY)})` : `for ${v} in range(${from.c}, ${isNum(to.c) ? Number(to.c) + 1 : `${wrap(to, ADD)} + 1`}, ${by.c})`
        return [this.open(head, d), ...this.body(b.inputs?.DO?.block, d + 1), ...this.close(d)]
      }
      case 'controls_forEach': {
        const v = this.varName(b)
        const head = js ? `for (${v} of ${this.input(b, 'LIST').c})` : `for ${v} in ${this.input(b, 'LIST').c}`
        return [this.open(head, d), ...this.body(b.inputs?.DO?.block, d + 1), ...this.close(d)]
      }
      case 'controls_flow_statements': return [`${I}${b.fields?.FLOW === 'CONTINUE' ? 'continue' : 'break'}${js ? ';' : ''}`]
      case 'variables_set': return [`${I}${this.varName(b)} = ${this.input(b, 'VALUE').c}${js ? ';' : ''}`]
      case 'math_change': return [`${I}${this.varName(b)} += ${this.input(b, 'DELTA').c}${js ? ';' : ''}`]
      case 'procedures_callnoreturn': return [`${I}${this.callCode(b)}${js ? ';' : ''}`]
      case 'procedures_ifreturn': {
        const ret = b.inputs?.VALUE ? ` ${this.input(b, 'VALUE').c}` : ''
        const cond = this.input(b, 'CONDITION').c
        return js ? [`${I}if (${cond}) {`, `${this.ind(d + 1)}return${ret};`, `${I}}`] : [`${I}if ${cond}:`, `${this.ind(d + 1)}return${ret}`]
      }
      case 'procedures_defnoreturn': case 'procedures_defreturn': return []
      default: {
        const s = BLOCK_BY_TYPE[b.type]
        if (!s) return [`${I}${js ? '//' : '#'} bilinmeyen blok: ${b.type}`]
        if (s.kind === 'hat') return []
        return [`${I}${this.spec(b, s)}${js && !/;\s*$/.test(this.spec(b, s)) ? ';' : ''}`]
      }
    }
  }
}

const isNum = (s: string) => /^-?\d+(\.\d+)?$/.test(s)
/** Sağ operand: eşit önceliklilerde de parantez (a - (b - c)). */
const wrapStrict = (e: Expr, max: number) => (e.p >= max && e.p !== ATOM ? `(${e.c})` : e.c)

function assignedVars(first: PBlock | undefined, g: Gen, out: Set<string>) {
  const visit = (b: PBlock | undefined) => {
    for (let c = b; c; c = c.next?.block) {
      if (c.type === 'variables_set' || c.type === 'math_change' || c.type === 'controls_for' || c.type === 'controls_forEach') out.add(g.varName(c))
      for (const inp of Object.values(c.inputs ?? {})) if (inp.block && !isValueBlock(inp.block)) visit(inp.block)
    }
  }
  visit(first)
}
const isValueBlock = (b: PBlock) => { const s = BLOCK_BY_TYPE[b.type]; return s ? s.kind === 'value' || s.kind === 'bool' : /^(math_|logic_|text|lists_|variables_get|procedures_callreturn)/.test(b.type) }

/** Üst düzey blokların okuma sırası: yukarıdan aşağıya, soldan sağa. */
const byPosition = (a: PBlock, b: PBlock) => (a.y ?? 0) - (b.y ?? 0) || (a.x ?? 0) - (b.x ?? 0)

export function generate(ws: WorkspaceState, lang: Lang): string {
  const g = new Gen(lang, ws)
  const js = lang === 'js'
  const tops = [...topBlocks(ws)].filter((b) => !b.disabled).sort(byPosition)
  const procs = tops.filter((b) => b.type === 'procedures_defnoreturn' || b.type === 'procedures_defreturn')
  const paramNames = new Set<string>()
  for (const p of procs) for (const x of (p.extraState as { params?: { name: string }[] } | undefined)?.params ?? []) paramNames.add(x.name)
  const varNames = [...new Set((ws.variables ?? []).map((v) => v.name).filter((n) => !paramNames.has(n)))]

  const out: string[] = []
  out.push(js ? '// Mikro Kart — JavaScript görünümü (salt okunur; bloklardan üretilir)' : '# Mikro Kart — Python görünümü (MicroPython benzeri, salt okunur; bloklardan üretilir)')
  if (!js) out.push('from mikrokart import *')
  out.push('')
  if (varNames.length) {
    if (js) out.push(`let ${varNames.map((n) => `${ident(n, 'js')} = 0`).join(', ')};`)
    else for (const n of varNames) out.push(`${ident(n, 'py')} = 0`)
    out.push('')
  }
  const used = new Map<string, number>()
  const fnName = (base: string) => { const n = (used.get(base) ?? 0) + 1; used.set(base, n); return n === 1 ? base : `${base}_${n}` }

  for (const p of procs) {
    const name = ident(String(p.fields?.NAME ?? 'fonksiyon'), lang)
    const params = ((p.extraState as { params?: { name: string }[] } | undefined)?.params ?? []).map((x) => ident(x.name, lang))
    const ret = p.type === 'procedures_defreturn' && p.inputs?.RETURN ? g.input(p, 'RETURN').c : null
    const body = g.chain(p.inputs?.STACK?.block, 1)
    if (js) {
      out.push(`function ${name}(${params.join(', ')}) {`, ...body)
      if (ret !== null) out.push(`  return ${ret};`)
      out.push('}', '')
    } else {
      const glob = new Set<string>()
      assignedVars(p.inputs?.STACK?.block, g, glob)
      for (const x of params) glob.delete(x)
      out.push(`def ${name}(${params.join(', ')}):`)
      if (glob.size) out.push(`    global ${[...glob].join(', ')}`)
      out.push(...body)
      if (ret !== null) out.push(`    return ${ret}`)
      if (!body.length && ret === null) out.push('    pass')
      out.push('')
    }
  }

  for (const t of tops) {
    if (procs.includes(t)) continue
    const s = BLOCK_BY_TYPE[t.type]
    if (!s || s.kind !== 'hat') {
      // başlıksız yığın çalışmaz: yorum olarak göster
      const lines = g.chain(t, 0)
      out.push(js ? '// Başlıksız blok yığını (çalışmaz):' : '# Başlıksız blok yığını (çalışmaz):', ...lines.map((l) => (js ? '// ' : '# ') + l), '')
      continue
    }
    const call = js ? s.call! : s.call!.split('.').map((x, i, a) => (i === a.length - 1 ? snake(x) : x)).join('.')
    const params = (s.params ?? (s.args ?? []).map((a) => a.n)).map((n) => g['argCode'](t, (s.args ?? []).find((a) => a.n === n)!))
    const body = g.chain(t.inputs?.DO?.block, 1)
    if (js) {
      out.push(`${call}(${[...params, '() => {'].join(', ')}`)
      out.push(...body, '});', '')
    } else {
      const slug = [call.split('.').pop(), ...(s.params ?? (s.args ?? []).map((a) => a.n)).map((n) => String(t.fields?.[n] ?? '').toLowerCase())].join('_').replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/_$/, '')
      const fn = fnName(slug)
      const glob = new Set<string>()
      assignedVars(t.inputs?.DO?.block, g, glob)
      out.push(`def ${fn}():`)
      if (glob.size) out.push(`    global ${[...glob].join(', ')}`)
      out.push(...(body.length ? body : ['    pass']))
      out.push(`${call}(${[...params, fn].join(', ')})`, '')
    }
  }
  while (out.length && out[out.length - 1] === '') out.pop()
  return out.join('\n') + '\n'
}

export const toJavaScript = (ws: WorkspaceState) => generate(ws, 'js')
export const toPython = (ws: WorkspaceState) => generate(ws, 'py')
