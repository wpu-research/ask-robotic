// Derleme servisi için kaynak kodu doğrulayıcı.
//
// Amaç: kullanıcı kodu sunucuda yalnız DERLENİR, ama önişlemci (#include "/etc/passwd"),
// satır içi assembler (.incbin) ve benzeri yollarla derleme süreci kötüye kullanılabilir.
// Doğrulama, gerçek önişlemcinin (GCC/libcpp) gördüğünü taklit eder:
//   1) `\` + yeni satır birleştirilir,
//   2) yorumlar tek boşluğa çevrilir (çok satırlı yorum da TEK boşluk, tıpkı GCC gibi),
//   3) dize/karakter sabitlerinin içi boşaltılır,
//   4) her mantıksal satır taranır.
// Belirsiz her durumda REDDEDER (izin listesi yaklaşımı).

export type ValidationError = { line: number; message: string }
export type ValidationResult = { ok: true } | { ok: false; errors: ValidationError[] }

export const LIMITS = { maxBytes: 32 * 1024, maxLines: 1500, maxLineLength: 400, maxErrors: 50 } as const

export const ALLOWED_HEADERS: ReadonlySet<string> = new Set([
  'Arduino.h', 'Servo.h', 'LiquidCrystal.h', 'LiquidCrystal_I2C.h', 'Wire.h', 'EEPROM.h', 'SPI.h',
  'SoftwareSerial.h', 'DHT.h', 'Adafruit_Sensor.h', 'Adafruit_BMP280.h', 'RTClib.h', 'Keypad.h',
  'NewPing.h', 'MFRC522.h', 'IRremote.h', 'IRremote.hpp', 'SD.h', 'VL53L0X.h', 'Adafruit_SSD1306.h',
  'Adafruit_GFX.h', 'avr/pgmspace.h', 'avr/interrupt.h', 'math.h', 'stdlib.h', 'string.h', 'stdint.h',
  'stdbool.h', 'limits.h', 'ctype.h', 'stdio.h',
])

const ALLOWED_DIRECTIVES: ReadonlySet<string> = new Set([
  'include', 'define', 'undef', 'if', 'ifdef', 'ifndef', 'elif', 'else', 'endif',
])

// `asm` ailesi (dosya sızdırma: .incbin), _Pragma, __attribute__ (section vb.), __has_include*, incbin, __builtin_*
const BANNED_WORDS: ReadonlySet<string> = new Set([
  'asm', '__asm', '__asm__', '_Pragma', '__attribute__', '__attribute', 'incbin',
])
const BANNED_PREFIXES = ['__builtin_', '__has_include']

