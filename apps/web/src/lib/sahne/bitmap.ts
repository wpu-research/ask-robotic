// Bitmap yardımcıları (saf): boya kovası (doldur) ve renk ayrıştırma. Kostüm editörünün bitmap kipi kullanır.

export type RGBA = [number, number, number, number]

/** '#rgb', '#rrggbb' ya da 'rgb(a)' dizesini RGBA'ya çevirir (bilinmezse siyah). */
export function parseColor(c: string): RGBA {
  const s = c.trim()
  let m = /^#([0-9a-f]{3})$/i.exec(s)
  if (m) return [parseInt(m[1][0] + m[1][0], 16), parseInt(m[1][1] + m[1][1], 16), parseInt(m[1][2] + m[1][2], 16), 255]
  m = /^#([0-9a-f]{6})$/i.exec(s)
  if (m) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16), 255]
  const r = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(s)
  if (r) return [Number(r[1]), Number(r[2]), Number(r[3]), Math.round(Number(r[4] ?? 1) * 255)]
  return [0, 0, 0, 255]
}

/**
 * (x, y) noktasından başlayarak bağlı, benzer renkli pikselleri `color` ile doldurur. `tol`: kanal başına en çok fark.
 * Değiştirilen piksel sayısını döndürür. Saydam pikseller birbirine benzer sayılır (alfa 0 ise renk önemsiz).
 */
export function floodFill(data: Uint8ClampedArray, w: number, h: number, x: number, y: number, color: RGBA, tol = 24): number {
  x = Math.floor(x); y = Math.floor(y)
  if (x < 0 || y < 0 || x >= w || y >= h) return 0
  const at = (px: number, py: number) => (py * w + px) * 4
  const i0 = at(x, y)
  const tr = data[i0], tg = data[i0 + 1], tb = data[i0 + 2], ta = data[i0 + 3]
  const same = (i: number): boolean => {
    const a = data[i + 3]
    if (ta === 0 || a === 0) return ta === a || (ta < 12 && a < 12)
    return Math.abs(data[i] - tr) <= tol && Math.abs(data[i + 1] - tg) <= tol && Math.abs(data[i + 2] - tb) <= tol && Math.abs(a - ta) <= tol
  }
  if (ta === color[3] && ta !== 0 && Math.abs(tr - color[0]) <= 2 && Math.abs(tg - color[1]) <= 2 && Math.abs(tb - color[2]) <= 2) return 0
  const seen = new Uint8Array(w * h)
  const stack: number[] = [x, y]
  let n = 0
  while (stack.length) {
    const sy = stack.pop()!, sx = stack.pop()!
    let lx = sx
    while (lx >= 0 && !seen[sy * w + lx] && same(at(lx, sy))) lx--
    lx++
    let up = false, down = false
    for (let px = lx; px < w && !seen[sy * w + px] && same(at(px, sy)); px++) {
      seen[sy * w + px] = 1
      const i = at(px, sy)
      data[i] = color[0]; data[i + 1] = color[1]; data[i + 2] = color[2]; data[i + 3] = color[3]
      n++
      if (sy > 0) {
        const ok = !seen[(sy - 1) * w + px] && same(at(px, sy - 1))
        if (ok && !up) { stack.push(px, sy - 1); up = true } else if (!ok) up = false
      }
      if (sy < h - 1) {
        const ok = !seen[(sy + 1) * w + px] && same(at(px, sy + 1))
        if (ok && !down) { stack.push(px, sy + 1); down = true } else if (!ok) down = false
      }
    }
  }
  return n
}
