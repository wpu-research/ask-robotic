// Oyun Atölyesi — kendi 16 renkli paletimiz. Resimlerde her piksel tek bir karakterdir: '0'-'9','a'-'f' = palet sırası, '.' = saydam.

export interface PaletteColor { index: number; ch: string; hex: string; name: string }

const RAW: [string, string][] = [
  ['#15131f', 'gece'], ['#7a4a2a', 'kahve'], ['#d6335a', 'kırmızı'], ['#f2873a', 'turuncu'],
  ['#ffd23f', 'sarı'], ['#9be15d', 'açık yeşil'], ['#2fb35b', 'yeşil'], ['#7b3fb3', 'mor'],
  ['#213a8f', 'lacivert'], ['#3b82f6', 'mavi'], ['#62c8ff', 'gök'], ['#ff9ec4', 'pembe'],
  ['#fbf7ef', 'beyaz'], ['#b9bfd0', 'açık gri'], ['#6c7691', 'gri'], ['#3a3d58', 'koyu gri'],
]

export const PALETTE: readonly PaletteColor[] = RAW.map(([hex, name], index) => ({ index, ch: index.toString(16), hex, name }))
export const PALETTE_CHARS = '0123456789abcdef'
export const TRANSPARENT = '.'

/** [r,g,b] üçlüleri (çizim için). */
export const PALETTE_RGB: readonly [number, number, number][] = PALETTE.map((c) => {
  const n = parseInt(c.hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as [number, number, number]
})

export const paletteHex = (i: number): string => PALETTE[((i % 16) + 16) % 16].hex

/** Bir renk değerini (palet sırası, '#rrggbb' ya da palet karakteri) palet sırasına çevirir; en yakın renk seçilir. */
export function colorIndex(c: unknown, fallback = 0): number {
  if (typeof c === 'number' && Number.isFinite(c)) return ((Math.round(c) % 16) + 16) % 16
  if (typeof c === 'string') {
    const s = c.trim().toLowerCase()
    if (/^#[0-9a-f]{6}$/.test(s)) {
      const n = parseInt(s.slice(1), 16)
      const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
      let best = 0, bd = Infinity
      PALETTE_RGB.forEach(([pr, pg, pb], i) => {
        const d = (pr - r) ** 2 + (pg - g) ** 2 + (pb - b) ** 2
        if (d < bd) { bd = d; best = i }
      })
      return best
    }
    if (/^[0-9a-f]$/.test(s)) return parseInt(s, 16)
  }
  return fallback
}