const TRIGRAPH = /\?\?[=/'()!<>-]/
const CONTROL = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/
const BAD_UNICODE = /�|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/
const RAW_STRING_PREFIX = /(?:^|[^A-Za-z0-9_$])(?:u8|u|U|L)?R$/
const INCLUDE_CTX = /^\s*#\s*(?:include|include_next|import)\s*$/

function lineOfIndex(src: string, idx: number) {
  let line = 1
  for (let i = 0; i < idx; i++) if (src.charCodeAt(i) === 10) line++
  return line
}

export function validateSource(source: unknown): ValidationResult {
  if (typeof source !== 'string') return { ok: false, errors: [{ line: 1, message: 'Kod metin olmalıdır.' }] }
  const src = source
  const errors: ValidationError[] = []
  const add = (line: number, message: string) => {
    if (errors.length < LIMITS.maxErrors) errors.push({ line, message })
  }
  const fail = () => ({ ok: false as const, errors: errors.sort((a, b) => a.line - b.line) })

  // --- Boyut / karakter kümesi ---
  const bytes = Buffer.byteLength(src, 'utf8')
  if (bytes > LIMITS.maxBytes) {
    add(1, `Kod çok büyük (${bytes} bayt). En çok ${LIMITS.maxBytes} bayt olabilir.`)
    return fail()
  }
  const nul = src.indexOf('\0')
  if (nul >= 0) add(lineOfIndex(src, nul), 'Kodda NUL (boş) bayt bulunamaz.')
  const ctrl = CONTROL.exec(src)
  if (ctrl && ctrl[0] !== '\0') add(lineOfIndex(src, ctrl.index), 'Kodda geçersiz denetim karakteri var.')
  const lone = /\r(?!\n)/.exec(src)
  if (lone) add(lineOfIndex(src, lone.index), 'Yalnız CR satır sonu desteklenmiyor; satır sonu \\n olmalı.')
  const bad = BAD_UNICODE.exec(src)
  if (bad) add(lineOfIndex(src, bad.index), 'Kod geçerli bir UTF-8 metin değil.')
  if (errors.length) return fail()

  // --- Satır sayısı / uzunluğu ---
  const rawLines = src.split(/\r\n|\n/)
  if (rawLines.length > 1 && rawLines[rawLines.length - 1] === '') rawLines.pop()
  if (rawLines.length > LIMITS.maxLines) {
    add(LIMITS.maxLines + 1, `Kod çok uzun (${rawLines.length} satır). En çok ${LIMITS.maxLines} satır olabilir.`)
    return fail()
  }
  rawLines.forEach((l, i) => {
    if (l.length > LIMITS.maxLineLength) add(i + 1, `Satır çok uzun (${l.length} karakter). En çok ${LIMITS.maxLineLength} olabilir.`)
    if (TRIGRAPH.test(l)) add(i + 1, 'Trigraf dizileri (??= gibi) kullanılamaz.')
  })

  // --- Satır birleştirme (\ + yeni satır) ---
  const cs: string[] = []
  const ln: number[] = []
  {
    let line = 1
    const splice = /[ \t]*\r?\n/y
    for (let i = 0; i < src.length; ) {
      const c = src[i]
      if (c === '\r') { i++; continue }
      if (c === '\\') {
        splice.lastIndex = i + 1
        const m = splice.exec(src)
        if (m) { i += 1 + m[0].length; line++; continue }
      }
      cs.push(c); ln.push(line)
      if (c === '\n') line++
      i++
    }
  }

  // --- Yorum / dize temizleme ---
  const out: string[] = []
  const outLn: number[] = []
  let lineStart = 0
  const push = (ch: string, l: number) => {
    out.push(ch); outLn.push(l)
    if (ch === '\n') lineStart = out.length
  }
  const n = cs.length
  let i = 0
  while (i < n) {
    const c = cs[i]
    const d = cs[i + 1]
    if (c === '/' && d === '/') {
      const l = ln[i]
      while (i < n && cs[i] !== '\n') i++
      push(' ', l)
      continue
    }
    if (c === '/' && d === '*') {
      const l = ln[i]
      i += 2
      let closed = false
      while (i < n) {
        if (cs[i] === '*' && cs[i + 1] === '/') { i += 2; closed = true; break }
        i++
      }
      if (!closed) add(l, 'Kapatılmamış /* */ yorumu.')
      push(' ', l) // çok satırlı yorum da tek boşluk
      continue
    }
    if (c === '<' && INCLUDE_CTX.test(out.slice(lineStart).join(''))) {
      // #include <...>: başlık adı belirteci, içinde // ya da /* yorum sayılmaz (GCC gibi)
      while (i < n && cs[i] !== '\n') {
        push(cs[i], ln[i])
        if (cs[i++] === '>') break
      }
      continue
    }
    if (c === '"' || c === "'") {
      // kapanış aynı satırda var mı?
      let j = i + 1
      let close = -1
      while (j < n && cs[j] !== '\n') {
        if (cs[j] === '\\' && j + 1 < n && cs[j + 1] !== '\n') { j += 2; continue }
        if (cs[j] === c) { close = j; break }
        j++
      }
      if (c === '"' && RAW_STRING_PREFIX.test(out.slice(lineStart).join(''))) {
        add(ln[i], 'Ham dize sabitleri (R"(...)") desteklenmiyor.')
      }
      push(c, ln[i])
      if (close < 0) { i++; continue } // kapanmamış: gerisini kod gibi tara (daha sıkı)
      for (let k = i + 1; k < close; k++) push(' ', ln[k])
      push(c, ln[close])
      i = close + 1
      continue
    }
    push(c, ln[i])
    i++
  }

  // --- Mantıksal satırları tara ---
  let s = 0
  while (s <= out.length) {
    let e = s
    while (e < out.length && out[e] !== '\n') e++
    const t = out.slice(s, e).join('')
    const lns = outLn.slice(s, e)
    const at = (k: number) => lns[Math.min(k, lns.length - 1)] ?? 1
    if (t.trim() !== '') scanLine(t, at, add)
    s = e + 1
  }

  return errors.length ? fail() : { ok: true }
}

function scanLine(t: string, at: (k: number) => number, add: (line: number, msg: string) => void) {
  let k = t.indexOf('%:')
  if (k >= 0) add(at(k), 'Diğraf (%: / %:%:) kullanılamaz.')
  k = t.indexOf('##')
  if (k >= 0) add(at(k), 'Belirteç yapıştırma (##) kullanılamaz.')
  k = t.indexOf('\\')
  if (k >= 0) add(at(k), 'Dize dışında ters eğik çizgi (\\) kullanılamaz.')

  const dir = /^[ \t]*#/.exec(t)
  if (dir) {
    const hashAt = dir[0].length - 1
    const rest = t.slice(dir[0].length)
    const nm = /^[ \t]*([A-Za-z_][A-Za-z0-9_]*)/.exec(rest)
    if (!nm) {
      if (rest.trim() !== '') add(at(hashAt), 'Tanınmayan önişlemci yönergesi.')
    } else if (!ALLOWED_DIRECTIVES.has(nm[1])) {
      add(at(hashAt), `#${nm[1]} yönergesine izin verilmiyor.`)
    } else if (nm[1] === 'include') {
      const after = rest.slice(nm[0].length)
      const m = /^[ \t]*<([^<>"]*)>[ \t]*$/.exec(after)
      if (!m) {
        if (/^[ \t]*"/.test(after)) add(at(hashAt), 'Tırnaklı #include yasak; <Başlık.h> biçimini kullan.')
        else if (/^[ \t]*[A-Za-z_]/.test(after)) add(at(hashAt), 'Makroyla #include yasak.')
        else add(at(hashAt), 'Geçersiz #include biçimi; yalnız #include <Başlık.h> kullanılabilir.')
      } else if (!ALLOWED_HEADERS.has(m[1])) {
        if (/[\\/:]|\.\./.test(m[1])) add(at(hashAt), `Yol içeren başlık adı yasak: <${m[1]}>.`)
        else add(at(hashAt), `<${m[1]}> başlığına izin verilmiyor.`)
      }
    }
  }

  const word = /[A-Za-z_$][A-Za-z0-9_$]*/g
  for (let m = word.exec(t); m; m = word.exec(t)) {
    const w = m[0]
    if (BANNED_WORDS.has(w) || BANNED_PREFIXES.some((p) => w.startsWith(p))) {
      add(at(m.index), `'${w}' kullanılamaz.`)
    }
  }
}

export { validateSource as validate }
