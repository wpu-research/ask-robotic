// PyTorch dersi 3B sahne mantığı (saf, testli): kayıp yüzeyinin ızgarası ve yörüngelerin 3B noktaları; CNN katmanlarının
// 3B yerleşimi (her öznitelik haritası bir düzlem). three.js yalnız bu sayıları çizer.
import { optimize, surf, type OptK, type Surface } from './nets'
import type { CnnTrace, Fm } from './cnn'

export const BOX: Record<Surface, { x0: number; x1: number; y0: number; y1: number }> = {
  valley: { x0: -10, x1: 10, y0: -3, y1: 3 }, rosenbrock: { x0: -2, x1: 2, y0: -1, y1: 3 }, saddle: { x0: -4, x1: 4, y0: -2, y1: 4 },
}
/** Yükseklik: log(1 + f) ölçeklenmiş (dik vadiler okunur kalsın). Sahne birimi: x ve z −2..2, y 0..1,5. */
export function height(s: Surface, f: number): number {
  const top = s === 'rosenbrock' ? Math.log1p(400) : s === 'valley' ? Math.log1p(13) : Math.log1p(10)
  return (Math.log1p(Math.max(0, f + (s === 'saddle' ? 2 : 0))) / top) * 1.5
}
export function toScene(s: Surface, x: number, y: number, f: number): [number, number, number] {
  const b = BOX[s]
  return [((x - b.x0) / (b.x1 - b.x0)) * 4 - 2, Math.min(2, height(s, f)), -(((y - b.y0) / (b.y1 - b.y0)) * 4 - 2)]
}
/** (n+1)×(n+1) köşe ızgarası: konum dizisi (x, y, z) ve 0..1 renk değeri. */
export function surfaceGrid(s: Surface, n = 48): { pos: Float32Array; val: Float32Array; n: number } {
  const b = BOX[s], pos = new Float32Array((n + 1) * (n + 1) * 3), val = new Float32Array((n + 1) * (n + 1))
  for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
    const x = b.x0 + (i / n) * (b.x1 - b.x0), y = b.y0 + (j / n) * (b.y1 - b.y0), f = surf(s, x, y).f
    const p = toScene(s, x, y, f), k = j * (n + 1) + i
    pos.set(p, k * 3); val[k] = Math.min(1, p[1] / 1.5)
  }
  return { pos, val, n }
}
export function trajectories(s: Surface, lr: Record<OptK, number>, steps: number, opts: OptK[]): Record<string, Array<[number, number, number]>> {
  const out: Record<string, Array<[number, number, number]>> = {}
  for (const k of opts) out[k] = optimize(k, s, lr[k], steps).filter((p) => Number.isFinite(p[0])).map((p) => toScene(s, p[0], p[1], p[2]))
  return out
}

export interface Plane { key: string; layer: number; ch: number; fm: Fm; pos: [number, number, number]; size: number }
/** Katmanlar z ekseninde art arda; her katmanın kanalları ızgara hâlinde. Boy, öznitelik haritasının uzamsal boyuyla orantılı. */
export function cnnLayout(t: CnnTrace): Plane[] {
  const layers: Array<[string, Fm, number]> = [['input', t.input, 1.6], ['conv1', t.c1, 0.55], ['pool1', t.p1, 0.42], ['conv2', t.c2, 0.32], ['pool2', t.p2, 0.24]]
  const out: Plane[] = []
  layers.forEach(([key, fm, size], L) => {
    const cols = fm.c === 1 ? 1 : fm.c <= 8 ? 4 : 4, rows = Math.ceil(fm.c / cols), gap = size * 1.12
    for (let c = 0; c < fm.c; c++) {
      const col = c % cols, row = Math.floor(c / cols)
      out.push({ key, layer: L, ch: c, fm, size, pos: [(col - (cols - 1) / 2) * gap, (rows - 1) / 2 * gap - row * gap + 1.2, -L * 1.6] })
    }
  })
  return out
}
