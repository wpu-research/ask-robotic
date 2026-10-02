// "Kodu göster": blok programının JavaScript karşılığı (salt okunur gösterim). Çalıştırmada KULLANILMAZ.
import { isDisabled, topStacks, type ProgramBlock, type ProgramState } from './program'
import type { CodeCtx, GameBlockDef } from './types'

const IND = '  '
const indent = (s: string) => s.split('\n').map((l) => (l ? IND + l : l)).join('\n')

const ident = (s: string, fallback = 'x'): string => {
  const t = s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i').replace(/İ/g, 'I').replace(/[^A-Za-z0-9_$]+/g, '_').replace(/^_+|_+$/g, '')
  return !t ? fallback : /^[0-9]/.test(t) ? `_${t}` : t
}

const OPS: Record<string, string> = { EQ: '===', NEQ: '!==', LT: '<', LTE: '<=', GT: '>', GTE: '>=', ADD: '+', MINUS: '-', MULTIPLY: '*', DIVIDE: '/' }

export function toJavaScript(program: ProgramState, defs: readonly GameBlockDef[] = []): string {
  const byType = new Map(defs.map((d) => [d.type, d]))
  const varNames = new Map((program.variables ?? []).map((v) => [v.id, v.name]))
  const varOf = (v: unknown): string => {
    const id = v && typeof v === 'object' ? String((v as { id?: unknown }).id ?? '') : String(v ?? '')
    return ident(varNames.get(id) ?? id, 'degisken')
  }
  const fld = (b: ProgramBlock, n: string) => b.fields?.[n]
  const inp = (b: ProgramBlock, n: string) => b.inputs?.[n]?.block ?? b.inputs?.[n]?.shadow

  const expr = (b: ProgramBlock | undefined, top = false, fallback = '0'): string => {
    if (!b) return fallback
    const e = (n: string, fb?: string) => expr(inp(b, n), false, fb)
    const wrap = (s: string) => (top ? s : `(${s})`)
    switch (b.type) {
      case 'math_number': return String(Number(fld(b, 'NUM') ?? 0))
      case 'text': return JSON.stringify(String(fld(b, 'TEXT') ?? ''))
      case 'logic_boolean': return fld(b, 'BOOL') === 'TRUE' ? 'true' : 'false'
      case 'logic_null': return 'null'
      case 'logic_negate': return `!${e('BOOL', 'false')}`
      case 'logic_operation': return wrap(`${e('A', 'false')} ${fld(b, 'OP') === 'OR' ? '||' : '&&'} ${e('B', 'false')}`)
      case 'logic_compare': return wrap(`${e('A')} ${OPS[String(fld(b, 'OP'))] ?? '==='} ${e('B')}`)
      case 'logic_ternary': return wrap(`${e('IF', 'false')} ? ${e('THEN', 'null')} : ${e('ELSE', 'null')}`)
      case 'math_arithmetic': {
        const op = String(fld(b, 'OP'))
        return op === 'POWER' ? `Math.pow(${e('A')}, ${e('B')})` : wrap(`${e('A')} ${OPS[op] ?? '+'} ${e('B')}`)
      }
      case 'math_modulo': return wrap(`${e('DIVIDEND')} % ${e('DIVISOR')}`)
      case 'math_single': {
        const op = String(fld(b, 'OP'))
        return op === 'ROOT' ? `Math.sqrt(${e('NUM')})` : op === 'ABS' ? `Math.abs(${e('NUM')})` : op === 'NEG' ? `-${e('NUM')}` : e('NUM')
      }
      case 'math_round': {
        const op = String(fld(b, 'OP'))
        return `Math.${op === 'ROUNDUP' ? 'ceil' : op === 'ROUNDDOWN' ? 'floor' : 'round'}(${e('NUM')})`
      }
      case 'math_random_int': return `randomInt(${e('FROM')}, ${e('TO')})`
      case 'math_number_property': {
        const p = String(fld(b, 'PROPERTY')), x = e('NUMBER_TO_CHECK')
        return p === 'EVEN' ? wrap(`${x} % 2 === 0`) : p === 'ODD' ? wrap(`${x} % 2 === 1`) : p === 'POSITIVE' ? wrap(`${x} > 0`) : p === 'NEGATIVE' ? wrap(`${x} < 0`) : p === 'WHOLE' ? `Number.isInteger(${x})` : wrap(`${x} % ${e('DIVISOR')} === 0`)
      }
      case 'text_join': {
        const parts: string[] = []
        for (let i = 0; b.inputs?.[`ADD${i}`]; i++) parts.push(e(`ADD${i}`, "''"))
        return parts.length ? wrap(parts.join(' + ')) : "''"
      }
      case 'variables_get': return varOf(fld(b, 'VAR'))
      case 'procedures_callreturn': return `${ident(String(fld(b, 'NAME') ?? (b.extraState as { name?: string } | undefined)?.name ?? ''), 'islev')}(${args(b)})`
      default: return custom(b, true)
    }
  }

  const args = (b: ProgramBlock): string => {
    const out: string[] = []
    for (let i = 0; b.inputs?.[`ARG${i}`]; i++) out.push(expr(inp(b, `ARG${i}`), true))
    return out.join(', ')
  }

  const ctxFor = (b: ProgramBlock): CodeCtx => ({
    type: b.type,
    field: (n) => String(fld(b, n) ?? ''),
    value: (n) => expr(inp(b, n), true),
    statements: (n) => indent(stack(b.inputs?.[n]?.block)),
  })

  const custom = (b: ProgramBlock, isValue: boolean): string => {
    const d = byType.get(b.type)
    if (!d || !d.js) return isValue ? `${ident(b.type)}()` : `${ident(b.type)}();\n`
    if (typeof d.js === 'function') return d.js(ctxFor(b))
    const c = ctxFor(b)
    // Deyim girişleri (input_statement) ifade değil, girintili deyim yığını olarak yazılır.
    const stmtInputs = new Set<string>()
    for (const [k, v] of Object.entries(d.json as Record<string, unknown>)) {
      if (!/^args\d+$/.test(k) || !Array.isArray(v)) continue
      for (const a of v as { type?: string; name?: string }[]) if (a?.type === 'input_statement' && a.name) stmtInputs.add(a.name)
    }
    return d.js.replace(/\{([A-Za-z0-9_]+)\}/g, (_, n: string) => (b.fields && n in b.fields ? c.field(n) : stmtInputs.has(n) ? c.statements(n) : b.inputs?.[n] ? c.value(n) : ''))
  }

  const stmt = (b: ProgramBlock): string => {
    const body = (n: string) => indent(stack(b.inputs?.[n]?.block))
    switch (b.type) {
      case 'controls_repeat_ext': return `for (let i = 0; i < ${expr(inp(b, 'TIMES'), true)}; i++) {\n${body('DO')}}\n`
      case 'controls_repeat': return `for (let i = 0; i < ${Number(fld(b, 'TIMES') ?? 0)}; i++) {\n${body('DO')}}\n`
      case 'controls_whileUntil': {
        const c = expr(inp(b, 'BOOL'), true, 'false')
        return `while (${fld(b, 'MODE') === 'UNTIL' ? `!(${c})` : c}) {\n${body('DO')}}\n`
      }
      case 'controls_for': {
        const v = varOf(fld(b, 'VAR'))
        const from = expr(inp(b, 'FROM'), true), to = expr(inp(b, 'TO'), true), by = expr(inp(b, 'BY'), true, '1')
        return `for (let ${v} = ${from}; ${v} <= ${to}; ${v} += ${by}) {\n${body('DO')}}\n`
      }
      case 'controls_if': {
        let s = ''
        for (let i = 0; b.inputs?.[`IF${i}`] || b.inputs?.[`DO${i}`]; i++) {
          s += `${i === 0 ? 'if' : ' else if'} (${expr(inp(b, `IF${i}`), true, 'false')}) {\n${body(`DO${i}`)}}`
        }
        if (b.inputs?.ELSE) s += ` else {\n${body('ELSE')}}`
        return s + '\n'
      }
      case 'controls_flow_statements': return fld(b, 'FLOW') === 'CONTINUE' ? 'continue;\n' : 'break;\n'
      case 'variables_set': return `${varOf(fld(b, 'VAR'))} = ${expr(inp(b, 'VALUE'), true)};\n`
      case 'math_change': return `${varOf(fld(b, 'VAR'))} += ${expr(inp(b, 'DELTA'), true)};\n`
      case 'procedures_callnoreturn': return `${ident(String(fld(b, 'NAME') ?? (b.extraState as { name?: string } | undefined)?.name ?? ''), 'islev')}(${args(b)});\n`
      case 'procedures_ifreturn': return `if (${expr(inp(b, 'CONDITION'), true, 'false')}) {\n${indent(`return ${expr(inp(b, 'VALUE'), true, 'null')};\n`)}}\n`
      default: {
        const s = custom(b, false)
        return s.endsWith('\n') ? s : s + '\n'
      }
    }
  }

  function stack(first: ProgramBlock | undefined): string {
    let s = ''
    for (let b = first; b; b = b.next?.block ?? b.next?.shadow) if (!isDisabled(b)) s += stmt(b)
    return s
  }

  const def = (b: ProgramBlock): string => {
    const name = ident(String(fld(b, 'NAME') ?? ''), 'islev')
    const params = ((b.extraState as { params?: { name?: string }[] } | undefined)?.params ?? []).map((p) => ident(String(p?.name ?? ''), 'p'))
    const ret = b.type === 'procedures_defreturn' ? indent(`return ${expr(inp(b, 'RETURN'), true, 'null')};\n`) : ''
    return `function ${name}(${params.join(', ')}) {\n${indent(stack(b.inputs?.STACK?.block))}${ret}}\n`
  }

  const defsCode: string[] = []
  const mainCode: string[] = []
  for (const t of topStacks(program)) {
    if (isDisabled(t)) continue
    if (t.type === 'procedures_defnoreturn' || t.type === 'procedures_defreturn') { defsCode.push(def(t)); continue }
    const d = byType.get(t.type)
    // başlık blokları: yalnız gövdeyi yaz (başlık bir yorum satırı olarak)
    if (d?.hat) {
      const head = typeof d.js === 'string' ? d.js : d.js ? d.js(ctxFor(t)) : ''
      mainCode.push(head ? `${head.trim()}\n${stack(t.next?.block)}` : stack(t.next?.block))
    } else mainCode.push(stack(t))
  }
  const vars = [...new Set((program.variables ?? []).map((v) => ident(v.name, 'degisken')))]
  const header = vars.length ? `let ${vars.join(', ')};\n\n` : ''
  return (header + [...defsCode, ...mainCode].filter(Boolean).join('\n')).trimEnd() + '\n'
}
