// 3x5 piksel yazı tipi (kendi çizimimiz). Büyük harf, rakam, noktalama ve Türkçe harfler (Ç Ğ İ Ö Ş Ü).
// Çizgi yüksekliği 8 px: harfin üstünde ve altında birer satır aksan için ayrılmıştır.

type Glyph = { rows: [string, string, string, string, string]; above?: string; below?: string }
const g = (rows: string, above?: string, below?: string): Glyph => ({ rows: rows.split('/') as Glyph['rows'], above, below })

const BASE: Record<string, Glyph> = {
  A: g('.#./#.#/###/#.#/#.#'), B: g('##./#.#/##./#.#/##.'), C: g('.##/#../#../#../.##'), D: g('##./#.#/#.#/#.#/##.'),
  E: g('###/#../##./#../###'), F: g('###/#../##./#../#..'), G: g('.##/#../#.#/#.#/.##'), H: g('#.#/#.#/###/#.#/#.#'),
  I: g('###/.#./.#./.#./###'), J: g('..#/..#/..#/#.#/.#.'), K: g('#.#/#.#/##./#.#/#.#'), L: g('#../#../#../#../###'),
  M: g('#.#/###/###/#.#/#.#'), N: g('###/#.#/#.#/#.#/#.#'), O: g('.#./#.#/#.#/#.#/.#.'), P: g('##./#.#/##./#../#..'),
  Q: g('.#./#.#/#.#/##./.##'), R: g('##./#.#/##./##./#.#'), S: g('.##/#../.#./..#/##.'), T: g('###/.#./.#./.#./.#.'),
  U: g('#.#/#.#/#.#/#.#/###'), V: g('#.#/#.#/#.#/#.#/.#.'), W: g('#.#/#.#/###/###/#.#'), X: g('#.#/#.#/.#./#.#/#.#'),
  Y: g('#.#/#.#/.#./.#./.#.'), Z: g('###/..#/.#./#../###'),
  '0': g('###/#.#/#.#/#.#/###'), '1': g('.#./##./.#./.#./###'), '2': g('##./..#/.#./#../###'), '3': g('##./..#/.#./..#/##.'),
  '4': g('#.#/#.#/###/..#/..#'), '5': g('###/#../##./..#/##.'), '6': g('.##/#../###/#.#/###'), '7': g('###/..#/.#./.#./.#.'),
  '8': g('###/#.#/###/#.#/###'), '9': g('###/#.#/###/..#/##.'),
  ' ': g('.../.../.../.../...'), '.': g('.../.../.../.../.#.'), ',': g('.../.../.../.#./#..'), '!': g('.#./.#./.#./.../.#.'),
  '?': g('##./..#/.#./.../.#.'), ':': g('.../.#./.../.#./...'), ';': g('.../.#./.../.#./#..'), '-': g('.../.../###/.../...'),
  '+': g('.../.#./###/.#./...'), '=': g('.../###/.../###/...'), '/': g('..#/..#/.#./#../#..'), '(': g('.#./#../#../#../.#.'),
  ')': g('.#./..#/..#/..#/.#.'), '*': g('.../#.#/.#./#.#/...'), "'": g('.#./.#./.../.../...'), '"': g('#.#/#.#/.../.../...'),
  '%': g('#.#/..#/.#./#../#.#'), '>': g('#../.#./..#/.#./#..'), '<': g('..#/.#./#../.#./..#'), '_': g('.../.../.../.../###'),
  '#': g('#.#/###/#.#/###/#.#'), '♥': g('#.#/###/###/.#./...'), '↺': g('.##/#.#/#../#.#/.#.'),
}
const ACCENTS: Record<string, Glyph> = {
  Ç: { ...BASE.C, below: '.#.' }, Ğ: { ...BASE.G, above: '.#.' }, İ: { ...BASE.I, above: '.#.' },
  Ö: { ...BASE.O, above: '#.#' }, Ş: { ...BASE.S, below: '.#.' }, Ü: { ...BASE.U, above: '#.#' },
}
const GLYPHS: Record<string, Glyph> = { ...BASE, ...ACCENTS }

export const FONT_H = 8
export const GLYPH_W = 3
export const CHAR_ADV = 4

export const upper = (s: string): string => s.toLocaleUpperCase('tr-TR')
export const textWidth = (s: string): number => (s.length ? s.length * CHAR_ADV - 1 : 0)

/** Her piksel için cb(x, y) çağırır. (x0,y0) metnin sol üst köşesidir (aksanlar y0-1 ve y0+5'e taşabilir). */
export function drawText(text: string, x0: number, y0: number, put: (x: number, y: number) => void): void {
  const t = upper(text)
  let x = x0
  for (const ch of t) {
    const gl = GLYPHS[ch] ?? GLYPHS['?']
    gl.rows.forEach((row, ry) => { for (let rx = 0; rx < 3; rx++) if (row[rx] === '#') put(x + rx, y0 + ry) })
    if (gl.above) for (let rx = 0; rx < 3; rx++) if (gl.above[rx] === '#') put(x + rx, y0 - 1)
    if (gl.below) for (let rx = 0; rx < 3; rx++) if (gl.below[rx] === '#') put(x + rx, y0 + 5)
    x += CHAR_ADV
  }
}

/** Metni, en çok `maxChars` karakterlik satırlara sözcük sınırından böler. */
export function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const word = w.length > maxChars ? w.slice(0, maxChars) : w
    if (!cur) cur = word
    else if ((cur + ' ' + word).length <= maxChars) cur += ' ' + word
    else { lines.push(cur); cur = word }
  }
  if (cur) lines.push(cur)
  return lines.length ? lines : ['']
}
