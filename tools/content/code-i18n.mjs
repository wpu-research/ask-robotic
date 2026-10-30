// OTOMATİK ÇEVRİLDİ: apps/web/src/lib/code-i18n.ts ile aynı algoritma (derleme betikleri için JS ikizi). Değiştirirsen ikisini birlikte güncelle; eşlik testi: code-i18n.test.ts.
// Kod örneklerini arayüz diline göre yerelleştirir: değişken/işlev adları ve yorumlar. String değerlere (Serial.print çıktıları vb.) dokunulmaz.
// Sözlük: { ids: Türkçe tanımlayıcı → İngilizce, comments: Türkçe yorum → İngilizce }. Tanımlayıcı eşlemesi birebir (tersinir) olmalıdır:
// hedef denetimleri (`codeHas(/sonPlanUs/)`) kodun KANONİK (Türkçe) hâline bakar, öğrenci İngilizce kodla çalışsa da hedefler tutar.
// Çözücü C/C++ (Arduino) ve Python yorumlarını tanır; testler: code-i18n.test.ts.



/** Kodu parçalar: kod, string ("…" ya da '…'), satır yorumu (// ya da #), blok yorumu. */
export function segments(code, lang = 'c') {
  const out = []
  let i = 0, buf = ''
  const flush = () => { if (buf) { out.push({ t: 'code', s: buf }); buf = '' } }
  while (i < code.length) {
    const c = code[i], n = code[i + 1]
    if (c === '"' || c === "'") {
      // Python üçlü tırnak
      const triple = lang === 'py' && code.startsWith(c.repeat(3), i)
      flush()
      let j = i + (triple ? 3 : 1)
      while (j < code.length) {
        if (code[j] === '\\') { j += 2; continue }
        if (triple ? code.startsWith(c.repeat(3), j) : code[j] === c) break
        if (!triple && code[j] === '\n') break
        j++
      }
      j = Math.min(code.length, j + (triple ? 3 : 1))
      out.push({ t: 'str', s: code.slice(i, j) }); i = j; continue
    }
    if (lang === 'c' && c === '/' && n === '/') { flush(); let j = code.indexOf('\n', i); if (j < 0) j = code.length; out.push({ t: 'line', s: code.slice(i, j) }); i = j; continue }
    if (lang === 'py' && c === '#') { flush(); let j = code.indexOf('\n', i); if (j < 0) j = code.length; out.push({ t: 'line', s: code.slice(i, j) }); i = j; continue }
    if (lang === 'c' && c === '/' && n === '*') { flush(); let j = code.indexOf('*/', i + 2); j = j < 0 ? code.length : j + 2; out.push({ t: 'block', s: code.slice(i, j) }); i = j; continue }
    buf += c; i++
  }
  flush()
  return out
}

const IDENT = /(?<![A-Za-z0-9_])[A-Za-z_][A-Za-z0-9_]*/g

const mapIds = (code, map) => code.replace(IDENT, (m) => (Object.prototype.hasOwnProperty.call(map, m) ? map[m] : m))

/** Yorum metnini çevirir: yorum işaretleri (satır ya da blok) ve baştaki/sondaki boşluklar korunur. Sözlükte yoksa yorum olduğu gibi kalır. */
function mapComment(seg, kind, comments, lang) {
  const open = kind === 'block' ? '/*' : lang === 'py' ? '#' : '//'
  const body = kind === 'block' ? seg.slice(2, seg.endsWith('*/') ? -2 : undefined) : seg.slice(open.length)
  const close = kind === 'block' && seg.endsWith('*/') ? '*/' : ''
  const lead = body.match(/^\s*/)[0], trail = body.match(/\s*$/)[0]
  const core = body.trim()
  const tr = Object.prototype.hasOwnProperty.call(comments, core) ? comments[core] : core
  return open + lead + tr + (core ? trail : '') + close
}

/** Kod parçalarındaki (string ve yorum dışı) tüm tanımlayıcılar. */
function identifiers(parts) {
  const set = new Set()
  for (const g of parts) if (g.t === 'code') for (const m of g.s.matchAll(IDENT)) set.add(m[0])
  return set
}

/** Bu kodda tanımlayıcı yeniden adlandırması güvenli mi: iki ad aynı hedefe gitmez, hedef eşlenmemiş mevcut bir adla çakışmaz. */
export function codeIdentifiers(code, lang = 'c') { return identifiers(segments(code, lang)) }

export function renameIsSafe(present, map) {
  const targets = new Set()
  for (const name of present) {
    const to = Object.prototype.hasOwnProperty.call(map, name) ? map[name] : name
    if (targets.has(to)) return false
    targets.add(to)
  }
  return true
}

/** Türkçe kodu İngilizceye çevirir (tanımlayıcılar + yorumlar). Yeniden adlandırma bu kodda çakışma yaratacaksa adlar olduğu gibi kalır, yorumlar yine çevrilir. */
export function localizeCode(code, dict, lang = 'c', opts = {}) {
  const parts = segments(code, lang)
  const rename = opts.rename ?? renameIsSafe(identifiers(parts), dict.ids)
  return parts.map((g) => {
    if (g.t === 'code') return rename ? mapIds(g.s, dict.ids) : g.s
    if (g.t === 'line' || g.t === 'block') return mapComment(g.s, g.t, dict.comments, lang)
    return g.s
  }).join('')
}

const invert = (m) => Object.fromEntries(Object.entries(m).map(([k, v]) => [v, k]))
const invCache = new WeakMap()

/** İngilizce kodu kanonik (Türkçe) tanımlayıcılara döndürür; yorumlar ve stringler olduğu gibi kalır. Hedef denetimleri bunu kullanır. */
export function canonicalCode(code, dict, lang = 'c') {
  let inv = invCache.get(dict)
  if (!inv) { inv = invert(dict.ids); invCache.set(dict, inv) }
  const map = inv
  return segments(code, lang).map((g) => (g.t === 'code' ? mapIds(g.s, map) : g.s)).join('')
}

/** Sözlükteki eşlemenin tersinir olduğunu doğrular: iki ad aynı hedefe gitmez. Boş dizi = sağlam. */
export function dictProblems(dict) {
  const seen = new Map(), bad = []
  for (const [k, v] of Object.entries(dict.ids)) {
    if (seen.has(v)) bad.push(`${seen.get(v)} ve ${k} aynı hedefe gidiyor: ${v}`)
    seen.set(v, k)
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(v)) bad.push(`geçersiz tanımlayıcı: ${v}`)
  }
  return bad
}
