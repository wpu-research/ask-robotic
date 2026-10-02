// Ders etkinlikleri (Modül 11, hafta 1-3) için ortak kısayollar.
import { pickImages } from '../assets'
import { b, set, type Prop } from '../dsl'
import type { BlockNode, OyunImage } from '../types'

/** Projenin Resimler sekmesine konacak galeri resimleri (blok açılır listesinde görünür). */
export const resimler = (...ids: string[]): Record<string, OyunImage> => pickImages(ids)

/** `ad` değişkenine yeni bir sprite koyar. */
export const yeni = (ad: string, resim: string, tur: string): BlockNode => set(ad, b('sprite_yeni', { IMG: resim, K: tur }))

/** Konum koyar: `konum('kedi', 40, 80)`. */
export const konum = (ad: string, x: Prop, y: Prop): BlockNode => b('sprite_konum', { S: ad, X: x, Y: y })

/** Tuşlarla hareket + ekranda kalma (ders 2'den sonra sık kullanılır). */
export const yuruyen = (ad: string, hiz = 60, mod: 'four' | 'h' | 'v' = 'four'): BlockNode[] => [
  b('den_hareket', { S: ad, M: mod, N: hiz }),
  b('sprite_bayrak', { S: ad, F: 'stay', ON: 'true' }),
]

export const TUMU_SERBEST = ['mantik', 'dongu', 'matematik', 'metin', 'degisken'] as const

/** Kenarlıklı ızgara harita satırları üretir; `koy` listesi [sütun, satır, karakter] verir. Kenar '#' ile örülür. */
export function izgara(cols: number, rows: number, koy: [number, number, string][] = [], kenar = true): string[] {
  const g: string[][] = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => (kenar && (r === 0 || c === 0 || r === rows - 1 || c === cols - 1) ? '#' : '.')))
  for (const [c, r, ch] of koy) g[r][c] = ch
  return g.map((x) => x.join(''))
}

/** Dikdörtgen alan için [sütun, satır, karakter] listesi. */
export function dikdortgen(c0: number, r0: number, c1: number, r1: number, ch: string): [number, number, string][] {
  const out: [number, number, string][] = []
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) out.push([c, r, ch])
  return out
}

/** Haritada engelsiz (duvar olmayan) yol var mı? Duvar karakterleri `duvar` kümesindedir; 4 yönlü. */
export function ulasilabilir(rows: readonly string[], from: [number, number], to: [number, number], duvar: ReadonlySet<string>): boolean {
  const seen = new Set<string>([from.join(',')])
  const q: [number, number][] = [from]
  while (q.length) {
    const [c, r] = q.shift()!
    if (c === to[0] && r === to[1]) return true
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = c + dc, nr = r + dr
      const ch = rows[nr]?.[nc]
      if (ch === undefined || duvar.has(ch) || seen.has(`${nc},${nr}`)) continue
      seen.add(`${nc},${nr}`)
      q.push([nc, nr])
    }
  }
  return false
}
