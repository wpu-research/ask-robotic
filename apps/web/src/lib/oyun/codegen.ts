// "JavaScript" sekmesi: blok programının okunabilir JavaScript karşılığı (salt okunur gösterim; çalıştırmada KULLANILMAZ).
// Çalıştırma blokları doğrudan yorumlayıcıyla (interp.ts) yapılır; bu yüzden eval/Function yoktur.
import { BLOCK_BY_TYPE } from './blocks'
import { colorIndex } from './palette'
import { HAT_TYPES, isEnabled, topBlocks } from './interp'
import type { BlockNode, BlockState } from './types'

const IND = '  '
const indent = (s: string): string => s.split('\n').map((l) => (l ? IND + l : l)).join('\n')
const inp = (b: BlockNode, n: string): BlockNode | undefined => b.inputs?.[n]?.block ?? b.inputs?.[n]?.shadow

export function ident(s: string, fallback = 'x'): string {
  const t = s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i').replace(/İ/g, 'I').replace(/[^A-Za-z0-9_$]+/g, '_').replace(/^_+|_+$/g, '')
  return !t ? fallback : /^[0-9]/.test(t) ? `_${t}` : t
}

const OPS: Record<string, string> = { EQ: '===', NEQ: '!==', LT: '<', LTE: '<=', GT: '>', GTE: '>=', ADD: '+', MINUS: '-', MULTIPLY: '*', DIVIDE: '/' }
/** Alan değerinin tırnaksız, özellik adı olarak yazıldığı bloklar. */
const RAW_FIELDS: Record<string, Record<string, string>> = {
  sprite_oku: { x: 'x', y: 'y', vx: 'hizX', vy: 'hizY', w: 'genislik', h: 'yukseklik', dir: 'yon', life: 'omur' },
  harita_boyut: { cols: 'sutunSayisi', rows: 'satirSayisi' },
  harita_olay_karo: { col: 'sutun', row: 'satir' },
}
const LOOP_VARS = ['i', 'j', 'k', 'l', 'm', 'n']

