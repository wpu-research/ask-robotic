// İngilizce ders içeriğinde (contentEn, guideMdEn, stepsEn) program kodunu yerelleştirir: tanımlayıcılar + yorumlar.
// Kaynak (content-src/**/en/*) değişmez: Türkçeyle birebir aynı kalır (ayna kuralı); çıktı derlemede üretilir.
// Sözlük: apps/web/src/lib/code-dict/{ids,comments}.json. Mantık: tools/content/code-i18n.mjs (apps/web/src/lib/code-i18n.ts ile aynı).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from '../sim/lessons.mjs'
import { canonicalCode, codeIdentifiers, localizeCode, renameIsSafe } from './code-i18n.mjs'

const dir = join(ROOT, 'apps', 'web', 'src', 'lib', 'code-dict')
export const DICT = { ids: JSON.parse(readFileSync(join(dir, 'ids.json'), 'utf8')), comments: JSON.parse(readFileSync(join(dir, 'comments.json'), 'utf8')) }

const LANG = { cpp: 'c', c: 'c', ino: 'c', arduino: 'c', python: 'py', py: 'py' }
const FENCE = /```(\w*)\n([\s\S]*?)```/g
const INLINE = /`([^`\n]+)`/g
const IDENT = /(?<![A-Za-z0-9_])[A-Za-z_][A-Za-z0-9_]*/g
const mapIds = (s) => s.replace(IDENT, (m) => (Object.prototype.hasOwnProperty.call(DICT.ids, m) ? DICT.ids[m] : m))

/** Metindeki dil etiketli kod blokları [{lang, body}]. */
export const blocksOf = (md) => [...md.matchAll(FENCE)].filter((m) => LANG[m[1]]).map((m) => ({ lang: LANG[m[1]], body: m[2] }))

/** Bir ders (ya da rehber) için kod yerelleştirme bağlamı: tüm kod blokları aynı yeniden adlandırma kararını paylaşır (düzyazıdaki `ad` ile kod eşleşsin). */
export function makeLocalizer(texts, extraCodes = []) {
  const codes = [...texts.flatMap((t) => blocksOf(t)), ...extraCodes.map((c) => ({ lang: /void setup|#include|;\s*$/m.test(c) ? 'c' : 'py', body: c }))]
  const rename = codes.every((c) => renameIsSafe(codeIdentifiers(c.body, c.lang), DICT.ids))
  const loc = (body, lang) => localizeCode(body, DICT, lang, { rename })
  /** Markdown: kod blokları + (yeniden adlandırma açıksa) satır içi kod adları. */
  const md = (text) => text.split(/(```[\s\S]*?```)/).map((part, i) => {
    if (i % 2 === 1) { const m = part.match(/^```(\w*)\n([\s\S]*?)```$/); return m && LANG[m[1]] ? '```' + m[1] + '\n' + loc(m[2], LANG[m[1]]) + '```' : part }
    return rename ? part.replace(INLINE, (_, code) => '`' + mapIds(code) + '`') : part
  }).join('')
  /** Ham kod alanı (adım `code`). */
  const code = (c) => loc(c, /void setup|#include|;\s*$/m.test(c) ? 'c' : 'py')
  /** Boşluk doldurma çipi/cevabı: yeniden adlandırma açıksa tam ad eşleşmesi. */
  const token = (t) => (rename && Object.prototype.hasOwnProperty.call(DICT.ids, t) ? DICT.ids[t] : t)
  return { rename, md, code, token }
}

/** Adım listesinin (stepsEn) kodunu yerelleştirir: code, çipler, cevaplar ve metin alanlarındaki kod blokları/satır içi kod. */
export function localizeSteps(steps) {
  const strings = []
  const collect = (o) => { if (typeof o === 'string') strings.push(o); else if (Array.isArray(o)) o.forEach(collect); else if (o && typeof o === 'object') Object.values(o).forEach(collect) }
  steps.forEach((s) => { for (const k of ['prompt', 'body', 'hint', 'why', 'title']) if (typeof s[k] === 'string') strings.push(s[k]) })
  const L = makeLocalizer(strings, steps.filter((s) => typeof s.code === 'string').map((s) => s.code))
  return steps.map((s) => {
    const o = { ...s }
    for (const k of ['prompt', 'body', 'hint', 'why', 'title']) if (typeof o[k] === 'string') o[k] = L.md(o[k])
    if (typeof o.code === 'string') o.code = L.code(o.code)
    if (Array.isArray(o.tokens)) o.tokens = o.tokens.map(L.token)
    if (Array.isArray(o.answer) && o.kind === 'fill') o.answer = o.answer.map(L.token)
    if (Array.isArray(o.lines)) o.lines = o.lines.map((l) => L.code(l))
    if (Array.isArray(o.options)) o.options = o.options.map((x) => L.md(x))
    return o
  })
}

export { canonicalCode }
