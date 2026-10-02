// Hazır 5x5 simgeler (kendi çizimlerimiz). Satır satır '1' yanık, '0' sönük.
export interface IconDef { id: string; label: string; rows: string[] }

export const ICONS: IconDef[] = [
  { id: 'heart', label: 'kalp', rows: ['01010', '11111', '11111', '01110', '00100'] },
  { id: 'smallHeart', label: 'küçük kalp', rows: ['00000', '01010', '01110', '00100', '00000'] },
  { id: 'happy', label: 'mutlu yüz', rows: ['00000', '01010', '00000', '10001', '01110'] },
  { id: 'sad', label: 'üzgün yüz', rows: ['00000', '01010', '00000', '01110', '10001'] },
  { id: 'surprised', label: 'şaşkın yüz', rows: ['01010', '00000', '00100', '01010', '00100'] },
  { id: 'asleep', label: 'uyuyan yüz', rows: ['00000', '11011', '00000', '01110', '00000'] },
  { id: 'yes', label: 'evet', rows: ['00000', '00001', '00010', '10100', '01000'] },
  { id: 'no', label: 'hayır', rows: ['10001', '01010', '00100', '01010', '10001'] },
  { id: 'arrowUp', label: 'yukarı ok', rows: ['00100', '01110', '10101', '00100', '00100'] },
  { id: 'arrowDown', label: 'aşağı ok', rows: ['00100', '00100', '10101', '01110', '00100'] },
  { id: 'arrowLeft', label: 'sol ok', rows: ['00100', '01000', '11111', '01000', '00100'] },
  { id: 'arrowRight', label: 'sağ ok', rows: ['00100', '00010', '11111', '00010', '00100'] },
  { id: 'square', label: 'kare', rows: ['11111', '10001', '10001', '10001', '11111'] },
  { id: 'diamond', label: 'elmas', rows: ['00100', '01010', '10001', '01010', '00100'] },
  { id: 'triangle', label: 'üçgen', rows: ['00000', '00100', '01010', '11111', '00000'] },
  { id: 'house', label: 'ev', rows: ['00100', '01110', '11111', '11011', '11011'] },
  { id: 'target', label: 'hedef', rows: ['11111', '10001', '10101', '10001', '11111'] },
  { id: 'ghost', label: 'hayalet', rows: ['01110', '10101', '11111', '11111', '10101'] },
  { id: 'skull', label: 'kuru kafa', rows: ['01110', '10101', '11111', '01110', '01110'] },
  { id: 'butterfly', label: 'kelebek', rows: ['11011', '11111', '00100', '11111', '11011'] },
  { id: 'cat', label: 'kedi', rows: ['10001', '11111', '10101', '11111', '01110'] },
  { id: 'note', label: 'nota', rows: ['00100', '00110', '00101', '11100', '11100'] },
  { id: 'sun', label: 'güneş', rows: ['10101', '01110', '11111', '01110', '10101'] },
]

export const ICON_BY_ID: Record<string, IconDef> = Object.fromEntries(ICONS.map((i) => [i.id, i]))

/** 8 yön oku: N, NE, E, SE, S, SW, W, NW (sıra saat yönünde, 45 derece aralıkla). */
export const ARROWS: { id: string; label: string; rows: string[] }[] = [
  { id: 'N', label: '↑ kuzey', rows: ['00100', '01110', '10101', '00100', '00100'] },
  { id: 'NE', label: '↗ kuzeydoğu', rows: ['00111', '00011', '00101', '01000', '10000'] },
  { id: 'E', label: '→ doğu', rows: ['00100', '00010', '11111', '00010', '00100'] },
  { id: 'SE', label: '↘ güneydoğu', rows: ['10000', '01000', '00101', '00011', '00111'] },
  { id: 'S', label: '↓ güney', rows: ['00100', '00100', '10101', '01110', '00100'] },
  { id: 'SW', label: '↙ güneybatı', rows: ['00001', '00010', '10100', '11000', '11100'] },
  { id: 'W', label: '← batı', rows: ['00100', '01000', '11111', '01000', '00100'] },
  { id: 'NW', label: '↖ kuzeybatı', rows: ['11100', '11000', '10100', '00010', '00001'] },
]
export const ARROW_BY_ID: Record<string, { rows: string[] }> = Object.fromEntries(ARROWS.map((a) => [a.id, a]))

/** Dereceyi (0 = yukarı, saat yönünde) en yakın 8 yönlü ok adına çevirir. */
export function arrowForAngle(deg: number): string {
  const i = Math.round((((deg % 360) + 360) % 360) / 45) % 8
  return ARROWS[i].id
}

export const rowsToCells = (rows: string[]): string => rows.map((r) => r.padEnd(5, '0').slice(0, 5)).join('').padEnd(25, '0').slice(0, 25)
export const cellsToRows = (cells: string): string[] => Array.from({ length: 5 }, (_, y) => cells.slice(y * 5, y * 5 + 5).padEnd(5, '0'))
