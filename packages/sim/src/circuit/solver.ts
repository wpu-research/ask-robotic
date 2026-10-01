// Doğrusal DC çözücü (modified nodal analysis, yoğun matris + kısmi pivotlu Gauss) ve LED/diyot için açık/kapalı durum yinelemesi.
// Düğüm 0 = toprak (0 V). Tüm kaynaklar Thevenin (V, R) biçimindedir: ideal kaynak çok küçük seri dirençle modellenir,
// böylece kısa devre matrisi tekil yapmaz.

export interface SolverResistor { a: number; b: number; ohms: number }
/** Düğüm ile toprak arasında V gerilimli, R seri dirençli kaynak. */
export interface SolverSource { node: number; volts: number; ohms: number }
/** Eşik gerilimli diyot: A→K iletirken (vA − vK − vf)/rs akımı; yoksa açık devre. */
export interface SolverLed { a: number; k: number; vf: number; rs: number; disabled?: boolean }

export interface SolverInput {
  nodes: number
  resistors: SolverResistor[]
  sources: SolverSource[]
  leds: SolverLed[]
}

export interface SolverResult {
  volts: Float64Array
  /** Her kaynağın düğüme verdiği akım (A): (V − v)/R. */
  sourceAmps: number[]
  /** Her LED'in A'dan K'ye akımı (A); iletmiyorsa 0. */
  ledAmps: number[]
  ledOn: boolean[]
  /** Toprağa hiçbir iletken yolu olmayan (yüzen) düğümler. */
  floating: boolean[]
  iterations: number
}

export const GMIN = 1e-9
export const R_MIN = 0.01

function gauss(a: Float64Array, b: Float64Array, n: number): void {
  for (let c = 0; c < n; c++) {
    let p = c, best = Math.abs(a[c * n + c])
    for (let r = c + 1; r < n; r++) { const v = Math.abs(a[r * n + c]); if (v > best) { best = v; p = r } }
    if (best < 1e-30) { a[c * n + c] = 1e-30; best = 1e-30 }
    if (p !== c) {
      for (let k = c; k < n; k++) { const t = a[c * n + k]; a[c * n + k] = a[p * n + k]; a[p * n + k] = t }
      const t = b[c]; b[c] = b[p]; b[p] = t
    }
    const piv = a[c * n + c]
    for (let r = c + 1; r < n; r++) {
      const f = a[r * n + c] / piv
      if (f === 0) continue
      for (let k = c; k < n; k++) a[r * n + k] -= f * a[c * n + k]
      b[r] -= f * b[c]
    }
  }
  for (let r = n - 1; r >= 0; r--) {
    let s = b[r]
    for (let k = r + 1; k < n; k++) s -= a[r * n + k] * b[k]
    b[r] = s / a[r * n + r]
  }
}

function solveLinear(inp: SolverInput, on: boolean[]): Float64Array {
  const n = inp.nodes - 1 // 0. düğüm (toprak) matriste yok
  const A = new Float64Array(n * n), B = new Float64Array(n)
  const stampG = (x: number, y: number, g: number): void => {
    if (x > 0) A[(x - 1) * n + (x - 1)] += g
    if (y > 0) A[(y - 1) * n + (y - 1)] += g
    if (x > 0 && y > 0) { A[(x - 1) * n + (y - 1)] -= g; A[(y - 1) * n + (x - 1)] -= g }
  }
  const inject = (node: number, i: number): void => { if (node > 0) B[node - 1] += i }
  for (let i = 1; i < inp.nodes; i++) A[(i - 1) * n + (i - 1)] += GMIN
  for (const r of inp.resistors) stampG(r.a, r.b, 1 / Math.max(r.ohms, R_MIN))
  for (const s of inp.sources) { const g = 1 / Math.max(s.ohms, R_MIN); stampG(s.node, 0, g); inject(s.node, s.volts * g) }
  inp.leds.forEach((l, i) => {
    if (!on[i]) return
    const g = 1 / l.rs
    stampG(l.a, l.k, g)
    inject(l.a, l.vf * g) // A'dan K'ye akım: g·(v_a − v_k − vf)
    inject(l.k, -l.vf * g)
  })
  const v = new Float64Array(inp.nodes)
  if (n > 0) { gauss(A, B, n); for (let i = 0; i < n; i++) v[i + 1] = B[i] }
  return v
}

export function solve(inp: SolverInput): SolverResult {
  const leds = inp.leds
  const on = leds.map(() => false)
  let v = solveLinear(inp, on)
  let it = 1
  const maxIt = 6 + leds.length * 6
  for (; it < maxIt; it++) {
    // en büyük ihlali bul ve yalnız onu çevir (salınımı önler)
    let worst = -1, worstViol = 1e-9
    leds.forEach((l, i) => {
      if (l.disabled) return
      const vak = v[l.a] - v[l.k]
      // iletirken ileri gerilim altına düştüyse (akım < 0) ya da kapalıyken eşiği aştıysa ihlal
      const mag = on[i] ? l.vf - vak : vak - l.vf
      if (mag > worstViol) { worstViol = mag; worst = i }
    })
    if (worst < 0) break
    on[worst] = !on[worst]
    v = solveLinear(inp, on)
  }
  const sourceAmps = inp.sources.map((s) => (s.volts - v[s.node]) / Math.max(s.ohms, R_MIN))
  const ledAmps = leds.map((l, i) => (on[i] ? Math.max(0, (v[l.a] - v[l.k] - l.vf) / l.rs) : 0))

  // yüzen düğüm tespiti: toprağa iletken yol
  const parent = Array.from({ length: inp.nodes }, (_, i) => i)
  const find = (i: number): number => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i] } return i }
  const uni = (a: number, b: number): void => { const ra = find(a), rb = find(b); if (ra !== rb) parent[rb] = ra }
  for (const r of inp.resistors) uni(r.a, r.b)
  for (const s of inp.sources) uni(s.node, 0)
  leds.forEach((l, i) => { if (on[i]) uni(l.a, l.k) })
  const g0 = find(0)
  const floating = Array.from({ length: inp.nodes }, (_, i) => find(i) !== g0)
  return { volts: v, sourceAmps, ledAmps, ledOn: on, floating, iterations: it }
}