export function toJavaScript(state: BlockState): string {
  const names = new Map((state.variables ?? []).map((x) => [x.id, ident(x.name, 'degisken')]))
  const varOf = (b: BlockNode): string => {
    const f = b.fields?.VAR as { id?: string } | string | undefined
    const id = typeof f === 'string' ? f : String(f?.id ?? '')
    return names.get(id) ?? ident(id, 'degisken')
  }
  const procParams = new Set<string>()
  const tops = topBlocks(state).filter(isEnabled)
  for (const t of tops) if (t.type.startsWith('procedures_def')) for (const p of ((t.extraState as { params?: { id: string }[] } | undefined)?.params ?? [])) procParams.add(p.id)

  const fieldJs = (type: string, name: string, b: BlockNode): string => {
    const a = BLOCK_BY_TYPE[type]?.args[name]
    const raw = b.fields?.[name]
    if (a?.t === 'col') return String(colorIndex(raw, 0))
    if (a?.t === 'fnum') return String(Number(raw ?? a.v))
    if (a?.t === 'dd' && a.opts.length === 2 && a.opts[0][1] === 'true') return raw === 'true' ? 'true' : 'false'
    return JSON.stringify(String(raw ?? (a?.t === 'ftxt' ? a.v : '')))
  }

  const expr = (b: BlockNode | undefined, top = false, fb = '0', depth = 0): string => {
    if (!b) return fb
    const e = (n: string, f?: string) => expr(inp(b, n), false, f ?? '0', depth)
    const wrap = (s: string) => (top ? s : `(${s})`)
    switch (b.type) {
      case 'math_number': { const n = Number(b.fields?.NUM ?? 0); return n < 0 && !top ? `(${n})` : String(n) }
      case 'text': return JSON.stringify(String(b.fields?.TEXT ?? ''))
      case 'oyun_resim': return JSON.stringify(String(b.fields?.IMG ?? ''))
      case 'oyun_harita': return JSON.stringify(String(b.fields?.MAP ?? ''))
      case 'logic_boolean': return b.fields?.BOOL === 'TRUE' ? 'true' : 'false'
      case 'logic_null': return 'null'
      case 'logic_negate': return `!${e('BOOL', 'false')}`
      case 'logic_operation': return wrap(`${e('A', 'false')} ${b.fields?.OP === 'OR' ? '||' : '&&'} ${e('B', 'false')}`)
      case 'logic_compare': return wrap(`${e('A')} ${OPS[String(b.fields?.OP)] ?? '==='} ${e('B')}`)
      case 'logic_ternary': return wrap(`${e('IF', 'false')} ? ${e('THEN', 'null')} : ${e('ELSE', 'null')}`)
      case 'math_arithmetic': { const op = String(b.fields?.OP); return op === 'POWER' ? `Math.pow(${e('A')}, ${e('B')})` : wrap(`${e('A')} ${OPS[op] ?? '+'} ${e('B')}`) }
      case 'math_modulo': return wrap(`${e('DIVIDEND')} % ${e('DIVISOR')}`)
      case 'math_single': {
        const op = String(b.fields?.OP)
        const m: Record<string, string> = { ROOT: 'Math.sqrt', ABS: 'Math.abs', LN: 'Math.log', LOG10: 'Math.log10', EXP: 'Math.exp' }
        return op === 'NEG' ? `-${e('NUM')}` : op === 'POW10' ? `Math.pow(10, ${e('NUM')})` : `${m[op] ?? 'Math.abs'}(${e('NUM')})`
      }
      case 'math_round': { const op = String(b.fields?.OP); return `Math.${op === 'ROUNDUP' ? 'ceil' : op === 'ROUNDDOWN' ? 'floor' : 'round'}(${e('NUM')})` }
      case 'math_random_int': return `rastgele(${e('FROM')}, ${e('TO')})`
      case 'math_constrain': return `Math.min(Math.max(${e('VALUE')}, ${e('LOW')}), ${e('HIGH')})`
      case 'math_number_property': {
        const p = String(b.fields?.PROPERTY), x = e('NUMBER_TO_CHECK')
        return p === 'EVEN' ? wrap(`${x} % 2 === 0`) : p === 'ODD' ? wrap(`${x} % 2 === 1`) : p === 'POSITIVE' ? wrap(`${x} > 0`) : p === 'NEGATIVE' ? wrap(`${x} < 0`) : p === 'WHOLE' ? `Number.isInteger(${x})` : p === 'PRIME' ? `asalMi(${x})` : wrap(`${x} % ${e('DIVISOR')} === 0`)
      }
      case 'text_join': {
        const cnt = ((b.extraState as { itemCount?: number } | undefined)?.itemCount) ?? 2
        const parts: string[] = []
        for (let i = 0; i < cnt; i++) parts.push(e(`ADD${i}`, "''"))
        return parts.length ? wrap(`"" + ${parts.join(' + ')}`) : "''"
      }
      case 'variables_get': return varOf(b)
      case 'procedures_callreturn': return callJs(b)
      default: {
        const def = BLOCK_BY_TYPE[b.type]
        if (!def || def.shape !== 'val') return `/* ${b.type} */ null`
        return tpl(def.js, b, depth, def.type)
      }
    }
  }

  const callJs = (b: BlockNode): string => {
    const name = ident(String((b.extraState as { name?: string } | undefined)?.name ?? b.fields?.NAME ?? 'f'), 'f')
    const args: string[] = []
    for (let i = 0; b.inputs?.[`ARG${i}`]; i++) args.push(expr(inp(b, `ARG${i}`), true))
    return `${name}(${args.join(', ')})`
  }

  /** Şablondaki {AD} yer tutucularını doldurur. */
  const tpl = (t: string, b: BlockNode, depth: number, type: string): string => {
    const def = BLOCK_BY_TYPE[type]
    return t.replace(/\{([A-Z0-9_]+)\}/g, (_m, name: string) => {
      if (name === 'DO') return indent(stmts(inp(b, 'DO'), depth + 1)) || ''
      const a = def?.args[name]
      if (!a) return name.toLowerCase()
      if (a.t === 'dd' || a.t === 'kind' || a.t === 'col' || a.t === 'fnum' || a.t === 'ftxt') {
        // sprite_oku: {P} bir özellik adıdır (x, y, vx ...), tırnaksız yazılır
        if (type in RAW_FIELDS) { const raw = String(b.fields?.[name] ?? ''); return RAW_FIELDS[type][raw] ?? raw }
        return fieldJs(type, name, b)
      }
      if (a.t === 'spr') return expr(inp(b, name), true, 'bu')
      return expr(inp(b, name), true, a.t === 'txt' ? "''" : '0')
    })
  }

  let loopLevel = 0
  const stmts = (first: BlockNode | undefined, depth = 0): string => {
    const out: string[] = []
    for (let b = first; b; b = b.next?.block) {
      if (!isEnabled(b)) continue
      const s = stmt(b, depth)
      if (s) out.push(s)
    }
    return out.join('\n')
  }

  const stmt = (b: BlockNode, depth: number): string => {
    switch (b.type) {
      case 'controls_if': {
        const st = (b.extraState ?? {}) as { hasElse?: boolean; elseIfCount?: number }
        let s = ''
        for (let i = 0; i <= (st.elseIfCount ?? 0); i++) {
          s += `${i === 0 ? 'if' : ' else if'} (${expr(inp(b, `IF${i}`), true, 'false')}) {\n${indent(stmts(inp(b, `DO${i}`), depth + 1))}\n}`
        }
        if (st.hasElse || inp(b, 'ELSE')) s += ` else {\n${indent(stmts(inp(b, 'ELSE'), depth + 1))}\n}`
        return s.replace(/\{\n\n\}/g, '{\n}')
      }
      case 'controls_repeat_ext': {
        const i = LOOP_VARS[loopLevel % LOOP_VARS.length]
        const times = expr(inp(b, 'TIMES'), true)
        loopLevel++
        const body = stmts(inp(b, 'DO'), depth + 1)
        loopLevel--
        return `for (let ${i} = 0; ${i} < ${times}; ${i}++) {\n${indent(body)}\n}`
      }
      case 'controls_whileUntil': { const c = expr(inp(b, 'BOOL'), true, 'false'); return `while (${b.fields?.MODE === 'UNTIL' ? `!(${c})` : c}) {\n${indent(stmts(inp(b, 'DO'), depth + 1))}\n}` }
      case 'controls_for': { const x = varOf(b); return `for (let ${x} = ${expr(inp(b, 'FROM'), true, '1')}; ${x} <= ${expr(inp(b, 'TO'), true, '10')}; ${x} += ${expr(inp(b, 'BY'), true, '1')}) {\n${indent(stmts(inp(b, 'DO'), depth + 1))}\n}` }
      case 'controls_flow_statements': return b.fields?.FLOW === 'BREAK' ? 'break' : 'continue'
      case 'variables_set': return `${varOf(b)} = ${expr(inp(b, 'VALUE'), true)}`
      case 'math_change': return `${varOf(b)} += ${expr(inp(b, 'DELTA'), true, '1')}`
      case 'procedures_callnoreturn': return callJs(b)
      case 'procedures_ifreturn': return `if (${expr(inp(b, 'CONDITION'), true, 'false')}) return ${expr(inp(b, 'VALUE'), true, 'null')}`
      default: {
        const def = BLOCK_BY_TYPE[b.type]
        if (!def) return `/* bilinmeyen blok: ${b.type} */`
        if (def.shape === 'val') return `${expr(b, true)}`
        return tpl(def.js, b, depth, def.type)
      }
    }
  }

  const header: string[] = []
  const varList = [...new Set((state.variables ?? []).filter((x) => !procParams.has(x.id)).map((x) => ident(x.name, 'degisken')))]
  if (varList.length) header.push(`let ${varList.join(', ')}`)

  const parts: string[] = []
  const loose: string[] = []
  for (const t of tops) {
    if (t.type === 'procedures_defnoreturn' || t.type === 'procedures_defreturn') {
      const name = ident(String(t.fields?.NAME ?? 'f'), 'f')
      const params = ((t.extraState as { params?: { name: string }[] } | undefined)?.params ?? []).map((p) => ident(p.name, 'p'))
      let body = stmts(inp(t, 'STACK'), 1)
      if (t.type === 'procedures_defreturn') body = [body, `return ${expr(inp(t, 'RETURN'), true, 'null')}`].filter(Boolean).join('\n')
      parts.push(`function ${name}(${params.join(', ')}) {\n${indent(body)}\n}`)
    } else if ((HAT_TYPES as readonly string[]).includes(t.type)) {
      parts.push(tpl(BLOCK_BY_TYPE[t.type].js, t, 0, t.type).replace(/\{\n\n\}|\(\) => \{\n\n\}/g, (m) => m.replace('\n\n', '\n')))
    } else loose.push(t.type)
  }
  const out = [...header, ...parts]
  const code = out.join('\n\n')
  const note = loose.length ? `\n\n// ${loose.length} blok grubu bir olaya bağlı olmadığı için çalışmaz.` : ''
  return (code || '// Henüz blok yok. Soldan bir "olay" bloğu seç ve çalışma alanına sürükle.') + note + (code ? '\n' : '')
}
